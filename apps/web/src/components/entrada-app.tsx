"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CampoSenha } from "@/components/campo-senha";
import { ConviteInstalar } from "@/components/convite-instalar";
import { Logo } from "@/components/logo";

/**
 * Abertura e login do aplicativo.
 *
 * A marca aparece por um instante e sai — é o tempo de a pessoa
 * reconhecer onde está, não uma espera imposta. `prefers-reduced-motion`
 * pula a animação por completo.
 *
 * O formulário é desenhado para o polegar: campos altos, um por linha,
 * botão da largura da tela. Nada de duas colunas nem de cabeçalho de
 * site, que é o que fazia a tela de login parecer uma página web dentro
 * do aplicativo.
 */

// O vídeo encerra a abertura normalmente. Este limite evita que uma falha de
// rede, cache ou decodificação deixe a pessoa presa na tela inicial.
const DURACAO_MAXIMA_ABERTURA = 3500;
const CHAVE_IDENTIFICADOR = "aprenderia:identificador";

export function EntradaApp({ proximo }: { proximo: string }) {
  const router = useRouter();
  const [abrindo, setAbrindo] = useState(true);

  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(true);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento) {
      setAbrindo(false);
      return;
    }
    const t = setTimeout(() => setAbrindo(false), DURACAO_MAXIMA_ABERTURA);
    return () => clearTimeout(t);
  }, []);

  // O identificador salvo no aparelho poupa digitação a cada abertura.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_IDENTIFICADOR);
      if (salvo) setIdentificador(salvo);
    } catch {
      /* navegador com armazenamento bloqueado: segue sem preencher */
    }
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      localStorage.setItem(CHAVE_IDENTIFICADOR, identificador);
    } catch {
      /* não impede o login */
    }

    // O signIn fica dentro do try: uma promessa rejeitada fora dele
    // abortaria a função antes de `setCarregando(false)` e o botão
    // ficaria preso em "Entrando…".
    try {
      const r = await signIn("credentials", {
        email: identificador,
        senha,
        manterConectado: String(manterConectado),
        redirect: false,
      });

      if (r?.error) {
        setErro("E-mail/telefone ou senha incorretos.");
        setCarregando(false);
        return;
      }

      router.push(proximo);
      router.refresh();
    } catch {
      setErro("Não conseguimos falar com o servidor. Verifique sua conexão.");
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-grad-marca">
      {/* ---- Abertura ---- */}
      <div
        aria-hidden={!abrindo}
        className={`absolute inset-0 z-10 flex items-center justify-center bg-grad-marca transition-opacity duration-500 ${
          abrindo ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onEnded={() => setAbrindo(false)}
          onError={() => setAbrindo(false)}
        >
          <source src="/abertura/video_abertura.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ---- Login ---- */}
      <div
        className={`flex flex-1 flex-col transition-opacity duration-500 ${
          abrindo ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center px-6 pb-6 pt-[calc(2.5rem+env(safe-area-inset-top))]">
          {/* A marca é a logo, não o ícone do aplicativo: o quadradinho
              serve para a tela inicial do aparelho, mas aqui, onde há
              espaço, quem identifica a plataforma é o logotipo escrito. */}
          <Logo href={null} largura={190} prioridade className="h-auto w-44" />
          <h1 className="mt-4 text-center font-titulo text-2xl font-extrabold text-white">
            Que bom te ver
          </h1>
          <p className="mt-1 text-center text-sm text-white/80">
            Entre para continuar de onde parou.
          </p>

          {/* Fica aqui, e não em `/entrar`, porque só dentro do `scope`
              `/app` o navegador considera a página instalável. */}
          <div className="mt-5 w-full max-w-sm">
            <ConviteInstalar tom="claro" />
          </div>
        </div>

        <div className="flex-1 rounded-t-3xl bg-white px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-7">
          <form onSubmit={entrar} className="mx-auto max-w-sm space-y-4">
            {erro && (
              <p
                role="alert"
                className="rounded-xl bg-vermelho-soft px-4 py-3 text-sm font-semibold text-vermelho-dark"
              >
                {erro}
              </p>
            )}

            <label className="block">
              <span className="mb-1.5 block font-titulo text-sm font-bold text-tinta-clara">
                E-mail ou telefone
              </span>
              <input
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
                autoComplete="username"
                inputMode="email"
                placeholder="seu@email.com"
                className="campo h-14 w-full text-base"
              />
            </label>

            {/* O componente traz o próprio rótulo e o botão de revelar. */}
            <CampoSenha
              rotulo="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />

            <label className="flex items-center gap-2.5 py-1 text-sm font-semibold text-tinta-clara">
              <input
                type="checkbox"
                checked={manterConectado}
                onChange={(e) => setManterConectado(e.target.checked)}
                className="h-5 w-5"
              />
              Manter conectado neste aparelho
            </label>

            <button
              type="submit"
              disabled={carregando}
              className="btn-primario h-14 w-full text-base"
            >
              {carregando ? "Entrando…" : "Entrar"}
            </button>

            {/* Estas duas telas vivem fora do `scope` `/app` do manifest.
                Navegar para elas dentro do aplicativo instalado trocava a
                janela do app pelo navegador e a pessoa não voltava. Em aba
                nova, o aplicativo continua aberto atrás: ela resolve a
                senha ou o cadastro e volta para cá. */}
            <div className="flex flex-col items-center gap-3 pt-2 text-sm">
              <Link
                href="/recuperar-senha"
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-[44px] items-center font-bold text-indigo"
              >
                Esqueci minha senha
              </Link>
              <Link
                href="/cadastro"
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-[44px] items-center text-tinta-clara"
              >
                Ainda não tenho conta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
