import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@aprender/auth";

export default async function PainelAluno() {
  const sessao = await auth();
  if (!sessao?.user) redirect("/entrar?proximo=/app");

  const { nome, papel } = sessao.user;
  const primeiroNome = nome?.split(" ")[0] ?? "professor(a)";

  return (
    <main className="min-h-screen bg-fundo">
      <header className="border-b border-borda bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/app" className="font-titulo text-xl font-extrabold">
            Aprender<span className="text-laranja">IA</span>
          </Link>
          <div className="flex items-center gap-3">
            {papel === "ADMIN" && (
              <Link href="/admin" className="btn-fantasma">
                Administração
              </Link>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="btn-fantasma">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-titulo text-3xl font-extrabold">
          Olá, {primeiroNome}
        </h1>
        <p className="mt-2 text-lg text-tinta-clara">
          Sua trilha está sendo preparada. Em breve você começa pelo Encontro 1.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="card text-center">
            <div className="font-titulo text-3xl font-extrabold text-xp">0</div>
            <p className="mt-1 text-tinta-clara">XP acumulado</p>
          </div>
          <div className="card text-center">
            <div className="font-titulo text-3xl font-extrabold text-streak">0</div>
            <p className="mt-1 text-tinta-clara">Dias de ofensiva</p>
          </div>
          <div className="card text-center">
            <div className="font-titulo text-3xl font-extrabold text-indigo">0</div>
            <p className="mt-1 text-tinta-clara">Lições concluídas</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-indigo-soft p-7">
          <h2 className="font-titulo text-xl font-bold text-indigo-dark">
            Em construção
          </h2>
          <p className="mt-2 text-indigo-dark">
            A trilha com os 4 encontros, os prompts práticos e os exercícios
            chega na próxima etapa do desenvolvimento.
          </p>
        </div>
      </div>
    </main>
  );
}
