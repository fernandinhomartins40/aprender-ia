"use client";

import { useMemo, useState } from "react";
import {
  normalizar,
  ROTULO_CATEGORIA,
  TOM_CATEGORIA,
} from "@/lib/motor-diario";
import type { CategoriaRegistro } from "@aprender/db";

/**
 * Linha do tempo do diário: busca, filtro por categoria e agrupamento por dia.
 *
 * A busca é local porque o conjunto é pequeno (dezenas de registros por
 * professor) e assim encontra com e sem acento, instantaneamente, sem ida
 * ao servidor a cada tecla.
 *
 * Agrupar por dia é o que transforma uma lista em memória: "o que eu fiz
 * na terça" é a pergunta que o professor faz, não "qual foi o registro 14".
 */

export type Registro = {
  id: string;
  oQueFez: string;
  observacao: string | null;
  categoria: CategoriaRegistro | null;
  origem: "MANUAL" | "AUTOMATICO" | "CONFIRMADO";
  tema: string | null;
  disciplina: string | null;
  etapa: string | null;
  marcadores: string[];
  ferramentaUsada: string | null;
  minutosAntes: number | null;
  minutosAgora: number | null;
  registradoEm: string;
};

const CATEGORIAS: CategoriaRegistro[] = [
  "AULA", "PLANEJAMENTO", "ATIVIDADE", "AVALIACAO", "ESTRATEGIA",
  "DIFICULDADE", "ADAPTACAO", "OBSERVACAO", "RESULTADO", "IDEIA_FUTURA",
  "RECURSO", "REFLEXAO",
];

function dia(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(iso));
}

export function DiarioLinhaTempo({
  registros,
  aoExcluir,
}: {
  registros: Registro[];
  aoExcluir: (d: FormData) => Promise<void>;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<CategoriaRegistro | "todas">("todas");
  const [removidos, setRemovidos] = useState<Set<string>>(new Set());

  // Só as categorias que o professor de fato tem: oferecer doze filtros
  // quando existem registros de três é ruído.
  const presentes = useMemo(
    () => CATEGORIAS.filter((c) => registros.some((r) => r.categoria === c)),
    [registros],
  );

  const lista = useMemo(() => {
    const q = normalizar(busca);
    return registros
      .filter((r) => !removidos.has(r.id))
      .filter((r) => filtro === "todas" || r.categoria === filtro)
      .filter(
        (r) =>
          !q ||
          normalizar(
            [r.oQueFez, r.observacao, r.tema, r.disciplina, r.etapa, ...r.marcadores]
              .filter(Boolean)
              .join(" "),
          ).includes(q),
      );
  }, [registros, busca, filtro, removidos]);

  // Agrupa preservando a ordem (os registros já vêm do mais recente).
  const porDia = useMemo(() => {
    const mapa = new Map<string, Registro[]>();
    for (const r of lista) {
      const chave = dia(r.registradoEm);
      const atual = mapa.get(chave);
      if (atual) atual.push(r);
      else mapa.set(chave, [r]);
    }
    return [...mapa.entries()];
  }, [lista]);

  function excluir(id: string) {
    setRemovidos((a) => new Set(a).add(id));
    const d = new FormData();
    d.set("id", id);
    void aoExcluir(d).catch(() => {
      setRemovidos((a) => {
        const n = new Set(a);
        n.delete(id);
        return n;
      });
    });
  }

  if (registros.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-borda bg-white px-6 py-12 text-center">
        <p className="font-titulo font-bold text-tinta">Seu diário começa agora</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-tinta-clara">
          Escreva acima o que aconteceu hoje — ou apenas use a plataforma: ao
          preparar material com os prompts, o registro aparece aqui sozinho.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar: frações, 6º ano, avaliação…"
          className="campo min-w-56 flex-1"
          aria-label="Buscar no diário"
        />
      </div>

      {presentes.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Filtro ativo={filtro === "todas"} onClick={() => setFiltro("todas")}>
            Tudo
          </Filtro>
          {presentes.map((c) => (
            <Filtro key={c} ativo={filtro === c} onClick={() => setFiltro(c)}>
              {ROTULO_CATEGORIA[c]}
            </Filtro>
          ))}
        </div>
      )}

      <p className="mb-3 text-sm text-tinta-clara">
        {lista.length === 0
          ? "Nenhum registro encontrado."
          : `${lista.length} ${lista.length === 1 ? "registro" : "registros"}`}
      </p>

      <div className="space-y-6">
        {porDia.map(([quando, doDia]) => (
          <section key={quando}>
            <h3 className="mb-2 font-titulo text-sm font-bold capitalize text-tinta-clara">
              {quando}
            </h3>
            <ul className="space-y-2">
              {doDia.map((r) => (
                <li key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 leading-relaxed text-tinta">{r.oQueFez}</p>
                    <button
                      onClick={() => excluir(r.id)}
                      aria-label="Apagar registro"
                      className="-mr-1 -mt-1 shrink-0 rounded-lg px-2 py-1 text-sm text-cinza hover:bg-fundo hover:text-vermelho-dark"
                    >
                      ×
                    </button>
                  </div>

                  {r.observacao && (
                    <p className="mt-2 border-l-2 border-borda pl-3 text-sm leading-relaxed text-tinta-clara">
                      {r.observacao}
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {r.categoria && (
                      <span className={TOM_CATEGORIA[r.categoria]}>
                        {ROTULO_CATEGORIA[r.categoria]}
                      </span>
                    )}
                    {r.disciplina && <span className="selo-cinza">{r.disciplina}</span>}
                    {r.etapa && <span className="selo-cinza">{r.etapa}</span>}
                    {economia(r) > 0 && (
                      <span className="selo-verde">−{economia(r)} min</span>
                    )}
                    {/* A origem é dita porque importa: o professor precisa
                        saber o que ele escreveu e o que a aplicação
                        registrou por ele. */}
                    {r.origem !== "MANUAL" && (
                      <span className="text-xs text-cinza">registrado pela plataforma</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function economia(r: Registro): number {
  return Math.max(0, (r.minutosAntes ?? 0) - (r.minutosAgora ?? 0));
}

function Filtro({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
        ativo
          ? "border-indigo bg-indigo text-white"
          : "border-borda bg-white text-tinta-clara hover:border-indigo hover:text-indigo"
      }`}
    >
      {children}
    </button>
  );
}
