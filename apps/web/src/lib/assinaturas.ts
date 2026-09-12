import type { Periodicidade, StatusAssinatura } from "@aprender/db";

/**
 * Cálculos de ciclo e preço de assinatura.
 *
 * Puro e sem banco, para servir tanto ao servidor quanto às telas — e para
 * ser conferível de cabeça, que é o mínimo quando se trata de dinheiro e
 * prazo de acesso.
 */

export const MESES_POR_PERIODO: Record<Periodicidade, number> = {
  MENSAL: 1,
  TRIMESTRAL: 3,
  SEMESTRAL: 6,
  ANUAL: 12,
  // UNICA não tem ciclo: o prazo vem de `diasAcesso` do plano.
  UNICA: 0,
};

export const ROTULO_PERIODO: Record<Periodicidade, string> = {
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
  UNICA: "Pagamento único",
};

export const ROTULO_STATUS: Record<StatusAssinatura, string> = {
  ATIVA: "Ativa",
  PENDENTE: "Aguardando pagamento",
  INADIMPLENTE: "Inadimplente",
  SUSPENSA: "Suspensa",
  CANCELADA: "Cancelada",
  EXPIRADA: "Expirada",
};

/**
 * Este status, sozinho, permite acesso?
 *
 * Só o status — o prazo é avaliado à parte, em `lib/motor-acesso`. Serve
 * para a interface explicar um bloqueio sem reimplementar a regra.
 *
 * CANCELADA e INADIMPLENTE aparecem como `true` de propósito: quem pagou
 * o ciclo tem direito ao ciclo, mesmo tendo cancelado no dia seguinte.
 * Nesses casos é a data que encerra o acesso, não o status.
 */
export const STATUS_DA_ACESSO: Record<StatusAssinatura, boolean> = {
  ATIVA: true,
  INADIMPLENTE: true,
  CANCELADA: true,
  PENDENTE: false,
  SUSPENSA: false,
  EXPIRADA: false,
};

/**
 * Soma um período a uma data.
 *
 * Usa o dia do mês da data base, com o cuidado que o calendário exige: uma
 * assinatura feita em 31 de janeiro vence no último dia de fevereiro, não
 * em 3 de março. `setMonth` do JavaScript transborda sozinho, e transbordar
 * significa cobrar o aluno num mês em que ele não deveria ser cobrado.
 */
export function somarPeriodo(base: Date, periodicidade: Periodicidade, diasAcesso?: number | null): Date {
  const d = new Date(base);

  if (periodicidade === "UNICA") {
    d.setDate(d.getDate() + (diasAcesso && diasAcesso > 0 ? diasAcesso : 30));
    return d;
  }

  const meses = MESES_POR_PERIODO[periodicidade];
  const diaOriginal = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + meses);

  // Último dia do mês de destino.
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(diaOriginal, ultimoDia));
  return d;
}

/** Competência "2026-09", usada para não duplicar cobrança do mesmo mês. */
export function competenciaDe(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Preço por mês, para comparar planos de periodicidade diferente. */
export function porMes(precoCentavos: number, periodicidade: Periodicidade): number | null {
  const meses = MESES_POR_PERIODO[periodicidade];
  if (meses === 0) return null;
  return Math.round(precoCentavos / meses);
}

/**
 * Receita mensal recorrente (MRR).
 *
 * Só conta o que se repete: pagamento único não é receita recorrente, e
 * somá-lo aqui infla o indicador que serve exatamente para projetar o mês
 * seguinte. Assinatura cancelada ou expirada também sai da conta;
 * inadimplente permanece, porque o vínculo existe e pode ser quitado.
 */
export function receitaRecorrenteMensal(
  assinaturas: { precoCentavos: number; periodicidade: Periodicidade; status: StatusAssinatura }[],
): number {
  return assinaturas.reduce((soma, a) => {
    if (a.status === "CANCELADA" || a.status === "EXPIRADA") return soma;
    const mensal = porMes(a.precoCentavos, a.periodicidade);
    return soma + (mensal ?? 0);
  }, 0);
}

/** Dias entre hoje e a data (negativo = passou). Meia-noite local. */
export function diasAte(d: Date | null | undefined): number | null {
  if (!d) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(d);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

/** "vence hoje", "em 5 dias", "3 dias em atraso". */
export function textoVencimento(d: Date | null | undefined): string {
  const dias = diasAte(d);
  if (dias === null) return "sem data";
  if (dias === 0) return "vence hoje";
  if (dias < 0) return `${Math.abs(dias)} dia(s) em atraso`;
  return `em ${dias} dia(s)`;
}

/** Slug a partir do nome do plano, para o campo não ser digitado à mão. */
export function slugificar(texto: string): string {
  return texto
    // NFD separa a acentuação da letra; o range abaixo remove só as marcas.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
