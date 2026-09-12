"use client";

import { useMemo, useState } from "react";
import { CardPrompt } from "./card-prompt";
import { GeradorPrompt } from "./gerador-prompt";
import { AjudaContextual, type ItemAjuda } from "./ajuda-contextual";

/**
 * Banco de prompts: gerador, filtros e lista.
 *
 * Os ícones ⓘ ficam nos rótulos de filtro e nos metadados do prompt —
 * "etapa de ensino", "objetivo pedagógico", "nível de dificuldade" são
 * exatamente os termos que um professor pode não reconhecer nesse
 * contexto. Os verbetes vêm prontos da página (`ajuda`), para que este
 * componente client não precise buscar nada.
 */

type Item = {
  id: string;
  titulo: string;
  corpo: string;
  categoria: string;
  disciplina: string | null;
  dica: string | null;
  origem: string | null;
  faixa: string;
  variaveis: { chave: string; rotulo?: string; exemplo?: string }[];
  ferramentasSugeridas: string[];
  etapaEnsino: string | null;
  objetivoPedagogico: string | null;
  tipoAtividade: string | null;
  nivelDificuldade: string | null;
  tags: string[];
  usos: number;
  favorito: boolean;
};

type Tool = {
  chave: string;
  nome: string;
  descricao: string;
  url: string;
  capacidades: string[];
  metodoAbertura: string;
  urlComPrompt: string | null;
  observacaoIntegracao: string | null;
};

