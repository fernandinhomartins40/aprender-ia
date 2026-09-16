"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { marcarItens, passoDoProfessor } from "@/server/acoes-aula";
import type { PassoDaAula } from "@/server/acompanhar";
import Link from "next/link";
import { PalcoSlide } from "@/components/palco-slide";

/**
 * A tela que o aluno abre durante o encontro, no celular ou no computador.
 *
 * O professor projeta o slide 16:9 no telão; aqui o aluno acompanha o MESMO
 * conteúdo, com o MESMO visual e as MESMAS funções — só que como página, que
 * ele rola. Nasceu de um problema de sala: os alunos se perdiam só com a
 * projeção, e a aula parava para ensinar, um a um, a acessar as IAs. Com o
 * conteúdo na mão, o prompt é preenchido e a ferramenta abre ali.
 *
 * Não é o slide encolhido: um 1280x720 reduzido num celular corta as bordas e
 * põe o texto em 4px. É o mesmo HTML e o mesmo CSS, com as regras de
 * posicionamento soltas — ver `.palco-pagina` em `slide-curso.css`.
 */
export function AcompanharAula({
  scriptId,
  titulo,
  passos,
  passoInicialDoProfessor,
}: {
  scriptId: string;
  titulo: string;
  passos: PassoDaAula[];
  passoInicialDoProfessor: number | null;
}) {
  const [indice, setIndice] = useState(0);
  const [doProfessor, setDoProfessor] = useState(passoInicialDoProfessor);
  // Enquanto ligado, cada passo que o professor avança traz o aluno junto.
  // É o que a maior parte da turma quer: seguir a aula sem tocar em nada.
  const [seguindo, setSeguindo] = useState(true);

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

  // Seguir o professor. Só mexe no índice quando o passo dele realmente muda,
  // para não arrastar de volta quem acabou de navegar com o botão.
  useEffect(() => {
    if (!seguindo || doProfessor === null) return;
    const n = passos.findIndex((p) => p.ordem === doProfessor);
    if (n >= 0) setIndice(n);
  }, [doProfessor, seguindo, passos]);

  const ir = useCallback(
    (novo: number) => {
      const n = Math.max(0, Math.min(passos.length - 1, novo));
      setIndice(n);
      // Navegar à mão é dizer "quero ver outra coisa": o modo de seguir sai do
      // caminho até a pessoa pedir de volta.
      setSeguindo(false);
    },
    [passos.length],
  );

  // As mesmas teclas do deck, para quem está no computador.
  useEffect(() => {
    const t = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        ir(indice + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        ir(indice - 1);
      } else if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) void document.documentElement.requestFullscreen();
        else void document.exitFullscreen();
      }
    };
    document.addEventListener("keydown", t);
    return () => document.removeEventListener("keydown", t);
  }, [indice, ir]);

  // O que o aluno marca no checklist do slide sobe para o painel do professor.
  // Guardado em ref porque o palco só lê a função uma vez, ao montar o slide.
  const marcadosAqui = useRef<number[]>([]);
  useEffect(() => {
    marcadosAqui.current = passo?.marcados ?? [];
  }, [passo]);

  const aoMarcar = useCallback(
    (i: number, feito: boolean) => {
      if (!passo) return;
      const novo = feito
        ? [...new Set([...marcadosAqui.current, i])]
        : marcadosAqui.current.filter((x) => x !== i);
      marcadosAqui.current = novo;
      // Grava em segundo plano: um erro de rede não pode desmarcar o que o
      // aluno acabou de marcar na frente da turma.
      void marcarItens(passo.id, novo).catch(() => {});
    },
    [passo],
  );

  if (!passo) {
    return (
      <p className="rounded-xl border border-borda bg-white p-5 text-tinta-clara">
        Este roteiro ainda não tem passos.
      </p>
    );
  }

  const professorEmOutro = doProfessor !== null && doProfessor !== passo.ordem;

  return (
    // Sem altura fixa: o conteúdo do passo tem o tamanho que tem, e a pessoa
    // rola a página para ver o resto. Prender numa caixa obrigaria a duas
    // rolagens aninhadas — a da caixa e a da página — que no celular é o tipo
    // de coisa que faz o dedo arrastar a errada.
    <div className="overflow-hidden rounded-xl border border-borda bg-white">
      {/* onde o professor está */}
      {doProfessor !== null && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-2 ${
            professorEmOutro
              ? "bg-indigo-soft text-indigo-dark"
              : "bg-verde-soft text-verde-dark"
          }`}
        >
          <span className="font-titulo text-xs font-bold sm:text-sm">
            {professorEmOutro
              ? `Professor está no passo ${doProfessor}`
              : seguindo
                ? "Acompanhando o professor"
                : "Você está no mesmo passo do professor"}
          </span>
          {professorEmOutro && (
            <button
              type="button"
              onClick={() => {
                setSeguindo(true);
                const n = passos.findIndex((p) => p.ordem === doProfessor);
                if (n >= 0) setIndice(n);
              }}
              className="shrink-0 rounded-full bg-indigo px-4 py-1.5 font-titulo text-xs font-bold text-white sm:text-sm"
            >
              Acompanhar
            </button>
          )}
        </div>
      )}

      {/* o conteúdo do passo, como página */}
      <div>
        {passo.html ? (
          <PalcoSlide
            html={passo.html}
            modo="pagina"
            aoMarcar={aoMarcar}
            marcados={passo.marcados}
          />
        ) : (
          /* Passo gravado antes de a coluna `html` existir. O seed preenche no
             deploy seguinte; até lá, ao menos o título aparece. */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="mb-2 font-titulo text-xs font-bold uppercase tracking-wide text-cinza">
              {titulo} · passo {passo.ordem} de {passos.length}
            </p>
            <h1 className="font-titulo text-2xl font-extrabold text-tinta">
              {passo.titulo}
            </h1>
          </div>
        )}
      </div>

      {/* O trecho da apostila que este passo trata. Fica junto do slide porque
          é durante a aula que a dúvida aparece — e o aluno não deveria ter que
          abrir um PDF de 113 páginas para achar a explicação do que está na
          tela. */}
      {passo.apostila && (
        <Link
          href={passo.apostila.href}
          className="flex items-center gap-2 border-t border-borda bg-indigo-soft px-4 py-3 text-indigo-dark transition-colors hover:bg-indigo-line"
        >
          <span aria-hidden>📖</span>
          <span className="min-w-0 flex-1 truncate font-titulo text-xs font-bold sm:text-sm">
            Ler na apostila: {passo.apostila.rotulo}
          </span>
          <span aria-hidden className="shrink-0 opacity-50">
            ›
          </span>
        </Link>
      )}

      {/* navegação entre passos */}
      <div className="flex items-center justify-between gap-3 border-t border-borda bg-white px-4 py-3">
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
  );
}
