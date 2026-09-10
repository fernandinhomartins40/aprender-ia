import { NextResponse } from "next/server";
import { pedirRecuperacao, limparTokensVencidos } from "@aprender/auth/recuperacao";

/**
 * Pedido de recuperação de senha.
 *
 * Responde SEMPRE a mesma coisa, exista a conta ou não: se a resposta
 * variasse, a tela viraria um jeito de descobrir quem tem cadastro na
 * plataforma.
 */
export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const identificador = String(
    (corpo as { identificador?: unknown })?.identificador ?? "",
  ).trim();

  if (!identificador) {
    return NextResponse.json(
      { erro: "Informe o seu e-mail ou telefone.", campo: "identificador" },
      { status: 400 },
    );
  }

  // Aproveita o pedido para varrer tokens vencidos, sem precisar de cron.
  limparTokensVencidos().catch(() => {});

  const baseUrl =
    process.env.PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? new URL(req.url).origin;

  const resultado = await pedirRecuperacao(identificador, {
    baseUrl,
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
  });

  // O link só volta ao cliente quando não há SMTP configurado — é o modo
  // de desenvolvimento, para conseguir testar o fluxo sem servidor de e-mail.
  const emDesenvolvimento = process.env.NODE_ENV !== "production";

  return NextResponse.json({
    ok: true,
    ...(emDesenvolvimento && resultado.linkDesenvolvimento
      ? { linkDesenvolvimento: resultado.linkDesenvolvimento }
      : {}),
  });
}
