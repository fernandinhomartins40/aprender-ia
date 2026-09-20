import Link from "next/link";
import { listarPlanos, salvarPlano, excluirPlano } from "@/server/assinaturas";
import { FormPlano } from "@/components/form-plano";
import { reais } from "@/lib/dinheiro";
import { ROTULO_PERIODO, porMes, receitaRecorrenteMensal } from "@/lib/assinaturas";
import { cursoDaUrl, cursoDoPainel, cursosDoPainel } from "@/server/curso-admin";
import { SeletorCursoAdmin } from "@/components/seletor-curso-admin";

export const dynamic = "force-dynamic";

export default async function Planos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const curso = await cursoDoPainel(cursoDaUrl(await searchParams));
  const cursos = await cursosDoPainel();
  const planos = await listarPlanos(curso?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">Planos</h1>
          <p className="mt-1 max-w-2xl text-sm text-tinta-clara">
            O que você vende, por quanto e com que periodicidade. Editar aqui
            não altera assinatura já feita.
          </p>
        </div>
      </div>

      <SeletorCursoAdmin cursos={cursos} ativo={curso?.id ?? null} base="/admin/planos" />

      <FormPlano acao={salvarPlano} />

      {planos.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">
            Nenhum plano cadastrado. Enquanto não houver plano público, a seção
            de preços não aparece na página inicial.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {planos.map((p) => {
            const mensal = porMes(p.precoCentavos, p.periodicidade);
            const mrr = receitaRecorrenteMensal(p.assinaturas);

            return (
              <div key={p.id} className="space-y-3">
                <div className="card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-titulo text-lg font-bold">{p.nome}</h2>
                        {p.gratuito && <span className="selo-indigo">Plano gratuito</span>}
                        {!p.ativo && <span className="selo-cinza">Inativo</span>}
                        {p.ativo && !p.publico && (
                          <span className="selo-amarelo">Fora da landing</span>
                        )}
                        {p.destaque && <span className="selo-verde">Destaque</span>}
                      </div>
                      {p.descricao && (
                        <p className="mt-1 text-sm text-tinta-clara">{p.descricao}</p>
                      )}
                      {/* O que o plano libera é a informação que mais
                          faltava nesta tela: sem ela, não havia como
                          saber se um plano dá acesso a alguma coisa. */}
                      <p className="mt-2 text-sm">
                        {p._count.cursos === 0 ? (
                          <span className="font-semibold text-amarelo-dark">
                            Não libera conteúdo nenhum
                          </span>
                        ) : (
                          <span className="text-tinta-clara">
                            Libera {p._count.cursos} curso(s)
                          </span>
                        )}
                      </p>

                      <p className="mt-2 font-mono text-xs text-cinza">{p.slug}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-titulo text-2xl font-extrabold text-indigo">
                        {reais(p.precoCentavos)}
                      </p>
                      <p className="text-sm text-cinza">
                        {ROTULO_PERIODO[p.periodicidade]}
                        {p.periodicidade === "UNICA" && p.diasAcesso
                          ? ` · ${p.diasAcesso} dias`
                          : mensal && p.periodicidade !== "MENSAL"
                            ? ` · ${reais(mensal)}/mês`
                            : ""}
                      </p>
                    </div>
                  </div>

                  {/* Vincular curso e módulo é o passo que faz o plano
                      existir de verdade: sem ele o aluno assina e não recebe
                      nada. Era um link de texto no meio de uma frase, e quem
                      acabava de criar um plano não encontrava.

                      Quando nada foi liberado ainda, o bloco fica em âmbar e
                      o botão sólido — é pendência, não informação. */}
                  <div
                    className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
                      p._count.cursos === 0
                        ? "border-amarelo/40 bg-amarelo-soft"
                        : "border-borda bg-fundo"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-titulo text-sm font-bold text-tinta">
                        {p._count.cursos === 0
                          ? "Este plano ainda não libera nenhum conteúdo"
                          : "Cursos e módulos liberados"}
                      </p>
                      <p className="mt-0.5 text-sm text-tinta-clara">
                        {p._count.cursos === 0
                          ? "Escolha quais cursos e módulos quem assinar vai receber."
                          : `Liberando ${p._count.cursos} curso(s). Ajuste a qualquer momento.`}
                      </p>
                    </div>
                    <Link
                      href={`/admin/planos/${p.id}`}
                      className={p._count.cursos === 0 ? "btn-primario" : "btn-secundario"}
                    >
                      {p._count.cursos === 0 ? "Definir conteúdo" : "Editar conteúdo"}
                    </Link>
                  </div>

                  <dl className="mt-4 grid gap-3 border-t border-borda pt-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-cinza">
                        Assinaturas
                      </dt>
                      <dd className="font-titulo text-lg font-bold">
                        {p._count.assinaturas}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-cinza">
                        Receita mensal
                      </dt>
                      <dd className="font-titulo text-lg font-bold">{reais(mrr)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-cinza">
                        Teste
                      </dt>
                      <dd className="font-titulo text-lg font-bold">
                        {p.diasTeste > 0 ? `${p.diasTeste} dias` : "—"}
                      </dd>
                    </div>
                  </dl>

                  {p.beneficios.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {p.beneficios.map((b, i) => (
                        <li
                          key={i}
                          className="rounded-full bg-indigo-soft px-3 py-1 text-xs text-indigo-dark"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 border-t border-borda pt-4">
                    <form action={excluirPlano}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="text-sm font-bold text-vermelho-dark hover:underline"
                      >
                        {p._count.assinaturas > 0
                          ? "Desativar plano"
                          : "Excluir plano"}
                      </button>
                      {p._count.assinaturas > 0 && (
                        <span className="ml-2 text-xs text-cinza">
                          (tem assinaturas — só pode ser desativado, para não
                          apagar o histórico de quem pagou)
                        </span>
                      )}
                    </form>
                  </div>
                </div>

                <details className="card">
                  <summary className="cursor-pointer font-titulo text-sm font-bold text-indigo">
                    Editar “{p.nome}”
                  </summary>
                  <div className="mt-4">
                    <FormPlano
                      acao={salvarPlano}
                      plano={{
                        id: p.id,
                        nome: p.nome,
                        descricao: p.descricao,
                        precoCentavos: p.precoCentavos,
                        periodicidade: p.periodicidade,
                        diasAcesso: p.diasAcesso,
                        diasFree: p.diasFree,
                        diasTeste: p.diasTeste,
                        gratuito: p.gratuito,
                        ativo: p.ativo,
                        publico: p.publico,
                        destaque: p.destaque,
                        ordem: p.ordem,
                        beneficios: p.beneficios,
                      }}
                    />
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
