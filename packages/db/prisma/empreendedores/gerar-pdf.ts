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

const ESTILO = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11.5pt; line-height: 1.55; color: #1a1a2e;
    max-width: 780px; margin: 0 auto; padding: 24px;
  }
  h1 { font-family: system-ui, sans-serif; font-size: 26pt; margin: 0 0 4px; }
  h2 {
    font-family: system-ui, sans-serif; font-size: 16pt;
    margin: 28px 0 8px; padding-bottom: 5px;
    border-bottom: 2px solid #6366F1; break-after: avoid;
  }
  h3 {
    font-family: system-ui, sans-serif; font-size: 12.5pt;
    margin: 18px 0 6px; color: #4338CA; break-after: avoid;
  }
  p { margin: 0 0 10px; }
  ul, ol { margin: 0 0 12px; padding-left: 22px; }
  li { margin-bottom: 5px; }
  strong { color: #111; }
  .capa { text-align: center; padding: 60px 0 40px; break-after: page; }
  .capa .sub { font-size: 13pt; color: #555; margin-top: 8px; }
  .capa .nota {
    margin-top: 40px; font-size: 10pt; color: #666;
    border-top: 1px solid #ddd; padding-top: 16px;
  }
  .sumario { break-after: page; }
  .sumario li { font-family: system-ui, sans-serif; font-size: 11pt; }
  .cap { break-before: page; }
  .abertura { color: #444; font-style: italic; }
  .rodape {
    margin-top: 40px; padding-top: 14px; border-top: 1px solid #ddd;
    font-size: 9.5pt; color: #666;
  }
  /* Na tela, um aviso de como salvar em PDF; no papel, ele some. */
  .como-imprimir {
    background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 8px;
    padding: 14px; font-family: system-ui, sans-serif; font-size: 10pt;
    margin-bottom: 24px;
  }
  @media print { .como-imprimir { display: none; } }
`;

async function main() {
  const curso = await prisma.course.findUnique({
    where: { slug: "ia-para-empreendedores" },
    select: { id: true, titulo: true, subtitulo: true, descricao: true },
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

  const sumario = capitulos
    .map(
      (c) =>
        `<li>${c.numero ? `${c.numero}. ` : ""}${c.titulo}${
          c.secoes.length
            ? `<ul>${c.secoes.map((s) => `<li>${s.numero} ${s.titulo}</li>`).join("")}</ul>`
            : ""
        }</li>`,
    )
    .join("");

  const corpo = capitulos
    .map(
      (c) => `
    <section class="cap">
      <h2>${c.icone ? `${c.icone} ` : ""}${c.numero ? `${c.numero}. ` : ""}${c.titulo}</h2>
      ${c.aberturaHtml ? `<div class="abertura">${c.aberturaHtml}</div>` : ""}
      ${c.secoes
        .map((s) => `<h3>${s.numero} ${s.titulo}</h3>${s.html}`)
        .join("\n")}
    </section>`,
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${curso.titulo} — Apostila</title>
<style>${ESTILO}</style>
</head>
<body>

<div class="como-imprimir">
  <strong>Para salvar em PDF:</strong> use Imprimir no seu navegador
  (Ctrl+P) e escolha "Salvar como PDF". Este aviso não sai na impressão.
</div>

<div class="capa">
  <h1>${curso.titulo}</h1>
  <p class="sub">${curso.subtitulo ?? ""}</p>
  <p class="nota">
    Material de consulta · gerado em ${hoje}<br>
    As aulas não repetem esta apostila: elas explicam, demonstram e fazem
    produzir. Isto aqui é onde se procura a referência depois.
  </p>
</div>

<section class="sumario">
  <h2>Sumário</h2>
  <ol>${sumario}</ol>
</section>

${corpo}

<p class="rodape">
  Os limites e planos das ferramentas foram conferidos na documentação
  oficial na data indicada em cada item. Ferramentas de IA mudam rápido:
  confirme antes de decidir assinar.
</p>

</body>
</html>`;

  const destino = resolve(
    import.meta.dirname,
    "../../../../apps/web/public/curso",
  );
  mkdirSync(destino, { recursive: true });
  const arquivo = resolve(destino, "Apostila_IA_Empreendedores_2026.html");
  writeFileSync(arquivo, html, "utf8");

  const secoes = capitulos.reduce((n, c) => n + c.secoes.length, 0);
  console.log(`${capitulos.length} capítulos · ${secoes} seções`);
  console.log(`gravado em ${arquivo}`);
  console.log(
    "\nPara o PDF: abra no navegador e salve como PDF, ou rode o script de PDF da pasta cursos/.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
