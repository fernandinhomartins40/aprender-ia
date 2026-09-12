/**
 * Tags de cache compartilhadas.
 *
 * Vivem em `lib/` porque são lidas de dois lados: o módulo de leitura
 * (`server/conhecimento.ts`, que registra o cache) e as server actions
 * (`server/base-conhecimento.ts`, que o invalidam). Um arquivo com
 * `"use server"` só pode exportar funções assíncronas, então a constante
 * não poderia morar lá.
 */

export const TAG_CONHECIMENTO = "conhecimento";
