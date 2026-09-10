/**
 * Datas e horários dos encontros.
 *
 * A hora é guardada como texto "HH:MM" e a data como DateTime à meia-noite.
 * Motivo: o container roda em UTC e a turma acontece no horário de
 * Brasília — juntar os dois num só DateTime faria "19:00" virar "16:00"
 * ou "22:00" na tela, dependendo de onde o código roda.
 */

const DIAS_SEMANA = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
] as const;

/** Date → "AAAA-MM-DD", para value de <input type="date">. */
export function paraInputDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const data = new Date(d);
  // Usa os componentes UTC: a data foi gravada à meia-noite UTC e
  // converter para local poderia recuar um dia.
  return [
    data.getUTCFullYear(),
    String(data.getUTCMonth() + 1).padStart(2, "0"),
    String(data.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

/** "AAAA-MM-DD" → Date à meia-noite UTC. */
export function deInputDate(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const d = new Date(`${valor}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → "12/03/2026". */
export function dataCurta(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "UTC",
  }).format(new Date(d));
}

/** Date → "quinta, 12 de março". */
export function dataLonga(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const data = new Date(d);
  const dia = DIAS_SEMANA[data.getUTCDay()] ?? "";
  const resto = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(data);
  return `${dia}, ${resto}`;
}

/** "19:00" + "22:00" → "19:00 às 22:00"; tolera faltar o fim. */
export function faixaHoraria(
  inicio: string | null | undefined,
  fim: string | null | undefined,
): string {
  if (!inicio && !fim) return "";
  if (inicio && fim) return `${inicio} às ${fim}`;
  return inicio ?? `até ${fim}`;
}

/** Aceita "19:00", "1900", "19h", "19" → "19:00". Devolve "" se não der. */
export function normalizarHora(bruto: string): string {
  const limpo = bruto.trim().replace(/h/gi, ":").replace(/[^\d:]/g, "");
  if (!limpo) return "";

  let horas: string;
  let minutos = "00";

  if (limpo.includes(":")) {
    const [h, m = ""] = limpo.split(":");
    horas = h ?? "";
    minutos = (m || "00").padEnd(2, "0").slice(0, 2);
  } else if (limpo.length <= 2) {
    horas = limpo;
  } else {
    horas = limpo.slice(0, limpo.length - 2);
    minutos = limpo.slice(-2);
  }

  const h = Number(horas);
  const m = Number(minutos);
  if (!Number.isFinite(h) || h < 0 || h > 23) return "";
  if (!Number.isFinite(m) || m < 0 || m > 59) return "";

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Gera as datas de uma recorrência semanal.
 *
 * Ex.: começando em 12/03 (quinta), 4 encontros, a cada 1 semana →
 * 12/03, 19/03, 26/03, 02/04. O dia da semana vem da própria data
 * inicial, então não há como pedir "toda quarta" e receber uma quinta.
 */
export function gerarDatasSemanais(
  primeira: Date,
  quantidade: number,
  intervaloSemanas = 1,
): Date[] {
  const total = Math.max(1, Math.min(quantidade, 60));
  const passo = Math.max(1, Math.min(intervaloSemanas, 8));

  return Array.from({ length: total }, (_, i) => {
    const d = new Date(primeira);
    d.setUTCDate(d.getUTCDate() + i * 7 * passo);
    return d;
  });
}

/** O próximo encontro que ainda não aconteceu. */
export function proximoEncontro<T extends { data: Date; canceladoEm: Date | null }>(
  encontros: T[],
): T | null {
  const agora = Date.now();
  const futuros = encontros
    .filter((e) => !e.canceladoEm && new Date(e.data).getTime() >= agora - 86_400_000)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  return futuros[0] ?? null;
}
