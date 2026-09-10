"use server";

import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { notificar } from "./notificacoes";
import { lerNumero, lerBooleano } from "./configuracoes";
import { diasAte } from "@/lib/acesso-free";

/**
 * Avisos automáticos de prazo.
 *
 * A Fase 2 criou a regra de expiração do acesso gratuito, mas ninguém
 * avisava o aluno — o prazo simplesmente vencia. Isto fecha essa lacuna.
 *
 * Não há cron na VPS, então o disparo acontece quando o painel é aberto e
 * pelo botão "Enviar avisos agora". Para não incomodar quem já foi
 * avisado, `assunto` funciona como carimbo: um aviso por dia de prazo, por
 * pessoa. Sem isso, cada visita ao painel mandaria um e-mail novo.
 */

export type ResumoAvisos = {
  freeAVencer: number;
  freeExpirado: number;
  cobrancaVencendo: number;
  enviados: number;
};

/**
 * Quem precisa ser avisado, sem enviar nada.
 *
 * Serve para o painel mostrar o tamanho da fila antes de disparar — e para
 * o administrador decidir se quer mandar por e-mail ou pessoalmente.
 */
export async function filaDeAvisos(): Promise<ResumoAvisos> {
  try {
    const avisarDiasAntes = await lerNumero("free.avisar_dias_antes");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date(hoje.getTime() + avisarDiasAntes * 86_400_000);

    const [freeAVencer, freeExpirado, cobrancaVencendo] = await Promise.all([
      prisma.user.count({
        where: {
          papel: "ALUNO",
          plano: "FREE",
          freeRevogadoEm: null,
          freeAte: { gte: hoje, lte: limite },
        },
      }),
      prisma.user.count({
        where: { papel: "ALUNO", plano: "FREE", freeRevogadoEm: null, freeAte: { lt: hoje } },
      }),
      prisma.payment.count({
        where: {
          status: "PENDENTE",
          vencimentoEm: { gte: hoje, lte: new Date(hoje.getTime() + 3 * 86_400_000) },
        },
      }),
    ]);

    return { freeAVencer, freeExpirado, cobrancaVencendo, enviados: 0 };
  } catch (e) {
    console.error("[avisos] fila indisponível:", e);
    return { freeAVencer: 0, freeExpirado: 0, cobrancaVencendo: 0, enviados: 0 };
  }
}

/**
 * Dispara os avisos pendentes.
 *
 * Cada aviso é gravado como notificação; o e-mail é uma tentativa a mais.
 * Quem não tem e-mail real aparece na tela de notificações para você
 * mandar pelo WhatsApp.
 */
