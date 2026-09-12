import Link from "next/link";
import { CATEGORIAS_CONHECIMENTO } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { categoriasComVerbetes, verbetes } from "@/server/conhecimento";
import { CentralConhecimento } from "@/components/central-conhecimento";
import { IconeApp } from "@/components/icone-app";

export const dynamic = "force-dynamic";

/**
 * Central de Conhecimento.
 *
 * `?termo=<slug>` abre um verbete já selecionado: é o destino do link
 * "Ver na Central" que existe em cada ícone ⓘ da aplicação, e é o que
 * permite ir do termo no contexto à explicação completa sem perder o
 * assunto.
 */
export default async function Conhecimento({
  searchParams,
}: {
  searchParams: Promise<{ termo?: string }>;
}) {
  await exigirAluno();
  const [{ termo }, itens, categorias] = await Promise.all([
    searchParams,
    verbetes(),
    categoriasComVerbetes(CATEGORIAS_CONHECIMENTO),
  ]);

  const slugInicial = termo && itens.some((i) => i.slug === termo) ? termo : undefined;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Central de Conhecimento</h1>
        <p className="mt-1 max-w-2xl text-tinta-clara">
          Pergunte com suas palavras sobre conceitos pedagógicos, BNCC, avaliação e uso
          responsável de IA. Cada explicação diz se é informação oficial ou explicação
          didática da plataforma.
        </p>
      </div>

      {/* A BNCC ganha destaque próprio: é o assunto que mais gera dúvida
          e o único com material progressivo, do zero, dentro da casa. */}
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

      <CentralConhecimento itens={itens} slugInicial={slugInicial} categorias={categorias} />
    </div>
  );
}
