import Link from "next/link";
import {
  resumoFinanceiro,
  listarLancamentos,
  listarAlunosPagantes,
  lancarPagamento,
  registrarQuitacao,
  cancelarLancamento,
  gerarProximaMensalidade,
} from "@/server/financeiro";
import type { StatusPagamento } from "@aprender/db";
import { CobrancaWhatsApp } from "@/components/cobranca-whatsapp";
import {
  TituloPagina,
  Secao,
  Indicador,
  GradeIndicadores,
  Vazio,
  TabelaCartao,
} from "@/components/pagina-admin";
import { reais, dataBR, diasAte } from "@/lib/dinheiro";

export const dynamic = "force-dynamic";

const FILTROS: { valor?: StatusPagamento; rotulo: string }[] = [
  { valor: undefined, rotulo: "Todos" },
  { valor: "ATRASADO", rotulo: "Atrasados" },
  { valor: "PENDENTE", rotulo: "A receber" },
  { valor: "PAGO", rotulo: "Pagos" },
  { valor: "CANCELADO", rotulo: "Cancelados" },
];

const COR_STATUS: Record<StatusPagamento, string> = {
  PAGO: "bg-verde-soft text-verde-dark",
  PENDENTE: "bg-amarelo-soft text-amarelo-dark",
  ATRASADO: "bg-vermelho-soft text-vermelho-dark",
  CANCELADO: "bg-borda text-cinza",
};

