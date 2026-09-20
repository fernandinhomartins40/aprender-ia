import { TODAS_EXTRAS, type LicaoExtra } from "./extras-todas";
import { MODULOS_EMPREENDEDORES } from "./modulos";

/**
 * Os roteiros da aula ao vivo, montados a partir do conteúdo do curso.
 *
 * No curso de Educadores o caminho é o inverso: o deck HTML é a fonte e o
 * roteiro é extraído dele. Funciona, e tem um custo — o deck e a trilha
 * podem divergir, e foi assim que o deck de Empreendedores acabou com 13%
 * de slides repetidos que a trilha não tinha.
 *
 * Aqui a fonte é uma só: as mesmas lições que o aluno percorre sozinho
 * viram os passos que o formador projeta. Corrigir o conteúdo num lugar
 * corrige nos dois.
 *
 * Um encontro presencial por bloco de módulos — quatro encontros, como o
 * deck previa, mas sem os moldes repetidos.
 */

export type BlocoRoteiro =
  | { tipo: "texto"; html: string }
  | { tipo: "prompt"; texto: string; variaveis: string[] }
  | { tipo: "ferramentas"; chaves: string[] }
  | { tipo: "checklist"; itens: string[] };

export type PassoRoteiro = {
  titulo: string;
  html: string;
  secaoApostila: string | null;
  blocos: BlocoRoteiro[];
};

export type RoteiroAula = {
  encontro: number;
  titulo: string;
  passos: PassoRoteiro[];
};

/** Quais módulos cabem em cada encontro presencial. */
const ENCONTROS: { n: number; titulo: string; modulos: number[] }[] = [
  { n: 1, titulo: "Encontro 1 — Entender e pedir", modulos: [0, 1] },
  { n: 2, titulo: "Encontro 2 — Aplicar no dia a dia", modulos: [2, 3, 4] },
  { n: 3, titulo: "Encontro 3 — Produzir", modulos: [5, 6] },
  { n: 4, titulo: "Encontro 4 — Organizar e analisar", modulos: [7, 8, 9] },
  { n: 5, titulo: "Encontro 5 — Automatizar e delegar", modulos: [10, 11, 12, 13] },
];

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Desenha o passo projetado.
 *
 * O HTML usa as classes do `slides_base.css` que o deck já carrega, para
 * o passo ter a mesma aparência de sempre em sala — a diferença é que
 * agora ele sai do banco, e não de um arquivo mantido à parte.
 */
function desenhar(l: { titulo: string; tipo: string; conteudo: Record<string, unknown> }) {
  return `<div class="slide" data-title="${escapar(l.titulo)}">${miolo(l)}</div>`;
}

/**
 * O conteúdo de dentro do slide.
 *
 * O invólucro `.slide` fica fora, em `desenhar`, porque é dele que o
 * `slides_base.css` tira o tamanho, o alinhamento e a visibilidade — sem
 * ele o palco renderiza e não se vê nada.
 */
