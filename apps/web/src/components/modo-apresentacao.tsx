"use client";

import { useCallback, useEffect, useState } from "react";
import {
  registrarPasso,
  encerrarApresentacao,
  panoramaDaTurma,
} from "@/server/apresentar";
import type { Bloco } from "@/server/acompanhar";
import { PalcoSlide } from "@/components/palco-slide";
import { BancoDePrompts } from "@/components/banco-de-prompts";

type Passo = {
  id: string;
  ordem: number;
  titulo: string;
  html: string | null;
  blocos: Bloco[];
};
type Panorama = Awaited<ReturnType<typeof panoramaDaTurma>>;

/**
 * O professor apresenta por aqui, e a aplicação passa a saber em que passo ele
 * está — sem botão de "publicar" para lembrar de clicar no meio da aula.
 *
 * É o deck do curso, com o mesmo desenho e as mesmas teclas de sempre (setas,
 * espaço, F, G), mais o que só a aplicação tem: a turma acompanhando pelo
 * celular e o painel que mostra quem já fez o quê.
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
  const [grade, setGrade] = useState(false);
  // Acompanha o estado real do navegador: a tecla Esc e o F11 saem da tela
  // cheia sem passar pelo nosso botão, e o rótulo precisa refletir isso.
  const [cheia, setCheia] = useState(false);
  const [turma, setTurma] = useState<Panorama | null>(null);

  const passo = passos[indice];

  const ir = useCallback(
    (novo: number) => {
      const n = Math.max(0, Math.min(passos.length - 1, novo));
      const alvo = passos[n];
      if (!alvo) return;
      setIndice(n);
      setGrade(false);
      // Registra em segundo plano: a navegação não pode travar esperando a rede
      // da escola, que é justamente onde ela costuma falhar.
      void registrarPasso(sessaoId, alvo.ordem).catch(() => {});
    },
    [passos, sessaoId],
  );

  const alternarTelaCheia = useCallback(() => {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen();
    else void document.exitFullscreen();
  }, []);

  useEffect(() => {
    const mudou = () => setCheia(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", mudou);
    return () => document.removeEventListener("fullscreenchange", mudou);
  }, []);

  // Teclas de apresentador: as mesmas do deck, para não reaprender nada.
  // A barra de espaço e o Z, em slides de cronômetro, pertencem ao relógio —
  // quem os intercepta é o próprio palco, capturando antes daqui.
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
      else if (e.key === "f" || e.key === "F") alternarTelaCheia();
      else if (e.key === "g" || e.key === "G") setGrade((v) => !v);
      else if (e.key === "p" || e.key === "P") setPainel((v) => !v);
      else if (e.key === "Escape") setGrade(false);
    };
    document.addEventListener("keydown", t);
    return () => document.removeEventListener("keydown", t);
  }, [indice, ir, passos.length, alternarTelaCheia]);

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
    <div className="flex h-screen overflow-hidden bg-[#0F172A] text-white">
      {/* Os cards do slide "Banco de 15 prompts" abrem aqui, para o professor
          demonstrar o prompt ao vivo. */}
      <BancoDePrompts />
      {/* palco */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* A barra de progresso do deck, na mesma posição. */}
        <div
          className="h-1 bg-gradient-to-r from-indigo to-laranja transition-[width] duration-300"
          style={{ width: `${((indice + 1) / passos.length) * 100}%` }}
        />

        <div className="min-h-0 flex-1">
          {passo.html ? (
            <PalcoSlide html={passo.html} />
          ) : (
            /* Passo gravado antes de a coluna `html` existir. Não deveria
               acontecer depois de um deploy — o seed preenche todos —, mas se
               acontecer é melhor projetar o título do que uma tela em branco. */
            <div className="flex h-full flex-col items-center justify-center p-12 text-center">
              <p className="mb-2 font-titulo text-sm font-bold uppercase tracking-wide text-white/50">
                {titulo} · passo {passo.ordem} de {passos.length}
              </p>
              <h1 className="font-titulo text-4xl font-extrabold leading-tight">
                {passo.titulo}
              </h1>
            </div>
          )}
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
            {/* A tecla F sempre fez isto, mas quem nunca apresentou o deck
                não tem como saber. O botão torna a tela cheia descobrível —
                é o que se quer no projetor, e o primeiro clique da aula. */}
            <button
              type="button"
              onClick={alternarTelaCheia}
              title={
                cheia
                  ? "Sair da tela cheia (F)"
                  : "Expandir para a tela cheia do projetor (F)"
              }
              className="rounded-full border border-white/20 px-4 py-2 font-titulo text-xs font-bold"
            >
              {cheia ? "↙ Reduzir (F)" : "⛶ Expandir (F)"}
            </button>
            <button
              type="button"
              onClick={() => setGrade((v) => !v)}
              className="rounded-full border border-white/20 px-4 py-2 font-titulo text-xs font-bold"
            >
              Slides (G)
            </button>
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
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-white/10 bg-black/20 p-5 lg:block">
          <h2 className="mb-4 font-titulo text-sm font-bold uppercase tracking-wide text-white/50">
            Sua turma agora
          </h2>

          <div className="mb-5 rounded-xl bg-white/5 p-4">
            <p className="font-titulo text-3xl font-extrabold">
              {turma?.acompanhando ?? "—"}
            </p>
            <p className="text-sm text-white/60">acompanhando pelo celular</p>
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
                window.location.href = "/admin/aulas";
              });
            }}
            className="w-full rounded-full border border-vermelho/40 px-4 py-2.5 font-titulo text-sm font-bold text-vermelho"
          >
            Encerrar apresentação
          </button>
        </aside>
      )}

      {/* grade de slides — a mesma do deck, na tecla G */}
      {grade && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#0F172A]/[.97] px-6 py-8"
          onClick={() => setGrade(false)}
        >
          <p
            className="mb-5 cursor-pointer text-center text-sm text-white/50 hover:text-white"
            onClick={() => setGrade(false)}
          >
            fechar (Esc)
          </p>
          <div
            className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fill,minmax(185px,1fr))] gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {passos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => ir(i)}
                className={`flex flex-col items-center gap-1.5 rounded-[10px] border-2 bg-[#1E293B] px-3 py-3 text-center transition ${
                  i === indice
                    ? "border-indigo"
                    : "border-white/10 hover:border-indigo"
                }`}
              >
                <span className="font-titulo text-[17px] font-extrabold leading-none text-[#818CF8]">
                  {i + 1}
                </span>
                <span className="text-[11px] font-semibold leading-snug text-white/70">
                  {p.titulo}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
