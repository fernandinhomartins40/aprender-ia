"use client";

import { useActionState, useState } from "react";
import type { Periodicidade } from "@aprender/db";
import type { ResultadoAssinatura } from "@/server/assinaturas";
import { ROTULO_PERIODO } from "@/lib/assinaturas";
import { reais } from "@/lib/dinheiro";

type Acao = (
  anterior: ResultadoAssinatura | null,
  dados: FormData,
) => Promise<ResultadoAssinatura>;

/**
 * Registro de uma assinatura nova.
 *
 * "Já foi pago" existe porque o caso comum aqui é o inverso do software de
 * assinatura tradicional: o professor paga por Pix ou na secretaria e só
 * depois alguém registra. Marcar isso na criação evita ter que lançar e dar
 * baixa em dois passos.
 */
export function FormAssinatura({
  acao,
  planos,
  alunos,
}: {
  acao: Acao;
  planos: {
    id: string;
    nome: string;
    precoCentavos: number;
    periodicidade: Periodicidade;
  }[];
  alunos: { id: string; nome: string; email: string; telefone: string | null }[];
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const [aberto, setAberto] = useState(false);
  const [jaPago, setJaPago] = useState(false);

  if (planos.length === 0) {
    return (
      <div className="card">
        <p className="text-tinta-clara">
          Cadastre um plano ativo antes de registrar assinaturas.
        </p>
      </div>
    );
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-primario">
        Registrar assinatura
      </button>
    );
  }

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <section className="card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-titulo text-xl font-extrabold">Registrar assinatura</h2>
          <p className="mt-1 text-sm text-tinta-clara">
            Cria a assinatura, gera a primeira cobrança e libera o acesso pago
            do aluno — tudo de uma vez.
          </p>
        </div>
        <button onClick={() => setAberto(false)} className="text-sm text-cinza hover:text-tinta">
          fechar
        </button>
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

      <form action={enviar} className="grid gap-4 md:grid-cols-6">
        <label className="md:col-span-3">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Aluno</span>
          <select name="userId" required className="campo w-full">
            <option value="">Selecione…</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} {a.telefone ? `· ${a.telefone}` : `· ${a.email}`}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Plano</span>
          <select name="planId" required className="campo w-full">
            <option value="">Selecione…</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} · {reais(p.precoCentavos)} {ROTULO_PERIODO[p.periodicidade]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Início</span>
          <input type="date" name="inicioEm" defaultValue={hoje} className="campo w-full" />
        </label>

        <div className="md:col-span-6">
          <label className="flex items-center gap-2 text-sm font-bold text-tinta-clara">
            <input
              type="checkbox"
              name="jaPago"
              checked={jaPago}
              onChange={(e) => setJaPago(e.target.checked)}
              className="h-4 w-4"
            />
            A primeira cobrança já foi paga
          </label>
        </div>

        {jaPago && (
          <label className="md:col-span-2">
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Forma de pagamento
            </span>
            <input name="formaPagamento" placeholder="Pix" className="campo w-full" />
          </label>
        )}

        <label className={jaPago ? "md:col-span-4" : "md:col-span-6"}>
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Observações
          </span>
          <input
            name="observacoes"
            placeholder="Combinado com a secretaria da escola"
            className="campo w-full"
          />
        </label>

        <div className="md:col-span-6">
          <button type="submit" disabled={pendente} className="btn-primario">
            {pendente ? "Registrando…" : "Registrar assinatura"}
          </button>
        </div>
      </form>
    </section>
  );
}
