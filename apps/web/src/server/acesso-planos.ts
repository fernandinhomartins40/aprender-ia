"use server";

import { revalidatePath } from "next/cache";
import { prisma, type AbrangenciaPlano } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { sincronizarPlanoLegado } from "./acesso";
import { calcularAcesso, type AlunoParaAcesso } from "@/lib/motor-acesso";

/**
 * Administração do que cada plano libera e de quais planos cada aluno tem.
 *
 * Separado de `assinaturas.ts` de propósito: aquele arquivo cuida do lado
 * financeiro (preço, cobrança, inadimplência) e este do lado de acesso.
 * São perguntas diferentes — "quanto custa" e "o que libera" — e
 * misturá-las foi parte do que deixou o modelo confuso.
 */

/* ============================================================
   O QUE O PLANO LIBERA
   ============================================================ */

/**
 * Salva os cursos e módulos de um plano.
 *
 * O formulário manda, para cada curso marcado, a abrangência e (quando
 * for o caso) os módulos escolhidos. Regravamos o conjunto inteiro numa
 * transação: calcular diferença item a item daria margem a estados
 * intermediários em que o plano libera algo que o administrador acabou de
 * desmarcar.
 */
export async function salvarConteudoDoPlano(dados: FormData): Promise<void> {
  await exigirAdmin();

  const planId = String(dados.get("planId") ?? "").trim();
  if (!planId) return;

  const plano = await prisma.plan.findUnique({
    where: { id: planId },
    select: { id: true, nome: true },
  });
  if (!plano) return;

  // `cursos` traz os ids marcados; para cada um, `abrangencia:<id>` diz
  // se é o curso inteiro e `modulos:<id>` lista os módulos escolhidos.
  const cursosMarcados = dados.getAll("cursos").map(String).filter(Boolean);

  const selecao = cursosMarcados.map((courseId) => {
    const abrangencia = (String(dados.get(`abrangencia:${courseId}`) ?? "CURSO_COMPLETO") ===
    "MODULOS_ESPECIFICOS"
      ? "MODULOS_ESPECIFICOS"
      : "CURSO_COMPLETO") as AbrangenciaPlano;

    return {
      courseId,
      abrangencia,
      moduleIds: dados.getAll(`modulos:${courseId}`).map(String).filter(Boolean),
    };
  });

  // Um curso marcado como "módulos específicos" sem nenhum módulo não
  // libera nada e só confundiria o relatório de acessos. Descartamos em
  // vez de gravar uma linha inerte.
  const efetivos = selecao.filter(
    (s) => s.abrangencia === "CURSO_COMPLETO" || s.moduleIds.length > 0,
  );

  await prisma.$transaction(async (tx) => {
    await tx.planCourse.deleteMany({ where: { planId } });

    for (const s of efetivos) {
      const criado = await tx.planCourse.create({
        data: { planId, courseId: s.courseId, abrangencia: s.abrangencia },
        select: { id: true },
      });

      if (s.abrangencia === "MODULOS_ESPECIFICOS" && s.moduleIds.length > 0) {
        await tx.planModule.createMany({
          data: s.moduleIds.map((moduleId) => ({ planCourseId: criado.id, moduleId })),
          skipDuplicates: true,
        });
      }
    }
  });

  await registrarAcao({
    acao: "plano.conteudo.alterado",
    entidade: "Plan",
    entidadeId: planId,
    resumo: `Conteúdo do plano "${plano.nome}" atualizado — ${efetivos.length} curso(s)`,
    dados: {
      cursos: efetivos.map((e) => ({
        courseId: e.courseId,
        abrangencia: e.abrangencia,
        modulos: e.moduleIds.length,
      })),
    },
  });

  revalidatePath("/admin/planos");
  revalidatePath(`/admin/planos/${planId}`);
  // O acesso de todo mundo pode ter mudado.
  revalidatePath("/app");
  revalidatePath("/app/trilha");
}

/* ============================================================
   PLANOS DE UM ALUNO
   ============================================================ */

