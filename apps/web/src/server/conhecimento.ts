import { unstable_cache } from "next/cache";
import { prisma } from "@aprender/db";
import type { ItemAjuda } from "@/components/ajuda-contextual";
import { TAG_CONHECIMENTO } from "@/lib/tags-cache";

/**
 * Acesso à Base de Conhecimento.
 *
 * Existe para que uma página não precise saber nada de Prisma para pôr um
 * ícone ⓘ ao lado de um termo — era o que fazia o sistema ficar em uma
 * tela só: cada uso exigia uma consulta escrita à mão no componente.
 *
 * Cache: os verbetes mudam quando um administrador salva algo, não a cada
 * navegação. Sem cache, uma tela com seis ícones faria seis consultas por
 * render. Carregamos a base inteira uma vez (são algumas dezenas de
 * registros, poucos KB) e servimos dali; `revalidateTag("conhecimento")`
 * no salvamento derruba o cache.
 */

export type VerbeteCompleto = ItemAjuda & {
  categoria: string;
  sinonimos: string[];
  relacionadoSlugs: string[];
  /** Nulo = verbete comum, visível em qualquer curso. */
  courseId: string | null;
};

const carregarPublicados = unstable_cache(
  async (): Promise<VerbeteCompleto[]> => {
    const itens = await prisma.knowledgeEntry.findMany({
      where: { publicado: true },
      orderBy: { termo: "asc" },
    });
    return itens.map((i) => ({
      slug: i.slug,
      termo: i.termo,
      categoria: i.categoria,
      sinonimos: i.sinonimos,
      resumo: i.resumo,
      explicacao: i.explicacao,
      importancias: (i.importancias as Record<string, string> | null) ?? null,
      fonteNome: i.fonteNome,
      fonteUrl: i.fonteUrl,
      saibaMaisUrl: i.saibaMaisUrl,
      relacionadoSlugs: i.relacionadoSlugs,
      courseId: i.courseId,
    }));
  },
  ["base-conhecimento"],
  { tags: [TAG_CONHECIMENTO] },
);

/**
 * Todos os verbetes publicados, em ordem alfabética.
 *
 * Com `courseId`, tira da lista os verbetes de outro curso. Os de
 * `courseId` nulo ficam sempre: "prompt" e "alucinação" querem dizer a
 * mesma coisa para um professor e para um dono de loja, e duplicá-los
 * por curso só criaria duas versões para manter.
 *
 * O filtro é feito aqui, e não na consulta, porque a lista inteira é
 * pequena e fica em cache — vale mais reaproveitá-la do que ter um cache
 * por curso.
 */
export async function verbetes(courseId?: string): Promise<VerbeteCompleto[]> {
  const todos = await carregarPublicados();
  if (!courseId) return todos;
  return todos.filter((v) => v.courseId === null || v.courseId === courseId);
}

/**
 * Um verbete por slug, ou `null`.
 *
 * Devolver `null` em vez de lançar é deliberado: um termo despublicado ou
 * renomeado não pode derrubar a página em que o ícone estava. Quem chama
 * simplesmente não desenha o ícone.
 */
export async function verbete(slug: string): Promise<VerbeteCompleto | null> {
  const todos = await carregarPublicados();
  return todos.find((v) => v.slug === slug) ?? null;
}

/**
 * Vários verbetes de uma vez, indexados por slug.
 *
 * É o que uma página com muitos ícones usa: uma chamada, um objeto, e
 * cada `<Termo>` pega o seu. Slugs inexistentes ficam de fora do mapa.
 */
export async function mapaVerbetes(
  slugs: string[],
): Promise<Record<string, VerbeteCompleto>> {
  const todos = await carregarPublicados();
  const mapa: Record<string, VerbeteCompleto> = {};
  for (const v of todos) if (slugs.includes(v.slug)) mapa[v.slug] = v;
  return mapa;
}

/** As categorias que têm ao menos um verbete publicado, na ordem da base. */
export async function categoriasComVerbetes(ordem: readonly string[], courseId?: string) {
  const todos = await verbetes(courseId);
  const presentes = new Set(todos.map((v) => v.categoria));
  const conhecidas = ordem.filter((c) => presentes.has(c));
  const extras = [...presentes].filter((c) => !ordem.includes(c)).sort();
  return [...conhecidas, ...extras];
}
