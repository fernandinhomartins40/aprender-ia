import { prisma } from "@aprender/db";
import { gerarRelatorio, type FiltroRelatorio } from "@/server/relatorios";
import { exigirAdmin } from "@/server/admin";
import { cursoDoPainel, cursosDoPainel } from "@/server/curso-admin";

export const dynamic = "force-dynamic";

const TIPOS: { valor: FiltroRelatorio["tipo"]; rotulo: string; ajuda: string }[] = [
  { valor: "alunos", rotulo: "Alunos", ajuda: "Cadastro, plano, turma e último acesso." },
  { valor: "financeiro", rotulo: "Financeiro", ajuda: "Cobranças, pagamentos e atrasos." },
  { valor: "progresso", rotulo: "Progresso", ajuda: "Quanto cada aluno avançou na trilha." },
  { valor: "presenca", rotulo: "Presença", ajuda: "Chamada por encontro de cada turma." },
];

const SITUACOES: Record<string, { valor: string; rotulo: string }[]> = {
  alunos: [
    { valor: "", rotulo: "Todos" },
    { valor: "ativos", rotulo: "Ativos" },
    { valor: "inativos", rotulo: "Inativos" },
    { valor: "premium", rotulo: "Premium" },
    { valor: "free", rotulo: "Gratuito" },
    { valor: "suspensos", rotulo: "Suspensos" },
  ],
  financeiro: [
    { valor: "", rotulo: "Todas" },
    { valor: "pago", rotulo: "Pagas" },
    { valor: "pendente", rotulo: "A receber" },
    { valor: "atrasado", rotulo: "Em atraso" },
    { valor: "cancelado", rotulo: "Canceladas" },
  ],
};

export default async function Relatorios({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    turmaId?: string;
    curso?: string;
    desde?: string;
    ate?: string;
    situacao?: string;
  }>;
}) {
  await exigirAdmin();
  const params = await searchParams;

  const curso = await cursoDoPainel(params.curso);
  const cursos = await cursosDoPainel();

  const tipo = (TIPOS.find((t) => t.valor === params.tipo)?.valor ??
    "alunos") as FiltroRelatorio["tipo"];

  const filtro: FiltroRelatorio = {
    tipo,
    turmaId: params.turmaId || undefined,
    cursoId: curso?.id,
    desde: params.desde || undefined,
    ate: params.ate || undefined,
    situacao: params.situacao || undefined,
  };

  const [relatorio, turmas] = await Promise.all([
    gerarRelatorio(filtro),
    prisma.cohort.findMany({
      // A lista de turmas segue o curso escolhido: oferecer turma de outro
      // curso produziria um cruzamento que devolve sempre zero linhas.
      where: curso ? { courseId: curso.id } : {},
      orderBy: { criadoEm: "desc" },
      select: { id: true, nome: true },
    }),
  ]);

  const situacoes = SITUACOES[tipo];
  const parametrosCSV = new URLSearchParams(
    Object.entries({
      ...filtro,
      // Na URL o curso se chama `curso`, como nas demais telas do painel;
      // no filtro ele é `cursoId`. Sem esta troca o CSV ignoraria o recorte.
      cursoId: undefined,
      curso: curso?.id,
    }).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">Relatórios</h1>
        <p className="mt-1 max-w-2xl text-sm text-tinta-clara">
          Listas filtradas, para consultar na tela ou abrir no Excel.
        </p>
      </div>

      {/* ---- Filtros ---- */}
      <form className="card grid gap-4 md:grid-cols-6">
        <label className="md:col-span-2">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Relatório
          </span>
          <select name="tipo" defaultValue={tipo} className="campo w-full">
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.rotulo} — {t.ajuda}
              </option>
            ))}
          </select>
        </label>

        {/* Curso entra como campo do formulário, e não como as abas usadas
            nas outras telas: aqui ele convive com período e situação, e um
            link solto descartaria o que já estava preenchido. */}
        {cursos.length > 1 && (
          <label>
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Curso
            </span>
            <select name="curso" defaultValue={curso?.id ?? ""} className="campo w-full">
              <option value="">Todos</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                  {!c.publicado ? " (rascunho)" : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Turma</span>
          <select name="turmaId" defaultValue={filtro.turmaId ?? ""} className="campo w-full">
            <option value="">Todas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>

        {situacoes && (
          <label>
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Situação
            </span>
            <select name="situacao" defaultValue={filtro.situacao ?? ""} className="campo w-full">
              {situacoes.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </select>
          </label>
        )}

        {tipo !== "presenca" && tipo !== "progresso" && (
          <>
            <label>
              <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
                De
              </span>
              <input
                type="date"
                name="desde"
                defaultValue={filtro.desde ?? ""}
                className="campo w-full"
              />
            </label>
            <label>
              <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
                Até
              </span>
              <input
                type="date"
                name="ate"
                defaultValue={filtro.ate ?? ""}
                className="campo w-full"
              />
            </label>
          </>
        )}

        <div className="flex items-end gap-2 md:col-span-6">
          <button type="submit" className="btn-primario">
            Gerar relatório
          </button>
          {relatorio.linhas.length > 0 && (
            <a
              href={`/admin/relatorios/csv?${parametrosCSV}`}
              className="btn-secundario"
              download
            >
              Baixar CSV
            </a>
          )}
        </div>
      </form>

      {/* ---- Resumo ---- */}
      {relatorio.resumo.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatorio.resumo.map((r) => (
            <div key={r.rotulo} className="rounded-xl bg-indigo-soft p-5">
              <p className="font-titulo text-sm font-bold uppercase tracking-wide text-indigo-dark opacity-80">
                {r.rotulo}
              </p>
              <p className="mt-2 font-titulo text-2xl font-extrabold text-indigo-dark">
                {r.valor}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ---- Tabela ---- */}
      {relatorio.linhas.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">
            Nenhum registro para esse filtro.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <p className="border-b border-borda px-4 py-3 text-sm text-cinza">
            {relatorio.linhas.length} linha(s)
          </p>
          <table className="w-full text-sm">
            <thead className="border-b border-borda bg-indigo-soft">
              <tr className="font-titulo text-indigo-dark">
                {relatorio.colunas.map((c) => (
                  <th key={c} className="whitespace-nowrap p-3 text-left">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {relatorio.linhas.map((l, i) => (
                <tr key={i} className="border-b border-borda last:border-0">
                  {relatorio.colunas.map((c) => (
                    <td key={c} className="whitespace-nowrap p-3">
                      {l[c] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
