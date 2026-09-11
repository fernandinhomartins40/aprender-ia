/**
 * Ícones planos da landing.
 *
 * São formas SÓLIDAS (`fill`), não contornos: o desenho da página pede
 * silhuetas cheias e coloridas, e um traço fino sumiria dentro do
 * quadrado. É por isso que cada caminho aqui descreve a área da figura,
 * e não a linha ao redor dela.
 *
 * Estilo diferente dos ícones 3D autorais, que seguem servindo o resto da
 * aplicação. São SVG inline: pesam quase nada e herdam a cor de cada item.
 *
 * Decorativos por natureza: o rótulo ao lado carrega o significado, e
 * repeti-lo faria o leitor de tela dizer tudo duas vezes.
 */

const FORMAS: Record<string, React.ReactNode> = {
  // ---- Selos do hero ----
  check: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 7.2-6.1 6.1a1 1 0 0 1-1.42 0L7 12.8a1 1 0 1 1 1.42-1.42l1.77 1.78 5.4-5.39A1 1 0 0 1 17 9.2Z" />
  ),
  pessoas: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M9 13c-3.9 0-7 2-7 4.5V21h14v-3.5C16 15 12.9 13 9 13Z" />
      <circle cx="17.5" cy="8.5" r="3" />
      <path d="M17.5 13.5c-1 0-1.9.14-2.7.4 1.9 1 3.2 2.5 3.2 4.1V21h6v-2.8c0-2.1-2.9-4.7-6.5-4.7Z" />
    </>
  ),
  infinito: (
    <path d="M6.6 7.2a4.8 4.8 0 0 0 0 9.6c2.5 0 4-1.9 5-3.7l.4-.7.4.7c1 1.8 2.5 3.7 5 3.7a4.8 4.8 0 0 0 0-9.6c-2.5 0-4 1.9-5 3.7l-.4.7-.4-.7c-1-1.8-2.5-3.7-5-3.7Zm0 2.4c1.2 0 2 1 2.9 2.4-.9 1.4-1.7 2.4-2.9 2.4a2.4 2.4 0 1 1 0-4.8Zm10.8 0a2.4 2.4 0 1 1 0 4.8c-1.2 0-2-1-2.9-2.4.9-1.4 1.7-2.4 2.9-2.4Z" />
  ),

  // ---- Pilares da faixa escura ----
  capelo: (
    <>
      <path d="M12 3 1.5 8 12 13l10.5-5L12 3Z" />
      <path d="M5 11.4v3.9c0 1.9 3.1 3.4 7 3.4s7-1.5 7-3.4v-3.9l-7 3.3-7-3.3Z" />
      <path d="M21.2 9.6v5.1a1 1 0 0 0 2 0V9.6l-2 .9Z" />
    </>
  ),
  engrenagem: (
    <path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm9.3 5.1.9-.7a.9.9 0 0 0 .2-1.1l-1.6-2.8a.9.9 0 0 0-1-.4l-2 .6a7.5 7.5 0 0 0-1.7-1l-.4-2a.9.9 0 0 0-.9-.7h-3.2a.9.9 0 0 0-.9.7l-.4 2c-.6.3-1.2.6-1.7 1l-2-.6a.9.9 0 0 0-1 .4L3 11.7a.9.9 0 0 0 .2 1.1l1.5 1.3a7.7 7.7 0 0 0 0 2l-1.5 1.3a.9.9 0 0 0-.2 1.1l1.6 2.8c.2.4.6.5 1 .4l2-.6c.5.4 1.1.7 1.7 1l.4 2c.1.4.5.7.9.7h3.2c.4 0 .8-.3.9-.7l.4-2c.6-.3 1.2-.6 1.7-1l2 .6c.4.1.8 0 1-.4l1.6-2.8a.9.9 0 0 0-.2-1.1l-1.5-1.3a7.7 7.7 0 0 0 0-2l.6-.6Z" />
  ),
  documento: (
    <>
      <path d="M14 2H6.5A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22h11a2.5 2.5 0 0 0 2.5-2.5V8h-4.5A1.5 1.5 0 0 1 14 6.5V2Zm-5 9h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2Zm0 4h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2Z" />
      <path d="M15.5 2.3V6h3.7l-3.7-3.7Z" />
    </>
  ),

  // ---- Trilhas ----
  livro: (
    <path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20V2H6.5Zm0 16H18v2H6.5a.5.5 0 0 1 0-1v-1Z" />
  ),
  foguete: (
    <>
      <path d="M13.6 3.2C15.9 4 18.4 6.6 19.2 9c1.4-3.3 1.6-6.1 1.5-7.4-1.3-.1-4.1.1-7.1 1.6Z" />
      <path d="M11.4 4.5a13.6 13.6 0 0 0-2.2 2.9l-3.6.6a1 1 0 0 0-.6.3l-2.7 2.8a.6.6 0 0 0 .3 1l3 .8c-.2.7-.3 1.4-.4 2.1l3.8 3.8c.7-.1 1.4-.2 2.1-.4l.8 3a.6.6 0 0 0 1 .3l2.8-2.7c.2-.2.3-.4.3-.6l.6-3.6a13.6 13.6 0 0 0 2.9-2.2C17.8 8.4 15.1 5.7 11.4 4.5Zm2.4 6.8a1.8 1.8 0 1 1 2.5-2.5 1.8 1.8 0 0 1-2.5 2.5Z" />
      <path d="M4 17c-1.3 1.1-1.7 4.4-1.7 4.4s3.3-.4 4.4-1.7c.6-.8.6-1.9-.1-2.6a1.9 1.9 0 0 0-2.6-.1Z" />
    </>
  ),
  lapis: (
    <>
      <path d="M17.3 2.7a2.4 2.4 0 0 1 3.4 0l.6.6a2.4 2.4 0 0 1 0 3.4l-1.4 1.4-4-4 1.4-1.4Z" />
      <path d="M14.5 5.5 3.9 16.1c-.2.2-.3.4-.4.6L2 21.3a.6.6 0 0 0 .7.7l4.6-1.5c.2 0 .4-.2.6-.4L18.5 9.5l-4-4Z" />
    </>
  ),
  maleta: (
    <>
      <path d="M9 3a2 2 0 0 0-2 2v1.5h2V5h6v1.5h2V5a2 2 0 0 0-2-2H9Z" />
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v3.1c-2.6 1-5.8 1.6-9 1.6s-6.4-.6-9-1.6V8.5Z" />
      <path d="M3 13.9V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5.1c-2.6.9-5.8 1.4-9 1.4s-6.4-.5-9-1.4Z" />
    </>
  ),
  lampada: (
    <>
      <path d="M12 2a7 7 0 0 0-4.1 12.7c.5.4.9 1 1 1.6l.1.7h6l.1-.7c.1-.6.5-1.2 1-1.6A7 7 0 0 0 12 2Z" />
      <path d="M9 18.5h6a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2Zm1.2 3h3.6a1.8 1.8 0 0 1-3.6 0Z" />
    </>
  ),

  // ---- Números ----
  coracao: (
    <path d="M12 21s-8.5-5-8.5-10.5A4.9 4.9 0 0 1 12 6.8a4.9 4.9 0 0 1 8.5 3.7C20.5 16 12 21 12 21Z" />
  ),
  estrela: (
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1L12 2Z" />
  ),
};

