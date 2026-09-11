import Link from "next/link";
import { signOut } from "@aprender/auth";
import { Logo } from "@/components/logo";
import { exigirAdmin } from "@/server/admin";
import { IconeApp, type NomeIconeApp } from "@/components/icone-app";

// Os ícones 3D autorais servem os painéis; a landing usa os do Tabler,
// que combinam com o desenho dela. Os nomes aqui vêm dos arquivos em
// `public/icones-app`, então um nome inexistente não compila.
const MENU: { href: string; rotulo: string; icone: NomeIconeApp }[] = [
  { href: "/admin", rotulo: "Visão geral", icone: "estatisticas" },
  // Alunos e turmas moram na mesma tela: o aluno é cadastrado dentro de
  // uma turma, e separá-los obrigava a ir e voltar no meio do cadastro.
  { href: "/admin/alunos", rotulo: "Alunos e turmas", icone: "estudantes" },
  { href: "/admin/turmas", rotulo: "Cronogramas", icone: "calendario" },
  { href: "/admin/cursos", rotulo: "Cursos", icone: "cursos" },
  { href: "/admin/landing", rotulo: "Página inicial", icone: "inicio" },
  { href: "/admin/planos", rotulo: "Planos", icone: "planos" },
  { href: "/admin/assinaturas", rotulo: "Assinaturas", icone: "certificados" },
  { href: "/admin/financeiro", rotulo: "Financeiro", icone: "marketplace" },
  { href: "/admin/solicitacoes", rotulo: "Solicitações", icone: "mensagens" },
  { href: "/admin/notificacoes", rotulo: "Notificações", icone: "notificacoes" },
  { href: "/admin/relatorios", rotulo: "Relatórios", icone: "relatorios" },
  { href: "/admin/configuracoes", rotulo: "Configurações", icone: "configuracoes" },
  { href: "/admin/auditoria", rotulo: "Histórico", icone: "historico" },
  { href: "/admin/perfil", rotulo: "Meu perfil", icone: "perfil" },
];

export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await exigirAdmin();

  return (
    <div className="min-h-screen bg-fundo">
      <header className="border-b border-borda bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <Logo href="/admin" largura={112} prioridade />
            <span className="hidden rounded-full bg-indigo px-3 py-1 font-titulo text-xs font-bold uppercase tracking-wide text-white sm:inline-block">
              Administração
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/perfil"
              className="hidden text-sm font-bold text-tinta-clara hover:text-indigo md:inline"
            >
              {admin.nome}
            </Link>
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
        </div>

        <nav className="mx-auto max-w-7xl overflow-x-auto px-5">
          <ul className="flex gap-1 pb-1">
            {MENU.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-t-md px-4 py-2.5 font-titulo text-sm font-bold text-tinta-clara transition-colors hover:bg-indigo-soft hover:text-indigo-dark"
                >
                  <IconeApp nome={m.icone} tamanho={22} />
                  {m.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl overflow-x-hidden px-5 py-8">{children}</main>
    </div>
  );
}
