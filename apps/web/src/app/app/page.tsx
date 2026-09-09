import Link from "next/link";
import { exigirAluno, carregarTrilha, resumoAluno } from "@/server/trilha";

export const dynamic = "force-dynamic";

export default async function PainelAluno() {
  const user = await exigirAluno();
  const [trilha, resumo] = await Promise.all([
    carregarTrilha(user.id),
    resumoAluno(user.id),
  ]);

  const primeiroNome = user.nome?.split(" ")[0] ?? "professor(a)";

  const proxima = trilha?.modulos
    .flatMap((m) => m.licoes.map((l) => ({ ...l, cor: m.cor })))
    .find((l) => l.status === "DISPONIVEL" || l.status === "EM_ANDAMENTO");

  return (
    <div>
      <h1 className="font-titulo text-3xl font-extrabold">Olá, {primeiroNome}</h1>
      <p className="mt-1 text-lg text-tinta-clara">
        {trilha?.totalConcluidas
          ? "Bom te ver de volta. Vamos continuar?"
          : "Vamos começar sua formação?"}
      </p>

      {/* ---- Próxima lição ---- */}
      {proxima && (
        <Link
          href={`/app/licao/${proxima.id}`}
          className="mt-6 block rounded-xl bg-grad-marca p-6 text-white transition-transform hover:scale-[1.01]"
        >
          <p className="font-titulo text-sm font-bold uppercase tracking-wide opacity-90">
            Continuar de onde parei
          </p>
          <p className="mt-2 font-titulo text-2xl font-extrabold">{proxima.titulo}</p>
          <p className="mt-1 opacity-90">
            {proxima.tempo} minutos · {proxima.xp} XP
          </p>
        </Link>
      )}

      {/* ---- Números ---- */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card text-center">
          <p className="font-titulo text-3xl font-extrabold text-xp">
            {trilha?.xpTotal ?? 0}
          </p>
          <p className="mt-1 text-sm text-tinta-clara">XP acumulado</p>
        </div>
        <div className="card text-center">
          <p className="font-titulo text-3xl font-extrabold text-streak">
            {resumo.ofensiva > 0 ? `🔥 ${resumo.ofensiva}` : "0"}
          </p>
          <p className="mt-1 text-sm text-tinta-clara">
            {resumo.ofensiva === 1 ? "dia seguido" : "dias seguidos"}
          </p>
        </div>
        <div className="card text-center">
          <p className="font-titulo text-3xl font-extrabold text-indigo">
            {trilha?.totalConcluidas ?? 0}
          </p>
          <p className="mt-1 text-sm text-tinta-clara">lições concluídas</p>
        </div>
        <div className="card text-center">
          <p className="font-titulo text-3xl font-extrabold text-verde">
            {resumo.execucoes}
          </p>
          <p className="mt-1 text-sm text-tinta-clara">prompts praticados</p>
        </div>
      </div>

      {/* ---- Tempo economizado ---- */}
      {resumo.minutosEconomizados > 0 && (
        <div className="mt-6 rounded-lg bg-verde-soft p-5 text-center">
          <p className="font-titulo text-xl font-bold text-verde-dark">
            Você já economizou {Math.floor(resumo.minutosEconomizados / 60)}h
            {resumo.minutosEconomizados % 60}min
          </p>
          <p className="mt-1 text-verde-dark">
            segundo os seus próprios registros no diário de bordo
          </p>
        </div>
      )}

      {/* ---- Progresso por encontro ---- */}
      {trilha && (
        <section className="mt-8">
          <h2 className="font-titulo text-xl font-extrabold">Seus encontros</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {trilha.modulos.map((m) => (
              <div key={m.id} className="card border-l-8" style={{ borderLeftColor: m.cor }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-titulo font-bold">{m.titulo}</p>
                    <p className="truncate text-sm text-tinta-clara">{m.subtitulo}</p>
                  </div>
                  <span className="shrink-0 font-titulo text-lg font-extrabold" style={{ color: m.cor }}>
                    {m.concluidas}/{m.total}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-borda">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${m.total ? (m.concluidas / m.total) * 100 : 0}%`,
                      background: m.cor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
