"use client";

import { useEffect, useRef, useState } from "react";
import { PROMPTS_DO_BANCO } from "@aprender/db";

/**
 * O modal do banco de prompts.
 *
 * No slide "Banco de 15 prompts prontos" cada card é um prompt: clicar abre o
 * texto completo, já copiado, com os botões que levam às IAs. Os cards guardam
 * só o índice (`data-prompt="7"`); o texto vem do conteúdo do curso.
 *
 * Vive aqui, e não dentro do palco, porque os dois lados da sala precisam
 * dele: o professor abre no projetor para demonstrar, e o aluno abre na página
 * para usar o prompt na hora.
 */

const IAS = [
  { id: "gemini", nome: "Gemini", url: "https://gemini.google.com", q: null },
  { id: "chatgpt", nome: "ChatGPT", url: "https://chatgpt.com", q: "q" },
  { id: "deepseek", nome: "DeepSeek", url: "https://chat.deepseek.com", q: null },
  { id: "notebook", nome: "NotebookLM", url: "https://notebooklm.google.com", q: null },
];

const chaveVar = (v: string) => v.replace(/\s+/g, " ").trim();

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Sem permissão de área de transferência, o plano B do deck.
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      /* o texto segue na tela para copiar à mão */
    }
    document.body.removeChild(ta);
    return ok;
  }
}

/**
 * Escuta os cliques nos cards `.abrivel` de um trecho da página.
 *
 * A escuta é no documento, e não em cada card, porque os cards são escritos
 * por `innerHTML` depois que o React montou: ligar um por um exigiria refazer
 * a ligação a cada troca de conteúdo.
 */
export function BancoDePrompts() {
  const [aberto, setAberto] = useState<number | null>(null);

  useEffect(() => {
    const clique = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest?.(".card.abrivel");
      if (!card) return;
      const i = Number((card as HTMLElement).dataset.prompt);
      if (Number.isFinite(i) && PROMPTS_DO_BANCO[i]) setAberto(i);
    };
    document.addEventListener("click", clique);
    return () => document.removeEventListener("click", clique);
  }, []);

  if (aberto === null) return null;
  const prompt = PROMPTS_DO_BANCO[aberto];
  if (!prompt) return null;

  return (
    <ModalPrompt
      titulo={prompt.titulo}
      texto={prompt.texto}
      aoFechar={() => setAberto(null)}
    />
  );
}

function ModalPrompt({
  titulo,
  texto,
  aoFechar,
}: {
  titulo: string;
  texto: string;
  aoFechar: () => void;
}) {
  // Um valor por placeholder: `[ANO]` aparece três vezes no mesmo prompt, e
  // ninguém quer digitar a mesma coisa três vezes.
  const [valores, setValores] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  const partes = texto.split(/(\[[^\]]*\])/);
  const variaveis = [
    ...new Set(
      partes
        .map((p) => p.match(/^\[([^\]]*)\]$/)?.[1])
        .filter(Boolean)
        .map((v) => chaveVar(v!)),
    ),
  ];

  // O texto com o que foi preenchido. Campo vazio volta a ser [PLACEHOLDER]:
  // o prompt continua utilizável mesmo pela metade.
  const textoFinal = partes
    .map((p) => {
      const m = p.match(/^\[([^\]]*)\]$/);
      if (!m) return p;
      const chave = chaveVar(m[1] ?? "");
      return valores[chave]?.trim() || `[${chave}]`;
    })
    .join("");

  // Já copia ao abrir: um clique a menos em sala. E devolve o foco ao fechar.
  useEffect(() => {
    void copiarTexto(texto);
    const antes = document.activeElement as HTMLElement | null;
    caixa.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        aoFechar();
      }
    };
    document.addEventListener("keydown", tecla, true);
    // Com o modal aberto, a página atrás não rola junto.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla, true);
      document.body.style.overflow = overflow;
      antes?.focus?.();
    };
  }, [texto, aoFechar]);

  async function copiar() {
    await copiarTexto(textoFinal);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-tinta/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={aoFechar}
      role="presentation"
    >
      <div
        ref={caixa}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        // `modal-prompt` traz as regras do curso para dentro do modal: são
        // elas que desenham os botões das IAs, aqui e no slide.
        className="modal-prompt flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl"
      >
        <header className="flex items-center justify-between gap-4 bg-indigo px-5 py-4 text-white">
          <h2 className="font-titulo text-lg font-extrabold">{titulo}</h2>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg leading-none"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {variaveis.length > 0 && (
            <>
              <p className="mb-3 rounded-r-lg border-l-4 border-amarelo bg-amarelo-soft px-3.5 py-2.5 text-sm text-amarelo-dark">
                Preencha os campos com a sua realidade — o prompt e os botões
                abaixo acompanham o que você digitar.
              </p>
              <div className="mb-4 space-y-2">
                {variaveis.map((v) => (
                  <label key={v} className="block">
                    <span className="mb-1 block font-titulo text-xs font-bold uppercase tracking-wide text-cinza">
                      {v}
                    </span>
                    <input
                      type="text"
                      value={valores[v] ?? ""}
                      onChange={(e) =>
                        setValores((a) => ({ ...a, [v]: e.target.value }))
                      }
                      placeholder={v.toLowerCase()}
                      className="w-full rounded-lg border border-borda px-3 py-2.5 text-[15px] outline-none focus:border-indigo"
                    />
                  </label>
                ))}
              </div>
            </>
          )}

          <pre className="whitespace-pre-wrap break-words rounded-xl bg-[#151F38] p-4 font-mono text-[13.5px] leading-relaxed text-[#E8EDF7]">
            {textoFinal}
          </pre>
        </div>

        <footer className="border-t border-borda bg-[#FBFBFE] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copiar}
              className={`rounded-full px-5 py-2.5 font-titulo text-sm font-bold text-white transition-colors ${
                copiado ? "bg-verde-dark" : "bg-indigo"
              }`}
            >
              {copiado ? "✓ Copiado!" : "📋 Copiar"}
            </button>
            {IAS.map((ia) => (
              <a
                key={ia.id}
                href={
                  ia.q
                    ? `${ia.url}/?${ia.q}=${encodeURIComponent(textoFinal)}`
                    : ia.url
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void copiarTexto(textoFinal)}
                title={
                  ia.q
                    ? `Abre o ${ia.nome} com este prompt já escrito`
                    : `Abre o ${ia.nome} — o prompt já está copiado, cole com Ctrl+V`
                }
                className={`ia-btn mini ${ia.id}`}
              >
                <span className="pt" />
                {ia.nome}
                {ia.q && <span className="ja">já com o texto</span>}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
