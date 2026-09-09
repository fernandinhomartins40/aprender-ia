"use client";

import { useEffect } from "react";

/** Registra o service worker apenas em produção e com suporte do navegador. */
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const t = setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Falha no registro não deve quebrar a aplicação.
      });
    }, 2000);
    return () => clearTimeout(t);
  }, []);
  return null;
}
