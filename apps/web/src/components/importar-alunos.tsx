"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ResultadoImportacao } from "@/server/importar-alunos";

type Acao = (
  anterior: ResultadoImportacao | null,
  dados: FormData,
) => Promise<ResultadoImportacao>;

type TurmaOpcao = {
  id: string;
  nome: string;
  courseId: string;
  curso: string;
  codigo: string;
  situacao: string;
  vagas: number | null;
  inscritos: number;
};

const EXEMPLO = `Maria Aparecida Silva - 11987654321
João Carlos Souza - (11) 91234-5678
Ana Beatriz Lima; 11 98888 7777`;

const ROTULO_SITUACAO: Record<string, string> = {
  RASCUNHO: "rascunho",
  INSCRICOES_ABERTAS: "inscrições abertas",
  EM_ANDAMENTO: "em andamento",
  CONCLUIDA: "concluída",
  CANCELADA: "cancelada",
};

/**
 * Cadastro de alunos em lote — sempre dentro de uma turma.
 *
 * A turma pode ser escolhida entre as existentes ou criada aqui mesmo.
 * Antes era preciso sair para /admin/turmas, criar a turma e voltar: com a
 * lista de chamada na mão, essa ida e volta é o momento em que o
 * administrador desiste ou cadastra alunos soltos.
 */
