import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@aprender/db";
import { listarInstrutores, exigirAdmin } from "@/server/admin";
import {
  obterTurma,
  salvarTurma,
  adicionarEncontro,
  gerarEncontrosEmSerie,
  editarEncontro,
  cancelarEncontro,
  reativarEncontro,
  removerEncontro,
  registrarPresenca,
  regerarCodigo,
  duplicarTurmaDireto,
} from "@/server/turmas";
import { EditarTurma, DuplicarTurma } from "@/components/painel-turma";
import { EditorEncontros } from "@/components/editor-encontros";
import { ChamadaEncontro } from "@/components/chamada-encontro";
import { dataCurta, dataLonga, faixaHoraria, paraInputDate } from "@/lib/datas";

export const dynamic = "force-dynamic";

const SELO_SITUACAO: Record<string, { classe: string; rotulo: string }> = {
  RASCUNHO: { classe: "selo-cinza", rotulo: "Rascunho" },
  INSCRICOES_ABERTAS: { classe: "selo-verde", rotulo: "Inscrições abertas" },
  EM_ANDAMENTO: { classe: "selo-indigo", rotulo: "Em andamento" },
  CONCLUIDA: { classe: "selo-cinza", rotulo: "Concluída" },
  CANCELADA: { classe: "selo-vermelho", rotulo: "Cancelada" },
};

const ROTULO_MODALIDADE: Record<string, string> = {
  ONLINE: "Online",
  PRESENCIAL: "Presencial",
  HIBRIDA: "Híbrida",
};

