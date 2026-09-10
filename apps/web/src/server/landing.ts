"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { SECOES, SECAO_POR_CHAVE, type ItemPadrao } from "@/lib/landing-catalogo";

/**
 * Conteúdo editável da landing page.
 *
 * Regra central: o banco COMPLEMENTA o catálogo, nunca o substitui. Uma
 * seção sem registro salvo responde pelo conteúdo padrão, então a página
 * inicial — a porta de entrada do projeto — não pode ficar em branco por
 * causa de migration pendente, banco vazio ou seção nunca editada.
 */

export type SecaoResolvida = {
  chave: string;
  rotulo: string;
  ajuda: string;
  ordem: number;
  titulo: string;
  subtitulo: string;
  texto: string;
  selo: string;
  ctaTexto: string;
  ctaLink: string;
  cta2Texto: string;
  cta2Link: string;
  imagem: string | null;
  video: string | null;
  visivel: boolean;
  /// Ainda não editada: a tela avisa que está no conteúdo original.
  personalizada: boolean;
  atualizadoEm: Date | null;
  atualizadoPor: string | null;
  campos: string[];
  listaRotulo: string | null;
  camposItem: string[];
  itens: {
    id: string;
    titulo: string;
    texto: string;
    extra: string;
    icone: string | null;
    cor: string | null;
    selo: string | null;
    imagem: string | null;
    link: string | null;
    visivel: boolean;
    ordem: number;
    /// Item do catálogo, ainda sem registro no banco: não pode ser
    /// editado nem apagado antes de a seção ser salva uma vez.
    padrao: boolean;
  }[];
};

/** Vazio no banco significa "usa o padrão", não "apaga o texto". */
function ou(salvo: string | null | undefined, padrao: string | undefined): string {
  if (salvo === null || salvo === undefined || salvo === "") return padrao ?? "";
  return salvo;
}

function itemPadraoResolvido(i: ItemPadrao, ordem: number) {
  return {
    id: `padrao:${ordem}`,
    titulo: i.titulo,
    texto: i.texto ?? "",
    extra: i.extra ?? "",
    icone: i.icone ?? null,
    cor: i.cor ?? null,
    selo: i.selo ?? null,
    imagem: i.imagem ?? null,
    link: i.link ?? null,
    visivel: true,
    ordem,
    padrao: true,
  };
}

/**
 * Todas as seções, com o salvo sobrepondo o padrão.
 *
 * Usada tanto pela landing (pública) quanto pelo painel, para que as duas
 * nunca discordem sobre o que está publicado.
 */
export async function lerLanding(): Promise<SecaoResolvida[]> {
  let salvas: Awaited<ReturnType<typeof prisma.landingSection.findMany>> = [];

  try {
    salvas = await prisma.landingSection.findMany({
      include: { itens: { orderBy: { ordem: "asc" } } },
    });
  } catch (e) {
    console.error("[landing] tabelas indisponíveis; usando conteúdo padrão.", e);
  }

  const porChave = new Map(
    salvas.map((s) => [s.chave, s as typeof s & { itens: NonNullable<unknown>[] }]),
  );

  return SECOES.map((def) => {
    const salva = porChave.get(def.chave) as
      | (typeof salvas)[number] & {
          itens: {
            id: string; titulo: string; texto: string | null; extra: string | null;
            icone: string | null; cor: string | null; selo: string | null;
            imagem: string | null; link: string | null; visivel: boolean; ordem: number;
          }[];
        }
      | undefined;

    // Itens: se a seção nunca foi salva, mostramos os do catálogo. Depois
    // de salva, o banco manda — inclusive quando o admin apagou todos.
    const itens = salva
      ? salva.itens.map((i) => ({
          id: i.id,
          titulo: i.titulo,
          texto: i.texto ?? "",
          extra: i.extra ?? "",
          icone: i.icone,
          cor: i.cor,
          selo: i.selo,
          imagem: i.imagem,
          link: i.link,
          visivel: i.visivel,
          ordem: i.ordem,
          padrao: false,
        }))
      : (def.itens ?? []).map(itemPadraoResolvido);

    return {
      chave: def.chave,
      rotulo: def.rotulo,
      ajuda: def.ajuda,
      ordem: salva?.ordem ?? def.ordem,
      titulo: ou(salva?.titulo, def.titulo),
      subtitulo: ou(salva?.subtitulo, def.subtitulo),
      texto: ou(salva?.texto, def.texto),
      selo: ou(salva?.selo, def.selo),
      ctaTexto: ou(salva?.ctaTexto, def.ctaTexto),
      ctaLink: ou(salva?.ctaLink, def.ctaLink),
      cta2Texto: ou(salva?.cta2Texto, def.cta2Texto),
      cta2Link: ou(salva?.cta2Link, def.cta2Link),
      // Como nos textos, vazio significa "usa o padrão": salvar a seção
      // com o campo de imagem em branco não pode apagar a arte da capa.
      imagem: ou(salva?.imagem, def.imagem) || null,
      video: salva?.video ?? null,
      visivel: salva?.visivel ?? true,
      personalizada: Boolean(salva),
      atualizadoEm: salva?.atualizadoEm ?? null,
      atualizadoPor: salva?.atualizadoPor ?? null,
      campos: def.campos,
      listaRotulo: def.listaRotulo ?? null,
      camposItem: def.camposItem ?? [],
      itens,
    };
  }).sort((a, b) => a.ordem - b.ordem);
}

