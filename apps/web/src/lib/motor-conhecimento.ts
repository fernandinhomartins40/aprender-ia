/**
 * Motor de consulta da Base de Conhecimento.
 *
 * Resolve em código o que não precisa de IA: encontrar o verbete que
 * responde a uma pergunta escrita em linguagem natural, reconhecer um
 * código da BNCC digitado e ordenar resultados por relevância.
 *
 * Por que determinístico, e não uma chamada a modelo: as perguntas reais
 * ("o que é BNCC?", "qual a diferença entre competência e habilidade?",
 * "o que significa EF05CI05?") são casadas com um acervo fechado de
 * algumas dezenas de verbetes. Busca por termo, sinônimo e palavra do
 * resumo resolve isso com resposta instantânea, offline, sem custo e —
 * o que mais importa aqui — sem risco de inventar definição. O acervo é
 * a fonte; o motor só acha a entrada certa dentro dele.
 *
 * Nada neste arquivo afirma o conteúdo de uma habilidade da BNCC. A
 * leitura de código explica a ESTRUTURA (etapa, ano, componente) a partir
 * das tabelas oficiais de siglas, e sempre manda conferir a descrição no
 * documento. Componente desconhecido vira "não identificado", nunca um
 * palpite.
 */

export type VerbeteBusca = {
  slug: string;
  termo: string;
  sinonimos: string[];
  categoria: string;
  resumo: string;
  explicacao: string;
};

/** Remove acentos e caixa, para que "avaliacao" encontre "avaliação". */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Palavras que não ajudam a discriminar um verbete.
 *
 * Sem esta lista, "o que é BNCC?" daria peso às palavras "que" e "é", e
 * qualquer verbete cujo texto as contenha entraria no resultado — ou
 * seja, todos.
 */
const VAZIAS = new Set([
  "o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das", "e", "ou",
  "que", "qual", "quais", "quem", "como", "onde", "quando", "por", "para",
  "pra", "em", "no", "na", "nos", "nas", "com", "sem", "se", "eu", "me",
  "meu", "minha", "isso", "esse", "essa", "este", "esta", "aquilo", "ele",
  "ela", "significa", "significam", "quer", "dizer", "e'", "eh", "sao",
  "seria", "ser", "estou", "nao", "entendi", "entender", "explique",
  "explica", "diferenca", "entre", "sobre", "mais", "muito", "ao", "aos",
  "à", "as", "pode", "posso", "devo", "tem", "ter", "faz", "fazer", "usar",
  "uso", "qualquer", "algum", "alguma", "tudo", "nada", "aqui", "la",
]);

function palavrasUteis(consulta: string): string[] {
  return normalizar(consulta)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((p) => p.length > 2 && !VAZIAS.has(p));
}

/**
 * Pontua o quanto um verbete responde à consulta.
 *
 * Os pesos seguem o quanto cada casamento é informativo: bater com o nome
 * do termo é quase certeza; com sinônimo, quase o mesmo (é para isso que
 * sinônimo existe); com resumo é sinal razoável; com o corpo da
 * explicação é só indício — a palavra pode aparecer de passagem.
 *
 * Devolve 0 quando nada casa, e quem chama descarta.
 */
