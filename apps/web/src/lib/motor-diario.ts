/**
 * Motor do Diário de Bordo.
 *
 * Transforma o que o professor já fez na aplicação em memória pedagógica,
 * sem pedir que ele preencha formulário nenhum.
 *
 * Por que determinístico, e não uma chamada a modelo: tudo o que este
 * arquivo faz — classificar um texto em uma de doze categorias, extrair o
 * tema de campos que o professor JÁ preencheu, montar uma frase que
 * descreve um evento — é resolvido por léxico e por leitura de campo. Isso
 * é instantâneo, funciona offline, não custa nada e, o que mais importa
 * aqui, não tem como inventar um fato que não aconteceu. A aplicação
 * inteira já segue esse princípio.
 *
 * A regra que atravessa o arquivo: FATO e INFERÊNCIA não se misturam.
 * `descrever*` só escreve o que está registrado — "usou o prompt X,
 * informou 6º ano, tema frações". Nada aqui produz "a turma foi bem" ou
 * "a atividade funcionou": isso ninguém registrou, e afirmar seria
 * inventar memória. Quando a leitura é interpretação, ela sai marcada
 * como sugestão e o professor decide.
 */

import type { CategoriaRegistro } from "@aprender/db";

/* ============================================================
   NORMALIZAÇÃO
   ============================================================ */

/** Sem acento e sem caixa, para "avaliacao" encontrar "avaliação". */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/* ============================================================
   CLASSIFICAÇÃO
   ============================================================ */

/**
 * Léxico de classificação.
 *
 * As palavras vieram do vocabulário real da aplicação — categorias e
 * `tipoAtividade` do banco de prompts, verbetes da Base de Conhecimento —
 * e não de uma lista inventada. Cada entrada é uma expressão que um
 * professor usaria de fato ao escrever sobre a própria aula.
 *
 * A ordem importa: a primeira categoria com mais pontos vence, e em
 * empate vale a que aparece antes nesta lista. Por isso DIFICULDADE e
 * ADAPTACAO vêm antes de AULA — "a aula não funcionou, adaptei" é sobre a
 * dificuldade e a adaptação, não sobre "aula" como assunto genérico.
 */
const LEXICO: { categoria: CategoriaRegistro; termos: string[] }[] = [
  {
    categoria: "DIFICULDADE",
    termos: [
      "nao funcionou", "nao deu certo", "nao consegui", "tive dificuldade",
      "foi dificil", "dificuldade", "travou", "nao entenderam",
      "nao entendeu", "nao entendi", "nao compreenderam", "nao aprenderam",
      "nao souberam", "nao acompanharam", "nao conseguiram", "nao fixaram",
      "precisa retomar", "preciso retomar", "tive que retomar",
      "confundiram", "confusao", "problema", "complicado",
      "nao rendeu", "frustrante", "nao deu tempo", "faltou tempo",
      "nao engajaram", "dispersou", "dispersaram", "bagunca",
    ],
  },
  {
    categoria: "ADAPTACAO",
    termos: [
      "adaptei", "adaptacao", "adaptar", "ajustei", "ajuste", "simplifiquei",
      "reduzi", "mudei", "modifiquei", "troquei", "refiz", "reescrevi",
      "nivel de apoio", "versao mais simples", "diferenciacao",
      "para quem tem", "acessibilidade", "inclusao", "acolher",
    ],
  },
  {
    categoria: "IDEIA_FUTURA",
    termos: [
      // "retomar" e "preciso retomar" saíram daqui de propósito: quem
      // escreve "preciso retomar" está relatando uma DIFICULDADE que
      // apareceu, não propondo uma ideia nova. Mantê-los nas duas listas
      // fazia a mesma frase pontuar dos dois lados — e a intenção real do
      // professor perdia para a repetição.
      "proxima vez", "da proxima", "quero tentar", "pretendo", "vou tentar",
      "ideia para", "na proxima aula", "depois eu", "seria bom",
      "penso em", "planejo", "anotar para",
      "no proximo bimestre", "ano que vem",
    ],
  },
  {
    categoria: "RESULTADO",
    termos: [
      "funcionou", "deu certo", "deu muito certo", "resultado",
      "os alunos conseguiram", "conseguiram", "melhorou", "evoluiram",
      "participaram bem", "engajaram", "gostaram", "rendeu",
      "superou", "atingiram", "alcancaram",
    ],
  },
  {
    categoria: "AVALIACAO",
    termos: [
      "avaliacao", "avaliar", "avaliei", "prova", "rubrica", "criterio",
      "criterios", "nota", "notas", "parecer", "pareceres", "devolutiva",
      "feedback", "diagnostico", "sondagem", "recuperacao", "reforco",
      "formativa", "somativa", "evidencia",
    ],
  },
  {
    categoria: "PLANEJAMENTO",
    termos: [
      "planejamento", "planejei", "planejar", "plano de aula", "sequencia",
      "sequencia didatica", "objetivo de aprendizagem", "objetivo pedagogico",
      "bncc", "habilidade", "competencia", "curriculo", "bimestre",
      "cronograma", "organizei a aula", "preparei a aula",
    ],
  },
  {
    categoria: "ATIVIDADE",
    termos: [
      "atividade", "exercicio", "exercicios", "tarefa", "lista",
      "material", "criei uma", "produzi", "elaborei", "montei",
      "questoes", "perguntas", "roteiro", "projeto",
    ],
  },
  {
    categoria: "ESTRATEGIA",
    termos: [
      "em grupo", "em grupos", "em duplas", "dupla", "debate", "roda de conversa",
      "sala invertida", "metodologia", "estrategia", "abordagem", "dinamica",
      "jogo", "gamificacao", "pratica", "mao na massa", "experimento",
      "expositiva", "discussao", "colaborativo",
    ],
  },
  {
    categoria: "RECURSO",
    termos: [
      "usei o", "usei a", "utilizei", "ferramenta", "chatgpt", "gemini",
      "deepseek", "claude", "notebooklm", "qwen", "projetor", "slide",
      "slides", "video", "quadro", "celular", "tablet", "impresso",
      "livro didatico", "internet",
    ],
  },
  {
    categoria: "REFLEXAO",
    termos: [
      "percebi", "aprendi", "notei", "reparei", "me dei conta",
      "reflexao", "penso que", "acho que", "senti", "acredito",
      "faz sentido", "entendi que", "fica claro",
    ],
  },
  {
    categoria: "OBSERVACAO",
    termos: [
      "observei", "observacao", "anotei", "registro", "registrei",
      "aconteceu", "hoje", "a turma", "os alunos", "a aula de hoje",
    ],
  },
  {
    categoria: "AULA",
    termos: [
      "aula", "aulas", "turma", "sala", "encontro", "periodo",
      "dei aula", "ministrei",
    ],
  },
];

