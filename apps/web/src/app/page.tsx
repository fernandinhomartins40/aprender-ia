import Link from "next/link";
import { Logo } from "@/components/logo";
import { Icone3D, type NomeIcone } from "@/components/icone-3d";
import { lerLanding, type SecaoResolvida } from "@/server/landing";
import { planosPublicos } from "@/server/assinaturas";
import { reais } from "@/lib/dinheiro";
import { ROTULO_PERIODO, porMes } from "@/lib/assinaturas";

/**
 * Página inicial.
 *
 * O conteúdo vem do banco (editável em /admin/landing) e cai no catálogo
 * embutido quando não há nada salvo — a porta de entrada do projeto nunca
 * aparece vazia por causa de banco novo ou migration pendente.
 *
 * O layout continua no código de propósito: o painel troca palavras,
 * imagens, ordem e visibilidade, não a estrutura da página.
 */

// A landing lê do banco, então não pode ser estática; `revalidate` evita
// consultar a cada visita sem exigir republicação manual ao editar.
export const revalidate = 60;

const seloClasse: Record<string, string> = {
  verde: "selo-verde",
  amarelo: "selo-amarelo",
  vermelho: "selo-vermelho",
};

/** Quebra de linha digitada pelo admin vale como quebra de linha. */
function comQuebras(texto: string) {
  return texto.split("\n").map((linha, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {linha}
    </span>
  ));
}

