import "server-only";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { ondeFica } from "@/server/apostila";
import type { Bloco } from "@/server/acompanhar";

/**
 * As páginas da aula, do lado do aluno.
 *
 * Cada passo do encontro é uma PÁGINA WEB própria, com endereço próprio — não
 * um slide dentro de um carrossel. O aluno recarrega, compartilha o link e usa
 * o botão voltar do aparelho como em qualquer página. O slide 16:9 continua
 * existindo, mas só no projetor do professor.
 */

export type PassoDaPagina = {
  id: string;
  ordem: number;
  titulo: string;
  html: string | null;
  blocos: Bloco[];
  marcados: number[];
  valores: Record<string, string>;
  apostila: { href: string; rotulo: string } | null;
};

export type VizinhoPasso = { ordem: number; titulo: string } | null;

/** Os encontros disponíveis, para o índice geral e para a troca de encontro. */
export async function encontrosDoAluno() {
  await exigirAluno();
  return prisma.lessonScript.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      titulo: true,
      ordem: true,
      _count: { select: { passos: true } },
    },
  });
}

/**
 * O índice de um encontro: a lista de páginas, como o sumário de um curso.
 *
 * Traz o que o aluno já fez em cada passo, para a lista mostrar onde ele
 * parou, e onde o professor está agora, quando há aula acontecendo.
 */
export async function indiceDoEncontro(ordem: number) {
  const user = await exigirAluno();

  const script = await prisma.lessonScript.findFirst({
    where: { ordem, ativo: true },
    select: { id: true, titulo: true, ordem: true },
  });
  if (!script) return null;

  const [passos, progresso, sessao] = await Promise.all([
    prisma.scriptStep.findMany({
      where: { scriptId: script.id },
      orderBy: { ordem: "asc" },
      select: { id: true, ordem: true, titulo: true, secaoApostila: true },
    }),
    prisma.stepProgress.findMany({
      where: { userId: user.id, step: { scriptId: script.id } },
      select: { stepId: true, marcados: true, visto: true },
    }),
    prisma.liveSession.findFirst({
      where: { scriptId: script.id, encerradaEm: null },
      orderBy: { iniciadaEm: "desc" },
      select: { passoAtual: true },
    }),
  ]);

  const visto = new Map(progresso.map((p) => [p.stepId, p]));

  return {
    encontro: script,
    passoDoProfessor: sessao?.passoAtual ?? null,
    passos: passos.map((p) => ({
      ordem: p.ordem,
      titulo: p.titulo,
      secaoApostila: p.secaoApostila,
      visitado: visto.has(p.id),
    })),
  };
}

/**
 * Uma página de passo, com tudo o que ela precisa numa leitura só.
 *
 * Devolve também o passo anterior e o próximo — não como mecanismo de leitura,
 * e sim como o rodapé de "próxima aula" que qualquer curso tem.
 */
export async function paginaDoPasso(ordemEncontro: number, ordemPasso: number) {
  const user = await exigirAluno();

  const script = await prisma.lessonScript.findFirst({
    where: { ordem: ordemEncontro, ativo: true },
    select: { id: true, titulo: true, ordem: true },
  });
  if (!script) return null;

  const [passo, total, sessao] = await Promise.all([
    prisma.scriptStep.findUnique({
      where: { scriptId_ordem: { scriptId: script.id, ordem: ordemPasso } },
      select: {
        id: true,
        ordem: true,
        titulo: true,
        html: true,
        blocos: true,
        secaoApostila: true,
      },
    }),
    prisma.scriptStep.count({ where: { scriptId: script.id } }),
    prisma.liveSession.findFirst({
      where: { scriptId: script.id, encerradaEm: null },
      orderBy: { iniciadaEm: "desc" },
      select: { passoAtual: true },
    }),
  ]);
  if (!passo) return null;

  const [meu, vizinhos, apostila] = await Promise.all([
    prisma.stepProgress.findUnique({
      where: { userId_stepId: { userId: user.id, stepId: passo.id } },
      select: { marcados: true, valores: true },
    }),
    prisma.scriptStep.findMany({
      where: {
        scriptId: script.id,
        ordem: { in: [ordemPasso - 1, ordemPasso + 1] },
      },
      select: { ordem: true, titulo: true },
    }),
    ondeFica(passo.secaoApostila),
  ]);

  return {
    encontro: script,
    total,
    passoDoProfessor: sessao?.passoAtual ?? null,
    passo: {
      id: passo.id,
      ordem: passo.ordem,
      titulo: passo.titulo,
      html: passo.html,
      blocos: (passo.blocos as unknown as Bloco[]) ?? [],
      marcados: meu?.marcados ?? [],
      valores: (meu?.valores as Record<string, string> | null) ?? {},
      apostila,
    } satisfies PassoDaPagina,
    anterior: (vizinhos.find((v) => v.ordem === ordemPasso - 1) ??
      null) as VizinhoPasso,
    proximo: (vizinhos.find((v) => v.ordem === ordemPasso + 1) ??
      null) as VizinhoPasso,
  };
}
