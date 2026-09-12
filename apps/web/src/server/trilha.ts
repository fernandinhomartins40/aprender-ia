import { redirect } from "next/navigation";
import { auth } from "@aprender/auth";
import { prisma, type StatusLicao } from "@aprender/db";
import { acessoDoAluno, avaliarAcesso, SELECT_ACESSO, type Veredito } from "./acesso";
import { podeVerCurso, podeVerModulo } from "@/lib/motor-acesso";

/**
 * Garante sessão e devolve o usuário.
 *
 * Sem sessão, manda para a entrada do aplicativo — e não para `/entrar`,
 * que é o formulário da landing. Dentro do PWA instalado, aquela tela
 * vinha com cabeçalho e rodapé de site.
 */
export async function exigirAluno() {
  const sessao = await auth();
  if (!sessao?.user) redirect("/app/entrar?proximo=/app");
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

/** Cursos matriculados para a porta de entrada da trilha. */
export async function listarCursosDoAluno(userId: string) {
  await garantirMatricula(userId);
  const matriculas = await prisma.enrollment.findMany({
    where: { userId, course: { publicado: true } },
    orderBy: { iniciadoEm: "asc" },
    include: { course: { select: { id: true, titulo: true, subtitulo: true, cargaHoraria: true, capa: true, modulos: { select: { licoes: { select: { id: true } } } } } } },
  });
  return matriculas.map((m) => ({
    id: m.course.id,
    titulo: m.course.titulo,
    subtitulo: m.course.subtitulo,
    cargaHoraria: m.course.cargaHoraria,
    capa: m.course.capa,
    progressoPct: m.progressoPct,
    totalLicoes: m.course.modulos.reduce((s, modulo) => s + modulo.licoes.length, 0),
  }));
}

/**
 * A trilha completa, com o status de cada lição.
 *
 * O desbloqueio é sequencial: a primeira lição pendente fica DISPONIVEL
 * e as seguintes, BLOQUEADAS. Calculamos na leitura em vez de gravar,
 * assim mudanças no conteúdo não deixam progresso inconsistente.
 */
export async function carregarTrilha(userId: string, courseId?: string) {
  const matricula = courseId
    ? await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } })
    : await garantirMatricula(userId);
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

  // O acesso é reavaliado a cada carregamento: um aluno matriculado pode
  // ter sido suspenso, ter o prazo vencido ou ter ganhado um plano novo
  // depois da matrícula.
  //
  // Quem decide é o motor (`aluno → assinaturas → planos → cursos e
  // módulos`), a mesma fonte que o painel administrativo consulta — é o
  // que impede esta tela de divergir do que o servidor autoriza.
  const acesso = await acessoDoAluno(userId);
  const veredito = podeVerCurso(acesso, curso.id);

  if (!veredito.permitido) {
    return {
      bloqueado: true as const,
      veredito,
      curso: { titulo: curso.titulo },
    };
  }

  const progressos = await prisma.lessonProgress.findMany({
    where: { enrollmentId: matricula.id },
  });
  const porLicao = new Map(progressos.map((p) => [p.lessonId, p]));

  let jaLiberouProxima = false;
  const modulos = curso.modulos.map((m) => {
    // A faixa avançada vive no mesmo curso da parte gratuita. A checagem é
    // feita no servidor, por módulo, para que esconder um link no cliente
    // nunca seja a única barreira de acesso.
    const acessoModulo = podeVerModulo(acesso, curso.id, m.id);
    const licoes = m.licoes.map((l) => {
      const p = porLicao.get(l.id);
      let status: StatusLicao;

      if (!acessoModulo.permitido) {
        status = "BLOQUEADA";
      } else if (p?.status === "CONCLUIDA") {
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
      faixa: m.faixa,
      bloqueadoPorPlano: !acessoModulo.permitido,
      mensagemBloqueio: acessoModulo.permitido ? null : acessoModulo.mensagem,
      licoes,
      concluidas,
      total: licoes.length,
    };
  });

  // O percentual FREE não inclui uma faixa que ainda não pode ser cursada.
  const modulosAcessiveis = modulos.filter((m) => !m.bloqueadoPorPlano);
  const totalLicoes = modulosAcessiveis.reduce((s, m) => s + m.total, 0);
  const totalConcluidas = modulosAcessiveis.reduce(
    (s, m) => s + m.concluidas,
    0,
  );
  const xpTotal = progressos.reduce((s, p) => s + p.xpGanho, 0);

  return {
    bloqueado: false as const,
    curso: { id: curso.id, titulo: curso.titulo, slug: curso.slug },
    matriculaId: matricula.id,
    modulos,
    totalLicoes,
    totalConcluidas,
    xpTotal,
    progressoPct: totalLicoes
      ? Math.round((totalConcluidas / totalLicoes) * 100)
      : 0,
  };
}

/** Carrega uma lição, garantindo que o aluno tem acesso a ela. */
export async function carregarLicao(userId: string, lessonId: string) {
  // A lição pode pertencer a qualquer curso do aluno; nunca presuma que a
  // primeira matrícula é a dona dela.
  const origem = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!origem) return null;
  const trilha = await carregarTrilha(userId, origem.module.courseId);
  if (!trilha) return null;
  if (trilha.bloqueado) {
    return {
      semAcesso: true as const,
      bloqueada: false as const,
      veredito: trilha.veredito,
    };
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

  // As respostas de atividades abertas já foram persistidas no servidor.
  // Devolvê-las ao player impede que uma atualização da página transforme uma
  // prática em andamento em uma atividade aparentemente nova.
  const respostasAbertas = await prisma.respostaAberta.findMany({
    where: {
      progress: { enrollmentId: trilha.matriculaId, lessonId },
    },
    select: { chave: true, texto: true },
  });

  return {
    semAcesso: false as const,
    bloqueada: false as const,
    licao,
    resumo,
    respostasAbertas: Object.fromEntries(
      respostasAbertas.map(({ chave, texto }) => [chave, texto]),
    ),
    matriculaId: trilha.matriculaId,
    proxima: todas[indice + 1] ?? null,
    posicao: indice + 1,
    totalLicoes: trilha.totalLicoes,
  };
}

/** Estatísticas do painel do aluno. */
export async function resumoAluno(userId: string) {
  const inicioSemana = new Date();
  const dia = inicioSemana.getDay();
  inicioSemana.setDate(inicioSemana.getDate() - ((dia + 6) % 7));
  inicioSemana.setHours(0, 0, 0, 0);

  const [
    ofensiva,
    execucoes,
    conquistas,
    diario,
    licoesNaSemana,
    recentes,
    desempenhos,
  ] = await Promise.all([
    prisma.streak.findUnique({ where: { userId } }),
    prisma.promptRun.count({ where: { userId } }),
    prisma.userAchievement.count({ where: { userId } }),
    prisma.diaryEntry.findMany({
      where: { userId },
      orderBy: { registradoEm: "desc" },
      take: 5,
    }),
    prisma.lessonProgress.count({
      where: {
        enrollment: { userId },
        status: "CONCLUIDA",
        concluidoEm: { gte: inicioSemana },
      },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { conquistadoEm: "desc" },
      take: 3,
      include: { achievement: { select: { titulo: true, icone: true } } },
    }),
    prisma.activityPerformance.findMany({
      where: { userId },
      orderBy: { registradoEm: "desc" },
      take: 6,
      select: { acertos: true, total: true },
    }),
  ]);

  const economizado = await prisma.diaryEntry.aggregate({
    where: { userId },
    _sum: { minutosAntes: true, minutosAgora: true },
  });

  const antes = economizado._sum.minutosAntes ?? 0;
  const agora = economizado._sum.minutosAgora ?? 0;
  const percentuais = desempenhos
    .filter((d) => d.total > 0)
    .map((d) => Math.round((d.acertos / d.total) * 100));
  const atuais = percentuais.slice(0, 3);
  const anteriores = percentuais.slice(3, 6);
  const media = (valores: number[]) =>
    valores.length
      ? Math.round(
          valores.reduce((soma, valor) => soma + valor, 0) / valores.length,
        )
      : null;
  const mediaAtual = media(atuais);
  const mediaAnterior = media(anteriores);
  const feedbackDesempenho =
    mediaAtual === null
      ? null
      : mediaAnterior !== null && mediaAtual >= mediaAnterior + 5
        ? {
            tom: "melhora" as const,
            titulo: "Seu desempenho melhorou",
            texto: `Sua precisão recente chegou a ${mediaAtual}%, acima dos ${mediaAnterior}% anteriores.`,
          }
        : mediaAtual >= 80
          ? {
              tom: "forte" as const,
              titulo: "Excelente precisão",
              texto: `Você acertou, em média, ${mediaAtual}% nas atividades avaliadas mais recentes.`,
            }
          : mediaAtual < 60
            ? {
                tom: "atencao" as const,
                titulo: "Vale revisar com calma",
                texto: `Sua precisão recente está em ${mediaAtual}%. Reveja as explicações antes do próximo desafio.`,
              }
            : {
                tom: "estavel" as const,
                titulo: "Bom progresso",
                texto: `Sua precisão recente está em ${mediaAtual}%. Continue praticando para consolidar.`,
              };

  return {
    ofensiva: ofensiva?.diasSeguidos ?? 0,
    recorde: ofensiva?.recorde ?? 0,
    execucoes,
    conquistas,
    diario,
    licoesNaSemana,
    conquistasRecentes: recentes.map((r) => ({
      ...r.achievement,
      conquistadoEm: r.conquistadoEm,
    })),
    feedbackDesempenho,
    minutosEconomizados: Math.max(0, antes - agora),
  };
}