export default async function Home() {
  const [secoes, planos] = await Promise.all([lerLanding(), planosPublicos()]);

  const mapa = new Map(secoes.map((s) => [s.chave, s]));
  const de = (chave: string): SecaoResolvida | null => {
    const s = mapa.get(chave);
    return s && s.visivel ? s : null;
  };

  const hero = de("hero");
  const dor = de("dor");
  const trilha = de("trilha");
  const ferramentas = de("ferramentas");
  const depoimentos = de("depoimentos");
  const secaoPlanos = de("planos");
  const faq = de("faq");
  const chamadaFinal = de("chamada_final");
  const rodape = de("rodape");

  const itensVisiveis = (s: SecaoResolvida | null) =>
    (s?.itens ?? []).filter((i) => i.visivel);

  const depoimentosVisiveis = itensVisiveis(depoimentos);
  const faqVisivel = itensVisiveis(faq);

  return (
    <main>
      {/* ---------- Cabeçalho ---------- */}
      <header className="sticky top-0 z-50 border-b border-borda bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo largura={132} prioridade />
          <nav className="flex items-center gap-3">
            <Link href="/entrar" className="btn-fantasma hidden sm:inline-flex">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primario">
              Começar agora
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      {hero && (
        <section className="bg-grad-capa">
          <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:py-24">
            {hero.selo && (
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo px-5 py-2 font-titulo text-sm font-bold text-white">
                {hero.selo}
              </span>
            )}

            <h1 className="mx-auto mt-7 max-w-4xl font-titulo text-4xl font-extrabold leading-tight text-tinta sm:text-6xl">
              {comQuebras(hero.titulo)}
            </h1>

            {hero.subtitulo && (
              <p className="mx-auto mt-6 max-w-2xl text-lg text-tinta-clara sm:text-xl">
                {hero.subtitulo}
              </p>
            )}

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {hero.ctaTexto && (
                <Link href={hero.ctaLink || "/cadastro"} className="btn-primario w-full sm:w-auto">
                  {hero.ctaTexto}
                </Link>
              )}
              {hero.cta2Texto && (
                <Link href={hero.cta2Link || "#trilha"} className="btn-secundario w-full sm:w-auto">
                  {hero.cta2Texto}
                </Link>
              )}
            </div>

            {hero.texto && <p className="mt-5 text-sm text-cinza">{hero.texto}</p>}
          </div>
        </section>
      )}

      {/* ---------- A dor ---------- */}
      {dor && (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
            {dor.titulo}
          </h2>
          {dor.subtitulo && (
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-tinta-clara">
              {dor.subtitulo}
            </p>
          )}

          {itensVisiveis(dor).length > 0 && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {itensVisiveis(dor).map((l) => (
                <div key={l.id} className="card text-center">
                  {l.icone && <Icone3D nome={l.icone as NomeIcone} tamanho={64} />}
                  <h3 className="mt-3 font-titulo text-lg font-bold">{l.titulo}</h3>
                  <p className="mt-2 text-tinta-clara">{l.texto}</p>
                </div>
              ))}
            </div>
          )}

          {dor.texto && (
            <div className="mt-10 rounded-lg bg-indigo-soft p-7 text-center">
              <p className="mx-auto max-w-3xl text-lg text-indigo-dark">{dor.texto}</p>
            </div>
          )}
        </section>
      )}

      {/* ---------- A trilha ---------- */}
      {trilha && (
        <section id="trilha" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
              {trilha.titulo}
            </h2>
            {trilha.subtitulo && (
              <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-tinta-clara">
                {trilha.subtitulo}
              </p>
            )}

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {itensVisiveis(trilha).map((e, i) => {
                const cor = e.cor || "#6366F1";
                return (
                  <div
                    key={e.id}
                    className="card border-l-8"
                    // O fundo é a mesma cor bem diluída: mantém o contraste
                    // do texto sem precisar de uma segunda cor cadastrada.
                    style={{ borderLeftColor: cor, background: `${cor}14` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-titulo text-2xl font-extrabold text-white"
                        style={{ background: cor }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-titulo text-lg font-bold">{e.titulo}</h3>
                        {e.extra && (
                          <p className="mt-2 text-tinta-clara">
                            <strong>Você leva:</strong> {e.extra}
                          </p>
                        )}
                        {e.texto && <p className="mt-2 text-tinta-clara">{e.texto}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Ferramentas ---------- */}
      {ferramentas && (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
            {ferramentas.titulo}
          </h2>
          {ferramentas.subtitulo && (
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-tinta-clara">
              {ferramentas.subtitulo}
            </p>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itensVisiveis(ferramentas).map((f) => (
              <div key={f.id} className="card">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="font-titulo text-lg font-bold"
                    style={f.cor ? { color: f.cor } : undefined}
                  >
                    {f.titulo}
                  </span>
                  {f.selo && (
                    <span className={seloClasse[f.selo] ?? "selo-amarelo"}>
                      {f.selo === "verde" ? "Gratuito" : "Com limite"}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-tinta-clara">{f.texto}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Depoimentos ---------- */}
      {/* Sem depoimento cadastrado a seção não aparece: um bloco vazio
          com título é pior do que bloco nenhum. */}
      {depoimentos && depoimentosVisiveis.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
              {depoimentos.titulo}
            </h2>
            {depoimentos.subtitulo && (
              <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-tinta-clara">
                {depoimentos.subtitulo}
              </p>
            )}

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {depoimentosVisiveis.map((d) => (
                <figure key={d.id} className="card">
                  <blockquote className="text-tinta-clara">“{d.texto}”</blockquote>
                  <figcaption className="mt-4 font-titulo font-bold">
                    {d.titulo}
                    {d.extra && (
                      <span className="block text-sm font-normal text-cinza">{d.extra}</span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Planos ---------- */}
      {/* Os planos vêm da tela de planos; sem plano público, nada aparece. */}
      {secaoPlanos && planos.length > 0 && (
        <section id="planos" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
            {secaoPlanos.titulo}
          </h2>
          {secaoPlanos.subtitulo && (
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-tinta-clara">
              {secaoPlanos.subtitulo}
            </p>
          )}

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {planos.map((p) => {
              const mensal = porMes(p.precoCentavos, p.periodicidade);
              return (
                <div
                  key={p.id}
                  className={`card flex flex-col ${
                    p.destaque ? "border-2 border-indigo shadow-lg" : ""
                  }`}
                >
                  {p.destaque && (
                    <span className="mb-3 self-start rounded-full bg-indigo px-3 py-1 font-titulo text-xs font-bold uppercase tracking-wide text-white">
                      Mais escolhido
                    </span>
                  )}
                  <h3 className="font-titulo text-xl font-bold">{p.nome}</h3>
                  {p.descricao && <p className="mt-1 text-tinta-clara">{p.descricao}</p>}

                  <p className="mt-4 font-titulo text-3xl font-extrabold text-indigo">
                    {reais(p.precoCentavos)}
                  </p>
                  <p className="text-sm text-cinza">
                    {ROTULO_PERIODO[p.periodicidade]}
                    {p.periodicidade === "UNICA" && p.diasAcesso
                      ? ` · ${p.diasAcesso} dias de acesso`
                      : mensal && p.periodicidade !== "MENSAL"
                        ? ` · equivale a ${reais(mensal)}/mês`
                        : ""}
                  </p>

                  {p.diasTeste > 0 && (
                    <p className="mt-2 text-sm font-bold text-verde-dark">
                      {p.diasTeste} dias de teste antes da primeira cobrança
                    </p>
                  )}

                  {p.beneficios.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm text-tinta-clara">
                      {p.beneficios.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span aria-hidden className="font-bold text-verde-dark">
                            ✓
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href="/cadastro"
                    className={`mt-6 ${p.destaque ? "btn-primario" : "btn-secundario"} w-full text-center`}
                  >
                    Quero este plano
                  </Link>
                </div>
              );
            })}
          </div>

          {secaoPlanos.texto && (
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-cinza">
              {secaoPlanos.texto}
            </p>
          )}
        </section>
      )}

      {/* ---------- FAQ ---------- */}
      {faq && faqVisivel.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
              {faq.titulo}
            </h2>
            {faq.subtitulo && (
              <p className="mt-4 text-center text-lg text-tinta-clara">{faq.subtitulo}</p>
            )}

            <div className="mt-10 space-y-3">
              {faqVisivel.map((p) => (
                <details key={p.id} className="card group">
                  <summary className="cursor-pointer font-titulo font-bold marker:content-none">
                    <span className="flex items-start justify-between gap-3">
                      {p.titulo}
                      <span
                        aria-hidden
                        className="shrink-0 text-indigo transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-tinta-clara">{p.texto}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Chamada final ---------- */}
      {chamadaFinal && (
        <section className="bg-grad-marca py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <h2 className="font-titulo text-3xl font-extrabold text-white sm:text-4xl">
              {chamadaFinal.titulo}
            </h2>
            {chamadaFinal.subtitulo && (
              <p className="mt-4 text-lg text-white/90">{chamadaFinal.subtitulo}</p>
            )}
            {chamadaFinal.ctaTexto && (
              <Link
                href={chamadaFinal.ctaLink || "/cadastro"}
                className="btn mt-8 bg-white text-indigo hover:bg-indigo-soft"
              >
                {chamadaFinal.ctaTexto}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ---------- Rodapé ---------- */}
      <footer className="border-t border-borda bg-white py-8">
        <div className="mx-auto max-w-6xl px-5 text-center text-sm text-cinza">
          <div className="flex justify-center">
            <Logo largura={120} />
          </div>
          {rodape?.texto && <p className="mt-3">{rodape.texto}</p>}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <Link
              href="/entrar"
              className="inline-flex min-h-[44px] items-center px-3 hover:text-indigo hover:underline"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex min-h-[44px] items-center px-3 hover:text-indigo hover:underline"
            >
              Criar conta
            </Link>
            <Link
              href="/admin"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3 hover:text-indigo hover:underline"
            >
              Painel administrativo
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
