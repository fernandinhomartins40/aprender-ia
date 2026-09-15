"use client";

import { useActionState, useState } from "react";
import type { ResultadoAluno } from "@/server/aluno-individual";

/**
 * Formulário de cadastro e edição de um aluno.
 *
 * O mesmo componente serve aos dois casos porque os campos são os mesmos: o
 * que muda é a ação recebida e a presença do `userId`. Duplicar em dois
 * formulários faria as validações divergirem na primeira alteração.
 *
 * A senha provisória aparece UMA vez, depois de salvar, e some ao fechar. Não
 * há como recuperá-la depois — é hash no banco —, então a tela avisa disso em
 * vez de deixar o administrador descobrir tarde.
 */

type Curso = { id: string; titulo: string };
type Turma = { id: string; nome: string };

export function FormAluno({
  acao,
  aluno,
  cursos = [],
  turmas = [],
  aoFechar,
}: {
  acao: (
    anterior: ResultadoAluno | null,
    dados: FormData,
  ) => Promise<ResultadoAluno>;
  /** Ausente = criação. Presente = edição. */
  aluno?: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    situacao: string;
  };
  cursos?: Curso[];
  turmas?: Turma[];
  aoFechar?: () => void;
}) {
  const [estado, enviar, enviando] = useActionState(acao, null);
  const edicao = Boolean(aluno);

  // O e-mail interno é derivado do telefone e não deve ser mostrado como se
  // fosse um endereço que o aluno usa: exibi-lo no campo faria o
  // administrador achar que dá para escrever para lá.
  const emailVisivel =
    aluno?.email && !aluno.email.endsWith("@aluno.aprenderia.site") ? aluno.email : "";

  return (
    <form action={enviar} className="space-y-4">
      {edicao && <input type="hidden" name="userId" value={aluno!.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Nome completo
          </span>
          <input
            name="nome"
            required
            minLength={2}
            defaultValue={aluno?.nome ?? ""}
            placeholder="Maria de Souza"
            className="campo w-full"
          />
        </label>

        <label>
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Telefone
          </span>
          <input
            name="telefone"
            inputMode="numeric"
            defaultValue={aluno?.telefone ?? ""}
            placeholder="11987654321"
            className="campo w-full"
          />
          <span className="mt-1 block text-xs text-cinza">
            Com DDD. É por ele que o aluno entra.
          </span>
        </label>

        <label>
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            E-mail <span className="font-normal text-cinza">(opcional)</span>
          </span>
          <input
            name="email"
            type="email"
            defaultValue={emailVisivel}
            placeholder="maria@escola.edu.br"
            className="campo w-full"
          />
          <span className="mt-1 block text-xs text-cinza">
            Sem e-mail, o aluno entra só pelo telefone.
          </span>
        </label>
      </div>

      {/* ---- Só na criação ---- */}
      {!edicao && (
        <div className="grid gap-4 rounded-xl border border-borda bg-fundo p-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Senha provisória <span className="font-normal text-cinza">(opcional)</span>
            </span>
            <input name="senha" className="campo w-full" placeholder="Deixe vazio para gerar" />
            <span className="mt-1 block text-xs text-cinza">
              O aluno troca no primeiro acesso, em qualquer caso.
            </span>
          </label>

          <label>
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Dias de acesso gratuito
            </span>
            <input
              name="diasFree"
              type="number"
              min={0}
              className="campo w-full"
              placeholder="Vazio = padrão do plano"
            />
            <span className="mt-1 block text-xs text-cinza">
              Sobrepõe o padrão só para este aluno. 0 = sem expiração.
            </span>
          </label>

          {cursos.length > 0 && (
            <label>
              <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
                Matricular no curso
              </span>
              <select name="courseId" defaultValue="" className="campo w-full">
                <option value="">Não matricular agora</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
            </label>
          )}

          {turmas.length > 0 && (
            <label>
              <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
                Turma <span className="font-normal text-cinza">(opcional)</span>
              </span>
              <select name="cohortId" defaultValue="" className="campo w-full">
                <option value="">Sem turma</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {/* ---- Só na edição ---- */}
      {edicao && (
        <label className="block max-w-xs">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Situação da conta
          </span>
          <select
            name="situacao"
            defaultValue={aluno!.situacao}
            className="campo w-full"
          >
            <option value="ATIVO">Ativo</option>
            <option value="SUSPENSO">Suspenso</option>
          </select>
          <span className="mt-1 block text-xs text-cinza">
            Suspenso bloqueia o acesso sem apagar nada do progresso.
          </span>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={enviando} className="btn-primario">
          {enviando ? "Salvando…" : edicao ? "Salvar alterações" : "Cadastrar aluno"}
        </button>
        {aoFechar && (
          <button type="button" onClick={aoFechar} className="btn-secundario">
            Cancelar
          </button>
        )}
      </div>

      {estado && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm ${
            estado.ok
              ? "border-verde/30 bg-verde-soft text-verde-dark"
              : "border-vermelho/30 bg-vermelho-soft text-vermelho-dark"
          }`}
        >
          <p className="font-bold">{estado.mensagem}</p>

          {estado.senhaProvisoria && (
            <div className="mt-3 rounded-lg border border-borda bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-cinza">
                Senha provisória
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-tinta">
                {estado.senhaProvisoria}
              </p>
              <p className="mt-1 text-xs text-tinta-clara">
                Anote e entregue ao aluno agora. Ela não pode ser consultada depois — só
                gerada de novo.
              </p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
