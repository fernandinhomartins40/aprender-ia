import Link from "next/link";
import { sumarioDaApostila } from "@/server/apostila";
import { BaixarApostila } from "@/components/baixar-apostila";

export const metadata = { title: "Apostila do curso" };

export default async function PaginaApostila() {
  const capitulos = await sumarioDaApostila();

  return (
    <main className="mx-auto max-w-3xl px-5 py-6">
      <h1 className="mb-1 font-titulo text-2xl font-extrabold text-tinta">
        Apostila do curso
      </h1>
      <p className="mb-5 text-tinta-clara">
        O material completo, para ler aqui mesmo. Durante a aula, o botão
        <span className="font-bold"> Ler na apostila</span> leva direto ao
        trecho que o professor está mostrando.
      </p>

      <BaixarApostila />

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