/** Uma seção pela chave — para a landing pedir só o que vai desenhar. */
export async function lerSecao(chave: string): Promise<SecaoResolvida | null> {
  const todas = await lerLanding();
  return todas.find((s) => s.chave === chave) ?? null;
}

export async function listarLandingParaTela(): Promise<SecaoResolvida[]> {
  await exigirAdmin();
  return lerLanding();
}

/* ============================================================
   ESCRITA
   ============================================================ */

export type ResultadoLanding = { ok: boolean; mensagem: string };

/**
 * Salva os textos de uma seção.
 *
 * Na primeira gravação, os itens do catálogo são materializados no banco —
 * sem isso o administrador editaria um item "fantasma", que existe na tela
 * mas não tem registro para receber a alteração.
 */
export async function salvarSecao(
  _anterior: ResultadoLanding | null,
  dados: FormData,
): Promise<ResultadoLanding> {
  const admin = await exigirAdmin();

  const chave = String(dados.get("chave") ?? "");
  const def = SECAO_POR_CHAVE.get(chave);
  if (!def) return { ok: false, mensagem: "Seção desconhecida." };

  const campo = (nome: string) => {
    const v = dados.get(nome);
    if (v === null) return undefined;
    const s = String(v).trim();
    return s === "" ? null : s;
  };

  const conteudo = {
    rotulo: def.rotulo,
    titulo: campo("titulo") ?? null,
    subtitulo: campo("subtitulo") ?? null,
    texto: campo("texto") ?? null,
    selo: campo("selo") ?? null,
    ctaTexto: campo("ctaTexto") ?? null,
    ctaLink: campo("ctaLink") ?? null,
    cta2Texto: campo("cta2Texto") ?? null,
    cta2Link: campo("cta2Link") ?? null,
    imagem: campo("imagem") ?? null,
    video: campo("video") ?? null,
    visivel: String(dados.get("visivel") ?? "") === "on",
    ordem: Number(dados.get("ordem") ?? def.ordem) || def.ordem,
    atualizadoPor: admin.nome,
  };

  try {
    const existente = await prisma.landingSection.findUnique({
      where: { chave },
      select: { id: true },
    });

    if (existente) {
      await prisma.landingSection.update({ where: { chave }, data: conteudo });
    } else {
      await prisma.landingSection.create({
        data: {
          chave,
          ...conteudo,
          // Materializa os itens do catálogo para que passem a ser
          // editáveis a partir de agora.
          itens: {
            create: (def.itens ?? []).map((i, n) => ({
              titulo: i.titulo,
              texto: i.texto ?? null,
              extra: i.extra ?? null,
              icone: i.icone ?? null,
              cor: i.cor ?? null,
              selo: i.selo ?? null,
              imagem: i.imagem ?? null,
              link: i.link ?? null,
              ordem: n,
            })),
          },
        },
      });
    }
  } catch (e) {
    console.error("[landing] falha ao salvar seção:", e);
    return {
      ok: false,
      mensagem: "Não foi possível salvar agora. Se o deploy acabou de rodar, tente de novo em instantes.",
    };
  }

  await registrarAcao({
    acao: "landing.secao_salva",
    entidade: "LandingSection",
    entidadeId: chave,
    resumo: `Seção "${def.rotulo}" da landing atualizada`,
  });

  revalidatePath("/");
  revalidatePath("/admin/landing");
  return { ok: true, mensagem: `"${def.rotulo}" salva. A página inicial já mostra a mudança.` };
}

