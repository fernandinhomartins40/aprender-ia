"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { itemAtivo } from "@/lib/menu-admin";

/**
 * Cabeçalho da área de conteúdo.
 *
 * Repete o nome da seção ao lado da trilha porque a sidebar pode estar
 * fechada (celular) ou fora do campo de visão depois de rolar: o título
 * da página precisa existir dentro do próprio conteúdo.
 */
export function CabecalhoAdmin({ acoes }: { acoes?: React.ReactNode }) {
  const caminho = usePathname();
  const ativo = itemAtivo(caminho);

  // Numa rota filha (`/admin/turmas/[id]`) a trilha mostra o caminho de
  // volta; na própria seção, mostrar "Painel › X › X" seria redundante.
  const emRotaFilha = Boolean(ativo && caminho !== ativo.href);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Trilha de navegação" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-cinza">
          <li>
            <Link href="/admin" className="hover:text-indigo hover:underline">
              Painel
            </Link>
          </li>
          {ativo && (
            <>
              <li aria-hidden>/</li>
              <li>
                {emRotaFilha ? (
                  <Link href={ativo.href} className="hover:text-indigo hover:underline">
                    {ativo.rotulo}
                  </Link>
                ) : (
                  <span className="font-semibold text-tinta">{ativo.rotulo}</span>
                )}
              </li>
            </>
          )}
        </ol>
      </nav>

      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </div>
  );
}
