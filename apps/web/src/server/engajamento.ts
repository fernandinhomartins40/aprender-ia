import { prisma } from "@aprender/db";
import { agruparUltimaAtividade } from "@/lib/ultima-atividade";
import { lerNumero, lerTexto } from "./configuracoes";
import { carregarTrilha, type CacheCursos } from "./trilha";
import { notificar } from "./notificacoes";
import { processarConteudosAgendados } from "./conteudo-notificacao";

const DIA = 86_400_000;

function cicloAtual(tipo: "DIARIA" | "SEMANAL" | "ESPECIAL", agora: Date) {
  if (tipo === "ESPECIAL") return "unica";
  const inicio = new Date(agora);
  if (tipo === "DIARIA") inicio.setHours(0, 0, 0, 0);
  else {
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
    inicio.setHours(0, 0, 0, 0);
  }
  const data = inicio.toISOString().slice(0, 10);
  return tipo === "SEMANAL" ? `semana-${data}` : data;
}

/** Processa missões disponíveis e reengajamento com deduplicação e limite diário. */
export async function processarEngajamento() {
  await processarConteudosAgendados();
  const [leve, longa, textoRetorno, textoSequencia, textoQuase, textoMissao, missoes] = await Promise.all([
    lerNumero("engajamento.inatividade_leve_dias"),
    lerNumero("engajamento.inatividade_longa_dias"),
    lerTexto("engajamento.texto_retorno"),
    lerTexto("engajamento.texto_sequencia"),
    lerTexto("engajamento.texto_quase_concluiu"),
    lerTexto("engajamento.texto_nova_missao"),
    prisma.mission.findMany({ where: { ativo: true }, orderBy: [{ tipo: "asc" }, { criadoEm: "asc" }] }),
  ]);
  const agora = new Date();

  // A matrícula é exigida logo adiante, então filtramos aqui em vez de uma
  // consulta por aluno dentro do laço: quem não tem matrícula nunca gera
  // notificação, e trazê-lo do banco só para descartá-lo é trabalho jogado
  // fora. `some: {}` vira um EXISTS no SQL — não carrega as matrículas.
  const alunos = await prisma.user.findMany({
    where: {
      papel: "ALUNO",
      situacao: "ATIVO",
      matriculas: { some: {} },
    },
    select: { id: true, criadoEm: true, ultimoAcessoEm: true, ofensiva: true },
  });

  // Última atividade de TODOS os alunos numa consulta, em vez de uma por
  // aluno dentro do laço.
  //
  // `groupBy` com `_max` devolve exatamente o mesmo valor que o
  // `findFirst(orderBy: concluidoEm desc)` que existia aqui: a conclusão mais
  // recente de cada um. A diferença é o número de idas ao banco — de N para 1.
  const ultimasAtividades = await prisma.lessonProgress.groupBy({
    by: ["enrollmentId"],
    where: { concluidoEm: { not: null }, enrollment: { userId: { in: alunos.map((a) => a.id) } } },
    _max: { concluidoEm: true },
  });
  // O groupBy devolve por matrícula; o laço precisa por aluno.
  const matriculas = await prisma.enrollment.findMany({
    where: { userId: { in: alunos.map((a) => a.id) } },
    select: { id: true, userId: true },
  });
  const ultimaAtividadePorAluno = agruparUltimaAtividade(ultimasAtividades, matriculas);

  let avaliados = 0;
  let registrados = 0;
  const janelaNovidade = new Date(agora.getTime() - 48 * 60 * 60 * 1000);

  // Cache de curso vivo só durante ESTA execução.
  //
  // `carregarTrilha` busca o curso inteiro — 11 módulos e 82 lições — uma vez
  // por aluno, e o resultado é idêntico para todos. Num lote de 200 alunos,
  // era a mesma árvore lida 200 vezes. O mapa nasce e morre aqui: nenhuma
  // requisição de usuário o enxerga, então ninguém recebe trilha desatualizada
  // depois de o administrador editar uma lição.
  //
  // As decisões continuam sendo do mesmo motor de acesso de sempre. Isto muda
  // apenas DE ONDE vêm os dados do curso, não o que se decide com eles — é o
  // motivo de não haver aqui uma segunda implementação da regra de acesso.
  const cacheCursos: CacheCursos = new Map();
  for (const aluno of alunos) {

    // Missões recorrentes aparecem naturalmente no painel. Push é reservado
    // para uma missão/desafio que o admin acabou de programar, para não
    // consumir o único lembrete diário e esconder um retorno mais útil.
    const missao = missoes.find((m) => m.iniciaEm && m.iniciaEm <= agora && m.iniciaEm >= janelaNovidade && (!m.terminaEm || m.terminaEm >= agora));
    if (missao) {
      const ciclo = cicloAtual(missao.tipo, agora);
      const estado = await prisma.userMission.findUnique({
        where: { userId_missionId_ciclo: { userId: aluno.id, missionId: missao.id, ciclo } },
        select: { concluidoEm: true },
      });
      if (!estado?.concluidoEm) {
        const aviso = await notificar({
          userId: aluno.id,
          assunto: `engajamento.missao-disponivel.${missao.id}.${ciclo}`,
          titulo: missao.lessonId ? "Novo desafio disponível" : "Nova missão disponível",
          corpo: textoMissao.replaceAll("{missao}", missao.oculto ? "um objetivo secreto" : missao.titulo),
          link: missao.lessonId ? `/app/licao/${missao.lessonId}` : "/app/missoes",
          categoria: missao.lessonId ? "DESAFIO" : "MISSAO",
          automatica: true,
          dedupeHoras: missao.tipo === "DIARIA" ? 24 : 8_760,
        });
        if (aviso.registrada) registrados++;
      }
    }

    // Vem do mapa carregado antes do laço — mesmo valor, sem ida ao banco.
    const ultimaAtividade = ultimaAtividadePorAluno.get(aluno.id);
    const referencia = [aluno.ultimoAcessoEm, ultimaAtividade, aluno.criadoEm]
      .filter((data): data is Date => Boolean(data)).sort((a, b) => b.getTime() - a.getTime())[0]!;
    const dias = Math.floor((agora.getTime() - referencia.getTime()) / DIA);
    if (dias < Math.max(1, leve)) continue;

    // O terceiro argumento é o cache do lote: o curso é buscado uma vez e
    // reaproveitado pelos demais alunos. As decisões de acesso continuam
    // sendo tomadas por aluno, como antes.
    const trilha = await carregarTrilha(aluno.id, undefined, cacheCursos);
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
      corpo = textoQuase.replaceAll("{restantes}", String(restantes)).replaceAll("{atividade}", proxima.titulo);
      assunto = "engajamento.trilha-quase-concluida";
    } else if ((aluno.ofensiva?.diasSeguidos ?? 0) >= 2 && dias <= 2) {
      titulo = "Sua sequência pode continuar hoje";
      corpo = textoSequencia.replaceAll("{dias}", String(aluno.ofensiva!.diasSeguidos)).replaceAll("{atividade}", proxima.titulo);
      assunto = "engajamento.sequencia-em-risco";
    } else if (dias >= Math.max(longa, leve + 1)) {
      titulo = "Seu progresso continua salvo";
      corpo = textoRetorno.replaceAll("{atividade}", proxima.titulo);
      assunto = `engajamento.retorno.${proxima.id}`;
    }
    const resultado = await notificar({
      userId: aluno.id, assunto, titulo, corpo, link: `/app/licao/${proxima.id}`,
      categoria: "ESTUDO", automatica: true, dedupeHoras: dias >= longa ? 168 : 72,
    });
    if (resultado.registrada) registrados++;
  }
  return { avaliados, registrados };
}
