"use client";

import { useActionState } from "react";
import type { ResultadoConfig } from "@/server/configuracoes";
import type { TipoConfiguracao } from "@aprender/db";

type Acao = (
  anterior: ResultadoConfig | null,
  dados: FormData,
) => Promise<ResultadoConfig>;

export type ItemConfig = {
  chave: string;
  tipo: TipoConfiguracao;
  grupo: string;
  rotulo: string;
  descricao?: string;
  padrao: string;
  valor: string;
  personalizada: boolean;
  atualizadoEm: Date | null;
  atualizadoPor: string | null;
};

/**
 * Formulário de um grupo de configurações.
 *
 * Um formulário por grupo, e não um único gigante: salvar "acesso Free"
 * não deve arriscar reescrever o financeiro, e a ação só processa as
 * chaves que vieram no envio.
 */
export function FormConfiguracoes({
  acao,
  titulo,
  descricao,
  itens,
  acaoRestaurar,
}: {
  acao: Acao;
  titulo: string;
  descricao?: string;
  itens: ItemConfig[];
  acaoRestaurar: (dados: FormData) => void;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);

  return (
    <section className="card">
      <div className="mb-5">
        <h2 className="font-titulo text-xl font-extrabold">{titulo}</h2>
        {descricao && <p className="mt-1 text-tinta-clara">{descricao}</p>}
      </div>

      {estado && (
        <div
          role="status"
          className={`mb-5 rounded-md border-l-4 px-4 py-3 ${
            estado.ok
              ? "border-verde bg-verde-soft text-verde-dark"
              : "border-vermelho bg-vermelho-soft text-vermelho-dark"
          }`}
        >
          {estado.mensagem}
        </div>
      )}

      <form action={enviar} className="space-y-5">
        {itens.map((item) => (
          <div key={item.chave} className="border-b border-borda pb-5 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor={item.chave}
                  className="block font-titulo text-sm font-bold"
                >
                  {item.rotulo}
                </label>
                {item.descricao && (
                  <p className="mt-1 text-sm text-cinza">{item.descricao}</p>
                )}
              </div>

              {item.personalizada && (
                <form action={acaoRestaurar} className="shrink-0">
                  <input type="hidden" name="chave" value={item.chave} />
                  <button
                    type="submit"
                    className="text-xs font-bold text-cinza hover:text-indigo"
                    title={`Voltar ao padrão: ${item.padrao}`}
                  >
                    Restaurar padrão
                  </button>
                </form>
              )}
            </div>

            <div className="mt-2">
              {item.tipo === "BOOLEANO" ? (
                <label
                  htmlFor={item.chave}
                  className="flex min-h-[44px] cursor-pointer items-center gap-3"
                >
                  <input
                    id={item.chave}
                    name={item.chave}
                    type="checkbox"
                    defaultChecked={item.valor === "true"}
                    className="h-5 w-5 shrink-0 rounded border-2 border-borda accent-indigo"
                  />
                  <span className="text-sm text-tinta-clara">
                    {item.valor === "true" ? "Ativado" : "Desativado"}
                  </span>
                </label>
              ) : item.tipo === "JSON" ? (
                <textarea
                  id={item.chave}
                  name={item.chave}
                  rows={4}
                  defaultValue={item.valor}
                  className="campo font-mono text-sm"
                />
              ) : (
                <input
                  id={item.chave}
                  name={item.chave}
                  type={item.tipo === "NUMERO" ? "number" : "text"}
                  min={item.tipo === "NUMERO" ? 0 : undefined}
                  defaultValue={item.valor}
                  className="campo max-w-md"
                />
              )}
            </div>

            {item.personalizada && item.atualizadoPor && (
              <p className="mt-1.5 text-xs text-cinza">
                Alterado por {item.atualizadoPor}
                {item.atualizadoEm &&
                  ` em ${new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(item.atualizadoEm))}`}
              </p>
            )}
          </div>
        ))}

        <button type="submit" disabled={pendente} className="btn-primario">
          {pendente ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}
