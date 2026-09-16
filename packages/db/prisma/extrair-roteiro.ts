/**
 * Lê o deck de slides do curso e devolve os roteiros da aula.
 *
 * Guarda duas leituras do mesmo slide, porque servem a coisas diferentes:
 *
 * - `html`: o slide como está no deck, com as classes do `slides_base.css`.
 *   É o que projetor e celular desenham — mesmo design do deck aberto pelo
 *   `Iniciar_Apresentacao.vbs`, inclusive cronômetro, campos do prompt,
 *   botões de IA e checklist, que a aplicação religa ao montar.
 * - `blocos`: a leitura estruturada (prompt, checklist, ferramentas). Não é
 *   mais o que se desenha, mas é o que o painel do professor consegue
 *   perguntar — "quantos marcaram este item?" — e o que guarda o texto do
 *   prompt para o registro da turma.
 */

/** Um bloco do passo. A tela do aluno sabe desenhar cada tipo. */
export type Bloco =
  | { tipo: "texto"; html: string }
  | { tipo: "prompt"; texto: string; variaveis: string[] }
  | { tipo: "ferramentas"; chaves: string[] }
  | { tipo: "checklist"; itens: string[] }
  | { tipo: "imagem"; src: string; legenda?: string };

/** Remove marcação, preservando as quebras que o texto usa. */
function textoLimpo(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\r\n/g, "\n")
    .trim();
}

/** As variáveis `[ANO]`, `[DISCIPLINA]`… que o aluno preenche. */
function variaveisDe(texto: string): string[] {
  const achadas = [...texto.matchAll(/\[([^\]]+)\]/g)].map((m) =>
    (m[1] ?? "").replace(/\s+/g, " ").trim(),
  );
  return [...new Set(achadas)];
}

/** Fatia o deck em slides, respeitando divs aninhadas. */
function fatiarSlides(html: string): string[] {
  const out: string[] = [];
  const re = /<div class="slide[^"]*"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const ini = m.index;
    const tags = /<div\b|<\/div>/g;
    tags.lastIndex = ini;
    let prof = 0;
    let x: RegExpExecArray | null;
    while ((x = tags.exec(html))) {
      if (x[0] === "</div>") {
        prof--;
        if (prof === 0) {
          out.push(html.slice(ini, x.index + 6));
          break;
        }
      } else prof++;
    }
  }
  return out;
}

/** Descobre quais ferramentas o slide oferece, pelos links que ele traz. */
const POR_DOMINIO: Record<string, string> = {
  "chatgpt.com": "chatgpt",
  "gemini.google.com": "gemini",
  "chat.deepseek.com": "deepseek",
  "notebooklm.google.com": "notebooklm",
};

