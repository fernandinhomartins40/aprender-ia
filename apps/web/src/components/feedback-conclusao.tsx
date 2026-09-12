"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IconeApp, type NomeIconeApp } from "./icone-app";
import { iconeGamificacao } from "@/lib/icones-gamificacao";

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
  novasMissoes: { titulo: string; recompensa: string | null; icone: string }[];
};

type Efeito = "particulas" | "aneis" | "subida" | "brilho" | "confete" | "pulso";

type Evento = {
  titulo: string;
  texto: string;
  icone: NomeIconeApp;
  tom: string;
  efeito: Efeito;
};

/**
 * Qual recompensa mostrar.
 *
 * A ordem é de importância, não de frequência: quem termina a trilha no
 * mesmo clique em que sobe de nível merece ver a trilha. Cada evento tem
 * ícone, cor e efeito próprios — repetir a mesma animação para tudo é o
 * que faz a gamificação virar ruído depois da terceira lição.
 *
 * O texto é curto de propósito. O modal aparece por cima de uma
 * atividade em andamento; quem está lendo quer voltar a ela.
 */
function evento(resultado: ResultadoConclusao): Evento {
  const subiuNivel = resultado.nivel > resultado.nivelAntes;

  if (resultado.trilhaConcluida)
    return {
      titulo: "Trilha concluída",
      texto: "Você chegou ao fim do curso.",
      icone: "certificados",
      tom: "from-amarelo-soft to-white",
      efeito: "confete",
    };
  if (resultado.encontroConcluido)
    return {
      titulo: "Encontro concluído",
      texto: "A próxima etapa está liberada.",
      icone: "recompensas",
      tom: "from-indigo-soft to-white",
      efeito: "aneis",
    };
  if (subiuNivel)
    return {
      titulo: `Nível ${resultado.nivel}`,
      texto: `Agora você é ${resultado.nivelTitulo}.`,
      icone: "progresso",
      tom: "from-indigo-soft to-white",
      efeito: "subida",
    };
  if (resultado.novasConquistas.length)
    return {
      titulo: "Conquista desbloqueada",
      texto: resultado.novasConquistas[0]!.titulo,
      icone: iconeGamificacao(resultado.novasConquistas[0]!.icone),
      tom: "from-amarelo-soft to-white",
      efeito: "brilho",
    };
  if (resultado.novasMissoes.length)
    return {
      titulo: "Missão concluída",
      texto:
        resultado.novasMissoes[0]!.recompensa ??
        resultado.novasMissoes[0]!.titulo,
      icone: iconeGamificacao(resultado.novasMissoes[0]!.icone, "metas"),
      tom: "from-verde-soft to-white",
      efeito: "confete",
    };
  if (resultado.missaoSemanalConcluida)
    return {
      titulo: "Meta da semana",
      texto: "Objetivo semanal alcançado.",
      icone: "metas",
      tom: "from-verde-soft to-white",
      efeito: "particulas",
    };
  if (resultado.tipoLicao === "DESAFIO")
    return {
      titulo: "Desafio vencido",
      texto: "Sua prática foi registrada.",
      icone: "desafios",
      tom: "from-laranja-soft to-white",
      efeito: "pulso",
    };
  if (resultado.tipoLicao === "CHECKPOINT")
    return {
      titulo: "Checkpoint concluído",
      texto: "Mais um encontro fechado.",
      icone: "metas",
      tom: "from-indigo-soft to-white",
      efeito: "aneis",
    };
  // A sequência só vira notícia quando ela é o feito do dia.
  if (resultado.ofensiva > 1)
    return {
      titulo: `${resultado.ofensiva} dias seguidos`,
      texto: "Sequência mantida.",
      icone: "progresso",
      tom: "from-laranja-soft to-white",
      efeito: "pulso",
    };
  // Primeira atividade da conta: ninguém tem ofensiva nem conquista
  // ainda, e "Progresso salvo" seria uma recepção fria.
  if (resultado.xpTotal > 0 && resultado.xpTotal === resultado.xpGanho)
    return {
      titulo: "Primeira atividade",
      texto: "Sua trilha começou.",
      icone: "trilhas",
      tom: "from-indigo-soft to-white",
      efeito: "brilho",
    };
  if (resultado.progressoPct >= 50 && resultado.progressoPct < 100)
    return {
      titulo: `${resultado.progressoPct}% da trilha`,
      texto: "Você passou da metade.",
      icone: "estatisticas",
      tom: "from-indigo-soft to-white",
      efeito: "subida",
    };
  if (resultado.xpGanho === 0)
    return {
      titulo: "Revisão concluída",
      texto: "Esta atividade já estava salva.",
      icone: "historico",
      tom: "from-indigo-soft to-white",
      efeito: "pulso",
    };
  return {
    titulo: "Atividade concluída",
    texto: "Progresso salvo.",
    icone: "atividades",
    tom: "from-indigo-soft to-white",
    efeito: "particulas",
  };
}

