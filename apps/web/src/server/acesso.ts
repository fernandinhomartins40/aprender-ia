import { prisma, type Plano, type SituacaoConta } from "@aprender/db";
import {
  calcularAcesso,
  podeVerCurso,
  podeVerModulo,
  temAcessoPago,
  type AcessoEfetivo,
  type AlunoParaAcesso,
  type Veredito,
} from "@/lib/motor-acesso";

/**
 * Acesso a conteúdo — a ponte entre o banco e o motor de regras.
 *
 * A decisão em si mora em `lib/motor-acesso`, em funções puras e
 * testadas. Este arquivo só carrega os dados e chama o motor, para que
 * exista **uma única fonte da verdade**: o servidor calcula, o frontend
 * consome o resultado.
 *
 * O que mudou: o acesso deixou de ser decidido por um enum no usuário
 * (FREE/PREMIUM) somado a um booleano no curso, e passou a derivar do que
 * o aluno realmente tem — `aluno → assinaturas → planos → cursos/módulos`.
 * Antes, pagar não liberava conteúdo por si só: a assinatura era registro
 * financeiro e não participava da decisão de acesso.
 *
 * Compatibilidade: `avaliarAcesso`, `SELECT_ACESSO`, `cursosPermitidos` e
 * `verificarAcessoCurso` continuam com a mesma assinatura, porque
 * `trilha.ts` e várias telas dependem delas.
 */

export type MotivoBloqueio =
  | "curso-pago-plano-free"
  | "conta-suspensa"
  | "premium-expirado"
  | "free-expirado"
  | "free-revogado"
  | "sem-plano"
  | "modulo-fora-do-plano";

export type { Veredito };

/** Campos de acesso que a avaliação legada precisa ler. */
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

/* ============================================================
   CARGA
   ============================================================ */

/**
 * Monta o retrato do aluno que o motor consome.
 *
 * Uma consulta só, com as assinaturas e o que cada plano libera. Os
 * status que nunca dão acesso (EXPIRADA, PENDENTE) entram assim mesmo: a
 * área do aluno precisa mostrar "expirado" em vez de omitir o plano, e é
 * o motor que decide o que vale.
 */
