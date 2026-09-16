"use server";

import { prisma } from "@aprender/db";
import { exigirAdmin } from "@/server/admin";

/**
 * Abre (ou retoma) a apresentação de um roteiro.
 *
 * Se já houver uma sessão aberta, ela é reaproveitada: o professor que fecha o
 * navegador sem querer volta para onde estava, em vez de criar uma segunda
 * sessão e deixar os alunos vendo o passo errado.
 */
export async function abrirApresentacao(scriptId: string, meetingId?: string) {
  await exigirAdmin();

  const aberta = await prisma.liveSession.findFirst({
    where: { scriptId, encerradaEm: null },
    orderBy: { iniciadaEm: "desc" },
  });
  if (aberta) return aberta;

  return prisma.liveSession.create({
    data: { scriptId, meetingId: meetingId ?? null },
  });
}

/**
 * Registra em que passo o professor está.
 *
 * Chamado a cada avanço de slide — é isto que dispensa um botão "publicar":
 * apresentar já publica.
 */
export async function registrarPasso(sessaoId: string, passo: number) {
  await exigirAdmin();
  await prisma.liveSession.update({
    where: { id: sessaoId },
    data: { passoAtual: passo },
  });
}

/** Encerra a apresentação: os alunos deixam de ver "professor está no passo X". */
export async function encerrarApresentacao(sessaoId: string) {
  await exigirAdmin();
  await prisma.liveSession.update({
    where: { id: sessaoId },
    data: { encerradaEm: new Date() },
  });
}

/**
 * O que o professor vê enquanto apresenta: quantos estão acompanhando e onde a
 * turma travou.
 *
 * O segundo número é o que resolve o problema que originou a funcionalidade —
 * em vez de perguntar "todo mundo conseguiu?" e receber silêncio, o professor
 * vê quem ainda não marcou o item e atende só quem precisa.
 */
export async function panoramaDaTurma(scriptId: string, passoAtual: number) {
  await exigirAdmin();

  const desdeAgora = new Date(Date.now() - 10 * 60 * 1000);

  const passo = await prisma.scriptStep.findFirst({
    where: { scriptId, ordem: passoAtual },
    select: { id: true, titulo: true, blocos: true },
  });

  // Quem mexeu em qualquer passo deste roteiro nos últimos 10 minutos está
  // com o celular aberto agora.
  const acompanhando = await prisma.stepProgress.findMany({
    where: { step: { scriptId }, visto: { gte: desdeAgora } },
    select: { userId: true },
    distinct: ["userId"],
  });

  let checklist: { item: string; feitos: number }[] = [];
  let quantos = 0;

  if (passo) {
    const blocos = (passo.blocos as unknown as { tipo: string; itens?: string[] }[]) ?? [];
    const lista = blocos.find((b) => b.tipo === "checklist");
    if (lista?.itens?.length) {
      const progresso = await prisma.stepProgress.findMany({
        where: { stepId: passo.id },
        select: { marcados: true },
      });
      quantos = progresso.length;
      checklist = lista.itens.map((item, i) => ({
        item,
        feitos: progresso.filter((p) => p.marcados.includes(i)).length,
      }));
    }
  }

  return {
    acompanhando: acompanhando.length,
    passoTitulo: passo?.titulo ?? null,
    responderam: quantos,
    checklist,
  };
}
