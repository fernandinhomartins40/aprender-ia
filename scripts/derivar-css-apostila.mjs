/**
 * Deriva `apps/web/src/app/apostila-curso.css` do CSS da apostila do curso.
 *
 * A apostila foi desenhada para virar PDF A4: mede em `pt`, quebra em páginas
 * e supõe uma folha de 21cm. Na tela do aluno nada disso serve — um celular
 * não tem 21cm, e 10.6pt de corpo fica miúdo. Este script traduz o material
 * para a web sem criar uma segunda folha de estilo para manter em dia.
 *
 * Uso:
 *   node scripts/derivar-css-apostila.mjs \
 *     ../cursos/Curso_IA_Educadores_v2/estilo.css \
 *     ../cursos/Curso_IA_Educadores_v2/componentes_novos.css \
 *     ../cursos/Curso_IA_Educadores_v2/componentes_ferramentas.css
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origens = process.argv.slice(2);
if (!origens.length) {
  console.error("uso: node scripts/derivar-css-apostila.mjs <css...>");
  process.exit(1);
}

let css = origens.map((f) => readFileSync(f, "utf8")).join("\n");

// Comentários saem primeiro: um deles precede o `:root` e atrapalharia a
// leitura dos seletores abaixo.
css = css.replace(/\/\*(?:[^*]|\*(?!\/))*\*\//g, "");

// As fontes já são as da plataforma; o @import repetido só atrasa a página.
css = css.replace(/@import url\([^)]*\);/g, "");

// O que existia por causa do papel.
css = css.replace(/@page\s*\{[^}]*\}/g, "");
css = css.replace(/@media print\{(?:[^{}]|\{[^{}]*\})*\}/g, "");

// `pt` é medida de impressão. Na tela vira `rem`, tomando 10.6pt — o corpo da
// apostila — como 1rem: o texto passa a acompanhar o tamanho de fonte que a
// pessoa escolheu no próprio aparelho, que é o que importa para quem lê no
// celular e para quem precisa de letra maior.
const BASE_PT = 10.6;
css = css.replace(/([\d.]+)pt\b/g, (_, n) => {
  const rem = Number(n) / BASE_PT;
  return `${Number(rem.toFixed(3))}rem`;
});

const ESCOPO = ".apostila-curso";
const escopar = (sel) =>
  sel
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (s === ":root") return ESCOPO;
      // `body` e `html` governavam a página inteira; aqui valem para o bloco.
      if (s === "body" || s === "html" || s === "html,body") return ESCOPO;
      return `${ESCOPO} ${s}`;
    })
    .join(",");

const saida = [];
let i = 0;
while (i < css.length) {
  const a = css.indexOf("{", i);
  if (a === -1) break;
  const sel = css.slice(i, a);

  if (sel.trim().startsWith("@")) {
    let prof = 0;
    let j = a;
    for (; j < css.length; j++) {
      if (css[j] === "{") prof++;
      else if (css[j] === "}" && --prof === 0) break;
    }
    saida.push(`${sel.trim()}${css.slice(a, j + 1)}\n`);
    i = j + 1;
    continue;
  }

  const b = css.indexOf("}", a);
  if (sel.trim()) saida.push(`${escopar(sel)}${css.slice(a, b + 1)}\n`);
  i = b + 1;
}

// O que a tela precisa e o papel não pedia.
const tela = `
/* ---- a apostila na tela ----
   O que muda em relação ao papel, e por quê. */
.apostila-curso {
  max-width: 44rem;
  margin: 0 auto;
  font-family: var(--corpo);
  color: var(--tinta);
  line-height: 1.7;
  overflow-wrap: break-word;
}
/* Tabelas e prompts são as duas coisas que estouram a largura num celular.
   A tabela rola sozinha dentro da própria caixa, em vez de empurrar a página
   inteira para o lado; o prompt quebra a linha em vez de rolar. */
.apostila-curso .tabela-rolavel {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1rem 0;
}
.apostila-curso table {
  min-width: 34rem;
}
.apostila-curso .prompt {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.apostila-curso img {
  max-width: 100%;
  height: auto;
}
/* As quebras de página não significam nada aqui; viram um respiro. */
.apostila-curso .quebra {
  height: 0;
  margin: 1.5rem 0;
}
/* A faixa que no PDF anunciava o encontro da página vira um rótulo discreto. */
.apostila-curso .faixa-encontro {
  margin: 1.5rem 0 0.75rem;
}
@media (max-width: 40rem) {
  .apostila-curso {
    font-size: 1.05rem;
  }
  /* No celular, layouts de duas colunas viram uma só: 42% de 21cm ainda cabia
     na folha, mas não numa tela de 6 polegadas. */
  .apostila-curso .duas-colunas,
  .apostila-curso .grid2,
  .apostila-curso .grid3 {
    display: block;
  }
  .apostila-curso .duas-colunas > * + * {
    margin-top: 1rem;
  }
}
`;

const cabecalho = `/* =========================================================
   A APOSTILA DO CURSO, NA TELA

   ARQUIVO DERIVADO de \`cursos/Curso_IA_Educadores_v2/estilo.css\` e
   companheiros — o visual da apostila que vira PDF.

   Não edite à mão. Regere com:
     node scripts/derivar-css-apostila.mjs <estilo.css> <componentes...>

   O que o script muda, e só isto:

   1. Tudo passa a viver sob \`.apostila-curso\`, para não colidir com a
      plataforma (a apostila usava \`table\`, \`.card\`, \`.prompt\` no
      escopo global).
   2. As medidas em \`pt\` viram \`rem\`, com o corpo da apostila (10.6pt)
      valendo 1rem: o texto passa a acompanhar o tamanho de fonte do
      aparelho, que é o que importa para quem lê no celular.
   3. O que existia por causa do papel sai: \`@page\`, os blocos
      \`@media print\` e as regras de \`html\`/\`body\`.
   4. Entra o que a tela pede e a folha não pedia: tabela que rola sozinha,
      prompt que quebra linha, imagem que não estoura a largura e duas
      colunas que viram uma no celular.
   ========================================================= */

`;

const destino = resolve(raiz, "apps/web/src/app/apostila-curso.css");
writeFileSync(destino, cabecalho + saida.join("") + tela, "utf8");
console.log(`gravado em ${destino}`);
