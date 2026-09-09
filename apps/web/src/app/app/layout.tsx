import Link from "next/link";
import { signOut } from "@aprender/auth";
import { Logo } from "@/components/logo";
import { exigirAluno } from "@/server/trilha";

const MENU = [
  { href: "/app", rotulo: "Início", icone: "🏠" },
  { href: "/app/trilha", rotulo: "Trilha", icone: "🗺️" },
  { href: "/app/prompts", rotulo: "Prompts", icone: "⚡" },
  { href: "/app/diario", rotulo: "Diário", icone: "📔" },
  { href: "/app/conquistas", rotulo: "Conquistas", icone: "🏅" },
];

export default async function LayoutAluno({ children }: { children: React.ReactNode }) {
  const user = await exigirAluno();

  return (
    <div className="min-h-screen bg-fundo pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-borda bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Logo href="/app" largura={112} prioridade />

          <div className="flex items-center gap-2">
            {user.papel === "ADMIN" && (
              <Link href="/admin" className="btn-fantasma text-sm">
                Administração
              </Link>
            )}
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

        {/* menu no desktop */}
        <nav className="mx-auto hidden max-w-5xl px-5 md:block">
          <ul className="flex gap-1 pb-1">
            {MENU.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="inline-flex items-center gap-2 rounded-t-md px-4 py-2.5 font-titulo text-sm font-bold text-tinta-clara transition-colors hover:bg-indigo-soft hover:text-indigo-dark"
                >
                  <span aria-hidden="true">{m.icone}</span>
                  {m.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>

      {/* barra inferior no celular — onde o polegar alcança */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-borda bg-white md:hidden">
        <ul className="flex">
          {MENU.map((m) => (
            <li key={m.href} className="flex-1">
              <Link
                href={m.href}
                className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-cinza transition-colors hover:text-indigo"
              >
                <span className="text-xl" aria-hidden="true">{m.icone}</span>
                <span className="font-titulo text-[11px] font-bold">{m.rotulo}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
