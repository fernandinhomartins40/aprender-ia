"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { gerarHashSenha } from "@aprender/auth";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { prazoFreeInicial } from "./acesso-free";
import { podeReceber } from "./turmas";
import { prazoEmDias } from "@/lib/acesso-free";

/**
 * Cadastro e edição de um aluno por vez.
 *
 * O caminho em lote (`importar-alunos.ts`) existe para a turma inteira e
 * exige turma obrigatória, porque um lote sem turma é um cadastro órfão. Mas
 * ele não serve para o caso mais comum do dia a dia: entrou UM professor,
 * fora da turma, e é preciso corrigir o telefone de alguém que digitou
 * errado. Este módulo cobre exatamente isso.
 *
 * As regras que valem no lote valem aqui, e de propósito: mesmo domínio
 * interno, mesmo formato de e-mail derivado do telefone, mesma exigência de
 * troca de senha no primeiro acesso. Duas regras diferentes para a mesma
 * coisa divergiriam na primeira alteração.
 *
 * A turma, aqui, é OPCIONAL — é a diferença deliberada em relação ao lote.
 * Cadastrar um aluno avulso e só depois decidir a turma é um fluxo legítimo;
 * obrigar a turma neste caminho empurraria o admin de volta para o lote.
 */

export type ResultadoAluno = {
  ok: boolean;
  mensagem: string;
  /** Preenchido só na criação, e só quando a senha foi gerada aqui. */
  senhaProvisoria?: string;
  userId?: string;
};

const DOMINIO_INTERNO = "aluno.aprenderia.site";

function soDigitos(bruto: string): string {
  return bruto.replace(/\D/g, "");
}

function emailInterno(telefone: string): string {
  return `${telefone}@${DOMINIO_INTERNO}`;
}

function ehEmailInterno(email: string): boolean {
  return email.toLowerCase().endsWith(`@${DOMINIO_INTERNO}`);
}

