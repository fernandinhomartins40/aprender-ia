/**
 * Motor de análise de prompts — P.T.C.F., sem IA.
 *
 * O problema que ele resolve: até aqui as atividades de texto livre tinham
 * um botão ("Ver como avaliar a minha versão") que nem lia o que a pessoa
 * escreveu. Ele revelava um parágrafo fixo, igual para uma resposta em
 * branco e para uma resposta excelente, e esse parágrafo devolvia a
 * pergunta ao aluno: "a sua versão tem as quatro letras?". Quem não sabia
 * continuava sem saber.
 *
 * Por que análise determinística e não um modelo de linguagem:
 *
 *  1. Custo e latência — são professores usando 3G na escola; uma chamada
 *     de API por tentativa inviabiliza refazer à vontade, que é justamente
 *     o comportamento que queremos incentivar.
 *  2. Previsibilidade — o retorno precisa ser o mesmo para o mesmo texto.
 *     Um formador que projeta a atividade no encontro presencial não pode
 *     receber uma avaliação diferente a cada clique.
 *  3. Honestidade — usar IA para corrigir prompt sobre IA cria uma caixa
 *     preta dentro de um curso cujo objetivo é tirar o professor da
 *     posição de quem não entende o que a máquina faz.
 *
 * A regra P.T.C.F. é detectável por marcadores linguísticos concretos em
 * português, e é por isso que isto funciona sem modelo: cada letra tem um
 * conjunto pequeno e estável de formas como aparece na escrita real.
 *
 * O que este motor NÃO faz, de propósito: julgar se o prompt é "bom".
 * Ele relata presença, ausência e vagueza de cada dimensão. A diferença
 * importa — "não encontrei Contexto" é verificável; "seu prompt é fraco"
 * é opinião e desmotiva quem já chega inseguro.
 */

/** As quatro letras. A ordem é a da sigla e a das telas. */
export type Dimensao = "papel" | "tarefa" | "contexto" | "formato";

/**
 * Três estados, não dois.
 *
 * "generico" é o estado que dá valor pedagógico ao motor. Quem escreve
 * "para meus alunos" cumpre a forma do Contexto sem cumprir a função:
 * a IA continua sem saber a idade. Tratar isso como ausência seria
 * injusto (a pessoa tentou) e como presença seria inútil (ela não
 * aprenderia nada). É o caso mais comum entre professores iniciantes.
 */
export type Estado = "ok" | "generico" | "ausente";

export type AnaliseDimensao = {
  dimensao: Dimensao;
  estado: Estado;
  /** Nome da letra como aparece na tela. */
  rotulo: string;
  /** O trecho do próprio aluno que disparou a detecção, quando houve. */
  trecho?: string;
  /** O que dizer a esta pessoa sobre esta letra, agora. */
  retorno: string;
};

export type Analise = {
  dimensoes: AnaliseDimensao[];
  /** Quantas letras chegaram a "ok". 0 a 4. */
  completas: number;
  /** Frase única no topo do resultado. */
  veredito: string;
  /** Texto curto demais para valer análise. */
  vazio: boolean;
};

/* ============================================================
   NORMALIZAÇÃO
   ============================================================ */

/**
 * Minúsculas e sem acento, preservando as posições.
 *
 * Preservar posição é requisito, não detalhe: os trechos citados no
 * retorno são recortados do texto ORIGINAL usando índices encontrados no
 * texto normalizado. Se a normalização encurtasse a string (removendo
 * pontuação, por exemplo), os índices não bateriam e o motor citaria o
 * pedaço errado da frase do aluno — pior do que não citar nada.
 *
 * `slugificar` em lib/assinaturas.ts faz algo parecido, mas colapsa
 * caracteres e por isso não serve aqui.
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Recorta o trecho original em volta de uma posição, sem cortar palavra. */
function recortar(original: string, inicio: number, tamanho: number): string {
  const fim = Math.min(original.length, inicio + tamanho);
  let corte = original.slice(inicio, fim).trim();
  // Não terminar no meio de uma palavra: some a última se houve corte.
  if (fim < original.length && !/\s$/.test(original.slice(fim, fim + 1))) {
    corte = corte.replace(/\s+\S*$/, "");
  }
  return corte;
}

