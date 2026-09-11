"use client";

import { useEffect, useState } from "react";
import { CardPrompt } from "./card-prompt";
import { IconeApp } from "./icone-app";
import { AnalisePtcf, ProximoPasso } from "./analise-ptcf";
import type { Analise } from "@/lib/motor-ptcf";

/**
 * A server action que lê o texto do aluno e devolve a análise.
 *
 * Opcional em todos os players: se a página não passar (ou se algum dia
 * um player for usado fora da lição), a atividade continua funcionando
 * como campo de escrita — apenas sem devolutiva. Nenhuma tela quebra por
 * falta dela.
 */
export type Analisar = (dados: FormData) => Promise<{ analise: Analise; salvo: boolean }>;

/**
 * Estado comum das atividades de texto livre.
 *
 * Fica aqui, e não dentro de cada player, porque os três (DUELO, CASO e
 * CHECKPOINT) tinham exatamente o mesmo defeito antes — um botão que
 * revelava texto fixo sem ler nada — e resolver em três lugares
 * diferentes seria o caminho mais curto para os três voltarem a divergir.
 */
function useAnalise(analisar: Analisar | undefined, lessonId: string | undefined, chave: string) {
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

type Bloco = { tipo: string; titulo?: string; texto?: string; itens?: string[] };

export function PlayerTeoria({ blocos }: { blocos: Bloco[] }) {
  return (
    <div className="space-y-5">
      {blocos.map((b, i) => {
        switch (b.tipo) {
          case "traduzindo":
            return (
              <div key={i} className="rounded-lg border-l-4 border-verde bg-verde-soft p-5">
                <p className="flex items-center gap-2 font-titulo font-bold text-verde-dark"><IconeApp nome="documentos" tamanho={22} />Traduzindo: {b.titulo}</p>
                <p className="mt-2 text-verde-dark">{b.texto}</p>
              </div>
            );
          case "atencao":
            return (
              <div key={i} className="rounded-lg border-l-4 border-vermelho bg-vermelho-soft p-5">
                <p className="flex items-center gap-2 font-titulo font-bold text-vermelho-dark"><IconeApp nome="seguranca" tamanho={22} />{b.titulo}</p>
                <p className="mt-2 text-vermelho-dark">{b.texto}</p>
              </div>
            );
          case "dica":
            return (
              <div key={i} className="rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-5">
                <p className="flex items-center gap-2 font-titulo font-bold text-amarelo-dark"><IconeApp nome="ideias" tamanho={22} />{b.titulo}</p>
                <p className="mt-2 text-amarelo-dark">{b.texto}</p>
              </div>
            );
          case "destaque":
            return (
              <div key={i} className="rounded-lg bg-indigo-soft p-5">
                <p className="font-titulo font-bold text-indigo-dark">{b.titulo}</p>
                <p className="mt-2 text-indigo-dark">{b.texto}</p>
              </div>
            );
          case "lista":
            return (
              <div key={i} className="card">
                {b.titulo && <p className="mb-2 font-titulo font-bold">{b.titulo}</p>}
                <ul className="space-y-2">
                  {b.itens?.map((it, j) => (
                    <li key={j} className="flex gap-2 text-tinta-clara">
                      <span className="text-indigo" aria-hidden="true">•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          default:
            return (
              <p key={i} className="text-lg leading-relaxed text-tinta-clara">
                {b.texto}
              </p>
            );
        }
      })}
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
}: {
  perguntas: Pergunta[];
  onCompleto: () => void;
}) {
  const [atual, setAtual] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);

  const p = perguntas[atual]!;
  const ultima = atual === perguntas.length - 1;
  const correta = p.opcoes.find((o) => o.correta)?.id;

  function avancar() {
    if (ultima) return onCompleto();
    setAtual((a) => a + 1);
    setEscolha(null);
    setRevelado(false);
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
              <span className="font-titulo font-bold uppercase text-cinza">{o.id}</span>
              <span className="flex-1">{o.texto}</span>
              {revelado && o.correta && <span aria-hidden="true">✅</span>}
              {revelado && escolhida && !o.correta && <span aria-hidden="true">❌</span>}
            </button>
          );
        })}
      </div>

      {revelado && (
        <div className="mt-5 rounded-lg border-l-4 border-indigo bg-indigo-soft p-4">
          <p className="font-titulo font-bold text-indigo-dark">
            {escolha === correta ? "Isso mesmo." : "Não foi dessa vez — veja por quê:"}
          </p>
          <p className="mt-1 text-indigo-dark">{p.explicacao}</p>
        </div>
      )}

      <div className="mt-6">
        {!revelado ? (
          <button disabled={!escolha} onClick={() => setRevelado(true)} className="btn-primario">
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
}) {
  const [minhaVersao, setMinhaVersao] = useState("");
  const { analise, analisando, enviar } = useAnalise(analisar, lessonId, "duelo");

  return (
    <div className="space-y-6">
      <p className="text-lg text-tinta-clara">{conteudo.contexto}</p>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border-2 border-vermelho-soft bg-vermelho-soft p-5">
          <p className="font-titulo font-bold text-vermelho-dark">
            ❌ O que quase todo mundo escreve
          </p>
          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-prompt-bg p-4 font-mono text-sm text-prompt-txt">
            {conteudo.promptRuim}
          </pre>
          <p className="mt-3 text-sm text-vermelho-dark">{conteudo.resultadoRuim}</p>
        </div>

        <div className="rounded-lg border-2 border-verde-soft bg-verde-soft p-5">
          <p className="font-titulo font-bold text-verde-dark">
            ✅ O mesmo pedido com P.T.C.F.
          </p>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-prompt-bg p-4 font-mono text-sm text-prompt-txt">
            {conteudo.promptBom}
          </pre>
          <p className="mt-3 text-sm text-verde-dark">{conteudo.resultadoBom}</p>
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
          Reescreva o prompt abaixo incluindo as quatro letras. Depois toque
          em <strong>Analisar a minha versão</strong>: eu leio o seu texto e
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
        <p className="flex items-center gap-2 font-titulo text-lg font-bold"><IconeApp nome="pesquisa" tamanho={26} />{conteudo.pergunta}</p>
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
          <div className="rounded-lg border-l-4 border-vermelho bg-vermelho-soft p-5">
            <p className="font-titulo font-bold text-vermelho-dark">
              {acertou ? "Você encontrou." : "Repare bem:"}
            </p>
            <p className="mt-2 text-vermelho-dark">{conteudo.gabarito}</p>
          </div>
          <div className="rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-5">
            <p className="flex items-center gap-2 font-titulo font-bold text-amarelo-dark"><IconeApp nome="ideias" tamanho={22} />A lição</p>
            <p className="mt-2 text-amarelo-dark">{conteudo.licao}</p>
          </div>
        </>
      )}

      {!revelado ? (
        <button disabled={!escolha} onClick={() => setRevelado(true)} className="btn-primario">
          Confirmar
        </button>
      ) : (
        <button onClick={onCompleto} className="btn-primario">
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
}) {
  const [resposta, setResposta] = useState("");
  const [revelado, setRevelado] = useState(false);
  const { analise, analisando, enviar } = useAnalise(analisar, lessonId, "caso");

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
          Escreva o prompt que você usaria para resolver isso. A análise
          mostra quais das quatro letras já estão no seu texto.
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
          <p className="mt-2 whitespace-pre-wrap text-verde-dark">{conteudo.solucao}</p>
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
}: {
  conteudo: { titulo: string; itens: string[]; tarefa?: string };
  onCompleto: () => void;
  analisar?: Analisar;
  lessonId?: string;
}) {
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const [plano, setPlano] = useState("");
  const { analise, analisando, enviar } = useAnalise(analisar, lessonId, "checkpoint");

  function alternar(i: number) {
    setMarcados((s) => {
      const novo = new Set(s);
      if (novo.has(i)) novo.delete(i);
      else novo.add(i);
      return novo;
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-grad-marca p-6 text-center text-white">
        <IconeApp nome="conquistas" tamanho={64} />
        <h3 className="mt-2 font-titulo text-2xl font-extrabold">{conteudo.titulo}</h3>
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
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 ${
                    marcados.has(i) ? "border-verde bg-verde text-white" : "border-borda"
                  }`}
                  aria-hidden="true"
                >
                  {marcados.has(i) && "✓"}
                </span>
                <span className={marcados.has(i) ? "text-cinza line-through" : "text-tinta"}>
                  {it}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {conteudo.tarefa && (
        <div className="rounded-lg border-l-4 border-laranja bg-laranja-soft p-5">
          <p className="flex items-center gap-2 font-titulo font-bold text-laranja-dark"><IconeApp nome="metas" tamanho={22} />Tarefa da semana</p>
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