export default async function DetalheTurma({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ficha?: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;
  const { ficha } = await searchParams;

  const [turma, cursos, instrutores] = await Promise.all([
    obterTurma(id),
    prisma.course.findMany({
      select: { id: true, titulo: true },
      orderBy: { ordem: "asc" },
    }),
    listarInstrutores(),
  ]);

  if (!turma) notFound();

  const selo = SELO_SITUACAO[turma.situacao] ?? SELO_SITUACAO.RASCUNHO!;
  const alunos = turma.membros.map((m) => m.user);
  const encontrosAtivos = turma.encontros.filter((e) => !e.canceladoEm);

  // Presença por aluno: base do certificado, então conta só encontro que houve.
  const presencaPorAluno = new Map<string, number>();
  for (const e of encontrosAtivos) {
    for (const p of e.presencas) {
      if (p.situacao === "PRESENTE" || p.situacao === "JUSTIFICADA") {
        presencaPorAluno.set(p.userId, (presencaPorAluno.get(p.userId) ?? 0) + 1);
      }
    }
  }

  const modoFicha = ficha === "1";

  return (
    <div>
      {/* ---------- Cabeçalho ---------- */}
      <div className="mb-6">
        <Link
          href="/admin/turmas"
          className="text-sm font-bold text-indigo hover:underline nao-imprimir"
        >
          ← Todas as turmas
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-titulo text-3xl font-extrabold">{turma.nome}</h1>
              <span className={selo.classe}>{selo.rotulo}</span>
            </div>
            <p className="mt-1 text-tinta-clara">
              {turma.course.titulo} ·{" "}
              {ROTULO_MODALIDADE[turma.modalidade] ?? turma.modalidade}
              {turma.instrutor && ` · ${turma.instrutor.nome}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 nao-imprimir">
            <Link href={`/admin/turmas/${turma.id}?ficha=1`} className="btn-secundario text-sm">
              {modoFicha ? "Ver painel" : "Ficha para imprimir"}
            </Link>
            <DuplicarTurma
              acao={duplicarTurmaDireto}
              turmaId={turma.id}
              nomeAtual={turma.nome}
            />
          </div>
        </div>
      </div>

      {/* ---------- Resumo ---------- */}
      <div className="card mb-6 bg-grad-capa">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cinza">
              Código de matrícula
            </p>
            <p className="font-mono text-2xl font-bold tracking-widest text-indigo">
              {turma.codigo}
            </p>
            {turma.situacao !== "INSCRICOES_ABERTAS" && (
              <p className="mt-1 text-xs text-amarelo-dark">
                Só funciona com inscrições abertas.
              </p>
            )}
            <form action={regerarCodigo} className="mt-2 nao-imprimir">
              <input type="hidden" name="id" value={turma.id} />
              <button
                type="submit"
                className="text-xs font-bold text-cinza hover:text-vermelho-dark"
              >
                Gerar código novo
              </button>
            </form>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cinza">Alunos</p>
            <p className="font-titulo text-2xl font-extrabold">
              {turma.membros.length}
              {turma.vagas != null && (
                <span className="text-base font-normal text-cinza">
                  /{turma.vagas}
                </span>
              )}
            </p>
            {turma.vagas != null && turma.membros.length >= turma.vagas && (
              <p className="mt-1 text-xs text-amarelo-dark">Turma lotada.</p>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cinza">Encontros</p>
            <p className="font-titulo text-2xl font-extrabold">
              {encontrosAtivos.length}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cinza">Período</p>
            <p className="font-titulo text-lg font-bold">
              {turma.inicioEm ? dataCurta(turma.inicioEm) : "—"}
              {turma.fimEm && ` a ${dataCurta(turma.fimEm)}`}
            </p>
          </div>
        </div>

        {turma.modalidade === "ONLINE"
          ? turma.linkOnline && (
              <p className="mt-5 border-t border-indigo-line pt-4 text-sm">
                <strong>Sala virtual:</strong>{" "}
                <span className="break-all text-indigo">{turma.linkOnline}</span>
              </p>
            )
          : turma.local && (
              <p className="mt-5 border-t border-indigo-line pt-4 text-sm">
                <strong>Local:</strong>{" "}
                {[turma.local, turma.sala, turma.endereco, turma.cidade, turma.uf]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}

        {turma.descricao && (
          <p className="mt-3 text-sm text-tinta-clara">{turma.descricao}</p>
        )}
      </div>

      {/* ---------- Ficha impressa ---------- */}
      {modoFicha ? (
        <div className="space-y-6">
          <section className="card">
            <h2 className="font-titulo text-xl font-extrabold">Cronograma</h2>
            {encontrosAtivos.length === 0 ? (
              <p className="py-4 text-cinza">Nenhum encontro marcado.</p>
            ) : (
              <ol className="mt-4 space-y-2">
                {encontrosAtivos.map((e) => (
                  <li key={e.id} className="border-b border-borda pb-2 last:border-0">
                    <p className="font-bold">
                      {e.titulo || `Encontro ${e.ordem}`} — {dataLonga(e.data)}
                    </p>
                    <p className="text-sm text-tinta-clara">
                      {faixaHoraria(e.horaInicio, e.horaFim)}
                      {e.modalidade === "REMOTO"
                        ? " · remoto"
                        : [e.local ?? turma.local, e.sala ?? turma.sala]
                              .filter(Boolean)
                              .join(" · ")
                          ? ` · ${[e.local ?? turma.local, e.sala ?? turma.sala].filter(Boolean).join(" · ")}`
                          : ""}
                    </p>
                    {e.pauta && <p className="text-sm">{e.pauta}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="card quebra-pagina">
            <h2 className="font-titulo text-xl font-extrabold">
              Lista de presença — {turma.nome}
            </h2>
            <p className="mt-1 text-sm text-tinta-clara">
              {turma.membros.length} aluno(s). Uma coluna por encontro.
            </p>
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-tinta">
                  <th className="py-2">Aluno</th>
                  <th className="py-2">Telefone</th>
                  {encontrosAtivos.map((e) => (
                    <th key={e.id} className="py-2 text-center">
                      {e.ordem}
                    </th>
                  ))}
                  <th className="py-2">Assinatura</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((a) => (
                  <tr key={a.id} className="border-b border-borda">
                    <td className="py-2">{a.nome}</td>
                    <td className="py-2 font-mono">{a.telefone ?? "—"}</td>
                    {encontrosAtivos.map((e) => (
                      <td key={e.id} className="py-2 text-center">
                        ☐
                      </td>
                    ))}
                    <td className="py-2" />
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          <EditarTurma
            acao={salvarTurma}
            cursos={cursos}
            instrutores={instrutores}
            inicial={{
              id: turma.id,
              nome: turma.nome,
              courseId: turma.courseId,
              descricao: turma.descricao,
              modalidade: turma.modalidade,
              situacao: turma.situacao,
              local: turma.local,
              endereco: turma.endereco,
              cidade: turma.cidade,
              uf: turma.uf,
              sala: turma.sala,
              linkOnline: turma.linkOnline,
              vagas: turma.vagas,
              instrutorId: turma.instrutorId,
              observacoes: turma.observacoes,
              inicioEm: paraInputDate(turma.inicioEm),
              fimEm: paraInputDate(turma.fimEm),
              inscritos: turma.membros.length,
            }}
          />

          <EditorEncontros
            cohortId={turma.id}
            modalidadeTurma={turma.modalidade}
            encontros={turma.encontros.map((e) => ({
              id: e.id,
              ordem: e.ordem,
              titulo: e.titulo,
              pauta: e.pauta,
              data: e.data,
              horaInicio: e.horaInicio,
              horaFim: e.horaFim,
              modalidade: e.modalidade,
              local: e.local,
              endereco: e.endereco,
              sala: e.sala,
              linkOnline: e.linkOnline,
              canceladoEm: e.canceladoEm,
              motivoCancelamento: e.motivoCancelamento,
              presencasRegistradas: e.presencas.length,
            }))}
            acaoGerar={gerarEncontrosEmSerie}
            acaoAdicionar={adicionarEncontro}
            acaoEditar={editarEncontro}
            acaoCancelar={cancelarEncontro}
            acaoReativar={reativarEncontro}
            acaoRemover={removerEncontro}
          />

          <ChamadaEncontro
            cohortId={turma.id}
            encontros={turma.encontros.map((e) => ({
              id: e.id,
              ordem: e.ordem,
              titulo: e.titulo,
              data: e.data,
              horaInicio: e.horaInicio,
              horaFim: e.horaFim,
              canceladoEm: e.canceladoEm,
              presencas: e.presencas,
            }))}
            alunos={alunos.map((a) => ({
              id: a.id,
              nome: a.nome,
              telefone: a.telefone,
            }))}
            acao={registrarPresenca}
          />

          {/* ---------- Alunos ---------- */}
          <section className="card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-titulo text-xl font-extrabold">
                  Alunos da turma
                </h2>
                <p className="mt-1 text-tinta-clara">
                  {turma.membros.length} inscrito(s)
                </p>
              </div>
              <Link href="/admin/alunos" className="btn-secundario text-sm nao-imprimir">
                Cadastrar mais alunos
              </Link>
            </div>

            {alunos.length === 0 ? (
              <p className="py-6 text-center text-cinza">
                Nenhum aluno nesta turma ainda. Use o código{" "}
                <span className="font-mono font-bold">{turma.codigo}</span> ou
                cadastre em lote.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="tabela-responsiva">
                  <thead className="border-b border-borda">
                    <tr className="font-titulo text-sm text-tinta-clara">
                      <th className="p-3">Aluno</th>
                      <th className="p-3">Login</th>
                      <th className="p-3">Escola</th>
                      <th className="p-3 text-center">Presença</th>
                      <th className="p-3 text-center">Senha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map((a) => {
                      const presentes = presencaPorAluno.get(a.id) ?? 0;
                      const pct =
                        encontrosAtivos.length > 0
                          ? Math.round((presentes / encontrosAtivos.length) * 100)
                          : 0;
                      return (
                        <tr key={a.id} className="border-b border-borda last:border-0">
                          <td data-rotulo="Aluno" className="p-3 font-bold">
                            {a.nome}
                          </td>
                          <td data-rotulo="Login" className="p-3 font-mono text-sm">
                            {a.telefone ?? a.email}
                          </td>
                          <td data-rotulo="Escola" className="p-3 text-sm text-tinta-clara">
                            {a.escola || "—"}
                          </td>
                          <td data-rotulo="Presença" className="p-3 text-center text-sm">
                            {encontrosAtivos.length === 0 ? (
                              <span className="text-cinza">—</span>
                            ) : (
                              <>
                                {presentes}/{encontrosAtivos.length}
                                <span className="ml-1 text-cinza">({pct}%)</span>
                              </>
                            )}
                          </td>
                          <td data-rotulo="Senha" className="p-3 text-center">
                            {a.precisaTrocarSenha ? (
                              <span className="selo-amarelo">provisória</span>
                            ) : (
                              <span className="selo-verde">definida</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {turma.observacoes && (
            <section className="card">
              <h2 className="font-titulo text-lg font-bold">
                Observações internas
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-tinta-clara">
                {turma.observacoes}
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
