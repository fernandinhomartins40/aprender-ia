import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import {
  alternarFavoritoPrompt,
  registrarMontagemPrompt,
  registrarPrompt,
} from "@/server/acoes";
import { BibliotecaPrompts } from "@/components/biblioteca-prompts";
import { mapaVerbetes } from "@/server/conhecimento";
import { Termo } from "@/components/termo";
import { cursosDoAluno, doCurso, resolverCursoAtivo } from "@/server/curso-ativo";
import { SeletorCurso } from "@/components/seletor-curso";
import { ROTULOS_EDUCACAO, ROTULOS_NEGOCIO } from "@/components/biblioteca-prompts";
import { eCursoDeNegocio } from "@/lib/cursos";

export const dynamic = "force-dynamic";

/**
 * Os termos explicados nesta tela.
 *
 * Carregados de uma vez e passados ao componente client: ele é quem
 * desenha os rótulos dos filtros e dos campos, onde o vocabulário
 * técnico está.
 */
const TERMOS = [
  "prompt",
  "ptcf",
  "variavel-prompt",
  "banco-prompts",
  "etapa-ensino",
  "objetivo-pedagogico",
  "componente-curricular",
  "privacidade",
  "ferramenta-ia",
  "alucinacao",
];

export default async function Prompts({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const user = await exigirAluno();
  const { curso: cursoPedido } = await searchParams;
  const curso = await resolverCursoAtivo(user.id, cursoPedido);
  const cursos = await cursosDoAluno(user.id);
  const [prompts, ferramentas, favoritos, execucoes, ajuda] = await Promise.all([
    prisma.promptTemplate.findMany({
      where: doCurso(curso),
      orderBy: { titulo: "asc" },
    }),
    prisma.aiTool.findMany({ where: { ativo: true, ...doCurso(curso) }, orderBy: [{ ordem: "asc" }, { nome: "asc" }] }),
    prisma.promptFavorite.findMany({ where: { userId: user.id }, select: { promptTemplateId: true } }),
    prisma.promptRun.groupBy({ by: ["promptTemplateId"], _count: { id: true } }),
    mapaVerbetes(TERMOS),
  ]);
  const usos = new Map(execucoes.map((e) => [e.promptTemplateId, e._count.id]));
  const negocio = eCursoDeNegocio(curso?.slug);

  return (
    <div>
      <SeletorCurso cursos={cursos} ativo={curso?.id ?? null} base="/app/prompts" />
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">
          Banco de prompts
          <Termo slug="banco-prompts" contexto="prompts" rotulo="Banco de prompts" />
        </h1>
        <p className="mt-1 text-tinta-clara">
          {negocio
            ? "Personalize, abra na IA que preferir e use hoje mesmo no seu negócio."
            : "Personalize, abra na IA que preferir e use na sua próxima aula."}
          <Termo slug="privacidade" contexto="prompts" rotulo="Privacidade de estudantes" />
        </p>
      </div>

      <BibliotecaPrompts
        ajuda={ajuda}
        rotulos={negocio ? ROTULOS_NEGOCIO : ROTULOS_EDUCACAO}
        aoMontarPrompt={registrarMontagemPrompt}
        prompts={prompts.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          corpo: p.corpo,
          categoria: p.categoria,
          // O recorte é um só campo na interface: a disciplina do curso de
          // Educadores e o setor do de Empreendedores ocupam o mesmo lugar.
          disciplina: p.setor ?? p.disciplina,
          dica: p.dica,
          origem: p.origem,
          faixa: p.faixa,
          etapaEnsino: p.porteEmpresa ?? p.etapaEnsino,
          objetivoPedagogico: p.objetivoPedagogico,
          tipoAtividade: p.tipoAtividade,
          nivelDificuldade: p.nivelDificuldade,
          exemploPreenchido: p.exemploPreenchido,
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
