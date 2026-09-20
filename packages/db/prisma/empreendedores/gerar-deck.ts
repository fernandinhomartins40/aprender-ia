import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Gera o deck de apresentação A PARTIR DO BANCO, com a mesma linguagem
 * visual e os mesmos recursos do deck de Educadores.
 *
 * O deck antigo tinha 142 slides e nascia de um script à parte da
 * trilha. Duas consequências, ambas medidas: 62% do arquivo eram dois
 * moldes repetidos quatro vezes cada, e os slides não usavam nenhum dos
 * componentes do `slides_base.css` — zero `card` contra 144 no de
 * Educadores, zero prompt preenchível contra 16, zero botão de IA contra
 * 14. Daí o texto solto num vazio de 1280×720.
 *
 * Aqui os slides saem das lições e usam os mesmos blocos:
 *
 * - `.card` dentro de `.grid2`/`.grid3` para comparações e listas
 * - `.traduzindo` para o termo técnico depois da explicação simples
 * - `.dica` e `.atencao` para o que ajuda e o que arrisca
 * - `.prompt` + `.prompt-acoes[data-prompt-txt]`, que o runtime
 *   transforma em campos preenchíveis com botões de Gemini, ChatGPT,
 *   DeepSeek e NotebookLM — o recurso mais útil em sala
 * - `.sl-crono` com a duração lida do próprio slide
 *
 * O runtime é o do curso de Educadores, copiado em `runtime-deck.js`:
 * são as mesmas interações, e reescrevê-las daria duas versões para
 * manter.
 *
 * Uso:
 *   pnpm --filter @aprender/db deck:empreendedores
 */

const prisma = new PrismaClient();

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type Bloco = { tipo: string; titulo?: string; texto?: string; itens?: string[] };

/** Um card com título e corpo — o tijolo visual do deck. */
function card(titulo: string | undefined, corpo: string, destaque = false) {
  const estilo = destaque
    ? ' style="background:var(--indigo-soft);border-color:var(--indigo-line)"'
    : "";
  const cor = destaque ? ' style="color:var(--indigo-dark)"' : "";
  return (
    `<div class="card"${estilo}>` +
    (titulo ? `<h4${cor}>${esc(titulo)}</h4>` : "") +
    corpo +
    `</div>`
  );
}

