import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAluno } from "@/server/trilha";
import { verbete, mapaVerbetes } from "@/server/conhecimento";
import { estiloCategoria } from "@/lib/cores-conhecimento";
import { IconeApp, type NomeIconeApp } from "@/components/icone-app";
import { MarcarVisto } from "@/components/marcar-visto";

export const dynamic = "force-dynamic";

/**
 * Um assunto da Central, em página própria.
 *
 * Antes cada verbete abria num painel ao lado da lista, com o conteúdo
 * inteiro empilhado num card. Isso cobrava um preço em três lugares:
 * o endereço não mudava (não dava para guardar nem compartilhar um assunto),
 * o botão voltar do navegador saía da Central inteira em vez de voltar à
 * lista, e no celular o texto nascia abaixo de toda a lista de resultados.
 *
 * Agora é rota de verdade, no mesmo padrão da BNCC explicada: endereço
 * próprio, trilha de navegação e leitura em coluna única.
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await verbete(slug);
  if (!item) return { title: "Assunto não encontrado" };
  return { title: `${item.termo} — Central de Conhecimento`, description: item.resumo };
}

/** Rótulos dos contextos de `importancias`, iguais aos da Central. */
function rotuloContexto(chave: string): string {
  const mapa: Record<string, string> = {
    planejamento: "No planejamento",
    prompts: "Nos prompts",
    avaliacao: "Na avaliação",
    aula: "Na aula",
    plataforma: "Na plataforma",
  };
  return mapa[chave] ?? chave.charAt(0).toUpperCase() + chave.slice(1);
}

export default async function VerbetePagina({ params }: Props) {
  await exigirAluno();
  const { slug } = await params;

  const item = await verbete(slug);
  // Um slug inexistente devolve 404 de verdade, e não uma página vazia: o
  // endereço agora é compartilhável, então errar o slug é algo que acontece.
  if (!item) notFound();

  const estilo = estiloCategoria(item.categoria);

  // `mapaVerbetes` devolve um objeto slug→verbete (slugs inexistentes ficam
  // de fora). Percorremos `relacionadoSlugs` para preservar a ordem que o
  // autor do verbete escolheu, em vez da ordem do banco.
  const mapa = item.relacionadoSlugs.length
    ? await mapaVerbetes(item.relacionadoSlugs)
    : {};
  const relacionados = item.relacionadoSlugs
    .map((s) => mapa[s])
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  return (
    <div className="mx-auto max-w-3xl">
      {/* Registra a leitura no navegador. É o que permite à lista mostrar
          o que já foi visto e destacar o último — ver lib/verbetes-vistos. */}
      <MarcarVisto slug={item.slug} />

      <nav aria-label="Trilha de navegação" className="mb-4 text-sm">
        <Link href="/app/conhecimento" className="font-semibold text-indigo hover:underline">
          Central de Conhecimento
        </Link>
        <span className="mx-1.5 text-cinza">/</span>
        <span className="text-tinta-clara">{item.termo}</span>
      </nav>

      {/* Cabeçalho com a cor da categoria: a mesma que identifica o card na
          lista, para que a origem da navegação continue reconhecível. */}
      <header className={`rounded-xl border ${estilo.borda} ${estilo.fundo} p-5 sm:p-6`}>
        <div className="flex items-start gap-4">
          <span className={`shrink-0 rounded-2xl ${estilo.faixa} p-2 text-white`}>
            <IconeApp nome={estilo.icone as NomeIconeApp} tamanho={36} />
          </span>
          <div className="min-w-0">
            <p className={`text-xs font-bold uppercase tracking-wide ${estilo.texto}`}>
              {item.categoria}
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold text-tinta">
              {item.termo}
            </h1>
            {item.sinonimos.length > 0 && (
              <p className="mt-1 text-sm text-tinta-clara">
                Também chamado de: {item.sinonimos.join(", ")}
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 font-semibold leading-relaxed text-tinta">{item.resumo}</p>
      </header>

      <article className="mt-6 space-y-3 leading-relaxed text-tinta-clara">
        {item.explicacao.split("\n\n").map((paragrafo, i) => (
          <p key={i} className="whitespace-pre-line">
            {paragrafo}
          </p>
        ))}
      </article>

      {/* Onde este conceito aparece na aplicação: transforma o verbete em
          navegação, não só em leitura. */}
      {item.importancias && Object.keys(item.importancias).length > 0 && (
        <section className="mt-6 rounded-xl border border-borda bg-fundo p-5">
          <h2 className="font-titulo text-base font-bold text-tinta">
            Onde isso importa na plataforma
          </h2>
          <ul className="mt-3 space-y-2">
            {Object.entries(item.importancias).map(([contexto, texto]) => (
              <li key={contexto} className="text-sm leading-relaxed text-tinta-clara">
                <b className="font-bold text-tinta">{rotuloContexto(contexto)}: </b>
                {texto}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 border-t border-borda pt-4 text-xs leading-relaxed text-cinza">
        {item.fonteNome ? (
          <>
            <b className="font-bold text-tinta-clara">Informação oficial · </b>
            {item.fonteUrl ? (
              <a
                href={item.fonteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo underline"
              >
                {item.fonteNome}
              </a>
            ) : (
              item.fonteNome
            )}
          </>
        ) : (
          "Explicação didática da plataforma — não é texto normativo. Para norma, consulte o documento oficial correspondente."
        )}
      </p>

      {item.saibaMaisUrl && (
        <p className="mt-3">
          {item.saibaMaisUrl.startsWith("/") ? (
            <Link href={item.saibaMaisUrl} className="font-bold text-indigo underline">
              Saiba mais na plataforma →
            </Link>
          ) : (
            <a
              href={item.saibaMaisUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo underline"
            >
              Saiba mais →
            </a>
          )}
        </p>
      )}

      {relacionados.length > 0 && (
        <section className="mt-6 border-t border-borda pt-5">
          <h2 className="font-titulo text-base font-bold text-tinta">Assuntos relacionados</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relacionados.map((r) => {
              const cor = estiloCategoria(r.categoria);
              return (
                <Link
                  key={r.slug}
                  href={`/app/conhecimento/${r.slug}`}
                  className={`rounded-full border ${cor.borda} ${cor.fundo} px-3 py-1.5 text-sm font-semibold ${cor.texto} transition-transform hover:scale-[1.03]`}
                >
                  {r.termo}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <p className="mt-8">
        <Link href="/app/conhecimento" className="font-bold text-indigo hover:underline">
          ← Voltar para a Central de Conhecimento
        </Link>
      </p>
    </div>
  );
}
