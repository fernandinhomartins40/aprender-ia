/**
 * Seed do curso "IA para Empreendedores".
 *
 * Roda separado do seed principal e **não toca em nada do curso de
 * Educadores**: tudo o que cria leva o `courseId` deste curso, e o que já
 * existia continua com `courseId` nulo, que significa "vale para todos".
 *
 * É idempotente: pode rodar quantas vezes for preciso.
 *
 *     pnpm --filter @aprender/db seed:empreendedores
 */
import { PrismaClient, TipoLicao } from "@prisma/client";
import { MODULOS_EMPREENDEDORES } from "./empreendedores/modulos";
import { TODAS_EXTRAS } from "./empreendedores/extras-todas";
import { roteirosDeEmpreendedores } from "./empreendedores/roteiros";
import { TODOS_OS_PROMPTS, titulosDuplicados } from "./empreendedores/prompts-todos";
import { FERRAMENTAS_EMPREENDEDORES } from "./empreendedores/ferramentas";
import { APOSTILA_EMPREENDEDORES } from "./empreendedores/apostila";
import {
  CONQUISTAS_EMPREENDEDORES,
  MISSOES_EMPREENDEDORES,
  VERBETES_EMPREENDEDORES,
} from "./empreendedores/conhecimento";

const prisma = new PrismaClient();

const CURSO = {
  slug: "ia-para-empreendedores",
  titulo: "IA para Empreendedores",
  subtitulo: "Do primeiro prompt ao primeiro agente, com o seu negócio",
  descricao:
    "Formação prática para quem tem um negócio pequeno usar Inteligência Artificial no dia a dia: atender melhor, produzir conteúdo, entender os próprios números, automatizar tarefas repetitivas e desenhar o primeiro agente. Sem jargão e priorizando ferramentas gratuitas.",
  // 40h como o curso de Educadores, e pela mesma conta: são 14h de
  // conteúdo na tela (contra 10,6h de lá) mais a prática aplicada no
  // próprio negócio, que é onde o laboratório e o projeto acontecem de
  // verdade. O número não veio de repetir molde para encher volume — foi
  // isso que o deck antigo fazia.
  cargaHoraria: 40,
};