/** Primeira ocorrência de qualquer padrão, com o trecho original. */
function procurar(
  original: string,
  texto: string,
  padroes: RegExp[],
): { achou: boolean; trecho?: string } {
  for (const p of padroes) {
    const m = p.exec(texto);
    if (m && m.index >= 0) {
      return { achou: true, trecho: recortar(original, m.index, 70) };
    }
  }
  return { achou: false };
}

/* ============================================================
   MARCADORES
   ============================================================
   Os padrões abaixo saíram da escrita real de professores, não de uma
   gramática ideal. Por isso aceitam formas coloquiais ("finja que você
   é", "monta uma atividade") e o infinitivo, que é como muita gente
   escreve pedido ("criar uma atividade" em vez de "crie"). */

/** P — a IA assume um papel. */
const PAPEL = [
  /\b(aja|atue|haja)\s+como\b/,
  /\b(voce|vc)\s+(e|eh|sera|seria)\s+(um|uma|o|a)\b/,
  /\b(assuma|adote)\s+(o\s+)?papel\b/,
  /\b(finja|imagine)\s+que\s+(voce|vc)\b/,
  /\b(como|sendo)\s+(um|uma)\s+(professor|professora|especialista|coordenador|coordenadora|pedagogo|pedagoga|tutor|tutora|revisor|revisora|psicopedagog)/,
  /\bse\s+passe\s+por\b/,
];

/**
 * Papel dito, mas sem dizer qual.
 *
 * "Aja como um profissional" cumpre a forma e não informa nada — a IA
 * não muda de comportamento com isso.
 */
const PAPEL_VAGO = [
  /\b(aja|atue)\s+como\s+(um|uma)?\s*(profissional|especialista|pessoa|alguem|assistente|ia|inteligencia)\b/,
  /\b(voce|vc)\s+e\s+(um|uma)\s+(ia|assistente|robo|maquina)\b/,
];

/** T — o que fazer. Imperativo ou infinitivo, que é como se escreve pedido. */
const TAREFA = [
  /\b(crie|criar|elabore|elaborar|escreva|escrever|monte|montar|faca|fazer|gere|gerar|produza|produzir|prepare|preparar|desenvolva|desenvolver|redija|redigir|adapte|adaptar|corrija|corrigir|resuma|resumir|reescreva|reescrever|transforme|transformar|liste|listar|sugira|sugerir|explique|explicar|planeje|planejar|organize|organizar|proponha|propor|construa|construir|monta|cria|faz)\b/,
  /\b(preciso|quero|gostaria|necessito)\s+(de\s+)?(um|uma|que)\b/,
  /\bme\s+(ajude|ajuda|de|da)\b/,
];

/**
 * C — a realidade da turma. A letra mais esquecida e a que mais muda o
 * resultado, então é a que o motor examina com mais cuidado.
 */
