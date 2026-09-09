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
  const temSessao = COOKIES_SESSAO.some((c) => req.cookies.has(c));

  if (!temSessao) {
    const url = new URL("/entrar", req.url);
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
