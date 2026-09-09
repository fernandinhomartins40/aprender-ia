"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Cadastro() {
  const router = useRouter();
  const [dados, setDados] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    disciplina: "",
    anoEscolar: "",
    escola: "",
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function mudar(campo: keyof typeof dados) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setDados((d) => ({ ...d, [campo]: e.target.value }));
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const resp = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const corpo = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      setErro(corpo.erro ?? "Não foi possível criar a conta. Tente novamente.");
      setCarregando(false);
      return;
    }

    // Entra automaticamente: pedir para logar logo após cadastrar é atrito à toa.
    await signIn("credentials", {
      email: dados.email,
      senha: dados.senha,
      redirect: false,
    });
    router.push("/app");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-grad-capa px-5 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="font-titulo text-2xl font-extrabold text-tinta">
            Aprender<span className="text-laranja">IA</span>
          </Link>
          <h1 className="mt-6 font-titulo text-3xl font-extrabold">
            Comece sua formação
          </h1>
          <p className="mt-2 text-tinta-clara">
            Gratuito para professores. Leva menos de 2 minutos.
          </p>
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

          <form onSubmit={cadastrar} className="space-y-4">
            <div>
              <label htmlFor="nome" className="mb-1.5 block font-titulo text-sm font-bold">
                Nome completo
              </label>
              <input
                id="nome" required value={dados.nome} onChange={mudar("nome")}
                className="campo" placeholder="Como você quer ser chamado(a)"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block font-titulo text-sm font-bold">
                E-mail
              </label>
              <input
                id="email" type="email" required value={dados.email} onChange={mudar("email")}
                className="campo" placeholder="voce@escola.com" autoComplete="email"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="senha" className="mb-1.5 block font-titulo text-sm font-bold">
                  Senha
                </label>
                <input
                  id="senha" type="password" required minLength={8}
                  value={dados.senha} onChange={mudar("senha")}
                  className="campo" placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="confirmar" className="mb-1.5 block font-titulo text-sm font-bold">
                  Repita a senha
                </label>
                <input
                  id="confirmar" type="password" required
                  value={dados.confirmarSenha} onChange={mudar("confirmarSenha")}
                  className="campo" placeholder="A mesma senha"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <fieldset className="rounded-md border border-borda p-4">
              <legend className="px-2 font-titulo text-sm font-bold text-tinta-clara">
                Sobre você <span className="font-normal">(opcional)</span>
              </legend>
              <p className="mb-3 text-sm text-cinza">
                Ajuda a sugerir prompts adequados à sua realidade.
              </p>
              <div className="space-y-3">
                <input
                  value={dados.disciplina} onChange={mudar("disciplina")}
                  className="campo" placeholder="Disciplina (ex: Matemática)"
                  aria-label="Disciplina"
                />
                <input
                  value={dados.anoEscolar} onChange={mudar("anoEscolar")}
                  className="campo" placeholder="Ano/série (ex: 6º ano)"
                  aria-label="Ano ou série"
                />
                <input
                  value={dados.escola} onChange={mudar("escola")}
                  className="campo" placeholder="Escola" aria-label="Escola"
                />
              </div>
            </fieldset>

            <button type="submit" disabled={carregando} className="btn-primario w-full">
              {carregando ? "Criando sua conta..." : "Criar conta e começar"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-borda" />
            <span className="text-sm text-cinza">ou</span>
            <div className="h-px flex-1 bg-borda" />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/app" })}
            className="btn-secundario w-full"
          >
            Continuar com o Google
          </button>

          <p className="mt-6 text-center text-tinta-clara">
            Já tem conta?{" "}
            <Link href="/entrar" className="font-bold text-indigo hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
