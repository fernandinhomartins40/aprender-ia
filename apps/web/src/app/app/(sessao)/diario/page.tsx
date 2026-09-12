import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { registrarDiario } from "@/server/acoes";
import { LISTA_FERRAMENTAS } from "@aprender/ai-launcher";
import { Termo } from "@/components/termo";

export const dynamic = "force-dynamic";

export default async function Diario() {
  const user = await exigirAluno();
  const registros = await prisma.diaryEntry.findMany({
    where: { userId: user.id },
    orderBy: { registradoEm: "desc" },
    take: 30,
  });

  const total = registros.reduce(
    (s, r) => s + Math.max(0, (r.minutosAntes ?? 0) - (r.minutosAgora ?? 0)),
    0,
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">
          Diário de bordo
          <Termo slug="diario-bordo" contexto="diario" rotulo="Diário de bordo" />
        </h1>
        <p className="mt-1 text-tinta-clara">
          Quanto tempo a IA te devolveu. Este registro é só seu.
          <Termo slug="privacidade" contexto="diario" rotulo="Privacidade de estudantes" />
        </p>
      </div>

      {total > 0 && (
        <div className="mb-6 rounded-lg bg-verde-soft p-5 text-center">
          <p className="font-titulo text-2xl font-extrabold text-verde-dark">
            {Math.floor(total / 60)}h {total % 60}min economizados
          </p>
          <p className="mt-1 text-verde-dark">no total dos seus registros</p>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="font-titulo text-lg font-bold">Novo registro</h2>
        <form action={registrarDiario} className="mt-4 space-y-4">
          <div>
            <label htmlFor="oQueFez" className="mb-1 block font-titulo text-sm font-bold">
              O que você fez?
            </label>
            <input
              id="oQueFez" name="oQueFez" required maxLength={500}
              placeholder="Ex: escrevi 12 pareceres descritivos"
              className="campo"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="ferramentaUsada" className="mb-1 block font-titulo text-sm font-bold">
                Ferramenta
              </label>
              <select id="ferramentaUsada" name="ferramentaUsada" required className="campo">
                {LISTA_FERRAMENTAS.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
                <option value="outra">Outra</option>
              </select>
            </div>
            <div>
              <label htmlFor="minutosAntes" className="mb-1 block font-titulo text-sm font-bold">
                Levava (min)
              </label>
              <input
                id="minutosAntes" name="minutosAntes" type="number" min={0} max={6000}
                placeholder="240" className="campo"
              />
            </div>
            <div>
              <label htmlFor="minutosAgora" className="mb-1 block font-titulo text-sm font-bold">
                Levou agora (min)
              </label>
              <input
                id="minutosAgora" name="minutosAgora" type="number" min={0} max={6000}
                placeholder="20" className="campo"
              />
            </div>
          </div>

          <div>
            <label htmlFor="observacao" className="mb-1 block font-titulo text-sm font-bold">
              Observação <span className="font-normal text-cinza">(opcional)</span>
            </label>
            <textarea
              id="observacao" name="observacao" rows={2} maxLength={1000}
              placeholder="O que funcionou? O que você ajustaria?"
              className="campo"
            />
          </div>

          <button type="submit" className="btn-primario">Registrar</button>
        </form>
      </div>

      {registros.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">
            Nenhum registro ainda. Anote sua primeira prática acima.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {registros.map((r) => {
            const economia = Math.max(0, (r.minutosAntes ?? 0) - (r.minutosAgora ?? 0));
            return (
              <div key={r.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">{r.oQueFez}</p>
                    <p className="mt-1 text-sm text-cinza">
                      {r.ferramentaUsada} ·{" "}
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(r.registradoEm)}
                    </p>
                    {r.observacao && (
                      <p className="mt-2 text-sm text-tinta-clara">{r.observacao}</p>
                    )}
                  </div>
                  {economia > 0 && (
                    <span className="selo-verde shrink-0">
                      −{economia} min
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
