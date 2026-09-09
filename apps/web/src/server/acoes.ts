"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { exigirAluno, garantirMatricula } from "./trilha";

/* ============================================================
   OFENSIVA (streak)
   ============================================================ */

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function diasDeDiferenca(a: Date, b: Date) {
  const dia = 24 * 60 * 60 * 1000;
  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((d1 - d2) / dia);
}

/**
 * Atualiza a ofensiva do professor.
 *
 * Regras deliberadamente generosas: o público trabalha em jornada dupla
 * e perder a sequência por um dia corrido seria punitivo demais. Só
 * zeramos após 2 dias sem acesso.
 */
async function atualizarOfensiva(userId: string) {
  const agora = new Date();
  const atual = await prisma.streak.findUnique({ where: { userId } });

  if (!atual) {
    return prisma.streak.create({
      data: { userId, diasSeguidos: 1, recorde: 1, ultimoAcesso: agora },
    });
  }

  if (mesmoDia(atual.ultimoAcesso, agora)) return atual;

  const diferenca = diasDeDiferenca(agora, atual.ultimoAcesso);
  const dias = diferenca <= 2 ? atual.diasSeguidos + 1 : 1;

  return prisma.streak.update({
    where: { userId },
    data: {
      diasSeguidos: dias,
      recorde: Math.max(dias, atual.recorde),
      ultimoAcesso: agora,
    },
  });
}

/* ============================================================
   CONQUISTAS
   ============================================================ */

async function conferirConquistas(userId: string) {
  const [licoes, prompts, ofensiva, matricula] = await Promise.all([
    prisma.lessonProgress.count({
      where: { status: "CONCLUIDA", enrollment: { userId } },
    }),
    prisma.promptRun.count({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.enrollment.findFirst({ where: { userId } }),
  ]);

  const todas = await prisma.achievement.findMany();
  const jaTem = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const conquistados = new Set(jaTem.map((c) => c.achievementId));

  const novas: string[] = [];

  for (const c of todas) {
    if (conquistados.has(c.id)) continue;
    const criterio = c.criterio as { tipo: string; valor: number };

    let atingiu = false;
    switch (criterio.tipo) {
      case "licoes":
        atingiu = licoes >= criterio.valor;
        break;
      case "prompts":
        atingiu = prompts >= criterio.valor;
        break;
      case "ofensiva":
        atingiu = (ofensiva?.diasSeguidos ?? 0) >= criterio.valor;
        break;
      case "curso":
        atingiu = (matricula?.progressoPct ?? 0) >= criterio.valor;
        break;
      case "modulo": {
        // conta módulos com todas as lições concluídas
        const modulos = await prisma.module.findMany({
          include: { licoes: { select: { id: true } } },
        });
        const feitas = await prisma.lessonProgress.findMany({
          where: { status: "CONCLUIDA", enrollment: { userId } },
          select: { lessonId: true },
        });
        const ids = new Set(feitas.map((f) => f.lessonId));
        const completos = modulos.filter(
          (m) => m.licoes.length > 0 && m.licoes.every((l) => ids.has(l.id)),
        ).length;
        atingiu = completos >= criterio.valor;
        break;
      }
    }

    if (atingiu) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: c.id },
      });
      novas.push(c.titulo);
    }
  }

  return novas;
}

/* ============================================================
   CONCLUIR LIÇÃO
   ============================================================ */

export async function concluirLicao(dados: FormData) {
  const user = await exigirAluno();
  const lessonId = String(dados.get("lessonId") ?? "");
  const anotacoes = String(dados.get("anotacoes") ?? "").trim() || null;
  if (!lessonId) return;

  const matricula = await garantirMatricula(user.id);
  if (!matricula) return;

  const licao = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { xpRecompensa: true },
  });
  if (!licao) return;

  const jaFeita = await prisma.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: matricula.id, lessonId } },
  });

  // Refazer uma lição não dá XP de novo — mas atualiza as anotações.
  const xp = jaFeita?.status === "CONCLUIDA" ? jaFeita.xpGanho : licao.xpRecompensa;

  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: matricula.id, lessonId } },
    update: {
      status: "CONCLUIDA",
      xpGanho: xp,
      anotacoes,
      concluidoEm: new Date(),
      tentativas: { increment: 1 },
    },
    create: {
      enrollmentId: matricula.id,
      lessonId,
      status: "CONCLUIDA",
      xpGanho: xp,
      anotacoes,
      iniciadoEm: new Date(),
      concluidoEm: new Date(),
      tentativas: 1,
    },
  });

  // Recalcula o progresso do curso
  const [totalLicoes, feitas, somaXp] = await Promise.all([
    prisma.lesson.count({ where: { module: { courseId: matricula.courseId } } }),
    prisma.lessonProgress.count({
      where: { enrollmentId: matricula.id, status: "CONCLUIDA" },
    }),
    prisma.lessonProgress.aggregate({
      where: { enrollmentId: matricula.id },
      _sum: { xpGanho: true },
    }),
  ]);

  const pct = totalLicoes ? Math.round((feitas / totalLicoes) * 100) : 0;

  await prisma.enrollment.update({
    where: { id: matricula.id },
    data: {
      progressoPct: pct,
      xpTotal: somaXp._sum.xpGanho ?? 0,
      concluidoEm: pct >= 100 ? new Date() : null,
    },
  });

  await atualizarOfensiva(user.id);
  await conferirConquistas(user.id);

  revalidatePath("/app");
  revalidatePath("/app/trilha");
}

/* ============================================================
   REGISTRAR EXECUÇÃO DE PROMPT
   ============================================================ */

export async function registrarPrompt(dados: FormData) {
  const user = await exigirAluno();

  const promptTemplateId = String(dados.get("promptTemplateId") ?? "");
  const ferramenta = String(dados.get("ferramenta") ?? "");
  const promptFinal = String(dados.get("promptFinal") ?? "");
  const variaveisJson = String(dados.get("variaveis") ?? "{}");

  if (!promptTemplateId || !ferramenta || !promptFinal) return;

  let variaveis: Record<string, string> = {};
  try {
    variaveis = JSON.parse(variaveisJson);
  } catch {
    variaveis = {};
  }

  await prisma.promptRun.create({
    data: {
      userId: user.id,
      promptTemplateId,
      ferramenta,
      variaveisPreenchidas: variaveis,
      promptFinal,
    },
  });

  await atualizarOfensiva(user.id);
  await conferirConquistas(user.id);
  revalidatePath("/app");
}

/* ============================================================
   DIÁRIO DE BORDO
   ============================================================ */

export async function registrarDiario(dados: FormData) {
  const user = await exigirAluno();

  const oQueFez = String(dados.get("oQueFez") ?? "").trim();
  const ferramentaUsada = String(dados.get("ferramentaUsada") ?? "").trim();
  if (!oQueFez || !ferramentaUsada) return;

  const numero = (campo: string) => {
    const v = Number(dados.get(campo));
    return Number.isFinite(v) && v > 0 ? Math.round(v) : null;
  };

  await prisma.diaryEntry.create({
    data: {
      userId: user.id,
      oQueFez,
      ferramentaUsada,
      minutosAntes: numero("minutosAntes"),
      minutosAgora: numero("minutosAgora"),
      valeuAPena: dados.get("valeuAPena") !== "nao",
      observacao: String(dados.get("observacao") ?? "").trim() || null,
    },
  });

  await atualizarOfensiva(user.id);
  revalidatePath("/app/diario");
  revalidatePath("/app");
}