/** Converte um slide nos blocos que a tela do aluno vai desenhar. */
function blocosDoSlide(slide: string): Bloco[] {
  const blocos: Bloco[] = [];

  // 1. Prompts — o que mais importa: é o que o aluno vai rodar na IA.
  //    Os marcados com ❌ ficam de fora: são exemplos do que NÃO fazer, e
  //    oferecer um botão para rodá-los ensinaria o contrário do slide.
  const rePrompt =
    /(?:<div class="etiqueta([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*)?<div class="prompt[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
  let p: RegExpExecArray | null;
  while ((p = rePrompt.exec(slide))) {
    const ruim = /vermelha/.test(p[1] ?? "") || /❌/.test(p[2] ?? "");
    const texto = textoLimpo(p[3] ?? "");
    if (ruim || texto.length < 40) continue;
    blocos.push({ tipo: "prompt", texto, variaveis: variaveisDe(texto) });
  }

  // 2. Checklists — os itens que o aluno marca.
  //    No deck montado eles já vêm convertidos pelo montar_slides.js: viram
  //    `.it.marcavel > .tx` (um por linha) ou `.chk > .tx` (inline). O "☐"
  //    literal só aparece em decks antigos, e continua aceito.
  const itens = [
    ...[...slide.matchAll(/<div class="it marcavel"[^>]*>[\s\S]*?<span class="tx">([\s\S]*?)<\/span>/g)],
    ...[...slide.matchAll(/<span class="chk"[^>]*>[\s\S]*?<span class="tx">([\s\S]*?)<\/span>/g)],
    ...[...slide.matchAll(/☐\s*([^<\n]+)/g)],
  ]
    .map((m) => textoLimpo(m[1] ?? ""))
    .filter((t) => t.length > 2);
  if (itens.length) blocos.push({ tipo: "checklist", itens: [...new Set(itens)] });

  // 3. Ferramentas citadas no slide.
  const chaves = Object.entries(POR_DOMINIO)
    .filter(([dominio]) => slide.includes(dominio))
    .map(([, chave]) => chave);
  if (chaves.length) blocos.push({ tipo: "ferramentas", chaves: [...new Set(chaves)] });

  // 4. Imagem, quando houver.
  //    No deck o caminho é relativo à pasta do curso ("imagens/03_...png").
  //    Na aplicação os mesmos arquivos vivem em public/curso/imagens/, que o
  //    Next serve estaticamente e que vai junto na imagem Docker.
  const img = slide.match(/<img[^>]+src="([^"]+)"[^>]*>/);
  if (img) {
    const leg =
      slide.match(/<div class="fig-leg">([\s\S]*?)<\/div>/) ??
      slide.match(/<div class="legenda">([\s\S]*?)<\/div>/);
    const arquivo = (img[1] ?? "").split("/").pop() ?? "";
    blocos.push({
      tipo: "imagem",
      src: `/curso/imagens/${arquivo}`,
      legenda: leg ? textoLimpo(leg[1] ?? "") : undefined,
    });
  }

  // 5. O texto do slide, sem o que já virou bloco próprio.
  const corpo = slide
    .replace(/<div class="prompt[^"]*"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<div class="prompt-acoes"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<div class="ia-barra"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<div class="it marcavel"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<span class="chk"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, "")
    .replace(/<h1 class="st"[^>]*>[\s\S]*?<\/h1>/g, "")
    .replace(/<div class="fig-slide"[\s\S]*?<\/div>\s*<\/div>/g, "")
    .replace(/<img[^>]*>/g, "");
  const texto = textoLimpo(corpo);
  if (texto.length > 15) blocos.unshift({ tipo: "texto", html: texto });

  return blocos;
}

/**
 * Prepara o HTML do slide para ser guardado e desenhado pela aplicação.
 *
 * Duas coisas mudam em relação ao deck aberto do disco:
 *
 * - As figuras. No deck o caminho é relativo à pasta do curso
 *   ("imagens/03_...png"); na aplicação os mesmos arquivos são servidos de
 *   `/curso/imagens/`, que vai junto na imagem Docker.
 * - Qualquer `<script>` ou manipulador inline (`onclick=`) sai. O deck não
 *   tem nenhum dentro do slide, mas isto é HTML que será injetado com
 *   `dangerouslySetInnerHTML`: se um dia alguém colar um no deck, ele não
 *   vira código rodando na sessão de quem apresenta.
 */
function normalizarHtml(slide: string): string {
  return slide
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/(<img[^>]+src=")(?:\.\/)?imagens\//gi, "$1/curso/imagens/")
    .trim();
}

export type PassoExtraido = {
  titulo: string;
  /** O slide como está no deck, para ser desenhado com o CSS do deck. */
  html: string;
  /** A seção da apostila que este slide trata — "1.1", "2.2". */
  secaoApostila: string | null;
  blocos: Bloco[];
};

export type RoteiroExtraido = {
  encontro: number;
  titulo: string;
  passos: PassoExtraido[];
};

/**
 * Agrupa os slides do deck em um roteiro por encontro.
 *
 * `data-enc` só existe nos blocos de atividade — os slides de conteúdo, que
 * são a maioria, não têm o atributo. O que de fato separa os encontros são as
 * divisórias "Encontro N — Abertura": daí em diante, tudo pertence àquele
 * encontro, até a próxima divisória.
 */
export function roteirosDoDeck(html: string): RoteiroExtraido[] {
  const slides = fatiarSlides(html);
  const porEncontro = new Map<number, PassoExtraido[]>();
  let corrente = 1;
  // A seção da apostila que o slide trata. Vem do badge — "Capítulo 2.2 · O
  // coração do curso" — e, quando o slide não tem badge, herda a do anterior:
  // é o que a aula faz de fato, seguir tratando o mesmo trecho por vários
  // slides. Sem herdar, só 34 dos 96 passos teriam para onde apontar.
  let secaoCorrente: string | null = null;

  for (const s of slides) {
    const tituloSlide = s.match(/data-title="([^"]*)"/)?.[1] ?? "";
    const divisoria = tituloSlide.match(/^Encontro (\d+)/i);
    if (divisoria) corrente = Number(divisoria[1]);

    // O atributo, quando existe, manda: é o caso das atividades inseridas
    // fora da sequência natural do deck.
    const enc = Number(s.match(/data-enc="(\d+)"/)?.[1] ?? corrente);
    const titulo =
      tituloSlide ||
      textoLimpo(s.match(/<h1 class="st"[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "") ||
      "Passo";
    const badge = s.match(/<div class="badge[^"]*">([\s\S]*?)<\/div>/)?.[1] ?? "";
    const secao = textoLimpo(badge).match(/Cap[ií]tulo\s+(\d+(?:\.\d+)?)/i)?.[1];
    if (secao) secaoCorrente = secao;

    const blocos = blocosDoSlide(s);
    // Um slide puramente visual (uma divisória, uma capa) não tem bloco
    // nenhum, mas continua sendo um slide para projetar — antes ele sumia
    // do roteiro, e a aula pulava a abertura do encontro.
    if (!porEncontro.has(enc)) porEncontro.set(enc, []);
    porEncontro.get(enc)!.push({
      titulo,
      html: normalizarHtml(s),
      secaoApostila: secaoCorrente,
      blocos,
    });
  }

  return [...porEncontro]
    .sort((a, b) => a[0] - b[0])
    .map(([encontro, passos]) => ({
      encontro,
      titulo: `Encontro ${encontro}`,
      passos,
    }));
}
