import Link from "next/link";
import { listarAuditoria } from "@/server/auditoria";
import { exigirAdmin } from "@/server/admin";

export const dynamic = "force-dynamic";

const ENTIDADES = ["User", "Cohort", "Payment", "PlatformSetting", "CohortMeeting"];

export default async function Auditoria({
  searchParams,
}: {
  searchParams: Promise<{ acao?: string; entidade?: string; pagina?: string }>;
}) {
  await exigirAdmin();
  const params = await searchParams;

  const { registros, total, paginas, pagina, acoesDisponiveis } = await listarAuditoria({
    acao: params.acao,
    entidade: params.entidade,
    pagina: Number(params.pagina ?? 1) || 1,
  });

  function comFiltro(extra: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    const base = { acao: params.acao, entidade: params.entidade, ...extra };
    for (const [k, v] of Object.entries(base)) if (v) q.set(k, v);
    const s = q.toString();
    return `/admin/auditoria${s ? `?${s}` : ""}`;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Histórico de ações</h1>
        <p className="mt-1 text-tinta-clara">
          {total.toLocaleString("pt-BR")} ação(ões) registrada(s). Quem alterou o
          quê, quando — e de onde.
        </p>
      </div>

      {/* Filtros em uma linha, acima da lista. */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-borda pb-4">
        <Link
          href="/admin/auditoria"
          className={`rounded-md px-3.5 py-2 font-titulo text-sm font-bold ${
            !params.acao && !params.entidade
              ? "bg-indigo text-white"
              : "border-2 border-borda text-tinta-clara hover:border-indigo"
          }`}
        >
          Tudo
        </Link>

        {ENTIDADES.map((e) => (
          <Link
            key={e}
            href={comFiltro({ entidade: params.entidade === e ? undefined : e, pagina: undefined })}
            className={`rounded-md px-3.5 py-2 font-titulo text-sm font-bold ${
              params.entidade === e
                ? "bg-indigo text-white"
                : "border-2 border-borda text-tinta-clara hover:border-indigo"
            }`}
          >
            {e === "User"
              ? "Alunos"
              : e === "Cohort"
                ? "Turmas"
                : e === "Payment"
                  ? "Pagamentos"
                  : e === "PlatformSetting"
                    ? "Configurações"
                    : "Encontros"}
          </Link>
        ))}
      </div>

      {acoesDisponiveis.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {acoesDisponiveis.slice(0, 12).map((a) => (
            <Link
              key={a.acao}
              href={comFiltro({ acao: params.acao === a.acao ? undefined : a.acao, pagina: undefined })}
              className={`rounded-full px-3 py-1 font-mono text-xs ${
                params.acao === a.acao
                  ? "bg-indigo text-white"
                  : "bg-indigo-soft text-indigo-dark hover:bg-indigo-line"
              }`}
            >
              {a.acao} · {a.usos}
            </Link>
          ))}
        </div>
      )}

      {registros.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">
            Nenhuma ação registrada com esse filtro. O histórico começa a partir
            das próximas alterações feitas no painel.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="tabela-responsiva">
            <thead className="border-b border-borda bg-indigo-soft">
              <tr className="font-titulo text-sm text-indigo-dark">
                <th className="p-4">Quando</th>
                <th className="p-4">Quem</th>
                <th className="p-4">Ação</th>
                <th className="p-4">O que aconteceu</th>
                <th className="p-4">Origem</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="border-b border-borda last:border-0">
                  <td data-rotulo="Quando" className="p-4 text-sm tabular-nums text-tinta-clara">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(r.criadoEm)}
                  </td>
                  <td data-rotulo="Quem" className="p-4 text-sm font-bold">
                    {r.atorNome}
                  </td>
                  <td data-rotulo="Ação" className="p-4">
                    <span className="rounded-full bg-indigo-soft px-2.5 py-1 font-mono text-xs text-indigo-dark">
                      {r.acao}
                    </span>
                  </td>
                  <td data-rotulo="O que aconteceu" className="p-4 text-sm text-tinta-clara">
                    {r.resumo}
                  </td>
                  <td data-rotulo="Origem" className="p-4 font-mono text-xs text-cinza">
                    {r.ip ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paginas > 1 && (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Paginação">
          {Array.from({ length: Math.min(paginas, 20) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={comFiltro({ pagina: String(p) })}
              aria-current={p === pagina ? "page" : undefined}
              className={`rounded-md px-3.5 py-2 font-titulo text-sm font-bold ${
                p === pagina
                  ? "bg-indigo text-white"
                  : "border-2 border-borda text-tinta-clara hover:border-indigo"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
