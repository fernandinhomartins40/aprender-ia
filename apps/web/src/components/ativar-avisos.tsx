"use client";

import { useEffect, useState } from "react";

/**
 * Pede autorização para notificações e registra a inscrição push.
 *
 * Regras que moldaram esta tela:
 *
 * 1. O navegador só aceita `Notification.requestPermission()` a partir de
 *    um gesto da pessoa. Chamar na carga da página faz o Chrome recusar e
 *    o Safari nem pergunta — por isso existe um botão, e não um efeito.
 *
 * 2. Não insistimos. Quem já autorizou não vê nada; quem recusou também
 *    não. Repetir o pedido a cada visita é o caminho mais rápido para a
 *    pessoa bloquear o site de vez, e o navegador passa a recusar sem
 *    nem mostrar o diálogo.
 *
 * 3. No iPhone, push só existe com o aplicativo instalado na tela de
 *    início (Safari 16.4+). No Safari comum a API simplesmente não está
 *    lá — então explicamos o caminho em vez de mostrar um botão morto.
 *
 * 4. Não aparece na tela de login. O primeiro acesso já pede e-mail e
 *    senha; empilhar um pedido de permissão em cima disso faz a pessoa
 *    negar por reflexo.
 */

const CHAVE_DISPENSADO = "aprenderia:avisos-dispensado";

/**
 * base64url → bytes, formato que o `subscribe` exige.
 *
 * O ArrayBuffer é alocado explicitamente porque `applicationServerKey`
 * aceita `BufferSource`, e um `Uint8Array` genérico pode estar apoiado em
 * `SharedArrayBuffer` — que não serve.
 */
function paraBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const cru = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(cru.length));
  for (let i = 0; i < cru.length; i++) bytes[i] = cru.charCodeAt(i);
  return bytes;
}

function ehIOS(): boolean {
  const ua = navigator.userAgent;
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) || iPadOS;
}

function instalado(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return "standalone" in navigator && Boolean(navigator.standalone);
}

type Estado = "verificando" | "oculto" | "pedir" | "ios_precisa_instalar" | "salvando" | "pronto" | "erro";

export function AtivarAvisos({ chavePublica }: { chavePublica: string | null }) {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    // Sem chave VAPID o servidor não consegue enviar: não faz sentido
    // pedir permissão que nunca será usada.
    if (!chavePublica) return setEstado("oculto");

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      // No iPhone a API só aparece com o app instalado. Fora dele, a
      // ausência não é erro: é instrução.
      if (ehIOS() && !instalado()) return setEstado("ios_precisa_instalar");
      return setEstado("oculto");
    }

    if (!("Notification" in window)) return setEstado("oculto");

    // Já autorizado: confirmamos que a inscrição existe no servidor (ela
    // pode ter sido criada antes de um deploy que trocou a chave) e
    // seguimos sem incomodar.
    if (Notification.permission === "granted") {
      garantirInscricao(chavePublica).then((ok) =>
        setEstado(ok ? "pronto" : "oculto"),
      );
      return;
    }

    // Recusado: nunca pedimos de novo. Só o próprio navegador pode
    // reverter isso, nas configurações do site.
    if (Notification.permission === "denied") return setEstado("oculto");

    try {
      if (localStorage.getItem(CHAVE_DISPENSADO) === "1") return setEstado("oculto");
    } catch {
      /* sem armazenamento: mostra mesmo assim */
    }

    setEstado("pedir");
  }, [chavePublica]);

  async function ativar() {
    if (!chavePublica) return;
    setEstado("salvando");

    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        // Negou: guardamos para não repetir o pedido.
        dispensar();
        return;
      }

      const ok = await garantirInscricao(chavePublica);
      if (ok) {
        setEstado("pronto");
      } else {
        setMensagem("Não conseguimos ativar agora. Tente de novo mais tarde.");
        setEstado("erro");
      }
    } catch {
      setMensagem("Não conseguimos ativar agora. Tente de novo mais tarde.");
      setEstado("erro");
    }
  }

  function dispensar() {
    setEstado("oculto");
    try {
      localStorage.setItem(CHAVE_DISPENSADO, "1");
    } catch {
      /* só perde a memória da dispensa */
    }
  }

  if (estado === "verificando" || estado === "oculto" || estado === "pronto") return null;

  if (estado === "ios_precisa_instalar") {
    return (
      <div className="rounded-xl border-2 border-borda bg-white p-4">
        <p className="font-titulo text-sm font-bold text-tinta">Receba os avisos no iPhone</p>
        <p className="mt-1 text-sm text-tinta-clara">
          No iPhone, os avisos só funcionam com o aplicativo na tela de início.
          Toque em Compartilhar e escolha{" "}
          <strong className="font-semibold">Adicionar à Tela de Início</strong>; depois
          abra o aplicativo por lá e ative os avisos.
        </p>
        <button
          type="button"
          onClick={dispensar}
          className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-tinta-clara"
        >
          Entendi
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-indigo-soft bg-indigo-soft/40 p-4">
      <p className="font-titulo text-sm font-bold text-indigo-dark">
        Quer ser avisado dos prazos?
      </p>
      <p className="mt-1 text-sm text-tinta-clara">
        Avisamos quando seu acesso estiver perto de vencer e quando houver
        recado da coordenação. Só o necessário — nada de propaganda.
      </p>

      {estado === "erro" && (
        <p role="alert" className="mt-2 text-sm font-semibold text-vermelho-dark">
          {mensagem}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={ativar}
          disabled={estado === "salvando"}
          className="btn-primario min-h-[44px] px-4 text-sm"
        >
          {estado === "salvando" ? "Ativando…" : "Ativar avisos"}
        </button>
        <button
          type="button"
          onClick={dispensar}
          className="inline-flex min-h-[44px] items-center px-3 text-sm font-semibold text-tinta-clara"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}

/**
 * Garante que existe inscrição e que o servidor a conhece.
 *
 * Reaproveita a inscrição existente quando a chave bate. Quando não bate
 * (o servidor trocou o par VAPID), cancela e cria outra — sem isso o
 * aparelho ficaria com uma inscrição que o servidor não consegue usar.
 */
async function garantirInscricao(chavePublica: string): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const existente = await reg.pushManager.getSubscription();

    let inscricao = existente;

    if (existente) {
      const atual = existente.options?.applicationServerKey;
      const esperada = paraBytes(chavePublica);
      const bate =
        atual instanceof ArrayBuffer &&
        new Uint8Array(atual).length === esperada.length &&
        new Uint8Array(atual).every((b, i) => b === esperada[i]);

      if (!bate) {
        await existente.unsubscribe();
        inscricao = null;
      }
    }

    if (!inscricao) {
      inscricao = await reg.pushManager.subscribe({
        // Obrigatório: o navegador recusa inscrição que possa receber
        // push sem mostrar nada para a pessoa.
        userVisibleOnly: true,
        applicationServerKey: paraBytes(chavePublica),
      });
    }

    const dados = inscricao.toJSON() as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };

    const resp = await fetch("/api/push/inscrever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: dados.endpoint,
        keys: dados.keys,
        agente: navigator.userAgent,
      }),
    });

    return resp.ok;
  } catch (e) {
    console.error("[avisos] falha ao inscrever:", e);
    return false;
  }
}
