"use client";

import { useMemo, useState } from "react";

const CAMPOS = [
  ["papel", "Papel da IA", "Ex.: professor(a) experiente de Ciências"],
  ["tarefa", "Tarefa", "Ex.: criar uma sequência de 2 aulas"],
  ["contexto", "Contexto", "Ex.: 7º ano, 30 alunos, sem projetor, 50 min por aula"],
  ["formato", "Formato de entrega", "Ex.: tabela com objetivos, etapas, materiais e avaliação"],
  ["revisao", "O que você vai conferir", "Ex.: fatos, linguagem adequada, acessibilidade e ausência de dados pessoais"],
] as const;

export function ConstrutorPrompt() {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);
  const pronto = CAMPOS.slice(0, 4).every(([chave]) => valores[chave]?.trim());
  const prompt = useMemo(() => `Atue como ${valores.papel || "[papel desejado]"}.

Tarefa: ${valores.tarefa || "[o que você quer produzir]"}.
Contexto: ${valores.contexto || "[turma, tempo, recursos e restrições]"}.
Formato: ${valores.formato || "[como quer receber a resposta]"}.

Antes de finalizar, verifique: ${valores.revisao || "fatos, adequação pedagógica, acessibilidade e privacidade"}. Se faltar informação, faça até 3 perguntas objetivas antes de responder.`, [valores]);
  async function copiar() { await navigator.clipboard.writeText(prompt); setCopiado(true); setTimeout(() => setCopiado(false), 1600); }
  return <div className="grid gap-6 lg:grid-cols-2"><section className="card"><p className="mb-4 text-sm text-tinta-clara">Preencha os quatro blocos do P.T.C.F. e acrescente sua revisão humana. Nada é enviado à plataforma.</p><div className="space-y-4">{CAMPOS.map(([chave, rotulo, exemplo], i) => <label key={chave} className="block"><span className="mb-1 block font-titulo font-bold">{i < 4 ? `${["P", "T", "C", "F"][i]} · ` : ""}{rotulo}</span><textarea className="campo min-h-20" value={valores[chave] ?? ""} onChange={e => setValores(v => ({ ...v, [chave]: e.target.value }))} placeholder={exemplo}/></label>)}</div></section><section className="card flex flex-col"><div className="mb-3 flex items-center justify-between"><h2 className="font-titulo text-xl font-extrabold">Seu prompt</h2>{!pronto && <span className="text-xs font-bold text-amarelo-dark">Complete P.T.C.F.</span>}</div><pre className="flex-1 whitespace-pre-wrap rounded-lg bg-prompt-bg p-4 font-sans text-sm leading-6 text-prompt-txt">{prompt}</pre><button onClick={() => void copiar()} className="btn-primario mt-4">{copiado ? "Copiado!" : "Copiar prompt"}</button><p className="mt-3 text-xs text-cinza">Depois de gerar, revise o resultado. IA ajuda a rascunhar; a decisão pedagógica e a conferência são suas.</p></section></div>;
}
