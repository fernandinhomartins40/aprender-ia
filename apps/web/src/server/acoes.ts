"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { exigirAluno, garantirMatricula } from "./trilha";
import { verificarAcessoCurso } from "./acesso";
import { analisarPtcf, type Analise } from "@/lib/motor-ptcf";
import { nivelDoXp } from "@/lib/gamificacao";
import { notificar } from "./notificacoes";

/* ============================================================
   OFENSIVA (streak)
   ============================================================ */

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function diasDeDiferenca(a: Date, b: Date) {
  const dia = 24 * 60 * 60 * 1000;
  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((d1 - d2) / dia);
}

/**
 * Atualiza a ofensiva do professor.
 *
 * Regras deliberadamente generosas: o público trabalha em jornada dupla
 * e perder a sequência por um dia corrido seria punitivo demais. Só
 * zeramos após 2 dias sem acesso.
 */
async function atualizarOfensiva(userId: string) {
  const agora = new Date();
  const atual = await prisma.streak.findUnique({ where: { userId } });

  if (!atual) {
    return prisma.streak.create({
      data: { userId, diasSeguidos: 1, recorde: 1, ultimoAcesso: agora },
    });
  }

  if (mesmoDia(atual.ultimoAcesso, agora)) return atual;

  const diferenca = diasDeDiferenca(agora, atual.ultimoAcesso);
  const dias = diferenca <= 2 ? atual.diasSeguidos + 1 : 1;

  return prisma.streak.update({
    where: { userId },
    data: {
      diasSeguidos: dias,
      recorde: Math.max(dias, atual.recorde),
      ultimoAcesso: agora,
    },
  });
}

/* ============================================================
   CONQUISTAS
   ============================================================ */

async function conferirConquistas(userId: string) {
  const [licoes, prompts, ofensiva, matricula] = await Promise.all([
    prisma.lessonProgress.count({
      where: { status: "CONCLUIDA", enrollment: { userId } },
    }),
    prisma.promptRun.count({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.enrollment.findFirst({ where: { userId } }),
  ]);

  const todas = await prisma.achievement.findMany();
  const jaTem = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const conquistados = new Set(jaTem.map((c) => c.achievementId));

  const novas: { titulo: string; icone: string }[] = [];

  for (const c of todas) {
    if (conquistados.has(c.id)) continue;
    const criterio = c.criterio as { tipo: string; valor: number };

    let atingiu = false;
    switch (criterio.tipo) {
      case "licoes":
        atingiu = licoes >= criterio.valor;
        break;
      case "prompts":
        atingiu = prompts >= criterio.valor;
        break;
      case "ofensiva":
        atingiu = (ofensiva?.diasSeguidos ?? 0) >= criterio.valor;
        break;
      case "curso":
        atingiu = (matricula?.progressoPct ?? 0) >= criterio.valor;
        break;
      case "modulo": {
        // conta módulos com todas as lições concluídas
        const modulos = await prisma.module.findMany({
          include: { licoes: { select: { id: true } } },
        });
        const feitas = await prisma.lessonProgress.findMany({
          where: { status: "CONCLUIDA", enrollment: { userId } },
          select: { lessonId: true },
        });
        const ids = new Set(feitas.map((f) => f.lessonId));
        const completos = modulos.filter(
          (m) => m.licoes.length > 0 && m.licoes.every((l) => ids.has(l.id)),
        ).length;
        atingiu = completos >= criterio.valor;
        break;
      }
    }

    if (atingiu) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: c.id },
      });
      novas.push({ titulo: c.titulo, icone: c.icone });
    }
  }

  return novas;
}

/**
 * Matrícula do aluno, mas só se ele ainda pode cursar.
 *
 * A matrícula sobrevive à suspensão (é assim que o progresso fica
 * guardado), então checar só a existência dela deixaria um aluno
 * suspenso continuar ganhando XP por POST direto — server action é
 * endpoint público, esconder a tela não basta.
 */
async function matriculaComAcesso(userId: string) {
  const matricula = await garantirMatricula(userId);
  if (!matricula) return null;

  const veredito = await verificarAcessoCurso(userId, matricula.courseId);
  return veredito.permitido ? matricula : null;
}

/* ============================================================
   CONCLUIR LIÇÃO
   ============================================================ */

