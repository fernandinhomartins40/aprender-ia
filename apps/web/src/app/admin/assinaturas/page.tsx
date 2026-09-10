import Link from "next/link";
import { prisma, type StatusAssinatura } from "@aprender/db";
import {
  listarAssinaturas,
  listarInadimplentes,
  indicadoresAssinaturas,
  conciliarVencimentos,
  criarAssinatura,
  cancelarAssinatura,
  reativarAssinatura,
  gerarProximaCobranca,
  quitarCobranca,
} from "@/server/assinaturas";
import { exigirAdmin } from "@/server/admin";
import { lerNumero } from "@/server/configuracoes";
import { FormAssinatura } from "@/components/form-assinatura";
import { CobrancaWhatsApp } from "@/components/cobranca-whatsapp";
import { reais, dataBR } from "@/lib/dinheiro";
import { ROTULO_STATUS, ROTULO_PERIODO, textoVencimento } from "@/lib/assinaturas";

export const dynamic = "force-dynamic";

const FILTROS: { valor?: StatusAssinatura; rotulo: string }[] = [
  { valor: undefined, rotulo: "Todas" },
  { valor: "ATIVA", rotulo: "Ativas" },
  { valor: "INADIMPLENTE", rotulo: "Inadimplentes" },
  { valor: "CANCELADA", rotulo: "Canceladas" },
  { valor: "EXPIRADA", rotulo: "Expiradas" },
];

const COR_STATUS: Record<StatusAssinatura, string> = {
  ATIVA: "bg-verde-soft text-verde-dark",
  INADIMPLENTE: "bg-vermelho-soft text-vermelho-dark",
  CANCELADA: "bg-borda text-cinza",
  EXPIRADA: "bg-amarelo-soft text-amarelo-dark",
};

