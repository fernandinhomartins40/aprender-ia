/**
 * Deriva `apps/web/src/app/slide-curso.css` do CSS do deck do curso.
 *
 * O visual do slide é do deck (`slides_base.css`), e a aplicação desenha o
 * mesmo slide — no projetor e no celular. Copiar à mão criaria duas verdades
 * que divergem na primeira mudança de cor; este script mantém uma só.
 *
 * Uso:
 *   node scripts/derivar-css-slide.mjs ../cursos/Curso_IA_Educadores_v2/slides_base.css
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origem = process.argv[2];
if (!origem) {
  console.error("uso: node scripts/derivar-css-slide.mjs <slides_base.css>");
  process.exit(1);
}

let css = readFileSync(origem, "utf8");

// Comentários saem primeiro: um deles precede o `:root` e atrapalharia a
// leitura dos seletores abaixo.
css = css.replace(/\/\*(?:[^*]|\*(?!\/))*\*\//g, "");

// O que governava a PÁGINA, e que agora é responsabilidade do React.
for (const re of [
  /@import url\([^)]*\);/g,
  /\*\{box-sizing:border-box;margin:0;padding:0\}/g,
  /html,body\{[^}]*\}/g,
  /body\{display:flex[^}]*\}/g,
  /\.deck-outer\{[^}]*\}/g,
  /\.deck-wrapper\{[^}]*\}/g,
  /\.progress-bar\{[^}]*\}/g,
  /\.controls\{position:fixed[^}]*\}/g,
]) css = css.replace(re, "");

// Aqui o slide não é impresso: o PDF continua saindo do deck.
css = css.replace(/@media print\{(?:[^{}]|\{[^{}]*\})*\}/g, "");

const ESCOPO = ".palco-slide";
const escopar = (sel) =>
  sel
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) =>
      s === ":root"
        ? ESCOPO
        : s.startsWith("#prompt-modal")
          ? s.replace("#prompt-modal", `${ESCOPO}-modal`)
          : `${ESCOPO} ${s}`,
    )
    .join(",");

const saida = [];
let i = 0;
while (i < css.length) {
  const a = css.indexOf("{", i);
  if (a === -1) break;
  const sel = css.slice(i, a);

  // @keyframes e @media levam o bloco inteiro, sem escopar o seletor externo.
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

const modoPagina = `
/* =========================================================
   O MESMO SLIDE, COMO PÁGINA

   O professor projeta o slide 16:9; o aluno acompanha o MESMO conteúdo, com o
   MESMO visual, mas como página que flui na tela dele. Não é o slide
   encolhido: num celular, 1280x720 reduzido corta as bordas e põe o texto em
   4px.

   Por isso aqui não há um segundo desenho. É o mesmo HTML e o mesmo CSS: o que
   este bloco faz é soltar as doze regras que prendiam o conteúdo a uma folha
   de 1280x720 — posição absoluta, altura fixa, largura em pixels. Cores,
   cards, grades, boxes, prompts e botões continuam vindo das regras acima,
   então mudar uma cor no deck muda nos dois lugares.
   ========================================================= */
.palco-pagina {
  /* Solta as medidas do palco: .palco-slide fixa 1280x720, e herdar a
     altura cortava o conteúdo que passasse disso — que é a maioria dos
     slides, uma vez desempilhados numa coluna só. */
  width: 100%;
  height: auto;
  min-height: 0;
  background: #FCFCFE;
  transform: none;
}
.palco-pagina .slide,
.palco-pagina .slide.active {
  position: static;
  display: block;
  overflow: visible;
  min-height: 0;
}

/* A faixa colorida do topo atravessa a largura da tela, em vez dos 1280px. */
.palco-pagina .topo {
  position: static;
  width: 100%;
  height: 6px;
}

/* Badge, título e corpo deixam de ser posicionados e viram o fluxo normal da
   página, com o respiro que o palco criava com coordenadas. */
.palco-pagina .badge {
  position: static;
  margin: 1.25rem 1.25rem 0;
}
.palco-pagina h1.st {
  position: static;
  width: auto;
  margin: 0.75rem 1.25rem 0;
  font-size: clamp(1.5rem, 5.5vw, 2.25rem);
  line-height: 1.2;
}
.palco-pagina .corpo,
.palco-pagina .corpo.alto {
  position: static;
  width: auto;
  height: auto;
  margin: 1.25rem;
  gap: 1rem;
  justify-content: flex-start;
}
/* No palco os cartões centralizavam o texto para preencher uma altura fixa.
   Numa página, a altura é a do conteúdo. */