const p = (t: string) => `<p>${esc(t)}</p>`;
const ul = (itens: string[]) =>
  `<ul>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

/** Cabeçalho padrão: badge colorido + título grande. */
function topo(badge: string, titulo: string, cor = "") {
  return (
    `<div class="topo${cor ? " " + cor : ""}"></div>` +
    `<div class="badge${cor ? " " + cor : ""}">${esc(badge)}</div>` +
    `<h1 class="st">${esc(titulo)}</h1>`
  );
}

/**
 * A lição sendo desenhada. O prompt precisa saber quais ferramentas ela
 * opera para oferecer só essas, e ele é montado no fundo da pilha, longe
 * de quem tem a lição em mãos.
 */
let LICAO_ATUAL: any = null;

/** O prompt preenchível: o runtime cria campos e botões a partir dele. */
function promptEditavel(texto: string) {
  // As mesmas ferramentas da barra "Abrir agora", pelo id de cor. Sem
  // isto todo prompt oferecia as quatro de Educadores — inclusive o
  // NotebookLM, que não gera imagem nenhuma.
  const ias = (LICAO_ATUAL?.conteudo?.abrirAgora ?? [])
    .map((k: string) => k.replace(/-(negocios|workspace|imagens)$/, ""))
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .join(",");
  return (
    `<div class="prompt p12">${esc(texto)}</div>` +
    `<div class="prompt-acoes" data-prompt-txt="${esc(texto)}"${
      ias ? ` data-ias="${esc(ias)}"` : ""
    }></div>`
  );
}

/* ============================================================
   Um desenho por tipo de lição
   ============================================================ */

function teoria(l: any) {
  const blocos: Bloco[] = l.conteudo.blocos ?? [];
  const partes: string[] = [];

  // Os textos de abertura viram um card largo; as listas e destaques
  // viram cards numa grade. Sem isso tudo desce como parágrafo solto,
  // que é exatamente o que fazia o slide parecer vazio.
  const abertura = blocos.filter((b) => b.tipo === "texto").slice(0, 2);
  if (abertura.length) {
    partes.push(card(undefined, abertura.map((b) => p(b.texto!)).join("")));
  }

  const listas = blocos.filter((b) => b.tipo === "lista");
  if (listas.length >= 2) {
    partes.push(
      `<div class="grid2">` +
        listas
          .slice(0, 2)
          .map((b, i) => card(b.titulo, ul(b.itens ?? []), i === 1))
          .join("") +
        `</div>`,
    );
  } else if (listas.length === 1) {
    partes.push(card(listas[0]!.titulo, ul(listas[0]!.itens ?? [])));
  }

  const destaques = blocos.filter((b) => b.tipo === "destaque");
  for (const d of destaques.slice(0, 2)) {
    // O primeiro destaque costuma ser o termo técnico — o bloco
    // "traduzindo" existe no CSS exatamente para isso.
    const ehTermo = /nome técnico|chama-se|o nome disso|sobre o nome/i.test(
      d.titulo ?? "",
    );
    partes.push(
      ehTermo
        ? `<div class="traduzindo"><div class="t">📖 Traduzindo: ${esc(
            d.titulo!,
          )}</div><p>${esc(d.texto!)}</p></div>`
        : `<div class="dica"><div class="t">${esc(d.titulo!)}</div><p>${esc(
            d.texto!,
          )}</p></div>`,
    );
  }

  return (
    topo(l.cap ?? "CONCEITO", l.titulo) +
    `<div class="corpo alto">${partes.join("")}</div>`
  );
}

function duelo(l: any) {
  const c = l.conteudo;
  return (
    topo("DUELO DE PEDIDOS", l.titulo) +
    `<div class="corpo alto">` +
    (c.situacao ? `<p class="lead">${esc(c.situacao)}</p>` : "") +
    `<div class="sl-duelo"><div class="lado">` +
    `<div class="box ruim"><div class="rot">❌ ${esc(
      c.ruim?.titulo ?? "Pedido vago",
    )}</div><div class="pr">${esc(c.ruim?.prompt ?? "")}</div><div class="res">${esc(
      c.ruim?.resultado ?? "",
    )}</div></div>` +
    `<div class="box bom"><div class="rot">✅ ${esc(
      c.bom?.titulo ?? "Pedido completo",
    )}</div><div class="pr">${esc(c.bom?.prompt ?? "")}</div><div class="res">${esc(
      c.bom?.resultado ?? "",
    )}</div></div>` +
    `</div></div>` +
    (c.bom?.prompt ? promptEditavel(c.bom.prompt) : "") +
    `</div>`
  );
}

function caso(l: any) {
  const c = l.conteudo;
  return (
    `<div class="sl-caso"><div class="et">ESTUDO DE CASO</div>` +
    `<h2>${esc(c.titulo ?? l.titulo)}</h2>` +
    `<div class="cena-sl">${esc(c.cena ?? "")}</div>` +
    `<div class="perg">${esc(c.pergunta ?? "")}</div>` +
    ((c.pistas ?? []).length
      ? `<div class="dica"><div class="t">Por onde começar</div>${ul(c.pistas)}</div>`
      : "") +
    `</div>`
  );
}

function cacaErro(l: any) {
  const c = l.conteudo;
  const erros: any[] = c.erros ?? [];
  return (
    topo("CAÇA AO ERRO", l.titulo, "amarelo") +
    `<div class="corpo alto">` +
    (c.contexto ? `<p class="lead">${esc(c.contexto)}</p>` : "") +
    `<div class="prompt p12">${esc(c.texto ?? "")}</div>` +
    `<p class="desafio-txt">Encontre os ${erros.length} problemas antes de virar o slide.</p>` +
    `</div>`
  );
}

/** A resposta da caça ao erro, num slide separado. */
function cacaErroResposta(l: any) {
  const c = l.conteudo;
  const erros: any[] = c.erros ?? [];
  return (
    topo("CAÇA AO ERRO · RESPOSTA", l.titulo, "verde") +
    `<div class="corpo alto"><div class="grid${erros.length >= 3 ? "3" : "2"}">` +
    erros
      .map((e) =>
        card(
          `❌ ${e.trecho}`,
          p(e.porque),
        ),
      )
      .join("") +
    `</div>` +
    (c.licao ? `<div class="atencao"><div class="t">A lição</div><p>${esc(c.licao)}</p></div>` : "") +
    `</div>`
  );
}

function antesDepois(l: any) {
  const c = l.conteudo;
  return (
    topo("ANTES E DEPOIS", c.tarefa ?? l.titulo) +
    `<div class="corpo alto"><div class="grid2">` +
    card(
      `${c.antes?.titulo ?? "Hoje"} · ${c.antes?.tempo ?? ""}`,
      ul(c.antes?.passos ?? []),
    ) +
    card(
      `${c.depois?.titulo ?? "Com IA"} · ${c.depois?.tempo ?? ""}`,
      ul(c.depois?.passos ?? []),
      true,
    ) +
    `</div>` +
    (c.economia ? `<div class="selo verde">${esc(c.economia)}</div>` : "") +
    (c.prompt?.corpo ? promptEditavel(c.prompt.corpo) : "") +
    (c.atencao
      ? `<div class="atencao"><div class="t">Atenção</div><p>${esc(c.atencao)}</p></div>`
      : "") +
    `</div>`
  );
}

function fluxo(l: any) {
  const c = l.conteudo;
  const etapas: any[] = c.etapas ?? [];
  return (
    topo("O PROCESSO", c.titulo ?? l.titulo) +
    `<div class="corpo alto">` +
    (c.gatilho
      ? `<div class="dica"><div class="t">Quando acontece</div><p>${esc(c.gatilho)}</p></div>`
      : "") +
    `<div class="grid${etapas.length > 4 ? "3" : "2"}">` +
    etapas
      .map((e, i) =>
        card(
          `${i + 1}. ${e.titulo}`,
          p(e.detalhe ?? "") +
            (e.revisaoHumana
              ? `<div class="etiqueta">uma pessoa confere</div>`
              : ""),
          Boolean(e.revisaoHumana),
        ),
      )
      .join("") +
    `</div>` +
    (c.ondeParar
      ? `<div class="atencao"><div class="t">Onde a automação para</div><p>${esc(
          c.ondeParar,
        )}</p></div>`
      : "") +
    `</div>`
  );
}

function laboratorio(l: any) {
  const c = l.conteudo;
  return (
    topo("LABORATÓRIO", c.titulo ?? l.titulo, "verde") +
    `<div class="corpo alto">` +
    (c.contexto ? `<p class="lead">${esc(c.contexto)}</p>` : "") +
    `<div class="oficina"><div class="t">Passo a passo</div>` +
    `<ol>${(c.passos ?? []).map((x: string) => `<li>${esc(x)}</li>`).join("")}</ol></div>` +
    (c.promptSugerido?.corpo ? promptEditavel(c.promptSugerido.corpo) : "") +
    ((c.criterios ?? []).length
      ? `<div class="dica"><div class="t">Antes de dar por pronto</div>` +
        (c.criterios as string[])
          .map((x) => `<div class="chk">${esc(x)}</div>`)
          .join("") +
        `</div>`
      : "") +
    `</div>`
  );
}

function quiz(l: any) {
  const perguntas: any[] = l.conteudo.perguntas ?? [];
  return (
    topo("QUIZ", l.titulo, "verde") +
    `<div class="corpo alto"><div class="grid2">` +
    perguntas
      .map((q, i) =>
        card(
          `${i + 1}. ${q.pergunta}`,
          ul((q.opcoes ?? []).map((o: any) => o.texto)),
        ),
      )
      .join("") +
    `</div></div>`
  );
}

function desafio(l: any) {
  const c = l.conteudo;
  const seg = c.segundos ?? 300;
  return (
    `<div class="sl-crono">` +
    `<div class="num" data-seconds="${seg}">${String(Math.floor(seg / 60)).padStart(
      2,
      "0",
    )}:00</div>` +
    `<h2>${esc(c.titulo ?? l.titulo)}</h2>` +
    `<ol>${(c.instrucoes ?? []).map((x: string) => `<li>${esc(x)}</li>`).join("")}</ol>` +
    (c.fechamento ? `<p class="crono-dica">${esc(c.fechamento)}</p>` : "") +
    `</div>`
  );
}

function aquecimento(l: any) {
  const c = l.conteudo;
  return (
    `<div class="sl-aquec"><div class="et">PARA COMEÇAR</div>` +
    `<h2>${esc(c.pergunta ?? l.titulo)}</h2>` +
    `<p>${esc(c.fechamento ?? "")}</p></div>`
  );
}

function noCelular(l: any) {
  const c = l.conteudo;
  return (
    topo("NO CELULAR", c.titulo ?? l.titulo, "laranja") +
    `<div class="corpo alto"><div class="oficina"><div class="t">${esc(
      c.tempo ?? "",
    )}</div><ol>${(c.passos ?? [])
      .map((x: string) => `<li>${esc(x)}</li>`)
      .join("")}</ol></div>` +
    (c.porque ? `<div class="dica"><div class="t">Por que isso importa</div><p>${esc(c.porque)}</p></div>` : "") +
    `</div>`
  );
}

function emergencia(l: any) {
  const itens: any[] = l.conteudo.itens ?? [];
  return (
    topo("GUIA DE BOLSO", l.conteudo.titulo ?? l.titulo, "vermelho") +
    `<div class="corpo alto"><div class="grid3">` +
    itens.map((i) => card(i.situacao, p(i.acao))).join("") +
    `</div></div>`
  );
}

function checkpoint(l: any) {
  const c = l.conteudo;
  return (
    `<div class="sl-saida"><h2>${esc(c.titulo ?? l.titulo)}</h2>` +
    (c.itens ?? [])
      .map((i: string) => `<div class="it marcavel">☐ ${esc(i)}</div>`)
      .join("") +
    (c.pergunta ? `<div class="perg">${esc(c.pergunta)}</div>` : "") +
    `</div>`
  );
}

function promptLicao(l: any) {
  const c = l.conteudo;
  return (
    topo("PRÁTICA COM IA", l.titulo) +
    `<div class="corpo alto">` +
    (c.introducao ? `<p class="lead">${esc(c.introducao)}</p>` : "") +
    (c.corpo ? promptEditavel(c.corpo) : "") +
    (c.dica ? `<div class="dica"><div class="t">Dica</div><p>${esc(c.dica)}</p></div>` : "") +
    `</div>`
  );
}

function projeto(l: any) {
  const c = l.conteudo;
  return (
    `<div class="divisor"><div class="num">PROJETO FINAL</div>` +
    `<h2>${esc(c.titulo ?? l.titulo)}</h2>` +
    `<p>${esc(c.introducao ?? "")}</p></div>`
  );
}

/**
 * As ferramentas do curso, por chave. Preenchido em `main()` antes de
 * desenhar qualquer slide.
 *
 * O deck grava nome e endereço no HTML, mas lê os dois do banco: assim
 * uma ferramenta que muda de endereço é corrigida num lugar só, e o
 * deck seguinte já sai certo.
 */
const CATALOGO = new Map<string, { nome: string; url: string }>();

/**
 * A faixa "Abrir agora" no rodapé — os botões de IA que o deck de
 * Educadores tem e este não tinha (eram 14 lá contra 0 aqui).
 *
 * A cor do botão vem de uma classe por ferramenta. A chave do banco traz
 * o sufixo do curso (`chatgpt-negocios`), que não existe no CSS, então o
 * sufixo sai antes: `chatgpt-negocios` vira `chatgpt`.
 */
function barraDeFerramentas(l: any): string {
  const chaves = (l.conteudo as any)?.abrirAgora;
  if (!Array.isArray(chaves) || !chaves.length) return "";

  const botoes = chaves
    .map((k: string) => {
      const f = CATALOGO.get(k);
      if (!f) {
        // Chave errada é erro de conteúdo, não de layout: avisa e segue,
        // em vez de gerar um botão que não leva a lugar nenhum.
        console.warn(`  aviso: "${l.titulo}" cita ferramenta desconhecida "${k}"`);
        return "";
      }
      const cor = k.replace(/-(negocios|workspace|imagens)$/, "");
      return (
        `<a class="ia-btn ${esc(cor)}" href="${esc(f.url)}" target="_blank"` +
        ` rel="noopener"><span class="pt"></span>${esc(f.nome)}</a>`
      );
    })
    .filter(Boolean)
    .join("");

  if (!botoes) return "";
  return `<div class="ia-barra"><span class="rot">Abrir agora</span><div class="ia-btns">${botoes}</div></div>`;
}

/** Desenha a lição; algumas rendem dois slides (pergunta e resposta). */
function slidesDaLicao(l: any): string[] {
  LICAO_ATUAL = l;
  const barra = barraDeFerramentas(l);

  // A barra é absoluta, presa ao rodapé. Num slide que já tem prompt ela
  // caía por cima do texto dele — e repetia botões que o `prompt-acoes`
  // já oferece logo abaixo. Onde há prompt, a barra não entra.
  const env = (html: string) => {
    const temPrompt = html.includes("prompt-acoes");
    const rodape = temPrompt ? "" : barra;
    // `com-ia` encurta o corpo do slide na altura da barra; sem ela o
    // conteúdo passa por baixo dos botões.
    return `<div class="slide${rodape ? " com-ia" : ""}" data-title="${esc(
      l.titulo,
    )}">${html}${rodape}</div>`;
  };

  switch (l.tipo) {
    case "AQUECIMENTO":
      return [env(aquecimento(l))];
    case "TEORIA":
      return [env(teoria(l))];
    case "DUELO":
      return [env(duelo(l))];
    case "CASO":
      return [env(caso(l))];
    // A caça ao erro rende dois: a turma procura no primeiro, o
    // formador revela no segundo. Num slide só, a resposta fica à vista
    // e a atividade deixa de existir.
    case "CACA_ERRO":
      return [env(cacaErro(l)), env(cacaErroResposta(l))];
    case "ANTES_DEPOIS":
      return [env(antesDepois(l))];
    case "FLUXO":
      return [env(fluxo(l))];
    case "LABORATORIO":
      return [env(laboratorio(l))];
    case "QUIZ":
      return [env(quiz(l))];
    case "DESAFIO":
      return [env(desafio(l))];
    case "NO_CELULAR":
      return [env(noCelular(l))];
    case "EMERGENCIA":
      return [env(emergencia(l))];
    case "CHECKPOINT":
      return [env(checkpoint(l))];
    case "PROMPT":
      return [env(promptLicao(l))];
    case "PROJETO":
      return [env(projeto(l))];
    default:
      return [env(topo("", l.titulo))];
  }
}

