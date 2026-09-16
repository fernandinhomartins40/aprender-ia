import Link from "next/link";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "@/server/admin";

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
        /* Os roteiros vêm no conteúdo do curso, gravados no deploy. Se a lista
           está vazia, o seed não rodou — é problema de implantação, e não algo
           que o professor resolva enviando um arquivo. */
        <div className="rounded-xl border border-borda bg-white p-5">
          <p className="font-titulo font-bold text-tinta">
            Os roteiros ainda não foram carregados.
          </p>
          <p className="mt-1 text-sm text-tinta-clara">
            Eles fazem parte do conteúdo do curso e chegam com a atualização do
            sistema. Se esta tela continuar vazia, avise o suporte técnico.
          </p>
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
    </main>
  );
}