async function main() {
  console.log("Seed — IA para Empreendedores");

  // ---- Curso ----
  // Nasce despublicado: enquanto não há conteúdo conferido, nenhum aluno
  // deve cair nele. A publicação é o último passo, manual.
  const curso = await prisma.course.upsert({
    where: { slug: CURSO.slug },
    update: { ...CURSO },
    create: { ...CURSO, publicado: false, ordem: 1 },
  });
  console.log(`  curso: ${curso.titulo} (publicado: ${curso.publicado})`);

  // ---- Ferramentas ----
  for (const f of FERRAMENTAS_EMPREENDEDORES) {
    await prisma.aiTool.upsert({
      where: { chave: f.chave },
      update: { ...f, courseId: curso.id },
      create: { ...f, courseId: curso.id },
    });
  }
  console.log(`  ferramentas: ${FERRAMENTAS_EMPREENDEDORES.length}`);

  // ---- Módulos e lições ----
  let totalLicoes = 0;
  for (const m of MODULOS_EMPREENDEDORES) {
    const modulo = await prisma.module.upsert({
      where: { courseId_ordem: { courseId: curso.id, ordem: m.ordem } },
      update: { titulo: m.titulo, subtitulo: m.subtitulo, cor: m.cor, icone: m.icone },
      create: {
        courseId: curso.id,
        ordem: m.ordem,
        titulo: m.titulo,
        subtitulo: m.subtitulo,
        cor: m.cor,
        icone: m.icone,
      },
    });

    // As lições extras entram antes do fechamento do módulo: o
    // CHECKPOINT resume o que veio antes, então não pode ficar no meio.
    const extras = TODAS_EXTRAS.filter((e) => e.modulo === m.titulo);
    const corte = m.licoes.findIndex((l) => l.tipo === TipoLicao.CHECKPOINT);
    const licoes =
      corte === -1
        ? [...m.licoes, ...extras]
        : [...m.licoes.slice(0, corte), ...extras, ...m.licoes.slice(corte)];

    for (const [i, l] of licoes.entries()) {
      await prisma.lesson.upsert({
        where: { moduleId_ordem: { moduleId: modulo.id, ordem: i } },
        update: {
          titulo: l.titulo,
          tipo: l.tipo,
          conteudo: l.conteudo as never,
          xpRecompensa: l.xp,
          tempoEstimado: l.tempo,
          capituloRef: l.cap ?? null,
        },
        create: {
          moduleId: modulo.id,
          ordem: i,
          titulo: l.titulo,
          tipo: l.tipo,
          conteudo: l.conteudo as never,
          xpRecompensa: l.xp,
          tempoEstimado: l.tempo,
          capituloRef: l.cap ?? null,
        },
      });
      totalLicoes++;
    }

    // Um módulo que encolheu deixaria lições órfãs no fim, fora do
    // conteúdo atual e ainda visíveis na trilha. O progresso de quem já
    // as fez cai junto, o que é o certo: a lição não existe mais.
    await prisma.lesson.deleteMany({
      where: { moduleId: modulo.id, ordem: { gte: licoes.length } },
    });
  }
  console.log(`  módulos: ${MODULOS_EMPREENDEDORES.length} · lições: ${totalLicoes}`);

  // ---- Banco de prompts ----
  // A chave é o título dentro do curso: prompt sem `chave` única no
  // schema, então é o par (courseId, titulo) que identifica.
  // O título é a chave de idempotência dentro do curso: repetido, o seed
  // atualizaria o mesmo registro duas vezes e um prompt sumiria do banco
  // sem ninguém notar.
  const repetidos = titulosDuplicados();
  if (repetidos.length) {
    throw new Error(
      `Títulos de prompt repetidos (${repetidos.length}): ${repetidos.join(" · ")}`,
    );
  }

  for (const p of TODOS_OS_PROMPTS) {
    const existente = await prisma.promptTemplate.findFirst({
      where: { courseId: curso.id, titulo: p.titulo },
      select: { id: true },
    });
    const dados = {
      courseId: curso.id,
      titulo: p.titulo,
      corpo: p.corpo,
      categoria: p.categoria,
      setor: p.setor,
      porteEmpresa: p.porteEmpresa ?? null,
      exemploPreenchido: p.exemploPreenchido,
      dica: p.dica,
      variaveis: p.variaveis as never,
      ferramentasSugeridas: p.ferramentasSugeridas,
      nivelDificuldade: p.nivelDificuldade,
      tags: p.tags,
      faixa: "Gratuito",
    };
    if (existente) {
      await prisma.promptTemplate.update({ where: { id: existente.id }, data: dados });
    } else {
      await prisma.promptTemplate.create({ data: dados });
    }
  }
  console.log(`  prompts: ${TODOS_OS_PROMPTS.length}`);

  // ---- Verbetes ----
  for (const v of VERBETES_EMPREENDEDORES) {
    await prisma.knowledgeEntry.upsert({
      where: { slug: v.slug },
      update: { ...v, importancias: v.importancias as never, courseId: curso.id },
      create: { ...v, importancias: v.importancias as never, courseId: curso.id },
    });
  }
  console.log(`  verbetes: ${VERBETES_EMPREENDEDORES.length}`);

  // ---- Conquistas ----
  for (const c of CONQUISTAS_EMPREENDEDORES) {
    await prisma.achievement.upsert({
      where: { chave: c.chave },
      update: { ...c, criterio: c.criterio as never, courseId: curso.id },
      create: { ...c, criterio: c.criterio as never, courseId: curso.id },
    });
  }
  console.log(`  conquistas: ${CONQUISTAS_EMPREENDEDORES.length}`);

  // ---- Missões ----
  for (const m of MISSOES_EMPREENDEDORES) {
    await prisma.mission.upsert({
      where: { chave: m.chave },
      update: { ...m, courseId: curso.id },
      create: { ...m, courseId: curso.id },
    });
  }
  console.log(`  missões: ${MISSOES_EMPREENDEDORES.length}`);

  // ---- Apostila ----
  for (const [i, cap] of APOSTILA_EMPREENDEDORES.entries()) {
    const capitulo = await prisma.handbookChapter.upsert({
      where: { chave: cap.chave },
      update: {
        numero: cap.numero,
        titulo: cap.titulo,
        icone: cap.icone,
        aberturaHtml: cap.aberturaHtml,
        ordem: i,
        courseId: curso.id,
      },
      create: {
        chave: cap.chave,
        numero: cap.numero,
        titulo: cap.titulo,
        icone: cap.icone,
        aberturaHtml: cap.aberturaHtml,
        ordem: i,
        courseId: curso.id,
      },
    });

    for (const [j, sec] of cap.secoes.entries()) {
      await prisma.handbookSection.upsert({
        where: { chapterId_ordem: { chapterId: capitulo.id, ordem: j } },
        update: { numero: sec.numero, titulo: sec.titulo, html: sec.html },
        create: {
          chapterId: capitulo.id,
          numero: sec.numero,
          titulo: sec.titulo,
          html: sec.html,
          ordem: j,
        },
      });
    }
  }
  console.log(`  capítulos da apostila: ${APOSTILA_EMPREENDEDORES.length}`);

  // ---- Roteiros da aula ao vivo ----
  //
  // Substituem o deck HTML que era aberto por um .vbs fora da aplicação.
  // A diferença que importa não é o formato: é a fonte. Os passos saem
  // das mesmas lições da trilha, então corrigir o conteúdo corrige a aula
  // presencial junto — era essa divergência que fazia o deck acumular
  // slides repetidos que a trilha não tinha.
  const roteiros = roteirosDeEmpreendedores();
  let totalPassos = 0;
  for (const r of roteiros) {
    const existente = await prisma.lessonScript.findFirst({
      where: { courseId: curso.id, ordem: r.encontro },
      select: { id: true },
    });
    const script = existente
      ? await prisma.lessonScript.update({
          where: { id: existente.id },
          data: { titulo: r.titulo },
        })
      : await prisma.lessonScript.create({
          data: { courseId: curso.id, titulo: r.titulo, ordem: r.encontro },
        });

    for (const [i, passo] of r.passos.entries()) {
      await prisma.scriptStep.upsert({
        where: { scriptId_ordem: { scriptId: script.id, ordem: i } },
        update: {
          titulo: passo.titulo,
          html: passo.html,
          secaoApostila: passo.secaoApostila,
          blocos: passo.blocos as never,
        },
        create: {
          scriptId: script.id,
          ordem: i,
          titulo: passo.titulo,
          html: passo.html,
          secaoApostila: passo.secaoApostila,
          blocos: passo.blocos as never,
        },
      });
      totalPassos++;
    }

    // Passos que sobraram de uma versão anterior mais longa.
    await prisma.scriptStep.deleteMany({
      where: { scriptId: script.id, ordem: { gte: r.passos.length } },
    });
  }
  console.log(`  roteiros da aula: ${roteiros.length} encontros · ${totalPassos} passos`);

  // ---- Acesso ----
  //
  // Sem estar num plano, o curso existe mas ninguém entra: a trilha
  // responde "Acesso indisponível". Como `Course.pago` é falso, ele entra
  // no plano gratuito, com todos os módulos liberados.
  //
  // Só semeia se ainda não houver vínculo: reexecutar o seed não pode
  // desfazer o que o administrador configurou depois.
  const planoFree = await prisma.plan.findUnique({
    where: { slug: "gratuito" },
    select: { id: true },
  });

  if (planoFree) {
    const jaVinculado = await prisma.planCourse.findFirst({
      where: { planId: planoFree.id, courseId: curso.id },
      select: { id: true },
    });

    if (!jaVinculado) {
      const modulos = await prisma.module.findMany({
        where: { courseId: curso.id, pago: false },
        select: { id: true },
      });
      const vinculo = await prisma.planCourse.create({
        data: {
          planId: planoFree.id,
          courseId: curso.id,
          abrangencia: "MODULOS_ESPECIFICOS",
        },
        select: { id: true },
      });
      await prisma.planModule.createMany({
        data: modulos.map((m) => ({ planCourseId: vinculo.id, moduleId: m.id })),
        skipDuplicates: true,
      });
      console.log(`  plano gratuito: ${modulos.length} módulos liberados`);
    } else {
      console.log("  plano gratuito: vínculo já existia, mantido");
    }
  } else {
    console.log(
      "  plano gratuito não encontrado — rode antes o seed principal (pnpm db:seed)",
    );
  }

  console.log("\nPronto. O curso está DESPUBLICADO.");
  console.log("Para publicar, no painel de admin ou:");
  console.log(
    `  UPDATE courses SET publicado = true WHERE slug = '${CURSO.slug}';`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
