"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { gerarHashSenha } from "@aprender/auth";
import { exigirAdmin } from "./admin";
import { criarTurmaBasica, podeReceber } from "./turmas";
import { prazoFreeInicial } from "./acesso-free";
import { deInputDate } from "@/lib/datas";

/**
 * Cadastro de alunos em lote — sempre dentro de uma turma.
 *
 * O administrador cola uma lista "Nome - Telefone" e a plataforma cria as
 * contas, define senha provisória, matricula no curso e vincula à turma.
 *
 * A turma é obrigatória: um aluno sem turma não tem cronograma, não tem
 * local de encontro e não aparece em nenhuma chamada — na prática, é um
 * cadastro órfão. Para não obrigar o admin a sair da tela e voltar, a
 * turma pode ser CRIADA aqui mesmo, no mesmo envio (`turmaNova`).
 *
 * Cada aluno entra com o TELEFONE como login. Como o Auth.js identifica a
 * conta pelo e-mail, geramos um e-mail interno a partir do telefone — o
 * aluno nunca precisa vê-lo nem digitá-lo.
 */

export type LinhaLote = {
  linha: number;
  nome: string;
  telefone: string;
  senha: string;
  erro?: string;
};

export type PreviaLote = {
  validos: LinhaLote[];
  invalidos: LinhaLote[];
};

const DOMINIO_INTERNO = "aluno.aprenderia.site";

/** Só os dígitos: aceita (11) 98765-4321, 11 98765 4321, etc. */
function soDigitos(bruto: string): string {
  return bruto.replace(/\D/g, "");
}

/** E-mail interno derivado do telefone. Invisível para o aluno. */
function emailInterno(telefone: string): string {
  return `${telefone}@${DOMINIO_INTERNO}`;
}

/**
 * Senha provisória: 3 primeiras letras do nome, minúsculas e sem acento.
 * Nomes muito curtos são completados para não gerar senha de 1 caractere.
 */
function senhaProvisoria(nome: string): string {
  const limpo = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
  return (limpo.slice(0, 3) || "aluno").padEnd(3, "x");
}

/**
 * Interpreta o texto colado. Aceita separadores comuns entre nome e
 * telefone: hífen, ponto e vírgula, vírgula, tabulação ou barra.
 */
export async function analisarLote(texto: string): Promise<PreviaLote> {
  const validos: LinhaLote[] = [];
  const invalidos: LinhaLote[] = [];
  const telefonesVistos = new Set<string>();

  const linhas = texto.split(/\r?\n/);

  for (let i = 0; i < linhas.length; i++) {
    const bruta = linhas[i]!.trim();
    if (!bruta) continue;

    const partes = bruta.split(/\s*[-;,\t|]\s*/);
    const nome = (partes[0] ?? "").trim();
    // O telefone pode ter vindo quebrado por hífen: junta o resto.
    const telefone = soDigitos(partes.slice(1).join(""));

    const registro: LinhaLote = {
      linha: i + 1,
      nome,
      telefone,
      senha: senhaProvisoria(nome),
    };

    if (!nome || nome.length < 2) {
      invalidos.push({ ...registro, erro: "Nome ausente ou muito curto" });
      continue;
    }
    if (!telefone) {
      invalidos.push({ ...registro, erro: "Telefone não encontrado" });
      continue;
    }
    // 10 dígitos (fixo com DDD) a 13 (com código do país)
    if (telefone.length < 10 || telefone.length > 13) {
      invalidos.push({
        ...registro,
        erro: `Telefone com ${telefone.length} dígitos (esperado 10 a 13)`,
      });
      continue;
    }
    if (telefonesVistos.has(telefone)) {
      invalidos.push({ ...registro, erro: "Telefone repetido na lista" });
      continue;
    }

    telefonesVistos.add(telefone);
    validos.push(registro);
  }

  return { validos, invalidos };
}

export type ResultadoImportacao = {
  ok: boolean;
  criados: number;
  jaExistiam: number;
  matriculados: number;
  falhas: { nome: string; telefone: string; motivo: string }[];
  credenciais: { nome: string; telefone: string; senha: string }[];
  mensagem: string;
  /** Preenchido quando a turma foi criada no mesmo envio. */
  turmaCriada?: { id: string; nome: string; codigo: string };
  /** Para o link "abrir a turma" no fim do cadastro. */
  cohortId?: string;
};