function miolo(l: { titulo: string; tipo: string; conteudo: Record<string, unknown> }) {
  const c = l.conteudo as Record<string, any>;
  const t = escapar(l.titulo);

  switch (l.tipo) {
    case "AQUECIMENTO":
      return `<div class="sl-aquec"><div class="et">PARA COMEÇAR</div><h2>${t}</h2><div class="perg">${escapar(
        c.pergunta ?? "",
      )}</div><div class="res">${escapar(c.fechamento ?? "")}</div></div>`;

    case "TEORIA": {
      // Um slide de 1280×720 comporta uns cinco blocos. As lições de
      // leitura têm mais, e é assim que deve ser para quem estuda
      // sozinho — mas projetado, o que passa disso sai da tela. O
      // formador segue pela lição completa; o slide mostra o essencial.
      const blocos = (c.blocos ?? [])
        .slice(0, 5)
        .map((b: any) => {
          if (b.tipo === "lista") {
            return `<div class="bx"><div class="t">${escapar(b.titulo ?? "")}</div><ul>${(b.itens ?? [])
              .map((i: string) => `<li>${escapar(i)}</li>`)
              .join("")}</ul></div>`;
          }
          if (b.tipo === "destaque") {
            return `<div class="dica"><div class="t">${escapar(b.titulo ?? "")}</div><p>${escapar(
              b.texto ?? "",
            )}</p></div>`;
          }
          return `<p class="tx">${escapar(b.texto ?? "")}</p>`;
        })
        .join("");
      return `<div class="topo"><div class="badge">CONCEITO</div><h1 class="st">${t}</h1></div><div class="corpo alto">${blocos}</div>`;
    }

    case "DUELO":
      return `<div class="sl-duelo"><h2>${t}</h2><div class="lado"><div class="box ruim"><div class="rot">❌ ${escapar(
        c.ruim?.titulo ?? "Pedido vago",
      )}</div><div class="pr">${escapar(c.ruim?.prompt ?? "")}</div><div class="res">${escapar(
        c.ruim?.resultado ?? "",
      )}</div></div><div class="box bom"><div class="rot">✅ ${escapar(
        c.bom?.titulo ?? "Pedido completo",
      )}</div><div class="pr">${escapar(c.bom?.prompt ?? "")}</div><div class="res">${escapar(
        c.bom?.resultado ?? "",
      )}</div></div></div><div class="perg">${escapar(c.pergunta ?? "")}</div></div>`;

    case "CASO":
      return `<div class="sl-caso"><div class="et">ESTUDO DE CASO</div><h2>${escapar(
        c.titulo ?? l.titulo,
      )}</h2><div class="cena-sl">${escapar(c.cena ?? "")}</div><div class="perg">${escapar(
        c.pergunta ?? "",
      )}</div></div>`;

    // O cabeçalho vai no `.topo` e o resto no `.corpo`: fora dessa
    // divisão o CSS não reserva espaço para o título, e o subtítulo
    // acaba por cima dele.
    case "CACA_ERRO":
      return `<div class="topo amarelo"><div class="badge amarelo">CAÇA AO ERRO</div><h1 class="st">${t}</h1></div><div class="corpo alto"><p class="lead">${escapar(
        c.contexto ?? "",
      )}</p><div class="prompt p12">${escapar(c.texto ?? "")}</div><p class="desafio-txt">Encontre os ${
        (c.erros ?? []).length
      } problemas antes de virar o slide.</p></div>`;

    case "LABORATORIO":
      return `<div class="topo verde"><div class="badge verde">LABORATÓRIO</div><h1 class="st">${escapar(
        c.titulo ?? l.titulo,
      )}</h1></div><div class="corpo alto"><p class="lead">${escapar(
        c.contexto ?? "",
      )}</p><ol>${(c.passos ?? [])
        .map((p: string) => `<li>${escapar(p)}</li>`)
        .join("")}</ol></div>`;

    case "ANTES_DEPOIS":
      return `<div class="topo"><div class="badge">ANTES E DEPOIS</div><h1 class="st">${escapar(
        c.tarefa ?? l.titulo,
      )}</h1></div><div class="corpo alto"><div class="grid2"><div class="card"><div class="t">${escapar(
        c.antes?.titulo ?? "Hoje",
      )}</div><div class="rot">${escapar(c.antes?.tempo ?? "")}</div><ul>${(c.antes?.passos ?? [])
        .map((p: string) => `<li>${escapar(p)}</li>`)
        .join("")}</ul></div><div class="card"><div class="t">${escapar(
        c.depois?.titulo ?? "Com IA",
      )}</div><div class="rot">${escapar(c.depois?.tempo ?? "")}</div><ul>${(c.depois?.passos ?? [])
        .map((p: string) => `<li>${escapar(p)}</li>`)
        .join("")}</ul></div></div><div class="selo verde">${escapar(
        c.economia ?? "",
      )}</div></div>`;

    case "FLUXO":
      return `<div class="topo"><div class="badge">O PROCESSO</div><h1 class="st">${escapar(
        c.titulo ?? l.titulo,
      )}</h1></div><div class="corpo alto"><div class="dica"><div class="t">Quando acontece</div><p>${escapar(
        c.gatilho ?? "",
      )}</p></div>${(c.etapas ?? [])
        .map(
          (e: any, i: number) =>
            `<div class="card ${e.revisaoHumana ? "abrivel" : ""}"><span class="num">${
              i + 1
            }</span> <b>${escapar(e.titulo)}</b>${
              e.detalhe ? ` — ${escapar(e.detalhe)}` : ""
            }${e.revisaoHumana ? ' <span class="etiqueta">uma pessoa confere</span>' : ""}</div>`,
        )
        .join("")}<div class="atencao"><div class="t">Onde a automação para</div><p>${escapar(
        c.ondeParar ?? "",
      )}</p></div></div>`;

    case "QUIZ":
      return `<div class="topo verde"><div class="badge verde">QUIZ</div><h1 class="st">${t}</h1></div><div class="corpo alto">${(
        c.perguntas ?? []
      )
        .map((p: any, i: number) => `<div class="card"><b>${i + 1}.</b> ${escapar(p.pergunta)}</div>`)
        .join("")}</div>`;

    case "DESAFIO":
      return `<div class="sl-crono"><div class="num" data-seconds="${
        c.segundos ?? 300
      }">${String(Math.floor((c.segundos ?? 300) / 60)).padStart(2, "0")}:00</div><h2>${escapar(
        c.titulo ?? l.titulo,
      )}</h2><ol>${(c.instrucoes ?? [])
        .map((x: string) => `<li>${escapar(x)}</li>`)
        .join("")}</ol><div class="crono-btns"><button class="start">▶ Iniciar</button><button class="reset sec">↺ Zerar</button></div></div>`;

    case "NO_CELULAR":
      return `<div class="topo laranja"><div class="badge laranja">NO CELULAR</div><h1 class="st">${escapar(
        c.titulo ?? l.titulo,
      )}</h1></div><div class="corpo alto"><div class="oficina"><div class="t">${escapar(
        c.tempo ?? "",
      )}</div><ol>${(c.passos ?? [])
        .map((p: string) => `<li>${escapar(p)}</li>`)
        .join("")}</ol></div><div class="dica"><p>${escapar(c.porque ?? "")}</p></div></div>`;

    case "EMERGENCIA":
      return `<div class="topo vermelho"><div class="badge vermelho">GUIA DE BOLSO</div><h1 class="st">${escapar(
        c.titulo ?? l.titulo,
      )}</h1></div><div class="corpo alto">${(c.itens ?? [])
        .map(
          (i: any) =>
            `<div class="card"><div class="t">${escapar(i.situacao)}</div><p>${escapar(
              i.acao,
            )}</p></div>`,
        )
        .join("")}</div>`;

    case "CHECKPOINT":
      return `<div class="sl-saida"><h2>${escapar(c.titulo ?? l.titulo)}</h2>${(c.itens ?? [])
        .map((i: string) => `<div class="it marcavel">☐ ${escapar(i)}</div>`)
        .join("")}<div class="perg">${escapar(c.pergunta ?? "")}</div></div>`;

    case "PROJETO":
      return `<div class="divisor"><div class="num">PROJETO FINAL</div><h2>${escapar(
        c.titulo ?? l.titulo,
      )}</h2><p>${escapar(c.introducao ?? "")}</p></div>`;

    default:
      return `<div class="topo"><h1 class="st">${t}</h1></div>`;
  }
}

