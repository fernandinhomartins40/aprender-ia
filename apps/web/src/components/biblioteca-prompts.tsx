"use client";

import { useMemo, useState } from "react";
import { CardPrompt } from "./card-prompt";

type Item = {
  id: string;
  titulo: string;
  corpo: string;
  categoria: string;
  disciplina: string | null;
  dica: string | null;
  variaveis: { chave: string; rotulo?: string; exemplo?: string }[];
  ferramentasSugeridas: string[];
};

export function BibliotecaPrompts({
  prompts,
  onExecutar,
}: {
  prompts: Item[];
  onExecutar: (d: FormData) => Promise<void>;
}) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [aberto, setAberto] = useState<string | null>(null);

  const categorias = useMemo(
    () => ["todas", ...new Set(prompts.map((p) => p.categoria))],
    [prompts],
  );

  const filtrados = prompts.filter((p) => {
    const bateCategoria = categoria === "todas" || p.categoria === categoria;
    const texto = `${p.titulo} ${p.corpo} ${p.disciplina ?? ""}`.toLowerCase();
    return bateCategoria && texto.includes(busca.toLowerCase());
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar prompt..."
          aria-label="Buscar prompt"
          className="campo min-w-56 flex-1"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          aria-label="Filtrar por categoria"
          className="campo w-48"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c === "todas" ? "Todas as categorias" : c}
            </option>
          ))}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">Nenhum prompt encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map((p) => (
            <div key={p.id} className="card">
              <button
                onClick={() => setAberto(aberto === p.id ? null : p.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <p className="font-titulo font-bold">{p.titulo}</p>
                  <p className="mt-0.5 text-sm text-cinza">
                    {p.categoria}
                    {p.disciplina && ` · ${p.disciplina}`}
                  </p>
                </div>
                <span className="shrink-0 font-titulo text-sm font-bold text-indigo">
                  {aberto === p.id ? "Fechar" : "Usar →"}
                </span>
              </button>

              {aberto === p.id && (
                <div className="mt-4">
                  <CardPrompt
                    promptTemplateId={p.id}
                    corpo={p.corpo}
                    variaveis={p.variaveis}
                    ferramentasSugeridas={p.ferramentasSugeridas}
                    dica={p.dica}
                    onExecutado={(f, final, valores) => {
                      const d = new FormData();
                      d.set("promptTemplateId", p.id);
                      d.set("ferramenta", f);
                      d.set("promptFinal", final);
                      d.set("variaveis", JSON.stringify(valores));
                      void onExecutar(d);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
