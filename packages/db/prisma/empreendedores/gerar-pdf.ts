/**
 * Gera a apostila impressa do curso de Empreendedores A PARTIR DO BANCO.
 *
 * O sentido importa. No curso de Educadores o caminho é o inverso — o HTML
 * da apostila é a fonte e o banco recebe uma cópia —, e é assim que os
 * dois saem de sincronia: alguém corrige a lição na plataforma e o PDF
 * continua dizendo o que dizia antes.
 *
 * Aqui a fonte única é o banco. O que o aluno lê na tela e o que ele
 * imprime são o mesmo texto, por construção.
 *
 * Uso:
 *   pnpm --filter @aprender/db apostila:empreendedores
 *
 * Sai um HTML pronto para impressão em `apps/web/public/curso/`. Para
 * virar PDF, abra no navegador e use "Salvar como PDF" — ou rode o
 * Puppeteer que já existe na pasta `cursos/IA Professores/node_modules`.
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const prisma = new PrismaClient();

/**
 * O visual vem dos mesmos CSS da apostila de Educadores.
 *
 * Antes havia um bloco de estilo escrito à mão aqui, e o resultado era um
 * material parecido com um documento de texto — sem os `.dica`, `.atencao`,
 * `.prompt` e `.selo` que dão a cara do material impresso do curso. Os três
 * arquivos ficam na pasta de cada curso, ao lado do HTML gerado.
 */
const CSS_DO_CURSO = `
<link rel="stylesheet" href="estilo.css">
<link rel="stylesheet" href="componentes_novos.css">
<link rel="stylesheet" href="componentes_ferramentas.css">
<style>
  @page { size: A4; margin: 16mm 14mm; }
  .quebra { break-before: page; }
  .como-imprimir {
    background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 8px;
    padding: 14px; font-family: var(--titulo, system-ui); font-size: 10pt;
    margin-bottom: 24px;
  }
  @media print { .como-imprimir { display: none; } }
</style>`;

async function main() {
  const curso = await prisma.course.findUnique({
    where: { slug: "ia-para-empreendedores" },
    select: { id: true, titulo: true, subtitulo: true, descricao: true, cargaHoraria: true },
  });
  if (!curso) {
    console.error(
      "curso não encontrado — rode antes: pnpm --filter @aprender/db seed:empreendedores",
    );
    process.exit(1);
  }

  const capitulos = await prisma.handbookChapter.findMany({
    where: { courseId: curso.id },
    orderBy: { ordem: "asc" },
    include: { secoes: { orderBy: { ordem: "asc" } } },
  });

  if (!capitulos.length) {
    console.error("nenhum capítulo no banco para este curso.");
    process.exit(1);
  }

  const hoje = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());

  // O sumário usa `.sumario-item`, como o de Educadores: uma linha por
  // capítulo, com as seções abaixo em texto menor.
  const sumario = capitulos
    .map(
      (c) =>
        `<div class="sumario-item"><b>${
          c.numero ? `Capítulo ${c.numero}` : "Guia de bolso"
        }</b> — ${c.titulo}${
          c.secoes.length
            ? `<br><span style="font-size:.9em;color:var(--cinza,#667)">${c.secoes
                .map((s) => `${s.numero} ${s.titulo}`)
                .join(" · ")}</span>`
            : ""
        }</div>`,
    )
    .join("");

  const corpo = capitulos
    .map(
      (c) => `
    <section>
      <div class="quebra"></div>
      <div class="faixa-encontro">${
        c.numero ? `Capítulo ${c.numero}` : "Anexo"
      }</div>
      <h1 class="cap"><span class="ic">${c.icone}</span>${
        c.numero ? `Capítulo ${c.numero}: ` : ""
      }${c.titulo}</h1>
      ${c.aberturaHtml}
      ${c.secoes
        .map((s) => `<h2>${s.numero} ${s.titulo}</h2>${s.html}`)
        .join("\n")}
    </section>`,
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${curso.titulo} — Apostila</title>
${CSS_DO_CURSO}
</head>
<body>

<div class="como-imprimir">
  <strong>Para salvar em PDF:</strong> use Imprimir no seu navegador
  (Ctrl+P) e escolha "Salvar como PDF". Este aviso não sai na impressão.
</div>

<div class="capa">
  <div class="capa-selo">MATERIAL DE CONSULTA · ${curso.cargaHoraria} HORAS</div>
  <div class="capa-icone">💼</div>
  <h1>Inteligência Artificial<span class="destaque">para Empreendedores</span></h1>
  <p class="sub">${curso.subtitulo ?? ""}</p>
  <p class="nota">
    Gerado em ${hoje} · a partir do conteúdo do curso.<br>
    As aulas não repetem esta apostila: elas explicam, demonstram e fazem
    produzir. Isto aqui é onde se procura a referência depois.
  </p>
</div>

<div class="quebra"></div>
<h1 class="cap"><span class="ic">📑</span>Sumário da apostila</h1>
${sumario}

${corpo}

<p class="rodape">
  Os limites e planos das ferramentas foram conferidos na documentação
  oficial na data indicada em cada item. Ferramentas de IA mudam rápido:
  confirme antes de decidir assinar.
</p>

</body>
</html>`;

  // Dois destinos, porque o material vive em dois lugares: a pasta do
  // curso, onde os PDFs são gerados e o instrutor trabalha, e o `public`
  // da aplicação, de onde o aluno baixa. Gravar num só foi o que deixou
  // a apostila da pasta `cursos` com o conteúdo antigo enquanto a da
  // aplicação já vinha do banco.
  const destinos = [
    {
      pasta: resolve(
        import.meta.dirname,
        "../../../../../cursos/Curso_IA_Empreendedores_2026",
      ),
      arquivo: "Apostila_IA_para_Empreendedores_2026.html",
    },
    {
      pasta: resolve(import.meta.dirname, "../../../../apps/web/public/curso"),
      arquivo: "Apostila_IA_Empreendedores_2026.html",
    },
  ];

  for (const d of destinos) {
    mkdirSync(d.pasta, { recursive: true });
    const caminho = resolve(d.pasta, d.arquivo);
    writeFileSync(caminho, html, "utf8");
    console.log(`  gravado em ${caminho}`);
  }

  const secoes = capitulos.reduce((n, c) => n + c.secoes.length, 0);
  const chars = capitulos.reduce(
    (n, c) => n + c.aberturaHtml.length + c.secoes.reduce((a, s) => a + s.html.length, 0),
    0,
  );
  console.log(
    `${capitulos.length} capítulos · ${secoes} seções · ${(chars / 1000).toFixed(1)}k caracteres`,
  );
  console.log(
    "\nPara o PDF: rode `node gerar_pdfs.js` na pasta do curso.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
