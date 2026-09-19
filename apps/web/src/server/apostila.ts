import "server-only";
import { prisma } from "@aprender/db";

/**
 * A apostila do curso, para ser lida na tela.
 *
 * Existe porque o PDF não serve para ler no celular: são 9 MB e 113 páginas, e
 * achar "a parte que o professor está mostrando" exige caçar a página. Aqui o
 * material é consultável por seção, e o slide leva direto ao trecho dele.
 * O PDF continua disponível para baixar, para imprimir ou ler off-line.
 */

export type SecaoLida = {
  id: string;
  numero: string;
  titulo: string;
  html: string;
};

export type CapituloLido = {
  id: string;
  chave: string;
  numero: number | null;
  titulo: string;
  icone: string;
  aberturaHtml: string;
  secoes: SecaoLida[];
};

/**
 * O sumário: só o que a lista precisa, sem carregar o conteúdo inteiro.
 *
 * Cada curso tem a sua apostila. Capítulo de `courseId` nulo é o acervo
 * antigo, de quando havia um curso só, e continua aparecendo.
 */
export async function sumarioDaApostila(courseId?: string) {
  return prisma.handbookChapter.findMany({
    where: courseId ? { OR: [{ courseId }, { courseId: null }] } : {},
    orderBy: { ordem: "asc" },
    select: {
      chave: true,
      numero: true,
      titulo: true,
      icone: true,
      secoes: {
        orderBy: { ordem: "asc" },
        select: { numero: true, titulo: true },
      },
    },
  });
}

/** Um capítulo inteiro, com suas seções. */
export async function capitulo(chave: string): Promise<CapituloLido | null> {
  const c = await prisma.handbookChapter.findUnique({
    where: { chave },
    include: { secoes: { orderBy: { ordem: "asc" } } },
  });
  if (!c) return null;
  return {
    id: c.id,
    chave: c.chave,
    numero: c.numero,
    titulo: c.titulo,
    icone: c.icone,
    aberturaHtml: c.aberturaHtml,
    secoes: c.secoes.map((s) => ({
      id: s.id,
      numero: s.numero,
      titulo: s.titulo,
      html: s.html,
    })),
  };
}

/**
 * Onde fica o trecho que um slide trata.
 *
 * O badge do slide diz "Capítulo 2.2" ou, em alguns, só "Capítulo 11" — daí a
 * referência poder ser uma seção ou um capítulo inteiro. Devolve o endereço
 * para onde mandar o aluno, ou nulo quando a referência não existe mais na
 * apostila (o curso mudou e o deck ainda não).
 */
export async function ondeFica(
  referencia: string | null,
): Promise<{ href: string; rotulo: string } | null> {
  if (!referencia) return null;

  // Uma seção: "2.2".
  if (referencia.includes(".")) {
    const secao = await prisma.handbookSection.findFirst({
      where: { numero: referencia },
      select: { numero: true, titulo: true, chapter: { select: { chave: true } } },
    });
    if (secao) {
      return {
        href: `/app/apostila/${secao.chapter.chave}#secao-${secao.numero.replace(/\./g, "-")}`,
        rotulo: `${secao.numero} ${secao.titulo}`,
      };
    }
  }

  // Um capítulo inteiro: "11". Serve também de reserva para uma seção que
  // sumiu — melhor abrir o capítulo certo do que não abrir nada.
  const numero = Number(referencia.split(".")[0]);
  if (!Number.isFinite(numero)) return null;
  const cap = await prisma.handbookChapter.findFirst({
    where: { numero },
    select: { chave: true, titulo: true },
  });
  if (!cap) return null;
  return { href: `/app/apostila/${cap.chave}`, rotulo: cap.titulo };
}
