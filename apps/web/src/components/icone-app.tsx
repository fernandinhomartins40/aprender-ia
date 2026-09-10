import Image from "next/image";

/**
 * Ícones 3D da identidade do Aprender IA.
 *
 * São PNGs autorais convertidos para WebP a 256px: o original tinha ~1 MB
 * por ícone em 1250px, o que somava 87 MB para exibir figuras de 32 a 64px
 * — peso que o celular de um professor pagaria à toa. A 256px eles ainda
 * ficam nítidos no dobro do maior tamanho usado.
 *
 * Gerado por scripts/gerar-catalogo-icones.py — não edite à mão.
 */
export type NomeIconeApp =
  | "acessibilidade" | "adiciona" | "aprender_ia" | "apresentacao"
  | "arquivos_pdf" | "atividades" | "aulas" | "avaliacoes" | "biblioteca"
  | "calendario" | "central_de_ajuda" | "certificados" | "compartilhar"
  | "comunidade" | "configuracoes" | "conquistas" | "curiosos" | "cursos"
  | "desafios" | "discussoes" | "documentos" | "downloads" | "duplicar"
  | "editar" | "editar_conteudo" | "educadores" | "empreendedores"
  | "estatisticas" | "estudantes" | "eventos" | "excluir" | "explorar"
  | "faq" | "favoritos" | "feedback" | "ferramentas" | "filtrar" | "game"
  | "historico" | "ia" | "ideias" | "imagem" | "imprimir" | "inicio"
  | "integracoes" | "link" | "marketplace" | "materiais" | "mensagens"
  | "metas" | "modelos" | "modo_claro" | "modo_noturno" | "mover"
  | "notificacoes" | "novidades" | "ordenar" | "organizar" | "parceiros"
  | "perfil" | "pesquisa" | "planejamento" | "planos" | "podcast"
  | "privacidade" | "progresso" | "prompt" | "rankings" | "recompensas"
  | "relatorios" | "seguranca" | "sincronizar" | "suporte" | "texto"
  | "traducao" | "trilhas" | "tutoriais" | "videos" | "visualizar"
  | "webinars" | "youtube";

export function IconeApp({
  nome,
  tamanho = 40,
  className = "",
  prioridade = false,
}: {
  nome: NomeIconeApp;
  tamanho?: number;
  className?: string;
  prioridade?: boolean;
}) {
  return (
    <Image
      src={`/icones-app/${nome}.webp`}
      // Ícone aqui é sempre decorativo: o rótulo ao lado carrega o
      // significado, e repeti-lo faria o leitor de tela dizer tudo duas vezes.
      alt=""
      aria-hidden="true"
      width={tamanho}
      height={tamanho}
      priority={prioridade}
      className={className}
      style={{ width: tamanho, height: "auto" }}
    />
  );
}
