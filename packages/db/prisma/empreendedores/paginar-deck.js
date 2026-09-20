/**
 * Quebra em dois (ou mais) os slides cujo conteúdo não cabe no palco.
 *
 * Por que um passo separado, e não no gerador: o gerador monta texto, e
 * texto não tem altura. Só o navegador sabe que um card de cinco itens
 * ocupa 180px com a fonte do deck na largura do palco. Medir aqui é a
 * única forma de quebrar pelo que de fato transborda, em vez de chutar
 * um limite de caracteres — que erraria nos dois sentidos, cortando
 * slides que cabiam e deixando passar outros que não.
 *
 * A quebra é pelos filhos diretos do `.corpo`: cada card, grade ou
 * bloco vai inteiro para um lado ou para o outro. Nunca se parte um card
 * ao meio, porque metade de um card não é conteúdo, é defeito.
 *
 * O slide continuado repete o título com "(continua)", como a Caça ao
 * Erro já fazia com pergunta e resposta.
 *
 * Uso (depois de gerar o deck):
 *   node paginar-deck.js <caminho do html>
 *
 * Precisa do Puppeteer, que mora em `cursos/IA Professores/node_modules`.
 */
const { writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

// O Puppeteer não é dependência deste pacote: ele mora na pasta do curso
// de Educadores, que é de onde os PDFs sempre foram gerados. `require`
// procura a partir deste arquivo, então o caminho é dito explicitamente
// — assim o script funciona tanto chamado pelo gerador quanto à mão.
const puppeteer = (() => {
  try {
    return require("puppeteer");
  } catch {
    return require(
      resolve(
        __dirname,
        "../../../../../cursos/IA Professores/node_modules/puppeteer",
      ),
    );
  }
})();

/** Folga sobre a altura do palco; abaixo disto não vale quebrar. */
const TOLERANCIA = 8;

async function main() {
  const caminho = process.argv[2];
  if (!caminho) {
    console.error("uso: node paginar-deck.js <arquivo.html>");
    process.exit(1);
  }

  const navegador = await puppeteer.launch({ args: ["--no-sandbox"] });
  const pagina = await navegador.newPage();
  // A mesma medida do palco do deck. Um slide que cabe aqui cabe na
  // projeção, que é sempre igual ou maior.
  await pagina.setViewport({ width: 1440, height: 900 });
  await pagina.goto("file:///" + caminho.replace(/\\/g, "/"), {
    waitUntil: "networkidle0",
  });

  // O runtime monta os botões de cada prompt depois do carregamento, e
  // eles ocupam cerca de 80px. Medir antes disso subestima a altura
  // justamente nos slides com prompt — que são os mais cheios.
  await pagina.waitForFunction(
    () =>
      !document.querySelector(".prompt-acoes") ||
      document.querySelector(".prompt-acoes")?.children.length > 0,
    { timeout: 10000 },
  );

  // Quebrar muda alturas: o slide continuado pode transbordar por sua
  // vez, e um card que estava numa grade de dois ocupa outra altura
  // sozinho. Por isso se repete até ninguém mais transbordar. O teto de
  // 6 existe só para não girar para sempre se algum conteúdo for
  // grande demais para caber em slide nenhum.
  let resultado;
  for (let passada = 1; passada <= 6; passada++) {
    resultado = await medirEQuebrar(pagina, TOLERANCIA);
    console.log(
      `  passada ${passada}: ${resultado.quebrados} quebrados · ${resultado.total} slides`,
    );
    if (!resultado.quebrados) break;
  }

  // O `outerHTML` traz as quebras — e também tudo o que o runtime montou
  // ao abrir a página: os botões de cada prompt, os campos preenchíveis,
  // a classe `active`. Salvar isso faria o runtime montar de novo por
  // cima na próxima abertura, com os botões em dobro. Então se desfaz
  // primeiro, devolvendo o `.prompt` e o `.prompt-acoes` ao estado em
  // que o gerador os escreveu.
  const html = await pagina.evaluate(() => {
    for (const cx of document.querySelectorAll(".prompt-acoes")) {
      cx.textContent = "";
      cx.classList.remove("tem-campos");
    }
    // O prompt vira campos editáveis; o texto original está guardado no
    // `.prompt-acoes` ao lado, que é de onde o runtime parte.
    for (const cx of document.querySelectorAll(".prompt-acoes")) {
      const p = cx.previousElementSibling;
      if (p && p.classList.contains("prompt") && cx.dataset.promptTxt) {
        p.textContent = cx.dataset.promptTxt;
      }
    }
    const slides = document.querySelectorAll(".slide");
    slides.forEach((s) => s.classList.remove("active"));
    slides[0]?.classList.add("active");
    return "<!doctype html>\n" + document.documentElement.outerHTML;
  });
  writeFileSync(caminho, html, "utf8");
  await navegador.close();

  console.log(`  ${resultado.total} slides no total`);
  if (resultado.teimosos.length) {
    console.log(
      `  ${resultado.teimosos.length} continuam altos e têm um bloco só (rever o texto):`,
    );
    for (const t of resultado.teimosos) console.log(`    - ${t}`);
  }
}

/** Uma passada: mede cada slide e quebra o que não couber. */
async function medirEQuebrar(pagina, TOLERANCIA) {
  return await pagina.evaluate((tolerancia) => {
    const slides = [...document.querySelectorAll(".slide")];
    let quebrados = 0;
    let criados = 0;
    const teimosos = [];

    for (const slide of slides) {
      const corpo = slide.querySelector(".corpo, .corpo.alto");
      if (!corpo) continue;

      // Só o slide visível tem altura; o deck esconde os outros.
      slides.forEach((s) => s.classList.remove("active"));
      slide.classList.add("active");

      if (slide.scrollHeight - slide.clientHeight <= tolerancia) continue;

      let filhos = [...corpo.children];

      // Um filho só que é uma grade: os cards dentro dela é que são as
      // unidades. É o caso do ANTES_DEPOIS, cujo corpo inteiro é um
      // `grid2` — visto de fora, um bloco indivisível; por dentro, dois
      // cards que cabem um por slide.
      //
      // Cada card ganha a sua própria grade, de uma coluna. Tirá-los da
      // grade resolveria a altura, mas o lado a lado é justamente o que
      // um "antes e depois" mostra — e aqui ele se perde de qualquer
      // forma, já que os dois lados vão para slides diferentes.
      if (filhos.length === 1 && /\bgrid[234]\b/.test(filhos[0].className)) {
        const grade = filhos[0];
        const netos = [...grade.children];
        if (netos.length > 1) {
          for (const neto of netos) {
            const sozinho = document.createElement("div");
            sozinho.className = grade.className.replace(/\bgrid[234]\b/, "grid1");
            sozinho.appendChild(neto);
            corpo.insertBefore(sozinho, grade);
          }
          grade.remove();
          filhos = [...corpo.children];
        }
      }

      if (filhos.length < 2) {
        // Um bloco só, alto demais: não há por onde cortar sem partir o
        // conteúdo ao meio. Fica registrado para eu ver caso a caso.
        teimosos.push(slide.dataset.title || "(sem título)");
        continue;
      }

      // Acha o maior prefixo que ainda cabe: esconde um filho de cada
      // vez, do fim para o começo, até o slide parar de transbordar.
      let corte = filhos.length;
      while (corte > 1) {
        corte--;
        filhos.forEach((f, i) => {
          f.style.display = i < corte ? "" : "none";
        });
        if (slide.scrollHeight - slide.clientHeight <= tolerancia) break;
      }

      // Esse é o corte máximo, não o melhor. Enchendo o primeiro slide
      // até a borda, o segundo fica com as sobras — um bloco solto numa
      // tela vazia. Então recua-se em direção à metade, enquanto o
      // primeiro continuar cabendo: dois slides equilibrados em vez de
      // um cheio e um quase vazio.
      const meio = Math.ceil(filhos.length / 2);
      while (corte > meio) {
        filhos.forEach((f, i) => {
          f.style.display = i < corte - 1 ? "" : "none";
        });
        if (slide.scrollHeight - slide.clientHeight > tolerancia) break;
        corte--;
      }

      filhos.forEach((f) => (f.style.display = ""));

      if (corte >= filhos.length) continue;

      // O que sobrou vai para um slide novo, logo depois deste.
      const novo = slide.cloneNode(false);
      novo.classList.remove("active");
      const titulo = slide.dataset.title || "";
      novo.dataset.title = titulo + " (continua)";

      // Cabeçalho igual, para a turma saber que é o mesmo assunto: a
      // faixa de cor, o badge e o título, com a marca de continuação.
      for (const sel of [".topo", ".badge"]) {
        const el = slide.querySelector(sel);
        if (el) novo.appendChild(el.cloneNode(true));
      }
      const h = slide.querySelector("h1.st");
      if (h) {
        const h2 = h.cloneNode(true);
        h2.textContent = h.textContent + " (continua)";
        novo.appendChild(h2);
      }

      const corpoNovo = document.createElement("div");
      corpoNovo.className = corpo.className;
      filhos.slice(corte).forEach((f) => corpoNovo.appendChild(f));
      novo.appendChild(corpoNovo);

      // A barra "Abrir agora" acompanha os dois: quem está no segundo
      // slide precisa do mesmo atalho.
      const barra = slide.querySelector(".ia-barra");
      if (barra) novo.appendChild(barra.cloneNode(true));

      slide.after(novo);
      quebrados++;
      criados++;
    }

    slides.forEach((s) => s.classList.remove("active"));
    document.querySelector(".slide")?.classList.add("active");

    return {
      quebrados,
      criados,
      teimosos,
      total: document.querySelectorAll(".slide").length,
    };
  }, TOLERANCIA);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
