/**
 * O PDF da apostila, para quem quiser imprimir ou ler off-line.
 *
 * Fica como alternativa, e não como caminho principal: são 9 MB e 113 páginas
 * desenhadas para papel A4 — abrir isso no celular para achar o trecho da aula
 * era justamente o problema que a página resolve.
 */
export function BaixarApostila() {
  return (
    <a
      href="/curso/Apostila_IA_Educadores_2026.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-borda bg-white p-4 transition-colors hover:bg-indigo-soft"
    >
      <span aria-hidden className="text-2xl">
        📕
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-titulo text-sm font-bold text-tinta">
          Baixar a apostila em PDF
        </span>
        <span className="block text-xs text-cinza">
          Para imprimir ou ler sem internet · abre em nova aba
        </span>
      </span>
      <span className="shrink-0 font-titulo text-sm font-bold text-indigo">
        Baixar
      </span>
    </a>
  );
}
