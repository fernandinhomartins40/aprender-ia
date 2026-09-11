import Link from "next/link";
import { exigirAluno, carregarTrilha, resumoAluno } from "@/server/trilha";
import { AcessoBloqueado } from "@/components/acesso-bloqueado";
import { IconeApp } from "@/components/icone-app";
import { nivelDoXp, xpAteProximoNivel } from "@/lib/gamificacao";

export const dynamic = "force-dynamic";

export default async function PainelAluno() {
  const user = await exigirAluno();
  const [trilha, resumo] = await Promise.all([
    carregarTrilha(user.id),
    resumoAluno(user.id),
  ]);

  const primeiroNome = user.nome?.split(" ")[0] ?? "professor(a)";

  if (trilha?.bloqueado) {
    return (
      <div>
        <h1 className="mb-6 font-titulo text-3xl font-extrabold">
          Olá, {primeiroNome}
        </h1>
        <AcessoBloqueado veredito={trilha.veredito} cursoTitulo={trilha.curso.titulo} />
      </div>
    );
  }

  const proxima = trilha?.modulos
    .flatMap((m) => m.licoes.map((l) => ({ ...l, cor: m.cor })))
    .find((l) => l.status === "DISPONIVEL" || l.status === "EM_ANDAMENTO");
  const nivel = nivelDoXp(trilha?.xpTotal ?? 0);
  const faltamNivel = xpAteProximoNivel(trilha?.xpTotal ?? 0);
  const metaSemanal = 2;
  const missaoConcluida = resumo.licoesNaSemana >= metaSemanal;

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

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="card overflow-hidden bg-gradient-to-br from-indigo-soft via-white to-white">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-2 shadow-md">
              <IconeApp nome="progresso" tamanho={58} prioridade />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-indigo-dark">Nível {nivel.numero}</p>
              <h2 className="font-titulo text-xl font-extrabold">{nivel.titulo}</h2>
              <p className="mt-1 text-sm text-tinta-clara">Faltam {faltamNivel} XP para o próximo nível.</p>
            </div>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white" aria-label={`${nivel.progressoPct}% do nível`}>
            <div className="progresso-vivo h-full rounded-full bg-grad-marca transition-[width] duration-700" style={{ width: `${nivel.progressoPct}%` }} />
          </div>
        </div>

        <div className={`card ${missaoConcluida ? "border-verde bg-verde-soft" : "border-amarelo bg-amarelo-soft"}`}>
          <div className="flex items-center gap-3">
            <IconeApp nome={missaoConcluida ? "conquistas" : "metas"} tamanho={44} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-tinta-clara">Missão da semana</p>
              <p className="font-titulo font-bold">Concluir {metaSemanal} atividades</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-tinta-clara">
            {missaoConcluida ? "Concluída — consistência construída com progresso real." : `${resumo.licoesNaSemana} de ${metaSemanal} concluídas nesta semana.`}
          </p>
        </div>
      </section>

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

      {resumo.conquistasRecentes.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-titulo text-xl font-extrabold">Conquistas recentes</h2>
            <Link href="/app/conquistas" className="text-sm font-bold text-indigo">Ver todas</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {resumo.conquistasRecentes.map((c) => (
              <div key={`${c.titulo}-${c.conquistadoEm.toISOString()}`} className="card flex items-center gap-3 p-4">
                <span className="text-3xl" aria-hidden="true">{c.icone}</span>
                <p className="font-titulo text-sm font-bold">{c.titulo}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
