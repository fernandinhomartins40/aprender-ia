"use client";

import { useRef, useState } from "react";
import { classificar, ROTULO_CATEGORIA, TOM_CATEGORIA } from "@/lib/motor-diario";

/**
 * Registro manual — um campo só.
 *
 * O formulário anterior tinha cinco campos, três obrigatórios (texto,
 * ferramenta de IA e os minutos). Era a burocracia que o trabalho inteiro
 * existe para eliminar: exigia declarar uma ferramenta mesmo quando a
 * anotação não envolvia nenhuma ("a atividade funcionou melhor em
 * grupos"), e obrigava a cronometrar para poder registrar.
 *
 * Agora: escreva e pronto. A categoria aparece enquanto ele digita — não
 * como pergunta, como confirmação visual de que a aplicação entendeu. Os
 * minutos continuam existindo para quem gosta de medir, atrás de um
 * "detalhes", nunca no caminho.
 */
export function DiarioRegistroRapido({
  aoRegistrar,
}: {
  aoRegistrar: (d: FormData) => Promise<void>;
}) {
  const [texto, setTexto] = useState("");
  const [detalhes, setDetalhes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  // A mesma função do servidor, rodando no cliente: o professor vê a
  // etiqueta que o registro vai receber antes de salvar.
  const categoria = texto.trim().length > 8 ? classificar(texto) : null;

  async function enviar(dados: FormData) {
    setEnviando(true);
    try {
      await aoRegistrar(dados);
      setTexto("");
      setDetalhes(false);
      form.current?.reset();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form ref={form} action={enviar} className="card mb-6">
      <label htmlFor="oQueFez" className="mb-1.5 block font-titulo font-bold">
        O que aconteceu hoje?
      </label>

      <textarea
        id="oQueFez"
        name="oQueFez"
        required
        rows={2}
        maxLength={1000}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ex.: a atividade de frações funcionou melhor quando fizemos em grupos"
        className="campo"
      />

      <div className="mt-2 flex min-h-[1.75rem] flex-wrap items-center gap-2">
        {categoria ? (
          <>
            <span className="text-xs text-tinta-clara">Vai ser guardado como</span>
            <span className={TOM_CATEGORIA[categoria]}>{ROTULO_CATEGORIA[categoria]}</span>
          </>
        ) : (
          <span className="text-xs text-cinza">
            Escreva com suas palavras — a organização é automática.
          </span>
        )}
      </div>

      {/* Os campos de tempo ficam atrás de um clique: medir economia é
          opcional e não pode ser pedágio para registrar uma observação. */}
      {detalhes && (
        <div className="mt-3 grid gap-3 border-t border-borda pt-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-bold text-tinta">Ferramenta usada</span>
            <input
              name="ferramentaUsada"
              className="campo w-full"
              placeholder="Ex.: ChatGPT (opcional)"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-bold text-tinta">Levava (min)</span>
            <input name="minutosAntes" type="number" min={0} max={6000} className="campo w-full" placeholder="240" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-bold text-tinta">Levou agora (min)</span>
            <input name="minutosAgora" type="number" min={0} max={6000} className="campo w-full" placeholder="20" />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={enviando || !texto.trim()} className="btn-primario">
          {enviando ? "Guardando…" : "Guardar no diário"}
        </button>
        <button
          type="button"
          onClick={() => setDetalhes((d) => !d)}
          className="text-sm font-semibold text-indigo hover:underline"
        >
          {detalhes ? "Esconder detalhes" : "Medir tempo economizado"}
        </button>
      </div>
    </form>
  );
}
