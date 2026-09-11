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
import { analisarPtcf, type Analise } from "@/lib/motor-ptcf";

type Variavel = {
  chave: string;
  rotulo?: string;
  exemplo?: string;
  /** Campo de texto alto, para respostas longas (anotações, contexto). */
  linhas?: number;
};

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
  const [analise, setAnalise] = useState<Analise | null>(null);

  const promptFinal = aplicarVariaveis(corpo, valores);
  const pendentes = variaveisPendentes(corpo, valores);

  /**
   * A letra que mais precisa de trabalho.
   *
   * Ausente pesa mais que genérico, e entre iguais vence a ordem da
   * sigla — o Papel vem antes, e é o mais fácil de corrigir, então a
   * pessoa começa por uma vitória rápida em vez do item mais difícil.
   */
  const maisFraca = analise?.vazio
    ? null
    : (analise?.dimensoes.find((d) => d.estado === "ausente") ??
      analise?.dimensoes.find((d) => d.estado === "generico") ??
      null);

  function conferir() {
    // O motor lê o prompt JÁ com as variáveis aplicadas: é o texto que
    // vai para a IA. Analisar o corpo com [DISCIPLINA] cru diria que
    // falta Contexto mesmo depois de a pessoa preencher tudo.
    setAnalise(analisarPtcf(promptFinal));
  }

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
              // O campo alto ocupa a linha inteira: metade da largura
              // para quatro linhas de texto deixa a caixa estreita e
              // alta, e no celular as duas colunas já viram uma só.
              <div key={v.chave} className={v.linhas ? "sm:col-span-2" : undefined}>
                <label
                  htmlFor={`var-${v.chave}`}
                  className="mb-1 block text-sm font-bold text-indigo-dark"
                >
                  {v.rotulo ?? v.chave}
                </label>
                {v.linhas ? (
                  <textarea
                    id={`var-${v.chave}`}
                    rows={v.linhas}
                    value={valores[v.chave] ?? ""}
                    onChange={(e) =>
                      setValores((s) => ({ ...s, [v.chave]: e.target.value }))
                    }
                    placeholder={v.exemplo ?? `Ex: ${v.chave.toLowerCase()}`}
                    className="campo bg-white"
                  />
                ) : (
                  <input
                    id={`var-${v.chave}`}
                    value={valores[v.chave] ?? ""}
                    onChange={(e) =>
                      setValores((s) => ({ ...s, [v.chave]: e.target.value }))
                    }
                    placeholder={v.exemplo ?? `Ex: ${v.chave.toLowerCase()}`}
                    className="campo bg-white"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Prompt final ----
          O botão de copiar tem barra própria acima do texto, em vez de
          flutuar sobre ele. Sobreposto (`absolute right-3 top-3`), ele
          cobria o prompt no celular: o `<pre>` rola na horizontal e o
          texto passava por baixo do botão, sem como desviar — o `<main>`
          do aplicativo tem `overflow-x-hidden` e prende a tira. */}
      <div className="bg-prompt-bg">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 pt-3 sm:px-5">
          <span className="font-titulo text-xs font-bold uppercase tracking-wide text-prompt-txt opacity-70">
            Seu prompt
          </span>
          <button
            onClick={copiar}
            className="mb-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
          >
            {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>
        {/* `whitespace-pre-wrap`: este era o único <pre> do projeto sem a
            classe, e por isso o prompt virava uma linha só de ~400
            caracteres em vez de quebrar na largura da tela. */}
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-prompt-txt sm:p-5">
          {promptFinal}
        </pre>
      </div>

      {/* ---- Ações ---- */}
      <div className="p-4 sm:p-5">
        {pendentes.length > 0 && (
          <p className="mb-3 rounded-md bg-amarelo-soft px-3 py-2 text-sm text-amarelo-dark">
            Ainda falta preencher: <strong>{pendentes.join(", ")}</strong>. Você
            pode abrir assim mesmo e completar na conversa.
          </p>
        )}

        {/* A conferência antes de abrir a IA.
            Esta lição se chama "hora de praticar de verdade" e era a
            única das atividades de prompt sem nenhuma devolutiva: o
            professor preenchia, abria o Gemini e a plataforma nunca
            sabia se o prompt tinha ficado bom. O motor é o mesmo das
            outras atividades — uma fonte só para o que é um prompt
            completo. Não bloqueia: quem quiser abrir assim mesmo, abre. */}
        <div className="mb-4">
          <button onClick={conferir} className="btn-secundario">
            {analise ? "Conferir de novo" : "Conferir meu prompt"}
          </button>

          {analise && !analise.vazio && (
            <div className="mt-3 space-y-2">
              <p
                className={`rounded-md px-3 py-2 text-sm font-bold ${
                  analise.completas === 4
                    ? "bg-verde-soft text-verde-dark"
                    : "bg-indigo-soft text-indigo-dark"
                }`}
              >
                {analise.veredito}
              </p>
              <ul className="flex flex-wrap gap-2">
                {analise.dimensoes.map((d) => (
                  <li
                    key={d.dimensao}
                    className={`rounded-full px-3 py-1 font-titulo text-xs font-bold ${
                      d.estado === "ok"
                        ? "bg-verde-soft text-verde-dark"
                        : d.estado === "generico"
                          ? "bg-amarelo-soft text-amarelo-dark"
                          : "bg-borda text-tinta-clara"
                    }`}
                    title={d.retorno}
                  >
                    {d.rotulo}
                  </li>
                ))}
              </ul>
              {/* Só a letra mais fraca ganha texto longo: quatro
                  parágrafos de uma vez empurram os botões das
                  ferramentas para fora da tela do celular. */}
              {maisFraca && (
                <p className="rounded-md border-l-4 border-amarelo bg-amarelo-soft px-3 py-2 text-sm text-amarelo-dark">
                  {maisFraca.retorno}
                </p>
              )}
            </div>
          )}
        </div>

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
