"use client";

import { useActionState, useState } from "react";
import type { EstadoChave, ResultadoChave } from "@/server/credenciais-email";

type Acao = (
  anterior: ResultadoChave | null,
  dados: FormData,
) => Promise<ResultadoChave>;

function Recado({ estado }: { estado: ResultadoChave | null }) {
  if (!estado) return null;
  return (
    <div
      role="status"
      className={`mt-4 rounded-md border-l-4 px-4 py-3 text-sm ${
        estado.ok
          ? "border-verde bg-verde-soft text-verde-dark"
          : "border-vermelho bg-vermelho-soft text-vermelho-dark"
      }`}
    >
      {estado.mensagem}
    </div>
  );
}

/**
 * Formulário da credencial de envio.
 *
 * O campo entra sempre vazio: a chave gravada não é relida, é
 * substituída. O que a tela mostra é a versão mascarada, para o
 * administrador reconhecer qual credencial está ativa sem que o segredo
 * trafegue de volta para o navegador.
 */
export function FormChaveEmail({
  estadoAtual,
  acaoSalvar,
  acaoTestar,
  acaoRemover,
  emailDoAdmin,
}: {
  estadoAtual: EstadoChave;
  acaoSalvar: Acao;
  acaoTestar: Acao;
  acaoRemover: () => Promise<ResultadoChave>;
  emailDoAdmin: string;
}) {
  const [salvou, salvar, salvando] = useActionState(acaoSalvar, null);
  const [testou, testar, testando] = useActionState(acaoTestar, null);
  const [visivel, setVisivel] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [removeu, setRemoveu] = useState<ResultadoChave | null>(null);

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="font-titulo text-xl font-extrabold">Estado atual</h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-cinza">Situação:</dt>
            <dd>
              {estadoAtual.configurada ? (
                <span className="rounded-full bg-verde-soft px-2.5 py-0.5 text-xs font-bold text-verde-dark">
                  Chave configurada
                </span>
              ) : (
                <span className="rounded-full bg-vermelho-soft px-2.5 py-0.5 text-xs font-bold text-vermelho-dark">
                  Sem chave — e-mails não são enviados
                </span>
              )}
            </dd>
          </div>

          {estadoAtual.mascarada && (
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-cinza">Chave:</dt>
              <dd className="font-mono">{estadoAtual.mascarada}</dd>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-cinza">Origem:</dt>
            <dd>
              {estadoAtual.origem === "banco"
                ? "Salva por aqui (o painel tem prioridade)"
                : estadoAtual.origem === "ambiente"
                  ? "Variável de ambiente da VPS — salvar aqui substitui"
                  : "Nenhuma"}
            </dd>
          </div>

          {estadoAtual.atualizadoPor && (
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-cinza">Alterada por:</dt>
              <dd>
                {estadoAtual.atualizadoPor}
                {estadoAtual.atualizadoEm &&
                  ` em ${new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(estadoAtual.atualizadoEm))}`}
              </dd>
            </div>
          )}
        </dl>

        {estadoAtual.aviso && (
          <p className="mt-4 rounded-md border-l-4 border-vermelho bg-vermelho-soft px-4 py-3 text-sm text-vermelho-dark">
            {estadoAtual.aviso}
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="font-titulo text-xl font-extrabold">Trocar a chave</h2>
        <p className="mt-1 text-sm text-tinta-clara">
          Gere uma <strong>API key padrão</strong> (começa com <code>re_</code>) em{" "}
          <em>API Keys</em> no painel da VeloMail. A{" "}
          <em>AI Agent Key</em> (<code>uai_</code>) serve só para conectar a IDE e
          não envia e-mail.
        </p>

        <form action={salvar} className="mt-4 space-y-3">
          <label htmlFor="chave" className="block font-titulo text-sm font-bold">
            Nova chave
          </label>
          <input
            id="chave"
            name="chave"
            type={visivel ? "text" : "password"}
            autoComplete="off"
            spellCheck={false}
            placeholder="re_..."
            className="campo max-w-xl font-mono text-sm"
          />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-cinza">
              <input
                type="checkbox"
                checked={visivel}
                onChange={(e) => setVisivel(e.target.checked)}
                className="h-4 w-4 rounded border-2 border-borda accent-indigo"
              />
              Mostrar enquanto digito
            </label>
          </div>

          <p className="text-xs text-cinza">
            A chave fica guardada no banco e nunca é exibida de volta por
            inteiro. Ela vale imediatamente, sem novo deploy.
          </p>

          <button type="submit" disabled={salvando} className="btn-primario">
            {salvando ? "Salvando..." : "Salvar chave"}
          </button>
        </form>

        <Recado estado={salvou} />

        {estadoAtual.origem === "banco" && (
          <form
            action={async () => {
              setRemovendo(true);
              setRemoveu(await acaoRemover());
              setRemovendo(false);
            }}
            className="mt-5 border-t border-borda pt-4"
          >
            <button
              type="submit"
              disabled={removendo}
              className="text-xs font-bold text-cinza hover:text-vermelho"
            >
              {removendo ? "Removendo..." : "Remover a chave salva aqui"}
            </button>
          </form>
        )}

        <Recado estado={removeu} />
      </section>

      <section className="card">
        <h2 className="font-titulo text-xl font-extrabold">Testar envio</h2>
        <p className="mt-1 text-sm text-tinta-clara">
          Salvar não prova que funciona: a VeloMail pode recusar a chave ou o
          domínio. Envie um teste de verdade e confirme na caixa de entrada.
        </p>

        <form action={testar} className="mt-4 space-y-3">
          <label htmlFor="destino" className="block font-titulo text-sm font-bold">
            Enviar para
          </label>
          <input
            id="destino"
            name="destino"
            type="email"
            defaultValue={emailDoAdmin}
            className="campo max-w-md"
          />
          <button type="submit" disabled={testando} className="btn-primario">
            {testando ? "Enviando..." : "Enviar teste"}
          </button>
        </form>

        <Recado estado={testou} />
      </section>
    </div>
  );
}
