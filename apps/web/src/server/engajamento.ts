import { prisma } from "@aprender/db";
import { lerNumero } from "./configuracoes";
import { carregarTrilha } from "./trilha";
import { notificar } from "./notificacoes";

const DIA = 86_400_000;

/**
 * Reengajamento baseado somente em fatos persistidos: último acesso,
 * progresso, próxima lição e sequência. Uma execução pode ser repetida;
 * assunto + janela de deduplicação impedem mensagens duplicadas.
 */
export async function processarEngajamento() {
  const [leve, longa] = await Promise.all([
    lerNumero("engajamento.inatividade_leve_dias"),
    lerNumero("engajamento.inatividade_longa_dias"),
  ]);
  const agora = new Date();
  const alunos = await prisma.user.findMany({
    where: { papel: "ALUNO", situacao: "ATIVO" },
    select: { id: true, nome: true, criadoEm: true, ultimoAcessoEm: true, ofensiva: true },
  });

  let avaliados = 0;
  let registrados = 0;
  for (const aluno of alunos) {
    const matriculaExiste = await prisma.enrollment.findFirst({
      where: { userId: aluno.id }, select: { id: true },
    });
    if (!matriculaExiste) continue;
    const ultimaAtividade = await prisma.lessonProgress.findFirst({
      where: { enrollment: { userId: aluno.id }, concluidoEm: { not: null } },
      orderBy: { concluidoEm: "desc" },
      select: { concluidoEm: true },
    });
    const referencia = [aluno.ultimoAcessoEm, ultimaAtividade?.concluidoEm, aluno.criadoEm]
      .filter((d): d is Date => Boolean(d))
      .sort((a, b) => b.getTime() - a.getTime())[0]!;
    const dias = Math.floor((agora.getTime() - referencia.getTime()) / DIA);
    if (dias < Math.max(1, leve)) continue;

    const trilha = await carregarTrilha(aluno.id);
    if (!trilha || trilha.bloqueado || trilha.progressoPct >= 100) continue;
    const proxima = trilha.modulos.flatMap((m) => m.licoes).find((l) => l.status === "DISPONIVEL" || l.status === "EM_ANDAMENTO");
    if (!proxima) continue;
    avaliados++;

    const restantes = trilha.totalLicoes - trilha.totalConcluidas;
    let titulo = "Continue de onde parou";
    let corpo = `A atividade “${proxima.titulo}” está pronta para você.`;
    let assunto = `engajamento.retomar.${proxima.id}`;

    if (restantes <= 2) {
      titulo = "Falta pouco para concluir a trilha";
      corpo = `Restam ${restantes} atividades. A próxima é “${proxima.titulo}”.`;
      assunto = "engajamento.trilha-quase-concluida";
    } else if ((aluno.ofensiva?.diasSeguidos ?? 0) >= 2 && dias <= 2) {
      titulo = "Sua sequência pode continuar hoje";
      corpo = `Você vem construindo uma sequência de ${aluno.ofensiva!.diasSeguidos} dias. Continue com “${proxima.titulo}”.`;
      assunto = "engajamento.sequencia-em-risco";
    } else if (dias >= Math.max(longa, leve + 1)) {
      titulo = "Seu progresso continua salvo";
      corpo = `Você pode retomar pela atividade “${proxima.titulo}”, exatamente de onde parou.`;
      assunto = `engajamento.retorno.${proxima.id}`;
    }

    const resultado = await notificar({
      userId: aluno.id,
      assunto,
      titulo,
      corpo,
      link: `/app/licao/${proxima.id}`,
      categoria: "ESTUDO",
      automatica: true,
      dedupeHoras: dias >= longa ? 168 : 72,
    });
    if (resultado.registrada) registrados++;
  }

  return { avaliados, registrados };
}
