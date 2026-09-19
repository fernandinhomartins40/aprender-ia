"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";

function texto(dados: FormData, campo: string) {
  return String(dados.get(campo) ?? "").trim();
}

function urlSegura(valor: string) {
  try {
    const url = new URL(valor);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Ferramentas que o aluno vê.
 *
 * Sem curso devolve o catálogo inteiro — é o que o painel do
 * administrador quer. Com curso, devolve as dele mais as de `courseId`
 * nulo, que são as comuns a todos.
 *
 * A mesma ferramenta pode estar nos dois lugares: o ChatGPT genérico e o
 * ChatGPT descrito para quem tem um negócio, com o limite do plano
 * gratuito. Quando isso acontece, vale a do curso — ela fala a língua de
 * quem está lendo. Sem este desempate a tela mostrava "ChatGPT" duas
 * vezes, lado a lado, com descrições diferentes.
 */
export async function ferramentasAtivas(courseId?: string) {
  const todas = await prisma.aiTool.findMany({
    where: {
      ativo: true,
      ...(courseId ? { OR: [{ courseId }, { courseId: null }] } : {}),
    },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
  if (!courseId) return todas;

  const doCurso = new Set(
    todas.filter((f) => f.courseId === courseId).map((f) => f.nome.toLowerCase()),
  );
  return todas.filter((f) => f.courseId === courseId || !doCurso.has(f.nome.toLowerCase()));
}

export async function salvarFerramenta(dados: FormData) {
  await exigirAdmin();
  const id = texto(dados, "id");
  const nome = texto(dados, "nome");
  const chave = texto(dados, "chave").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "");
  const url = urlSegura(texto(dados, "url"));
  const cadastroDigitado = texto(dados, "urlCadastro");
  const urlCadastro = cadastroDigitado ? urlSegura(cadastroDigitado) : null;
  if (!nome || !chave || !url || (cadastroDigitado && !urlCadastro)) return;
  const data = {
    chave, nome, url, urlCadastro,
    descricao: texto(dados, "descricao"),
    categoria: texto(dados, "categoria") || "Outras ferramentas",
    ordem: Math.max(0, Number(texto(dados, "ordem")) || 0),
    ativo: dados.get("ativo") === "on",
  };
  if (id) await prisma.aiTool.update({ where: { id }, data });
  else await prisma.aiTool.create({ data });
  revalidatePath("/admin/ferramentas-ia");
  revalidatePath("/app/ferramentas");
}

export async function excluirFerramenta(dados: FormData) {
  await exigirAdmin();
  const id = texto(dados, "id");
  if (!id) return;
  await prisma.aiTool.delete({ where: { id } });
  revalidatePath("/admin/ferramentas-ia");
  revalidatePath("/app/ferramentas");
}
