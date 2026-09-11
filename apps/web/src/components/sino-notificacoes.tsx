"use client";

import Link from "next/link";
import { useState } from "react";

export type NotificacaoDoAluno = {
  id: string;
  titulo: string;
  corpo: string;
  link: string | null;
  lidoEm: Date | null;
  criadoEm: Date;
};

/**
 * Sino de notificações do aluno.
 *
 * Abre um painel com as mensagens recentes e marca tudo como lido ao
 * abrir — o objetivo do contador é avisar que há algo novo, não cobrar um
 * clique em cada item.
 */
export function SinoNotificacoes({
  lista,
  naoLidas,
  aoAbrir,
}: {
  lista: NotificacaoDoAluno[];
  naoLidas: number;
  aoAbrir: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  // Some assim que o painel abre, sem esperar a resposta do servidor: o
  // contador é informação da interface, não estado do banco.
  const [contador, setContador] = useState(naoLidas);

  const alternar = () => {
    const abrindo = !aberto;
    setAberto(abrindo);
    if (abrindo && contador > 0) {
      setContador(0);
      aoAbrir();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={alternar}
        aria-label={
          contador > 0 ? `Notificações: ${contador} não lida(s)` : "Notificações"
        }
        aria-expanded={aberto}
        className="relative rounded-md border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta-clara hover:border-indigo"
      >
        Avisos
        {contador > 0 && (
          <span className="feedback-entrada absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-vermelho px-1 text-xs font-bold text-white">
            {contador > 9 ? "9+" : contador}
          </span>
        )}
      </button>

      {aberto && (
        <>
          {/* Clicar fora fecha — sem isso o painel fica preso na tela. */}
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setAberto(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-lg border-2 border-borda bg-white shadow-lg">
            <div className="border-b border-borda px-4 py-3">
              <p className="font-titulo font-bold">Seus avisos</p>
            </div>

            {lista.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-cinza">
                Nenhum aviso por enquanto.
              </p>
            ) : (
              <ul>
                {lista.map((n) => (
                  <li key={n.id} className="border-b border-borda last:border-0">
                    <div className={`px-4 py-3 ${n.lidoEm ? "" : "bg-indigo-soft/40"}`}>
                      <p className="font-titulo text-sm font-bold">{n.titulo}</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-tinta-clara">
                        {n.corpo}
                      </p>
                      <p className="mt-1.5 text-xs text-cinza">
                        {new Date(n.criadoEm).toLocaleDateString("pt-BR")}
                      </p>
                      {n.link && (
                        <a
                          href={n.link}
                          className="mt-2 inline-block text-sm font-bold text-indigo hover:underline"
                        >
                          Abrir
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-borda p-3 text-center">
              <Link href="/app/notificacoes" onClick={() => setAberto(false)} className="font-titulo text-sm font-bold text-indigo">
                Ver central e preferências
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
