import Link from "next/link";

/**
 * Troca de curso nas telas de apoio (prompts, ferramentas, apostila…).
 *
 * Só aparece com mais de uma matrícula: quem tem um curso só não precisa
 * escolher, e uma aba solitária seria ruído.
 *
 * É um link, e não um `<select>` com JavaScript, porque a escolha já vive
 * na URL (`?curso=`) — assim o botão voltar funciona e a página pode
 * continuar sendo renderizada no servidor.
 */
export function SeletorCurso({
  cursos,
  ativo,
  base,
}: {
  cursos: { id: string; titulo: string }[];
  ativo: string | null;
  /** Caminho da página, sem a busca. Ex.: "/app/prompts". */
  base: string;
}) {
  if (cursos.length < 2) return null;

  return (
    <nav aria-label="Escolher curso" className="mb-5 flex flex-wrap gap-2">
      {cursos.map((c) => {
        const atual = c.id === ativo;
        return (
          <Link
            key={c.id}
            href={`${base}?curso=${c.id}`}
            aria-current={atual ? "page" : undefined}
            className={
              atual
                ? "rounded-full bg-indigo px-4 py-2 text-sm font-bold text-white"
                : "rounded-full border border-borda px-4 py-2 text-sm font-bold text-tinta-clara transition-colors hover:border-indigo hover:text-indigo"
            }
          >
            {c.titulo}
          </Link>
        );
      })}
    </nav>
  );
}
