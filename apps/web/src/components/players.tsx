"use client";

import { useEffect, useState } from "react";
import { CardPrompt } from "./card-prompt";
import { IconeApp } from "./icone-app";
import { FeedbackVisual } from "./feedback-visual";
import { AnalisePtcf, ProximoPasso } from "./analise-ptcf";
import { TextoExplicado, type TermoDetectavel } from "./texto-explicado";
import type { Analise } from "@/lib/motor-ptcf";

/**
 * A server action que lê o texto do aluno e devolve a análise.
 *
 * Opcional em todos os players: se a página não passar (ou se algum dia
 * um player for usado fora da lição), a atividade continua funcionando
 * como campo de escrita — apenas sem devolutiva. Nenhuma tela quebra por
 * falta dela.
 */
export type Analisar = (
  dados: FormData,
) => Promise<{ analise: Analise; salvo: boolean }>;

/**
 * Estado comum das atividades de texto livre.
 *
 * Fica aqui, e não dentro de cada player, porque os três (DUELO, CASO e
 * CHECKPOINT) tinham exatamente o mesmo defeito antes — um botão que
 * revelava texto fixo sem ler nada — e resolver em três lugares
 * diferentes seria o caminho mais curto para os três voltarem a divergir.
 */
function useAnalise(
  analisar: Analisar | undefined,
  lessonId: string | undefined,
  chave: string,
) {
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [analisando, setAnalisando] = useState(false);

  async function enviar(texto: string) {
    if (!analisar) return;
    setAnalisando(true);
    try {
      const d = new FormData();
      d.set("texto", texto);
      d.set("chave", chave);
      if (lessonId) d.set("lessonId", lessonId);
      const r = await analisar(d);
      setAnalise(r.analise);
    } catch (e) {
      // A rede caiu no meio. Não deixamos a tela em "Analisando..." para
      // sempre: a pessoa pode tentar de novo.
      console.error("[players] análise indisponível:", e);
      setAnalise(null);
    } finally {
      setAnalisando(false);
    }
  }

  return { analise, analisando, enviar };
}

/* ============================================================
   TEORIA — mesma linguagem visual dos quadros da apostila
   ============================================================ */

type Bloco = {
  tipo: string;
  titulo?: string;
  texto?: string;
  itens?: string[];
};

