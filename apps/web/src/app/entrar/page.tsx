"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { CampoSenha } from "@/components/campo-senha";

/**
 * Chave do identificador lembrado.
 *
 * Guardamos APENAS o e-mail/telefone — nunca a senha. Muitos professores
 * acessam do computador compartilhado da sala dos professores, onde uma
 * senha salva entregaria a conta a quem sentar depois.
 */
const CHAVE_IDENTIFICADOR = "aprenderia:identificador";

function FormularioEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const proximo = params.get("proximo") ?? "/app";
  const senhaRedefinida = params.get("senhaRedefinida") === "1";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [salvarDados, setSalvarDados] = useState(false);
  const [manterConectado, setManterConectado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Recupera o identificador lembrado. Em aba anônima ou com o
  // armazenamento bloqueado, o acesso lança — e a tela precisa abrir
  // normalmente mesmo assim.
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CHAVE_IDENTIFICADOR);
      if (guardado) {
        setEmail(guardado);
        setSalvarDados(true);
      }
    } catch {
      /* sem armazenamento: segue com o formulário vazio */
    }
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      if (salvarDados) {
        window.localStorage.setItem(CHAVE_IDENTIFICADOR, email);
      } else {
        window.localStorage.removeItem(CHAVE_IDENTIFICADOR);
      }
    } catch {
      /* não impedir o login por causa do armazenamento */
    }

    // O signIn precisa estar protegido: se a promessa rejeitar (rede
    // instável, service worker interceptando, requisição pendurada), um
    // erro solto aqui aborta a função ANTES de `setCarregando(false)` e o
    // botão fica preso em "Entrando..." para sempre — o usuário só sai
    // disso recarregando a página.
    try {
      const r = await signIn("credentials", {
        email,
        senha,
        // Vira o prazo da sessão no callback `jwt`: 30 dias com a caixa
        // marcada, 12 horas sem ela (e o cookie morre ao fechar o navegador).
        manterConectado: String(manterConectado),
        redirect: false,
      });

      if (r?.error) {
        // Mensagem genérica de propósito: dizer "e-mail não existe" ajudaria
        // alguém a descobrir quem tem conta na plataforma.
        setErro("E-mail/telefone ou senha incorretos. Confira os dados e tente de novo.");
        setCarregando(false);
        return;
      }

      router.push(proximo);
      router.refresh();
    } catch {
      setErro(
        "Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo.",
      );
      setCarregando(false);
    }
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
          {senhaRedefinida && (
            <div
              role="status"
              className="mb-5 rounded-md border-l-4 border-verde bg-verde-soft p-4 text-verde-dark"
            >
              Senha alterada com sucesso. Entre com a nova senha.
            </div>
          )}

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

            <div className="space-y-3 pt-1">
              <label
                htmlFor="salvarDados"
                className="flex min-h-[44px] cursor-pointer items-center gap-3"
              >
                <input
                  id="salvarDados"
                  type="checkbox"
                  checked={salvarDados}
                  onChange={(e) => setSalvarDados(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded border-2 border-borda accent-indigo"
                />
                <span className="text-sm">
                  <span className="font-titulo font-bold">Salvar meu e-mail</span>
                  <span className="block text-cinza">
                    Deixa preenchido na próxima vez. A senha nunca é guardada.
                  </span>
                </span>
              </label>

              <label
                htmlFor="manterConectado"
                className="flex min-h-[44px] cursor-pointer items-center gap-3"
              >
                <input
                  id="manterConectado"
                  type="checkbox"
                  checked={manterConectado}
                  onChange={(e) => setManterConectado(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded border-2 border-borda accent-indigo"
                />
                <span className="text-sm">
                  <span className="font-titulo font-bold">Manter conectado</span>
                  <span className="block text-cinza">
                    Por 30 dias. Não marque em computador compartilhado.
                  </span>
                </span>
              </label>
            </div>

            <button type="submit" disabled={carregando} className="btn-primario w-full">
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-5 text-center">
            <Link
              href="/recuperar-senha"
              className="inline-block py-2 text-tinta-clara hover:text-indigo hover:underline"
            >
              Esqueci minha senha
            </Link>
          </p>

          <p className="mt-1 text-center text-tinta-clara">
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
