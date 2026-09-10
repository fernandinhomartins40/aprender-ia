import { NextResponse } from "next/server";
import { prisma } from "@aprender/db";
import { gerarHashSenha } from "@aprender/auth";
import { cadastroSchema } from "@aprender/types";
import { prazoFreeInicial } from "@/server/acesso-free";

/**
 * Cadastro público de professor.
 *
 * O código de matrícula é opcional. Quando informado e válido, o aluno
 * já nasce matriculado no curso da turma e vinculado a ela — é o que
 * permite ao instrutor distribuir um código no curso presencial e saber
 * exatamente para qual turma cada inscrito foi.
 */
export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const validado = cadastroSchema.safeParse(corpo);
  if (!validado.success) {
    const primeiro = validado.error.issues[0];
    return NextResponse.json(
      { erro: primeiro?.message ?? "Dados inválidos.", campo: primeiro?.path[0] },
      { status: 400 },
    );
  }

  const {
    nome,
    email,
    telefone,
    senha,
    codigoTurma,
    disciplina,
    anoEscolar,
    escola,
  } = validado.data;

  const emailNormalizado = email.toLowerCase().trim();

  const jaExiste = await prisma.user.findUnique({
    where: { email: emailNormalizado },
    select: { id: true },
  });
  if (jaExiste) {
    return NextResponse.json(
      { erro: "Já existe uma conta com este e-mail.", campo: "email" },
      { status: 409 },
    );
  }

  // O telefone é único no banco: avisamos antes de tentar criar, para
  // devolver uma mensagem clara em vez de um erro de constraint.
  if (telefone) {
    const telefoneEmUso = await prisma.user.findUnique({
      where: { telefone },
      select: { id: true },
    });
    if (telefoneEmUso) {
      return NextResponse.json(
        { erro: "Já existe uma conta com este telefone.", campo: "telefone" },
        { status: 409 },
      );
    }
  }

  // Validamos a turma ANTES de criar a conta: um código errado deve
  // devolver o formulário para correção, não criar uma conta solta.
  const turma = codigoTurma
    ? await prisma.cohort.findUnique({
        where: { codigo: codigoTurma },
        select: { id: true, nome: true, courseId: true, course: { select: { titulo: true } } },
      })
    : null;

  if (codigoTurma && !turma) {
    return NextResponse.json(
      {
        erro: "Código do curso não encontrado. Confira com quem ministrou a formação.",
        campo: "codigoTurma",
      },
      { status: 404 },
    );
  }

  // Conta, matrícula e vínculo nascem juntos: se algo falhar no meio, a
  // pessoa não fica com conta criada e matrícula pela metade.
  // Prazo do acesso gratuito, conforme as configurações da plataforma.
  // Nulo quando o administrador definiu 0 dias (acesso sem expiração).
  const freeAte = await prazoFreeInicial();

  const usuario = await prisma.user.create({
    data: {
      nome: nome.trim(),
      email: emailNormalizado,
      telefone: telefone || null,
      senhaHash: await gerarHashSenha(senha),
      freeAte,
      freeConcedidoEm: new Date(),
      disciplina: disciplina?.trim() || null,
      anoEscolar: anoEscolar?.trim() || null,
      escola: escola?.trim() || null,
      ofensiva: { create: {} },
      ...(turma && {
        matriculas: { create: { courseId: turma.courseId } },
        membroTurmas: { create: { cohortId: turma.id } },
      }),
    },
    select: { id: true, nome: true, email: true },
  });

  return NextResponse.json(
    {
      ok: true,
      usuario,
      matriculado: turma
        ? { curso: turma.course.titulo, turma: turma.nome }
        : null,
    },
    { status: 201 },
  );
}
