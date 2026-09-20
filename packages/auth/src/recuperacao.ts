import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@aprender/db";
import { gerarHashSenha } from "./index";
import { enviarEmail, montarEmailRecuperacao } from "./email";
import { templateDe } from "./credenciais-email";

/**
 * Recuperação de senha.
 *
 * Decisões de segurança tomadas aqui:
 *
 *  - O token vai em claro APENAS no link enviado; no banco fica só o
 *    SHA-256 dele. Quem ler o banco não consegue redefinir senha alguma.
 *  - Pedir recuperação responde sempre a mesma coisa, exista a conta ou
 *    não: a tela não pode virar um detector de quem tem cadastro.
 *  - Cada token vale uma vez e expira; ao ser usado, TODOS os tokens
 *    abertos daquela pessoa são invalidados junto.
 *  - Redefinir a senha limpa `precisaTrocarSenha` (a conta deixa de ser
 *    provisória) e apaga as sessões gravadas no banco.
 *
 * Limite honesto: alunos cadastrados em lote entram por telefone e têm
 * e-mail interno @aluno.aprenderia.site, que não recebe mensagem. Para
 * eles este fluxo não serve — a senha é redefinida pelo administrador.
 */

export const VALIDADE_MINUTOS = 60;
const DOMINIO_INTERNO = "aluno.aprenderia.site";

/** Um e-mail interno gerado a partir do telefone não recebe mensagens. */
export function ehEmailInterno(email: string): boolean {
  return email.toLowerCase().endsWith(`@${DOMINIO_INTERNO}`);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type PedidoRecuperacao = {
  /** Sempre true para o usuário: não revelamos se a conta existe. */
  ok: true;
  /** Só para o log/desenvolvimento — nunca exibido na tela. */
  detalhe: "enviado" | "conta-inexistente" | "email-interno" | "falha-envio";
  /** Preenchido apenas quando não há SMTP, para testar em desenvolvimento. */
  linkDesenvolvimento?: string;
};

export async function pedirRecuperacao(
  identificador: string,
  origem: { baseUrl: string; ip?: string | null; userAgent?: string | null },
): Promise<PedidoRecuperacao> {
  const entrada = identificador.toLowerCase().trim();
  const apenasDigitos = entrada.replace(/\D/g, "");
  const pareceTelefone =
    apenasDigitos.length >= 10 && apenasDigitos.length <= 13 && !entrada.includes("@");

  const usuario = pareceTelefone
    ? await prisma.user.findFirst({
        where: {
          OR: [{ telefone: apenasDigitos }, { email: `${apenasDigitos}@${DOMINIO_INTERNO}` }],
        },
        select: { id: true, nome: true, email: true },
      })
    : await prisma.user.findUnique({
        where: { email: entrada },
        select: { id: true, nome: true, email: true },
      });

  if (!usuario) return { ok: true, detalhe: "conta-inexistente" };

  // Conta de aluno cadastrado em lote: o e-mail não existe de verdade.
  if (ehEmailInterno(usuario.email)) {
    return { ok: true, detalhe: "email-interno" };
  }

  // Um pedido novo invalida os anteriores: links antigos param de servir.
  await prisma.passwordResetToken.updateMany({
    where: { userId: usuario.id, usadoEm: null },
    data: { usadoEm: new Date() },
  });

  const token = randomBytes(32).toString("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: usuario.id,
      tokenHash: hashToken(token),
      expiraEm: new Date(Date.now() + VALIDADE_MINUTOS * 60 * 1000),
      ip: origem.ip ?? null,
      userAgent: origem.userAgent ?? null,
    },
  });

  const link = `${origem.baseUrl.replace(/\/$/, "")}/redefinir-senha/${token}`;
  const conteudo = montarEmailRecuperacao({
    nome: usuario.nome,
    link,
    validadeMinutos: VALIDADE_MINUTOS,
  });

  // O template agora vem do painel, com o .env como origem secundária.
  const templateId = await templateDe("email.template.recuperacao");
  const envio = await enviarEmail({
    para: usuario.email,
    ...conteudo,
    ...(templateId
      ? {
          templateId,
          variaveis: {
            nome: usuario.nome.split(" ")[0] ?? "",
            link_redefinicao: link,
            validade_minutos: VALIDADE_MINUTOS,
          },
        }
      : {}),
    // O token no link é secreto; ele não deve passar por redirect de tracking.
    rastrear: false,
  });

  if (!envio.entregue) {
    return { ok: true, detalhe: "falha-envio", linkDesenvolvimento: link };
  }

  return { ok: true, detalhe: "enviado" };
}

/* ============================================================
   VALIDAÇÃO E USO DO TOKEN
   ============================================================ */

export type TokenValido = { valido: true; userId: string; nome: string };
export type TokenInvalido = { valido: false; motivo: "inexistente" | "expirado" | "usado" };

export async function conferirToken(token: string): Promise<TokenValido | TokenInvalido> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return { valido: false, motivo: "inexistente" };
  }

  const registro = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      userId: true,
      expiraEm: true,
      usadoEm: true,
      tokenHash: true,
      user: { select: { nome: true } },
    },
  });

  if (!registro) return { valido: false, motivo: "inexistente" };

  // Comparação em tempo constante — o findUnique acima já é uma busca por
  // igualdade, mas mantemos a checagem explícita para não depender disso.
  const esperado = Buffer.from(registro.tokenHash, "hex");
  const recebido = Buffer.from(hashToken(token), "hex");
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) {
    return { valido: false, motivo: "inexistente" };
  }

  if (registro.usadoEm) return { valido: false, motivo: "usado" };
  if (registro.expiraEm.getTime() < Date.now()) return { valido: false, motivo: "expirado" };

  return { valido: true, userId: registro.userId, nome: registro.user.nome };
}

export type ResultadoRedefinicao =
  | { ok: true }
  | { ok: false; erro: string };

export async function redefinirSenhaComToken(
  token: string,
  novaSenha: string,
): Promise<ResultadoRedefinicao> {
  if (novaSenha.length < 8) {
    return { ok: false, erro: "A senha precisa de ao menos 8 caracteres." };
  }

  const conferencia = await conferirToken(token);
  if (!conferencia.valido) {
    const mensagens = {
      inexistente: "Este link não é válido. Peça uma nova recuperação.",
      expirado: "Este link expirou. Peça uma nova recuperação.",
      usado: "Este link já foi usado. Peça uma nova recuperação.",
    } as const;
    return { ok: false, erro: mensagens[conferencia.motivo] };
  }

  const { userId } = conferencia;

  // Tudo junto: sem isso, uma falha no meio deixaria a senha trocada com
  // o token ainda válido para um segundo uso.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        senhaHash: await gerarHashSenha(novaSenha),
        // A conta deixa de ser provisória: a pessoa acabou de definir a senha.
        precisaTrocarSenha: false,
      },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId, usadoEm: null },
      data: { usadoEm: new Date() },
    }),
    // Sessões gravadas no banco caem; o JWT ativo expira por conta própria.
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  return { ok: true };
}

/** Remove tokens vencidos. Chamado a cada novo pedido, para não acumular. */
export async function limparTokensVencidos(): Promise<number> {
  const { count } = await prisma.passwordResetToken.deleteMany({
    where: { expiraEm: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  return count;
}