export function pontuar(v: VerbeteBusca, consulta: string): number {
  const q = normalizar(consulta);
  if (!q) return 0;

  const termo = normalizar(v.termo);
  const sinonimos = v.sinonimos.map(normalizar);

  // Casamento exato do termo ou de um sinônimo: a pessoa digitou o nome.
  if (termo === q || sinonimos.includes(q)) return 1000;

  let pontos = 0;

  // A consulta inteira contida no termo (ou o contrário) — "bncc" dentro
  // de "código da bncc", ou "competência" digitado por extenso.
  if (termo.includes(q) || q.includes(termo)) pontos += 300;
  if (sinonimos.some((s) => s.includes(q) || q.includes(s))) pontos += 260;

  const palavras = palavrasUteis(consulta);
  if (palavras.length === 0) return pontos;

  const resumo = normalizar(v.resumo);
  const explicacao = normalizar(v.explicacao);
  const categoria = normalizar(v.categoria);

  for (const p of palavras) {
    if (termo.includes(p)) pontos += 120;
    else if (sinonimos.some((s) => s.includes(p))) pontos += 90;
    else if (categoria.includes(p)) pontos += 35;

    if (resumo.includes(p)) pontos += 25;
    else if (explicacao.includes(p)) pontos += 8;
  }

  // Pergunta com duas palavras fortes ("competência" e "habilidade") deve
  // premiar quem casa as duas, não quem casa uma delas muitas vezes.
  const casadas = palavras.filter(
    (p) => termo.includes(p) || sinonimos.some((s) => s.includes(p)) || resumo.includes(p),
  ).length;
  if (casadas > 1) pontos += casadas * 40;

  return pontos;
}

