"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { buscar, lerCodigoBncc, pedidoDeHabilidade } from "@/lib/motor-conhecimento";

/**
 * Central de Conhecimento: pesquisa e consulta em linguagem natural.
 *
 * A busca aceita tanto um termo ("rubrica") quanto uma pergunta ("qual a
 * diferença entre competência e habilidade?"). Quem resolve é
 * `lib/motor-conhecimento`, em código — sem chamada a modelo. O acervo é
 * fechado e conhecido, então a resposta é instantânea, funciona offline e
 * não há como inventar uma definição que não está na base.
 *
 * Três comportamentos especiais da consulta:
 *
 * 1. Código da BNCC digitado (EF05CI05) → decompõe a estrutura e manda
 *    conferir a descrição no documento oficial. Não afirmamos o conteúdo
 *    da habilidade, porque a plataforma não tem essa tabela e um palpite
 *    aqui seria exatamente o erro que o curso ensina a evitar.
 *
 * 2. Pedido de habilidade por tema ("quero trabalhar meio ambiente no 5º
 *    ano") → dizemos com franqueza que não temos a tabela e levamos à
 *    busca oficial, já com a etapa que a pessoa informou.
 *
 * 3. Nada encontrado → sugerimos os assuntos mais consultados, em vez de
 *    devolver uma tela vazia.
 */

type Item = {
  slug: string;
  termo: string;
  sinonimos: string[];
  categoria: string;
  resumo: string;
  explicacao: string;
  importancias: Record<string, string> | null;
  fonteNome: string | null;
  fonteUrl: string | null;
  saibaMaisUrl: string | null;
  relacionadoSlugs: string[];
};

const EXEMPLOS = [
  "O que é BNCC?",
  "Diferença entre competência e habilidade",
  "O que significa EF05CI05?",
  "O que é avaliação formativa?",
  "Como anonimizar dados de estudantes?",
];

