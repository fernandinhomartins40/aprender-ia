/**
 * Motor de acesso — a fonte única da verdade.
 *
 * Responde a uma pergunta só: **que conteúdo este aluno pode acessar?**
 *
 * A regra vive aqui, em funções puras, e não espalhada em `if
 * (user.isPremium)` pelo frontend. O servidor calcula, o frontend
 * consome. Isso é o que impede a divergência clássica — a tela mostrar
 * liberado e o servidor bloquear, ou o contrário.
 *
 * O modelo:
 *
 *     aluno → assinaturas (várias) → planos → cursos/módulos
 *
 * Três propriedades que valem registro:
 *
 * 1. **União, nunca interseção.** Um aluno com dois planos recebe a soma
 *    dos dois. Um plano restritivo jamais tira o que outro concedeu: o
 *    cálculo só acrescenta acesso, nunca remove.
 *
 * 2. **Curso completo vence módulo específico.** Se qualquer assinatura
 *    válida dá o curso inteiro, os módulos listados por outra assinatura
 *    param de importar — já estão todos incluídos.
 *
 * 3. **Status e prazo são coisas diferentes.** Quem cancelou no dia 3
 *    tendo pago até o dia 30 continua com acesso até o dia 30. O status
 *    diz se a assinatura ainda gera cobrança; o prazo diz até quando o
 *    que já foi pago vale.
 *
 * Este arquivo não importa Prisma nem toca no banco de propósito: assim é
 * testável direto, sem subir Postgres, e os 18 cenários do requisito
 * rodam em milissegundos.
 */

/* ============================================================
   ENTRADA
   ============================================================ */

export type StatusAssinatura =
  | "ATIVA"
  | "PENDENTE"
  | "INADIMPLENTE"
  | "SUSPENSA"
  | "CANCELADA"
  | "EXPIRADA";

export type Abrangencia = "CURSO_COMPLETO" | "MODULOS_ESPECIFICOS";

/** O que um plano libera de um curso. */
export type CursoDoPlano = {
  courseId: string;
  abrangencia: Abrangencia;
  /** Só vale quando a abrangência é MODULOS_ESPECIFICOS. */
  moduleIds: string[];
};

export type PlanoParaAcesso = {
  id: string;
  nome: string;
  gratuito: boolean;
  cursos: CursoDoPlano[];
};

export type AssinaturaParaAcesso = {
  id: string;
  status: StatusAssinatura;
  /** Até quando o que já foi pago vale. Nulo = ainda não calculado. */
  cicloFimEm: Date | null;
  /** Vitalício ou cortesia permanente: ignora `cicloFimEm`. */
  semExpiracao: boolean;
  plano: PlanoParaAcesso;
};

export type AlunoParaAcesso = {
  /** ADMIN e INSTRUTOR enxergam tudo, para revisar antes de publicar. */
  papel: string;
  /** Suspensão da CONTA bloqueia tudo, inclusive o gratuito. */
  situacao: "ATIVO" | "SUSPENSO" | "INATIVO" | string;
  assinaturas: AssinaturaParaAcesso[];
};

/* ============================================================
   VALIDADE DE UMA ASSINATURA
   ============================================================ */

export type MotivoInvalidez =
  | "aguardando-pagamento"
  | "suspensa"
  | "prazo-esgotado";

export type Validade =
  | { vale: true }
  | { vale: false; motivo: MotivoInvalidez };

/**
 * Esta assinatura dá acesso agora?
 *
 * A ordem das checagens é a regra de negócio:
 *
 * - PENDENTE nunca vale: escolher o plano não é pagar.
 * - SUSPENSA nunca vale: é decisão administrativa explícita.
 * - EXPIRADA nunca vale.
 * - CANCELADA e INADIMPLENTE valem ATÉ o fim do ciclo pago. Quem pagou o
 *   mês tem direito ao mês, mesmo tendo cancelado no dia seguinte —
 *   cortar na hora seria cobrar por um serviço não prestado.
 * - ATIVA vale, respeitado o prazo.
 */
