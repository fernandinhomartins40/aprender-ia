import Link from "next/link";
import {
  indicadoresAlunos,
  indicadoresFinanceiros,
  indicadoresProgresso,
  seriesDoPeriodo,
  atividadeRecente,
} from "@/server/metricas";
import { ferramentasMaisUsadas } from "@/server/admin";
import { periodoPreset, PRESETS } from "@/lib/periodo";
import { reais } from "@/lib/dinheiro";
import { GraficoLinha, GraficoBarras, StatTile, Medidor } from "@/components/graficos";
import { Icone3D } from "@/components/icone-3d";

export const dynamic = "force-dynamic";

export default async function VisaoGeral({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const params = await searchParams;
  const periodo = periodoPreset(params.periodo);

  const [alunos, fin, progresso, series, ferramentas, atividade] = await Promise.all([
    indicadoresAlunos(periodo),
    indicadoresFinanceiros(periodo),
    indicadoresProgresso(),
    seriesDoPeriodo(periodo),
    ferramentasMaisUsadas(),
    atividadeRecente(),
  ]);

  const maisUsada = ferramentas[0]?.usos ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Visão geral</h1>
        <p className="mt-1 text-tinta-clara">
          O estado da plataforma — {periodo.rotulo}.
        </p>
      </div>

      {/* Filtro numa linha só, acima de tudo o que ele afeta. */}
      <nav
        className="mb-8 flex flex-wrap gap-2 border-b border-borda pb-4"
        aria-label="Período"
      >
        {PRESETS.map((p) => (
          <Link
            key={p.chave}
            href={`/admin?periodo=${p.chave}`}
            aria-current={periodo.chave === p.chave ? "page" : undefined}
            className={`rounded-md px-3.5 py-2 font-titulo text-sm font-bold transition-colors ${
              periodo.chave === p.chave
                ? "bg-indigo text-white"
                : "border-2 border-borda text-tinta-clara hover:border-indigo"
            }`}
          >
            {p.rotulo}
          </Link>
        ))}
      </nav>

      {/* ---------- Alunos ---------- */}
      <h2 className="mb-3 font-titulo text-xl font-extrabold">Alunos</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          rotulo="Total de alunos"
          valor={alunos.total.toLocaleString("pt-BR")}
          detalhe={`${alunos.novosNoPeriodo} novo(s) no período`}
          destaque
        />
        <StatTile
          rotulo="Ativos"
          valor={alunos.ativos.toLocaleString("pt-BR")}
          detalhe={`acessaram nos últimos ${alunos.diasInativo} dias`}
        />
        <StatTile
          rotulo="Inativos"
          valor={alunos.inativos.toLocaleString("pt-BR")}
          detalhe={`sem acesso há mais de ${alunos.diasInativo} dias`}
        />
        <StatTile
          rotulo="Nunca acessaram"
          valor={alunos.nuncaAcessaram.toLocaleString("pt-BR")}
          detalhe="conta criada, primeiro acesso pendente"
          alerta={alunos.nuncaAcessaram > 0}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          rotulo="Gratuitos (Free)"
          valor={alunos.free.toLocaleString("pt-BR")}
        />
        <StatTile
          rotulo="Pagantes (Premium)"
          valor={alunos.premium.toLocaleString("pt-BR")}
          detalhe={`${alunos.premiumVencendo} vence(m) em 7 dias`}
        />
        <StatTile
          rotulo="Inadimplentes"
          valor={alunos.suspensos.toLocaleString("pt-BR")}
          detalhe={`${fin.inadimplentes} com cobrança atrasada`}
          alerta={fin.inadimplentes > 0}
        />
        <Medidor
          rotulo="Conversão para pagante"
          pct={alunos.conversao}
          detalhe={`${alunos.premium} de ${alunos.total} alunos · foto de hoje`}
        />
      </div>

      {/* ---------- Financeiro ---------- */}
      <h2 className="mb-3 mt-10 font-titulo text-xl font-extrabold">Financeiro</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          rotulo="Recebido no período"
          valor={reais(fin.recebido)}
          detalhe={`${fin.qtdRecebido} pagamento(s)`}
          destaque
        />
        <StatTile
          rotulo="Receita recorrente"
          valor={reais(fin.receitaRecorrente)}
          detalhe="mensalidades ativas"
        />
        <StatTile
          rotulo="A receber"
          valor={reais(fin.aReceber)}
          detalhe={`${fin.qtdAReceber} em aberto`}
        />
        <StatTile
          rotulo="Em atraso"
          valor={reais(fin.atrasado)}
          detalhe={`${fin.qtdAtrasado} vencido(s) · ticket médio ${reais(fin.ticketMedio)}`}
          alerta={fin.atrasado > 0}
        />
      </div>

      {/* ---------- Evolução ---------- */}
      <h2 className="mb-3 mt-10 font-titulo text-xl font-extrabold">Evolução</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        <GraficoLinha
          titulo="Novos alunos"
          descricao={`Cadastros por ${series.granularidade} · ${periodo.rotulo}`}
          dados={series.cadastros}
          rotuloValor="Alunos"
        />
        <GraficoLinha
          titulo="Matrículas"
          descricao={`Novas matrículas por ${series.granularidade}`}
          dados={series.matriculas}
          rotuloValor="Matrículas"
        />
        <GraficoLinha
          titulo="Receita"
          descricao={`Pagamentos confirmados por ${series.granularidade}`}
          dados={series.receita}
          formato="moeda"
          rotuloValor="Receita"
        />
        <GraficoLinha
          titulo="Lições concluídas"
          descricao={`Conclusões por ${series.granularidade}`}
          dados={series.licoesConcluidas}
          rotuloValor="Lições"
        />
      </div>

      {/* ---------- Progresso ---------- */}
      <h2 className="mb-3 mt-10 font-titulo text-xl font-extrabold">
        Progresso dos alunos
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          rotulo="Progresso médio"
          valor={`${progresso.progressoMedio}%`}
          detalhe={`${progresso.matriculas} matrícula(s)`}
        />
        <StatTile
          rotulo="Concluíram o curso"
          valor={progresso.concluidas.toLocaleString("pt-BR")}
        />
        <StatTile
          rotulo="Parados"
          valor={progresso.parados.toLocaleString("pt-BR")}
          detalhe="começaram e não acessam há 14 dias"
          alerta={progresso.parados > 0}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <GraficoBarras
          titulo="Distribuição do progresso"
          descricao="Quantos alunos em cada faixa de conclusão"
          dados={progresso.faixas}
          rotuloValor="Alunos"
        />

        <figure className="card m-0">
          <figcaption className="font-titulo text-lg font-bold">
            Ferramentas de IA mais usadas
          </figcaption>
          <p className="mt-1 text-sm text-cinza">
            Baseado nos prompts realmente executados.
          </p>
          {ferramentas.length === 0 ? (
            <p className="py-10 text-center text-cinza">
              Ainda não há prompts executados.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {ferramentas.map((f) => (
                <li key={f.ferramenta} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm capitalize text-tinta-clara">
                    {f.ferramenta}
                  </span>
                  <div className="h-6 flex-1">
                    <div
                      className="h-full rounded-r-md bg-indigo"
                      style={{ width: `${Math.max(1.5, (f.usos / maisUsada) * 100)}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums text-tinta">
                    {f.usos}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </figure>
      </div>

      {/* ---------- Atividade administrativa ---------- */}
      <h2 className="mb-3 mt-10 font-titulo text-xl font-extrabold">
        Últimas ações no painel
      </h2>
      <div className="card">
        {atividade.length === 0 ? (
          <p className="py-6 text-center text-cinza">
            Nenhuma ação registrada ainda.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-borda">
              {atividade.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 py-2.5">
                  <span className="font-titulo text-sm font-bold text-tinta">
                    {a.atorNome}
                  </span>
                  <span className="flex-1 text-sm text-tinta-clara">{a.resumo}</span>
                  <span className="text-xs tabular-nums text-cinza">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(a.criadoEm)}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/admin/auditoria" className="btn-fantasma mt-3 text-sm">
              Ver histórico completo
            </Link>
          </>
        )}
      </div>

      {/* ---------- Atalhos ---------- */}
      <h2 className="mb-3 mt-10 font-titulo text-xl font-extrabold">Gerenciar</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/alunos", icone: "heart" as const, titulo: "Alunos e turmas", texto: "Cadastro, turmas e progresso" },
          { href: "/admin/financeiro", icone: "gift" as const, titulo: "Financeiro", texto: "Cobranças, planos e inadimplência" },
          { href: "/admin/cursos", icone: "notebook" as const, titulo: "Cursos", texto: "Módulos, lições e publicação" },
          { href: "/admin/configuracoes", icone: "setting" as const, titulo: "Configurações", texto: "Regras de acesso e parâmetros" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card transition-shadow hover:shadow-lg">
            <Icone3D nome={c.icone} tamanho={40} />
            <h3 className="mt-2 font-titulo font-bold">{c.titulo}</h3>
            <p className="mt-1 text-sm text-tinta-clara">{c.texto}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
