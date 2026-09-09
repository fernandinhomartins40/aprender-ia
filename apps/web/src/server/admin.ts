import { redirect } from "next/navigation";
import { auth } from "@aprender/auth";
import { prisma } from "@aprender/db";

/**
 * Guarda de rota do painel administrativo.
 *
 * O middleware só confere a presença do cookie (roda no Edge, sem acesso
 * ao banco). A verificação real de papel é aqui, no servidor.
 */
export async function exigirAdmin() {
  const sessao = await auth();
  if (!sessao?.user) redirect("/entrar?proximo=/admin");
  if (sessao.user.papel !== "ADMIN") redirect("/app?erro=sem-permissao");
  return sessao.user;
}

export async function metricasGerais() {
  const [alunos, admins, cursos, turmas, matriculas, licoesFeitas, execucoes] =
    await Promise.all([
      prisma.user.count({ where: { papel: "ALUNO" } }),
      prisma.user.count({ where: { papel: { in: ["ADMIN", "INSTRUTOR"] } } }),
      prisma.course.count(),
      prisma.cohort.count(),
      prisma.enrollment.count(),
      prisma.lessonProgress.count({ where: { status: "CONCLUIDA" } }),
      prisma.promptRun.count(),
    ]);

  // Novos alunos nos últimos 7 dias — sinal de crescimento
  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const novosNaSemana = await prisma.user.count({
    where: { papel: "ALUNO", criadoEm: { gte: seteDiasAtras } },
  });

  return { alunos, admins, cursos, turmas, matriculas, licoesFeitas, execucoes, novosNaSemana };
}

/** Ferramentas de IA mais usadas — mostra o que os professores adotam de verdade. */
export async function ferramentasMaisUsadas() {
  const dados = await prisma.promptRun.groupBy({
    by: ["ferramenta"],
    _count: { ferramenta: true },
    orderBy: { _count: { ferramenta: "desc" } },
    take: 6,
  });
  return dados.map((d) => ({ ferramenta: d.ferramenta, usos: d._count.ferramenta }));
}

export async function listarAlunos(busca?: string, pagina = 1, porPagina = 20) {
  const where = busca
    ? {
        OR: [
          { nome: { contains: busca, mode: "insensitive" as const } },
          { email: { contains: busca, mode: "insensitive" as const } },
          { escola: { contains: busca, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, usuarios] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      select: {
        id: true, nome: true, email: true, papel: true, escola: true,
        disciplina: true, criadoEm: true,
        ofensiva: { select: { diasSeguidos: true } },
        matriculas: { select: { progressoPct: true, xpTotal: true } },
        _count: { select: { execucoesPrompt: true } },
      },
    }),
  ]);

  return { total, usuarios, paginas: Math.max(1, Math.ceil(total / porPagina)) };
}

export async function listarCursos() {
  return prisma.course.findMany({
    orderBy: { ordem: "asc" },
    include: {
      _count: { select: { matriculas: true, modulos: true, turmas: true } },
      modulos: {
        orderBy: { ordem: "asc" },
        select: { id: true, titulo: true, cor: true, _count: { select: { licoes: true } } },
      },
    },
  });
}

export async function listarTurmas() {
  return prisma.cohort.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      course: { select: { titulo: true } },
      _count: { select: { membros: true } },
    },
  });
}