export async function enviarAvisos(): Promise<ResumoAvisos> {
  await exigirAdmin();

  const resultado: ResumoAvisos = {
    freeAVencer: 0,
    freeExpirado: 0,
    cobrancaVencendo: 0,
    enviados: 0,
  };

  try {
    const avisarDiasAntes = await lerNumero("free.avisar_dias_antes");
    const permiteSolicitar = await lerBooleano("free.permite_solicitar_novo");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date(hoje.getTime() + avisarDiasAntes * 86_400_000);

    // ---- Acesso gratuito a vencer ----
    const aVencer = await prisma.user.findMany({
      where: {
        papel: "ALUNO",
        plano: "FREE",
        freeRevogadoEm: null,
        freeAte: { gte: hoje, lte: limite },
      },
      select: { id: true, nome: true, freeAte: true },
    });

    for (const aluno of aVencer) {
      // A consulta já filtra por intervalo, então `freeAte` não é nulo
      // aqui; o teste existe para o TypeScript e como rede de segurança.
      if (!aluno.freeAte) continue;
      const dias = diasAte(aluno.freeAte);

      // O carimbo inclui o dia restante: avisar "faltam 7" e depois
      // "faltam 3" é útil; repetir "faltam 7" todo dia é spam.
      const assunto = `free.expirando.${dias}`;
      const jaAvisado = await prisma.notification.findFirst({
        where: { userId: aluno.id, assunto },
        select: { id: true },
      });
      if (jaAvisado) continue;

      await notificar({
        userId: aluno.id,
        assunto,
        titulo:
          dias === 0
            ? "Seu acesso gratuito termina hoje"
            : `Seu acesso gratuito termina em ${dias} dia(s)`,
        corpo:
          `Olá, ${aluno.nome}!\n\n` +
          (dias === 0
            ? "Hoje é o último dia do seu acesso gratuito à plataforma."
            : `Faltam ${dias} dia(s) para o seu acesso gratuito terminar.`) +
          "\n\nSeu progresso fica guardado de qualquer forma — nada do que você já estudou se perde." +
          (permiteSolicitar
            ? "\n\nSe quiser continuar, você pode pedir a renovação do acesso pela plataforma, em “Meu acesso”."
            : "\n\nPara continuar, fale com a coordenação."),
        link: "/app/acesso",
        porEmail: true,
      });

      resultado.freeAVencer++;
      resultado.enviados++;
    }

    // ---- Acesso gratuito já expirado (um aviso, só uma vez) ----
    const expirados = await prisma.user.findMany({
      where: {
        papel: "ALUNO",
        plano: "FREE",
        freeRevogadoEm: null,
        freeAte: { lt: hoje },
      },
      select: { id: true, nome: true, freeAte: true },
    });

    for (const aluno of expirados) {
      const assunto = `free.expirado.${aluno.freeAte?.toISOString().slice(0, 10) ?? "sem-data"}`;
      const jaAvisado = await prisma.notification.findFirst({
        where: { userId: aluno.id, assunto },
        select: { id: true },
      });
      if (jaAvisado) continue;

      await notificar({
        userId: aluno.id,
        assunto,
        titulo: "Seu acesso gratuito expirou",
        corpo:
          `Olá, ${aluno.nome}.\n\n` +
          "O prazo do seu acesso gratuito terminou. Todo o seu progresso continua guardado: " +
          "quando o acesso voltar, você retoma exatamente de onde parou." +
          (permiteSolicitar
            ? "\n\nVocê pode pedir um novo acesso pela plataforma, em “Meu acesso”. O pedido é analisado por nós."
            : "\n\nPara voltar a estudar, fale com a coordenação."),
        link: "/app/acesso",
        porEmail: true,
      });

      resultado.freeExpirado++;
      resultado.enviados++;
    }

    // ---- Cobrança vencendo em até 3 dias ----
    const cobrancas = await prisma.payment.findMany({
      where: {
        status: "PENDENTE",
        vencimentoEm: { gte: hoje, lte: new Date(hoje.getTime() + 3 * 86_400_000) },
      },
      include: { user: { select: { id: true, nome: true } } },
    });

    for (const c of cobrancas) {
      const assunto = `cobranca.vencendo.${c.id}`;
      const jaAvisado = await prisma.notification.findFirst({
        where: { userId: c.userId, assunto },
        select: { id: true },
      });
      if (jaAvisado) continue;

      const valor = (c.valorCentavos / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      await notificar({
        userId: c.userId,
        assunto,
        titulo: "Lembrete de pagamento",
        corpo:
          `Olá, ${c.user.nome}!\n\n` +
          `A cobrança "${c.descricao}", de ${valor}, vence em ` +
          `${c.vencimentoEm.toLocaleDateString("pt-BR")}.\n\n` +
          "Se já pagou, desconsidere este aviso.",
        porEmail: true,
      });

      resultado.cobrancaVencendo++;
      resultado.enviados++;
    }

    if (resultado.enviados > 0) {
      await registrarAcao({
        acao: "avisos.enviados",
        entidade: "Notification",
        resumo:
          `${resultado.enviados} aviso(s): ${resultado.freeAVencer} a vencer, ` +
          `${resultado.freeExpirado} expirado(s), ${resultado.cobrancaVencendo} cobrança(s)`,
        dados: resultado,
      });
    }
  } catch (e) {
    console.error("[avisos] falha ao enviar:", e);
  }

  return resultado;
}
