/**
 * Verbetes, conquistas e missões do curso de Empreendedores.
 *
 * Os verbetes seguem a regra do curso: explicação em linguagem simples
 * primeiro, termo técnico depois. Quem chega aqui está no meio de uma
 * lição e não quer uma definição de dicionário — quer entender e voltar.
 */

export const VERBETES_EMPREENDEDORES = [
  {
    slug: "agente-ia",
    termo: "Agente de IA",
    sinonimos: ["agente", "assistente digital"],
    categoria: "Inteligência Artificial",
    resumo:
      "Um assistente digital a quem você entrega um objetivo e algumas regras, e que executa várias etapas de um trabalho.",
    explicacao:
      "<p>Imagine um funcionário a quem você diz: 'descubra quais clientes não compram há seis meses e prepare uma mensagem para cada um'. Ele decide como fazer — abre a planilha, filtra, escreve. Um agente de IA funciona assim.</p><p>É diferente de um chatbot, que só responde perguntas, e de uma automação, que executa passos fixos sempre na mesma ordem. O agente recebe o objetivo e escolhe o caminho.</p><p>Nos textos técnicos você verá 'executa tarefas multi-etapas com autonomia'. É isto que a frase quer dizer.</p><p><strong>Por ser ele quem decide, as regras do que ele NÃO pode fazer importam mais que as do que pode.</strong></p>",
    importancias: {
      negocio:
        "Serve para tarefa repetitiva, com regra clara e erro barato de corrigir. Nunca para preço, crédito ou questão jurídica.",
    },
  },
  {
    slug: "automacao",
    termo: "Automação",
    sinonimos: ["fluxo automático", "workflow"],
    categoria: "Processos",
    resumo:
      "Ensinar um sistema a fazer sozinho o que você faria na mão, sempre do mesmo jeito.",
    explicacao:
      "<p>Você já usa automação: o alarme do celular é uma. Chegou a hora, toca. Um gatilho e uma ação.</p><p>Num negócio, funciona igual: chegou um pedido pelo site, registra na planilha, prepara a resposta e avisa o responsável.</p><p><strong>A regra que evita problema:</strong> a automação prepara o rascunho; quem envia ao cliente é uma pessoa.</p><p>Desenhe o processo antes de abrir qualquer ferramenta. Automatizar um processo confuso só acelera a confusão.</p>",
    importancias: {
      negocio: "Comece por um processo pequeno, com começo e fim claros, cujo erro não gere prejuízo grande.",
    },
  },
  {
    slug: "alucinacao-ia",
    termo: "Alucinação",
    sinonimos: ["invenção da IA"],
    categoria: "Inteligência Artificial",
    resumo:
      "Quando a IA produz uma informação que parece certa e não é — com toda a confiança.",
    explicacao:
      "<p>Peça o telefone de um fornecedor que ela não conhece: muitas vezes ela devolve um número bem formatado, com DDD plausível. E inventado.</p><p>Não é mentira, porque não há intenção. A IA monta o texto mais provável; quando não tem o dado, completa mesmo assim.</p><p>O perigo não está no erro, e sim na confiança com que ele vem: texto hesitante a gente confere, texto seguro a gente copia e envia.</p><p><strong>Mais comum em:</strong> preço, prazo, medida, telefone, CNPJ, lei e número de norma, e fontes de pesquisa.</p>",
    importancias: {
      negocio: "Nada que tenha número, nome ou consequência sai sem conferência na fonte.",
    },
  },
  {
    slug: "prompt-negocio",
    termo: "Prompt",
    sinonimos: ["pedido", "comando"],
    categoria: "Inteligência Artificial",
    resumo: "O pedido que você escreve para a IA.",
    explicacao:
      "<p>É a instrução que você dá. Resposta vaga quase sempre é resposta a pedido vago.</p><p>Um bom pedido tem cinco partes — <strong>C.O.F.R.E.</strong>: Contexto (quem você é), Objetivo (o que quer), Formato (como deve chegar), Restrições (o que não pode) e Entrada (o material).</p><p>A parte que quase ninguém escreve é a das restrições, e é justamente a que mais muda o resultado.</p>",
    importancias: {
      negocio: "Quando a resposta vier ruim, confira quais das cinco partes faltaram.",
    },
  },
  {
    slug: "faixa-gratuidade",
    termo: "Gratuito com limites",
    sinonimos: ["plano gratuito", "free"],
    categoria: "Ferramentas",
    resumo:
      "Quase nenhuma ferramenta de IA é simplesmente grátis: você usa até certo ponto e depois espera ou paga.",
    explicacao:
      "<p>O curso classifica cada ferramenta em quatro faixas:</p><ul><li><strong>Gratuito</strong> — sem cobrança para o uso do curso</li><li><strong>Gratuito com limites</strong> — o caso mais comum: há cota diária ou mensal</li><li><strong>Pago</strong> — exige assinatura</li><li><strong>Depende do plano</strong> — existe no gratuito, mas o recurso ensinado é de plano pago</li></ul><p>Na tela de Ferramentas, cada uma mostra a faixa e o limite real, com a data em que foi conferido. Isto envelhece rápido: confirme na própria ferramenta antes de decidir assinar.</p>",
    importancias: {
      negocio: "Antes de montar um processo em cima de uma ferramenta, confira o limite do plano gratuito.",
    },
  },
  {
    slug: "anonimizar",
    termo: "Anonimizar",
    sinonimos: ["tirar dados pessoais"],
    categoria: "Segurança",
    resumo:
      "Trocar nome, telefone e documento por marcadores antes de colar algo numa IA.",
    explicacao:
      "<p>A IA não precisa saber que o cliente se chama João para escrever a resposta. Troque por CLIENTE A: o resultado é o mesmo e o dado não sai da sua casa.</p><p><strong>O que trocar:</strong> nome completo, CPF, RG, telefone, endereço, dado bancário, número de cartão, número de pedido que identifique a pessoa.</p><p>Vira hábito rápido — e evita o tipo de erro que não dá para desfazer.</p>",
    importancias: {
      negocio: "Faça antes de colar, não depois. Uma vez enviado, não há como recolher.",
    },
  },
];

