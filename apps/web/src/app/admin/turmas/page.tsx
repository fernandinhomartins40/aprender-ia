import Link from "next/link";
import { listarTurmas, listarInstrutores, exigirAdmin } from "@/server/admin";
import { cursoDaUrl, cursoDoPainel, cursosDoPainel } from "@/server/curso-admin";
import { SeletorCursoAdmin } from "@/components/seletor-curso-admin";
import { salvarTurma } from "@/server/turmas";
import { NovaTurma } from "@/components/painel-turma";
import { dataCurta, faixaHoraria, proximoEncontro } from "@/lib/datas";

export const dynamic = "force-dynamic";

const SELO_SITUACAO: Record<string, { classe: string; rotulo: string }> = {
  RASCUNHO: { classe: "selo-cinza", rotulo: "Rascunho" },
  INSCRICOES_ABERTAS: { classe: "selo-verde", rotulo: "Inscrições abertas" },
  EM_ANDAMENTO: { classe: "selo-indigo", rotulo: "Em andamento" },
  CONCLUIDA: { classe: "selo-cinza", rotulo: "Concluída" },
  CANCELADA: { classe: "selo-vermelho", rotulo: "Cancelada" },
};

const ROTULO_MODALIDADE: Record<string, string> = {
  ONLINE: "Online",
  PRESENCIAL: "Presencial",
  HIBRIDA: "Híbrida",
};

export default async function Turmas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirAdmin();

  const curso = await cursoDoPainel(cursoDaUrl(await searchParams));

  const [turmas, cursos, instrutores] = await Promise.all([
    listarTurmas(curso?.id),
    // Todos os cursos: a lista alimenta o seletor e os formulários de
    // edição, que precisam poder mover a turma para outro curso.
    cursosDoPainel(),
    listarInstrutores(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">Turmas</h1>
          <p className="mt-1 max-w-2xl text-sm text-tinta-clara">
            Cada turma tem cronograma, local e código de matrícula próprios. Para
            cadastrar alunos, use{" "}
            <Link href="/admin/alunos" className="font-bold text-indigo hover:underline">
              Alunos e turmas
            </Link>
            .
          </p>
        </div>
        {/* Página própria em vez do formulário recolhido: o cadastro tem
            cronograma, local e encontros, e merece uma rota para onde se
            possa mandar um link. */}
        <Link href="/admin/turmas/nova" className="btn-primario text-sm">
          Nova turma
        </Link>
      </div>

      <SeletorCursoAdmin cursos={cursos} ativo={curso?.id ?? null} base="/admin/turmas" />

      {turmas.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">
            {cursos.length === 0
              ? "Cadastre um curso antes de criar turmas."
              : "Nenhuma turma criada ainda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {turmas.map((t) => {
            const selo = SELO_SITUACAO[t.situacao] ?? SELO_SITUACAO.RASCUNHO!;
            const proximo = proximoEncontro(
              t.encontros.map((e) => ({ ...e, data: new Date(e.data) })),
            );
            const ativos = t.encontros.filter((e) => !e.canceladoEm).length;
            const lotada = t.vagas != null && t._count.membros >= t.vagas;

            return (
              <Link
                key={t.id}
                href={`/admin/turmas/${t.id}`}
                className="card transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-titulo text-lg font-extrabold">
                      {t.nome}
                    </h2>
                    <p className="truncate text-sm text-tinta-clara">
                      {t.course.titulo}
                    </p>
                  </div>
                  <span className={selo.classe}>{selo.rotulo}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="selo-cinza">
                    {ROTULO_MODALIDADE[t.modalidade] ?? t.modalidade}
                  </span>
                  <span className={lotada ? "selo-amarelo" : "selo-cinza"}>
                    {t._count.membros}
                    {t.vagas != null ? `/${t.vagas}` : ""} aluno(s)
                    {lotada ? " · lotada" : ""}
                  </span>
                  <span className="selo-cinza">
                    {ativos} encontro{ativos === 1 ? "" : "s"}
                  </span>
                </div>

                {t.modalidade !== "ONLINE" && t.local && (
                  <p className="mt-3 truncate text-sm text-cinza">
                    {[t.local, t.cidade].filter(Boolean).join(" · ")}
                  </p>
                )}

                {proximo ? (
                  <p className="mt-3 rounded-md bg-indigo-soft px-3 py-2 text-sm text-indigo-dark">
                    <strong>Próximo encontro:</strong> {dataCurta(proximo.data)}
                    {faixaHoraria(proximo.horaInicio, proximo.horaFim)
                      ? ` · ${faixaHoraria(proximo.horaInicio, proximo.horaFim)}`
                      : ""}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-cinza">
                    {ativos === 0
                      ? "Nenhum encontro marcado."
                      : "Todos os encontros já aconteceram."}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-borda pt-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-cinza">
                      Código de matrícula
                    </p>
                    <p className="font-mono text-lg font-bold tracking-widest text-indigo">
                      {t.codigo}
                    </p>
                  </div>
                  {t.instrutor && (
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-cinza">
                        Instrutor
                      </p>
                      <p className="text-sm font-bold">{t.instrutor.nome}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
