"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function FormularioEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const proximo = params.get("proximo") ?? "/app";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const r = await signIn("credentials", { email, senha, redirect: false });

    if (r?.error) {
      // Mensagem genérica de propósito: dizer "e-mail não existe" ajudaria
      // alguém a descobrir quem tem conta na plataforma.
      setErro("E-mail/telefone ou senha incorretos. Se você entrou com o Google antes, use o botão do Google.");
      setCarregando(false);
      return;
    }

    router.push(proximo);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-grad-capa px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-titulo text-2xl font-extrabold text-tinta">
            Aprender<span className="text-laranja">IA</span>
          </Link>
          <h1 className="mt-6 font-titulo text-3xl font-extrabold">Que bom te ver de novo</h1>
          <p className="mt-2 text-tinta-clara">Continue de onde você parou.</p>
        </div>

        <div className="card">
          {erro && (
            <div
              role="alert"
              className="mb-5 rounded-md border-l-4 border-vermelho bg-vermelho-soft p-4 text-vermelho-dark"
            >
              {erro}
            </div>
          )}

          <form onSubmit={entrar} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block font-titulo text-sm font-bold">
                E-mail ou telefone
              </label>
              <input
                id="email"
                type="text"
                inputMode="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="campo"
                placeholder="seu@email.com ou 11987654321"
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block font-titulo text-sm font-bold">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="campo"
                placeholder="Sua senha"
              />
            </div>

            <button type="submit" disabled={carregando} className="btn-primario w-full">
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-borda" />
            <span className="text-sm text-cinza">ou</span>
            <div className="h-px flex-1 bg-borda" />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: proximo })}
            className="btn-secundario w-full"
          >
            Entrar com o Google
          </button>

          <p className="mt-6 text-center text-tinta-clara">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-bold text-indigo hover:underline">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function Entrar() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-grad-capa px-5">
          <p className="text-tinta-clara">Carregando...</p>
        </main>
      }
    >
      <FormularioEntrar />
    </Suspense>
  );
}
