"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desenha um slide do curso e devolve a ele as interações do deck.
 *
 * O HTML vem do deck e é injetado como está; o CSS é o `slide-curso.css`,
 * derivado do mesmo `slides_base.css`. O que o deck fazia em JavaScript solto
 * — cronômetro, campos `[ ]` do prompt, botões que abrem a IA, checklist
 * clicável — é religado aqui, sobre o DOM já montado.
 *
 * Foi escrito assim, e não como componentes React por tipo de slide, porque o
 * conteúdo são 96 slides desenhados à mão no deck: reimplementá-los em JSX
 * criaria uma segunda versão do curso para manter sincronizada com a primeira.
 *
 * O palco é sempre 1280x720 e é ESCALADO para caber. É o que permite o mesmo
 * slide servir ao projetor e ao celular sem um segundo desenho: no telão ele
 * ocupa a tela, e no celular cabe inteiro em vez de virar outra página.
 */

/** As IAs que o deck oferece. `q` marca quem aceita o prompt pela URL. */
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
    // Sem permissão de área de transferência (http, navegador antigo), o plano
    // B do deck: um campo fora da tela e o comando de cópia do documento.
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
      /* o prompt segue visível na tela para copiar à mão */
    }
    document.body.removeChild(ta);
  }
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

  for (const parte of texto.split(/(\[[^\]]*\])/)) {
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
    // O input vai dentro de um span porque um <input> não aceita ::before, e é
    // por eles que os colchetes voltam onde o campo em branco não diria nada.
    // Mesma estrutura do deck, para o CSS servir aos dois.
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

export function PalcoSlide({
  html,
  aoMarcar,
  marcados,
  className = "",
  modo = "palco",
}: {
  html: string;
  /**
   * `palco`: o slide 16:9 escalado, como no projetor.
   * `pagina`: o MESMO conteúdo e o MESMO visual, soltos numa página que rola.
   *   É o que o aluno usa: um 1280x720 reduzido num celular corta as bordas e
   *   põe o texto em 4px.
   */
  modo?: "palco" | "pagina";
  /** Chamado quando alguém marca ou desmarca um item do checklist. */
  aoMarcar?: (indice: number, feito: boolean) => void;
  /** Itens já marcados, para reabrir o passo como a pessoa o deixou. */
  marcados?: number[];
  className?: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  // O nó do palco em ESTADO, e não em ref: o `key` abaixo recria o elemento a
  // cada slide, e com uma ref comum o efeito que religa as interações rodava
  // antes de a ref apontar para o nó novo — e não ligava nada. Com estado, a
  // troca do nó é o que dispara o efeito.
  const [palco, setPalco] = useState<HTMLDivElement | null>(null);
  const [escala, setEscala] = useState(0);
  const [rolando, setRolando] = useState(false);

  // `aoMarcar` e `marcados` ficam em ref para não entrarem nas dependências do
  // efeito que monta o slide: mudam a cada clique, e remontar ali apagaria o
  // cronômetro em andamento no meio da atividade.
  const refMarcar = useRef(aoMarcar);
  refMarcar.current = aoMarcar;
  const refMarcados = useRef(marcados);
  refMarcados.current = marcados;

  // O palco tem 1280x720 fixos e é escalado para caber na caixa.
  //
  // Numa tela larga — projetor, computador — o slide inteiro cabe, como no
  // deck, e sobra letterbox em cima e embaixo.
  //
  // Num celular em pé a conta muda. O slide caberia na largura, mas a 0,25 de
  // escala o corpo do texto vira 4px: ilegível justamente no prompt, que é o
  // que o aluno precisa ler. Então existe uma escala MÍNIMA de leitura; abaixo
  // dela o slide cresce até alcançá-la e a caixa passa a rolar, nos dois
  // sentidos, que é o gesto que a pessoa já faz no celular. Girar 90° foi
  // tentado e é pior: obriga a virar o aparelho e deixa o texto de lado.
  useEffect(() => {
    // Em página não há o que escalar: o conteúdo se ajusta à largura sozinho.
    if (modo === "pagina") return;
    const el = caixa.current;
    if (!el) return;
    const medir = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const cabeInteiro = Math.min(width / 1280, height / 720);
      // 0,42 põe o corpo do slide (16,5px no deck) em ~7px reais, que é o
      // limite do que se lê num celular a um braço de distância.
      const MINIMA = 0.42;
      const precisaRolar = cabeInteiro < MINIMA;
      setRolando(precisaRolar);
      setEscala(precisaRolar ? MINIMA : cabeInteiro);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [modo]);

  // Monta o slide e religa as interações do deck.
  //
  // O HTML é escrito aqui, e não com `dangerouslySetInnerHTML`, porque os
  // botões e campos que este efeito acrescenta são nós que o React não
  // conhece: com o conteúdo sob controle dele, a primeira re-renderização os
  // apagava. Escrevendo direto, esta subárvore é nossa do começo ao fim.
  useEffect(() => {
    const raiz = palco;
    if (!raiz) return;
    // As tabelas do material são largas para papel e telão. Numa página
    // estreita, sem uma caixa própria, empurrariam tudo para o lado.
    raiz.innerHTML =
      modo === "pagina"
        ? html
            .replace(/<table/g, '<div class="tabela-rolavel"><table')
            .replace(/<\/table>/g, "</table></div>")
        : html;
    const limpezas: (() => void)[] = [];

    // ---- cronômetro da atividade ----
    // O tempo inicial é o que está escrito no slide ("5:00"): mudar a duração
    // é mudar o deck, como no original.
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
      const dica = document.createElement("div");
      dica.className = "crono-dica";
      dica.textContent = "Barra de espaço inicia e pausa \u00b7 Z zera";
      (crono.querySelector("h2") ?? num).after(btns, dica);

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
      const zerar = () => {
        parar();
        bIni.textContent = "\u25b6 Iniciar";
        resta = total;
        crono.classList.remove("tocando");
        pintar();
      };
      const alternar = () => {
        if (id) {
          parar();
          bIni.textContent = "\u25b6 Continuar";
          return;
        }
        if (resta === 0) zerar();
        bIni.textContent = "\u23f8 Pausar";
        crono.classList.remove("tocando");
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
      bIni.onclick = alternar;
      bZer.onclick = zerar;

      // Barra de espaço e Z, as teclas que a mão do apresentador já procura.
      // Capturando, para chegar antes da navegação entre slides.
      const tecla = (e: KeyboardEvent) => {
        const alvo = e.target as HTMLElement;
        if (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA") return;
        if (e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          alternar();
        } else if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          e.stopPropagation();
          zerar();
        }
      };
      document.addEventListener("keydown", tecla, true);
      limpezas.push(() => {
        document.removeEventListener("keydown", tecla, true);
        parar();
      });
    }

    // ---- prompts: campos [ ], copiar, abrir a IA ----
    raiz.querySelectorAll<HTMLElement>(".prompt-acoes").forEach((cx) => {
      const texto = cx.dataset.promptTxt ?? "";
      if (!texto) return;

      const anterior = cx.previousElementSibling as HTMLElement | null;
      let ler = () => texto;
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

    // ---- checklist clicável ----
    // No deck era só um gesto visual. Aqui, quando `aoMarcar` existe, o que a
    // pessoa marca sobe para o painel do professor ("7 ainda não fizeram").
    const itens = [
      ...raiz.querySelectorAll<HTMLElement>(".sl-saida .it.marcavel, .chk"),
    ];
    itens.forEach((item, i) => {
      if (refMarcados.current?.includes(i)) item.classList.add("feito");
      const clique = () => {
        const feito = item.classList.toggle("feito");
        refMarcar.current?.(i, feito);
      };
      item.addEventListener("click", clique);
      limpezas.push(() => item.removeEventListener("click", clique));
    });

    return () => limpezas.forEach((f) => f());
  }, [palco, html, modo]);

  if (modo === "pagina") {
    return (
      <div
        // A `key` força um nó novo a cada slide, como no palco: o efeito acima
        // escreve o HTML e religa as interações sobre um elemento limpo.
        key={html}
        ref={setPalco}
        className={"palco-slide palco-pagina " + className}
      />
    );
  }

  return (
    <div
      ref={caixa}
      className={
        "palco-caixa " + (rolando ? "palco-caixa--rolando " : "") + className
      }
      // A altura que o slide de fato tem depois da escala. A caixa a usa como
      // teto para não sobrar faixa escura embaixo dele no celular.
      style={rolando ? { ["--altura-slide" as string]: 720 * escala + "px" } : undefined}
    >
      {/* No modo rolante o palco sai do fluxo (é `position:absolute`, para o
          `scale()` medir a partir do canto). Este espaçador devolve à caixa a
          altura que o slide realmente ocupa, que é o que a rolagem percorre. */}
      {rolando && (
        <div
          style={{ height: 720 * escala, width: 1280 * escala }}
          aria-hidden
          className="shrink-0"
        />
      )}
      <div
        key={html}
        ref={setPalco}
        className="palco-slide"
        style={{
          transform: "scale(" + escala + ")",
          visibility: escala ? "visible" : "hidden",
        }}
      />
    </div>
  );
}
