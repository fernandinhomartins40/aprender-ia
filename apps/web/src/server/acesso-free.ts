"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { auth } from "@aprender/auth";
import { templateDe } from "@aprender/auth/credenciais-email";
import {
  enviarEmail,
  montarEmailAcessoAprovado,
  montarEmailAcessoRecusado,
} from "@aprender/auth/email";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { lerNumero, lerBooleano, lerTexto } from "./configuracoes";
import { prazoEmDias, avaliarFree } from "@/lib/acesso-free";

/**
 * Acesso gratuito: prazo, revogação e pedidos de renovação.
 *
 * Duas regras que valem para todo este módulo:
 *
 *  - Um pedido NUNCA libera acesso sozinho. Ele existe para que a
 *    liberação passe por você; aprovar é um ato administrativo explícito.
 *  - E-mail nunca derruba a operação. Se o SMTP falhar, o acesso já foi
 *    concedido e o painel mostra que o aviso não saiu.
 *
 * Alunos cadastrados em lote têm e-mail interno @aluno.aprenderia.site,
 * que não recebe mensagem. Para esses o aviso não é enviado — o painel
 * indica isso para você avisar por WhatsApp.
 */

export type ResultadoAcesso = { ok: boolean; mensagem: string };

const DOMINIO_INTERNO = "aluno.aprenderia.site";

function ehEmailInterno(email: string): boolean {
  return email.toLowerCase().endsWith(`@${DOMINIO_INTERNO}`);
}

function dataBR(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(d);
}

async function baseUrl(): Promise<string> {
  return (
    process.env.PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://aprenderia.site"
  );
}

/* ============================================================
   CONCESSÃO NO CADASTRO
   ============================================================ */

/**
 * Prazo inicial do acesso gratuito.
 *
 * Chamado no cadastro (público, em lote e individual). A precedência vai do
 * mais específico para o mais geral:
 *
 *   1. `diasFree` do plano gratuito ativo — quando o administrador definiu
 *      um prazo para aquele plano;
 *   2. `free.dias_padrao` das configurações — o padrão da plataforma.
 *
 * Nos dois, 0 significa "sem expiração" e devolve nulo. Um plano com
 * `diasFree` nulo NÃO zera o prazo: ele apenas não opina, e a configuração
 * global decide — que é exatamente o comportamento anterior a este campo,
 * preservado para que nada mude sem o administrador pedir.
 *
 * O prazo por ALUNO não entra aqui. Ele é aplicado depois, por
 * `definirPrazoFree`/`prorrogarFree`, e sobrepõe o que esta função devolveu.
 */
export async function prazoFreeInicial(): Promise<Date | null> {
  const planoGratuito = await prisma.plan.findFirst({
    where: { gratuito: true, ativo: true },
    select: { diasFree: true },
  });

  if (planoGratuito?.diasFree != null) {
    return prazoEmDias(planoGratuito.diasFree);
  }

  const dias = await lerNumero("free.dias_padrao");
  return prazoEmDias(dias);
}

/* ============================================================
   AÇÕES DO ADMINISTRADOR
   ============================================================ */

export async function definirPrazoFree(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  const dias = Number(String(dados.get("dias") ?? "0"));
  if (!userId || !Number.isFinite(dias)) return;

  const antes = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true, freeAte: true },
  });
  if (!antes) return;

  const novo = prazoEmDias(dias);

  await prisma.user.update({
    where: { id: userId },
    data: {
      freeAte: novo,
      freeConcedidoEm: new Date(),
      // Definir prazo novo desfaz uma revogação anterior.
      freeRevogadoEm: null,
    },
  });

  await registrarAcao({
    acao: "aluno.free.prazo_definido",
    entidade: "User",
    entidadeId: userId,
    resumo: novo
      ? `${antes.nome}: acesso gratuito até ${dataBR(novo)} (${dias} dias)`
      : `${antes.nome}: acesso gratuito sem prazo`,
    dados: { de: antes.freeAte, para: novo, dias, por: admin.nome },
  });

  revalidatePath("/admin/alunos");
  revalidatePath("/admin/solicitacoes");
}

