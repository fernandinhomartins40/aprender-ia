"use client";

import { useActionState, useState } from "react";
import type { ResultadoTurma } from "@/server/turmas";

type Acao = (
  anterior: ResultadoTurma | null,
  dados: FormData,
) => Promise<ResultadoTurma>;

export type TurmaInicial = {
  id?: string;
  nome: string;
  courseId: string;
  descricao: string | null;
  modalidade: string;
  situacao: string;
  local: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  sala: string | null;
  linkOnline: string | null;
  vagas: number | null;
  instrutorId: string | null;
  observacoes: string | null;
  inicioEm: string;
  fimEm: string;
  inscritos?: number;
};

const VAZIA: TurmaInicial = {
  nome: "",
  courseId: "",
  descricao: null,
  modalidade: "ONLINE",
  situacao: "RASCUNHO",
  local: null,
  endereco: null,
  cidade: null,
  uf: null,
  sala: null,
  linkOnline: null,
  vagas: null,
  instrutorId: null,
  observacoes: null,
  inicioEm: "",
  fimEm: "",
};

/**
 * Cadastro completo da turma.
 *
 * Os campos mudam com a modalidade: pedir endereço para uma turma online
 * é ruído, e deixar de pedir para uma presencial gera o "onde é mesmo?"
 * na véspera do encontro.
 */
