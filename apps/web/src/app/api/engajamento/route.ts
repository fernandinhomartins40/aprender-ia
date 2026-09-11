import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processarEngajamento } from "@/server/engajamento";

export const dynamic = "force-dynamic";

function autorizado(request: Request): boolean {
  const esperado = process.env.CRON_SECRET ?? "";
  const recebido = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!esperado || esperado.length !== recebido.length) return false;
  return timingSafeEqual(Buffer.from(esperado), Buffer.from(recebido));
}

export async function POST(request: Request) {
  if (!autorizado(request)) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  const resultado = await processarEngajamento();
  return NextResponse.json({ ok: true, ...resultado, executadoEm: new Date().toISOString() });
}

