"use client";

import { useEffect, useMemo, useState } from "react";
import { guardarValores } from "@/server/acoes-aula";

/**
 * A oficina de prompt dos desafios.
 *
 * No desafio o aluno não recebe um prompt pronto: ele escreve o dele, contra o
 * relógio, aplicando a fórmula que acabou de aprender. Sem um lugar para isso,
 * o desafio virava "escreva no seu celular, de algum jeito" — e o professor
 * não tinha como saber se a turma conseguiu.
 *
 * São quatro campos, um por letra do P.T.C.F., cada um com o que a letra pede
 * e um exemplo. O prompt final é montado a partir deles, e os botões levam às
 * IAs com o texto pronto. Escrever separado é o que ensina a fórmula: quem
 * deixa o Contexto em branco vê que deixou.
 *
 * O que o aluno digita é gravado no mesmo lugar dos campos de prompt do curso
 * (`StepProgress.valores`), então volta quando ele reabre a página.
 */

const IAS = [
  { id: "gemini", nome: "Gemini", url: "https://gemini.google.com", q: null },
  { id: "chatgpt", nome: "ChatGPT", url: "https://chatgpt.com", q: "q" },
  { id: "deepseek", nome: "DeepSeek", url: "https://chat.deepseek.com", q: null },
  { id: "notebook", nome: "NotebookLM", url: "https://notebooklm.google.com", q: null },
];

/** As quatro letras, com o que cada uma responde. */
const LETRAS = [
  {
    chave: "P",
    nome: "Papel",
    pergunta: "Quem a IA deve fingir ser?",
    ajuda: "Muda o tom e o nível técnico da resposta.",
    exemplo: "Aja como professora de Matemática do 4º ano, de escola pública.",
  },
  {
    chave: "T",
    nome: "Tarefa",
    pergunta: "O que exatamente você quer?",
    ajuda: "Comece com um verbo: crie, elabore, reescreva, compare.",
    exemplo: "Crie um plano de aula de 50 minutos sobre multiplicação.",
  },
  {
    chave: "C",
    nome: "Contexto",
    pergunta: "Qual é a sua realidade?",
    ajuda: "A letra que os professores mais esquecem — e a que mais muda o resultado.",
    exemplo: "27 alunos, sem projetor, seis ainda não sabem a tabuada do 2.",
  },
  {
    chave: "F",
    nome: "Formato",
    pergunta: "Como você quer receber?",
    ajuda: "Tabela, lista numerada, passo a passo cronometrado.",
    exemplo: "Em tabela, com as colunas Momento, Tempo e Material.",
  },
] as const;

async function copiarTexto(texto: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* o texto segue na tela para copiar à mão */
    }
    document.body.removeChild(ta);
  }
}

