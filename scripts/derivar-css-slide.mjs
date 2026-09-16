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

// Os dois lugares onde o material do curso é desenhado: o palco 16:9 que o
// professor projeta e a página que o aluno lê. Cada regra do deck vale nos
// dois — é o que garante que sejam o mesmo visual, e não duas cópias que
// divergem na primeira mudança de cor.
const ESCOPO = ".palco-slide";
// O modal do banco de prompts é o terceiro lugar onde o material aparece: ele
// é montado fora do palco e fora da página (sobrepõe as duas), e sem entrar
// aqui os botões das IAs sairiam sem estilo nenhum.
const ESCOPOS = [ESCOPO, ".conteudo-aula", ".modal-prompt"];
const escopar = (sel) =>
  sel
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((s) => {
      if (s === ":root") return ESCOPOS;
      if (s.startsWith("#prompt-modal"))
        return [s.replace("#prompt-modal", `${ESCOPO}-modal`)];
      // `.slide`, `.palco-caixa` e afins só existem no palco: aplicá-los à
      // página traria de volta o posicionamento que ela justamente não tem.
      if (/^\.(slide|palco-|topo|badge|corpo)/.test(s)) return [`${ESCOPO} ${s}`];
      return ESCOPOS.map((e) => `${e} ${s}`);
    })
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