export default async function Financeiro({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filtro = FILTROS.find((f) => f.valor === params.status)?.valor;

  const [resumo, lancamentos, alunos] = await Promise.all([
    resumoFinanceiro(),
    listarLancamentos(filtro),
    listarAlunosPagantes(),
  ]);

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <TituloPagina
        titulo="Cobranças"
        descricao="Lançamentos manuais e baixa de pagamentos. Planos e assinaturas têm telas próprias."
        acoes={
          <Link href="/admin/assinaturas" className="btn-secundario text-sm">
            Ver assinaturas
          </Link>
        }
      />

      <GradeIndicadores>
        <Indicador
          rotulo="Recebido no mês"
          valor={reais(resumo.recebidoMes)}
          detalhe={`${resumo.qtdRecebidoMes} pagamento(s)`}
          tom="positivo"
        />
        <Indicador
          rotulo="A receber"
          valor={reais(resumo.aReceber)}
          detalhe={`${resumo.qtdAReceber} em aberto`}
        />
        <Indicador
          rotulo="Em atraso"
          valor={reais(resumo.atrasado)}
          detalhe={`${resumo.qtdAtrasado} vencido(s)`}
          tom={resumo.qtdAtrasado > 0 ? "critico" : "neutro"}
        />
        <Indicador
          rotulo="Alunos premium"
          valor={String(resumo.premium)}
          detalhe={`de ${resumo.totalAlunos} · ${resumo.suspensos} suspenso(s)`}
        />
      </GradeIndicadores>

      {/* ============ NOVO LANÇAMENTO ============ */}
      <section className="card mb-8">
        <h2 className="font-titulo text-lg font-bold">Registrar cobrança</h2>
        <p className="mt-1 text-sm text-tinta-clara">
          Lance uma mensalidade ou um pagamento único com data de vencimento.
        </p>

        <form action={lancarPagamento} className="mt-4 grid gap-3 md:grid-cols-6">
          <label className="md:col-span-2">
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Aluno</span>
            <select name="userId" required className="campo w-full">
              <option value="">Selecione…</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} {a.telefone ? `· ${a.telefone}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2">
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Descrição</span>
            <input
              name="descricao"
              required
              placeholder="Mensalidade curso IA"
              className="campo w-full"
            />
          </label>

          <label>
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Valor (R$)</span>
            <input
              name="valor"
              required
              inputMode="decimal"
              placeholder="97,00"
              className="campo w-full"
            />
          </label>

          <label>
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Vencimento</span>
            <input
              type="date"
              name="vencimentoEm"
              required
              defaultValue={hoje}
              className="campo w-full"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Tipo</span>
            <select name="tipo" className="campo w-full">
              <option value="UNICO">Pagamento único</option>
              <option value="RECORRENTE">Mensalidade (recorrente)</option>
            </select>
          </label>

          <div className="flex items-end md:col-span-4">
            <button type="submit" className="btn-primario">
              Lançar cobrança
            </button>
          </div>
        </form>
      </section>

      {/* ============ LANÇAMENTOS ============ */}
      <Secao
        titulo="Lançamentos"
        acoes={
          <div className="flex flex-wrap gap-1.5">
            {FILTROS.map((f) => (
              <Link
                key={f.rotulo}
                href={f.valor ? `/admin/cobrancas?status=${f.valor}` : "/admin/cobrancas"}
                aria-current={filtro === f.valor ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                  filtro === f.valor
                    ? "bg-indigo text-white"
                    : "border border-borda text-tinta-clara hover:border-indigo hover:text-indigo"
                }`}
              >
                {f.rotulo}
              </Link>
            ))}
          </div>
        }
      >
        {lancamentos.length === 0 ? (
          <Vazio
            titulo={filtro ? "Nenhuma cobrança nessa situação" : "Nenhuma cobrança lançada"}
            descricao={
              filtro
                ? "Troque o filtro acima para ver as demais."
                : "Use o formulário acima para registrar a primeira."
            }
          />
        ) : (
          <TabelaCartao>
            <table className="tabela-responsiva">
              <thead className="border-b border-borda bg-indigo-soft">
                <tr className="font-titulo text-sm text-indigo-dark">
                  <th className="p-4">Aluno</th>
                  <th className="p-4">Cobrança</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Situação</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((l) => {
                  const dias = diasAte(l.vencimentoEm);
                  const emAberto = l.status === "PENDENTE" || l.status === "ATRASADO";
                  return (
                    <tr key={l.id} className="border-b border-borda align-top last:border-0">
                      <td data-rotulo="Aluno" className="p-4">
                        <div className="font-bold">{l.user.nome}</div>
                        <div className="text-sm text-cinza">
                          {l.user.telefone ?? l.user.email}
                        </div>
                      </td>
                      <td data-rotulo="Cobrança" className="p-4 text-sm">
                        {l.descricao}
                        <div className="text-cinza">
                          {l.tipo === "RECORRENTE" ? "Mensalidade" : "Único"}
                          {l.competencia ? ` · ${l.competencia}` : ""}
                        </div>
                      </td>
                      <td data-rotulo="Valor" className="p-4 font-titulo font-bold">
                        {reais(l.valorCentavos)}
                      </td>
                      <td data-rotulo="Vencimento" className="p-4 text-sm">
                        {dataBR(l.vencimentoEm)}
                        {emAberto && (
                          <div className={dias < 0 ? "text-vermelho-dark" : "text-cinza"}>
                            {dias < 0
                              ? `${Math.abs(dias)} dia(s) em atraso`
                              : dias === 0
                                ? "vence hoje"
                                : `em ${dias} dia(s)`}
                          </div>
                        )}
                        {l.status === "PAGO" && (
                          <div className="text-verde-dark">
                            pago em {dataBR(l.pagoEm)}
                            {l.formaPagamento ? ` · ${l.formaPagamento}` : ""}
                          </div>
                        )}
                      </td>
                      <td data-rotulo="Situação" className="p-4">
                        <span className={`selo ${COR_STATUS[l.status]}`}>{l.status}</span>
                      </td>
                      <td data-rotulo="Ações" className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {emAberto && (
                            <>
                              <form action={registrarQuitacao} className="flex gap-1">
                                <input type="hidden" name="paymentId" value={l.id} />
                                <input
                                  name="formaPagamento"
                                  placeholder="Pix"
                                  aria-label="Forma de pagamento"
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
                                telefone={l.user.telefone}
                                nome={l.user.nome ?? "aluno"}
                                descricao={l.descricao}
                                valorCentavos={l.valorCentavos}
                                vencimentoEm={l.vencimentoEm}
                              />

                              <form action={cancelarLancamento}>
                                <input type="hidden" name="paymentId" value={l.id} />
                                <button
                                  type="submit"
                                  className="rounded-md border-2 border-borda px-3 py-1.5 text-sm font-bold text-cinza hover:border-vermelho hover:text-vermelho-dark"
                                >
                                  Cancelar
                                </button>
                              </form>
                            </>
                          )}

                          {l.status === "PAGO" && l.tipo === "RECORRENTE" && (
                            <form action={gerarProximaMensalidade}>
                              <input type="hidden" name="paymentId" value={l.id} />
                              <button
                                type="submit"
                                className="rounded-md border-2 border-indigo-line px-3 py-1.5 text-sm font-bold text-indigo hover:border-indigo"
                              >
                                Gerar próxima
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TabelaCartao>
        )}
      </Secao>
    </div>
  );
}
