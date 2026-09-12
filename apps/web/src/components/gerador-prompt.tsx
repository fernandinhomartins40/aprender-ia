"use client";

import { useMemo, useState } from "react";
import { montarPromptPtcf } from "@/lib/motor-ptcf";
import { AjudaContextual, type ItemAjuda } from "./ajuda-contextual";

/**
 * Gerador de prompt a partir de uma ideia escrita em linguagem corrente.
 *
 * Monta o P.T.C.F. no dispositivo — nada é enviado à plataforma. Os
 * ícones ⓘ estão nos rótulos dos campos de contexto: "objetivo de
 * aprendizagem" e "etapa" são os dois que mais mudam o resultado e os
 * que mais ficam vazios por não estarem claros.
 */

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

export function GeradorPrompt({
  ferramentas,
  ajuda = {},
}: {
  ferramentas: Tool[];
  ajuda?: Record<string, ItemAjuda>;
}) {
  const [ideia, setIdeia] = useState("");
  const [ano, setAno] = useState("");
  const [disc, setDisc] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [formato, setFormato] = useState("atividade com instruções e critérios de revisão");
  const [resultado, setResultado] = useState("");
  const [tool, setTool] = useState("");

  const recomendadas = useMemo(
    () =>
      ferramentas.filter((f) =>
        f.capacidades.some((c) => ["textos", "planejamento", "avaliacao"].includes(c)),
      ),
    [ferramentas],
  );

  function Ajuda({ slug, contexto = "gerador" }: { slug: string; contexto?: string }) {
    const item = ajuda[slug];
    if (!item) return null;
    return <AjudaContextual item={item} contexto={contexto} />;
  }

  function gerar() {
    if (!ideia.trim()) return;
    setResultado(
      montarPromptPtcf({
        papel: `professor(a) especialista em educação básica${disc ? ` e ${disc}` : ""}`,
        tarefa: `crie ${formato} a partir desta necessidade: ${ideia.trim()}`,
        contexto: [
          disc && `Disciplina: ${disc}`,
          ano && `Turma/etapa: ${ano}`,
          objetivo && `Objetivo de aprendizagem: ${objetivo}`,
        ]
          .filter(Boolean)
          .join(". "),
        formato:
          "apresente título, objetivo, materiais, passo a passo, perguntas/atividades, avaliação e uma adaptação para diferentes ritmos",
        revisao:
          "linguagem adequada à turma, progressão clara, mediação docente, acessibilidade, privacidade e adequação ao objetivo",
      }),
    );
  }

  async function copiar() {
    if (resultado) await navigator.clipboard.writeText(resultado);
  }

  async function abrir() {
    const f = ferramentas.find((x) => x.chave === tool);
    if (!f || !resultado) return;
    await copiar();
    const url =
      f.metodoAbertura === "URL_COM_PROMPT" && f.urlComPrompt
        ? f.urlComPrompt.replace("{prompt}", encodeURIComponent(resultado))
        : f.url;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="rounded-xl border-2 border-indigo bg-white p-4 sm:p-6">
      <h2 className="font-titulo text-xl font-extrabold">
        Gerador inteligente de prompt
        <Ajuda slug="ptcf" />
      </h2>
      <p className="mt-1 text-sm text-tinta-clara">
        Escreva a ideia como falaria. O resultado é organizado em P.T.C.F. no seu
        dispositivo, sem API nem envio do texto a terceiros.
      </p>

      <textarea
        value={ideia}
        onChange={(e) => setIdeia(e.target.value)}
        rows={3}
        className="campo mt-4"
        placeholder="Ex.: Quero uma atividade sobre meio ambiente para o 5º ano, com perguntas e uma parte prática."
      />

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-bold text-indigo">
          Adicionar contexto (opcional, mas é o que mais melhora o resultado)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-bold text-tinta">
              Disciplina
              <Ajuda slug="componente-curricular" />
            </span>
            <input
              className="campo w-full"
              value={disc}
              onChange={(e) => setDisc(e.target.value)}
              placeholder="Ex.: Ciências"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-tinta">
              Ano/série ou faixa etária
              <Ajuda slug="etapa-ensino" />
            </span>
            <input
              className="campo w-full"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              placeholder="Ex.: 5º ano"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-bold text-tinta">
              Objetivo de aprendizagem
              <Ajuda slug="objetivo-pedagogico" />
            </span>
            <input
              className="campo w-full"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ex.: comparar impactos do consumo de água"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-bold text-tinta">Formato desejado</span>
            <input
              className="campo w-full"
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              placeholder="Formato desejado"
            />
          </label>
        </div>
      </details>

      <button onClick={gerar} className="btn-primario mt-4">
        Gerar prompt P.T.C.F.
      </button>

      {resultado && (
        <div className="mt-5 rounded-lg bg-prompt-bg p-4">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-prompt-txt">
            {resultado}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secundario" onClick={copiar}>
              Copiar prompt
            </button>
            <select className="campo" value={tool} onChange={(e) => setTool(e.target.value)}>
              <option value="">Escolha uma IA recomendada</option>
              {recomendadas.map((f) => (
                <option key={f.chave} value={f.chave}>
                  {f.nome}
                </option>
              ))}
            </select>
            <button className="btn-primario" onClick={abrir} disabled={!tool}>
              Copiar e abrir IA
            </button>
          </div>
          <p className="mt-3 text-xs text-tinta-clara">
            A IA é aberta em nova aba; o prompt é copiado para colagem. Não colocamos o
            texto em URLs.
            <Ajuda slug="privacidade" contexto="prompts" />
            {" "}Confira o que a ferramenta devolver antes de usar com a turma.
            <Ajuda slug="alucinacao" />
          </p>
        </div>
      )}
    </section>
  );
}
