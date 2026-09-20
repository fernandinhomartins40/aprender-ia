import { SeloAcesso } from "./selo-acesso";

/**
 * A ficha de uma ferramenta — o "Momento Ferramenta".
 *
 * O curso de Educadores tem seis fichas assim na apostila; o de
 * Empreendedores não tinha nenhuma. O efeito era o curso falar *sobre* as
 * ferramentas sem ensinar a usá-las.
 *
 * Os campos são os que o briefing pediu, nesta ordem, porque é a ordem
 * das perguntas de quem nunca abriu a ferramenta: o que é isso, para que
 * serve, quando uso, quando NÃO uso, quanto custa, como fica no meu
 * negócio — e então o botão para abrir.
 *
 * O campo mais importante é `quandoNaoUsar`. Sem ele a ficha vira
 * propaganda, e o cursista descobre o limite errando na frente do cliente.
 */

export type Ficha = {
  nome: string;
  oQueE: string;
  paraQueServe: string;
  quandoUsar: string;
  quandoNaoUsar: string;
  /** GRATUITO | GRATUITO_COM_LIMITES | PAGO | DEPENDE_DO_PLANO */
  acesso: string;
  /** O limite concreto, com a data em que foi conferido. */
  limite?: string;
  exemploNegocio: string;
  /** Endereço da ferramenta. Abre em nova aba. */
  atalho?: string;
};

export function FichaFerramenta({ ficha }: { ficha: Ficha }) {
  return (
    <section className="rounded-xl border-2 border-indigo-line bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-indigo">
        Ficha da ferramenta
      </p>
      <h3 className="mt-1 font-titulo text-xl font-extrabold text-tinta">
        {ficha.nome}
      </h3>

      <SeloAcesso faixa={ficha.acesso} limite={ficha.limite} className="mt-3" />

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-titulo font-bold text-tinta">O que é</dt>
          <dd className="text-tinta-clara">{ficha.oQueE}</dd>
        </div>
        <div>
          <dt className="font-titulo font-bold text-tinta">Para que serve</dt>
          <dd className="text-tinta-clara">{ficha.paraQueServe}</dd>
        </div>

        {/* Lado a lado no tablet para cima: a comparação é o ponto.
            No celular empilham, porque em 360px duas colunas de texto
            não sobrevivem. */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-verde bg-verde-soft/40 p-3">
            <dt className="font-titulo font-bold text-verde-dark">
              Quando usar
            </dt>
            <dd className="mt-1 text-tinta-clara">{ficha.quandoUsar}</dd>
          </div>
          <div className="rounded-lg border border-amarelo bg-amarelo-soft p-3">
            <dt className="font-titulo font-bold text-amarelo-dark">
              Quando NÃO usar
            </dt>
            <dd className="mt-1 text-amarelo-dark">{ficha.quandoNaoUsar}</dd>
          </div>
        </div>

        <div className="rounded-lg bg-indigo-soft p-3">
          <dt className="font-titulo font-bold text-indigo-dark">
            No seu negócio
          </dt>
          <dd className="mt-1 text-indigo-dark">{ficha.exemploNegocio}</dd>
        </div>
      </dl>

      {ficha.atalho && (
        <a
          href={ficha.atalho}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primario mt-4 inline-block text-sm"
        >
          Abrir {ficha.nome} →
        </a>
      )}
    </section>
  );
}
