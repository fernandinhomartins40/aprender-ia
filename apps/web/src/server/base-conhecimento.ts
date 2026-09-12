"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma, prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { TAG_CONHECIMENTO } from "@/lib/tags-cache";

/**
 * Administração da Base de Conhecimento.
 *
 * Uma explicação editada aqui muda em todas as telas de uma vez: os
 * ícones ⓘ e a Central leem da mesma tabela, através de um cache com
 * tag. Por isso todo salvamento chama `revalidateTag` — sem isso a
 * alteração só apareceria quando o cache expirasse por conta própria.
 */

function texto(dados: FormData, campo: string) {
  return String(dados.get(campo) ?? "").trim();
}

/** Uma entrada por linha no formulário; linhas vazias são descartadas. */
function linhas(dados: FormData, campo: string): string[] {
  return texto(dados, campo)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugificar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Só https e rotas internas da própria aplicação. */
function urlSegura(valor: string): string | null {
  if (!valor) return null;
  if (valor.startsWith("/")) return valor;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * As "importâncias" vêm do formulário como `contexto: texto`, uma por
 * linha. É o formato mais simples de editar à mão sem expor JSON cru a
 * quem administra o conteúdo.
 */
function importancias(dados: FormData): Record<string, string> | null {
  const entradas = texto(dados, "importancias")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      if (i < 1) return null;
      const chave = l.slice(0, i).trim();
      const valor = l.slice(i + 1).trim();
      return chave && valor ? ([chave, valor] as const) : null;
    })
    .filter((x): x is readonly [string, string] => x !== null);

  return entradas.length > 0 ? Object.fromEntries(entradas) : null;
}

function limparCache() {
  revalidateTag(TAG_CONHECIMENTO);
  revalidatePath("/admin/conhecimento");
  revalidatePath("/app/conhecimento");
}

export async function salvarVerbete(dados: FormData) {
  await exigirAdmin();

  const id = texto(dados, "id");
  const termo = texto(dados, "termo");
  const resumo = texto(dados, "resumo");
  const explicacao = texto(dados, "explicacao");
  // Sem termo ou sem explicação não há verbete: um ícone que abre um
  // painel vazio é pior que ícone nenhum.
  if (!termo || !resumo || !explicacao) return;

  const slug = slugificar(texto(dados, "slug") || termo);
  if (!slug) return;

  const fonteUrlDigitada = texto(dados, "fonteUrl");
  const saibaMaisDigitada = texto(dados, "saibaMaisUrl");
  const fonteUrl = fonteUrlDigitada ? urlSegura(fonteUrlDigitada) : null;
  const saibaMaisUrl = saibaMaisDigitada ? urlSegura(saibaMaisDigitada) : null;
  // URL inválida não é salva como null silenciosamente: o verbete
  // apareceria sem fonte, e "sem fonte" tem significado próprio na
  // interface (explicação nossa, não norma).
  if ((fonteUrlDigitada && !fonteUrl) || (saibaMaisDigitada && !saibaMaisUrl)) return;

  const registro = {
    slug,
    termo,
    resumo,
    explicacao,
    categoria: texto(dados, "categoria") || "Outros",
    sinonimos: linhas(dados, "sinonimos"),
    relacionadoSlugs: linhas(dados, "relacionadoSlugs").map(slugificar),
    importancias: importancias(dados) ?? Prisma.DbNull,
    fonteNome: texto(dados, "fonteNome") || null,
    fonteUrl,
    saibaMaisUrl,
    publicado: dados.get("publicado") === "on",
  };

  if (id) await prisma.knowledgeEntry.update({ where: { id }, data: registro });
  else await prisma.knowledgeEntry.create({ data: registro });

  limparCache();
}

export async function excluirVerbete(dados: FormData) {
  await exigirAdmin();
  const id = texto(dados, "id");
  if (!id) return;
  await prisma.knowledgeEntry.delete({ where: { id } });
  limparCache();
}

/** Publica ou despublica sem abrir o formulário inteiro. */
export async function alternarPublicacaoVerbete(dados: FormData) {
  await exigirAdmin();
  const id = texto(dados, "id");
  if (!id) return;
  const atual = await prisma.knowledgeEntry.findUnique({
    where: { id },
    select: { publicado: true },
  });
  if (!atual) return;
  await prisma.knowledgeEntry.update({
    where: { id },
    data: { publicado: !atual.publicado },
  });
  limparCache();
}
