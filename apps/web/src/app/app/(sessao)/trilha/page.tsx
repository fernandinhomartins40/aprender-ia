import Link from "next/link";
import { exigirAluno, carregarTrilha } from "@/server/trilha";
import { IconeApp } from "@/components/icone-app";
import { ICONE_POR_TIPO, ICONE_POR_ENCONTRO } from "@/lib/icones-trilha";
import { AcessoBloqueado } from "@/components/acesso-bloqueado";

export const dynamic = "force-dynamic";

const NOME_TIPO: Record<string, string> = {
  TEORIA: "Leitura", QUIZ: "Quiz", DUELO: "Duelo de prompts",
  CACA_ERRO: "Caça ao erro", PROMPT: "Prática com IA",
  DESAFIO: "Desafio", CASO: "Estudo de caso", CHECKPOINT: "Checkpoint",
  AQUECIMENTO: "Aquecimento", NO_CELULAR: "Prática no celular", EMERGENCIA: "Guia de emergência",
};

export default async function Trilha() {
  const user = await exigirAluno();
  const trilha = await carregarTrilha(user.id);

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
        <h1 className="font-titulo text-3xl font-extrabold">Sua trilha</h1>
        <p className="mt-1 text-tinta-clara">
          {trilha.totalConcluidas} de {trilha.totalLicoes} lições concluídas
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
              </div>
            </div>

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