.palco-pagina .corpo .card:not([style*="display:flex"]) {
  display: block;
}

/* Os slides que ocupavam a tela inteira — capa, divisórias entre encontros e
   os de atividade — viram blocos com respiro em cima e embaixo. */
.palco-pagina .capa,
.palco-pagina .divisor,
.palco-pagina .sl-aquec,
.palco-pagina .sl-caso,
.palco-pagina .sl-crono,
.palco-pagina .sl-duelo,
.palco-pagina .sl-caca,
.palco-pagina .sl-saida {
  position: static;
  padding: 2rem 1.25rem;
  min-height: 0;
}
.palco-pagina .sl-duelo .lado {
  height: auto;
}

/* A figura era um cartão flutuante no canto do slide; na página ela entra no
   fluxo, centralizada, num tamanho que se lê. */
.palco-pagina .fig-slide {
  position: static;
  width: min(22rem, 100%);
  margin: 1.25rem auto 0;
}
.palco-pagina .slide.com-fig .corpo {
  width: auto;
}

/* A barra de atalhos das IAs flutuava sobre o rodapé do palco. */
.palco-pagina .ia-barra {
  position: static;
  margin: 1rem 1.25rem;
}
.palco-pagina .slide.com-ia .corpo,
.palco-pagina .slide.com-ia .corpo.alto,
.palco-pagina .slide.com-acoes .corpo,
.palco-pagina .slide.com-acoes .corpo.alto {
  height: auto;
}

/* Os slides de capa e divisória trazem tamanhos ESCRITOS NO PRÓPRIO HTML
   (font-size:56px), pensados para o telão. Num celular isso estoura a
   largura, e por serem inline só um !important os alcança. O tamanho passa a
   acompanhar a largura da tela, com o mesmo teto do deck. */
.palco-pagina .capa h1,
.palco-pagina .capa > h1 {
  font-size: clamp(1.75rem, 8vw, 3.5rem) !important;
}
.palco-pagina .capa > div[style*="font-size:60px"] {
  font-size: clamp(2.5rem, 12vw, 3.75rem) !important;
}
.palco-pagina .capa p,
.palco-pagina .capa span {
  font-size: clamp(0.85rem, 3.4vw, 1.3rem) !important;
}
.palco-pagina .capa,
.palco-pagina .divisor {
  padding: 2.5rem 1.25rem;
}
/* O título é a peça mais longa: sem isso, "Educadores" sai pela borda. */
.palco-pagina .capa h1,
.palco-pagina .divisor h2,
.palco-pagina h1.st {
  overflow-wrap: break-word;
  hyphens: auto;
}

/* Tipografia: no projetor o texto é lido a metros de distância e o palco é
   grande; na mão, a escala é outra. */
.palco-pagina .lead {
  font-size: 1.05rem;
  line-height: 1.6;
}
.palco-pagina .divisor h2,
.palco-pagina .sl-aquec h2,
.palco-pagina .sl-caso h2,
.palco-pagina .sl-crono h2,
.palco-pagina .sl-saida h2 {
  font-size: clamp(1.4rem, 5vw, 2rem);
  line-height: 1.25;
}
.palco-pagina .sl-crono .num {
  font-size: clamp(4rem, 22vw, 9rem);
}
/* Os botões do cronômetro eram dimensionados para serem vistos do fundo da
   sala; na mão, precisam apenas ser confortáveis para o polegar. */
.palco-pagina .crono-btns button {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
}
.palco-pagina .crono-btns {
  margin: 1.25rem 0 0.25rem;
}
.palco-pagina .prompt {
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}
.palco-pagina img {
  max-width: 100%;
  height: auto;
}

/* Tabela é a única coisa do material que não cabe num celular: rola dentro da
   própria caixa, em vez de empurrar a página inteira para o lado.

   O min-width:0 é o que faz a caixa realmente encolher. Ela é filha de um
   flex (.corpo), e um item de flex tem largura mínima automática igual ao
   conteúdo — então, sem isso, a caixa cresce até a largura da tabela e é a
   página que rola, que é justamente o que se queria evitar. */
.palco-pagina .tabela-rolavel {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  min-width: 0;
}
.palco-pagina .tabela-rolavel table {
  min-width: 32rem;
}
/* Mesma razão, para qualquer filho do corpo: um prompt longo ou um cartão com
   uma palavra grande não pode esticar a coluna inteira. */