export function assinaturaVale(
  a: AssinaturaParaAcesso,
  agora: Date = new Date(),
): Validade {
  if (a.status === "PENDENTE") return { vale: false, motivo: "aguardando-pagamento" };
  if (a.status === "SUSPENSA") return { vale: false, motivo: "suspensa" };
  if (a.status === "EXPIRADA") return { vale: false, motivo: "prazo-esgotado" };

  // Vitalício e cortesia permanente não olham prazo.
  if (a.semExpiracao) return { vale: true };

  // Sem prazo definido, uma assinatura ATIVA vale — é o caso do plano
  // gratuito, que não tem ciclo de cobrança. Para CANCELADA e
  // INADIMPLENTE a ausência de prazo não pode virar acesso eterno.
  if (!a.cicloFimEm) {
    return a.status === "ATIVA"
      ? { vale: true }
      : { vale: false, motivo: "prazo-esgotado" };
  }

  return a.cicloFimEm.getTime() >= agora.getTime()
    ? { vale: true }
    : { vale: false, motivo: "prazo-esgotado" };
}

/* ============================================================
   ACESSO EFETIVO
   ============================================================ */

/** O que o aluno pode acessar de um curso. */
export type AcessoCurso =
  | { tipo: "completo"; porPlanos: string[] }
  | { tipo: "parcial"; moduleIds: Set<string>; porPlanos: string[] }
  | { tipo: "nenhum" };

export type AcessoEfetivo = {
  /** Acesso irrestrito (ADMIN/INSTRUTOR). */
  irrestrito: boolean;
  /** A conta está suspensa: nada é liberado. */
  contaSuspensa: boolean;
  /** courseId → o que ele alcança nesse curso. */
  porCurso: Map<string, AcessoCurso>;
};

/**
 * Calcula o acesso efetivo somando todas as assinaturas válidas.
 *
 * É aqui que "união, nunca interseção" acontece: percorremos todas as
 * assinaturas que valem e vamos ACRESCENTANDO. Nenhum ramo deste
 * algoritmo remove um acesso já concedido — é o que garante que um plano
 * restritivo não anule outro mais generoso.
 */
export function calcularAcesso(
  aluno: AlunoParaAcesso,
  agora: Date = new Date(),
): AcessoEfetivo {
  const porCurso = new Map<string, AcessoCurso>();

  // Quem revisa o conteúdo precisa ver o conteúdo, inclusive o não
  // publicado. Vem antes da suspensão porque é papel, não assinatura.
  if (aluno.papel === "ADMIN" || aluno.papel === "INSTRUTOR") {
    return { irrestrito: true, contaSuspensa: false, porCurso };
  }

  // Suspensão da conta é mais forte que qualquer assinatura: bloqueia
  // inclusive o gratuito. O progresso é preservado; só o acesso para.
  if (aluno.situacao === "SUSPENSO") {
    return { irrestrito: false, contaSuspensa: true, porCurso };
  }

  for (const assinatura of aluno.assinaturas) {
    if (!assinaturaVale(assinatura, agora).vale) continue;

    for (const curso of assinatura.plano.cursos) {
      const atual = porCurso.get(curso.courseId);

      // Curso completo absorve tudo o que houver: uma vez completo, os
      // módulos de outro plano já estão contidos.
      if (curso.abrangencia === "CURSO_COMPLETO") {
        if (atual?.tipo === "completo") {
          atual.porPlanos.push(assinatura.plano.nome);
        } else {
          porCurso.set(curso.courseId, {
            tipo: "completo",
            porPlanos: [...(atual?.tipo === "parcial" ? atual.porPlanos : []), assinatura.plano.nome],
          });
        }
        continue;
      }

      // Módulos específicos: some ao que já existe, sem nunca rebaixar um
      // acesso completo que outro plano concedeu.
      if (atual?.tipo === "completo") {
        atual.porPlanos.push(assinatura.plano.nome);
        continue;
      }

      const modulos = new Set(atual?.tipo === "parcial" ? atual.moduleIds : []);
      for (const id of curso.moduleIds) modulos.add(id);

      porCurso.set(curso.courseId, {
        tipo: "parcial",
        moduleIds: modulos,
        porPlanos: [...(atual?.tipo === "parcial" ? atual.porPlanos : []), assinatura.plano.nome],
      });
    }
  }

  return { irrestrito: false, contaSuspensa: false, porCurso };
}

