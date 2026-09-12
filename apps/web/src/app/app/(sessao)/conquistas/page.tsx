import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { IconeApp } from "@/components/icone-app";
import { iconeGamificacao } from "@/lib/icones-gamificacao";
import { Termo } from "@/components/termo";

export const dynamic = "force-dynamic";

export default async function Conquistas() {
  const user = await exigirAluno();

  const [todas, minhas] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { ordem: "asc" } }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true, conquistadoEm: true },
    }),
  ]);

  const conquistadas = new Map(minhas.map((m) => [m.achievementId, m.conquistadoEm]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">
          Conquistas
          <Termo slug="conquista" contexto="conquistas" rotulo="Conquistas" />
        </h1>
        <p className="mt-1 text-tinta-clara">
          {minhas.length} de {todas.length} conquistadas
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
