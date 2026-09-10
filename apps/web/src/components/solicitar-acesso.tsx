"use client";

import { useActionState } from "react";
import type { ResultadoAcesso } from "@/server/acesso-free";

type Acao = (
  anterior: ResultadoAcesso | null,
  dados: FormData,
) => Promise<ResultadoAcesso>;

/**
 * Formulário de pedido de novo acesso gratuito.
 *
 * O motivo é opcional de propósito: exigir justificativa afasta
 * exatamente quem tem mais vergonha de pedir, e a decisão é sua de todo
 * modo.
 */
export function SolicitarAcesso({
  acao,
  temPendente,
}: {
  acao: Acao;
  temPendente: boolean;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);

  if (temPendente || estado?.ok) {
    return (
      <div
        role="status"
        className="rounded-md border-l-4 border-verde bg-verde-soft p-4 text-verde-dark"
      >
        <p className="font-titulo font-bold">Pedido em análise</p>
        <p className="mt-1 text-sm">
          {estado?.mensagem ??
            "Seu pedido está com a coordenação. Avisaremos assim que houver resposta."}
        </p>
      </div>
    );
  }

  return (
    <form action={enviar} className="space-y-4">
      {estado && !estado.ok && (
        <div
          role="alert"
          className="rounded-md border-l-4 border-vermelho bg-vermelho-soft p-4 text-vermelho-dark"
        >
          {estado.mensagem}
        </div>
      )}

      <div>
        <label htmlFor="motivo" className="mb-1 block font-titulo text-sm font-bold">
          Quer contar por que precisa de mais tempo?{" "}
          <span className="font-normal text-cinza">(opcional)</span>
        </label>
        <textarea
          id="motivo"
          name="motivo"
          rows={3}
          maxLength={500}
          placeholder="Ex: comecei tarde por causa do fechamento do bimestre e faltam duas lições."
          className="campo"
        />
      </div>

      <button type="submit" disabled={pendente} className="btn-primario">
        {pendente ? "Enviando..." : "Solicitar novo acesso"}
      </button>
    </form>
  );
}
