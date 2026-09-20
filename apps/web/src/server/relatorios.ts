"use server";

import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { lerNumero } from "./configuracoes";

/**
 * Relatórios com filtro e exportação.
 *
 * Tudo que sai daqui é linha achatada, pronta para virar tabela ou CSV. Os
 * indicadores do dashboard respondem "como estamos?"; um relatório responde
 * "quem, exatamente?" — e é essa lista que serve para agir.
 */

export type FiltroRelatorio = {
  tipo: "alunos" | "financeiro" | "progresso" | "presenca";
  turmaId?: string;
  /**
   * Recorte por curso.
   *
   * Cada relatório chega ao curso por um caminho diferente — o aluno pela
   * matrícula, o encontro pela turma —, então o filtro é montado em cada
   * um e não num `where` comum. O financeiro não tem recorte: uma cobrança
   * é do aluno, não de um curso.
   */
  cursoId?: string;
  desde?: string;
  ate?: string;
  situacao?: string;
};

export type LinhaRelatorio = Record<string, string | number>;

export type Relatorio = {
  titulo: string;
  colunas: string[];
  linhas: LinhaRelatorio[];
  /// Somatórios que fazem sentido para este relatório.
  resumo: { rotulo: string; valor: string }[];
};

function periodo(filtro: FiltroRelatorio) {
  const desde = filtro.desde ? new Date(`${filtro.desde}T00:00:00`) : undefined;
  const ate = filtro.ate ? new Date(`${filtro.ate}T23:59:59`) : undefined;
  return { desde, ate };
}

function dataCurta(d: Date | null | undefined): string {
  return d ? new Date(d).toLocaleDateString("pt-BR") : "—";
}

