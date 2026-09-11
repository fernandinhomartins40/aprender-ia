import { redirect } from "next/navigation";
import { auth } from "@aprender/auth";
import { EntradaApp } from "@/components/entrada-app";

/**
 * Porta de entrada do aplicativo instalado.
 *
 * O PWA abre em `/app`. Sem sessão, o middleware mandava para `/entrar`,
 * que é o formulário da landing — com cabeçalho, rodapé e largura de
 * site. Dentro de um aplicativo em tela cheia, isso denuncia que ali é
 * uma página web.
 *
 * Esta rota vive DENTRO do escopo `/app`, então continua no aplicativo:
 * abre com a marca, depois mostra um login desenhado para o polegar.
 *
 * Quem já entrou não passa por aqui — vai direto para a trilha.
 */
export const dynamic = "force-dynamic";

export default async function EntrarNoApp({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const sessao = await auth();
  const { proximo } = await searchParams;

  // Sessão válida não vê tela de login: seria um passo a mais sem motivo.
  if (sessao?.user) redirect(proximo || "/app");

  return <EntradaApp proximo={proximo ?? "/app"} />;
}