/** Devolve a seção ao conteúdo original, apagando o que foi salvo. */
export async function restaurarSecao(dados: FormData): Promise<void> {
  await exigirAdmin();
  const chave = String(dados.get("chave") ?? "");
  const def = SECAO_POR_CHAVE.get(chave);
  if (!def) return;

  try {
    // Os itens caem por cascade — voltar ao original inclui a lista.
    await prisma.landingSection.deleteMany({ where: { chave } });
  } catch (e) {
    console.error("[landing] falha ao restaurar seção:", e);
    return;
  }

  await registrarAcao({
    acao: "landing.secao_restaurada",
    entidade: "LandingSection",
    entidadeId: chave,
    resumo: `Seção "${def.rotulo}" voltou ao conteúdo original`,
  });

  revalidatePath("/");
  revalidatePath("/admin/landing");
}

/* ============================================================
   ITENS
   ============================================================ */

/** Garante que a seção exista antes de mexer nos itens dela. */
async function garantirSecao(chave: string, autor: string): Promise<string | null> {
  const def = SECAO_POR_CHAVE.get(chave);
  if (!def) return null;

  const existente = await prisma.landingSection.findUnique({
    where: { chave },
    select: { id: true },
  });
  if (existente) return existente.id;

  const criada = await prisma.landingSection.create({
    data: {
      chave,
      rotulo: def.rotulo,
      titulo: def.titulo ?? null,
      subtitulo: def.subtitulo ?? null,
      texto: def.texto ?? null,
      selo: def.selo ?? null,
      ctaTexto: def.ctaTexto ?? null,
      ctaLink: def.ctaLink ?? null,
      cta2Texto: def.cta2Texto ?? null,
      cta2Link: def.cta2Link ?? null,
      ordem: def.ordem,
      atualizadoPor: autor,
      itens: {
        create: (def.itens ?? []).map((i, n) => ({
          titulo: i.titulo,
          texto: i.texto ?? null,
          extra: i.extra ?? null,
          icone: i.icone ?? null,
          cor: i.cor ?? null,
          selo: i.selo ?? null,
          imagem: i.imagem ?? null,
          link: i.link ?? null,
          ordem: n,
        })),
      },
    },
    select: { id: true },
  });
  return criada.id;
}

