"use client";

import { useEffect } from "react";
import { registrarVisto } from "@/lib/verbetes-vistos";

/**
 * Registra, no navegador, que este verbete foi aberto.
 *
 * É um componente e não uma chamada solta porque a página do verbete é
 * renderizada no servidor, onde `localStorage` não existe. Este pedaço
 * mínimo roda no cliente, depois da montagem, e não desenha nada.
 */
export function MarcarVisto({ slug }: { slug: string }) {
  useEffect(() => {
    registrarVisto(slug);
  }, [slug]);

  return null;
}
