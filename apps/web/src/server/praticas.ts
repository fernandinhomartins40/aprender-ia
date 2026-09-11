"use server";

import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import type { Analise } from "@/lib/motor-ptcf";

/**
 * O que os professores escreveram nas atividades de prática.
 *
 * Até aqui o painel só sabia dizer quantas lições cada pessoa marcou
 * como concluída — o que mede presença, não prática. O texto escrito
 * ficava no estado do React e desaparecia ao sair da tela.
 *
 * Esta leitura existe para uma pergunta concreta da formação: em qual
 * das quatro letras a turma está travada? Se metade do grupo não escreve
 * Contexto, isso é assunto do próximo encontro presencial — e é uma
 * informação que nenhuma métrica de conclusão revela.
 */

export type RespostaListada = {
  id: string;
  texto: string;
  completas: number;
  tentativa: number;
  atualizadoEm: Date;
  aluno: { id: string; nome: string; escola: string | null };
  licao: { id: string; titulo: string; tipo: string };
  /** Estado de cada letra, quando a análise foi guardada. */
  faltando: string[];
};

export type ResumoPraticas = {
  respostas: RespostaListada[];
  total: number;
  /** Quantas pessoas deixaram cada letra de fora. Base do diagnóstico. */
  lacunas: { rotulo: string; quantas: number }[];
  /** Quantas fecharam as quatro letras. */
  completas: number;
};

/**
 * Lê o `analise` guardado sem confiar na forma dele.
 *
 * O campo é JSON e vem do banco: uma linha gravada por uma versão
 * anterior do motor pode não ter a forma que o código de hoje espera.
 * Uma exceção aqui derrubaria a página inteira do painel por causa de
 * uma linha antiga, então cada acesso é defensivo.
 */
function letrasFaltando(bruto: unknown): string[] {
  if (!bruto || typeof bruto !== "object") return [];
  const dims = (bruto as Partial<Analise>).dimensoes;
  if (!Array.isArray(dims)) return [];
  return dims
    .filter((d) => d && typeof d === "object" && d.estado !== "ok")
    .map((d) => String(d.rotulo ?? ""))
    .filter(Boolean);
}

export async function listarPraticas(limite = 60): Promise<ResumoPraticas> {
  await exigirAdmin();

  const linhas = await prisma.respostaAberta.findMany({
    orderBy: { atualizadoEm: "desc" },
    take: limite,
    select: {
      id: true,
      texto: true,
      completas: true,
      tentativa: true,
      atualizadoEm: true,
      analise: true,
      progress: {
        select: {
          lesson: { select: { id: true, titulo: true, tipo: true } },
          enrollment: {
            select: {
              user: { select: { id: true, nome: true, escola: true } },
            },
          },
        },
      },
    },
  });

  const respostas: RespostaListada[] = linhas.map((l) => ({
    id: l.id,
    texto: l.texto,
    completas: l.completas,
    tentativa: l.tentativa,
    atualizadoEm: l.atualizadoEm,
    aluno: {
      id: l.progress.enrollment.user.id,
      nome: l.progress.enrollment.user.nome,
      escola: l.progress.enrollment.user.escola,
    },
    licao: {
      id: l.progress.lesson.id,
      titulo: l.progress.lesson.titulo,
      tipo: l.progress.lesson.tipo,
    },
    faltando: letrasFaltando(l.analise),
  }));

  // O diagnóstico da turma: qual letra falta mais. Contado sobre as
  // respostas listadas, não sobre a tabela inteira — é o retrato
  // recente, que é o que interessa para o próximo encontro.
  const contagem = new Map<string, number>();
  for (const r of respostas) {
    for (const f of r.faltando) {
      contagem.set(f, (contagem.get(f) ?? 0) + 1);
    }
  }

  const lacunas = [...contagem.entries()]
    .map(([rotulo, quantas]) => ({ rotulo, quantas }))
    .sort((a, b) => b.quantas - a.quantas);

  const total = await prisma.respostaAberta.count();

  return {
    respostas,
    total,
    lacunas,
    completas: respostas.filter((r) => r.completas === 4).length,
  };
}
