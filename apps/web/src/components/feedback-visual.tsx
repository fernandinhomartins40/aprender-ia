"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IconeApp, type NomeIconeApp } from "./icone-app";

export type EstadoFeedback =
  | "correta" | "incorreta" | "atencao" | "dica" | "atividade"
  | "sequencia" | "conquista" | "modulo" | "encontro" | "objetivo"
  | "nivel" | "recompensa" | "desafio";

const ESTADOS: Record<EstadoFeedback, { icone: NomeIconeApp; classe: string; rotulo: string }> = {
  correta: { icone: "conquistas", classe: "border-verde bg-verde-soft text-verde-dark", rotulo: "Resposta correta" },
  incorreta: { icone: "seguranca", classe: "border-vermelho bg-vermelho-soft text-vermelho-dark", rotulo: "Resposta a revisar" },
  atencao: { icone: "seguranca", classe: "border-laranja bg-laranja-soft text-laranja-dark", rotulo: "Atenção" },
  dica: { icone: "ideias", classe: "border-amarelo bg-amarelo-soft text-amarelo-dark", rotulo: "Dica" },
  atividade: { icone: "atividades", classe: "border-indigo bg-indigo-soft text-indigo-dark", rotulo: "Atividade concluída" },
  sequencia: { icone: "progresso", classe: "border-laranja bg-laranja-soft text-laranja-dark", rotulo: "Sequência mantida" },
  conquista: { icone: "conquistas", classe: "border-amarelo bg-amarelo-soft text-amarelo-dark", rotulo: "Conquista desbloqueada" },
  modulo: { icone: "recompensas", classe: "border-indigo bg-indigo-soft text-indigo-dark", rotulo: "Módulo concluído" },
  encontro: { icone: "calendario", classe: "border-indigo bg-indigo-soft text-indigo-dark", rotulo: "Encontro concluído" },
  objetivo: { icone: "metas", classe: "border-verde bg-verde-soft text-verde-dark", rotulo: "Objetivo alcançado" },
  nivel: { icone: "progresso", classe: "border-indigo bg-indigo-soft text-indigo-dark", rotulo: "Novo nível" },
  recompensa: { icone: "recompensas", classe: "border-amarelo bg-amarelo-soft text-amarelo-dark", rotulo: "Recompensa recebida" },
  desafio: { icone: "desafios", classe: "border-laranja bg-laranja-soft text-laranja-dark", rotulo: "Desafio concluído" },
};

export function FeedbackVisual({ estado, titulo, children, compacto = false, className = "" }: {
  estado: EstadoFeedback;
  titulo?: string;
  children?: ReactNode;
  compacto?: boolean;
  className?: string;
}) {
  const reduzir = useReducedMotion();
  const visual = ESTADOS[estado];
  return (
    <motion.div
      data-feedback-estado={estado}
      role={estado === "incorreta" || estado === "atencao" ? "alert" : "status"}
      className={`rounded-xl border-l-4 ${compacto ? "p-4" : "p-5"} ${visual.classe} ${className}`}
      initial={reduzir ? false : { opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex items-start gap-3">
        <motion.div animate={reduzir ? undefined : { scale: [0.85, 1.12, 1] }} transition={{ duration: 0.4 }}>
          <IconeApp nome={visual.icone} tamanho={compacto ? 28 : 36} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="font-titulo font-bold">{titulo ?? visual.rotulo}</p>
          {children && <div className="mt-1 text-sm leading-relaxed">{children}</div>}
        </div>
      </div>
    </motion.div>
  );
}
