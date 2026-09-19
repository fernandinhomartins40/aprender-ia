"use server";

import { prisma } from "@aprender/db";
import { exigirAluno } from "./trilha";

/**
 * O que o cursista produz nos laboratórios e no projeto final.
 *
 * Diferente do progresso, que registra *que* a lição foi feita, isto
 * guarda *o que* foi escrito: a resposta ao cliente, o procedimento, o
 * desenho da automação. É o material que ele leva para fora do curso, e
 * por isso é salvo em banco, e não no navegador.
 */

/** Um objeto de texto por chave — o formato que os players enviam. */
function lerMapa(bruto: FormDataEntryValue | null): Record<string, string> {
  if (typeof bruto !== "string") return {};
  try {
    const dados = JSON.parse(bruto);
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) return {};
    const limpo: Record<string, string> = {};
    for (const [k, v] of Object.entries(dados)) {
      if (typeof v === "string") limpo[k] = v;
    }
    return limpo;
  } catch {
    return {};
  }
}

/** Salva (ou atualiza) a entrega de um laboratório. */
export async function salvarEntregaLab(dados: FormData) {
  const user = await exigirAluno();
  const lessonId = String(dados.get("lessonId") ?? "");
  if (!lessonId) return;

  // A lição precisa existir e ser de um curso em que ele está matriculado:
  // sem esta conferência, um id digitado na mão gravaria entrega em
  // qualquer lição da plataforma.
  const licao = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!licao) return;
  const matriculado = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: licao.module.courseId } },
    select: { id: true },
  });
  if (!matriculado) return;

  const conteudo = lerMapa(dados.get("conteudo"));

  await prisma.labDelivery.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, conteudo },
    update: { conteudo },
  });
}

/** A entrega já feita, para o laboratório abrir onde parou. */
export async function entregaDoLab(userId: string, lessonId: string) {
  const entrega = await prisma.labDelivery.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { conteudo: true },
  });
  return (entrega?.conteudo as Record<string, string> | undefined) ?? undefined;
}
