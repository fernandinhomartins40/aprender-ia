import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { listarTurmas, exigirAdmin } from "@/server/admin";

export const dynamic = "force-dynamic";

/** Código curto, legível e sem caracteres ambíguos (0/O, 1/I). */
function gerarCodigo(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    alfabeto[Math.floor(Math.random() * alfabeto.length)],
  ).join("");
}

async function criarTurma(dados: FormData) {
  "use server";
  await exigirAdmin();

  const nome = String(dados.get("nome") ?? "").trim();
  const courseId = String(dados.get("courseId") ?? "");
  if (!nome || !courseId) return;

  // Colisão de código é improvável, mas o campo é único: tentamos algumas vezes.
  for (let i = 0; i < 5; i++) {
    try {
      await prisma.cohort.create({
        data: { nome, courseId, codigo: gerarCodigo() },
      });
      break;
    } catch {
      if (i === 4) throw new Error("Não foi possível gerar um código único.");
    }
  }
  revalidatePath("/admin/turmas");
}

export default async function Turmas() {
  await exigirAdmin();
  const [turmas, cursos] = await Promise.all([
    listarTurmas(),
    prisma.course.findMany({ select: { id: true, titulo: true }, orderBy: { ordem: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Turmas</h1>
        <p className="mt-1 text-tinta-clara">
          Agrupe professores por formação. Cada turma tem um código de matrícula.
        </p>
      </div>

      {cursos.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-titulo text-lg font-bold">Nova turma</h2>
          <form action={criarTurma} className="mt-4 flex flex-wrap gap-3">
            <input
              name="nome"
              required
              placeholder="Ex: Rede Municipal — turma de março"
              aria-label="Nome da turma"
              className="campo min-w-64 flex-1"
            />
            <select name="courseId" required aria-label="Curso" className="campo w-64">
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primario">
              Criar turma
            </button>
          </form>
        </div>
      )}

      {turmas.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">
            {cursos.length === 0
              ? "Cadastre um curso antes de criar turmas."
              : "Nenhuma turma criada ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {turmas.map((t) => (
            <div key={t.id} className="card">
              <h3 className="font-titulo font-bold">{t.nome}</h3>
              <p className="mt-1 text-sm text-tinta-clara">{t.course.titulo}</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-cinza">
                    Código de matrícula
                  </p>
                  <p className="font-mono text-xl font-bold tracking-widest text-indigo">
                    {t.codigo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-titulo text-2xl font-extrabold text-indigo">
                    {t._count.membros}
                  </p>
                  <p className="text-xs text-cinza">
                    {t._count.membros === 1 ? "professor" : "professores"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
