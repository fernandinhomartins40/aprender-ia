"use server";

import { revalidatePath } from "next/cache";
import {
  prisma,
  type Periodicidade,
  type StatusAssinatura,
} from "@aprender/db";
import { exigirAdmin } from "./admin";
import { sincronizarPlanoLegado } from "./acesso";
import { registrarAcao } from "./auditoria";
import { notificar } from "./notificacoes";
import { lerNumero } from "./configuracoes";
import {
  somarPeriodo,
  competenciaDe,
  receitaRecorrenteMensal,
  slugificar,
} from "@/lib/assinaturas";
import { reais } from "@/lib/dinheiro";

/**
 * Planos, assinaturas, cobranças e inadimplência.
 *
 * O pagamento é lançado à mão: não há integração com meio de pagamento, e
 * o schema já reserva os campos `gateway*` para quando houver — assim
 * plugar um provedor não exige migration nem reescrever este módulo.
 *
 * A regra que organiza tudo: a assinatura é a fonte da verdade do acesso
 * pago, e `User.plano`/`User.premiumAte` são o reflexo dela. Manter os
 * dois em sincronia numa única transação evita o pior dos casos — o aluno
 * pagar e continuar bloqueado, ou cancelar e continuar entrando.
 */

export type ResultadoAssinatura = { ok: boolean; mensagem: string };

/* ============================================================
   PLANOS
   ============================================================ */

