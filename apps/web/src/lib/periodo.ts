/**
 * Período do filtro do painel.
 *
 * Vive em `lib/` e não em `server/`: um módulo "use server" só pode
 * exportar funções async, e esta é um cálculo puro de datas que também
 * roda no cliente (para montar os links do filtro).
 */

export type Periodo = { desde: Date; ate: Date; rotulo: string; chave: string };

export const PRESETS = [
  { chave: "hoje", rotulo: "Hoje" },
  { chave: "7d", rotulo: "7 dias" },
  { chave: "30d", rotulo: "30 dias" },
  { chave: "mes", rotulo: "Este mês" },
  { chave: "90d", rotulo: "90 dias" },
  { chave: "12m", rotulo: "12 meses" },
] as const;

/** Resolve o preset. O padrão é 30 dias. */
export function periodoPreset(chave?: string): Periodo {
  const ate = new Date();
  const desde = new Date();

  switch (chave) {
    case "hoje":
      desde.setHours(0, 0, 0, 0);
      return { desde, ate, rotulo: "hoje", chave: "hoje" };
    case "7d":
      desde.setDate(desde.getDate() - 7);
      return { desde, ate, rotulo: "últimos 7 dias", chave: "7d" };
    case "mes":
      desde.setDate(1);
      desde.setHours(0, 0, 0, 0);
      return { desde, ate, rotulo: "este mês", chave: "mes" };
    case "90d":
      desde.setDate(desde.getDate() - 90);
      return { desde, ate, rotulo: "últimos 90 dias", chave: "90d" };
    case "12m":
      desde.setMonth(desde.getMonth() - 12);
      return { desde, ate, rotulo: "últimos 12 meses", chave: "12m" };
    case "30d":
    default:
      desde.setDate(desde.getDate() - 30);
      return { desde, ate, rotulo: "últimos 30 dias", chave: "30d" };
  }
}
