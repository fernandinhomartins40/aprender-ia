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
  const idGaveta = "gaveta-avisos";
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
        aria-controls={idGaveta}
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

          <section
            id={idGaveta}
            role="dialog"
            aria-modal="true"
            aria-label="Seus avisos"
            className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.75rem)] z-50 flex max-h-[calc(100dvh-env(safe-area-inset-top)-6rem)] flex-col overflow-hidden rounded-2xl border-2 border-borda bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-h-96 sm:w-80 sm:rounded-lg"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-borda px-4 py-3">
              <p className="font-titulo font-bold">Seus avisos</p>
              <button type="button" onClick={() => setAberto(false)} className="min-h-11 min-w-11 rounded-lg text-lg font-bold text-tinta-clara hover:bg-fundo hover:text-tinta" aria-label="Fechar avisos">×</button>
            </div>

            {lista.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-cinza">
                Nenhum aviso por enquanto.
              </p>
            ) : (
              <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {lista.map((n) => (
                  <li key={n.id} className="border-b border-borda last:border-0">
                    <div className={`min-w-0 px-4 py-3 ${n.lidoEm ? "" : "bg-indigo-soft/40"}`}>
                      <p className="font-titulo text-sm font-bold">{n.titulo}</p>
                      <p className="mt-1 break-words whitespace-pre-line text-sm text-tinta-clara">
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
            <div className="shrink-0 border-t border-borda bg-white p-3 text-center">
              <Link href="/app/notificacoes" onClick={() => setAberto(false)} className="font-titulo text-sm font-bold text-indigo">
                Ver central e preferências
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