async function main() {
  const curso = await prisma.course.findUnique({
    where: { slug: "ia-para-empreendedores" },
    select: { id: true, titulo: true, subtitulo: true, cargaHoraria: true },
  });
  if (!curso) {
    console.error("curso não encontrado — rode antes o seed:empreendedores");
    process.exit(1);
  }

  // Antes dos slides: as lições citam a ferramenta pela chave, e é aqui
  // que a chave vira nome e endereço.
  for (const f of await prisma.aiTool.findMany({
    where: { courseId: curso.id, ativo: true },
    select: { chave: true, nome: true, url: true },
  })) {
    CATALOGO.set(f.chave, { nome: f.nome, url: f.url });
  }

  const modulos = await prisma.module.findMany({
    where: { courseId: curso.id },
    orderBy: { ordem: "asc" },
    include: { licoes: { orderBy: { ordem: "asc" } } },
  });

  const slides: string[] = [];
  const prompts: { titulo: string; texto: string }[] = [];

  slides.push(
    `<div class="slide active" data-title="Capa"><div class="capa capa-com-foto">` +
      `<div style="background:var(--indigo);color:#fff;font-family:var(--titulo);font-size:15px;font-weight:700;letter-spacing:.8px;padding:9px 24px;border-radius:999px;margin-bottom:26px">FORMAÇÃO COMPLETA · ${curso.cargaHoraria} HORAS</div>` +
      `<div style="font-size:60px;line-height:1;margin-bottom:10px">💼</div>` +
      `<h1 style="font-family:var(--titulo);font-size:56px;font-weight:800;color:var(--tinta);line-height:1.1">Inteligência Artificial<br><span style="color:var(--laranja)">para Empreendedores</span></h1>` +
      `<p style="font-size:21px;color:var(--tinta-clara);margin-top:20px;max-width:760px">${esc(
        curso.subtitulo ?? "",
      )}</p></div></div>`,
  );

  for (const m of modulos) {
    slides.push(
      `<div class="slide" data-title="${esc(m.titulo)}"><div class="divisor">` +
        `<div class="num">MÓDULO ${m.ordem + 1}</div><h2>${esc(m.titulo)}</h2>` +
        `<p>${esc(m.subtitulo ?? "")}</p></div></div>`,
    );

    for (const l of m.licoes) {
      slides.push(...slidesDaLicao(l));

      // Todo prompt da lição entra no banco navegável pela tecla P.
      const c = l.conteudo as any;
      const texto = c?.promptSugerido?.corpo ?? c?.prompt?.corpo ?? c?.corpo;
      if (typeof texto === "string" && texto.includes("[")) {
        prompts.push({ titulo: l.titulo, texto });
      }
    }
  }

  let runtime = readFileSync(
    resolve(import.meta.dirname, "runtime-deck.js"),
    "utf8",
  );

  // O runtime trazia a lista de IAs escrita à mão, herdada de Educadores:
  // oferecia DeepSeek e NotebookLM em todo prompt, e nunca o Canva ou o
  // Claude, que são deste curso. Agora ela sai do banco.
  const listaIas = [...CATALOGO.entries()].map(([chave, f]) => ({
    id: chave.replace(/-(negocios|workspace|imagens)$/, ""),
    nome: f.nome,
    url: f.url,
    // `q` marca quem aceita o prompt pela URL, abrindo já com o texto
    // escrito. Nas outras o botão só abre a ferramenta, e o prompt vai
    // pelo "Copiar" ao lado.
    ...(chave.startsWith("chatgpt") ? { q: "q" } : {}),
    // `geral` marca quem escreve texto, e por isso serve para qualquer
    // prompt do curso. É o que um prompt recebe quando a lição não diz
    // suas ferramentas. As de imagem, vídeo e automação ficam de fora:
    // só aparecem onde a lição pedir.
    ...(/^(chatgpt-negocios|gemini-negocios|claude-negocios)$/.test(chave)
      ? { geral: true }
      : {}),
  }));
  // Uma chave por id: `chatgpt-negocios` e `chatgpt-imagens` viram o
  // mesmo `chatgpt`, e dois botões iguais não ajudam ninguém. Entre as
  // que colidem vence o nome mais curto — o botão diz para onde leva,
  // e "ChatGPT" leva ao mesmo lugar que "ChatGPT Imagens" com metade da
  // largura.
  // Vence o nome mais curto, mas `q` e `geral` são somados: senão
  // `chatgpt-imagens`, de nome mais curto que `chatgpt-negocios`,
  // levaria o botão do ChatGPT e deixaria o `geral` para trás — e
  // nenhum prompt sem ferramenta declarada teria onde abrir.
  const unicas = [
    ...listaIas
      .sort((a, b) => a.nome.length - b.nome.length)
      .reduce((m, i) => {
        const antes = m.get(i.id);
        if (!antes) return m.set(i.id, i);
        if ((i as any).q) (antes as any).q = (i as any).q;
        if ((i as any).geral) (antes as any).geral = true;
        return m;
      }, new Map())
      .values(),
  ] as typeof listaIas;
  runtime = runtime.replace(
    /^const LISTA_IAS = .*$/m,
    `const LISTA_IAS = ${JSON.stringify(unicas)};`,
  );

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(curso.titulo)} — Slides</title>
<link rel="stylesheet" href="slides_base.css">
<style>
.capa-com-foto{background-image:linear-gradient(150deg,rgba(238,240,254,.92),rgba(246,244,255,.82),rgba(255,248,240,.84)),url("imagens/capa_empreendedores_ia.png")!important;background-position:center!important;background-size:cover!important}
</style>
</head>
<body>
<div class="progress-bar" id="bar"></div>
<div class="deck-outer"><div class="deck-wrapper" id="deck">${slides.join("")}</div></div>
<div class="controls">
<button class="ctrl" id="first">⇤</button><button class="ctrl" id="prev">‹</button>
<span id="counter"></span>
<button class="ctrl" id="next">›</button><button class="ctrl" id="last">⇥</button>
<span class="sep"></span>
<button class="ctrl" id="grid">▦</button><button class="ctrl" id="full">⛶</button>
</div>
<div id="thumb-overlay"><div id="thumb-close">✕ fechar (Esc)</div><div id="thumb-grid"></div></div>
<div id="prompt-modal"><div class="cx">
<div class="cab"><h3 id="pm-titulo">Prompt</h3><button class="fechar" id="pm-fechar">✕</button></div>
<div class="corpo-m"><pre class="txt" id="pm-texto"></pre><p class="pm-dica" id="pm-dica">Preencha os campos: os botões abaixo levam o prompt já completo.</p></div>
<div class="pe"><div class="lin">
<button class="copiar" id="pm-copiar">📋 Copiar prompt</button>
<span id="pm-ias"></span>
</div></div>
</div></div>
<script>
const PROMPTS = ${JSON.stringify(prompts, null, 0)};
${runtime}
</script>
</body>
</html>`;

  const destino = resolve(
    import.meta.dirname,
    "../../../../../cursos/Curso_IA_Empreendedores_2026/Slides_IA_para_Empreendedores_2026.html",
  );
  writeFileSync(destino, html, "utf8");

  console.log(`${modulos.length} módulos · ${slides.length} slides · ${prompts.length} prompts no banco`);
  console.log(`gravado em ${destino}`);

  await paginar(destino);
}

/**
 * Quebra os slides que não couberem, medindo no navegador.
 *
 * Roda aqui, e não como passo separado, porque um deck sem paginar tem
 * um terço dos slides transbordando — não é um retoque opcional, é
 * parte de gerar o deck.
 *
 * O Puppeteer não é dependência deste pacote: ele mora na pasta do
 * curso de Educadores, que é de onde os PDFs sempre foram gerados. Se
 * não estiver lá, o deck fica pronto do mesmo jeito e o aviso diz o que
 * rodar à mão.
 */
async function paginar(arquivo: string) {
  const script = resolve(import.meta.dirname, "paginar-deck.js");
  const ondeMoraOPuppeteer = resolve(
    import.meta.dirname,
    "../../../../../cursos/IA Professores",
  );

  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, [script, arquivo], {
    cwd: ondeMoraOPuppeteer,
    encoding: "utf8",
  });

  if (r.status === 0) {
    process.stdout.write(r.stdout);
    return;
  }
  console.warn(
    "\naviso: não deu para paginar (o Puppeteer não foi encontrado?).\n" +
      "O deck está gerado, mas com slides que transbordam. Para corrigir:\n" +
      `  cd "${ondeMoraOPuppeteer}" && node "${script}" "${arquivo}"`,
  );
  if (r.stderr) console.warn(r.stderr.split("\n").slice(0, 3).join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
