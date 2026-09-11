"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Fronteira de erro do painel.
 *
 * Sem ela, uma consulta que falha derruba a aplicação inteira e o
 * administrador vê a tela branca do Next com um digest — foi exatamente
 * o que aconteceu com o `Digest: 2810173151`. Aqui o erro fica contido
 * na área de conteúdo: a sidebar continua de pé e dá para navegar para
 * outra seção sem recarregar.
 *
 * O `digest` é mostrado porque é o que liga o que a pessoa viu ao que
 * está no log do servidor.
 */
export default function ErroAdmin({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] erro na página:", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-vermelho-soft bg-white p-8 text-center">
      <h1 className="font-titulo text-xl font-extrabold text-tinta">
        Esta tela não carregou
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-tinta-clara">
        O restante do painel continua funcionando. Tente de novo — se o deploy
        acabou de rodar, costuma resolver em alguns instantes.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button onClick={reset} className="btn-primario text-sm">
          Tentar de novo
        </button>
        <Link href="/admin" className="btn-secundario text-sm">
          Ir para a visão geral
        </Link>
      </div>

      {error.digest && (
        <p className="mt-5 font-mono text-xs text-cinza">
          Código do erro: {error.digest}
        </p>
      )}
    </div>
  );
}
