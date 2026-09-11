"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CampoSenha } from "@/components/campo-senha";
import { Logo } from "@/components/logo";

export default function Cadastro() {
  const router = useRouter();
  const [dados, setDados] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    codigoTurma: "",
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
          {/* A marca é a logo, não o nome escrito: em texto ela perdia as
              cores e o desenho, e ficava diferente do resto do site. */}
          <Logo largura={132} prioridade />
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

            <div>
              <label htmlFor="telefone" className="mb-1.5 block font-titulo text-sm font-bold">
                Telefone <span className="font-normal text-cinza">(opcional)</span>
              </label>
              <input
                id="telefone" type="tel" inputMode="tel"
                value={dados.telefone} onChange={mudar("telefone")}
                className="campo" placeholder="(11) 98765-4321"
                autoComplete="tel"
              />
              <p className="mt-1 text-sm text-cinza">
                Com ele você também pode entrar na plataforma, no lugar do e-mail.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CampoSenha
                id="senha"
                rotulo="Senha"
                required
                minLength={8}
                value={dados.senha}
                onChange={mudar("senha")}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              <CampoSenha
                id="confirmar"
                rotulo="Repita a senha"
                required
                value={dados.confirmarSenha}
                onChange={mudar("confirmarSenha")}
                placeholder="A mesma senha"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="codigoTurma"
                className="mb-1.5 block font-titulo text-sm font-bold"
              >
                Código do curso <span className="font-normal text-cinza">(opcional)</span>
              </label>
              <input
                id="codigoTurma"
                value={dados.codigoTurma}
                onChange={(e) =>
                  setDados((d) => ({ ...d, codigoTurma: e.target.value.toUpperCase() }))
                }
                className="campo font-mono tracking-widest"
                placeholder="Ex: K7M2PQ"
                maxLength={6}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <p className="mt-1 text-sm text-cinza">
                Recebeu um código na formação presencial? Digite aqui e você já
                entra matriculado na turma certa.
              </p>
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

          <p className="mt-6 text-center text-tinta-clara">
            Já tem conta?{" "}
            <Link
              href="/entrar"
              className="inline-block py-2 font-bold text-indigo hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
