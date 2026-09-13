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

/**
 * Configurações da plataforma.
 *
 * Lidas em toda navegação (o layout do aluno pede o prazo de aviso do
 * acesso gratuito) e alteradas por um administrador de tempos em tempos.
 * Sem cache, cada página custava uma ida ao banco para reler um número
 * que passa meses igual.
 */
export const TAG_CONFIGURACOES = "configuracoes";
