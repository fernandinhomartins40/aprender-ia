"use client";

import { useState } from "react";

/**
 * Ações de acesso gratuito de um aluno, na lista do painel.
 *
 * Fica recolhido: a lista serve para consultar, e um formulário aberto em
 * cada linha transformaria a tabela num paredão de campos.
 */
export function AcoesAcessoAluno({
  userId,
  nome,
  freeAte,
  revogado,
  diasPadrao,
  acaoDefinir,
  acaoProrrogar,
  acaoRevogar,
  acaoReativar,
}: {
  userId: string;
  nome: string;
  freeAte: Date | null;
  revogado: boolean;
  diasPadrao: number;
  acaoDefinir: (dados: FormData) => void;
  acaoProrrogar: (dados: FormData) => void;
  acaoRevogar: (dados: FormData) => void;
  acaoReativar: (dados: FormData) => void;
}) {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="rounded-md border-2 border-borda px-2.5 py-1.5 text-xs font-bold text-tinta-clara hover:border-indigo"
      >
        Acesso
      </button>
    );
  }

  return (
    <div className="rounded-md border-2 border-indigo-line bg-fundo p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-titulo text-xs font-bold">Acesso de {nome}</p>
        <button
          onClick={() => setAberto(false)}
          className="text-xs text-cinza hover:text-tinta"
        >
          fechar
        </button>
      </div>

      <p className="mb-3 text-xs text-cinza">
        {revogado
          ? "Acesso revogado."
          : freeAte
            ? `Válido até ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(freeAte))}.`
            : "Sem prazo definido."}
      </p>

      <div className="space-y-2">
        {revogado ? (
          <form action={acaoReativar} className="flex items-center gap-1.5">
            <input type="hidden" name="userId" value={userId} />
            <input
              name="dias"
              type="number"
              min={0}
              defaultValue={diasPadrao}
              aria-label="Dias ao reativar"
              className="w-20 rounded-md border-2 border-borda px-2 py-1 text-sm"
            />
            <button type="submit" className="btn-primario text-xs">
              Reativar
            </button>
          </form>
        ) : (
          <>
            <form action={acaoProrrogar} className="flex items-center gap-1.5">
              <input type="hidden" name="userId" value={userId} />
              <input
                name="dias"
                type="number"
                min={1}
                defaultValue={diasPadrao}
                aria-label="Dias a prorrogar"
                className="w-20 rounded-md border-2 border-borda px-2 py-1 text-sm"
              />
              <button type="submit" className="btn-primario text-xs">
                Prorrogar
              </button>
            </form>

            <form action={acaoDefinir} className="flex items-center gap-1.5">
              <input type="hidden" name="userId" value={userId} />
              <input
                name="dias"
                type="number"
                min={0}
                placeholder="0 = sem prazo"
                aria-label="Definir dias a partir de hoje"
                className="w-20 rounded-md border-2 border-borda px-2 py-1 text-sm"
              />
              <button type="submit" className="btn-secundario text-xs">
                Definir
              </button>
            </form>

            <form action={acaoRevogar}>
              <input type="hidden" name="userId" value={userId} />
              <button
                type="submit"
                className="text-xs font-bold text-vermelho-dark hover:underline"
              >
                Revogar acesso
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
