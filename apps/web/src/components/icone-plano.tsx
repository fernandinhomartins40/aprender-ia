/**
 * Ícones planos da landing.
 *
 * O desenho da página pede figura branca sobre quadrado colorido
 * arredondado — estilo diferente dos ícones 3D autorais, que continuam
 * servindo o resto da aplicação. São SVG inline: pesam quase nada e
 * acompanham a cor definida em cada item.
 *
 * Decorativos por natureza: o rótulo ao lado carrega o significado, e
 * repeti-lo faria o leitor de tela dizer tudo duas vezes.
 */

const TRACOS: Record<string, React.ReactNode> = {
  // ---- Selos do hero ----
  check: <path d="M20 6 9 17l-5-5" />,
  pessoas: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  infinito: (
    <path d="M18.2 8.4c-2 0-3.1 1.5-4.2 3.6-1.1 2.1-2.2 3.6-4.2 3.6a3.6 3.6 0 0 1 0-7.2c2 0 3.1 1.5 4.2 3.6 1.1 2.1 2.2 3.6 4.2 3.6a3.6 3.6 0 0 0 0-7.2Z" />
  ),

  // ---- Pilares da faixa escura ----
  capelo: (
    <>
      <path d="m22 10-10-5-10 5 10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </>
  ),
  engrenagem: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  documento: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </>
  ),

  // ---- Trilhas ----
  livro: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  foguete: (
    <>
      <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.9.7-2.2-.1-3a2.2 2.2 0 0 0-2.9 0Z" />
      <path d="M12 15 9 12a11 11 0 0 1 2-4.6C13.4 4.2 16.6 2.3 20.5 2c.3 3.9-1.6 7.1-5.4 9.5A11 11 0 0 1 12 15Z" />
      <path d="M9 12H5s.4-2.5 1.5-3.5C7.8 7.3 11 8 11 8M12 15v4s2.5-.4 3.5-1.5c1.2-1.3.5-4.5.5-4.5" />
    </>
  ),
  lapis: (
    <>
      <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </>
  ),
  maleta: (
    <>
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  lampada: (
    <>
      <path d="M9 18h6M10 22h4" />
      <path d="M15.1 14a5 5 0 1 0-6.2 0c.6.5 1.1 1.2 1.1 2h4c0-.8.5-1.5 1.1-2Z" />
    </>
  ),

  // ---- Números ----
  coracao: (
    <path d="M19 4.6a5 5 0 0 0-7 0l-.9.9-1-.9a5 5 0 0 0-7 7l1 1 7 7 7-7 1-1a5 5 0 0 0 0-7Z" />
  ),
  estrela: (
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1Z" />
  ),
};

export type NomeIconePlano = keyof typeof TRACOS;

/** Só o traço, sem moldura — para os selos, que usam círculo. */
export function TracoIcone({ nome, tamanho = 20 }: { nome: string; tamanho?: number }) {
  const traco = TRACOS[nome];
  if (!traco) return null;

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {traco}
    </svg>
  );
}

/**
 * O ícone dentro do quadrado colorido, como no desenho da página.
 *
 * `preenchido` usa a cor cheia (pilares e trilhas); sem ele o quadrado
 * fica na versão suave, com o traço na própria cor.
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
  if (!TRACOS[nome]) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{
        width: tamanho,
        height: tamanho,
        // 1A ≈ 10% de opacidade: fundo suave que mantém o traço legível.
        background: preenchido ? cor : `${cor}1A`,
        color: preenchido ? "#FFFFFF" : cor,
      }}
    >
      <TracoIcone nome={nome} tamanho={Math.round(tamanho * 0.52)} />
    </span>
  );
}

/** Selo do hero: traço colorido dentro de um círculo suave. */
export function SeloIcone({ nome, cor }: { nome: string; cor: string }) {
  if (!TRACOS[nome]) return null;

  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${cor}1F`, color: cor }}
    >
      <TracoIcone nome={nome} tamanho={19} />
    </span>
  );
}
