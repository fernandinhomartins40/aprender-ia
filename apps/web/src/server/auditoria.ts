"use server";

import { headers } from "next/headers";
import { prisma } from "@aprender/db";
import { auth } from "@aprender/auth";
import { exigirAdmin } from "./admin";

/**
 * Registro de ações administrativas.
 *
 * Toda ação que altera dado de outra pessoa deveria passar por aqui: sem
 * histórico, "quem mudou o plano deste aluno?" não tem resposta. O nome do
 * ator é gravado junto do id porque um log que perde a autoria quando a
 * conta é apagada não serve como log.
 *
 * Falha ao registrar nunca derruba a ação em si — perder a auditoria é
 * ruim, impedir o administrador de trabalhar é pior.
 */

export type EntradaAuditoria = {
  acao: string;
  entidade: string;
  entidadeId?: string | null;
  resumo: string;
  dados?: unknown;
};

export async function registrarAcao(entrada: EntradaAuditoria): Promise<void> {
  try {
    const sessao = await auth();
    if (!sessao?.user) return;

    let ip: string | null = null;
    let userAgent: string | null = null;
    try {
      const h = await headers();
      // Atrás do nginx o IP real vem no cabeçalho encaminhado.
      ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      userAgent = h.get("user-agent");
    } catch {
      /* fora de requisição (job, seed): segue sem origem */
    }

    await prisma.adminAuditLog.create({
      data: {
        atorId: sessao.user.id,
        atorNome: sessao.user.nome || sessao.user.email || "desconhecido",
        acao: entrada.acao,
        entidade: entrada.entidade,
        entidadeId: entrada.entidadeId ?? null,
        resumo: entrada.resumo.slice(0, 500),
        dados: entrada.dados === undefined ? undefined : JSON.parse(JSON.stringify(entrada.dados)),
        ip,
        userAgent,
      },
    });
  } catch (e) {
    console.error("Falha ao registrar auditoria:", e);
  }
}

/* ============================================================
   CONSULTA
   ============================================================ */

export type FiltroAuditoria = {
  acao?: string;
  entidade?: string;
  atorId?: string;
  desde?: Date;
  ate?: Date;
  pagina?: number;
};

export async function listarAuditoria(filtro: FiltroAuditoria = {}) {
  await exigirAdmin();

  const porPagina = 50;
  const pagina = Math.max(1, filtro.pagina ?? 1);

  const where = {
    ...(filtro.acao ? { acao: { contains: filtro.acao } } : {}),
    ...(filtro.entidade ? { entidade: filtro.entidade } : {}),
    ...(filtro.atorId ? { atorId: filtro.atorId } : {}),
    ...(filtro.desde || filtro.ate
      ? {
          criadoEm: {
            ...(filtro.desde ? { gte: filtro.desde } : {}),
            ...(filtro.ate ? { lte: filtro.ate } : {}),
          },
        }
      : {}),
  };

  const [total, registros, acoes] = await Promise.all([
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    // Para montar o filtro sem inventar uma lista fixa de ações.
    prisma.adminAuditLog.groupBy({
      by: ["acao"],
      _count: { acao: true },
      orderBy: { _count: { acao: "desc" } },
      take: 30,
    }),
  ]);

  return {
    total,
    registros,
    paginas: Math.max(1, Math.ceil(total / porPagina)),
    pagina,
    acoesDisponiveis: acoes.map((a) => ({ acao: a.acao, usos: a._count.acao })),
  };
}

/** Histórico de um registro específico — usado nas telas de detalhe. */
export async function historicoDe(entidade: string, entidadeId: string) {
  await exigirAdmin();
  return prisma.adminAuditLog.findMany({
    where: { entidade, entidadeId },
    orderBy: { criadoEm: "desc" },
    take: 20,
  });
}
