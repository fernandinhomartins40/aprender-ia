import {
  aceitarSugestaoDiario,
  excluirRegistroDiario,
  ignorarSugestaoDiario,
  registrarDiario,
} from "@/server/acoes";
import { exigirAluno } from "@/server/trilha";
import {
  limparSugestoesAntigas,
  linhaDoTempo,
  resumoDoPeriodo,
  sugestoes,
} from "@/server/diario";
import { ROTULO_CATEGORIA, TOM_CATEGORIA } from "@/lib/motor-diario";
import { DiarioLinhaTempo } from "@/components/diario-linha-tempo";
import { DiarioRegistroRapido } from "@/components/diario-registro-rapido";
import { DiarioSugestoes } from "@/components/diario-sugestoes";
import { Termo } from "@/components/termo";

export const dynamic = "force-dynamic";

/**
 * Diário de Bordo.
 *
 * A ordem da tela responde à pergunta que o professor traz: primeiro o
 * que a plataforma guardou por ele (sugestões), depois o resumo da
 * semana, depois o campo para escrever, e por fim a linha do tempo.
 *
 * Escrever vem DEPOIS de ver: quem abre o diário quase sempre quer
 * consultar, não preencher. Pôr o formulário no topo, como estava,
 * comunicava o contrário — que o diário é uma obrigação pendente.
 */
export default async function Diario() {
  const user = await exigirAluno();

  // Sugestões velhas somem antes de a tela montar: sem isso, quem nunca
  // clica acumula uma dívida crescente de decisões.
  await limparSugestoesAntigas(user.id);

  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  const [registros, pendentes, semana] = await Promise.all([
    linhaDoTempo(user.id),
    sugestoes(user.id),
    resumoDoPeriodo(user.id, seteDiasAtras),
  ]);

  const totalEconomizado = registros.reduce(
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
        <p className="mt-1 max-w-2xl text-tinta-clara">
          A memória do seu trabalho. Boa parte se escreve sozinha conforme você
          usa a plataforma — o resto é só quando você quiser.
          <Termo slug="privacidade" contexto="diario" rotulo="Privacidade de estudantes" />
        </p>
      </div>

      <DiarioSugestoes
        sugestoes={pendentes.map((s) => ({
          id: s.id,
          oQueFez: s.oQueFez,
          categoria: s.categoria,
          tema: s.tema,
          disciplina: s.disciplina,
          etapa: s.etapa,
          registradoEm: s.registradoEm.toISOString(),
        }))}
        aoAceitar={aceitarSugestaoDiario}
        aoIgnorar={ignorarSugestaoDiario}
      />

      {/* ---- Resumo da semana ---- */}
      {semana.total > 0 && (
        <section className="mb-6 rounded-xl border border-borda bg-white p-5 sm:p-6">
          <h2 className="font-titulo text-lg font-bold">Esta semana</h2>
          <p className="mt-0.5 text-sm text-tinta-clara">
            {semana.total} {semana.total === 1 ? "registro" : "registros"} nos últimos 7 dias
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {semana.temas.length > 0 && (
              <BlocoResumo titulo="Assuntos trabalhados">
                {semana.temas.map((t) => (
                  <span key={t} className="selo-indigo">{t}</span>
                ))}
              </BlocoResumo>
            )}

            {semana.disciplinas.length > 0 && (
              <BlocoResumo titulo="Disciplinas">
                {semana.disciplinas.map((d) => (
                  <span key={d} className="selo-cinza">{d}</span>
                ))}
              </BlocoResumo>
            )}

            {semana.porCategoria.length > 0 && (
              <BlocoResumo titulo="Tipos de registro">
                {semana.porCategoria.map(({ categoria, quantidade }) => (
                  <span key={categoria} className={TOM_CATEGORIA[categoria]}>
                    {ROTULO_CATEGORIA[categoria]} · {quantidade}
                  </span>
                ))}
              </BlocoResumo>
            )}

            {semana.etapas.length > 0 && (
              <BlocoResumo titulo="Turmas">
                {semana.etapas.map((e) => (
                  <span key={e} className="selo-cinza">{e}</span>
                ))}
              </BlocoResumo>
            )}
          </div>

          {/* Dificuldades e ideias são o que ele mais relê: "o que travou"
              e "o que eu queria ter feito". Ficam citadas na íntegra,
              sem resumo nosso por cima. */}
          {(semana.dificuldades.length > 0 || semana.ideias.length > 0) && (
            <div className="mt-4 grid gap-4 border-t border-borda pt-4 sm:grid-cols-2">
              {semana.dificuldades.length > 0 && (
                <div>
                  <p className="font-titulo text-sm font-bold text-vermelho-dark">
                    Dificuldades registradas
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {semana.dificuldades.map((d) => (
                      <li key={d.id} className="text-sm leading-relaxed text-tinta-clara">
                        {d.oQueFez}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {semana.ideias.length > 0 && (
                <div>
                  <p className="font-titulo text-sm font-bold text-amarelo-dark">
                    Para retomar depois
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {semana.ideias.map((i) => (
                      <li key={i.id} className="text-sm leading-relaxed text-tinta-clara">
                        {i.oQueFez}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {totalEconomizado > 0 && (
        <div className="mb-6 rounded-lg bg-verde-soft p-4 text-center">
          <p className="font-titulo text-xl font-extrabold text-verde-dark">
            {Math.floor(totalEconomizado / 60)}h {totalEconomizado % 60}min economizados
          </p>
          <p className="mt-0.5 text-sm text-verde-dark">
            segundo os seus próprios registros de tempo
          </p>
        </div>
      )}

      <DiarioRegistroRapido aoRegistrar={registrarDiario} />

      <DiarioLinhaTempo
        registros={registros.map((r) => ({
          id: r.id,
          oQueFez: r.oQueFez,
          observacao: r.observacao,
          categoria: r.categoria,
          origem: r.origem,
          tema: r.tema,
          disciplina: r.disciplina,
          etapa: r.etapa,
          marcadores: r.marcadores,
          ferramentaUsada: r.ferramentaUsada,
          minutosAntes: r.minutosAntes,
          minutosAgora: r.minutosAgora,
          registradoEm: r.registradoEm.toISOString(),
        }))}
        aoExcluir={excluirRegistroDiario}
      />
    </div>
  );
}

function BlocoResumo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-titulo text-sm font-bold text-tinta">{titulo}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
