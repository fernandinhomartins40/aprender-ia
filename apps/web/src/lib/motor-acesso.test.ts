import { describe, expect, it } from "vitest";
import {
  assinaturaVale,
  calcularAcesso,
  cursosAlcancados,
  podeVerCurso,
  podeVerModulo,
  temAcessoPago,
  type AlunoParaAcesso,
  type AssinaturaParaAcesso,
  type CursoDoPlano,
  type StatusAssinatura,
} from "./motor-acesso";

/**
 * Os 18 cenários de acesso.
 *
 * Testam a regra pura, sem banco: é ela que decide tudo, e uma regressão
 * aqui significa aluno vendo o que não comprou ou pagante barrado do que
 * pagou.
 */

const HOJE = new Date("2026-06-15T12:00:00Z");
const ONTEM = new Date("2026-06-14T12:00:00Z");
const MES_QUE_VEM = new Date("2026-07-15T12:00:00Z");

const CURSO_A = "curso-a";
const CURSO_B = "curso-b";
const MOD_1 = "mod-1";
const MOD_2 = "mod-2";
const MOD_3 = "mod-3";

function cursoCompleto(courseId: string): CursoDoPlano {
  return { courseId, abrangencia: "CURSO_COMPLETO", moduleIds: [] };
}

function cursoParcial(courseId: string, moduleIds: string[]): CursoDoPlano {
  return { courseId, abrangencia: "MODULOS_ESPECIFICOS", moduleIds };
}

function assinatura(
  nome: string,
  cursos: CursoDoPlano[],
  extra: Partial<AssinaturaParaAcesso> & { gratuito?: boolean } = {},
): AssinaturaParaAcesso {
  const { gratuito = false, ...resto } = extra;
  return {
    id: `sub-${nome}`,
    status: "ATIVA" as StatusAssinatura,
    cicloFimEm: MES_QUE_VEM,
    semExpiracao: false,
    plano: { id: `plano-${nome}`, nome, gratuito, cursos },
    ...resto,
  };
}

function aluno(assinaturas: AssinaturaParaAcesso[], extra: Partial<AlunoParaAcesso> = {}): AlunoParaAcesso {
  return { papel: "ALUNO", situacao: "ATIVO", assinaturas, ...extra };
}

/* ------------------------------------------------------------ */

describe("1. aluno sem plano pago recebe o acesso do plano gratuito", () => {
  it("alcança o que o FREE libera e nada além", () => {
    const free = assinatura("Gratuito", [cursoParcial(CURSO_A, [MOD_1])], {
      gratuito: true,
      cicloFimEm: null, // o gratuito não tem ciclo de cobrança
    });
    const acesso = calcularAcesso(aluno([free]), HOJE);

    expect(podeVerModulo(acesso, CURSO_A, MOD_1).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_A, MOD_2).permitido).toBe(false);
    expect(podeVerCurso(acesso, CURSO_B).permitido).toBe(false);
  });

  it("sem assinatura nenhuma, não alcança nada", () => {
    const acesso = calcularAcesso(aluno([]), HOJE);
    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(false);
    expect(cursosAlcancados(acesso)).toEqual([]);
  });
});

describe("2. aluno com plano pago recebe o conteúdo correspondente", () => {
  it("curso completo libera qualquer módulo, inclusive um criado depois", () => {
    const acesso = calcularAcesso(aluno([assinatura("Pro", [cursoCompleto(CURSO_A)])]), HOJE);

    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_A, "modulo-que-nem-existia").permitido).toBe(true);
  });
});

describe("3. FREE + plano pago somam", () => {
  it("mantém o gratuito e acrescenta o pago", () => {
    const free = assinatura("Gratuito", [cursoParcial(CURSO_A, [MOD_1])], {
      gratuito: true,
      cicloFimEm: null,
    });
    const pago = assinatura("Pro", [cursoCompleto(CURSO_B)]);
    const acesso = calcularAcesso(aluno([free, pago]), HOJE);

    expect(podeVerModulo(acesso, CURSO_A, MOD_1).permitido).toBe(true);
    expect(podeVerCurso(acesso, CURSO_B).permitido).toBe(true);
    expect(cursosAlcancados(acesso).sort()).toEqual([CURSO_A, CURSO_B]);
  });
});

