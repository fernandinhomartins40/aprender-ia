export type NivelAluno = {
  numero: number;
  titulo: string;
  inicioXp: number;
  proximoXp: number;
  progressoPct: number;
};

const TITULOS = [
  "Explorador",
  "Praticante",
  "Criador",
  "Mentor",
  "Transformador",
] as const;

/** Nível é apenas uma leitura do XP real; não cria uma segunda moeda. */
export function nivelDoXp(xp: number): NivelAluno {
  const seguro = Math.max(0, Math.floor(xp));
  const numero = Math.floor(Math.sqrt(seguro / 120)) + 1;
  const inicioXp = (numero - 1) ** 2 * 120;
  const proximoXp = numero ** 2 * 120;
  const faixa = Math.max(1, proximoXp - inicioXp);
  return {
    numero,
    titulo: TITULOS[Math.min(numero - 1, TITULOS.length - 1)]!,
    inicioXp,
    proximoXp,
    progressoPct: Math.min(100, Math.round(((seguro - inicioXp) / faixa) * 100)),
  };
}

export function xpAteProximoNivel(xp: number): number {
  return Math.max(0, nivelDoXp(xp).proximoXp - xp);
}