export type NomeIconePlano = keyof typeof FORMAS;

/** Só a forma, sem moldura — para os selos, que usam círculo. */
export function TracoIcone({ nome, tamanho = 20 }: { nome: string; tamanho?: number }) {
  const forma = FORMAS[nome];
  if (!forma) return null;

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {forma}
    </svg>
  );
}

/**
 * O ícone dentro do quadrado colorido, como no desenho da página.
 *
 * `preenchido` usa a cor cheia com a figura branca; sem ele o quadrado
 * fica na versão suave, com a figura na própria cor.
 */
export function IconePlano({
  nome,
  cor,
  tamanho = 44,
  preenchido = true,
  className = "",
}: {
  nome: string;
  cor: string;
  tamanho?: number;
  preenchido?: boolean;
  className?: string;
}) {
  if (!FORMAS[nome]) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[30%] ${className}`}
      style={{
        width: tamanho,
        height: tamanho,
        // 1F ≈ 12% de opacidade: fundo suave o bastante para não competir
        // com o cartão branco, e forte o bastante para dar forma ao ícone.
        background: preenchido ? cor : `${cor}1F`,
        color: preenchido ? "#FFFFFF" : cor,
      }}
    >
      <TracoIcone nome={nome} tamanho={Math.round(tamanho * 0.56)} />
    </span>
  );
}

/** Selo do hero: figura colorida dentro de um círculo suave. */
export function SeloIcone({ nome, cor }: { nome: string; cor: string }) {
  if (!FORMAS[nome]) return null;

  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${cor}1F`, color: cor }}
    >
      <TracoIcone nome={nome} tamanho={19} />
    </span>
  );
}
