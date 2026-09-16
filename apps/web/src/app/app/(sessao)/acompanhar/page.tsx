import { redirect } from "next/navigation";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";

/**
 * O endereço antigo do "Acompanhe a aula".
 *
 * A tela virou páginas de verdade — uma por conteúdo, em `/app/aula/1/3` —, e
 * este caminho continua existindo porque é o que está em links já enviados à
 * turma e na tela de quem deixou a aba aberta. Leva ao lugar certo: a página
 * que o professor está mostrando, se há aula acontecendo, ou o índice.
 */
export const dynamic = "force-dynamic";

export default async function PaginaAcompanharAntiga({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  await exigirAluno();
  const { r } = await searchParams;

  const script = r
    ? await prisma.lessonScript.findUnique({
        where: { id: r },
        select: { ordem: true },
      })
    : await prisma.lessonScript.findFirst({
        where: { ativo: true, sessoes: { some: { encerradaEm: null } } },
        orderBy: { ordem: "asc" },
        select: { ordem: true },
      });

  if (!script) redirect("/app/aula");

  const sessao = await prisma.liveSession.findFirst({
    where: { encerradaEm: null, script: { ordem: script.ordem } },
    orderBy: { iniciadaEm: "desc" },
    select: { passoAtual: true },
  });

  redirect(
    sessao
      ? `/app/aula/${script.ordem}/${sessao.passoAtual}`
      : `/app/aula/${script.ordem}`,
  );
}
