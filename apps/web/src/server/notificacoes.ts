"use server";

import { revalidatePath } from "next/cache";
import { prisma, type CanalNotificacao } from "@aprender/db";
import { auth } from "@aprender/auth";
import { enviarEmail, montarEmailNotificacao } from "@aprender/auth/email";
import { templateDe } from "@aprender/auth/credenciais-email";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { lerTexto } from "./configuracoes";
import { lerNumero } from "./configuracoes";
import { enviarPush } from "./push";

export type CategoriaNotificacao =
  | "ESSENCIAL"
  | "ESTUDO"
  | "DESAFIO"
  | "CONQUISTA"
  | "MISSAO";

/**
 * Notificações da plataforma.
 *
 * Toda mensagem é gravada antes de qualquer tentativa de envio. O motivo
 * é prático: sem registro, "eu avisei esse aluno que o acesso ia vencer?"
 * não tem resposta — e é exatamente a pergunta que aparece quando alguém
 * reclama de ter perdido o acesso sem aviso.
 *
 * Há três canais, e a diferença entre eles importa:
 *   PLATAFORMA — só o sino do painel do aluno. Sempre funciona.
 *   EMAIL      — depende de SMTP. Sem SMTP, fica FALHOU com o motivo.
 *   WHATSAPP   — a plataforma NÃO envia. Gera o texto e o link para o
 *                administrador enviar. É o único canal que alcança o
 *                aluno cadastrado só com telefone, que não tem e-mail
 *                real (o endereço @aluno.aprenderia.site não recebe).
 *
 * Além dos canais acima, TODA notificação tenta o push para os aparelhos
 * que o aluno autorizou. Não é um quarto canal: é a entrega do mesmo
 * aviso no aparelho, em vez de esperar que a pessoa abra o aplicativo e
 * olhe o sino. Antes disso, uma mensagem criada no painel ficava parada
 * no banco até o próximo acesso do aluno — que podia nunca acontecer
 * antes do prazo que a mensagem avisava.
 */

/* ============================================================
   CRIAÇÃO
   ============================================================ */

export type NovaNotificacao = {
  userId: string;
  assunto: string;
  titulo: string;
  corpo: string;
  link?: string | null;
  /// Tenta e-mail além do registro no painel.
  porEmail?: boolean;
  /// Nome de quem disparou; ausente = regra automática da plataforma.
  autorNome?: string | null;
  categoria?: CategoriaNotificacao;
  dedupeHoras?: number;
  automatica?: boolean;
  enviarPushAgora?: boolean;
  contentId?: string | null;
};

/**
 * Registra a notificação e, se pedido, tenta o e-mail.
 *
 * Nunca lança: uma notificação que falha não pode derrubar a ação que a
 * originou. Aprovar um acesso e depois estourar no envio do aviso deixaria
 * o administrador sem saber se a aprovação valeu.
 */
