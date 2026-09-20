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

export async function listarAlunos(
  busca?: string,
  pagina = 1,
  porPagina = 20,
  cursoId?: string,
) {
  const where = {
    // A busca é um OR entre campos; o curso é um E por cima dela. Juntar
    // os dois no mesmo objeto (em vez de substituir) mantém as duas
    // condições válidas: "quem casa com o texto E está neste curso".
    ...(busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { email: { contains: busca, mode: "insensitive" as const } },
            { telefone: { contains: busca } },
            { escola: { contains: busca, mode: "insensitive" as const } },
            { disciplina: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(cursoId ? { matriculas: { some: { courseId: cursoId } } } : {}),
  };

  const [total, usuarios] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      select: {
        id: true, nome: true, email: true, telefone: true, papel: true, escola: true,
        disciplina: true, criadoEm: true, ultimoAcessoEm: true,
        // Acesso: a coluna da tabela mostra prazo e permite prorrogar,
        // definir ou revogar sem sair da lista.
        plano: true, premiumAte: true, freeAte: true, freeRevogadoEm: true,
        assinaturas: {
          where: { status: { in: ["ATIVA", "INADIMPLENTE", "CANCELADA"] } },
          select: {
            plan: {
              select: {
                nome: true,
                gratuito: true,
                cursos: { select: { course: { select: { titulo: true } } } },
              },
            },
          },
        },
        ofensiva: { select: { diasSeguidos: true } },
        matriculas: { select: { progressoPct: true, xpTotal: true } },
        // A turma é parte da identidade do aluno neste painel: sem ela
        // não há como saber de qual formação a pessoa veio.
        membroTurmas: {
          orderBy: { entrouEm: "desc" },
          select: {
            cohort: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                situacao: true,
                modalidade: true,
              },
            },
          },
        },
        _count: { select: { execucoesPrompt: true } },
      },
    }),
  ]);

  return { total, usuarios, paginas: Math.max(1, Math.ceil(total / porPagina)) };
}

/** Alunos que ficaram sem turma — fila de trabalho do administrador. */
export async function contarAlunosSemTurma(): Promise<number> {
  return prisma.user.count({
    where: { papel: "ALUNO", membroTurmas: { none: {} } },
  });
}

export async function listarCursos() {
  return prisma.course.findMany({
    orderBy: { ordem: "asc" },
    include: {
      _count: { select: { matriculas: true, modulos: true, turmas: true } },
      modulos: {
        orderBy: { ordem: "asc" },
        select: { id: true, titulo: true, cor: true, pago: true, faixa: true, _count: { select: { licoes: true } } },
      },
    },
  });
}

export async function listarTurmas(cursoId?: string) {
  return prisma.cohort.findMany({
    // Toda turma pertence a um curso (courseId é obrigatório no schema),
    // então aqui o filtro é exato — não existe turma "de todos os cursos".
    where: cursoId ? { courseId: cursoId } : {},
    orderBy: [{ inicioEm: "desc" }, { criadoEm: "desc" }],
    include: {
      course: { select: { id: true, titulo: true } },
      instrutor: { select: { id: true, nome: true } },
      encontros: {
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          ordem: true,
          data: true,
          horaInicio: true,
          horaFim: true,
          modalidade: true,
          local: true,
          canceladoEm: true,
          _count: { select: { presencas: true } },
        },
      },
      _count: { select: { membros: true, encontros: true } },
    },
  });
}

/** Usuários que podem ser responsáveis por uma turma. */
export async function listarInstrutores() {
  return prisma.user.findMany({
    where: { papel: { in: ["INSTRUTOR", "ADMIN"] } },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, papel: true },
  });
}
