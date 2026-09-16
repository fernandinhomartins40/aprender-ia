import { prisma } from "@aprender/db";
import { exigirAdmin } from "@/server/admin";
import { abrirApresentacao } from "@/server/apresentar";
import { ModoApresentacao } from "@/components/modo-apresentacao";
import type { Bloco } from "@/server/acompanhar";

export const metadata = { title: "Apresentando" };
export const dynamic = "force-dynamic";

export default async function PaginaApresentar({
  params,
  searchParams,
}: {
  params: Promise<{ scriptId: string }>;
  searchParams: Promise<{ encontro?: string }>;
}) {
  await exigirAdmin();
  const { scriptId } = await params;
  const { encontro } = await searchParams;

  const script = await prisma.lessonScript.findUnique({
    where: { id: scriptId },
    select: { id: true, titulo: true },
  });

  if (!script) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F172A] p-8 text-white">
        <p>Roteiro não encontrado.</p>
      </main>
    );
  }

  const [passos, sessao] = await Promise.all([
    prisma.scriptStep.findMany({
      where: { scriptId },
      orderBy: { ordem: "asc" },
      select: { id: true, ordem: true, titulo: true, blocos: true },
    }),
    abrirApresentacao(scriptId, encontro),
  ]);

  return (
    <ModoApresentacao
      sessaoId={sessao.id}
      scriptId={script.id}
      titulo={script.titulo}
      passos={passos.map((p) => ({
        id: p.id,
        ordem: p.ordem,
        titulo: p.titulo,
        blocos: (p.blocos as unknown as Bloco[]) ?? [],
      }))}
      passoInicial={sessao.passoAtual}
    />
  );
}
