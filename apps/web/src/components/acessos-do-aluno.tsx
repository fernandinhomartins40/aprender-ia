"use client";

import { useState } from "react";
import { ROTULO_STATUS } from "@/lib/assinaturas";
import type { StatusAssinatura } from "@aprender/db";

/**
 * Planos e acessos efetivos de um aluno, no painel.
 *
 * A tela responde às duas perguntas do requisito de uma vez: **que planos
 * ele tem** e **o que ele efetivamente alcança**. O segundo bloco é
 * calculado pelo mesmo motor que decide o acesso real — não é uma
 * segunda implementação da regra, que divergiria com o tempo.
 */

export type AssinaturaLinha = {
  id: string;
  planoNome: string;
  gratuito: boolean;
  status: StatusAssinatura;
  inicioEm: string;
  cicloFimEm: string | null;
  semExpiracao: boolean;
  concedidaManualmente: boolean;
  /** Vale acesso agora? Vem do motor, não recalculado aqui. */
  valeAgora: boolean;
};

export type ModuloLinha = { id: string; titulo: string; ordem: number; liberado: boolean };
export type CursoLinha = {
  id: string;
  titulo: string;
  /** "completo" | "parcial" | "nenhum" */
  tipo: string;
  porPlanos: string[];
  modulos: ModuloLinha[];
};

export type PlanoOpcao = { id: string; nome: string; gratuito: boolean; ativo: boolean };

const CORES: Record<StatusAssinatura, string> = {
  ATIVA: "selo-verde",
  PENDENTE: "selo-indigo",
  INADIMPLENTE: "selo-vermelho",
  SUSPENSA: "selo-vermelho",
  CANCELADA: "selo-cinza",
  EXPIRADA: "selo-amarelo",
};

function data(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(iso));
}

