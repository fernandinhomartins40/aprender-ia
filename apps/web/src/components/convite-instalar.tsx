"use client";

import { useEffect, useState } from "react";

/**
 * Convite para instalar o aplicativo.
 *
 * Três coisas que este componente aprendeu na prática:
 *
 * 1. O Chrome dispara `beforeinstallprompt` UMA vez, durante a carga da
 *    página — antes de o React hidratar. Um ouvinte criado aqui dentro
 *    chegava tarde e o evento nunca era visto: o convite não aparecia no
 *    Android. Quem captura é um script no `<head>` (ver layout raiz), que
 *    guarda o evento em `window.__aprenderiaInstalar`. Aqui só lemos o
 *    que já foi guardado e escutamos o aviso para quem chegar depois.
 *
 * 2. O `start_url` do manifest precisa responder 200 para visitante sem
 *    sessão. Ele apontava para `/app`, que redireciona para o login —
 *    e um start_url que redireciona derruba a instalabilidade no Chrome.
 *
 * 3. O iOS não tem `beforeinstallprompt` nem API de instalação. Lá o
 *    caminho é Compartilhar › Adicionar à Tela de Início, então mostramos
 *    os passos em vez de um botão que não faria nada.
 */

const CHAVE_DISPENSADO = "aprenderia:convite-instalar-dispensado";

type EventoInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __aprenderiaInstalar?: EventoInstalacao | null;
  }
}

function ehIOS(): boolean {
  // `MSStream` descarta o IE11 antigo, que também casa com /iPad/.
  const ua = navigator.userAgent;
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) || iPadOS;
}

/**
 * No iPhone, só o Safari instala na tela de início. Chrome, Firefox e Edge
 * no iOS usam o motor do Safari mas NÃO oferecem o "Adicionar à Tela de
 * Início" — ensinar o caminho ali seria mandar a pessoa procurar um botão
 * que não existe.
 */
function ehSafariIOS(): boolean {
  const ua = navigator.userAgent;
  return ehIOS() && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua);
}

function jaInstalado(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: minimal-ui)").matches) return true;
  // Safari no iOS não implementa `display-mode`; usa esta propriedade.
  return "standalone" in navigator && Boolean(navigator.standalone);
}

type Modo = "oculto" | "android" | "ios" | "ios_outro_navegador";

/**
 * @param tom  "claro" para fundos escuros (tela de abertura do aplicativo),
 *             "cartao" para o corpo claro do painel.
 */
export function ConviteInstalar({ tom = "cartao" }: { tom?: "claro" | "cartao" }) {
  const [modo, setModo] = useState<Modo>("oculto");
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    // Já instalado: nunca oferecer de novo. É o caso do PWA aberto pelo
    // ícone da tela de início.
    if (jaInstalado()) return;

    try {
      if (localStorage.getItem(CHAVE_DISPENSADO) === "1") return;
    } catch {
      /* sem armazenamento: mostra o convite mesmo assim */
    }

    // iOS primeiro: lá nunca haverá evento do Chrome.
    if (ehIOS()) {
      setModo(ehSafariIOS() ? "ios" : "ios_outro_navegador");
      return;
    }

    // Android/desktop: o evento pode ter sido capturado antes desta
    // montagem (o caso comum) ou chegar em seguida.
    if (window.__aprenderiaInstalar) {
      setModo("android");
    }

    const aoFicarInstalavel = () => setModo("android");
    const aoInstalar = () => setModo("oculto");

    window.addEventListener("aprenderia:instalavel", aoFicarInstalavel);
    window.addEventListener("aprenderia:instalado", aoInstalar);
    return () => {
      window.removeEventListener("aprenderia:instalavel", aoFicarInstalavel);
      window.removeEventListener("aprenderia:instalado", aoInstalar);
    };
  }, []);

  function dispensar() {
    setModo("oculto");
    try {
      localStorage.setItem(CHAVE_DISPENSADO, "1");
    } catch {
      /* só perde a memória da dispensa */
    }
  }

  async function instalar() {
    const evento = window.__aprenderiaInstalar;
    if (!evento) return;

    setInstalando(true);
    try {
      await evento.prompt();
      const escolha = await evento.userChoice;
      // O evento serve uma vez só: usado, o navegador não o dispara de
      // novo nesta visita.
      window.__aprenderiaInstalar = null;

      if (escolha?.outcome === "accepted") {
        setModo("oculto");
      } else {
        // Recusou: guardamos para não insistir a cada abertura.
        dispensar();
      }
    } catch {
      setModo("oculto");
    } finally {
      setInstalando(false);
    }
  }

  if (modo === "oculto") return null;

  const claro = tom === "claro";
  const caixa = claro
    ? "rounded-2xl bg-white/12 p-4 text-white backdrop-blur-sm"
    : "rounded-2xl border-2 border-indigo-soft bg-indigo-soft/40 p-4";
  const titulo = claro
    ? "font-titulo text-sm font-bold"
    : "font-titulo text-sm font-bold text-indigo-dark";
  const texto = claro ? "text-sm text-white/85" : "text-sm text-tinta-clara";
  const secundario = claro
    ? "inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold text-white/80"
    : "inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold text-tinta-clara";

  if (modo === "ios_outro_navegador") {
    return (
      <div className={caixa}>
        <p className={titulo}>Instale o Aprender IA</p>
        <p className={`mt-1 ${texto}`}>
          Neste iPhone, só o <strong className="font-semibold">Safari</strong> consegue
          adicionar o aplicativo à tela de início. Abra o site no Safari para instalar.
        </p>
        <div className="mt-3">
          <button type="button" onClick={dispensar} className={secundario}>
            Entendi
          </button>
        </div>
      </div>
    );
  }

  if (modo === "ios") {
    return (
      <div className={caixa}>
        <p className={titulo}>Deixe o Aprender IA na tela inicial</p>
        <p className={`mt-1 ${texto}`}>
          Abre em tela cheia, sem a barra do navegador — e é assim que os avisos
          funcionam no iPhone.
        </p>

        {/* Os passos numerados existem porque aqui a sequência é real: a
            pessoa precisa executar três toques, nesta ordem. */}
        <ol className={`mt-3 space-y-1.5 ${texto}`}>
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>
              Toque em <strong className="font-semibold">Compartilhar</strong> na barra
              do Safari
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>
              Escolha{" "}
              <strong className="font-semibold">Adicionar à Tela de Início</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>
              Confirme em <strong className="font-semibold">Adicionar</strong>
            </span>
          </li>
        </ol>

        <div className="mt-3">
          <button type="button" onClick={dispensar} className={secundario}>
            Entendi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={caixa}>
      <p className={titulo}>Instale o Aprender IA</p>
      <p className={`mt-1 ${texto}`}>
        Abre rápido, em tela cheia, direto da sua tela inicial.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={instalar}
          disabled={instalando}
          className={
            claro
              ? "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-white px-4 font-titulo text-sm font-bold text-indigo disabled:opacity-70"
              : "btn-primario min-h-[44px] px-4 text-sm"
          }
        >
          {instalando ? "Instalando…" : "Instalar aplicativo"}
        </button>
        <button type="button" onClick={dispensar} className={secundario}>
          Agora não
        </button>
      </div>
    </div>
  );
}
