"use client";

import { useState } from "react";

/**
 * Seleção do que um plano libera.
 *
 * A UX resolve o problema apontado no requisito — "evite uma interface
 * confusa com dezenas de checkboxes espalhados": cada curso é um cartão
 * fechado, e os módulos só aparecem quando o administrador escolhe
 * "apenas alguns módulos". Quem quer dar o curso inteiro (o caso comum)
 * marca uma caixa e não vê módulo nenhum.
 *
 * O estado mora aqui porque a tela precisa reagir a duas coisas antes de
 * salvar: marcar o curso revela a escolha de abrangência, e escolher
 * "alguns módulos" revela a lista.
 */

export type ModuloOpcao = {
  id: string;
  titulo: string;
  ordem: number;
  faixa: string | null;
};

export type CursoOpcao = {
  id: string;
  titulo: string;
  publicado: boolean;
  modulos: ModuloOpcao[];
};

export type SelecaoInicial = {
  courseId: string;
  abrangencia: "CURSO_COMPLETO" | "MODULOS_ESPECIFICOS";
  moduleIds: string[];
};

type Estado = {
  marcado: boolean;
  abrangencia: "CURSO_COMPLETO" | "MODULOS_ESPECIFICOS";
  modulos: Set<string>;
};

export function ConteudoDoPlano({
  planId,
  planNome,
  cursos,
  selecao,
  aoSalvar,
}: {
  planId: string;
  planNome: string;
  cursos: CursoOpcao[];
  selecao: SelecaoInicial[];
  aoSalvar: (d: FormData) => Promise<void>;
}) {
  const [estado, setEstado] = useState<Record<string, Estado>>(() => {
    const inicial: Record<string, Estado> = {};
    for (const c of cursos) {
      const s = selecao.find((x) => x.courseId === c.id);
      inicial[c.id] = {
        marcado: Boolean(s),
        abrangencia: s?.abrangencia ?? "CURSO_COMPLETO",
        modulos: new Set(s?.moduleIds ?? []),
      };
    }
    return inicial;
  });
  const [salvando, setSalvando] = useState(false);
  /**
   * Confirmação do último salvamento.
   *
   * A action não devolve nada e a tela não mudava de aparência ao salvar:
   * o botão saía de "Salvando…" e tudo ficava igual. Sem sinal nenhum, um
   * salvamento bem-sucedido é indistinguível de um que falhou — foi assim
   * que um vínculo que ESTAVA gravado passou por "não salva".
   */
  const [salvoEm, setSalvoEm] = useState<string | null>(null);

  function mudar(courseId: string, mudanca: Partial<Estado>) {
    // Qualquer alteração invalida a confirmação anterior: mantê-la na tela
    // afirmaria que o que está marcado agora é o que está no banco.
    setSalvoEm(null);
    setEstado((a) => ({ ...a, [courseId]: { ...a[courseId]!, ...mudanca } }));
  }

  function alternarModulo(courseId: string, moduleId: string) {
    setSalvoEm(null);
    setEstado((a) => {
      const atual = a[courseId]!;
      const modulos = new Set(atual.modulos);
      if (modulos.has(moduleId)) modulos.delete(moduleId);
      else modulos.add(moduleId);
      return { ...a, [courseId]: { ...atual, modulos } };
    });
  }

  async function enviar(dados: FormData) {
    // Dois envios simultâneos do mesmo formulário chegam como duas
    // transações que apagam e recriam o mesmo conjunto. Em produção
    // saíram oito num intervalo de oito segundos. Enquanto um salvamento
    // está em voo, os seguintes são descartados.
    if (salvando) return;

    // O formulário é reconstruído a partir do estado da tela, e não dos
    // checkboxes: um campo controlado que o React esteja re-renderizando
    // no instante do envio pode não entrar no FormData, e a action leria
    // uma seleção vazia — exatamente o que zerou o plano em produção.
    dados.delete("cursos");
    for (const [courseId, e] of Object.entries(estado)) {
      if (!e.marcado) continue;
      dados.append("cursos", courseId);
      dados.set(`abrangencia:${courseId}`, e.abrangencia);
      dados.delete(`modulos:${courseId}`);
      if (e.abrangencia === "MODULOS_ESPECIFICOS") {
        for (const m of e.modulos) dados.append(`modulos:${courseId}`, m);
      }
    }

    // Desmarcar tudo é uma decisão possível, mas o servidor recusa um
    // envio vazio sem esta confirmação — é o que separa "quis zerar" de
    // "o formulário chegou vazio por acidente".
    if (totalMarcados === 0) {
      const ok = window.confirm(
        `Isto vai remover TODO o conteúdo de "${planNome}". ` +
          `Quem tiver este plano deixa de alcançar qualquer curso por ele.\n\n` +
          `Confirma?`,
      );
      if (!ok) return;
      dados.set("confirmarVazio", "sim");
    }

    setSalvando(true);
    try {
      await aoSalvar(dados);
      setSalvoEm(
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      );
    } finally {
      setSalvando(false);
    }
  }

  const totalMarcados = Object.values(estado).filter((e) => e.marcado).length;

  return (
    <form action={enviar}>
      <input type="hidden" name="planId" value={planId} />

      <div className="mb-4 rounded-xl border border-borda bg-white p-4">
        <p className="font-titulo font-bold text-tinta">Este plano libera</p>
        <p className="mt-0.5 text-sm text-tinta-clara">
          {totalMarcados === 0
            ? "Nenhum curso selecionado — quem tiver este plano não alcança conteúdo nenhum por ele."
            : `${totalMarcados} curso(s) selecionado(s).`}
        </p>
      </div>

      <div className="space-y-3">
        {cursos.map((curso) => {
          const e = estado[curso.id]!;
          return (
            <div
              key={curso.id}
              className={`rounded-xl border bg-white p-4 transition-colors ${
                e.marcado ? "border-indigo" : "border-borda"
              }`}
            >
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="cursos"
                  value={curso.id}
                  checked={e.marcado}
                  onChange={(ev) => mudar(curso.id, { marcado: ev.target.checked })}
                  className="mt-1"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-titulo font-bold text-tinta">
                    {curso.titulo}
                    {!curso.publicado && (
                      <span className="ml-2 rounded-full bg-amarelo-soft px-2 py-0.5 text-xs font-bold text-amarelo-dark">
                        não publicado
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-tinta-clara">
                    {curso.modulos.length} módulo(s)
                  </span>
                </span>
              </label>

              {e.marcado && (
                <div className="mt-3 border-t border-borda pt-3">
                  <div className="flex flex-wrap gap-2">
                    <Opcao
                      nome={`abrangencia:${curso.id}`}
                      valor="CURSO_COMPLETO"
                      ativo={e.abrangencia === "CURSO_COMPLETO"}
                      onClick={() => mudar(curso.id, { abrangencia: "CURSO_COMPLETO" })}
                      titulo="Curso completo"
                      detalhe="Inclui módulos criados no futuro"
                    />
                    <Opcao
                      nome={`abrangencia:${curso.id}`}
                      valor="MODULOS_ESPECIFICOS"
                      ativo={e.abrangencia === "MODULOS_ESPECIFICOS"}
                      onClick={() => mudar(curso.id, { abrangencia: "MODULOS_ESPECIFICOS" })}
                      titulo="Apenas alguns módulos"
                      detalhe="Você escolhe quais"
                    />
                  </div>

                  {e.abrangencia === "MODULOS_ESPECIFICOS" && (
                    <div className="mt-3">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            mudar(curso.id, { modulos: new Set(curso.modulos.map((m) => m.id)) })
                          }
                          className="text-xs font-bold text-indigo hover:underline"
                        >
                          Marcar todos
                        </button>
                        <button
                          type="button"
                          onClick={() => mudar(curso.id, { modulos: new Set() })}
                          className="text-xs font-semibold text-tinta-clara hover:underline"
                        >
                          Limpar
                        </button>
                      </div>

                      <ul className="space-y-1">
                        {curso.modulos.map((m) => (
                          <li key={m.id}>
                            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-fundo">
                              <input
                                type="checkbox"
                                name={`modulos:${curso.id}`}
                                value={m.id}
                                checked={e.modulos.has(m.id)}
                                onChange={() => alternarModulo(curso.id, m.id)}
                              />
                              <span className="min-w-0 flex-1 text-tinta">
                                {m.ordem}. {m.titulo}
                              </span>
                              {m.faixa && (
                                <span className="shrink-0 rounded-full bg-indigo-soft px-2 py-0.5 text-xs font-bold text-indigo-dark">
                                  {m.faixa}
                                </span>
                              )}
                            </label>
                          </li>
                        ))}
                      </ul>

                      {e.modulos.size === 0 && (
                        <p className="mt-2 text-xs text-amarelo-dark">
                          Nenhum módulo marcado: este curso não será incluído no plano.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button type="submit" disabled={salvando} className="btn-primario">
          {salvando ? "Salvando…" : `Salvar conteúdo de "${planNome}"`}
        </button>
        {salvoEm ? (
          <span className="text-sm font-bold text-verde-dark">
            Salvo às {salvoEm} — {totalMarcados} curso(s) liberado(s).
          </span>
        ) : (
          <span className="text-sm text-tinta-clara">
            Vale imediatamente para todos os alunos com este plano.
          </span>
        )}
      </div>
    </form>
  );
}

/**
 * Botão-rádio de abrangência.
 *
 * O `<input type="radio">` fica escondido mas presente: é ele que o
 * formulário envia, e usar só botões exigiria um campo oculto sincronizado
 * à mão — mais código para o mesmo efeito.
 */
function Opcao({
  nome,
  valor,
  ativo,
  onClick,
  titulo,
  detalhe,
}: {
  nome: string;
  valor: string;
  ativo: boolean;
  onClick: () => void;
  titulo: string;
  detalhe: string;
}) {
  return (
    <label
      className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 transition-colors ${
        ativo ? "border-indigo bg-indigo-soft" : "border-borda hover:border-indigo"
      }`}
    >
      <input
        type="radio"
        name={nome}
        value={valor}
        checked={ativo}
        onChange={onClick}
        className="sr-only"
      />
      <span className="block text-sm font-bold text-tinta">{titulo}</span>
      <span className="block text-xs text-tinta-clara">{detalhe}</span>
    </label>
  );
}
