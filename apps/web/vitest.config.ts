import { defineConfig } from "vitest/config";

/**
 * Configuração de testes do app web.
 *
 * Existe por um motivo específico: sem ela, o vitest varre `.next/` e encontra
 * as CÓPIAS dos arquivos de teste que o build `standalone` do Next deixa em
 * `.next/standalone/apps/web/src/`. Essas cópias falham ao transformar (não
 * têm o mesmo contexto de módulos) e o resultado é uma suíte "vermelha" sem
 * que nenhum teste real tenha quebrado — o pior tipo de falso alarme, porque
 * ensina a ignorar o resultado dos testes.
 *
 * Os padrões de exclusão do vitest cobrem `node_modules` e `dist`, mas não
 * `.next`.
 */
export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      // Artefatos de build: contêm cópias dos próprios testes.
      "**/.next/**",
      "**/.turbo/**",
    ],
  },
});