function moeda(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function gerarRelatorio(filtro: FiltroRelatorio): Promise<Relatorio> {
  await exigirAdmin();
  const { desde, ate } = periodo(filtro);

  try {
    if (filtro.tipo === "financeiro") return await relatorioFinanceiro(desde, ate, filtro);
    if (filtro.tipo === "progresso") return await relatorioProgresso(filtro);
    if (filtro.tipo === "presenca") return await relatorioPresenca(filtro);
    return await relatorioAlunos(desde, ate, filtro);
  } catch (e) {
    console.error("[relatorios] falha ao gerar:", e);
    return {
      titulo: "Relatório indisponível",
      colunas: [],
      linhas: [],
      resumo: [
        {
          rotulo: "Erro",
          valor: "Não foi possível gerar agora. Se o deploy acabou de rodar, tente de novo.",
        },
      ],
    };
  }
}

/* ============================================================
   ALUNOS
   ============================================================ */

async function relatorioAlunos(
  desde: Date | undefined,
  ate: Date | undefined,
  filtro: FiltroRelatorio,
): Promise<Relatorio> {
  const diasInativo = await lerNumero("alunos.dias_para_inativo");
  const corte = new Date(Date.now() - diasInativo * 86_400_000);

  const alunos = await prisma.user.findMany({
    where: {
      papel: "ALUNO",
      ...(desde || ate ? { criadoEm: { ...(desde ? { gte: desde } : {}), ...(ate ? { lte: ate } : {}) } } : {}),
      ...(filtro.turmaId ? { membroTurmas: { some: { cohortId: filtro.turmaId } } } : {}),
      // O aluno pertence ao curso pela matrícula.
      ...(filtro.cursoId ? { matriculas: { some: { courseId: filtro.cursoId } } } : {}),
      ...(filtro.situacao === "ativos" ? { ultimoAcessoEm: { gte: corte } } : {}),
      ...(filtro.situacao === "inativos"
        ? { OR: [{ ultimoAcessoEm: null }, { ultimoAcessoEm: { lt: corte } }] }
        : {}),
      ...(filtro.situacao === "premium" ? { plano: "PREMIUM" } : {}),
      ...(filtro.situacao === "free" ? { plano: "FREE" } : {}),
      ...(filtro.situacao === "suspensos" ? { situacao: "SUSPENSO" } : {}),
    },
    orderBy: { criadoEm: "desc" },
    select: {
      nome: true, email: true, telefone: true, escola: true, disciplina: true,
      plano: true, situacao: true, criadoEm: true, ultimoAcessoEm: true,
      freeAte: true, premiumAte: true,
      matriculas: { select: { progressoPct: true } },
      membroTurmas: { select: { cohort: { select: { nome: true } } }, take: 1 },
    },
  });

  const linhas: LinhaRelatorio[] = alunos.map((a) => ({
    Nome: a.nome,
    Contato: a.telefone ?? a.email,
    Escola: a.escola ?? "—",
    Disciplina: a.disciplina ?? "—",
    Turma: a.membroTurmas[0]?.cohort.nome ?? "sem turma",
    Plano: a.plano,
    Conta: a.situacao,
    "Progresso (%)": a.matriculas[0]?.progressoPct ?? 0,
    Cadastro: dataCurta(a.criadoEm),
    "Último acesso": dataCurta(a.ultimoAcessoEm),
    "Acesso até": dataCurta(a.plano === "PREMIUM" ? a.premiumAte : a.freeAte),
  }));

  const ativos = alunos.filter((a) => a.ultimoAcessoEm && a.ultimoAcessoEm >= corte).length;
  const progressoMedio =
    alunos.length > 0
      ? Math.round(
          alunos.reduce((s, a) => s + (a.matriculas[0]?.progressoPct ?? 0), 0) / alunos.length,
        )
      : 0;

  return {
    titulo: "Alunos",
    colunas: Object.keys(linhas[0] ?? {
      Nome: "", Contato: "", Escola: "", Disciplina: "", Turma: "",
      Plano: "", Conta: "", "Progresso (%)": 0, Cadastro: "",
      "Último acesso": "", "Acesso até": "",
    }),
    linhas,
    resumo: [
      { rotulo: "Alunos", valor: String(alunos.length) },
      { rotulo: `Ativos (${diasInativo}d)`, valor: String(ativos) },
      { rotulo: "Inativos", valor: String(alunos.length - ativos) },
      { rotulo: "Progresso médio", valor: `${progressoMedio}%` },
    ],
  };
}

/* ============================================================
   FINANCEIRO
   ============================================================ */

async function relatorioFinanceiro(
  desde: Date | undefined,
  ate: Date | undefined,
  filtro: FiltroRelatorio,
): Promise<Relatorio> {
  const cobrancas = await prisma.payment.findMany({
    where: {
      ...(desde || ate
        ? { vencimentoEm: { ...(desde ? { gte: desde } : {}), ...(ate ? { lte: ate } : {}) } }
        : {}),
      ...(filtro.situacao && filtro.situacao !== "todos"
        ? { status: filtro.situacao.toUpperCase() as "PAGO" | "PENDENTE" | "ATRASADO" | "CANCELADO" }
        : {}),
    },
    orderBy: { vencimentoEm: "desc" },
    include: {
      user: { select: { nome: true, email: true, telefone: true } },
      assinatura: { select: { plan: { select: { nome: true } } } },
    },
  });

  const linhas: LinhaRelatorio[] = cobrancas.map((c) => ({
    Aluno: c.user.nome,
    Contato: c.user.telefone ?? c.user.email,
    Cobrança: c.descricao,
    Plano: c.assinatura?.plan.nome ?? "avulso",
    Valor: moeda(c.valorCentavos),
    Tipo: c.tipo,
    Situação: c.status,
    Vencimento: dataCurta(c.vencimentoEm),
    Pagamento: dataCurta(c.pagoEm),
    Forma: c.formaPagamento ?? "—",
    Competência: c.competencia ?? "—",
  }));

  const soma = (status: string) =>
    cobrancas.filter((c) => c.status === status).reduce((s, c) => s + c.valorCentavos, 0);

  return {
    titulo: "Financeiro",
    colunas: Object.keys(linhas[0] ?? {
      Aluno: "", Contato: "", Cobrança: "", Plano: "", Valor: "", Tipo: "",
      Situação: "", Vencimento: "", Pagamento: "", Forma: "", Competência: "",
    }),
    linhas,
    resumo: [
      { rotulo: "Lançamentos", valor: String(cobrancas.length) },
      { rotulo: "Recebido", valor: moeda(soma("PAGO")) },
      { rotulo: "A receber", valor: moeda(soma("PENDENTE")) },
      { rotulo: "Em atraso", valor: moeda(soma("ATRASADO")) },
    ],
  };
}

/* ============================================================
   PROGRESSO
   ============================================================ */

async function relatorioProgresso(filtro: FiltroRelatorio): Promise<Relatorio> {
  const matriculas = await prisma.enrollment.findMany({
    where: {
      ...(filtro.turmaId
        ? { user: { membroTurmas: { some: { cohortId: filtro.turmaId } } } }
        : {}),
      // Aqui o curso é direto: a matrícula é a ligação aluno–curso.
      ...(filtro.cursoId ? { courseId: filtro.cursoId } : {}),
    },
    orderBy: { progressoPct: "desc" },
    include: {
      user: {
        select: {
          nome: true, email: true, telefone: true, ultimoAcessoEm: true,
          ofensiva: { select: { diasSeguidos: true } },
          membroTurmas: { select: { cohort: { select: { nome: true } } }, take: 1 },
        },
      },
      course: { select: { titulo: true } },
      progressos: { where: { status: "CONCLUIDA" }, select: { id: true } },
    },
  });

  const linhas: LinhaRelatorio[] = matriculas.map((m) => ({
    Aluno: m.user.nome,
    Contato: m.user.telefone ?? m.user.email,
    Turma: m.user.membroTurmas[0]?.cohort.nome ?? "sem turma",
    Curso: m.course.titulo,
    "Progresso (%)": m.progressoPct,
    "Lições concluídas": m.progressos.length,
    XP: m.xpTotal,
    Ofensiva: m.user.ofensiva?.diasSeguidos ?? 0,
    "Último acesso": dataCurta(m.user.ultimoAcessoEm),
    Conclusão: dataCurta(m.concluidoEm),
  }));

  const concluidos = matriculas.filter((m) => m.concluidoEm).length;
  const medio =
    matriculas.length > 0
      ? Math.round(matriculas.reduce((s, m) => s + m.progressoPct, 0) / matriculas.length)
      : 0;
  // Quem nunca passou de zero é o grupo que precisa de contato, não de
  // relatório: por isso vale um número próprio.
  const semComecar = matriculas.filter((m) => m.progressoPct === 0).length;

  return {
    titulo: "Progresso",
    colunas: Object.keys(linhas[0] ?? {
      Aluno: "", Contato: "", Turma: "", Curso: "", "Progresso (%)": 0,
      "Lições concluídas": 0, XP: 0, Ofensiva: 0, "Último acesso": "", Conclusão: "",
    }),
    linhas,
    resumo: [
      { rotulo: "Matrículas", valor: String(matriculas.length) },
      { rotulo: "Progresso médio", valor: `${medio}%` },
      { rotulo: "Concluíram", valor: String(concluidos) },
      { rotulo: "Não começaram", valor: String(semComecar) },
    ],
  };
}

/* ============================================================
   PRESENÇA
   ============================================================ */

async function relatorioPresenca(filtro: FiltroRelatorio): Promise<Relatorio> {
  const encontros = await prisma.cohortMeeting.findMany({
    where: {
      ...(filtro.turmaId ? { cohortId: filtro.turmaId } : {}),
      // O encontro chega ao curso pela turma, que sempre tem um.
      ...(filtro.cursoId ? { cohort: { courseId: filtro.cursoId } } : {}),
      canceladoEm: null,
    },
    orderBy: { data: "asc" },
    include: {
      cohort: { select: { nome: true, _count: { select: { membros: true } } } },
      presencas: { select: { situacao: true } },
    },
  });

  const linhas: LinhaRelatorio[] = encontros.map((e) => {
    const presentes = e.presencas.filter((p) => p.situacao === "PRESENTE").length;
    const faltas = e.presencas.filter((p) => p.situacao === "FALTA").length;
    const justificadas = e.presencas.filter((p) => p.situacao === "JUSTIFICADA").length;
    const inscritos = e.cohort._count.membros;

    return {
      Turma: e.cohort.nome,
      Encontro: e.titulo ?? `Encontro ${e.ordem}`,
      Data: dataCurta(e.data),
      Horário: e.horaInicio ? `${e.horaInicio}${e.horaFim ? `–${e.horaFim}` : ""}` : "—",
      Modalidade: e.modalidade,
      Inscritos: inscritos,
      Presentes: presentes,
      Faltas: faltas,
      Justificadas: justificadas,
      // Sem chamada feita, a coluna diz isso em vez de mostrar 0% — que
      // pareceria "ninguém veio".
      "Presença (%)":
        e.presencas.length === 0
          ? "sem chamada"
          : `${Math.round((presentes / Math.max(1, inscritos)) * 100)}%`,
    };
  });

  const comChamada = encontros.filter((e) => e.presencas.length > 0);
  const mediaPresenca =
    comChamada.length > 0
      ? Math.round(
          comChamada.reduce((s, e) => {
            const p = e.presencas.filter((x) => x.situacao === "PRESENTE").length;
            return s + (p / Math.max(1, e.cohort._count.membros)) * 100;
          }, 0) / comChamada.length,
        )
      : 0;

  return {
    titulo: "Presença",
    colunas: Object.keys(linhas[0] ?? {
      Turma: "", Encontro: "", Data: "", Horário: "", Modalidade: "",
      Inscritos: 0, Presentes: 0, Faltas: 0, Justificadas: 0, "Presença (%)": "",
    }),
    linhas,
    resumo: [
      { rotulo: "Encontros", valor: String(encontros.length) },
      { rotulo: "Com chamada", valor: String(comChamada.length) },
      { rotulo: "Presença média", valor: `${mediaPresenca}%` },
    ],
  };
}

/* ============================================================
   EXPORTAÇÃO
   ============================================================ */

/**
 * CSV do relatório.
 *
 * Separador ponto-e-vírgula e BOM UTF-8: é o que o Excel brasileiro abre
 * sem perguntar nada. Vírgula abriria tudo numa coluna só, e sem BOM os
 * acentos viram lixo — os dois erros que fazem o usuário achar que o
 * sistema exportou errado.
 */
export async function exportarCSV(filtro: FiltroRelatorio): Promise<string> {
  const rel = await gerarRelatorio(filtro);

  const escapar = (v: string | number) => {
    const s = String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const linhas = [
    rel.colunas.join(";"),
    ...rel.linhas.map((l) => rel.colunas.map((c) => escapar(l[c] ?? "")).join(";")),
  ];

  return `﻿${linhas.join("\r\n")}`;
}