export async function prorrogarFree(dados: FormData): Promise<void> {
  await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  const dias = Number(String(dados.get("dias") ?? "0"));
  if (!userId || !Number.isFinite(dias) || dias <= 0) return;

  const conta = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true, freeAte: true },
  });
  if (!conta) return;

  // Prorrogar parte do prazo atual quando ele ainda está no futuro; de
  // um prazo vencido, conta a partir de hoje — senão a prorrogação seria
  // consumida pelo tempo já passado.
  const partida =
    conta.freeAte && conta.freeAte.getTime() > Date.now()
      ? new Date(conta.freeAte)
      : new Date();
  partida.setDate(partida.getDate() + dias);
  partida.setHours(23, 59, 59, 999);

  await prisma.user.update({
    where: { id: userId },
    data: { freeAte: partida, freeRevogadoEm: null },
  });

  await registrarAcao({
    acao: "aluno.free.prorrogado",
    entidade: "User",
    entidadeId: userId,
    resumo: `${conta.nome}: +${dias} dias de acesso gratuito (até ${dataBR(partida)})`,
    dados: { de: conta.freeAte, para: partida, dias },
  });

  revalidatePath("/admin/alunos");
}

export async function revogarFree(dados: FormData): Promise<void> {
  await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  if (!userId) return;

  const conta = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true },
  });
  if (!conta) return;

  await prisma.user.update({
    where: { id: userId },
    data: { freeRevogadoEm: new Date() },
  });

  await registrarAcao({
    acao: "aluno.free.revogado",
    entidade: "User",
    entidadeId: userId,
    resumo: `${conta.nome}: acesso gratuito revogado`,
  });

  revalidatePath("/admin/alunos");
}

export async function reativarFree(dados: FormData): Promise<void> {
  await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  const dias = Number(String(dados.get("dias") ?? "0")) || 0;
  if (!userId) return;

  const conta = await prisma.user.findUnique({
    where: { id: userId },
    select: { nome: true },
  });
  if (!conta) return;

  const novo = dias > 0 ? prazoEmDias(dias) : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      freeRevogadoEm: null,
      ...(dias > 0 ? { freeAte: novo, freeConcedidoEm: new Date() } : {}),
    },
  });

  await registrarAcao({
    acao: "aluno.free.reativado",
    entidade: "User",
    entidadeId: userId,
    resumo: novo
      ? `${conta.nome}: acesso gratuito reativado até ${dataBR(novo)}`
      : `${conta.nome}: acesso gratuito reativado sem prazo`,
  });

  revalidatePath("/admin/alunos");
}

/* ============================================================
   PEDIDO DO ALUNO
   ============================================================ */

export async function solicitarAcesso(
  _anterior: ResultadoAcesso | null,
  dados: FormData,
): Promise<ResultadoAcesso> {
  const sessao = await auth();
  if (!sessao?.user) return { ok: false, mensagem: "Faça login para solicitar." };

  const habilitado = await lerBooleano("free.permite_solicitar_novo");
  if (!habilitado) {
    return {
      ok: false,
      mensagem:
        "Os pedidos de novo acesso estão fechados no momento. Fale com a coordenação.",
    };
  }

  const conta = await prisma.user.findUnique({
    where: { id: sessao.user.id },
    select: {
      nome: true,
      freeAte: true,
      freeRevogadoEm: true,
      _count: { select: { solicitacoes: true } },
    },
  });
  if (!conta) return { ok: false, mensagem: "Conta não encontrada." };

  // Um pedido pendente por vez: dois pedidos abertos só geram fila
  // duplicada para você decidir.
  const pendente = await prisma.accessRequest.findFirst({
    where: { userId: sessao.user.id, status: "PENDENTE" },
    select: { id: true },
  });
  if (pendente) {
    return {
      ok: true,
      mensagem:
        "Você já tem um pedido em análise. Avisaremos assim que houver resposta.",
    };
  }

  const maximo = await lerNumero("free.max_solicitacoes");
  if (maximo > 0 && conta._count.solicitacoes >= maximo) {
    return {
      ok: false,
      mensagem:
        "Você já atingiu o limite de pedidos. Fale com a coordenação para liberar seu acesso.",
    };
  }

  await prisma.accessRequest.create({
    data: {
      userId: sessao.user.id,
      motivo: String(dados.get("motivo") ?? "").trim() || null,
      expiradoEm: conta.freeAte,
      ordem: conta._count.solicitacoes + 1,
    },
  });

  revalidatePath("/app/acesso");
  revalidatePath("/admin/solicitacoes");
  revalidatePath("/admin");

  return {
    ok: true,
    mensagem:
      "Pedido enviado. Você receberá a resposta assim que a coordenação analisar.",
  };
}

