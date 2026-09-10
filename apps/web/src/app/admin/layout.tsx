import Link from "next/link";
import { signOut } from "@aprender/auth";
import { Logo } from "@/components/logo";
import { exigirAdmin } from "@/server/admin";
import { Icone3D, type NomeIcone } from "@/components/icone-3d";

const MENU: { href: string; rotulo: string; icone: NomeIcone }[] = [
  { href: "/admin", rotulo: "Visão geral", icone: "chart" },
  { href: "/admin/alunos", rotulo: "Alunos", icone: "heart" },
  { href: "/admin/cursos", rotulo: "Cursos", icone: "notebook" },
  { href: "/admin/turmas", rotulo: "Turmas", icone: "crown" },
  { href: "/admin/perfil", rotulo: "Meu perfil", icone: "setting" },
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
                  <Icone3D nome={m.icone} tamanho={22} />
                  {m.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
