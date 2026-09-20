"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import {
  CHAVE_API_VELOMAIL,
  esquecerCredenciaisEmail,
  mascarar,
  origemDaChave,
  chaveVeloMail,
} from "@aprender/auth/credenciais-email";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";

/**
 * Chave de API da VeloMail, editável pelo painel.
 *
 * Fica fora do catálogo de configurações comum porque uma credencial não
 * se comporta como um parâmetro: ela nunca volta para a tela em claro,
 * não entra na auditoria com valor "de → para" e não tem um "padrão"
 * para restaurar. Reaproveitamos apenas a tabela `platform_settings`,
 * que já é chave/valor e já está protegida pelas mesmas regras de acesso.
 */

export type EstadoChave = {
  /** Há uma chave ativa, venha ela do banco ou do ambiente. */
  configurada: boolean;
  origem: "banco" | "ambiente" | "nenhuma";
  /** Prefixo e final, o bastante para reconhecer qual chave está lá. */
  mascarada: string | null;
  atualizadoEm: Date | null;
  atualizadoPor: string | null;
  /** Chave no formato errado — `uai_` é do MCP e não envia e-mail. */
  aviso: string | null;
};

export async function lerEstadoChave(): Promise<EstadoChave> {
  await exigirAdmin();

  const origem = await origemDaChave();
  const chave = await chaveVeloMail();

  let atualizadoEm: Date | null = null;
  let atualizadoPor: string | null = null;
  if (origem === "banco") {
    const registro = await prisma.platformSetting
      .findUnique({
        where: { chave: CHAVE_API_VELOMAIL },
        select: { atualizadoEm: true, atualizadoPor: true },
      })
      .catch(() => null);
    atualizadoEm = registro?.atualizadoEm ?? null;
    atualizadoPor = registro?.atualizadoPor ?? null;
  }

  return {
    configurada: Boolean(chave),
    origem,
    mascarada: chave ? mascarar(chave) : null,
    atualizadoEm,
    atualizadoPor,
    aviso: chave ? avisoDeFormato(chave) : null,
  };
}

/**
 * A confusão mais provável, e cara: a AI Agent Key (`uai_`) é do servidor
 * MCP da IDE e NÃO envia e-mail. Salvar uma dessas deixaria a recuperação
 * de senha muda de novo, com a tela dizendo "configurada".
 */
function avisoDeFormato(chave: string): string | null {
  if (chave.startsWith("uai_")) {
    return "Esta é uma AI Agent Key (uai_), usada só pelo MCP da IDE. Ela não envia e-mail. Gere uma API key padrão (re_) em API Keys na VeloMail.";
  }
  if (!chave.startsWith("re_")) {
    return "A chave não começa com “re_”, o formato esperado de uma API key de envio da VeloMail. Confira se copiou a chave certa.";
  }
  return null;
}

export type ResultadoChave = { ok: boolean; mensagem: string };

export async function salvarChave(
  _anterior: ResultadoChave | null,
  dados: FormData,
): Promise<ResultadoChave> {
  const admin = await exigirAdmin();

  const chave = String(dados.get("chave") ?? "").trim();
  if (!chave) {
    return { ok: false, mensagem: "Cole a chave antes de salvar." };
  }
  // Espaços e quebras vindos de copiar/colar já derrubaram integrações
  // inteiras; recusar é mais honesto que salvar algo que nunca funciona.
  if (/\s/.test(chave)) {
    return { ok: false, mensagem: "A chave não pode conter espaços ou quebras de linha." };
  }
  if (chave.length < 20 || chave.length > 200) {
    return { ok: false, mensagem: "Isso não parece uma chave de API válida." };
  }

  await prisma.platformSetting.upsert({
    where: { chave: CHAVE_API_VELOMAIL },
    create: {
      chave: CHAVE_API_VELOMAIL,
      valor: chave,
      tipo: "TEXTO",
      grupo: "email",
      rotulo: "Chave de API da VeloMail",
      descricao: "Credencial de envio dos e-mails transacionais.",
      atualizadoPor: admin.nome,
    },
    update: { valor: chave, atualizadoPor: admin.nome },
  });

  // O valor NUNCA entra na auditoria — só o fato e quem fez.
  await registrarAcao({
    acao: "email.chave_alterada",
    entidade: "PlatformSetting",
    entidadeId: CHAVE_API_VELOMAIL,
    resumo: `Chave de API da VeloMail atualizada (${mascarar(chave)})`,
  });

  esquecerCredenciaisEmail();
  revalidatePath("/admin/email");

  const aviso = avisoDeFormato(chave);
  if (aviso) return { ok: false, mensagem: `Chave salva, mas atenção: ${aviso}` };

  return { ok: true, mensagem: "Chave salva. Use “Testar envio” para confirmar." };
}