export async function concluirLicao(dados: FormData) {
  const user = await exigirAluno();
  const lessonId = String(dados.get("lessonId") ?? "");
  const anotacoes = String(dados.get("anotacoes") ?? "").trim() || null;
  if (!lessonId) return null;

  const matricula = await matriculaComAcesso(user.id);
  if (!matricula) return null;

  const licao = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { xpRecompensa: true, tipo: true, moduleId: true, module: { select: { titulo: true } } },
  });
  if (!licao) return null;

  const jaFeita = await prisma.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: matricula.id, lessonId } },
  });

  // Refazer uma lição não dá XP de novo — mas atualiza as anotações.
  const repetida = jaFeita?.status === "CONCLUIDA";
  const xp = repetida ? jaFeita.xpGanho : licao.xpRecompensa;
  const nivelAntes = nivelDoXp(matricula.xpTotal);

  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: matricula.id, lessonId } },
    update: {
      status: "CONCLUIDA",
      xpGanho: xp,
      anotacoes,
      concluidoEm: new Date(),
      tentativas: { increment: 1 },
    },
    create: {
      enrollmentId: matricula.id,
      lessonId,
      status: "CONCLUIDA",
      xpGanho: xp,
      anotacoes,
      iniciadoEm: new Date(),
      concluidoEm: new Date(),
      tentativas: 1,
    },
  });

  // Um lembrete para esta lição perde a relevância assim que ela termina.
  await prisma.notification.updateMany({
    where: { userId: user.id, link: `/app/licao/${lessonId}`, lidoEm: null },
    data: { lidoEm: new Date() },
  });

  // Recalcula o progresso do curso
  const [totalLicoes, feitas, somaXp] = await Promise.all([
    prisma.lesson.count({ where: { module: { courseId: matricula.courseId } } }),
    prisma.lessonProgress.count({
      where: { enrollmentId: matricula.id, status: "CONCLUIDA" },
    }),
    prisma.lessonProgress.aggregate({
      where: { enrollmentId: matricula.id },
      _sum: { xpGanho: true },
    }),
  ]);

  const pct = totalLicoes ? Math.round((feitas / totalLicoes) * 100) : 0;

  await prisma.enrollment.update({
    where: { id: matricula.id },
    data: {
      progressoPct: pct,
      xpTotal: somaXp._sum.xpGanho ?? 0,
      concluidoEm: pct >= 100 ? new Date() : null,
    },
  });

  const ofensiva = await atualizarOfensiva(user.id);
  const novasConquistas = await conferirConquistas(user.id);

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - ((inicioSemana.getDay() + 6) % 7));
  inicioSemana.setHours(0, 0, 0, 0);
  const [totalModulo, feitasModulo, licoesNaSemana] = await Promise.all([
    prisma.lesson.count({ where: { moduleId: licao.moduleId } }),
    prisma.lessonProgress.count({
      where: {
        enrollmentId: matricula.id,
        status: "CONCLUIDA",
        lesson: { moduleId: licao.moduleId },
      },
    }),
    prisma.lessonProgress.count({
      where: { enrollment: { userId: user.id }, status: "CONCLUIDA", concluidoEm: { gte: inicioSemana } },
    }),
  ]);
  const encontroConcluido = !repetida && totalModulo > 0 && feitasModulo === totalModulo;
  const xpTotal = somaXp._sum.xpGanho ?? 0;
  const nivel = nivelDoXp(xpTotal);

  if (novasConquistas.length > 0) {
    await notificar({
      userId: user.id,
      assunto: `conquista.${lessonId}`,
      titulo: novasConquistas.length === 1 ? "Nova conquista desbloqueada" : "Novas conquistas desbloqueadas",
      corpo: novasConquistas.map((c) => c.titulo).join(" · "),
      link: "/app/conquistas",
      categoria: "CONQUISTA",
      dedupeHoras: 720,
      enviarPushAgora: false,
    });
  }

  if (encontroConcluido) {
    await notificar({
      userId: user.id,
      assunto: `progresso.encontro.${licao.moduleId}`,
      titulo: `${licao.module.titulo} concluído`,
      corpo: "Seu progresso foi salvo e a próxima etapa da trilha já está disponível.",
      link: "/app/trilha",
      categoria: "ESTUDO",
      dedupeHoras: 8_760,
      enviarPushAgora: false,
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/trilha");
  revalidatePath("/app/conquistas");

  return {
    xpGanho: repetida ? 0 : licao.xpRecompensa,
    xpTotal,
    progressoPct: pct,
    nivelAntes: nivelAntes.numero,
    nivel: nivel.numero,
    nivelTitulo: nivel.titulo,
    proximoNivelXp: nivel.proximoXp,
    ofensiva: ofensiva.diasSeguidos,
    novasConquistas,
    encontroConcluido,
    encontroTitulo: encontroConcluido ? licao.module.titulo : null,
    trilhaConcluida: pct >= 100,
    tipoLicao: licao.tipo,
    missaoSemanalConcluida: !repetida && licoesNaSemana === 2,
  };
}

/* ============================================================
   RESPOSTA ESCRITA NAS ATIVIDADES DE TEXTO LIVRE
   ============================================================ */

/**
 * Analisa e guarda o que o aluno escreveu.
 *
 * A análise roda AQUI, no servidor, e não no navegador, por três razões:
 * o que é gravado é o mesmo que a pessoa viu (não há chance de divergir);
 * o léxico do motor fica fora do pacote que o celular baixa; e melhorar
 * as heurísticas não exige que ninguém recarregue a página.
 *
 * Devolve a análise em vez de só gravar: o player precisa do resultado
 * para desenhar a devolutiva na hora.
 */
export async function analisarResposta(
  dados: FormData,
): Promise<{ analise: Analise; salvo: boolean }> {
  const texto = String(dados.get("texto") ?? "").trim();
  const analise = analisarPtcf(texto);

  // Texto curto demais não vira registro: o motor já responde pedindo o
  // texto, e gravar rascunho de três palavras encheria o painel de linhas
  // que não dizem nada sobre a prática de ninguém.
  if (analise.vazio) return { analise, salvo: false };

  const lessonId = String(dados.get("lessonId") ?? "");
  const chave = String(dados.get("chave") ?? "principal");
  if (!lessonId) return { analise, salvo: false };

  const user = await exigirAluno();
  const matricula = await matriculaComAcesso(user.id);
  // Sem acesso ao curso a análise ainda volta — quem perdeu o plano no
  // meio da lição recebe a devolutiva, apenas não fica registrada.
  if (!matricula) return { analise, salvo: false };

  try {
    // O progresso pode ainda não existir: escrever a resposta é, muitas
    // vezes, a primeira coisa que a pessoa faz na lição. Criamos como
    // EM_ANDAMENTO — sem XP, que só vem ao concluir.
    const progresso = await prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: matricula.id, lessonId } },
      update: {},
      create: {
        enrollmentId: matricula.id,
        lessonId,
        status: "EM_ANDAMENTO",
        iniciadoEm: new Date(),
        tentativas: 0,
      },
      select: { id: true },
    });

    await prisma.respostaAberta.upsert({
      where: { progressId_chave: { progressId: progresso.id, chave } },
      update: {
        texto,
        analise: analise as unknown as object,
        completas: analise.completas,
        tentativa: { increment: 1 },
      },
      create: {
        progressId: progresso.id,
        chave,
        texto,
        analise: analise as unknown as object,
        completas: analise.completas,
        tentativa: 1,
      },
    });
  } catch (e) {
    // Falhar ao gravar não pode custar a devolutiva: a pessoa escreveu,
    // merece a resposta do motor mesmo que o banco esteja indisponível.
    console.error("[acoes] falha ao guardar resposta aberta:", e);
    return { analise, salvo: false };
  }

  return { analise, salvo: true };
}

