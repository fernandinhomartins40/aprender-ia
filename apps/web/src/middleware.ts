import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protege as áreas privadas.
 *
 * Aqui só verificamos a PRESENÇA do cookie de sessão — validar a
 * assinatura exigiria o runtime Node, e o middleware roda no Edge.
 * A verificação real de papel acontece em cada página/rota via auth().
 */
const COOKIES_SESSAO = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // A entrada do aplicativo não pode exigir sessão — é onde a pessoa faz
  // login. Sem esta saída, ela cairia num redirecionamento infinito.
  if (pathname.startsWith("/app/entrar")) return NextResponse.next();

  const temSessao = COOKIES_SESSAO.some((c) => req.cookies.has(c));

  if (!temSessao) {
    // Quem está no aplicativo vai para a tela de login DELE, dentro do
    // escopo `/app`. Mandar para `/entrar` tirava a pessoa do aplicativo
    // instalado e mostrava o formulário da landing, com cabeçalho e
    // rodapé de site — a experiência que denuncia "isto é um site".
    const destino = pathname.startsWith("/app") ? "/app/entrar" : "/entrar";
    const url = new URL(destino, req.url);
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
