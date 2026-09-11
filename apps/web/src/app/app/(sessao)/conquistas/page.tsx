import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";

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
        <h1 className="font-titulo text-3xl font-extrabold">Conquistas</h1>
        <p className="mt-1 text-tinta-clara">
          {minhas.length} de {todas.length} conquistadas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {todas.map((c) => {
          const quando = conquistadas.get(c.id);
          const tem = Boolean(quando);
          return (
            <div
              key={c.id}
              className={`card text-center ${tem ? "border-conquista" : "opacity-60"}`}
            >
              {/* O banco guarda um emoji em `icone` (🌱, 🚀, 🎓), não um
                  nome de arquivo: o componente de ícone caía sempre no
                  padrão e todas as conquistas apareciam iguais. */}
              <div
                aria-hidden
                className={`flex justify-center text-6xl leading-none ${tem ? "" : "grayscale"}`}
              >
                {c.icone || "🏅"}
              </div>
              <p className="mt-3 font-titulo font-bold">{c.titulo}</p>
              <p className="mt-1 text-sm text-tinta-clara">{c.descricao}</p>
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
