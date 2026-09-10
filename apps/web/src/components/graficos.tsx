"use client";

import { useId, useState } from "react";

/**
 * Gráficos do painel.
 *
 * Escolhas que seguem a validação de paleta, não gosto:
 *
 *  - A paleta categórica é de 3 slots — índigo #4F46E5, laranja #F97316 e
 *    verde #10B981 — validada no claro (pior par adjacente ΔE 11.5 sob
 *    deuteranopia, 28.4 em visão normal). A plataforma é light-only, então
 *    não há passo escuro declarado.
 *  - Laranja e verde ficam abaixo de 3:1 contra o fundo. Isso obriga
 *    "alívio": todo gráfico aqui traz rótulo direto e uma tabela
 *    equivalente, de modo que nenhum valor dependa só da cor.
 *  - Série única não leva legenda: o título já diz o que está plotado.
 *  - Barras de categoria nominal usam um único hue. Colorir barra por
 *    valor gastaria o canal de identidade repetindo o que o tamanho da
 *    barra já mostra.
 */

const SLOT_1 = "#4F46E5";
const GRID = "#E2E8F0";
const TEXTO = "#475569";

export type Ponto = { rotulo: string; valor: number; chave?: string };

function formatarNumero(v: number): string {
  return v.toLocaleString("pt-BR");
}

