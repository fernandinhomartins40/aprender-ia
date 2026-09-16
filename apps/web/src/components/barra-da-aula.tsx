"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * A navegação das páginas de aula, em tela cheia.
 *
 * Substitui o cabeçalho e a barra do aplicativo por três coisas, que é tudo o
 * que se precisa enquanto se estuda: onde estou, como avanço e como saio.
 *
 * - No alto, uma barra fina com o progresso e o botão de fechar. O X devolve
 *   o aplicativo — sem ele, a tela cheia viraria uma armadilha.
 * - Embaixo, Anterior e Próxima, grandes o bastante para o polegar e com o
 *   título da página ao lado, para saber para onde se vai antes de ir.
 *
 * As setas do teclado também andam, para quem lê no computador.
 */
export function BarraDaAula({
  encontro,
  tituloEncontro,
  ordem,
  total,
  anterior,
  proximo,
}: {
  encontro: number;
  tituloEncontro: string;
  ordem: number;
  total: number;
  anterior: { ordem: number; titulo: string } | null;
  proximo: { ordem: number; titulo: string } | null;
}) {
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const t = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" && proximo) {
        window.location.href = `/app/aula/${encontro}/${proximo.ordem}`;
      } else if (e.key === "ArrowLeft" && anterior) {
        window.location.href = `/app/aula/${encontro}/${anterior.ordem}`;
      } else if (e.key === "Escape") {
        setMenu((v) => !v);
      }
    };
    document.addEventListener("keydown", t);
    return () => document.removeEventListener("keydown", t);
  }, [encontro, anterior, proximo]);

  const pct = Math.round((ordem / total) * 100);

  return (
    <>
      {/* ---- barra do alto ---- */}
      <div className="sticky top-0 z-30 border-b border-borda bg-white/95 backdrop-blur">
        {/* O progresso do encontro: a régua que diz quanto falta. */}
        <div className="h-1 bg-indigo-soft">
          <div
            className="h-full bg-indigo transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span className="min-w-0">
              <span className="block truncate font-titulo text-[13px] font-bold text-tinta">
                {tituloEncontro}
              </span>
              <span className="block text-xs text-cinza">
                página {ordem} de {total}
              </span>
            </span>
            <span
              aria-hidden
              className={`shrink-0 text-cinza transition-transform ${menu ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {/* Fechar devolve o aplicativo. Sem esta saída, a tela cheia
              prenderia o aluno na aula. */}
          <Link
            href={`/app/aula/${encontro}`}
            aria-label="Fechar a aula e voltar ao aplicativo"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-borda text-lg leading-none text-tinta-clara transition-colors hover:bg-indigo-soft"
          >
            ×
          </Link>
        </div>

        {/* O índice, para pular direto a uma página sem sair da aula. */}
        {menu && (
          <div className="border-t border-borda bg-white">
            <div className="mx-auto max-w-3xl px-4 py-3">
              <Link
                href={`/app/aula/${encontro}`}
                className="block rounded-lg bg-indigo-soft px-3 py-2.5 font-titulo text-sm font-bold text-indigo-dark"
              >
                Ver todas as {total} páginas do {tituloEncontro}
              </Link>
              <Link
                href="/app"
                className="mt-2 block rounded-lg px-3 py-2.5 text-sm text-tinta-clara transition-colors hover:bg-indigo-soft"
              >
                Sair da aula e voltar ao início
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ---- navegação de baixo ----
          `fixed`, e não `sticky`: a barra não é filha do elemento que rola, e
          um `sticky bottom-0` nessa posição sobe junto com o conteúdo e sai da
          tela. Numa página longa, quem terminou de ler não deveria ter de
          rolar de volta ao fim para achar o botão de avançar. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-stretch gap-2 px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          {anterior ? (
            <Link
              href={`/app/aula/${encontro}/${anterior.ordem}`}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-borda px-3 py-2.5 transition-colors hover:bg-indigo-soft"
            >
              <span aria-hidden className="shrink-0 font-titulo text-lg text-indigo">
                ‹
              </span>
              <span className="min-w-0">
                <span className="block font-titulo text-[10px] font-bold uppercase tracking-wide text-cinza">
                  Anterior
                </span>
                <span className="block truncate font-titulo text-xs font-bold text-tinta">
                  {anterior.titulo}
                </span>
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}

          {proximo ? (
            <Link
              href={`/app/aula/${encontro}/${proximo.ordem}`}
              className="flex min-w-0 flex-1 items-center justify-end gap-2 rounded-xl bg-indigo px-3 py-2.5 text-white transition-colors hover:brightness-110"
            >
              <span className="min-w-0 text-right">
                <span className="block font-titulo text-[10px] font-bold uppercase tracking-wide text-white/70">
                  Próxima
                </span>
                <span className="block truncate font-titulo text-xs font-bold">
                  {proximo.titulo}
                </span>
              </span>
              <span aria-hidden className="shrink-0 font-titulo text-lg">
                ›
              </span>
            </Link>
          ) : (
            /* Fim do encontro: o caminho natural é voltar ao índice, não
               ficar num beco sem saída. */
            <Link
              href={`/app/aula/${encontro}`}
              className="flex flex-1 items-center justify-center rounded-xl bg-verde px-3 py-2.5 font-titulo text-sm font-bold text-white"
            >
              Concluir o encontro ✓
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
