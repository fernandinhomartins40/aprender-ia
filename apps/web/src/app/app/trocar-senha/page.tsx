import { redirect } from "next/navigation";
import { auth } from "@aprender/auth";
import { prisma } from "@aprender/db";
import { gerarHashSenha } from "@aprender/auth";
import Image from "next/image";
import { CampoSenha } from "@/components/campo-senha";

/**
 * Troca da senha provisória, DENTRO do aplicativo.
 *
 * A tela equivalente em `/trocar-senha` continua existindo para quem
 * entra pelo navegador. O problema era o aplicativo instalado: o layout
 * do aluno mandava para `/trocar-senha`, que fica FORA do `scope` `/app`
 * do manifest. No PWA, sair do escopo abre a barra do navegador — ou
 * seja, quem recebia senha provisória era expulso do aplicativo logo no
 * primeiro acesso, justamente a pessoa que ainda não conhece a
 * plataforma.
 *
 * Esta rota vive dentro do escopo e usa o desenho do aplicativo: fundo da
 * marca, campos altos, botão da largura da tela.
 */
export const dynamic = "force-dynamic";

async function definirSenha(dados: FormData) {
  "use server";
  const sessao = await auth();
  if (!sessao?.user) redirect("/app/entrar");

  const nova = String(dados.get("novaSenha") ?? "");
  const confirmar = String(dados.get("confirmarSenha") ?? "");

  if (nova.length < 8 || nova !== confirmar) {
    redirect("/app/trocar-senha?erro=1");
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

export default async function TrocarSenhaApp({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const sessao = await auth();
  if (!sessao?.user) redirect("/app/entrar?proximo=/app/trocar-senha");

  const { erro } = await searchParams;
  const primeiroNome = sessao.user.nome?.split(" ")[0] ?? "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-grad-marca">
      <div className="flex flex-col items-center px-6 pb-6 pt-[calc(2.5rem+env(safe-area-inset-top))]">
        <Image
          src="/icones/icone-192.png"
          alt=""
          aria-hidden
          width={80}
          height={80}
          className="h-auto w-16"
        />
        <h1 className="mt-4 text-center font-titulo text-2xl font-extrabold text-white">
          Bem-vindo(a), {primeiroNome}
        </h1>
        <p className="mt-1 text-center text-sm text-white/80">
          Antes de começar, crie uma senha só sua.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-t-3xl bg-white px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-7">
        <form action={definirSenha} className="mx-auto max-w-sm space-y-4">
          <div className="rounded-xl bg-amarelo-soft p-4">
            <p className="text-sm text-amarelo-dark">
              A senha que você recebeu é provisória e fácil de adivinhar.
              Escolha uma nova para proteger o seu progresso.
            </p>
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-xl bg-vermelho-soft px-4 py-3 text-sm font-semibold text-vermelho-dark"
            >
              As senhas precisam ter ao menos 8 caracteres e ser iguais.
            </p>
          )}

          <CampoSenha
            id="novaSenha"
            name="novaSenha"
            rotulo="Nova senha"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
          />
          <CampoSenha
            id="confirmarSenha"
            name="confirmarSenha"
            rotulo="Repita a senha"
            required
            minLength={8}
            autoComplete="new-password"
          />

          <button type="submit" className="btn-primario h-14 w-full text-base">
            Criar minha senha e começar
          </button>
        </form>
      </div>
    </div>
  );
}