export function BibliotecaPrompts({
  prompts,
  ferramentas,
  onExecutar,
  onFavoritar,
  ajuda = {},
  aoMontarPrompt,
}: {
  prompts: Item[];
  ferramentas: Tool[];
  onExecutar: (d: FormData) => Promise<void>;
  onFavoritar: (d: FormData) => Promise<void>;
  /** Verbetes já carregados pela página, indexados por slug. */
  ajuda?: Record<string, ItemAjuda>;
  /** Registra no diário um prompt montado no gerador. */
  aoMontarPrompt?: (d: FormData) => Promise<void>;
}) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [disciplina, setDisciplina] = useState("todas");
  const [modo, setModo] = useState("todos");
  const [abertoId, setAbertoId] = useState<string | null>(null);

  const categorias = useMemo(
    () => ["todas", ...new Set(prompts.map((p) => p.categoria))],
    [prompts],
  );
  const disciplinas = useMemo(
    () => ["todas", ...new Set(prompts.map((p) => p.disciplina).filter(Boolean) as string[])],
    [prompts],
  );

  const lista = prompts
    .filter(
      (p) =>
        [p.titulo, p.corpo, p.categoria, p.disciplina, p.etapaEnsino, p.objetivoPedagogico, ...p.tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(busca.toLowerCase()) &&
        (categoria === "todas" || p.categoria === categoria) &&
        (disciplina === "todas" || p.disciplina === disciplina) &&
        (modo !== "favoritos" || p.favorito),
    )
    .sort((x, y) => (modo === "mais" ? y.usos - x.usos : x.titulo.localeCompare(y.titulo)));

  /** Ícone de um termo, quando o verbete existe. */
  function Ajuda({ slug, contexto = "prompts" }: { slug: string; contexto?: string }) {
    const item = ajuda[slug];
    if (!item) return null;
    return <AjudaContextual item={item} contexto={contexto} />;
  }

  return (
    <div className="space-y-6">
      <GeradorPrompt ferramentas={ferramentas} ajuda={ajuda} aoUsar={aoMontarPrompt} />

      <div className="rounded-xl border border-borda bg-indigo-soft p-4">
        <div className="flex flex-wrap gap-3">
          <label className="min-w-56 flex-1">
            <span className="mb-1 block text-sm font-bold text-tinta">
              Buscar
              <Ajuda slug="prompt" />
            </span>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Tema, turma, objetivo ou atividade"
              className="campo w-full"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-bold text-tinta">Categoria</span>
            <select className="campo" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categorias.map((x) => (
                <option key={x} value={x}>
                  {x === "todas" ? "Todas as categorias" : x}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-bold text-tinta">
              Disciplina
              <Ajuda slug="componente-curricular" />
            </span>
            <select className="campo" value={disciplina} onChange={(e) => setDisciplina(e.target.value)}>
              {disciplinas.map((x) => (
                <option key={x} value={x}>
                  {x === "todas" ? "Todas as disciplinas" : x}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {([
            ["todos", "Todos"],
            ["favoritos", "Favoritos"],
            ["mais", "Mais usados"],
          ] as const).map(([valor, rotulo]) => (
            <button
              key={valor}
              onClick={() => setModo(valor)}
              aria-pressed={modo === valor}
              className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
                modo === valor
                  ? "border-indigo bg-indigo text-white"
                  : "border-borda bg-white text-tinta-clara hover:border-indigo hover:text-indigo"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-tinta-clara">{lista.length} prompts encontrados</p>

      <div className="space-y-3">
        {lista.map((p) => (
          <article key={p.id} className="card">
            <div className="flex gap-3">
              <button
                onClick={() => setAbertoId(abertoId === p.id ? null : p.id)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex justify-between gap-2">
                  <b className="font-titulo">{p.titulo}</b>
                  <span className="shrink-0 text-indigo">{abertoId === p.id ? "Fechar" : "Usar →"}</span>
                </div>
                <p className="mt-1 text-sm text-cinza">
                  {[p.categoria, p.disciplina, p.etapaEnsino, p.tipoAtividade].filter(Boolean).join(" · ")}
                </p>
                {p.tags.length > 0 && (
                  <p className="mt-2 text-xs text-indigo">{p.tags.map((t) => `#${t}`).join(" ")}</p>
                )}
              </button>
              <form action={onFavoritar}>
                <input type="hidden" name="promptTemplateId" value={p.id} />
                <button aria-label="Favorito" className="min-h-11 px-2 text-xl">
                  {p.favorito ? "★" : "☆"}
                </button>
              </form>
            </div>

            {abertoId === p.id && (
              <div className="mt-4">
                {/* Os metadados pedagógicos do prompt: é aqui que o
                    vocabulário técnico aparece nomeado, e onde o ícone
                    tem justificativa real. */}
                {(p.etapaEnsino || p.objetivoPedagogico || p.nivelDificuldade) && (
                  <dl className="mb-4 grid gap-2 rounded-lg bg-fundo p-4 text-sm sm:grid-cols-2">
                    {p.etapaEnsino && (
                      <div>
                        <dt className="font-bold text-tinta">
                          Etapa de ensino
                          <Ajuda slug="etapa-ensino" />
                        </dt>
                        <dd className="text-tinta-clara">{p.etapaEnsino}</dd>
                      </div>
                    )}
                    {p.objetivoPedagogico && (
                      <div>
                        <dt className="font-bold text-tinta">
                          Objetivo pedagógico
                          <Ajuda slug="objetivo-pedagogico" />
                        </dt>
                        <dd className="text-tinta-clara">{p.objetivoPedagogico}</dd>
                      </div>
                    )}
                    {p.nivelDificuldade && (
                      <div>
                        <dt className="font-bold text-tinta">Nível de dificuldade</dt>
                        <dd className="text-tinta-clara">{p.nivelDificuldade}</dd>
                      </div>
                    )}
                  </dl>
                )}

                <p className="mb-3 text-sm text-tinta-clara">
                  Preencha os campos entre colchetes com a sua realidade.
                  <Ajuda slug="variavel-prompt" />
                  {" "}Antes de colar em uma ferramenta externa, remova dados que
                  identifiquem estudantes.
                  <Ajuda slug="privacidade" />
                </p>

                <CardPrompt
                  promptTemplateId={p.id}
                  corpo={p.corpo}
                  variaveis={p.variaveis}
                  ferramentasSugeridas={p.ferramentasSugeridas}
                  dica={p.dica}
                  onExecutado={(f, final, v) => {
                    const x = new FormData();
                    x.set("promptTemplateId", p.id);
                    x.set("ferramenta", f);
                    x.set("promptFinal", final);
                    x.set("variaveis", JSON.stringify(v));
                    void onExecutar(x);
                  }}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
