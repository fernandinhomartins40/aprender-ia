"use client";

import { useEffect, useRef, useState } from "react";
import { marcarItens } from "@/server/acoes-aula";

/**
 * O conteúdo de um passo, desenhado como PÁGINA WEB.
 *
 * O material do curso é o mesmo do slide que o professor projeta — os cards,
 * os quadros, os prompts, as tabelas. O que muda é o continente: no projetor
 * aquilo é uma folha 16:9 com tudo posicionado por coordenada; aqui é uma
 * página, com seções empilhadas, respiro entre elas e leitura por rolagem.
 *
 * Por isso o HTML do slide é desmontado antes de ser escrito: o cabeçalho
 * (faixa, badge, título) sai do corpo e vira o cabeçalho da página, e o que
 * sobra é conteúdo. Reimplementar 96 passos em JSX criaria uma segunda versão
 * do curso para manter sincronizada com a primeira.
 */

/** As IAs que o curso oferece. `q` marca quem aceita o prompt pela URL. */
const IAS = [
  { id: "gemini", nome: "Gemini", url: "https://gemini.google.com", q: null },
  { id: "chatgpt", nome: "ChatGPT", url: "https://chatgpt.com", q: "q" },
  { id: "deepseek", nome: "DeepSeek", url: "https://chat.deepseek.com", q: null },
  { id: "notebook", nome: "NotebookLM", url: "https://notebooklm.google.com", q: null },
];

const chaveVar = (v: string) => v.replace(/\s+/g, " ").trim();

async function copiar(texto: string, botao: HTMLElement) {
  const feito = () => {
    const antes = botao.textContent;
    botao.textContent = "\u2713 Copiado!";
    botao.classList.add("ok");
    setTimeout(() => {
      botao.textContent = antes;
      botao.classList.remove("ok");
    }, 1800);
  };
  try {
    await navigator.clipboard.writeText(texto);
    feito();
  } catch {
    // Sem permissão de área de transferência, o plano B: um campo fora da tela
    // e o comando de cópia do documento.
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      feito();
    } catch {
      /* o prompt segue na tela para copiar à mão */
    }
    document.body.removeChild(ta);
  }
}

/**
 * Desfaz as quebras de linha que o prompt trazia por causa do slide.
 *
 * No deck o prompt é escrito em linhas curtas, para caber na largura da folha
 * 16:9. Numa página estreita essas quebras se somam às naturais e o texto sai
 * picado: uma linha cheia, a seguinte com duas palavras. Aqui uma quebra
 * simples vira espaço — o parágrafo volta a fluir conforme a largura real — e
 * a linha em branco, que separa parágrafos de verdade, é preservada.
 */
function fluido(texto: string): string {
  return texto
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((par) => par.replace(/\n/g, " ").replace(/ {2,}/g, " ").trim())
    .join("\n\n");
}

/**
 * Troca cada `[ALGO]` do prompt por um campo de digitação, e devolve como ler
 * o texto já preenchido. Campos de mesmo nome andam juntos: `[ANO]` aparece
 * três vezes num prompt, e ninguém quer digitar a mesma coisa três vezes.
 */
function montarPromptEditavel(
  alvo: HTMLElement,
  texto: string,
  aoMudar: (t: string) => void,
) {
  alvo.textContent = "";
  const campos = new Map<string, HTMLInputElement[]>();

  for (const parte of fluido(texto).split(/(\[[^\]]*\])/)) {
    const m = parte.match(/^\[([^\]]*)\]$/);
    if (!m) {
      alvo.appendChild(document.createTextNode(parte));
      continue;
    }
    const chave = chaveVar(m[1] ?? "");
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "var-campo";
    inp.placeholder = chave;
    inp.size = Math.max(6, Math.min(chave.length + 2, 30));
    inp.dataset.chave = chave;
    inp.setAttribute("aria-label", chave);
    if (!campos.has(chave)) campos.set(chave, []);
    campos.get(chave)!.push(inp);
    const env = document.createElement("span");
    env.className = "var-env";
    env.appendChild(inp);
    alvo.appendChild(env);
  }

  const ajustar = (inp: HTMLInputElement) => {
    const base = chaveVar(inp.dataset.chave ?? "").length;
    inp.size = Math.max(6, Math.min(Math.max(base, inp.value.length) + 2, 46));
  };

  const ler = () => {
    let out = "";
    alvo.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        out += n.nodeValue ?? "";
        return;
      }
      const el = n as HTMLElement;
      const inp =
        el.tagName === "INPUT"
          ? (el as HTMLInputElement)
          : el.querySelector?.("input");
      // Campo vazio volta a ser [PLACEHOLDER]: o prompt continua utilizável
      // mesmo sem preencher tudo.
      if (inp) out += inp.value.trim() || "[" + inp.dataset.chave + "]";
    });
    return out;
  };

  alvo.addEventListener("input", (e) => {
    const inp = e.target as HTMLInputElement;
    if (!inp.dataset.chave) return;
    for (const outro of campos.get(inp.dataset.chave) ?? []) {
      if (outro !== inp) outro.value = inp.value;
      outro.classList.toggle("preenchido", !!inp.value.trim());
      ajustar(outro);
    }
    inp.classList.toggle("preenchido", !!inp.value.trim());
    ajustar(inp);
    aoMudar(ler());
  });

  return { ler, temCampos: campos.size > 0 };
}