export function FormularioTurma({
  acao,
  cursos,
  instrutores,
  inicial = VAZIA,
  aoConcluir,
}: {
  acao: Acao;
  cursos: { id: string; titulo: string }[];
  instrutores: { id: string; nome: string; papel: string }[];
  inicial?: TurmaInicial;
  aoConcluir?: () => void;
}) {
  const [estado, enviar, pendente] = useActionState(
    async (anterior: ResultadoTurma | null, dados: FormData) => {
      const r = await acao(anterior, dados);
      if (r.ok) aoConcluir?.();
      return r;
    },
    null,
  );

  const [modalidade, setModalidade] = useState(inicial.modalidade);
  const ehOnline = modalidade === "ONLINE";
  const editando = Boolean(inicial.id);

  return (
    <form action={enviar} className="space-y-5">
      {inicial.id && <input type="hidden" name="id" value={inicial.id} />}

      {estado && (
        <div
          role="status"
          className={`rounded-md border-l-4 px-4 py-3 ${
            estado.ok
              ? "border-verde bg-verde-soft text-verde-dark"
              : "border-vermelho bg-vermelho-soft text-vermelho-dark"
          }`}
        >
          {estado.mensagem}
        </div>
      )}

      {/* ---- Identificação ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="nome" className="mb-1 block font-titulo text-sm font-bold">
            Nome da turma
          </label>
          <input
            id="nome"
            name="nome"
            required
            minLength={3}
            defaultValue={inicial.nome}
            placeholder="Ex: Rede Municipal — turma de março"
            className="campo"
          />
        </div>

        <div>
          <label htmlFor="courseId" className="mb-1 block font-titulo text-sm font-bold">
            Curso
          </label>
          <select
            id="courseId"
            name="courseId"
            required
            defaultValue={inicial.courseId || cursos[0]?.id}
            className="campo"
          >
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="situacao" className="mb-1 block font-titulo text-sm font-bold">
            Situação
          </label>
          <select
            id="situacao"
            name="situacao"
            defaultValue={inicial.situacao}
            className="campo"
          >
            <option value="RASCUNHO">Rascunho — ninguém entra ainda</option>
            <option value="INSCRICOES_ABERTAS">Inscrições abertas</option>
            <option value="EM_ANDAMENTO">Em andamento — não aceita novos</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
          <p className="mt-1 text-sm text-cinza">
            O código de matrícula só funciona com inscrições abertas.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="descricao" className="mb-1 block font-titulo text-sm font-bold">
            Descrição <span className="font-normal text-cinza">(o aluno vê)</span>
          </label>
          <textarea
            id="descricao"
            name="descricao"
            rows={2}
            defaultValue={inicial.descricao ?? ""}
            placeholder="Para quem é esta turma, o que ela cobre"
            className="campo"
          />
        </div>
      </div>

      {/* ---- Modalidade e lugar ---- */}
      <fieldset className="rounded-md border-2 border-indigo-line p-4">
        <legend className="px-2 font-titulo text-sm font-bold">
          Como e onde acontece
        </legend>

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { v: "ONLINE", r: "Online", d: "Só encontros remotos" },
            { v: "PRESENCIAL", r: "Presencial", d: "Local fixo" },
            { v: "HIBRIDA", r: "Híbrida", d: "Mistura os dois" },
          ].map((o) => (
            <label
              key={o.v}
              className={`min-h-[44px] cursor-pointer rounded-md border-2 px-4 py-2 ${
                modalidade === o.v
                  ? "border-indigo bg-indigo-soft"
                  : "border-borda hover:border-indigo"
              }`}
            >
              <input
                type="radio"
                name="modalidade"
                value={o.v}
                checked={modalidade === o.v}
                onChange={(e) => setModalidade(e.target.value)}
                className="sr-only"
              />
              <span className="font-titulo text-sm font-bold">{o.r}</span>
              <span className="block text-xs text-cinza">{o.d}</span>
            </label>
          ))}
        </div>

        {ehOnline ? (
          <div>
            <label htmlFor="linkOnline" className="mb-1 block font-titulo text-sm font-bold">
              Link da sala virtual
            </label>
            <input
              id="linkOnline"
              name="linkOnline"
              required
              defaultValue={inicial.linkOnline ?? ""}
              placeholder="https://meet.google.com/..."
              className="campo"
            />
            <p className="mt-1 text-sm text-cinza">
              Cada encontro pode ter um link próprio, se preferir.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="local" className="mb-1 block font-titulo text-sm font-bold">
                  Local
                </label>
                <input
                  id="local"
                  name="local"
                  required
                  defaultValue={inicial.local ?? ""}
                  placeholder="Ex: EMEF Vila Nova"
                  className="campo"
                />
              </div>
              <div>
                <label htmlFor="sala" className="mb-1 block font-titulo text-sm font-bold">
                  Sala / bloco
                </label>
                <input
                  id="sala"
                  name="sala"
                  defaultValue={inicial.sala ?? ""}
                  placeholder="Ex: Laboratório de informática"
                  className="campo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="endereco" className="mb-1 block font-titulo text-sm font-bold">
                Endereço
              </label>
              <input
                id="endereco"
                name="endereco"
                defaultValue={inicial.endereco ?? ""}
                placeholder="Rua, número, bairro"
                className="campo"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="cidade" className="mb-1 block font-titulo text-sm font-bold">
                  Cidade
                </label>
                <input
                  id="cidade"
                  name="cidade"
                  defaultValue={inicial.cidade ?? ""}
                  className="campo"
                />
              </div>
              <div>
                <label htmlFor="uf" className="mb-1 block font-titulo text-sm font-bold">
                  UF
                </label>
                <input
                  id="uf"
                  name="uf"
                  maxLength={2}
                  defaultValue={inicial.uf ?? ""}
                  placeholder="SP"
                  className="campo uppercase"
                />
              </div>
            </div>

            {modalidade === "HIBRIDA" && (
              <div>
                <label
                  htmlFor="linkOnline"
                  className="mb-1 block font-titulo text-sm font-bold"
                >
                  Link para os encontros remotos
                </label>
                <input
                  id="linkOnline"
                  name="linkOnline"
                  defaultValue={inicial.linkOnline ?? ""}
                  placeholder="https://meet.google.com/..."
                  className="campo"
                />
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* ---- Período, vagas, instrutor ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inicioEm" className="mb-1 block font-titulo text-sm font-bold">
            Início
          </label>
          <input
            id="inicioEm"
            name="inicioEm"
            type="date"
            defaultValue={inicial.inicioEm}
            className="campo"
          />
          <p className="mt-1 text-sm text-cinza">
            Preenchido sozinho ao gerar os encontros.
          </p>
        </div>

        <div>
          <label htmlFor="fimEm" className="mb-1 block font-titulo text-sm font-bold">
            Término
          </label>
          <input
            id="fimEm"
            name="fimEm"
            type="date"
            defaultValue={inicial.fimEm}
            className="campo"
          />
        </div>

        <div>
          <label htmlFor="vagas" className="mb-1 block font-titulo text-sm font-bold">
            Vagas <span className="font-normal text-cinza">(vazio = sem limite)</span>
          </label>
          <input
            id="vagas"
            name="vagas"
            type="number"
            min={inicial.inscritos && inicial.inscritos > 0 ? inicial.inscritos : 1}
            defaultValue={inicial.vagas ?? ""}
            placeholder="Ex: 30"
            className="campo"
          />
          {editando && inicial.inscritos ? (
            <p className="mt-1 text-sm text-cinza">
              {inicial.inscritos} aluno(s) já inscrito(s) — o limite não pode
              ficar abaixo disso.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="instrutorId" className="mb-1 block font-titulo text-sm font-bold">
            Instrutor responsável
          </label>
          <select
            id="instrutorId"
            name="instrutorId"
            defaultValue={inicial.instrutorId ?? ""}
            className="campo"
          >
            <option value="">Sem responsável definido</option>
            {instrutores.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome} ({i.papel.toLowerCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="observacoes" className="mb-1 block font-titulo text-sm font-bold">
          Observações internas{" "}
          <span className="font-normal text-cinza">(o aluno não vê)</span>
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={2}
          defaultValue={inicial.observacoes ?? ""}
          placeholder="Combinações com a secretaria, contato da escola, lembretes"
          className="campo"
        />
      </div>

      <button type="submit" disabled={pendente} className="btn-primario">
        {pendente
          ? "Salvando..."
          : editando
            ? "Salvar alterações"
            : "Criar turma"}
      </button>
    </form>
  );
}
