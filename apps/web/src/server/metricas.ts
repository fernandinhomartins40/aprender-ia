"use server";

import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { lerNumero } from "./configuracoes";
import type { Periodo } from "@/lib/periodo";

/**
 * Indicadores do painel.
 *
 * Duas regras que valem para tudo aqui:
 *
 *  - "Ativo" depende de `User.ultimoAcessoEm`, carimbado no login. Quem
 *    nunca entrou tem o campo nulo e conta como **nunca acessou**, não
 *    como inativo — são situações diferentes: uma pede reengajamento, a
 *    outra pede verificar se a credencial chegou à pessoa.
 *  - Dinheiro sempre em centavos, inteiro. Float com dinheiro acumula
 *    erro de arredondamento.
 */

/* ============================================================
   ALUNOS
   ============================================================ */

export async function indicadoresAlunos(periodo: Periodo) {
  await exigirAdmin();

  const diasInativo = await lerNumero("alunos.dias_para_inativo");
  const corteInatividade = new Date();
  corteInatividade.setDate(corteInatividade.getDate() - (diasInativo || 30));

  const soAlunos = { papel: "ALUNO" as const };

  // `ultimoAcessoEm` é coluna nova: enquanto a migration não roda, as três
  // contagens que dependem dela falham. Zero é uma degradação honesta —
  // a tela avisa que o dado ainda não está disponível.
  const contarTolerante = async (consulta: () => Promise<number>) => {
    try {
      return await consulta();
    } catch (e) {
      console.error("[metricas] contagem indisponível (migration pendente?).", e);
      return 0;
    }
  };

  const [
    total,
    novosNoPeriodo,
    ativos,
    inativos,
    nuncaAcessaram,
    free,
    premium,
    suspensos,
    premiumVencendo,
  ] = await Promise.all([
    prisma.user.count({ where: soAlunos }),
    prisma.user.count({
      where: { ...soAlunos, criadoEm: { gte: periodo.desde, lte: periodo.ate } },
    }),
    contarTolerante(() =>
      prisma.user.count({
        where: { ...soAlunos, ultimoAcessoEm: { gte: corteInatividade } },
      }),
    ),
    contarTolerante(() =>
      prisma.user.count({
        where: { ...soAlunos, ultimoAcessoEm: { lt: corteInatividade } },
      }),
    ),
    contarTolerante(() =>
      prisma.user.count({ where: { ...soAlunos, ultimoAcessoEm: null } }),
    ),
    prisma.user.count({ where: { ...soAlunos, plano: "FREE" } }),
    prisma.user.count({ where: { ...soAlunos, plano: "PREMIUM" } }),
    prisma.user.count({ where: { ...soAlunos, situacao: "SUSPENSO" } }),
    // Premium que expira nos próximos 7 dias — fila de renovação.
    prisma.user.count({
      where: {
        ...soAlunos,
        plano: "PREMIUM",
        premiumAte: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 86_400_000),
        },
      },
    }),
  ]);

  // Conversão free → pago: proporção de quem é pagante hoje sobre o total.
  // É uma foto do estado atual, não coorte; a tela diz isso.
  const conversao = total > 0 ? (premium / total) * 100 : 0;

  return {
    total,
    novosNoPeriodo,
    ativos,
    inativos,
    nuncaAcessaram,
    free,
    premium,
    suspensos,
    premiumVencendo,
    conversao,
    diasInativo: diasInativo || 30,
  };
}

/* ============================================================
   FINANCEIRO
   ============================================================ */