export async function notificar(
  entrada: NovaNotificacao,
): Promise<{ registrada: boolean; emailEntregue: boolean }> {
  try {
    const categoria = entrada.categoria ?? "ESSENCIAL";

    if (categoria !== "ESSENCIAL") {
      const preferencias = await prisma.notificationPreference.findUnique({
        where: { userId: entrada.userId },
      });
      const habilitada =
        categoria === "ESTUDO" ? preferencias?.lembretesEstudo !== false
          : categoria === "DESAFIO" ? preferencias?.novosDesafios !== false
            : categoria === "CONQUISTA" ? preferencias?.conquistas !== false
              : preferencias?.missoes !== false;
      if (!habilitada) return { registrada: false, emailEntregue: false };
    }

    if (entrada.dedupeHoras && entrada.dedupeHoras > 0) {
      const desde = new Date(Date.now() - entrada.dedupeHoras * 3_600_000);
      const repetida = await prisma.notification.findFirst({
        where: { userId: entrada.userId, assunto: entrada.assunto, criadoEm: { gte: desde } },
        select: { id: true },
      });
      if (repetida) return { registrada: false, emailEntregue: false };
    }

    if (entrada.automatica) {
      const [maxDia, horaInicio, horaFim] = await Promise.all([
        lerNumero("engajamento.max_por_dia"),
        lerNumero("engajamento.hora_inicio"),
        lerNumero("engajamento.hora_fim"),
      ]);
      const hora = Number(new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false,
      }).format(new Date()));
      if (hora < Math.min(23, horaInicio) || hora >= Math.min(24, horaFim)) {
        return { registrada: false, emailEntregue: false };
      }
      const inicioDia = new Date();
      inicioDia.setHours(0, 0, 0, 0);
      const hoje = await prisma.notification.count({
        where: {
          userId: entrada.userId,
          criadoEm: { gte: inicioDia },
          autorNome: null,
          assunto: { startsWith: "engajamento." },
        },
      });
      if (maxDia >= 0 && hoje >= maxDia) return { registrada: false, emailEntregue: false };
    }

    const alvo = await prisma.user.findUnique({
      where: { id: entrada.userId },
      select: { email: true, nome: true },
    });
    if (!alvo) return { registrada: false, emailEntregue: false };

    const registro = await prisma.notification.create({
      data: {
        userId: entrada.userId,
        canal: entrada.porEmail ? "EMAIL" : "PLATAFORMA",
        // Sem envio externo a fazer, o estado final já é este: não existe
        // "pendente" para uma mensagem que só precisa aparecer no painel.
        status: entrada.porEmail ? "PENDENTE" : "REGISTRADA",
        assunto: entrada.assunto,
        categoria,
        titulo: entrada.titulo,
        corpo: entrada.corpo,
        link: entrada.link ?? null,
        contentId: entrada.contentId ?? null,
        autorNome: entrada.autorNome ?? null,
      },
      select: { id: true },
    });

    // O push sai para qualquer canal: o aviso é o mesmo, muda só por onde
    // ele alcança a pessoa. Falha aqui não interrompe nada — `enviarPush`
    // já trata os próprios erros e nunca lança.
    if (entrada.enviarPushAgora !== false) {
      await enviarPush(entrada.userId, {
        titulo: entrada.titulo,
        corpo: entrada.corpo,
        link: entrada.link ?? "/app",
        assunto: entrada.assunto,
        silenciosaSeAberto: entrada.automatica === true,
      });
    }

    if (!entrada.porEmail) {
      revalidatePath("/app");
      return { registrada: true, emailEntregue: false };
    }

    // Conta de telefone tem e-mail sintético, que não recebe nada.
    if (!alvo.email || alvo.email.endsWith("@aluno.aprenderia.site")) {
      await prisma.notification.update({
        where: { id: registro.id },
        data: {
          canal: "PLATAFORMA",
          status: "REGISTRADA",
          erro: "Conta sem e-mail real (cadastro por telefone). Avise pelo WhatsApp.",
        },
      });
      revalidatePath("/app");
      return { registrada: true, emailEntregue: false };
    }

    const template = await templateDe("email.template.notificacao");
    const envio = await enviarEmail({
      para: alvo.email,
      assunto: entrada.titulo,
      texto: entrada.corpo,
      html: montarEmailNotificacao({
        titulo: entrada.titulo,
        corpo: entrada.corpo,
        link: entrada.link ?? null,
      }),
      ...(template
        ? {
            templateId: template,
            variaveis: {
              titulo: entrada.titulo,
              corpo: entrada.corpo,
              link: entrada.link ?? "",
            },
          }
        : {}),
    });

    await prisma.notification.update({
      where: { id: registro.id },
      data: {
        status: envio.entregue ? "ENVIADA" : "FALHOU",
        enviadoEm: envio.entregue ? new Date() : null,
        erro: envio.entregue ? null : (envio.motivo ?? "falha desconhecida"),
      },
    });

    revalidatePath("/app");
    return { registrada: true, emailEntregue: envio.entregue };
  } catch (e) {
    console.error("[notificacoes] falha ao notificar:", e);
    return { registrada: false, emailEntregue: false };
  }
}

/* ============================================================
   ENVIO PELO PAINEL
   ============================================================ */

export type ResultadoNotificacao = { ok: boolean; mensagem: string };

/**
 * Envia uma mensagem escrita pelo administrador.
 *
 * O destino pode ser um aluno, uma turma inteira ou um recorte
 * (inadimplentes, Free a vencer). Mandar de um em um para uma turma de 40
 * não é trabalho de gente.
 */