.palco-pagina .corpo > *,
.palco-pagina .col > * {
  min-width: 0;
}

/* Celular: as grades de duas, três e quatro colunas viram uma. Quatro cartões
   lado a lado numa tela de 6 polegadas dariam 80px cada. */
@media (max-width: 40rem) {
  .palco-pagina .grid2,
  .palco-pagina .grid3,
  .palco-pagina .grid4,
  .palco-pagina .sl-duelo .lado {
    grid-template-columns: 1fr;
    display: grid;
  }
  .palco-pagina .col {
    height: auto;
  }
  .palco-pagina .card {
    padding: 1rem;
  }
}
/* Telas médias: quatro colunas ainda são demais, duas cabem bem. */
@media (min-width: 40.0625rem) and (max-width: 60rem) {
  .palco-pagina .grid4 {
    grid-template-columns: 1fr 1fr;
  }
}
`;

const cabecalho = `/* =========================================================
   O SLIDE DO CURSO, DENTRO DA APLICAÇÃO

   ARQUIVO DERIVADO de \`cursos/Curso_IA_Educadores_v2/slides_base.css\`,
   o visual do deck aberto pelo \`Iniciar_Apresentacao.vbs\`. Projetor e
   celular desenham o mesmo slide, com este CSS.

   Não edite à mão. Regere com:
     node scripts/derivar-css-slide.mjs <caminho-do-slides_base.css>

   O que o script muda, e só isto:

   1. Tudo passa a viver sob \`.palco-slide\`. O deck era um documento
      inteiro e podia usar \`.card\`, \`.badge\`, \`table\` no escopo
      global; aqui isso colidiria com a plataforma.
   2. As regras que governavam a PÁGINA (\`html\`, \`body\`,
      \`.deck-outer\`, a barra de progresso e a de controles) saem: quem
      posiciona o palco é o React, que serve o mesmo slide a um projetor
      16:9 e a um celular em pé.
   3. Os blocos \`@media print\` saem: aqui o slide não é impresso — o
      PDF continua saindo do deck.

   Fora isso as medidas são as do deck, porque o palco continua sendo
   1280x720 escalado.
   ========================================================= */

`;

const palco = `
/* ---- o palco ----
   O slide tem 1280x720 fixos, herdados do deck, e é escalado para caber no
   espaço disponível. A caixa é quem mede: no projetor ela é a tela inteira,
   no celular é o que sobra acima dos controles. Um só desenho serve aos dois.

   \`overflow:hidden\` porque o palco sempre ocupa 1280x720 antes do \`scale()\`;
   sem isso a página inteira ganharia barras de rolagem em telas pequenas. */
.palco-caixa {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
/* Tela estreita: o slide preenche a largura e o que passar da altura vira
   rolagem vertical. scale() não muda o espaço que o elemento ocupa no
   fluxo, então o palco ganha aqui a altura que de fato tem depois da escala
   — sem isso, a caixa acharia que ele tem 720px e cortaria o resto. */
.palco-caixa--rolando {
  align-items: flex-start;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
.palco-caixa--rolando .palco-slide {
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
}
/* A caixa nunca é mais alta que o slide que carrega: sem isto, num celular ela
   esticaria até o fim do espaço e sobraria uma faixa escura embaixo do slide. */
.palco-caixa--rolando {
  max-height: var(--altura-slide, 100%);
}
.palco-slide {
  position: relative;
  width: 1280px;
  height: 720px;
  flex: none;
  transform-origin: center center;
  background: #FCFCFE;
  font-family: var(--corpo);
  color: var(--tinta);
  line-height: 1.6;
}
/* Dentro do palco, todo slide aparece: quem escolhe qual mostrar é o React,
   que monta um de cada vez. No deck as 96 divs coexistiam e \`.active\` decidia. */
.palco-slide .slide,
.palco-slide .slide.active {
  display: block;
}
/* O reset que o deck fazia no documento inteiro, aqui restrito ao palco: a
   plataforma tem suas próprias margens e não pode perdê-las. */
.palco-slide *,
.palco-slide *::before,
.palco-slide *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
`;

const destino = resolve(raiz, "apps/web/src/app/slide-curso.css");
writeFileSync(destino, cabecalho + saida.join("") + palco + modoPagina, "utf8");
console.log(`gravado em ${destino}`);
