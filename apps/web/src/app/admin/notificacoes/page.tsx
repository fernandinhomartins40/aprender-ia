import { prisma } from "@aprender/db";
import {
  listarNotificacoes,
  enviarNotificacao,
  confirmarEnvioWhatsApp,
} from "@/server/notificacoes";
import { exigirAdmin } from "@/server/admin";
import { FormNotificacao } from "@/components/form-notificacao";
import { AvisoWhatsApp } from "@/components/aviso-whatsapp";
import { dataBR } from "@/lib/dinheiro";

export const dynamic = "force-dynamic";

export default async function Notificacoes({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  await exigirAdmin();
  const params = await searchParams;
  const pagina = Math.max(1, Number(params.pagina ?? 1) || 1);

  const [{ registros, total, paginas, indisponivel }, alunos, turmas] = await Promise.all([
    listarNotificacoes(pagina),
    prisma.user.findMany({
      where: { papel: "ALUNO" },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, email: true, telefone: true },
    }),
    prisma.cohort.findMany({
      orderBy: { criadoEm: "desc" },
      select: { id: true, nome: true, _count: { select: { membros: true } } },
    }),
  ]);

  const semEmail = registros.filter(
    (r) => r.status === "REGISTRADA" && r.erro && r.user.telefone,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-titulo text-3xl font-extrabold">Notificações</h1>
        <p className="mt-1 text-tinta-clara">
          Mensagens enviadas aos alunos — pelo painel, por e-mail e por WhatsApp.
        </p>
      </div>

      {indisponivel ? (
        <div className="card">
          <p className="text-tinta-clara">
            A tabela de notificações ainda não existe no banco. Se o deploy
            acabou de rodar, recarregue em alguns instantes.
          </p>
        </div>
      ) : (
        <>
          <FormNotificacao
            acao={enviarNotificacao}
            alunos={alunos}
            turmas={turmas.map((t) => ({
              id: t.id,
              nome: t.nome,
              inscritos: t._count.membros,
            }))}
          />

          {/* Estes são os casos em que a plataforma não alcança a pessoa
              sozinha: sem e-mail real, o WhatsApp é o único caminho. */}
          {semEmail.length > 0 && (
            <section className="rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-4">
              <p className="font-titulo font-bold text-amarelo-dark">
                {semEmail.length} mensagem(ns) precisam do seu WhatsApp
              </p>
              <p className="mt-1 text-sm text-amarelo-dark">
                Estes alunos se cadastraram só com telefone e não têm e-mail
                para receber. Abra a conversa, envie e marque como enviada.
              </p>
              <ul className="mt-3 space-y-2">
                {semEmail.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold">{r.user.nome}</p>
                      <p className="text-sm text-cinza">
                        {r.titulo} · {dataBR(r.criadoEm)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <AvisoWhatsApp
                        telefone={r.user.telefone}
                        titulo={r.titulo}
                        corpo={r.corpo}
                      />
                      <form action={confirmarEnvioWhatsApp}>
                        <input type="hidden" name="notificationId" value={r.id} />
                        <button
                          type="submit"
                          className="rounded-md border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta-clara hover:border-verde hover:text-verde-dark"
                        >
                          Marcar enviada
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-4 font-titulo text-xl font-bold">
              Histórico {total > 0 && <span className="text-cinza">({total})</span>}
            </h2>

            {registros.length === 0 ? (
              <div className="card text-center">
                <p className="py-8 text-cinza">Nenhuma mensagem enviada ainda.</p>
              </div>
            ) : (
              <div className="card overflow-x-auto p-0">
                <table className="tabela-responsiva">
                  <thead className="border-b border-borda bg-indigo-soft">
                    <tr className="font-titulo text-sm text-indigo-dark">
                      <th className="p-4">Quando</th>
                      <th className="p-4">Aluno</th>
                      <th className="p-4">Mensagem</th>
                      <th className="p-4">Canal</th>
                      <th className="p-4">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r) => (
                      <tr key={r.id} className="border-b border-borda align-top last:border-0">
                        <td data-rotulo="Quando" className="p-4 text-sm whitespace-nowrap">
                          {dataBR(r.criadoEm)}
                          <div className="text-cinza">
                            {new Date(r.criadoEm).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td data-rotulo="Aluno" className="p-4 text-sm">
                          <div className="font-bold">{r.user.nome}</div>
                          <div className="text-cinza">
                            {r.user.telefone ?? r.user.email}
                          </div>
                        </td>
                        <td data-rotulo="Mensagem" className="p-4 text-sm">
                          <div className="font-bold">{r.titulo}</div>
                          <div className="line-clamp-2 text-cinza">{r.corpo}</div>
                          {r.autorNome && (
                            <div className="mt-1 text-xs text-cinza">
                              por {r.autorNome}
                            </div>
                          )}
                        </td>
                        <td data-rotulo="Canal" className="p-4 text-sm">
                          {r.canal === "EMAIL"
                            ? "E-mail"
                            : r.canal === "WHATSAPP"
                              ? "WhatsApp"
                              : "Painel"}
                        </td>
                        <td data-rotulo="Situação" className="p-4">
                          <SeloStatus status={r.status} erro={r.erro} />
                          {r.lidoEm && (
                            <div className="mt-1 text-xs text-verde-dark">
                              lida em {dataBR(r.lidoEm)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {paginas > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Paginação">
                {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/admin/notificacoes?pagina=${p}`}
                    aria-current={p === pagina ? "page" : undefined}
                    className={`rounded-md px-3.5 py-2 font-titulo text-sm font-bold ${
                      p === pagina
                        ? "bg-indigo text-white"
                        : "border-2 border-borda text-tinta-clara hover:border-indigo"
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </nav>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SeloStatus({ status, erro }: { status: string; erro: string | null }) {
  if (status === "ENVIADA") return <span className="selo-verde">Enviada</span>;
  if (status === "REGISTRADA")
    return (
      <>
        <span className="selo-cinza">No painel</span>
        {erro && <div className="mt-1 text-xs text-amarelo-dark">{erro}</div>}
      </>
    );
  if (status === "FALHOU")
    return (
      <>
        <span className="selo-vermelho">Falhou</span>
        {erro && <div className="mt-1 text-xs text-vermelho-dark">{erro}</div>}
      </>
    );
  return <span className="selo-amarelo">Pendente</span>;
}
