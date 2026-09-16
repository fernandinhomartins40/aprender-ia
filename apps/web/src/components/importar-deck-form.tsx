"use client";

import { useActionState } from "react";
import { importarDeck, type ResultadoImportacao } from "@/server/importar-deck";

/**
 * Envio do deck de slides pelo navegador.
 *
 * O script de importação não roda na VPS (a imagem Docker não traz o `tsx`),
 * então a alternativa que não depende de SSH é esta: o professor escolhe o
 * arquivo e a própria aplicação importa.
 */
export function ImportarDeckForm() {
  const [estado, acao, enviando] = useActionState<ResultadoImportacao | null, FormData>(
    importarDeck,
    null,
  );

  return (
    <form action={acao} className="rounded-xl border border-borda bg-white p-5">
      <p className="mb-1 font-titulo font-bold text-tinta">
        Importar os slides
      </p>
      <p className="mb-4 text-sm text-tinta-clara">
        Envie o arquivo <span className="font-mono text-xs">Slides_IA_Educadores_2026.html</span>.
        Reimportar substitui os passos, sem duplicar.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="deck"
          accept=".html,text/html"
          required
          className="max-w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-indigo-soft file:px-4 file:py-2 file:font-titulo file:text-sm file:font-bold file:text-indigo-dark"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-indigo px-6 py-2.5 font-titulo text-sm font-bold text-white disabled:opacity-50"
        >
          {enviando ? "Importando..." : "Importar"}
        </button>
      </div>

      {estado && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            estado.ok
              ? "bg-verde-soft text-verde-dark"
              : "bg-vermelho-sf text-vermelho-dk"
          }`}
        >
          <p className="font-bold">{estado.mensagem}</p>
          {estado.detalhes?.map((d) => (
            <p key={d} className="mt-1 text-xs">
              {d}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}
