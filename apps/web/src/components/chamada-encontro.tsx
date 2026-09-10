"use client";

import { useActionState, useState } from "react";
import type { ResultadoTurma } from "@/server/turmas";
import { dataCurta, faixaHoraria } from "@/lib/datas";

type Acao = (
  anterior: ResultadoTurma | null,
  dados: FormData,
) => Promise<ResultadoTurma>;

type Aluno = { id: string; nome: string; telefone: string | null };

type EncontroChamada = {
  id: string;
  ordem: number;
  titulo: string | null;
  data: Date;
  horaInicio: string | null;
  horaFim: string | null;
  canceladoEm: Date | null;
  presencas: { userId: string; situacao: string }[];
};

const OPCOES = [
  { v: "PRESENTE", r: "P", titulo: "Presente", cor: "bg-verde text-white" },
  { v: "FALTA", r: "F", titulo: "Falta", cor: "bg-vermelho text-white" },
  { v: "JUSTIFICADA", r: "J", titulo: "Falta justificada", cor: "bg-amarelo text-white" },
] as const;

/**
 * Chamada de um encontro.
 *
 * Três estados por aluno, e um quarto implícito: não marcado. A diferença
 * importa — "não chamei" não é a mesma coisa que "faltou", e só o segundo
 * pode custar o certificado a alguém.
 */
export function ChamadaEncontro({
  cohortId,
  encontros,
  alunos,
  acao,
}: {
  cohortId: string;
  encontros: EncontroChamada[];
  alunos: Aluno[];
  acao: Acao;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);

  const disponiveis = encontros.filter((e) => !e.canceladoEm);
  const [encontroId, setEncontroId] = useState(disponiveis[0]?.id ?? "");
  const encontro = disponiveis.find((e) => e.id === encontroId);

  /**
   * Marcações locais, para o admin ver o total mudar enquanto faz a chamada.
   *
   * O estado inicial é derivado do encontro selecionado com uma função —
   * chamar setState durante a renderização para "recarregar" o encontro
   * faria o React abortar a renderização em curso. Trocar de encontro
   * remonta este bloco via `key`, e aí o inicializador roda de novo.
   */
  const [marcacoes, setMarcacoes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (disponiveis.find((e) => e.id === encontroId)?.presencas ?? []).map((p) => [
        p.userId,
        p.situacao,
      ]),
    ),
  );

  function trocarEncontro(id: string) {
    setEncontroId(id);
    setMarcacoes(
      Object.fromEntries(
        (disponiveis.find((x) => x.id === id)?.presencas ?? []).map((p) => [
          p.userId,
          p.situacao,
        ]),
      ),
    );
  }

  const totais = OPCOES.map((o) => ({
    ...o,
    quantos: Object.values(marcacoes).filter((v) => v === o.v).length,
  }));
  const naoChamados = alunos.length - Object.keys(marcacoes).filter((k) => marcacoes[k]).length;

  if (alunos.length === 0) {
    return (
      <section className="card">
        <h2 className="font-titulo text-xl font-extrabold">Chamada</h2>
        <p className="py-6 text-center text-cinza">
          Cadastre alunos na turma para fazer a chamada.
        </p>
      </section>
    );
  }

  if (disponiveis.length === 0) {
    return (
      <section className="card">
        <h2 className="font-titulo text-xl font-extrabold">Chamada</h2>
        <p className="py-6 text-center text-cinza">
          Marque os encontros da turma para poder registrar presença.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="mb-4">
        <h2 className="font-titulo text-xl font-extrabold">Chamada</h2>
        <p className="mt-1 text-tinta-clara">
          O que não for marcado fica como “não chamado”, e não como falta.
        </p>
      </div>

      <form action={enviar}>
        <input type="hidden" name="cohortId" value={cohortId} />
        <input type="hidden" name="meetingId" value={encontroId} />

        <div className="mb-4">
          <label htmlFor="encontro" className="mb-1 block font-titulo text-sm font-bold">
            Encontro
          </label>
          <select
            id="encontro"
            value={encontroId}
            onChange={(e) => trocarEncontro(e.target.value)}
            className="campo"
          >
            {disponiveis.map((e) => (
              <option key={e.id} value={e.id}>
                {e.titulo || `Encontro ${e.ordem}`} · {dataCurta(e.data)}
                {faixaHoraria(e.horaInicio, e.horaFim)
                  ? ` · ${faixaHoraria(e.horaInicio, e.horaFim)}`
                  : ""}
                {e.presencas.length > 0 ? " · chamada feita" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3 flex flex-wrap gap-2 text-sm">
          {totais.map((t) => (
            <span key={t.v} className="selo-cinza">
              {t.titulo}: <strong>{t.quantos}</strong>
            </span>
          ))}
          {naoChamados > 0 && (
            <span className="selo-cinza">Não chamados: {naoChamados}</span>
          )}
        </div>

        <div className="mb-3 flex flex-wrap gap-2 nao-imprimir">
          <button
            type="button"
            onClick={() =>
              setMarcacoes(
                Object.fromEntries(alunos.map((a) => [a.id, "PRESENTE"])),
              )
            }
            className="btn-secundario text-sm"
          >
            Todos presentes
          </button>
          <button
            type="button"
            onClick={() => setMarcacoes({})}
            className="btn-fantasma text-sm"
          >
            Limpar
          </button>
        </div>

        <ul className="divide-y divide-borda rounded-md border-2 border-borda">
          {alunos.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{a.nome}</p>
                {a.telefone && (
                  <p className="font-mono text-sm text-cinza">{a.telefone}</p>
                )}
              </div>

              {/* O valor viaja num hidden: os botões abaixo são visuais. */}
              <input
                type="hidden"
                name={`presenca_${a.id}`}
                value={marcacoes[a.id] ?? ""}
              />

              <div className="flex shrink-0 gap-1">
                {OPCOES.map((o) => {
                  const ativo = marcacoes[a.id] === o.v;
                  return (
                    <button
                      key={o.v}
                      type="button"
                      title={o.titulo}
                      aria-label={`${o.titulo}: ${a.nome}`}
                      aria-pressed={ativo}
                      onClick={() =>
                        setMarcacoes((m) => ({
                          ...m,
                          // Clicar de novo na mesma opção desmarca.
                          [a.id]: ativo ? "" : o.v,
                        }))
                      }
                      className={`h-11 w-11 rounded-md border-2 font-titulo font-bold transition-colors ${
                        ativo
                          ? `${o.cor} border-transparent`
                          : "border-borda text-cinza hover:border-indigo"
                      }`}
                    >
                      {o.r}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>

        <button type="submit" disabled={pendente} className="btn-primario mt-4">
          {pendente ? "Registrando..." : "Registrar chamada"}
        </button>

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
      </form>
    </section>
  );
}