/**
 * Separa o cabeçalho do slide do resto do conteúdo.
 *
 * No slide, faixa colorida, badge e título são peças posicionadas no alto da
 * folha. Numa página eles são o cabeçalho, e precisam sair do fluxo do
 * conteúdo para não aparecerem duas vezes.
 */
function desmontar(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const slide = doc.querySelector(".slide");
  if (!slide) return { etiqueta: null, titulo: null, corpo: html, cor: null };

  const badge = slide.querySelector(".badge");
  const h1 = slide.querySelector("h1.st");
  const topo = slide.querySelector(".topo");

  // A cor do encontro vem da faixa do topo, que o CSS do curso já classifica.
  const cor =
    topo?.classList.contains("laranja") ? "laranja"
    : topo?.classList.contains("verde") ? "verde"
    : topo?.classList.contains("vermelho") ? "vermelho"
    : topo?.classList.contains("amarelo") ? "amarelo"
    : "indigo";

  const etiqueta = badge?.textContent?.trim() ?? null;
  const titulo = h1?.innerHTML ?? null;

  badge?.remove();
  h1?.remove();
  topo?.remove();

  // O que sobra é o conteúdo: o `.corpo` quando existe, ou o slide inteiro
  // (capas, divisórias e slides de atividade não usam `.corpo`).
  const corpo = slide.querySelector(".corpo");
  return {
    etiqueta,
    titulo,
    cor,
    corpo: corpo ? corpo.innerHTML : slide.innerHTML,
    /** Capas e divisórias têm desenho próprio e são mantidas inteiras. */
    inteiro: !corpo,
  };
}