/** Verbetes que respondem à consulta, do mais relevante ao menos. */
export function buscar<T extends VerbeteBusca>(itens: T[], consulta: string): T[] {
  if (!consulta.trim()) return itens;
  return itens
    .map((v) => ({ v, p: pontuar(v, consulta) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p || a.v.termo.localeCompare(b.v.termo, "pt-BR"))
    .map((x) => x.v);
}

// ---------------------------------------------------------------- BNCC

/**
 * Siglas de etapa e de componente/área, conforme o documento oficial.
 *
 * Servem apenas para LER a estrutura de um código que o professor
 * digitou. Nenhuma descrição de habilidade é inferida daqui: a descrição
 * só existe no documento oficial, e é para lá que a interface manda.
 */
const ETAPAS: Record<string, string> = {
  EI: "Educação Infantil",
  EF: "Ensino Fundamental",
  EM: "Ensino Médio",
};

const COMPONENTES: Record<string, string> = {
  LP: "Língua Portuguesa",
  MA: "Matemática",
  CI: "Ciências",
  GE: "Geografia",
  HI: "História",
  AR: "Arte",
  EF: "Educação Física",
  ER: "Ensino Religioso",
  LI: "Língua Inglesa",
  // Áreas do Ensino Médio.
  LGG: "Linguagens e suas Tecnologias",
  MAT: "Matemática e suas Tecnologias",
  CNT: "Ciências da Natureza e suas Tecnologias",
  CHS: "Ciências Humanas e Sociais Aplicadas",
};

/** Códigos de campo de experiência da Educação Infantil (EI). */
const CAMPOS_EI: Record<string, string> = {
  EO: "O eu, o outro e o nós",
  CG: "Corpo, gestos e movimentos",
  TS: "Traços, sons, cores e formas",
  EF: "Escuta, fala, pensamento e imaginação",
  ET: "Espaços, tempos, quantidades, relações e transformações",
};

export type LeituraCodigo = {
  codigo: string;
  etapa: string;
  /** Ano, bloco de anos ou faixa etária, conforme a etapa. */
  periodo: string;
  /** Componente, área ou campo de experiência; null quando a sigla é desconhecida. */
  componente: string | null;
  sequencial: string;
  /** Ressalvas: o que esta leitura não garante. */
  ressalva: string;
};

/**
 * Reconhece um código da BNCC num texto e lê a sua estrutura.
 *
 * Devolve `null` quando não há código reconhecível — a consulta então é
 * tratada como busca normal.
 *
 * O que esta função NÃO faz: dizer qual é a habilidade. Ela decompõe o
 * identificador e manda conferir no documento oficial. Um código com
 * estrutura válida pode simplesmente não existir na Base (é o erro
 * clássico de IA), e só a consulta ao documento resolve isso.
 */
export function lerCodigoBncc(texto: string): LeituraCodigo | null {
  const limpo = texto.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Educação Infantil: EI + faixa (2 díg.) + campo (2 letras) + seq (2 díg.)
  const ei = /EI(\d{2})([A-Z]{2})(\d{2})/.exec(limpo);
  if (ei) {
    const faixa = ei[1] ?? "";
    const campo = ei[2] ?? "";
    const seq = ei[3] ?? "";
    const FAIXAS: Record<string, string> = {
      "01": "bebês (zero a 1 ano e 6 meses)",
      "02": "crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)",
      "03": "crianças pequenas (4 anos a 5 anos e 11 meses)",
    };
    return {
      codigo: `EI${faixa}${campo}${seq}`,
      etapa: ETAPAS.EI ?? "Educação Infantil",
      periodo: FAIXAS[faixa] ?? `grupo etário ${faixa} (não identificado)`,
      componente: CAMPOS_EI[campo] ?? null,
      sequencial: seq,
      ressalva:
        "Na Educação Infantil a BNCC define objetivos de aprendizagem e desenvolvimento por campo de experiência. Confira a redação no documento oficial.",
    };
  }

  // Ensino Médio: EM + 2 díg. + área (3 letras) + seq (3 díg.)
  const em = /EM(\d{2})([A-Z]{3})(\d{3})/.exec(limpo);
  if (em) {
    const bloco = em[1] ?? "";
    const area = em[2] ?? "";
    const seq = em[3] ?? "";
    return {
      codigo: `EM${bloco}${area}${seq}`,
      etapa: ETAPAS.EM ?? "Ensino Médio",
      periodo: "Ensino Médio (habilidades não são divididas por ano)",
      componente: COMPONENTES[area] ?? null,
      sequencial: seq,
      ressalva:
        "No Ensino Médio as habilidades se organizam por área do conhecimento, e cada rede define a distribuição por ano. Confira a redação no documento oficial.",
    };
  }

  // Ensino Fundamental: EF + ano/bloco (2 díg.) + componente (2 letras) + seq (2 díg.)
  const ef = /EF(\d{2})([A-Z]{2})(\d{2})/.exec(limpo);
  if (ef) {
    const ano = ef[1] ?? "";
    const comp = ef[2] ?? "";
    const seq = ef[3] ?? "";
    const n = Number(ano);
    // Blocos de anos usam o par de extremos: 15 = 1º ao 5º, 69 = 6º ao 9º.
    const periodo =
      n >= 1 && n <= 9
        ? `${n}º ano`
        : ano === "15"
          ? "1º ao 5º ano (bloco)"
          : ano === "69"
            ? "6º ao 9º ano (bloco)"
            : ano === "35"
              ? "3º ao 5º ano (bloco)"
              : ano === "12"
                ? "1º e 2º ano (bloco)"
                : ano === "67"
                  ? "6º e 7º ano (bloco)"
                  : ano === "89"
                    ? "8º e 9º ano (bloco)"
                    : `anos ${ano} (bloco não identificado)`;
    return {
      codigo: `EF${ano}${comp}${seq}`,
      etapa: ETAPAS.EF ?? "Ensino Fundamental",
      periodo,
      componente: COMPONENTES[comp] ?? null,
      sequencial: seq,
      ressalva:
        "Esta leitura decompõe o identificador. A descrição da habilidade — o que ela realmente pede — está no documento oficial, e é ela que deve orientar a decisão pedagógica.",
    };
  }

  return null;
}

/**
 * A consulta parece pedir habilidades para um tema e uma turma?
 *
 * Reconhecemos a intenção para responder com honestidade: a plataforma
 * não tem a tabela de habilidades da BNCC, e inventar código seria o pior
 * resultado possível. Detectar o pedido permite orientar a busca no
 * documento oficial, com a etapa e o tema que a pessoa já escreveu.
 */
export function pedidoDeHabilidade(consulta: string): { tema: string; etapa: string | null } | null {
  const q = normalizar(consulta);

  // Uma pergunta conceitual ("o que é BNCC?", "o que é habilidade?") NÃO
  // é pedido de habilidade por tema: ela é respondida pelo verbete, e o
  // aviso sobre a tabela oficial só atrapalharia. Descartamos antes de
  // qualquer outro teste.
  if (/^(o\s+que|que|qual|quais|quando|quem|por\s*que|onde|como)\b/.test(q)) return null;
  if (/(diferenca|significa|significam|conceito|definicao)/.test(q)) return null;

  // Precisa das DUAS coisas: mencionar habilidade/código E descrever uma
  // intenção de aula. Só "bncc" na frase é conversa sobre o documento,
  // não busca de habilidade para um conteúdo.
  const pedeHabilidade = /(habilidade|codigo|alinhad)/.test(q);
  const descreveIntencao =
    /(quero|preciso|trabalhar|atividade|aula|planejar|ensinar|turma|serie|série|\bano\b|infantil|fundamental|medio)/.test(
      q,
    );
  if (!pedeHabilidade || !descreveIntencao) return null;

  const ano = /(\d)\s*(?:º|o|a)?\s*(?:ano|serie|série)/.exec(q);
  const infantil = /(infantil|creche|pre-?escola|bercario)/.test(q);
  const medio = /(medio|médio)/.test(q);

  const etapa = ano
    ? `${ano[1]}º ano do Ensino Fundamental`
    : infantil
      ? "Educação Infantil"
      : medio
        ? "Ensino Médio"
        : null;

  // Extração do tema: tiramos o pedido ("quero trabalhar", "preciso de"),
  // o vocabulário de habilidade/BNCC e a indicação de turma, e o que
  // sobra é o conteúdo. Fica no fim de propósito — se a limpeza não
  // deixar nada reconhecível, devolvemos a frase original, que ao menos
  // é o que a pessoa escreveu.
  const tema = consulta
    .replace(/^\s*(?:eu\s+)?(?:quero|queria|preciso|gostaria\s+de|pretendo)\s+/i, "")
    .replace(/^\s*(?:de\s+)?(?:trabalhar|ensinar|planejar|dar|criar|fazer)\s+/i, "")
    .replace(/\b(?:uma?\s+)?(?:atividade|aula|sequencia|sequência|plano)\s+(?:de\s+|sobre\s+)?/gi, "")
    .replace(/\b(?:com\s+|as\s+|os\s+|de\s+)?habilidades?\b/gi, "")
    .replace(/\b(?:códigos?|codigos?)\b/gi, "")
    .replace(/\bda\s+bncc\b/gi, "")
    .replace(/\bbncc\b/gi, "")
    .replace(/\b(?:alinhad[oa]s?)\b/gi, "")
    // "sobre" e "de" ficam órfãos depois das remoções acima
    // ("habilidade sobre frações" → "sobre frações").
    .replace(/^\s*(?:sobre|de|da|do|para)\s+/i, "")
    // A indicação de turma já foi capturada em `etapa`: aqui ela só suja
    // o tema ("meio ambiente do 5º ano" → "meio ambiente").
    .replace(/\b(?:para|com|no|na|d[oa])\s+(?:a\s+)?(?:minha\s+|uma\s+)?turma\b.*/i, "")
    // O artigo entre a preposição e o número é opcional: "para o 6º ano",
    // "no 5º ano", "da 3ª série".
    .replace(/\b(?:para|com|no|na|d[oa]|em)\s+(?:[oa]s?\s+)?\d\s*(?:º|ª|o|a)?\s*(?:ano|serie|série)\b.*/i, "")
    .replace(/\b\d\s*(?:º|o|a)?\s*(?:ano|serie|série)\b.*/i, "")
    // A preposição que antecede a etapa sai junto: "leitura para a
    // Educação Infantil" → "leitura".
    .replace(/\b(?:(?:para|com|no|na|n[oa]s|d[oa]|em)\s+(?:[oa]s?\s+)?)?(?:educacao|educação)\s+infantil\b.*/i, "")
    .replace(/\b(?:(?:para|com|no|na|n[oa]s|d[oa]|em)\s+(?:[oa]s?\s+)?)?ensino\s+(?:medio|médio|fundamental)\b.*/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,.;:–-]+|[\s,.;:–-]+$/g, "")
    .trim();

  return { tema: tema || consulta.trim(), etapa };
}