export function OficinaDePrompt({
  stepId,
  valoresIniciais,
}: {
  stepId: string;
  valoresIniciais: Record<string, string>;
}) {
  const [valores, setValores] = useState<Record<string, string>>(valoresIniciais);
  const [copiado, setCopiado] = useState(false);
  const [verExemplos, setVerExemplos] = useState(false);

  // O prompt montado: as quatro partes, na ordem, separadas por espaço. Quem
  // preencheu só duas recebe um prompt de duas — incompleto, mas utilizável.
  const prompt = useMemo(
    () =>
      LETRAS.map((l) => (valores[`ptcf.${l.chave}`] ?? "").trim())
        .filter(Boolean)
        .join(" "),
    [valores],
  );

  const preenchidas = LETRAS.filter(
    (l) => (valores[`ptcf.${l.chave}`] ?? "").trim(),
  ).length;

  // Grava o que foi digitado, um pouco depois da última tecla: gravar a cada
  // letra seriam dezenas de idas ao servidor na rede da escola.
  //
  // A primeira passagem não grava. Ela roda na montagem, com o estado ainda
  // igual ao que veio do servidor, e gravava um objeto vazio por cima do que
  // o aluno já tinha escrito — bastava abrir a página para perder o trabalho.
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    if (!montado) {
      setMontado(true);
      return;
    }
    const t = setTimeout(() => {
      void guardarValores(stepId, valores).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [valores, stepId, montado]);

  return (
    <section
      // `oficina-prompt` traz as regras do curso: são elas que desenham os
      // botões das IAs, aqui como no slide.
      className="oficina-prompt mt-6 overflow-hidden rounded-2xl border-2 border-indigo-line bg-white"
    >
      <header className="bg-indigo-soft px-4 py-3">
        <h2 className="font-titulo text-base font-extrabold text-indigo-dark">
          Escreva o seu prompt
        </h2>
        <p className="mt-0.5 text-sm text-indigo-dark/80">
          Uma letra de cada vez. O prompt se monta sozinho abaixo.
        </p>
      </header>

      <div className="space-y-3 p-4">
        {LETRAS.map((l) => {
          const chave = `ptcf.${l.chave}`;
          const preenchido = !!(valores[chave] ?? "").trim();
          return (
            <div key={l.chave}>
              <label className="block">
                <span className="mb-1 flex items-baseline gap-2">
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-titulo text-xs font-extrabold ${
                      preenchido
                        ? "bg-verde text-white"
                        : "bg-indigo-soft text-indigo-dark"
                    }`}
                  >
                    {l.chave}
                  </span>
                  <span className="min-w-0">
                    <span className="font-titulo text-sm font-bold text-tinta">
                      {l.nome}
                    </span>
                    <span className="ml-1.5 text-sm text-cinza">
                      {l.pergunta}
                    </span>
                  </span>
                </span>
                <textarea
                  value={valores[chave] ?? ""}
                  onChange={(e) =>
                    setValores((a) => ({ ...a, [chave]: e.target.value }))
                  }
                  rows={2}
                  placeholder={l.exemplo}
                  className="w-full resize-y rounded-lg border border-borda px-3 py-2.5 text-[15px] leading-snug outline-none focus:border-indigo"
                />
              </label>
              {verExemplos && (
                <p className="mt-1 text-xs leading-snug text-cinza">
                  {l.ajuda}
                </p>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setVerExemplos((v) => !v)}
          className="font-titulo text-xs font-bold text-indigo"
        >
          {verExemplos ? "Ocultar as dicas" : "O que cada letra pede?"}
        </button>
      </div>

      {/* O prompt montado, e o que fazer com ele. */}
      <div className="border-t border-borda bg-[#FBFBFE] p-4">
        <p className="mb-2 flex items-center justify-between gap-2">
          <span className="font-titulo text-xs font-bold uppercase tracking-wide text-cinza">
            Seu prompt
          </span>
          <span
            className={`font-titulo text-xs font-bold ${
              preenchidas === 4 ? "text-verde-dark" : "text-cinza"
            }`}
          >
            {preenchidas} de 4 letras
          </span>
        </p>

        {prompt ? (
          <pre className="mb-3 whitespace-pre-wrap break-words rounded-xl bg-[#151F38] p-3.5 font-mono text-[13px] leading-relaxed text-[#E8EDF7]">
            {prompt}
          </pre>
        ) : (
          <p className="mb-3 rounded-xl border border-dashed border-borda p-4 text-center text-sm text-cinza">
            Preencha as letras acima e o seu prompt aparece aqui.
          </p>
        )}

        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <button
            type="button"
            disabled={!prompt}
            onClick={() => {
              void copiarTexto(prompt);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1800);
            }}
            className={`shrink-0 rounded-full px-5 py-2.5 font-titulo text-sm font-bold text-white transition-colors disabled:opacity-40 ${
              copiado ? "bg-verde-dark" : "bg-indigo"
            }`}
          >
            {copiado ? "✓ Copiado!" : "📋 Copiar"}
          </button>
          {IAS.map((ia) =>
            prompt ? (
              <a
                key={ia.id}
                href={
                  ia.q
                    ? `${ia.url}/?${ia.q}=${encodeURIComponent(prompt)}`
                    : ia.url
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void copiarTexto(prompt)}
                title={
                  ia.q
                    ? `Abre o ${ia.nome} com o seu prompt já escrito`
                    : `Abre o ${ia.nome} — o prompt já está copiado, cole com Ctrl+V`
                }
                className={`ia-btn mini shrink-0 whitespace-nowrap ${ia.id}`}
              >
                <span className="pt" />
                {ia.nome}
                {ia.q && <span className="ja">já com o texto</span>}
              </a>
            ) : (
              <span
                key={ia.id}
                aria-disabled
                className={`ia-btn mini shrink-0 whitespace-nowrap opacity-40 ${ia.id}`}
              >
                <span className="pt" />
                {ia.nome}
              </span>
            ),
          )}
        </div>

        {preenchidas === 4 && (
          <p className="mt-3 rounded-lg bg-verde-soft px-3 py-2.5 text-sm text-verde-dark">
            <span className="font-bold">Agora o passo que falta:</span> leia a
            resposta e peça <span className="font-bold">um</span> refinamento —
            o que ficou fora da sua realidade?
          </p>
        )}
      </div>
    </section>
  );
}
