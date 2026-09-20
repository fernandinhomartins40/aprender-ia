import type { TipoLicao } from "@prisma/client";

/**
 * Os tipos do conteúdo do curso.
 *
 * Ficam num arquivo próprio porque `modulos.ts` e `modulos-novos.ts`
 * precisam dos dois: o primeiro monta a sequência final importando o
 * segundo, e o segundo precisa do tipo `Modulo`. Com os tipos aqui,
 * nenhum dos dois importa o outro só para isso.
 */

export type Licao = {
  titulo: string;
  tipo: TipoLicao;
  xp: number;
  /** Minutos de tela. A carga do curso soma isto e a prática aplicada. */
  tempo: number;
  /** O capítulo da apostila — vira o link "Aprofunde na apostila". */
  cap?: string;
  conteudo: Record<string, unknown>;
};

export type Modulo = {
  /** Recalculada pela posição na sequência final; ver `modulos.ts`. */
  ordem: number;
  titulo: string;
  subtitulo: string;
  cor: string;
  icone: string;
  licoes: Licao[];
};
