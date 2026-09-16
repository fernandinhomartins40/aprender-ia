"use client";

import { useCallback, useEffect, useState } from "react";
import {
  registrarPasso,
  encerrarApresentacao,
  panoramaDaTurma,
} from "@/server/apresentar";
import type { Bloco } from "@/server/acompanhar";

type Passo = { id: string; ordem: number; titulo: string; blocos: Bloco[] };
type Panorama = Awaited<ReturnType<typeof panoramaDaTurma>>;

/**
 * O professor apresenta por aqui, e a aplicação passa a saber em que passo ele
 * está — sem botão de "publicar" para lembrar de clicar no meio da aula.
 *
 * Feito para o notebook ligado ao projetor: teclas de seta, tela cheia, e uma
 * faixa lateral com o que a turma está fazendo.
 */
export function ModoApresentacao({
  sessaoId,
  scriptId,
  titulo,
  passos,
  passoInicial,
}: {
  sessaoId: string;
  scriptId: string;
  titulo: string;
  passos: Passo[];
  passoInicial: number;
}) {
  const [indice, setIndice] = useState(
    Math.max(0, passos.findIndex((p) => p.ordem === passoInicial)),
  );
  const [painel, setPainel] = useState(true);
  const [turma, setTurma] = useState<Panorama | null>(null);

  const passo = passos[indice];

  const ir = useCallback(
    (novo: number) => {
      const n = Math.max(0, Math.min(passos.length - 1, novo));
      const alvo = passos[n];
      if (!alvo) return;
      setIndice(n);
      // registra em segundo plano: a navegação não pode travar esperando a rede
      void registrarPasso(sessaoId, alvo.ordem).catch(() => {});
    },
    [passos, sessaoId],
  );

  // Teclas de apresentador: as mesmas do deck em HTML, para não reaprender.
  useEffect(() => {
    const t = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        ir(indice + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        ir(indice - 1);
      } else if (e.key === "Home") ir(0);
      else if (e.key === "End") ir(passos.length - 1);
      else if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) void document.documentElement.requestFullscreen();
        else void document.exitFullscreen();
      } else if (e.key === "p" || e.key === "P") setPainel((v) => !v);
    };
    document.addEventListener("keydown", t);
    return () => document.removeEventListener("keydown", t);
  }, [indice, ir, passos.length]);

  // Panorama da turma, atualizado de tempos em tempos.
  useEffect(() => {
    if (!painel || !passo) return;
    let vivo = true;
    const buscar = () =>
      panoramaDaTurma(scriptId, passo.ordem)
        .then((d) => vivo && setTurma(d))
        .catch(() => {});
    buscar();
    const t = setInterval(buscar, 10000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [painel, passo, scriptId]);

  if (!passo) return <p className="p-8 text-white">Roteiro sem passos.</p>;

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-white">
      {/* palco */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <p className="mb-2 font-titulo text-sm font-bold uppercase tracking-wide text-white/50">
            {titulo} · passo {passo.ordem} de {passos.length}
          </p>
          <h1 className="mb-8 font-titulo text-4xl font-extrabold leading-tight">
            {passo.titulo}
          </h1>

          <div className="max-w-4xl space-y-5">
            {passo.blocos.map((b, i) => (
              <BlocoProjetado key={i} bloco={b} />
            ))}
          </div>
        </div>

        {/* controles */}
        <div className="flex items-center justify-between gap-4 border-t border-white/10 px-6 py-3">
          <button
            type="button"
            onClick={() => ir(indice - 1)}
            disabled={indice === 0}
            className="rounded-full border border-white/20 px-5 py-2 font-titulo text-sm font-bold disabled:opacity-30"
          >
            ‹ Anterior
          </button>
          <span className="font-titulo text-sm font-bold text-white/60">
            {passo.ordem} / {passos.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPainel((v) => !v)}
              className="rounded-full border border-white/20 px-4 py-2 font-titulo text-xs font-bold"
            >
              {painel ? "Ocultar turma (P)" : "Ver turma (P)"}
            </button>
            <button
              type="button"
              onClick={() => ir(indice + 1)}
              disabled={indice === passos.length - 1}
              className="rounded-full bg-indigo px-5 py-2 font-titulo text-sm font-bold disabled:opacity-30"
            >
              Próximo ›
            </button>
          </div>
        </div>
      </div>

      {/* visão do apresentador */}
      {painel && (
        <aside className="hidden w-80 shrink-0 border-l border-white/10 bg-black/20 p-5 lg:block">
          <h2 className="mb-4 font-titulo text-sm font-bold uppercase tracking-wide text-white/50">
            Sua turma agora
          </h2>

          <div className="mb-5 rounded-xl bg-white/5 p-4">
            <p className="font-titulo text-3xl font-extrabold">
              {turma?.acompanhando ?? "—"}
            </p>
            <p className="text-sm text-white/60">
              acompanhando pelo celular
            </p>
          </div>

          {turma?.checklist.length ? (
            <div className="mb-5">
              <p className="mb-2 font-titulo text-xs font-bold uppercase tracking-wide text-white/50">
                Checklist deste passo
              </p>
              <div className="space-y-2">
                {turma.checklist.map((c) => {
                  const faltam = turma.responderam - c.feitos;
                  return (
                    <div key={c.item} className="rounded-lg bg-white/5 p-3">
                      <p className="mb-1 text-sm leading-snug">{c.item}</p>
                      <p
                        className={`font-titulo text-xs font-bold ${
                          faltam > 0 ? "text-amarelo" : "text-verde"
                        }`}
                      >
                        {c.feitos} feito{c.feitos === 1 ? "" : "s"}
                        {faltam > 0 && ` · ${faltam} ainda não`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {(() => {
            const proximo = passos[indice + 1];
            if (!proximo) return null;
            return (
              <div className="mb-5 rounded-xl border border-white/10 p-3">
                <p className="mb-1 font-titulo text-xs font-bold uppercase tracking-wide text-white/40">
                  A seguir
                </p>
                <p className="text-sm text-white/80">{proximo.titulo}</p>
              </div>
            );
          })()}

          <button
            type="button"
            onClick={() => {
              if (!confirm("Encerrar a apresentação para a turma?")) return;
              void encerrarApresentacao(sessaoId).then(() => {
                window.location.href = "/admin/turmas";
              });
            }}
            className="w-full rounded-full border border-vermelho/40 px-4 py-2.5 font-titulo text-sm font-bold text-vermelho"
          >
            Encerrar apresentação
          </button>
        </aside>
      )}
    </div>
  );
}

function BlocoProjetado({ bloco }: { bloco: Bloco }) {
  if (bloco.tipo === "texto") {
    return (
      <p className="whitespace-pre-line text-xl leading-relaxed text-white/85">
        {bloco.html}
      </p>
    );
  }
  if (bloco.tipo === "prompt") {
    return (
      <pre className="whitespace-pre-wrap rounded-xl bg-black/40 p-5 font-mono text-base leading-relaxed text-[#E8EDF7]">
        {bloco.texto}
      </pre>
    );
  }
  if (bloco.tipo === "checklist") {
    return (
      <ul className="space-y-2">
        {bloco.itens.map((t, i) => (
          <li key={i} className="flex items-start gap-3 text-lg text-white/85">
            <span aria-hidden className="mt-1 text-white/40">☐</span>
            {t}
          </li>
        ))}
      </ul>
    );
  }
  if (bloco.tipo === "imagem") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={bloco.src} alt={bloco.legenda ?? ""} className="max-h-[50vh] rounded-xl" />
    );
  }
  return (
    <p className="font-titulo text-base text-white/50">
      Ferramentas: {bloco.chaves.join(" · ")}
    </p>
  );
}