const CONTEXTO = [
  // Ano, série, etapa — o dado isolado mais valioso.
  /\b\d{1,2}\s*[oa°º]?\s*(ano|serie)\b/,
  /\b(primeiro|segundo|terceiro|quarto|quinto|sexto|setimo|oitavo|nono)\s+ano\b/,
  /\b(ensino\s+(fundamental|medio)|fundamental\s+(i|ii|1|2)|eja|educacao\s+infantil|pre[\s-]?escola|creche)\b/,
  // Idade explícita.
  /\b(\d{1,2}\s*(a|ate|e)\s*\d{1,2}\s*anos|\d{1,2}\s*anos\s+de\s+idade|criancas\s+de\s+\d{1,2})\b/,
  // Tamanho e composição da turma.
  /\b(turma\s+de\s+\d+|\d+\s+alunos|\d+\s+estudantes|sala\s+com\s+\d+)\b/,
  // Recursos e limitações da escola — contexto de escola pública real.
  /\b(escola\s+(publica|municipal|estadual|rural|do\s+campo)|sem\s+(internet|computador|projetor|impressora)|nao\s+(tem|temos|ha)\s+(internet|computador|projetor)|apenas\s+(quadro|lousa)|poucos\s+recursos|baixo\s+custo|material\s+reciclado)\b/,
  // Perfil e dificuldades.
  /\b(com\s+(dificuldade|defasagem|laudo|tdah|tea|autismo|dislexia|deficiencia)|nao\s+alfabetizad|alfabetizacao|inclusao|nivel\s+(basico|iniciante))\b/,
  // Território.
  /\b(zona\s+rural|periferia|comunidade|cidade\s+pequena|interior|assentamento|quilombola|indigena|ribeirinh)/,
];

/** Contexto dito sem informação: cumpre a forma, não a função. */
const CONTEXTO_VAGO = [
  /\bpara\s+(meus|minhas|os|as)\s+(alunos|alunas|estudantes|criancas)\b/,
  /\bpara\s+(a\s+)?(minha\s+)?turma\b/,
  /\bda\s+minha\s+escola\b/,
  /\bpara\s+(a\s+)?escola\b/,
  /\bpara\s+(criancas|jovens|adolescentes)\b/,
];

/** F — como a resposta deve chegar. */
const FORMATO = [
  /\b(em\s+forma(to)?\s+de|no\s+formato|formatad[oa]|em\s+topicos|em\s+tabela|numa\s+tabela|em\s+lista|em\s+bullet)\b/,
  /\b(tabela|lista\s+numerada|quadro|planilha|slide|cartaz|roteiro|passo\s+a\s+passo|cronograma)\b/,
  /\b(pronto\s+para\s+(imprimir|impressao)|uma\s+folha|folha\s+a4|meia\s+folha|para\s+imprimir)\b/,
  // Quantidade também é formato: "5 questões" diz o tamanho da entrega.
  /\b\d+\s+(questoes|perguntas|exercicios|atividades|itens|paragrafos|linhas|palavras|exemplos|topicos|slides|partes|etapas|versoes|niveis)\b/,
  /\b(divid[ao]\s+em|separad[oa]\s+em|com\s+(gabarito|cabecalho|titulo)|inclua\s+(um|uma)?\s*(gabarito|resposta))\b/,
  /\b(maximo\s+de\s+\d+|no\s+maximo\s+\d+|ate\s+\d+\s+(linhas|palavras|paragrafos))\b/,
];

/* ============================================================
   RETORNOS
   ============================================================
   Cada estado tem texto próprio. A regra de escrita: dizer o que fazer
   em seguida, com exemplo concreto do universo de quem lê — nunca
   devolver a pergunta ("tem contexto?") nem julgar a pessoa. */

