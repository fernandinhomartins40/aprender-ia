"use server";

import { revalidatePath } from "next/cache";
import { prisma, type Mission, type TipoMissao } from "@aprender/db";
import { exigirAluno } from "./trilha";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { notificar } from "./notificacoes";
import { doCursoAdmin, type CursoAdmin } from "./curso-admin";

function limites(tipo: TipoMissao) {
  const agora = new Date();
  if (tipo === "DIARIA") {
    const inicio = new Date(agora); inicio.setHours(0, 0, 0, 0);
    return { inicio, ciclo: inicio.toISOString().slice(0, 10) };
  }
  if (tipo === "SEMANAL") {
    const inicio = new Date(agora);
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
    inicio.setHours(0, 0, 0, 0);
    return { inicio, ciclo: `semana-${inicio.toISOString().slice(0, 10)}` };
  }
  return { inicio: undefined, ciclo: "unica" };
}

async function progressoReal(userId: string, missao: Mission): Promise<number> {
  const { inicio } = limites(missao.tipo);
  if (missao.lessonId) {
    return prisma.lessonProgress.count({
      where: { enrollment: { userId }, lessonId: missao.lessonId, status: "CONCLUIDA" },
    });
  }
  if (missao.criterio === "prompts") {
    return prisma.promptRun.count({ where: { userId, ...(inicio ? { executadoEm: { gte: inicio } } : {}) } });
  }
  if (missao.criterio === "sequencia") {
    return (await prisma.streak.findUnique({ where: { userId } }))?.diasSeguidos ?? 0;
  }
  if (missao.criterio === "tipos_atividade") {
    const feitos = await prisma.lessonProgress.findMany({
      where: { enrollment: { userId }, status: "CONCLUIDA", ...(inicio ? { concluidoEm: { gte: inicio } } : {}) },
      select: { lesson: { select: { tipo: true } } },
    });
    return new Set(feitos.map((f) => f.lesson.tipo)).size;
  }
  return prisma.lessonProgress.count({
    where: { enrollment: { userId }, status: "CONCLUIDA", ...(inicio ? { concluidoEm: { gte: inicio } } : {}) },
  });
}

export async function avaliarMissoes(userId: string) {
  const agora = new Date();
  const missoes = await prisma.mission.findMany({
    where: {
      ativo: true,
      AND: [
        { OR: [{ iniciaEm: null }, { iniciaEm: { lte: agora } }] },
        { OR: [{ terminaEm: null }, { terminaEm: { gte: agora } }] },
      ],
    },
    orderBy: [{ tipo: "asc" }, { criadoEm: "asc" }],
  });
  const novas: { titulo: string; recompensa: string | null; icone: string }[] = [];

  for (const missao of missoes) {
    const { ciclo } = limites(missao.tipo);
    const progresso = Math.min(missao.alvo, await progressoReal(userId, missao));
    const existente = await prisma.userMission.findUnique({
      where: { userId_missionId_ciclo: { userId, missionId: missao.id, ciclo } },
    });
    const concluiuAgora = progresso >= missao.alvo && !existente?.concluidoEm;
    await prisma.userMission.upsert({
      where: { userId_missionId_ciclo: { userId, missionId: missao.id, ciclo } },
      create: { userId, missionId: missao.id, ciclo, progresso, concluidoEm: concluiuAgora ? agora : null },
      update: { progresso, ...(concluiuAgora ? { concluidoEm: agora } : {}) },
    });
    if (concluiuAgora) {
      if (missao.recompensaTitulo) {
        await prisma.userReward.upsert({
          where: { userId_origem: { userId, origem: `missao:${missao.id}:${ciclo}` } },
          create: { userId, origem: `missao:${missao.id}:${ciclo}`, titulo: missao.recompensaTitulo, icone: missao.icone },
          update: {},
        });
      }
      novas.push({ titulo: missao.titulo, recompensa: missao.recompensaTitulo, icone: missao.icone });
      await notificar({
        userId, assunto: `missao.concluida.${missao.id}.${ciclo}`,
        titulo: "Missão concluída", corpo: `${missao.titulo}${missao.recompensaTitulo ? ` · Recompensa: ${missao.recompensaTitulo}` : ""}`,
        link: "/app/missoes", categoria: "MISSAO", dedupeHoras: 8_760, enviarPushAgora: false,
      });
    }
  }
  return novas;
}

export async function missoesDoAluno(userId: string, courseId?: string) {
  await avaliarMissoes(userId);
  const agora = new Date();
  const missoes = await prisma.mission.findMany({
    where: {
      ativo: true,
      AND: [
        { OR: [{ iniciaEm: null }, { iniciaEm: { lte: agora } }] },
        { OR: [{ terminaEm: null }, { terminaEm: { gte: agora } }] },
        // Missão de outro curso não aparece; a de `courseId` nulo, sim —
        // manter a ofensiva vale em qualquer curso.
        ...(courseId ? [{ OR: [{ courseId }, { courseId: null }] }] : []),
      ],
    },
    orderBy: [{ tipo: "asc" }, { criadoEm: "asc" }],
  });
  return Promise.all(missoes.map(async (m) => {
    const { ciclo } = limites(m.tipo);
    const estado = await prisma.userMission.findUnique({ where: { userId_missionId_ciclo: { userId, missionId: m.id, ciclo } } });
    return { ...m, progresso: estado?.progresso ?? 0, concluida: Boolean(estado?.concluidoEm) };
  }));
}