export const CONQUISTAS_EMPREENDEDORES = [
  {
    chave: "emp-primeiro-prompt",
    titulo: "Primeiro pedido bem-feito",
    descricao: "Você escreveu um prompt com as cinco partes do C.O.F.R.E.",
    icone: "prompts",
    criterio: { tipo: "prompts", valor: 1 },
    ordem: 1,
  },
  {
    chave: "emp-primeiro-laboratorio",
    titulo: "Mão na massa",
    descricao: "Você concluiu seu primeiro laboratório e produziu algo usável.",
    icone: "desafios",
    criterio: { tipo: "licoes", valor: 5 },
    ordem: 2,
  },
  {
    chave: "emp-metade",
    titulo: "Meio caminho",
    descricao: "Metade do curso concluída. A parte prática começa a render.",
    icone: "trilhas",
    criterio: { tipo: "curso", valor: 50 },
    ordem: 3,
  },
  {
    chave: "emp-plano-pronto",
    titulo: "Plano na mão",
    descricao: "Você terminou o curso com um plano de adoção de IA do seu negócio.",
    icone: "conquistas",
    criterio: { tipo: "curso", valor: 100 },
    ordem: 4,
  },
];

export const MISSOES_EMPREENDEDORES = [
  {
    chave: "emp-usar-prompt-semana",
    titulo: "Use um prompt no negócio",
    descricao: "Aplique um prompt do banco numa tarefa real desta semana.",
    tipo: "SEMANAL" as const,
    criterio: "prompts",
    alvo: 3,
    icone: "prompts",
    recompensaTitulo: "Rotina mais leve",
  },
  {
    chave: "emp-laboratorio-semana",
    titulo: "Produza algo",
    descricao: "Conclua um laboratório e leve a entrega para o seu dia a dia.",
    tipo: "SEMANAL" as const,
    criterio: "licoes",
    alvo: 2,
    icone: "desafios",
    recompensaTitulo: "Entrega no bolso",
  },
];