/** Tabela equivalente — o par acessível de todo gráfico. */
function TabelaEquivalente({
  dados,
  rotuloValor,
  formatar,
}: {
  dados: Ponto[];
  rotuloValor: string;
  formatar: (v: number) => string;
}) {
  return (
    <div className="mt-3 max-h-64 overflow-auto rounded-md border border-borda">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-fundo">
          <tr className="text-cinza">
            <th className="px-3 py-2 font-titulo">Período</th>
            <th className="px-3 py-2 text-right font-titulo">{rotuloValor}</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.chave ?? d.rotulo} className="border-t border-borda">
              <td className="px-3 py-1.5">{d.rotulo}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">
                {formatar(d.valor)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Moldura({
  titulo,
  descricao,
  vazio,
  children,
  tabela,
}: {
  titulo: string;
  descricao?: string;
  vazio: boolean;
  children: React.ReactNode;
  tabela: React.ReactNode;
}) {
  const [verTabela, setVerTabela] = useState(false);

  return (
    <figure className="card m-0">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <figcaption className="font-titulo text-lg font-bold">{titulo}</figcaption>
          {descricao && <p className="mt-1 text-sm text-cinza">{descricao}</p>}
        </div>
        {!vazio && (
          <button
            onClick={() => setVerTabela((v) => !v)}
            className="btn-fantasma text-sm nao-imprimir"
            aria-pressed={verTabela}
          >
            {verTabela ? "Ver gráfico" : "Ver tabela"}
          </button>
        )}
      </div>

      {vazio ? (
        <p className="py-10 text-center text-cinza">
          Sem dados no período escolhido.
        </p>
      ) : verTabela ? (
        tabela
      ) : (
        children
      )}
    </figure>
  );
}

/* ============================================================
   LINHA — evolução no tempo (série única)
   ============================================================ */

export function GraficoLinha({
  titulo,
  descricao,
  dados,
  formatar = formatarNumero,
  rotuloValor = "Valor",
}: {
  titulo: string;
  descricao?: string;
  dados: Ponto[];
  formatar?: (v: number) => string;
  rotuloValor?: string;
}) {
  const idClip = useId().replace(/:/g, "");
  const [ativo, setAtivo] = useState<number | null>(null);

  const vazio = dados.length === 0 || dados.every((d) => d.valor === 0);

  // Geometria: viewBox fixo, largura fluida. A altura inclui a faixa do
  // eixo X, senão o card ganha um scroll interno só para os rótulos.
  const L = 44;
  const R = 12;
  const T = 12;
  const B = 28;
  const W = 720;
  const H = 240;
  const plotW = W - L - R;
  const plotH = H - T - B;

  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  // Teto "redondo", para os ticks caírem em números limpos.
  const passo = Math.pow(10, Math.floor(Math.log10(maximo)));
  const teto = Math.ceil(maximo / passo) * passo || 1;

  const x = (i: number) =>
    dados.length === 1 ? L + plotW / 2 : L + (i * plotW) / (dados.length - 1);
  const y = (v: number) => T + plotH - (v / teto) * plotH;

  const linha = dados.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.valor)}`).join(" ");
  const area = `${linha} L${x(dados.length - 1)},${T + plotH} L${x(0)},${T + plotH} Z`;

  const ticks = [0, teto / 2, teto];
  // Com muitos pontos, rotular todos vira ruído: mostramos ~6.
  const cadaQuantos = Math.max(1, Math.ceil(dados.length / 6));

  const extremo = dados.reduce(
    (melhor, d, i) => (d.valor > dados[melhor]!.valor ? i : melhor),
    0,
  );

  return (
    <Moldura
      titulo={titulo}
      descricao={descricao}
      vazio={vazio}
      tabela={
        <TabelaEquivalente dados={dados} rotuloValor={rotuloValor} formatar={formatar} />
      }
    >
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: "auto" }}
          role="img"
          aria-label={`${titulo}. ${dados.length} pontos. Máximo ${formatar(maximo)}.`}
        >
          <defs>
            <linearGradient id={`g${idClip}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SLOT_1} stopOpacity="0.16" />
              <stop offset="100%" stopColor={SLOT_1} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grade: hairline sólida, um passo fora do fundo, recessiva. */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={L}
                y1={y(t)}
                x2={W - R}
                y2={y(t)}
                stroke={GRID}
                strokeWidth="1"
              />
              <text
                x={L - 8}
                y={y(t) + 4}
                textAnchor="end"
                fontSize="11"
                fill={TEXTO}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatar(Math.round(t))}
              </text>
            </g>
          ))}

          <path d={area} fill={`url(#g${idClip})`} />
          <path
            d={linha}
            fill="none"
            stroke={SLOT_1}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Rótulo direto no extremo — o alívio exigido pelo contraste. */}
          {dados.length > 1 && (
            <text
              x={x(extremo)}
              y={y(dados[extremo]!.valor) - 10}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={TEXTO}
            >
              {formatar(dados[extremo]!.valor)}
            </text>
          )}

          {dados.map((d, i) => (
            <g key={d.chave ?? d.rotulo}>
              {i % cadaQuantos === 0 && (
                <text
                  x={x(i)}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fill={TEXTO}
                >
                  {d.rotulo}
                </text>
              )}

              {ativo === i && (
                <>
                  <line
                    x1={x(i)}
                    y1={T}
                    x2={x(i)}
                    y2={T + plotH}
                    stroke={SLOT_1}
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  {/* Anel na cor do fundo, para o ponto sobreviver à linha. */}
                  <circle cx={x(i)} cy={y(d.valor)} r="6" fill="#FCFCFE" />
                  <circle cx={x(i)} cy={y(d.valor)} r="4" fill={SLOT_1} />
                </>
              )}

              {/* Alvo de toque largo: ninguém acerta uma linha de 2px. */}
              <rect
                x={x(i) - plotW / Math.max(1, dados.length) / 2}
                y={T}
                width={Math.max(24, plotW / Math.max(1, dados.length))}
                height={plotH}
                fill="transparent"
                onPointerEnter={() => setAtivo(i)}
                onPointerLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(i)}
                onBlur={() => setAtivo(null)}
                tabIndex={0}
                role="button"
                aria-label={`${d.rotulo}: ${formatar(d.valor)}`}
              />
            </g>
          ))}
        </svg>

        {ativo !== null && dados[ativo] && (
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-md border border-borda bg-superficie px-3 py-2 shadow-md">
            <p className="font-titulo text-base font-bold text-tinta">
              {formatar(dados[ativo]!.valor)}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-cinza">
              <span
                className="inline-block h-0.5 w-3 rounded-full"
                style={{ background: SLOT_1 }}
              />
              {dados[ativo]!.rotulo}
            </p>
          </div>
        )}
      </div>
    </Moldura>
  );
}

