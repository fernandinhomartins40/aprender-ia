import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { registrarPrompt } from "@/server/acoes";
import { BibliotecaPrompts } from "@/components/biblioteca-prompts";

export const dynamic = "force-dynamic";

export default async function Prompts() {
  await exigirAluno();
  const prompts = await prisma.promptTemplate.findMany({
    orderBy: { titulo: "asc" },
  });

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
          variaveis: (p.variaveis as any) ?? [],
          ferramentasSugeridas: p.ferramentasSugeridas,
        }))}
        onExecutar={registrarPrompt}
      />
    </div>
  );
}
