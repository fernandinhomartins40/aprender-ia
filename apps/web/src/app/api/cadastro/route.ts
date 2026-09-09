import { NextResponse } from "next/server";
import { prisma } from "@aprender/db";
import { gerarHashSenha } from "@aprender/auth";
import { cadastroSchema } from "@aprender/types";

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

  const { nome, email, senha, disciplina, anoEscolar, escola } = validado.data;
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

  const usuario = await prisma.user.create({
    data: {
      nome: nome.trim(),
      email: emailNormalizado,
      senhaHash: await gerarHashSenha(senha),
      disciplina: disciplina?.trim() || null,
      anoEscolar: anoEscolar?.trim() || null,
      escola: escola?.trim() || null,
      ofensiva: { create: {} },
    },
    select: { id: true, nome: true, email: true },
  });

  return NextResponse.json({ ok: true, usuario }, { status: 201 });
}
