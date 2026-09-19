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
import { PROMPTS_EMPREENDEDORES } from "./empreendedores/prompts";
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
  cargaHoraria: 20,
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

    for (const [i, l] of m.licoes.entries()) {
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
  }
  console.log(`  módulos: ${MODULOS_EMPREENDEDORES.length} · lições: ${totalLicoes}`);

  // ---- Banco de prompts ----
  // A chave é o título dentro do curso: prompt sem `chave` única no
  // schema, então é o par (courseId, titulo) que identifica.
  for (const p of PROMPTS_EMPREENDEDORES) {
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
  console.log(`  prompts: ${PROMPTS_EMPREENDEDORES.length}`);

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
