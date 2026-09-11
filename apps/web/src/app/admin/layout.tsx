import Link from "next/link";
import { signOut } from "@aprender/auth";
import { exigirAdmin } from "@/server/admin";
import { contarSolicitacoesPendentes } from "@/server/acesso-free";
import { SidebarAdmin } from "@/components/sidebar-admin";
import { CabecalhoAdmin } from "@/components/cabecalho-admin";

/**
 * Moldura do painel administrativo.
 *
 * Sidebar fixa à esquerda e conteúdo à direita, no lugar da barra
 * horizontal de 14 abas: aquelas abas somavam ~2060px e não cabiam nem
 * num monitor de 1920px, então as últimas (Configurações, Histórico,
 * Perfil) só apareciam depois de rolar a barra para o lado.
 *
 * O contador de pendências é lido aqui, uma vez, e desce para a sidebar:
 * é a informação que precisa estar visível de qualquer página, porque do
 * outro lado há alguém sem acesso à plataforma.
 */
export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await exigirAdmin();
  const pendentes = await contarSolicitacoesPendentes();

  return (
    <div className="min-h-screen bg-fundo">
      <SidebarAdmin nomeAdmin={admin.nome ?? "Administrador"} pendentes={pendentes} />

      {/* A margem abre espaço para a sidebar fixa; no celular ela vira
          gaveta e a margem não existe. */}
      <div className="lg:ml-[264px]">
        <header className="sticky top-0 z-30 hidden border-b border-borda bg-white/95 backdrop-blur lg:block">
          <div className="flex items-center justify-end gap-2 px-6 py-2.5">
            <Link href="/app" className="btn-fantasma text-sm">
              Ver como aluno
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="btn-fantasma text-sm">
                Sair
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          <CabecalhoAdmin />
          {children}
        </main>
      </div>
    </div>
  );
}
