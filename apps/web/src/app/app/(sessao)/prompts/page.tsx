import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { alternarFavoritoPrompt, registrarPrompt } from "@/server/acoes";
import { BibliotecaPrompts } from "@/components/biblioteca-prompts";

export const dynamic = "force-dynamic";

export default async function Prompts() {
  const user = await exigirAluno();
  const [prompts, ferramentas, favoritos, execucoes] = await Promise.all([
    prisma.promptTemplate.findMany({
    orderBy: { titulo: "asc" },
    }),
    prisma.aiTool.findMany({ where: { ativo: true }, orderBy: [{ ordem: "asc" }, { nome: "asc" }] }),
    prisma.promptFavorite.findMany({ where: { userId: user.id }, select: { promptTemplateId: true } }),
    prisma.promptRun.groupBy({ by: ["promptTemplateId"], _count: { id: true } }),
  ]);
  const usos = new Map(execucoes.map((e) => [e.promptTemplateId, e._count.id]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Banco de prompts</h1>
        <p className="mt-1 text-tinta-clara">
          Personalize, abra na IA que preferir e use na sua próxima aula.
        </p>
      </div>

      <BibliotecaPrompts
        prompts={prompts.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          corpo: p.corpo,
          categoria: p.categoria,
          disciplina: p.disciplina,
          dica: p.dica,
          origem: p.origem,
          faixa: p.faixa,
          etapaEnsino: p.etapaEnsino,
          objetivoPedagogico: p.objetivoPedagogico,
          tipoAtividade: p.tipoAtividade,
          nivelDificuldade: p.nivelDificuldade,
          tags: p.tags,
          usos: usos.get(p.id) ?? 0,
          favorito: favoritos.some((f) => f.promptTemplateId === p.id),
          variaveis: (p.variaveis as any) ?? [],
          ferramentasSugeridas: p.ferramentasSugeridas,
        }))}
        onExecutar={registrarPrompt}
        onFavoritar={alternarFavoritoPrompt}
        ferramentas={ferramentas.map((f) => ({ chave: f.chave, nome: f.nome, descricao: f.descricao, url: f.url, capacidades: f.capacidades, metodoAbertura: f.metodoAbertura, urlComPrompt: f.urlComPrompt, observacaoIntegracao: f.observacaoIntegracao }))}
      />
    </div>
  );
}
