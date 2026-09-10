import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { IconeApp, type NomeIconeApp } from "@/components/icone-app";
import { IconeRede } from "@/components/redes-sociais";
import { lerLanding, type SecaoResolvida } from "@/server/landing";
import { planosPublicos } from "@/server/assinaturas";
import { reais } from "@/lib/dinheiro";
import { ROTULO_PERIODO, porMes } from "@/lib/assinaturas";
import { MENU_TOPO } from "@/lib/landing-catalogo";

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

/** Quebra de linha digitada pelo admin vale como quebra de linha. */
function comQuebras(texto: string) {
  return texto.split("\n").map((linha, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {linha}
    </span>
  ));
}

/**
 * Título com a última linha em destaque.
 *
 * É o padrão do desenho: "Aprenda. Pratique." em tinta escura e
 * "Evolua com IA." em azul. Com uma linha só, nada muda.
 */
function TituloComDestaque({ texto, corDestaque }: { texto: string; corDestaque: string }) {
  const linhas = texto.split("\n");
  const ultima = linhas.pop() ?? "";

  return (
    <>
      {linhas.map((l, i) => (
        <span key={i}>
          {l}
          <br />
        </span>
      ))}
      <span style={{ color: corDestaque }}>{ultima}</span>
    </>
  );
}

