import { LICOES_EXTRAS, type LicaoExtra } from "./modulos-extras";
import { LICOES_EXTRAS_2 } from "./modulos-extras2";
import { LICOES_EXTRAS_3 } from "./modulos-extras3";
import { LICOES_IMAGENS } from "./modulo-imagens";

/**
 * Todas as lições complementares, reunidas.
 *
 * Elas vêm em três levas porque foram escritas em momentos diferentes —
 * a segunda e a terceira cobriram o que a auditoria contra o briefing
 * apontou como raso.
 * Quem consome (o seed e o gerador de roteiros) não precisa saber disso:
 * importa daqui e pronto.
 */
export const TODAS_EXTRAS: LicaoExtra[] = [
  ...LICOES_EXTRAS,
  ...LICOES_EXTRAS_2,
  ...LICOES_EXTRAS_3,
  ...LICOES_IMAGENS,
];

export type { LicaoExtra };
