import { prisma, type Plano, type SituacaoConta } from "@aprender/db";

/**
 * Regras de acesso a curso.
 *
 * O controle é simples de propósito: o aluno tem um plano (FREE ou
 * PREMIUM) e o curso é gratuito ou pago. A verificação acontece no
 * servidor, a cada carregamento — nunca no cliente, que o aluno
 * poderia manipular.
 *
 * Suspender uma conta bloqueia o curso pago mas PRESERVA o progresso:
 * quem regularizar o pagamento volta de onde parou.
 */

export type MotivoBloqueio =
  | "curso-pago-plano-free"
  | "conta-suspensa"
  | "premium-expirado"
  | "free-expirado"
  | "free-revogado";

export type Veredito =
  | { permitido: true }
  | { permitido: false; motivo: MotivoBloqueio; mensagem: string };

/** Campos de acesso que toda avaliação precisa ler. */
export type ContaParaAcesso = {
  plano: Plano;
  situacao: SituacaoConta;
  premiumAte: Date | null;
  freeAte: Date | null;
  freeRevogadoEm: Date | null;
  papel?: string;
};

/** Só estes campos — usado nos `select` do Prisma, num lugar só. */
export const SELECT_ACESSO = {
  plano: true,
  situacao: true,
  premiumAte: true,
  freeAte: true,
  freeRevogadoEm: true,
  papel: true,
} as const;

export function avaliarAcesso(
  aluno: ContaParaAcesso,
  curso: { pago: boolean },
): Veredito {
  // Administradores e instrutores enxergam tudo, para poder revisar
  // o conteúdo antes de liberar aos alunos.
  if (aluno.papel === "ADMIN" || aluno.papel === "INSTRUTOR") {
    return { permitido: true };
  }

  // Suspensão vale para qualquer curso, pago ou não.
  if (aluno.situacao === "SUSPENSO") {
    return {
      permitido: false,
      motivo: "conta-suspensa",
      mensagem:
        "Seu acesso está temporariamente suspenso. Seu progresso está guardado — fale com a coordenação para regularizar.",
    };
  }

  /**
   * O prazo do acesso gratuito vale para QUALQUER curso, inclusive os
   * gratuitos.
   *
   * Antes desta checagem o método saía cedo em `if (!curso.pago) return
   * permitido`, e por isso o acesso Free nunca expirava — era eterno por
   * construção. Quem tem plano PREMIUM ativo não passa por aqui.
   */
  if (aluno.plano !== "PREMIUM") {
    if (aluno.freeRevogadoEm) {
      return {
        permitido: false,
        motivo: "free-revogado",
        mensagem:
          "Seu acesso gratuito foi encerrado. Seu progresso continua salvo — você pode solicitar um novo acesso.",
      };
    }
    if (aluno.freeAte && aluno.freeAte.getTime() < Date.now()) {
      return {
        permitido: false,
        motivo: "free-expirado",
        mensagem:
          "Seu período de acesso gratuito terminou. Seu progresso continua salvo — solicite um novo acesso para continuar.",
      };
    }
  }

  if (!curso.pago) return { permitido: true };

  if (aluno.plano !== "PREMIUM") {
    return {
      permitido: false,
      motivo: "curso-pago-plano-free",
      mensagem:
        "Este curso faz parte do plano completo. Fale com a coordenação para liberar o seu acesso.",
    };
  }

  // Prazo vencido conta como sem acesso, mesmo com plano PREMIUM.
  if (aluno.premiumAte && aluno.premiumAte.getTime() < Date.now()) {
    return {
      permitido: false,
      motivo: "premium-expirado",
      mensagem:
        "Seu acesso ao plano completo expirou. Seu progresso continua salvo — fale com a coordenação para renovar.",
    };
  }

  return { permitido: true };
}

/** Cursos que este aluno pode efetivamente cursar. */
export async function cursosPermitidos(userId: string) {
  const aluno = await prisma.user.findUnique({
    where: { id: userId },
    select: SELECT_ACESSO,
  });
  if (!aluno) return [];

  const cursos = await prisma.course.findMany({
    where: { publicado: true },
    orderBy: { ordem: "asc" },
  });

  return cursos.filter((c) => avaliarAcesso(aluno, c).permitido);
}

/** Verifica o acesso a um curso específico, já com a mensagem pronta. */
export async function verificarAcessoCurso(
  userId: string,
  courseId: string,
): Promise<Veredito> {
  const [aluno, curso] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: SELECT_ACESSO,
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { pago: true },
    }),
  ]);

  if (!aluno || !curso) {
    return {
      permitido: false,
      motivo: "curso-pago-plano-free",
      mensagem: "Curso indisponível.",
    };
  }

  return avaliarAcesso(aluno, curso);
}
