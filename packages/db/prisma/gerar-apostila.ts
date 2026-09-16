/**
 * Gera `apostila.ts` a partir do HTML da apostila do curso.
 *
 * Roda só na máquina de quem edita o curso, e o resultado vai versionado —
 * como `roteiros-aula.ts`. Assim a apostila é conteúdo do curso, servida como
 * página responsiva, e não um PDF de 9 MB que o aluno abre no celular para
 * caçar a página certa.
 *
 * Uso:
 *   pnpm --filter @aprender/db apostila \
 *     ../../../cursos/Curso_IA_Educadores_v2/Apostila_IA_Educadores_2026.html
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { capitulosDaApostila } from "./extrair-apostila";

const caminho = process.argv[2];
if (!caminho) {
  console.error("uso: pnpm tsx prisma/gerar-apostila.ts <apostila.html>");
  process.exit(1);
}

const capitulos = capitulosDaApostila(readFileSync(caminho, "utf8"));
if (!capitulos.length) {
  console.error("nenhum capítulo encontrado — o arquivo é a apostila montada?");
  process.exit(1);
}

const destino = resolve(import.meta.dirname, "apostila.ts");
const cabecalho = `/**
 * A apostila do curso, em capítulos e seções.
 *
 * ARQUIVO GERADO. Não edite à mão: a fonte é
 * \`cursos/Curso_IA_Educadores_v2/Apostila_IA_Educadores_2026.html\`.
 * Para atualizar, edite as partes lá, rode \`node montar_apostila.js\` e:
 *
 *   pnpm --filter @aprender/db apostila <caminho-da-apostila.html>
 *
 * O seed grava no banco a cada deploy, e o aluno lê a apostila como página —
 * no celular ou no computador. O PDF continua disponível para baixar.
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

export const APOSTILA: CapituloApostila[] = `;

writeFileSync(destino, cabecalho + JSON.stringify(capitulos, null, 2) + ";\n", "utf8");

for (const c of capitulos) {
  console.log(`${c.titulo}: ${c.secoes.length} seções`);
}
const secoes = capitulos.reduce((n, c) => n + c.secoes.length, 0);
console.log(`\n${capitulos.length} capítulos · ${secoes} seções`);
console.log(`gravado em ${destino}`);