/* ============================================================
   BARRAS — comparação entre categorias
   ============================================================ */

export function GraficoBarras({
  titulo,
  descricao,
  dados,
  formatar = formatarNumero,
  rotuloValor = "Alunos",
}: {
  titulo: string;
  descricao?: string;
  dados: Ponto[];
  formatar?: (v: number) => string;
  rotuloValor?: string;
}) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const vazio = dados.length === 0 || dados.every((d) => d.valor === 0);
  const maximo = Math.max(1, ...dados.map((d) => d.valor));

  return (
    <Moldura
      titulo={titulo}
      descricao={descricao}
      vazio={vazio}
      tabela={
        <TabelaEquivalente dados={dados} rotuloValor={rotuloValor} formatar={formatar} />
      }
    >
      {/* Barras horizontais: os rótulos das faixas são longos. */}
      <ul className="space-y-2.5">
        {dados.map((d, i) => (
          <li
            key={d.chave ?? d.rotulo}
            className="flex items-center gap-3"
            onPointerEnter={() => setAtivo(i)}
            onPointerLeave={() => setAtivo(null)}
          >
            <span className="w-28 shrink-0 text-sm text-tinta-clara">{d.rotulo}</span>

            <div className="relative h-6 flex-1">
              <div
                className="h-full rounded-r-md transition-all"
                style={{
                  width: `${Math.max(d.valor > 0 ? 1.5 : 0, (d.valor / maximo) * 100)}%`,
                  // Um hue só: a categoria é nominal-ordenada, e o
                  // comprimento já carrega a magnitude.
                  background: SLOT_1,
                  opacity: ativo === null || ativo === i ? 1 : 0.55,
                }}
              />
            </div>

            {/* Valor sempre visível ao lado da barra, nunca dentro dela:
                dentro, um número não caberia nas barras curtas. */}
            <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums text-tinta">
              {formatar(d.valor)}
            </span>
          </li>
        ))}
      </ul>
    </Moldura>
  );
}

/* ============================================================
   FIGURAS — os números que não são gráfico
   ============================================================ */

export function StatTile({
  rotulo,
  valor,
  detalhe,
  destaque = false,
  alerta = false,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
  alerta?: boolean;
}) {
  return (
    <div
      className={`card ${
        destaque ? "border-t-4 border-indigo" : alerta ? "border-t-4 border-vermelho" : ""
      }`}
    >
      <p className="font-titulo text-sm font-bold text-cinza">{rotulo}</p>
      {/* Figuras proporcionais: tabular deixa número grande frouxo. */}
      <p
        className={`mt-1.5 font-titulo text-3xl font-extrabold ${
          alerta ? "text-vermelho-dark" : "text-tinta"
        }`}
      >
        {valor}
      </p>
      {detalhe && <p className="mt-1 text-sm text-tinta-clara">{detalhe}</p>}
    </div>
  );
}

/** Medidor de proporção contra um limite. Trilha = passo claro do mesmo hue. */
export function Medidor({
  rotulo,
  pct,
  detalhe,
}: {
  rotulo: string;
  pct: number;
  detalhe?: string;
}) {
  const limitado = Math.max(0, Math.min(100, pct));
  return (
    <div className="card">
      <p className="font-titulo text-sm font-bold text-cinza">{rotulo}</p>
      <p className="mt-1.5 font-titulo text-3xl font-extrabold text-tinta">
        {limitado.toFixed(1).replace(".", ",")}%
      </p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-soft"
        role="meter"
        aria-valuenow={Math.round(limitado)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={rotulo}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${limitado}%`, background: SLOT_1 }}
        />
      </div>
      {detalhe && <p className="mt-2 text-sm text-tinta-clara">{detalhe}</p>}
    </div>
  );
}