export function PlayerTeoria({
  blocos,
  termos = {},
}: {
  blocos: Bloco[];
  /**
   * Verbetes da Base de Conhecimento, para marcação automática.
   *
   * O texto da lição vem do banco e muda com o conteúdo do curso: marcar
   * termo por termo à mão aqui seria impossível. `TextoExplicado` acende
   * o primeiro uso de cada termo conhecido, com teto de ícones por bloco
   * para o material não virar uma fileira de ⓘ.
   *
   * Vazio (o padrão) desliga a marcação e o texto sai igual ao original.
   */
  termos?: Record<string, TermoDetectavel>;
}) {
  const temTermos = Object.keys(termos).length > 0;

  /** O texto do bloco, com ou sem marcação — decidido em um lugar só. */
  function Texto({ valor, limite = 2 }: { valor?: string; limite?: number }) {
    if (!valor) return null;
    if (!temTermos) return <>{valor}</>;
    return <TextoExplicado texto={valor} termos={termos} contexto="licao" limite={limite} />;
  }

  return (
    <div className="space-y-5">
      {blocos.map((b, i) => {
        switch (b.tipo) {
          case "traduzindo":
            return (
              <div
                key={i}
                className="rounded-lg border-l-4 border-verde bg-verde-soft p-5"
              >
                <p className="flex items-center gap-2 font-titulo font-bold text-verde-dark">
                  <IconeApp nome="documentos" tamanho={22} />
                  Traduzindo: {b.titulo}
                </p>
                {/* Sem marcação: este bloco já É a explicação de um
                    termo, e explicar conceitos dentro dele seria
                    explicação sobre explicação. */}
                <p className="mt-2 text-verde-dark">{b.texto}</p>
              </div>
            );
          case "atencao":
            return (
              <FeedbackVisual key={i} estado="atencao" titulo={b.titulo}>
                {b.texto}
              </FeedbackVisual>
            );
          case "dica":
            return (
              <FeedbackVisual key={i} estado="dica" titulo={b.titulo}>
                {b.texto}
              </FeedbackVisual>
            );
          case "destaque":
            return (
              <div key={i} className="rounded-lg bg-indigo-soft p-5">
                <p className="font-titulo font-bold text-indigo-dark">
                  {b.titulo}
                </p>
                <p className="mt-2 text-indigo-dark">
                  <Texto valor={b.texto} limite={1} />
                </p>
              </div>
            );
          case "lista":
            return (
              <div key={i} className="card">
                {b.titulo && (
                  <p className="mb-2 font-titulo font-bold">{b.titulo}</p>
                )}
                <ul className="space-y-2">
                  {b.itens?.map((it, j) => (
                    <li key={j} className="flex gap-2 text-tinta-clara">
                      <span className="text-indigo" aria-hidden="true">
                        •
                      </span>
                      {/* Um ícone por item, no máximo: uma lista de seis
                          itens com dois cada viraria doze ícones. */}
                      <span>
                        <Texto valor={it} limite={1} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          default:
            return (
              <p key={i} className="text-lg leading-relaxed text-tinta-clara">
                <Texto valor={b.texto} />
              </p>
            );
        }
      })}
    </div>
  );
}

/* ============================================================
   AQUECIMENTO RELÂMPAGO
   ============================================================
   Abre cada encontro. Na sala presencial é uma pergunta de mão
   levantada; aqui, sozinho no celular, a pergunta precisa de resposta —
   senão vira texto para rolar. O professor responde e SÓ ENTÃO vê
   quantos colegas responderam o mesmo, que é o efeito que a versão
   presencial produz ao olhar as mãos levantadas na sala.
   ============================================================ */

export function PlayerAquecimento({
  conteudo,
  onCompleto,
}: {
  conteudo: {
    pergunta: string;
    opcoes?: string[];
    fechamento?: string;
    tempo?: string;
  };
  onCompleto: () => void;
}) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const opcoes = conteudo.opcoes ?? [
    "Sim, já aconteceu comigo",
    "Nunca aconteceu",
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-grad-energia p-7 text-center text-white">
        <IconeApp nome="game" tamanho={44} />
        <p className="mt-3 font-titulo text-2xl font-extrabold leading-tight">
          {conteudo.pergunta}
        </p>
        {conteudo.tempo && (
          <p className="mt-2 text-sm opacity-90">{conteudo.tempo}</p>
        )}
      </div>

      <div className="space-y-3">
        {opcoes.map((o, i) => (
          <button
            key={i}
            onClick={() => setEscolha(i)}
            aria-pressed={escolha === i}
            className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
              escolha === i
                ? "border-laranja bg-laranja-soft text-laranja-dark"
                : "border-borda bg-white hover:border-laranja-soft"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                escolha === i
                  ? "border-laranja bg-laranja text-white"
                  : "border-borda"
              }`}
              aria-hidden="true"
            >
              {escolha === i && "✓"}
            </span>
            <span className="font-bold">{o}</span>
          </button>
        ))}
      </div>

      {escolha !== null && conteudo.fechamento && (
        <p className="rounded-lg border-l-4 border-laranja bg-laranja-soft p-5 text-laranja-dark">
          {conteudo.fechamento}
        </p>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Começar o encontro
      </button>
    </div>
  );
}

/* ============================================================
   NO CELULAR
   ============================================================
   O formato existe na apostila para derrubar a barreira do "não tenho
   computador": o cursista faz ali, no aparelho que já está na mão.
   Os passos são marcáveis porque a pessoa alterna entre esta tela e a
   da IA — sem marcar, ela volta e não sabe onde parou.
   ============================================================ */

export function PlayerNoCelular({
  conteudo,
  onCompleto,
  etapas,
  aoMudarEtapas,
}: {
  conteudo: {
    titulo: string;
    tempo?: string;
    passos: string[];
    porque?: string;
  };
  onCompleto: () => void;
  etapas?: number[];
  aoMudarEtapas?: (marcados: number[]) => void;
}) {
  const [feitos, setFeitos] = useState<Set<number>>(new Set(etapas ?? []));

  function alternar(i: number) {
    setFeitos((s) => {
      const novo = new Set(s);
      if (novo.has(i)) novo.delete(i);
      else novo.add(i);
      // O servidor recebe o estado inteiro, não o toque: assim um
      // clique perdido no meio do caminho não desalinha o que ficou
      // guardado.
      aoMudarEtapas?.([...novo]);
      return novo;
    });
  }

  const todos = feitos.size === conteudo.passos.length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-grad-marca p-6 text-white">
        <p className="flex items-center gap-2 font-titulo text-sm font-bold uppercase tracking-wide opacity-90">
          <IconeApp nome="ferramentas" tamanho={20} />
          No celular
        </p>
        <h3 className="mt-1 font-titulo text-2xl font-extrabold">
          {conteudo.titulo}
        </h3>
        {conteudo.tempo && (
          <p className="mt-1 text-sm opacity-90">{conteudo.tempo}</p>
        )}
      </div>

      <ol className="space-y-3">
        {conteudo.passos.map((p, i) => (
          <li key={i}>
            <button
              onClick={() => alternar(i)}
              aria-pressed={feitos.has(i)}
              className="flex w-full items-start gap-3 rounded-lg border-2 border-borda bg-white p-4 text-left transition-colors hover:border-indigo-line"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-titulo text-sm font-bold ${
                  feitos.has(i)
                    ? "bg-verde text-white"
                    : "bg-indigo-soft text-indigo-dark"
                }`}
                aria-hidden="true"
              >
                {feitos.has(i) ? "✓" : i + 1}
              </span>
              <span
                className={
                  feitos.has(i) ? "text-cinza line-through" : "text-tinta"
                }
              >
                {p}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {conteudo.porque && (
        <p className="rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-4 text-sm text-amarelo-dark">
          <strong>Por que no celular?</strong> {conteudo.porque}
        </p>
      )}

      {todos && (
        <p className="rounded-lg border-l-4 border-verde bg-verde-soft p-4 text-verde-dark">
          Você fez o passo a passo inteiro. É assim na sala dos professores, na
          fila do banco e no sofá de casa.
        </p>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Concluir lição
      </button>
    </div>
  );
}

/* ============================================================
   EMERGÊNCIA (Guia de Bolso, Cap. 12)
   ============================================================
   Consulta, não estudo: o professor abre isto com a aula começando em
   5 minutos. Por isso o prompt vem pronto para copiar já na primeira
   dobra, sem introdução nem teoria antes.
   ============================================================ */

export function PlayerEmergencia({
  conteudo,
  onCompleto,
}: {
  conteudo: {
    situacao: string;
    prompt: string;
    comoUsar?: string;
  };
  onCompleto: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(conteudo.prompt);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border-l-8 border-vermelho bg-vermelho-soft p-5">
        <p className="flex items-center gap-2 font-titulo text-sm font-bold uppercase tracking-wide text-vermelho-dark">
          <IconeApp nome="suporte" tamanho={20} />
          Emergência
        </p>
        <p className="mt-1 font-titulo text-xl font-extrabold text-vermelho-dark">
          {conteudo.situacao}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-prompt-bg">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 pt-3">
          <span className="font-titulo text-xs font-bold uppercase tracking-wide text-prompt-txt opacity-70">
            Copie e cole na IA
          </span>
          <button
            onClick={copiar}
            className="mb-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
          >
            {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-prompt-txt">
          {conteudo.prompt}
        </pre>
      </div>

      {conteudo.comoUsar && (
        <p className="rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-4 text-sm text-amarelo-dark">
          {conteudo.comoUsar}
        </p>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Guardar no meu repertório
      </button>
    </div>
  );
}

/* ============================================================
   QUIZ
   ============================================================ */

type Pergunta = {
  enunciado: string;
  opcoes: { id: string; texto: string; correta: boolean }[];
  explicacao: string;
};

export function PlayerQuiz({
  perguntas,
  onCompleto,
  onDesempenho,
}: {
  perguntas: Pergunta[];
  onCompleto: () => void;
  onDesempenho?: (acertos: number, total: number) => Promise<void>;
}) {
  const [atual, setAtual] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [acertosSeguidos, setAcertosSeguidos] = useState(0);
  const [acertos, setAcertos] = useState(0);

  const p = perguntas[atual]!;
  const ultima = atual === perguntas.length - 1;
  const correta = p.opcoes.find((o) => o.correta)?.id;

  async function avancar() {
    if (ultima) {
      await onDesempenho?.(acertos, perguntas.length);
      return onCompleto();
    }
    setAtual((a) => a + 1);
    setEscolha(null);
    setRevelado(false);
  }

  function confirmar() {
    setRevelado(true);
    setAcertosSeguidos((atual) => (escolha === correta ? atual + 1 : 0));
    if (escolha === correta) setAcertos((atual) => atual + 1);
  }

  return (
    <div>
      <p className="mb-2 text-sm text-cinza">
        Pergunta {atual + 1} de {perguntas.length}
      </p>
      <h3 className="font-titulo text-xl font-bold">{p.enunciado}</h3>

      <div className="mt-5 space-y-3">
        {p.opcoes.map((o) => {
          const escolhida = escolha === o.id;
          let estilo = "border-borda bg-white hover:border-indigo";
          if (revelado) {
            if (o.correta) estilo = "border-verde bg-verde-soft";
            else if (escolhida) estilo = "border-vermelho bg-vermelho-soft";
          } else if (escolhida) {
            estilo = "border-indigo bg-indigo-soft";
          }

          return (
            <button
              key={o.id}
              disabled={revelado}
              onClick={() => setEscolha(o.id)}
              className={`flex w-full items-center gap-3 rounded-md border-2 p-4 text-left transition-colors ${estilo}`}
            >
              <span className="font-titulo font-bold uppercase text-cinza">
                {o.id}
              </span>
              <span className="flex-1">{o.texto}</span>
              {revelado && o.correta && (
                <IconeApp nome="conquistas" tamanho={22} />
              )}
              {revelado && escolhida && !o.correta && (
                <IconeApp nome="seguranca" tamanho={22} />
              )}
            </button>
          );
        })}
      </div>

      {revelado && (
        <FeedbackVisual
          estado={escolha === correta ? "correta" : "incorreta"}
          titulo={
            escolha === correta
              ? "Resposta correta — raciocínio confirmado."
              : "Ainda não — use a explicação para ajustar o raciocínio:"
          }
          compacto
          className="mt-5"
        >
          <p>{p.explicacao}</p>
          {escolha === correta && acertosSeguidos >= 2 && (
            <p className="mt-2 font-semibold">
              Sequência de {acertosSeguidos} acertos nesta atividade.
            </p>
          )}
        </FeedbackVisual>
      )}

      <div className="mt-6">
        {!revelado ? (
          <button
            disabled={!escolha}
            onClick={confirmar}
            className="btn-primario"
          >
            Confirmar resposta
          </button>
        ) : (
          <button onClick={avancar} className="btn-primario">
            {ultima ? "Concluir lição" : "Próxima pergunta"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   DUELO DE PROMPTS
   ============================================================ */

export function PlayerDuelo({
  conteudo,
  onCompleto,
  analisar,
  lessonId,
  rascunho,
}: {
  conteudo: {
    contexto: string;
    promptRuim: string;
    resultadoRuim: string;
    promptBom: string;
    resultadoBom: string;
    desafio: string;
    promptParaReescrever: string;
  };
  onCompleto: () => void;
  analisar?: Analisar;
  lessonId?: string;
  rascunho?: string;
}) {
  const [minhaVersao, setMinhaVersao] = useState(rascunho ?? "");
  const { analise, analisando, enviar } = useAnalise(
    analisar,
    lessonId,
    "duelo",
  );

  return (
    <div className="space-y-6">
      <p className="text-lg text-tinta-clara">{conteudo.contexto}</p>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border-2 border-vermelho-soft bg-vermelho-soft p-5">
          <p className="flex items-center gap-2 font-titulo font-bold text-vermelho-dark">
            <IconeApp nome="seguranca" tamanho={24} />O que quase todo mundo
            escreve
          </p>
          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-prompt-bg p-4 font-mono text-sm text-prompt-txt">
            {conteudo.promptRuim}
          </pre>
          <p className="mt-3 text-sm text-vermelho-dark">
            {conteudo.resultadoRuim}
          </p>
        </div>

        <div className="rounded-lg border-2 border-verde-soft bg-verde-soft p-5">
          <p className="flex items-center gap-2 font-titulo font-bold text-verde-dark">
            <IconeApp nome="conquistas" tamanho={24} />O mesmo pedido com
            P.T.C.F.
          </p>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-prompt-bg p-4 font-mono text-sm text-prompt-txt">
            {conteudo.promptBom}
          </pre>
          <p className="mt-3 text-sm text-verde-dark">
            {conteudo.resultadoBom}
          </p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-dashed border-laranja bg-laranja-soft p-5">
        <p className="flex items-center gap-2 font-titulo text-lg font-bold text-laranja-dark">
          <IconeApp nome="editar_conteudo" tamanho={22} />
          Sua vez
        </p>

        {/* O enunciado antigo era só "reescreva este prompt usando as
            quatro letras" — e quem não sabia o que isso significa ficava
            sem saber o que fazer. Agora a instrução diz o passo, o
            prompt a corrigir aparece rotulado, e o que a análise vai
            procurar está dito antes de escrever. */}
        <p className="mt-2 text-laranja-dark">
          Reescreva o prompt abaixo incluindo as quatro letras. Depois toque em{" "}
          <strong>Analisar a minha versão</strong>: eu leio o seu texto e
          mostro, letra por letra, o que já está lá e o que falta.
        </p>

        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-laranja-dark opacity-80">
          Prompt a corrigir
        </p>
        <pre className="mt-1 whitespace-pre-wrap rounded-md bg-prompt-bg p-3 font-mono text-sm text-prompt-txt">
          {conteudo.promptParaReescrever}
        </pre>

        <ul className="mt-4 grid gap-1 text-sm text-laranja-dark sm:grid-cols-2">
          <li>
            <strong>P</strong>apel — quem a IA deve ser
          </li>
          <li>
            <strong>T</strong>arefa — o que ela deve fazer
          </li>
          <li>
            <strong>C</strong>ontexto — a sua turma de verdade
          </li>
          <li>
            <strong>F</strong>ormato — como quer receber
          </li>
        </ul>

        <div className="mt-4">
          <AnalisePtcf
            valor={minhaVersao}
            aoMudar={setMinhaVersao}
            analise={analise}
            analisando={analisando}
            aoEnviar={() => enviar(minhaVersao)}
            dica="Ex.: Aja como professor(a) de... Crie... para uma turma de... Entregue em..."
          />
        </div>

        {analise && !analise.vazio && analise.completas === 4 && (
          <div className="mt-4">
            <ProximoPasso texto={minhaVersao} />
          </div>
        )}
      </div>

      <button onClick={onCompleto} className="btn-primario">
        Concluir lição
      </button>
    </div>
  );
}

/* ============================================================
   CAÇA AO ERRO
   ============================================================ */

export function PlayerCacaErro({
  conteudo,
  onCompleto,
  onDesempenho,
}: {
  conteudo: {
    introducao: string;
    respostaIA: string;
    pergunta: string;
    opcoes: { id: string; texto: string; correta: boolean }[];
    gabarito: string;
    licao: string;
  };
  onCompleto: () => void;
  onDesempenho?: (acertos: number, total: number) => Promise<void>;
}) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const acertou = conteudo.opcoes.find((o) => o.id === escolha)?.correta;

  return (
    <div className="space-y-5">
      <p className="text-lg text-tinta-clara">{conteudo.introducao}</p>

      <div className="rounded-lg border-2 border-amarelo bg-amarelo-soft p-5">
        <p className="mb-3 font-titulo text-sm font-bold uppercase tracking-wide text-amarelo-dark">
          Resposta da IA
        </p>
        <pre className="whitespace-pre-wrap rounded-md bg-white p-4 text-base leading-relaxed text-tinta">
          {conteudo.respostaIA}
        </pre>
      </div>

      <div>
        <p className="flex items-center gap-2 font-titulo text-lg font-bold">
          <IconeApp nome="pesquisa" tamanho={26} />
          {conteudo.pergunta}
        </p>
        <div className="mt-4 space-y-3">
          {conteudo.opcoes.map((o) => {
            const escolhida = escolha === o.id;
            let estilo = "border-borda bg-white hover:border-indigo";
            if (revelado) {
              if (o.correta) estilo = "border-verde bg-verde-soft";
              else if (escolhida) estilo = "border-vermelho bg-vermelho-soft";
            } else if (escolhida) {
              estilo = "border-indigo bg-indigo-soft";
            }
            return (
              <button
                key={o.id}
                disabled={revelado}
                onClick={() => setEscolha(o.id)}
                className={`w-full rounded-md border-2 p-4 text-left transition-colors ${estilo}`}
              >
                {o.texto}
              </button>
            );
          })}
        </div>
      </div>

      {revelado && (
        <>
          <FeedbackVisual
            estado={acertou ? "correta" : "incorreta"}
            titulo={
              acertou
                ? "Você encontrou o ponto crítico."
                : "Vale olhar mais uma vez:"
            }
          >
            {conteudo.gabarito}
          </FeedbackVisual>
          <div className="rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-5">
            <p className="flex items-center gap-2 font-titulo font-bold text-amarelo-dark">
              <IconeApp nome="ideias" tamanho={22} />A lição
            </p>
            <p className="mt-2 text-amarelo-dark">{conteudo.licao}</p>
          </div>
        </>
      )}

      {!revelado ? (
        <button
          disabled={!escolha}
          onClick={() => setRevelado(true)}
          className="btn-primario"
        >
          Confirmar
        </button>
      ) : (
        <button
          onClick={async () => {
            await onDesempenho?.(acertou ? 1 : 0, 1);
            onCompleto();
          }}
          className="btn-primario"
        >
          Concluir lição
        </button>
      )}
    </div>
  );
}

/* ============================================================
   PROMPT
   ============================================================ */

export function PlayerPrompt({
  introducao,
  template,
  onExecutado,
  onCompleto,
}: {
  introducao: string;
  template: {
    id: string;
    corpo: string;
    variaveis: { chave: string; rotulo?: string; exemplo?: string }[];
    ferramentasSugeridas: string[];
    dica?: string | null;
  };
  onExecutado: (
    ferramenta: string,
    promptFinal: string,
    valores: Record<string, string>,
  ) => void;
  onCompleto: () => void;
}) {
  const [praticou, setPraticou] = useState(false);

  return (
    <div className="space-y-5">
      <p className="text-lg text-tinta-clara">{introducao}</p>

      <CardPrompt
        promptTemplateId={template.id}
        corpo={template.corpo}
        variaveis={template.variaveis}
        ferramentasSugeridas={template.ferramentasSugeridas}
        dica={template.dica}
        onExecutado={(f, p, v) => {
          setPraticou(true);
          onExecutado(f, p, v);
        }}
      />

      {praticou && (
        <p className="rounded-md border-l-4 border-verde bg-verde-soft px-4 py-3 text-verde-dark">
          Registramos sua prática. Volte quando terminar de conversar com a IA.
        </p>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Concluir lição
      </button>
    </div>
  );
}

/* ============================================================
   DESAFIO CRONOMETRADO
   ============================================================ */

export function PlayerDesafio({
  conteudo,
  onCompleto,
}: {
  conteudo: {
    titulo: string;
    segundos: number;
    instrucoes: string[];
    fechamento?: string;
  };
  onCompleto: () => void;
}) {
  const [restante, setRestante] = useState(conteudo.segundos);
  const [rodando, setRodando] = useState(false);

  useEffect(() => {
    if (!rodando || restante <= 0) return;
    const t = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rodando, restante]);

  const min = Math.floor(restante / 60);
  const seg = restante % 60;
  const acabou = restante === 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-grad-energia p-8 text-center text-white">
        <p className="font-titulo text-6xl font-extrabold tabular-nums sm:text-7xl">
          {min}:{String(seg).padStart(2, "0")}
        </p>
        <p className="mt-2 font-titulo text-xl font-bold">{conteudo.titulo}</p>
        {!rodando && !acabou && (
          <button
            onClick={() => setRodando(true)}
            className="btn mt-5 bg-white text-laranja-dark hover:bg-laranja-soft"
          >
            Começar
          </button>
        )}
        {acabou && <p className="mt-4 text-lg">Tempo! Como foi?</p>}
      </div>

      <ol className="space-y-3">
        {conteudo.instrucoes.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-laranja font-titulo text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="text-tinta-clara">{it}</span>
          </li>
        ))}
      </ol>

      {conteudo.fechamento && (
        <p className="rounded-md bg-laranja-soft p-4 text-laranja-dark">
          {conteudo.fechamento}
        </p>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Concluir lição
      </button>
    </div>
  );
}

/* ============================================================
   CASO
   ============================================================ */

export function PlayerCaso({
  conteudo,
  onCompleto,
  analisar,
  lessonId,
  rascunho,
}: {
  conteudo: {
    cena: string;
    pergunta: string;
    tempoMinutos: number;
    solucao: string;
    promptExemplo?: string;
    discussao?: string;
  };
  onCompleto: () => void;
  analisar?: Analisar;
  lessonId?: string;
  rascunho?: string;
}) {
  const [resposta, setResposta] = useState(rascunho ?? "");
  const [revelado, setRevelado] = useState(false);
  const { analise, analisando, enviar } = useAnalise(
    analisar,
    lessonId,
    "caso",
  );

  return (
    <div className="space-y-5">
      <div className="rounded-lg border-l-8 border-laranja bg-indigo-soft p-5">
        <p className="text-lg leading-relaxed text-tinta">{conteudo.cena}</p>
      </div>

      <div>
        <p className="font-titulo text-lg font-bold text-indigo-dark">
          {conteudo.pergunta}
        </p>

        {/* No CASO a resposta esperada é o PROMPT que resolveria a
            situação — por isso o mesmo motor serve aqui. Antes havia só
            uma textarea e um botão que abria a solução pronta: quem
            escrevia e quem não escrevia recebiam exatamente a mesma
            tela. */}
        <p className="mt-1 text-sm text-tinta-clara">
          Escreva o prompt que você usaria para resolver isso. A análise mostra
          quais das quatro letras já estão no seu texto.
        </p>

        <div className="mt-3">
          <AnalisePtcf
            valor={resposta}
            aoMudar={setResposta}
            analise={analise}
            analisando={analisando}
            aoEnviar={() => enviar(resposta)}
            linhas={6}
            dica="Escreva aqui o prompt que resolveria esta situação..."
          />
        </div>

        {analise && !analise.vazio && analise.completas === 4 && (
          <div className="mt-4">
            <ProximoPasso texto={resposta} />
          </div>
        )}
      </div>

      {!revelado ? (
        <button onClick={() => setRevelado(true)} className="btn-secundario">
          Ver uma solução possível
        </button>
      ) : (
        <div className="rounded-lg border-l-4 border-verde bg-verde-soft p-5">
          <p className="flex items-center gap-2 font-titulo font-bold text-verde-dark">
            <IconeApp nome="ideias" tamanho={22} />
            Uma solução possível (existem várias)
          </p>
          <p className="mt-2 whitespace-pre-wrap text-verde-dark">
            {conteudo.solucao}
          </p>
          {conteudo.promptExemplo && (
            <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-prompt-bg p-4 font-mono text-sm text-prompt-txt">
              {conteudo.promptExemplo}
            </pre>
          )}
          {conteudo.discussao && (
            <p className="mt-3 text-sm text-verde-dark">{conteudo.discussao}</p>
          )}
        </div>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Concluir lição
      </button>
    </div>
  );
}

/* ============================================================
   CHECKPOINT
   ============================================================ */

export function PlayerCheckpoint({
  conteudo,
  onCompleto,
  analisar,
  lessonId,
  rascunho,
  etapas,
  aoMudarEtapas,
}: {
  conteudo: { titulo: string; itens: string[]; tarefa?: string };
  onCompleto: () => void;
  analisar?: Analisar;
  lessonId?: string;
  rascunho?: string;
  etapas?: number[];
  aoMudarEtapas?: (marcados: number[]) => void;
}) {
  const [marcados, setMarcados] = useState<Set<number>>(new Set(etapas ?? []));
  const [plano, setPlano] = useState(rascunho ?? "");
  const { analise, analisando, enviar } = useAnalise(
    analisar,
    lessonId,
    "checkpoint",
  );

  function alternar(i: number) {
    setMarcados((s) => {
      const novo = new Set(s);
      if (novo.has(i)) novo.delete(i);
      else novo.add(i);
      aoMudarEtapas?.([...novo]);
      return novo;
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-grad-marca p-6 text-center text-white">
        <IconeApp nome="conquistas" tamanho={64} />
        <h3 className="mt-2 font-titulo text-2xl font-extrabold">
          {conteudo.titulo}
        </h3>
      </div>

      <div className="card">
        <ul className="space-y-3">
          {conteudo.itens.map((it, i) => (
            <li key={i}>
              <button
                onClick={() => alternar(i)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-all ${
                    marcados.has(i)
                      ? "border-verde bg-verde text-white"
                      : "border-borda"
                  }`}
                  aria-hidden="true"
                >
                  {marcados.has(i) && "✓"}
                </span>
                <span
                  className={
                    marcados.has(i) ? "text-cinza line-through" : "text-tinta"
                  }
                >
                  {it}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {conteudo.tarefa && (
        <div className="rounded-lg border-l-4 border-laranja bg-laranja-soft p-5">
          <p className="flex items-center gap-2 font-titulo font-bold text-laranja-dark">
            <IconeApp nome="metas" tamanho={22} />
            Tarefa da semana
          </p>
          <p className="mt-1 text-laranja-dark">{conteudo.tarefa}</p>

          {/* A tarefa da semana era só uma frase para ler. Aqui a pessoa
              escreve o prompt que vai usar de verdade e recebe a análise
              ANTES de sair da tela — que é quando ainda dá para corrigir.
              Sem isto, o checkpoint fecha o encontro sem que ninguém
              tenha praticado a única coisa que o encontro ensinou. */}
          <div className="mt-4">
            <p className="font-titulo text-sm font-bold text-laranja-dark">
              Escreva agora o prompt que você vai usar nessa tarefa
            </p>
            <div className="mt-2">
              <AnalisePtcf
                valor={plano}
                aoMudar={setPlano}
                analise={analise}
                analisando={analisando}
                aoEnviar={() => enviar(plano)}
                linhas={4}
                dica="Ex.: Aja como professor(a) de... Crie... para uma turma de... Entregue em..."
              />
            </div>
            {analise && !analise.vazio && analise.completas === 4 && (
              <div className="mt-4">
                <ProximoPasso texto={plano} />
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={onCompleto} className="btn-primario">
        Concluir encontro
      </button>
    </div>
  );
}
