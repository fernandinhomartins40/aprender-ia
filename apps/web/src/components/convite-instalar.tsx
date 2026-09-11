"use client";

import { useEffect, useState } from "react";

/**
 * Convite para instalar o aplicativo.
 *
 * O banner nativo do Chrome só aparece dentro do `scope` do manifest, que
 * é `/app`. A tela de login do site (`/entrar`) fica fora dele de
 * propósito — foi assim que evitamos que o aplicativo instalado abrisse a
 * página de vendas. O efeito colateral é que quem chega pelo celular em
 * `/entrar` nunca vê convite nenhum. Este componente resolve isso onde o
 * convite é legítimo: dentro do `/app`.
 *
 * No Android/desktop usamos o evento `beforeinstallprompt`, que o
 * navegador dispara quando a instalação é possível; guardá-lo é o único
 * jeito de chamar `prompt()` depois, no clique da pessoa.
 *
 * O iOS não tem esse evento nem API de instalação: lá o caminho é
 * Compartilhar › "Adicionar à Tela de Início", então mostramos a
 * instrução em vez de um botão que não faria nada.
 */

const CHAVE_DISPENSADO = "aprenderia:convite-instalar-dispensado";

type Evento = Event & { prompt: () => Promise<void> };

function ehIOS() {
  // `MSStream` descarta o IE11 antigo, que também casa com /iPad/.
  const ua = navigator.userAgent;
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) || iPadOS;
}

function jaInstalado() {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // Safari no iOS não implementa `display-mode`; usa esta propriedade.
  return "standalone" in navigator && Boolean(navigator.standalone);
}

export function ConviteInstalar() {
  const [evento, setEvento] = useState<Evento | null>(null);
  const [mostrarIOS, setMostrarIOS] = useState(false);
  const [oculto, setOculto] = useState(true);

  useEffect(() => {
    if (jaInstalado()) return;

    try {
      if (localStorage.getItem(CHAVE_DISPENSADO) === "1") return;
    } catch {
      /* sem armazenamento: mostra o convite mesmo assim */
    }

    setOculto(false);
    if (ehIOS()) setMostrarIOS(true);

    function aoPoderInstalar(e: Event) {
      // Sem isto o Chrome mostra o próprio banner e o nosso ficaria
      // duplicado na tela.
      e.preventDefault();
      setEvento(e as Evento);
    }

    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    return () => window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
  }, []);

  function dispensar() {
    setOculto(true);
    try {
      localStorage.setItem(CHAVE_DISPENSADO, "1");
    } catch {
      /* só perde a memória da dispensa */
    }
  }

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    // O evento serve uma vez só: depois de usado, o navegador não o
    // dispara de novo nesta visita.
    setEvento(null);
    dispensar();
  }

  // Nada a oferecer: nem evento do Chrome, nem instrução do iOS.
  if (oculto || (!evento && !mostrarIOS)) return null;

  return (
    <div className="rounded-2xl bg-white/12 p-4 text-white backdrop-blur-sm">
      <p className="font-titulo text-sm font-bold">Deixe o Aprender IA na tela inicial</p>

      {mostrarIOS ? (
        <p className="mt-1 text-sm text-white/85">
          Toque em <span aria-hidden>⎋</span> Compartilhar e escolha{" "}
          <strong className="font-semibold">Adicionar à Tela de Início</strong>.
        </p>
      ) : (
        <p className="mt-1 text-sm text-white/85">
          Abre rápido, em tela cheia, sem passar pelo navegador.
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {!mostrarIOS && (
          <button
            type="button"
            onClick={instalar}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-white px-4 font-titulo text-sm font-bold text-indigo"
          >
            Instalar
          </button>
        )}
        <button
          type="button"
          onClick={dispensar}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold text-white/80"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
