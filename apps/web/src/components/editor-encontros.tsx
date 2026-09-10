"use client";

import { useActionState, useState } from "react";
import type { ResultadoTurma } from "@/server/turmas";
import { dataLonga, faixaHoraria, paraInputDate } from "@/lib/datas";

type AcaoEstado = (
  anterior: ResultadoTurma | null,
  dados: FormData,
) => Promise<ResultadoTurma>;
type AcaoSimples = (dados: FormData) => Promise<void>;

export type EncontroItem = {
  id: string;
  ordem: number;
  titulo: string | null;
  pauta: string | null;
  data: Date;
  horaInicio: string | null;
  horaFim: string | null;
  modalidade: string;
  local: string | null;
  endereco: string | null;
  sala: string | null;
  linkOnline: string | null;
  canceladoEm: Date | null;
  motivoCancelamento: string | null;
  presencasRegistradas: number;
};

function Aviso({ estado }: { estado: ResultadoTurma | null }) {
  if (!estado) return null;
  return (
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
  );
}

/**
 * Encontros da turma.
 *
 * Dois caminhos: o gerador em série, para o caso comum de encontros
 * semanais, e a edição encontro a encontro, para quando a realidade muda —
 * remarcar o terceiro, trocar a sala do último, cancelar por chuva.
 */