/** Remove a chave do banco; o ambiente volta a responder, se houver. */
export async function removerChave(): Promise<ResultadoChave> {
  await exigirAdmin();

  await prisma.platformSetting.deleteMany({ where: { chave: CHAVE_API_VELOMAIL } });

  await registrarAcao({
    acao: "email.chave_removida",
    entidade: "PlatformSetting",
    entidadeId: CHAVE_API_VELOMAIL,
    resumo: "Chave de API da VeloMail removida do banco",
  });

  esquecerCredenciaisEmail();
  revalidatePath("/admin/email");
  return { ok: true, mensagem: "Chave removida do banco." };
}

/**
 * Envio de teste real.
 *
 * Salvar uma chave não prova nada — foi justamente uma chave bem formada
 * e recusada pelo servidor que deixou a recuperação de senha muda. Aqui o
 * administrador confirma de ponta a ponta, com a mensagem de erro da
 * própria VeloMail em vez de um silêncio no log.
 */
export async function testarEnvio(
  _anterior: ResultadoChave | null,
  dados: FormData,
): Promise<ResultadoChave> {
  await exigirAdmin();

  const destino = String(dados.get("destino") ?? "").trim();
  if (!destino || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(destino)) {
    return { ok: false, mensagem: "Informe um e-mail válido para receber o teste." };
  }

  const { enviarEmail, montarEmailNotificacao } = await import("@aprender/auth/email");

  const resultado = await enviarEmail({
    para: destino,
    assunto: "Teste de envio — Aprender IA",
    texto:
      "Este é um teste de configuração enviado pelo painel da Aprender IA.\n\n" +
      "Se você recebeu esta mensagem, os e-mails da plataforma (inclusive a recuperação de senha) estão funcionando.",
    html: montarEmailNotificacao({
      titulo: "Teste de envio",
      corpo:
        "Este é um teste de configuração enviado pelo painel da Aprender IA.\n\nSe você recebeu esta mensagem, os e-mails da plataforma — inclusive a recuperação de senha — estão funcionando.",
    }),
    rastrear: false,
  });

  await registrarAcao({
    acao: "email.teste_enviado",
    entidade: "PlatformSetting",
    entidadeId: CHAVE_API_VELOMAIL,
    resumo: `Teste de envio para ${destino}: ${resultado.entregue ? "aceito" : "falhou"}`,
  });

  if (resultado.entregue) {
    return {
      ok: true,
      mensagem: `A VeloMail aceitou a mensagem para ${destino}. Confira a caixa de entrada (e o spam).`,
    };
  }

  if (resultado.credencialRecusada) {
    return {
      ok: false,
      mensagem:
        "A VeloMail recusou a chave (401/403). Ela foi revogada, pertence a outra conta ou não é uma API key de envio. Gere uma nova em API Keys e cole aqui.",
    };
  }

  if (resultado.motivo === "smtp-nao-configurado") {
    return {
      ok: false,
      mensagem:
        "Nenhuma chave da VeloMail e nenhum SMTP configurados — o e-mail não chegou a ser enviado.",
    };
  }

  return {
    ok: false,
    mensagem: `A VeloMail recusou o envio: ${resultado.motivo ?? "erro desconhecido"}. Se a mensagem citar o remetente ou o domínio, verifique a autenticação do domínio no painel da VeloMail.`,
  };
}