/** Os blocos interativos que a tela do aluno desenha no lugar do slide. */
function blocosDe(l: {
  tipo: string;
  conteudo: Record<string, unknown>;
}): BlocoRoteiro[] {
  const c = l.conteudo as Record<string, any>;
  const blocos: BlocoRoteiro[] = [];

  const prompt = c.promptSugerido ?? c.prompt;
  if (prompt?.corpo) {
    blocos.push({
      tipo: "prompt",
      texto: prompt.corpo,
      variaveis: (prompt.variaveis ?? []).map((v: any) => v.chave),
    });
    blocos.push({ tipo: "ferramentas", chaves: ["chatgpt-negocios", "gemini-negocios"] });
  }
  if (l.tipo === "PROMPT" && c.corpo) {
    blocos.push({
      tipo: "prompt",
      texto: c.corpo,
      variaveis: (c.campos ?? []).map((v: any) => v.chave),
    });
    blocos.push({ tipo: "ferramentas", chaves: ["chatgpt-negocios", "gemini-negocios"] });
  }
  if (Array.isArray(c.itens) && l.tipo === "CHECKPOINT") {
    blocos.push({ tipo: "checklist", itens: c.itens });
  }
  if (Array.isArray(c.criterios)) {
    blocos.push({ tipo: "checklist", itens: c.criterios });
  }
  return blocos;
}

/** Monta os quatro roteiros a partir das lições do curso. */
export function roteirosDeEmpreendedores(): RoteiroAula[] {
  return ENCONTROS.map((enc) => {
    const passos: PassoRoteiro[] = [];

    for (const ordem of enc.modulos) {
      const m = MODULOS_EMPREENDEDORES.find((x) => x.ordem === ordem);
      if (!m) continue;

      // Abre cada módulo com um divisor, como o deck fazia.
      passos.push({
        titulo: m.titulo,
        html: `<div class="slide" data-title="${escapar(
          m.titulo,
        )}"><div class="divisor"><div class="num">MÓDULO ${ordem + 1}</div><h2>${escapar(
          m.titulo,
        )}</h2><p>${escapar(m.subtitulo)}</p></div></div>`,
        secaoApostila: null,
        blocos: [],
      });

      // A mesma intercalação do seed: as extras entram antes do
      // fechamento, para o CHECKPOINT continuar sendo o último.
      const extras: LicaoExtra[] = TODAS_EXTRAS.filter((e) => e.modulo === m.titulo);
      const corte = m.licoes.findIndex((l) => l.tipo === "CHECKPOINT");
      const licoes =
        corte === -1
          ? [...m.licoes, ...extras]
          : [...m.licoes.slice(0, corte), ...extras, ...m.licoes.slice(corte)];

      for (const l of licoes) {
        passos.push({
          titulo: l.titulo,
          html: desenhar(l),
          secaoApostila: l.cap?.replace(/^Cap\.\s*/, "") ?? null,
          blocos: blocosDe(l),
        });
      }
    }

    return { encontro: enc.n, titulo: enc.titulo, passos };
  });
}
