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
    <main className="mx-auto max-w-3xl px-5 py-6">
      {/* troca de encontro, quando há mais de um */}
      {dados.roteiros.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {dados.roteiros.map((t: { id: string; titulo: string }) => (
            <Link
              key={t.id}
              href={`/app/acompanhar?r=${t.id}`}
              className={`rounded-full px-4 py-2 font-titulo text-sm font-bold transition-colors ${
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
        ferramentas={dados.ferramentas}
        passoInicialDoProfessor={dados.passoDoProfessor}
      />
    </main>
  );
}
