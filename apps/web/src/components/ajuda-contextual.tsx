"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

/**
 * O ícone ⓘ que explica um termo onde ele aparece.
 *
 * Três decisões que valem registro:
 *
 * 1. No desktop é popover ancorado ao termo; no celular vira folha
 *    inferior. Um popover de 320px ao lado de uma palavra numa tela de
 *    390px sai pela borda ou cobre justamente o texto que a pessoa
 *    estava lendo.
 *
 * 2. O painel é posicionado `absolute` dentro de um `span` de largura
 *    zero: abrir e fechar não empurra nada na página.
 *
 * 3. "Por que isso aparece aqui?" vem de `importancias[contexto]`. Sem
 *    contexto correspondente o bloco não aparece: frase genérica de
 *    preenchimento é pior que silêncio.
 *
 * Acessibilidade: o botão tem nome próprio ("Entender: BNCC"), o painel é
 * `role="dialog"` com `aria-labelledby`, Esc fecha e o foco volta ao
 * gatilho.
 *
 * Só elementos em linha por dentro: o ícone costuma ficar dentro de
 * `<h1>`, `<p>` e `<label>`, e um `<div>` ali seria HTML inválido.
 */

export type ItemAjuda = {
  slug: string;
  termo: string;
  resumo: string;
  explicacao: string;
  importancias: Record<string, string> | null;
  fonteNome: string | null;
  fonteUrl: string | null;
  saibaMaisUrl: string | null;
};

export function AjudaContextual({
  item,
  contexto,
  rotulo,
}: {
  item: ItemAjuda;
  /** Tela onde o ícone está: escolhe qual "por que importa" mostrar. */
  contexto?: string;
  /** Sobrescreve o nome no rótulo acessível, quando o termo visível difere. */
  rotulo?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLSpanElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const tituloId = useId();

  // Clique fora e Esc fecham. Registrados só enquanto aberto: há telas
  // com vários ícones, e um listener global por ícone seria desperdício.
  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(e: MouseEvent) {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        gatilho.current?.focus();
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const porque = contexto ? item.importancias?.[contexto] : undefined;
  const interno = Boolean(item.saibaMaisUrl?.startsWith("/"));

  function fechar() {
    setAberto(false);
    gatilho.current?.focus();
  }

  return (
    <span ref={raiz} className="relative inline-flex align-middle">
      <button
        ref={gatilho}
        type="button"
        onClick={() => setAberto((x) => !x)}
        aria-expanded={aberto}
        aria-label={`Entender: ${rotulo ?? item.termo}`}
        className={`ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold leading-none transition-colors ${
          aberto
            ? "border-indigo bg-indigo text-white"
            : "border-indigo/50 text-indigo hover:border-indigo hover:bg-indigo-soft"
        }`}
      >
        i
      </button>

      {aberto && (
        <>
          {/* Véu só no celular: a folha inferior precisa separar-se da
              página; no desktop o clique-fora já resolve. */}
          <span
            aria-hidden
            onClick={() => setAberto(false)}
            className="fixed inset-0 z-40 bg-tinta/40 md:hidden"
          />

          <span
            role="dialog"
            aria-labelledby={tituloId}
            className="fixed inset-x-0 bottom-0 z-50 block max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-borda bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-left font-normal normal-case shadow-2xl md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-7 md:max-h-none md:w-80 md:rounded-xl md:border md:p-4 md:pb-4 md:shadow-xl"
          >
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-borda md:hidden" />

            <span className="flex items-start justify-between gap-3">
              <b id={tituloId} className="block font-titulo text-base font-extrabold text-tinta">
                {item.termo}
              </b>
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar explicação"
                className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-cinza hover:bg-fundo hover:text-tinta"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </span>

            <span className="mt-1.5 block text-sm leading-relaxed text-tinta">
              {item.resumo}
            </span>

            {porque && (
              <>
                <b className="mt-3.5 block font-titulo text-sm font-bold text-tinta">
                  Por que isso aparece aqui?
                </b>
                <span className="mt-1 block text-sm leading-relaxed text-tinta-clara">
                  {porque}
                </span>
              </>
            )}

            {/* A distinção que o professor precisa ver: com fonte, é
                documento oficial; sem fonte, é explicação nossa. */}
            <span className="mt-4 block border-t border-borda pt-3 text-xs leading-relaxed text-cinza">
              {item.fonteNome ? (
                <>
                  <b className="font-bold text-tinta-clara">Informação oficial · </b>
                  {item.fonteUrl ? (
                    <a
                      href={item.fonteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo underline"
                    >
                      {item.fonteNome}
                    </a>
                  ) : (
                    item.fonteNome
                  )}
                </>
              ) : (
                "Explicação didática da plataforma — não é texto normativo."
              )}
            </span>

            <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {item.saibaMaisUrl && interno ? (
                <Link
                  href={item.saibaMaisUrl}
                  onClick={() => setAberto(false)}
                  className="text-sm font-bold text-indigo underline"
                >
                  Saiba mais →
                </Link>
              ) : item.saibaMaisUrl ? (
                <a
                  href={item.saibaMaisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-indigo underline"
                >
                  Saiba mais →
                </a>
              ) : null}

              <Link
                href={`/app/conhecimento?termo=${item.slug}`}
                onClick={() => setAberto(false)}
                className="text-sm font-semibold text-tinta-clara underline"
              >
                Ver na Central
              </Link>
            </span>
          </span>
        </>
      )}
    </span>
  );
}
