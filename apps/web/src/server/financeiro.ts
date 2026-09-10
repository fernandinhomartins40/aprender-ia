"use server";

import { revalidatePath } from "next/cache";
import { prisma, type Plano, type SituacaoConta, type StatusPagamento } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { notificar } from "./notificacoes";

export type ResultadoFinanceiro = { ok: boolean; mensagem: string };

/* ============================================================
   PLANO E SITUAÇÃO DO ALUNO
   ============================================================ */

export async function definirPlano(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  const plano = String(dados.get("plano") ?? "") as Plano;
  const prazo = String(dados.get("premiumAte") ?? "").trim();

  if (!userId || !["FREE", "PREMIUM"].includes(plano)) return;
  // Um admin não rebaixa a si mesmo: ficaria sem acesso ao próprio painel.
  if (userId === admin.id) return;

  const antes = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true, plano: true, premiumAte: true },
  });
  if (!antes) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plano,
      // Voltar para FREE limpa o prazo: ele não significa nada sem premium.
      premiumAte: plano === "PREMIUM" && prazo ? new Date(prazo) : null,
    },
  });

  await registrarAcao({
    acao: "aluno.plano.alterado",
    entidade: "User",
    entidadeId: userId,
    resumo: `${antes.nome}: plano ${antes.plano} → ${plano}`,
    dados: { de: antes.plano, para: plano, premiumAte: prazo || null },
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/alunos");
}

export async function alternarSituacao(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  const situacao = String(dados.get("situacao") ?? "") as SituacaoConta;

  if (!userId || !["ATIVO", "SUSPENSO"].includes(situacao)) return;
  if (userId === admin.id) return;

  const alvo = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true, situacao: true },
  });
  if (!alvo) return;

  await prisma.user.update({ where: { id: userId }, data: { situacao } });

  await registrarAcao({
    acao: situacao === "SUSPENSO" ? "aluno.suspenso" : "aluno.reativado",
    entidade: "User",
    entidadeId: userId,
    resumo: `${alvo.nome}: conta ${alvo.situacao} → ${situacao}`,
  });

  // Ser bloqueado sem explicação é a pior experiência possível para quem
  // estava estudando; reativar também merece aviso.
  await notificar({
    userId,
    assunto: situacao === "SUSPENSO" ? "conta.suspensa" : "conta.reativada",
    titulo: situacao === "SUSPENSO" ? "Seu acesso foi suspenso" : "Seu acesso foi reativado",
    corpo:
      situacao === "SUSPENSO"
        ? `Olá, ${alvo.nome}.\n\nSeu acesso à plataforma foi suspenso. Todo o seu progresso continua guardado.\n\nFale com a coordenação para entender e resolver.`
        : `Olá, ${alvo.nome}!\n\nSeu acesso foi reativado. Você pode voltar a estudar de onde parou.`,
    link: "/app",
    porEmail: true,
    autorNome: admin.nome,
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/alunos");
}

/* ============================================================
   LANÇAMENTOS
   ============================================================ */

export async function lancarPagamento(dados: FormData): Promise<void> {
  await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  const descricao = String(dados.get("descricao") ?? "").trim();
  const valorReais = Number(String(dados.get("valor") ?? "0").replace(",", "."));
  const vencimento = String(dados.get("vencimentoEm") ?? "");
  const tipo = String(dados.get("tipo") ?? "UNICO");

  if (!userId || !descricao || !vencimento || !Number.isFinite(valorReais)) return;

  const venc = new Date(vencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  await prisma.payment.create({
    data: {
      userId,
      descricao,
      // Guardamos em centavos: float com dinheiro acumula erro de arredondamento.
      valorCentavos: Math.round(valorReais * 100),
      tipo: tipo === "RECORRENTE" ? "RECORRENTE" : "UNICO",
      vencimentoEm: venc,
      status: venc < hoje ? "ATRASADO" : "PENDENTE",
      competencia:
        tipo === "RECORRENTE"
          ? `${venc.getFullYear()}-${String(venc.getMonth() + 1).padStart(2, "0")}`
          : null,
    },
  });

  revalidatePath("/admin/financeiro");
}

export async function registrarQuitacao(dados: FormData): Promise<void> {
  await exigirAdmin();

  const paymentId = String(dados.get("paymentId") ?? "");
  const forma = String(dados.get("formaPagamento") ?? "").trim() || null;
  if (!paymentId) return;

  const pagamento = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "PAGO", pagoEm: new Date(), formaPagamento: forma },
    select: { userId: true, tipo: true, vencimentoEm: true },
  });

  // Quitar reativa a conta suspensa — foi por inadimplência que ela caiu.
  await prisma.user.updateMany({
    where: { id: pagamento.userId, situacao: "SUSPENSO" },
    data: { situacao: "ATIVO" },
  });

  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/alunos");
}

