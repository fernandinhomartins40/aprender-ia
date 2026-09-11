"use server";

import webpush from "web-push";
import { prisma } from "@aprender/db";
import { auth } from "@aprender/auth";

/**
 * Envio de notificações push.
 *
 * O que existia antes gravava a mensagem na tabela `notifications` e, no
 * melhor caso, mandava e-mail. O aparelho do aluno nunca era avisado: ele
 * só via o aviso se abrisse o aplicativo e olhasse o sino. Este módulo
 * fecha esse buraco.
 *
 * O par VAPID identifica a plataforma junto ao Push Service (Google,
 * Apple, Mozilla). Sem ele o envio é recusado. As chaves vêm do ambiente
 * e o deploy as cria uma vez, preservando entre releases — trocar a chave
 * pública invalida TODAS as inscrições existentes, porque o navegador
 * amarra a inscrição à chave com que ela foi criada.
 */

const PUBLICA = process.env.VAPID_PUBLIC_KEY ?? "";
const PRIVADA = process.env.VAPID_PRIVATE_KEY ?? "";
const CONTATO = process.env.VAPID_SUBJECT ?? "mailto:contato@aprenderia.site";

let configurado = false;

/** Configura o VAPID uma vez. Devolve false quando falta chave. */
function pronto(): boolean {
  if (!PUBLICA || !PRIVADA) return false;
  if (!configurado) {
    webpush.setVapidDetails(CONTATO, PUBLICA, PRIVADA);
    configurado = true;
  }
  return true;
}

/** A chave pública, para o navegador criar a inscrição. */
export async function chavePublicaPush(): Promise<string | null> {
  return PUBLICA || null;
}

export type ResultadoPush = {
  enviadas: number;
  falhas: number;
  removidas: number;
  /// Vazio quando o push está configurado. Preenchido, a tela explica.
  indisponivel: string | null;
};

/**
 * Manda um push para todos os aparelhos de um aluno.
 *
 * Nunca lança: o push é um canal a mais, e uma falha aqui não pode
 * derrubar a ação que originou o aviso (aprovar acesso, lançar cobrança).
 */
export async function enviarPush(
  userId: string,
  conteudo: { titulo: string; corpo: string; link?: string | null; assunto?: string },
): Promise<ResultadoPush> {
  if (!pronto()) {
    return {
      enviadas: 0,
      falhas: 0,
      removidas: 0,
      indisponivel: "As chaves VAPID não estão configuradas no servidor.",
    };
  }

  let inscricoes: { id: string; endpoint: string; p256dh: string; auth: string }[];
  try {
    inscricoes = await prisma.pushSubscription.findMany({
      where: { userId },
      select: { id: true, endpoint: true, p256dh: true, auth: true },
    });
  } catch (e) {
    console.error("[push] falha ao ler inscrições:", e);
    return { enviadas: 0, falhas: 0, removidas: 0, indisponivel: null };
  }

  if (inscricoes.length === 0) {
    return { enviadas: 0, falhas: 0, removidas: 0, indisponivel: null };
  }

  const carga = JSON.stringify({
    titulo: conteudo.titulo,
    corpo: conteudo.corpo,
    link: conteudo.link ?? "/app",
    assunto: conteudo.assunto ?? "aprender-ia",
  });

  let enviadas = 0;
  let falhas = 0;
  let removidas = 0;
  const mortas: string[] = [];

  await Promise.all(
    inscricoes.map(async (i) => {
      try {
        await webpush.sendNotification(
          { endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } },
          carga,
          // TTL: quanto o Push Service guarda a mensagem se o aparelho
          // estiver desligado. 24h — aviso de plataforma não faz sentido
          // chegar uma semana depois.
          { TTL: 86_400, urgency: "normal" },
        );
        enviadas++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // 404/410 = inscrição morta (aplicativo desinstalado, permissão
        // revogada). Guardar endpoint morto só gera erro a cada disparo,
        // então apagamos.
        if (status === 404 || status === 410) {
          mortas.push(i.id);
        } else {
          falhas++;
          console.error(`[push] envio falhou (status ${status ?? "?"}):`, e);
        }
      }
    }),
  );

  if (mortas.length > 0) {
    try {
      await prisma.pushSubscription.deleteMany({ where: { id: { in: mortas } } });
      removidas = mortas.length;
    } catch (e) {
      console.error("[push] falha ao remover inscrições mortas:", e);
    }
  }

  if (enviadas > 0) {
    try {
      await prisma.pushSubscription.updateMany({
        where: { userId, id: { notIn: mortas } },
        data: { ultimoEnvioEm: new Date() },
      });
    } catch {
      /* marcar a data é informativo; não vale falhar o envio */
    }
  }

  return { enviadas, falhas, removidas, indisponivel: null };
}

/* ============================================================
   INSCRIÇÃO DO APARELHO
   ============================================================ */

export type ResultadoInscricao = { ok: boolean; mensagem: string };

/**
 * Guarda a inscrição que o navegador criou, ligada ao aluno da sessão.
 *
 * A ligação vem da sessão, nunca de um id enviado pelo cliente: aceitar
 * `userId` do corpo da requisição deixaria qualquer pessoa inscrever o
 * próprio aparelho para receber os avisos de outro aluno.
 */
export async function registrarInscricao(entrada: {
  endpoint: string;
  p256dh: string;
  auth: string;
  agente?: string | null;
}): Promise<ResultadoInscricao> {
  const sessao = await auth();
  if (!sessao?.user?.id) {
    return { ok: false, mensagem: "Entre na sua conta para ativar os avisos." };
  }

  if (!entrada.endpoint || !entrada.p256dh || !entrada.auth) {
    return { ok: false, mensagem: "O navegador não devolveu a inscrição completa." };
  }

  try {
    // O endpoint é único: se o aparelho reinstalou o aplicativo, a linha
    // é atualizada (inclusive o dono, caso outra pessoa passe a usar o
    // mesmo aparelho) em vez de duplicar.
    await prisma.pushSubscription.upsert({
      where: { endpoint: entrada.endpoint },
      create: {
        userId: sessao.user.id,
        endpoint: entrada.endpoint,
        p256dh: entrada.p256dh,
        auth: entrada.auth,
        agente: entrada.agente ?? null,
      },
      update: {
        userId: sessao.user.id,
        p256dh: entrada.p256dh,
        auth: entrada.auth,
        agente: entrada.agente ?? null,
      },
    });
    return { ok: true, mensagem: "Avisos ativados neste aparelho." };
  } catch (e) {
    console.error("[push] falha ao registrar inscrição:", e);
    return { ok: false, mensagem: "Não foi possível ativar agora. Tente de novo." };
  }
}

/** Remove a inscrição deste aparelho (o aluno desligou os avisos). */
export async function removerInscricao(endpoint: string): Promise<void> {
  const sessao = await auth();
  if (!sessao?.user?.id || !endpoint) return;

  try {
    // O filtro por userId impede que alguém apague a inscrição de outro
    // aluno enviando um endpoint que não é seu.
    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: sessao.user.id },
    });
  } catch (e) {
    console.error("[push] falha ao remover inscrição:", e);
  }
}

/** Quantos aparelhos este aluno tem ativos — a tela usa para o estado. */
export async function meusAparelhos(): Promise<number> {
  const sessao = await auth();
  if (!sessao?.user?.id) return 0;
  try {
    return await prisma.pushSubscription.count({ where: { userId: sessao.user.id } });
  } catch {
    return 0;
  }
}
