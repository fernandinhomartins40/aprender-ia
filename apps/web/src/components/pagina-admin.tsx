/**
 * Peças compartilhadas das telas do painel.
 *
 * Existem para que as 15 páginas não repitam cada uma o seu próprio
 * título, cartão e estado vazio com medidas ligeiramente diferentes —
 * era o que fazia o painel parecer um conjunto de telas soltas.
 *
 * São Server Components: nenhuma precisa de estado.
 */

/** Título e subtítulo de uma página, com espaço para ações à direita. */
export function TituloPagina({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">
          {titulo}
        </h1>
        {descricao && (
          <p className="mt-1 max-w-2xl text-sm text-tinta-clara">{descricao}</p>
        )}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
    </div>
  );
}

/** Bloco de conteúdo com título próprio. */
export function Secao({
  titulo,
  descricao,
  acoes,
  children,
  className = "",
}: {
  titulo?: string;
  descricao?: string;
  acoes?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-8 ${className}`}>
      {(titulo || acoes) && (
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            {titulo && (
              <h2 className="font-titulo text-lg font-bold text-tinta">{titulo}</h2>
            )}
            {descricao && (
              <p className="mt-0.5 text-sm text-tinta-clara">{descricao}</p>
            )}
          </div>
          {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Indicador numérico.
 *
 * `tom` colore só o valor, não o cartão inteiro: quatro cartões
 * totalmente coloridos lado a lado competem entre si e nenhum se destaca.
 */
export function Indicador({
  rotulo,
  valor,
  detalhe,
  tom = "neutro",
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  tom?: "neutro" | "positivo" | "atencao" | "critico";
}) {
  const cor = {
    neutro: "text-tinta",
    positivo: "text-verde-dark",
    atencao: "text-amarelo-dark",
    critico: "text-vermelho-dark",
  }[tom];

  return (
    <div className="rounded-xl border border-borda bg-white p-4">
      <p className="text-xs font-semibold text-cinza">{rotulo}</p>
      <p className={`mt-1.5 font-titulo text-2xl font-extrabold ${cor}`}>{valor}</p>
      {detalhe && <p className="mt-0.5 text-xs text-tinta-clara">{detalhe}</p>}
    </div>
  );
}

/** Grade de indicadores, com o mesmo ritmo em todas as telas. */
export function GradeIndicadores({ children }: { children: React.ReactNode }) {
  return <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

/** Cartão branco padrão — a superfície de conteúdo do painel. */
export function Cartao({
  children,
  className = "",
  semPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  semPadding?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-borda bg-white ${semPadding ? "" : "p-5"} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Estado vazio.
 *
 * Uma tela sem dados é um convite para agir, não um aviso de falha: por
 * isso `acao` existe e a mensagem diz o próximo passo.
 */
export function Vazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-borda bg-white px-6 py-12 text-center">
      <p className="font-titulo font-bold text-tinta">{titulo}</p>
      {descricao && (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-tinta-clara">{descricao}</p>
      )}
      {acao && <div className="mt-4 flex justify-center">{acao}</div>}
    </div>
  );
}

/** Tabela com rolagem própria, para não empurrar a largura da página. */
export function TabelaCartao({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-borda bg-white">
      {children}
    </div>
  );
}
