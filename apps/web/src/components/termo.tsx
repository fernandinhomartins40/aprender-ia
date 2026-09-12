import { verbete } from "@/server/conhecimento";
import { AjudaContextual, type ItemAjuda } from "./ajuda-contextual";

/**
 * O jeito de marcar um termo explicável em qualquer página.
 *
 *   <h1>Banco de prompts <Termo slug="banco-prompts" contexto="prompts" /></h1>
 *
 * É Server Component: busca o verbete e entrega ao popover (que é client).
 * Assim uma página não precisa importar Prisma nem tratar tipo de JSON
 * para pôr um ícone — a razão pela qual o sistema anterior só existia em
 * uma tela.
 *
 * Se o slug não existir ou estiver despublicado, não renderiza nada. Um
 * termo removido pelo administrador não pode quebrar a tela onde o ícone
 * estava.
 *
 * Para várias marcas na mesma página, `<TermoDoMapa>` evita repetir a
 * busca: a página carrega o mapa uma vez com `mapaVerbetes`.
 */
export async function Termo({
  slug,
  contexto,
  rotulo,
}: {
  slug: string;
  contexto?: string;
  rotulo?: string;
}) {
  const item = await verbete(slug);
  if (!item) return null;
  return <AjudaContextual item={item} contexto={contexto} rotulo={rotulo} />;
}

/** Variante sincrona para páginas que já carregaram o mapa de verbetes. */
export function TermoDoMapa({
  mapa,
  slug,
  contexto,
  rotulo,
}: {
  mapa: Record<string, ItemAjuda>;
  slug: string;
  contexto?: string;
  rotulo?: string;
}) {
  const item = mapa[slug];
  if (!item) return null;
  return <AjudaContextual item={item} contexto={contexto} rotulo={rotulo} />;
}
