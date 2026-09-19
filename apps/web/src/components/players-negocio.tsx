"use client";

import { useEffect, useRef, useState } from "react";
import { CardPrompt } from "./card-prompt";
import { IconeApp } from "./icone-app";

/**
 * Os formatos de aula que o curso de negócios pediu e que não existiam.
 *
 * Ficam fora de `players.tsx` porque aquele arquivo já passa de mil
 * linhas; a fronteira é o público, não a tecnologia. O que os quatro têm
 * em comum é levar o cursista a produzir algo aplicável ao próprio
 * negócio, em vez de responder certo.
 */

/* ============================================================
   LABORATÓRIO — o cursista produz, e a entrega fica salva
   ============================================================ */

export type SalvarEntrega = (dados: FormData) => Promise<void>;

type Campo = {
  chave: string;
  rotulo: string;
  ajuda?: string;
  /** Um campo curto vira `input`; sem isso, `textarea`. */
  curto?: boolean;
  exemplo?: string;
};

export function PlayerLaboratorio({
  conteudo,
  onCompleto,
  entregaSalva,
  aoSalvar,
  lessonId,
}: {
  lessonId: string;
  conteudo: {
    titulo?: string;
    contexto?: string;
    passos?: string[];
    campos?: Campo[];
    promptSugerido?: { titulo: string; corpo: string; variaveis?: unknown[] } | null;
    criterios?: string[];
    entrega?: string;
  };
  onCompleto: () => void;
  /** O que já foi escrito antes, para o laboratório continuar de onde parou. */
  entregaSalva?: Record<string, string>;
  aoSalvar?: SalvarEntrega;
}) {
  const campos = conteudo.campos ?? [];
  const [valores, setValores] = useState<Record<string, string>>(
    () => entregaSalva ?? {},
  );
  const [estado, setEstado] = useState<"parado" | "salvando" | "salvo">("parado");
  const primeiraRenderizacao = useRef(true);

  /**
   * Salva sozinho, um instante depois de a pessoa parar de digitar.
   *
   * Sem isto, fechar a aba no meio do laboratório perderia o trabalho —
   * e é um trabalho que o cursista vai levar para fora do curso. O atraso
   * evita uma gravação por tecla.
   */
  useEffect(() => {
    if (!aoSalvar) return;
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    setEstado("salvando");
    const t = setTimeout(() => {
      const d = new FormData();
      d.set("lessonId", lessonId);
      d.set("conteudo", JSON.stringify(valores));
      void aoSalvar(d)
        .then(() => setEstado("salvo"))
        .catch(() => setEstado("parado"));
    }, 900);
    return () => clearTimeout(t);
  }, [valores, aoSalvar, lessonId]);

  const preenchidos = campos.filter((c) => (valores[c.chave] ?? "").trim()).length;
  const completo = campos.length > 0 && preenchidos === campos.length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-line bg-indigo-soft p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo">
          Laboratório
        </p>
        {conteudo.titulo && (
          <h2 className="mt-1 font-titulo text-xl font-extrabold text-tinta">
            {conteudo.titulo}
          </h2>
        )}
        {conteudo.contexto && (
          <p className="mt-2 text-tinta-clara">{conteudo.contexto}</p>
        )}
      </div>

      {(conteudo.passos?.length ?? 0) > 0 && (
        <ol className="space-y-3">
          {conteudo.passos!.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo font-titulo text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="text-tinta-clara">{p}</span>
            </li>
          ))}
        </ol>
      )}

      {conteudo.promptSugerido && (
        <section className="space-y-2">
          <h3 className="font-titulo text-lg font-extrabold">
            {conteudo.promptSugerido.titulo}
          </h3>
          <CardPrompt
            corpo={conteudo.promptSugerido.corpo}
            variaveis={(conteudo.promptSugerido.variaveis as never) ?? []}
          />
        </section>
      )}

      {campos.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-titulo text-lg font-extrabold">Sua entrega</h3>
            <span className="text-xs text-cinza" aria-live="polite">
              {estado === "salvando" && "Salvando…"}
              {estado === "salvo" && "Salvo"}
            </span>
          </div>

          {campos.map((c) => (
            <label key={c.chave} className="block">
              <span className="mb-1 block text-sm font-bold text-tinta">
                {c.rotulo}
              </span>
              {c.ajuda && (
                <span className="mb-1.5 block text-xs text-tinta-clara">{c.ajuda}</span>
              )}
              {c.curto ? (
                <input
                  className="campo w-full"
                  value={valores[c.chave] ?? ""}
                  placeholder={c.exemplo}
                  onChange={(e) =>
                    setValores((v) => ({ ...v, [c.chave]: e.target.value }))
                  }
                />
              ) : (
                <textarea
                  className="campo min-h-32 w-full"
                  value={valores[c.chave] ?? ""}
                  placeholder={c.exemplo}
                  onChange={(e) =>
                    setValores((v) => ({ ...v, [c.chave]: e.target.value }))
                  }
                />
              )}
            </label>
          ))}
        </section>
      )}

      {(conteudo.criterios?.length ?? 0) > 0 && (
        <section className="rounded-xl border border-borda bg-white p-4">
          <h3 className="font-titulo font-bold text-tinta">
            Antes de dar por pronto, confira
          </h3>
          <ul className="mt-2 space-y-1.5">
            {conteudo.criterios!.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-tinta-clara">
                <span aria-hidden className="text-verde-dark">
                  ✓
                </span>
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      <button onClick={onCompleto} className="btn-primario">
        {completo ? "Concluir laboratório" : "Concluir mesmo assim"}
      </button>
      {!completo && campos.length > 0 && (
        <p className="text-xs text-cinza">
          Faltam {campos.length - preenchidos} de {campos.length} campos. Você pode
          voltar depois: o que escreveu fica salvo.
        </p>
      )}
    </div>
  );
}

/* ============================================================
   ANTES / DEPOIS — a mesma tarefa, com e sem IA
   ============================================================ */

export function PlayerAntesDepois({
  conteudo,
  onCompleto,
}: {
  conteudo: {
    tarefa?: string;
    antes?: { titulo?: string; passos?: string[]; tempo?: string };
    depois?: { titulo?: string; passos?: string[]; tempo?: string };
    economia?: string;
    prompt?: { titulo: string; corpo: string; variaveis?: unknown[] } | null;
    resultadoEsperado?: string;
    atencao?: string;
  };
  onCompleto: () => void;
}) {
  return (
    <div className="space-y-6">
      {conteudo.tarefa && (
        <div className="rounded-xl border border-borda bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo">
            A tarefa
          </p>
          <p className="mt-1 font-titulo text-lg font-extrabold text-tinta">
            {conteudo.tarefa}
          </p>
        </div>
      )}

      {/* Uma coluna no celular, duas a partir do tablet: lado a lado em
          360px espremeria os dois textos a ponto de nenhum ser lido. */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-borda bg-white p-4">
          <h3 className="font-titulo font-extrabold text-tinta">
            {conteudo.antes?.titulo ?? "Como é hoje"}
          </h3>
          {conteudo.antes?.tempo && (
            <p className="mt-1 text-sm font-bold text-vermelho-dark">
              {conteudo.antes.tempo}
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {(conteudo.antes?.passos ?? []).map((p, i) => (
              <li key={i} className="text-sm text-tinta-clara">
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-verde bg-verde-soft/40 p-4">
          <h3 className="font-titulo font-extrabold text-tinta">
            {conteudo.depois?.titulo ?? "Com IA"}
          </h3>
          {conteudo.depois?.tempo && (
            <p className="mt-1 text-sm font-bold text-verde-dark">
              {conteudo.depois.tempo}
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {(conteudo.depois?.passos ?? []).map((p, i) => (
              <li key={i} className="text-sm text-tinta-clara">
                {p}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {conteudo.economia && (
        <p className="rounded-xl bg-grad-marca p-5 text-center font-titulo text-lg font-extrabold text-white">
          {conteudo.economia}
        </p>
      )}

      {conteudo.prompt && (
        <section className="space-y-2">
          <h3 className="font-titulo text-lg font-extrabold">
            {conteudo.prompt.titulo}
          </h3>
          <CardPrompt
            corpo={conteudo.prompt.corpo}
            variaveis={(conteudo.prompt.variaveis as never) ?? []}
          />
        </section>
      )}

      {conteudo.resultadoEsperado && (
        <section className="rounded-xl border border-borda bg-white p-4">
          <h3 className="font-titulo font-bold text-tinta">O que esperar de volta</h3>
          <p className="mt-1 text-sm text-tinta-clara">{conteudo.resultadoEsperado}</p>
        </section>
      )}

      {/* O ganho de tempo é real, e por isso mesmo perigoso: sem a
          revisão, o que se economiza volta como erro na frente do cliente. */}
      {conteudo.atencao && (
        <p className="rounded-md border border-amarelo bg-amarelo-soft p-4 text-sm text-amarelo-dark">
          {conteudo.atencao}
        </p>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Concluir lição
      </button>
    </div>
  );
}

/* ============================================================
   FLUXO — o processo antes da ferramenta
   ============================================================ */

type Etapa = {
  titulo: string;
  detalhe?: string;
  /** Etapa em que uma pessoa precisa olhar antes de seguir. */
  revisaoHumana?: boolean;
};

export function PlayerFluxo({
  conteudo,
  onCompleto,
}: {
  conteudo: {
    titulo?: string;
    introducao?: string;
    gatilho?: string;
    etapas?: Etapa[];
    ondeParar?: string;
    ferramentas?: string[];
    porQue?: string;
  };
  onCompleto: () => void;
}) {
  const etapas = conteudo.etapas ?? [];

  return (
    <div className="space-y-6">
      {conteudo.introducao && (
        <p className="text-tinta-clara">{conteudo.introducao}</p>
      )}

      {/* O diagrama é uma lista, não um desenho: assim ele reflui no
          celular, funciona no leitor de tela e continua legível impresso.
          Um SVG de largura fixa falharia nos três. */}
      <ol className="space-y-0">
        {conteudo.gatilho && (
          <li className="rounded-xl border-2 border-indigo bg-indigo-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo">
              Quando acontece
            </p>
            <p className="mt-0.5 font-titulo font-extrabold text-tinta">
              {conteudo.gatilho}
            </p>
          </li>
        )}
        {etapas.map((e, i) => (
          <li key={i}>
            <div aria-hidden className="flex justify-center py-1.5">
              <span className="text-xl leading-none text-indigo">↓</span>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                e.revisaoHumana
                  ? "border-amarelo bg-amarelo-soft"
                  : "border-borda bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo font-titulo text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-titulo font-bold text-tinta">{e.titulo}</p>
                  {e.detalhe && (
                    <p className="mt-0.5 text-sm text-tinta-clara">{e.detalhe}</p>
                  )}
                  {e.revisaoHumana && (
                    <p className="mt-1.5 text-xs font-bold text-amarelo-dark">
                      Uma pessoa confere antes de seguir
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {conteudo.ondeParar && (
        <section className="rounded-xl border border-amarelo bg-amarelo-soft p-4">
          <h3 className="font-titulo font-bold text-amarelo-dark">
            Onde a automação para
          </h3>
          <p className="mt-1 text-sm text-amarelo-dark">{conteudo.ondeParar}</p>
        </section>
      )}

      {(conteudo.ferramentas?.length ?? 0) > 0 && (
        <section className="rounded-xl border border-borda bg-white p-4">
          <h3 className="font-titulo font-bold text-tinta">
            Ferramentas que fazem isso
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {conteudo.ferramentas!.map((f) => (
              <li
                key={f}
                className="rounded-full border border-borda px-3 py-1 text-sm text-tinta-clara"
              >
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-cinza">
            Desenhe o processo primeiro. A ferramenta é a última decisão, e a
            mais fácil de trocar.
          </p>
        </section>
      )}

      {conteudo.porQue && (
        <p className="rounded-md bg-indigo-soft p-4 text-sm text-indigo-dark">
          {conteudo.porQue}
        </p>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Concluir lição
      </button>
    </div>
  );
}

/* ============================================================
   PROJETO — o plano que o cursista leva embora
   ============================================================ */

type SecaoProjeto = {
  chave: string;
  titulo: string;
  pergunta: string;
  ajuda?: string;
  /** Quantas respostas esta seção espera. Uma, quase sempre. */
  quantidade?: number;
};

export function PlayerProjeto({
  conteudo,
  onCompleto,
  projetoSalvo,
  aoSalvar,
}: {
  conteudo: {
    titulo?: string;
    introducao?: string;
    secoes?: SecaoProjeto[];
    fechamento?: string;
  };
  onCompleto: () => void;
  projetoSalvo?: { negocio?: Record<string, string>; secoes?: Record<string, string[]> };
  aoSalvar?: SalvarEntrega;
}) {
  const secoes = conteudo.secoes ?? [];
  const [negocio, setNegocio] = useState<Record<string, string>>(
    () => projetoSalvo?.negocio ?? {},
  );
  const [respostas, setRespostas] = useState<Record<string, string[]>>(
    () => projetoSalvo?.secoes ?? {},
  );
  const [estado, setEstado] = useState<"parado" | "salvando" | "salvo">("parado");
  const primeira = useRef(true);

  useEffect(() => {
    if (!aoSalvar) return;
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    setEstado("salvando");
    const t = setTimeout(() => {
      const d = new FormData();
      d.set("negocio", JSON.stringify(negocio));
      d.set("secoes", JSON.stringify(respostas));
      void aoSalvar(d)
        .then(() => setEstado("salvo"))
        .catch(() => setEstado("parado"));
    }, 900);
    return () => clearTimeout(t);
  }, [negocio, respostas, aoSalvar]);

  function definir(chave: string, i: number, valor: string) {
    setRespostas((r) => {
      const lista = [...(r[chave] ?? [])];
      lista[i] = valor;
      return { ...r, [chave]: lista };
    });
  }

  return (
    <div className="space-y-7">
      <div className="rounded-xl bg-grad-marca p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wide opacity-90">
          Projeto final
        </p>
        <h2 className="mt-1 font-titulo text-2xl font-extrabold">
          {conteudo.titulo ?? "Minha Empresa Aumentada por IA"}
        </h2>
        {conteudo.introducao && (
          <p className="mt-2 text-sm opacity-95">{conteudo.introducao}</p>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-titulo text-lg font-extrabold">O negócio</h3>
          <span className="text-xs text-cinza" aria-live="polite">
            {estado === "salvando" && "Salvando…"}
            {estado === "salvo" && "Salvo"}
          </span>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-tinta">Nome</span>
          <input
            className="campo w-full"
            value={negocio.nome ?? ""}
            placeholder="Pode ser o seu ou um que você invente"
            onChange={(e) => setNegocio((n) => ({ ...n, nome: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-tinta">O que faz</span>
          <input
            className="campo w-full"
            value={negocio.ramo ?? ""}
            placeholder="Salão de beleza, loja de roupas, oficina…"
            onChange={(e) => setNegocio((n) => ({ ...n, ramo: e.target.value }))}
          />
        </label>
      </section>

      {secoes.map((s) => {
        const quantos = s.quantidade ?? 1;
        return (
          <section key={s.chave} className="space-y-2">
            <h3 className="font-titulo text-lg font-extrabold">{s.titulo}</h3>
            <p className="text-sm text-tinta-clara">{s.pergunta}</p>
            {s.ajuda && <p className="text-xs text-cinza">{s.ajuda}</p>}
            <div className="space-y-2">
              {Array.from({ length: quantos }).map((_, i) => (
                <input
                  key={i}
                  className="campo w-full"
                  value={respostas[s.chave]?.[i] ?? ""}
                  placeholder={quantos > 1 ? `${i + 1}ª resposta` : undefined}
                  onChange={(e) => definir(s.chave, i, e.target.value)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {conteudo.fechamento && (
        <p className="rounded-md bg-indigo-soft p-4 text-sm text-indigo-dark">
          {conteudo.fechamento}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={onCompleto} className="btn-primario">
          Concluir
        </button>
        <a href="/app/projeto" className="btn-secundario inline-flex items-center gap-2">
          <IconeApp nome="documentos" tamanho={20} />
          Ver meu plano completo
        </a>
      </div>
    </div>
  );
}
