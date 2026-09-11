"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconeApp, type NomeIconeApp } from "@/components/icone-app";

/**
 * Navegação inferior do aluno, no celular.
 *
 * Cinco posições, com a do meio em destaque: é a disposição de aplicativo
 * que o polegar alcança sem trocar a mão de posição. O menu superior
 * continua no desktop — lá a barra inferior seria estranha e o cursor
 * chega em qualquer ponto da tela com o mesmo esforço.
 *
 * "Mais" abre uma folha com o que não coube: são 7 destinos e só 4
 * posições fixas, e esconder o resto atrás de um ícone sem nome seria
 * pior do que uma lista nomeada.
 */

type Posicao = { href: string; rotulo: string; icone: NomeIconeApp };

const ESQUERDA: Posicao[] = [
  { href: "/app", rotulo: "Início", icone: "inicio" },
  { href: "/app/trilha", rotulo: "Trilha", icone: "trilhas" },
];

const DIREITA: Posicao[] = [
  { href: "/app/prompts", rotulo: "Prompts", icone: "prompt" },
];

/** O que não coube nas posições fixas. */
const SECUNDARIOS: Posicao[] = [
  { href: "/app/diario", rotulo: "Diário de bordo", icone: "documentos" },
  { href: "/app/conquistas", rotulo: "Conquistas", icone: "conquistas" },
  { href: "/app/notificacoes", rotulo: "Notificações", icone: "notificacoes" },
  { href: "/app/acesso", rotulo: "Meu acesso", icone: "seguranca" },
];

export function BarraInferior({ aoSair }: { aoSair: React.ReactNode }) {
  const caminho = usePathname();
  const [maisAberto, setMaisAberto] = useState(false);

  // Navegar fecha a folha, senão ela cobriria a página nova.
  useEffect(() => {
    setMaisAberto(false);
  }, [caminho]);

  const ativo = (href: string) =>
    href === "/app" ? caminho === "/app" : caminho.startsWith(href);

  // Um destino secundário ativo acende o "Mais": sem isso, estando no
  // Diário, nenhuma das cinco posições ficaria marcada.
  const emSecundario = SECUNDARIOS.some((s) => caminho.startsWith(s.href));

  return (
    <>
      {maisAberto && (
        <>
          <button
            aria-label="Fechar menu"
            onClick={() => setMaisAberto(false)}
            className="fixed inset-0 z-40 bg-tinta/40 md:hidden"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-lg md:hidden">
            {/* Puxador: diz que o painel é arrastável/fechável, do jeito
                que aplicativos sinalizam uma folha inferior. */}
            <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-borda" />
            <ul className="px-3 py-2">
              {SECUNDARIOS.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    aria-current={caminho.startsWith(s.href) ? "page" : undefined}
                    className={`flex min-h-[52px] items-center gap-3 rounded-xl px-3 font-semibold ${
                      caminho.startsWith(s.href)
                        ? "bg-indigo-soft text-indigo-dark"
                        : "text-tinta-clara"
                    }`}
                  >
                    <IconeApp nome={s.icone} tamanho={28} />
                    {s.rotulo}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-borda pt-2">{aoSair}</li>
            </ul>
          </div>
        </>
      )}

      <nav
        aria-label="Navegação principal"
        // `pb-[env(safe-area-inset-bottom)]` levanta a barra acima da
        // faixa de gestos do iPhone; sem isso os rótulos ficam por baixo
        // dela e o toque é interceptado pelo sistema.
        className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="flex items-stretch justify-around">
          {ESQUERDA.map((p) => (
            <li key={p.href} className="flex-1">
              <Aba posicao={p} ativo={ativo(p.href)} />
            </li>
          ))}

          {/* Ação principal, elevada acima da barra: continuar estudando
              é o que o aluno vem fazer, e isso merece o polegar. */}
          <li className="flex-1">
            <Link
              href="/app/trilha"
              aria-label="Continuar estudando"
              className="flex h-full flex-col items-center justify-end gap-1 pb-1.5"
            >
              <span className="-mt-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo shadow-cor">
                <IconeApp nome="progresso" tamanho={30} />
              </span>
              <span className="text-[10px] font-bold text-indigo">Estudar</span>
            </Link>
          </li>

          {DIREITA.map((p) => (
            <li key={p.href} className="flex-1">
              <Aba posicao={p} ativo={ativo(p.href)} />
            </li>
          ))}

          <li className="flex-1">
            <button
              onClick={() => setMaisAberto((a) => !a)}
              aria-expanded={maisAberto}
              aria-label="Mais opções"
              className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 ${
                emSecundario || maisAberto ? "text-indigo" : "text-cinza"
              }`}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
              <span className="text-[10px] font-bold">Mais</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

function Aba({ posicao, ativo }: { posicao: Posicao; ativo: boolean }) {
  return (
    <Link
      href={posicao.href}
      aria-current={ativo ? "page" : undefined}
      className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 ${
        ativo ? "text-indigo" : "text-cinza"
      }`}
    >
      <IconeApp nome={posicao.icone} tamanho={26} />
      <span className="text-[10px] font-bold">{posicao.rotulo}</span>
    </Link>
  );
}
