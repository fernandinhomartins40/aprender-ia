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
writeFileSync(destino, cabecalho + saida.join("") + palco, "utf8");
console.log(`gravado em ${destino}`);
