import { NextResponse } from "next/server";
import { prisma } from "@aprender/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const inicio = Date.now();
  let banco = "indisponivel";

  try {
    await prisma.$queryRaw`SELECT 1`;
    banco = "ok";
  } catch {
    banco = "erro";
  }

  const saudavel = banco === "ok";

  return NextResponse.json(
    {
      status: saudavel ? "ok" : "degradado",
      servico: "aprender-ia",
      banco,
      tempoMs: Date.now() - inicio,
      versao: process.env.npm_package_version ?? "0.0.0",
      quando: new Date().toISOString(),
    },
    { status: saudavel ? 200 : 503 },
  );
}
