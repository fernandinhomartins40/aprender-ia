import { NextResponse } from "next/server";
import { registrarInscricao, removerInscricao } from "@/server/push";

/**
 * Grava e apaga a inscrição push do aparelho.
 *
 * É uma API route (e não uma Server Action) porque quem chama é o código
 * que lida com `pushManager.subscribe()` no navegador: ele já tem o
 * objeto da inscrição em mãos e precisa de uma resposta clara para
 * mostrar o estado do botão.
 *
 * O dono da inscrição vem SEMPRE da sessão, dentro de `registrarInscricao`.
 * O corpo desta requisição não carrega userId de propósito.
 */

export async function POST(req: Request) {
  let corpo: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
    agente?: string;
  };

  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, mensagem: "Requisição inválida." }, { status: 400 });
  }

  const r = await registrarInscricao({
    endpoint: String(corpo.endpoint ?? ""),
    p256dh: String(corpo.keys?.p256dh ?? ""),
    auth: String(corpo.keys?.auth ?? ""),
    agente: corpo.agente ? String(corpo.agente).slice(0, 300) : null,
  });

  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}

export async function DELETE(req: Request) {
  let corpo: { endpoint?: string };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await removerInscricao(String(corpo.endpoint ?? ""));
  return NextResponse.json({ ok: true });
}
