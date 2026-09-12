import Link from "next/link";
import { exigirAluno, carregarTrilha, listarCursosDoAluno } from "@/server/trilha";
import { IconeApp } from "@/components/icone-app";
import { ICONE_POR_TIPO, ICONE_POR_ENCONTRO } from "@/lib/icones-trilha";
import { AcessoBloqueado } from "@/components/acesso-bloqueado";
import { Termo } from "@/components/termo";

export const dynamic = "force-dynamic";

const NOME_TIPO: Record<string, string> = {
  TEORIA: "Leitura", QUIZ: "Quiz", DUELO: "Duelo de prompts",
  CACA_ERRO: "Caça ao erro", PROMPT: "Prática com IA",
  DESAFIO: "Desafio", CASO: "Estudo de caso", CHECKPOINT: "Checkpoint",
  AQUECIMENTO: "Aquecimento", NO_CELULAR: "Prática no celular", EMERGENCIA: "Guia de emergência",
};

export default async function Trilha({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const user = await exigirAluno();
  const { curso } = await searchParams;
  const cursos = await listarCursosDoAluno(user.id);

  // Com mais de um curso, a trilha vira uma porta de entrada: o aluno
  // escolhe o curso e só então vê suas etapas, sem misturar progressos.
  if (!curso && cursos.length > 1) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-titulo text-3xl font-extrabold">Meus cursos</h1>
          <p className="mt-1 text-tinta-clara">Escolha um curso para continuar sua trilha.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cursos.map((c) => (
            <Link key={c.id} href={`/app/trilha?curso=${c.id}`} className="card group block transition-all hover:border-indigo hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-soft"><IconeApp nome="trilhas" tamanho={36} /></span>
                <div className="min-w-0 flex-1"><h2 className="font-titulo text-lg font-extrabold group-hover:text-indigo">{c.titulo}</h2><p className="mt-1 line-clamp-2 text-sm text-tinta-clara">{c.subtitulo ?? "Sua formação"}</p></div>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm font-bold"><span className="text-tinta-clara">{c.totalLicoes} lições · {c.cargaHoraria}h</span><span className="text-indigo">Abrir →</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-borda"><div className="h-full rounded-full bg-grad-marca" style={{ width: `${c.progressoPct}%` }} /></div>
              <p className="mt-2 text-xs font-bold text-indigo">{c.progressoPct}% concluído</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const trilha = await carregarTrilha(user.id, curso);

  if (!trilha) {
    return (
      <div className="card text-center">
        <p className="py-8 text-tinta-clara">
          Nenhum curso publicado ainda. Volte em breve.
        </p>
      </div>
    );
  }

  if (trilha.bloqueado) {
    return (
      <AcessoBloqueado veredito={trilha.veredito} cursoTitulo={trilha.curso.titulo} />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-titulo text-3xl font-extrabold">
          Sua trilha
          <Termo slug="trilha-formacao" contexto="trilha" rotulo="Trilha" />
        </h1>
        <p className="mt-1 text-tinta-clara">
          {trilha.totalConcluidas} de {trilha.totalLicoes} lições concluídas
          <Termo slug="licao" contexto="trilha" rotulo="Lição" />
        </p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-borda">
          <div
            className="progresso-vivo h-full rounded-full bg-grad-marca transition-all duration-500"
            style={{ width: `${trilha.progressoPct}%` }}
          />
        </div>
      </div>

      <div className="space-y-10">
        {trilha.modulos.map((m, iModulo) => (
          <section key={m.id}>
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                style={{ background: m.cor + "1A" }}
              >
                <IconeApp
                  nome={ICONE_POR_ENCONTRO[iModulo] ?? "trilhas"}
                  tamanho={38}
                />
              </span>
              <div>
                <h2 className="font-titulo text-xl font-extrabold" style={{ color: m.cor }}>
                  {m.titulo}
                </h2>
                <p className="text-sm text-tinta-clara">
                  {m.subtitulo} · {m.concluidas}/{m.total}
                </p>
                {m.faixa && (
                  <p className={m.bloqueadoPorPlano ? "mt-1 text-xs font-bold text-indigo" : "mt-1 text-xs font-bold text-verde-dark"}>
                    {m.bloqueadoPorPlano ? `🔒 ${m.faixa} · Plano completo` : m.faixa}
                  </p>
                )}
              </div>
            </div>

            {m.bloqueadoPorPlano && (
              <div className="mb-4 rounded-lg border border-indigo-line bg-indigo-soft px-4 py-3 text-sm text-indigo-dark">
                {m.mensagemBloqueio}
              </div>
            )}

            <ol className="relative space-y-3 pl-6">
              {/* linha vertical conectando os nós */}
              <span
                className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-borda"
                aria-hidden="true"
              />
              {m.licoes.map((l) => {
                const bloqueada = l.status === "BLOQUEADA";
                const concluida = l.status === "CONCLUIDA";

                const no = (
                  <div className="flex items-center gap-4">
                    <span
                      className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: concluida
                          ? "#10B981"
                          : bloqueada
                            ? "#E2E8F0"
                            : m.cor + "1A",
                      }}
                    >
                      {concluida ? (
                        <span className="font-titulo text-lg font-bold text-white">✓</span>
                      ) : bloqueada ? (
                        <IconeApp nome="seguranca" tamanho={22} className="opacity-50" />
                      ) : (
                        <IconeApp nome={ICONE_POR_TIPO[l.tipo] ?? "aulas"} tamanho={28} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-titulo font-bold ${bloqueada ? "text-cinza" : "text-tinta"}`}
                      >
                        {l.titulo}
                      </p>
                      <p className="text-sm text-cinza">
                        {NOME_TIPO[l.tipo]} · {l.tempo} min · {l.xp} XP
                        {l.capitulo && ` · ${l.capitulo}`}
                      </p>
                    </div>
                    {!bloqueada && !concluida && (
                      <span className="shrink-0 font-titulo text-sm font-bold text-indigo">
                        Começar →
                      </span>
                    )}
                  </div>
                );

                return (
                  <li key={l.id}>
                    {bloqueada ? (
                      <div className="rounded-lg border-2 border-borda bg-fundo p-3 opacity-70">
                        {no}
                      </div>
                    ) : (
                      <Link
                        href={`/app/licao/${l.id}`}
                        className="block rounded-lg border-2 border-borda bg-white p-3 transition-all hover:border-indigo hover:shadow-md"
                      >
                        {no}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
