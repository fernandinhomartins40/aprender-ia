import Link from "next/link";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "@/server/admin";
import { ImportarDeckForm } from "@/components/importar-deck-form";

export const metadata = { title: "Apresentar aula" };
export const dynamic = "force-dynamic";

export default async function PaginaAulas() {
  await exigirAdmin();

  const roteiros = await prisma.lessonScript.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      titulo: true,
      ordem: true,
      _count: { select: { passos: true } },
      sessoes: {
        where: { encerradaEm: null },
        orderBy: { iniciadaEm: "desc" },
        take: 1,
        select: { id: true, passoAtual: true, iniciadaEm: true },
      },
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="mb-1 font-titulo text-2xl font-extrabold text-tinta">
        Apresentar aula
      </h1>
      <p className="mb-6 text-tinta-clara">
        Apresente por aqui e a turma acompanha pelo celular, em{" "}
        <span className="font-bold">Acompanhar</span>. Cada passo que você avança
        já aparece para os alunos — não é preciso publicar nada.
      </p>

      {roteiros.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-borda bg-white p-5">
            <p className="font-titulo font-bold text-tinta">
              Nenhum roteiro importado ainda.
            </p>
            <p className="mt-1 text-sm text-tinta-clara">
              Envie o arquivo de slides abaixo para criar os passos da aula.
            </p>
          </div>
          <ImportarDeckForm />
        </div>
      ) : (
        <ul className="space-y-3">
          {roteiros.map((r) => {
            const aberta = r.sessoes[0];
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-borda bg-white p-5"
              >
                <div>
                  <p className="font-titulo text-lg font-extrabold text-tinta">
                    {r.titulo}
                  </p>
                  <p className="text-sm text-tinta-clara">
                    {r._count.passos} passos
                    {aberta && (
                      <span className="ml-2 rounded-full bg-verde-soft px-2.5 py-0.5 font-bold text-verde-dark">
                        apresentando · passo {aberta.passoAtual}
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/apresentar/${r.id}`}
                  className="rounded-full bg-indigo px-6 py-2.5 font-titulo text-sm font-bold text-white"
                >
                  {aberta ? "Retomar" : "Apresentar"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Sempre visível: os slides mudam ao longo do curso, e reimportar
          precisa ser tão simples quanto apresentar. */}
      {roteiros.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer font-titulo text-sm font-bold text-tinta-clara">
            Atualizar os slides
          </summary>
          <div className="mt-3">
            <ImportarDeckForm />
          </div>
        </details>
      )}
    </main>
  );
}
