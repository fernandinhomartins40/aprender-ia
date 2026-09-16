/**
 * Um trecho da apostila, desenhado com o CSS da apostila.
 *
 * O HTML vem do material do curso, versionado no repositório e gravado pelo
 * seed — não é entrada de usuário, e o extrator remove `<script>` e `on*=` ao
 * gerar. Reescrever esses trechos em JSX criaria uma segunda versão da
 * apostila para manter sincronizada com a primeira.
 */

/**
 * Prepara as tabelas para caber num celular.
 *
 * Uma tabela de três ou quatro colunas não entra em 390px sem virar coluna de
 * uma palavra, e empurrar a barra de rolagem para o leitor é transferir a ele
 * um problema de layout. Em tela estreita o CSS transforma cada linha num
 * cartão — e, para isso, cada célula precisa saber de que coluna veio.
 *
 * O rótulo é gravado em `data-coluna`, lido pelo `::before` da célula. Feito
 * aqui, e não no navegador, porque é HTML estático: sai pronto do servidor,
 * sem depender de JavaScript para a tabela ficar legível.
 */
function prepararTabelas(html: string): string {
  return html.replace(/<table[\s\S]*?<\/table>/g, (tabela) => {
    const cabecalho = tabela.match(/<thead[\s\S]*?<\/thead>/)?.[0];
    if (!cabecalho) return envolver(tabela);

    const colunas = [...cabecalho.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) =>
      (m[1] ?? "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim(),
    );
    if (!colunas.length) return envolver(tabela);

    const corpo = tabela.match(/<tbody[\s\S]*?<\/tbody>/)?.[0];
    if (!corpo) return envolver(tabela);

    const novoCorpo = corpo.replace(/<tr[\s\S]*?<\/tr>/g, (linha) => {
      let i = 0;
      return linha.replace(/<td\b/g, () => {
        const rotulo = colunas[i++] ?? "";
        // A primeira célula é o título do cartão e dispensa rótulo: repetir
        // "Ferramenta" acima do nome da ferramenta só ocupa espaço.
        return i === 1 || !rotulo
          ? "<td"
          : `<td data-coluna="${rotulo.replace(/"/g, "&quot;")}"`;
      });
    });

    return envolver(tabela.replace(corpo, novoCorpo));
  });
}

/** A caixa que, em telas largas, deixa a tabela rolar sem levar a página. */
function envolver(tabela: string): string {
  return `<div class="tabela-rolavel">${tabela}</div>`;
}

export function TextoApostila({ html }: { html: string }) {
  return (
    <div
      className="apostila-curso"
      dangerouslySetInnerHTML={{ __html: prepararTabelas(html) }}
    />
  );
}
