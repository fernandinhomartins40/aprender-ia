/**
 * Esqueleto enquanto a página carrega.
 *
 * Todas as telas do painel são `force-dynamic` e consultam o banco. Sem
 * esta fronteira, clicar num item do menu deixava a página ANTERIOR na
 * tela até o servidor responder — parecia que o clique não funcionou.
 *
 * O desenho imita a estrutura comum (indicadores em cima, bloco grande
 * embaixo) para que a troca não desloque o layout.
 */
export default function Carregando() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>

      <div className="mb-6 h-8 w-56 rounded-lg bg-borda" />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-borda bg-white p-4">
            <div className="h-3 w-20 rounded bg-borda" />
            <div className="mt-3 h-6 w-24 rounded bg-borda" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-borda bg-white p-5">
        <div className="h-4 w-40 rounded bg-borda" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-fundo" />
          ))}
        </div>
      </div>
    </div>
  );
}