/* ============================================================
   DECISÃO DO ADMINISTRADOR
   ============================================================ */

export async function aprovarSolicitacao(
  _anterior: ResultadoAcesso | null,
  dados: FormData,
): Promise<ResultadoAcesso> {
  const admin = await exigirAdmin();

  const id = String(dados.get("id") ?? "");
  const diasInformado = Number(String(dados.get("dias") ?? "0"));
  if (!id) return { ok: false, mensagem: "Pedido não informado." };

  const pedido = await prisma.accessRequest.findUnique({
    where: { id },
    include: { user: { select: { id: true, nome: true, email: true } } },
  });
  if (!pedido) return { ok: false, mensagem: "Pedido não encontrado." };
  if (pedido.status !== "PENDENTE") {
    return { ok: false, mensagem: "Este pedido já foi decidido." };
  }

  const dias =
    Number.isFinite(diasInformado) && diasInformado > 0
      ? Math.round(diasInformado)
      : await lerNumero("free.dias_ao_aprovar");

  const novoPrazo = prazoEmDias(dias);

  // Conta e pedido mudam juntos: aprovar sem liberar o acesso (ou o
  // contrário) deixaria o aluno preso numa contradição.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: pedido.user.id },
      data: {
        freeAte: novoPrazo,
        freeConcedidoEm: new Date(),
        freeRevogadoEm: null,
      },
    }),
    prisma.accessRequest.update({
      where: { id },
      data: {
        status: "APROVADA",
        decididoEm: new Date(),
        decididoPor: admin.id,
        decisorNome: admin.nome,
        diasConcedidos: dias,
        observacao: String(dados.get("observacao") ?? "").trim() || null,
      },
    }),
  ]);

  await registrarAcao({
    acao: "solicitacao.aprovada",
    entidade: "AccessRequest",
    entidadeId: id,
    resumo: `${pedido.user.nome}: acesso liberado por ${dias} dia(s)${
      novoPrazo ? ` (até ${dataBR(novoPrazo)})` : " (sem prazo)"
    }`,
    dados: { dias, prazo: novoPrazo },
  });

  // Aviso ao aluno — nunca bloqueia a aprovação.
  let aviso = "";
  if (ehEmailInterno(pedido.user.email)) {
    aviso = " O aluno entra por telefone e não tem e-mail: avise por WhatsApp.";
  } else if (novoPrazo) {
    const link = `${await baseUrl()}/app`;
    const ate = dataBR(novoPrazo);
    const template = await templateDe("email.template.acesso_aprovado");
    const envio = await enviarEmail({
      para: pedido.user.email,
      ...montarEmailAcessoAprovado({ nome: pedido.user.nome, dias, ate, link }),
      ...(template
        ? {
            templateId: template,
            variaveis: { nome: pedido.user.nome.split(" ")[0] ?? "", dias, ate, link },
          }
        : {}),
    });
    if (!envio.entregue) aviso = " O e-mail de aviso não saiu (verifique o SMTP).";
  }

  revalidatePath("/admin/solicitacoes");
  revalidatePath("/admin/alunos");
  revalidatePath("/admin");

  return { ok: true, mensagem: `Acesso liberado por ${dias} dia(s).${aviso}` };
}

