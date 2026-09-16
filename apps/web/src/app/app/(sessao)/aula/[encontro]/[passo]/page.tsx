import Link from "next/link";
import { notFound } from "next/navigation";
import { paginaDoPasso } from "@/server/aula";
import { ConteudoDaAula } from "@/components/conteudo-da-aula";
import { SegueOProfessor } from "@/components/segue-o-professor";
import { BancoDePrompts } from "@/components/banco-de-prompts";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ encontro: string; passo: string }>;
}) {
  const { encontro, passo } = await params;
  const dados = await paginaDoPasso(Number(encontro), Number(passo));
  return { title: dados ? dados.passo.titulo : "Aula" };
}

export default async function PaginaPasso({
  params,
}: {
  params: Promise<{ encontro: string; passo: string }>;
}) {
  const { encontro, passo } = await params;
  const dados = await paginaDoPasso(Number(encontro), Number(passo));
  if (!dados) notFound();

  const { encontro: enc, passo: p, anterior, proximo, total } = dados;

  return (
    <main className="mx-auto max-w-3xl px-5 py-6">
      {/* Leva o aluno à página do professor quando a aula avança. Fica aqui,
          e não no índice, porque é durante a leitura que a aula anda. */}
      <SegueOProfessor
        scriptOrdem={enc.ordem}
        passoAtual={p.ordem}
        passoInicialDoProfessor={dados.passoDoProfessor}
      />

      {/* trilha de navegação: onde estou dentro do curso */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-cinza">
        <Link href="/app/aula" className="font-bold text-indigo hover:underline">
          Aulas
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/app/aula/${enc.ordem}`}
          className="font-bold text-indigo hover:underline"
        >
          {enc.titulo}
        </Link>
        <span aria-hidden>/</span>
        <span>
          página {p.ordem} de {total}
        </span>
      </nav>

      {/* Os cards do banco de prompts abrem o texto completo, já copiado. */}
      <BancoDePrompts />

      <article>
        <ConteudoDaAula
          html={p.html ?? ""}
          stepId={p.id}
          marcados={p.marcados}
        />
      </article>

      {/* O trecho da apostila que aprofunda esta página. */}
      {p.apostila && (
        <Link
          href={p.apostila.href}
          className="mt-8 flex items-center gap-3 rounded-2xl border border-indigo-line bg-indigo-soft p-4 transition-colors hover:brightness-95"
        >
          <span aria-hidden className="text-2xl">
            📖
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-titulo text-xs font-bold uppercase tracking-wide text-indigo">
              Aprofunde na apostila
            </span>
            <span className="block font-titulo text-sm font-bold text-indigo-dark">
              {p.apostila.rotulo}
            </span>
          </span>
          <span aria-hidden className="shrink-0 font-titulo text-indigo">
            ›
          </span>
        </Link>
      )}

      {/* Fim da página: para onde ir agora. Navegação ENTRE páginas, não
          dentro do conteúdo. */}
      <nav className="mt-8 border-t border-borda pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {anterior && (
            <Link
              href={`/app/aula/${enc.ordem}/${anterior.ordem}`}
              className="flex-1 rounded-xl border border-borda bg-white p-4 transition-colors hover:bg-indigo-soft"
            >
              <span className="block font-titulo text-xs font-bold uppercase tracking-wide text-cinza">
                ‹ Anterior
              </span>
              <span className="mt-0.5 block font-titulo text-sm font-bold leading-snug text-tinta">
                {anterior.titulo}
              </span>
            </Link>
          )}
          {proximo && (
            <Link
              href={`/app/aula/${enc.ordem}/${proximo.ordem}`}
              className="flex-1 rounded-xl bg-indigo p-4 text-white transition-colors hover:brightness-110"
            >
              <span className="block font-titulo text-xs font-bold uppercase tracking-wide text-white/70">
                Próxima página ›
              </span>
              <span className="mt-0.5 block font-titulo text-sm font-bold leading-snug">
                {proximo.titulo}
              </span>
            </Link>
          )}
        </div>

        <Link
          href={`/app/aula/${enc.ordem}`}
          className="mt-3 block rounded-xl border border-borda bg-white p-3.5 text-center font-titulo text-sm font-bold text-tinta-clara transition-colors hover:bg-indigo-soft"
        >
          Ver todas as páginas do {enc.titulo}
        </Link>
      </nav>
    </main>
  );
}