/* ============================================================
   PERGUNTAS PONTUAIS
   ============================================================ */

export type MotivoBloqueio =
  | "conta-suspensa"
  | "sem-plano"
  | "modulo-fora-do-plano"
  // Motivos do modelo anterior. Continuam no tipo porque a avaliação
  // legada (`avaliarAcesso`) ainda os emite enquanto o administrador não
  // configura os planos, e as telas já sabem exibi-los.
  | "curso-pago-plano-free"
  | "premium-expirado"
  | "free-expirado"
  | "free-revogado";

export type Veredito =
  | { permitido: true }
  | { permitido: false; motivo: MotivoBloqueio; mensagem: string };

/** Mensagens dos motivos que este motor emite. */
const MENSAGEM = {
  "conta-suspensa":
    "Seu acesso está temporariamente suspenso. Seu progresso está guardado — fale com a coordenação para regularizar.",
  "sem-plano":
    "Este conteúdo faz parte de um plano que você ainda não tem. Seu progresso continua salvo.",
  "modulo-fora-do-plano":
    "Este módulo não está incluído no seu plano atual. Os demais módulos continuam liberados.",
} as const satisfies Partial<Record<MotivoBloqueio, string>>;

/** Pode entrar neste curso (em qualquer parte dele)? */
export function podeVerCurso(acesso: AcessoEfetivo, courseId: string): Veredito {
  if (acesso.irrestrito) return { permitido: true };
  if (acesso.contaSuspensa) {
    return { permitido: false, motivo: "conta-suspensa", mensagem: MENSAGEM["conta-suspensa"] };
  }

  const doCurso = acesso.porCurso.get(courseId);
  // "parcial" com conjunto vazio não é acesso: é um plano que lista o
  // curso e nenhum módulo. Tratar como liberado abriria o curso inteiro.
  if (!doCurso || doCurso.tipo === "nenhum") {
    return { permitido: false, motivo: "sem-plano", mensagem: MENSAGEM["sem-plano"] };
  }
  if (doCurso.tipo === "parcial" && doCurso.moduleIds.size === 0) {
    return { permitido: false, motivo: "sem-plano", mensagem: MENSAGEM["sem-plano"] };
  }

  return { permitido: true };
}

/** Pode abrir este módulo especificamente? */
export function podeVerModulo(
  acesso: AcessoEfetivo,
  courseId: string,
  moduleId: string,
): Veredito {
  if (acesso.irrestrito) return { permitido: true };
  if (acesso.contaSuspensa) {
    return { permitido: false, motivo: "conta-suspensa", mensagem: MENSAGEM["conta-suspensa"] };
  }

  const doCurso = acesso.porCurso.get(courseId);
  if (!doCurso || doCurso.tipo === "nenhum") {
    return { permitido: false, motivo: "sem-plano", mensagem: MENSAGEM["sem-plano"] };
  }
  if (doCurso.tipo === "completo") return { permitido: true };

  return doCurso.moduleIds.has(moduleId)
    ? { permitido: true }
    : {
        permitido: false,
        motivo: "modulo-fora-do-plano",
        mensagem: MENSAGEM["modulo-fora-do-plano"],
      };
}

/** Os cursos que o aluno alcança, para filtrar listagens. */
export function cursosAlcancados(acesso: AcessoEfetivo): string[] {
  if (acesso.contaSuspensa) return [];
  return [...acesso.porCurso.keys()].filter(
    (id) => podeVerCurso(acesso, id).permitido,
  );
}

/**
 * O aluno tem algum acesso pago?
 *
 * Usado só para espelhar o enum `User.plano`, que relatórios e landing
 * ainda leem. Não é usado para decidir acesso — quem decide é
 * `calcularAcesso`.
 */
export function temAcessoPago(aluno: AlunoParaAcesso, agora: Date = new Date()): boolean {
  return aluno.assinaturas.some(
    (a) => !a.plano.gratuito && assinaturaVale(a, agora).vale,
  );
}
