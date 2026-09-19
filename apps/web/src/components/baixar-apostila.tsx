/**
 * O PDF da apostila, para quem quiser imprimir ou ler off-line.
 *
 * Fica como alternativa, e não como caminho principal: são páginas
 * desenhadas para papel A4 — abrir isso no celular para achar o trecho da aula
 * era justamente o problema que a página resolve.
 *
 * O arquivo vem por parâmetro porque cada curso tem a sua apostila, e o
 * PDF precisa ser o mesmo material que o aluno lê na tela. Um caminho
 * fixo aqui era o que faria o cursista de Empreendedores baixar a
 * apostila de Educadores.
 */
export function BaixarApostila({
  arquivo = "/curso/Apostila_IA_Educadores_2026.pdf",
}: {
  arquivo?: string;
} = {}) {
  return (
    <a
      href={arquivo}
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
