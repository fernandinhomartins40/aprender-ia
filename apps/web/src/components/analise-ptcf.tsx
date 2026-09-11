"use client";

import { useState } from "react";
import type { Analise, Estado } from "@/lib/motor-ptcf";
import { IconeApp } from "./icone-app";

/**
 * O campo de escrita e a devolutiva do motor P.T.C.F.
 *
 * Substitui o botão que revelava um parágrafo fixo sem ler o que a
 * pessoa tinha escrito. Aqui o retorno vem do texto real, cita o trecho
 * do próprio aluno e nomeia a próxima ação.
 *
 * Três decisões de comportamento, todas deliberadas:
 *
 *  - Nada trava. Refazer é livre e "Concluir" nunca fica bloqueado. São
 *    professores adultos em formação, não alunos sendo avaliados; travar
 *    a passagem por causa de uma heurística que pode errar transformaria
 *    um retorno útil em obstáculo.
 *  - O estado "quase lá" existe e é o mais importante. Quem escreve
 *    "para meus alunos" tentou dar Contexto e não deu informação: tratar
 *    como acerto não ensina, como erro desanima.
 *  - A devolutiva completa abre só depois do envio. Mostrar o checklist
 *    antes viraria gabarito para preencher, e o objetivo é que a pessoa
 *    escreva primeiro do jeito dela.
 */

const CORES: Record<Estado, { caixa: string; texto: string; marca: string }> = {
  ok: {
    caixa: "border-verde bg-verde-soft",
    texto: "text-verde-dark",
    marca: "bg-verde text-white",
  },
  generico: {
    caixa: "border-amarelo bg-amarelo-soft",
    texto: "text-amarelo-dark",
    marca: "bg-amarelo text-white",
  },
  ausente: {
    caixa: "border-borda bg-fundo",
    texto: "text-tinta-clara",
    marca: "bg-cinza text-white",
  },
};

const SIMBOLO: Record<Estado, string> = {
  ok: "✓",
  generico: "!",
  ausente: "—",
};

/** Rótulo do estado. "Quase lá" em vez de "genérico": descreve a pessoa, não o texto. */
const NOME_ESTADO: Record<Estado, string> = {
  ok: "pronto",
  generico: "quase lá",
  ausente: "faltando",
};

export function AnalisePtcf({
  valor,
  aoMudar,
  analise,
  analisando,
  aoEnviar,
  rotulo,
  dica,
  linhas = 5,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  analise: Analise | null;
  analisando: boolean;
  aoEnviar: () => void;
  /** Texto do botão. Muda depois do primeiro envio. */
  rotulo?: string;
  dica?: string;
  linhas?: number;
}) {
  const jaEnviou = analise !== null && !analise.vazio;

  return (
    <div className="space-y-3">
      <textarea
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        rows={linhas}
        placeholder={dica ?? "Escreva a sua versão aqui..."}
        className="campo bg-white"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={aoEnviar}
          disabled={analisando}
          className="btn-energia disabled:opacity-60"
        >
          {analisando
            ? "Analisando..."
            : (rotulo ?? (jaEnviou ? "Analisar de novo" : "Analisar a minha versão"))}
        </button>
        {jaEnviou && (
          <span className="text-sm text-cinza">
            {analise!.completas} de 4 letras
          </span>
        )}
      </div>

      {analise && <Resultado analise={analise} />}
    </div>
  );
}

function Resultado({ analise }: { analise: Analise }) {
  if (analise.vazio) {
    return (
      <p className="rounded-md border border-borda bg-fundo p-4 text-sm text-tinta-clara">
        {analise.veredito}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-indigo bg-indigo-soft p-4">
        <p className="font-titulo font-bold text-indigo-dark">{analise.veredito}</p>
      </div>

      <div className="space-y-2">
        {analise.dimensoes.map((d) => (
          <Letra key={d.dimensao} {...d} />
        ))}
      </div>
    </div>
  );
}

function Letra({
  rotulo,
  estado,
  trecho,
  retorno,
}: {
  rotulo: string;
  estado: Estado;
  trecho?: string;
  retorno: string;
}) {
  // As letras que faltam começam abertas; as prontas, fechadas. O que
  // precisa de trabalho é o que merece a atenção, e quatro blocos
  // abertos ao mesmo tempo empurram o botão de concluir para fora da
  // tela do celular.
  const [aberto, setAberto] = useState(estado !== "ok");
  const cor = CORES[estado];

  return (
    <div className={`rounded-lg border-2 ${cor.caixa}`}>
      <button
        onClick={() => setAberto((a) => !a)}
        className="flex w-full items-center gap-3 p-3 text-left"
        aria-expanded={aberto}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-titulo text-sm font-bold ${cor.marca}`}
          aria-hidden="true"
        >
          {SIMBOLO[estado]}
        </span>
        <span className={`font-titulo font-bold ${cor.texto}`}>{rotulo}</span>
        <span className={`text-sm ${cor.texto} opacity-80`}>{NOME_ESTADO[estado]}</span>
        <span className={`ml-auto text-sm ${cor.texto}`} aria-hidden="true">
          {aberto ? "−" : "+"}
        </span>
      </button>

      {/* O padding esquerdo alinha com o texto do cabeçalho, não com a
          bolinha: 28px do círculo + 12px do gap + 12px do padding. */}
      {aberto && (
        <div className="px-3 pb-3 pl-[52px]">
          {trecho && (
            <p className="mb-2 rounded-md bg-white/70 p-2 font-mono text-xs text-tinta-clara">
              você escreveu: “{trecho}”
            </p>
          )}
          <p className={`text-sm ${cor.texto}`}>{retorno}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Bloco de fechamento quando a pessoa fecha as quatro letras.
 *
 * O passo seguinte não é "concluir a lição": é usar o prompt numa
 * ferramenta de verdade. Sem isto, o curso ensinaria a escrever prompt
 * para a plataforma, e não para o trabalho.
 */
export function ProximoPasso({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sem permissão de área de transferência (acontece em WebView
      // antigo): o texto continua na tela para seleção manual.
      setCopiado(false);
    }
  }

  return (
    <div className="rounded-lg border-2 border-verde bg-verde-soft p-4">
      <p className="flex items-center gap-2 font-titulo font-bold text-verde-dark">
        <IconeApp nome="ideias" tamanho={22} />
        Agora use de verdade
      </p>
      <p className="mt-1 text-sm text-verde-dark">
        Copie o seu prompt e cole no ChatGPT, no Gemini ou no DeepSeek. O
        objetivo do curso é esta hora aqui.
      </p>
      <button onClick={copiar} className="btn-secundario mt-3">
        {copiado ? "Copiado!" : "Copiar meu prompt"}
      </button>
    </div>
  );
}
