import Image from "next/image";
import Link from "next/link";

/**
 * Marca do Aprender IA.
 *
 * A logo é colorida e detalhada: em fundos claros ela se sustenta
 * sozinha, então não aplicamos filtro nem sombra que sujem o traço.
 */
export function Logo({
  href = "/",
  largura = 150,
  prioridade = false,
  className = "",
}: {
  href?: string | null;
  largura?: number;
  prioridade?: boolean;
  className?: string;
}) {
  const altura = Math.round((largura * 866) / 1671); // proporção original

  const img = (
    <Image
      src="/marca/logo-900.png"
      alt="Aprender IA"
      width={largura}
      height={altura}
      priority={prioridade}
      className={className}
    />
  );

  if (!href) return img;

  return (
    <Link href={href} aria-label="Aprender IA — página inicial" className="inline-flex">
      {img}
    </Link>
  );
}
