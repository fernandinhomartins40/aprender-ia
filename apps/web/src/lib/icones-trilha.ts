import type { NomeIconeApp } from "@/components/icone-app";

/**
 * Ícones da trilha, por tipo de lição e por encontro.
 *
 * Vive aqui e não em `components/icone-app`, que é gerado por script a
 * partir dos arquivos e seria sobrescrito.
 *
 * Estes mapas traduzem valores que vêm do banco (`Lesson.tipo`, índice do
 * módulo) para um ícone. Um tipo novo cadastrado sem entrada aqui cai no
 * padrão de quem chama, em vez de quebrar a tela.
 */

/** Ícone de cada tipo de lição. */
export const ICONE_POR_TIPO: Record<string, NomeIconeApp> = {
  TEORIA: "aulas",
  QUIZ: "avaliacoes",
  DUELO: "game",
  CACA_ERRO: "pesquisa",
  PROMPT: "prompt",
  DESAFIO: "desafios",
  CASO: "discussoes",
  CHECKPOINT: "metas",
};

/**
 * Ícone de cada encontro, na ordem.
 *
 * Acompanha a narrativa do curso: começar, organizar a rotina, incluir,
 * avaliar. Um quinto encontro cai no padrão de quem chama.
 */
export const ICONE_POR_ENCONTRO: NomeIconeApp[] = [
  "progresso", // 1 — primeiros passos
  "planejamento", // 2 — rotina e planejamento
  "acessibilidade", // 3 — inclusão
  "certificados", // 4 — avaliação e projeto
];
