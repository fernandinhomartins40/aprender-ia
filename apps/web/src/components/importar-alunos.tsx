"use client";

import { useActionState, useState } from "react";
import type { ResultadoImportacao } from "@/server/importar-alunos";

type Acao = (
  anterior: ResultadoImportacao | null,
  dados: FormData,
) => Promise<ResultadoImportacao>;

const EXEMPLO = `Maria Aparecida Silva - 11987654321
João Carlos Souza - (11) 91234-5678
Ana Beatriz Lima; 11 98888 7777`;

export function ImportarAlunos({
  acao,
  cursos,
  turmas,
}: {
  acao: Acao;
  cursos: { id: string; titulo: string }[];
  turmas: { id: string; nome: string; courseId: string; curso: string }[];
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const [aberto, setAberto] = useState(false);
  const [lista, setLista] = useState("");
  const [cursoEscolhido, setCursoEscolhido] = useState(cursos[0]?.id ?? "");
  const [copiado, setCopiado] = useState(false);

  // Só faz sentido oferecer turmas do curso selecionado.
  const turmasDoCurso = turmas.filter((t) => t.courseId === cursoEscolhido);

  const linhasPreenchidas = lista
    .split(/\r?\n/)
    .filter((l) => l.trim()).length;

  async function copiarCredenciais() {
    if (!estado?.credenciais.length) return;
    const texto = estado.credenciais
      .map((c) => `${c.nome}\nLogin: ${c.telefone}\nSenha: ${c.senha}\n`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* o texto continua visível na tela para cópia manual */
    }
  }

  if (!aberto) {
    return (
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-titulo text-lg font-bold">
              Cadastrar turma inteira
            </h2>
            <p className="mt-1 text-tinta-clara">
              Cole a lista de nomes e telefones para criar todas as contas de
              uma vez.
            </p>
          </div>
          <button onClick={() => setAberto(true)} className="btn-primario">
            Cadastrar em lote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-titulo text-lg font-bold">
            Cadastrar turma inteira
          </h2>
          <p className="mt-1 text-tinta-clara">
            Uma linha por aluno, no formato <strong>Nome - Telefone</strong>.
          </p>
        </div>
        <button onClick={() => setAberto(false)} className="btn-fantasma">
          Fechar
        </button>
      </div>

      <form action={enviar} className="space-y-4">
        <div>
          <label htmlFor="lista" className="mb-1 block font-titulo text-sm font-bold">
            Lista de alunos
            {linhasPreenchidas > 0 && (
              <span className="ml-2 font-normal text-cinza">
                ({linhasPreenchidas} linha{linhasPreenchidas > 1 ? "s" : ""})
              </span>
            )}
          </label>
          <textarea
            id="lista"
            name="lista"
            required
            rows={10}
            value={lista}
            onChange={(e) => setLista(e.target.value)}
            placeholder={EXEMPLO}
            className="campo font-mono text-sm"
          />
          <p className="mt-1 text-sm text-cinza">
            Aceita hífen, ponto e vírgula, vírgula ou tabulação como separador.
            O telefone pode vir com parênteses e traços.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="courseId" className="mb-1 block font-titulo text-sm font-bold">
              Curso liberado
            </label>
            <select
              id="courseId"
              name="courseId"
              value={cursoEscolhido}
              onChange={(e) => setCursoEscolhido(e.target.value)}
              className="campo"
            >
              <option value="">Não matricular agora</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cohortId" className="mb-1 block font-titulo text-sm font-bold">
              Turma <span className="font-normal text-cinza">(opcional)</span>
            </label>
            <select id="cohortId" name="cohortId" className="campo">
              <option value="">Sem turma</option>
              {turmasDoCurso.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
            {cursoEscolhido && turmasDoCurso.length === 0 && (
              <p className="mt-1 text-sm text-cinza">
                Nenhuma turma criada para este curso.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-md border-l-4 border-indigo bg-indigo-soft p-4">
          <p className="font-titulo text-sm font-bold text-indigo-dark">
            Como o aluno vai entrar
          </p>
          <p className="mt-1 text-sm text-indigo-dark">
            <strong>Login:</strong> o próprio telefone (só os números) ·{" "}
            <strong>Senha:</strong> as 3 primeiras letras do nome, em
            minúsculas.
          </p>
          <p className="mt-1 text-sm text-indigo-dark">
            No primeiro acesso, a plataforma pede que ele crie uma senha
            própria — a provisória é fácil de adivinhar por quem tem a lista de
            chamada.
          </p>
        </div>

        <button type="submit" disabled={pendente} className="btn-primario">
          {pendente ? "Cadastrando..." : "Cadastrar alunos"}
        </button>
      </form>

      {estado && (
        <div className="mt-6">
          <div
            role="status"
            className={`rounded-md border-l-4 px-4 py-3 ${
              estado.ok
                ? "border-verde bg-verde-soft text-verde-dark"
                : "border-vermelho bg-vermelho-soft text-vermelho-dark"
            }`}
          >
            <p className="font-titulo font-bold">{estado.mensagem}</p>
          </div>

          {estado.credenciais.length > 0 && (
            <div className="mt-4 rounded-lg border-2 border-indigo-line p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="font-titulo font-bold">
                  Credenciais para entregar aos alunos
                </p>
                <button
                  type="button"
                  onClick={copiarCredenciais}
                  className="btn-secundario"
                >
                  {copiado ? "Copiado!" : "Copiar tudo"}
                </button>
              </div>
              <p className="mb-3 text-sm text-cinza">
                Anote agora: as senhas não voltam a ser exibidas.
              </p>
              <div className="max-h-72 overflow-auto rounded-md bg-fundo p-3">
                <table className="w-full text-left text-sm">
                  <thead className="text-cinza">
                    <tr>
                      <th className="pb-2">Aluno</th>
                      <th className="pb-2">Login (telefone)</th>
                      <th className="pb-2">Senha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estado.credenciais.map((c) => (
                      <tr key={c.telefone} className="border-t border-borda">
                        <td className="py-2">{c.nome}</td>
                        <td className="py-2 font-mono">{c.telefone}</td>
                        <td className="py-2 font-mono font-bold text-indigo">
                          {c.senha}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {estado.falhas.length > 0 && (
            <div className="mt-4 rounded-lg border-2 border-vermelho-soft bg-vermelho-soft p-4">
              <p className="font-titulo font-bold text-vermelho-dark">
                Linhas que não foram cadastradas
              </p>
              <ul className="mt-2 space-y-1 text-sm text-vermelho-dark">
                {estado.falhas.slice(0, 15).map((f, i) => (
                  <li key={i}>
                    <strong>{f.nome || "(sem nome)"}</strong>
                    {f.telefone && ` · ${f.telefone}`} — {f.motivo}
                  </li>
                ))}
                {estado.falhas.length > 15 && (
                  <li>… e mais {estado.falhas.length - 15}.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