/* ============================================================
   REGISTRAR EXECUÇÃO DE PROMPT
   ============================================================ */

export async function registrarPrompt(dados: FormData) {
  const user = await exigirAluno();

  const promptTemplateId = String(dados.get("promptTemplateId") ?? "");
  const ferramenta = String(dados.get("ferramenta") ?? "");
  const promptFinal = String(dados.get("promptFinal") ?? "");
  const variaveisJson = String(dados.get("variaveis") ?? "{}");

  if (!promptTemplateId || !ferramenta || !promptFinal) return;

  let variaveis: Record<string, string> = {};
  try {
    variaveis = JSON.parse(variaveisJson);
  } catch {
    variaveis = {};
  }

  await prisma.promptRun.create({
    data: {
      userId: user.id,
      promptTemplateId,
      ferramenta,
      variaveisPreenchidas: variaveis,
      promptFinal,
    },
  });

  await atualizarOfensiva(user.id);
  await conferirConquistas(user.id);
  revalidatePath("/app");
}

/* ============================================================
   DIÁRIO DE BORDO
   ============================================================ */

export async function registrarDiario(dados: FormData) {
  const user = await exigirAluno();

  const oQueFez = String(dados.get("oQueFez") ?? "").trim();
  const ferramentaUsada = String(dados.get("ferramentaUsada") ?? "").trim();
  if (!oQueFez || !ferramentaUsada) return;

  const numero = (campo: string) => {
    const v = Number(dados.get(campo));
    return Number.isFinite(v) && v > 0 ? Math.round(v) : null;
  };

  await prisma.diaryEntry.create({
    data: {
      userId: user.id,
      oQueFez,
      ferramentaUsada,
      minutosAntes: numero("minutosAntes"),
      minutosAgora: numero("minutosAgora"),
      valeuAPena: dados.get("valeuAPena") !== "nao",
      observacao: String(dados.get("observacao") ?? "").trim() || null,
    },
  });

  await atualizarOfensiva(user.id);
  revalidatePath("/app/diario");
  revalidatePath("/app");
}
