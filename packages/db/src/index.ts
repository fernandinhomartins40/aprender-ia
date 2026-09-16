export { prisma } from "./client";
export * from "@prisma/client";

// A Base de Conhecimento é semente e vocabulário de domínio ao mesmo
// tempo: o seed popula a tabela a partir dela, e a aplicação usa as
// categorias para ordenar a Central. Exportar daqui evita que a web
// alcance `prisma/` por caminho relativo.
export {
  BASE_CONHECIMENTO,
  CATEGORIAS_CONHECIMENTO,
  type VerbeteConhecimento,
} from "../prisma/base-conhecimento";

// Os 15 prompts que os cards do slide "Banco de 15 prompts" abrem. Ficam no
// conteúdo do curso, junto do roteiro que os referencia por índice, e a tela
// precisa deles para montar o modal — daí a exportação, pelo mesmo motivo da
// Base de Conhecimento acima.
export { PROMPTS_DO_BANCO } from "../prisma/roteiros-aula";
