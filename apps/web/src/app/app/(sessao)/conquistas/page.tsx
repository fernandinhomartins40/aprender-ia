import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { IconeApp } from "@/components/icone-app";
import { iconeGamificacao } from "@/lib/icones-gamificacao";
import { Termo } from "@/components/termo";
import { cursosDoAluno, doCurso, resolverCursoAtivo } from "@/server/curso-ativo";
import { SeletorCurso } from "@/components/seletor-curso";

export const dynamic = "force-dynamic";

export default async function Conquistas({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const user = await exigirAluno();
  const { curso: cursoPedido } = await searchParams;
  const curso = await resolverCursoAtivo(user.id, cursoPedido);

  const [todas, minhas, cursos] = await Promise.all([
    prisma.achievement.findMany({ where: doCurso(curso), orderBy: { ordem: "asc" } }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true, conquistadoEm: true },
    }),
    cursosDoAluno(user.id),
  ]);

  const conquistadas = new Map(minhas.map((m) => [m.achievementId, m.conquistadoEm]));
  // Conta só as deste curso: dizer "3 de 20" somando as do outro curso
  // faria o cursista achar que perdeu marcos que nunca esteve fazendo.
  const feitasAqui = todas.filter((c) => conquistadas.has(c.id)).length;

  return (
    <div>
      <SeletorCurso cursos={cursos} ativo={curso?.id ?? null} base="/app/conquistas" />
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">
          Conquistas
          <Termo slug="conquista" contexto="conquistas" rotulo="Conquistas" />
        </h1>
        <p className="mt-1 text-tinta-clara">
          {feitasAqui} de {todas.length} conquistadas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {todas.map((c) => {
          const quando = conquistadas.get(c.id);
          const tem = Boolean(quando);
          const secreta = c.oculto && !tem;
          return (
            <div
              key={c.id}
              className={`card text-center ${tem ? "border-conquista" : "opacity-60"}`}
            >
              <div
                aria-hidden
                className={`flex justify-center ${tem ? "" : "grayscale opacity-70"}`}
              >
                <IconeApp nome={secreta ? "favoritos" : iconeGamificacao(c.icone)} tamanho={72} prioridade={tem} />
              </div>
              <p className="mt-3 font-titulo font-bold">{secreta ? "Conquista secreta" : c.titulo}</p>
              <p className="mt-1 text-sm text-tinta-clara">{secreta ? "Continue avançando para revelar este marco." : c.descricao}</p>
              {quando && (
                <p className="mt-2 text-xs text-conquista">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(quando)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
