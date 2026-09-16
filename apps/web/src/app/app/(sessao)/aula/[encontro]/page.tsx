import Link from "next/link";
import { notFound } from "next/navigation";
import { indiceDoEncontro } from "@/server/aula";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ encontro: string }>;
}) {
  const { encontro } = await params;
  const dados = await indiceDoEncontro(Number(encontro));
  return { title: dados ? dados.encontro.titulo : "Aula" };
}

export default async function PaginaEncontro({
  params,
}: {
  params: Promise<{ encontro: string }>;
}) {
  const { encontro } = await params;
  const dados = await indiceDoEncontro(Number(encontro));
  if (!dados) notFound();

  const visitadas = dados.passos.filter((p) => p.visitado).length;
  const pct = dados.passos.length
    ? Math.round((visitadas / dados.passos.length) * 100)
    : 0;

  return (
    <main className="mx-auto max-w-3xl px-5 py-6">
      <Link
        href="/app/aula"
        className="mb-4 inline-block font-titulo text-sm font-bold text-indigo"
      >
        ‹ Todos os encontros
      </Link>

      <h1 className="mb-1 font-titulo text-2xl font-extrabold text-tinta">
        {dados.encontro.titulo}
      </h1>
      <p className="mb-4 text-tinta-clara">
        {dados.passos.length} páginas de conteúdo
      </p>

      {/* Progresso do aluno neste encontro. */}
      {visitadas > 0 && (
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-titulo text-xs font-bold uppercase tracking-wide text-cinza">
              Seu progresso
            </span>
            <span className="font-titulo text-xs font-bold text-indigo-dark">
              {visitadas} de {dados.passos.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-indigo-soft">
            <div
              className="h-full rounded-full bg-indigo transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Onde o professor está agora, quando há aula acontecendo. */}
      {dados.passoDoProfessor !== null && (
        <Link
          href={`/app/aula/${dados.encontro.ordem}/${dados.passoDoProfessor}`}
          className="mb-5 flex items-center gap-3 rounded-xl bg-verde-soft px-4 py-3 text-verde-dark transition-colors hover:brightness-95"
        >
          <span aria-hidden className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verde opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-verde" />
          </span>
          <span className="min-w-0 flex-1 font-titulo text-sm font-bold">
            A aula está acontecendo — o professor está na página{" "}
            {dados.passoDoProfessor}
          </span>
          <span aria-hidden className="shrink-0">
            ›
          </span>
        </Link>
      )}

      <ol className="space-y-2">
        {dados.passos.map((p) => {
          const aqui = p.ordem === dados.passoDoProfessor;
          return (
            <li key={p.ordem}>
              <Link
                href={`/app/aula/${dados.encontro.ordem}/${p.ordem}`}
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                  aqui
                    ? "border-verde bg-verde-soft"
                    : "border-borda bg-white hover:bg-indigo-soft"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-titulo text-sm font-extrabold ${
                    p.visitado
                      ? "bg-indigo text-white"
                      : "bg-indigo-soft text-indigo-dark"
                  }`}
                >
                  {p.ordem}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-titulo text-[15px] font-bold leading-snug text-tinta">
                    {p.titulo}
                  </span>
                  {p.secaoApostila && (
                    <span className="block text-xs text-cinza">
                      Apostila · {p.secaoApostila}
                    </span>
                  )}
                </span>
                {aqui && (
                  <span className="shrink-0 rounded-full bg-verde px-2.5 py-0.5 font-titulo text-[11px] font-bold text-white">
                    agora
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
