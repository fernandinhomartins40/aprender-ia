import Link from "next/link";
import { redirect } from "next/navigation";
import { CATEGORIAS_CONHECIMENTO } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { consultarHistorico } from "@/server/acoes";
import { categoriasComVerbetes, verbetes } from "@/server/conhecimento";
import { CentralConhecimento } from "@/components/central-conhecimento";
import { IconeApp } from "@/components/icone-app";
import { cursosDoAluno, resolverCursoAtivo } from "@/server/curso-ativo";
import { SeletorCurso } from "@/components/seletor-curso";
import { eCursoDeNegocio } from "@/lib/cursos";

export const dynamic = "force-dynamic";

/**
 * Central de Conhecimento.
 *
 * `?termo=<slug>` é o destino do link "Ver na Central" que existe em cada
 * ícone ⓘ da aplicação. Esses links estão espalhados pelo conteúdo, então
 * continuam válidos: agora redirecionam para a página própria do verbete,
 * em vez de abrir um painel dentro desta tela.
 */
export default async function Conhecimento({
  searchParams,
}: {
  searchParams: Promise<{ termo?: string; curso?: string }>;
}) {
  const user = await exigirAluno();
  const { termo, curso: cursoPedido } = await searchParams;
  const curso = await resolverCursoAtivo(user.id, cursoPedido);
  const [itens, categorias, cursos] = await Promise.all([
    verbetes(curso?.id),
    categoriasComVerbetes(CATEGORIAS_CONHECIMENTO, curso?.id),
    cursosDoAluno(user.id),
  ]);
  const negocio = eCursoDeNegocio(curso?.slug);

  if (termo && itens.some((i) => i.slug === termo)) {
    redirect(`/app/conhecimento/${termo}`);
  }

  return (
    <div>
      <SeletorCurso cursos={cursos} ativo={curso?.id ?? null} base="/app/conhecimento" />
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Central de Conhecimento</h1>
        <p className="mt-1 max-w-2xl text-tinta-clara">
          {negocio
            ? "Pergunte com suas palavras sobre os termos que aparecem no curso — prompt, agente, automação, alucinação. Cada explicação começa em linguagem simples e só depois usa o termo técnico."
            : "Pergunte com suas palavras sobre conceitos pedagógicos, BNCC, avaliação e uso responsável de IA. Cada explicação diz se é informação oficial ou explicação didática da plataforma."}
        </p>
      </div>

      {/* A BNCC ganha destaque próprio: é o assunto que mais gera dúvida
          e o único com material progressivo, do zero, dentro da casa.
          Num curso de negócios não faz sentido — lá ninguém planeja aula. */}
      {!negocio && (
        <Link
          href="/app/conhecimento/bncc"
          className="mb-6 flex items-center gap-4 rounded-xl bg-grad-marca p-5 text-white transition-transform hover:scale-[1.01]"
        >
          <span className="shrink-0 rounded-2xl bg-white/15 p-2">
            <IconeApp nome="documentos" tamanho={44} />
          </span>
          <span className="min-w-0">
            <span className="block font-titulo text-lg font-extrabold">
              BNCC explicada do zero
            </span>
            <span className="mt-0.5 block text-sm opacity-90">
              O que é, para que serve, competência e habilidade, como ler um código e como
              usar na prática — sem pressupor conhecimento prévio.
            </span>
          </span>
        </Link>
      )}

      <CentralConhecimento
        itens={itens}
        categorias={categorias}
        aoConsultarHistorico={consultarHistorico}
        negocio={negocio}
      />
    </div>
  );
}
