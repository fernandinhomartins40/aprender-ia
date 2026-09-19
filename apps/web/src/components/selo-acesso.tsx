/**
 * Quanto custa usar esta ferramenta.
 *
 * O curso promete priorizar o que é gratuito. Uma promessa dessas só vale
 * se o preço estiver visível antes do clique — senão o cursista descobre
 * na tela de pagamento, depois de montar a aula em cima da ferramenta.
 *
 * As quatro faixas existem porque "grátis" quase nunca é sim ou não: o
 * ChatGPT é gratuito e limita imagens; o Gemini no Sheets depende do
 * plano do Workspace. Achatar isso em dois rótulos mentiria.
 */

export type FaixaAcesso =
  | "GRATUITO"
  | "GRATUITO_COM_LIMITES"
  | "PAGO"
  | "DEPENDE_DO_PLANO";

const FAIXAS: Record<FaixaAcesso, { rotulo: string; classe: string }> = {
  GRATUITO: {
    rotulo: "Gratuito",
    classe: "bg-verde-soft text-verde-dark border-verde",
  },
  GRATUITO_COM_LIMITES: {
    rotulo: "Gratuito com limites",
    classe: "bg-amarelo-soft text-amarelo-dark border-amarelo",
  },
  PAGO: {
    rotulo: "Pago",
    classe: "bg-vermelho-soft text-vermelho-dark border-vermelho",
  },
  DEPENDE_DO_PLANO: {
    rotulo: "Depende do plano",
    classe: "bg-indigo-soft text-indigo-dark border-indigo-line",
  },
};

export function SeloAcesso({
  faixa,
  limite,
  className = "",
}: {
  faixa: string;
  /** O limite concreto: "50 fontes por notebook", "1.000 operações/mês". */
  limite?: string | null;
  className?: string;
}) {
  const info = FAIXAS[faixa as FaixaAcesso] ?? FAIXAS.GRATUITO_COM_LIMITES;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <span
        className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${info.classe}`}
      >
        {info.rotulo}
      </span>
      {limite && <span className="text-xs text-tinta-clara">{limite}</span>}
    </span>
  );
}
