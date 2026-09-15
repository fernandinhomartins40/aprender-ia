/**
 * Última atividade por aluno — regra pura, sem banco.
 *
 * Vive em `lib/` e não em `server/engajamento.ts` de propósito: o módulo de
 * engajamento importa `notificacoes` → `auth` → `next-auth`, que só resolve
 * dentro do runtime do Next. Uma função pura pendurada lá não pode ser testada
 * — o teste falha no import, antes de rodar. Aqui ela não depende de nada, e o
 * teste roda.
 *
 * É o mesmo arranjo do `motor-acesso`: a decisão fica separada de quem busca
 * os dados.
 */

/** Linha do `groupBy` de lessonProgress: uma por matrícula. */
export type AtividadePorMatricula = {
  enrollmentId: string;
  _max: { concluidoEm: Date | null };
};

/** Vínculo matrícula → aluno. */
export type VinculoMatricula = {
  id: string;
  userId: string;
};

/**
 * Converte "última conclusão por matrícula" em "última conclusão por aluno".
 *
 * Substitui um `lessonProgress.findFirst(orderBy: concluidoEm desc)` que
 * rodava uma vez POR ALUNO dentro do laço de engajamento. Precisa devolver
 * exatamente o mesmo valor que ele devolvia — se divergir, o cálculo de
 * inatividade erra e o aluno recebe lembrete na hora errada, sem que nada
 * acuse o problema.
 */
export function agruparUltimaAtividade(
  porMatricula: AtividadePorMatricula[],
  matriculas: VinculoMatricula[],
): Map<string, Date> {
  const alunoPorMatricula = new Map(matriculas.map((m) => [m.id, m.userId]));
  const resultado = new Map<string, Date>();

  for (const linha of porMatricula) {
    const userId = alunoPorMatricula.get(linha.enrollmentId);
    const quando = linha._max.concluidoEm;

    // Matrícula desconhecida (apagada entre as duas consultas, que não são
    // atômicas) ou sem nenhuma conclusão: não há data a considerar.
    if (!userId || !quando) continue;

    // Aluno matriculado em vários cursos tem uma linha por matrícula. Vale a
    // conclusão mais recente — é ela que define há quantos dias ele sumiu.
    const atual = resultado.get(userId);
    if (!atual || quando > atual) resultado.set(userId, quando);
  }

  return resultado;
}
