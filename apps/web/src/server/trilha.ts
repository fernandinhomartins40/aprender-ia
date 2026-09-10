import { redirect } from "next/navigation";
import { auth } from "@aprender/auth";
import { prisma, type StatusLicao } from "@aprender/db";
import { avaliarAcesso, SELECT_ACESSO, type Veredito } from "./acesso";

/** Garante sessão e devolve o usuário. */
export async function exigirAluno() {
  const sessao = await auth();
  if (!sessao?.user) redirect("/entrar?proximo=/app");
  return sessao.user;
}

/**
 * Matrícula do usuário no curso principal.
 * Cria na primeira visita — o professor não deveria precisar "se matricular".
 */
export async function garantirMatricula(userId: string) {
  const aluno = await prisma.user.findUnique({
    where: { id: userId },
    select: SELECT_ACESSO,
  });
  if (!aluno) return null;

  // Matricula no primeiro curso publicado que este aluno pode cursar —
  // um aluno FREE não deve cair automaticamente num curso pago.
  const publicados = await prisma.course.findMany({
    where: { publicado: true },
    orderBy: { ordem: "asc" },
    select: { id: true, pago: true },
  });
  const curso = publicados.find((c) => avaliarAcesso(aluno, c).permitido);
  if (!curso) return null;

  const existente = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: curso.id } },
  });
  if (existente) return existente;

  return prisma.enrollment.create({
    data: { userId, courseId: curso.id },
  });
}

/**
 * A trilha completa, com o status de cada lição.
 *
 * O desbloqueio é sequencial: a primeira lição pendente fica DISPONIVEL
 * e as seguintes, BLOQUEADAS. Calculamos na leitura em vez de gravar,
 * assim mudanças no conteúdo não deixam progresso inconsistente.
 */
export async function carregarTrilha(userId: string) {
  const matricula = await garantirMatricula(userId);
  if (!matricula) return null;

  const curso = await prisma.course.findUnique({
    where: { id: matricula.courseId },
    include: {
      modulos: {
        orderBy: { ordem: "asc" },
        include: { licoes: { orderBy: { ordem: "asc" } } },
      },
    },
  });
  if (!curso) return null;

  // O acesso é reavaliado a cada carregamento: um aluno matriculado
  // pode ter sido suspenso ou ter o prazo vencido depois da matrícula.
  const dono = await prisma.user.findUnique({
    where: { id: userId },
    select: SELECT_ACESSO,
  });
  const veredito = dono
    ? avaliarAcesso(dono, curso)
    : ({ permitido: false, motivo: "conta-suspensa", mensagem: "Conta indisponível." } as Veredito);

  if (!veredito.permitido) {
    return { bloqueado: true as const, veredito, curso: { titulo: curso.titulo } };
  }

  const progressos = await prisma.lessonProgress.findMany({
    where: { enrollmentId: matricula.id },
  });
  const porLicao = new Map(progressos.map((p) => [p.lessonId, p]));

  let jaLiberouProxima = false;
  const modulos = curso.modulos.map((m) => {
    const licoes = m.licoes.map((l) => {
      const p = porLicao.get(l.id);
      let status: StatusLicao;

      if (p?.status === "CONCLUIDA") {
        status = "CONCLUIDA";
      } else if (!jaLiberouProxima) {
        status = p?.status === "EM_ANDAMENTO" ? "EM_ANDAMENTO" : "DISPONIVEL";
        jaLiberouProxima = true;
      } else {
        status = "BLOQUEADA";
      }

      return {
        id: l.id,
        titulo: l.titulo,
        tipo: l.tipo,
        ordem: l.ordem,
        xp: l.xpRecompensa,
        tempo: l.tempoEstimado,
        capitulo: l.capituloRef,
        status,
      };
    });

    const concluidas = licoes.filter((l) => l.status === "CONCLUIDA").length;
    return {
      id: m.id,
      titulo: m.titulo,
      subtitulo: m.subtitulo,
      cor: m.cor ?? "#4F46E5",
      icone: m.icone,
      licoes,
      concluidas,
      total: licoes.length,
    };
  });

  const totalLicoes = modulos.reduce((s, m) => s + m.total, 0);
  const totalConcluidas = modulos.reduce((s, m) => s + m.concluidas, 0);
  const xpTotal = progressos.reduce((s, p) => s + p.xpGanho, 0);

  return {
    bloqueado: false as const,
    curso: { id: curso.id, titulo: curso.titulo, slug: curso.slug },
    matriculaId: matricula.id,
    modulos,
    totalLicoes,
    totalConcluidas,
    xpTotal,
    progressoPct: totalLicoes ? Math.round((totalConcluidas / totalLicoes) * 100) : 0,
  };
}

/** Carrega uma lição, garantindo que o aluno tem acesso a ela. */
export async function carregarLicao(userId: string, lessonId: string) {
  const trilha = await carregarTrilha(userId);
  if (!trilha) return null;
  if (trilha.bloqueado) {
    return { semAcesso: true as const, bloqueada: false as const, veredito: trilha.veredito };
  }

  const todas = trilha.modulos.flatMap((m) =>
    m.licoes.map((l) => ({ ...l, moduloCor: m.cor, moduloTitulo: m.titulo })),
  );
  const indice = todas.findIndex((l) => l.id === lessonId);
  if (indice === -1) return null;

  const resumo = todas[indice]!;
  if (resumo.status === "BLOQUEADA") {
    return { semAcesso: false as const, bloqueada: true as const };
  }

  const licao = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { promptTemplates: true },
  });
  if (!licao) return null;

  return {
    semAcesso: false as const,
    bloqueada: false as const,
    licao,
    resumo,
    matriculaId: trilha.matriculaId,
    proxima: todas[indice + 1] ?? null,
    posicao: indice + 1,
    totalLicoes: trilha.totalLicoes,
  };
}

/** Estatísticas do painel do aluno. */
export async function resumoAluno(userId: string) {
  const [ofensiva, execucoes, conquistas, diario] = await Promise.all([
    prisma.streak.findUnique({ where: { userId } }),
    prisma.promptRun.count({ where: { userId } }),
    prisma.userAchievement.count({ where: { userId } }),
    prisma.diaryEntry.findMany({
      where: { userId },
      orderBy: { registradoEm: "desc" },
      take: 5,
    }),
  ]);

  const economizado = await prisma.diaryEntry.aggregate({
    where: { userId },
    _sum: { minutosAntes: true, minutosAgora: true },
  });

  const antes = economizado._sum.minutosAntes ?? 0;
  const agora = economizado._sum.minutosAgora ?? 0;

  return {
    ofensiva: ofensiva?.diasSeguidos ?? 0,
    recorde: ofensiva?.recorde ?? 0,
    execucoes,
    conquistas,
    diario,
    minutosEconomizados: Math.max(0, antes - agora),
  };
}