export function ImportarAlunos({
  acao,
  cursos,
  turmas,
}: {
  acao: Acao;
  cursos: { id: string; titulo: string }[];
  turmas: TurmaOpcao[];
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const [aberto, setAberto] = useState(false);
  const [lista, setLista] = useState("");
  const [cursoEscolhido, setCursoEscolhido] = useState(cursos[0]?.id ?? "");
  const [modoTurma, setModoTurma] = useState<"existente" | "nova">("existente");
  const [turmaEscolhida, setTurmaEscolhida] = useState("");
  const [modalidadeNova, setModalidadeNova] = useState("ONLINE");
  const [copiado, setCopiado] = useState(false);

  // Só faz sentido oferecer turmas do curso selecionado.
  const turmasDoCurso = turmas.filter((t) => t.courseId === cursoEscolhido);

  // Sem turma disponível, criar é o único caminho — já abrimos nesse modo.
  const semTurmas = turmasDoCurso.length === 0;
  const modoEfetivo = semTurmas ? "nova" : modoTurma;

  const linhasPreenchidas = lista.split(/\r?\n/).filter((l) => l.trim()).length;

  const turmaSelecionada = turmasDoCurso.find((t) => t.id === turmaEscolhida);
  const vagasRestantes =
    turmaSelecionada?.vagas != null
      ? turmaSelecionada.vagas - turmaSelecionada.inscritos
      : null;
  const estouraVagas =
    vagasRestantes !== null && linhasPreenchidas > vagasRestantes;

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
              Cadastrar alunos numa turma
            </h2>
            <p className="mt-1 text-tinta-clara">
              Cole a lista de nomes e telefones. A turma pode ser criada aqui
              mesmo, junto com o cadastro.
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
            Cadastrar alunos numa turma
          </h2>
          <p className="mt-1 text-tinta-clara">
            Uma linha por aluno, no formato <strong>Nome - Telefone</strong>.
          </p>
        </div>
        <button onClick={() => setAberto(false)} className="btn-fantasma">
          Fechar
        </button>
      </div>

      <form action={enviar} className="space-y-5">
        {/* ---------- 1. A lista ---------- */}
        <div>
          <label htmlFor="lista" className="mb-1 block font-titulo text-sm font-bold">
            1. Lista de alunos
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
            rows={8}
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

        {/* ---------- 2. O curso ---------- */}
        <div>
          <label htmlFor="courseId" className="mb-1 block font-titulo text-sm font-bold">
            2. Curso
          </label>
          <select
            id="courseId"
            name="courseId"
            required
            value={cursoEscolhido}
            onChange={(e) => {
              setCursoEscolhido(e.target.value);
              setTurmaEscolhida("");
            }}
            className="campo"
          >
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
        </div>

        {/* ---------- 3. A turma ---------- */}
        <fieldset className="rounded-md border-2 border-indigo-line p-4">
          <legend className="px-2 font-titulo text-sm font-bold">
            3. Turma <span className="text-vermelho">*</span>
          </legend>

          <p className="mb-3 text-sm text-cinza">
            Todo aluno entra numa turma: é ela que define o cronograma, o local
            dos encontros e a chamada.
          </p>

          {!semTurmas && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setModoTurma("existente")}
                className={
                  modoEfetivo === "existente"
                    ? "btn-primario text-sm"
                    : "btn-secundario text-sm"
                }
              >
                Usar turma existente
              </button>
              <button
                type="button"
                onClick={() => setModoTurma("nova")}
                className={
                  modoEfetivo === "nova" ? "btn-primario text-sm" : "btn-secundario text-sm"
                }
              >
                + Criar turma agora
              </button>
            </div>
          )}

          <input type="hidden" name="modoTurma" value={modoEfetivo} />

          {modoEfetivo === "existente" ? (
            <div>
              <label htmlFor="cohortId" className="mb-1 block font-titulo text-sm font-bold">
                Turma
              </label>
              <select
                id="cohortId"
                name="cohortId"
                required
                value={turmaEscolhida}
                onChange={(e) => setTurmaEscolhida(e.target.value)}
                className="campo"
              >
                <option value="">Escolha a turma…</option>
                {turmasDoCurso.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} · {t.codigo} · {t.inscritos}
                    {t.vagas != null ? `/${t.vagas}` : ""} aluno(s) ·{" "}
                    {ROTULO_SITUACAO[t.situacao] ?? t.situacao}
                  </option>
                ))}
              </select>

              {vagasRestantes !== null && (
                <p
                  className={`mt-1 text-sm ${
                    estouraVagas ? "font-bold text-vermelho-dark" : "text-cinza"
                  }`}
                >
                  {estouraVagas
                    ? `Esta turma tem ${vagasRestantes} vaga(s) livre(s) e você colou ${linhasPreenchidas} nome(s).`
                    : `${vagasRestantes} vaga(s) livre(s) nesta turma.`}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {semTurmas && (
                <p className="rounded-md bg-amarelo-soft px-3 py-2 text-sm text-amarelo-dark">
                  Este curso ainda não tem turma. Crie a primeira abaixo.
                </p>
              )}

              <div>
                <label
                  htmlFor="turmaNovaNome"
                  className="mb-1 block font-titulo text-sm font-bold"
                >
                  Nome da turma
                </label>
                <input
                  id="turmaNovaNome"
                  name="turmaNovaNome"
                  required={modoEfetivo === "nova"}
                  minLength={3}
                  placeholder="Ex: Rede Municipal — turma de março"
                  className="campo"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="turmaNovaModalidade"
                    className="mb-1 block font-titulo text-sm font-bold"
                  >
                    Modalidade
                  </label>
                  <select
                    id="turmaNovaModalidade"
                    name="turmaNovaModalidade"
                    value={modalidadeNova}
                    onChange={(e) => setModalidadeNova(e.target.value)}
                    className="campo"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="HIBRIDA">Híbrida</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="turmaNovaInicio"
                    className="mb-1 block font-titulo text-sm font-bold"
                  >
                    Início <span className="font-normal text-cinza">(opcional)</span>
                  </label>
                  <input
                    id="turmaNovaInicio"
                    name="turmaNovaInicio"
                    type="date"
                    className="campo"
                  />
                </div>
              </div>

              {modalidadeNova !== "ONLINE" && (
                <div>
                  <label
                    htmlFor="turmaNovaLocal"
                    className="mb-1 block font-titulo text-sm font-bold"
                  >
                    Local dos encontros
                  </label>
                  <input
                    id="turmaNovaLocal"
                    name="turmaNovaLocal"
                    placeholder="Ex: EMEF Vila Nova"
                    className="campo"
                  />
                </div>
              )}

              <p className="text-sm text-cinza">
                A turma nasce com inscrições abertas e código próprio. Encontros,
                endereço completo, vagas e instrutor você completa depois, na
                página da turma.
              </p>
            </div>
          )}
        </fieldset>

        <div className="rounded-md border-l-4 border-indigo bg-indigo-soft p-4">
          <p className="font-titulo text-sm font-bold text-indigo-dark">
            Como o aluno vai entrar
          </p>
          <p className="mt-1 text-sm text-indigo-dark">
            <strong>Login:</strong> o próprio telefone (só os números) ·{" "}
            <strong>Senha:</strong> as 3 primeiras letras do nome, em minúsculas.
          </p>
          <p className="mt-1 text-sm text-indigo-dark">
            No primeiro acesso, a plataforma pede que ele crie uma senha própria —
            a provisória é fácil de adivinhar por quem tem a lista de chamada.
          </p>
        </div>

        <button
          type="submit"
          disabled={pendente || estouraVagas}
          className="btn-primario"
        >
          {pendente ? "Cadastrando..." : "Cadastrar alunos na turma"}
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

          {estado.turmaCriada && (
            <div className="mt-4 rounded-lg border-2 border-verde-soft bg-verde-soft p-4">
              <p className="font-titulo font-bold text-verde-dark">
                Turma criada: {estado.turmaCriada.nome}
              </p>
              <p className="mt-1 text-sm text-verde-dark">
                Código de matrícula:{" "}
                <span className="font-mono text-lg font-bold tracking-widest">
                  {estado.turmaCriada.codigo}
                </span>
              </p>
              <Link
                href={`/admin/turmas/${estado.turmaCriada.id}`}
                className="btn-secundario mt-3"
              >
                Completar dados e encontros
              </Link>
            </div>
          )}

          {estado.credenciais.length > 0 && (
            <div className="mt-4 rounded-lg border-2 border-indigo-line p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="font-titulo font-bold">
                  Credenciais para entregar aos alunos
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copiarCredenciais}
                    className="btn-secundario"
                  >
                    {copiado ? "Copiado!" : "Copiar tudo"}
                  </button>
                  {estado.cohortId && (
                    <Link
                      href={`/admin/turmas/${estado.cohortId}?ficha=1`}
                      className="btn-secundario"
                    >
                      Ficha para imprimir
                    </Link>
                  )}
                </div>
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
