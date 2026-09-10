import type { NomeIconeApp } from "@/components/icone-app";

/**
 * Lista dos ícones, para o seletor do painel.
 *
 * Vive em `lib/` e não junto do componente porque a tela de edição é um
 * Client Component e precisa da lista em tempo de execução, não só do tipo.
 * A ordem é alfabética: com dezenas de opções, procurar pelo nome é o único
 * jeito prático de achar.
 *
 * Gerado por scripts/gerar-catalogo-icones.py — não edite à mão.
 */
export const ICONES_APP: NomeIconeApp[] = [
  "acessibilidade", "adiciona", "aprender_ia", "apresentacao",
  "arquivos_pdf", "atividades", "aulas", "avaliacoes", "biblioteca",
  "calendario", "central_de_ajuda", "certificados", "compartilhar",
  "comunidade", "configuracoes", "conquistas", "curiosos", "cursos",
  "desafios", "discussoes", "documentos", "downloads", "duplicar",
  "editar", "editar_conteudo", "educadores", "empreendedores",
  "estatisticas", "estudantes", "eventos", "excluir", "explorar", "faq",
  "favoritos", "feedback", "ferramentas", "filtrar", "game", "historico",
  "ia", "ideias", "imagem", "imprimir", "inicio", "integracoes", "link",
  "marketplace", "materiais", "mensagens", "metas", "modelos",
  "modo_claro", "modo_noturno", "mover", "notificacoes", "novidades",
  "ordenar", "organizar", "parceiros", "perfil", "pesquisa",
  "planejamento", "planos", "podcast", "privacidade", "progresso",
  "prompt", "rankings", "recompensas", "relatorios", "seguranca",
  "sincronizar", "suporte", "texto", "traducao", "trilhas", "tutoriais",
  "videos", "visualizar", "webinars", "youtube",
];

/**
 * Redes sociais do rodapé.
 *
 * Separada porque essas marcas são SVG de terceiros, não fazem parte do
 * conjunto 3D autoral — ver `components/redes-sociais`.
 */
export const ICONES_REDE = ["youtube", "instagram", "linkedin", "discord"];
