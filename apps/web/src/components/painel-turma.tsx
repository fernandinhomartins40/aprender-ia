"use client";

import { useState } from "react";
import { FormularioTurma, type TurmaInicial } from "@/components/formulario-turma";
import type { ResultadoTurma } from "@/server/turmas";

type Acao = (
  anterior: ResultadoTurma | null,
  dados: FormData,
) => Promise<ResultadoTurma>;

/**
 * Bloco "Nova turma" das telas de administração.
 *
 * Fica fechado por padrão: a tela de turmas serve mais para consultar do
 * que para criar, e um formulário longo sempre aberto empurra a lista para
 * fora da primeira tela.
 */
export function NovaTurma({
  acao,
  cursos,
  instrutores,
}: {
  acao: Acao;
  cursos: { id: string; titulo: string }[];
  instrutores: { id: string; nome: string; papel: string }[];
}) {
  const [aberto, setAberto] = useState(false);

  if (cursos.length === 0) {
    return (
      <div className="card mb-6 text-center">
        <p className="py-6 text-cinza">
          Cadastre um curso antes de criar turmas.
        </p>
      </div>
    );
  }

  if (!aberto) {
    return (
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-titulo text-lg font-bold">Nova turma</h2>
            <p className="mt-1 text-tinta-clara">
              Modalidade, local, período, vagas e responsável.
            </p>
          </div>
          <button onClick={() => setAberto(true)} className="btn-primario">
            Criar turma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="font-titulo text-lg font-bold">Nova turma</h2>
        <button onClick={() => setAberto(false)} className="btn-fantasma">
          Fechar
        </button>
      </div>
      <FormularioTurma
        acao={acao}
        cursos={cursos}
        instrutores={instrutores}
        aoConcluir={() => setAberto(false)}
      />
    </div>
  );
}

/**
 * Edição da turma existente, recolhida por padrão — a página da turma
 * abre mostrando encontros e alunos, que é o que se consulta no dia a dia.
 */
export function EditarTurma({
  acao,
  cursos,
  instrutores,
  inicial,
}: {
  acao: Acao;
  cursos: { id: string; titulo: string }[];
  instrutores: { id: string; nome: string; papel: string }[];
  inicial: TurmaInicial;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-titulo text-xl font-extrabold">Dados da turma</h2>
          <p className="mt-1 text-tinta-clara">
            Modalidade, local, período, vagas e responsável.
          </p>
        </div>
        <button
          onClick={() => setAberto((v) => !v)}
          className="btn-secundario nao-imprimir"
        >
          {aberto ? "Fechar" : "Editar dados"}
        </button>
      </div>

      {aberto && (
        <div className="mt-5 border-t border-borda pt-5">
          <FormularioTurma
            acao={acao}
            cursos={cursos}
            instrutores={instrutores}
            inicial={inicial}
            aoConcluir={() => setAberto(false)}
          />
        </div>
      )}
    </section>
  );
}

/** Duplicar turma: nome novo e a data do primeiro encontro. */
export function DuplicarTurma({
  acao,
  turmaId,
  nomeAtual,
}: {
  acao: (dados: FormData) => void;
  turmaId: string;
  nomeAtual: string;
}) {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-secundario text-sm">
        Duplicar turma
      </button>
    );
  }

  return (
    <form action={acao} className="rounded-md border-2 border-indigo-line p-3">
      <input type="hidden" name="id" value={turmaId} />
      <p className="mb-2 font-titulo text-sm font-bold">Duplicar para novo período</p>
      <div className="flex flex-wrap gap-2">
        <input
          name="nome"
          defaultValue={`${nomeAtual} — nova turma`}
          aria-label="Nome da nova turma"
          className="campo min-w-48 flex-1"
        />
        <input
          name="primeiraData"
          type="date"
          aria-label="Data do primeiro encontro"
          className="campo"
        />
        <button type="submit" className="btn-primario">
          Duplicar
        </button>
        <button type="button" onClick={() => setAberto(false)} className="btn-fantasma">
          Cancelar
        </button>
      </div>
      <p className="mt-2 text-sm text-cinza">
        Copia dados e encontros, deslocando as datas. Nenhum aluno é copiado.
      </p>
    </form>
  );
}