export async function enviarNotificacao(
  _anterior: ResultadoNotificacao | null,
  dados: FormData,
): Promise<ResultadoNotificacao> {
  const admin = await exigirAdmin();

  const destino = String(dados.get("destino") ?? "").trim();
  const alvoId = String(dados.get("alvoId") ?? "").trim();
  const titulo = String(dados.get("titulo") ?? "").trim();
  const corpo = String(dados.get("corpo") ?? "").trim();
  const porEmail = String(dados.get("porEmail") ?? "") === "on";

  if (!titulo || !corpo) {
    return { ok: false, mensagem: "Escreva o título e a mensagem." };
  }

  const ids = await resolverDestinatarios(destino, alvoId);

  if (ids.length === 0) {
    return { ok: false, mensagem: "Nenhum aluno se encaixa nesse destino." };
  }

  let entregues = 0;
  for (const userId of ids) {
    const r = await notificar({
      userId,
      assunto: "admin.mensagem",
      titulo,
      corpo,
      porEmail,
      autorNome: admin.nome,
    });
    if (r.emailEntregue) entregues++;
  }

  await registrarAcao({
    acao: "notificacao.enviada",
    entidade: "Notification",
    resumo: `"${titulo}" para ${ids.length} aluno(s)`,
    dados: { destino, alvoId: alvoId || null, porEmail, total: ids.length, entregues },
  });

  revalidatePath("/admin/notificacoes");

  // O relatório é explícito sobre a diferença entre registrar e entregar:
  // dizer "enviado" quando o e-mail não saiu seria mentira útil a ninguém.
  const parteEmail = porEmail
    ? entregues === ids.length
      ? " Todos por e-mail também."
      : ` ${entregues} por e-mail (o restante só no painel — veja o motivo na lista).`
    : "";

  return {
    ok: true,
    mensagem: `Mensagem registrada para ${ids.length} aluno(s).${parteEmail}`,
  };
}

/** Traduz o destino escolhido na tela numa lista de ids. */
async function resolverDestinatarios(destino: string, alvoId: string): Promise<string[]> {
  const hoje = new Date();

  if (destino === "aluno" && alvoId) return [alvoId];

  if (destino === "turma" && alvoId) {
    const membros = await prisma.cohortMember.findMany({
      where: { cohortId: alvoId },
      select: { userId: true },
    });
    return membros.map((m) => m.userId);
  }

  const where =
    destino === "inadimplentes"
      ? { papel: "ALUNO" as const, pagamentos: { some: { status: "ATRASADO" as const } } }
      : destino === "free_a_vencer"
        ? {
            papel: "ALUNO" as const,
            plano: "FREE" as const,
            freeRevogadoEm: null,
            freeAte: {
              gte: hoje,
              lte: new Date(hoje.getTime() + 7 * 86_400_000),
            },
          }
        : destino === "free_expirado"
          ? {
              papel: "ALUNO" as const,
              plano: "FREE" as const,
              freeAte: { lt: hoje },
            }
          : { papel: "ALUNO" as const };

  const alunos = await prisma.user.findMany({ where, select: { id: true } });
  return alunos.map((a) => a.id);
}

/* ============================================================
   CONSULTA
   ============================================================ */

/**
 * Uma linha do histórico, com o aluno já resolvido.
 *
 * Declarado à mão porque o `catch` abaixo devolve lista vazia: sem um tipo
 * comum, o TypeScript unifica os dois caminhos pelo mais pobre e a tela
 * perde o acesso a `user`.
 */
export type LinhaNotificacao = {
  id: string;
  titulo: string;
  corpo: string;
  canal: CanalNotificacao;
  status: string;
  erro: string | null;
  autorNome: string | null;
  lidoEm: Date | null;
  criadoEm: Date;
  user: { id: string; nome: string; email: string; telefone: string | null };
};

export async function listarNotificacoes(pagina = 1): Promise<{
  total: number;
  registros: LinhaNotificacao[];
  paginas: number;
  indisponivel: boolean;
}> {
  await exigirAdmin();
  const porPagina = 40;

  try {
    const [total, registros] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.findMany({
        orderBy: { criadoEm: "desc" },
        skip: (Math.max(1, pagina) - 1) * porPagina,
        take: porPagina,
        include: {
          user: { select: { id: true, nome: true, email: true, telefone: true } },
        },
      }),
    ]);

    return {
      total,
      registros,
      paginas: Math.max(1, Math.ceil(total / porPagina)),
      indisponivel: false,
    };
  } catch (e) {
    console.error("[notificacoes] listagem indisponível (migration pendente?).", e);
    return { total: 0, registros: [], paginas: 1, indisponivel: true };
  }
}

