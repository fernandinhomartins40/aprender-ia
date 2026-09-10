"use client";

import { useActionState, useState } from "react";
import type { ResultadoAcesso } from "@/server/acesso-free";

type Acao = (
  anterior: ResultadoAcesso | null,
  dados: FormData,
) => Promise<ResultadoAcesso>;

export type PedidoNaFila = {
  id: string;
  status: string;
  motivo: string | null;
  ordem: number;
  criadoEm: Date;
  decididoEm: Date | null;
  decisorNome: string | null;
  diasConcedidos: number | null;
  observacao: string | null;
  expiradoEm: Date | null;
  ehEmailInterno: boolean;
  progresso: number;
  user: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    escola: string | null;
    criadoEm: Date;
    ultimoAcessoEm: Date | null;
    plano: string;
    _count: { solicitacoes: number };
  };
};

function data(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(d));
}

/**
 * Um pedido na fila, com a decisão embutida.
 *
 * Mostra junto o que você precisa para decidir sem abrir outra tela:
 * quantas vezes a pessoa já pediu, quando o acesso anterior expirou,
 * quanto ela progrediu e quando acessou por último. Um pedido de quem
 * está em 80% do curso é diferente de um de quem nunca entrou.
 */
export function CartaoPedido({
  pedido,
  diasSugeridos,
  acaoAprovar,
  acaoRecusar,
}: {
  pedido: PedidoNaFila;
  diasSugeridos: number;
  acaoAprovar: Acao;
  acaoRecusar: Acao;
}) {
  const [estadoAprovar, aprovar, aprovando] = useActionState(acaoAprovar, null);
  const [estadoRecusar, recusar, recusando] = useActionState(acaoRecusar, null);
  const [modo, setModo] = useState<"nenhum" | "aprovar" | "recusar">("nenhum");

  const estado = estadoAprovar ?? estadoRecusar;
  const decidido = pedido.status !== "PENDENTE";

  return (
    <div className={`card ${decidido ? "opacity-80" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-titulo text-lg font-bold">{pedido.user.nome}</h3>
            {pedido.status === "PENDENTE" && (
              <span className="selo-amarelo">Aguardando</span>
            )}
            {pedido.status === "APROVADA" && (
              <span className="selo-verde">
                Aprovado{pedido.diasConcedidos ? ` · ${pedido.diasConcedidos} dias` : ""}
              </span>
            )}
            {pedido.status === "RECUSADA" && (
              <span className="selo-vermelho">Recusado</span>
            )}
            {pedido.ordem > 1 && (
              <span className="selo-cinza">{pedido.ordem}º pedido</span>
            )}
          </div>
          <p className="mt-1 text-sm text-cinza">
            {pedido.user.telefone ?? pedido.user.email}
            {pedido.user.escola ? ` · ${pedido.user.escola}` : ""}
          </p>
        </div>

        <p className="shrink-0 text-sm text-cinza">
          pedido em {data(pedido.criadoEm)}
        </p>
      </div>

      {/* O que ajuda a decidir */}
      <dl className="mt-4 grid gap-3 rounded-md bg-fundo p-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-cinza">Progresso</dt>
          <dd className="font-titulo font-bold">{pedido.progresso}%</dd>
        </div>
        <div>
          <dt className="text-cinza">Acesso expirou</dt>
          <dd className="font-titulo font-bold">{data(pedido.expiradoEm)}</dd>
        </div>
        <div>
          <dt className="text-cinza">Último acesso</dt>
          <dd className="font-titulo font-bold">{data(pedido.user.ultimoAcessoEm)}</dd>
        </div>
        <div>
          <dt className="text-cinza">Pedidos feitos</dt>
          <dd className="font-titulo font-bold">{pedido.user._count.solicitacoes}</dd>
        </div>
      </dl>

      {pedido.motivo && (
        <blockquote className="mt-3 border-l-4 border-indigo-line pl-3 text-tinta-clara">
          “{pedido.motivo}”
        </blockquote>
      )}

      {pedido.ehEmailInterno && !decidido && (
        <p className="mt-3 rounded-md bg-amarelo-soft px-3 py-2 text-sm text-amarelo-dark">
          Este aluno entra pelo telefone e não tem e-mail real — avise por
          WhatsApp depois de decidir.
        </p>
      )}

      {estado && (
        <p
          role="status"
          className={`mt-3 rounded-md border-l-4 px-4 py-2 text-sm ${
            estado.ok
              ? "border-verde bg-verde-soft text-verde-dark"
              : "border-vermelho bg-vermelho-soft text-vermelho-dark"
          }`}
        >
          {estado.mensagem}
        </p>
      )}

      {decidido ? (
        <p className="mt-3 text-sm text-cinza">
          Decidido por {pedido.decisorNome ?? "—"} em {data(pedido.decididoEm)}
          {pedido.observacao ? ` · ${pedido.observacao}` : ""}
        </p>
      ) : (
        <div className="mt-4 border-t border-borda pt-4">
          {modo === "nenhum" && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setModo("aprovar")} className="btn-primario">
                Aprovar
              </button>
              <button onClick={() => setModo("recusar")} className="btn-secundario">
                Recusar
              </button>
            </div>
          )}

          {modo === "aprovar" && (
            <form action={aprovar} className="space-y-3">
              <input type="hidden" name="id" value={pedido.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`dias-${pedido.id}`}
                    className="mb-1 block font-titulo text-sm font-bold"
                  >
                    Dias de acesso
                  </label>
                  <input
                    id={`dias-${pedido.id}`}
                    name="dias"
                    type="number"
                    min={1}
                    defaultValue={diasSugeridos}
                    className="campo"
                  />
                  <p className="mt-1 text-xs text-cinza">
                    Sugestão das configurações: {diasSugeridos} dias.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor={`obs-${pedido.id}`}
                    className="mb-1 block font-titulo text-sm font-bold"
                  >
                    Observação{" "}
                    <span className="font-normal text-cinza">(interna)</span>
                  </label>
                  <input
                    id={`obs-${pedido.id}`}
                    name="observacao"
                    placeholder="O aluno não vê isto"
                    className="campo"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={aprovando} className="btn-primario">
                  {aprovando ? "Liberando..." : "Confirmar liberação"}
                </button>
                <button
                  type="button"
                  onClick={() => setModo("nenhum")}
                  className="btn-fantasma"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {modo === "recusar" && (
            <form action={recusar} className="space-y-3">
              <input type="hidden" name="id" value={pedido.id} />
              <div>
                <label
                  htmlFor={`obsr-${pedido.id}`}
                  className="mb-1 block font-titulo text-sm font-bold"
                >
                  Motivo interno{" "}
                  <span className="font-normal text-cinza">(o aluno não vê)</span>
                </label>
                <input
                  id={`obsr-${pedido.id}`}
                  name="observacao"
                  placeholder="Ex: já teve 3 períodos concedidos"
                  className="campo"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={recusando}
                  className="btn border-2 border-vermelho text-vermelho-dark hover:bg-vermelho-soft"
                >
                  {recusando ? "Recusando..." : "Confirmar recusa"}
                </button>
                <button
                  type="button"
                  onClick={() => setModo("nenhum")}
                  className="btn-fantasma"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
