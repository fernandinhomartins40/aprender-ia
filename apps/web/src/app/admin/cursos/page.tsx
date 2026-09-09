import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { listarCursos, exigirAdmin } from "@/server/admin";

export const dynamic = "force-dynamic";

async function alternarPublicacao(dados: FormData) {
  "use server";
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const publicar = dados.get("publicar") === "1";
  if (!id) return;
  await prisma.course.update({ where: { id }, data: { publicado: publicar } });
  revalidatePath("/admin/cursos");
}

export default async function Cursos() {
  await exigirAdmin();
  const cursos = await listarCursos();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Cursos</h1>
        <p className="mt-1 text-tinta-clara">
          Estrutura de módulos e lições, e o que está visível para os alunos.
        </p>
      </div>

      {cursos.length === 0 ? (
        <div className="card text-center">
          <div className="py-8">
            <p className="text-lg text-tinta-clara">Nenhum curso cadastrado.</p>
            <p className="mt-2 text-cinza">
              O curso "IA para Educadores" é carregado pelo seed da aplicação.
            </p>
            <code className="mt-4 inline-block rounded-md bg-prompt-bg px-4 py-2 font-mono text-sm text-prompt-txt">
              pnpm db:seed
            </code>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {cursos.map((c) => (
            <div key={c.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-titulo text-xl font-extrabold">{c.titulo}</h2>
                    <span className={c.publicado ? "selo-verde" : "selo-amarelo"}>
                      {c.publicado ? "Publicado" : "Rascunho"}
                    </span>
                  </div>
                  {c.subtitulo && (
                    <p className="mt-1 text-tinta-clara">{c.subtitulo}</p>
                  )}
                  <p className="mt-2 text-sm text-cinza">
                    {c.cargaHoraria}h · {c._count.modulos} módulos ·{" "}
                    {c._count.matriculas} matrículas · {c._count.turmas} turmas
                  </p>
                </div>

                <form action={alternarPublicacao}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="publicar" value={c.publicado ? "0" : "1"} />
                  <button
                    type="submit"
                    className={c.publicado ? "btn-secundario" : "btn-primario"}
                  >
                    {c.publicado ? "Despublicar" : "Publicar"}
                  </button>
                </form>
              </div>

              {c.modulos.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {c.modulos.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-md border-l-4 bg-fundo p-3"
                      style={{ borderLeftColor: m.cor ?? "#4F46E5" }}
                    >
                      <p className="font-titulo text-sm font-bold">{m.titulo}</p>
                      <p className="mt-1 text-sm text-cinza">
                        {m._count.licoes} lições
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
