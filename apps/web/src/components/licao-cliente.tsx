"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  PlayerTeoria, PlayerQuiz, PlayerDuelo, PlayerCacaErro,
  PlayerPrompt, PlayerDesafio, PlayerCaso, PlayerCheckpoint,
  PlayerAquecimento, PlayerNoCelular, PlayerEmergencia,
  type Analisar,
} from "./players";
import { FeedbackConclusao, type ResultadoConclusao } from "./feedback-conclusao";

export function LicaoCliente({
  tipo,
  conteudo,
  template,
  lessonId,
  proximaId,
  concluir,
  registrar,
  analisar,
}: {
  tipo: string;
  conteudo: any;
  template?: {
    id: string;
    corpo: string;
    variaveis: { chave: string; rotulo?: string; exemplo?: string }[];
    ferramentasSugeridas: string[];
    dica?: string | null;
  } | null;
  lessonId: string;
  proximaId?: string | null;
  concluir: (d: FormData) => Promise<ResultadoConclusao | null>;
  registrar: (d: FormData) => Promise<void>;
  /** Analisa o texto escrito nas atividades de resposta aberta. */
  analisar: Analisar;
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<ResultadoConclusao | null>(null);

  function finalizar() {
    const d = new FormData();
    d.set("lessonId", lessonId);
    iniciar(async () => {
      const salvo = await concluir(d);
      if (salvo) setResultado(salvo);
    });
  }

  function continuar() {
    router.push(proximaId ? `/app/licao/${proximaId}` : "/app/trilha");
    router.refresh();
  }

  function aoExecutar(ferramenta: string, promptFinal: string, valores: Record<string, string>) {
    if (!template) return;
    const d = new FormData();
    d.set("promptTemplateId", template.id);
    d.set("ferramenta", ferramenta);
    d.set("promptFinal", promptFinal);
    d.set("variaveis", JSON.stringify(valores));
    iniciar(async () => { await registrar(d); });
  }

  if (pendente) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-tinta-clara">Salvando seu progresso...</p>
      </div>
    );
  }

  if (resultado) {
    return <FeedbackConclusao resultado={resultado} aoContinuar={continuar} />;
  }

  switch (tipo) {
    case "TEORIA":
      return (
        <>
          <PlayerTeoria blocos={conteudo.blocos ?? []} />
          <button onClick={finalizar} className="btn-primario mt-8">
            Concluir lição
          </button>
        </>
      );
    case "QUIZ":
      return <PlayerQuiz perguntas={conteudo.perguntas ?? []} onCompleto={finalizar} />;
    case "AQUECIMENTO":
      return <PlayerAquecimento conteudo={conteudo} onCompleto={finalizar} />;
    case "NO_CELULAR":
      return <PlayerNoCelular conteudo={conteudo} onCompleto={finalizar} />;
    case "EMERGENCIA":
      return <PlayerEmergencia conteudo={conteudo} onCompleto={finalizar} />;
    case "DUELO":
      return (
        <PlayerDuelo
          conteudo={conteudo}
          onCompleto={finalizar}
          analisar={analisar}
          lessonId={lessonId}
        />
      );
    case "CACA_ERRO":
      return <PlayerCacaErro conteudo={conteudo} onCompleto={finalizar} />;
    case "DESAFIO":
      return <PlayerDesafio conteudo={conteudo} onCompleto={finalizar} />;
    case "CASO":
      return (
        <PlayerCaso
          conteudo={conteudo}
          onCompleto={finalizar}
          analisar={analisar}
          lessonId={lessonId}
        />
      );
    case "CHECKPOINT":
      return (
        <PlayerCheckpoint
          conteudo={conteudo}
          onCompleto={finalizar}
          analisar={analisar}
          lessonId={lessonId}
        />
      );
    case "PROMPT":
      return template ? (
        <PlayerPrompt
          introducao={conteudo.introducao ?? ""}
          template={template}
          onExecutado={aoExecutar}
          onCompleto={finalizar}
        />
      ) : (
        <p className="text-tinta-clara">Prompt indisponível.</p>
      );
    default:
      return <p className="text-tinta-clara">Tipo de lição não reconhecido.</p>;
  }
}
