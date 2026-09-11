import type { NomeIconeApp } from "@/components/icone-app";

/**
 * Estrutura de navegação do painel.
 *
 * Agrupada por domínio, e não numa lista corrida: eram 14 itens soltos
 * numa barra horizontal que ocupava ~2060px e por isso não cabia nem num
 * monitor de 1920px — os últimos ficavam escondidos atrás de rolagem
 * lateral. Em coluna, os mesmos 14 ocupam ~500px de altura e aparecem
 * todos de uma vez.
 *
 * Vive em `lib/` porque a sidebar é Client Component (precisa do
 * `usePathname` para marcar o item ativo) e o layout é Server Component.
 */

export type ItemMenu = {
  href: string;
  rotulo: string;
  icone: NomeIconeApp;
  /// Quando a rota tem filhas (`/admin/turmas/[id]`), o item continua
  /// ativo dentro delas.
  prefixo?: boolean;
  /// Nome do contador que a sidebar exibe como selo, quando houver.
  contador?: "solicitacoes";
};

export type GrupoMenu = {
  /// Ausente no primeiro grupo: "Visão geral" não precisa de rótulo.
  titulo?: string;
  itens: ItemMenu[];
};

export const GRUPOS_MENU: GrupoMenu[] = [
  {
    itens: [{ href: "/admin", rotulo: "Visão geral", icone: "estatisticas" }],
  },
  {
    titulo: "Pessoas",
    itens: [
      // Alunos e turmas moram na mesma tela: o aluno é cadastrado dentro
      // de uma turma, e separá-los obrigava a ir e voltar no cadastro.
      { href: "/admin/alunos", rotulo: "Alunos e turmas", icone: "estudantes" },
      { href: "/admin/turmas", rotulo: "Cronogramas", icone: "calendario", prefixo: true },
      // Fica em Pessoas, e não em Conteúdo: o que esta tela mostra é o
      // que os professores escreveram, não o material do curso.
      { href: "/admin/praticas", rotulo: "Práticas", icone: "prompt" },
      {
        href: "/admin/solicitacoes",
        rotulo: "Solicitações",
        icone: "mensagens",
        contador: "solicitacoes",
      },
    ],
  },
  {
    titulo: "Conteúdo",
    itens: [
      { href: "/admin/cursos", rotulo: "Cursos", icone: "cursos" },
      { href: "/admin/ferramentas-ia", rotulo: "Ferramentas de IA", icone: "ferramentas" },
      { href: "/admin/gamificacao", rotulo: "Gamificação", icone: "recompensas" },
      { href: "/admin/landing", rotulo: "Página inicial", icone: "inicio" },
      { href: "/admin/aparencia", rotulo: "Aparência", icone: "imagem" },
    ],
  },
  {
    titulo: "Financeiro",
    itens: [
      { href: "/admin/planos", rotulo: "Planos", icone: "planos" },
      { href: "/admin/assinaturas", rotulo: "Assinaturas", icone: "certificados" },
      { href: "/admin/cobrancas", rotulo: "Cobranças", icone: "marketplace" },
    ],
  },
  {
    titulo: "Comunicação",
    itens: [
      { href: "/admin/notificacoes", rotulo: "Notificações", icone: "notificacoes" },
      { href: "/admin/relatorios", rotulo: "Relatórios", icone: "relatorios" },
    ],
  },
  {
    titulo: "Sistema",
    itens: [
      { href: "/admin/configuracoes", rotulo: "Configurações", icone: "configuracoes" },
      { href: "/admin/auditoria", rotulo: "Histórico", icone: "historico" },
    ],
  },
];

/** Todos os itens numa lista só — para achar o ativo e montar a trilha. */
export const ITENS_MENU: ItemMenu[] = GRUPOS_MENU.flatMap((g) => g.itens);

/**
 * O item de menu correspondente a uma rota.
 *
 * Casa do mais específico para o mais genérico, senão `/admin` (prefixo
 * de todas) venceria sempre e nenhum outro item ficaria ativo.
 */
export function itemAtivo(caminho: string): ItemMenu | undefined {
  const exato = ITENS_MENU.find((i) => i.href === caminho);
  if (exato) return exato;

  return ITENS_MENU.filter((i) => i.prefixo && caminho.startsWith(`${i.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}

/** Rótulo da página atual, para o cabeçalho e a trilha de navegação. */
export function rotuloDaRota(caminho: string): string {
  return itemAtivo(caminho)?.rotulo ?? "Painel";
}
