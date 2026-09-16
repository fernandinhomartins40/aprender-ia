/**
 * Um trecho da apostila, desenhado com o CSS da apostila.
 *
 * O HTML vem do material do curso, versionado no repositório e gravado pelo
 * seed — não é entrada de usuário, e o extrator remove `<script>` e `on*=` ao
 * gerar. Reescrever esses trechos em JSX criaria uma segunda versão da
 * apostila para manter sincronizada com a primeira.
 *
 * As tabelas ganham uma caixa que rola: são a única coisa do material que não
 * cabe num celular, e sem isso empurrariam a página inteira para o lado.
 */
export function TextoApostila({ html }: { html: string }) {
  const comTabelasRolaveis = html.replace(
    /<table/g,
    '<div class="tabela-rolavel"><table',
  ).replace(/<\/table>/g, "</table></div>");

  return (
    <div
      className="apostila-curso"
      dangerouslySetInnerHTML={{ __html: comTabelasRolaveis }}
    />
  );
}