describe("4. dois planos pagos simultâneos", () => {
  it("o acesso é a união dos dois", () => {
    const acesso = calcularAcesso(
      aluno([
        assinatura("Pro", [cursoCompleto(CURSO_A)]),
        assinatura("Avançada", [cursoParcial(CURSO_B, [MOD_1, MOD_2])]),
      ]),
      HOJE,
    );

    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_B, MOD_1).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_B, MOD_2).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_B, MOD_3).permitido).toBe(false);
  });
});

describe("5 e 6. abrangência do plano", () => {
  it("curso completo não depende de listar módulos", () => {
    const acesso = calcularAcesso(aluno([assinatura("P", [cursoCompleto(CURSO_A)])]), HOJE);
    const doCurso = acesso.porCurso.get(CURSO_A);
    expect(doCurso?.tipo).toBe("completo");
  });

  it("módulos específicos liberam só os listados", () => {
    const acesso = calcularAcesso(aluno([assinatura("P", [cursoParcial(CURSO_A, [MOD_2])])]), HOJE);
    expect(podeVerModulo(acesso, CURSO_A, MOD_2).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_A, MOD_1).permitido).toBe(false);
  });

  it("plano que lista o curso sem nenhum módulo não dá acesso", () => {
    const acesso = calcularAcesso(aluno([assinatura("P", [cursoParcial(CURSO_A, [])])]), HOJE);
    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(false);
  });
});

describe("7. dois planos sobre o MESMO curso", () => {
  it("o mais generoso vence — completo absorve parcial", () => {
    const acesso = calcularAcesso(
      aluno([
        assinatura("Parcial", [cursoParcial(CURSO_A, [MOD_1])]),
        assinatura("Completo", [cursoCompleto(CURSO_A)]),
      ]),
      HOJE,
    );

    expect(acesso.porCurso.get(CURSO_A)?.tipo).toBe("completo");
    expect(podeVerModulo(acesso, CURSO_A, MOD_3).permitido).toBe(true);
  });

  it("a ordem não importa: parcial depois de completo não rebaixa", () => {
    const acesso = calcularAcesso(
      aluno([
        assinatura("Completo", [cursoCompleto(CURSO_A)]),
        assinatura("Parcial", [cursoParcial(CURSO_A, [MOD_1])]),
      ]),
      HOJE,
    );

    expect(acesso.porCurso.get(CURSO_A)?.tipo).toBe("completo");
    expect(podeVerModulo(acesso, CURSO_A, MOD_3).permitido).toBe(true);
  });

  it("dois planos parciais somam os módulos", () => {
    const acesso = calcularAcesso(
      aluno([
        assinatura("A", [cursoParcial(CURSO_A, [MOD_1])]),
        assinatura("B", [cursoParcial(CURSO_A, [MOD_2])]),
      ]),
      HOJE,
    );

    expect(podeVerModulo(acesso, CURSO_A, MOD_1).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_A, MOD_2).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_A, MOD_3).permitido).toBe(false);
  });

  it("um plano expirado não derruba o acesso dado por outro válido", () => {
    const acesso = calcularAcesso(
      aluno([
        assinatura("Vencido", [cursoParcial(CURSO_A, [MOD_1])], { cicloFimEm: ONTEM }),
        assinatura("Vigente", [cursoCompleto(CURSO_A)]),
      ]),
      HOJE,
    );

    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(true);
    expect(podeVerModulo(acesso, CURSO_A, MOD_3).permitido).toBe(true);
  });
});

