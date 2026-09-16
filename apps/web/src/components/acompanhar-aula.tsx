"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconeApp } from "@/components/icone-app";
import { marcarItens, guardarValores, passoDoProfessor } from "@/server/acoes-aula";
import type {
  Bloco,
  FerramentaDoAluno,
  PassoDaAula,
} from "@/server/acompanhar";

/**
 * A tela que o aluno abre no celular durante o encontro.
 *
 * Nasceu de um problema de sala: os alunos se perdiam só com a projeção, e a
 * aula parava para ensinar, um a um, a acessar as IAs. Aqui cada passo traz o
 * prompt já preenchível e o botão que abre a ferramenta.
 *
 * Desenhada para o celular: lista vertical rolável, botões grandes. Um slide
 * 16:9 encolhido deixaria ilegível justamente o prompt que precisa ser lido.
 */
export function AcompanharAula({
  scriptId,
  titulo,
  passos,
  ferramentas,
  passoInicialDoProfessor,
}: {
  scriptId: string;
  titulo: string;
  passos: PassoDaAula[];
  ferramentas: FerramentaDoAluno[];
  passoInicialDoProfessor: number | null;
}) {
  const [indice, setIndice] = useState(0);
  const [doProfessor, setDoProfessor] = useState(passoInicialDoProfessor);
  const topo = useRef<HTMLDivElement>(null);

  const passo = passos[indice];

  // Pergunta de tempos em tempos onde o professor está. Poll simples em vez de
  // websocket: a aplicação não tem infraestrutura de tempo real, e a consulta
  // devolve só um número.
  useEffect(() => {
    if (!scriptId) return;
    let vivo = true;
    const perguntar = () => {
      passoDoProfessor(scriptId)
        .then((n) => vivo && setDoProfessor(n))
        .catch(() => {});
    };
    const t = setInterval(perguntar, 8000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [scriptId]);

  function ir(novo: number) {
    const n = Math.max(0, Math.min(passos.length - 1, novo));
    setIndice(n);
    topo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const professorEmOutro =
    doProfessor !== null && passo && doProfessor !== passo.ordem;

  if (!passo) {
    return (
      <p className="rounded-xl border border-borda bg-white p-5 text-tinta-clara">
        Este roteiro ainda não tem passos.
      </p>
    );
  }

  return (
    <div ref={topo} className="pb-28">
      {/* onde o professor está */}
      {doProfessor !== null && (
        <div
          className={`mb-3 flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${
            professorEmOutro
              ? "bg-indigo-soft text-indigo-dark"
              : "bg-verde-soft text-verde-dark"
          }`}
        >
          <span className="font-titulo text-sm font-bold">
            {professorEmOutro
              ? `Professor está no passo ${doProfessor}`
              : "Você está no mesmo passo do professor"}
          </span>
          {professorEmOutro && (
            <button
              type="button"
              onClick={() => ir(passos.findIndex((p) => p.ordem === doProfessor))}
              className="shrink-0 rounded-full bg-indigo px-4 py-2 font-titulo text-sm font-bold text-white"
            >
              Ir até lá
            </button>
          )}
        </div>
      )}

      <p className="mb-1 font-titulo text-xs font-bold uppercase tracking-wide text-cinza">
        {titulo} · passo {passo.ordem} de {passos.length}
      </p>
      <h1 className="mb-4 font-titulo text-2xl font-extrabold leading-tight text-tinta">
        {passo.titulo}
      </h1>

      <div className="space-y-4">
        {passo.blocos.map((b, i) => (
          <BlocoDoPasso
            key={i}
            bloco={b}
            stepId={passo.id}
            ferramentas={ferramentas}
            marcados={passo.marcados}
            valoresIniciais={passo.valores}
          />
        ))}
      </div>

      {/* navegação fixa: o polegar alcança sem rolar de volta */}
      <div className="fixed inset-x-0 bottom-[60px] z-20 border-t border-borda bg-white/95 px-4 py-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => ir(indice - 1)}
            disabled={indice === 0}
            className="rounded-full border border-borda px-5 py-2.5 font-titulo text-sm font-bold text-tinta-clara disabled:opacity-40"
          >
            ‹ Anterior
          </button>
          <span className="font-titulo text-sm font-bold text-cinza">
            {passo.ordem} / {passos.length}
          </span>
          <button
            type="button"
            onClick={() => ir(indice + 1)}
            disabled={indice === passos.length - 1}
            className="rounded-full bg-indigo px-5 py-2.5 font-titulo text-sm font-bold text-white disabled:opacity-40"
          >
            Próximo ›
          </button>
        </div>
      </div>
    </div>
  );
}

function BlocoDoPasso({
  bloco,
  stepId,
  ferramentas,
  marcados,
  valoresIniciais,
}: {
  bloco: Bloco;
  stepId: string;
  ferramentas: FerramentaDoAluno[];
  marcados: number[];
  valoresIniciais: Record<string, string>;
}) {
  if (bloco.tipo === "texto") {
    return (
      <div className="whitespace-pre-line rounded-xl border border-borda bg-white p-4 text-[15px] leading-relaxed text-tinta-clara">
        {bloco.html}
      </div>
    );
  }

  if (bloco.tipo === "imagem") {
    return (
      <figure className="overflow-hidden rounded-xl border border-borda bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bloco.src} alt={bloco.legenda ?? ""} className="w-full" />
        {bloco.legenda && (
          <figcaption className="px-4 py-2 text-center text-xs text-cinza">
            {bloco.legenda}
          </figcaption>
        )}
      </figure>
    );
  }

  if (bloco.tipo === "checklist") {
    return <Checklist itens={bloco.itens} stepId={stepId} iniciais={marcados} />;
  }

  if (bloco.tipo === "ferramentas") {
    const lista = ferramentas.filter((f) => bloco.chaves.includes(f.chave));
    if (!lista.length) return null;
    return (
      <div className="rounded-xl border border-borda bg-white p-4">
        <p className="mb-3 font-titulo text-sm font-bold text-tinta">
          Abrir agora
        </p>
        <div className="flex flex-wrap gap-2">
          {lista.map((f) => (
            <a
              key={f.chave}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-indigo-line bg-indigo-soft px-4 py-2.5 font-titulo text-sm font-bold text-indigo-dark"
            >
              {f.nome}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <PromptDoPasso
      bloco={bloco}
      stepId={stepId}
      ferramentas={ferramentas}
      valoresIniciais={valoresIniciais}
    />
  );
}

function Checklist({
  itens,
  stepId,
  iniciais,
}: {
  itens: string[];
  stepId: string;
  iniciais: number[];
}) {
  const [marcados, setMarcados] = useState<number[]>(iniciais);

  function alternar(i: number) {
    const novo = marcados.includes(i)
      ? marcados.filter((x) => x !== i)
      : [...marcados, i];
    setMarcados(novo);
    // Grava em segundo plano: um erro de rede não pode desmarcar o que o
    // aluno acabou de marcar na frente da turma.
    void marcarItens(stepId, novo).catch(() => {});
  }

  return (
    <div className="rounded-xl border border-borda bg-white p-2">
      {itens.map((t, i) => {
        const feito = marcados.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => alternar(i)}
            className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-indigo-soft/40"
          >
            <span
              aria-hidden
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm font-bold transition-colors ${
                feito
                  ? "border-verde bg-verde text-white"
                  : "border-indigo-line bg-white text-transparent"
              }`}
            >
              ✓
            </span>
            <span
              className={`text-[15px] leading-snug ${
                feito ? "text-cinza line-through" : "text-tinta"
              }`}
            >
              {t}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PromptDoPasso({
  bloco,
  stepId,
  ferramentas,
  valoresIniciais,
}: {
  bloco: Extract<Bloco, { tipo: "prompt" }>;
  stepId: string;
  ferramentas: FerramentaDoAluno[];
  valoresIniciais: Record<string, string>;
}) {
  const [valores, setValores] = useState<Record<string, string>>(valoresIniciais);
  const [copiado, setCopiado] = useState(false);

  // O prompt com o que o aluno preencheu. Campo vazio volta a ser
  // [PLACEHOLDER]: o prompt continua utilizável mesmo pela metade.
  const textoFinal = useMemo(() => {
    let t = bloco.texto;
    for (const v of bloco.variaveis) {
      const preenchido = (valores[v] ?? "").trim();
      if (preenchido) {
        t = t.split(`[${v}]`).join(preenchido);
      }
    }
    return t;
  }, [bloco.texto, bloco.variaveis, valores]);

  function mudar(chave: string, valor: string) {
    const novo = { ...valores, [chave]: valor };
    setValores(novo);
  }

  function gravar() {
    void guardarValores(stepId, valores).catch(() => {});
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoFinal);
    } catch {
      // file:// e alguns navegadores antigos não têm clipboard: cai no
      // caminho antigo, que funciona em todo lugar.
      const ta = document.createElement("textarea");
      ta.value = textoFinal;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* sem clipboard: o aluno seleciona à mão */
      }
      document.body.removeChild(ta);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  async function abrir(f: FerramentaDoAluno) {
    // Copia sempre: nas ferramentas que não aceitam prompt na URL, colar é o
    // único caminho, e o aluno já sai daqui com o texto na mão.
    await copiar();
    const url =
      f.metodoAbertura === "URL_COM_PROMPT" && f.urlComPrompt
        ? f.urlComPrompt.replace("{prompt}", encodeURIComponent(textoFinal))
        : f.url;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-xl border-2 border-indigo-line bg-white p-4">
      {bloco.variaveis.length > 0 && (
        <div className="mb-3 space-y-2">
          <p className="font-titulo text-xs font-bold uppercase tracking-wide text-indigo-dark">
            Preencha com a sua realidade
          </p>
          {bloco.variaveis.map((v) => (
            <label key={v} className="block">
              <span className="mb-1 block text-xs font-bold text-cinza">{v}</span>
              <input
                type="text"
                value={valores[v] ?? ""}
                onChange={(e) => mudar(v, e.target.value)}
                onBlur={gravar}
                placeholder={v.toLowerCase()}
                className="w-full rounded-lg border border-borda px-3 py-2.5 text-[15px] outline-none focus:border-indigo"
              />
            </label>
          ))}
        </div>
      )}

      <pre className="mb-3 whitespace-pre-wrap rounded-lg bg-[#151F38] p-3.5 font-mono text-[13px] leading-relaxed text-[#E8EDF7]">
        {textoFinal}
      </pre>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copiar}
          className={`rounded-full px-4 py-2.5 font-titulo text-sm font-bold text-white transition-colors ${
            copiado ? "bg-verde-dark" : "bg-indigo"
          }`}
        >
          {copiado ? "✓ Copiado!" : "📋 Copiar"}
        </button>
        {ferramentas.map((f) => (
          <button
            key={f.chave}
            type="button"
            onClick={() => abrir(f)}
            className="rounded-full border-2 border-indigo-line bg-indigo-soft px-4 py-2.5 font-titulo text-sm font-bold text-indigo-dark"
          >
            {f.nome}
            {f.metodoAbertura === "URL_COM_PROMPT" && (
              <span className="ml-1.5 rounded-full bg-verde-dark px-1.5 py-0.5 text-[10px] text-white">
                já com o texto
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