const RETORNOS: Record<Dimensao, Record<Estado, string>> = {
  papel: {
    ok: "Você disse quem a IA deve ser. Isso muda o vocabulário e a profundidade da resposta inteira.",
    generico:
      'Você deu um papel, mas genérico demais para mudar alguma coisa. "Especialista" em quê? Troque por algo como "professora de Geografia do 6º ano da rede municipal".',
    ausente:
      'Faltou o Papel. Comece dizendo quem a IA deve ser — "Aja como professor(a) de Ciências do 5º ano". Sem isso ela responde como enciclopédia, não como colega de profissão.',
  },
  tarefa: {
    ok: "A Tarefa está clara: dá para saber o que você quer receber.",
    generico:
      "O verbo está lá, mas o objeto ficou solto. Diga o que exatamente deve ser produzido: uma atividade? um plano? um texto? sobre qual conteúdo?",
    ausente:
      'Faltou a Tarefa — o pedido em si. Use um verbo de ação no começo: "Crie...", "Elabore...", "Reescreva...". É a letra que a IA obedece.',
  },
  contexto: {
    ok: "Contexto presente, e é o que mais separa um resultado usável de um genérico. A IA agora sabe para quem está escrevendo.",
    generico:
      'Aqui está o ponto que mais muda o resultado. Você escreveu algo como "para meus alunos" — mas a IA não conhece a sua turma. Qual ano? Que idade? A escola tem projetor, internet, impressora? Tem aluno com laudo ou em defasagem? Uma turma de 3º ano e uma de 9º recebem coisas muito diferentes.',
    ausente:
      "Faltou o Contexto — a letra mais esquecida e a mais valiosa. Acrescente a sua realidade: ano/idade da turma, quantos alunos, o que a escola tem e o que não tem. É o que faz a resposta servir para a SUA sala e não para uma sala qualquer.",
  },
  formato: {
    ok: "Você disse como quer receber. É o que faz a resposta sair pronta, sem precisar de ajuste depois.",
    generico:
      "Dê um formato mais concreto: quantos itens, em tabela ou em lista, com gabarito, em quantas folhas.",
    ausente:
      'Faltou o Formato. Diga como quer receber — "em uma tabela", "5 questões com gabarito", "em uma folha, pronto para imprimir". Sem isso vem um texto corrido que você ainda vai ter que reorganizar.',
  },
};

const ROTULOS: Record<Dimensao, string> = {
  papel: "Papel",
  tarefa: "Tarefa",
  contexto: "Contexto",
  formato: "Formato",
};

/* ============================================================
   ANÁLISE
   ============================================================ */

/**
 * Abaixo disto não há o que analisar, e apontar "faltou Papel, Tarefa,
 * Contexto e Formato" para quem escreveu três palavras é ruído, não
 * ensino. O motor pede o texto em vez de reprovar.
 */
const MINIMO_CARACTERES = 15;

function avaliarDimensao(
  dimensao: Dimensao,
  original: string,
  texto: string,
  fortes: RegExp[],
  vagos: RegExp[] = [],
): AnaliseDimensao {
  const forte = procurar(original, texto, fortes);
  const vago = vagos.length > 0 ? procurar(original, texto, vagos) : { achou: false };

  // Ordem importa: um texto pode ter as duas marcas ("para meus alunos do
  // 5º ano"). A marca forte vence — a informação está lá, ainda que
  // acompanhada de uma expressão vaga.
  //
  // A exceção é o Papel: "aja como um especialista" casa com o padrão
  // forte E com o vago, e nesse caso o vago é que descreve a verdade.
  if (dimensao === "papel" && vago.achou) {
    return {
      dimensao,
      estado: "generico",
      rotulo: ROTULOS[dimensao],
      trecho: vago.trecho,
      retorno: RETORNOS[dimensao].generico,
    };
  }

  if (forte.achou) {
    return {
      dimensao,
      estado: "ok",
      rotulo: ROTULOS[dimensao],
      trecho: forte.trecho,
      retorno: RETORNOS[dimensao].ok,
    };
  }

  if (vago.achou) {
    return {
      dimensao,
      estado: "generico",
      rotulo: ROTULOS[dimensao],
      trecho: vago.trecho,
      retorno: RETORNOS[dimensao].generico,
    };
  }

  return {
    dimensao,
    estado: "ausente",
    rotulo: ROTULOS[dimensao],
    retorno: RETORNOS[dimensao].ausente,
  };
}

/**
 * Frase do topo.
 *
 * Nunca começa por elogio vazio nem por reprovação. Nomeia o que está
 * feito e aponta a próxima ação — inclusive no caso perfeito, onde a
 * próxima ação é usar o prompt de verdade.
 */