export function FeedbackConclusao({
  resultado,
  aoFechar,
  aoContinuar,
}: {
  resultado: ResultadoConclusao;
  aoFechar: () => void;
  aoContinuar: () => void;
}) {
  const reduzir = useReducedMotion();
  const e = evento(resultado);

  /**
   * Some com a navegação inferior enquanto a recompensa está na tela.
   *
   * A barra é `z-30` e o modal `z-70`, mas o botão central tem
   * `backdrop-blur`, e `backdrop-filter` cria contexto de empilhamento
   * próprio — o botão furava o overlay e ficava boiando sobre o modal no
   * celular. Marcar o `body` resolve sem mexer no z-index de ninguém nem
   * alterar o componente da barra.
   */
  useEffect(() => {
    document.body.setAttribute("data-recompensa-aberta", "1");
    return () => document.body.removeAttribute("data-recompensa-aberta");
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-conclusao"
    >
      <button
        aria-label="Fechar recompensa"
        className="absolute inset-0 bg-tinta/35 backdrop-blur-[1px]"
        onClick={aoFechar}
      />
      <motion.section
        initial={reduzir ? false : { opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-line bg-gradient-to-br ${e.tom} p-5 text-center shadow-xl sm:p-6`}
      >
        {!reduzir && e.efeito === "particulas" && <Particulas />}
        {!reduzir && e.efeito === "aneis" && <Aneis />}
        {!reduzir && e.efeito === "confete" && <Confete />}
        {!reduzir && e.efeito === "brilho" && <Brilho />}
        <motion.div
          className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md"
          animate={reduzir ? undefined : ANIMACAO_ICONE[e.efeito]}
          transition={{ duration: e.efeito === "pulso" ? 0.6 : 0.45 }}
        >
          <IconeApp nome={e.icone} tamanho={56} prioridade />
        </motion.div>
        <h2
          id="titulo-conclusao"
          className="mt-3 font-titulo text-xl font-extrabold sm:text-2xl"
        >
          {e.titulo}
        </h2>
        <p className="mt-1 text-sm text-tinta-clara">{e.texto}</p>
        {resultado.xpGanho > 0 && (
          <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-sm font-bold text-indigo-dark">
            +{resultado.xpGanho} XP
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <button onClick={aoFechar} className="btn-secundario flex-1 text-sm">
            Fechar
          </button>
          <button onClick={aoContinuar} className="btn-primario flex-1 text-sm">
            Continuar
          </button>
        </div>
      </motion.section>
    </div>
  );
}

/**
 * Como o ícone se comporta em cada evento.
 *
 * Subir, pulsar e girar são gestos diferentes de propósito: é o que
 * distingue "você subiu de nível" de "você manteve a sequência" antes
 * mesmo de a pessoa ler o título.
 */
const ANIMACAO_ICONE: Record<Efeito, Record<string, number[]>> = {
  subida: { y: [10, -6, 0], rotate: [0, -4, 0] },
  pulso: { scale: [1, 1.14, 0.97, 1.04, 1] },
  confete: { scale: [0.85, 1.12, 1], rotate: [0, 6, 0] },
  brilho: { scale: [0.9, 1.06, 1] },
  aneis: { scale: [0.88, 1.08, 1] },
  particulas: { scale: [0.88, 1.08, 1] },
};

function Confete() {
  const cores = ["bg-laranja", "bg-indigo", "bg-verde", "bg-amarelo"];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {[10, 26, 42, 58, 74, 90].map((left, i) => (
        <motion.i
          key={left}
          className={`absolute top-2 h-2.5 w-1.5 rounded-[1px] ${cores[i % cores.length]}`}
          style={{ left: `${left}%` }}
          animate={{
            y: [0, 120],
            rotate: [0, i % 2 ? 220 : -220],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.1, delay: i * 0.06, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function Brilho() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      {[0, 45, 90, 135].map((giro, i) => (
        <motion.i
          key={giro}
          className="absolute h-0.5 w-16 rounded-full bg-amarelo"
          style={{ transform: `rotate(${giro}deg)` }}
          animate={{ scaleX: [0.2, 1, 0.2], opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.9, delay: i * 0.05, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function Particulas() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {[18, 38, 62, 82].map((left, i) => (
        <motion.i
          key={left}
          className="absolute top-4 h-2 w-2 rounded-full bg-laranja"
          style={{ left: `${left}%` }}
          animate={{ y: [0, 62], opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}
function Aneis() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      {[0, 1].map((i) => (
        <motion.i
          key={i}
          className="absolute h-20 w-20 rounded-full border-2 border-amarelo"
          animate={{ scale: [1, 2.5], opacity: [0.7, 0] }}
          transition={{ duration: 0.8, delay: i * 0.22 }}
        />
      ))}
    </div>
  );
}
