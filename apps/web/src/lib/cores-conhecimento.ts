/**
 * Cor de cada categoria da Central de Conhecimento.
 *
 * As categorias existiam só como texto, e todos os cards eram brancos: num
 * acervo de 50 verbetes, a lista virava um paredão uniforme em que nada se
 * distinguia de nada. A cor é o que permite localizar um assunto pelo canto
 * do olho, antes de ler.
 *
 * As classes são escritas por extenso, e não montadas por interpolação
 * (`bg-${x}-soft`), porque o Tailwind varre o código-fonte em tempo de build:
 * uma classe montada em runtime não existe no CSS final e o card sai sem cor
 * nenhuma.
 *
 * As cores vêm do preset da marca — nenhum valor solto. As nove categorias
 * de `CATEGORIAS_CONHECIMENTO` estão todas cobertas; uma categoria nova cai
 * no padrão índigo em vez de ficar sem estilo.
 */

export type EstiloCategoria = {
  /** Fundo do card em repouso. */
  fundo: string;
  /** Borda do card. */
  borda: string;
  /** Texto do rótulo da categoria. */
  texto: string;
  /** Faixa lateral que dá a identidade visual imediata. */
  faixa: string;
  /** Ícone da biblioteca autoral que acompanha a categoria. */
  icone: string;
};

const PADRAO: EstiloCategoria = {
  fundo: "bg-indigo-soft/40",
  borda: "border-indigo-line",
  texto: "text-indigo",
  faixa: "bg-indigo",
  icone: "documentos",
};

const POR_CATEGORIA: Record<string, EstiloCategoria> = {
  "Documento educacional": {
    fundo: "bg-indigo-soft/40",
    borda: "border-indigo-line",
    texto: "text-indigo",
    faixa: "bg-indigo",
    icone: "documentos",
  },
  BNCC: {
    fundo: "bg-enc-1-soft",
    borda: "border-enc-1/30",
    texto: "text-enc-1",
    faixa: "bg-enc-1",
    icone: "aulas",
  },
  Planejamento: {
    fundo: "bg-enc-2-soft",
    borda: "border-enc-2/30",
    texto: "text-enc-2",
    faixa: "bg-enc-2",
    icone: "metas",
  },
  "Avaliação": {
    fundo: "bg-verde-soft",
    borda: "border-verde/30",
    texto: "text-verde-dark",
    faixa: "bg-verde",
    icone: "feedback",
  },
  "Inclusão": {
    fundo: "bg-enc-4-soft",
    borda: "border-enc-4/40",
    texto: "text-laranja-dark",
    faixa: "bg-enc-4",
    icone: "conquistas",
  },
  Metodologias: {
    fundo: "bg-laranja-soft",
    borda: "border-laranja/30",
    texto: "text-laranja-dark",
    faixa: "bg-laranja",
    icone: "desafios",
  },
  "Uso de IA": {
    fundo: "bg-azul-soft",
    borda: "border-azul/30",
    texto: "text-azul",
    faixa: "bg-azul",
    icone: "prompt",
  },
  "Segurança": {
    fundo: "bg-vermelho-soft",
    borda: "border-vermelho/30",
    texto: "text-vermelho-dark",
    faixa: "bg-vermelho",
    icone: "certificados",
  },
  "A plataforma": {
    fundo: "bg-amarelo-soft",
    borda: "border-amarelo/40",
    texto: "text-amarelo-dark",
    faixa: "bg-amarelo",
    icone: "recompensas",
  },
};

export function estiloCategoria(categoria: string): EstiloCategoria {
  return POR_CATEGORIA[categoria] ?? PADRAO;
}

/**
 * Lista completa das classes usadas acima.
 *
 * Existe só para o Tailwind: o varredor precisa encontrar cada classe no
 * código-fonte para incluí-la no CSS. Como as classes aqui vivem dentro de um
 * objeto e são aplicadas por variável, esta constante garante que nenhuma
 * fique de fora do build — que é como um card acabaria sem cor em produção
 * sem nenhum erro aparecer.
 */
export const CLASSES_CONHECIMENTO = [
  "bg-indigo-soft/40", "border-indigo-line", "text-indigo", "bg-indigo",
  "bg-enc-1-soft", "border-enc-1/30", "text-enc-1", "bg-enc-1",
  "bg-enc-2-soft", "border-enc-2/30", "text-enc-2", "bg-enc-2",
  "bg-verde-soft", "border-verde/30", "text-verde-dark", "bg-verde",
  "bg-enc-4-soft", "border-enc-4/40", "bg-enc-4",
  "bg-laranja-soft", "border-laranja/30", "text-laranja-dark", "bg-laranja",
  "bg-azul-soft", "border-azul/30", "text-azul", "bg-azul",
  "bg-vermelho-soft", "border-vermelho/30", "text-vermelho-dark", "bg-vermelho",
  "bg-amarelo-soft", "border-amarelo/40", "text-amarelo-dark", "bg-amarelo",
] as const;
