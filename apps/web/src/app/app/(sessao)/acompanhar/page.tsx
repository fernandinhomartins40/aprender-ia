import Link from "next/link";
import { roteiroDoAluno } from "@/server/acompanhar";
import { AcompanharAula } from "@/components/acompanhar-aula";

export const metadata = { title: "Acompanhe a aula" };

// A tela é aberta em sala, com a aula acontecendo: nada de cache.
export const dynamic = "force-dynamic";

export default async function PaginaAcompanhar({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  const { r } = await searchParams;
  const dados = await roteiroDoAluno(r);

  if (!dados) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="mb-3 font-titulo text-2xl font-extrabold">
          Acompanhe a aula
        </h1>
        <p className="rounded-xl border border-borda bg-white p-5 text-tinta-clara">
          Ainda não há roteiro publicado. Quando o professor preparar o
          encontro, os passos aparecem aqui.
        </p>
      </main>
    );
  }

  return (
    // Mais largo que as outras telas do aluno: aqui o conteúdo é um slide
    // 16:9, e apertá-lo em 3xl desperdiçaria metade da tela no computador.
    <main className="mx-auto max-w-6xl px-3 py-4 sm:px-5">
      {/* troca de encontro, quando há mais de um */}
      {dados.roteiros.length > 1 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {dados.roteiros.map((t: { id: string; titulo: string }) => (
            <Link
              key={t.id}
              href={`/app/acompanhar?r=${t.id}`}
              className={`shrink-0 rounded-full px-4 py-1.5 font-titulo text-sm font-bold transition-colors ${
                t.id === dados.script.id
                  ? "bg-indigo text-white"
                  : "border border-borda bg-white text-tinta-clara hover:bg-indigo-soft"
              }`}
            >
              {t.titulo}
            </Link>
          ))}
        </div>
      )}

      <AcompanharAula
        scriptId={dados.script.id}
        titulo={dados.script.titulo}
        passos={dados.passos}
        passoInicialDoProfessor={dados.passoDoProfessor}
      />

      {/* A apostila, para reler depois do encontro ou consultar durante. É
          uma página, e não o PDF: ler 113 páginas de A4 no celular para achar
          o trecho da aula era o problema. O PDF continua lá, para baixar. */}
      <Link
        href="/app/apostila"
        className="mt-5 flex items-center gap-3 rounded-xl border border-borda bg-white p-4 transition-colors hover:bg-indigo-soft"
      >
        <span aria-hidden className="text-2xl">📕</span>
        <span className="min-w-0 flex-1">
          <span className="block font-titulo text-sm font-bold text-tinta">
            Apostila completa do curso
          </span>
          <span className="block text-xs text-cinza">
            Ler aqui mesmo, ou baixar em PDF
          </span>
        </span>
        <span className="shrink-0 font-titulo text-sm font-bold text-indigo">
          Abrir
        </span>
      </Link>
    </main>
  );
}