/**
 * A categoria que melhor descreve um texto livre.
 *
 * Devolve `null` quando nada casa — e isso é deliberado. Um registro sem
 * categoria aparece como "Registro" na interface, o que é honesto; forçar
 * uma etiqueta errada é pior que não ter etiqueta, porque o professor
 * passa a desconfiar de todas.
 */
export function classificar(texto: string): CategoriaRegistro | null {
  const t = normalizar(texto);
  if (t.length < 3) return null;

  let melhor: { categoria: CategoriaRegistro; pontos: number } | null = null;

  for (const { categoria, termos } of LEXICO) {
    let pontos = 0;
    for (const termo of termos) {
      if (!t.includes(termo)) continue;
      // Expressão de várias palavras ("nao funcionou") é sinal muito mais
      // forte que uma palavra solta ("aula"), que aparece em quase todo
      // registro escolar.
      pontos += termo.includes(" ") ? 3 : 1;
    }
    if (pontos > 0 && (!melhor || pontos > melhor.pontos)) {
      melhor = { categoria, pontos };
    }
  }

  return melhor?.categoria ?? null;
}

/* ============================================================
   EXTRAÇÃO
   ============================================================ */

/** Disciplinas do catálogo, para reconhecer menção em texto livre. */
const DISCIPLINAS = [
  "Língua Portuguesa",
  "Matemática",
  "Ciências",
  "História e Geografia",
  "História",
  "Geografia",
  "Educação Física e Arte",
  "Educação Física",
  "Arte",
  "Educação Infantil",
  "EJA",
  "Inglês",
];

/** A disciplina mencionada num texto, se houver. */
export function extrairDisciplina(texto: string): string | null {
  const t = normalizar(texto);
  // Do nome mais longo para o mais curto: "História e Geografia" deve
  // vencer "História" quando as duas casam no mesmo ponto.
  for (const d of [...DISCIPLINAS].sort((a, b) => b.length - a.length)) {
    if (t.includes(normalizar(d))) return d;
  }
  return null;
}

/**
 * A etapa/ano mencionada num texto, preservando a forma do professor.
 *
 * "6º ano" não vira "EF06": a forma que ele escreveu é a que ele
 * reconhece quando reler isto em outubro.
 */
export function extrairEtapa(texto: string): string | null {
  const ano = /(\d)\s*(?:º|ª|o|a)?\s*(ano|serie|série)/i.exec(texto);
  if (ano) return `${ano[1]}º ${normalizar(ano[2] ?? "").startsWith("s") ? "série" : "ano"}`;

  const t = normalizar(texto);
  if (/\beja\b/.test(t)) return "EJA";
  if (/educacao infantil|infantil|creche|pre-?escola/.test(t)) return "Educação Infantil";
  if (/ensino medio|\bmedio\b/.test(t)) return "Ensino Médio";
  if (/ensino fundamental/.test(t)) return "Ensino Fundamental";
  return null;
}