export async function salvarPlano(
  _anterior: ResultadoAssinatura | null,
  dados: FormData,
): Promise<ResultadoAssinatura> {
  await exigirAdmin();

  const id = String(dados.get("id") ?? "").trim();
  const nome = String(dados.get("nome") ?? "").trim();
  const descricao = String(dados.get("descricao") ?? "").trim();
  const periodicidade = String(dados.get("periodicidade") ?? "MENSAL") as Periodicidade;
  const precoReais = Number(String(dados.get("preco") ?? "0").replace(/\./g, "").replace(",", "."));
  const diasAcesso = Number(dados.get("diasAcesso") ?? 0);
  const diasTeste = Number(dados.get("diasTeste") ?? 0);
  const ativo = String(dados.get("ativo") ?? "") === "on";
  const publico = String(dados.get("publico") ?? "") === "on";
  const destaque = String(dados.get("destaque") ?? "") === "on";
  const ordem = Number(dados.get("ordem") ?? 0) || 0;

  if (!nome) return { ok: false, mensagem: "Dê um nome ao plano." };
  if (!Number.isFinite(precoReais) || precoReais < 0) {
    return { ok: false, mensagem: "Preço inválido." };
  }
  if (!["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL", "UNICA"].includes(periodicidade)) {
    return { ok: false, mensagem: "Periodicidade inválida." };
  }
  // Pagamento único sem prazo de acesso não define nada: quanto tempo o
  // aluno teria direito? Melhor barrar do que gravar um plano ambíguo.
  if (periodicidade === "UNICA" && (!Number.isFinite(diasAcesso) || diasAcesso <= 0)) {
    return {
      ok: false,
      mensagem: "Em pagamento único, informe quantos dias de acesso a compra libera.",
    };
  }

  const beneficios = String(dados.get("beneficios") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const gratuito = String(dados.get("gratuito") ?? "") === "on";

  // Plano gratuito com preço seria contraditório, e o preço é o que a
  // landing exibe. Zeramos em vez de recusar: marcar "gratuito" já
  // declara a intenção com clareza suficiente.
  const precoCentavos = gratuito ? 0 : Math.round(precoReais * 100);

  // Dias de acesso gratuito deste plano.
  //
  // Campo vazio e zero são coisas DIFERENTES, e a distinção é o ponto todo:
  // vazio (null) significa "não opino, use o padrão da plataforma"; zero
  // significa "acesso sem expiração". Um `Number("")` devolve 0, então
  // converter sem checar transformaria "não opino" em "nunca expira" —
  // liberando acesso vitalício sem ninguém ter pedido.
  const diasFreeBruto = String(dados.get("diasFree") ?? "").trim();
  const diasFree =
    !gratuito || diasFreeBruto === ""
      ? null
      : Number.isFinite(Number(diasFreeBruto)) && Number(diasFreeBruto) >= 0
        ? Math.round(Number(diasFreeBruto))
        : null;

  const base = {
    nome,
    descricao: descricao || null,
    precoCentavos,
    periodicidade,
    diasAcesso: periodicidade === "UNICA" ? Math.round(diasAcesso) : null,
    diasFree,
    diasTeste: Number.isFinite(diasTeste) && diasTeste > 0 ? Math.round(diasTeste) : 0,
    gratuito,
    ativo,
    publico,
    destaque,
    ordem,
    beneficios,
  };

  // Só um plano pode ser o gratuito. O banco garante por índice parcial;
  // aqui damos a mensagem antes de o erro cru do Postgres subir.
  if (gratuito) {
    const outro = await prisma.plan.findFirst({
      where: { gratuito: true, ...(id ? { id: { not: id } } : {}) },
      select: { nome: true },
    });
    if (outro) {
      return {
        ok: false,
        mensagem: `"${outro.nome}" já é o plano gratuito. Desmarque-o antes de definir outro.`,
      };
    }
  }

  if (id) {
    const antes = await prisma.plan.findUnique({ where: { id } });
    if (!antes) return { ok: false, mensagem: "Plano não encontrado." };

    await prisma.plan.update({ where: { id }, data: base });

    await registrarAcao({
      acao: "plano.alterado",
      entidade: "Plan",
      entidadeId: id,
      resumo: `Plano "${nome}" alterado`,
      dados: {
        de: { preco: antes.precoCentavos, periodicidade: antes.periodicidade, ativo: antes.ativo },
        para: { preco: base.precoCentavos, periodicidade: base.periodicidade, ativo: base.ativo },
      },
    });

    revalidatePath("/admin/planos");
    revalidatePath("/");
    // Mudar o preço não reajusta ninguém: o valor fica travado na
    // assinatura, e dizer isso na tela evita a expectativa errada.
    const avisoPreco =
      antes.precoCentavos !== base.precoCentavos
        ? " O novo preço vale para novas assinaturas; as atuais mantêm o valor contratado."
        : "";
    return { ok: true, mensagem: `Plano "${nome}" salvo.${avisoPreco}` };
  }

  // Slug único: o nome pode repetir entre um plano arquivado e um novo.
  const raiz = slugificar(nome) || "plano";
  let slug = raiz;
  for (let n = 2; await prisma.plan.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${raiz}-${n}`;
  }

  const criado = await prisma.plan.create({ data: { ...base, slug } });

  await registrarAcao({
    acao: "plano.criado",
    entidade: "Plan",
    entidadeId: criado.id,
    resumo: `Plano "${nome}" criado — ${reais(base.precoCentavos)} ${base.periodicidade}`,
  });

  revalidatePath("/admin/planos");
  revalidatePath("/");
  return { ok: true, mensagem: `Plano "${nome}" criado.` };
}

/**
 * Apaga um plano — só se nunca foi assinado.
 *
 * Com assinatura, apagar destruiria o histórico financeiro de quem pagou.
 * O caminho nesse caso é desativar: o plano sai da vitrine e as
 * assinaturas seguem valendo.
 */
export async function excluirPlano(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  if (!id) return;

  const plano = await prisma.plan.findUnique({
    where: { id },
    select: { nome: true, _count: { select: { assinaturas: true } } },
  });
  if (!plano) return;

  if (plano._count.assinaturas > 0) {
    await prisma.plan.update({ where: { id }, data: { ativo: false, publico: false } });
    await registrarAcao({
      acao: "plano.desativado",
      entidade: "Plan",
      entidadeId: id,
      resumo: `Plano "${plano.nome}" desativado (tem ${plano._count.assinaturas} assinatura(s), não pode ser apagado)`,
    });
  } else {
    await prisma.plan.delete({ where: { id } });
    await registrarAcao({
      acao: "plano.excluido",
      entidade: "Plan",
      entidadeId: id,
      resumo: `Plano "${plano.nome}" excluído`,
    });
  }

  revalidatePath("/admin/planos");
  revalidatePath("/");
}

export async function listarPlanos(cursoId?: string) {
  await exigirAdmin();
  try {
    return await prisma.plan.findMany({
      // Um plano cobre vários cursos (PlanCourse), então filtrar por curso
      // é "os planos que dão acesso a este". Plano sem curso nenhum é o
      // que vale para a plataforma toda, e por isso entra em qualquer
      // recorte — some-lo do filtro esconderia o gratuito.
      where: cursoId
        ? { OR: [{ cursos: { some: { courseId: cursoId } } }, { cursos: { none: {} } }] }
        : {},
      // O gratuito primeiro: é o plano que define o piso de acesso de
      // todo mundo, e vê-lo no topo evita configurá-lo por último.
      orderBy: [{ gratuito: "desc" }, { ativo: "desc" }, { ordem: "asc" }, { precoCentavos: "asc" }],
      include: {
        _count: { select: { assinaturas: true, cursos: true } },
        assinaturas: {
          where: { status: { in: ["ATIVA", "INADIMPLENTE"] } },
          select: { precoCentavos: true, periodicidade: true, status: true },
        },
      },
    });
  } catch (e) {
    console.error("[assinaturas] listarPlanos indisponível (migration pendente?).", e);
    return [];
  }
}

/** Planos visíveis na landing — sem exigir admin. */
export async function planosPublicos() {
  try {
    return await prisma.plan.findMany({
      where: { ativo: true, publico: true },
      orderBy: [{ ordem: "asc" }, { precoCentavos: "asc" }],
      select: {
        id: true, nome: true, slug: true, descricao: true,
        precoCentavos: true, periodicidade: true, diasAcesso: true,
        diasTeste: true, destaque: true, beneficios: true,
      },
    });
  } catch {
    return [];
  }
}

/* ============================================================
   ASSINATURAS
   ============================================================ */

/**
 * Cria a assinatura e já gera a primeira cobrança.
 *
 * Tudo numa transação: uma assinatura sem cobrança some do financeiro, e
 * uma cobrança sem assinatura não dá acesso a nada. Os dois estados
 * parciais são piores que a falha inteira.
 */
export async function criarAssinatura(
  _anterior: ResultadoAssinatura | null,
  dados: FormData,
): Promise<ResultadoAssinatura> {
  const admin = await exigirAdmin();

  const userId = String(dados.get("userId") ?? "");
  const planId = String(dados.get("planId") ?? "");
  const inicioTexto = String(dados.get("inicioEm") ?? "").trim();
  const observacoes = String(dados.get("observacoes") ?? "").trim();
  const jaPago = String(dados.get("jaPago") ?? "") === "on";
  const formaPagamento = String(dados.get("formaPagamento") ?? "").trim();

  if (!userId || !planId) {
    return { ok: false, mensagem: "Escolha o aluno e o plano." };
  }

  const [aluno, plano] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { nome: true } }),
    prisma.plan.findUnique({ where: { id: planId } }),
  ]);
  if (!aluno || !plano) return { ok: false, mensagem: "Aluno ou plano não encontrado." };

  const aberta = await prisma.subscription.findFirst({
    where: { userId, status: { in: ["ATIVA", "INADIMPLENTE"] } },
    select: { id: true },
  });
  if (aberta) {
    return {
      ok: false,
      mensagem: "Esse aluno já tem assinatura em aberto. Cancele a atual antes de criar outra.",
    };
  }

  const inicio = inicioTexto ? new Date(`${inicioTexto}T12:00:00`) : new Date();
  // O teste adia a primeira cobrança, mas o acesso começa hoje: é o que
  // "período de teste" significa para quem está usando.
  const primeiroVencimento = plano.diasTeste > 0
    ? new Date(inicio.getTime() + plano.diasTeste * 86_400_000)
    : inicio;
  const cicloFim = somarPeriodo(primeiroVencimento, plano.periodicidade, plano.diasAcesso);

  await prisma.$transaction(async (tx) => {
    const assinatura = await tx.subscription.create({
      data: {
        userId,
        planId,
        precoCentavos: plano.precoCentavos,
        periodicidade: plano.periodicidade,
        status: "ATIVA",
        inicioEm: inicio,
        cicloFimEm: cicloFim,
        // Pagamento único não tem próxima cobrança.
        proximaEm: plano.periodicidade === "UNICA" ? null : cicloFim,
        observacoes: observacoes || null,
      },
    });

    await tx.payment.create({
      data: {
        userId,
        subscriptionId: assinatura.id,
        descricao: `${plano.nome} — ${plano.periodicidade === "UNICA" ? "pagamento único" : "1ª cobrança"}`,
        valorCentavos: plano.precoCentavos,
        tipo: plano.periodicidade === "UNICA" ? "UNICO" : "RECORRENTE",
        status: jaPago ? "PAGO" : "PENDENTE",
        vencimentoEm: primeiroVencimento,
        pagoEm: jaPago ? new Date() : null,
        formaPagamento: jaPago ? formaPagamento || null : null,
        competencia: plano.periodicidade === "UNICA" ? null : competenciaDe(primeiroVencimento),
      },
    });

    // O acesso pago do aluno é reflexo da assinatura.
    await tx.user.update({
      where: { id: userId },
      data: { plano: "PREMIUM", premiumAte: cicloFim, situacao: "ATIVO" },
    });
  });

  // O enum `User.plano` é espelho, não fonte: recalculado a partir do
  // conjunto de assinaturas. A transação acima já o marcou PREMIUM, mas
  // só esta chamada acerta `premiumAte` quando o aluno tem mais de um
  // plano — o maior prazo entre eles é que vale.
  await sincronizarPlanoLegado(userId);

  await registrarAcao({
    acao: "assinatura.criada",
    entidade: "Subscription",
    entidadeId: userId,
    resumo: `${aluno.nome} assinou "${plano.nome}" (${reais(plano.precoCentavos)})`,
    dados: { planId, jaPago, cicloFim },
  });

  await notificar({
    userId,
    assunto: "assinatura.criada",
    titulo: "Sua assinatura está ativa",
    corpo:
      `Olá, ${aluno.nome}!\n\n` +
      `Sua assinatura do plano ${plano.nome} está ativa e seu acesso vale até ` +
      `${cicloFim.toLocaleDateString("pt-BR")}.\n\n` +
      (jaPago
        ? "O pagamento já está registrado. Bons estudos!"
        : `A primeira cobrança de ${reais(plano.precoCentavos)} vence em ${primeiroVencimento.toLocaleDateString("pt-BR")}.`),
    link: "/app",
    porEmail: true,
    autorNome: admin.nome,
  });

  revalidatePath("/admin/assinaturas");
  revalidatePath("/admin/cobrancas");
  revalidatePath("/admin/alunos");

  return {
    ok: true,
    mensagem: `Assinatura de ${aluno.nome} criada. Acesso até ${cicloFim.toLocaleDateString("pt-BR")}.`,
  };
}

/**
 * Cancela a assinatura.
 *
 * O acesso vale até o fim do ciclo já pago — cortar na hora seria cobrar
 * por um período e não entregá-lo. `premiumAte` continua como está e a
 * expiração natural encerra o acesso.
 */
export async function cancelarAssinatura(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();

  const id = String(dados.get("id") ?? "");
  const motivo = String(dados.get("motivo") ?? "").trim();
  if (!id) return;

  const assinatura = await prisma.subscription.findUnique({
    where: { id },
    include: { user: { select: { id: true, nome: true } }, plan: { select: { nome: true } } },
  });
  if (!assinatura || assinatura.status === "CANCELADA") return;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id },
      data: {
        status: "CANCELADA",
        canceladoEm: new Date(),
        motivoCancelamento: motivo || null,
        canceladoPor: "admin",
        proximaEm: null,
      },
    });

    // Cobrança futura em aberto deixa de fazer sentido; a vencida fica,
    // porque dívida não desaparece com o cancelamento.
    await tx.payment.updateMany({
      where: { subscriptionId: id, status: "PENDENTE" },
      data: { status: "CANCELADO" },
    });
  });

  // Sem isto o aluno cancelado continuava PREMIUM no enum para sempre —
  // ninguém o rebaixava. E quem tem outro plano ativo NÃO deve perder o
  // PREMIUM ao cancelar um só: por isso recalculamos do conjunto, em vez
  // de escrever FREE direto.
  await sincronizarPlanoLegado(assinatura.user.id);

  await registrarAcao({
    acao: "assinatura.cancelada",
    entidade: "Subscription",
    entidadeId: id,
    resumo: `Assinatura de ${assinatura.user.nome} ("${assinatura.plan.nome}") cancelada`,
    dados: { motivo: motivo || null, acessoAte: assinatura.cicloFimEm },
  });

  await notificar({
    userId: assinatura.user.id,
    assunto: "assinatura.cancelada",
    titulo: "Sua assinatura foi cancelada",
    corpo:
      `Olá, ${assinatura.user.nome}.\n\n` +
      `Sua assinatura do plano ${assinatura.plan.nome} foi cancelada.` +
      (assinatura.cicloFimEm
        ? ` Seu acesso continua até ${assinatura.cicloFimEm.toLocaleDateString("pt-BR")}, já que esse período estava pago.`
        : "") +
      "\n\nSe foi um engano, fale com a coordenação.",
    porEmail: true,
    autorNome: admin.nome,
  });

  revalidatePath("/admin/assinaturas");
  revalidatePath("/admin/cobrancas");
}

/** Reativa uma assinatura cancelada, começando um ciclo novo de hoje. */
export async function reativarAssinatura(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  if (!id) return;

  const assinatura = await prisma.subscription.findUnique({
    where: { id },
    include: { user: { select: { id: true, nome: true } }, plan: true },
  });
  if (!assinatura) return;

  const hoje = new Date();
  const cicloFim = somarPeriodo(hoje, assinatura.periodicidade, assinatura.plan.diasAcesso);

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id },
      data: {
        status: "ATIVA",
        canceladoEm: null,
        motivoCancelamento: null,
        canceladoPor: null,
        falhasSeguidas: 0,
        cicloFimEm: cicloFim,
        proximaEm: assinatura.periodicidade === "UNICA" ? null : cicloFim,
      },
    });
    await tx.user.update({
      where: { id: assinatura.userId },
      data: { plano: "PREMIUM", premiumAte: cicloFim, situacao: "ATIVO" },
    });
  });

  await registrarAcao({
    acao: "assinatura.reativada",
    entidade: "Subscription",
    entidadeId: id,
    resumo: `Assinatura de ${assinatura.user.nome} reativada até ${cicloFim.toLocaleDateString("pt-BR")}`,
  });

  revalidatePath("/admin/assinaturas");
  revalidatePath("/admin/alunos");
}

/**
 * Gera a próxima cobrança do ciclo e empurra o acesso.
 *
 * Só faz sentido depois que a atual foi quitada, e a competência evita
 * lançar duas vezes o mesmo mês — clicar duas vezes no botão não deve
 * cobrar o aluno em dobro.
 */
export async function gerarProximaCobranca(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  if (!id) return;

  const assinatura = await prisma.subscription.findUnique({
    where: { id },
    include: { plan: { select: { nome: true, diasAcesso: true } } },
  });
  if (!assinatura || assinatura.periodicidade === "UNICA") return;
  if (assinatura.status === "CANCELADA" || assinatura.status === "EXPIRADA") return;

  const vencimento = assinatura.proximaEm ?? new Date();
  const competencia = competenciaDe(vencimento);

  const jaExiste = await prisma.payment.findFirst({
    where: { subscriptionId: id, competencia, status: { not: "CANCELADO" } },
    select: { id: true },
  });
  if (jaExiste) return;

  const novoFim = somarPeriodo(vencimento, assinatura.periodicidade, assinatura.plan.diasAcesso);

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        userId: assinatura.userId,
        subscriptionId: id,
        descricao: `${assinatura.plan.nome} — ${competencia}`,
        valorCentavos: assinatura.precoCentavos,
        tipo: "RECORRENTE",
        status: "PENDENTE",
        vencimentoEm: vencimento,
        competencia,
      },
    });
    await tx.subscription.update({
      where: { id },
      data: { cicloFimEm: novoFim, proximaEm: novoFim },
    });
  });

  await registrarAcao({
    acao: "assinatura.cobranca_gerada",
    entidade: "Subscription",
    entidadeId: id,
    resumo: `Cobrança ${competencia} de ${reais(assinatura.precoCentavos)} gerada`,
  });

  revalidatePath("/admin/assinaturas");
  revalidatePath("/admin/cobrancas");
}

/**
 * Quita uma cobrança de assinatura.
 *
 * Faz o que a baixa avulsa não faz: zera as falhas, tira a assinatura da
 * inadimplência, reativa a conta suspensa e estende o acesso. Quitar sem
 * devolver o acesso é o bug que mais irrita quem acabou de pagar.
 */
export async function quitarCobranca(dados: FormData): Promise<void> {
  await exigirAdmin();

  const paymentId = String(dados.get("paymentId") ?? "");
  const forma = String(dados.get("formaPagamento") ?? "").trim() || null;
  if (!paymentId) return;

  const cobranca = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      assinatura: { include: { plan: { select: { diasAcesso: true } } } },
      user: { select: { id: true, nome: true } },
    },
  });
  if (!cobranca || cobranca.status === "PAGO") return;

  const assinatura = cobranca.assinatura;
  const novoFim = assinatura
    ? somarPeriodo(
        // Ciclo futuro soma a partir dele; vencido soma de hoje, senão o
        // aluno pagaria por dias que já passaram.
        assinatura.cicloFimEm && assinatura.cicloFimEm > new Date()
          ? assinatura.cicloFimEm
          : new Date(),
        assinatura.periodicidade,
        assinatura.plan.diasAcesso,
      )
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: "PAGO", pagoEm: new Date(), formaPagamento: forma },
    });

    if (assinatura && novoFim) {
      await tx.subscription.update({
        where: { id: assinatura.id },
        data: {
          status: "ATIVA",
          falhasSeguidas: 0,
          cicloFimEm: novoFim,
          proximaEm: assinatura.periodicidade === "UNICA" ? null : novoFim,
        },
      });
      await tx.user.update({
        where: { id: cobranca.userId },
        data: { plano: "PREMIUM", premiumAte: novoFim, situacao: "ATIVO" },
      });
    } else {
      // Cobrança avulsa: pelo menos devolve a conta suspensa por atraso.
      await tx.user.updateMany({
        where: { id: cobranca.userId, situacao: "SUSPENSO" },
        data: { situacao: "ATIVO" },
      });
    }
  });

  await registrarAcao({
    acao: "cobranca.quitada",
    entidade: "Payment",
    entidadeId: paymentId,
    resumo: `${cobranca.user.nome}: ${reais(cobranca.valorCentavos)} quitado${forma ? ` (${forma})` : ""}`,
    dados: { acessoAte: novoFim },
  });

  await notificar({
    userId: cobranca.userId,
    assunto: "pagamento.confirmado",
    titulo: "Pagamento confirmado",
    corpo:
      `Olá, ${cobranca.user.nome}!\n\n` +
      `Recebemos o pagamento de ${reais(cobranca.valorCentavos)} (${cobranca.descricao}).` +
      (novoFim ? `\n\nSeu acesso está garantido até ${novoFim.toLocaleDateString("pt-BR")}.` : "") +
      "\n\nObrigado!",
    link: "/app",
    porEmail: true,
  });

  revalidatePath("/admin/assinaturas");
  revalidatePath("/admin/cobrancas");
  revalidatePath("/admin/alunos");
}

/* ============================================================
   INADIMPLÊNCIA
   ============================================================ */

/**
 * Passa a régua nos vencimentos.
 *
 * Roda em toda abertura das telas financeiras em vez de depender de um
 * agendador: a VPS não tem cron configurado, e um indicador que só está
 * certo se alguém lembrar de rodar um script não é confiável.
 *
 * A suspensão respeita `financeiro.dias_suspender_atraso`; com 0, nunca
 * suspende sozinha — quem ministra curso para rede pública costuma
 * preferir conversar antes de cortar o acesso.
 */
export async function conciliarVencimentos(): Promise<{
  atrasadas: number;
  suspensas: number;
  expiradas: number;
}> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  try {
    const diasParaSuspender = await lerNumero("financeiro.dias_suspender_atraso");

    // 1. Cobrança vencida vira ATRASADO.
    const atrasadas = await prisma.payment.updateMany({
      where: { status: "PENDENTE", vencimentoEm: { lt: hoje } },
      data: { status: "ATRASADO" },
    });

    // 2. Assinatura com cobrança atrasada fica INADIMPLENTE.
    const comAtraso = await prisma.subscription.findMany({
      where: {
        status: "ATIVA",
        cobrancas: { some: { status: "ATRASADO" } },
      },
      select: { id: true, cobrancas: { where: { status: "ATRASADO" }, select: { id: true } } },
    });

    for (const a of comAtraso) {
      await prisma.subscription.update({
        where: { id: a.id },
        data: { status: "INADIMPLENTE", falhasSeguidas: a.cobrancas.length },
      });
    }

    // 3. Suspende quem passou do limite de tolerância.
    let suspensas = 0;
    if (diasParaSuspender > 0) {
      const limite = new Date(hoje.getTime() - diasParaSuspender * 86_400_000);
      const paraSuspender = await prisma.subscription.findMany({
        where: {
          status: "INADIMPLENTE",
          cobrancas: { some: { status: "ATRASADO", vencimentoEm: { lt: limite } } },
          user: { situacao: "ATIVO" },
        },
        select: { userId: true, id: true },
      });

      for (const a of paraSuspender) {
        await prisma.user.update({
          where: { id: a.userId },
          data: { situacao: "SUSPENSO" },
        });
        await registrarAcao({
          acao: "aluno.suspenso_por_atraso",
          entidade: "User",
          entidadeId: a.userId,
          resumo: `Acesso suspenso automaticamente: atraso acima de ${diasParaSuspender} dia(s)`,
        });
        suspensas++;
      }
    }

    // 4. Assinatura cujo ciclo terminou e não tem mais cobrança: EXPIRADA.
    //
    // `semExpiracao` fica de fora: um acesso vitalício nunca vence, e sem
    // esta condição a conciliação o expiraria junto com os demais.
    const paraExpirar = await prisma.subscription.findMany({
      where: {
        status: { in: ["ATIVA", "INADIMPLENTE"] },
        periodicidade: "UNICA",
        semExpiracao: false,
        cicloFimEm: { lt: hoje },
      },
      select: { id: true, userId: true },
    });

    const expiradas = await prisma.subscription.updateMany({
      where: { id: { in: paraExpirar.map((s) => s.id) } },
      data: { status: "EXPIRADA", proximaEm: null },
    });

    // Quem perdeu a última assinatura paga volta a FREE no enum. Sem
    // isto, o espelho ficaria PREMIUM para sempre depois de expirar.
    for (const userId of new Set(paraExpirar.map((s) => s.userId))) {
      await sincronizarPlanoLegado(userId);
    }

    return {
      atrasadas: atrasadas.count,
      suspensas,
      expiradas: expiradas.count,
    };
  } catch (e) {
    console.error("[assinaturas] conciliação indisponível (migration pendente?).", e);
    return { atrasadas: 0, suspensas: 0, expiradas: 0 };
  }
}

/** Alunos com cobrança vencida, do atraso mais antigo para o mais novo. */
export async function listarInadimplentes() {
  await exigirAdmin();
  try {
    return await prisma.payment.findMany({
      where: { status: "ATRASADO" },
      orderBy: { vencimentoEm: "asc" },
      take: 200,
      include: {
        user: {
          select: {
            id: true, nome: true, email: true, telefone: true,
            situacao: true, plano: true,
          },
        },
        assinatura: {
          select: { id: true, status: true, falhasSeguidas: true, plan: { select: { nome: true } } },
        },
      },
    });
  } catch {
    return [];
  }
}

/* ============================================================
   INDICADORES
   ============================================================ */

export async function indicadoresAssinaturas() {
  await exigirAdmin();

  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const [porStatus, ativas, canceladasNoMes, novasNoMes, receberMes, recebidoMes] =
      await Promise.all([
        prisma.subscription.groupBy({ by: ["status"], _count: { status: true } }),
        prisma.subscription.findMany({
          where: { status: { in: ["ATIVA", "INADIMPLENTE"] } },
          select: { precoCentavos: true, periodicidade: true, status: true },
        }),
        prisma.subscription.count({
          where: { status: "CANCELADA", canceladoEm: { gte: inicioMes } },
        }),
        prisma.subscription.count({ where: { criadoEm: { gte: inicioMes } } }),
        prisma.payment.aggregate({
          where: { status: { in: ["PENDENTE", "ATRASADO"] } },
          _sum: { valorCentavos: true },
        }),
        prisma.payment.aggregate({
          where: { status: "PAGO", pagoEm: { gte: inicioMes } },
          _sum: { valorCentavos: true },
        }),
      ]);

    const contagem = (s: StatusAssinatura) =>
      porStatus.find((p) => p.status === s)?._count.status ?? 0;

    const totalAtivas = contagem("ATIVA") + contagem("INADIMPLENTE");
    const mrr = receitaRecorrenteMensal(ativas);

    // Churn do mês: canceladas sobre a base do início do mês (ativas de
    // hoje + as que saíram). Sem base, churn é 0 e não divisão por zero.
    const base = totalAtivas + canceladasNoMes;
    const churnPct = base > 0 ? Math.round((canceladasNoMes / base) * 1000) / 10 : 0;

    return {
      ativas: contagem("ATIVA"),
      inadimplentes: contagem("INADIMPLENTE"),
      canceladas: contagem("CANCELADA"),
      expiradas: contagem("EXPIRADA"),
      totalAtivas,
      mrr,
      ticketMedio: totalAtivas > 0 ? Math.round(mrr / totalAtivas) : 0,
      novasNoMes,
      canceladasNoMes,
      churnPct,
      aReceber: receberMes._sum.valorCentavos ?? 0,
      recebidoMes: recebidoMes._sum.valorCentavos ?? 0,
      indisponivel: false,
    };
  } catch (e) {
    console.error("[assinaturas] indicadores indisponíveis (migration pendente?).", e);
    return {
      ativas: 0, inadimplentes: 0, canceladas: 0, expiradas: 0, totalAtivas: 0,
      mrr: 0, ticketMedio: 0, novasNoMes: 0, canceladasNoMes: 0, churnPct: 0,
      aReceber: 0, recebidoMes: 0, indisponivel: true,
    };
  }
}

export async function listarAssinaturas(status?: StatusAssinatura) {
  await exigirAdmin();
  try {
    return await prisma.subscription.findMany({
      where: status ? { status } : {},
      orderBy: [{ status: "asc" }, { proximaEm: "asc" }],
      take: 200,
      include: {
        user: { select: { id: true, nome: true, email: true, telefone: true, situacao: true } },
        plan: { select: { id: true, nome: true } },
        cobrancas: {
          where: { status: { in: ["PENDENTE", "ATRASADO"] } },
          orderBy: { vencimentoEm: "asc" },
          select: { id: true, valorCentavos: true, vencimentoEm: true, status: true, descricao: true },
        },
      },
    });
  } catch {
    return [];
  }
}

/** A assinatura do aluno logado, para a tela "Meu acesso". */
export async function minhaAssinatura(userId: string) {
  try {
    return await prisma.subscription.findFirst({
      where: { userId, status: { in: ["ATIVA", "INADIMPLENTE"] } },
      orderBy: { criadoEm: "desc" },
      include: {
        plan: { select: { nome: true, beneficios: true } },
        cobrancas: {
          where: { status: { in: ["PENDENTE", "ATRASADO"] } },
          orderBy: { vencimentoEm: "asc" },
          select: { valorCentavos: true, vencimentoEm: true, status: true, descricao: true },
        },
      },
    });
  } catch {
    return null;
  }
}
