import Link from "next/link";
import { redirect } from "next/navigation";
import { conferirToken, redefinirSenhaComToken } from "@aprender/auth/recuperacao";
import { CampoSenha } from "@/components/campo-senha";

export const dynamic = "force-dynamic";

/**
 * Tela de criação da nova senha, aberta pelo link do e-mail.
 *
 * O token é conferido no servidor antes de desenhar o formulário: um
 * link vencido mostra o aviso, e não um formulário que falharia só
 * depois de a pessoa digitar tudo.
 */
export default async function RedefinirSenha({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { token } = await params;
  const { erro } = await searchParams;

  const conferencia = await conferirToken(token);

  async function definir(dados: FormData) {
    "use server";
    const nova = String(dados.get("novaSenha") ?? "");
    const confirmar = String(dados.get("confirmarSenha") ?? "");

    if (nova !== confirmar) {
      redirect(`/redefinir-senha/${token}?erro=diferentes`);
    }

    const r = await redefinirSenhaComToken(token, nova);
    if (!r.ok) {
      redirect(`/redefinir-senha/${token}?erro=${encodeURIComponent(r.erro)}`);
    }

    redirect("/entrar?senhaRedefinida=1");
  }

  const MENSAGENS_ERRO: Record<string, string> = {
    diferentes: "As senhas não conferem. Digite a mesma nos dois campos.",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-grad-capa px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-titulo text-2xl font-extrabold text-tinta">
            Aprender<span className="text-laranja">IA</span>
          </Link>
          <h1 className="mt-6 font-titulo text-3xl font-extrabold">
            {conferencia.valido ? "Crie sua nova senha" : "Link indisponível"}
          </h1>
          {conferencia.valido && (
            <p className="mt-2 text-tinta-clara">
              Olá, {conferencia.nome.split(" ")[0]}. Escolha uma senha só sua.
            </p>
          )}
        </div>

        <div className="card">
          {!conferencia.valido ? (
            <div>
              <div
                role="alert"
                className="rounded-md border-l-4 border-vermelho bg-vermelho-soft p-4 text-vermelho-dark"
              >
                {conferencia.motivo === "expirado" &&
                  "Este link expirou — ele vale por 1 hora depois do pedido."}
                {conferencia.motivo === "usado" &&
                  "Este link já foi usado. Cada link serve uma vez só."}
                {conferencia.motivo === "inexistente" &&
                  "Este link não é válido. Ele pode ter sido substituído por um pedido mais recente."}
              </div>
              <Link href="/recuperar-senha" className="btn-primario mt-5 w-full">
                Pedir um novo link
              </Link>
            </div>
          ) : (
            <>
              {erro && (
                <div
                  role="alert"
                  className="mb-5 rounded-md border-l-4 border-vermelho bg-vermelho-soft p-4 text-vermelho-dark"
                >
                  {MENSAGENS_ERRO[erro] ?? erro}
                </div>
              )}

              <form action={definir} className="space-y-4">
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
                  rotulo="Repita a nova senha"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button type="submit" className="btn-primario w-full">
                  Salvar nova senha
                </button>
              </form>

              <p className="mt-5 text-sm text-cinza">
                Ao salvar, você será desconectado dos outros dispositivos.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
