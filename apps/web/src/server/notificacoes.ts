"use server";

import { revalidatePath } from "next/cache";
import { prisma, type CanalNotificacao } from "@aprender/db";
import { auth } from "@aprender/auth";
import { enviarEmail } from "@aprender/auth/email";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { lerTexto } from "./configuracoes";

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
        titulo: entrada.titulo,
        corpo: entrada.corpo,
        link: entrada.link ?? null,
        autorNome: entrada.autorNome ?? null,
      },
      select: { id: true },
    });

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

    const envio = await enviarEmail({
      para: alvo.email,
      assunto: entrada.titulo,
      texto: entrada.corpo,
      html: montarHtml(entrada.titulo, entrada.corpo, entrada.link ?? null),
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

/** HTML simples: cliente de e-mail não é navegador, então nada de CSS externo. */
function montarHtml(titulo: string, corpo: string, link: string | null): string {
  const paragrafos = corpo
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 14px;line-height:1.6">${escapar(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const botao = link
    ? `<p style="margin:24px 0 0"><a href="${escapar(link)}" style="background:#4F46E5;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Abrir na plataforma</a></p>`
    : "";

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1F2937">
<h1 style="font-size:20px;margin:0 0 16px">${escapar(titulo)}</h1>
${paragrafos}${botao}
<p style="margin:28px 0 0;font-size:13px;color:#6B7280">Aprender IA — formação em Inteligência Artificial para professores.</p>
</div>`;
}

function escapar(t: string): string {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
export async function minhasNotificacoes(): Promise<{
  lista: { id: string; titulo: string; corpo: string; link: string | null; lidoEm: Date | null; criadoEm: Date }[];
  naoLidas: number;
}> {
  const sessao = await auth();
  if (!sessao?.user) return { lista: [], naoLidas: 0 };

  try {
    const [lista, naoLidas] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: sessao.user.id },
        orderBy: { criadoEm: "desc" },
        take: 20,
        select: {
          id: true, titulo: true, corpo: true, link: true,
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