export async function salvarItem(
  _anterior: ResultadoLanding | null,
  dados: FormData,
): Promise<ResultadoLanding> {
  const admin = await exigirAdmin();

  const chave = String(dados.get("chave") ?? "");
  const id = String(dados.get("id") ?? "").trim();
  const titulo = String(dados.get("titulo") ?? "").trim();

  if (!titulo) return { ok: false, mensagem: "O item precisa de um título." };

  const texto = String(dados.get("texto") ?? "").trim() || null;
  const extra = String(dados.get("extra") ?? "").trim() || null;
  const icone = String(dados.get("icone") ?? "").trim() || null;
  const cor = String(dados.get("cor") ?? "").trim() || null;
  const selo = String(dados.get("selo") ?? "").trim() || null;
  const imagem = String(dados.get("imagem") ?? "").trim() || null;
  const link = String(dados.get("link") ?? "").trim() || null;
  const visivel = String(dados.get("visivel") ?? "on") === "on";

  try {
    // Item "padrao:N" ainda não existe no banco: salvar cria a seção
    // inteira, e aí ele passa a ter registro próprio.
    if (id && !id.startsWith("padrao:")) {
      await prisma.landingItem.update({
        where: { id },
        data: { titulo, texto, extra, icone, cor, selo, imagem, link, visivel },
      });
    } else {
      const sectionId = await garantirSecao(chave, admin.nome ?? "admin");
      if (!sectionId) return { ok: false, mensagem: "Seção desconhecida." };

      const ultimo = await prisma.landingItem.findFirst({
        where: { sectionId },
        orderBy: { ordem: "desc" },
        select: { ordem: true },
      });

      await prisma.landingItem.create({
        data: {
          sectionId, titulo, texto, extra, icone, cor, selo, imagem, link, visivel,
          ordem: (ultimo?.ordem ?? -1) + 1,
        },
      });
    }
  } catch (e) {
    console.error("[landing] falha ao salvar item:", e);
    return { ok: false, mensagem: "Não foi possível salvar o item agora." };
  }

  await registrarAcao({
    acao: "landing.item_salvo",
    entidade: "LandingItem",
    entidadeId: id || null,
    resumo: `Item "${titulo}" (${chave}) salvo`,
  });

  revalidatePath("/");
  revalidatePath("/admin/landing");
  return { ok: true, mensagem: `Item "${titulo}" salvo.` };
}

export async function excluirItem(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  if (!id || id.startsWith("padrao:")) return;

  try {
    const item = await prisma.landingItem.delete({
      where: { id },
      select: { titulo: true },
    });
    await registrarAcao({
      acao: "landing.item_excluido",
      entidade: "LandingItem",
      entidadeId: id,
      resumo: `Item "${item.titulo}" removido da landing`,
    });
  } catch (e) {
    console.error("[landing] falha ao excluir item:", e);
    return;
  }

  revalidatePath("/");
  revalidatePath("/admin/landing");
}

/** Sobe ou desce um item na lista. */
export async function moverItem(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const direcao = String(dados.get("direcao") ?? "");
  if (!id || id.startsWith("padrao:")) return;
  if (direcao !== "cima" && direcao !== "baixo") return;

  try {
    const atual = await prisma.landingItem.findUnique({
      where: { id },
      select: { id: true, sectionId: true, ordem: true },
    });
    if (!atual) return;

    // O vizinho na direção pedida; sem vizinho, o item já está na ponta.
    const vizinho = await prisma.landingItem.findFirst({
      where: {
        sectionId: atual.sectionId,
        ordem: direcao === "cima" ? { lt: atual.ordem } : { gt: atual.ordem },
      },
      orderBy: { ordem: direcao === "cima" ? "desc" : "asc" },
      select: { id: true, ordem: true },
    });
    if (!vizinho) return;

    await prisma.$transaction([
      prisma.landingItem.update({ where: { id: atual.id }, data: { ordem: vizinho.ordem } }),
      prisma.landingItem.update({ where: { id: vizinho.id }, data: { ordem: atual.ordem } }),
    ]);
  } catch (e) {
    console.error("[landing] falha ao mover item:", e);
    return;
  }

  revalidatePath("/");
  revalidatePath("/admin/landing");
}

/** Mostra ou esconde uma seção inteira sem apagar o conteúdo. */
export async function alternarVisibilidade(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();
  const chave = String(dados.get("chave") ?? "");
  const def = SECAO_POR_CHAVE.get(chave);
  if (!def) return;

  try {
    const sectionId = await garantirSecao(chave, admin.nome ?? "admin");
    if (!sectionId) return;

    const atual = await prisma.landingSection.findUnique({
      where: { chave },
      select: { visivel: true },
    });

    await prisma.landingSection.update({
      where: { chave },
      data: { visivel: !(atual?.visivel ?? true), atualizadoPor: admin.nome },
    });

    await registrarAcao({
      acao: "landing.visibilidade",
      entidade: "LandingSection",
      entidadeId: chave,
      resumo: `Seção "${def.rotulo}" ${atual?.visivel ? "escondida" : "exibida"}`,
    });
  } catch (e) {
    console.error("[landing] falha ao alternar visibilidade:", e);
    return;
  }

  revalidatePath("/");
  revalidatePath("/admin/landing");
}
