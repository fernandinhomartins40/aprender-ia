import type { NomeIconeApp } from "@/components/icone-app";

/**
 * O menu do aluno, numa lista só.
 *
 * Existiam duas: uma no layout, para o computador, e outra dentro da barra
 * inferior, para o celular. Elas divergiram — "Prompts" virava "Banco de
 * prompts", "Ferramentas" virava "Ferramentas de IA", e o celular ainda
 * apontava para `/app/acompanhar`, que hoje é só um redirecionamento. Quem
 * usava os dois aparelhos via nomes diferentes para a mesma página.
 *
 * Aqui o nome de cada destino é escrito uma vez. O que muda entre os dois é
 * apenas QUANTOS itens cabem em cada barra, e isso é decisão de layout — não
 * de conteúdo.
 */

export type ItemMenuAluno = {
  href: string;
  rotulo: string;
  icone: NomeIconeApp;
  /**
   * Fica visível na barra do celular, fora do "Mais".
   *
   * São três vagas: a barra tem cinco posições, e duas já são do botão
   * "Continuar" e do "Mais". Ganha a vaga o que se usa DURANTE o encontro,
   * com o professor falando — procurar dentro de um menu, ali, é perder a
   * aula. Por isso "Aulas" é fixa e a apostila, que se consulta com calma,
   * não é.
   */
  fixoNoCelular?: boolean;
};

export const MENU_ALUNO: ItemMenuAluno[] = [
  { href: "/app", rotulo: "Início", icone: "inicio", fixoNoCelular: true },
  { href: "/app/trilha", rotulo: "Trilha", icone: "trilhas", fixoNoCelular: true },
  { href: "/app/aula", rotulo: "Aulas", icone: "apresentacao", fixoNoCelular: true },
  { href: "/app/apostila", rotulo: "Apostila", icone: "documentos" },
  { href: "/app/prompts", rotulo: "Prompts", icone: "prompt" },
  { href: "/app/ferramentas", rotulo: "Ferramentas", icone: "ferramentas" },
  { href: "/app/criar-prompt", rotulo: "Criar prompt", icone: "ideias" },
  { href: "/app/conhecimento", rotulo: "Conhecimento", icone: "ideias" },
  { href: "/app/diario", rotulo: "Diário de bordo", icone: "documentos" },
  { href: "/app/conquistas", rotulo: "Conquistas", icone: "conquistas" },
  { href: "/app/missoes", rotulo: "Missões", icone: "metas" },
  { href: "/app/meus-planos", rotulo: "Meus planos", icone: "planos" },
  { href: "/app/notificacoes", rotulo: "Notificações", icone: "notificacoes" },
  { href: "/app/acesso", rotulo: "Meu acesso", icone: "seguranca" },
];

/**
 * No computador cabem cinco na barra; o resto vai para o "Mais".
 *
 * Os 14 itens somavam mais que a largura útil do cabeçalho, e os últimos
 * quebravam para uma segunda linha.
 */
export const MENU_DESKTOP_PRINCIPAL = MENU_ALUNO.slice(0, 5);
export const MENU_DESKTOP_SECUNDARIO = MENU_ALUNO.slice(5);

/** No celular, o que tem vaga fixa na barra — e o que fica no "Mais". */
export const MENU_CELULAR_FIXO = MENU_ALUNO.filter((m) => m.fixoNoCelular);
export const MENU_CELULAR_MAIS = MENU_ALUNO.filter((m) => !m.fixoNoCelular);