async function carregarAluno(userId: string): Promise<AlunoParaAcesso | null> {
  const aluno = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      papel: true,
      situacao: true,
      freeAte: true,
      freeRevogadoEm: true,
      assinaturas: {
        select: {
          id: true,
          status: true,
          cicloFimEm: true,
          semExpiracao: true,
          plan: {
            select: {
              id: true,
              nome: true,
              gratuito: true,
              cursos: {
                select: {
                  courseId: true,
                  abrangencia: true,
                  modulos: { select: { moduleId: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!aluno) return null;

  return {
    papel: aluno.papel,
    situacao: aluno.situacao,
    freeAte: aluno.freeAte,
    freeRevogadoEm: aluno.freeRevogadoEm,
    assinaturas: aluno.assinaturas.map((a) => ({
      id: a.id,
      status: a.status,
      cicloFimEm: a.cicloFimEm,
      semExpiracao: a.semExpiracao,
      plano: {
        id: a.plan.id,
        nome: a.plan.nome,
        gratuito: a.plan.gratuito,
        cursos: a.plan.cursos.map((c) => ({
          courseId: c.courseId,
          abrangencia: c.abrangencia,
          moduleIds: c.modulos.map((m) => m.moduleId),
        })),
      },
    })),
  };
}

/**
 * O plano gratuito vale para quem não o assinou explicitamente.
 *
 * Sem isto, um aluno novo não teria acesso a nada até alguém criar uma
 * assinatura para ele — e o requisito é que quem não tem plano pago tenha
 * o acesso gratuito determinado pelo sistema, não por cadastro manual.
 *
 * A assinatura sintética não é gravada: existe só durante o cálculo.
 */
async function comPlanoGratuito(aluno: AlunoParaAcesso): Promise<AlunoParaAcesso> {
  const free = await prisma.plan.findFirst({
    where: { gratuito: true, ativo: true },
    select: {
      id: true,
      nome: true,
      gratuito: true,
      cursos: {
        select: {
          courseId: true,
          abrangencia: true,
          modulos: { select: { moduleId: true } },
        },
      },
    },
  });
  if (!free) return aluno;

  // O plano gratuito é global, mas seu prazo é individual. Normalizamos uma
  // eventual assinatura gratuita antiga para que `freeAte` sempre prevaleça.
  const assinaturasPagas = aluno.assinaturas.filter((a) => !a.plano.gratuito);
  const freeValido =
    !aluno.freeRevogadoEm &&
    (!aluno.freeAte || aluno.freeAte.getTime() >= Date.now());

  return {
    ...aluno,
    assinaturas: [
      ...assinaturasPagas,
      {
        id: `free-implicito:${free.id}`,
        status: freeValido ? "ATIVA" : "EXPIRADA",
        cicloFimEm: aluno.freeAte ?? null,
        semExpiracao: !aluno.freeAte && !aluno.freeRevogadoEm,
        plano: {
          id: free.id,
          nome: free.nome,
          gratuito: true,
          cursos: free.cursos.map((c) => ({
            courseId: c.courseId,
            abrangencia: c.abrangencia,
            moduleIds: c.modulos.map((m) => m.moduleId),
          })),
        },
      },
    ],
  };
}

/**
 * O acesso efetivo de um aluno. É a função que todo o resto consome.
 *
 * Enquanto nenhum plano tiver cursos configurados, cai no comportamento
 * anterior (`Course.pago` / `Module.pago`) — ver `acessoLegado`. Isso
 * evita deixar a plataforma inacessível entre a migração e a configuração
 * dos planos pelo administrador.
 */
export async function acessoDoAluno(userId: string): Promise<AcessoEfetivo> {
  const base = await carregarAluno(userId);
  if (!base) return { irrestrito: false, contaSuspensa: false, porCurso: new Map() };

  const aluno = await comPlanoGratuito(base);

  const algumPlanoConfigurado = aluno.assinaturas.some((a) => a.plano.cursos.length > 0);
  if (!algumPlanoConfigurado) return acessoLegado(aluno, userId);

  return calcularAcesso(aluno);
}

/**
 * Comportamento anterior, usado só enquanto não houver planos com cursos.
 *
 * Reproduz a regra que existia: conteúdo gratuito liberado a quem está no
 * prazo Free; conteúdo pago, a quem tem PREMIUM válido. Deixa de ser
 * usado assim que o administrador configurar o plano gratuito.
 */
async function acessoLegado(
  aluno: AlunoParaAcesso,
  userId: string,
): Promise<AcessoEfetivo> {
  const acesso = calcularAcesso(aluno);
  if (acesso.irrestrito || acesso.contaSuspensa) return acesso;

  const [conta, cursos] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: SELECT_ACESSO }),
    prisma.course.findMany({
      where: { publicado: true },
      select: { id: true, pago: true, modulos: { select: { id: true, pago: true } } },
    }),
  ]);
  if (!conta) return acesso;

  const agora = Date.now();
  const freeValido =
    !conta.freeRevogadoEm && (!conta.freeAte || conta.freeAte.getTime() >= agora);
  const premiumValido =
    conta.plano === "PREMIUM" && (!conta.premiumAte || conta.premiumAte.getTime() >= agora);

  for (const curso of cursos) {
    if (premiumValido) {
      acesso.porCurso.set(curso.id, { tipo: "completo", porPlanos: ["Plano completo"] });
      continue;
    }
    if (curso.pago || !freeValido) continue;

    const liberados = curso.modulos.filter((m) => !m.pago).map((m) => m.id);
    if (liberados.length > 0) {
      acesso.porCurso.set(curso.id, {
        tipo: "parcial",
        moduleIds: new Set(liberados),
        porPlanos: ["Acesso gratuito"],
      });
    }
  }

  return acesso;
}

/* ============================================================
   PERGUNTAS DE ALTO NÍVEL
   ============================================================ */

/** Cursos que este aluno pode efetivamente cursar. */
export async function cursosPermitidos(userId: string) {
  const [acesso, cursos] = await Promise.all([
    acessoDoAluno(userId),
    prisma.course.findMany({ where: { publicado: true }, orderBy: { ordem: "asc" } }),
  ]);

  if (acesso.irrestrito) return cursos;
  return cursos.filter((c) => podeVerCurso(acesso, c.id).permitido);
}

/** Verifica o acesso a um curso específico, já com a mensagem pronta. */
export async function verificarAcessoCurso(
  userId: string,
  courseId: string,
): Promise<Veredito> {
  const acesso = await acessoDoAluno(userId);
  return podeVerCurso(acesso, courseId);
}

/** Verifica o acesso a um módulo específico. */
export async function verificarAcessoModulo(
  userId: string,
  courseId: string,
  moduleId: string,
): Promise<Veredito> {
  const acesso = await acessoDoAluno(userId);
  return podeVerModulo(acesso, courseId, moduleId);
}

/**
 * Avaliação síncrona, a partir de um acesso já calculado.
 *
 * Para as telas que carregam o acesso uma vez e decidem módulo a módulo
 * sem uma consulta por item.
 */
export function avaliarModulo(
  acesso: AcessoEfetivo,
  courseId: string,
  moduleId: string,
): Veredito {
  return podeVerModulo(acesso, courseId, moduleId);
}

/* ============================================================
   ESPELHO DO ENUM LEGADO
   ============================================================ */

/**
 * Mantém `User.plano` coerente com as assinaturas.
 *
 * O enum não decide mais nada — mas relatórios, métricas, avisos e a
 * landing ainda o leem, e reescrever tudo isso agora seria muito mais
 * superfície de risco do que manter um espelho de uma linha.
 *
 * Chamado após qualquer mudança de assinatura.
 */
export async function sincronizarPlanoLegado(userId: string): Promise<void> {
  const aluno = await carregarAluno(userId);
  if (!aluno) return;

  const pago = temAcessoPago(aluno);

  // A maior data de fim entre as assinaturas pagas, para `premiumAte`
  // continuar refletindo até quando o acesso vale. Vitalício zera a data:
  // nulo aqui já significa "sem prazo" no modelo antigo.
  const vitalicio = aluno.assinaturas.some((a) => !a.plano.gratuito && a.semExpiracao);
  const fins = aluno.assinaturas
    .filter((a) => !a.plano.gratuito && !a.semExpiracao)
    .map((a) => a.cicloFimEm)
    .filter((d): d is Date => d instanceof Date);

  const premiumAte =
    vitalicio || fins.length === 0
      ? null
      : new Date(Math.max(...fins.map((d) => d.getTime())));

  await prisma.user.update({
    where: { id: userId },
    data: { plano: pago ? "PREMIUM" : "FREE", premiumAte },
  });
}

/* ============================================================
   COMPATIBILIDADE
   ============================================================ */

/**
 * Avaliação antiga, por booleano `pago`.
 *
 * Preservada porque `trilha.ts` a usa por módulo. Não consulta o banco e
 * mantém exatamente o comportamento anterior; as telas migradas usam
 * `avaliarModulo`, que passa pelo motor.
 */
export function avaliarAcesso(
  aluno: ContaParaAcesso,
  curso: { pago: boolean },
): Veredito {
  if (aluno.papel === "ADMIN" || aluno.papel === "INSTRUTOR") {
    return { permitido: true };
  }

  if (aluno.situacao === "SUSPENSO") {
    return {
      permitido: false,
      motivo: "conta-suspensa",
      mensagem:
        "Seu acesso está temporariamente suspenso. Seu progresso está guardado — fale com a coordenação para regularizar.",
    };
  }

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
