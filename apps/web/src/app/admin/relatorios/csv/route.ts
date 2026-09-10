import { NextResponse, type NextRequest } from "next/server";
import { exportarCSV, type FiltroRelatorio } from "@/server/relatorios";

/**
 * Download do relatório em CSV.
 *
 * Rota própria e não Server Action porque o navegador precisa receber um
 * arquivo com `Content-Disposition` — Server Action devolve dado para a
 * página, não um download.
 *
 * `exportarCSV` chama `exigirAdmin`, então esta rota já está protegida: sem
 * sessão de administrador a chamada redireciona antes de gerar qualquer coisa.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const tipoBruto = p.get("tipo") ?? "alunos";
  const tipo = (["alunos", "financeiro", "progresso", "presenca"].includes(tipoBruto)
    ? tipoBruto
    : "alunos") as FiltroRelatorio["tipo"];

  const filtro: FiltroRelatorio = {
    tipo,
    turmaId: p.get("turmaId") ?? undefined,
    desde: p.get("desde") ?? undefined,
    ate: p.get("ate") ?? undefined,
    situacao: p.get("situacao") ?? undefined,
  };

  const csv = await exportarCSV(filtro);
  const hoje = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aprenderia-${tipo}-${hoje}.csv"`,
      // Relatório é sempre do momento: cache aqui entregaria número velho.
      "Cache-Control": "no-store",
    },
  });
}
