"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IconeApp } from "./icone-app";

export type ResultadoConclusao = {
  xpGanho: number;
  xpTotal: number;
  progressoPct: number;
  nivelAntes: number;
  nivel: number;
  nivelTitulo: string;
  proximoNivelXp: number;
  ofensiva: number;
  novasConquistas: { titulo: string; icone: string }[];
  encontroConcluido: boolean;
  encontroTitulo: string | null;
  trilhaConcluida: boolean;
  tipoLicao: string;
  missaoSemanalConcluida: boolean;
};

export function FeedbackConclusao({
  resultado,
  aoContinuar,
}: {
  resultado: ResultadoConclusao;
  aoContinuar: () => void;
}) {
  const reduzir = useReducedMotion();
  const subiuNivel = resultado.nivel > resultado.nivelAntes;
  const icone = resultado.trilhaConcluida
    ? "certificados"
    : resultado.encontroConcluido
      ? "recompensas"
      : subiuNivel
        ? "progresso"
        : "conquistas";
  const titulo = resultado.trilhaConcluida
    ? "Trilha concluída!"
    : resultado.encontroConcluido
      ? `${resultado.encontroTitulo} concluído!`
      : resultado.missaoSemanalConcluida
        ? "Objetivo da semana alcançado!"
      : subiuNivel
        ? `Nível ${resultado.nivel} alcançado!`
        : resultado.tipoLicao === "DESAFIO"
          ? "Desafio concluído!"
          : "Atividade concluída";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-conclusao"
      className="relative overflow-hidden rounded-2xl border border-indigo-line bg-white p-6 text-center shadow-lg sm:p-9"
      initial={reduzir ? false : { opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {!reduzir && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[12, 26, 42, 61, 76, 89].map((left, i) => (
            <motion.span
              key={left}
              className={`absolute h-2 w-2 rounded-full ${i % 2 ? "bg-laranja" : "bg-indigo"}`}
              style={{ left: `${left}%`, top: "12%" }}
              animate={{ y: [0, 80, 150], opacity: [0, 1, 0], rotate: [0, 90, 180] }}
              transition={{ duration: 1.4, delay: i * 0.08, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-soft via-white to-amarelo-soft"
        animate={reduzir ? undefined : { scale: [0.88, 1.08, 1], rotate: [0, -3, 0] }}
        transition={{ duration: 0.55 }}
      >
        <IconeApp nome={icone} tamanho={82} prioridade />
      </motion.div>

      <h2 id="titulo-conclusao" className="mt-4 font-titulo text-2xl font-extrabold sm:text-3xl">
        {titulo}
      </h2>
      <p className="mt-2 text-tinta-clara">
        {resultado.xpGanho > 0
          ? `Você ganhou ${resultado.xpGanho} XP com esta atividade.`
          : "Seu progresso continua salvo. Esta atividade já havia sido concluída."}
      </p>

      <div className="mx-auto mt-6 grid max-w-lg gap-3 sm:grid-cols-3">
        <Resumo valor={`${resultado.progressoPct}%`} rotulo="da trilha" />
        <Resumo valor={`${resultado.xpTotal} XP`} rotulo="acumulados" />
        <Resumo valor={`Nível ${resultado.nivel}`} rotulo={resultado.nivelTitulo} />
      </div>

      {resultado.ofensiva > 1 && (
        <p className="mx-auto mt-4 max-w-lg rounded-xl bg-laranja-soft p-3 font-semibold text-laranja-dark">
          Sequência mantida: {resultado.ofensiva} dias de prática.
        </p>
      )}

      {resultado.novasConquistas.length > 0 && (
        <div className="mx-auto mt-4 max-w-lg rounded-xl border border-amarelo bg-amarelo-soft p-4 text-left">
          <p className="font-titulo font-bold text-amarelo-dark">Nova conquista</p>
          {resultado.novasConquistas.map((c) => (
            <p key={c.titulo} className="mt-1 text-amarelo-dark">{c.icone} {c.titulo}</p>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button type="button" onClick={aoContinuar} className="btn-primario w-full sm:w-auto">
          {resultado.trilhaConcluida ? "Ver minha trilha" : "Continuar para o próximo passo"}
        </button>
      </div>
    </motion.div>
  );
}

function Resumo({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-xl bg-fundo p-3">
      <p className="font-titulo text-xl font-extrabold text-indigo-dark">{valor}</p>
      <p className="text-xs text-tinta-clara">{rotulo}</p>
    </div>
  );
}
