"use server";

import { prisma } from "@aprender/db";
import { exigirAluno } from "./trilha";
import { salvarProgresso } from "./acompanhar";

/** Marca ou desmarca itens do checklist de um passo. */
export async function marcarItens(stepId: string, marcados: number[]) {
  await salvarProgresso(stepId, { marcados });
}

/** Guarda o que o aluno digitou nos campos do prompt. */
export async function guardarValores(
  stepId: string,
  valores: Record<string, string>,
) {
  await salvarProgresso(stepId, { valores });
}

/**
 * Em que passo o professor está.
 *
 * O celular do aluno pergunta isto de tempos em tempos. É de propósito a
 * consulta mais barata possível — 30 celulares perguntando a cada poucos
 * segundos não podem pesar no servidor.
 */
export async function passoDoProfessor(scriptId: string): Promise<number | null> {
  await exigirAluno();
  const sessao = await prisma.liveSession.findFirst({
    where: { scriptId, encerradaEm: null },
    orderBy: { iniciadaEm: "desc" },
    select: { passoAtual: true },
  });
  return sessao?.passoAtual ?? null;
}
