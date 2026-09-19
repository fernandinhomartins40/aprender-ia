/**
 * As seções do Plano de Adoção de IA.
 *
 * Ficam aqui, e não só no conteúdo da lição, porque duas telas precisam
 * concordar sobre elas: a lição de PROJETO, que faz as perguntas, e a
 * página do plano, que apresenta as respostas. Se cada uma tivesse a sua
 * lista, uma seção nova apareceria numa e sumiria na outra.
 *
 * As chaves são o contrato com o que está gravado em `FinalProject.secoes`
 * — renomear uma delas esconde o que o cursista já escreveu.
 */

export type SecaoPlano = {
  chave: string;
  /** Título no plano impresso. */
  titulo: string;
  /** A pergunta, como a lição faz. */
  pergunta: string;
  /** Uma linha de contexto no plano, para quem lê sem ter feito o curso. */
  explicacao?: string;
  ajuda?: string;
  quantidade?: number;
};

export const PLANO_SECOES: SecaoPlano[] = [
  {
    chave: "tarefas",
    titulo: "Tarefas que se repetem toda semana",
    pergunta: "Quais três tarefas você refaz quase igual toda semana?",
    explicacao:
      "São as candidatas naturais: repetem, consomem tempo e já têm um jeito certo de fazer.",
    ajuda: "Responder as mesmas dúvidas, montar orçamento, escrever a mesma postagem.",
    quantidade: 3,
  },
  {
    chave: "oportunidades",
    titulo: "Onde a IA ajuda primeiro",
    pergunta: "Em quais três dessas tarefas a IA pode fazer uma primeira versão?",
    explicacao:
      "Primeira versão, não versão final: alguém do negócio revisa antes de o cliente ver.",
    quantidade: 3,
  },
  {
    chave: "automacao",
    titulo: "O processo a automatizar",
    pergunta: "Qual processo pequeno vale automatizar primeiro?",
    explicacao:
      "Pequeno de propósito: dá para testar, corrigir e desligar sem parar o negócio.",
    ajuda: "Escolha um que tenha começo e fim claros, e onde um erro não gere prejuízo grande.",
  },
  {
    chave: "marketing",
    titulo: "Um uso para divulgação",
    pergunta: "Que peça de divulgação a IA pode ajudar a produzir?",
    explicacao: "Uma peça concreta, com data para sair.",
  },
  {
    chave: "dados",
    titulo: "Uma pergunta sobre os números",
    pergunta: "Que pergunta sobre seus números você ainda não consegue responder?",
    explicacao:
      "O valor não está no gráfico, e sim na decisão que ele muda.",
    ajuda: "O que vende mais? Quem parou de comprar? Onde a despesa cresceu?",
  },
  {
    chave: "agente",
    titulo: "Um agente possível",
    pergunta: "Que trabalho você delegaria a um assistente digital com regras claras?",
    explicacao:
      "Com regras claras e um limite explícito: onde ele para e chama uma pessoa.",
  },
  {
    chave: "limites",
    titulo: "Onde a IA não entra",
    pergunta: "Que decisões continuam sendo só suas?",
    explicacao:
      "Preço final, crédito, contratação, questão jurídica, saúde e exceção de cliente.",
    quantidade: 2,
  },
  {
    chave: "primeiro_passo",
    titulo: "O primeiro passo, com data",
    pergunta: "O que você vai fazer nos próximos 30 dias, e quando?",
    explicacao: "Um passo, com data. Plano sem data é intenção.",
  },
];
