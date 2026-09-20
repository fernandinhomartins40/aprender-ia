import Link from "next/link";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "@/server/admin";
import {
  cursoDaUrl,
  cursoDoPainel,
  cursosDoPainel,
  apenasDoCursoAdmin,
} from "@/server/curso-admin";
import { SeletorCursoAdmin } from "@/components/seletor-curso-admin";

export const metadata = { title: "Apresentar aula" };
export const dynamic = "force-dynamic";

export default async function PaginaAulas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirAdmin();

  const curso = await cursoDoPainel(cursoDaUrl(await searchParams));
  const cursos = await cursosDoPainel();

  const roteiros = await prisma.lessonScript.findMany({
    // Roteiro sem curso é de uma turma específica, não acervo comum:
    // por isso o filtro é exato, e não "do curso ou compartilhado".
    where: { ativo: true, ...apenasDoCursoAdmin(curso) },
    orderBy: [{ course: { ordem: "asc" } }, { ordem: "asc" }],
    select: {
      id: true,
      titulo: true,
      ordem: true,
      _count: { select: { passos: true } },
      course: { select: { titulo: true } },
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

      <SeletorCursoAdmin cursos={cursos} ativo={curso?.id ?? null} base="/admin/aulas" />

      {roteiros.length === 0 ? (
        /* Com um curso escolhido, a lista vazia é só o filtro — dizer que
           "o seed não rodou" mandaria o professor chamar o suporte à toa.
           Sem filtro, a mensagem antiga continua valendo: os roteiros vêm
           no conteúdo do curso, gravados no deploy. */
        <div className="rounded-xl border border-borda bg-white p-5">
          {curso ? (
            <>
              <p className="font-titulo font-bold text-tinta">
                Nenhum roteiro em {curso.titulo}.
              </p>
              <p className="mt-1 text-sm text-tinta-clara">
                Este curso ainda não tem aulas para apresentar. Escolha{" "}
                <span className="font-bold">Todos os cursos</span> para ver as
                demais.
              </p>
            </>
          ) : (
            <>
              <p className="font-titulo font-bold text-tinta">
                Os roteiros ainda não foram carregados.
              </p>
              <p className="mt-1 text-sm text-tinta-clara">
                Eles fazem parte do conteúdo do curso e chegam com a atualização
                do sistema. Se esta tela continuar vazia, avise o suporte
                técnico.
              </p>
            </>
          )}
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
                    {/* Sem o curso, dois "Encontro 1" ficam iguais na lista. */}
                    {!curso && r.course && (
                      <span className="font-bold">{r.course.titulo} · </span>
                    )}
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
