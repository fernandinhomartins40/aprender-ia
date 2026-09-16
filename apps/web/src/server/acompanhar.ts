import "server-only";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";

/**
 * A leitura estruturada de um passo.
 *
 * Não é mais o que a tela desenha — quem desenha é o `html` do slide — mas
 * continua sendo o que o painel do professor consegue perguntar, e a reserva
 * para um passo antigo que ainda não tenha `html`.
 */
export type Bloco =
  | { tipo: "texto"; html: string }
  | { tipo: "prompt"; texto: string; variaveis: string[] }
  | { tipo: "ferramentas"; chaves: string[] }
  | { tipo: "checklist"; itens: string[] }
  | { tipo: "imagem"; src: string; legenda?: string };

export type PassoDaAula = {
  id: string;
  ordem: number;
  titulo: string;
  /** O slide do curso, desenhado com o CSS do deck. */
  html: string | null;
  blocos: Bloco[];
  /// O que este aluno já marcou e digitou aqui.
  marcados: number[];
  valores: Record<string, string>;
};

export type FerramentaDoAluno = {
  chave: string;
  nome: string;
  url: string;
  metodoAbertura: string;
  urlComPrompt: string | null;
};

/**
 * Tudo o que a tela do aluno precisa, numa leitura só.
 *
 * A tela é aberta em sala, com 30 celulares na mesma rede da escola — então
 * os passos vêm de uma vez e a navegação seguinte não bate no servidor.
 */
export async function roteiroDoAluno(scriptId?: string) {
  const user = await exigirAluno();

  const script = scriptId
    ? await prisma.lessonScript.findUnique({ where: { id: scriptId } })
    : await prisma.lessonScript.findFirst({
        where: { ativo: true },
        orderBy: { ordem: "asc" },
      });

  if (!script) return null;

  const [passos, progresso, ferramentas, roteiros, sessao] = await Promise.all([
    prisma.scriptStep.findMany({
      where: { scriptId: script.id },
      orderBy: { ordem: "asc" },
    }),
    prisma.stepProgress.findMany({
      where: { userId: user.id, step: { scriptId: script.id } },
    }),
    prisma.aiTool.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
      select: {
        chave: true,
        nome: true,
        url: true,
        metodoAbertura: true,
        urlComPrompt: true,
      },
    }),
    prisma.lessonScript.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
      select: { id: true, titulo: true, ordem: true },
    }),
    sessaoAberta(script.id),
  ]);

  const porPasso = new Map(progresso.map((p) => [p.stepId, p]));

  return {
    script: { id: script.id, titulo: script.titulo },
    roteiros,
    ferramentas: ferramentas as FerramentaDoAluno[],
    /// Passo em que o professor está agora, se houver apresentação rolando.
    passoDoProfessor: sessao?.passoAtual ?? null,
    passos: passos.map((p): PassoDaAula => {
      const meu = porPasso.get(p.id);
      return {
        id: p.id,
        ordem: p.ordem,
        titulo: p.titulo,
        html: p.html,
        blocos: (p.blocos as unknown as Bloco[]) ?? [],
        marcados: meu?.marcados ?? [],
        valores: (meu?.valores as Record<string, string> | null) ?? {},
      };
    }),
  };
}

/** A apresentação em andamento deste roteiro, se existir. */
export async function sessaoAberta(scriptId: string) {
  return prisma.liveSession.findFirst({
    where: { scriptId, encerradaEm: null },
    orderBy: { iniciadaEm: "desc" },
    select: { id: true, passoAtual: true, iniciadaEm: true },
  });
}

/**
 * Grava o que o aluno marcou e digitou num passo.
 *
 * Chamado a cada toque no checklist e ao sair de um campo. Se a rede da escola
 * falhar, o aluno não perde nada na tela — a gravação apenas não acontece, e a
 * próxima tentativa envia o estado completo do passo.
 */
export async function salvarProgresso(
  stepId: string,
  dados: { marcados?: number[]; valores?: Record<string, string> },
) {
  const user = await exigirAluno();
  await prisma.stepProgress.upsert({
    where: { userId_stepId: { userId: user.id, stepId } },
    create: {
      userId: user.id,
      stepId,
      marcados: dados.marcados ?? [],
      valores: dados.valores ?? {},
    },
    update: {
      ...(dados.marcados ? { marcados: dados.marcados } : {}),
      ...(dados.valores ? { valores: dados.valores } : {}),
      visto: new Date(),
    },
  });
}