/**
 * Palavras de conteúdo de um texto, para busca e para os resumos.
 *
 * Não é classificação: é só o que sobra depois de tirar as palavras que
 * não distinguem nada. Serve para o professor achar "frações" meses
 * depois sem lembrar a frase exata.
 */
const VAZIAS = new Set([
  "a","o","as","os","um","uma","de","do","da","dos","das","e","ou","que",
  "para","por","com","sem","em","no","na","nos","nas","ao","aos","se",
  "eu","me","meu","minha","isso","esse","essa","este","esta","foi","era",
  "hoje","ontem","muito","mais","menos","bem","mal","ja","tambem","ainda",
  "quando","onde","como","porque","pois","mas","entao","depois","antes",
  "fiz","fez","ter","tem","foi","ser","estar","vou","vai","aula","alunos",
  "turma","sobre","fazer","usei","criei","the","and",
]);

export function extrairMarcadores(texto: string, limite = 6): string[] {
  const vistos = new Set<string>();
  const saida: string[] = [];

  for (const bruta of normalizar(texto).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/)) {
    if (bruta.length < 4 || VAZIAS.has(bruta)) continue;
    if (vistos.has(bruta)) continue;
    vistos.add(bruta);
    saida.push(bruta);
    if (saida.length >= limite) break;
  }

  return saida;
}

/* ============================================================
   DESCRIÇÃO DE EVENTOS  (fato, nunca interpretação)
   ============================================================ */

/** O que o professor preencheu ao usar um prompt. */
export type ContextoPrompt = {
  tituloPrompt: string;
  categoria: string | null;
  disciplina: string | null;
  etapaEnsino: string | null;
  tipoAtividade: string | null;
  /** As variáveis que ELE preencheu: TEMA, ANO, DISCIPLINA, CONTEXTO… */
  variaveis: Record<string, string>;
  ferramenta: string | null;
};

/** Nome de exibição das ferramentas, para a frase não sair com o id cru. */
const NOME_FERRAMENTA: Record<string, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  deepseek: "DeepSeek",
  claude: "Claude",
  qwen: "Qwen",
  notebooklm: "NotebookLM",
};

/** Lê uma variável por qualquer um de seus nomes possíveis. */
function variavel(vars: Record<string, string>, ...chaves: string[]): string | null {
  for (const c of chaves) {
    const v = vars[c];
    if (v && v.trim()) return v.trim();
  }
  return null;
}

export type RegistroDerivado = {
  oQueFez: string;
  categoria: CategoriaRegistro | null;
  tema: string | null;
  disciplina: string | null;
  etapa: string | null;
  marcadores: string[];
  ferramenta: string | null;
};

/**
 * Descreve, como fato, o uso de um prompt.
 *
 * Tudo o que entra na frase foi informado pelo professor ou está no
 * catálogo. Não há juízo sobre resultado: dizemos que ele preparou um
 * material sobre tal tema para tal turma — não que a aula foi boa.
 *
 * Quando ele não deu contexto nenhum (nenhuma variável preenchida), a
 * frase fica sendo só o título do prompt. É pouco, mas é verdade; inflar
 * isso com adjetivo seria inventar.
 */