export async function minhasMissoes(courseId?: string) {
  const user = await exigirAluno();
  return missoesDoAluno(user.id, courseId);
}

export async function minhasRecompensas() {
  const user = await exigirAluno();
  return prisma.userReward.findMany({ where: { userId: user.id }, orderBy: { recebidoEm: "desc" } });
}

export async function dadosGamificacaoAdmin(curso?: CursoAdmin | null) {
  await exigirAdmin();
  const [missoes, conquistas, licoes] = await Promise.all([
    prisma.mission.findMany({
      where: doCursoAdmin(curso ?? null),
      orderBy: { criadoEm: "desc" },
    }),
    prisma.achievement.findMany({
      where: doCursoAdmin(curso ?? null),
      orderBy: { ordem: "asc" },
    }),
    // A lição pertence a um módulo, que pertence a um curso: sem este
    // filtro o seletor de "atividade específica" ofereceria lições de
    // outro curso, criando missão que o aluno nunca cumpriria.
    prisma.lesson.findMany({
      where: curso ? { module: { courseId: curso.id } } : {},
      orderBy: [{ module: { ordem: "asc" } }, { ordem: "asc" }],
      select: { id: true, titulo: true, xpRecompensa: true, tipo: true, module: { select: { titulo: true } } },
    }),
  ]);
  return { missoes, conquistas, licoes };
}

export async function salvarMissao(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const titulo = String(dados.get("titulo") ?? "").trim();
  const alvo = Math.max(1, Number(dados.get("alvo") ?? 1));
  if (!titulo) return;
  const dataOpcional = (chave: string) => {
    const valor = String(dados.get(chave) ?? "").trim();
    if (!valor) return null;
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  };
  const payload = {
    titulo, descricao: String(dados.get("descricao") ?? "").trim(),
    tipo: String(dados.get("tipo") ?? "SEMANAL") as TipoMissao,
    criterio: String(dados.get("criterio") ?? "licoes"), alvo,
    icone: String(dados.get("icone") ?? "metas"),
    recompensaTitulo: String(dados.get("recompensaTitulo") ?? "").trim() || null,
    lessonId: String(dados.get("lessonId") ?? "").trim() || null,
    ativo: String(dados.get("ativo") ?? "") === "on",
    oculto: String(dados.get("oculto") ?? "") === "on",
    iniciaEm: dataOpcional("iniciaEm"),
    terminaEm: dataOpcional("terminaEm"),
  };
  if (id) await prisma.mission.update({ where: { id }, data: payload });
  else await prisma.mission.create({ data: { ...payload, chave: `admin-${Date.now()}` } });
  await registrarAcao({ acao: "gamificacao.missao_salva", entidade: "Mission", entidadeId: id || undefined, resumo: `${admin.nome}: ${titulo}` });
  revalidatePath("/admin/gamificacao"); revalidatePath("/app/missoes");
}

export async function alternarMissao(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const ativa = String(dados.get("ativa") ?? "") === "true";
  if (id) await prisma.mission.update({ where: { id }, data: { ativo: ativa } });
  revalidatePath("/admin/gamificacao");
}

export async function salvarXpLicao(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const xp = Math.max(0, Math.min(500, Number(dados.get("xp") ?? 0)));
  if (id) await prisma.lesson.update({ where: { id }, data: { xpRecompensa: xp } });
  revalidatePath("/admin/gamificacao"); revalidatePath("/app/trilha");
}

export async function salvarConquista(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const titulo = String(dados.get("titulo") ?? "").trim();
  if (!titulo) return;
  const criterio = {
    tipo: String(dados.get("criterioTipo") ?? "licoes"),
    valor: Math.max(1, Number(dados.get("criterioValor") ?? 1)),
  };
  const payload = {
    titulo,
    descricao: String(dados.get("descricao") ?? "").trim(),
    icone: String(dados.get("icone") ?? "conquistas").trim() || "conquistas",
    criterio,
    oculto: String(dados.get("oculto") ?? "") === "on",
    recompensaTitulo: String(dados.get("recompensaTitulo") ?? "").trim() || null,
  };
  if (id) await prisma.achievement.update({ where: { id }, data: payload });
  else {
    const ordem = await prisma.achievement.count();
    await prisma.achievement.create({ data: { ...payload, chave: `admin-${Date.now()}`, ordem } });
  }
  await registrarAcao({ acao: "gamificacao.conquista_salva", entidade: "Achievement", entidadeId: id || undefined, resumo: `${admin.nome}: ${titulo}` });
  revalidatePath("/admin/gamificacao"); revalidatePath("/app/conquistas");
}