/** Senha legível, sem caracteres que se confundem (0/O, 1/l/I). */
function gerarSenha(tamanho = 8): string {
  const alfabeto = "abcdefghjkmnpqrstuvwxyz23456789";
  let saida = "";
  for (let i = 0; i < tamanho; i++) {
    saida += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return saida;
}

/**
 * Valida o par e-mail/telefone.
 *
 * Um dos dois basta, e a razão é o público: o professor cadastrado no curso
 * presencial muitas vezes não tem e-mail que consulte, e exigir um faria o
 * admin inventar endereço falso — que depois quebra a recuperação de senha.
 */
function validarIdentificacao(
  email: string,
  telefone: string,
): { ok: true; email: string; telefone: string | null } | { ok: false; mensagem: string } {
  const tel = soDigitos(telefone);
  const mail = email.trim().toLowerCase();

  if (!mail && !tel) {
    return { ok: false, mensagem: "Informe pelo menos um e-mail ou um telefone." };
  }
  if (tel && (tel.length < 10 || tel.length > 13)) {
    return { ok: false, mensagem: "Telefone inválido. Use DDD + número." };
  }
  if (mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) {
    return { ok: false, mensagem: "E-mail inválido." };
  }

  // Sem e-mail real, derivamos do telefone — o aluno entra pelo telefone e
  // nunca precisa conhecer esse endereço.
  return { ok: true, email: mail || emailInterno(tel), telefone: tel || null };
}

/* ============================================================
   CRIAÇÃO
   ============================================================ */

export async function criarAluno(
  _anterior: ResultadoAluno | null,
  dados: FormData,
): Promise<ResultadoAluno> {
  await exigirAdmin();

  const nome = String(dados.get("nome") ?? "").trim();
  if (nome.length < 2) return { ok: false, mensagem: "Informe o nome do aluno." };

  const id = validarIdentificacao(
    String(dados.get("email") ?? ""),
    String(dados.get("telefone") ?? ""),
  );
  if (!id.ok) return { ok: false, mensagem: id.mensagem };

  // Conta já existente é erro de operação, não algo a sobrescrever em
  // silêncio: sobrescrever apagaria progresso de alguém.
  const existente = await prisma.user.findFirst({
    where: {
      OR: [{ email: id.email }, ...(id.telefone ? [{ telefone: id.telefone }] : [])],
    },
    select: { id: true, nome: true, email: true },
  });
  if (existente) {
    return {
      ok: false,
      mensagem: `Já existe uma conta com esses dados: ${existente.nome}.`,
    };
  }

  const senhaInformada = String(dados.get("senha") ?? "").trim();
  const senha = senhaInformada || gerarSenha();

  // Prazo free: o admin pode sobrepor já na criação. Campo vazio usa o
  // padrão (plano gratuito → configuração), que é o mesmo caminho do lote.
  const diasBruto = String(dados.get("diasFree") ?? "").trim();
  const freeAte =
    diasBruto === "" ? await prazoFreeInicial() : prazoEmDias(Number(diasBruto) || 0);

  const courseId = String(dados.get("courseId") ?? "").trim();
  const cohortId = String(dados.get("cohortId") ?? "").trim();

  // Vagas antes de criar a conta: descobrir que a turma está cheia depois de
  // criar o usuário deixaria uma conta solta.
  if (cohortId) {
    const cabem = await podeReceber(cohortId, 1);
    if (!cabem.pode) {
      return { ok: false, mensagem: cabem.motivo ?? "A turma não pode receber o aluno." };
    }
  }

  try {
    const novo = await prisma.user.create({
      data: {
        nome,
        email: id.email,
        telefone: id.telefone,
        senhaHash: await gerarHashSenha(senha),
        // Vale mesmo quando o admin escolheu a senha: ela passou por um
        // terceiro, então não serve como senha definitiva.
        precisaTrocarSenha: true,
        papel: "ALUNO",
        freeAte,
        freeConcedidoEm: new Date(),
        ofensiva: { create: {} },
      },
      select: { id: true, nome: true },
    });

    if (courseId) {
      await prisma.enrollment.create({ data: { userId: novo.id, courseId } });
    }
    if (cohortId) {
      await prisma.cohortMember.create({ data: { cohortId, userId: novo.id } });
    }

    await registrarAcao({
      acao: "aluno.criado",
      entidade: "User",
      entidadeId: novo.id,
      resumo: `${nome} criado individualmente`,
    });

    revalidatePath("/admin/alunos");
    if (cohortId) revalidatePath(`/admin/turmas/${cohortId}`);

    return {
      ok: true,
      mensagem: `${nome} cadastrado.`,
      // Só devolvemos a senha quando foi a plataforma que a gerou: repetir
      // de volta a que o admin digitou não acrescenta nada.
      senhaProvisoria: senhaInformada ? undefined : senha,
      userId: novo.id,
    };
  } catch (e) {
    return {
      ok: false,
      mensagem: e instanceof Error ? e.message.slice(0, 160) : "Não foi possível criar.",
    };
  }
}

/* ============================================================
   EDIÇÃO
   ============================================================ */

export async function editarAluno(
  _anterior: ResultadoAluno | null,
  dados: FormData,
): Promise<ResultadoAluno> {
  await exigirAdmin();

  const userId = String(dados.get("userId") ?? "").trim();
  if (!userId) return { ok: false, mensagem: "Aluno não identificado." };

  const atual = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nome: true, email: true, telefone: true, situacao: true },
  });
  if (!atual) return { ok: false, mensagem: "Aluno não encontrado." };

  const nome = String(dados.get("nome") ?? "").trim();
  if (nome.length < 2) return { ok: false, mensagem: "Informe o nome do aluno." };

  const id = validarIdentificacao(
    String(dados.get("email") ?? ""),
    String(dados.get("telefone") ?? ""),
  );
  if (!id.ok) return { ok: false, mensagem: id.mensagem };

  // Não deixar dois alunos com o mesmo contato — mas ignorando o próprio,
  // senão salvar sem mudar nada acusaria conflito consigo mesmo.
  const conflito = await prisma.user.findFirst({
    where: {
      id: { not: userId },
      OR: [{ email: id.email }, ...(id.telefone ? [{ telefone: id.telefone }] : [])],
    },
    select: { nome: true },
  });
  if (conflito) {
    return { ok: false, mensagem: `Esses dados já pertencem a ${conflito.nome}.` };
  }

  // O enum tem exatamente dois estados. Um valor fora disso não vira erro:
  // preservamos o atual, porque rejeitar o formulário inteiro por causa de um
  // campo adulterado no navegador seria pior do que ignorá-lo.
  const situacao = String(dados.get("situacao") ?? atual.situacao);
  const situacaoValida =
    situacao === "ATIVO" || situacao === "SUSPENSO" ? situacao : atual.situacao;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        nome,
        email: id.email,
        telefone: id.telefone,
        situacao: situacaoValida,
      },
    });

    // O que mudou, campo a campo: uma auditoria que diz apenas "editado"
    // não responde a pergunta que se faz meses depois.
    const mudancas: string[] = [];
    if (atual.nome !== nome) mudancas.push(`nome: ${atual.nome} → ${nome}`);
    if (atual.email !== id.email) mudancas.push(`e-mail: ${atual.email} → ${id.email}`);
    if (atual.telefone !== id.telefone) {
      mudancas.push(`telefone: ${atual.telefone ?? "—"} → ${id.telefone ?? "—"}`);
    }
    if (atual.situacao !== situacaoValida) {
      mudancas.push(`situação: ${atual.situacao} → ${situacaoValida}`);
    }

    await registrarAcao({
      acao: "aluno.editado",
      entidade: "User",
      entidadeId: userId,
      resumo: mudancas.length ? mudancas.join(" · ") : "sem alterações",
    });

    revalidatePath("/admin/alunos");
    revalidatePath(`/admin/alunos/${userId}`);

    return {
      ok: true,
      mensagem: mudancas.length ? "Cadastro atualizado." : "Nada mudou.",
      userId,
    };
  } catch (e) {
    return {
      ok: false,
      mensagem: e instanceof Error ? e.message.slice(0, 160) : "Não foi possível salvar.",
    };
  }
}