export function descreverUsoDePrompt(ctx: ContextoPrompt): RegistroDerivado {
  const tema = variavel(ctx.variaveis, "TEMA", "ASSUNTO", "CONTEUDO", "PROBLEMA_LOCAL", "ATIVIDADE");
  const ano = variavel(ctx.variaveis, "ANO", "SERIE", "TURMA");
  const disciplinaVar = variavel(ctx.variaveis, "DISCIPLINA", "DISCIPLINAS");
  const objetivo = variavel(ctx.variaveis, "OBJETIVO", "EVIDENCIA");
  const obstaculo = variavel(ctx.variaveis, "OBSTACULO");

  const disciplina = disciplinaVar ?? ctx.disciplina ?? null;
  const etapa = ano ?? ctx.etapaEnsino ?? null;

  // O tipo de material vem do catálogo, que é curadoria nossa e não
  // adivinhação: "planejamento de aula", "avaliação", "adaptação
  // pedagógica"…
  const tipo = ctx.tipoAtividade ?? "material";

  const partes: string[] = [`Preparou ${tipo}`];
  if (tema) partes.push(`sobre ${tema}`);
  if (disciplina) partes.push(`em ${disciplina}`);
  if (etapa) partes.push(`para ${etapa}`);

  // Sem nenhum contexto, "Preparou material" é verdade mas não serve de
  // memória: em outubro não diz nada. O título do prompt é a única coisa
  // concreta que temos — e é fato, não inferência.
  if (!tema && !disciplina && !etapa) {
    partes.push(`a partir de "${ctx.tituloPrompt}"`);
  }

  let frase = partes.join(" ");
  if (obstaculo) frase += `, a partir da dificuldade observada: ${obstaculo}`;
  else if (objetivo) frase += `, com o objetivo de ${objetivo}`;

  const ferramenta = ctx.ferramenta ? NOME_FERRAMENTA[ctx.ferramenta] ?? ctx.ferramenta : null;
  if (ferramenta) frase += ` (com ${ferramenta})`;

  // A categoria sai do catálogo quando ele a conhece — é mais confiável
  // que ler o texto. Só caímos no léxico se não houver.
  const PorCategoriaDoPrompt: Record<string, CategoriaRegistro> = {
    planejamento: "PLANEJAMENTO",
    "planejamento-avancado": "PLANEJAMENTO",
    avaliacao: "AVALIACAO",
    pareceres: "AVALIACAO",
    inclusao: "ADAPTACAO",
    materiais: "ATIVIDADE",
    projetos: "ATIVIDADE",
    rotina: "RECURSO",
    produtividade: "RECURSO",
    emergencias: "ESTRATEGIA",
    etica: "REFLEXAO",
  };
  const categoria =
    (ctx.categoria ? PorCategoriaDoPrompt[ctx.categoria] : undefined) ??
    classificar(`${ctx.tituloPrompt} ${frase}`);

  const marcadores = extrairMarcadores(
    [tema, disciplina, etapa, ctx.tituloPrompt].filter(Boolean).join(" "),
  );

  return {
    oQueFez: frase,
    categoria: categoria ?? "ATIVIDADE",
    tema,
    disciplina,
    etapa,
    marcadores,
    ferramenta: ctx.ferramenta,
  };
}

/**
 * Descreve, como fato, a conclusão de uma lição da formação.
 *
 * Vale menos que o uso de um prompt — é estudo, não prática de sala — mas
 * ajuda a reconstituir o percurso ("em maio eu estava vendo avaliação").
 */
export function descreverLicaoConcluida(titulo: string, modulo: string): RegistroDerivado {
  return {
    oQueFez: `Concluiu a lição "${titulo}" (${modulo})`,
    categoria: "REFLEXAO",
    tema: null,
    disciplina: null,
    etapa: null,
    marcadores: extrairMarcadores(`${titulo} ${modulo}`, 4),
    ferramenta: null,
  };
}

/**
 * Organiza um registro escrito à mão, PRESERVANDO o texto.
 *
 * O que o professor escreveu não é reescrito nem resumido: apenas
 * ganha categoria, tema e marcadores ao lado. A frase dele continua sendo
 * a frase dele — é o registro, e mexer nela seria trocar a memória do
 * professor pela interpretação da máquina.
 */
export function organizarRegistroManual(texto: string, observacao?: string | null): {
  categoria: CategoriaRegistro | null;
  disciplina: string | null;
  etapa: string | null;
  marcadores: string[];
} {
  const completo = [texto, observacao].filter(Boolean).join(" ");
  return {
    categoria: classificar(completo),
    disciplina: extrairDisciplina(completo),
    etapa: extrairEtapa(completo),
    marcadores: extrairMarcadores(completo),
  };
}

/* ============================================================
   RÓTULOS
   ============================================================ */

export const ROTULO_CATEGORIA: Record<CategoriaRegistro, string> = {
  AULA: "Aula",
  PLANEJAMENTO: "Planejamento",
  ATIVIDADE: "Atividade",
  AVALIACAO: "Avaliação",
  ESTRATEGIA: "Estratégia",
  DIFICULDADE: "Dificuldade",
  ADAPTACAO: "Adaptação",
  OBSERVACAO: "Observação",
  RESULTADO: "Resultado",
  IDEIA_FUTURA: "Ideia para depois",
  RECURSO: "Recurso",
  REFLEXAO: "Reflexão",
};

/** Tom de cor por categoria, para a linha do tempo ser legível de relance. */
export const TOM_CATEGORIA: Record<CategoriaRegistro, string> = {
  AULA: "selo-indigo",
  PLANEJAMENTO: "selo-indigo",
  ATIVIDADE: "selo-indigo",
  AVALIACAO: "selo-amarelo",
  ESTRATEGIA: "selo-verde",
  DIFICULDADE: "selo-vermelho",
  ADAPTACAO: "selo-amarelo",
  OBSERVACAO: "selo-cinza",
  RESULTADO: "selo-verde",
  IDEIA_FUTURA: "selo-amarelo",
  RECURSO: "selo-cinza",
  REFLEXAO: "selo-cinza",
};
