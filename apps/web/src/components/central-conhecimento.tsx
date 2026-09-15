"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buscar, lerCodigoBncc, pedidoDeHabilidade } from "@/lib/motor-conhecimento";
import { estiloCategoria } from "@/lib/cores-conhecimento";
import { lerVistos, type VerbetesVistos } from "@/lib/verbetes-vistos";

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

export type AchadoHistorico = {
  oQueFez: string;
  quando: string;
  categoria: string | null;
};

export function CentralConhecimento({
  itens,
  categorias,
  aoConsultarHistorico,
}: {
  itens: Item[];
  categorias: string[];
  /**
   * Busca no diário do próprio professor.
   *
   * Responde "já trabalhei isso antes?" com os registros dele — que é o
   * que transforma a Central numa consulta ao próprio percurso, e não só
   * a um glossário.
   */
  aoConsultarHistorico?: (assunto: string) => Promise<AchadoHistorico[]>;
}) {
  const [consulta, setConsulta] = useState("");
  const [categoria, setCategoria] = useState("todas");

  /**
   * Quais assuntos este navegador já abriu.
   *
   * Começa vazio e só é preenchido depois da montagem: `localStorage` não
   * existe no servidor, e ler durante a renderização faria o HTML do servidor
   * divergir do primeiro desenho do cliente (erro de hidratação). O efeito
   * colateral é que as marcações aparecem um instante depois da lista — o que
   * é aceitável para uma pista visual.
   */
  const [vistos, setVistos] = useState<VerbetesVistos>({ vistos: {}, ultimo: null });
  useEffect(() => {
    setVistos(lerVistos());
  }, []);

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


  // ---- "Já trabalhei isso antes?" ----
  // Consulta com atraso: a cada tecla seria uma ida ao servidor por
  // caractere. 600ms é o tempo em que alguém para de digitar uma palavra.
  const [historico, setHistorico] = useState<AchadoHistorico[]>([]);
  useEffect(() => {
    const termo = consulta.trim();
    if (!aoConsultarHistorico || termo.length < 4) {
      setHistorico([]);
      return;
    }
    let valido = true;
    const t = setTimeout(() => {
      aoConsultarHistorico(termo)
        .then((r) => {
          // Descarta resposta de uma consulta que já não é a atual.
          if (valido) setHistorico(r);
        })
        .catch(() => {
          if (valido) setHistorico([]);
        });
    }, 600);
    return () => {
      valido = false;
      clearTimeout(t);
    };
  }, [consulta, aoConsultarHistorico]);

  return (
    // Coluna única: o verbete deixou de abrir num painel ao lado e passou a
    // ter página própria (`/app/conhecimento/[slug]`). Sem o painel, a grade
    // de duas colunas só espremeria a lista contra um espaço vazio.
    <div className="mx-auto max-w-3xl">
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

        {/* O próprio percurso do professor vem antes do glossário: se ele
            já trabalhou o assunto, essa é a informação mais útil que
            temos — e é dele, não nossa. */}
        {historico.length > 0 && (
          <div className="mt-4 rounded-xl border border-verde bg-verde-soft p-4">
            <p className="font-titulo text-sm font-bold text-verde-dark">
              Você já trabalhou isto
            </p>
            <ul className="mt-2 space-y-2">
              {historico.map((h, i) => (
                <li key={i} className="text-sm leading-relaxed text-verde-dark">
                  <span className="font-semibold">{h.quando}</span> — {h.oQueFez}
                </li>
              ))}
            </ul>
            <Link
              href="/app/diario"
              className="mt-3 inline-block text-sm font-bold text-verde-dark underline"
            >
              Abrir o diário →
            </Link>
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
                .map((v) => {
                  const cor = estiloCategoria(v.categoria);
                  return (
                    <Link
                      key={v.slug}
                      href={`/app/conhecimento/${v.slug}`}
                      className={`rounded-full border ${cor.borda} ${cor.fundo} px-3 py-1.5 text-xs font-semibold ${cor.texto} transition-transform hover:scale-[1.03]`}
                    >
                      {v.termo}
                    </Link>
                  );
                })}
            </div>
          </div>
        )}

        {/* Cada assunto é um LINK, não um botão de expandir.
            O endereço passa a identificar o verbete, o que torna possível
            guardar nos favoritos, compartilhar com um colega e usar o botão
            voltar do navegador para retornar à lista — três coisas que o
            painel no lugar não permitia.

            A cor vem da categoria e a faixa lateral a repete, para que o
            assunto seja localizável de relance num acervo de 50 verbetes. */}
        <ul className="mt-3 space-y-2">
          {resultados.map((i) => {
            const estilo = estiloCategoria(i.categoria);
            const visto = Boolean(vistos.vistos[i.slug]);
            const ehUltimo = vistos.ultimo === i.slug;
            return (
              <li key={i.slug}>
                <Link
                  href={`/app/conhecimento/${i.slug}`}
                  aria-current={ehUltimo ? "true" : undefined}
                  className={`flex gap-0 overflow-hidden rounded-xl border ${estilo.borda} ${
                    ehUltimo ? "ring-2 ring-indigo ring-offset-1" : ""
                  } bg-white text-left shadow-sm transition-transform hover:scale-[1.01] hover:shadow-md`}
                >
                  {/* Faixa de cor: a identidade da categoria, visível mesmo
                      quando o cartão está cortado na rolagem. */}
                  <span className={`w-1.5 shrink-0 ${estilo.faixa}`} aria-hidden="true" />

                  <span className={`min-w-0 flex-1 p-4 ${visto ? estilo.fundo : ""}`}>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-titulo font-bold text-tinta">{i.termo}</span>

                      {ehUltimo ? (
                        <span className="rounded-full bg-indigo px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                          Último que você viu
                        </span>
                      ) : visto ? (
                        <span className="rounded-full bg-fundo px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-cinza">
                          Já lido
                        </span>
                      ) : null}
                    </span>

                    <span
                      className={`mt-0.5 block text-xs font-semibold uppercase tracking-wide ${estilo.texto}`}
                    >
                      {i.categoria}
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-tinta-clara">
                      {i.resumo}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
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
