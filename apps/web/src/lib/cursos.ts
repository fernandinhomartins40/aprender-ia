/**
 * Slugs dos cursos que a aplicação conhece pelo nome.
 *
 * A regra geral é o curso ser só um registro no banco, e a aplicação não
 * saber qual é qual. As exceções são de vocabulário: a biblioteca de
 * prompts precisa decidir entre dizer "Disciplina" e "Área", e isso
 * depende de quem está lendo.
 *
 * Mantenha esta lista curta. Cada entrada nova é um pedaço de conteúdo
 * que passou a viver no código.
 */
export const CURSO_EDUCADORES = "ia-para-educadores";
export const CURSO_EMPREENDEDORES = "ia-para-empreendedores";

/** Cursos cujo público tem negócio, e não sala de aula. */
export function eCursoDeNegocio(slug: string | null | undefined) {
  return slug === CURSO_EMPREENDEDORES;
}

/**
 * A apostila em PDF de cada curso, servida de `public/curso/`.
 *
 * O PDF é gerado a partir do mesmo conteúdo que está no banco (ver
 * `packages/db/prisma/apostila-empreendedores.ts`), e não de um arquivo
 * mantido à parte: apostila impressa e apostila na tela dizendo coisas
 * diferentes é como o material sai de sincronia com o curso.
 */
const PDFS: Record<string, string> = {
  [CURSO_EDUCADORES]: "/curso/Apostila_IA_Educadores_2026.pdf",
  [CURSO_EMPREENDEDORES]: "/curso/Apostila_IA_Empreendedores_2026.pdf",
};

export function APOSTILA_PDF(slug: string | null | undefined) {
  return PDFS[slug ?? ""] ?? PDFS[CURSO_EDUCADORES]!;
}
