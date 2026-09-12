"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import {
  PlayerTeoria,
  PlayerQuiz,
  PlayerDuelo,
  PlayerCacaErro,
  PlayerPrompt,
  PlayerDesafio,
  PlayerCaso,
  PlayerCheckpoint,
  PlayerAquecimento,
  PlayerNoCelular,
  PlayerEmergencia,
  type Analisar,
} from "./players";
import type { TermoDetectavel } from "./texto-explicado";
import {
  FeedbackConclusao,
  type ResultadoConclusao,
} from "./feedback-conclusao";

export function LicaoCliente({
  tipo,
  conteudo,
  template,
  lessonId,
  proximaId,
  concluir,
  registrar,
  analisar,
  registrarDesempenho,
  salvarEtapas,
  concluidaInicialmente = false,
  respostasAbertas = {},
  termos = {},
}: {
  tipo: string;
  conteudo: any;
  lessonId: string;
  proximaId?: string | null;
  concluidaInicialmente?: boolean;
  respostasAbertas?: Record<string, string>;
  /**
   * Verbetes para marcação automática no texto da lição.
   *
   * Chega pronto da página (Server Component) para que este componente
   * client não busque nada: o conteúdo do curso vem do banco e não dá
   * para marcar os termos à mão dentro dele.
   */
  termos?: Record<string, TermoDetectavel>;
  salvarEtapas?: (d: FormData) => Promise<void>;
  template?: {
    id: string;
    corpo: string;
    variaveis: { chave: string; rotulo?: string; exemplo?: string }[];
    ferramentasSugeridas: string[];
    dica?: string | null;
  } | null;
  concluir: (d: FormData) => Promise<ResultadoConclusao | null>;
  registrar: (d: FormData) => Promise<void>;
  analisar: Analisar;
  registrarDesempenho: (d: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<ResultadoConclusao | null>(null);
  const [concluida, setConcluida] = useState(concluidaInicialmente);
  function finalizar() {
    if (concluida) return;
    const d = new FormData();
    d.set("lessonId", lessonId);
    iniciar(async () => {
      const salvo = await concluir(d);
      if (salvo) {
        setConcluida(true);
        setResultado(salvo);
      }
    });
  }
  function continuar() {
    router.push(proximaId ? `/app/licao/${proximaId}` : "/app/trilha");
    router.refresh();
  }
  function aoExecutar(
    ferramenta: string,
    promptFinal: string,
    valores: Record<string, string>,
  ) {
    if (!template) return;
    const d = new FormData();
    d.set("promptTemplateId", template.id);
    d.set("ferramenta", ferramenta);
    d.set("promptFinal", promptFinal);
    d.set("variaveis", JSON.stringify(valores));
    iniciar(async () => {
      await registrar(d);
    });
  }
  async function aoDesempenho(acertos: number, total: number) {
    const d = new FormData();
    d.set("lessonId", lessonId);
    d.set("acertos", String(acertos));
    d.set("total", String(total));
    await registrarDesempenho(d);
  }

  /**
   * O que já estava marcado quando a página abriu.
   *
   * Vem do banco pela mesma via das respostas escritas. Um registro
   * ilegível (formato antigo, gravação truncada) não pode impedir a
   * atividade de abrir — nesse caso a pessoa recomeça a marcação, que é
   * o comportamento de antes, não uma tela quebrada.
   */
  function etapasSalvas(): number[] {
    try {
      const bruto = JSON.parse(respostasAbertas.etapas ?? "[]");
      return Array.isArray(bruto)
        ? bruto.filter((n): n is number => Number.isInteger(n))
        : [];
    } catch {
      return [];
    }
  }

  /**
   * Grava o andamento sem prender a interface.
   *
   * A marcação é otimista de propósito: o estado local já mudou quando
   * isto roda, e esperar o servidor para pintar um "✓" tornaria a
   * atividade lenta no celular, que é onde ela foi feita para acontecer.
   */
  function aoMudarEtapas(marcados: number[]) {
    if (!salvarEtapas) return;
    const d = new FormData();
    d.set("lessonId", lessonId);
    d.set("estado", JSON.stringify(marcados));
    void salvarEtapas(d).catch(() => {
      /* a prática continua mesmo sem o marcador salvo */
    });
  }
  // `AnimatePresence` mantém o modal montado durante a saída: sem ele o
  // `exit` declarado no componente nunca chega a rodar e a recompensa
  // desaparece de um quadro para o outro.
  const modal = (
    <AnimatePresence>
      {resultado && (
        <FeedbackConclusao
          resultado={resultado}
          aoFechar={() => setResultado(null)}
          aoContinuar={continuar}
        />
      )}
    </AnimatePresence>
  );
  if (pendente)
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-tinta-clara">Salvando seu progresso...</p>
      </div>
    );
  let player: ReactNode;
  switch (tipo) {
    case "TEORIA":
      player = (
        <>
          <PlayerTeoria blocos={conteudo.blocos ?? []} termos={termos} />
          <button
            onClick={finalizar}
            disabled={concluida}
            className="btn-primario mt-8"
          >
            {concluida ? "Atividade concluída" : "Concluir lição"}
          </button>
        </>
      );
      break;
    case "QUIZ":
      player = (
        <PlayerQuiz
          perguntas={conteudo.perguntas ?? []}
          onCompleto={finalizar}
          onDesempenho={aoDesempenho}
        />
      );
      break;
    case "AQUECIMENTO":
      player = <PlayerAquecimento conteudo={conteudo} onCompleto={finalizar} />;
      break;
    case "NO_CELULAR":
      player = (
        <PlayerNoCelular
          conteudo={conteudo}
          onCompleto={finalizar}
          etapas={etapasSalvas()}
          aoMudarEtapas={aoMudarEtapas}
        />
      );
      break;
    case "EMERGENCIA":
      player = <PlayerEmergencia conteudo={conteudo} onCompleto={finalizar} />;
      break;
    case "DUELO":
      player = (
        <PlayerDuelo
          conteudo={conteudo}
          onCompleto={finalizar}
          analisar={analisar}
          lessonId={lessonId}
          rascunho={respostasAbertas.duelo}
        />
      );
      break;
    case "CACA_ERRO":
      player = (
        <PlayerCacaErro
          conteudo={conteudo}
          onCompleto={finalizar}
          onDesempenho={aoDesempenho}
        />
      );
      break;
    case "DESAFIO":
      player = <PlayerDesafio conteudo={conteudo} onCompleto={finalizar} />;
      break;
    case "CASO":
      player = (
        <PlayerCaso
          conteudo={conteudo}
          onCompleto={finalizar}
          analisar={analisar}
          lessonId={lessonId}
          rascunho={respostasAbertas.caso}
        />
      );
      break;
    case "CHECKPOINT":
      player = (
        <PlayerCheckpoint
          conteudo={conteudo}
          onCompleto={finalizar}
          analisar={analisar}
          lessonId={lessonId}
          rascunho={respostasAbertas.checkpoint}
          etapas={etapasSalvas()}
          aoMudarEtapas={aoMudarEtapas}
        />
      );
      break;
    case "PROMPT":
      player = template ? (
        <PlayerPrompt
          introducao={conteudo.introducao ?? ""}
          template={template}
          onExecutado={aoExecutar}
          onCompleto={finalizar}
        />
      ) : (
        <p className="text-tinta-clara">Prompt indisponível.</p>
      );
      break;
    default:
      player = (
        <p className="text-tinta-clara">Tipo de lição não reconhecido.</p>
      );
  }
  return (
    <>
      {concluida && !resultado && (
        <p className="mb-5 rounded-lg border border-verde bg-verde-soft px-4 py-3 text-sm font-bold text-verde-dark">
          Atividade concluída — seu XP e progresso já estão salvos.
        </p>
      )}
      {player}
      {modal}
    </>
  );
}
