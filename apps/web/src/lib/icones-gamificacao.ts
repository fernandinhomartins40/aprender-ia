import type { NomeIconeApp } from "@/components/icone-app";

/**
 * Converte valores legados (emojis gravados antes da biblioteca autoral)
 * para os ícones oficiais usados pela interface. Valores arbitrários nunca
 * viram caminho de arquivo, evitando arte quebrada no PWA.
 */
const OFICIAIS = new Set<NomeIconeApp>([
  "conquistas", "progresso", "recompensas", "metas", "desafios",
  "certificados", "calendario", "aulas", "prompt", "feedback",
]);

export function iconeGamificacao(valor: string | null | undefined, padrao: NomeIconeApp = "conquistas"): NomeIconeApp {
  return valor && OFICIAIS.has(valor as NomeIconeApp) ? valor as NomeIconeApp : padrao;
}