describe("8 e 9. plano expirado e cancelado", () => {
  it("prazo vencido não dá acesso", () => {
    const acesso = calcularAcesso(
      aluno([assinatura("Pro", [cursoCompleto(CURSO_A)], { cicloFimEm: ONTEM })]),
      HOJE,
    );
    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(false);
  });

  it("status EXPIRADA não dá acesso, mesmo com prazo no futuro", () => {
    const acesso = calcularAcesso(
      aluno([assinatura("Pro", [cursoCompleto(CURSO_A)], { status: "EXPIRADA" })]),
      HOJE,
    );
    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(false);
  });

  it("cancelada ainda dentro do ciclo pago MANTÉM o acesso", () => {
    // Quem pagou o mês tem direito ao mês, mesmo cancelando no dia
    // seguinte. Cortar na hora seria cobrar por serviço não prestado.
    const acesso = calcularAcesso(
      aluno([assinatura("Pro", [cursoCompleto(CURSO_A)], { status: "CANCELADA" })]),
      HOJE,
    );
    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(true);
  });

  it("cancelada com o ciclo já vencido perde o acesso", () => {
    const acesso = calcularAcesso(
      aluno([
        assinatura("Pro", [cursoCompleto(CURSO_A)], { status: "CANCELADA", cicloFimEm: ONTEM }),
      ]),
      HOJE,
    );
    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(false);
  });
});

describe("10 e 11. recorrente ativo e cancelado", () => {
  it("recorrente ativo dentro do ciclo dá acesso", () => {
    expect(assinaturaVale(assinatura("Mensal", []), HOJE).vale).toBe(true);
  });

  it("inadimplente vale até o fim do ciclo pago, e não depois", () => {
    const dentro = assinatura("Mensal", [], { status: "INADIMPLENTE" });
    const fora = assinatura("Mensal", [], { status: "INADIMPLENTE", cicloFimEm: ONTEM });

    expect(assinaturaVale(dentro, HOJE).vale).toBe(true);
    expect(assinaturaVale(fora, HOJE).vale).toBe(false);
  });

  it("suspensa pela administração não vale, mesmo com prazo em aberto", () => {
    const s = assinatura("Mensal", [], { status: "SUSPENSA" });
    const r = assinaturaVale(s, HOJE);
    expect(r.vale).toBe(false);
    expect(r.vale === false && r.motivo).toBe("suspensa");
  });
});

describe("12. compra única", () => {
  it("com prazo, vale até a data", () => {
    const comprou = assinatura("Premium", [cursoCompleto(CURSO_A)], { cicloFimEm: MES_QUE_VEM });
    expect(assinaturaVale(comprou, HOJE).vale).toBe(true);
    expect(assinaturaVale(comprou, new Date("2026-08-01T00:00:00Z")).vale).toBe(false);
  });

  it("vitalício vale sempre, mesmo anos depois", () => {
    const vitalicio = assinatura("Vitalício", [cursoCompleto(CURSO_A)], {
      semExpiracao: true,
      cicloFimEm: ONTEM,
    });
    expect(assinaturaVale(vitalicio, new Date("2040-01-01T00:00:00Z")).vale).toBe(true);
  });
});

describe("13, 14 e 15. administração manual", () => {
  it("acrescentar uma assinatura acrescenta o acesso imediatamente", () => {
    const semNada = aluno([]);
    expect(podeVerCurso(calcularAcesso(semNada, HOJE), CURSO_A).permitido).toBe(false);

    const comPlano = aluno([assinatura("Cortesia", [cursoCompleto(CURSO_A)], {
      concedidaManualmente: true,
    } as never)]);
    expect(podeVerCurso(calcularAcesso(comPlano, HOJE), CURSO_A).permitido).toBe(true);
  });

  it("remover a assinatura remove o acesso", () => {
    const antes = aluno([assinatura("Pro", [cursoCompleto(CURSO_A)])]);
    expect(podeVerCurso(calcularAcesso(antes, HOJE), CURSO_A).permitido).toBe(true);

    const depois = aluno([]);
    expect(podeVerCurso(calcularAcesso(depois, HOJE), CURSO_A).permitido).toBe(false);
  });

  it("encurtar a data corta o acesso a partir dela", () => {
    const s = assinatura("Pro", [cursoCompleto(CURSO_A)], { cicloFimEm: MES_QUE_VEM });
    expect(calcularAcesso(aluno([s]), HOJE).porCurso.has(CURSO_A)).toBe(true);

    const encurtada = { ...s, cicloFimEm: ONTEM };
    expect(calcularAcesso(aluno([encurtada]), HOJE).porCurso.has(CURSO_A)).toBe(false);
  });
});