const paginaAula = `
/* =========================================================
   O CONTEÚDO DO CURSO, COMO PÁGINA WEB

   O professor projeta o slide 16:9; o aluno abre uma PÁGINA — com cabeçalho,
   seções empilhadas e leitura por rolagem. Não é o slide reduzido: é o mesmo
   material num continente diferente.

   As cores, os cards, os quadros e os prompts continuam vindo das regras do
   deck, acima. O que este bloco faz é dar a esse conteúdo a respiração de uma
   página: hierarquia clara, largura de leitura e espaço entre as seções.
   ========================================================= */

/* ---- cabeçalho da página ---- */
.conteudo-aula-cabecalho {
  margin-bottom: 1.75rem;
}
.etiqueta-aula {
  display: inline-block;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-family: var(--fonte-titulo);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff;
  background: #4F46E5;
}
.etiqueta-aula--laranja { background: #F97316; }
.etiqueta-aula--verde { background: #10B981; }
.etiqueta-aula--vermelho { background: #EF4444; }
.etiqueta-aula--amarelo { background: #EAB308; color: #3F2D00; }

.titulo-aula {
  margin-top: 0.75rem;
  font-family: var(--fonte-titulo);
  font-size: clamp(1.6rem, 5.5vw, 2.4rem);
  font-weight: 800;
  line-height: 1.2;
  color: var(--tinta);
  overflow-wrap: break-word;
}
.titulo-aula .lar { color: #F97316; }

/* ---- o corpo ---- */
.conteudo-aula {
  /* Os tokens do curso, para as regras do deck valerem aqui dentro: são elas
     que desenham cards, quadros e prompts. */
  --indigo: #4F46E5; --indigo-dark: #4338CA; --indigo-soft: #EEF0FE; --indigo-line: #DDE1FB;
  --laranja: #F97316; --laranja-soft: #FFF3E8;
  --verde: #10B981; --verde-dark: #047857; --verde-soft: #ECFDF5;
  --vermelho: #EF4444; --vermelho-dk: #B91C1C; --vermelho-sf: #FEF2F2;
  --amarelo: #EAB308; --amarelo-dk: #A16207; --amarelo-sf: #FEFCE8;
  --tinta: #1E293B; --tinta-clara: #475569; --cinza: #64748B; --borda: #E2E8F0;
  --prompt-bg: #151F38; --prompt-bg2: #1B2745; --prompt-txt: #E8EDF7;
  --titulo: var(--fonte-titulo); --corpo: var(--fonte-corpo); --mono: var(--fonte-mono);

  font-family: var(--fonte-corpo);
  color: var(--tinta);
  line-height: 1.7;
  font-size: 1.0625rem;
}

/* O espaço entre as seções é o que separa uma página de um slide: no palco o
   conteúdo era comprimido para caber numa folha; aqui ele respira. */
.conteudo-aula > * + * {
  margin-top: 1.75rem;
}
.conteudo-aula .grid2,
.conteudo-aula .grid3,
.conteudo-aula .grid4 {
  gap: 1rem;
}
.conteudo-aula .card {
  padding: 1.25rem;
  border-radius: 14px;
}
.conteudo-aula .card h4 {
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}
.conteudo-aula .card p,
.conteudo-aula li,
.conteudo-aula p {
  font-size: 1rem;
  line-height: 1.7;
}
.conteudo-aula .lead {
  font-size: 1.15rem;
  line-height: 1.65;
  color: var(--tinta-clara);
}

/* Os quadros do material — Traduzindo, Atenção, Dica, lilás — são as seções
   destacadas da página, e ganham o peso de um bloco próprio. */
.conteudo-aula .traduzindo,
.conteudo-aula .atencao,
.conteudo-aula .dica,
.conteudo-aula .lilas,
.conteudo-aula .oficina {
  padding: 1.25rem 1.4rem;
  border-radius: 14px;
}
.conteudo-aula .traduzindo .t,
.conteudo-aula .atencao .t,
.conteudo-aula .dica .t,
.conteudo-aula .lilas .t,
.conteudo-aula .oficina .t {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

/* O prompt é o que o aluno mais usa: precisa caber inteiro e ser tocável. */
.conteudo-aula .prompt {
  font-size: 0.9rem;
  padding: 1.1rem 1.2rem;
  border-radius: 12px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.conteudo-aula .prompt-acoes {
  margin-top: 0.75rem;
  gap: 0.5rem;
}
.conteudo-aula .ia-btn.mini,
.conteudo-aula .copiar-mini {
  font-size: 0.85rem;
  padding: 0.55rem 1rem;
}

/* Tabela é a única coisa do material que não cabe num celular: rola dentro da
   própria caixa, em vez de empurrar a página para o lado. */
.conteudo-aula .tabela-rolavel {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  min-width: 0;
}
.conteudo-aula .tabela-rolavel table {
  min-width: 32rem;
}

/* A figura era um cartão flutuante no canto do slide; na página ela é uma
   ilustração da seção. */
.conteudo-aula .fig-slide {
  position: static;
  width: 100%;
  max-width: 26rem;
  margin: 0 auto;
}
.conteudo-aula img {
  max-width: 100%;
  height: auto;
}

/* Checklist: alvo confortável para o dedo. */
.conteudo-aula .it.marcavel {
  padding: 0.7rem 0;
  font-size: 1.05rem;
}

/* ---- slides sem corpo: capas, divisórias e atividades ----
   Estes têm desenho próprio e chegam inteiros. Soltam as medidas do palco e
   viram uma seção de destaque da página, com cantos arredondados. */
.conteudo-aula--inteiro > .capa,
.conteudo-aula--inteiro > .divisor,
.conteudo-aula--inteiro > .sl-aquec,
.conteudo-aula--inteiro > .sl-caso,
.conteudo-aula--inteiro > .sl-crono,
.conteudo-aula--inteiro > .sl-duelo,
.conteudo-aula--inteiro > .sl-caca,
.conteudo-aula--inteiro > .sl-saida {
  position: static;
  inset: auto;
  min-height: 0;
  padding: 2.25rem 1.5rem;
  border-radius: 18px;
}

/* Os slides de atividade foram desenhados com folgas de folha: 70px de cada
   lado no caça ao erro, 90px no caso, 100px no duelo. Numa tela de 390px isso
   sobrava 210px para o texto — uma coluna de três palavras por linha. A regra
   acima já os reescreve, mas algumas folgas vêm em seletores mais específicos
   e precisam ser alcançadas uma a uma. */
.conteudo-aula.conteudo-aula--inteiro > .sl-caca,
.conteudo-aula.conteudo-aula--inteiro > .sl-duelo,
.conteudo-aula.conteudo-aula--inteiro > .sl-caso,
.conteudo-aula.conteudo-aula--inteiro > .sl-saida,
.conteudo-aula.conteudo-aula--inteiro > .sl-aquec,
.conteudo-aula.conteudo-aula--inteiro > .sl-crono,
.conteudo-aula.conteudo-aula--inteiro > .capa,
.conteudo-aula.conteudo-aula--inteiro > .divisor {
  /* !important porque as regras do deck entram numa camada do Tailwind que
     vence a cascata normal: mesmo mais específica e declarada depois, a regra
     daqui perdia para o padding de 70px da folha. */
  padding-left: 1.25rem !important;
  padding-right: 1.25rem !important;
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
}
/* As caixas internas dessas atividades: o retângulo branco do caça ao erro, a
   cena do caso, os dois lados do duelo. Todas com folga de folha por dentro. */
.conteudo-aula .sl-caca .resp,
.conteudo-aula .sl-caso .cena-sl,
.conteudo-aula .sl-duelo .box {
  padding: 1.1rem 1.2rem;
}
.conteudo-aula .sl-caca .resp,
.conteudo-aula .sl-caso .cena-sl {
  font-size: 1.05rem;
  line-height: 1.6;
}
/* O duelo compara dois prompts lado a lado. Numa tela estreita eles passam um
   sob o outro — é a mesma comparação, lida em sequência em vez de em
   paralelo. */
.conteudo-aula .sl-duelo .lado {
  gap: 1rem;
}
.conteudo-aula .sl-duelo .pr {
  font-size: 0.85rem;
  padding: 0.9rem 1rem;
  overflow-wrap: anywhere;
}
.conteudo-aula .sl-duelo .res {
  font-size: 0.95rem;
}
.conteudo-aula .sl-caca .desafio-txt,
.conteudo-aula .sl-caso .perg {
  font-size: 1.15rem;
  line-height: 1.35;
}
.conteudo-aula--inteiro .divisor h2,
.conteudo-aula--inteiro .sl-aquec h2,
.conteudo-aula--inteiro .sl-caso h2,
.conteudo-aula--inteiro .sl-crono h2,
.conteudo-aula--inteiro .sl-saida h2 {
  font-size: clamp(1.4rem, 5vw, 2rem);
  line-height: 1.25;
}
.conteudo-aula--inteiro .capa h1 {
  font-size: clamp(1.75rem, 7vw, 2.75rem) !important;
  line-height: 1.15;
}
.conteudo-aula--inteiro .capa p,
.conteudo-aula--inteiro .capa span {
  font-size: clamp(0.85rem, 3.2vw, 1.05rem) !important;
}
.conteudo-aula--inteiro .sl-crono .num {
  font-size: clamp(3.5rem, 18vw, 7rem);
}
.conteudo-aula--inteiro .crono-btns button {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
}
.conteudo-aula--inteiro .sl-duelo .lado {
  height: auto;
}

/* O campo do prompt é dimensionado em caracteres (o atributo size), medida que
   não conhece a largura da tela: num celular ele empurrava o resto da frase
   para a linha seguinte. O teto devolve o controle ao layout. */
.conteudo-aula .var-campo,
.modal-prompt .var-campo {
  max-width: 100%;
}
@media (max-width: 40rem) {
  .conteudo-aula .var-campo {
    max-width: 8.5rem;
  }
}


/* Celular: as grades viram uma coluna. Quatro cartões lado a lado numa tela de
   6 polegadas dariam 80px cada. */
@media (max-width: 40rem) {
  .conteudo-aula .grid2,
  .conteudo-aula .grid3,
  .conteudo-aula .grid4,
  .conteudo-aula .sl-duelo .lado,
  .conteudo-aula .duas-colunas {
    display: grid;
    grid-template-columns: 1fr;
  }
  .conteudo-aula .col {
    height: auto;
  }
}
/* Telas médias: quatro colunas ainda são demais, duas cabem bem. */
@media (min-width: 40.0625rem) and (max-width: 60rem) {
  .conteudo-aula .grid4 {
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
writeFileSync(destino, cabecalho + saida.join("") + palco + modoPagina + paginaAula, "utf8");
console.log(`gravado em ${destino}`);