/* ============================================================
   SENHA
   ============================================================ */

/**
 * Gera uma senha provisória nova para o aluno.
 *
 * Existe porque boa parte dos alunos tem e-mail interno, que não recebe
 * mensagem: para essas contas o fluxo de "esqueci minha senha" não funciona,
 * e sem isto o aluno ficaria sem caminho de volta.
 */
export async function redefinirSenhaAluno(
  _anterior: ResultadoAluno | null,
  dados: FormData,
): Promise<ResultadoAluno> {
  await exigirAdmin();

  const userId = String(dados.get("userId") ?? "").trim();
  const alvo = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nome: true, email: true },
  });
  if (!alvo) return { ok: false, mensagem: "Aluno não encontrado." };

  const senhaInformada = String(dados.get("senha") ?? "").trim();
  const senha = senhaInformada || gerarSenha();

  await prisma.user.update({
    where: { id: userId },
    data: { senhaHash: await gerarHashSenha(senha), precisaTrocarSenha: true },
  });

  await registrarAcao({
    acao: "aluno.senha_redefinida",
    entidade: "User",
    entidadeId: userId,
    // Nunca registramos a senha em si: a auditoria é lida por outras
    // pessoas e guardaria uma credencial válida em texto claro.
    resumo: `senha provisória gerada para ${alvo.nome}`,
  });

  revalidatePath(`/admin/alunos/${userId}`);

  return {
    ok: true,
    mensagem: ehEmailInterno(alvo.email)
      ? `Senha nova para ${alvo.nome}. Este aluno não tem e-mail real — envie por WhatsApp.`
      : `Senha nova para ${alvo.nome}.`,
    senhaProvisoria: senha,
    userId,
  };
}
