"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { CampoSenha } from "@/components/campo-senha";

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
      setErro("E-mail/telefone ou senha incorretos. Confira os dados e tente de novo.");
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

            <CampoSenha
              id="senha"
              rotulo="Senha"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
            />

            <button type="submit" disabled={carregando} className="btn-primario w-full">
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

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
