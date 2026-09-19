import type { PromptEmpreendedor } from "./prompts";

/**
 * Pesquisa, Planejamento, Automação, Agentes e Segurança — o que se
 * decide e o que se delega.
 *
 * Os de automação e agentes carregam sempre a mesma regra: a automação
 * gera rascunho e quem envia ao cliente é uma pessoa; o agente nunca
 * decide preço, crédito, cancelamento ou questão jurídica. Não é excesso
 * de cautela — é a diferença entre economizar tempo e pedir desculpa.
 */

const v = (chave: string, rotulo: string, exemplo: string) => ({ chave, rotulo, exemplo });

export const PROMPTS_AUTOMACAO: PromptEmpreendedor[] = [
  /* ---------------- PESQUISA ---------------- */
  {
    titulo: "Entender um ramo antes de entrar nele",
    corpo:
      "Contexto: penso em começar a atuar com [RAMO] em [REGIAO].\nObjetivo: entender o terreno antes de investir.\nFormato: como o ramo costuma funcionar, o que é preciso para começar, os custos típicos, os riscos mais comuns e as perguntas que eu deveria fazer a alguém que já está nele.\nRestrições: marque como [NÃO VERIFICADO] o que você não puder confirmar em fonte pública; não estime faturamento da minha região.",
    categoria: "Pesquisa",
    setor: "Pesquisa",
    dica:
      "A lista de perguntas para quem já está no ramo vale mais que a pesquisa. Use-a numa conversa real.",
    exemploPreenchido:
      "Contexto: penso em começar a atuar com lavanderia self-service em cidade de 80 mil habitantes.",
    variaveis: [
      v("RAMO", "O ramo", "lavanderia self-service"),
      v("REGIAO", "A região", "cidade de 80 mil habitantes"),
    ],
    ferramentasSugeridas: ["gemini-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["mercado", "novo negócio"],
  },
  {
    titulo: "Descobrir o que perguntar aos meus clientes",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e quero entender por que as pessoas compram — ou deixam de comprar.\nObjetivo: uma pesquisa curta que elas respondam.\nFormato: 6 perguntas, a maioria fechada e uma aberta, com o que cada uma revela.\nRestrições: nada que leve à resposta que eu quero ouvir; nada que exija mais de dois minutos para responder.",
    categoria: "Pesquisa",
    setor: "Pesquisa",
    dica:
      "Pergunta que induz a resposta não é pesquisa, é confirmação. Peça explicitamente para evitar isso.",
    exemploPreenchido:
      "Contexto: meu negócio é um restaurante por quilo e quero entender por que o movimento caiu no jantar.",
    variaveis: [v("NEGOCIO", "Seu negócio", "restaurante por quilo")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["pesquisa", "cliente"],
  },
  {
    titulo: "Checar se uma informação é verdadeira",
    corpo:
      "Contexto: li que [AFIRMACAO] e isso afeta uma decisão do meu negócio.\nObjetivo: saber se procede.\nFormato: o que se pode confirmar em fonte pública, o que não se pode, onde verificar em primeira mão, e qual a informação oficial se existir.\nRestrições: não confirme nada que você não conseguir apontar a origem; se não souber, diga que não sabe.",
    categoria: "Pesquisa",
    setor: "Pesquisa",
    dica:
      "Este é o antídoto contra a alucinação: exigir a origem transforma resposta confiante em resposta conferível.",
    exemploPreenchido:
      "Contexto: li que MEI não pode ter funcionário registrado e isso afeta minha decisão de contratar.",
    variaveis: [v("AFIRMACAO", "O que você leu", "cole a afirmação")],
    ferramentasSugeridas: ["gemini-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["verificação", "fonte", "alucinação"],
  },
  {
    titulo: "Preparar uma reunião a partir de documentos",
    corpo:
      "Contexto: subi [DOCUMENTOS] ao caderno e vou me reunir sobre [ASSUNTO].\nObjetivo: chegar preparado.\nFormato: o que os documentos dizem sobre o assunto, os pontos que exigem decisão, o que está ambíguo, e as perguntas a fazer na reunião.\nRestrições: responda apenas com base nos arquivos; o que não estiver neles entra como pergunta, não como resposta.",
    categoria: "Pesquisa",
    setor: "Pesquisa",
    dica:
      "É o uso que mais economiza tempo no NotebookLM: 40 páginas de contrato viram cinco perguntas certas.",
    exemploPreenchido:
      "Contexto: subi o contrato e os três aditivos ao caderno e vou me reunir sobre a renovação.",
    variaveis: [
      v("DOCUMENTOS", "Os documentos", "contrato e aditivos"),
      v("ASSUNTO", "O assunto", "renovação"),
    ],
    ferramentasSugeridas: ["notebooklm-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["notebooklm", "reunião", "preparação"],
  },

  /* ---------------- PLANEJAMENTO ---------------- */
  {
    titulo: "Decidir entre duas opções sem travar",
    corpo:
      "Contexto: preciso escolher entre [OPCAO_A] e [OPCAO_B]. O que está em jogo: [CONTEXTO]. O que eu já sei: [O_QUE_SEI].\nObjetivo: enxergar a decisão com clareza.\nFormato: o que cada caminho exige, o que cada um me custa se der errado, o que é reversível em cada um, e o que eu precisaria saber para decidir com mais segurança.\nRestrições: não decida por mim. Diga se falta informação demais para decidir agora.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "A pergunta 'o que é reversível' costuma resolver: decisão reversível se toma rápido, irreversível se estuda.",
    exemploPreenchido:
      "Contexto: preciso escolher entre alugar um ponto maior ou investir em delivery. Está em jogo R$ 40 mil e o próximo ano.",
    variaveis: [
      v("OPCAO_A", "Primeira opção", "alugar ponto maior"),
      v("OPCAO_B", "Segunda opção", "investir em delivery"),
      v("CONTEXTO", "O que está em jogo", "R$ 40 mil e o próximo ano"),
      v("O_QUE_SEI", "O que você já sabe", "o delivery cresce 20% ao ano aqui"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["decisão", "risco"],
  },
  {
    titulo: "Metas do trimestre que dá para acompanhar",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e quero melhorar [O_QUE]. Hoje o número é [HOJE].\nObjetivo: metas que eu consiga acompanhar toda semana.\nFormato: no máximo três metas, cada uma com o número atual, o número desejado, como medir e o que faço se estiver fora da rota.\nRestrições: nada de meta sem número; nada que dependa só de fatores que eu não controlo.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "No máximo três metas. Com cinco, nenhuma é acompanhada — e o plano vira decoração.",
    exemploPreenchido:
      "Contexto: minha pizzaria quer melhorar o movimento de terça a quinta. Hoje: 22 pedidos por noite.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "pizzaria"),
      v("O_QUE", "O que melhorar", "movimento de terça a quinta"),
      v("HOJE", "Número atual", "22 pedidos por noite"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["meta", "indicador"],
  },
  {
    titulo: "Preparar o negócio para a minha ausência",
    corpo:
      "Contexto: meu [NEGOCIO] depende de mim para [O_QUE]. Preciso me ausentar por [TEMPO].\nObjetivo: o negócio funcionar sem mim.\nFormato: o que só eu faço hoje, o que dá para delegar, o que precisa ser escrito antes, quem decide o quê na minha ausência, e o que pode esperar meu retorno.\nRestrições: seja realista sobre o prazo de preparação; se não der para preparar no tempo, diga.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "Quem não consegue se ausentar não tem um negócio, tem um emprego que também dá prejuízo. Vale preparar.",
    exemploPreenchido:
      "Contexto: minha gráfica depende de mim para orçar e aprovar arte. Preciso me ausentar por 15 dias.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "gráfica"),
      v("O_QUE", "O que depende de você", "orçar e aprovar arte"),
      v("TEMPO", "Por quanto tempo", "15 dias"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["delegar", "férias", "processo"],
  },
  {
    titulo: "Revisar o mês que passou",
    corpo:
      "Contexto: no meu [NEGOCIO], no mês passado aconteceu: [FATOS]. Os números foram: [NUMEROS].\nObjetivo: aprender com o mês, não só registrar.\nFormato: o que funcionou e por quê, o que não funcionou e por quê, o que foi sorte ou azar, e as duas coisas a mudar no próximo mês.\nRestrições: não atribua a um fator só; se não der para saber a causa, diga que não dá.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "Separar o que foi decisão do que foi sorte é o que faz a revisão ensinar alguma coisa.",
    exemploPreenchido:
      "Contexto: na minha loja, no mês passado teve feriado prolongado e uma campanha de dia das mães. Vendas subiram 18%.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "loja"),
      v("FATOS", "O que aconteceu", "feriado e campanha"),
      v("NUMEROS", "Os números", "vendas +18%"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["revisão", "aprendizado"],
  },

  /* ---------------- AUTOMAÇÃO ---------------- */
  {
    titulo: "Automatizar o agendamento de horário",
    corpo:
      "Contexto: no meu [NEGOCIO], agendar funciona assim hoje: [COMO_E_HOJE]. Meus horários são [HORARIOS].\nObjetivo: desenhar o agendamento automático.\nFormato: o que dispara, como o horário é oferecido, o que acontece quando não há vaga, como se confirma, como se cancela, e o lembrete antes.\nRestrições: a confirmação final de horário excepcional continua comigo. Liste o que nunca deve ser agendado sozinho.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "O 'o que nunca deve ser agendado sozinho' evita o encaixe impossível que a automação aceita e você não cumpre.",
    exemploPreenchido:
      "Contexto: na minha clínica, agendar é por WhatsApp, uma pessoa consultando a agenda de papel.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "clínica"),
      v("COMO_E_HOJE", "Como funciona hoje", "WhatsApp e agenda de papel"),
      v("HORARIOS", "Seus horários", "seg a sex, 8h às 18h"),
    ],
    ferramentasSugeridas: ["make", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["agendamento", "automação"],
  },
  {
    titulo: "Automatizar o pós-venda",
    corpo:
      "Contexto: no meu [NEGOCIO], depois que o cliente compra [PRODUTO], hoje eu [O_QUE_FACO].\nObjetivo: desenhar o acompanhamento automático.\nFormato: os momentos de contato depois da compra, o que se manda em cada um, e onde uma pessoa entra.\nRestrições: nenhuma mensagem sai sem revisão quando o cliente já demonstrou insatisfação. Diga como o sistema sabe disso.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "A regra de não automatizar quem já reclamou é o que impede a mensagem alegre chegar no pior momento.",
    exemploPreenchido:
      "Contexto: na minha loja de móveis, depois da entrega eu ligo uma semana depois — quando lembro.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "loja de móveis"),
      v("PRODUTO", "O que vende", "móveis"),
      v("O_QUE_FACO", "O que faz hoje", "ligo quando lembro"),
    ],
    ferramentasSugeridas: ["make", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["pós-venda", "automação"],
  },
  {
    titulo: "Relatório que chega pronto toda semana",
    corpo:
      "Contexto: toda semana eu preciso saber [O_QUE], e hoje monto isso na mão a partir de [ONDE].\nObjetivo: receber pronto.\nFormato: de onde vêm os dados, como se juntam, o que o relatório mostra, quando chega e para quem.\nRestrições: o relatório informa, não decide. Diga o que fazer quando algum dado não estiver disponível no dia.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "Defina o que acontece quando falta dado. Relatório que chega errado sem avisar é pior que relatório que não chega.",
    exemploPreenchido:
      "Contexto: toda semana preciso saber vendas por vendedor e produtos sem giro. Monto na mão a partir do sistema e de uma planilha.",
    variaveis: [
      v("O_QUE", "O que precisa saber", "vendas por vendedor"),
      v("ONDE", "De onde vêm os dados", "sistema e planilha"),
    ],
    ferramentasSugeridas: ["make", "gemini-workspace"],
    nivelDificuldade: "Avançado",
    tags: ["relatório", "automação", "rotina"],
  },
  {
    titulo: "Decidir o que NÃO automatizar",
    corpo:
      "Contexto: no meu [NEGOCIO] faço estas tarefas: [TAREFAS].\nObjetivo: saber o que deve continuar humano.\nFormato: para cada tarefa, se o erro é caro, se exige julgamento, se envolve emoção do cliente e se tem exceção demais. Conclua com as que não devem ser automatizadas e por quê.\nRestrições: seja conservador — na dúvida, mantenha humano.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "Saber o que não automatizar é tão valioso quanto saber o que automatizar, e quase ninguém pergunta.",
    exemploPreenchido:
      "Contexto: no meu petshop faço agendamento, orçamento de banho, aviso de vacina e comunicação de problema de saúde do animal.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "petshop"),
      v("TAREFAS", "Suas tarefas", "liste aqui"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["limite", "automação", "julgamento"],
  },
  {
    titulo: "Plano de desligamento da automação",
    corpo:
      "Contexto: tenho uma automação de [PROCESSO] rodando.\nObjetivo: saber o que fazer quando ela falhar.\nFormato: os sinais de que algo saiu errado, como desligar imediatamente, como a tarefa volta a ser feita na mão, e como avisar quem for afetado.\nRestrições: o desligamento tem de funcionar sem depender de quem montou a automação.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "Se o desligamento depende de uma pessoa só, a automação é um risco — não uma economia.",
    exemploPreenchido:
      "Contexto: tenho a automação de resposta ao formulário do site rodando há dois meses.",
    variaveis: [v("PROCESSO", "O processo automatizado", "resposta ao formulário")],
    ferramentasSugeridas: ["chatgpt-negocios", "make"],
    nivelDificuldade: "Avançado",
    tags: ["falha", "contingência", "segurança"],
  },

  /* ---------------- AGENTES ---------------- */
  {
    titulo: "Base de conhecimento para o agente responder",
    corpo:
      "Contexto: quero que um assistente digital responda dúvidas sobre [ASSUNTO] no meu [NEGOCIO].\nObjetivo: reunir o que ele precisa saber.\nFormato: a lista do que ele precisa ter em mãos, como cada informação deve estar escrita, e o que fazer quando a resposta não estiver na base.\nRestrições: nada de dado pessoal de cliente na base. Toda informação com prazo de validade precisa de data.",
    categoria: "Agentes",
    setor: "Agentes",
    dica:
      "Informação sem data envelhece escondido. O agente vai repetir o preço do ano passado com toda a confiança.",
    exemploPreenchido:
      "Contexto: quero que um assistente responda dúvidas sobre planos e horários da minha academia.",
    variaveis: [
      v("ASSUNTO", "Sobre o quê", "planos e horários"),
      v("NEGOCIO", "Seu negócio", "academia"),
    ],
    ferramentasSugeridas: ["notebooklm-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["agente", "base de conhecimento"],
  },
  {
    titulo: "Testar o agente antes de soltar",
    corpo:
      "Contexto: montei um assistente para [TAREFA]. As regras dele são: [REGRAS].\nObjetivo: testar antes de deixar atender de verdade.\nFormato: 12 perguntas de teste — fáceis, ambíguas, fora do escopo, com dado que ele não tem, e uma tentativa de fazer ele prometer o que não pode. Para cada uma, o que seria a resposta certa.\nRestrições: inclua obrigatoriamente um teste de pedido de desconto e um de reclamação grave.",
    categoria: "Agentes",
    setor: "Agentes",
    dica:
      "Teste com as perguntas difíceis antes do cliente fazer. O pedido de desconto é onde todo agente mal ajustado cede.",
    exemploPreenchido:
      "Contexto: montei um assistente para dúvidas de horário e agendamento na minha barbearia.",
    variaveis: [
      v("TAREFA", "A tarefa do agente", "dúvidas de horário"),
      v("REGRAS", "As regras dele", "cole as instruções"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["agente", "teste", "qualidade"],
  },
  {
    titulo: "Agente que organiza informação para mim",
    corpo:
      "Contexto: recebo [O_QUE] todos os dias e preciso organizar antes de decidir.\nObjetivo: instruções de um assistente que faça essa organização.\nFormato: o que ele recebe, como classifica, o que produz, o que destaca para mim e o que descarta.\nRestrições: ele organiza e resume — não responde nem decide nada. Tudo que descartar precisa ficar acessível.",
    categoria: "Agentes",
    setor: "Agentes",
    dica:
      "Agente que só organiza é o mais seguro para começar: erro dele custa um minuto seu, não um cliente.",
    exemploPreenchido:
      "Contexto: recebo 30 e-mails de fornecedor por dia e preciso separar cotação, cobrança e propaganda.",
    variaveis: [v("O_QUE", "O que você recebe", "e-mails de fornecedor")],
    ferramentasSugeridas: ["claude-negocios", "make"],
    nivelDificuldade: "Intermediário",
    tags: ["agente", "triagem", "organização"],
  },
  {
    titulo: "Saber quando o agente deve chamar uma pessoa",
    corpo:
      "Contexto: meu assistente digital cuida de [TAREFA] no meu [NEGOCIO].\nObjetivo: definir quando ele para e chama alguém.\nFormato: a lista de situações, o sinal que identifica cada uma, o que ele diz ao cliente ao transferir, e como avisa a pessoa certa.\nRestrições: inclua obrigatoriamente cliente irritado, pedido de exceção, assunto de dinheiro, menção a problema de saúde ou segurança, e quando ele não souber.",
    categoria: "Agentes",
    setor: "Agentes",
    dica:
      "A transferência bem-feita é o que faz o cliente perdoar o agente. Mal-feita, ele desiste antes de falar com você.",
    exemploPreenchido:
      "Contexto: meu assistente cuida das dúvidas iniciais na minha loja de bicicletas.",
    variaveis: [
      v("TAREFA", "A tarefa", "dúvidas iniciais"),
      v("NEGOCIO", "Seu negócio", "loja de bicicletas"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["agente", "escalada", "limite"],
  },

  /* ---------------- SEGURANÇA ---------------- */
  {
    titulo: "Saber o que pode e o que não pode ser publicado",
    corpo:
      "Contexto: quero publicar [O_QUE] sobre o meu negócio.\nObjetivo: conferir antes de publicar.\nFormato: o que ali pode gerar problema — dado de cliente, promessa que não posso cumprir, informação de terceiro sem autorização, comparação com concorrente —, e a versão corrigida.\nRestrições: aponte os riscos, mas não seja paralisante: diga o que dá para publicar depois do ajuste.",
    categoria: "Segurança",
    setor: "Segurança",
    dica:
      "Rode antes de publicar foto de cliente, resultado de serviço ou comparação com concorrente. São os três riscos comuns.",
    exemploPreenchido:
      "Contexto: quero publicar o antes e depois de um tratamento, com a foto da cliente.",
    variaveis: [v("O_QUE", "O que quer publicar", "antes e depois com foto")],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["publicação", "risco", "imagem"],
  },
  {
    titulo: "Política de uso de IA do meu negócio",
    corpo:
      "Contexto: meu negócio é [NEGOCIO], tenho [QUANTOS] pessoas e lidamos com [TIPO_DADO].\nObjetivo: uma política simples de uso de IA.\nFormato: o que pode ser usado, o que nunca pode ser colado, o que sempre passa por revisão humana, quem tira dúvida, e o que fazer se alguém errar.\nRestrições: uma página; linguagem de combinado; nada de juridiquês. Inclua o que fazer depois de um erro, sem punição como primeiro passo.",
    categoria: "Segurança",
    setor: "Segurança",
    dica:
      "Política que começa pela punição faz a pessoa esconder o erro. Começar pelo 'o que fazer' é o que traz o problema à tona.",
    exemploPreenchido:
      "Contexto: meu negócio é um escritório de contabilidade, tenho 6 pessoas e lidamos com dado financeiro de clientes.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "escritório de contabilidade"),
      v("QUANTOS", "Quantas pessoas", "6"),
      v("TIPO_DADO", "Tipo de dado", "financeiro de clientes"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["política", "LGPD", "equipe"],
  },
  {
    titulo: "O que fazer quando a IA errou e foi ao cliente",
    corpo:
      "Contexto: um texto gerado por IA saiu com [ERRO] e chegou ao cliente.\nObjetivo: resolver e evitar que se repita.\nFormato: a mensagem de correção ao cliente, o que verificar agora para saber a extensão, e o que mudar no processo.\nRestrições: não culpe a ferramenta na mensagem ao cliente — a responsabilidade é do negócio. Seja direto sobre o que foi feito para corrigir.",
    categoria: "Segurança",
    setor: "Segurança",
    dica:
      "Culpar a IA na frente do cliente piora: soa como quem não controla o próprio processo.",
    exemploPreenchido:
      "Contexto: um orçamento gerado por IA saiu com prazo de 5 dias, que eu não consigo cumprir, e já foi enviado.",
    variaveis: [v("ERRO", "Qual foi o erro", "prazo que não consigo cumprir")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["erro", "correção", "responsabilidade"],
  },
  {
    titulo: "Revisar o que a IA escreveu sobre o meu ramo",
    corpo:
      "Contexto: a IA produziu este texto sobre [ASSUNTO] do meu ramo: [TEXTO]. Eu trabalho com isso há [TEMPO].\nObjetivo: encontrar o que está tecnicamente errado.\nFormato: liste o que soa certo mas não é, o que está desatualizado, e o que generaliza demais para o meu tipo de negócio.\nRestrições: não reescreva; só aponte. Se algo estiver correto, confirme — quero saber o que posso aproveitar.",
    categoria: "Segurança",
    setor: "Segurança",
    dica:
      "Sua experiência no ramo é o melhor detector de alucinação que existe. Este prompt organiza essa conferência.",
    exemploPreenchido:
      "Contexto: a IA escreveu sobre cuidados com piso de madeira. Trabalho com isso há 15 anos.",
    variaveis: [
      v("ASSUNTO", "O assunto", "cuidados com piso de madeira"),
      v("TEXTO", "O texto gerado", "cole aqui"),
      v("TEMPO", "Sua experiência", "15 anos"),
    ],
    ferramentasSugeridas: ["claude-negocios", "gemini-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["revisão", "alucinação", "técnico"],
  },
];
