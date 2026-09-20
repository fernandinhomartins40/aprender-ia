import Link from "next/link";
import type { CursoAdmin } from "@/server/curso-admin";

/**
 * Troca de curso nas telas do painel.
 *
 * Mesma ideia do `SeletorCurso` do aluno — link com `?curso=` na URL, sem
 * JavaScript, para o botão voltar funcionar e a página seguir renderizada
 * no servidor — com duas diferenças próprias do painel:
 *
 *  - "Todos os cursos" é uma opção de verdade, e o padrão. Quem administra
 *    precisa ver o acervo inteiro sem escolher curso primeiro.
 *  - Curso despublicado aparece marcado. Sem isso, o administrador não
 *    entenderia por que o conteúdo que acabou de conferir não chega ao
 *    aluno.
 *
 * Com um curso só, o seletor some: não há escolha a fazer.
 */
export function SeletorCursoAdmin({
  cursos,
  ativo,
  base,
}: {
  cursos: CursoAdmin[];
  /** Id do curso escolhido, ou null para "todos". */
  ativo: string | null;
  /** Caminho da página, sem a busca. Ex.: "/admin/aulas". */
  base: string;
}) {
  if (cursos.length < 2) return null;

  const estilo = (atual: boolean) =>
    atual
      ? "rounded-full bg-indigo px-4 py-2 text-sm font-bold text-white"
      : "rounded-full border border-borda px-4 py-2 text-sm font-bold text-tinta-clara transition-colors hover:border-indigo hover:text-indigo";

  return (
    <nav aria-label="Filtrar por curso" className="mb-5 flex flex-wrap gap-2">
      <Link
        href={base}
        aria-current={ativo === null ? "page" : undefined}
        className={estilo(ativo === null)}
      >
        Todos os cursos
      </Link>

      {cursos.map((c) => {
        const atual = c.id === ativo;
        return (
          <Link
            key={c.id}
            href={`${base}?curso=${c.id}`}
            aria-current={atual ? "page" : undefined}
            className={estilo(atual)}
          >
            {c.titulo}
            {!c.publicado && (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                  atual ? "bg-white/20 text-white" : "bg-amarelo-soft text-amarelo-dark"
                }`}
              >
                rascunho
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
