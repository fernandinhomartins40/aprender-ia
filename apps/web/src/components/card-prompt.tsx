"use client";

import { useMemo, useState } from "react";
import {
  FERRAMENTAS,
  abrirComPrompt,
  aplicarVariaveis,
  extrairVariaveis,
  variaveisPendentes,
  type Ferramenta,
} from "@aprender/ai-launcher";

type Variavel = { chave: string; rotulo?: string; exemplo?: string };

export function CardPrompt({
  promptTemplateId,
  corpo,
  variaveis,
  ferramentasSugeridas,
  dica,
  onExecutado,
}: {
  promptTemplateId?: string;
  corpo: string;
  variaveis?: Variavel[];
  ferramentasSugeridas?: string[];
  dica?: string | null;
  onExecutado?: (ferramenta: string, promptFinal: string, valores: Record<string, string>) => void;
}) {
  const chaves = useMemo<Variavel[]>(
    () =>
      variaveis?.length
        ? variaveis
        : extrairVariaveis(corpo).map((c) => ({ chave: c }) as Variavel),
    [variaveis, corpo],
  );

  const [valores, setValores] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const promptFinal = aplicarVariaveis(corpo, valores);
  const pendentes = variaveisPendentes(corpo, valores);

  const listaFerramentas: Ferramenta[] = (
    ferramentasSugeridas?.length ? ferramentasSugeridas : ["gemini", "deepseek", "chatgpt"]
  )
    .map((id) => FERRAMENTAS[id])
    .filter((f): f is Ferramenta => Boolean(f));

  async function abrir(f: Ferramenta) {
    const r = await abrirComPrompt(f.id, promptFinal);
    setAviso(r.aviso ?? null);
    onExecutado?.(f.id, promptFinal, valores);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(promptFinal);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setAviso("Não conseguimos copiar. Selecione o texto e copie manualmente.");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border-2 border-indigo-line bg-white">
      {/* ---- Campos das variáveis ---- */}
      {chaves.length > 0 && (
        <div className="border-b border-borda bg-indigo-soft p-4 sm:p-5">
          <p className="mb-3 font-titulo text-sm font-bold text-indigo-dark">
            Personalize para a sua turma
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {chaves.map((v) => (
              <div key={v.chave}>
                <label
                  htmlFor={`var-${v.chave}`}
                  className="mb-1 block text-sm font-bold text-indigo-dark"
                >
                  {v.rotulo ?? v.chave}
                </label>
                <input
                  id={`var-${v.chave}`}
                  value={valores[v.chave] ?? ""}
                  onChange={(e) =>
                    setValores((s) => ({ ...s, [v.chave]: e.target.value }))
                  }
                  placeholder={v.exemplo ?? `Ex: ${v.chave.toLowerCase()}`}
                  className="campo bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Prompt final ---- */}
      <div className="relative">
        <pre className="max-h-80 overflow-auto bg-prompt-bg p-4 font-mono text-sm leading-relaxed text-prompt-txt sm:p-5">
          {promptFinal}
        </pre>
        <button
          onClick={copiar}
          className="absolute right-3 top-3 rounded-md bg-white/10 px-3 py-1.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          {copiado ? "Copiado!" : "Copiar"}
        </button>
      </div>

      {/* ---- Ações ---- */}
      <div className="p-4 sm:p-5">
        {pendentes.length > 0 && (
          <p className="mb-3 rounded-md bg-amarelo-soft px-3 py-2 text-sm text-amarelo-dark">
            Ainda falta preencher: <strong>{pendentes.join(", ")}</strong>. Você
            pode abrir assim mesmo e completar na conversa.
          </p>
        )}

        <p className="mb-2 font-titulo text-sm font-bold text-tinta">
          Praticar agora em:
        </p>
        <div className="flex flex-wrap gap-2">
          {listaFerramentas.map((f) => (
            <button
              key={f.id}
              onClick={() => abrir(f)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 font-titulo text-sm font-bold text-white transition-transform hover:scale-[1.03]"
              style={{ background: f.cor }}
              title={f.descricao}
            >
              {f.nome}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>

        {aviso && (
          <p
            role="status"
            className="mt-3 rounded-md border-l-4 border-verde bg-verde-soft px-3 py-2 text-sm text-verde-dark"
          >
            {aviso}
          </p>
        )}

        {dica && (
          <p className="mt-4 rounded-md border-l-4 border-amarelo bg-amarelo-soft px-3 py-2 text-sm text-amarelo-dark">
            <strong>Dica:</strong> {dica}
          </p>
        )}
      </div>
    </div>
  );
}