function dataDe(dados: FormData, campo: string): Date | null {
  const valor = String(dados.get(campo) ?? "").trim();
  if (!valor) return null;
  const d = new Date(`${valor}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Concede um plano a um aluno, manualmente.
 *
 * É a concessão administrativa (bolsa, cortesia, parceria, correção de um
 * pagamento lançado fora do sistema). Não gera cobrança nem entra no
 * faturamento — `concedidaManualmente` a distingue de uma venda.
 *
 * O aluno pode acumular planos: a única coisa barrada é uma segunda
 * assinatura VIVA do mesmo plano, que seria acesso duplicado ao mesmo
 * conteúdo. Assinaturas encerradas do mesmo plano continuam no histórico.
 */
export async function concederPlano(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();

  const userId = String(dados.get("userId") ?? "").trim();
  const planId = String(dados.get("planId") ?? "").trim();
  if (!userId || !planId) return;

  const [aluno, plano] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, nome: true } }),
    prisma.plan.findUnique({
      where: { id: planId },
      select: { id: true, nome: true, precoCentavos: true, periodicidade: true },
    }),
  ]);
  if (!aluno || !plano) return;

  const jaTem = await prisma.subscription.findFirst({
    where: {
      userId,
      planId,
      status: { in: ["ATIVA", "PENDENTE", "INADIMPLENTE", "SUSPENSA"] },
    },
    select: { id: true },
  });
  if (jaTem) return;

  const semExpiracao = String(dados.get("semExpiracao") ?? "") === "on";
  const fim = dataDe(dados, "cicloFimEm");
  const inicio = dataDe(dados, "inicioEm") ?? new Date();

  await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: "ATIVA",
      precoCentavos: plano.precoCentavos,
      periodicidade: plano.periodicidade,
      inicioEm: inicio,
      cicloFimEm: semExpiracao ? null : fim,
      // Concessão manual não gera cobrança futura.
      proximaEm: null,
      semExpiracao,
      concedidaManualmente: true,
      observacoes: String(dados.get("observacoes") ?? "").trim() || null,
    },
  });

  // O enum antigo continua sendo lido por relatórios e pela landing.
  await sincronizarPlanoLegado(userId);

  await registrarAcao({
    acao: "acesso.plano.concedido",
    entidade: "User",
    entidadeId: userId,
    resumo: `${admin.nome} concedeu "${plano.nome}" a ${aluno.nome}`,
    dados: { planId, semExpiracao, cicloFimEm: fim },
  });

  revalidatePath(`/admin/alunos/${userId}`);
  revalidatePath("/admin/alunos");
  revalidatePath("/app");
}

/** Altera o status ou o período de uma assinatura. */
export async function alterarAssinaturaDoAluno(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();

  const id = String(dados.get("id") ?? "").trim();
  if (!id) return;

  const atual = await prisma.subscription.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      user: { select: { nome: true } },
      plan: { select: { nome: true } },
    },
  });
  if (!atual) return;

  const status = String(dados.get("status") ?? "").trim();
  const PERMITIDOS = ["ATIVA", "PENDENTE", "INADIMPLENTE", "SUSPENSA", "CANCELADA", "EXPIRADA"];
  if (status && !PERMITIDOS.includes(status)) return;

  const semExpiracao = String(dados.get("semExpiracao") ?? "") === "on";
  const fim = dataDe(dados, "cicloFimEm");

  await prisma.subscription.update({
    where: { id },
    data: {
      ...(status ? { status: status as never } : {}),
      semExpiracao,
      cicloFimEm: semExpiracao ? null : fim,
      ...(status === "CANCELADA" && atual.status !== "CANCELADA"
        ? { canceladoEm: new Date(), canceladoPor: "admin" }
        : {}),
    },
  });

  await sincronizarPlanoLegado(atual.userId);

  await registrarAcao({
    acao: "acesso.plano.alterado",
    entidade: "User",
    entidadeId: atual.userId,
    resumo: `${admin.nome} alterou "${atual.plan.nome}" de ${atual.user.nome} (${atual.status} → ${status || atual.status})`,
    dados: { assinaturaId: id, status, semExpiracao, cicloFimEm: fim },
  });

  revalidatePath(`/admin/alunos/${atual.userId}`);
  revalidatePath("/app");
}

/**
 * Remove uma assinatura.
 *
 * Só as concedidas manualmente podem ser apagadas: uma assinatura com
 * histórico de cobrança é registro financeiro, e apagá-la destruiria a
 * prova do que a pessoa pagou. Para essas, o caminho é cancelar.
 */
export async function removerAssinaturaDoAluno(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();

  const id = String(dados.get("id") ?? "").trim();
  if (!id) return;

  const alvo = await prisma.subscription.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      concedidaManualmente: true,
      user: { select: { nome: true } },
      plan: { select: { nome: true } },
      _count: { select: { cobrancas: true } },
    },
  });
  if (!alvo) return;

  if (!alvo.concedidaManualmente || alvo._count.cobrancas > 0) {
    // Tem histórico financeiro: cancelar preserva a prova do que foi pago.
    await prisma.subscription.update({
      where: { id },
      data: { status: "CANCELADA", canceladoEm: new Date(), canceladoPor: "admin" },
    });
  } else {
    await prisma.subscription.delete({ where: { id } });
  }

  await sincronizarPlanoLegado(alvo.userId);

  await registrarAcao({
    acao: "acesso.plano.removido",
    entidade: "User",
    entidadeId: alvo.userId,
    resumo: `${admin.nome} removeu "${alvo.plan.nome}" de ${alvo.user.nome}`,
    dados: { assinaturaId: id, apagada: alvo.concedidaManualmente && alvo._count.cobrancas === 0 },
  });

  revalidatePath(`/admin/alunos/${alvo.userId}`);
  revalidatePath("/app");
}

/* ============================================================
   LEITURA PARA O PAINEL
   ============================================================ */

/**
 * O retrato de acesso de um aluno, para o painel.
 *
 * Usa o MESMO motor que decide o acesso real. É isso que garante que o
 * que o administrador vê seja o que o aluno de fato alcança — não uma
 * segunda implementação da regra, que divergiria com o tempo.
 */
export async function retratoDeAcesso(userId: string) {
  const aluno = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nome: true,
      email: true,
      // A tela do aluno edita os dados cadastrais, e o telefone é o login de
      // quem entrou por lote — sem ele o formulário abriria com o campo vazio
      // e salvaria apagando o telefone de quem não mexesse nele.
      telefone: true,
      papel: true,
      situacao: true,
      assinaturas: {
        orderBy: { criadoEm: "desc" },
        select: {
          id: true,
          status: true,
          inicioEm: true,
          cicloFimEm: true,
          semExpiracao: true,
          concedidaManualmente: true,
          precoCentavos: true,
          periodicidade: true,
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

  const paraMotor: AlunoParaAcesso = {
    papel: aluno.papel,
    situacao: aluno.situacao,
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

  const acesso = calcularAcesso(paraMotor);

  const cursos = await prisma.course.findMany({
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      titulo: true,
      modulos: { orderBy: { ordem: "asc" }, select: { id: true, titulo: true, ordem: true } },
    },
  });

  return { aluno, acesso, cursos };
}

/** Planos disponíveis para conceder, com o que cada um libera. */
export async function planosParaConceder() {
  return prisma.plan.findMany({
    orderBy: [{ gratuito: "desc" }, { ordem: "asc" }, { nome: "asc" }],
    select: {
      id: true,
      nome: true,
      gratuito: true,
      ativo: true,
      precoCentavos: true,
      periodicidade: true,
      _count: { select: { cursos: true } },
    },
  });
}

/** Um plano com o conteúdo que libera, para a tela de configuração. */
export async function planoComConteudo(planId: string) {
  const [plano, cursos] = await Promise.all([
    prisma.plan.findUnique({
      where: { id: planId },
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
    }),
    prisma.course.findMany({
      orderBy: { ordem: "asc" },
      select: {
        id: true,
        titulo: true,
        publicado: true,
        modulos: {
          orderBy: { ordem: "asc" },
          select: { id: true, titulo: true, ordem: true, faixa: true },
        },
      },
    }),
  ]);

  if (!plano) return null;
  return { plano, cursos };
}