export function AcessosDoAluno({
  userId,
  assinaturas,
  cursos,
  planos,
  contaSuspensa,
  irrestrito,
  aoConceder,
  aoAlterar,
  aoRemover,
}: {
  userId: string;
  assinaturas: AssinaturaLinha[];
  cursos: CursoLinha[];
  planos: PlanoOpcao[];
  contaSuspensa: boolean;
  irrestrito: boolean;
  aoConceder: (d: FormData) => Promise<void>;
  aoAlterar: (d: FormData) => Promise<void>;
  aoRemover: (d: FormData) => Promise<void>;
}) {
  const [concedendo, setConcedendo] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  // Um plano que o aluno já tem vivo não deve reaparecer na lista de
  // concessão: duas assinaturas do mesmo plano seriam acesso duplicado.
  const jaTem = new Set(
    assinaturas.filter((a) => a.valeAgora || a.status === "PENDENTE").map((a) => a.planoNome),
  );
  const disponiveis = planos.filter((p) => p.ativo && !jaTem.has(p.nome));

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------- planos ---- */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-titulo text-lg font-bold text-tinta">Planos</h2>
          <button
            onClick={() => setConcedendo((v) => !v)}
            className="text-sm font-bold text-indigo hover:underline"
          >
            {concedendo ? "Cancelar" : "+ Conceder plano"}
          </button>
        </div>

        {concedendo && (
          <form action={aoConceder} className="mb-3 rounded-xl border border-indigo bg-indigo-soft/40 p-4">
            <input type="hidden" name="userId" value={userId} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-bold text-tinta">Plano</span>
                <select name="planId" required className="campo w-full">
                  {disponiveis.length === 0 && <option value="">Nenhum plano disponível</option>}
                  {disponiveis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                      {p.gratuito ? " (gratuito)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-bold text-tinta">Início</span>
                <input type="date" name="inicioEm" className="campo w-full" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-bold text-tinta">Acesso até</span>
                <input type="date" name="cicloFimEm" className="campo w-full" />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm font-bold text-tinta">
                <input type="checkbox" name="semExpiracao" className="h-4 w-4" />
                Sem data de término
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-bold text-tinta">Observação</span>
                <input
                  name="observacoes"
                  className="campo w-full"
                  placeholder="Ex.: bolsa integral, parceria com a rede"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={disponiveis.length === 0}
              className="btn-primario mt-3"
            >
              Conceder
            </button>
            <p className="mt-2 text-xs text-tinta-clara">
              Concessão manual não gera cobrança e não entra no faturamento.
            </p>
          </form>
        )}

        {assinaturas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-borda bg-white px-5 py-8 text-center text-sm text-tinta-clara">
            Nenhum plano. O aluno recebe apenas o que o plano gratuito libera.
          </p>
        ) : (
          <ul className="space-y-2">
            {assinaturas.map((a) => (
              <li key={a.id} className="rounded-xl border border-borda bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-titulo font-bold text-tinta">
                      {a.planoNome}
                      {a.gratuito && <span className="ml-2 selo-indigo">gratuito</span>}
                      {a.concedidaManualmente && (
                        <span className="ml-2 selo-cinza">concedido</span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-tinta-clara">
                      {data(a.inicioEm)} →{" "}
                      {a.semExpiracao ? "sem término" : data(a.cicloFimEm)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={CORES[a.status]}>{ROTULO_STATUS[a.status]}</span>
                    {/* O que importa de verdade: o status sozinho não diz
                        se vale — cancelado dentro do ciclo ainda vale. */}
                    <span className={a.valeAgora ? "selo-verde" : "selo-cinza"}>
                      {a.valeAgora ? "dá acesso" : "sem acesso"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 border-t border-borda pt-3">
                  <button
                    onClick={() => setEditando(editando === a.id ? null : a.id)}
                    className="text-sm font-bold text-indigo hover:underline"
                  >
                    {editando === a.id ? "Fechar" : "Editar"}
                  </button>
                  <form action={aoRemover}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="text-sm font-semibold text-vermelho-dark hover:underline">
                      Remover
                    </button>
                  </form>
                </div>

                {editando === a.id && (
                  <form action={aoAlterar} className="mt-3 grid gap-3 border-t border-borda pt-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={a.id} />
                    <label className="text-sm">
                      <span className="mb-1 block font-bold text-tinta">Status</span>
                      <select name="status" defaultValue={a.status} className="campo w-full">
                        {(Object.keys(ROTULO_STATUS) as StatusAssinatura[]).map((s) => (
                          <option key={s} value={s}>
                            {ROTULO_STATUS[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block font-bold text-tinta">Acesso até</span>
                      <input
                        type="date"
                        name="cicloFimEm"
                        defaultValue={a.cicloFimEm ? a.cicloFimEm.slice(0, 10) : ""}
                        className="campo w-full"
                      />
                    </label>
                    <label className="flex items-end gap-2 pb-2 text-sm font-bold text-tinta">
                      <input
                        type="checkbox"
                        name="semExpiracao"
                        defaultChecked={a.semExpiracao}
                        className="h-4 w-4"
                      />
                      Sem data de término
                    </label>
                    <div className="flex items-end">
                      <button type="submit" className="btn-primario">
                        Salvar
                      </button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------- acessos efetivos ---- */}
      <section>
        <h2 className="mb-1 font-titulo text-lg font-bold text-tinta">Acessos efetivos</h2>
        <p className="mb-3 text-sm text-tinta-clara">
          Calculado pelo mesmo motor que decide o acesso real do aluno.
        </p>

        {irrestrito && (
          <p className="mb-3 rounded-lg border border-indigo bg-indigo-soft p-3 text-sm text-indigo-dark">
            Este usuário é ADMIN ou INSTRUTOR: enxerga todo o conteúdo, para poder
            revisá-lo antes da publicação.
          </p>
        )}

        {contaSuspensa && (
          <p className="mb-3 rounded-lg border border-vermelho bg-vermelho-soft p-3 text-sm text-vermelho-dark">
            Conta suspensa: nenhum conteúdo é liberado, inclusive o gratuito. O
            progresso está preservado.
          </p>
        )}

        <ul className="space-y-2">
          {cursos.map((c) => {
            const liberados = c.modulos.filter((m) => m.liberado).length;
            return (
              <li key={c.id} className="rounded-xl border border-borda bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-titulo font-bold text-tinta">{c.titulo}</p>
                  <span
                    className={
                      c.tipo === "completo"
                        ? "selo-verde"
                        : liberados > 0
                          ? "selo-amarelo"
                          : "selo-cinza"
                    }
                  >
                    {c.tipo === "completo"
                      ? "curso completo"
                      : liberados > 0
                        ? `parcial — ${liberados} de ${c.modulos.length}`
                        : "sem acesso"}
                  </span>
                </div>

                {c.porPlanos.length > 0 && (
                  <p className="mt-1 text-xs text-tinta-clara">
                    por: {[...new Set(c.porPlanos)].join(", ")}
                  </p>
                )}

                {/* A lista módulo a módulo só aparece no caso parcial: no
                    completo seria uma coluna de "sim" repetida. */}
                {c.tipo !== "completo" && c.modulos.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-borda pt-3">
                    {c.modulos.map((m) => (
                      <li key={m.id} className="flex items-center gap-2 text-sm">
                        <span
                          aria-hidden
                          className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                            m.liberado ? "bg-verde" : "bg-borda"
                          }`}
                        />
                        <span className={m.liberado ? "text-tinta" : "text-cinza"}>
                          {m.ordem}. {m.titulo}
                        </span>
                        <span className="ml-auto text-xs text-cinza">
                          {m.liberado ? "acesso" : "sem acesso"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