export function ConteudoDaAula({
  html,
  stepId,
  marcados,
}: {
  html: string;
  stepId: string;
  marcados: number[];
}) {
  const [raiz, setRaiz] = useState<HTMLDivElement | null>(null);
  const [cabecalho, setCabecalho] = useState<{
    etiqueta: string | null;
    titulo: string | null;
    cor: string | null;
  }>({ etiqueta: null, titulo: null, cor: null });

  const refMarcados = useRef(marcados);
  refMarcados.current = marcados;

  useEffect(() => {
    if (!raiz) return;
    const { etiqueta, titulo, cor, corpo, inteiro } = desmontar(html);
    setCabecalho({ etiqueta, titulo, cor: cor ?? null });

    // As tabelas do material são largas para papel e telão; sem uma caixa
    // própria, empurrariam a página inteira para o lado no celular.
    raiz.innerHTML = corpo
      .replace(/<table/g, '<div class="tabela-rolavel"><table')
      .replace(/<\/table>/g, "</table></div>");
    raiz.classList.toggle("conteudo-aula--inteiro", !!inteiro);

    const limpezas: (() => void)[] = [];

    // ---- cronômetro da atividade ----
    const crono = raiz.querySelector<HTMLElement>(".sl-crono");
    const num = crono?.querySelector<HTMLElement>(".num");
    const m = num?.textContent?.trim().match(/^(\d+):(\d{2})$/);
    if (crono && num && m) {
      const total = Number(m[1]) * 60 + Number(m[2]);
      let resta = total;
      let id: ReturnType<typeof setInterval> | null = null;

      const btns = document.createElement("div");
      btns.className = "crono-btns";
      const bIni = document.createElement("button");
      bIni.type = "button";
      bIni.textContent = "\u25b6 Iniciar";
      const bZer = document.createElement("button");
      bZer.type = "button";
      bZer.textContent = "\u21ba Zerar";
      bZer.className = "sec";
      btns.append(bIni, bZer);
      (crono.querySelector("h2") ?? num).after(btns);

      const pintar = () => {
        const mm = Math.floor(resta / 60);
        const ss = String(resta % 60).padStart(2, "0");
        num.textContent = mm + ":" + ss;
        num.classList.toggle("acabou", resta === 0);
      };
      const parar = () => {
        if (id) clearInterval(id);
        id = null;
      };
      bZer.onclick = () => {
        parar();
        bIni.textContent = "\u25b6 Iniciar";
        resta = total;
        crono.classList.remove("tocando");
        pintar();
      };
      bIni.onclick = () => {
        if (id) {
          parar();
          bIni.textContent = "\u25b6 Continuar";
          return;
        }
        if (resta === 0) {
          resta = total;
          crono.classList.remove("tocando");
          pintar();
        }
        bIni.textContent = "\u23f8 Pausar";
        id = setInterval(() => {
          resta--;
          pintar();
          if (resta <= 0) {
            parar();
            bIni.textContent = "\u25b6 Iniciar";
            crono.classList.add("tocando");
          }
        }, 1000);
      };
      limpezas.push(parar);
    }

    // ---- prompts: campos [ ], copiar, abrir a IA ----
    raiz.querySelectorAll<HTMLElement>(".prompt-acoes").forEach((cx) => {
      const texto = cx.dataset.promptTxt ?? "";
      if (!texto) return;

      const anterior = cx.previousElementSibling as HTMLElement | null;
      let ler = () => fluido(texto);
      // Sem campos o prompt não é remontado, então a quebra do slide
      // permaneceria: aqui o próprio elemento recebe o texto já fluido.
      if (anterior?.classList.contains("prompt") && !/\[[^\]]*\]/.test(texto)) {
        anterior.textContent = fluido(texto);
      }
      if (anterior?.classList.contains("prompt") && /\[[^\]]*\]/.test(texto)) {
        const ed = montarPromptEditavel(anterior, texto, () => apontar());
        ler = ed.ler;
        cx.classList.add("tem-campos");
      }

      const bt = document.createElement("button");
      bt.type = "button";
      bt.className = "copiar-mini";
      bt.textContent = "\ud83d\udccb Copiar";
      bt.onclick = () => void copiar(ler(), bt);
      cx.appendChild(bt);

      const links = IAS.map((ia) => {
        const a = document.createElement("a");
        a.className = "ia-btn mini " + ia.id;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = '<span class="pt"></span>' + ia.nome;
        a.title = ia.q
          ? "Abre o " + ia.nome + " com este prompt já escrito"
          : "Abre o " + ia.nome + " — copie antes com o botão ao lado";
        cx.appendChild(a);
        return { ia, a };
      });

      function apontar() {
        const t = ler();
        for (const { ia, a } of links) {
          a.href = ia.q ? ia.url + "/?" + ia.q + "=" + encodeURIComponent(t) : ia.url;
        }
      }
      apontar();
    });

    // ---- checklist ----
    // O que o aluno marca sobe para o painel do professor ("7 ainda não
    // fizeram"), e volta com ele quando reabre a página.
    const itens = [...raiz.querySelectorAll<HTMLElement>(".it.marcavel, .chk")];
    itens.forEach((item, i) => {
      if (refMarcados.current.includes(i)) item.classList.add("feito");
      const clique = () => {
        const feito = item.classList.toggle("feito");
        const novo = feito
          ? [...new Set([...refMarcados.current, i])]
          : refMarcados.current.filter((x) => x !== i);
        refMarcados.current = novo;
        // Grava em segundo plano: um erro de rede não pode desmarcar o que o
        // aluno acabou de marcar na frente da turma.
        void marcarItens(stepId, novo).catch(() => {});
      };
      item.addEventListener("click", clique);
      limpezas.push(() => item.removeEventListener("click", clique));
    });

    return () => limpezas.forEach((f) => f());
  }, [raiz, html, stepId]);

  return (
    <>
      {(cabecalho.etiqueta || cabecalho.titulo) && (
        <header className="conteudo-aula-cabecalho">
          {cabecalho.etiqueta && (
            <p className={"etiqueta-aula etiqueta-aula--" + (cabecalho.cor ?? "indigo")}>
              {cabecalho.etiqueta}
            </p>
          )}
          {cabecalho.titulo && (
            <h1
              className="titulo-aula"
              // Vem do material do curso, versionado no repositório: o título
              // traz marcação de destaque (<span class="lar">) que faz parte
              // do desenho.
              dangerouslySetInnerHTML={{ __html: cabecalho.titulo }}
            />
          )}
        </header>
      )}
      <div ref={setRaiz} className="conteudo-aula" />
    </>
  );
}
