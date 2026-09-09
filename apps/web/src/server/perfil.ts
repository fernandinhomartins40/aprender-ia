"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { gerarHashSenha, conferirSenha } from "@aprender/auth";
import { exigirAdmin } from "./admin";

/**
 * Ações do perfil do usuário.
 *
 * Todas exigem sessão válida e operam apenas sobre a própria conta —
 * o id vem da sessão, nunca do formulário, para que ninguém possa
 * alterar o perfil de outra pessoa forjando um campo oculto.
 */

export type ResultadoPerfil = { ok: boolean; mensagem: string };

/* ============================================================
   DADOS PESSOAIS
   ============================================================ */

export async function atualizarDados(
  _anterior: ResultadoPerfil | null,
  dados: FormData,
): Promise<ResultadoPerfil> {
  const admin = await exigirAdmin();

  const nome = String(dados.get("nome") ?? "").trim();
  if (nome.length < 3) {
    return { ok: false, mensagem: "Informe seu nome completo." };
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      nome,
      disciplina: String(dados.get("disciplina") ?? "").trim() || null,
      anoEscolar: String(dados.get("anoEscolar") ?? "").trim() || null,
      escola: String(dados.get("escola") ?? "").trim() || null,
      iaFavorita: String(dados.get("iaFavorita") ?? "").trim() || null,
    },
  });

  revalidatePath("/admin/perfil");
  return { ok: true, mensagem: "Dados atualizados." };
}

/* ============================================================
   E-MAIL
   ============================================================ */

export async function atualizarEmail(
  _anterior: ResultadoPerfil | null,
  dados: FormData,
): Promise<ResultadoPerfil> {
  const admin = await exigirAdmin();

  const novoEmail = String(dados.get("email") ?? "").toLowerCase().trim();
  const senha = String(dados.get("senhaAtual") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
    return { ok: false, mensagem: "E-mail inválido." };
  }

  const usuario = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!usuario) return { ok: false, mensagem: "Usuário não encontrado." };

  if (novoEmail === usuario.email) {
    return { ok: false, mensagem: "Este já é o seu e-mail atual." };
  }

  // Trocar e-mail é mudar a identidade de login: exigimos a senha.
  // Contas criadas pelo Google não têm senha — nesse caso, orientamos.
  if (!usuario.senhaHash) {
    return {
      ok: false,
      mensagem:
        "Sua conta entra pelo Google. Defina uma senha primeiro, na seção abaixo.",
    };
  }
  if (!(await conferirSenha(senha, usuario.senhaHash))) {
    return { ok: false, mensagem: "Senha atual incorreta." };
  }

  const emUso = await prisma.user.findUnique({
    where: { email: novoEmail },
    select: { id: true },
  });
  if (emUso) {
    return { ok: false, mensagem: "Já existe uma conta com este e-mail." };
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { email: novoEmail, emailVerificado: null },
  });

  revalidatePath("/admin/perfil");
  return {
    ok: true,
    mensagem: `E-mail alterado para ${novoEmail}. Use-o no próximo login.`,
  };
}

/* ============================================================
   SENHA
   ============================================================ */

export async function atualizarSenha(
  _anterior: ResultadoPerfil | null,
  dados: FormData,
): Promise<ResultadoPerfil> {
  const admin = await exigirAdmin();

  const atual = String(dados.get("senhaAtual") ?? "");
  const nova = String(dados.get("novaSenha") ?? "");
  const confirmar = String(dados.get("confirmarSenha") ?? "");

  if (nova.length < 8) {
    return { ok: false, mensagem: "A nova senha precisa de ao menos 8 caracteres." };
  }
  if (nova !== confirmar) {
    return { ok: false, mensagem: "As senhas não conferem." };
  }

  const usuario = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!usuario) return { ok: false, mensagem: "Usuário não encontrado." };

  // Quem já tem senha precisa confirmá-la. Quem entra pelo Google
  // está definindo a primeira, e aí não há o que confirmar.
  if (usuario.senhaHash) {
    if (!(await conferirSenha(atual, usuario.senhaHash))) {
      return { ok: false, mensagem: "Senha atual incorreta." };
    }
    if (await conferirSenha(nova, usuario.senhaHash)) {
      return { ok: false, mensagem: "A nova senha é igual à atual." };
    }
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { senhaHash: await gerarHashSenha(nova) },
  });

  revalidatePath("/admin/perfil");
  return {
    ok: true,
    mensagem: usuario.senhaHash
      ? "Senha alterada. Ela já vale para o próximo login."
      : "Senha definida. Agora você pode entrar por e-mail e senha.",
  };
}

/* ============================================================
   ENCERRAR OUTRAS SESSÕES
   ============================================================ */

/**
 * Remove as sessões gravadas no banco (contas OAuth).
 *
 * Ressalva honesta: a sessão principal é JWT, então este botão não
 * invalida um token já emitido antes de expirar. Ele serve para
 * desconectar acessos via Google. A troca de senha, sim, impede
 * novos logins com a credencial antiga.
 */
export async function encerrarSessoes(): Promise<ResultadoPerfil> {
  const admin = await exigirAdmin();

  const { count } = await prisma.session.deleteMany({
    where: { userId: admin.id },
  });

  revalidatePath("/admin/perfil");
  return {
    ok: true,
    mensagem:
      count > 0
        ? `${count} sessão(ões) encerrada(s).`
        : "Nenhuma sessão de dispositivo registrada.",
  };
}

/* ============================================================
   DESVINCULAR CONTA GOOGLE
   ============================================================ */

export async function desvincularGoogle(): Promise<ResultadoPerfil> {
  const admin = await exigirAdmin();

  const usuario = await prisma.user.findUnique({
    where: { id: admin.id },
    select: { senhaHash: true },
  });

  // Sem senha, desvincular o Google deixaria a conta sem nenhuma
  // forma de entrar. Bloqueamos e explicamos o caminho.
  if (!usuario?.senhaHash) {
    return {
      ok: false,
      mensagem:
        "Defina uma senha antes de desvincular o Google, senão você ficará sem forma de entrar.",
    };
  }

  const { count } = await prisma.account.deleteMany({
    where: { userId: admin.id, provider: "google" },
  });

  revalidatePath("/admin/perfil");
  return {
    ok: count > 0,
    mensagem: count > 0 ? "Conta Google desvinculada." : "Nenhuma conta Google vinculada.",
  };
}