describe("16, 17 e 18. bloqueio, liberação e acesso direto por URL", () => {
  it("módulo fora do plano é bloqueado com motivo próprio", () => {
    const acesso = calcularAcesso(aluno([assinatura("P", [cursoParcial(CURSO_A, [MOD_1])])]), HOJE);
    const r = podeVerModulo(acesso, CURSO_A, MOD_3);

    expect(r.permitido).toBe(false);
    expect(r.permitido === false && r.motivo).toBe("modulo-fora-do-plano");
  });

  it("ativar libera na hora, sem esperar nada", () => {
    const pendente = assinatura("Pro", [cursoCompleto(CURSO_A)], { status: "PENDENTE" });
    expect(podeVerCurso(calcularAcesso(aluno([pendente]), HOJE), CURSO_A).permitido).toBe(false);

    const ativa = { ...pendente, status: "ATIVA" as StatusAssinatura };
    expect(podeVerCurso(calcularAcesso(aluno([ativa]), HOJE), CURSO_A).permitido).toBe(true);
  });

  it("URL direta de curso que ele não tem é barrada", () => {
    const acesso = calcularAcesso(aluno([assinatura("P", [cursoCompleto(CURSO_A)])]), HOJE);
    const r = podeVerCurso(acesso, CURSO_B);

    expect(r.permitido).toBe(false);
    expect(r.permitido === false && r.motivo).toBe("sem-plano");
  });

  it("URL direta de módulo de curso que ele não tem é barrada", () => {
    const acesso = calcularAcesso(aluno([assinatura("P", [cursoCompleto(CURSO_A)])]), HOJE);
    expect(podeVerModulo(acesso, CURSO_B, MOD_1).permitido).toBe(false);
  });

  it("conta suspensa bloqueia tudo, inclusive o gratuito", () => {
    const free = assinatura("Gratuito", [cursoCompleto(CURSO_A)], {
      gratuito: true,
      cicloFimEm: null,
    });
    const acesso = calcularAcesso(aluno([free], { situacao: "SUSPENSO" }), HOJE);

    expect(acesso.contaSuspensa).toBe(true);
    expect(podeVerCurso(acesso, CURSO_A).permitido).toBe(false);
    expect(cursosAlcancados(acesso)).toEqual([]);
  });

  it("ADMIN enxerga tudo, para revisar antes de publicar", () => {
    const acesso = calcularAcesso(aluno([], { papel: "ADMIN" }), HOJE);
    expect(podeVerCurso(acesso, "qualquer-curso").permitido).toBe(true);
    expect(podeVerModulo(acesso, "qualquer", "modulo").permitido).toBe(true);
  });
});

describe("espelho do enum legado", () => {
  it("só o gratuito não conta como acesso pago", () => {
    const free = assinatura("Gratuito", [], { gratuito: true, cicloFimEm: null });
    expect(temAcessoPago(aluno([free]), HOJE)).toBe(false);
  });

  it("plano pago válido conta", () => {
    expect(temAcessoPago(aluno([assinatura("Pro", [])]), HOJE)).toBe(true);
  });

  it("plano pago vencido não conta", () => {
    const vencido = assinatura("Pro", [], { cicloFimEm: ONTEM });
    expect(temAcessoPago(aluno([vencido]), HOJE)).toBe(false);
  });
});