export async function recusarSolicitacao(
  _anterior: ResultadoAcesso | null,
  dados: FormData,
): Promise<ResultadoAcesso> {
  const admin = await exigirAdmin();

  const id = String(dados.get("id") ?? "");
  if (!id) return { ok: false, mensagem: "Pedido não informado." };

  const pedido = await prisma.accessRequest.findUnique({
    where: { id },
    include: { user: { select: { nome: true, email: true } } },
  });
  if (!pedido) return { ok: false, mensagem: "Pedido não encontrado." };
  if (pedido.status !== "PENDENTE") {
    return { ok: false, mensagem: "Este pedido já foi decidido." };
  }

  await prisma.accessRequest.update({
    where: { id },
    data: {
      status: "RECUSADA",
      decididoEm: new Date(),
      decididoPor: admin.id,
      decisorNome: admin.nome,
      observacao: String(dados.get("observacao") ?? "").trim() || null,
    },
  });

  await registrarAcao({
    acao: "solicitacao.recusada",
    entidade: "AccessRequest",
    entidadeId: id,
    resumo: `${pedido.user.nome}: pedido de acesso recusado`,
  });

  let aviso = "";
  if (!ehEmailInterno(pedido.user.email)) {
    const contato = (await lerTexto("plataforma.whatsapp_suporte")) || null;
    const template = await templateDe("email.template.acesso_recusado");
    const envio = await enviarEmail({
      para: pedido.user.email,
      ...montarEmailAcessoRecusado({ nome: pedido.user.nome, contato }),
      ...(template
        ? {
            templateId: template,
            variaveis: {
              nome: pedido.user.nome.split(" ")[0] ?? "",
              contato: contato ?? "",
            },
          }
        : {}),
    });
    if (!envio.entregue) aviso = " O e-mail de aviso não saiu.";
  } else {
    aviso = " O aluno entra por telefone: avise por WhatsApp.";
  }

  revalidatePath("/admin/solicitacoes");
  revalidatePath("/admin");

  return { ok: true, mensagem: `Pedido recusado.${aviso}` };
}

/* ============================================================
   CONSULTAS
   ============================================================ */

export async function listarSolicitacoes(status?: "PENDENTE" | "APROVADA" | "RECUSADA") {
  await exigirAdmin();

  const avisarDiasAntes = await lerNumero("free.avisar_dias_antes");

  const pedidos = await prisma.accessRequest.findMany({
    where: status ? { status } : {},
    orderBy: [{ status: "asc" }, { criadoEm: "desc" }],
    take: 200,
    include: {
      user: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          escola: true,
          criadoEm: true,
          ultimoAcessoEm: true,
          freeAte: true,
          freeRevogadoEm: true,
          plano: true,
          _count: { select: { solicitacoes: true } },
          matriculas: { select: { progressoPct: true }, take: 1 },
        },
      },
    },
  });

  return pedidos.map((p) => ({
    ...p,
    situacaoFree: avaliarFree(p.user, avisarDiasAntes),
    ehEmailInterno: ehEmailInterno(p.user.email),
    progresso: p.user.matriculas[0]?.progressoPct ?? 0,
  }));
}

export async function contarSolicitacoesPendentes(): Promise<number> {
  try {
    return await prisma.accessRequest.count({ where: { status: "PENDENTE" } });
  } catch {
    // A tabela pode não existir ainda (migration pendente).
    return 0;
  }
}

/** Situação do acesso do próprio aluno, para a área dele. */
export async function meuAcesso() {
  const sessao = await auth();
  if (!sessao?.user) return null;

  const [conta, avisarDiasAntes, podeSolicitar] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessao.user.id },
      select: {
        nome: true,
        plano: true,
        freeAte: true,
        freeRevogadoEm: true,
        premiumAte: true,
        _count: { select: { solicitacoes: true } },
        solicitacoes: {
          orderBy: { criadoEm: "desc" },
          take: 5,
          select: {
            id: true,
            status: true,
            criadoEm: true,
            decididoEm: true,
            diasConcedidos: true,
            motivo: true,
          },
        },
      },
    }),
    lerNumero("free.avisar_dias_antes"),
    lerBooleano("free.permite_solicitar_novo"),
  ]);

  if (!conta) return null;

  return {
    nome: conta.nome,
    plano: conta.plano,
    premiumAte: conta.premiumAte,
    situacao: avaliarFree(conta, avisarDiasAntes),
    solicitacoes: conta.solicitacoes,
    totalSolicitacoes: conta._count.solicitacoes,
    podeSolicitar,
    temPendente: conta.solicitacoes.some((s) => s.status === "PENDENTE"),
  };
}
