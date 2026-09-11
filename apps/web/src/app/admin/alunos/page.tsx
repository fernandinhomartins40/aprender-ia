import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma, type Papel } from "@aprender/db";
import {
  listarAlunos,
  listarInstrutores,
  exigirAdmin,
  contarAlunosSemTurma,
} from "@/server/admin";
import { importarAlunos } from "@/server/importar-alunos";
import { salvarTurma } from "@/server/turmas";
import {
  definirPrazoFree,
  prorrogarFree,
  revogarFree,
  reativarFree,
} from "@/server/acesso-free";
import { lerNumero } from "@/server/configuracoes";
import { registrarAcao } from "@/server/auditoria";
import { avaliarFree, textoPrazo } from "@/lib/acesso-free";
import { ImportarAlunos } from "@/components/importar-alunos";
import { NovaTurma } from "@/components/painel-turma";
import { AcoesAcessoAluno } from "@/components/acoes-acesso-aluno";

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

  const antes = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true, papel: true },
  });
  if (!antes || antes.papel === papel) return;

  await prisma.user.update({ where: { id: userId }, data: { papel } });

  // Conceder ou tirar poder administrativo é a ação mais sensível do
  // painel; sem registro não há como auditar quem virou admin e quando.
  await registrarAcao({
    acao: "aluno.papel.alterado",
    entidade: "User",
    entidadeId: userId,
    resumo: `${antes.nome}: ${antes.papel} → ${papel}`,
    dados: { de: antes.papel, para: papel },
  });

  revalidatePath("/admin/alunos");
}

