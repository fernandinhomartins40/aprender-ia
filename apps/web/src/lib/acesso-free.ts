/**
 * Prazo do acesso gratuito — cálculo puro.
 *
 * Vive em `lib/` porque tanto o servidor (para decidir o acesso) quanto o
 * cliente (para desenhar o aviso) precisam da mesma conta. Nada aqui
 * toca no banco.
 */

export type SituacaoFree = {
  /// Sem prazo definido: contas anteriores à regra, ou acesso permanente.
  permanente: boolean;
  expirado: boolean;
  revogado: boolean;
  /// Negativo quando já passou. Nulo se permanente.
  diasRestantes: number | null;
  /// Verdadeiro na janela de aviso configurada.
  avisar: boolean;
};

const DIA_MS = 86_400_000;

/** Dias inteiros entre hoje e a data (negativo = já passou). */
export function diasAte(data: Date): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(data);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / DIA_MS);
}

export function avaliarFree(
  conta: { freeAte: Date | null; freeRevogadoEm: Date | null },
  avisarDiasAntes = 7,
): SituacaoFree {
  if (conta.freeRevogadoEm) {
    return {
      permanente: false,
      expirado: true,
      revogado: true,
      diasRestantes: 0,
      avisar: false,
    };
  }

  if (!conta.freeAte) {
    return {
      permanente: true,
      expirado: false,
      revogado: false,
      diasRestantes: null,
      avisar: false,
    };
  }

  const dias = diasAte(conta.freeAte);
  return {
    permanente: false,
    // O prazo vale até o fim do dia marcado: expira quando dias < 0.
    expirado: dias < 0,
    revogado: false,
    diasRestantes: dias,
    avisar: dias >= 0 && dias <= avisarDiasAntes,
  };
}

/** "3 dias", "hoje", "amanhã" — para o aviso na tela. */
export function textoPrazo(diasRestantes: number): string {
  if (diasRestantes < 0) return "expirado";
  if (diasRestantes === 0) return "hoje";
  if (diasRestantes === 1) return "amanhã";
  return `em ${diasRestantes} dias`;
}

/** Soma dias a partir de hoje, no fim do dia. */
export function prazoEmDias(dias: number): Date | null {
  // 0 = sem prazo. É como o administrador desliga a expiração.
  if (!dias || dias <= 0) return null;
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(23, 59, 59, 999);
  return d;
}
