/**
 * Lê a apostila do curso e devolve os capítulos e seções.
 *
 * A apostila é um HTML montado para virar PDF A4. Aqui ela é fatiada em
 * seções (`<h2>1.1 ...`) dentro de capítulos (`<h1 class="cap">`), para que a
 * aplicação possa mostrar o trecho certo ao lado do slide — e não obrigar o
 * aluno a caçar a página num PDF de 9 MB no celular.
 *
 * O HTML de cada seção é preservado como está: os boxes "Traduzindo",
 * "Atenção", "Dica", as tabelas e os prompts são o material do curso, e
 * reescrevê-los criaria uma segunda versão para manter.
 */

export type SecaoApostila = {
  /** "1.1", "2.2"… É por aqui que o slide encontra o trecho dele. */
  numero: string;
  titulo: string;
  html: string;
};

export type CapituloApostila = {
  /** 1, 2, 3… ou null nos anexos, que não são numerados. */
  numero: number | null;
  /** O identificador usado no endereço: "cap-1", "anexo-a". */
  id: string;
  titulo: string;
  icone: string;
  /** O que vem antes da primeira seção (aquecimento, abertura do capítulo). */
  aberturaHtml: string;
  secoes: SecaoApostila[];
};

/** Remove marcação, para ler um título. */
function textoLimpo(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Prepara um trecho da apostila para ser servido pela aplicação.
 *
 * As figuras mudam de lugar: na apostila o caminho é relativo à pasta do curso
 * ("imagens/01_...png"); aqui os mesmos arquivos são servidos de
 * `/curso/imagens/`. E qualquer `<script>` ou manipulador inline sai — é HTML
 * que a aplicação vai montar, e não deve carregar código junto.
 */
function normalizarHtml(trecho: string): string {
  return trecho
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/(<img[^>]+src=")(?:\.\/)?imagens\//gi, "$1/curso/imagens/")
    .trim();
}

/** Um identificador estável para o endereço, a partir do título. */
function idDoCapitulo(titulo: string, ordem: number): string {
  const cap = titulo.match(/Cap[ií]tulo\s+(\d+)/i);
  if (cap) return `cap-${cap[1]}`;
  const anexo = titulo.match(/Anexo\s+([A-Z])/i);
  if (anexo) return `anexo-${anexo[1]!.toLowerCase()}`;
  return `parte-${ordem}`;
}

/**
 * Fatia a apostila em capítulos e seções.
 *
 * A capa e o sumário ficam de fora: a capa não é conteúdo, e o sumário a
 * aplicação monta sozinha a partir dos capítulos — assim ele nunca diverge do
 * que existe de fato.
 */
export function capitulosDaApostila(html: string): CapituloApostila[] {
  // Só o corpo interessa; o <head> traz os links de CSS do PDF.
  const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;

  const reCap = /<h1 class="cap[^"]*">([\s\S]*?)<\/h1>/g;
  const aberturas: { indice: number; fim: number; tituloHtml: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = reCap.exec(corpo))) {
    aberturas.push({ indice: m.index, fim: reCap.lastIndex, tituloHtml: m[1] ?? "" });
  }

  const capitulos: CapituloApostila[] = [];

  for (const [i, abertura] of aberturas.entries()) {
    const ate = aberturas[i + 1]?.indice ?? corpo.length;
    const conteudo = corpo.slice(abertura.fim, ate);

    const icone = abertura.tituloHtml.match(/<span class="ic">([\s\S]*?)<\/span>/)?.[1] ?? "";
    // O ícone sai do título: ele vem num <span> dentro do mesmo <h1>, e
    // deixá-lo colado ("☰Sumário") atrapalha tanto a leitura quanto a
    // comparação abaixo.
    const titulo = textoLimpo(
      abertura.tituloHtml.replace(/<span class="ic">[\s\S]*?<\/span>/, ""),
    );

    // O sumário não é conteúdo: a aplicação monta o dela a partir dos
    // capítulos, e assim ele nunca diverge do que existe de fato.
    if (/^sum[áa]rio$/i.test(titulo)) continue;

    // Seções do capítulo.
    const reSec = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
    const marcas: { indice: number; fim: number; titulo: string }[] = [];
    let s: RegExpExecArray | null;
    while ((s = reSec.exec(conteudo))) {
      marcas.push({ indice: s.index, fim: reSec.lastIndex, titulo: textoLimpo(s[1] ?? "") });
    }

    const secoes: SecaoApostila[] = marcas.map((marca, j) => {
      const fim = marcas[j + 1]?.indice ?? conteudo.length;
      // "1.1 O que é Inteligência Artificial?" → número e título separados.
      const num = marca.titulo.match(/^(\d+(?:\.\d+)*)\s+(.*)$/);
      return {
        numero: num?.[1] ?? "",
        titulo: num?.[2] ?? marca.titulo,
        html: normalizarHtml(conteudo.slice(marca.fim, fim)),
      };
    });

    capitulos.push({
      numero: Number(titulo.match(/Cap[ií]tulo\s+(\d+)/i)?.[1]) || null,
      id: idDoCapitulo(titulo, i),
      titulo,
      icone,
      aberturaHtml: normalizarHtml(
        conteudo.slice(0, marcas[0]?.indice ?? conteudo.length),
      ),
      secoes,
    });
  }

  return capitulos;
}
