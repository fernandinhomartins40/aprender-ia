import { revalidatePath } from "next/cache";
import { prisma, type Papel } from "@aprender/db";
import { listarAlunos, exigirAdmin } from "@/server/admin";

export const dynamic = "force-dynamic";

const CORES_PAPEL: Record<Papel, string> = {
  ALUNO: "bg-indigo-soft text-indigo-dark",
  INSTRUTOR: "bg-amarelo-soft text-amarelo-dark",
  ADMIN: "bg-verde-soft text-verde-dark",
};

/** Altera o papel de um usuário. Só ADMIN chega aqui. */
async function alterarPapel(dados: FormData) {
  "use server";
  const admin = await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  const papel = String(dados.get("papel") ?? "") as Papel;

  if (!userId || !["ALUNO", "INSTRUTOR", "ADMIN"].includes(papel)) return;

  // Um admin não pode rebaixar a si mesmo: isso poderia deixar a
  // plataforma sem nenhum administrador ativo.
  if (userId === admin.id) return;

  await prisma.user.update({ where: { id: userId }, data: { papel } });
  revalidatePath("/admin/alunos");
}

export default async function Alunos({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; pagina?: string }>;
}) {
  const admin = await exigirAdmin();
  const params = await searchParams;
  const busca = params.busca?.trim() || undefined;
  const pagina = Math.max(1, Number(params.pagina ?? 1) || 1);

  const { usuarios, total, paginas } = await listarAlunos(busca, pagina);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-3xl font-extrabold">Alunos</h1>
          <p className="mt-1 text-tinta-clara">
            {total} {total === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}
          </p>
        </div>

        <form className="flex gap-2">
          <input
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por nome, e-mail ou escola"
            aria-label="Buscar aluno"
            className="campo w-72"
          />
          <button type="submit" className="btn-primario">
            Buscar
          </button>
        </form>
      </div>

      {usuarios.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">
            {busca
              ? `Nenhum resultado para "${busca}".`
              : "Ainda não há professores cadastrados."}
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left">
            <thead className="border-b border-borda bg-indigo-soft">
              <tr className="font-titulo text-sm text-indigo-dark">
                <th className="p-4">Professor(a)</th>
                <th className="p-4">Escola / disciplina</th>
                <th className="p-4 text-center">Progresso</th>
                <th className="p-4 text-center">Ofensiva</th>
                <th className="p-4 text-center">Prompts</th>
                <th className="p-4">Permissão</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const progresso = u.matriculas[0]?.progressoPct ?? 0;
                const ehVoce = u.id === admin.id;
                return (
                  <tr key={u.id} className="border-b border-borda last:border-0">
                    <td className="p-4">
                      <div className="font-bold">
                        {u.nome}
                        {ehVoce && (
                          <span className="ml-2 text-xs font-normal text-cinza">
                            (você)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-cinza">{u.email}</div>
                    </td>
                    <td className="p-4 text-sm text-tinta-clara">
                      {u.escola || "—"}
                      {u.disciplina && (
                        <div className="text-cinza">{u.disciplina}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="mx-auto w-28">
                        <div className="h-2 overflow-hidden rounded-full bg-borda">
                          <div
                            className="h-full rounded-full bg-grad-marca"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                        <div className="mt-1 text-center text-xs text-cinza">
                          {progresso}%
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {u.ofensiva?.diasSeguidos ? (
                        <span className="font-titulo font-bold text-streak">
                          🔥 {u.ofensiva.diasSeguidos}
                        </span>
                      ) : (
                        <span className="text-cinza">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-tinta-clara">
                      {u._count.execucoesPrompt}
                    </td>
                    <td className="p-4">
                      {ehVoce ? (
                        <span className={`selo ${CORES_PAPEL[u.papel]}`}>
                          {u.papel}
                        </span>
                      ) : (
                        <form action={alterarPapel} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={u.id} />
                          <select
                            name="papel"
                            defaultValue={u.papel}
                            aria-label={`Permissão de ${u.nome}`}
                            className="rounded-md border-2 border-borda px-2 py-1.5 text-sm"
                          >
                            <option value="ALUNO">Aluno</option>
                            <option value="INSTRUTOR">Instrutor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-md border-2 border-indigo-line px-3 py-1.5 text-sm font-bold text-indigo hover:border-indigo"
                          >
                            Salvar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {paginas > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Paginação">
          {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/alunos?pagina=${p}${busca ? `&busca=${encodeURIComponent(busca)}` : ""}`}
              aria-current={p === pagina ? "page" : undefined}
              className={`rounded-md px-3.5 py-2 font-titulo text-sm font-bold ${
                p === pagina
                  ? "bg-indigo text-white"
                  : "border-2 border-borda text-tinta-clara hover:border-indigo"
              }`}
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