/** As notificações do aluno logado, para o sino do painel. */
export async function minhasNotificacoes(limite = 20, categoria?: CategoriaNotificacao): Promise<{
  lista: { id: string; categoria: string; titulo: string; corpo: string; link: string | null; lidoEm: Date | null; criadoEm: Date }[];
  naoLidas: number;
}> {
  const sessao = await auth();
  if (!sessao?.user) return { lista: [], naoLidas: 0 };

  try {
    const [lista, naoLidas] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: sessao.user.id, ...(categoria ? { categoria } : {}) },
        orderBy: { criadoEm: "desc" },
        take: Math.min(100, Math.max(1, limite)),
        select: {
          id: true, categoria: true, titulo: true, corpo: true, link: true,
          lidoEm: true, criadoEm: true,
        },
      }),
      prisma.notification.count({
        where: { userId: sessao.user.id, lidoEm: null },
      }),
    ]);
    return { lista, naoLidas };
  } catch {
    return { lista: [], naoLidas: 0 };
  }
}

export async function marcarComoLidas(): Promise<void> {
  const sessao = await auth();
  if (!sessao?.user) return;

  try {
    await prisma.notification.updateMany({
      where: { userId: sessao.user.id, lidoEm: null },
      data: { lidoEm: new Date() },
    });
    revalidatePath("/app");
  } catch (e) {
    console.error("[notificacoes] falha ao marcar como lidas:", e);
  }
}

export async function marcarNotificacaoComoLida(dados: FormData): Promise<void> {
  const sessao = await auth();
  if (!sessao?.user) return;
  const id = String(dados.get("id") ?? "");
  if (!id) return;
  await prisma.notification.updateMany({
    where: { id, userId: sessao.user.id },
    data: { lidoEm: new Date() },
  });
  revalidatePath("/app/notificacoes");
}

export async function minhasPreferenciasNotificacao() {
  const sessao = await auth();
  if (!sessao?.user) return null;
  return prisma.notificationPreference.findUnique({ where: { userId: sessao.user.id } });
}

export async function salvarPreferenciasNotificacao(dados: FormData): Promise<void> {
  const sessao = await auth();
  if (!sessao?.user) return;
  const valor = (chave: string) => String(dados.get(chave) ?? "") === "on";
  await prisma.notificationPreference.upsert({
    where: { userId: sessao.user.id },
    create: {
      userId: sessao.user.id,
      lembretesEstudo: valor("lembretesEstudo"),
      novosDesafios: valor("novosDesafios"),
      conquistas: valor("conquistas"),
      missoes: valor("missoes"),
    },
    update: {
      lembretesEstudo: valor("lembretesEstudo"),
      novosDesafios: valor("novosDesafios"),
      conquistas: valor("conquistas"),
      missoes: valor("missoes"),
    },
  });
  revalidatePath("/app/notificacoes");
}

/* ============================================================
   TEXTO PARA WHATSAPP
   ============================================================ */

/**
 * Link wa.me pronto, para o aluno que só tem telefone.
 *
 * A plataforma não envia WhatsApp — abrir a conversa com o texto pronto é
 * o mais longe que se chega sem uma API paga. Melhor isso do que deixar
 * essas pessoas sem nenhum aviso.
 */
export async function linkWhatsApp(
  telefone: string | null,
  texto: string,
): Promise<string | null> {
  if (!telefone) return null;
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length < 10) return null;
  const comPais = numeros.startsWith("55") ? numeros : `55${numeros}`;
  return `https://wa.me/${comPais}?text=${encodeURIComponent(texto)}`;
}

/** Assinatura do texto, com o contato de suporte configurado. */
export async function rodapeMensagem(): Promise<string> {
  const nome = await lerTexto("plataforma.nome");
  const suporte = await lerTexto("plataforma.whatsapp_suporte");
  return suporte ? `${nome} · Dúvidas: ${suporte}` : nome;
}

/** Marca como enviada uma notificação de WhatsApp que o admin já mandou. */
export async function confirmarEnvioWhatsApp(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("notificationId") ?? "");
  if (!id) return;

  await prisma.notification.update({
    where: { id },
    data: { canal: "WHATSAPP", status: "ENVIADA", enviadoEm: new Date(), erro: null },
  });

  revalidatePath("/admin/notificacoes");
}

/** Canal legível para a tela, sem expor o enum cru. */
export async function rotuloCanal(canal: CanalNotificacao): Promise<string> {
  return canal === "EMAIL" ? "E-mail" : canal === "WHATSAPP" ? "WhatsApp" : "Painel";
}
