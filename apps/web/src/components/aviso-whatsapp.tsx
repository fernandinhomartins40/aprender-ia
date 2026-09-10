"use client";

/**
 * Abre a conversa do WhatsApp com o texto da notificação pronto.
 *
 * É Client Component porque o link precisa ser montado com o texto
 * codificado e aberto em outra aba — e porque a plataforma não envia
 * WhatsApp sozinha: quem aperta "enviar" é você, no seu aparelho.
 */
export function AvisoWhatsApp({
  telefone,
  titulo,
  corpo,
}: {
  telefone: string | null;
  titulo: string;
  corpo: string;
}) {
  if (!telefone) return null;

  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length < 10) {
    return <span className="text-xs text-cinza">telefone inválido</span>;
  }

  const comPais = numeros.startsWith("55") ? numeros : `55${numeros}`;
  const texto = `*${titulo}*\n\n${corpo}`;
  const href = `https://wa.me/${comPais}?text=${encodeURIComponent(texto)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md bg-verde px-3 py-1.5 text-sm font-bold text-white hover:opacity-90"
    >
      Abrir WhatsApp
    </a>
  );
}
