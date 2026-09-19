import { PROMPTS_EMPREENDEDORES, type PromptEmpreendedor } from "./prompts";
import { PROMPTS_ATENDIMENTO_VENDAS } from "./prompts-atendimento-vendas";
import { PROMPTS_MARKETING } from "./prompts-marketing";
import { PROMPTS_OPERACAO } from "./prompts-operacao";
import { PROMPTS_AUTOMACAO } from "./prompts-automacao";
import { PROMPTS_EXTRAS } from "./prompts-extras";

/**
 * O banco de prompts inteiro, reunido.
 *
 * Os prompts vivem em seis arquivos por bloco temático: um arquivo só
 * passaria de duas mil linhas e deixaria de ser navegável. A divisão é
 * por assunto, não por tipo — quem vai acrescentar um prompt de vendas
 * sabe onde procurar.
 *
 * Este arquivo existe separado do primeiro para não criar importação
 * circular: os outros cinco importam o tipo de `prompts.ts`, então é
 * `prompts.ts` que não pode importá-los de volta.
 */
export const TODOS_OS_PROMPTS: PromptEmpreendedor[] = [
  ...PROMPTS_EMPREENDEDORES,
  ...PROMPTS_ATENDIMENTO_VENDAS,
  ...PROMPTS_MARKETING,
  ...PROMPTS_OPERACAO,
  ...PROMPTS_AUTOMACAO,
  ...PROMPTS_EXTRAS,
];

/** Confere se há título repetido — a chave de idempotência do seed. */
export function titulosDuplicados(): string[] {
  const vistos = new Set<string>();
  const repetidos: string[] = [];
  for (const p of TODOS_OS_PROMPTS) {
    if (vistos.has(p.titulo)) repetidos.push(p.titulo);
    vistos.add(p.titulo);
  }
  return repetidos;
}
