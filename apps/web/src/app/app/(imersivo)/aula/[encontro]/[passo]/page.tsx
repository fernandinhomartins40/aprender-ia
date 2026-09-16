import Link from "next/link";
import { notFound } from "next/navigation";
import { paginaDoPasso } from "@/server/aula";
import { ConteudoDaAula } from "@/components/conteudo-da-aula";
import { SegueOProfessor } from "@/components/segue-o-professor";
import { BancoDePrompts } from "@/components/banco-de-prompts";
import { BarraDaAula } from "@/components/barra-da-aula";

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
    /* Tela cheia: sem o cabeçalho e a barra do aplicativo, que somavam 9rem de
       altura e competiam com o conteúdo. A navegação da aula está na
       `BarraDaAula`; o X dela devolve o aplicativo. */
    <div className="flex min-h-[100dvh] flex-col">
      <BarraDaAula
        encontro={enc.ordem}
        tituloEncontro={enc.titulo}
        ordem={p.ordem}
        total={total}
        anterior={anterior}
        proximo={proximo}
      />

      {/* Os cards do banco de prompts abrem o texto completo, já copiado. */}
      <BancoDePrompts />

      {/* O respiro de baixo soma a altura da barra fixa e a faixa de gestos do
          aparelho: sem ele, o fim do conteúdo fica escondido atrás dela. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6">
        {/* Leva o aluno à página do professor quando a aula avança. */}
        <SegueOProfessor
          scriptOrdem={enc.ordem}
          passoAtual={p.ordem}
          passoInicialDoProfessor={dados.passoDoProfessor}
        />

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
      </main>
    </div>
  );
}
