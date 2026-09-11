import { redirect } from "next/navigation";
import { auth } from "@aprender/auth";

/**
 * Para onde ir depois de entrar, quando a URL não disse.
 *
 * O `signIn` do lado do cliente não devolve o papel da pessoa, então
 * quem decide é o servidor, que já tem a sessão. Antes o destino era
 * sempre `/app`: um administrador caía na área do aluno e precisava
 * achar o link "Administração" para chegar ao painel.
 *
 * Com `?proximo=` na URL (o caso do middleware), esta rota nem é
 * visitada — o cliente vai direto ao destino pedido.
 */
export const dynamic = "force-dynamic";

export default async function DestinoAposEntrar() {
  const sessao = await auth();

  if (!sessao?.user) redirect("/entrar");
  redirect(sessao.user.papel === "ADMIN" ? "/admin" : "/app");
}
