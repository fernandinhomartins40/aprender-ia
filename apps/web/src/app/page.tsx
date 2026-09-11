import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { IconePlano, SeloIcone, TracoIcone } from "@/components/icone-plano";
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

/**
 * Links institucionais do rodapé.
 *
 * Termos, Privacidade e Contato ainda não têm página: os destinos estão
 * declarados aqui para que criá-las seja só acrescentar a rota.
 */
const LINKS_RODAPE = [
  { rotulo: "Sobre", href: "/#publico" },
  { rotulo: "Termos", href: "/termos" },
  { rotulo: "Privacidade", href: "/privacidade" },
  { rotulo: "Contato", href: "/contato" },
];

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
      <header className="sticky top-0 z-50 bg-white">
        {/* A logo cresceu e o respiro vertical encolheu na mesma medida,
            para a altura do cabeçalho continuar em 78px. No celular ela é
            menor: cada pixel do topo conta para a dobra caber na tela. */}
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-[5px] sm:gap-4 sm:px-5">
          <Logo largura={132} prioridade className="h-auto w-[104px] sm:w-[132px]" />

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
            {/* A busca de conteúdo mora dentro da plataforma; aqui o ícone
                leva para lá em vez de abrir um campo que não teria o que
                pesquisar numa página só. */}
            <Link
              href="/entrar?proximo=/app/prompts"
              aria-label="Buscar conteúdo"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-tinta-clara transition-colors hover:bg-indigo-soft hover:text-indigo sm:inline-flex"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </Link>
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
          {/* O hero é montado em duas camadas, e é isso que resolve a
              responsividade: o FUNDO é só degradê, então pode ser cortado
              em qualquer direção sem estragar nada; o MASCOTE é um PNG
              transparente por cima, livre para mudar de tamanho e de lugar
              conforme a tela. Antes, com arte e fundo na mesma imagem, o
              robô acabava por trás do texto em tablet e celular.

              Cada faixa recebe o fundo com a proporção mais próxima da sua,
              e o navegador baixa só um deles. */}
          <picture>
            <source media="(min-width: 1280px)" srcSet="/landing/hero-fundo-desktop.webp" />
            <source media="(min-width: 768px)" srcSet="/landing/hero-fundo-tablet.webp" />
            <img
              src="/landing/hero-fundo-mobile.webp"
              alt=""
              aria-hidden
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>

          {/* Véu claro sob o texto: o fundo tem áreas saturadas e sem ele o
              parágrafo cinza perderia contraste. No celular cobre a faixa
              inteira, já que lá o texto ocupa toda a largura. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/20 lg:bg-gradient-to-r lg:from-white/75 lg:via-white/35 lg:to-transparent"
          />

          {/* Abaixo de 1024px o conteúdo empilha: texto em cima, mascote
              embaixo. O respiro é curto de propósito — a meta é a dobra
              inteira caber na tela do celular sem rolagem.

              Os 660px pedidos para o desktop ficam presos a um teto de 85%
              da janela: num iPad em paisagem (690px de altura) a medida
              fixa empurrava a dobra para fora da tela. */}
          <div className="relative mx-auto grid max-w-7xl items-center gap-2 px-5 py-3 sm:gap-6 sm:py-7 lg:min-h-[min(660px,calc(100vh-79px))] lg:grid-cols-[1fr,1.05fr] lg:gap-6 lg:py-10 xl:py-14">
            <div className="max-w-xl">
              {hero.selo && (
                <span className="inline-flex items-center rounded-full bg-indigo px-4 py-1.5 text-xs font-bold text-white">
                  {hero.selo}
                </span>
              )}

              {/* Medidas menores no celular e folga só a partir do desktop:
                  é o que faz a dobra inteira caber na tela sem rolagem. */}
              {/* O salto para 6xl só no xl: num iPad em paisagem (1024px de
                  largura por 690 de altura) o título gigante empurrava a
                  dobra para fora da tela. */}
              <h1 className="mt-4 font-titulo text-[28px] font-extrabold leading-[1.1] text-tinta sm:mt-6 sm:text-4xl lg:text-5xl xl:text-6xl">
                <TituloComDestaque texto={hero.titulo} corDestaque="var(--indigo)" />
              </h1>

              {/* No celular o subtítulo fica em 3 linhas (`line-clamp`): o
                  texto completo ocupava 5 e empurrava o mascote para fora
                  da tela. A frase inteira continua no HTML, para busca e
                  leitor de tela. */}
              {hero.subtitulo && (
                <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-tinta-clara sm:mt-5 sm:line-clamp-none sm:text-base lg:text-lg">
                  {hero.subtitulo}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
                {hero.ctaTexto && (
                  <Link
                    href={hero.ctaLink || "/cadastro"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo px-6 py-3 font-titulo text-sm font-bold text-white shadow-cor transition-colors hover:bg-indigo-dark sm:px-7 sm:py-3.5 sm:text-base"
                  >
                    {hero.ctaTexto}
                    <span aria-hidden>→</span>
                  </Link>
                )}
                {hero.cta2Texto && (
                  <Link
                    href={hero.cta2Link || "#trilhas"}
                    className="inline-flex items-center justify-center rounded-full border-2 border-indigo-line bg-white px-6 py-3 font-titulo text-sm font-bold text-indigo transition-colors hover:border-indigo sm:px-7 sm:py-3.5 sm:text-base"
                  >
                    {hero.cta2Texto}
                  </Link>
                )}
              </div>

              {/* No celular os três ficam lado a lado, em coluna: em lista
                  empilhada eles sozinhos comiam 150px de altura e empurravam
                  o mascote para fora da tela. */}
              {itensDe(hero).length > 0 && (
                <ul className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-8 sm:gap-4">
                  {itensDe(hero).map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-2.5 sm:text-left"
                    >
                      {s.icone && <SeloIcone nome={s.icone} cor={s.cor || "#4F46E5"} />}
                      <span className="text-[10px] font-semibold leading-tight text-tinta-clara sm:text-sm">
                        {s.titulo}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* O mascote, sempre no fluxo — nunca posicionado por cima do
                texto. No desktop ele é a segunda coluna da grade; abaixo
                disso, o bloco que vem logo depois do texto. Em nenhum dos
                dois casos ele pode cobrir o que precisa ser lido. */}
            <div className="flex justify-center lg:justify-end">
              <Image
                src="/landing/hero-mascote.webp"
                alt=""
                aria-hidden
                width={1200}
                height={1200}
                priority
                sizes="(max-width: 768px) 80vw, (max-width: 1280px) 55vw, 46vw"
                className="h-auto w-[50%] max-w-[175px] sm:w-[78%] sm:max-w-[380px] lg:w-full lg:max-w-[620px]"
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
                      className="h-44 w-auto object-contain"
                    />
                  </div>
                )}
                {/* O texto fica sobre o mesmo fundo colorido: a faixa
                    branca que eu tinha posto cortava o cartão em dois. */}
                <div className="flex-1 p-5">
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
        // `pt-12` reserva a folga por onde o mascote transborda: quem sai da
        // faixa não empurra o que está em volta, e sem isso ele seria
        // cortado pela seção anterior.
        <section id="plataforma" className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:pb-20">
          {/* Faixa baixa e larga: o robô ocupa pouco, o texto tem largura
              suficiente para o título caber em duas linhas e os cartões
              ficam com a metade direita. Proporções apertadas aqui faziam
              o título quebrar em três linhas e esticavam a faixa.

              Sem `overflow-hidden`: é o transbordo do mascote que dá o
              efeito da referência. */}
          <div className="relative rounded-[32px] bg-grad-escuro px-6 py-8 sm:px-8 lg:px-10 lg:py-7">
            <div className="grid items-center gap-8 lg:grid-cols-[200px,minmax(0,1fr),minmax(0,1.15fr)] lg:gap-8">
              {plataforma.imagem && (
                <Image
                  src={plataforma.imagem}
                  alt=""
                  aria-hidden
                  width={280}
                  height={280}
                  // A margem negativa faz o robô subir para fora da faixa.
                  className="relative mx-auto h-auto w-36 lg:-mt-16 lg:w-full"
                />
              )}

              <div>
                {/* `text-balance` distribui as linhas: sem ele, "completa."
                    caía sozinha numa terceira linha. */}
                <h2 className="text-balance font-titulo text-2xl font-extrabold leading-tight text-white">
                  {comQuebras(plataforma.titulo)}
                </h2>
                {plataforma.texto && (
                  <p className="mt-3 text-[13px] leading-relaxed text-white/75">
                    {plataforma.texto}
                  </p>
                )}
              </div>

              {itensDe(plataforma).length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {itensDe(plataforma).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 rounded-2xl bg-white p-4"
                    >
                      {p.icone && (
                        <IconePlano
                          nome={p.icone}
                          cor={p.cor || "#4F46E5"}
                          tamanho={40}
                          // Fundo suave com a figura sólida colorida: dentro
                          // do cartão branco é a figura que carrega a cor.
                          preenchido={false}
                        />
                      )}
                      <span className="text-[13px] font-bold leading-snug text-tinta">
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
                  className="group flex flex-col rounded-2xl p-4 transition-shadow hover:shadow-md"
                  // 10% de opacidade da cor da trilha: dá identidade ao
                  // cartão sem comprometer o contraste do texto escuro.
                  style={{ background: `${cor}0F` }}
                >
                  {/* Ícone e título na mesma linha, como no desenho: o
                      título empilhado embaixo alongava o cartão sem
                      necessidade, já que sobra largura ao lado do ícone. */}
                  <div className="flex items-center gap-2.5">
                    {t.icone && <IconePlano nome={t.icone} cor={cor} tamanho={38} />}
                    <h3 className="font-titulo text-[15px] font-bold leading-tight text-tinta">
                      {t.titulo}
                    </h3>
                  </div>

                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-tinta-clara">
                    {t.texto}
                  </p>

                  {/* Fundo na cor da trilha, bem diluído: a seta branca com
                      sombra destoava dos cartões, que não têm borda. */}
                  <span
                    aria-hidden
                    className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full font-bold transition-transform group-hover:translate-x-1"
                    style={{ background: `${cor}24`, color: cor }}
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
                  <div className="flex justify-center" style={{ color: n.cor || "#4F46E5" }}>
                    <TracoIcone nome={n.icone} tamanho={34} />
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

            {/* A frase vai como arte, não como texto: é lettering
                manuscrito com grifo, que nenhuma fonte da web reproduz.
                O `alt` carrega o conteúdo para quem usa leitor de tela. */}
            {numeros.texto && (
              <Image
                src="/landing/frase-juntos.webp"
                alt={numeros.texto}
                width={892}
                height={900}
                className="h-auto w-40 sm:w-48"
              />
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
        // `pt-14` reserva, acima da faixa, o espaço por onde o mascote e a
        // frase transbordam. Sem essa folga eles seriam cortados pela seção
        // anterior, já que quem transborda não empurra o que está em volta.
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:pb-20">
          {/* Sem `overflow-hidden` aqui, ao contrário das outras faixas: é
              justamente o transbordo que dá o efeito da referência. */}
          <div className="relative rounded-[32px] bg-grad-chamada px-6 py-9 sm:px-10">
            <div className="grid items-center gap-6 lg:grid-cols-[1.05fr,1fr,auto]">
              {/* O título é lettering manuscrito com grifo — nenhuma fonte
                  da web reproduz. O texto real fica no `alt`. */}
              <Image
                src="/landing/frase-proximo-passo.webp"
                alt={chamadaFinal.titulo.replace(/\n/g, " ")}
                width={1100}
                height={383}
                className="h-auto w-full max-w-sm lg:max-w-md"
              />

              <div>
                {chamadaFinal.subtitulo && (
                  <p className="text-sm text-white/90">{chamadaFinal.subtitulo}</p>
                )}
                {chamadaFinal.ctaTexto && (
                  <Link
                    href={chamadaFinal.ctaLink || "/cadastro"}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-titulo font-bold text-indigo transition-colors hover:bg-indigo-soft"
                  >
                    {chamadaFinal.ctaTexto}
                    <span aria-hidden>→</span>
                  </Link>
                )}
                {chamadaFinal.texto && (
                  <p className="mt-3 text-[13px] text-white/80">{chamadaFinal.texto}</p>
                )}
              </div>

              {/* Mascote e frase sobem para fora da faixa. A margem negativa
                  é o que produz o transbordo; `relative` os mantém acima do
                  fundo colorido. */}
              <div className="relative hidden items-end gap-3 lg:flex">
                {chamadaFinal.imagem && (
                  <Image
                    src={chamadaFinal.imagem}
                    alt=""
                    aria-hidden
                    width={400}
                    height={400}
                    className="-mt-20 h-auto w-48 drop-shadow-xl"
                  />
                )}
                <Image
                  src="/landing/frase-aprender.webp"
                  alt="Aprender transforma realidades!"
                  width={1100}
                  height={1072}
                  className="-mt-10 h-auto w-28"
                />
              </div>
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
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-tinta-clara">
                {LINKS_RODAPE.map((l) => (
                  <li key={l.rotulo}>
                    <Link href={l.href} className="hover:text-indigo hover:underline">
                      {l.rotulo}
                    </Link>
                  </li>
                ))}
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
