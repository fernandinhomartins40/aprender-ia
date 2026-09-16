/**
 * Gera `roteiros-aula.ts` a partir do deck de slides do curso.
 *
 * Roda só na máquina de quem edita o curso, e o resultado vai versionado —
 * do mesmo jeito que `banco-prompts.ts` e `conteudo-apostila.ts`. Assim o
 * roteiro da aula é conteúdo do curso, que o seed grava no deploy, e não algo
 * que o professor precise importar pelo painel antes de cada aula.
 *
 * Uso:
 *   pnpm tsx prisma/gerar-roteiros.ts ../../../cursos/Curso_IA_Educadores_v2/Slides_IA_Educadores_2026.html
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { roteirosDoDeck } from "./extrair-roteiro";

const caminho = process.argv[2];
if (!caminho) {
  console.error("uso: pnpm tsx prisma/gerar-roteiros.ts <deck.html>");
  process.exit(1);
}

const html = readFileSync(caminho, "utf8");
const roteiros = roteirosDoDeck(html);
if (!roteiros.length) {
  console.error("nenhum slide encontrado — o arquivo é o deck montado?");
  process.exit(1);
}

const destino = resolve(import.meta.dirname, "roteiros-aula.ts");
const cabecalho = `/**
 * Roteiros da aula — os passos que o professor projeta e a turma acompanha.
 *
 * ARQUIVO GERADO. Não edite à mão: a fonte é o deck do curso, em
 * \`cursos/Curso_IA_Educadores_v2/Slides_IA_Educadores_2026.html\`.
 * Para atualizar, edite o deck, rode \`node montar_slides.js\` lá e depois:
 *
 *   pnpm tsx prisma/gerar-roteiros.ts <caminho-do-deck.html>
 *
 * O seed grava estes roteiros no banco a cada deploy, então a aula já chega
 * pronta no painel — não há nada para importar.
 */

/** Um bloco do passo. A tela do aluno sabe desenhar cada tipo. */
export type BlocoRoteiro =
  | { tipo: "texto"; html: string }
  | { tipo: "prompt"; texto: string; variaveis: string[] }
  | { tipo: "ferramentas"; chaves: string[] }
  | { tipo: "checklist"; itens: string[] }
  | { tipo: "imagem"; src: string; legenda?: string };

export type PassoRoteiro = {
  titulo: string;
  /** O slide como está no deck, desenhado com o CSS do deck. */
  html: string;
  /** A seção da apostila que este slide trata — "1.1", "2.2". */
  secaoApostila: string | null;
  blocos: BlocoRoteiro[];
};

export type RoteiroAula = {
  /** Encontro 1, 2, 3... Vira o título e a ordem do roteiro. */
  encontro: number;
  titulo: string;
  passos: PassoRoteiro[];
};

export const ROTEIROS_AULA: RoteiroAula[] = `;

writeFileSync(destino, cabecalho + JSON.stringify(roteiros, null, 2) + ";\n", "utf8");

for (const r of roteiros) {
  const comPrompt = r.passos.filter((p) => p.blocos.some((b) => b.tipo === "prompt")).length;
  const comImagem = r.passos.filter((p) => p.blocos.some((b) => b.tipo === "imagem")).length;
  console.log(`${r.titulo}: ${r.passos.length} passos · ${comPrompt} com prompt · ${comImagem} com imagem`);
}
console.log(`\ngravado em ${destino}`);
