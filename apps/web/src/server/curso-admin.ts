import { prisma } from "@aprender/db";

/**
 * Qual curso o administrador está olhando no painel.
 *
 * O equivalente de `curso-ativo.ts`, que faz isso para o aluno, com duas
 * diferenças que vêm do papel:
 *
 *  - O administrador enxerga TODOS os cursos, publicados ou não. É ele
 *    quem confere o conteúdo antes de publicar, então esconder o que
 *    ainda não foi publicado inviabilizaria a conferência.
 *  - Existe a opção "todos os cursos". Num painel, ver o acervo inteiro
 *    de uma vez é uma necessidade real — bem diferente da trilha do
 *    aluno, onde misturar dois cursos só confunde.
 *
 * Como no lado do aluno, `courseId` nulo no conteúdo significa acervo
 * comum e aparece em qualquer curso escolhido.
 */

export type CursoAdmin = {
  id: string;
  slug: string;
  titulo: string;
  publicado: boolean;
};

/** Todos os cursos, para montar o seletor. */
export async function cursosDoPainel(): Promise<CursoAdmin[]> {
  return prisma.course.findMany({
    orderBy: [{ ordem: "asc" }, { titulo: "asc" }],
    select: { id: true, slug: true, titulo: true, publicado: true },
  });
}

/**
 * O curso escolhido no seletor, vindo de `?curso=<id>`.
 *
 * Devolve `null` para "todos os cursos" — tanto quando nada foi
 * escolhido quanto quando o id da URL não existe mais. Um id inválido
 * cair em "todos" é melhor que uma tela de erro: o curso pode ter sido
 * apagado enquanto a aba ficou aberta.
 */
export async function cursoDoPainel(
  courseId?: string,
): Promise<CursoAdmin | null> {
  if (!courseId || courseId === "todos") return null;

  return prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, slug: true, titulo: true, publicado: true },
  });
}

/**
 * Filtro para um `where` de conteúdo com escopo de curso.
 *
 *     where: { ativo: true, ...doCursoAdmin(curso) }
 *
 * Sem curso (o "todos") devolve `{}` e nada é filtrado.
 */
export function doCursoAdmin(curso: CursoAdmin | null) {
  if (!curso) return {};
  return { OR: [{ courseId: curso.id }, { courseId: null }] };
}

/**
 * Igual ao anterior, para conteúdo que SEMPRE pertence a um curso.
 *
 * Roteiros de aula são assim: um roteiro sem curso é de uma turma
 * específica (`cohortId`), não acervo comum — incluí-lo em todo curso
 * mostraria a aula de uma turma para quem apresenta outra.
 */
export function apenasDoCursoAdmin(curso: CursoAdmin | null) {
  if (!curso) return {};
  return { courseId: curso.id };
}

/** Lê o `?curso=` de um `searchParams` do Next, que aceita string ou lista. */
export function cursoDaUrl(
  params: Record<string, string | string[] | undefined> | undefined,
): string | undefined {
  const bruto = params?.curso;
  return Array.isArray(bruto) ? bruto[0] : bruto;
}
