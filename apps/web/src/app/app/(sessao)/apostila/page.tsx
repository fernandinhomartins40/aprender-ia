import Link from "next/link";
import { sumarioDaApostila } from "@/server/apostila";
import { BaixarApostila } from "@/components/baixar-apostila";
import { exigirAluno } from "@/server/trilha";
import { cursosDoAluno, resolverCursoAtivo } from "@/server/curso-ativo";
import { SeletorCurso } from "@/components/seletor-curso";
import { APOSTILA_PDF } from "@/lib/cursos";

export const metadata = { title: "Apostila do curso" };

export default async function PaginaApostila({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const user = await exigirAluno();
  const { curso: cursoPedido } = await searchParams;
  const curso = await resolverCursoAtivo(user.id, cursoPedido);
  const [capitulos, cursos] = await Promise.all([
    sumarioDaApostila(curso?.id),
    cursosDoAluno(user.id),
  ]);

  return (
    // Sem padding lateral próprio: o layout do aplicativo já dá o dele, e
    // somar os dois tirava 64px dos 390 de um celular — o texto ficava com
    // 267px de largura útil.
    <main className="mx-auto max-w-3xl py-6">
      <SeletorCurso cursos={cursos} ativo={curso?.id ?? null} base="/app/apostila" />
      <h1 className="mb-1 font-titulo text-2xl font-extrabold text-tinta">
        Apostila do curso
      </h1>
      <p className="mb-5 text-tinta-clara">
        O material de consulta, para ler aqui mesmo. As aulas não repetem a
        apostila: quando um assunto merece mais fôlego, a lição aponta o
        capítulo certo.
      </p>

      <BaixarApostila arquivo={APOSTILA_PDF(curso?.slug)} />

      <ol className="mt-6 space-y-3">
        {capitulos.map((c) => (
          <li key={c.chave}>
            <Link
              href={`/app/apostila/${c.chave}`}
              className="block rounded-xl border border-borda bg-white p-4 transition-colors hover:bg-indigo-soft"
            >
              <div className="flex items-start gap-3">
                <span aria-hidden className="text-2xl leading-none">
                  {c.icone}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-titulo font-bold text-tinta">{c.titulo}</p>
                  {c.secoes.length > 0 && (
                    <p className="mt-0.5 text-sm text-cinza">
                      {c.secoes.length} seç{c.secoes.length === 1 ? "ão" : "ões"}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
