import { redirect } from "next/navigation";
import { auth } from "@aprender/auth";
import { prisma } from "@aprender/db";
import { gerarHashSenha } from "@aprender/auth";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";

async function definirSenha(dados: FormData) {
  "use server";
  const sessao = await auth();
  if (!sessao?.user) redirect("/entrar");

  const nova = String(dados.get("novaSenha") ?? "");
  const confirmar = String(dados.get("confirmarSenha") ?? "");

  if (nova.length < 8 || nova !== confirmar) {
    redirect("/trocar-senha?erro=1");
  }

  await prisma.user.update({
    where: { id: sessao.user.id },
    data: {
      senhaHash: await gerarHashSenha(nova),
      precisaTrocarSenha: false,
    },
  });

  redirect("/app");
}

export default async function TrocarSenha({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const sessao = await auth();
  if (!sessao?.user) redirect("/entrar?proximo=/trocar-senha");

  const { erro } = await searchParams;
  const primeiroNome = sessao.user.nome?.split(" ")[0] ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-grad-capa px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo href={null} largura={150} prioridade />
          <h1 className="mt-6 font-titulo text-2xl font-extrabold">
            Bem-vindo(a), {primeiroNome}
          </h1>
          <p className="mt-2 text-tinta-clara">
            Antes de começar, crie uma senha só sua.
          </p>
        </div>

        <div className="card">
          <div className="mb-5 rounded-md border-l-4 border-amarelo bg-amarelo-soft p-4">
            <p className="text-sm text-amarelo-dark">
              A senha que você recebeu é provisória e fácil de adivinhar.
              Escolha uma nova para proteger o seu progresso.
            </p>
          </div>

          {erro && (
            <div
              role="alert"
              className="mb-5 rounded-md border-l-4 border-vermelho bg-vermelho-soft p-4 text-vermelho-dark"
            >
              As senhas precisam ter ao menos 8 caracteres e ser iguais.
            </div>
          )}

          <form action={definirSenha} className="space-y-4">
            <div>
              <label htmlFor="novaSenha" className="mb-1 block font-titulo text-sm font-bold">
                Nova senha
              </label>
              <input
                id="novaSenha" name="novaSenha" type="password" required minLength={8}
                autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                className="campo"
              />
            </div>
            <div>
              <label htmlFor="confirmarSenha" className="mb-1 block font-titulo text-sm font-bold">
                Repita a senha
              </label>
              <input
                id="confirmarSenha" name="confirmarSenha" type="password" required minLength={8}
                autoComplete="new-password" className="campo"
              />
            </div>
            <button type="submit" className="btn-primario w-full">
              Criar minha senha e começar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
