"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { IconeApp } from "@/components/icone-app";
import { GRUPOS_MENU, itemAtivo, type ItemMenu } from "@/lib/menu-admin";

/**
 * Navegação lateral do painel.
 *
 * É Client Component por um motivo só: `usePathname` marca o item ativo.
 * Antes a barra era horizontal e sem nenhuma marcação — o administrador
 * não tinha como saber em que página estava.
 *
 * No celular vira gaveta, porque 240px fixos de sidebar não sobram numa
 * tela de 390px.
 */
export function SidebarAdmin({
  nomeAdmin,
  pendentes,
}: {
  nomeAdmin: string;
  pendentes: number;
}) {
  const caminho = usePathname();
  const ativo = itemAtivo(caminho);
  const [aberta, setAberta] = useState(false);

  // Navegar fecha a gaveta. Sem isso ela ficaria por cima da página nova.
  useEffect(() => {
    setAberta(false);
  }, [caminho]);

  return (
    <>
      {/* Barra do topo, só no celular: a gaveta precisa de um gatilho. */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-borda bg-white px-4 py-2.5 lg:hidden">
        <button
          onClick={() => setAberta(true)}
          aria-label="Abrir menu"
          aria-expanded={aberta}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-tinta-clara hover:bg-indigo-soft hover:text-indigo"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <span className="font-titulo font-bold text-tinta">
          {ativo?.rotulo ?? "Painel"}
        </span>
        {pendentes > 0 && (
          <span className="ml-auto rounded-full bg-amarelo-soft px-2.5 py-1 text-xs font-bold text-amarelo-dark">
            {pendentes} pendente(s)
          </span>
        )}
      </div>

      {/* Véu da gaveta. */}
      {aberta && (
        <button
          aria-label="Fechar menu"
          onClick={() => setAberta(false)}
          className="fixed inset-0 z-40 bg-tinta/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[#1E1B4B] transition-transform lg:translate-x-0 ${
          aberta ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-4">
          <Link href="/admin" className="inline-flex items-center gap-2.5">
            <Logo href={null} largura={104} prioridade className="h-auto w-[104px]" />
          </Link>
          <button
            onClick={() => setAberta(false)}
            aria-label="Fechar menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav aria-label="Seções do painel" className="flex-1 overflow-y-auto px-3 pb-4">
          {GRUPOS_MENU.map((grupo, i) => (
            <div key={grupo.titulo ?? `grupo-${i}`} className={i > 0 ? "mt-5" : ""}>
              {/* Caixa alta só aqui: nos separadores da sidebar ela é
                  navegação (diz "começa outro domínio"), não enfeite. */}
              {grupo.titulo && (
                <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                  {grupo.titulo}
                </p>
              )}
              <ul className="space-y-0.5">
                {grupo.itens.map((item) => (
                  <li key={item.href}>
                    <ItemLink
                      item={item}
                      ativo={ativo?.href === item.href}
                      contador={item.contador === "solicitacoes" ? pendentes : 0}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <Link
            href="/admin/perfil"
            aria-current={caminho === "/admin/perfil" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
              caminho === "/admin/perfil" ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <IconeApp nome="perfil" tamanho={30} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-white">
                {nomeAdmin}
              </span>
              <span className="block text-xs text-white/50">Meu perfil</span>
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}

function ItemLink({
  item,
  ativo,
  contador,
}: {
  item: ItemMenu;
  ativo: boolean;
  contador: number;
}) {
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg py-2 pl-3 pr-2 text-sm font-semibold transition-colors ${
        ativo ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      {/* Barra vertical no item ativo: é o sinal que responde "onde estou",
          a pergunta que a barra horizontal não respondia. */}
      {ativo && (
        <span
          aria-hidden
          className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-indigo"
        />
      )}
      <IconeApp nome={item.icone} tamanho={24} />
      <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
      {contador > 0 && (
        <span className="rounded-full bg-amarelo px-2 py-0.5 text-[11px] font-bold text-tinta">
          {contador}
        </span>
      )}
    </Link>
  );
}