export async function indicadoresFinanceiros(periodo: Periodo) {
  await exigirAdmin();

  const [recebido, aReceber, atrasado, recorrentesAtivas, inadimplentes] =
    await Promise.all([
      prisma.payment.aggregate({
        where: { status: "PAGO", pagoEm: { gte: periodo.desde, lte: periodo.ate } },
        _sum: { valorCentavos: true },
        _count: true,
        _avg: { valorCentavos: true },
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
      // Receita recorrente: mensalidades ativas, uma por aluno.
      prisma.payment.findMany({
        where: { tipo: "RECORRENTE", status: { in: ["PAGO", "PENDENTE"] } },
        distinct: ["userId"],
        select: { valorCentavos: true },
      }),
      prisma.user.count({
        where: {
          papel: "ALUNO",
          pagamentos: { some: { status: "ATRASADO" } },
        },
      }),
    ]);

  const receitaRecorrente = recorrentesAtivas.reduce(
    (soma, p) => soma + p.valorCentavos,
    0,
  );

  return {
    recebido: recebido._sum.valorCentavos ?? 0,
    qtdRecebido: recebido._count,
    ticketMedio: Math.round(recebido._avg.valorCentavos ?? 0),
    aReceber: aReceber._sum.valorCentavos ?? 0,
    qtdAReceber: aReceber._count,
    atrasado: atrasado._sum.valorCentavos ?? 0,
    qtdAtrasado: atrasado._count,
    receitaRecorrente,
    inadimplentes,
  };
}

/* ============================================================
   SÉRIES TEMPORAIS
   ============================================================ */

export type PontoSerie = { rotulo: string; valor: number; chave: string };

/** Agrupa por dia ou por mês, conforme a largura do período. */
function bucketsDoPeriodo(periodo: Periodo): {
  granularidade: "dia" | "mes";
  chaves: { chave: string; rotulo: string; inicio: Date; fim: Date }[];
} {
  const dias = Math.ceil(
    (periodo.ate.getTime() - periodo.desde.getTime()) / 86_400_000,
  );
  const granularidade: "dia" | "mes" = dias > 92 ? "mes" : "dia";
  const chaves: { chave: string; rotulo: string; inicio: Date; fim: Date }[] = [];

  if (granularidade === "dia") {
    const cursor = new Date(periodo.desde);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= periodo.ate) {
      const inicio = new Date(cursor);
      const fim = new Date(cursor);
      fim.setHours(23, 59, 59, 999);
      chaves.push({
        chave: inicio.toISOString().slice(0, 10),
        rotulo: `${String(inicio.getDate()).padStart(2, "0")}/${String(inicio.getMonth() + 1).padStart(2, "0")}`,
        inicio,
        fim,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    const cursor = new Date(periodo.desde);
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= periodo.ate) {
      const inicio = new Date(cursor);
      const fim = new Date(cursor);
      fim.setMonth(fim.getMonth() + 1);
      fim.setDate(0);
      fim.setHours(23, 59, 59, 999);
      chaves.push({
        chave: inicio.toISOString().slice(0, 7),
        rotulo: `${String(inicio.getMonth() + 1).padStart(2, "0")}/${String(inicio.getFullYear()).slice(2)}`,
        inicio,
        fim,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return { granularidade, chaves };
}

/**
 * Séries do período: cadastros, matrículas, lições concluídas e receita.
 *
 * Buscamos as datas cruas e agrupamos em memória. Um `groupBy` por dia
 * exigiria SQL bruto para truncar a data, e o volume aqui é de centenas
 * de registros, não de milhões.
 */
export async function seriesDoPeriodo(periodo: Periodo) {
  await exigirAdmin();

  const { granularidade, chaves } = bucketsDoPeriodo(periodo);
  const noPeriodo = { gte: periodo.desde, lte: periodo.ate };

  const [cadastros, matriculas, licoes, pagamentos] = await Promise.all([
    prisma.user.findMany({
      where: { papel: "ALUNO", criadoEm: noPeriodo },
      select: { criadoEm: true },
    }),
    prisma.enrollment.findMany({
      where: { iniciadoEm: noPeriodo },
      select: { iniciadoEm: true },
    }),
    prisma.lessonProgress.findMany({
      where: { status: "CONCLUIDA", concluidoEm: noPeriodo },
      select: { concluidoEm: true },
    }),
    prisma.payment.findMany({
      where: { status: "PAGO", pagoEm: noPeriodo },
      select: { pagoEm: true, valorCentavos: true },
    }),
  ]);

  const corte = granularidade === "dia" ? 10 : 7;
  const contar = (datas: (Date | null)[]) => {
    const mapa = new Map<string, number>();
    for (const d of datas) {
      if (!d) continue;
      const k = d.toISOString().slice(0, corte);
      mapa.set(k, (mapa.get(k) ?? 0) + 1);
    }
    return mapa;
  };

  const mCadastros = contar(cadastros.map((c) => c.criadoEm));
  const mMatriculas = contar(matriculas.map((m) => m.iniciadoEm));
  const mLicoes = contar(licoes.map((l) => l.concluidoEm));

  const mReceita = new Map<string, number>();
  for (const p of pagamentos) {
    if (!p.pagoEm) continue;
    const k = p.pagoEm.toISOString().slice(0, corte);
    mReceita.set(k, (mReceita.get(k) ?? 0) + p.valorCentavos);
  }

  const serie = (mapa: Map<string, number>): PontoSerie[] =>
    chaves.map((c) => ({
      chave: c.chave,
      rotulo: c.rotulo,
      valor: mapa.get(c.chave) ?? 0,
    }));

  return {
    granularidade,
    cadastros: serie(mCadastros),
    matriculas: serie(mMatriculas),
    licoesConcluidas: serie(mLicoes),
    receita: serie(mReceita),
  };
}

/* ============================================================
   PROGRESSO E ENGAJAMENTO
   ============================================================ */

export async function indicadoresProgresso() {
  await exigirAdmin();

  const matriculas = await prisma.enrollment.findMany({
    select: { progressoPct: true, concluidoEm: true },
  });

  const total = matriculas.length;
  const concluidas = matriculas.filter((m) => m.concluidoEm).length;
  const soma = matriculas.reduce((s, m) => s + m.progressoPct, 0);

  // Faixas de progresso: ordenadas, então a leitura é a ordem, não a cor.
  const faixas = [
    { rotulo: "Não começou", min: 0, max: 0 },
    { rotulo: "1–25%", min: 1, max: 25 },
    { rotulo: "26–50%", min: 26, max: 50 },
    { rotulo: "51–75%", min: 51, max: 75 },
    { rotulo: "76–99%", min: 76, max: 99 },
    { rotulo: "Concluído", min: 100, max: 100 },
  ].map((f) => ({
    rotulo: f.rotulo,
    valor: matriculas.filter((m) => m.progressoPct >= f.min && m.progressoPct <= f.max)
      .length,
  }));

  // Parados: começaram, não terminaram e não acessam há mais de 14 dias.
  // Depende de `ultimoAcessoEm`, que só existe após a migration.
  const paradosHa = new Date();
  paradosHa.setDate(paradosHa.getDate() - 14);
  let parados = 0;
  try {
    parados = await prisma.user.count({
      where: {
        papel: "ALUNO",
        ultimoAcessoEm: { lt: paradosHa },
        matriculas: { some: { progressoPct: { gt: 0, lt: 100 } } },
      },
    });
  } catch (e) {
    console.error("[metricas] contagem de parados indisponível.", e);
  }

  return {
    matriculas: total,
    concluidas,
    progressoMedio: total > 0 ? Math.round(soma / total) : 0,
    faixas,
    parados,
  };
}

/**
 * Últimas ações administrativas, para o rodapé do dashboard.
 *
 * A tabela pode não existir ainda: o deploy sobe o container antes de
 * aplicar as migrations. Uma lista vazia é uma degradação aceitável —
 * derrubar o painel inteiro por causa do rodapé não é.
 */
export async function atividadeRecente(limite = 8) {
  await exigirAdmin();
  try {
    return await prisma.adminAuditLog.findMany({
      orderBy: { criadoEm: "desc" },
      take: limite,
      select: {
        id: true,
        acao: true,
        resumo: true,
        atorNome: true,
        criadoEm: true,
        entidade: true,
      },
    });
  } catch (e) {
    console.error("[metricas] atividadeRecente falhou; rodapé vazio.", e);
    return [];
  }
}