export async function importarAlunos(
  _anterior: ResultadoImportacao | null,
  dados: FormData,
): Promise<ResultadoImportacao> {
  await exigirAdmin();

  const texto = String(dados.get("lista") ?? "");
  const courseId = String(dados.get("courseId") ?? "");
  const modoTurma = String(dados.get("modoTurma") ?? "existente");
  let cohortId = String(dados.get("cohortId") ?? "");

  const vazio: ResultadoImportacao = {
    ok: false,
    criados: 0,
    jaExistiam: 0,
    matriculados: 0,
    falhas: [],
    credenciais: [],
    mensagem: "",
  };

  if (!texto.trim()) {
    return { ...vazio, mensagem: "Cole a lista de alunos." };
  }
  if (!courseId) {
    return { ...vazio, mensagem: "Escolha o curso da turma." };
  }

  const { validos, invalidos } = await analisarLote(texto);

  if (validos.length === 0) {
    return {
      ...vazio,
      falhas: invalidos.map((i) => ({
        nome: i.nome,
        telefone: i.telefone,
        motivo: i.erro ?? "Linha inválida",
      })),
      mensagem: "Nenhuma linha válida encontrada.",
    };
  }

  // ---- A turma: escolhida ou criada agora ----
  let turmaCriada: ResultadoImportacao["turmaCriada"];

  if (modoTurma === "nova") {
    const nomeTurma = String(dados.get("turmaNovaNome") ?? "").trim();
    if (nomeTurma.length < 3) {
      return { ...vazio, mensagem: "Dê um nome à turma nova (mínimo 3 caracteres)." };
    }
    try {
      const criada = await criarTurmaBasica({
        nome: nomeTurma,
        courseId,
        modalidade:
          String(dados.get("turmaNovaModalidade") ?? "ONLINE") === "PRESENCIAL"
            ? "PRESENCIAL"
            : String(dados.get("turmaNovaModalidade") ?? "") === "HIBRIDA"
              ? "HIBRIDA"
              : "ONLINE",
        local: String(dados.get("turmaNovaLocal") ?? "").trim() || null,
        inicioEm: deInputDate(String(dados.get("turmaNovaInicio") ?? "")),
      });
      cohortId = criada.id;
      turmaCriada = { id: criada.id, nome: nomeTurma, codigo: criada.codigo };
    } catch (e) {
      return {
        ...vazio,
        mensagem: e instanceof Error ? e.message : "Não foi possível criar a turma.",
      };
    }
  }

  if (!cohortId) {
    return {
      ...vazio,
      mensagem: "Escolha uma turma existente ou crie uma nova para estes alunos.",
    };
  }

  // Vagas e situação da turma, antes de criar qualquer conta.
  const cabem = await podeReceber(cohortId, validos.length);
  if (!cabem.pode) {
    return { ...vazio, mensagem: cabem.motivo ?? "A turma não pode receber estes alunos." };
  }

  const curso = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!curso) return { ...vazio, mensagem: "Curso não encontrado." };

  // Um prazo só para todo o lote: a turma inteira começa e termina junto.
  const freeAte = await prazoFreeInicial();

  let criados = 0;
  let jaExistiam = 0;
  let matriculados = 0;
  const falhas: ResultadoImportacao["falhas"] = invalidos.map((i) => ({
    nome: i.nome,
    telefone: i.telefone,
    motivo: i.erro ?? "Linha inválida",
  }));
  const credenciais: ResultadoImportacao["credenciais"] = [];

  for (const linha of validos) {
    try {
      const email = emailInterno(linha.telefone);

      let usuario = await prisma.user.findFirst({
        where: { OR: [{ telefone: linha.telefone }, { email }] },
        select: { id: true, nome: true },
      });

      if (usuario) {
        jaExistiam++;
      } else {
        const novo = await prisma.user.create({
          data: {
            nome: linha.nome,
            email,
            telefone: linha.telefone,
            senhaHash: await gerarHashSenha(linha.senha),
            precisaTrocarSenha: true,
            papel: "ALUNO",
            freeAte,
            freeConcedidoEm: new Date(),
            ofensiva: { create: {} },
          },
          select: { id: true, nome: true },
        });
        usuario = novo;
        criados++;
        credenciais.push({
          nome: linha.nome,
          telefone: linha.telefone,
          senha: linha.senha,
        });
      }

      // Matrícula no curso
      const jaMatriculado = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: usuario.id, courseId: curso.id } },
        select: { id: true },
      });
      if (!jaMatriculado) {
        await prisma.enrollment.create({
          data: { userId: usuario.id, courseId: curso.id },
        });
        matriculados++;
      }

      // Vínculo com a turma
      const jaNaTurma = await prisma.cohortMember.findUnique({
        where: { cohortId_userId: { cohortId, userId: usuario.id } },
        select: { id: true },
      });
      if (!jaNaTurma) {
        await prisma.cohortMember.create({
          data: { cohortId, userId: usuario.id },
        });
      }
    } catch (e) {
      falhas.push({
        nome: linha.nome,
        telefone: linha.telefone,
        motivo: e instanceof Error ? e.message.slice(0, 120) : "Erro ao criar",
      });
    }
  }

  revalidatePath("/admin/alunos");
  revalidatePath("/admin/turmas");
  revalidatePath(`/admin/turmas/${cohortId}`);

  const partes = [`${criados} conta(s) criada(s)`];
  if (jaExistiam) partes.push(`${jaExistiam} já existia(m)`);
  if (matriculados) partes.push(`${matriculados} matrícula(s)`);
  if (falhas.length) partes.push(`${falhas.length} problema(s)`);

  return {
    ok: criados > 0 || matriculados > 0,
    criados,
    jaExistiam,
    matriculados,
    falhas,
    credenciais,
    mensagem: partes.join(" · "),
    turmaCriada,
    cohortId,
  };
}
