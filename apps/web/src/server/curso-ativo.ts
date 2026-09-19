import { prisma } from "@aprender/db";

/**
 * Qual curso o aluno está vendo, e o que é dele.
 *
 * Enquanto havia um curso só, prompts, ferramentas, verbetes, missões,
 * conquistas e apostila não precisavam dizer a quem pertenciam. Com o
 * segundo curso isso vira vazamento: um empreendedor abriria o banco de
 * prompts e leria "Aja como professor(a) de [DISCIPLINA]… habilidade
 * BNCC".
 *
 * A regra vive aqui, e não espalhada por cada página, porque ela tem uma
 * parte fácil de esquecer: material com `courseId` nulo é acervo comum e
 * aparece em TODOS os cursos. Foi assim que o conteúdo de Educadores
 * entrou no banco, e reescrevê-lo seria trabalho sem ganho.
 */

/** Curso escolhido na trilha, guardado na URL como `?curso=<id>`. */
export type CursoAtivo = {
  id: string;
  slug: string;
  titulo: string;
};

/**
 * Resolve o curso da vez.
 *
 * Prioridade: o que veio na URL (o aluno acabou de escolher na trilha) →
 * a matrícula mais antiga → nada. Devolver `null` é um caso real: aluno
 * sem matrícula, ou nenhum curso publicado ainda.
 *
 * O `courseId` da URL é conferido contra as matrículas do próprio aluno.
 * Sem isso, trocar o id na barra de endereço mostraria o conteúdo de um
 * curso em que ele não está inscrito.
 */
export async function resolverCursoAtivo(
  userId: string,
  courseId?: string,
): Promise<CursoAtivo | null> {
  const matriculas = await prisma.enrollment.findMany({
    where: { userId, course: { publicado: true } },
    orderBy: { iniciadoEm: "asc" },
    select: { course: { select: { id: true, slug: true, titulo: true } } },
  });
  if (matriculas.length === 0) return null;

  const escolhido = courseId
    ? matriculas.find((m) => m.course.id === courseId)
    : undefined;

  return (escolhido ?? matriculas[0]!).course;
}

/**
 * Filtro de conteúdo do curso, para usar dentro de um `where`.
 *
 * Sem curso resolvido devolve `{}` — mostra tudo. É o comportamento certo
 * para quem ainda não se matriculou: melhor ver o acervo comum do que uma
 * tela vazia.
 *
 *     where: { ativo: true, ...doCurso(curso) }
 */
export function doCurso(curso: CursoAtivo | null) {
  if (!curso) return {};
  return { OR: [{ courseId: curso.id }, { courseId: null }] };
}

/**
 * Os cursos em que o aluno está, para o seletor no topo das telas de
 * apoio. Uma matrícula só não precisa de seletor, e a interface o omite.
 */
export async function cursosDoAluno(userId: string) {
  const matriculas = await prisma.enrollment.findMany({
    where: { userId, course: { publicado: true } },
    orderBy: { iniciadoEm: "asc" },
    select: { course: { select: { id: true, titulo: true, subtitulo: true } } },
  });
  return matriculas.map((m) => m.course);
}
