"use client";

import { useState } from "react";
import { ROTULO_CATEGORIA, TOM_CATEGORIA } from "@/lib/motor-diario";
import type { CategoriaRegistro } from "@aprender/db";

/**
 * Sugestões de registro aguardando decisão.
 *
 * O ponto de UX que define este componente: ele **não interrompe**. Não é
 * modal, não é pop-up, não pisca. É um bloco discreto no topo do diário
 * que o professor lê se quiser — e que desaparece sozinho depois de duas
 * semanas se ele nunca clicar (`limparSugestoesAntigas`).
 *
 * "Ignorar" some na hora, sem confirmação: pedir "tem certeza?" para
 * descartar uma sugestão que a própria aplicação inventou seria transferir
 * ao professor o custo de uma decisão que não era dele.
 */

export type Sugestao = {
  id: string;
  oQueFez: string;
  categoria: CategoriaRegistro | null;
  tema: string | null;
  disciplina: string | null;
  etapa: string | null;
  registradoEm: string;
};

export function DiarioSugestoes({
  sugestoes,
  aoAceitar,
  aoIgnorar,
}: {
  sugestoes: Sugestao[];
  aoAceitar: (d: FormData) => Promise<void>;
  aoIgnorar: (d: FormData) => Promise<void>;
}) {
  // Some da tela no clique, sem esperar o servidor: a decisão é do
  // professor e a resposta tem que ser imediata.
  const [ocultas, setOcultas] = useState<Set<string>>(new Set());
  const visiveis = sugestoes.filter((s) => !ocultas.has(s.id));

  if (visiveis.length === 0) return null;

  function decidir(id: string, acao: (d: FormData) => Promise<void>) {
    setOcultas((a) => new Set(a).add(id));
    const d = new FormData();
    d.set("id", id);
    void acao(d).catch(() => {
      // Falhou no servidor: devolvemos à tela para ele decidir de novo,
      // em vez de fingir que foi.
      setOcultas((a) => {
        const n = new Set(a);
        n.delete(id);
        return n;
      });
    });
  }

  return (
    <section className="mb-6 rounded-xl border border-indigo-line bg-indigo-soft/50 p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-titulo text-base font-bold text-indigo-dark">
          Quer guardar isto no seu diário?
        </h2>
        <span className="shrink-0 text-xs text-tinta-clara">
          {visiveis.length} {visiveis.length === 1 ? "sugestão" : "sugestões"}
        </span>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-tinta-clara">
        Veio do que você já fez na plataforma. Some sozinho se você não
        quiser — não precisa responder.
      </p>

      <ul className="space-y-2">
        {visiveis.map((s) => (
          <li key={s.id} className="rounded-lg border border-borda bg-white p-3.5">
            <p className="text-sm leading-relaxed text-tinta">{s.oQueFez}</p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {s.categoria && (
                <span className={TOM_CATEGORIA[s.categoria]}>
                  {ROTULO_CATEGORIA[s.categoria]}
                </span>
              )}
              {s.disciplina && <span className="selo-cinza">{s.disciplina}</span>}
              {s.etapa && <span className="selo-cinza">{s.etapa}</span>}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => decidir(s.id, aoAceitar)}
                className="rounded-lg bg-indigo px-3 py-2 text-sm font-bold text-white hover:bg-indigo-dark"
              >
                Guardar
              </button>
              <button
                onClick={() => decidir(s.id, aoIgnorar)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-tinta-clara hover:bg-fundo"
              >
                Não guardar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
