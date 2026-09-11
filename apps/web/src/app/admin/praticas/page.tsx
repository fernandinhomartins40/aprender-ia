import Link from "next/link";
import { listarPraticas } from "@/server/praticas";

export const dynamic = "force-dynamic";

/**
 * O que a turma está escrevendo de verdade.
 *
 * O painel media presença (lições concluídas) e não prática. Esta tela
 * mostra o texto real que cada professor escreveu nas atividades e em
 * qual das quatro letras ele parou — que é a informação que muda o
 * próximo encontro presencial.
 *
 * Deliberadamente não há nota nem ranking. O objetivo é enxergar onde a
 * formação precisa insistir, não classificar quem escreve melhor: uma
 * lista ordenada por desempenho mudaria o que as pessoas escrevem.
 */
export default async function Praticas() {
  const { respostas, total, lacunas, completas } = await listarPraticas();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-2xl font-extrabold">Práticas</h1>
        <p className="mt-1 text-tinta-clara">
          Os prompts que os professores escreveram nas atividades, com a
          análise que cada um recebeu na hora.
        </p>
      </div>

      {respostas.length === 0 ? (
        <div className="card text-center">
          <p className="py-10 text-cinza">
            Ainda não há respostas escritas. Elas aparecem aqui assim que
            alguém usar o botão “Analisar a minha versão” numa atividade.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="card">
              <p className="text-sm text-cinza">Respostas registradas</p>
              <p className="mt-1 font-titulo text-3xl font-extrabold text-indigo">
                {total}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-cinza">Com as 4 letras</p>
              <p className="mt-1 font-titulo text-3xl font-extrabold text-verde">
                {completas}
                <span className="text-base font-bold text-cinza">
                  {" "}
                  de {respostas.length}
                </span>
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-cinza">Letra que mais falta</p>
              <p className="mt-1 font-titulo text-3xl font-extrabold text-laranja">
                {lacunas[0]?.rotulo ?? "—"}
              </p>
              {lacunas[0] && (
                <p className="text-sm text-cinza">
                  em {lacunas[0].quantas} resposta(s)
                </p>
              )}
            </div>
          </div>

          {lacunas.length > 0 && (
            <div className="card mb-6">
              <h2 className="font-titulo font-bold">Onde a turma trava</h2>
              <p className="mt-1 text-sm text-tinta-clara">
                Quantas respostas recentes deixaram cada letra de fora. Serve
                para escolher o que reforçar no próximo encontro.
              </p>
              <div className="mt-4 space-y-3">
                {lacunas.map((l) => {
                  const pct = Math.round((l.quantas / respostas.length) * 100);
                  return (
                    <div key={l.rotulo}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-titulo font-bold">{l.rotulo}</span>
                        <span className="text-cinza">
                          {l.quantas} ({pct}%)
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-borda">
                        <div
                          className="h-full rounded-full bg-laranja"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {respostas.map((r) => (
              <div key={r.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-titulo font-bold">{r.aluno.nome}</p>
                    <p className="text-sm text-cinza">
                      {r.licao.titulo}
                      {r.aluno.escola ? ` · ${r.aluno.escola}` : ""}
                    </p>
                  </div>
                  <span
                    className={`selo ${
                      r.completas === 4
                        ? "bg-verde-soft text-verde-dark"
                        : r.completas >= 2
                          ? "bg-amarelo-soft text-amarelo-dark"
                          : "bg-borda text-tinta-clara"
                    }`}
                  >
                    {r.completas} de 4 letras
                  </span>
                </div>

                <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-prompt-bg p-4 font-mono text-sm text-prompt-txt">
                  {r.texto}
                </pre>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  {r.faltando.length > 0 ? (
                    <>
                      <span className="text-cinza">Faltou:</span>
                      {r.faltando.map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-laranja-soft px-2 py-0.5 font-titulo text-xs font-bold text-laranja-dark"
                        >
                          {f}
                        </span>
                      ))}
                    </>
                  ) : (
                    <span className="text-verde-dark">
                      As quatro letras presentes.
                    </span>
                  )}
                  {r.tentativa > 1 && (
                    <span className="ml-auto text-xs text-cinza">
                      reescreveu {r.tentativa}×
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {total > respostas.length && (
            <p className="mt-6 text-center text-sm text-cinza">
              Mostrando as {respostas.length} mais recentes de {total}.
            </p>
          )}
        </>
      )}

      <div className="mt-8">
        <Link href="/admin" className="btn-fantasma">
          ← Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
