/**
 * Importa o deck de slides do curso como roteiro do "Acompanhe a Aula".
 *
 * O deck em `cursos/Curso_IA_Educadores_v2/Slides_IA_Educadores_2026.html` já
 * tem tudo marcado em HTML — prompts, campos `[ ]`, botões de IA, checklists.
 * Este script lê essa marcação e gera os passos, em vez de alguém redigitar
 * 97 slides à mão.
 *
 * Uso:
 *   pnpm tsx prisma/importar-roteiro.ts <caminho-do-deck.html>
 *
 * Roda de novo sem duplicar: apaga os passos do roteiro e regrava.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Um bloco do passo. A tela do aluno sabe desenhar cada tipo. */
type Bloco =
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
    m[1].replace(/\s+/g, " ").trim(),
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

function ferramentasDe(slide: string): string[] {
  const achadas = new Set<string>();
  for (const [dominio, chave] of Object.entries(POR_DOMINIO)) {
    if (slide.includes(dominio)) achadas.add(chave);
  }
  return [...achadas];
}

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
    const classeEtiqueta = p[1] || "";
    const textoEtiqueta = p[2] || "";
    const ruim = /vermelha/.test(classeEtiqueta) || /❌/.test(textoEtiqueta);
    const texto = textoLimpo(p[3]);
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
    .map((m) => textoLimpo(m[1]))
    .filter((t) => t.length > 2);
  if (itens.length) blocos.push({ tipo: "checklist", itens: [...new Set(itens)] });

  // 3. Ferramentas citadas no slide.
  const chaves = ferramentasDe(slide);
  if (chaves.length) blocos.push({ tipo: "ferramentas", chaves });

  // 4. Imagem, quando houver.
  const img = slide.match(/<img[^>]+src="([^"]+)"[^>]*>/);
  if (img) {
    const leg = slide.match(/<div class="legenda">([\s\S]*?)<\/div>/);
    blocos.push({
      tipo: "imagem",
      src: img[1],
      legenda: leg ? textoLimpo(leg[1]) : undefined,
    });
  }

  // 5. O texto do slide, sem o que já virou bloco próprio.
  const corpo = slide
    .replace(/<div class="prompt[^"]*"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<div class="prompt-acoes"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<div class="ia-barra"[^>]*>[\s\S]*?<\/div>/g, "")
    // o checklist já virou bloco próprio; sem tirar daqui, apareceria
    // duas vezes na tela do aluno
    .replace(/<div class="it marcavel"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<span class="chk"[^>]*>[\s\S]*?<\/span>\s*<\/span>/g, "")
    .replace(/<h1 class="st"[^>]*>[\s\S]*?<\/h1>/g, "")
    .replace(/<img[^>]*>/g, "");
  const texto = textoLimpo(corpo);
  if (texto.length > 15) blocos.unshift({ tipo: "texto", html: texto });

  return blocos;
}

async function main() {
  const caminho = process.argv[2];
  if (!caminho) {
    console.error("uso: pnpm tsx prisma/importar-roteiro.ts <deck.html>");
    process.exit(1);
  }

  const html = readFileSync(caminho, "utf8");
  const slides = fatiarSlides(html);
  if (!slides.length) {
    console.error("nenhum slide encontrado — o arquivo é o deck montado?");
    process.exit(1);
  }

  // A que encontro cada slide pertence.
  //
  // `data-enc` só existe nos blocos de atividade — os slides de conteúdo,
  // que são a maioria, não têm o atributo. Usá-lo sozinho jogava 52 dos 96
  // slides no Encontro 1. O que de fato separa os encontros são as divisórias
  // "Encontro N — Abertura": daí em diante, tudo pertence àquele encontro,
  // até a próxima divisória.
  const porEncontro = new Map<number, { titulo: string; blocos: Bloco[] }[]>();
  let encontroCorrente = 1;

  for (const s of slides) {
    const tituloSlide = s.match(/data-title="([^"]*)"/)?.[1] ?? "";
    const divisoria = tituloSlide.match(/^Encontro (\d+)/i);
    if (divisoria) encontroCorrente = Number(divisoria[1]);

    // O atributo, quando existe, manda: é o caso das atividades inseridas
    // fora da sequência natural do deck.
    const enc = Number(s.match(/data-enc="(\d+)"/)?.[1] ?? encontroCorrente);
    const titulo =
      tituloSlide ||
      textoLimpo(s.match(/<h1 class="st"[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "") ||
      "Passo";
    const blocos = blocosDoSlide(s);
    // Slide sem nada aproveitável (divisória puramente visual) não vira passo.
    if (!blocos.length) continue;
    if (!porEncontro.has(enc)) porEncontro.set(enc, []);
    porEncontro.get(enc)!.push({ titulo, blocos });
  }

  for (const [enc, passos] of [...porEncontro].sort((a, b) => a[0] - b[0])) {
    const titulo = `Encontro ${enc}`;
    const existente = await prisma.lessonScript.findFirst({
      where: { titulo, cohortId: null },
    });

    const script = existente
      ? await prisma.lessonScript.update({
          where: { id: existente.id },
          data: { ordem: enc, ativo: true },
        })
      : await prisma.lessonScript.create({
          data: { titulo, ordem: enc },
        });

    // Regrava do zero: rodar o importador de novo não duplica passos.
    await prisma.scriptStep.deleteMany({ where: { scriptId: script.id } });
    await prisma.scriptStep.createMany({
      data: passos.map((p, i) => ({
        scriptId: script.id,
        ordem: i + 1,
        titulo: p.titulo,
        blocos: p.blocos as unknown as object,
      })),
    });

    const comPrompt = passos.filter((p) =>
      p.blocos.some((b) => b.tipo === "prompt"),
    ).length;
    const comLista = passos.filter((p) =>
      p.blocos.some((b) => b.tipo === "checklist"),
    ).length;
    console.log(
      `${titulo}: ${passos.length} passos · ${comPrompt} com prompt · ${comLista} com checklist`,
    );
  }
}

main()
  .catch((e) => {
    console.error("ERRO:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
