import type { PromptEmpreendedor } from "./prompts";

/**
 * Completa as áreas que ficaram mais finas depois dos quatro primeiros
 * blocos — Redes sociais, Estoque, Compras, Documentos —, e acrescenta
 * situações que aparecem no dia a dia e não se encaixavam em nenhum dos
 * temas anteriores.
 */

const v = (chave: string, rotulo: string, exemplo: string) => ({ chave, rotulo, exemplo });

export const PROMPTS_EXTRAS: PromptEmpreendedor[] = [
  /* ---------------- REDES SOCIAIS ---------------- */
  {
    titulo: "Responder comentário chato sem entrar em briga",
    corpo:
      "Contexto: recebi este comentário público: [COMENTARIO]. O contexto real é: [CONTEXTO].\nObjetivo: responder de um jeito que encerre o assunto.\nFormato: uma resposta curta, e a indicação de quando é melhor não responder nada.\nRestrições: não ironize, não responda a provocação, não apague sem avaliar. Se o melhor for ignorar, diga.",
    categoria: "Redes sociais",
    setor: "Marketing",
    dica:
      "A permissão de não responder é o que falta a quase todo mundo. Nem todo comentário merece resposta.",
    exemploPreenchido:
      "Contexto: comentário dizendo 'esse preço é roubo'. Contexto real: é o preço de mercado, e o produto tem garantia de 2 anos.",
    variaveis: [
      v("COMENTARIO", "O comentário", "cole aqui"),
      v("CONTEXTO", "O contexto real", "explique a situação"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["comentário", "reputação"],
  },
  {
    titulo: "Descobrir o melhor horário para publicar",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e meu público é [PUBLICO]. Seguem os dados dos meus últimos posts, com dia, horário e alcance: [DADOS].\nObjetivo: saber quando publicar.\nFormato: os horários com melhor resultado, o que os dados mostram e o que ainda seria preciso testar.\nRestrições: não use regra geral de internet — analise os meus dados. Se forem poucos posts para concluir, diga.",
    categoria: "Redes sociais",
    setor: "Marketing",
    dica:
      "Receita pronta de 'melhor horário' ignora o seu público. Seus próprios dados valem mais que qualquer lista.",
    exemploPreenchido:
      "Contexto: meu negócio é uma confeitaria e meu público são mães de escola. Seguem 30 posts com dia, horário e alcance.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "confeitaria"),
      v("PUBLICO", "Seu público", "mães de escola"),
      v("DADOS", "Dados dos posts", "cole a tabela"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Intermediário",
    tags: ["horário", "alcance", "dados"],
  },
  {
    titulo: "Roteiro para aparecer em vídeo sem travar",
    corpo:
      "Contexto: tenho vergonha de aparecer, mas preciso gravar sobre [ASSUNTO] para o meu [NEGOCIO].\nObjetivo: um roteiro que me deixe confortável.\nFormato: tópicos em vez de texto decorado, com a primeira e a última frase escritas por extenso, e o que fazer se eu errar no meio.\nRestrições: nada de texto para ler; quero falar naturalmente. Máximo de 5 tópicos.",
    categoria: "Redes sociais",
    setor: "Marketing",
    dica:
      "Tópicos, não texto: quem lê parece que está lendo. Só a primeira e a última frase valem decorar.",
    exemploPreenchido:
      "Contexto: tenho vergonha de aparecer, mas preciso gravar sobre os cuidados com jardim no inverno.",
    variaveis: [
      v("ASSUNTO", "O assunto", "cuidados com jardim no inverno"),
      v("NEGOCIO", "Seu negócio", "paisagismo"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["vídeo", "roteiro", "vergonha"],
  },
  {
    titulo: "Conteúdo que atrai quem ainda não me conhece",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e quase todo meu público já é cliente.\nObjetivo: conteúdo que alcance quem ainda não me conhece.\nFormato: 6 ideias de assunto que interessem a quem tem o problema mas ainda não procura solução, com o gancho de cada uma.\nRestrições: nada que fale do meu produto; o assunto tem de interessar mesmo a quem nunca vai comprar de mim.",
    categoria: "Redes sociais",
    setor: "Marketing",
    dica:
      "Conteúdo que só fala do próprio produto só alcança quem já comprou. O assunto precisa valer sozinho.",
    exemploPreenchido:
      "Contexto: meu negócio é uma loja de material de construção e quase todo meu público já é cliente.",
    variaveis: [v("NEGOCIO", "Seu negócio", "material de construção")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["alcance", "topo de funil"],
  },

  /* ---------------- ESTOQUE ---------------- */
  {
    titulo: "Organizar o estoque fisicamente",
    corpo:
      "Contexto: meu [NEGOCIO] tem [ESPACO] de estoque e os itens são: [ITENS]. Hoje está bagunçado.\nObjetivo: uma organização que a equipe consiga manter.\nFormato: critério de organização, o que fica ao alcance da mão, como identificar as posições e a regra de reposição na prateleira.\nRestrições: nada que exija reforma ou prateleira nova; o que mais sai tem de ficar mais perto de quem separa.",
    categoria: "Estoque",
    setor: "Estoque",
    dica:
      "O critério simples — o que mais sai fica mais perto — resolve mais que qualquer sistema elaborado.",
    exemploPreenchido:
      "Contexto: minha distribuidora tem um depósito de 40m² e cerca de 300 itens de bebida. Hoje está bagunçado.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "distribuidora"),
      v("ESPACO", "Espaço disponível", "40m²"),
      v("ITENS", "Tipos de item", "300 itens de bebida"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["organização", "depósito"],
  },
  {
    titulo: "Controlar validade e evitar perda",
    corpo:
      "Contexto: trabalho com [PRODUTOS] que têm validade. Hoje controlo assim: [COMO].\nObjetivo: parar de perder produto vencido.\nFormato: como registrar, com que antecedência agir, o que fazer com o que está perto de vencer, e a rotina de conferência.\nRestrições: nada que exija sistema que eu não tenho; a rotina tem de caber em 10 minutos por dia.",
    categoria: "Estoque",
    setor: "Estoque",
    dica:
      "Definir a antecedência da ação é o que muda o jogo: agir 30 dias antes permite promoção; 3 dias antes, só descarte.",
    exemploPreenchido:
      "Contexto: trabalho com laticínios e frios. Hoje controlo olhando a gôndola quando lembro.",
    variaveis: [
      v("PRODUTOS", "Os produtos", "laticínios e frios"),
      v("COMO", "Como controla hoje", "olhando quando lembro"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Intermediário",
    tags: ["validade", "perda", "perecível"],
  },
  {
    titulo: "Preparar o estoque para a alta temporada",
    corpo:
      "Contexto: meu [NEGOCIO] vende muito mais em [PERIODO]. No ano passado vendi [VENDA_ANTERIOR] e faltou [FALTOU] / sobrou [SOBROU].\nObjetivo: acertar melhor este ano.\nFormato: o que comprar a mais, quando comprar, o que evitar exagerar, e o plano B se a demanda for menor que o esperado.\nRestrições: baseie-se no que eu informei do ano anterior; não presuma crescimento sem eu dizer.",
    categoria: "Estoque",
    setor: "Estoque",
    dica:
      "O plano B para demanda menor é o que salva o caixa. Comprar para a alta e não vender trava o ano inteiro.",
    exemploPreenchido:
      "Contexto: minha loja de brinquedos vende muito mais em dezembro. Ano passado vendi 900 peças, faltou os dois itens mais pedidos e sobrou muito material escolar.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "loja de brinquedos"),
      v("PERIODO", "Período de alta", "dezembro"),
      v("VENDA_ANTERIOR", "Venda do ano passado", "900 peças"),
      v("FALTOU", "O que faltou", "os dois mais pedidos"),
      v("SOBROU", "O que sobrou", "material escolar"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["temporada", "compra", "previsão"],
  },

  /* ---------------- COMPRAS ---------------- */
  {
    titulo: "Avaliar um fornecedor novo antes de comprar",
    corpo:
      "Contexto: encontrei um fornecedor novo de [O_QUE] com preço [COMPARACAO] do meu atual.\nObjetivo: avaliar antes de trocar.\nFormato: o que verificar antes do primeiro pedido, como fazer um pedido-teste, os sinais de alerta, e o que manter do fornecedor atual durante a transição.\nRestrições: não recomende trocar tudo de uma vez, mesmo que o preço seja muito melhor.",
    categoria: "Compras",
    setor: "Compras",
    dica:
      "Preço muito abaixo do mercado costuma ter explicação. Pedido-teste antes de trocar é o mínimo.",
    exemploPreenchido:
      "Contexto: encontrei um fornecedor novo de embalagens com preço 30% abaixo do meu atual.",
    variaveis: [
      v("O_QUE", "O que ele fornece", "embalagens"),
      v("COMPARACAO", "Comparação de preço", "30% abaixo"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["fornecedor", "risco", "troca"],
  },
  {
    titulo: "Decidir entre comprar e alugar",
    corpo:
      "Contexto: preciso de [EQUIPAMENTO] no meu [NEGOCIO]. Comprar custa [COMPRA]; alugar, [ALUGUEL] por [PERIODO]. Vou usar [FREQUENCIA].\nObjetivo: decidir com clareza.\nFormato: em quanto tempo a compra se paga, o que cada opção exige de manutenção e espaço, o risco de cada uma, e a partir de que uso a compra passa a valer.\nRestrições: considere que equipamento parado também custa; não decida por mim.",
    categoria: "Compras",
    setor: "Compras",
    dica:
      "A conta de quando a compra se paga é simples, e quase ninguém faz. Costuma mudar a decisão.",
    exemploPreenchido:
      "Contexto: preciso de uma plataforma elevatória. Comprar custa R$ 28 mil; alugar, R$ 900 por dia. Vou usar umas 15 vezes por ano.",
    variaveis: [
      v("EQUIPAMENTO", "O equipamento", "plataforma elevatória"),
      v("NEGOCIO", "Seu negócio", "empresa de manutenção"),
      v("COMPRA", "Custo de compra", "R$ 28 mil"),
      v("ALUGUEL", "Custo de aluguel", "R$ 900"),
      v("PERIODO", "Por período", "por dia"),
      v("FREQUENCIA", "Frequência de uso", "15 vezes por ano"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["investimento", "decisão"],
  },
  {
    titulo: "Reclamar de um produto ou serviço com firmeza",
    corpo:
      "Contexto: comprei [O_QUE] de [FORNECEDOR_TIPO] e o problema é: [PROBLEMA]. O que já tentei: [TENTATIVAS].\nObjetivo: uma reclamação formal que resolva.\nFormato: o histórico em ordem, o problema objetivo, o que eu quero como solução e o prazo que dou para resposta.\nRestrições: nada de ameaça; cite o que foi combinado e o que não foi cumprido. Mantenha o tom firme e factual.",
    categoria: "Compras",
    setor: "Compras",
    dica:
      "Histórico em ordem e pedido específico resolvem mais que indignação. Diga exatamente o que você quer.",
    exemploPreenchido:
      "Contexto: comprei uma máquina de um fornecedor e ela chegou com defeito. Já liguei três vezes e abri um chamado, sem retorno há 20 dias.",
    variaveis: [
      v("O_QUE", "O que comprou", "uma máquina"),
      v("FORNECEDOR_TIPO", "De quem", "fornecedor de equipamentos"),
      v("PROBLEMA", "O problema", "chegou com defeito"),
      v("TENTATIVAS", "O que já tentou", "3 ligações e 1 chamado"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["reclamação", "fornecedor"],
  },

  /* ---------------- DOCUMENTOS ---------------- */
  {
    titulo: "Modelo de recibo e comprovante",
    corpo:
      "Contexto: preciso emitir [DOCUMENTO] no meu [NEGOCIO], para [SITUACAO].\nObjetivo: um modelo que eu reutilize.\nFormato: o modelo com os campos indicados entre colchetes, e a explicação do que vai em cada um.\nRestrições: não substitui nota fiscal; diga claramente quando a nota é obrigatória e que isso é assunto para o contador.",
    categoria: "Documentos",
    setor: "Administrativo",
    dica:
      "Recibo não substitui nota. O prompt deixa isso explícito de propósito — é confusão comum e cara.",
    exemploPreenchido:
      "Contexto: preciso emitir recibo de sinal de serviço na minha empresa de reformas, para entrada de 30%.",
    variaveis: [
      v("DOCUMENTO", "Que documento", "recibo de sinal"),
      v("NEGOCIO", "Seu negócio", "empresa de reformas"),
      v("SITUACAO", "Para qual situação", "entrada de 30%"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["recibo", "modelo", "limite"],
  },
  {
    titulo: "Manual de uso para entregar ao cliente",
    corpo:
      "Contexto: entrego [PRODUTO_SERVICO] e os clientes sempre perguntam [DUVIDAS].\nObjetivo: um material curto para entregar junto.\nFormato: como usar, o que evitar, o que é normal acontecer, quando chamar assistência e como falar comigo.\nRestrições: linguagem simples, cabe em uma folha frente e verso; nada de termo técnico sem explicação.",
    categoria: "Documentos",
    setor: "Atendimento",
    dica:
      "O 'o que é normal acontecer' corta metade dos chamados. As pessoas ligam por comportamento esperado.",
    exemploPreenchido:
      "Contexto: entrego móveis planejados e os clientes sempre perguntam sobre limpeza e sobre estalos na madeira.",
    variaveis: [
      v("PRODUTO_SERVICO", "O que você entrega", "móveis planejados"),
      v("DUVIDAS", "Dúvidas comuns", "limpeza e estalos"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["manual", "pós-venda"],
  },
  {
    titulo: "Traduzir documento técnico para a equipe",
    corpo:
      "Contexto: recebi este documento técnico: [DOCUMENTO]. Minha equipe precisa entender [O_QUE_IMPORTA].\nObjetivo: uma versão que a equipe leia e use.\nFormato: o que muda na prática do dia a dia, o passo a passo do que fazer, e o que continua igual.\nRestrições: não simplifique a ponto de perder informação obrigatória; marque o que é regra e o que é recomendação.",
    categoria: "Documentos",
    setor: "Administrativo",
    dica:
      "Separar regra de recomendação evita os dois erros: tratar sugestão como obrigação e obrigação como sugestão.",
    exemploPreenchido:
      "Contexto: recebi a nova norma de manuseio de alimentos da vigilância. A equipe precisa entender o que muda na cozinha.",
    variaveis: [
      v("DOCUMENTO", "O documento", "cole ou descreva"),
      v("O_QUE_IMPORTA", "O que importa", "o que muda na cozinha"),
    ],
    ferramentasSugeridas: ["claude-negocios", "notebooklm-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["norma", "equipe", "tradução"],
  },
  {
    titulo: "Apresentação para uma reunião importante",
    corpo:
      "Contexto: vou apresentar [ASSUNTO] para [PUBLICO] em [TEMPO]. O que quero que aconteça depois: [OBJETIVO].\nObjetivo: a estrutura da apresentação.\nFormato: quantos slides, o que vai em cada um, o que falar sem estar no slide, e a pergunta difícil que devo esperar.\nRestrições: no máximo um assunto por slide; nada de slide com parágrafo. Comece pelo que a pessoa quer saber, não pela sua história.",
    categoria: "Documentos",
    setor: "Vendas",
    dica:
      "Comece pelo que o outro quer saber. Apresentação que abre com 'quem somos' perde a atenção no primeiro minuto.",
    exemploPreenchido:
      "Contexto: vou apresentar uma proposta de fornecimento para o comprador de uma rede de mercados, em 20 minutos. Quero sair com um pedido-teste.",
    variaveis: [
      v("ASSUNTO", "O assunto", "proposta de fornecimento"),
      v("PUBLICO", "Para quem", "comprador de rede de mercados"),
      v("TEMPO", "Tempo", "20 minutos"),
      v("OBJETIVO", "O que quer que aconteça", "sair com pedido-teste"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["apresentação", "reunião"],
  },

  /* ---------------- FINANCEIRO E DADOS ---------------- */
  {
    titulo: "Descobrir o cliente que dá mais trabalho que retorno",
    corpo:
      "Contexto: seguem meus clientes por código, com faturamento e uma estimativa de horas que consomem: [DADOS].\nObjetivo: saber quais compensam.\nFormato: retorno por hora de cada um, os que mais e os menos compensam, e o que fazer com os do fim da lista — renegociar, ajustar escopo ou encerrar.\nRestrições: considere que cliente pequeno pode trazer indicação; não conclua só pelo número.",
    categoria: "Análise de dados",
    setor: "Financeiro",
    dica:
      "Quase todo negócio tem um cliente que consome 30% do tempo e traz 5% do faturamento. Achar é o primeiro passo.",
    exemploPreenchido:
      "Contexto: seguem meus 20 clientes por código, com faturamento anual e horas estimadas de atendimento.",
    variaveis: [v("DADOS", "Seus dados", "cole a tabela")],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Avançado",
    tags: ["rentabilidade", "cliente"],
  },
  {
    titulo: "Simular o efeito de mudar um preço",
    corpo:
      "Contexto: vendo [PRODUTO] a [PRECO_ATUAL], com custo de [CUSTO], e vendo [VOLUME] por mês. Penso em mudar para [PRECO_NOVO].\nObjetivo: entender o efeito.\nFormato: quanto eu poderia perder em volume e ainda assim sair ganhando, e a partir de que queda de vendas a mudança passa a ser ruim.\nRestrições: não estime como o mercado vai reagir; apenas mostre a matemática e diga o que eu precisaria testar.",
    categoria: "Financeiro",
    setor: "Financeiro",
    dica:
      "Saber quanto volume você pode perder e ainda ganhar transforma o medo de aumentar preço em conta.",
    exemploPreenchido:
      "Contexto: vendo corte de cabelo a R$ 45, com custo de R$ 8, e faço 320 por mês. Penso em mudar para R$ 55.",
    variaveis: [
      v("PRODUTO", "O produto", "corte de cabelo"),
      v("PRECO_ATUAL", "Preço atual", "R$ 45"),
      v("CUSTO", "Custo", "R$ 8"),
      v("VOLUME", "Volume mensal", "320"),
      v("PRECO_NOVO", "Preço pretendido", "R$ 55"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Avançado",
    tags: ["preço", "simulação", "margem"],
  },
  {
    titulo: "Entender para onde o dinheiro está indo",
    corpo:
      "Contexto: meu faturamento é [FATURAMENTO] e sinto que sobra pouco. Seguem minhas saídas, sem nome de fornecedor: [SAIDAS].\nObjetivo: entender para onde vai.\nFormato: percentual por categoria, comparação com o que seria razoável para o meu ramo, e as três categorias que mais chamam atenção.\nRestrições: onde não houver referência confiável do ramo, diga que não há em vez de inventar percentual.",
    categoria: "Financeiro",
    setor: "Financeiro",
    dica:
      "Ver em percentual muda a percepção. Um gasto de R$ 800 parece pequeno até virar 12% do que sobra.",
    exemploPreenchido:
      "Contexto: faturo R$ 45 mil por mês e sinto que sobra pouco. Seguem as saídas do último trimestre.",
    variaveis: [
      v("FATURAMENTO", "Seu faturamento", "R$ 45 mil"),
      v("SAIDAS", "Suas saídas", "cole a tabela"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Intermediário",
    tags: ["despesas", "percentual"],
  },

  /* ---------------- PLANEJAMENTO E RH ---------------- */
  {
    titulo: "Escrever o que o meu negócio faz e não faz",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e eu aceito quase tudo que aparece, inclusive fora do que faço bem.\nObjetivo: definir meu escopo.\nFormato: o que eu faço, o que eu não faço, o que faço só em certas condições, e como recusar o que está fora.\nRestrições: seja específico — 'trabalhos pequenos' não é critério; use número, prazo ou tipo.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "Aceitar tudo é a forma mais rápida de trabalhar muito e ganhar pouco. Escopo escrito é o que permite recusar.",
    exemploPreenchido:
      "Contexto: sou marceneiro e aceito desde reparo de gaveta até cozinha inteira, o que desorganiza minha agenda.",
    variaveis: [v("NEGOCIO", "Seu negócio", "marcenaria")],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["escopo", "foco"],
  },
  {
    titulo: "Plano para o primeiro mês de quem entrou",
    corpo:
      "Contexto: contratei para [FUNCAO] no meu [NEGOCIO]. Em um mês, essa pessoa precisa estar fazendo: [O_QUE].\nObjetivo: um plano de 30 dias.\nFormato: por semana, o que ela aprende, o que faz acompanhada, o que faz sozinha, e como eu sei que está no caminho.\nRestrições: cada semana tem de terminar com algo que ela faça sozinha; nada de um mês inteiro só observando.",
    categoria: "RH",
    setor: "RH",
    dica:
      "Fazer sozinha desde a primeira semana acelera muito. Um mês observando ensina menos que três dias fazendo.",
    exemploPreenchido:
      "Contexto: contratei uma atendente para minha ótica. Em um mês precisa atender sozinha e fazer ajuste simples de armação.",
    variaveis: [
      v("FUNCAO", "A função", "atendente"),
      v("NEGOCIO", "Seu negócio", "ótica"),
      v("O_QUE", "O que ela precisa fazer", "atender e ajustar armação"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["integração", "treinamento"],
  },

  /* ---------------- ATENDIMENTO E VENDAS (extras) ---------------- */
  {
    titulo: "Preparar a equipe para a semana de maior movimento",
    corpo:
      "Contexto: meu [NEGOCIO] vai ter movimento muito acima do normal em [QUANDO], por causa de [MOTIVO].\nObjetivo: preparar a equipe.\nFormato: o que combinar antes, quem faz o quê, o que simplificar nesses dias, e o que fazer se der errado.\nRestrições: nada que exija contratar; o plano tem de funcionar com a equipe que eu tenho.",
    categoria: "Atendimento",
    setor: "Administrativo",
    dica:
      "Simplificar o que dá para simplificar nos dias de pico vale mais que tentar fazer tudo como sempre.",
    exemploPreenchido:
      "Contexto: minha lanchonete vai ter movimento muito acima do normal no fim de semana, por causa de um evento na praça.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "lanchonete"),
      v("QUANDO", "Quando", "fim de semana"),
      v("MOTIVO", "Por quê", "evento na praça"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["pico", "equipe", "operação"],
  },
  {
    titulo: "Transformar indicação em cliente",
    corpo:
      "Contexto: um cliente indicou meu [NEGOCIO] para alguém, que entrou em contato dizendo: [CONTATO].\nObjetivo: aproveitar bem a indicação.\nFormato: a primeira resposta, o que mencionar sobre quem indicou, e como agradecer a quem indicou depois.\nRestrições: não exponha detalhe do que o cliente que indicou comprou; não ofereça desconto que eu não confirmei.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Agradecer a quem indicou é o que faz a segunda indicação acontecer. Quase todo mundo esquece essa parte.",
    exemploPreenchido:
      "Contexto: uma cliente indicou meu ateliê para uma amiga, que chamou dizendo 'a Marina falou muito bem de você'.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "ateliê"),
      v("CONTATO", "O que a pessoa disse", "a Marina falou bem de você"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["indicação", "boca a boca"],
  },
  {
    titulo: "Entender o que meu cliente valoriza de verdade",
    corpo:
      "Contexto: seguem coisas que meus clientes disseram sobre o meu [NEGOCIO], em elogios e reclamações: [FALAS].\nObjetivo: entender o que eles valorizam.\nFormato: o que se repete nos elogios, o que se repete nas reclamações, o que eles valorizam e eu não destaco, e o que eu destaco e eles não mencionam.\nRestrições: baseie-se só no que foi dito; não presuma motivação.",
    categoria: "Pesquisa",
    setor: "Marketing",
    dica:
      "O 'que eu destaco e eles não mencionam' costuma doer — e é a informação mais valiosa da análise.",
    exemploPreenchido:
      "Contexto: seguem 40 comentários que recebi sobre minha pousada, entre elogios e reclamações.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "pousada"),
      v("FALAS", "O que disseram", "cole os comentários"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["cliente", "percepção", "posicionamento"],
  },

  /* ---------------- AGENTES E AUTOMAÇÃO (extras) ---------------- */
  {
    titulo: "Medir se a automação valeu a pena",
    corpo:
      "Contexto: automatizei [PROCESSO] há [TEMPO]. Antes levava [ANTES] e agora leva [DEPOIS]. Problemas que apareceram: [PROBLEMAS].\nObjetivo: saber se compensou.\nFormato: o tempo economizado de verdade, o custo de manter, os problemas que a automação criou, e a conclusão — manter, ajustar ou desligar.\nRestrições: conte o tempo gasto para montar e manter, não só o economizado.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "Contar o tempo de manutenção é o que revela automação que consome mais do que economiza.",
    exemploPreenchido:
      "Contexto: automatizei a resposta do formulário há 3 meses. Antes levava 20 min por dia, agora 5. Mas duas vezes mandou resposta errada.",
    variaveis: [
      v("PROCESSO", "O processo", "resposta ao formulário"),
      v("TEMPO", "Há quanto tempo", "3 meses"),
      v("ANTES", "Tempo antes", "20 min por dia"),
      v("DEPOIS", "Tempo depois", "5 min por dia"),
      v("PROBLEMAS", "Problemas que apareceram", "duas respostas erradas"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["avaliação", "automação", "retorno"],
  },
  {
    titulo: "Explicar a automação para quem vai usar",
    corpo:
      "Contexto: montei uma automação de [PROCESSO] e minha equipe precisa entender.\nObjetivo: explicar sem assustar nem criar mistério.\nFormato: o que ela faz, o que continua sendo feito por pessoa, o que fazer quando parecer que algo saiu errado, e a quem avisar.\nRestrições: nada de termo técnico; deixe claro que ninguém está sendo substituído, se for o caso — e se for, diga com honestidade.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "Equipe que não entende a automação a contorna. Explicar é parte de fazer funcionar.",
    exemploPreenchido:
      "Contexto: montei uma automação que registra os pedidos do site na planilha e minha equipe precisa entender.",
    variaveis: [v("PROCESSO", "O processo", "registro de pedidos")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["equipe", "comunicação", "automação"],
  },
  {
    titulo: "Escolher entre fazer, contratar ou automatizar",
    corpo:
      "Contexto: a tarefa [TAREFA] do meu [NEGOCIO] toma [TEMPO] e hoje sou eu quem faz.\nObjetivo: decidir o caminho.\nFormato: compare continuar fazendo, contratar alguém e automatizar — custo, tempo de implantação, risco e reversibilidade de cada um.\nRestrições: considere que automatizar exige tempo meu no começo; não trate como solução imediata.",
    categoria: "Agentes",
    setor: "Planejamento",
    dica:
      "Automatizar quase nunca é a opção mais rápida no curto prazo. A conta muda quando se olha o ano.",
    exemploPreenchido:
      "Contexto: emitir nota fiscal toma 6 horas por semana e hoje sou eu quem faz.",
    variaveis: [
      v("TAREFA", "A tarefa", "emitir nota fiscal"),
      v("NEGOCIO", "Seu negócio", "distribuidora"),
      v("TEMPO", "Tempo que toma", "6 horas por semana"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["decisão", "delegar", "automação"],
  },
  {
    titulo: "Agente que prepara meu dia",
    corpo:
      "Contexto: todo dia eu preciso saber [O_QUE] antes de começar no meu [NEGOCIO].\nObjetivo: instruções de um assistente que prepare isso.\nFormato: o que ele consulta, o que resume, em que ordem apresenta, e o que destaca como urgente.\nRestrições: ele apresenta, não age. Nada de ele responder, agendar ou cancelar por conta própria.",
    categoria: "Agentes",
    setor: "Agentes",
    dica:
      "Começar por um agente que só apresenta é o caminho seguro: você aprende a confiar antes de dar poder de agir.",
    exemploPreenchido:
      "Contexto: todo dia preciso saber os agendamentos, o que falta no estoque e quem está esperando resposta.",
    variaveis: [
      v("O_QUE", "O que precisa saber", "agendamentos e pendências"),
      v("NEGOCIO", "Seu negócio", "clínica veterinária"),
    ],
    ferramentasSugeridas: ["claude-negocios", "make"],
    nivelDificuldade: "Intermediário",
    tags: ["agente", "rotina", "resumo"],
  },

  /* ---------------- SEGURANÇA (extras) ---------------- */
  {
    titulo: "Conferir se posso usar esta imagem ou música",
    corpo:
      "Contexto: quero usar [MATERIAL] em [ONDE], e peguei de [ORIGEM].\nObjetivo: saber se posso.\nFormato: o que verificar antes de usar, os sinais de que não posso, onde encontrar material liberado, e o risco de usar mesmo assim.\nRestrições: na dúvida, oriente a não usar; isto não é orientação jurídica.",
    categoria: "Segurança",
    setor: "Marketing",
    dica:
      "Imagem achada na internet não é imagem livre. O prejuízo por uso indevido costuma superar o custo de uma licença.",
    exemploPreenchido:
      "Contexto: quero usar uma música conhecida num vídeo de Instagram, e peguei do próprio aplicativo.",
    variaveis: [
      v("MATERIAL", "O material", "uma música"),
      v("ONDE", "Onde usar", "vídeo de Instagram"),
      v("ORIGEM", "De onde veio", "biblioteca do aplicativo"),
    ],
    ferramentasSugeridas: ["gemini-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["direito autoral", "risco"],
  },
  {
    titulo: "Separar o que guardo e o que apago",
    corpo:
      "Contexto: meu [NEGOCIO] guarda [DADOS] de clientes.\nObjetivo: saber o que manter e por quanto tempo.\nFormato: o que é necessário guardar e por quê, o que dá para apagar, por quanto tempo manter cada tipo, e como apagar com segurança.\nRestrições: isto não é orientação jurídica; aponte o que confirmar com contador ou advogado. Na dúvida sobre prazo legal, diga que precisa confirmar.",
    categoria: "Segurança",
    setor: "Segurança",
    dica:
      "Guardar tudo para sempre é risco, não cuidado. Dado que não existe não vaza.",
    exemploPreenchido:
      "Contexto: minha clínica guarda nome, telefone, endereço, histórico de atendimento e foto de procedimentos.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "clínica"),
      v("DADOS", "Que dados", "nome, telefone, histórico, fotos"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["LGPD", "retenção", "privacidade"],
  },

  /* ---------------- ÚLTIMOS ---------------- */
  {
    titulo: "Descrever uma vaga de freelancer ou serviço terceirizado",
    corpo:
      "Contexto: preciso contratar alguém pontualmente para [SERVICO] no meu [NEGOCIO]. Prazo: [PRAZO].\nObjetivo: um briefing que evite retrabalho.\nFormato: o que precisa ser entregue, em que formato, o prazo, quantas rodadas de ajuste estão incluídas, e o que eu forneço.\nRestrições: seja específico sobre o resultado esperado; 'algo bonito' não é briefing. Diga o que NÃO está no escopo.",
    categoria: "Compras",
    setor: "Compras",
    dica:
      "Número de rodadas de ajuste definido no briefing evita a discussão mais comum com freelancer.",
    exemploPreenchido:
      "Contexto: preciso de alguém para fotografar 30 produtos da minha loja. Prazo: 2 semanas.",
    variaveis: [
      v("SERVICO", "O serviço", "fotografia de 30 produtos"),
      v("NEGOCIO", "Seu negócio", "loja de decoração"),
      v("PRAZO", "O prazo", "2 semanas"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["briefing", "freelancer"],
  },
  {
    titulo: "Explicar o reajuste de preço aos clientes",
    corpo:
      "Contexto: vou reajustar [O_QUE] de [DE] para [PARA], a partir de [QUANDO]. O motivo real é: [MOTIVO].\nObjetivo: comunicar sem perder cliente.\nFormato: o aviso, com antecedência, o que muda e o que continua igual, e uma condição para quem já é cliente se eu quiser oferecer.\nRestrições: não peça desculpa pelo reajuste; não culpe genericamente 'o mercado'. Seja direto sobre o valor novo.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Avisar com antecedência e ser direto sobre o número reduz a perda. O que irrita é descobrir na hora de pagar.",
    exemploPreenchido:
      "Contexto: vou reajustar a mensalidade de R$ 180 para R$ 210 a partir de janeiro. O motivo real é o aumento do aluguel e da energia.",
    variaveis: [
      v("O_QUE", "O que reajusta", "mensalidade"),
      v("DE", "De quanto", "R$ 180"),
      v("PARA", "Para quanto", "R$ 210"),
      v("QUANDO", "A partir de quando", "janeiro"),
      v("MOTIVO", "O motivo real", "aluguel e energia"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["reajuste", "comunicação", "preço"],
  },
  {
    titulo: "Montar um combo que faça sentido",
    corpo:
      "Contexto: vendo [PRODUTOS] no meu [NEGOCIO]. Os que mais saem são [MAIS_SAEM] e os parados são [PARADOS].\nObjetivo: montar combos.\nFormato: três combos, cada um com o que inclui, para quem serve, e por que a combinação faz sentido para o cliente.\nRestrições: nada de juntar o que não tem relação só para escoar encalhe; o combo tem de fazer sentido de uso.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Combo que só existe para escoar encalhe o cliente percebe. Tem de fazer sentido de uso antes de fazer sentido de estoque.",
    exemploPreenchido:
      "Contexto: vendo produtos de limpeza. Os que mais saem são detergente e água sanitária; os parados, desengordurante e luvas.",
    variaveis: [
      v("PRODUTOS", "Seus produtos", "produtos de limpeza"),
      v("NEGOCIO", "Seu negócio", "mercearia"),
      v("MAIS_SAEM", "Os que mais saem", "detergente e água sanitária"),
      v("PARADOS", "Os parados", "desengordurante e luvas"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["combo", "encalhe", "venda"],
  },
  {
    titulo: "Preparar o negócio para uma fiscalização",
    corpo:
      "Contexto: meu [NEGOCIO] pode receber fiscalização de [ORGAO].\nObjetivo: estar preparado.\nFormato: o que costuma ser verificado, o que manter sempre em ordem, o que ter à mão, e como se portar durante a visita.\nRestrições: isto não é orientação jurídica nem lista oficial; diga onde consultar a exigência atual do órgão na minha cidade.",
    categoria: "Segurança",
    setor: "Administrativo",
    dica:
      "A exigência varia por município. Use isto para se organizar e confirme a lista atual no órgão local.",
    exemploPreenchido:
      "Contexto: minha lanchonete pode receber fiscalização da vigilância sanitária.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "lanchonete"),
      v("ORGAO", "Qual órgão", "vigilância sanitária"),
    ],
    ferramentasSugeridas: ["gemini-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["fiscalização", "conformidade", "limite"],
  },
  {
    titulo: "Escrever o texto do meu site ou página",
    corpo:
      "Contexto: meu negócio é [NEGOCIO], atendo [PUBLICO] e o que me diferencia é [DIFERENCIAL].\nObjetivo: o texto da página principal.\nFormato: título, subtítulo, o que eu faço em três blocos, prova de que funciona, e a chamada de ação.\nRestrições: nada de 'somos uma empresa que preza pela qualidade'; escreva do ponto de vista do problema do cliente, não da história da empresa.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Site que abre contando a história da empresa perde o visitante. Comece pelo problema dele.",
    exemploPreenchido:
      "Contexto: meu negócio é dedetização, atendo condomínios e o que me diferencia é atender no mesmo dia.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "dedetização"),
      v("PUBLICO", "Seu público", "condomínios"),
      v("DIFERENCIAL", "Diferencial", "atendimento no mesmo dia"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["site", "página", "copy"],
  },
  {
    titulo: "Entender por que o cliente escolheu o concorrente",
    corpo:
      "Contexto: perdi um cliente para um concorrente. O que eu sei: [O_QUE_SEI].\nObjetivo: aprender com isso.\nFormato: as hipóteses possíveis separadas por tipo (preço, prazo, confiança, escopo, relacionamento), o que eu poderia perguntar ao cliente, e o que dá para verificar sem perguntar.\nRestrições: trate tudo como hipótese; não conclua que foi preço só porque é a explicação mais fácil.",
    categoria: "Pesquisa",
    setor: "Vendas",
    dica:
      "Preço é a explicação mais fácil e quase nunca a única. Perguntar ao cliente perdido costuma surpreender.",
    exemploPreenchido:
      "Contexto: perdi um cliente de manutenção predial para um concorrente. Sei que o preço deles é parecido e que responderam mais rápido.",
    variaveis: [v("O_QUE_SEI", "O que você sabe", "descreva")],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["perda", "concorrência"],
  },
  {
    titulo: "Organizar as senhas e acessos do negócio",
    corpo:
      "Contexto: no meu [NEGOCIO], os acessos a sistemas e redes estão espalhados e algumas pessoas usam a mesma senha.\nObjetivo: organizar sem complicar.\nFormato: o que precisa de acesso próprio por pessoa, o que pode ser compartilhado com cuidado, o que fazer quando alguém sai, e a rotina de revisão.\nRestrições: nada que exija ferramenta paga; considere que a equipe não é técnica. NUNCA me peça para escrever senha aqui.",
    categoria: "Segurança",
    setor: "Segurança",
    dica:
      "O 'o que fazer quando alguém sai' é o item mais esquecido — e o que mais gera problema depois.",
    exemploPreenchido:
      "Contexto: na minha agência, quatro pessoas usam o mesmo login do Instagram e do banco.",
    variaveis: [v("NEGOCIO", "Seu negócio", "agência")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["acesso", "senha", "equipe"],
  },
  {
    titulo: "Criar um cardápio ou tabela de serviços",
    corpo:
      "Contexto: ofereço [ITENS] no meu [NEGOCIO]. Os preços são: [PRECOS].\nObjetivo: organizar em cardápio ou tabela.\nFormato: agrupamento por categoria, a ordem dentro de cada grupo, a descrição curta de cada item, e onde posicionar o que tem melhor margem.\nRestrições: use os preços que eu dei, sem alterar; descrições de no máximo uma linha.",
    categoria: "Marketing",
    setor: "Vendas",
    dica:
      "A ordem dos itens muda o que se vende. O que tem melhor margem raramente deveria ser o último da lista.",
    exemploPreenchido:
      "Contexto: ofereço 14 serviços na minha barbearia, de corte a barboterapia, com preços de R$ 35 a R$ 120.",
    variaveis: [
      v("ITENS", "Seus itens", "liste"),
      v("NEGOCIO", "Seu negócio", "barbearia"),
      v("PRECOS", "Os preços", "liste"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "canva-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["cardápio", "tabela", "margem"],
  },
  {
    titulo: "Escrever o passo a passo de um serviço para o cliente acompanhar",
    corpo:
      "Contexto: meu serviço de [SERVICO] leva [TEMPO] e o cliente fica ansioso sem saber o que está acontecendo.\nObjetivo: mostrar as etapas.\nFormato: as fases do serviço, o que acontece em cada uma, quanto dura, e em quais momentos eu dou notícia.\nRestrições: prometa só o que eu cumpro; se uma fase costuma variar, diga que varia em vez de dar prazo fixo.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "A maioria das cobranças de cliente é ansiedade, não pressa. Mostrar a etapa em que está resolve sem acelerar nada.",
    exemploPreenchido:
      "Contexto: meu serviço de reforma de estofado leva de 10 a 15 dias e o cliente fica ansioso.",
    variaveis: [
      v("SERVICO", "O serviço", "reforma de estofado"),
      v("TEMPO", "Quanto leva", "10 a 15 dias"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["expectativa", "processo", "ansiedade"],
  },
  {
    titulo: "Preparar a troca de sistema ou ferramenta",
    corpo:
      "Contexto: uso [ATUAL] no meu [NEGOCIO] e penso em mudar para [NOVO]. O motivo é: [MOTIVO].\nObjetivo: trocar sem parar o negócio.\nFormato: o que migrar, em que ordem, o período em que os dois funcionam juntos, o que treinar antes, e como voltar atrás se der errado.\nRestrições: não recomende trocar tudo num fim de semana; considere que a equipe precisa aprender.",
    categoria: "Planejamento",
    setor: "Administrativo",
    dica:
      "O plano de voltar atrás é o que permite tentar. Sem ele, a troca vira aposta.",
    exemploPreenchido:
      "Contexto: uso caderno e planilha na minha oficina e penso em mudar para um sistema de ordem de serviço.",
    variaveis: [
      v("ATUAL", "O que usa hoje", "caderno e planilha"),
      v("NOVO", "Para o que quer mudar", "sistema de ordem de serviço"),
      v("NEGOCIO", "Seu negócio", "oficina"),
      v("MOTIVO", "O motivo", "perco histórico de serviço"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["migração", "sistema", "risco"],
  },
  {
    titulo: "Aproveitar o que a IA respondeu para melhorar o próximo pedido",
    corpo:
      "Contexto: pedi isto à IA: [PEDIDO]. Ela respondeu isto: [RESPOSTA]. O que eu queria mesmo era: [O_QUE_QUERIA].\nObjetivo: entender o que faltou no meu pedido.\nFormato: qual das cinco partes do C.O.F.R.E. faltou ou ficou vaga, e a versão corrigida do pedido.\nRestrições: não reescreva a resposta; corrija o pedido. Quero aprender a pedir melhor.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "Este é o prompt que ensina a usar todos os outros. Rode sempre que uma resposta vier fora do esperado.",
    exemploPreenchido:
      "Contexto: pedi 'escreva um post sobre meu serviço' e veio um texto genérico. Eu queria algo que falasse do problema do cliente.",
    variaveis: [
      v("PEDIDO", "O que você pediu", "cole"),
      v("RESPOSTA", "O que veio", "cole ou resuma"),
      v("O_QUE_QUERIA", "O que você queria", "descreva"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["cofre", "aprendizado", "prompt"],
  },
  {
    titulo: "Registrar o que aprendi testando IA",
    corpo:
      "Contexto: testei IA para [TAREFA] no meu [NEGOCIO]. O que funcionou: [FUNCIONOU]. O que não: [NAO_FUNCIONOU].\nObjetivo: registrar para não repetir o teste.\nFormato: o que vale manter, o que descartar, o prompt final que funcionou, e o que testar em seguida.\nRestrições: guarde o prompt que funcionou por extenso — é o que vale mais que a conclusão.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "Quem não registra testa a mesma coisa três vezes. O prompt que funcionou vale mais que a memória do resultado.",
    exemploPreenchido:
      "Contexto: testei IA para escrever descrição de produto. Funcionou com a ficha técnica colada; não funcionou sem ela.",
    variaveis: [
      v("TAREFA", "A tarefa testada", "descrição de produto"),
      v("NEGOCIO", "Seu negócio", "loja online"),
      v("FUNCIONOU", "O que funcionou", "colar a ficha técnica"),
      v("NAO_FUNCIONOU", "O que não funcionou", "pedir sem dados"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["registro", "teste", "diário"],
  },
  {
    titulo: "Primeiro passo de quem nunca usou IA",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e eu nunca usei IA para nada.\nObjetivo: um primeiro teste que dê certo.\nFormato: uma única tarefa para testar hoje, o prompt pronto, o que esperar de resultado, e como saber se deu certo.\nRestrições: escolha algo que leve menos de 10 minutos, que não envolva dado de cliente e cujo erro não custe nada.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "O primeiro teste existe para tirar o medo, não para resolver o maior problema. Comece pequeno.",
    exemploPreenchido:
      "Contexto: meu negócio é uma banca de jornal e eu nunca usei IA para nada.",
    variaveis: [v("NEGOCIO", "Seu negócio", "banca de jornal")],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["primeiro passo", "iniciante"],
  },
];
