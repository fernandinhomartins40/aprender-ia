import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma, type Papel } from "@aprender/db";
import { Pencil, Save, Search, UsersRound } from "lucide-react";
import {
  listarAlunos,
  listarInstrutores,
  exigirAdmin,
  contarAlunosSemTurma,
} from "@/server/admin";
import { importarAlunos } from "@/server/importar-alunos";
import { criarAluno } from "@/server/aluno-individual";
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
import { NovoAlunoIndividual } from "@/components/novo-aluno-individual";
import { NovaTurma } from "@/components/painel-turma";
import { AcoesAcessoAluno } from "@/components/acoes-acesso-aluno";
import { concederPlanoEmLote } from "@/server/acesso-planos";

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
    planos,
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
      prisma.plan.findMany({
        where: { ativo: true },
        orderBy: [{ gratuito: "desc" }, { ordem: "asc" }, { nome: "asc" }],
        select: {
          id: true, nome: true, gratuito: true, diasAcesso: true, diasFree: true,
          cursos: { select: { course: { select: { titulo: true } } } },
        },
      }),
    ]);

  const planoGratuito = planos.find((p) => p.gratuito) ?? null;

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

        <form className="flex gap-2" role="search">
          <input
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por nome, e-mail ou escola"
            aria-label="Buscar aluno"
            className="campo w-72"
          />
          <button type="submit" className="btn-primario" title="Buscar aluno">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Buscar</span>
          </button>
        </form>
      </div>

      <section className="mb-6 border-y border-indigo-line bg-indigo-soft/40 px-5 py-4 sm:px-6">
        <form id="conceder-plano-em-lote" action={concederPlanoEmLote} className="flex flex-wrap items-end gap-3">
          <div className="mr-2 flex items-center gap-2 text-indigo-dark">
            <UsersRound size={22} aria-hidden="true" />
            <div>
              <h2 className="font-titulo text-sm font-extrabold">Plano para alunos selecionados</h2>
              <p className="text-xs">Marque os alunos na lista e aplique uma regra de prazo.</p>
            </div>
          </div>
          <label className="text-sm">
            <span className="mb-1 block font-bold text-tinta">Plano</span>
            <select name="planId" required className="campo min-w-52">
              <option value="">Selecione</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}{p.gratuito ? " (gratuito)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-bold text-tinta">Dias</span>
            <input name="dias" type="number" min={0} className="campo w-28" placeholder="Do plano" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-bold text-tinta">Início</span>
            <input name="inicioEm" type="date" className="campo" />
          </label>
          <button type="submit" className="btn-primario min-h-[44px]">
            Aplicar ao lote
          </button>
          <p className="basis-full text-xs text-tinta-clara">
            Dias vazio usa o prazo do plano; 0 libera sem expiração. Um prazo do aluno já definido continua sendo a referência do acesso Free.
          </p>
        </form>
      </section>

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

      {/* Cadastro de UM aluno, antes do lote.
          O lote atende a turma inteira e exige turma; este caminho existe
          para o caso mais comum fora do dia da matrícula: entrou um
          professor só, às vezes sem turma definida ainda. */}
      <NovoAlunoIndividual
        acao={criarAluno}
        cursos={cursos}
        turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))}
      />

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
                <th className="w-12 p-4"><span className="sr-only">Selecionar</span></th>
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
                const planosDaLinha = u.assinaturas.map((a) => a.plan);
                const planosComFree =
                  u.plano === "FREE" && planoGratuito && !planosDaLinha.some((p) => p.gratuito)
                    ? [...planosDaLinha, planoGratuito]
                    : planosDaLinha;
                const cursosDoPlano = [
                  ...new Set(planosComFree.flatMap((p) => p.cursos.map((c) => c.course.titulo))),
                ];
                return (
                  <tr key={u.id} className="border-b border-borda last:border-0">
                    <td className="p-4">
                      {u.papel === "ALUNO" && (
                        <input
                          form="conceder-plano-em-lote"
                          type="checkbox"
                          name="userIds"
                          value={u.id}
                          aria-label={`Selecionar ${u.nome} para concessão em lote`}
                          className="h-5 w-5 accent-indigo"
                        />
                      )}
                    </td>
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
                        (() => {
                          const s = avaliarFree(u);
                          if (s.revogado) return <span className="selo-vermelho">Revogado</span>;
                          if (s.permanente) return <span className="selo-cinza">Sem prazo</span>;
                          if (s.expirado) return <span className="selo-vermelho">Expirado</span>;
                          return (
                            <span className={s.avisar ? "selo-amarelo" : "selo-verde"}>
                              {textoPrazo(s.diasRestantes ?? 0)}
                            </span>
                          );
                        })()
                      )}
                      <div className="mt-2">
                        <Link
                          href={`/admin/alunos/${u.id}`}
                          title={`Abrir cadastro, planos e cursos de ${u.nome}`}
                          aria-label={`Abrir cadastro, planos e cursos de ${u.nome}`}
                          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border-2 border-indigo-line text-indigo hover:border-indigo hover:bg-indigo-soft"
                        >
                          <Pencil size={18} aria-hidden="true" />
                        </Link>
                      </div>
                      {cursosDoPlano.length > 0 && (
                        <p className="mt-2 max-w-56 text-xs leading-relaxed text-tinta-clara">
                          <span className="font-bold text-tinta">Cursos liberados: </span>
                          {cursosDoPlano.join(", ")}
                        </p>
                      )}
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
                            title={`Salvar permissão de ${u.nome}`}
                            aria-label={`Salvar permissão de ${u.nome}`}
                            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border-2 border-indigo-line text-indigo hover:border-indigo hover:bg-indigo-soft"
                          >
                            <Save size={17} aria-hidden="true" />
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
