import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/server/admin";
import { planoComConteudo, salvarConteudoDoPlano } from "@/server/acesso-planos";
import { ConteudoDoPlano } from "@/components/conteudo-do-plano";
import { TituloPagina } from "@/components/pagina-admin";

export const dynamic = "force-dynamic";

/**
 * Configuração do que um plano libera.
 *
 * Tela própria, separada do formulário de preço e cobrança: são decisões
 * de natureza diferente ("quanto custa" e "o que dá acesso"), e o
 * formulário único misturando as duas era parte do que tornava o modelo
 * confuso.
 */
export default async function ConteudoPlano({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;

  const dados = await planoComConteudo(id);
  if (!dados) notFound();

  const { plano, cursos } = dados;

  return (
    <div>
      <nav aria-label="Trilha" className="mb-4 text-sm">
        <Link href="/admin/planos" className="font-semibold text-indigo hover:underline">
          Planos
        </Link>
        <span className="mx-1.5 text-cinza">/</span>
        <span className="text-tinta-clara">{plano.nome}</span>
      </nav>

      <TituloPagina
        titulo={`Conteúdo de "${plano.nome}"`}
        descricao={
          plano.gratuito
            ? "Este é o plano gratuito: o que você marcar aqui é o que todo aluno sem plano pago recebe."
            : "Escolha os cursos e módulos que este plano libera. Um aluno com vários planos recebe a soma de todos."
        }
      />

      {cursos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borda bg-white px-6 py-12 text-center">
          <p className="font-titulo font-bold text-tinta">Nenhum curso cadastrado</p>
          <p className="mt-1.5 text-sm text-tinta-clara">
            Crie um curso antes de definir o que este plano libera.
          </p>
          <Link href="/admin/cursos" className="btn-primario mt-4 inline-block">
            Ir para cursos
          </Link>
        </div>
      ) : (
        <ConteudoDoPlano
          planId={plano.id}
          planNome={plano.nome}
          cursos={cursos}
          selecao={plano.cursos.map((c) => ({
            courseId: c.courseId,
            abrangencia: c.abrangencia,
            moduleIds: c.modulos.map((m) => m.moduleId),
          }))}
          aoSalvar={salvarConteudoDoPlano}
        />
      )}
    </div>
  );
}
