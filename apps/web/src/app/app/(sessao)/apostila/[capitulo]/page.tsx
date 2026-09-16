import Link from "next/link";
import { notFound } from "next/navigation";
import { capitulo, sumarioDaApostila } from "@/server/apostila";
import { BaixarApostila } from "@/components/baixar-apostila";
import { TextoApostila } from "@/components/texto-apostila";
import { VoltarParaAula } from "@/components/voltar-para-aula";

export const dynamic = "force-dynamic";

/**
 * O identificador de uma seção na página: "2.2" vira "secao-2-2".
 *
 * O ponto sai porque em CSS ele começa uma classe: um id "secao-2.2" é válido
 * em HTML e o link do sumário até salta para ele, mas qualquer
 * `querySelector("#secao-2.2")` quebra — e é assim que o botão do slide
 * encontra o trecho.
 */
function idDaSecao(numero: string): string {
  return `secao-${numero.replace(/\./g, "-")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ capitulo: string }>;
}) {
  const { capitulo: chave } = await params;
  const cap = await capitulo(chave);
  return { title: cap ? cap.titulo : "Apostila do curso" };
}

export default async function PaginaCapitulo({
  params,
  searchParams,
}: {
  params: Promise<{ capitulo: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const [{ capitulo: chave }, { de }] = await Promise.all([params, searchParams]);
  const [cap, todos] = await Promise.all([capitulo(chave), sumarioDaApostila()]);
  if (!cap) notFound();

  const i = todos.findIndex((c) => c.chave === cap.chave);
  const anterior = todos[i - 1];
  const proximo = todos[i + 1];

  return (
    // Sem padding lateral próprio: o layout do aplicativo já dá o dele, e
    // somar os dois tirava 64px dos 390 de um celular — o texto ficava com
    // 267px de largura útil.
    <main className="mx-auto max-w-3xl py-6">
      {/* Quem veio de uma aula volta para ela; quem veio pelo menu vê só o
          caminho dos capítulos. */}
      <VoltarParaAula de={de} />

      <Link
        href="/app/apostila"
        className="mb-4 inline-block font-titulo text-sm font-bold text-indigo"
      >
        ‹ Todos os capítulos
      </Link>

      <h1 className="mb-1 flex items-start gap-3 font-titulo text-2xl font-extrabold text-tinta">
        <span aria-hidden className="shrink-0">
          {cap.icone}
        </span>
        <span className="min-w-0">{cap.titulo}</span>
      </h1>

      {/* Dentro do capítulo, um atalho para cada seção: num capítulo de nove
          seções, rolar até a que o professor citou seria uma caçada. */}
      {cap.secoes.length > 1 && (
        <nav className="mb-5 mt-4 rounded-xl border border-borda bg-white p-4">
          <p className="mb-2 font-titulo text-xs font-bold uppercase tracking-wide text-cinza">
            Neste capítulo
          </p>
          <ul className="space-y-1.5">
            {cap.secoes.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${idDaSecao(s.numero)}`}
                  className="text-[15px] leading-snug text-indigo-dark hover:underline"
                >
                  <span className="font-bold">{s.numero}</span> {s.titulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {cap.aberturaHtml && <TextoApostila html={cap.aberturaHtml} />}

      {cap.secoes.map((s) => (
        <section key={s.id} id={idDaSecao(s.numero)} className="scroll-mt-20">
          <h2 className="mb-2 mt-7 font-titulo text-xl font-extrabold text-indigo-dark">
            {s.numero} {s.titulo}
          </h2>
          <TextoApostila html={s.html} />
        </section>
      ))}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-borda pt-5">
        {anterior ? (
          <Link
            href={`/app/apostila/${anterior.chave}`}
            className="max-w-[46%] rounded-full border border-borda px-4 py-2.5 font-titulo text-sm font-bold text-tinta-clara"
          >
            ‹ {anterior.titulo.split(":")[0]}
          </Link>
        ) : (
          <span />
        )}
        {proximo && (
          <Link
            href={`/app/apostila/${proximo.chave}`}
            className="max-w-[46%] rounded-full bg-indigo px-4 py-2.5 font-titulo text-sm font-bold text-white"
          >
            {proximo.titulo.split(":")[0]} ›
          </Link>
        )}
      </div>

      <div className="mt-6">
        <BaixarApostila />
      </div>
    </main>
  );
}
