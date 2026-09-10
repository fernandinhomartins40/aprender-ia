import Link from "next/link";
import { signOut } from "@aprender/auth";
import { Logo } from "@/components/logo";
import { redirect } from "next/navigation";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { Icone3D, type NomeIcone } from "@/components/icone-3d";

const MENU: { href: string; rotulo: string; icone: NomeIcone }[] = [
  { href: "/app", rotulo: "Início", icone: "star" },
  { href: "/app/trilha", rotulo: "Trilha", icone: "flag" },
  { href: "/app/prompts", rotulo: "Prompts", icone: "bulb" },
  { href: "/app/diario", rotulo: "Diário", icone: "notebook" },
  { href: "/app/conquistas", rotulo: "Conquistas", icone: "medal" },
];

export default async function LayoutAluno({ children }: { children: React.ReactNode }) {
  const user = await exigirAluno();

  // Contas criadas em lote entram com senha provisória. Barramos o acesso
  // à trilha até que o aluno defina a sua — a provisória é adivinhável
  // por quem tem a lista de chamada.
  const conta = await prisma.user.findUnique({
    where: { id: user.id },
    select: { precisaTrocarSenha: true },
  });
  if (conta?.precisaTrocarSenha) redirect("/trocar-senha");

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
                  <Icone3D nome={m.icone} tamanho={22} />
                  {m.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl overflow-x-hidden px-5 py-8">{children}</main>

      {/* barra inferior no celular — onde o polegar alcança */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-borda bg-white md:hidden">
        <ul className="flex">
          {MENU.map((m) => (
            <li key={m.href} className="flex-1">
              <Link
                href={m.href}
                className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-cinza transition-colors hover:text-indigo"
              >
                <Icone3D nome={m.icone} tamanho={26} />
                <span className="font-titulo text-[11px] font-bold">{m.rotulo}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
