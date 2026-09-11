"use client";

import { useEffect } from "react";

/**
 * Registra o service worker apenas em produção e com suporte do navegador.
 *
 * O registro era adiado em 2 segundos para não competir com a carga da
 * página. O custo disso era alto no Android: o Chrome só considera o site
 * instalável quando existe service worker registrado, e a avaliação
 * acontece nos primeiros instantes da visita. Com o atraso, a primeira
 * visita frequentemente terminava sem o `beforeinstallprompt` — ou seja,
 * sem nenhuma oferta de instalação. Registramos imediatamente; o próprio
 * navegador já faz isso em segundo plano, sem travar a interface.
 */
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Falha no registro não deve quebrar a aplicação.
    });
  }, []);
  return null;
}
