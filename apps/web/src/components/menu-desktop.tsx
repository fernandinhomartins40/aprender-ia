"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconeApp, type NomeIconeApp } from "@/components/icone-app";

export type ItemMenuAluno = { href: string; rotulo: string; icone: NomeIconeApp };

/**
 * Menu do aluno no desktop.
 *
 * Os 11 itens ficavam numa linha só: somavam ~1.466px dentro de uma faixa de
 * 984px, então os últimos quebravam para a segunda linha e "Notificações"
 * saía cortado na borda. Aqui os principais ficam visíveis e o restante entra
 * num botão "Mais" — a mesma ideia que a barra inferior já usa no celular.
 *
 * É Client Component porque o menu "Mais" abre e fecha, e porque marca o item
 * ativo pela rota; o layout em volta continua sendo Server Component.
 */
export function MenuDesktop({
  principais,
  secundarios,
}: {
  principais: ItemMenuAluno[];
  secundarios: ItemMenuAluno[];
}) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou ao apertar Esc: sem isso o painel ficaria aberto
  // atrás do conteúdo enquanto o professor navega.
  useEffect(() => {
    if (!aberto) return;
    const clique = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", clique);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", clique);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  // Fecha ao trocar de página.
  useEffect(() => setAberto(false), [caminho]);

  const ativo = (href: string) =>
    href === "/app" ? caminho === "/app" : caminho.startsWith(href);

  const algumSecundarioAtivo = secundarios.some((s) => ativo(s.href));

  const classe = (estaAtivo: boolean) =>
    `inline-flex items-center gap-2 rounded-t-md px-4 py-2.5 font-titulo text-sm font-bold transition-colors ${
      estaAtivo
        ? "bg-indigo-soft text-indigo-dark"
        : "text-tinta-clara hover:bg-indigo-soft hover:text-indigo-dark"
    }`;

  return (
    <nav className="mx-auto hidden max-w-5xl px-5 md:block" aria-label="Seções do aluno">
      <ul className="flex items-end gap-1 pb-1">
        {principais.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className={classe(ativo(m.href))}>
              <IconeApp nome={m.icone} tamanho={22} />
              {m.rotulo}
            </Link>
          </li>
        ))}

        <li className="relative" ref={caixa}>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-haspopup="menu"
            className={classe(algumSecundarioAtivo)}
          >
            <span aria-hidden className="text-lg leading-none">⋯</span>
            Mais
          </button>

          {aberto && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 w-60 overflow-hidden rounded-xl border border-borda bg-white py-1.5 shadow-lg"
            >
              {secundarios.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  role="menuitem"
                  className={`flex items-center gap-2.5 px-4 py-2.5 font-titulo text-sm font-bold transition-colors ${
                    ativo(m.href)
                      ? "bg-indigo-soft text-indigo-dark"
                      : "text-tinta-clara hover:bg-indigo-soft hover:text-indigo-dark"
                  }`}
                >
                  <IconeApp nome={m.icone} tamanho={20} />
                  {m.rotulo}
                </Link>
              ))}
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
