"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";

/**
 * Importa o deck de slides como roteiros da aula.
 *
 * Existe como ação do painel — e não só como script — porque a imagem Docker
 * de produção não traz o `tsx`, então `importar-roteiro.ts` não roda na VPS.
 * Aqui o professor envia o HTML pelo navegador e a própria aplicação importa,
 * sem SSH e sem depender de quem tem acesso ao servidor.
 *
 * A lógica é a mesma do script em packages/db/prisma/importar-roteiro.ts.
 */

type Bloco =
  | { tipo: "texto"; html: string }
  | { tipo: "prompt"; texto: string; variaveis: string[] }
  | { tipo: "ferramentas"; chaves: string[] }
  | { tipo: "checklist"; itens: string[] }
  | { tipo: "imagem"; src: string; legenda?: string };

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

function variaveisDe(texto: string): string[] {
  const achadas = [...texto.matchAll(/\[([^\]]+)\]/g)].map((m) =>
    m[1]!.replace(/\s+/g, " ").trim(),
  );
  return [...new Set(achadas)];
}

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

const POR_DOMINIO: Record<string, string> = {
  "chatgpt.com": "chatgpt",
  "gemini.google.com": "gemini",
  "chat.deepseek.com": "deepseek",
  "notebooklm.google.com": "notebooklm",
};

function blocosDoSlide(slide: string): Bloco[] {
  const blocos: Bloco[] = [];

  // Prompts. Os marcados com ❌ ficam de fora: são exemplos do que NÃO fazer,
  // e dar um botão para rodá-los ensinaria o contrário do slide.
  const rePrompt =
    /(?:<div class="etiqueta([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*)?<div class="prompt[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
  let p: RegExpExecArray | null;
  while ((p = rePrompt.exec(slide))) {
    const ruim = /vermelha/.test(p[1] ?? "") || /❌/.test(p[2] ?? "");
    const texto = textoLimpo(p[3] ?? "");
    if (ruim || texto.length < 40) continue;
    blocos.push({ tipo: "prompt", texto, variaveis: variaveisDe(texto) });
  }

  const itens = [
    ...[...slide.matchAll(/<div class="it marcavel"[^>]*>[\s\S]*?<span class="tx">([\s\S]*?)<\/span>/g)],
    ...[...slide.matchAll(/<span class="chk"[^>]*>[\s\S]*?<span class="tx">([\s\S]*?)<\/span>/g)],
    ...[...slide.matchAll(/☐\s*([^<\n]+)/g)],
  ]
    .map((m) => textoLimpo(m[1] ?? ""))
    .filter((t) => t.length > 2);
  if (itens.length) blocos.push({ tipo: "checklist", itens: [...new Set(itens)] });

  const chaves = Object.entries(POR_DOMINIO)
    .filter(([dominio]) => slide.includes(dominio))
    .map(([, chave]) => chave);
  if (chaves.length) blocos.push({ tipo: "ferramentas", chaves: [...new Set(chaves)] });

  // As figuras vivem em public/curso/imagens/ na aplicação; no deck o caminho
  // é relativo à pasta do curso.
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

export type ResultadoImportacao = {
  ok: boolean;
  mensagem: string;
  detalhes?: string[];
};

export async function importarDeck(
  _anterior: ResultadoImportacao | null,
  dados: FormData,
): Promise<ResultadoImportacao> {
  await exigirAdmin();

  const arquivo = dados.get("deck");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, mensagem: "Escolha o arquivo de slides (.html)." };
  }

  const html = await arquivo.text();
  const slides = fatiarSlides(html);
  if (!slides.length) {
    return {
      ok: false,
      mensagem:
        "Nenhum slide encontrado no arquivo. Envie o deck montado (Slides_IA_Educadores_2026.html).",
    };
  }

  // `data-enc` só existe nos blocos de atividade. O que separa os encontros
  // são as divisórias "Encontro N — Abertura".
  const porEncontro = new Map<number, { titulo: string; blocos: Bloco[] }[]>();
  let corrente = 1;

  for (const s of slides) {
    const tituloSlide = s.match(/data-title="([^"]*)"/)?.[1] ?? "";
    const divisoria = tituloSlide.match(/^Encontro (\d+)/i);
    if (divisoria) corrente = Number(divisoria[1]);

    const enc = Number(s.match(/data-enc="(\d+)"/)?.[1] ?? corrente);
    const titulo =
      tituloSlide ||
      textoLimpo(s.match(/<h1 class="st"[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "") ||
      "Passo";
    const blocos = blocosDoSlide(s);
    if (!blocos.length) continue;
    if (!porEncontro.has(enc)) porEncontro.set(enc, []);
    porEncontro.get(enc)!.push({ titulo, blocos });
  }

  const detalhes: string[] = [];

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
      : await prisma.lessonScript.create({ data: { titulo, ordem: enc } });

    // Regrava do zero: reimportar não duplica passos.
    await prisma.scriptStep.deleteMany({ where: { scriptId: script.id } });
    await prisma.scriptStep.createMany({
      data: passos.map((p, i) => ({
        scriptId: script.id,
        ordem: i + 1,
        titulo: p.titulo,
        blocos: p.blocos as unknown as object,
      })),
    });

    const comPrompt = passos.filter((p) => p.blocos.some((b) => b.tipo === "prompt")).length;
    const comImagem = passos.filter((p) => p.blocos.some((b) => b.tipo === "imagem")).length;
    detalhes.push(
      `${titulo}: ${passos.length} passos · ${comPrompt} com prompt · ${comImagem} com imagem`,
    );
  }

  revalidatePath("/admin/aulas");
  revalidatePath("/app/acompanhar");

  return {
    ok: true,
    mensagem: `Importado: ${slides.length} slides em ${porEncontro.size} encontros.`,
    detalhes,
  };
}
