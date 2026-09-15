"use client";

import { useState } from "react";
import { FormAluno } from "./form-aluno";
import type { ResultadoAluno } from "@/server/aluno-individual";

/**
 * Cadastro de um aluno, recolhido por padrão.
 *
 * Fica fechado porque divide a tela com a importação em lote, e deixar dois
 * formulários grandes abertos ao mesmo tempo empurraria a lista de alunos —
 * que é o conteúdo principal da página — para fora da primeira dobra.
 */
export function NovoAlunoIndividual({
  acao,
  cursos,
  turmas,
}: {
  acao: (
    anterior: ResultadoAluno | null,
    dados: FormData,
  ) => Promise<ResultadoAluno>;
  cursos: { id: string; titulo: string }[];
  turmas: { id: string; nome: string }[];
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <section className="mb-6 rounded-xl border border-borda bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-titulo text-lg font-extrabold text-tinta">
            Cadastrar um aluno
          </h2>
          <p className="mt-0.5 text-sm text-tinta-clara">
            Para inscrever um professor por vez. Para a turma inteira, use a importação
            em lote abaixo.
          </p>
        </div>
        <button
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          className={aberto ? "btn-secundario" : "btn-primario"}
        >
          {aberto ? "Fechar" : "Novo aluno"}
        </button>
      </div>

      {aberto && (
        <div className="mt-5 border-t border-borda pt-5">
          <FormAluno
            acao={acao}
            cursos={cursos}
            turmas={turmas}
            aoFechar={() => setAberto(false)}
          />
        </div>
      )}
    </section>
  );
}
