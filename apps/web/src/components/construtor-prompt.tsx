"use client";

import { useMemo, useState } from "react";
import { analisarPtcf, montarPromptPtcf } from "@/lib/motor-ptcf";
import { AjudaContextual, type ItemAjuda } from "./ajuda-contextual";

/**
 * Construtor de prompt em cinco campos (P.T.C.F. + revisão).
 *
 * Cada campo carrega o seu próprio ícone ⓘ quando há verbete: são os
 * nomes que o professor vê pela primeira vez ao chegar nesta tela. O
 * quinto campo — "o que você vai conferir" — aponta para o verbete de
 * revisão humana, que é a razão de ele existir.
 */

const CAMPOS = [
  {
    chave: "papel",
    rotulo: "Papel da IA",
    exemplo: "Ex.: professor(a) experiente de Ciências",
    prefixo: "P · ",
  },
  {
    chave: "tarefa",
    rotulo: "Tarefa",
    exemplo: "Ex.: criar uma sequência de 2 aulas",
    prefixo: "T · ",
    slug: "sequencia-didatica",
  },
  {
    chave: "contexto",
    rotulo: "Contexto",
    exemplo: "Ex.: 7º ano, 30 alunos, sem projetor, 50 min por aula",
    prefixo: "C · ",
    slug: "etapa-ensino",
  },
  {
    chave: "formato",
    rotulo: "Formato de entrega",
    exemplo: "Ex.: tabela com objetivos, etapas, materiais e avaliação",
    prefixo: "F · ",
  },
  {
    chave: "revisao",
    rotulo: "O que você vai conferir",
    exemplo: "Ex.: fatos, linguagem adequada, acessibilidade e ausência de dados pessoais",
    prefixo: "",
    slug: "revisao-humana",
  },
] as const;

export function ConstrutorPrompt({ ajuda = {} }: { ajuda?: Record<string, ItemAjuda> }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);

  const prompt = useMemo(
    () =>
      montarPromptPtcf({
        papel: valores.papel ?? "",
        tarefa: valores.tarefa ?? "",
        contexto: valores.contexto ?? "",
        formato: valores.formato ?? "",
        revisao: valores.revisao ?? "",
      }),
    [valores],
  );
  const analise = useMemo(() => analisarPtcf(prompt), [prompt]);
  const pronto = CAMPOS.slice(0, 4).every((c) => valores[c.chave]?.trim());

  function Ajuda({ slug, contexto = "criar-prompt" }: { slug?: string; contexto?: string }) {
    if (!slug) return null;
    const item = ajuda[slug];
    if (!item) return null;
    return <AjudaContextual item={item} contexto={contexto} />;
  }

  async function copiar() {
    await navigator.clipboard.writeText(prompt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1600);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card">
        <p className="mb-4 text-sm text-tinta-clara">
          Este criador usa a mesma inteligência P.T.C.F. do gerador: Papel, Tarefa,
          Contexto e Formato. Nada é enviado à plataforma.
        </p>
        <div className="space-y-4">
          {CAMPOS.map((c) => (
            <label key={c.chave} className="block">
              <span className="mb-1 block font-titulo font-bold">
                {c.prefixo}
                {c.rotulo}
                <Ajuda slug={"slug" in c ? c.slug : undefined} />
              </span>
              <textarea
                className="campo min-h-20"
                value={valores[c.chave] ?? ""}
                onChange={(e) => setValores((a) => ({ ...a, [c.chave]: e.target.value }))}
                placeholder={c.exemplo}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="card flex flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-titulo text-xl font-extrabold">Seu prompt P.T.C.F.</h2>
          {!pronto && (
            <span className="shrink-0 text-xs font-bold text-amarelo-dark">Complete P.T.C.F.</span>
          )}
        </div>
        <pre className="flex-1 whitespace-pre-wrap rounded-lg bg-prompt-bg p-4 font-sans text-sm leading-6 text-prompt-txt">
          {prompt}
        </pre>
        {!analise.vazio && (
          <p className="mt-3 text-sm font-semibold text-indigo">{analise.veredito}</p>
        )}
        <button onClick={() => void copiar()} className="btn-primario mt-4">
          {copiado ? "Copiado!" : "Copiar prompt"}
        </button>
        <p className="mt-3 text-xs text-cinza">
          Revise fatos, adequação pedagógica, acessibilidade e privacidade antes de usar.
          <Ajuda slug="alucinacao" contexto="prompts" />
        </p>
      </section>
    </div>
  );
}