export default async function Alunos({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; pagina?: string; semTurma?: string }>;
}) {
  const admin = await exigirAdmin();
  const params = await searchParams;
  const busca = params.busca?.trim() || undefined;
  const pagina = Math.max(1, Number(params.pagina ?? 1) || 1);

  const [
    { usuarios, total, paginas },
    cursos,
    turmas,
    instrutores,
    semTurma,
    diasPadraoFree,
  ] = await Promise.all([
      listarAlunos(busca, pagina),
      prisma.course.findMany({
        select: { id: true, titulo: true },
        orderBy: { ordem: "asc" },
      }),
      prisma.cohort.findMany({
        orderBy: [{ situacao: "asc" }, { criadoEm: "desc" }],
        select: {
          id: true,
          nome: true,
          courseId: true,
          codigo: true,
          situacao: true,
          vagas: true,
          course: { select: { titulo: true } },
          _count: { select: { membros: true } },
        },
      }),
      listarInstrutores(),
      contarAlunosSemTurma(),
      lerNumero("free.dias_ao_aprovar"),
    ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">Alunos e turmas</h1>
          <p className="mt-1 max-w-2xl text-sm text-tinta-clara">
            {total} {total === 1 ? "pessoa cadastrada" : "pessoas cadastradas"} ·{" "}
            {turmas.length} {turmas.length === 1 ? "turma" : "turmas"}
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

      {/* Fila de trabalho: quem entrou sozinho pela landing, sem código. */}
      {semTurma > 0 && (
        <div className="mb-6 rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-4">
          <p className="font-titulo font-bold text-amarelo-dark">
            {semTurma} aluno(s) sem turma
          </p>
          <p className="mt-1 text-sm text-amarelo-dark">
            São pessoas que se cadastraram sozinhas, sem código de turma. Elas
            têm acesso ao conteúdo, mas ficam fora de cronograma e chamada.
          </p>
        </div>
      )}

      <ImportarAlunos
        acao={importarAlunos}
        cursos={cursos}
        turmas={turmas.map((t) => ({
          id: t.id,
          nome: t.nome,
          courseId: t.courseId,
          curso: t.course.titulo,
          codigo: t.codigo,
          situacao: t.situacao,
          vagas: t.vagas,
          inscritos: t._count.membros,
        }))}
      />

      <NovaTurma acao={salvarTurma} cursos={cursos} instrutores={instrutores} />

      {/* ---------- Turmas em resumo ---------- */}
      {turmas.length > 0 && (
        <div className="card mb-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-titulo text-lg font-bold">Turmas</h2>
            <Link href="/admin/turmas" className="btn-fantasma text-sm">
              Ver todas
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {turmas.slice(0, 6).map((t) => (
              <Link
                key={t.id}
                href={`/admin/turmas/${t.id}`}
                className="rounded-md border-2 border-borda p-3 transition-colors hover:border-indigo"
              >
                <p className="truncate font-titulo font-bold">{t.nome}</p>
                <p className="truncate text-sm text-cinza">{t.course.titulo}</p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <span className="font-mono font-bold tracking-widest text-indigo">
                    {t.codigo}
                  </span>
                  <span className="text-cinza">
                    {t._count.membros}
                    {t.vagas != null ? `/${t.vagas}` : ""} aluno(s)
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

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
          <table className="tabela-responsiva">
            <thead className="border-b border-borda bg-indigo-soft">
              <tr className="font-titulo text-sm text-indigo-dark">
                <th className="p-4">Professor(a)</th>
                <th className="p-4">Turma</th>
                <th className="p-4">Escola / disciplina</th>
                <th className="p-4">Acesso</th>
                <th className="p-4 text-center">Progresso</th>
                <th className="p-4 text-center">Ofensiva</th>
                <th className="p-4">Permissão</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const progresso = u.matriculas[0]?.progressoPct ?? 0;
                const ehVoce = u.id === admin.id;
                const turmaAtual = u.membroTurmas[0]?.cohort;
                return (
                  <tr key={u.id} className="border-b border-borda last:border-0">
                    <td data-rotulo="Professor(a)" className="p-4">
                      <div className="font-bold">
                        {u.nome}
                        {ehVoce && (
                          <span className="ml-2 text-xs font-normal text-cinza">
                            (você)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-cinza">
                        {u.telefone || u.email}
                      </div>
                    </td>
                    <td data-rotulo="Turma" className="p-4 text-sm">
                      {turmaAtual ? (
                        <Link
                          href={`/admin/turmas/${turmaAtual.id}`}
                          className="font-bold text-indigo hover:underline"
                        >
                          {turmaAtual.nome}
                          {u.membroTurmas.length > 1 && (
                            <span className="ml-1 font-normal text-cinza">
                              +{u.membroTurmas.length - 1}
                            </span>
                          )}
                        </Link>
                      ) : u.papel === "ALUNO" ? (
                        <span className="text-amarelo-dark">sem turma</span>
                      ) : (
                        <span className="text-cinza">—</span>
                      )}
                    </td>
                    <td data-rotulo="Escola" className="p-4 text-sm text-tinta-clara">
                      {u.escola || "—"}
                      {u.disciplina && (
                        <div className="text-cinza">{u.disciplina}</div>
                      )}
                    </td>
                    <td data-rotulo="Acesso" className="p-4 text-sm">
                      {u.plano === "PREMIUM" ? (
                        <span className="selo-verde">Premium</span>
                      ) : (
                        <>
                          {(() => {
                            const s = avaliarFree(u);
                            if (s.revogado)
                              return <span className="selo-vermelho">Revogado</span>;
                            if (s.permanente)
                              return <span className="selo-cinza">Sem prazo</span>;
                            if (s.expirado)
                              return <span className="selo-vermelho">Expirado</span>;
                            return (
                              <span className={s.avisar ? "selo-amarelo" : "selo-verde"}>
                                {textoPrazo(s.diasRestantes ?? 0)}
                              </span>
                            );
                          })()}
                          {u.papel === "ALUNO" && (
                            <div className="mt-2">
                              <AcoesAcessoAluno
                                userId={u.id}
                                nome={u.nome}
                                freeAte={u.freeAte}
                                revogado={Boolean(u.freeRevogadoEm)}
                                diasPadrao={diasPadraoFree}
                                acaoDefinir={definirPrazoFree}
                                acaoProrrogar={prorrogarFree}
                                acaoRevogar={revogarFree}
                                acaoReativar={reativarFree}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td data-rotulo="Progresso" className="p-4">
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
                    <td data-rotulo="Ofensiva" className="p-4 text-center">
                      {u.ofensiva?.diasSeguidos ? (
                        <span className="font-titulo font-bold text-streak">
                          🔥 {u.ofensiva.diasSeguidos}
                        </span>
                      ) : (
                        <span className="text-cinza">—</span>
                      )}
                    </td>
                    <td data-rotulo="Permissão" className="p-4">
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
