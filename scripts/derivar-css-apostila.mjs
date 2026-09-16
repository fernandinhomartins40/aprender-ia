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
.apostila-curso .prompt {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
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

/* ---- ilustrações ----
   Na folha A4 uma figura a 52% da largura ainda tinha 9cm e se via bem. Numa
   tela de celular os mesmos 52% davam 161px: a legenda ficava maior que o
   desenho. Aqui a ilustração ocupa a largura do texto, com um teto para não
   virar um cartaz no computador.

   A classe .metade entra na lista de propósito: ela é a que trazia os 52%, e
   tem duas classes — sem citá-la, venceria por especificidade. */
.apostila-curso .figura,
.apostila-curso .figura-img,
.apostila-curso .figura-img.metade {
  width: 100%;
  max-width: 34rem;
  margin-left: auto;
  margin-right: auto;
}
.apostila-curso .figura img,
.apostila-curso .figura-img img {
  width: 100%;
  height: auto;
}
.apostila-curso img {
  max-width: 100%;
  height: auto;
}

/* ---- tabelas ----
   Uma tabela de 3 ou 4 colunas não cabe em 390px sem virar coluna de uma
   palavra. No papel isso não era problema; aqui, empurrar a barra de rolagem
   para o leitor é transferir a ele um problema de layout.

   Então em tela estreita a tabela deixa de ser tabela: cada linha vira um
   cartão, e cada célula ganha o rótulo da coluna ao lado. O conteúdo é o
   mesmo, na ordem em que foi escrito, e nada rola para o lado. */
.apostila-curso table {
  width: 100%;
  table-layout: auto;
}
.apostila-curso td,
.apostila-curso th {
  overflow-wrap: anywhere;
}
@media (max-width: 48rem) {
  .apostila-curso .tabela-rolavel {
    overflow: visible;
  }
  .apostila-curso table,
  .apostila-curso thead,
  .apostila-curso tbody,
  .apostila-curso tr,
  .apostila-curso td {
    display: block;
    width: auto;
  }
  /* O cabeçalho some da tela, mas continua no documento: é dele que saem os
     rótulos abaixo, e é ele que um leitor de tela anuncia. */
  .apostila-curso thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  .apostila-curso tbody tr {
    border: 1px solid var(--borda);
    border-radius: 12px;
    padding: 0.35rem 0.9rem;
    margin-bottom: 0.85rem;
    background: #fff;
  }
  .apostila-curso tbody tr:nth-child(even) {
    background: #FCFCFE;
  }
  .apostila-curso tbody td {
    border: none;
    border-bottom: 1px solid var(--borda);
    padding: 0.6rem 0;
  }
  .apostila-curso tbody td:last-child {
    border-bottom: none;
  }
  /* O rótulo da coluna, escrito pelo componente em \`data-coluna\`. Sem ele a
     segunda célula de um cartão seria um texto solto sem dizer do que trata. */
  .apostila-curso tbody td[data-coluna]::before {
    content: attr(data-coluna);
    display: block;
    margin-bottom: 0.15rem;
    font-family: var(--titulo);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--indigo-dark);
  }
  /* A primeira coluna costuma ser o nome da linha — a ferramenta, o termo — e
     é o título do cartão. */
  .apostila-curso tbody td:first-child {
    font-family: var(--titulo);
    font-weight: 700;
    font-size: 1.02rem;
    color: var(--tinta);
  }
}
/* Da largura de um tablet para cima a tabela volta a ser tabela, e aí sim pode
   rolar se for muito larga — mas nessa largura raramente é. */
@media (min-width: 48.0625rem) {
  .apostila-curso .tabela-rolavel {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 1rem 0;
  }
  /* Sem um piso, o navegador estreitava a coluna do meio a ponto de quebrar
     "Adaptação" no meio da palavra para caber. */
  .apostila-curso td,
  .apostila-curso th {
    min-width: 6rem;
  }
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
  /* A figura ao lado do texto passa a vir acima dele: 38% de uma tela estreita
     não mostra ilustração nenhuma. */
  .apostila-curso .img-texto {
    display: block;
  }
  .apostila-curso .img-texto > .lado-img {
    margin-bottom: 0.85rem;
  }
  /* A ficha de cada ferramenta tem uma grade de quatro colunas — Envia,
     Devolve, Limite, Método. Em 390px cada uma teria menos de 90px, e a que
     sobrava saía da tela. Duas colunas cabem e continuam comparáveis lado a
     lado, que é a razão de ser da grade. */
  .apostila-curso .ficha-ia-grade {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  /* 1fr tem mínimo automático igual ao conteúdo: uma célula com texto longo
     empurrava a vizinha para 88px e saía da ficha. minmax(0,...) deixa a
     coluna encolher, e a palavra quebra em vez de esticar a grade. */
  .apostila-curso .ficha-ia-grade > * {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  /* Os selos eram etiquetas curtas na folha ("Gratuito", "Cota") e nasceram
     com nowrap. Alguns cresceram — "Troca para modelo fraco" tem 200px — e um
     nowrap numa coluna de 130px sai pela borda. Aqui eles quebram linha. */
  .apostila-curso .selo,
  .apostila-curso .tempo,
  .apostila-curso .caso .tempo {
    white-space: normal;
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
