import Link from "next/link";
import { encontrosDoAluno } from "@/server/aula";

export const metadata = { title: "Aulas do curso" };
export const dynamic = "force-dynamic";

export default async function PaginaAulas() {
  const encontros = await encontrosDoAluno();

  return (
    <main className="mx-auto max-w-3xl px-5 py-6">
      <h1 className="mb-1 font-titulo text-2xl font-extrabold text-tinta">
        Aulas do curso
      </h1>
      <p className="mb-6 text-tinta-clara">
        Cada encontro tem suas páginas de conteúdo. Você pode ler no seu ritmo,
        antes, durante ou depois da aula.
      </p>

      {encontros.length === 0 ? (
        <p className="rounded-xl border border-borda bg-white p-5 text-tinta-clara">
          As aulas ainda não foram publicadas.
        </p>
      ) : (
        <ol className="space-y-3">
          {encontros.map((e) => (
            <li key={e.id}>
              <Link
                href={`/app/aula/${e.ordem}`}
                className="flex items-center gap-4 rounded-2xl border border-borda bg-white p-5 transition-colors hover:bg-indigo-soft"
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-soft font-titulo text-xl font-extrabold text-indigo-dark"
                >
                  {e.ordem}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-titulo text-lg font-extrabold text-tinta">
                    {e.titulo}
                  </span>
                  <span className="block text-sm text-cinza">
                    {e._count.passos} páginas de conteúdo
                  </span>
                </span>
                <span aria-hidden className="shrink-0 font-titulo text-indigo">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
