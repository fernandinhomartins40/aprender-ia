import "server-only";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";

/**
 * A leitura estruturada de um passo.
 *
 * Não é o que a tela desenha — quem desenha é o `html` do conteúdo — mas
 * continua sendo o que o painel do professor consegue perguntar ("quantos
 * marcaram este item?").
 */
export type Bloco =
  | { tipo: "texto"; html: string }
  | { tipo: "prompt"; texto: string; variaveis: string[] }
  | { tipo: "ferramentas"; chaves: string[] }
  | { tipo: "checklist"; itens: string[] }
  | { tipo: "imagem"; src: string; legenda?: string };



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
