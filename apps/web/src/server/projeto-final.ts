"use server";

import { prisma } from "@aprender/db";
import { exigirAluno } from "./trilha";
import { resolverCursoAtivo } from "./curso-ativo";

/**
 * "Minha Empresa Aumentada por IA".
 *
 * O projeto atravessa o curso: o cursista responde um pedaço por módulo e,
 * no fim, tem um Plano de Adoção de IA. O plano precisa fazer sentido para
 * quem nunca viu a plataforma — é o que ele mostra ao sócio, ao contador
 * ou a si mesmo daqui a três meses.
 */

export type PlanoSecao = { chave: string; titulo: string; respostas: string[] };

function lerMapaDeTexto(bruto: FormDataEntryValue | null): Record<string, string> {
  if (typeof bruto !== "string") return {};
  try {
    const dados = JSON.parse(bruto);
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) return {};
    const limpo: Record<string, string> = {};
    for (const [k, v] of Object.entries(dados)) {
      if (typeof v === "string") limpo[k] = v;
    }
    return limpo;
  } catch {
    return {};
  }
}

function lerMapaDeListas(bruto: FormDataEntryValue | null): Record<string, string[]> {
  if (typeof bruto !== "string") return {};
  try {
    const dados = JSON.parse(bruto);
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) return {};
    const limpo: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(dados)) {
      if (Array.isArray(v)) {
        limpo[k] = v.filter((x): x is string => typeof x === "string");
      }
    }
    return limpo;
  } catch {
    return {};
  }
}

/** Salva o que o cursista respondeu até agora. */
export async function salvarProjeto(dados: FormData) {
  const user = await exigirAluno();
  const curso = await resolverCursoAtivo(user.id, String(dados.get("curso") ?? "") || undefined);
  if (!curso) return;

  const negocio = lerMapaDeTexto(dados.get("negocio"));
  const secoes = lerMapaDeListas(dados.get("secoes"));

  await prisma.finalProject.upsert({
    where: { userId_courseId: { userId: user.id, courseId: curso.id } },
    create: { userId: user.id, courseId: curso.id, negocio, secoes },
    update: { negocio, secoes },
  });
}

/** O projeto do cursista neste curso, ou `null` se ainda não começou. */
export async function meuProjeto(userId: string, courseId: string) {
  const p = await prisma.finalProject.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!p) return null;
  return {
    negocio: (p.negocio as Record<string, string>) ?? {},
    secoes: (p.secoes as Record<string, string[]>) ?? {},
    concluidoEm: p.concluidoEm,
  };
}

/** Marca o plano como fechado. Continua editável depois — não é prova. */
export async function concluirProjeto(dados: FormData) {
  const user = await exigirAluno();
  const curso = await resolverCursoAtivo(user.id, String(dados.get("curso") ?? "") || undefined);
  if (!curso) return;
  await prisma.finalProject.updateMany({
    where: { userId: user.id, courseId: curso.id, concluidoEm: null },
    data: { concluidoEm: new Date() },
  });
}
