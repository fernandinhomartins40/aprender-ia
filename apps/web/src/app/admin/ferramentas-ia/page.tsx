import { exigirAdmin } from "@/server/admin";
import { excluirFerramenta, salvarFerramenta } from "@/server/ferramentas-ia";
import {
  cursoDaUrl,
  cursoDoPainel,
  cursosDoPainel,
  doCursoAdmin,
} from "@/server/curso-admin";
import { SeletorCursoAdmin } from "@/components/seletor-curso-admin";
import { prisma } from "@aprender/db";

export const dynamic = "force-dynamic";

type Ferramenta = Awaited<ReturnType<typeof prisma.aiTool.findMany>>[number];

function Formulario({
  ferramenta,
  cursos,
}: {
  ferramenta?: Ferramenta;
  cursos: { id: string; titulo: string }[];
}) {
  return (
    <form
      action={salvarFerramenta}
      className="grid gap-2 rounded-lg border border-borda p-4 md:grid-cols-2"
    >
      <input type="hidden" name="id" value={ferramenta?.id ?? ""} />
      <input
        className="campo"
        name="nome"
        required
        defaultValue={ferramenta?.nome}
        placeholder="Nome"
      />
      <input
        className="campo"
        name="chave"
        required
        defaultValue={ferramenta?.chave}
        placeholder="chave-unica"
      />
      <input
        className="campo"
        name="categoria"
        defaultValue={ferramenta?.categoria ?? ""}
        placeholder="Categoria"
      />
      <input
        className="campo"
        name="ordem"
        type="number"
        min="0"
        defaultValue={ferramenta?.ordem ?? 0}
        placeholder="Ordem"
      />
      <input
        className="campo md:col-span-2"
        name="url"
        type="url"
        required
        defaultValue={ferramenta?.url}
        placeholder="https://... (acesso)"
      />
      <input
        className="campo md:col-span-2"
        name="urlCadastro"
        type="url"
        defaultValue={ferramenta?.urlCadastro ?? ""}
        placeholder="https://... (cadastro, opcional)"
      />
      <textarea
        className="campo md:col-span-2"
        name="descricao"
        defaultValue={ferramenta?.descricao}
        placeholder="Como ela ajuda o aluno"
      />

      {/* Vazio = vale para todos os cursos. É como o acervo de Educadores
          entrou no banco, e o padrão certo para uma ferramenta genérica. */}
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block font-bold">Curso</span>
        <select
          name="courseId"
          defaultValue={ferramenta?.courseId ?? ""}
          className="campo"
        >
          <option value="">Todos os cursos</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titulo}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input name="ativo" type="checkbox" defaultChecked={ferramenta?.ativo ?? true} />{" "}
        Disponível para alunos
      </label>
      <button className="btn-primario justify-self-start">
        {ferramenta ? "Salvar" : "Adicionar ferramenta"}
      </button>
    </form>
  );
}

export default async function FerramentasAdmin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirAdmin();

  const curso = await cursoDoPainel(cursoDaUrl(await searchParams));
  const cursos = await cursosDoPainel();

  const ferramentas = await prisma.aiTool.findMany({
    where: doCursoAdmin(curso),
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">
          Catálogo de ferramentas de IA
        </h1>
        <p className="mt-1 text-tinta-clara">
          URLs, cadastro, ordem e disponibilidade são administrados daqui.
        </p>
      </div>

      <SeletorCursoAdmin
        cursos={cursos}
        ativo={curso?.id ?? null}
        base="/admin/ferramentas-ia"
      />

      <div className="card mb-6">
        <h2 className="mb-3 font-titulo text-lg font-bold">Nova ferramenta</h2>
        <Formulario cursos={cursos} />
      </div>

      <div className="space-y-4">
        {ferramentas.map((f) => (
          <div key={f.id} className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-titulo font-bold">{f.nome}</h2>
              <form action={excluirFerramenta}>
                <input type="hidden" name="id" value={f.id} />
                <button className="text-sm font-bold text-vermelho-dark">Excluir</button>
              </form>
            </div>
            <Formulario ferramenta={f} cursos={cursos} />
          </div>
        ))}
      </div>
    </div>
  );
}