export function CentralConhecimento({
  itens,
  slugInicial,
  categorias,
}: {
  itens: Item[];
  /** Verbete aberto de saída, quando se chega por `?termo=`. */
  slugInicial?: string;
  categorias: string[];
}) {
  const [consulta, setConsulta] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [slugAberto, setSlugAberto] = useState<string | null>(slugInicial ?? null);
  const painel = useRef<HTMLDivElement>(null);

  const porSlug = useMemo(
    () => Object.fromEntries(itens.map((i) => [i.slug, i])),
    [itens],
  );

  const resultados = useMemo(() => {
    const base = categoria === "todas" ? itens : itens.filter((i) => i.categoria === categoria);
    return buscar(base, consulta);
  }, [itens, consulta, categoria]);

  const codigo = useMemo(() => (consulta.trim() ? lerCodigoBncc(consulta) : null), [consulta]);
  const pedido = useMemo(
    () => (consulta.trim() && !codigo ? pedidoDeHabilidade(consulta) : null),
    [consulta, codigo],
  );

  const aberto = slugAberto ? porSlug[slugAberto] : undefined;

  // Chegar por `?termo=` ou escolher um relacionado deve levar o olho ao
  // painel: no celular ele fica abaixo da lista, fora da tela.
  useEffect(() => {
    if (slugAberto && window.innerWidth < 1024) {
      painel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [slugAberto]);

  const relacionados = (aberto?.relacionadoSlugs ?? [])
    .map((s) => porSlug[s])
    .filter((r): r is Item => Boolean(r));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
      {/* ---------------------------------------------- busca e resultados */}
      <section className="min-w-0">
        <label htmlFor="consulta" className="mb-1.5 block font-titulo text-sm font-bold">
          Pergunte com suas palavras
        </label>
        <input
          id="consulta"
          className="campo"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Ex.: O que é BNCC? · avaliação formativa · EF05CI05"
        />

        {!consulta && (
          <div className="mt-3 flex flex-wrap gap-2">
            {EXEMPLOS.map((e) => (
              <button
                key={e}
                onClick={() => setConsulta(e)}
                className="rounded-full border border-borda bg-white px-3 py-1.5 text-xs font-semibold text-tinta-clara hover:border-indigo hover:text-indigo"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Leitura de código: estrutura sim, conteúdo da habilidade não. */}
        {codigo && (
          <div className="mt-4 rounded-xl border-2 border-indigo bg-indigo-soft p-4">
            <p className="font-titulo text-sm font-bold uppercase tracking-wide text-indigo-dark">
              Leitura do código
            </p>
            <p className="mt-1 font-titulo text-xl font-extrabold">{codigo.codigo}</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-tinta">Etapa:</dt>
                <dd className="text-tinta-clara">{codigo.etapa}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-tinta">Período:</dt>
                <dd className="text-tinta-clara">{codigo.periodo}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-tinta">Componente:</dt>
                <dd className="text-tinta-clara">
                  {codigo.componente ?? "sigla não identificada nas tabelas oficiais"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-tinta">Sequencial:</dt>
                <dd className="text-tinta-clara">{codigo.sequencial}</dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-indigo/20 pt-3 text-xs leading-relaxed text-tinta-clara">
              {codigo.ressalva}
            </p>
            <a
              href="https://basenacionalcomum.mec.gov.br/abase/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-bold text-indigo underline"
            >
              Consultar a descrição oficial →
            </a>
          </div>
        )}

        {/* Pedido de habilidade por tema: o que NÃO temos, dito na cara. */}
        {pedido && (
          <div className="mt-4 rounded-xl border border-amarelo bg-amarelo-soft p-4">
            <p className="font-titulo text-sm font-bold text-amarelo-dark">
              Sobre encontrar habilidades por tema
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-amarelo-dark">
              A plataforma não tem a tabela completa de habilidades da BNCC e não vai
              sugerir códigos — um código inventado é justamente o erro mais comum de IA
              em contexto escolar. A consulta confiável é no documento oficial, que tem
              busca por etapa e componente.
            </p>
            {pedido.etapa && (
              <p className="mt-2 text-sm text-amarelo-dark">
                Procure por <b>{pedido.tema}</b> em <b>{pedido.etapa}</b>.
              </p>
            )}
            <a
              href="https://basenacionalcomum.mec.gov.br/abase/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-bold text-amarelo-dark underline"
            >
              Abrir a BNCC oficial →
            </a>
          </div>
        )}

        {/* ------------------------------------------------ categorias */}
        <div className="mt-4 flex flex-wrap gap-2">
          <BotaoCategoria
            rotulo="Todos os assuntos"
            ativo={categoria === "todas"}
            onClick={() => setCategoria("todas")}
          />
          {categorias.map((c) => (
            <BotaoCategoria
              key={c}
              rotulo={c}
              ativo={categoria === c}
              onClick={() => setCategoria(c)}
            />
          ))}
        </div>

        <p className="mt-4 text-sm text-tinta-clara">
          {resultados.length === 0
            ? "Nenhum assunto encontrado."
            : `${resultados.length} ${resultados.length === 1 ? "assunto" : "assuntos"}`}
          {consulta && resultados.length > 0 && " · do mais relevante ao menos"}
        </p>

        {resultados.length === 0 && (
          <div className="mt-3 rounded-xl border border-dashed border-borda bg-white p-5 text-center">
            <p className="text-sm text-tinta-clara">
              Talvez o assunto ainda não esteja na base. Tente uma palavra mais curta
              ou veja os mais consultados:
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {["bncc", "habilidade-bncc", "avaliacao-formativa", "ptcf", "privacidade"]
                .map((s) => porSlug[s])
                .filter((v): v is Item => Boolean(v))
                .map((v) => (
                  <button
                    key={v.slug}
                    onClick={() => {
                      setConsulta("");
                      setCategoria("todas");
                      setSlugAberto(v.slug);
                    }}
                    className="rounded-full border border-borda px-3 py-1.5 text-xs font-semibold text-indigo hover:bg-indigo-soft"
                  >
                    {v.termo}
                  </button>
                ))}
            </div>
          </div>
        )}

        <ul className="mt-3 space-y-2">
          {resultados.map((i) => {
            const ativo = slugAberto === i.slug;
            return (
              <li key={i.slug}>
                <button
                  onClick={() => setSlugAberto(i.slug)}
                  aria-current={ativo ? "true" : undefined}
                  className={`w-full rounded-xl border bg-white p-4 text-left transition-colors ${
                    ativo
                      ? "border-indigo bg-indigo-soft/40"
                      : "border-borda hover:border-indigo"
                  }`}
                >
                  <p className="font-titulo font-bold text-tinta">{i.termo}</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-indigo">
                    {i.categoria}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-tinta-clara">{i.resumo}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------- painel */}
      <section ref={painel} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-borda bg-white p-5 sm:p-6">
          {aberto ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo">
                {aberto.categoria}
              </p>
              <h2 className="mt-1 font-titulo text-2xl font-extrabold text-tinta">
                {aberto.termo}
              </h2>
              <p className="mt-2 font-semibold leading-relaxed text-tinta">{aberto.resumo}</p>

              <div className="mt-4 space-y-3 leading-relaxed text-tinta-clara">
                {aberto.explicacao.split("\n\n").map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>

              {/* Onde este conceito aparece na aplicação: transforma o
                  verbete em navegação, não só em leitura. */}
              {aberto.importancias && Object.keys(aberto.importancias).length > 0 && (
                <div className="mt-5 rounded-lg bg-fundo p-4">
                  <p className="font-titulo text-sm font-bold text-tinta">
                    Onde isso importa na plataforma
                  </p>
                  <ul className="mt-2 space-y-2">
                    {Object.entries(aberto.importancias).map(([ctx, texto]) => (
                      <li key={ctx} className="text-sm leading-relaxed text-tinta-clara">
                        <b className="font-bold text-tinta">{rotuloContexto(ctx)}: </b>
                        {texto}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-5 border-t border-borda pt-4 text-xs leading-relaxed text-cinza">
                {aberto.fonteNome ? (
                  <>
                    <b className="font-bold text-tinta-clara">Informação oficial · </b>
                    {aberto.fonteUrl ? (
                      <a
                        href={aberto.fonteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-indigo underline"
                      >
                        {aberto.fonteNome}
                      </a>
                    ) : (
                      aberto.fonteNome
                    )}
                  </>
                ) : (
                  "Explicação didática da plataforma — não é texto normativo. Para norma, consulte o documento oficial correspondente."
                )}
              </p>

              {aberto.saibaMaisUrl && (
                <p className="mt-3">
                  {aberto.saibaMaisUrl.startsWith("/") ? (
                    <Link href={aberto.saibaMaisUrl} className="font-bold text-indigo underline">
                      Saiba mais na plataforma →
                    </Link>
                  ) : (
                    <a
                      href={aberto.saibaMaisUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo underline"
                    >
                      Saiba mais →
                    </a>
                  )}
                </p>
              )}

              {relacionados.length > 0 && (
                <div className="mt-5 border-t border-borda pt-4">
                  <p className="font-titulo text-sm font-bold text-tinta">Assuntos relacionados</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {relacionados.map((r) => (
                      <button
                        key={r.slug}
                        onClick={() => setSlugAberto(r.slug)}
                        className="rounded-full border border-borda px-3 py-1.5 text-sm font-semibold text-indigo hover:bg-indigo-soft"
                      >
                        {r.termo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="font-titulo text-lg font-bold text-tinta">Escolha um assunto</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta-clara">
                Pesquise acima com suas próprias palavras ou escolha um assunto na lista.
                Cada explicação indica se é informação oficial ou explicação didática da
                plataforma.
              </p>
              <Link
                href="/app/conhecimento/bncc"
                className="mt-4 inline-block font-bold text-indigo underline"
              >
                Comece pela BNCC explicada do zero →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BotaoCategoria({
  rotulo,
  ativo,
  onClick,
}: {
  rotulo: string;
  ativo: boolean;
  onClick: () => void;
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
      {rotulo}
    </button>
  );
}

/** Nome de tela para as chaves de `importancias`. */
function rotuloContexto(chave: string): string {
  const NOMES: Record<string, string> = {
    inicio: "No início",
    trilha: "Na trilha",
    licao: "Nas lições",
    prompts: "No banco de prompts",
    "criar-prompt": "No criador de prompt",
    gerador: "No gerador de prompt",
    ferramentas: "Nas ferramentas de IA",
    diario: "No diário de bordo",
    missoes: "Nas missões",
    conquistas: "Nas conquistas",
    planejamento: "No planejamento",
    privacidade: "Em privacidade",
  };
  return NOMES[chave] ?? chave;
}