export default async function Assinaturas({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await exigirAdmin();
  const params = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === params.status)?.valor;

  // Passa a régua nos vencimentos antes de ler os números: um indicador que
  // só está certo se alguém rodar um script à parte não serve para decidir.
  const conciliacao = await conciliarVencimentos();

  const [indicadores, assinaturas, inadimplentes, planos, alunos, diasTolerancia] =
    await Promise.all([
      indicadoresAssinaturas(),
      listarAssinaturas(filtro),
      listarInadimplentes(),
      prisma.plan.findMany({
        where: { ativo: true },
        orderBy: [{ ordem: "asc" }, { nome: "asc" }],
        select: { id: true, nome: true, precoCentavos: true, periodicidade: true },
      }),
      prisma.user.findMany({
        where: { papel: "ALUNO" },
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, email: true, telefone: true },
      }),
      lerNumero("financeiro.dias_suspender_atraso"),
    ]);

  if (indicadores.indisponivel) {
    return (
      <div className="card">
        <h1 className="font-titulo text-2xl font-extrabold">Assinaturas</h1>
        <p className="mt-3 text-tinta-clara">
          As tabelas de planos e assinaturas ainda não existem no banco. Se o
          deploy acabou de rodar, recarregue em alguns instantes — as migrations
          são aplicadas no fim do processo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-3xl font-extrabold">Assinaturas</h1>
          <p className="mt-1 text-tinta-clara">
            Quem paga, quanto entra por mês e quem está em atraso.
          </p>
        </div>
        <Link href="/admin/planos" className="btn-fantasma text-sm">
          Gerenciar planos
        </Link>
      </div>

      {/* A conciliação mudou algo? O administrador precisa saber que o
          sistema agiu sozinho — em especial quando suspendeu alguém. */}
      {(conciliacao.suspensas > 0 || conciliacao.atrasadas > 0) && (
        <div className="rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-4 text-sm text-amarelo-dark">
          <p className="font-titulo font-bold">Conciliação automática</p>
          <p className="mt-1">
            {conciliacao.atrasadas > 0 &&
              `${conciliacao.atrasadas} cobrança(s) marcada(s) como atrasada. `}
            {conciliacao.suspensas > 0 &&
              `${conciliacao.suspensas} aluno(s) suspenso(s) por passar de ${diasTolerancia} dia(s) de atraso. `}
            {conciliacao.expiradas > 0 && `${conciliacao.expiradas} assinatura(s) expirada(s).`}
          </p>
        </div>
      )}

      {/* ============ INDICADORES ============ */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao
          rotulo="Receita recorrente"
          valor={reais(indicadores.mrr)}
          detalhe={`${indicadores.totalAtivas} assinatura(s) em vigor`}
          cor="verde"
        />
        <Cartao
          rotulo="Ticket médio"
          valor={reais(indicadores.ticketMedio)}
          detalhe="por assinante, por mês"
          cor="indigo"
        />
        <Cartao
          rotulo="Inadimplentes"
          valor={String(indicadores.inadimplentes)}
          detalhe={`${reais(indicadores.aReceber)} em aberto`}
          cor={indicadores.inadimplentes > 0 ? "vermelho" : "indigo"}
        />
        <Cartao
          rotulo="Cancelamentos no mês"
          valor={String(indicadores.canceladasNoMes)}
          detalhe={`churn ${indicadores.churnPct}% · ${indicadores.novasNoMes} nova(s)`}
          cor={indicadores.canceladasNoMes > 0 ? "amarelo" : "verde"}
        />
      </section>

      {/* ============ NOVA ASSINATURA ============ */}
      <FormAssinatura acao={criarAssinatura} planos={planos} alunos={alunos} />

      {/* ============ INADIMPLÊNCIA ============ */}
      {inadimplentes.length > 0 && (
        <section>
          <h2 className="mb-1 font-titulo text-xl font-bold">Em atraso</h2>
          <p className="mb-4 text-sm text-tinta-clara">
            {diasTolerancia > 0
              ? `O acesso é suspenso automaticamente após ${diasTolerancia} dia(s) de atraso. Ajuste esse prazo em Configurações.`
              : "A suspensão automática está desligada: nenhum acesso é cortado por atraso. Ajuste em Configurações."}
          </p>

          <div className="card overflow-x-auto p-0">
            <table className="tabela-responsiva">
              <thead className="border-b border-borda bg-vermelho-soft">
                <tr className="font-titulo text-sm text-vermelho-dark">
                  <th className="p-4">Aluno</th>
                  <th className="p-4">Cobrança</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Atraso</th>
                  <th className="p-4">Conta</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {inadimplentes.map((c) => (
                  <tr key={c.id} className="border-b border-borda align-top last:border-0">
                    <td data-rotulo="Aluno" className="p-4">
                      <div className="font-bold">{c.user.nome}</div>
                      <div className="text-sm text-cinza">
                        {c.user.telefone ?? c.user.email}
                      </div>
                    </td>
                    <td data-rotulo="Cobrança" className="p-4 text-sm">
                      {c.descricao}
                      {c.assinatura && (
                        <div className="text-cinza">{c.assinatura.plan.nome}</div>
                      )}
                    </td>
                    <td data-rotulo="Valor" className="p-4 font-titulo font-bold">
                      {reais(c.valorCentavos)}
                    </td>
                    <td data-rotulo="Atraso" className="p-4 text-sm">
                      <div className="font-bold text-vermelho-dark">
                        {textoVencimento(c.vencimentoEm)}
                      </div>
                      <div className="text-cinza">venceu {dataBR(c.vencimentoEm)}</div>
                    </td>
                    <td data-rotulo="Conta" className="p-4">
                      <span
                        className={`selo ${
                          c.user.situacao === "ATIVO"
                            ? "bg-verde-soft text-verde-dark"
                            : "bg-vermelho-soft text-vermelho-dark"
                        }`}
                      >
                        {c.user.situacao}
                      </span>
                    </td>
                    <td data-rotulo="Ações" className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <form action={quitarCobranca} className="flex gap-1">
                          <input type="hidden" name="paymentId" value={c.id} />
                          <input
                            name="formaPagamento"
                            placeholder="Pix"
                            aria-label={`Forma de pagamento de ${c.user.nome}`}
                            className="w-20 rounded-md border-2 border-borda px-2 py-1.5 text-sm"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-verde px-3 py-1.5 text-sm font-bold text-white hover:opacity-90"
                          >
                            Dar baixa
                          </button>
                        </form>

                        <CobrancaWhatsApp
                          telefone={c.user.telefone}
                          nome={c.user.nome ?? "aluno"}
                          descricao={c.descricao}
                          valorCentavos={c.valorCentavos}
                          vencimentoEm={c.vencimentoEm}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============ LISTA ============ */}
      <section>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 font-titulo text-xl font-bold">Assinaturas</h2>
          {FILTROS.map((f) => (
            <a
              key={f.rotulo}
              href={f.valor ? `/admin/assinaturas?status=${f.valor}` : "/admin/assinaturas"}
              className={`rounded-full px-3.5 py-1.5 font-titulo text-sm font-bold ${
                filtro === f.valor
                  ? "bg-indigo text-white"
                  : "border-2 border-borda text-tinta-clara hover:border-indigo"
              }`}
            >
              {f.rotulo}
            </a>
          ))}
        </div>

        {assinaturas.length === 0 ? (
          <div className="card text-center">
            <p className="py-8 text-cinza">
              {filtro
                ? "Nenhuma assinatura nessa situação."
                : "Nenhuma assinatura ainda. Crie um plano e registre a primeira acima."}
            </p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="tabela-responsiva">
              <thead className="border-b border-borda bg-indigo-soft">
                <tr className="font-titulo text-sm text-indigo-dark">
                  <th className="p-4">Aluno</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Ciclo</th>
                  <th className="p-4">Situação</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {assinaturas.map((a) => {
                  const emAberto = a.cobrancas[0];
                  const encerrada = a.status === "CANCELADA" || a.status === "EXPIRADA";
                  return (
                    <tr key={a.id} className="border-b border-borda align-top last:border-0">
                      <td data-rotulo="Aluno" className="p-4">
                        <div className="font-bold">{a.user.nome}</div>
                        <div className="text-sm text-cinza">
                          {a.user.telefone ?? a.user.email}
                        </div>
                      </td>
                      <td data-rotulo="Plano" className="p-4 text-sm">
                        {a.plan.nome}
                        <div className="text-cinza">{ROTULO_PERIODO[a.periodicidade]}</div>
                      </td>
                      <td data-rotulo="Valor" className="p-4 font-titulo font-bold">
                        {reais(a.precoCentavos)}
                      </td>
                      <td data-rotulo="Ciclo" className="p-4 text-sm">
                        {a.cicloFimEm ? (
                          <>
                            <div>acesso até {dataBR(a.cicloFimEm)}</div>
                            {a.proximaEm && !encerrada && (
                              <div className="text-cinza">
                                próxima cobrança {dataBR(a.proximaEm)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-cinza">—</span>
                        )}
                        {emAberto && (
                          <div
                            className={
                              emAberto.status === "ATRASADO"
                                ? "mt-1 font-bold text-vermelho-dark"
                                : "mt-1 text-amarelo-dark"
                            }
                          >
                            {reais(emAberto.valorCentavos)} · {textoVencimento(emAberto.vencimentoEm)}
                          </div>
                        )}
                      </td>
                      <td data-rotulo="Situação" className="p-4">
                        <span className={`selo ${COR_STATUS[a.status]}`}>
                          {ROTULO_STATUS[a.status]}
                        </span>
                        {a.falhasSeguidas > 0 && (
                          <div className="mt-1 text-xs text-vermelho-dark">
                            {a.falhasSeguidas} cobrança(s) vencida(s)
                          </div>
                        )}
                      </td>
                      <td data-rotulo="Ações" className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {emAberto && (
                            <form action={quitarCobranca} className="flex gap-1">
                              <input type="hidden" name="paymentId" value={emAberto.id} />
                              <input
                                name="formaPagamento"
                                placeholder="Pix"
                                aria-label={`Forma de pagamento de ${a.user.nome}`}
                                className="w-20 rounded-md border-2 border-borda px-2 py-1.5 text-sm"
                              />
                              <button
                                type="submit"
                                className="rounded-md bg-verde px-3 py-1.5 text-sm font-bold text-white hover:opacity-90"
                              >
                                Dar baixa
                              </button>
                            </form>
                          )}

                          {!emAberto && !encerrada && a.periodicidade !== "UNICA" && (
                            <form action={gerarProximaCobranca}>
                              <input type="hidden" name="id" value={a.id} />
                              <button
                                type="submit"
                                className="rounded-md border-2 border-indigo-line px-3 py-1.5 text-sm font-bold text-indigo hover:border-indigo"
                              >
                                Gerar próxima
                              </button>
                            </form>
                          )}

                          {encerrada ? (
                            <form action={reativarAssinatura}>
                              <input type="hidden" name="id" value={a.id} />
                              <button
                                type="submit"
                                className="rounded-md border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta-clara hover:border-verde hover:text-verde-dark"
                              >
                                Reativar
                              </button>
                            </form>
                          ) : (
                            <details>
                              <summary className="cursor-pointer text-sm font-bold text-vermelho-dark hover:underline">
                                Cancelar
                              </summary>
                              <form
                                action={cancelarAssinatura}
                                className="mt-2 flex flex-col gap-2 rounded-md border-2 border-borda p-2"
                              >
                                <input type="hidden" name="id" value={a.id} />
                                <input
                                  name="motivo"
                                  placeholder="Motivo (opcional)"
                                  aria-label="Motivo do cancelamento"
                                  className="rounded-md border-2 border-borda px-2 py-1 text-sm"
                                />
                                <p className="text-xs text-cinza">
                                  O acesso continua até {dataBR(a.cicloFimEm)} — esse
                                  período já foi pago.
                                </p>
                                <button
                                  type="submit"
                                  className="rounded-md bg-vermelho px-3 py-1.5 text-sm font-bold text-white hover:opacity-90"
                                >
                                  Confirmar cancelamento
                                </button>
                              </form>
                            </details>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Cartao({
  rotulo,
  valor,
  detalhe,
  cor,
}: {
  rotulo: string;
  valor: string;
  detalhe: string;
  cor: "verde" | "amarelo" | "vermelho" | "indigo";
}) {
  const fundo = {
    verde: "bg-verde-soft text-verde-dark",
    amarelo: "bg-amarelo-soft text-amarelo-dark",
    vermelho: "bg-vermelho-soft text-vermelho-dark",
    indigo: "bg-indigo-soft text-indigo-dark",
  }[cor];

  return (
    <div className={`rounded-xl p-5 ${fundo}`}>
      <p className="font-titulo text-sm font-bold uppercase tracking-wide opacity-80">
        {rotulo}
      </p>
      <p className="mt-2 font-titulo text-2xl font-extrabold">{valor}</p>
      <p className="mt-1 text-sm opacity-80">{detalhe}</p>
    </div>
  );
}