export default async function Home() {
  const [secoes, planos] = await Promise.all([lerLanding(), planosPublicos()]);

  const mapa = new Map(secoes.map((s) => [s.chave, s]));
  const de = (chave: string): SecaoResolvida | null => {
    const s = mapa.get(chave);
    return s && s.visivel ? s : null;
  };

  const hero = de("hero");
  const publico = de("publico");
  const plataforma = de("plataforma");
  const trilhas = de("trilhas");
  const numeros = de("numeros");
  const secaoPlanos = de("planos");
  const depoimentos = de("depoimentos");
  const faq = de("faq");
  const chamadaFinal = de("chamada_final");
  const rodape = de("rodape");

  const itensDe = (s: SecaoResolvida | null) => (s?.itens ?? []).filter((i) => i.visivel);

  const depoimentosVisiveis = itensDe(depoimentos);
  const faqVisivel = itensDe(faq);
  const redes = itensDe(rodape).filter((r) => r.link);

  return (
    <main className="bg-white">
      {/* ---------- Cabeçalho ---------- */}
      <header className="sticky top-0 z-50 border-b border-borda bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <Logo largura={104} prioridade />

          <nav aria-label="Seções do site" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {MENU_TOPO.map((m) => (
                <li key={m.rotulo}>
                  <Link
                    href={m.href}
                    className="text-sm font-semibold text-tinta-clara transition-colors hover:text-indigo"
                  >
                    {m.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/entrar"
              className="rounded-full border-2 border-indigo-line px-5 py-2 text-sm font-bold text-indigo transition-colors hover:border-indigo"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-full bg-indigo px-5 py-2 text-sm font-bold text-white shadow-cor transition-colors hover:bg-indigo-dark"
            >
              <span className="hidden sm:inline">Criar minha conta gratuita</span>
              <span className="sm:hidden">Criar conta</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      {hero && (
        <section className="relative overflow-hidden bg-grad-capa">
          {/* Duas colunas, e não a arte como fundo: o banner tem proporção
              larga (2,5:1) e, esticado para cobrir uma seção alta, o robô
              subia por cima do texto e deixava o parágrafo ilegível. Aqui
              cada um tem seu espaço, em qualquer altura de tela. */}
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:py-16 lg:grid-cols-[1.05fr,1fr] lg:gap-6 lg:py-20">
            <div className="max-w-xl">
              {hero.selo && (
                <span className="inline-flex items-center rounded-full bg-indigo px-4 py-1.5 text-xs font-bold text-white">
                  {hero.selo}
                </span>
              )}

              <h1 className="mt-6 font-titulo text-4xl font-extrabold leading-[1.1] text-tinta sm:text-5xl lg:text-6xl">
                <TituloComDestaque texto={hero.titulo} corDestaque="var(--indigo)" />
              </h1>

              {hero.subtitulo && (
                <p className="mt-6 text-base leading-relaxed text-tinta-clara sm:text-lg">
                  {hero.subtitulo}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {hero.ctaTexto && (
                  <Link
                    href={hero.ctaLink || "/cadastro"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo px-7 py-3.5 font-titulo font-bold text-white shadow-cor transition-colors hover:bg-indigo-dark"
                  >
                    {hero.ctaTexto}
                    <span aria-hidden>→</span>
                  </Link>
                )}
                {hero.cta2Texto && (
                  <Link
                    href={hero.cta2Link || "#trilhas"}
                    className="inline-flex items-center justify-center rounded-full border-2 border-indigo-line bg-white px-7 py-3.5 font-titulo font-bold text-indigo transition-colors hover:border-indigo"
                  >
                    {hero.cta2Texto}
                  </Link>
                )}
              </div>

              {itensDe(hero).length > 0 && (
                <ul className="mt-9 grid gap-4 sm:grid-cols-3">
                  {itensDe(hero).map((s) => (
                    <li key={s.id} className="flex items-center gap-2.5">
                      {s.icone && (
                        <IconeApp
                          nome={s.icone as NomeIconeApp}
                          tamanho={32}
                          className="shrink-0"
                        />
                      )}
                      <span className="text-sm font-semibold leading-tight text-tinta-clara">
                        {s.titulo}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* O mascote recortado, à direita no desktop e abaixo do texto
                no celular. Decorativo: o <h1> ao lado já diz o que é a
                página, e descrevê-lo de novo só faria o leitor de tela
                repetir a mesma informação. */}
            <div className="order-first lg:order-none">
              <Image
                src="/landing/robo-comemorando.webp"
                alt=""
                aria-hidden
                width={720}
                height={720}
                priority
                sizes="(max-width: 1024px) 60vw, 40vw"
                className="mx-auto h-auto w-52 sm:w-64 lg:w-full lg:max-w-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* ---------- Para quem é ---------- */}
      {publico && (
        <section id="publico" className="mx-auto max-w-7xl px-5 py-16 sm:py-20">
          {publico.selo && (
            <p className="font-titulo text-sm font-extrabold uppercase tracking-wide text-indigo">
              {publico.selo}
            </p>
          )}
          <h2 className="mt-3 font-titulo text-3xl font-extrabold text-tinta sm:text-4xl">
            {publico.titulo}
          </h2>
          {publico.subtitulo && (
            <p className="mt-3 max-w-2xl text-tinta-clara">{publico.subtitulo}</p>
          )}

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {itensDe(publico).map((p) => (
              <article
                key={p.id}
                // flex-col + flex-1 no corpo: as descrições têm de duas a
                // três linhas, e sem isso os cartões terminavam em alturas
                // diferentes numa mesma fileira.
                className="flex flex-col overflow-hidden rounded-2xl border border-borda"
                style={{ background: p.cor || "var(--indigo-soft)" }}
              >
                {p.imagem && (
                  <div className="flex h-44 items-end justify-center">
                    <Image
                      src={p.imagem}
                      alt=""
                      aria-hidden
                      width={280}
                      height={280}
                      className="h-40 w-auto object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 bg-white p-5">
                  <h3 className="font-titulo text-lg font-bold text-tinta">{p.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-tinta-clara">{p.texto}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Faixa: mais que cursos ---------- */}
      {plataforma && (
        <section id="plataforma" className="mx-auto max-w-7xl px-5 pb-16 sm:pb-20">
          <div className="overflow-hidden rounded-3xl bg-grad-escuro px-6 py-10 sm:px-10 lg:px-12">
            <div className="grid items-center gap-10 lg:grid-cols-[auto,1fr,1fr]">
              {plataforma.imagem && (
                <Image
                  src={plataforma.imagem}
                  alt=""
                  aria-hidden
                  width={280}
                  height={280}
                  className="mx-auto h-auto w-40 lg:w-56"
                />
              )}

              <div>
                <h2 className="font-titulo text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                  {comQuebras(plataforma.titulo)}
                </h2>
                {plataforma.texto && (
                  <p className="mt-4 text-sm leading-relaxed text-white/80">
                    {plataforma.texto}
                  </p>
                )}
              </div>

              {itensDe(plataforma).length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {itensDe(plataforma).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 rounded-xl bg-white/95 p-3.5"
                    >
                      {p.icone && <IconeApp nome={p.icone as NomeIconeApp} tamanho={34} />}
                      <span className="text-sm font-bold leading-tight text-tinta">
                        {p.titulo}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Trilhas ---------- */}
      {trilhas && (
        <section id="trilhas" className="mx-auto max-w-7xl px-5 pb-16 sm:pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {trilhas.selo && (
                <p className="font-titulo text-sm font-extrabold uppercase tracking-wide text-indigo">
                  {trilhas.selo}
                </p>
              )}
              <h2 className="mt-3 font-titulo text-3xl font-extrabold text-tinta sm:text-4xl">
                {trilhas.titulo}
              </h2>
              {trilhas.subtitulo && (
                <p className="mt-3 max-w-2xl text-tinta-clara">{trilhas.subtitulo}</p>
              )}
            </div>

            {trilhas.ctaTexto && (
              <Link
                href={trilhas.ctaLink || "/cadastro"}
                className="font-titulo text-sm font-bold text-indigo underline-offset-4 hover:underline"
              >
                {trilhas.ctaTexto} <span aria-hidden>→</span>
              </Link>
            )}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {itensDe(trilhas).map((t) => {
              const cor = t.cor || "#4F46E5";
              return (
                <Link
                  key={t.id}
                  href={t.link || "/cadastro"}
                  className="group flex flex-col rounded-2xl border border-borda p-5 transition-shadow hover:shadow-md"
                  // 10% de opacidade da cor da trilha: dá identidade ao
                  // cartão sem comprometer o contraste do texto escuro.
                  style={{ background: `${cor}0F` }}
                >
                  {/* Altura fixa no ícone e no título: os textos das
                      trilhas têm comprimentos diferentes, e sem isso a
                      seta de cada cartão parava numa altura distinta. */}
                  <div className="flex h-10 items-center">
                    {t.icone && <IconeApp nome={t.icone as NomeIconeApp} tamanho={40} />}
                  </div>
                  <h3 className="mt-3 font-titulo font-bold leading-snug text-tinta">
                    {t.titulo}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-tinta-clara">
                    {t.texto}
                  </p>
                  <span
                    aria-hidden
                    className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white font-bold shadow-sm transition-transform group-hover:translate-x-1"
                    style={{ color: cor }}
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Números ---------- */}
      {numeros && itensDe(numeros).length > 0 && (
        <section id="numeros" className="bg-azul-soft py-12">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-8 px-5">
            {itensDe(numeros).map((n) => (
              <div key={n.id} className="text-center">
                {n.icone && (
                  <div className="flex justify-center">
                    <IconeApp nome={n.icone as NomeIconeApp} tamanho={44} />
                  </div>
                )}
                {/* Item sem legenda é um rótulo ("Conteúdo sempre
                    atualizado"), não um número: em corpo de número ele
                    dominaria a faixa e roubaria a leitura dos indicadores. */}
                <p
                  className={`mt-2 font-titulo font-extrabold text-tinta ${
                    n.texto ? "text-2xl sm:text-3xl" : "max-w-[10rem] text-base"
                  }`}
                >
                  {n.titulo}
                </p>
                {n.texto && <p className="mt-0.5 text-sm text-tinta-clara">{n.texto}</p>}
              </div>
            ))}

            {numeros.texto && (
              <p className="max-w-[12rem] text-center font-titulo text-lg font-bold text-indigo">
                {numeros.texto}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ---------- Planos ---------- */}
      {/* Os planos vêm da tela de planos; sem plano público, nada aparece. */}
      {secaoPlanos && planos.length > 0 && (
        <section id="planos" className="mx-auto max-w-7xl px-5 py-16 sm:py-20">
          <h2 className="text-center font-titulo text-3xl font-extrabold text-tinta sm:text-4xl">
            {secaoPlanos.titulo}
          </h2>
          {secaoPlanos.subtitulo && (
            <p className="mx-auto mt-3 max-w-2xl text-center text-tinta-clara">
              {secaoPlanos.subtitulo}
            </p>
          )}

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {planos.map((p) => {
              const mensal = porMes(p.precoCentavos, p.periodicidade);
              return (
                <div
                  key={p.id}
                  className={`flex flex-col rounded-2xl border p-6 ${
                    p.destaque ? "border-2 border-indigo shadow-lg" : "border-borda"
                  }`}
                >
                  {p.destaque && (
                    <span className="mb-3 self-start rounded-full bg-indigo px-3 py-1 font-titulo text-xs font-bold uppercase tracking-wide text-white">
                      Mais escolhido
                    </span>
                  )}
                  <h3 className="font-titulo text-xl font-bold text-tinta">{p.nome}</h3>
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
                    className={`mt-6 rounded-full px-6 py-3 text-center font-titulo font-bold ${
                      p.destaque
                        ? "bg-indigo text-white hover:bg-indigo-dark"
                        : "border-2 border-indigo-line text-indigo hover:border-indigo"
                    }`}
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

      {/* ---------- Depoimentos ---------- */}
      {/* Sem depoimento cadastrado a seção não aparece: um bloco vazio com
          título é pior do que bloco nenhum. */}
      {depoimentos && depoimentosVisiveis.length > 0 && (
        <section className="bg-fundo py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5">
            <h2 className="text-center font-titulo text-3xl font-extrabold text-tinta sm:text-4xl">
              {depoimentos.titulo}
            </h2>
            {depoimentos.subtitulo && (
              <p className="mx-auto mt-3 max-w-2xl text-center text-tinta-clara">
                {depoimentos.subtitulo}
              </p>
            )}

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {depoimentosVisiveis.map((d) => (
                <figure key={d.id} className="rounded-2xl border border-borda bg-white p-6">
                  <blockquote className="text-tinta-clara">“{d.texto}”</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    {d.imagem && (
                      <Image
                        src={d.imagem}
                        alt=""
                        aria-hidden
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    )}
                    <span className="font-titulo font-bold text-tinta">
                      {d.titulo}
                      {d.extra && (
                        <span className="block text-sm font-normal text-cinza">{d.extra}</span>
                      )}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- FAQ ---------- */}
      {faq && faqVisivel.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
          <h2 className="text-center font-titulo text-3xl font-extrabold text-tinta sm:text-4xl">
            {faq.titulo}
          </h2>
          {faq.subtitulo && (
            <p className="mt-3 text-center text-tinta-clara">{faq.subtitulo}</p>
          )}

          <div className="mt-10 space-y-3">
            {faqVisivel.map((p) => (
              <details key={p.id} className="group rounded-2xl border border-borda bg-white p-5">
                <summary className="cursor-pointer font-titulo font-bold text-tinta marker:content-none">
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
        </section>
      )}

      {/* ---------- Chamada final ---------- */}
      {chamadaFinal && (
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:pb-20">
          <div className="overflow-hidden rounded-3xl bg-grad-chamada px-6 py-10 sm:px-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,1fr,auto]">
              <h2 className="font-titulo text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                <TituloComDestaque texto={chamadaFinal.titulo} corDestaque="#FDE68A" />
              </h2>

              <div>
                {chamadaFinal.subtitulo && (
                  <p className="text-white/90">{chamadaFinal.subtitulo}</p>
                )}
                {chamadaFinal.ctaTexto && (
                  <Link
                    href={chamadaFinal.ctaLink || "/cadastro"}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-titulo font-bold text-indigo transition-colors hover:bg-indigo-soft"
                  >
                    {chamadaFinal.ctaTexto}
                    <span aria-hidden>→</span>
                  </Link>
                )}
                {chamadaFinal.texto && (
                  <p className="mt-4 text-sm text-white/80">{chamadaFinal.texto}</p>
                )}
              </div>

              {chamadaFinal.imagem && (
                <Image
                  src={chamadaFinal.imagem}
                  alt=""
                  aria-hidden
                  width={280}
                  height={280}
                  className="mx-auto hidden h-auto w-44 lg:block"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Rodapé ---------- */}
      <footer className="border-t border-borda bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Logo largura={96} />
            <div>
              <p className="font-titulo font-bold text-tinta">
                {rodape?.titulo || "Aprender IA"}
              </p>
              {rodape?.texto && (
                <p className="mt-0.5 text-sm text-cinza">{rodape.texto}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <nav aria-label="Links do rodapé">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-tinta-clara">
                <li>
                  <Link href="#publico" className="hover:text-indigo hover:underline">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/entrar" className="hover:text-indigo hover:underline">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro" className="hover:text-indigo hover:underline">
                    Criar conta
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-indigo hover:underline">
                    Painel
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Só as redes com link cadastrado: um ícone que não leva a
                lugar nenhum frustra quem clica. */}
            {redes.length > 0 && (
              <ul className="flex items-center gap-3">
                {redes.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.link ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={r.titulo}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-fundo text-tinta-clara transition-colors hover:bg-indigo-soft hover:text-indigo"
                    >
                      <IconeRede nome={r.icone ?? ""} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
