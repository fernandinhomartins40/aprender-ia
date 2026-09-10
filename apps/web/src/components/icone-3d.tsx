import Image from "next/image";

/**
 * Ícones 3D da biblioteca 3dicons (CC0, por Vijay Verma).
 *
 * Servimos os arquivos do nosso próprio domínio em vez de um CDN
 * externo: escolas costumam ter bloqueio de rede, e um ícone que não
 * carrega deixa a interface sem sentido.
 */

/** Nomes disponíveis em public/icones-3d. */
export type NomeIcone =
  | "bookmark" | "bulb" | "calendar" | "chart" | "chat-text" | "clock"
  | "crown" | "file-new" | "file-text" | "fire" | "flag" | "folder"
  | "gift" | "heart" | "lock" | "magic-trick" | "mail" | "medal"
  | "message" | "notebook" | "pencil" | "plus" | "puzzle" | "rocket"
  | "setting" | "shield" | "star" | "target" | "trophy";

/** Ícone de cada tipo de lição da trilha. */
export const ICONE_POR_TIPO: Record<string, NomeIcone> = {
  TEORIA: "file-text",
  QUIZ: "puzzle",
  DUELO: "target",
  CACA_ERRO: "magic-trick",
  PROMPT: "bulb",
  DESAFIO: "clock",
  CASO: "chat-text",
  CHECKPOINT: "flag",
};

/** Ícone de cada encontro. */
export const ICONE_POR_ENCONTRO: NomeIcone[] = [
  "rocket",   // Encontro 1 — começo
  "notebook", // Encontro 2 — rotina e planejamento
  "heart",    // Encontro 3 — inclusão
  "trophy",   // Encontro 4 — avaliação e projeto
];

export function Icone3D({
  nome,
  tamanho = 40,
  className = "",
  prioridade = false,
}: {
  nome: NomeIcone;
  tamanho?: number;
  className?: string;
  prioridade?: boolean;
}) {
  return (
    <Image
      src={`/icones-3d/${nome}.webp`}
      alt=""
      aria-hidden="true"
      width={tamanho}
      height={tamanho}
      priority={prioridade}
      className={`inline-block select-none ${className}`}
      draggable={false}
    />
  );
}
