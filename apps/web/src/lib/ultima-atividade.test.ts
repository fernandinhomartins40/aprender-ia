import { describe, expect, it } from "vitest";
import { agruparUltimaAtividade } from "./ultima-atividade";

/**
 * Agrupamento da última atividade por aluno.
 *
 * Esta função substituiu um `lessonProgress.findFirst` que rodava uma vez POR
 * ALUNO dentro do laço de engajamento — N consultas viraram uma. A troca só é
 * segura se o valor devolvido for EXATAMENTE o mesmo que o `findFirst`
 * devolvia: a conclusão mais recente daquele aluno.
 *
 * Se divergir, o efeito não é um erro visível: é o cálculo de inatividade
 * ficar errado e o aluno receber (ou deixar de receber) lembrete na hora
 * errada. Por isso os casos abaixo cobrem também o que "não deveria
 * acontecer" — matrícula órfã, data nula, aluno sem atividade.
 */

const ANTIGO = new Date("2026-06-01T10:00:00Z");
const MEIO = new Date("2026-06-10T10:00:00Z");
const RECENTE = new Date("2026-06-20T10:00:00Z");

describe("agruparUltimaAtividade", () => {
  it("mapeia a matrícula de volta para o aluno", () => {
    const resultado = agruparUltimaAtividade(
      [{ enrollmentId: "m1", _max: { concluidoEm: MEIO } }],
      [{ id: "m1", userId: "aluno-1" }],
    );

    expect(resultado.get("aluno-1")).toEqual(MEIO);
    expect(resultado.size).toBe(1);
  });

  it("com vários cursos, vale a conclusão MAIS RECENTE", () => {
    // É o caso que justifica a função existir: o groupBy devolve uma linha por
    // matrícula, e o aluno matriculado em três cursos apareceria três vezes.
    const resultado = agruparUltimaAtividade(
      [
        { enrollmentId: "m1", _max: { concluidoEm: ANTIGO } },
        { enrollmentId: "m2", _max: { concluidoEm: RECENTE } },
        { enrollmentId: "m3", _max: { concluidoEm: MEIO } },
      ],
      [
        { id: "m1", userId: "aluno-1" },
        { id: "m2", userId: "aluno-1" },
        { id: "m3", userId: "aluno-1" },
      ],
    );

    expect(resultado.get("aluno-1")).toEqual(RECENTE);
    expect(resultado.size).toBe(1);
  });

  it("independe da ordem em que as linhas chegam", () => {
    // O groupBy não garante ordenação. Se a função dependesse da ordem, o
    // resultado mudaria entre execuções — e o bug seria intermitente.
    const crescente = agruparUltimaAtividade(
      [
        { enrollmentId: "m1", _max: { concluidoEm: ANTIGO } },
        { enrollmentId: "m2", _max: { concluidoEm: RECENTE } },
      ],
      [
        { id: "m1", userId: "aluno-1" },
        { id: "m2", userId: "aluno-1" },
      ],
    );
    const decrescente = agruparUltimaAtividade(
      [
        { enrollmentId: "m2", _max: { concluidoEm: RECENTE } },
        { enrollmentId: "m1", _max: { concluidoEm: ANTIGO } },
      ],
      [
        { id: "m1", userId: "aluno-1" },
        { id: "m2", userId: "aluno-1" },
      ],
    );

    expect(crescente.get("aluno-1")).toEqual(RECENTE);
    expect(decrescente.get("aluno-1")).toEqual(RECENTE);
  });

  it("separa alunos diferentes", () => {
    const resultado = agruparUltimaAtividade(
      [
        { enrollmentId: "m1", _max: { concluidoEm: ANTIGO } },
        { enrollmentId: "m2", _max: { concluidoEm: RECENTE } },
      ],
      [
        { id: "m1", userId: "aluno-1" },
        { id: "m2", userId: "aluno-2" },
      ],
    );

    expect(resultado.get("aluno-1")).toEqual(ANTIGO);
    expect(resultado.get("aluno-2")).toEqual(RECENTE);
  });

  it("ignora data nula em vez de gravar entrada inválida", () => {
    // `_max.concluidoEm` vem nulo quando não há progresso concluído. Gravar
    // isso no mapa faria o laço tratar como se houvesse atividade.
    const resultado = agruparUltimaAtividade(
      [{ enrollmentId: "m1", _max: { concluidoEm: null } }],
      [{ id: "m1", userId: "aluno-1" }],
    );

    expect(resultado.has("aluno-1")).toBe(false);
    expect(resultado.size).toBe(0);
  });

  it("ignora matrícula sem aluno correspondente", () => {
    // As duas consultas não são atômicas: uma matrícula pode ser apagada
    // entre elas. O resultado deve ser silencioso, não uma exceção no meio
    // do processamento de todos os alunos.
    const resultado = agruparUltimaAtividade(
      [{ enrollmentId: "m-fantasma", _max: { concluidoEm: RECENTE } }],
      [{ id: "m1", userId: "aluno-1" }],
    );

    expect(resultado.size).toBe(0);
  });

  it("aluno sem nenhuma atividade não entra no mapa", () => {
    // O laço trata a ausência caindo para ultimoAcessoEm/criadoEm. Uma
    // entrada indevida aqui mudaria o cálculo de dias de inatividade.
    const resultado = agruparUltimaAtividade([], [{ id: "m1", userId: "aluno-1" }]);

    expect(resultado.has("aluno-1")).toBe(false);
  });

  it("não quebra com as duas listas vazias", () => {
    expect(agruparUltimaAtividade([], []).size).toBe(0);
  });
});