function montarVeredito(dimensoes: AnaliseDimensao[]): string {
  const completas = dimensoes.filter((d) => d.estado === "ok");
  const faltando = dimensoes.filter((d) => d.estado !== "ok");

  if (faltando.length === 0) {
    return "As quatro letras estão presentes. Este prompt está pronto para ser usado numa ferramenta de IA de verdade — teste e veja a diferença.";
  }

  const nomes = faltando.map((d) => d.rotulo);
  const lista =
    nomes.length === 1
      ? nomes[0]
      : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;

  if (completas.length === 0) {
    return `Ainda não identifiquei nenhuma das quatro letras. Veja abaixo por onde começar — o Papel costuma ser o mais fácil.`;
  }

  return `${completas.length} de 4 letras prontas. Falta trabalhar: ${lista}.`;
}

/**
 * Marcadores `[ASSIM]` que sobraram sem preencher.
 *
 * Nas lições de prompt pronto, o corpo é escrito por nós e já contém
 * "materiais de baixo custo", "alunos com defasagem", "3 versões" — que
 * são marcadores legítimos de Contexto e Formato QUANDO a pessoa os
 * escreve, mas aqui são texto nosso. Medido: o prompt da lição 7 sem
 * nenhum campo preenchido dava 4 de 4 letras, e quem clicasse em
 * "Conferir" sem digitar nada receberia "as quatro letras estão
 * presentes" — o falso elogio que este motor existe para eliminar.
 *
 * A regra é sobre a AUTORIA, não sobre as palavras: enquanto o campo
 * está vazio, o texto ao redor dele não é resposta de ninguém. Os
 * padrões continuam certos; o que muda é quanto do texto conta.
 */
const MARCADOR_VAZIO = /\[([A-ZÀ-Ú0-9_ /]+)\]/;

/** Analisa o texto escrito pelo aluno. Função pura: mesma entrada, mesma saída. */
export function analisarPtcf(entrada: string): Analise {
  const original = (entrada ?? "").trim();

  // Um prompt com marcador por preencher não é um prompt: é um modelo.
  // Dizer qual campo falta é mais útil do que analisar o molde e
  // devolver um resultado que não descreve o trabalho de ninguém.
  const pendente = MARCADOR_VAZIO.exec(original);
  if (pendente) {
    return {
      dimensoes: [],
      completas: 0,
      vazio: true,
      veredito: `Preencha os campos acima antes de conferir — ainda falta ${pendente[1]?.toLowerCase() ?? "um campo"}. A análise lê o prompt pronto, do jeito que ele vai chegar à IA.`,
    };
  }

  if (original.length < MINIMO_CARACTERES) {
    return {
      dimensoes: [],
      completas: 0,
      vazio: true,
      veredito:
        "Escreva a sua versão do prompt no campo acima — pelo menos uma frase — e eu mostro, letra por letra, o que já está lá e o que falta.",
    };
  }

  const texto = normalizar(original);

  const dimensoes: AnaliseDimensao[] = [
    avaliarDimensao("papel", original, texto, PAPEL, PAPEL_VAGO),
    avaliarDimensao("tarefa", original, texto, TAREFA),
    avaliarDimensao("contexto", original, texto, CONTEXTO, CONTEXTO_VAGO),
    avaliarDimensao("formato", original, texto, FORMATO),
  ];

  return {
    dimensoes,
    completas: dimensoes.filter((d) => d.estado === "ok").length,
    vazio: false,
    veredito: montarVeredito(dimensoes),
  };
}

/** Uma única composição para o criador guiado e o gerador inteligente. */
export function montarPromptPtcf({ papel, tarefa, contexto, formato, revisao }: Record<Dimensao | "revisao", string>) {
  return `Papel: ${papel || "[papel desejado]"}.\n\nTarefa: ${tarefa || "[o que você quer produzir]"}.\n\nContexto: ${contexto || "[turma, tempo, recursos e restrições]"}.\n\nFormato: ${formato || "[como quer receber a resposta]"}.\n\nAntes de finalizar, verifique: ${revisao || "fatos, adequação pedagógica, acessibilidade e privacidade"}. Se faltar informação, faça até 3 perguntas objetivas antes de responder.`;
}