export function EditorEncontros({
  cohortId,
  encontros,
  modalidadeTurma,
  acaoGerar,
  acaoAdicionar,
  acaoEditar,
  acaoCancelar,
  acaoReativar,
  acaoRemover,
}: {
  cohortId: string;
  encontros: EncontroItem[];
  modalidadeTurma: string;
  acaoGerar: AcaoEstado;
  acaoAdicionar: AcaoEstado;
  acaoEditar: AcaoEstado;
  acaoCancelar: AcaoSimples;
  acaoReativar: AcaoSimples;
  acaoRemover: AcaoSimples;
}) {
  const [estadoGerar, gerar, gerando] = useActionState(acaoGerar, null);
  const [estadoAdd, adicionar, adicionando] = useActionState(acaoAdicionar, null);
  const [estadoEditar, editar, editandoAcao] = useActionState(acaoEditar, null);

  const [mostrarGerador, setMostrarGerador] = useState(encontros.length === 0);
  const [mostrarAvulso, setMostrarAvulso] = useState(false);
  const [emEdicao, setEmEdicao] = useState<string | null>(null);

  const ativos = encontros.filter((e) => !e.canceladoEm).length;

  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-titulo text-xl font-extrabold">Encontros</h2>
          <p className="mt-1 text-tinta-clara">
            {encontros.length === 0
              ? "Nenhum encontro marcado ainda."
              : `${ativos} encontro(s) ativo(s)${
                  encontros.length - ativos > 0
                    ? ` · ${encontros.length - ativos} cancelado(s)`
                    : ""
                }`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 nao-imprimir">
          <button
            onClick={() => {
              setMostrarGerador((v) => !v);
              setMostrarAvulso(false);
            }}
            className="btn-secundario text-sm"
          >
            Gerar em série
          </button>
          <button
            onClick={() => {
              setMostrarAvulso((v) => !v);
              setMostrarGerador(false);
            }}
            className="btn-secundario text-sm"
          >
            + Um encontro
          </button>
        </div>
      </div>

      {/* ---------- Gerador de recorrência ---------- */}
      {mostrarGerador && (
        <form
          action={gerar}
          className="mb-5 rounded-md border-2 border-indigo-line bg-indigo-soft p-4"
        >
          <input type="hidden" name="cohortId" value={cohortId} />
          <p className="mb-3 font-titulo text-sm font-bold text-indigo-dark">
            Encontros semanais
          </p>
          <p className="mb-3 text-sm text-indigo-dark">
            O dia da semana vem da primeira data. Depois de gerar, cada encontro
            pode ser ajustado individualmente.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label
                htmlFor="primeiraData"
                className="mb-1 block font-titulo text-xs font-bold"
              >
                Primeiro encontro
              </label>
              <input
                id="primeiraData"
                name="primeiraData"
                type="date"
                required
                className="campo"
              />
            </div>
            <div>
              <label
                htmlFor="quantidade"
                className="mb-1 block font-titulo text-xs font-bold"
              >
                Quantos
              </label>
              <input
                id="quantidade"
                name="quantidade"
                type="number"
                min={1}
                max={60}
                defaultValue={4}
                required
                className="campo"
              />
            </div>
            <div>
              <label
                htmlFor="intervaloSemanas"
                className="mb-1 block font-titulo text-xs font-bold"
              >
                A cada
              </label>
              <select
                id="intervaloSemanas"
                name="intervaloSemanas"
                defaultValue="1"
                className="campo"
              >
                <option value="1">1 semana</option>
                <option value="2">2 semanas</option>
                <option value="3">3 semanas</option>
                <option value="4">4 semanas</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="horaInicioSerie"
                className="mb-1 block font-titulo text-xs font-bold"
              >
                Início
              </label>
              <input
                id="horaInicioSerie"
                name="horaInicio"
                placeholder="19:00"
                className="campo"
              />
            </div>
            <div>
              <label
                htmlFor="horaFimSerie"
                className="mb-1 block font-titulo text-xs font-bold"
              >
                Fim
              </label>
              <input
                id="horaFimSerie"
                name="horaFim"
                placeholder="22:00"
                className="campo"
              />
            </div>
          </div>

          <button type="submit" disabled={gerando} className="btn-primario mt-3">
            {gerando ? "Gerando..." : "Gerar encontros"}
          </button>
          <Aviso estado={estadoGerar} />
        </form>
      )}

      {/* ---------- Encontro avulso ---------- */}
      {mostrarAvulso && (
        <form action={adicionar} className="mb-5 rounded-md border-2 border-borda p-4">
          <input type="hidden" name="cohortId" value={cohortId} />
          <CamposEncontro modalidadeTurma={modalidadeTurma} />
          <button type="submit" disabled={adicionando} className="btn-primario mt-3">
            {adicionando ? "Adicionando..." : "Adicionar encontro"}
          </button>
          <Aviso estado={estadoAdd} />
        </form>
      )}

      {/* ---------- Lista ---------- */}
      {encontros.length === 0 ? (
        <p className="py-6 text-center text-cinza">
          Use “Gerar em série” para criar os encontros de uma vez.
        </p>
      ) : (
        <ol className="space-y-3">
          {encontros.map((e) => {
            const cancelado = Boolean(e.canceladoEm);
            const editando = emEdicao === e.id;

            return (
              <li
                key={e.id}
                className={`rounded-md border-2 p-4 ${
                  cancelado ? "border-borda bg-fundo opacity-70" : "border-borda"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-titulo font-bold">
                        {e.titulo || `Encontro ${e.ordem}`}
                      </span>
                      <span
                        className={
                          e.modalidade === "REMOTO" ? "selo-indigo" : "selo-verde"
                        }
                      >
                        {e.modalidade === "REMOTO" ? "Remoto" : "Presencial"}
                      </span>
                      {cancelado && <span className="selo-vermelho">Cancelado</span>}
                      {e.presencasRegistradas > 0 && (
                        <span className="selo-cinza">
                          chamada feita ({e.presencasRegistradas})
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-tinta-clara">
                      {dataLonga(e.data)}
                      {faixaHoraria(e.horaInicio, e.horaFim) &&
                        ` · ${faixaHoraria(e.horaInicio, e.horaFim)}`}
                    </p>

                    {e.modalidade === "REMOTO"
                      ? e.linkOnline && (
                          <p className="mt-1 truncate text-sm text-cinza">
                            {e.linkOnline}
                          </p>
                        )
                      : (e.local || e.sala) && (
                          <p className="mt-1 text-sm text-cinza">
                            {[e.local, e.sala, e.endereco].filter(Boolean).join(" · ")}
                          </p>
                        )}

                    {e.pauta && <p className="mt-2 text-sm">{e.pauta}</p>}

                    {cancelado && e.motivoCancelamento && (
                      <p className="mt-2 text-sm text-vermelho-dark">
                        Motivo: {e.motivoCancelamento}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 nao-imprimir">
                    <button
                      onClick={() => setEmEdicao(editando ? null : e.id)}
                      className="btn-fantasma text-sm"
                    >
                      {editando ? "Fechar" : "Editar"}
                    </button>

                    {cancelado ? (
                      <form action={acaoReativar}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="cohortId" value={cohortId} />
                        <button type="submit" className="btn-fantasma text-sm">
                          Reativar
                        </button>
                      </form>
                    ) : (
                      <form action={acaoCancelar} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="cohortId" value={cohortId} />
                        <input
                          name="motivo"
                          placeholder="Motivo"
                          aria-label={`Motivo do cancelamento do encontro ${e.ordem}`}
                          className="w-28 rounded-md border-2 border-borda px-2 py-1.5 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-md px-2 py-1.5 text-sm font-bold text-vermelho-dark hover:bg-vermelho-soft"
                        >
                          Cancelar
                        </button>
                      </form>
                    )}

                    {/* Só some de vez o que ainda não tem chamada registrada. */}
                    {e.presencasRegistradas === 0 && (
                      <form action={acaoRemover}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="cohortId" value={cohortId} />
                        <button
                          type="submit"
                          className="rounded-md px-2 py-1.5 text-sm text-cinza hover:text-vermelho-dark"
                        >
                          Excluir
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {editando && (
                  <form
                    action={editar}
                    className="mt-4 border-t border-borda pt-4 nao-imprimir"
                  >
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="cohortId" value={cohortId} />
                    <CamposEncontro modalidadeTurma={modalidadeTurma} encontro={e} />
                    <button
                      type="submit"
                      disabled={editandoAcao}
                      className="btn-primario mt-3"
                    >
                      {editandoAcao ? "Salvando..." : "Salvar encontro"}
                    </button>
                    <Aviso estado={estadoEditar} />
                  </form>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** Campos compartilhados entre adicionar e editar um encontro. */
function CamposEncontro({
  modalidadeTurma,
  encontro,
}: {
  modalidadeTurma: string;
  encontro?: EncontroItem;
}) {
  const [modalidade, setModalidade] = useState(
    encontro?.modalidade ?? (modalidadeTurma === "ONLINE" ? "REMOTO" : "PRESENCIAL"),
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block font-titulo text-xs font-bold">Data</label>
          <input
            name="data"
            type="date"
            required
            defaultValue={encontro ? paraInputDate(encontro.data) : ""}
            className="campo"
          />
        </div>
        <div>
          <label className="mb-1 block font-titulo text-xs font-bold">Início</label>
          <input
            name="horaInicio"
            placeholder="19:00"
            defaultValue={encontro?.horaInicio ?? ""}
            className="campo"
          />
        </div>
        <div>
          <label className="mb-1 block font-titulo text-xs font-bold">Fim</label>
          <input
            name="horaFim"
            placeholder="22:00"
            defaultValue={encontro?.horaFim ?? ""}
            className="campo"
          />
        </div>
        <div>
          <label className="mb-1 block font-titulo text-xs font-bold">Modalidade</label>
          <select
            name="modalidade"
            value={modalidade}
            onChange={(ev) => setModalidade(ev.target.value)}
            className="campo"
          >
            <option value="PRESENCIAL">Presencial</option>
            <option value="REMOTO">Remoto</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block font-titulo text-xs font-bold">
          Tema <span className="font-normal text-cinza">(opcional)</span>
        </label>
        <input
          name="titulo"
          placeholder="Ex: Encontro 1 — O que é IA"
          defaultValue={encontro?.titulo ?? ""}
          className="campo"
        />
      </div>

      {modalidade === "REMOTO" ? (
        <div>
          <label className="mb-1 block font-titulo text-xs font-bold">
            Link da sala
          </label>
          <input
            name="linkOnline"
            placeholder="https://meet.google.com/..."
            defaultValue={encontro?.linkOnline ?? ""}
            className="campo"
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block font-titulo text-xs font-bold">
              Local <span className="font-normal text-cinza">(se diferente)</span>
            </label>
            <input
              name="local"
              defaultValue={encontro?.local ?? ""}
              className="campo"
            />
          </div>
          <div>
            <label className="mb-1 block font-titulo text-xs font-bold">Sala</label>
            <input name="sala" defaultValue={encontro?.sala ?? ""} className="campo" />
          </div>
          <div>
            <label className="mb-1 block font-titulo text-xs font-bold">Endereço</label>
            <input
              name="endereco"
              defaultValue={encontro?.endereco ?? ""}
              className="campo"
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block font-titulo text-xs font-bold">
          Pauta <span className="font-normal text-cinza">(o aluno vê)</span>
        </label>
        <textarea
          name="pauta"
          rows={2}
          defaultValue={encontro?.pauta ?? ""}
          placeholder="O que será tratado neste encontro"
          className="campo"
        />
      </div>
    </div>
  );
}
