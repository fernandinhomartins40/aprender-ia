"use client";

import { useState } from "react";
import Link from "next/link";

export default function RecuperarSenha() {
  const [identificador, setIdentificador] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [linkDev, setLinkDev] = useState("");

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const resp = await fetch("/api/recuperar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificador }),
    });

    const corpo = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      setErro(corpo.erro ?? "Não foi possível processar o pedido. Tente de novo.");
      setCarregando(false);
      return;
    }

    if (corpo.linkDesenvolvimento) setLinkDev(corpo.linkDesenvolvimento);
    setEnviado(true);
    setCarregando(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-grad-capa px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-titulo text-2xl font-extrabold text-tinta">
            Aprender<span className="text-laranja">IA</span>
          </Link>
          <h1 className="mt-6 font-titulo text-3xl font-extrabold">
            Esqueceu a senha?
          </h1>
          <p className="mt-2 text-tinta-clara">
            Acontece. Vamos criar uma nova.
          </p>
        </div>

        <div className="card">
          {enviado ? (
            <div>
              <div
                role="status"
                className="rounded-md border-l-4 border-verde bg-verde-soft p-4 text-verde-dark"
              >
                <p className="font-titulo font-bold">Pedido registrado</p>
                <p className="mt-1">
                  Se houver uma conta com esse e-mail, o link para criar a nova
                  senha chega em instantes. Ele vale por 1 hora.
                </p>
              </div>

              <div className="mt-5 rounded-md bg-indigo-soft px-4 py-3 text-sm text-indigo-dark">
                <p className="font-bold">Não recebeu?</p>
                <p className="mt-1">
                  Confira a caixa de spam. Se você entra na plataforma pelo
                  <strong> telefone</strong>, sua conta não tem e-mail de
                  verdade — nesse caso, peça a nova senha a quem ministrou o
                  curso.
                </p>
              </div>

              {linkDev && (
                <div className="mt-5 rounded-md border-l-4 border-amarelo bg-amarelo-soft p-4">
                  <p className="font-titulo text-sm font-bold text-amarelo-dark">
                    Modo de desenvolvimento
                  </p>
                  <p className="mt-1 text-sm text-amarelo-dark">
                    Não há SMTP configurado, então o e-mail não foi enviado.
                    Use o link abaixo para testar:
                  </p>
                  <a
                    href={linkDev}
                    className="mt-2 block break-all font-mono text-sm text-indigo hover:underline"
                  >
                    {linkDev}
                  </a>
                </div>
              )}

              <p className="mt-6 text-center text-tinta-clara">
                <Link href="/entrar" className="inline-flex min-h-[44px] items-center font-bold text-indigo hover:underline">
                  Voltar para o login
                </Link>
              </p>
            </div>
          ) : (
            <>
              {erro && (
                <div
                  role="alert"
                  className="mb-5 rounded-md border-l-4 border-vermelho bg-vermelho-soft p-4 text-vermelho-dark"
                >
                  {erro}
                </div>
              )}

              <form onSubmit={pedir} className="space-y-4">
                <div>
                  <label
                    htmlFor="identificador"
                    className="mb-1.5 block font-titulo text-sm font-bold"
                  >
                    E-mail ou telefone da conta
                  </label>
                  <input
                    id="identificador"
                    type="text"
                    required
                    autoComplete="username"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    className="campo"
                    placeholder="seu@email.com ou 11987654321"
                  />
                  <p className="mt-1 text-sm text-cinza">
                    Enviaremos um link para você criar uma nova senha.
                  </p>
                </div>

                <button type="submit" disabled={carregando} className="btn-primario w-full">
                  {carregando ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>

              <p className="mt-6 text-center text-tinta-clara">
                Lembrou a senha?{" "}
                <Link href="/entrar" className="inline-flex min-h-[44px] items-center font-bold text-indigo hover:underline">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