export async function cancelarLancamento(dados: FormData): Promise<void> {
  await exigirAdmin();
  const paymentId = String(dados.get("paymentId") ?? "");
  if (!paymentId) return;

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "CANCELADO" },
  });
  revalidatePath("/admin/financeiro");
}

/**
 * Gera a próxima cobrança de uma mensalidade, um mês após a atual.
 * Evita duplicar quando a competência seguinte já existe.
 */
export async function gerarProximaMensalidade(dados: FormData): Promise<void> {
  await exigirAdmin();

  const paymentId = String(dados.get("paymentId") ?? "");
  if (!paymentId) return;

  const base = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!base || base.tipo !== "RECORRENTE") return;

  const proximo = new Date(base.vencimentoEm);
  proximo.setMonth(proximo.getMonth() + 1);
  const competencia = `${proximo.getFullYear()}-${String(proximo.getMonth() + 1).padStart(2, "0")}`;

  const jaExiste = await prisma.payment.findFirst({
    where: { userId: base.userId, competencia, status: { not: "CANCELADO" } },
    select: { id: true },
  });
  if (jaExiste) return;

  await prisma.payment.create({
    data: {
      userId: base.userId,
      descricao: base.descricao,
      valorCentavos: base.valorCentavos,
      tipo: "RECORRENTE",
      vencimentoEm: proximo,
      status: "PENDENTE",
      competencia,
    },
  });

  revalidatePath("/admin/financeiro");
}

/* ============================================================
   CONSULTAS
   ============================================================ */

/** Marca como ATRASADO o que venceu e não foi pago. */
async function atualizarAtrasados() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  await prisma.payment.updateMany({
    where: { status: "PENDENTE", vencimentoEm: { lt: hoje } },
    data: { status: "ATRASADO" },
  });
}

export async function resumoFinanceiro() {
  await exigirAdmin();
  await atualizarAtrasados();

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [recebidoMes, aReceber, atrasado, premium, suspensos, totalAlunos] =
    await Promise.all([
      prisma.payment.aggregate({
        where: { status: "PAGO", pagoEm: { gte: inicioMes } },
        _sum: { valorCentavos: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: "PENDENTE" },
        _sum: { valorCentavos: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: "ATRASADO" },
        _sum: { valorCentavos: true },
        _count: true,
      }),
      prisma.user.count({ where: { plano: "PREMIUM" } }),
      prisma.user.count({ where: { situacao: "SUSPENSO" } }),
      prisma.user.count({ where: { papel: "ALUNO" } }),
    ]);

  return {
    recebidoMes: recebidoMes._sum.valorCentavos ?? 0,
    qtdRecebidoMes: recebidoMes._count,
    aReceber: aReceber._sum.valorCentavos ?? 0,
    qtdAReceber: aReceber._count,
    atrasado: atrasado._sum.valorCentavos ?? 0,
    qtdAtrasado: atrasado._count,
    premium,
    suspensos,
    totalAlunos,
  };
}

export async function listarLancamentos(filtro?: StatusPagamento) {
  await exigirAdmin();
  await atualizarAtrasados();

  return prisma.payment.findMany({
    where: filtro ? { status: filtro } : {},
    orderBy: [{ status: "asc" }, { vencimentoEm: "asc" }],
    take: 200,
    include: {
      user: {
        select: {
          id: true, nome: true, email: true, telefone: true,
          plano: true, situacao: true, premiumAte: true,
        },
      },
    },
  });
}

export async function listarAlunosPagantes() {
  await exigirAdmin();

  return prisma.user.findMany({
    where: { papel: "ALUNO" },
    orderBy: [{ plano: "desc" }, { nome: "asc" }],
    select: {
      id: true, nome: true, email: true, telefone: true,
      plano: true, situacao: true, premiumAte: true,
      _count: { select: { pagamentos: true } },
      pagamentos: {
        where: { status: { in: ["PENDENTE", "ATRASADO"] } },
        select: { valorCentavos: true, vencimentoEm: true, status: true },
        orderBy: { vencimentoEm: "asc" },
        take: 1,
      },
    },
  });
}
