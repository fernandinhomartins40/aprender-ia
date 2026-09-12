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
