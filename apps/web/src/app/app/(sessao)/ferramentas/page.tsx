import Link from "next/link";
import { exigirAluno } from "@/server/trilha";
import { ferramentasAtivas } from "@/server/ferramentas-ia";
import { IconeApp } from "@/components/icone-app";
import { Termo } from "@/components/termo";

export const dynamic = "force-dynamic";

export default async function Ferramentas() {
  await exigirAluno();
  const ferramentas = await ferramentasAtivas();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">
          Ferramentas de IA
          <Termo slug="ferramenta-ia" contexto="ferramentas" rotulo="Ferramenta de IA" />
        </h1>
        <p className="mt-1 text-tinta-clara">
          Acesse as ferramentas recomendadas e confira sempre o resultado antes de usar.
          <Termo slug="alucinacao" contexto="ferramentas" rotulo="Alucinação da IA" />
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ferramentas.map((f) => (
          <article key={f.id} className="card flex flex-col">
            <div className="flex items-start gap-3">
              <IconeApp nome="ferramentas" tamanho={38} />
              <div>
                <p className="font-titulo text-lg font-extrabold">{f.nome}</p>
                <p className="text-sm font-semibold text-indigo">{f.categoria}</p>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-tinta-clara">{f.descricao}</p>
            <div className="mt-4 flex gap-3">
              <a className="btn-primario text-sm" href={f.url} target="_blank" rel="noopener noreferrer">
                Abrir ferramenta
              </a>
              {f.urlCadastro && (
                <a className="btn-secundario text-sm" href={f.urlCadastro} target="_blank" rel="noopener noreferrer">
                  Criar conta
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-borda bg-white p-4 text-sm text-tinta-clara">
        Vai usar um material da escola? Remova dados identificáveis de estudantes antes de
        colar qualquer texto.
        <Termo slug="anonimizacao" contexto="ferramentas" rotulo="Anonimização" />
        {" "}O uso ético dessas ferramentas na escola envolve também transparência e
        atenção a vieses.
        <Termo slug="etica-ia" contexto="ferramentas" rotulo="Uso ético de IA" />
        {" "}
        <Link href="/app/trilha" className="font-bold text-indigo">
          Rever privacidade na trilha
        </Link>
        .
      </div>
    </div>
  );
}
