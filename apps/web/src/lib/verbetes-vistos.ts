/**
 * Registro de quais verbetes o professor já abriu, e quando.
 *
 * Fica no navegador, não no banco, de propósito: é uma pista visual ("você
 * já leu este", "este foi o último"), não um dado da plataforma. Guardar no
 * servidor custaria uma escrita a cada abertura de verbete para produzir uma
 * informação que só interessa a quem está na frente da tela.
 *
 * Consequência aceita: some ao limpar o navegador e não acompanha o professor
 * de um aparelho para outro. Nada quebra quando isso acontece — os cards
 * apenas voltam a aparecer todos como não visitados.
 */

const CHAVE = "aprender-ia:verbetes-vistos";
/** Além disso, a lista fica grande sem trazer utilidade nenhuma. */
const LIMITE = 60;

export type VerbetesVistos = {
  /** slug -> quando foi aberto (epoch ms). */
  vistos: Record<string, number>;
  /** O último de todos; é o que recebe destaque próprio na lista. */
  ultimo: string | null;
};

const VAZIO: VerbetesVistos = { vistos: {}, ultimo: null };

/**
 * Lê o registro.
 *
 * Nunca lança: `localStorage` pode não existir (renderização no servidor),
 * estar bloqueado (navegação privada, site data desativado) ou conter lixo de
 * uma versão anterior. Em qualquer desses casos devolvemos vazio, e a lista
 * simplesmente aparece sem marcação.
 */
export function lerVistos(): VerbetesVistos {
  if (typeof window === "undefined") return VAZIO;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return VAZIO;
    const dados = JSON.parse(bruto) as Partial<VerbetesVistos>;
    if (!dados || typeof dados !== "object" || typeof dados.vistos !== "object") {
      return VAZIO;
    }
    return {
      vistos: dados.vistos ?? {},
      ultimo: typeof dados.ultimo === "string" ? dados.ultimo : null,
    };
  } catch {
    return VAZIO;
  }
}

/** Marca um verbete como visto agora e o promove a "último". */
export function registrarVisto(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    const atual = lerVistos();
    const vistos = { ...atual.vistos, [slug]: Date.now() };

    // Poda os mais antigos quando passa do limite, preservando os recentes —
    // que são justamente os que o professor reconhece.
    const chaves = Object.keys(vistos);
    if (chaves.length > LIMITE) {
      const ordenadas = chaves.sort((a, b) => (vistos[b] ?? 0) - (vistos[a] ?? 0));
      for (const antiga of ordenadas.slice(LIMITE)) delete vistos[antiga];
    }

    window.localStorage.setItem(CHAVE, JSON.stringify({ vistos, ultimo: slug }));
  } catch {
    /* Sem armazenamento, a marcação apenas não acontece. */
  }
}
