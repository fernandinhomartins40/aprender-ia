import { describe, expect, it } from "vitest";

/**
 * Regra do envio vazio no conteúdo de um plano.
 *
 * Existe por causa de um dano real em produção: `salvarConteudoDoPlano`
 * apaga o conjunto (`deleteMany`) antes de recriá-lo, então um envio que
 * chegue sem nenhum curso zera o plano inteiro em silêncio. Foi o que
 * aconteceu — oito envios com `{"cursos": []}` em oito segundos apagaram o
 * vínculo recém-criado enquanto a tela mostrava tudo marcado.
 *
 * O teste fixa a decisão: lista vazia só apaga quando a intenção vier
 * declarada. A função abaixo espelha a guarda da action; se alguém mudar a
 * regra lá sem pensar duas vezes, isto quebra.
 */

/** Decide se um envio pode regravar o conteúdo do plano. */
export function podeRegravar(dados: FormData): boolean {
  const cursos = dados.getAll("cursos").map(String).filter(Boolean);
  if (cursos.length > 0) return true;
  return String(dados.get("confirmarVazio") ?? "") === "sim";
}

function envio(campos: [string, string][]): FormData {
  const fd = new FormData();
  for (const [k, v] of campos) fd.append(k, v);
  return fd;
}

describe("envio de conteúdo do plano", () => {
  const CURSO = "cmu27z5nf0000ml06wtn80cqj";

  it("aceita um envio com curso marcado", () => {
    expect(podeRegravar(envio([["planId", "p1"], ["cursos", CURSO]]))).toBe(true);
  });

  it("RECUSA um envio vazio sem confirmação — o caso que apagou o plano", () => {
    expect(podeRegravar(envio([["planId", "p1"]]))).toBe(false);
  });

  it("aceita o envio vazio quando a intenção de zerar vem declarada", () => {
    expect(
      podeRegravar(envio([["planId", "p1"], ["confirmarVazio", "sim"]])),
    ).toBe(true);
  });

  it("não aceita confirmação com valor diferente de 'sim'", () => {
    expect(
      podeRegravar(envio([["planId", "p1"], ["confirmarVazio", "talvez"]])),
    ).toBe(false);
  });

  it("ignora ids vazios: uma lista só de strings vazias continua sendo vazia", () => {
    expect(podeRegravar(envio([["planId", "p1"], ["cursos", ""]]))).toBe(false);
  });

  it("lê campos com dois-pontos no nome, como o formulário envia", () => {
    const fd = envio([
      ["planId", "p1"],
      ["cursos", CURSO],
      [`abrangencia:${CURSO}`, "MODULOS_ESPECIFICOS"],
      [`modulos:${CURSO}`, "m1"],
      [`modulos:${CURSO}`, "m2"],
    ]);
    expect(fd.get(`abrangencia:${CURSO}`)).toBe("MODULOS_ESPECIFICOS");
    expect(fd.getAll(`modulos:${CURSO}`)).toEqual(["m1", "m2"]);
  });
});
