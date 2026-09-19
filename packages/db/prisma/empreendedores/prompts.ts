/**
 * Banco de prompts do curso de Empreendedores.
 *
 * Organizado pelas áreas de um negócio pequeno, e não por assunto de IA:
 * quem procura aqui está com um problema na mão ("preciso responder este
 * cliente"), não com curiosidade sobre a ferramenta.
 *
 * Cada prompt traz um `exemploPreenchido` porque campo em branco não
 * ensina: ver o prompt já preenchido com um caso real é o que mostra o
 * nível de detalhe que se espera.
 *
 * Todos seguem o C.O.F.R.E. — Contexto, Objetivo, Formato, Restrições e
 * Exemplo/Entrada —, a mnemônica que o curso usa desde a primeira aula.
 */

export type PromptEmpreendedor = {
  titulo: string;
  corpo: string;
  categoria: string;
  setor: string;
  dica: string;
  exemploPreenchido: string;
  variaveis: { chave: string; rotulo: string; exemplo: string }[];
  ferramentasSugeridas: string[];
  nivelDificuldade: "Inicial" | "Intermediário" | "Avançado";
  tags: string[];
  porteEmpresa?: string;
};

const v = (chave: string, rotulo: string, exemplo: string) => ({ chave, rotulo, exemplo });

export const PROMPTS_EMPREENDEDORES: PromptEmpreendedor[] = [
  /* ---------------- ATENDIMENTO ---------------- */
  {
    titulo: "Responder cliente irritado sem prometer o que não posso",
    corpo:
      "Contexto: sou dono de [NEGOCIO]. Um cliente enviou a mensagem abaixo e está insatisfeito.\nObjetivo: escrever uma resposta que reconheça o problema e proponha um próximo passo concreto.\nFormato: uma mensagem de até 6 linhas, tom [TOM], pronta para enviar por WhatsApp.\nRestrições: não admita culpa sobre o que ainda não foi verificado, não prometa prazo que eu não confirmei e não ofereça desconto por conta própria. Se faltar informação para responder, liste o que eu preciso checar antes.\nMensagem do cliente: [MENSAGEM]",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "A restrição mais importante é a de não prometer. Sem ela, a IA costuma oferecer reembolso e prazo que você não autorizou.",
    exemploPreenchido:
      "Contexto: sou dono de uma loja de roupas. Um cliente enviou a mensagem abaixo e está insatisfeito.\nObjetivo: escrever uma resposta que reconheça o problema e proponha um próximo passo concreto.\nFormato: uma mensagem de até 6 linhas, tom cordial e direto, pronta para enviar por WhatsApp.\nRestrições: não admita culpa sobre o que ainda não foi verificado, não prometa prazo que eu não confirmei e não ofereça desconto por conta própria.\nMensagem do cliente: \"Comprei dia 3 e até agora nada. Já é a segunda vez que isso acontece.\"",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "loja de roupas"),
      v("TOM", "Tom da resposta", "cordial e direto"),
      v("MENSAGEM", "Mensagem do cliente", "Comprei dia 3 e até agora nada."),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["whatsapp", "reclamação", "atendimento"],
  },
  {
    titulo: "Perguntas frequentes com regra de quando chamar uma pessoa",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e recebo sempre as mesmas dúvidas.\nObjetivo: montar um FAQ que minha equipe possa usar para responder rápido.\nFormato: para cada dúvida, escreva a resposta curta (até 3 linhas), uma pergunta de confirmação quando faltar dado, e a regra de quando encaminhar para uma pessoa.\nRestrições: não invente política de troca, prazo ou preço — onde eu não informei, escreva [CONFIRMAR].\nDúvidas mais comuns: [DUVIDAS]",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "O [CONFIRMAR] é de propósito: deixa visível o que você ainda precisa decidir, em vez de a IA inventar.",
    exemploPreenchido:
      "Contexto: meu negócio é um salão de beleza e recebo sempre as mesmas dúvidas.\nDúvidas mais comuns: horário de funcionamento, se atende sem agendar, formas de pagamento, política de remarcação.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "salão de beleza"),
      v("DUVIDAS", "Dúvidas mais comuns", "horário, agendamento, pagamento"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["faq", "equipe", "padronização"],
  },
  {
    titulo: "Mensagem de pós-venda que não parece cobrança",
    corpo:
      "Contexto: vendi [PRODUTO] para um cliente há [TEMPO].\nObjetivo: escrever uma mensagem de acompanhamento que soe cuidado, e não cobrança de avaliação.\nFormato: 3 versões curtas, cada uma com um tom diferente.\nRestrições: nada de emoji em excesso, nada de pedir avaliação em mais de uma frase, e uma saída fácil caso o cliente não queira responder.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica: "Peça 3 versões: você escolhe a que soa como você fala, e não a primeira que apareceu.",
    exemploPreenchido:
      "Contexto: vendi um sofá para um cliente há duas semanas.\nObjetivo: escrever uma mensagem de acompanhamento que soe cuidado, e não cobrança de avaliação.",
    variaveis: [
      v("PRODUTO", "O que foi vendido", "um sofá"),
      v("TEMPO", "Há quanto tempo", "duas semanas"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["pós-venda", "relacionamento"],
  },

  /* ---------------- VENDAS ---------------- */
  {
    titulo: "Proposta comercial a partir de uma conversa",
    corpo:
      "Contexto: conversei com um cliente que precisa de [NECESSIDADE]. Meu negócio é [NEGOCIO].\nObjetivo: transformar a conversa em uma proposta que ele entenda sem me ligar de volta.\nFormato: escopo do que está incluso, o que NÃO está incluso, premissas, prazo, forma de pagamento e próximo passo.\nRestrições: não invente preço — deixe [VALOR] onde eu devo preencher. Não prometa resultado que dependa do cliente.\nO que foi conversado: [CONVERSA]",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "O 'o que NÃO está incluso' é o que evita discussão depois. É a parte que quase ninguém escreve.",
    exemploPreenchido:
      "Contexto: conversei com um cliente que precisa de identidade visual para uma padaria nova.\nO que foi conversado: quer logo, fachada e embalagem; tem pressa para a inauguração em 40 dias; não tem fotos do produto ainda.",
    variaveis: [
      v("NECESSIDADE", "O que o cliente precisa", "identidade visual"),
      v("NEGOCIO", "Seu negócio", "estúdio de design"),
      v("CONVERSA", "O que foi conversado", "quer logo e embalagem, prazo de 40 dias"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["proposta", "orçamento", "fechamento"],
  },
  {
    titulo: "Responder a objeção sem empurrar a venda",
    corpo:
      "Contexto: vendo [OFERTA] e o cliente disse: \"[OBJECAO]\".\nObjetivo: responder de um jeito que esclareça a dúvida real por trás da objeção.\nFormato: uma resposta curta, seguida de uma pergunta que me ajude a entender o caso dele.\nRestrições: não use técnica de pressão, não crie urgência falsa e aceite que a resposta pode ser 'não é para mim agora'.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "A restrição contra urgência falsa importa: sem ela, a IA devolve texto de vendedor insistente, que afasta cliente bom.",
    exemploPreenchido:
      "Contexto: vendo consultoria financeira e o cliente disse: \"está caro\".\nObjetivo: responder de um jeito que esclareça a dúvida real por trás da objeção.",
    variaveis: [
      v("OFERTA", "O que você vende", "consultoria financeira"),
      v("OBJECAO", "O que o cliente disse", "está caro"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["objeção", "negociação"],
  },
  {
    titulo: "Perguntas para entender o cliente antes de oferecer",
    corpo:
      "Contexto: atendo [TIPO_CLIENTE] e ofereço [OFERTA].\nObjetivo: ter um roteiro de perguntas que revele se eu realmente posso ajudar.\nFormato: 8 perguntas em ordem, da mais fácil para a mais delicada, com uma linha explicando o que cada uma revela.\nRestrições: nenhuma pergunta que o cliente não saiba responder de cabeça; nada que pareça formulário de banco.",
    categoria: "Vendas",
    setor: "Vendas",
    dica: "Perguntar antes de oferecer muda a conversa: você para de vender o que tem e passa a resolver o que ele precisa.",
    exemploPreenchido:
      "Contexto: atendo donos de restaurante e ofereço serviço de gestão de redes sociais.",
    variaveis: [
      v("TIPO_CLIENTE", "Tipo de cliente", "donos de restaurante"),
      v("OFERTA", "O que você oferece", "gestão de redes sociais"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["diagnóstico", "consultiva"],
  },

  /* ---------------- MARKETING ---------------- */
  {
    titulo: "Calendário de 7 dias para uma rede social",
    corpo:
      "Contexto: meu negócio é [NEGOCIO], falo com [PUBLICO] e nesta semana quero destacar [OFERTA].\nObjetivo: um calendário de 7 dias que eu consiga executar sozinho.\nFormato: para cada dia — ideia, primeira frase do post, o que aparece na imagem e a chamada final.\nRestrições: no máximo um post por dia; nada que exija equipe de filmagem; não prometa resultado garantido.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "A restrição 'que eu consiga executar sozinho' é o que separa um calendário usável de uma lista bonita e impossível.",
    exemploPreenchido:
      "Contexto: meu negócio é uma cafeteria, falo com quem trabalha no bairro e nesta semana quero destacar o café da tarde.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "cafeteria"),
      v("PUBLICO", "Com quem você fala", "quem trabalha no bairro"),
      v("OFERTA", "O que destacar", "café da tarde"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["redes sociais", "calendário", "conteúdo"],
  },
  {
    titulo: "Texto de anúncio que não promete o impossível",
    corpo:
      "Contexto: quero anunciar [PRODUTO] para [PUBLICO] em [CANAL].\nObjetivo: três versões de anúncio com ângulos diferentes.\nFormato: título curto, dois parágrafos e chamada final, para cada versão.\nRestrições: nenhuma promessa absoluta ('o melhor', 'garantido', 'o mais barato'); nenhum dado que eu não tenha informado; linguagem que meu cliente use de verdade.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Promessa absoluta além de arriscar problema com o consumidor, soa falsa. Proibir na restrição resolve de uma vez.",
    exemploPreenchido:
      "Contexto: quero anunciar conserto de celular para moradores do bairro no Instagram.",
    variaveis: [
      v("PRODUTO", "O que anunciar", "conserto de celular"),
      v("PUBLICO", "Para quem", "moradores do bairro"),
      v("CANAL", "Onde", "Instagram"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["anúncio", "copy"],
  },
  {
    titulo: "Descrição de produto para catálogo ou loja online",
    corpo:
      "Contexto: vendo [PRODUTO]. Estas são as informações reais: [FICHA].\nObjetivo: uma descrição que ajude a decidir a compra.\nFormato: um parágrafo de abertura, lista do que está incluso, para quem serve, cuidados de uso e chamada final.\nRestrições: use SOMENTE as informações da ficha. Onde faltar dado, escreva [FALTA] em vez de supor medida, material ou garantia.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Esta é a lição da alucinação na prática: sem o 'use somente a ficha', a IA inventa medida e material com toda a confiança.",
    exemploPreenchido:
      "Contexto: vendo uma cadeira de escritório. Ficha: tecido em tela, regulagem de altura, suporta 110 kg, garantia de 1 ano.",
    variaveis: [
      v("PRODUTO", "O produto", "cadeira de escritório"),
      v("FICHA", "Informações reais", "tela, regula altura, 110 kg, 1 ano de garantia"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["catálogo", "e-commerce", "alucinação"],
  },

  /* ---------------- IMAGENS ---------------- */
  {
    titulo: "Foto de produto para anúncio",
    corpo:
      "Assunto: [PRODUTO], em primeiro plano, ocupando o centro do quadro.\nAmbiente: [AMBIENTE].\nComposição: [ENQUADRAMENTO].\nIluminação: [LUZ].\nEstilo: fotografia de produto realista, sem aparência de desenho.\nCores: [CORES].\nFormato: quadrado, alta resolução.\nRestrições: sem texto na imagem, sem marca de outra empresa, sem mão ou pessoa aparecendo, fundo limpo.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "'Sem texto na imagem' economiza retrabalho: letra gerada por IA quase sempre sai torta. O texto entra depois, no Canva.",
    exemploPreenchido:
      "Assunto: um pote de mel artesanal de 300 g, em primeiro plano.\nAmbiente: mesa de madeira clara com favo ao fundo, desfocado.\nComposição: câmera na altura do pote, leve aproximação.\nIluminação: luz natural lateral, sombra suave.\nCores: tons quentes de âmbar e madeira.",
    variaveis: [
      v("PRODUTO", "O produto", "pote de mel artesanal"),
      v("AMBIENTE", "Onde está", "mesa de madeira clara"),
      v("ENQUADRAMENTO", "Enquadramento", "câmera na altura do produto"),
      v("LUZ", "Iluminação", "luz natural lateral"),
      v("CORES", "Cores", "tons quentes"),
    ],
    ferramentasSugeridas: ["chatgpt-imagens"],
    nivelDificuldade: "Intermediário",
    tags: ["foto de produto", "prompt visual"],
  },
  {
    titulo: "Imagem com fundo transparente para usar em qualquer arte",
    corpo:
      "Assunto: [OBJETO], isolado.\nFundo: totalmente transparente.\nFormato: PNG, quadrado.\nRestrições: sem cenário, sem fundo sólido, sem sombra projetada no fundo, sem xadrez cinza simulando transparência. Apenas o objeto recortado.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "Peça explicitamente para não desenhar o xadrez cinza: a IA às vezes 'desenha' o padrão de transparência em vez de gerar o canal real.",
    exemploPreenchido: "Assunto: uma xícara de café branca vista de lado, isolada.",
    variaveis: [v("OBJETO", "O objeto", "xícara de café branca")],
    ferramentasSugeridas: ["chatgpt-imagens"],
    nivelDificuldade: "Intermediário",
    tags: ["fundo transparente", "png"],
  },
  {
    titulo: "Manter o mesmo visual em várias imagens",
    corpo:
      "Contexto: já gerei uma imagem que ficou do jeito que eu queria e vou enviá-la como referência.\nObjetivo: gerar [QUANTIDADE] novas imagens de [ASSUNTO] mantendo o mesmo visual.\nFormato: mesma paleta, mesma iluminação, mesmo tipo de enquadramento e mesmo estilo da referência.\nRestrições: mude apenas [O_QUE_MUDA]. Não altere cor de fundo nem estilo.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "Consistência visual é o que faz parecer marca e não imagem avulsa. Use sempre a mesma imagem como referência.",
    exemploPreenchido:
      "Objetivo: gerar 4 novas imagens de outros sabores do mesmo doce, mantendo o visual.\nRestrições: mude apenas o recheio e a cor da cobertura.",
    variaveis: [
      v("QUANTIDADE", "Quantas imagens", "4"),
      v("ASSUNTO", "Do quê", "outros sabores do doce"),
      v("O_QUE_MUDA", "O que muda", "o recheio e a cor da cobertura"),
    ],
    ferramentasSugeridas: ["chatgpt-imagens"],
    nivelDificuldade: "Avançado",
    tags: ["consistência", "identidade visual"],
  },

  /* ---------------- VÍDEOS ---------------- */
  {
    titulo: "Roteiro de vídeo curto para rede social",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e quero um vídeo de [DURACAO] sobre [ASSUNTO].\nObjetivo: um roteiro que eu grave com o celular, sozinho.\nFormato: tabela com tempo, o que aparece na tela, o que eu falo e o texto que entra como legenda.\nRestrições: nada que exija equipe, iluminação especial ou edição avançada; primeira frase tem de prender em 3 segundos.",
    categoria: "Vídeos",
    setor: "Marketing",
    dica:
      "Comece pelo roteiro, nunca pela ferramenta de vídeo. Roteiro ruim com imagem bonita continua sendo vídeo ruim.",
    exemploPreenchido:
      "Contexto: meu negócio é uma oficina mecânica e quero um vídeo de 30 segundos sobre como saber a hora de trocar o óleo.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "oficina mecânica"),
      v("DURACAO", "Duração", "30 segundos"),
      v("ASSUNTO", "Assunto", "quando trocar o óleo"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "veo"],
    nivelDificuldade: "Inicial",
    tags: ["roteiro", "reels", "vídeo"],
  },
  {
    titulo: "Descrição de cena para gerar vídeo por IA",
    corpo:
      "Cena: [CENA].\nCâmera: [MOVIMENTO].\nIluminação: [LUZ].\nDuração: [SEGUNDOS] segundos.\nEstilo: realista, sem texto na tela.\nRestrições: sem pessoas reconhecíveis, sem marca de terceiros, sem texto sobreposto. Um único movimento de câmera.",
    categoria: "Vídeos",
    setor: "Marketing",
    dica:
      "Um movimento de câmera por cena. Vídeo gerado por IA erra quando você pede várias coisas ao mesmo tempo.",
    exemploPreenchido:
      "Cena: pão saindo do forno, vapor subindo, em uma padaria de bairro.\nCâmera: aproximação lenta.\nDuração: 5 segundos.",
    variaveis: [
      v("CENA", "A cena", "pão saindo do forno"),
      v("MOVIMENTO", "Movimento de câmera", "aproximação lenta"),
      v("LUZ", "Iluminação", "luz quente de manhã"),
      v("SEGUNDOS", "Duração", "5"),
    ],
    ferramentasSugeridas: ["veo", "pika"],
    nivelDificuldade: "Intermediário",
    tags: ["vídeo", "cena"],
  },

  /* ---------------- FINANCEIRO ---------------- */
  {
    titulo: "Entender onde a despesa cresceu",
    corpo:
      "Contexto: vou colar minhas despesas de [PERIODO], sem nome de pessoa e sem número de conta.\nObjetivo: entender onde o gasto cresceu e por quê.\nFormato: uma tabela por categoria com total e variação, depois as três maiores altas com uma hipótese para cada.\nRestrições: não calcule imposto, não dê conselho contábil e separe claramente o que é fato do que é hipótese. Onde os dados não permitirem concluir, diga que não dá.\nDados: [DADOS]",
    categoria: "Financeiro",
    setor: "Financeiro",
    dica:
      "O 'separe fato de hipótese' é o que transforma a resposta em algo conferível. Sem isso, palpite e dado se misturam.",
    exemploPreenchido:
      "Contexto: vou colar minhas despesas dos últimos 6 meses, sem nome de pessoa e sem número de conta.\nObjetivo: entender onde o gasto cresceu e por quê.",
    variaveis: [
      v("PERIODO", "Período", "últimos 6 meses"),
      v("DADOS", "Seus dados", "cole aqui a tabela"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Intermediário",
    tags: ["despesas", "análise", "anonimização"],
    porteEmpresa: "MEI",
  },
  {
    titulo: "Montar uma planilha de controle do zero",
    corpo:
      "Contexto: preciso controlar [O_QUE] no meu [NEGOCIO] e não sei montar planilha.\nObjetivo: uma planilha simples que eu consiga manter sozinho.\nFormato: diga quais colunas criar, o que vai em cada uma, e escreva as fórmulas prontas para colar, explicando em uma linha o que cada uma faz.\nRestrições: no máximo 8 colunas; nada de fórmula que eu não consiga entender; funcione no Google Planilhas gratuito.",
    categoria: "Financeiro",
    setor: "Financeiro",
    dica:
      "Peça a explicação de cada fórmula. É o que permite consertar sozinho quando a planilha quebrar daqui a três meses.",
    exemploPreenchido:
      "Contexto: preciso controlar entrada e saída de caixa na minha barbearia e não sei montar planilha.",
    variaveis: [
      v("O_QUE", "O que controlar", "entrada e saída de caixa"),
      v("NEGOCIO", "Seu negócio", "barbearia"),
    ],
    ferramentasSugeridas: ["gemini-workspace", "chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["planilha", "fórmulas", "controle"],
  },

  /* ---------------- ADMINISTRATIVO ---------------- */
  {
    titulo: "Transformar o jeito que fazemos em um procedimento escrito",
    corpo:
      "Contexto: no meu [NEGOCIO], [PROCESSO] é feito assim: [COMO_E_HOJE].\nObjetivo: transformar isso num procedimento de uma página que uma pessoa nova consiga seguir.\nFormato: passo a passo numerado, responsável por passo, o que fazer quando der errado e um checklist final.\nRestrições: linguagem simples, sem jargão; cada passo com um verbo no início; máximo de uma página.",
    categoria: "Administrativo",
    setor: "Administrativo",
    dica:
      "Procedimento escrito é o que permite tirar férias. É também a base de qualquer automação futura.",
    exemploPreenchido:
      "Contexto: na minha loja, a conferência de entrega é feita assim: a pessoa confere a nota, separa o que veio errado e avisa o fornecedor pelo WhatsApp.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "loja"),
      v("PROCESSO", "Qual processo", "conferência de entrega"),
      v("COMO_E_HOJE", "Como é feito hoje", "confere nota, separa erro, avisa fornecedor"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["processo", "POP", "equipe"],
  },
  {
    titulo: "Reunião em plano de ação",
    corpo:
      "Contexto: seguem as anotações de uma reunião do meu negócio: [NOTAS].\nObjetivo: transformar em plano de ação.\nFormato: tabela com decisão, ação, responsável, prazo e o que depende de outra coisa. Depois, uma lista do que ficou sem resposta.\nRestrições: não invente responsável nem prazo — onde não foi dito, escreva [DEFINIR].",
    categoria: "Administrativo",
    setor: "Administrativo",
    dica: "A lista do que ficou sem resposta costuma ser a parte mais útil.",
    exemploPreenchido:
      "Contexto: anotações da reunião de segunda: decidimos trocar o fornecedor de embalagem, ninguém falou de prazo, e a Ana vai cotar três opções.",
    variaveis: [v("NOTAS", "Anotações", "cole aqui as anotações")],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["reunião", "plano de ação"],
  },
  {
    titulo: "E-mail difícil de escrever",
    corpo:
      "Contexto: preciso escrever para [DESTINATARIO] sobre [ASSUNTO]. A situação é: [SITUACAO].\nObjetivo: um e-mail que resolva sem queimar a relação.\nFormato: assunto, corpo de até 4 parágrafos curtos e um próximo passo claro.\nRestrições: tom [TOM]; nada de passivo-agressivo; não ameace nem peça desculpa por algo que não é meu erro.",
    categoria: "Administrativo",
    setor: "Administrativo",
    dica:
      "Descreva a situação com honestidade, inclusive a parte incômoda. A IA escreve melhor quando sabe o que está em jogo.",
    exemploPreenchido:
      "Contexto: preciso escrever para um fornecedor sobre atraso recorrente. A situação é: terceira entrega atrasada, já avisei duas vezes, não quero trocar de fornecedor ainda.",
    variaveis: [
      v("DESTINATARIO", "Para quem", "fornecedor"),
      v("ASSUNTO", "Assunto", "atraso recorrente"),
      v("SITUACAO", "A situação", "terceiro atraso, já avisei duas vezes"),
      v("TOM", "Tom", "firme e respeitoso"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["e-mail", "fornecedor", "comunicação"],
  },

  /* ---------------- ESTOQUE E COMPRAS ---------------- */
  {
    titulo: "Descobrir o que está parado no estoque",
    corpo:
      "Contexto: seguem meus itens com quantidade e data da última venda: [DADOS].\nObjetivo: saber o que está parado e o que preciso repor.\nFormato: três listas — parado há mais tempo, perto de acabar, e giro saudável. Em cada uma, o critério que você usou.\nRestrições: use apenas os dados que eu dei; não estime demanda futura sem dizer que é estimativa.",
    categoria: "Estoque",
    setor: "Estoque",
    dica:
      "Pedir o critério é o truque: você confere se a lógica faz sentido para o seu negócio, em vez de confiar na lista.",
    exemploPreenchido:
      "Contexto: seguem meus itens com quantidade e data da última venda (colar tabela exportada do sistema).",
    variaveis: [v("DADOS", "Seus dados", "cole a tabela")],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Intermediário",
    tags: ["estoque", "giro", "reposição"],
  },
  {
    titulo: "Comparar orçamentos de fornecedores",
    corpo:
      "Contexto: recebi estes orçamentos para [COMPRA]: [ORCAMENTOS].\nObjetivo: comparar de forma justa.\nFormato: tabela comparando preço, prazo, condição de pagamento, garantia e o que está incluso. Depois, os riscos de cada um.\nRestrições: não escolha por mim — aponte o que falta perguntar a cada fornecedor antes de decidir.",
    categoria: "Compras",
    setor: "Compras",
    dica:
      "O 'não escolha por mim' importa: a decisão envolve coisas que não estão no orçamento, como confiança e histórico.",
    exemploPreenchido:
      "Contexto: recebi três orçamentos para reforma da fachada, com preços e prazos diferentes.",
    variaveis: [
      v("COMPRA", "O que vai comprar", "reforma da fachada"),
      v("ORCAMENTOS", "Os orçamentos", "cole os três"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["fornecedor", "compras", "decisão"],
  },

  /* ---------------- RH ---------------- */
  {
    titulo: "Anúncio de vaga que atrai a pessoa certa",
    corpo:
      "Contexto: preciso contratar [VAGA] para meu [NEGOCIO]. O dia a dia é: [ROTINA].\nObjetivo: um anúncio honesto, que afaste quem não se encaixa.\nFormato: o que a pessoa vai fazer, o que precisa saber, o que oferecemos e como se candidatar.\nRestrições: nada de 'família', 'vestir a camisa' ou 'trabalha sob pressão'; descreva a rotina real, inclusive a parte chata. Nada discriminatório.",
    categoria: "RH",
    setor: "RH",
    dica:
      "Anúncio que esconde a parte chata gera contratação que não dura três meses. Descrever a rotina real filtra antes.",
    exemploPreenchido:
      "Contexto: preciso contratar um atendente para minha lanchonete. O dia a dia é: atender balcão, montar pedido, limpar ao fechar, revezar fim de semana.",
    variaveis: [
      v("VAGA", "A vaga", "atendente"),
      v("NEGOCIO", "Seu negócio", "lanchonete"),
      v("ROTINA", "A rotina real", "balcão, pedidos, limpeza, fim de semana"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["contratação", "vaga"],
  },
  {
    titulo: "Roteiro de treinamento para quem acabou de entrar",
    corpo:
      "Contexto: contratei alguém para [FUNCAO] no meu [NEGOCIO].\nObjetivo: um plano de primeira semana.\nFormato: dia a dia, com o que ensinar, quem ensina e como saber que a pessoa entendeu.\nRestrições: nada de 'observar o colega' como plano inteiro; cada dia com uma tarefa que a pessoa executa de verdade.",
    categoria: "RH",
    setor: "RH",
    dica: "Combine com o NotebookLM: jogue seus procedimentos lá e a pessoa nova pergunta sem depender de você.",
    exemploPreenchido:
      "Contexto: contratei alguém para o caixa da minha padaria.",
    variaveis: [
      v("FUNCAO", "A função", "caixa"),
      v("NEGOCIO", "Seu negócio", "padaria"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "notebooklm-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["treinamento", "integração"],
  },

  /* ---------------- PESQUISA ---------------- */
  {
    titulo: "Mapear concorrentes sem inventar dados",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] em [REGIAO].\nObjetivo: entender como os concorrentes se posicionam.\nFormato: tabela com nome, o que oferecem, faixa de preço, ponto forte e ponto fraco. Ao lado de cada informação, a fonte e a data.\nRestrições: marque como [NÃO VERIFICADO] tudo que você não conseguir confirmar em fonte pública. Não invente preço.",
    categoria: "Pesquisa",
    setor: "Pesquisa",
    dica:
      "Exigir fonte e data é a diferença entre pesquisa e chute bem escrito. Confira ao menos três antes de usar.",
    exemploPreenchido:
      "Contexto: meu negócio é pet shop no bairro do Butantã, em São Paulo.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "pet shop"),
      v("REGIAO", "Região", "Butantã, São Paulo"),
    ],
    ferramentasSugeridas: ["gemini-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["concorrência", "pesquisa", "fontes"],
  },
  {
    titulo: "Perguntar aos meus próprios documentos",
    corpo:
      "Contexto: subi meus [DOCUMENTOS] para o caderno.\nObjetivo: responder [PERGUNTA] usando somente esses arquivos.\nFormato: resposta direta, seguida do trecho e do arquivo de onde ela saiu.\nRestrições: se a resposta não estiver nos arquivos, diga que não está — não complete com conhecimento geral.",
    categoria: "Pesquisa",
    setor: "Pesquisa",
    dica:
      "É para isso que serve o NotebookLM: ele responde com a citação, então dá para conferir. Use com contrato, manual e procedimento.",
    exemploPreenchido:
      "Contexto: subi meus contratos de fornecedor para o caderno.\nObjetivo: responder 'quais contratos vencem nos próximos 90 dias' usando somente esses arquivos.",
    variaveis: [
      v("DOCUMENTOS", "Seus documentos", "contratos de fornecedor"),
      v("PERGUNTA", "Sua pergunta", "quais vencem em 90 dias"),
    ],
    ferramentasSugeridas: ["notebooklm-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["notebooklm", "documentos", "citação"],
  },

  /* ---------------- ANÁLISE DE DADOS ---------------- */
  {
    titulo: "Perguntas melhores sobre as minhas vendas",
    corpo:
      "Contexto: tenho os dados de venda de [PERIODO], com produto, data e valor — sem nome de cliente.\nObjetivo: descobrir o que eu deveria estar perguntando.\nFormato: 10 perguntas que esses dados conseguem responder, cada uma com a decisão que ela ajudaria a tomar.\nRestrições: nenhuma pergunta que exija dado que eu não tenho; nada de termo técnico de estatística.",
    categoria: "Análise de dados",
    setor: "Dados",
    dica:
      "Este é o prompt mais subestimado do curso. Antes de analisar, descubra o que vale perguntar.",
    exemploPreenchido:
      "Contexto: tenho os dados de venda dos últimos 12 meses, com produto, data e valor.",
    variaveis: [v("PERIODO", "Período", "últimos 12 meses")],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Inicial",
    tags: ["vendas", "perguntas", "decisão"],
  },
  {
    titulo: "Quem parou de comprar",
    corpo:
      "Contexto: seguem compras por cliente, identificados por código (sem nome): [DADOS].\nObjetivo: descobrir quem comprava com frequência e parou.\nFormato: lista por código, com quando comprava, quando parou e há quanto tempo. Depois, sugestão de abordagem por grupo.\nRestrições: não invente motivo do sumiço; trate como hipótese a ser confirmada com o cliente.",
    categoria: "Análise de dados",
    setor: "Dados",
    dica:
      "Use código no lugar do nome. A análise funciona igual e o dado do cliente não sai da sua planilha.",
    exemploPreenchido:
      "Contexto: seguem compras por cliente, identificados por código, nos últimos 18 meses.",
    variaveis: [v("DADOS", "Seus dados", "cole a tabela por código")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["clientes", "recompra", "anonimização"],
  },

  /* ---------------- AUTOMAÇÃO ---------------- */
  {
    titulo: "Desenhar uma automação antes de escolher a ferramenta",
    corpo:
      "Contexto: no meu [NEGOCIO], quando [GATILHO], hoje eu faço manualmente: [PASSOS_MANUAIS].\nObjetivo: desenhar como isso poderia funcionar sozinho.\nFormato: gatilho, passos em ordem, dados que circulam, onde uma pessoa precisa aprovar, o que fazer quando der erro e como eu desligo.\nRestrições: a automação gera rascunho e nunca envia sozinha nada que chegue ao cliente. Liste o que NÃO deve ser automatizado neste processo.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "Desenhe o processo antes de abrir qualquer ferramenta. Automatizar um processo confuso só acelera a confusão.",
    exemploPreenchido:
      "Contexto: na minha imobiliária, quando alguém preenche o formulário do site, hoje eu faço manualmente: vejo o e-mail, copio para a planilha, respondo e aviso o corretor.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "imobiliária"),
      v("GATILHO", "O que dispara", "alguém preenche o formulário"),
      v("PASSOS_MANUAIS", "O que você faz hoje", "copio para planilha, respondo, aviso"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "make"],
    nivelDificuldade: "Intermediário",
    tags: ["automação", "processo", "lead"],
  },
  {
    titulo: "Testes antes de ligar a automação de verdade",
    corpo:
      "Contexto: vou automatizar [PROCESSO].\nObjetivo: uma lista de testes antes de ligar para valer.\nFormato: o que testar, como testar e o que significa falhar, para cada caso.\nRestrições: inclua obrigatoriamente dado faltando, dado errado, execução em duplicidade, pico de volume e como desligar no meio.",
    categoria: "Automação",
    setor: "Automação",
    dica:
      "A pergunta que salva: 'como eu desligo isso às duas da tarde de uma sexta?' Se não houver resposta, não ligue.",
    exemploPreenchido: "Contexto: vou automatizar a resposta automática do formulário do site.",
    variaveis: [v("PROCESSO", "O processo", "resposta ao formulário")],
    ferramentasSugeridas: ["chatgpt-negocios", "make"],
    nivelDificuldade: "Avançado",
    tags: ["teste", "segurança", "automação"],
  },

  /* ---------------- AGENTES ---------------- */
  {
    titulo: "Escrever as regras do meu primeiro agente",
    corpo:
      "Contexto: quero um assistente digital que cuide de [TAREFA] no meu [NEGOCIO].\nObjetivo: escrever as instruções dele.\nFormato: o objetivo em uma frase, o que ele pode fazer, o que nunca pode, o tom, o que fazer quando não souber, e em que situações deve chamar uma pessoa.\nRestrições: ele nunca decide preço, desconto, crédito, cancelamento ou questão jurídica. Nunca inventa informação: quando não souber, diz que vai confirmar.",
    categoria: "Agentes",
    setor: "Agentes",
    dica:
      "As regras do que ele NÃO pode fazer são mais importantes que as do que ele pode. Escreva-as primeiro.",
    exemploPreenchido:
      "Contexto: quero um assistente digital que cuide das dúvidas sobre horário e agendamento na minha clínica.",
    variaveis: [
      v("TAREFA", "A tarefa", "dúvidas sobre horário e agendamento"),
      v("NEGOCIO", "Seu negócio", "clínica"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["agente", "regras", "limites"],
  },
  {
    titulo: "Essa tarefa serve para um agente?",
    corpo:
      "Contexto: estou pensando em delegar [TAREFA] a um assistente digital.\nObjetivo: avaliar se faz sentido.\nFormato: responda se a tarefa é repetitiva, se tem regra clara, se o erro é barato de corrigir, se dá para revisar antes do cliente ver, e conclua com sim, ainda não, ou não.\nRestrições: seja honesto — se for caso de não automatizar, diga por quê.",
    categoria: "Agentes",
    setor: "Agentes",
    dica:
      "O melhor uso deste prompt é descobrir que a tarefa ainda não serve. Isso poupa semanas.",
    exemploPreenchido:
      "Contexto: estou pensando em delegar a triagem de currículos a um assistente digital.",
    variaveis: [v("TAREFA", "A tarefa", "triagem de currículos")],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["agente", "avaliação"],
  },

  /* ---------------- PLANEJAMENTO ---------------- */
  {
    titulo: "Achar as tarefas que valem automatizar",
    corpo:
      "Contexto: segue o que eu faço numa semana comum no meu [NEGOCIO]: [TAREFAS].\nObjetivo: descobrir por onde começar com IA.\nFormato: tabela com tarefa, quantas vezes se repete, tempo gasto, risco se sair errado e se dá para revisar antes de chegar ao cliente. Depois, as três por onde começar, com o motivo.\nRestrições: comece pelo que é repetitivo e de erro barato, não pelo que parece mais impressionante.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "Esta é a primeira lição prática do curso e a base do projeto final. Faça com a sua semana de verdade.",
    exemploPreenchido:
      "Contexto: segue o que eu faço numa semana comum na minha loja: responder WhatsApp, montar orçamento, postar no Instagram, conferir estoque, fechar caixa.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "loja"),
      v("TAREFAS", "O que você faz na semana", "responder WhatsApp, orçamento, posts"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["diagnóstico", "prioridade", "projeto final"],
  },
  {
    titulo: "Plano de 30 dias que eu consiga cumprir",
    corpo:
      "Contexto: quero começar a usar IA em [AREA] do meu [NEGOCIO]. Tenho [TEMPO] por semana.\nObjetivo: um plano de 30 dias realista.\nFormato: semana a semana, com uma única coisa por semana, como saber que deu certo e o que fazer se não der.\nRestrições: no máximo uma ferramenta nova por semana; nada que exija investimento antes da terceira semana.",
    categoria: "Planejamento",
    setor: "Planejamento",
    dica:
      "Uma coisa por semana. Planos com cinco frentes simultâneas são abandonados no dia dez.",
    exemploPreenchido:
      "Contexto: quero começar a usar IA no atendimento da minha ótica. Tenho 2 horas por semana.",
    variaveis: [
      v("AREA", "Área", "atendimento"),
      v("NEGOCIO", "Seu negócio", "ótica"),
      v("TEMPO", "Tempo disponível", "2 horas"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["plano", "30 dias", "projeto final"],
  },

  /* ---------------- DOCUMENTOS ---------------- */
  {
    titulo: "Entender um contrato antes de assinar",
    corpo:
      "Contexto: vou colar um contrato que recebi, sem os dados pessoais das partes.\nObjetivo: entender o que estou assinando.\nFormato: resumo em linguagem simples, lista de obrigações minhas, lista de obrigações da outra parte, prazos, multas e os pontos que merecem atenção.\nRestrições: você não é advogado e isto não é parecer jurídico. Aponte o que eu deveria perguntar a um advogado antes de assinar.\nContrato: [CONTRATO]",
    categoria: "Documentos",
    setor: "Administrativo",
    dica:
      "Serve para entender e formular perguntas — não substitui advogado em contrato que importa.",
    exemploPreenchido:
      "Contexto: vou colar o contrato de locação do ponto comercial, sem os dados pessoais.",
    variaveis: [v("CONTRATO", "O contrato", "cole o texto")],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["contrato", "jurídico", "limite"],
  },
  {
    titulo: "Resumir documento longo sem perder o que importa",
    corpo:
      "Contexto: preciso entender [DOCUMENTO] para decidir [DECISAO].\nObjetivo: um resumo voltado para essa decisão.\nFormato: o que o documento diz sobre a minha decisão, o que ele não responde, e três perguntas que eu deveria fazer.\nRestrições: não resuma tudo — foque na decisão. Se o documento não tratar do assunto, diga.",
    categoria: "Documentos",
    setor: "Administrativo",
    dica:
      "Resumo bom é resumo com destino. Diga qual decisão está em jogo e a resposta muda completamente.",
    exemploPreenchido:
      "Contexto: preciso entender o edital de um programa de crédito para decidir se vale me inscrever.",
    variaveis: [
      v("DOCUMENTO", "O documento", "edital de crédito"),
      v("DECISAO", "A decisão", "se vale me inscrever"),
    ],
    ferramentasSugeridas: ["notebooklm-negocios", "claude-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["resumo", "decisão"],
  },

  /* ---------------- SEGURANÇA ---------------- */
  {
    titulo: "O que tirar antes de colar na IA",
    corpo:
      "Contexto: quero colar o texto abaixo em uma IA.\nObjetivo: saber o que preciso remover antes.\nFormato: liste o que deve sair e por quê, e devolva o texto já limpo, com marcadores genéricos no lugar (CLIENTE A, VALOR X).\nRestrições: mantenha o sentido do texto; troque, não apague.\nTexto: [TEXTO]",
    categoria: "Segurança",
    setor: "Segurança",
    dica:
      "Rode este antes de qualquer prompt com dado real. Vira hábito rápido e evita o erro que não dá para desfazer.",
    exemploPreenchido:
      "Contexto: quero colar a reclamação de um cliente, que tem nome, telefone e número do pedido.",
    variaveis: [v("TEXTO", "O texto", "cole aqui")],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["privacidade", "LGPD", "anonimização"],
  },
  {
    titulo: "Conferir o que a IA me devolveu",
    corpo:
      "Contexto: pedi a uma IA que produzisse o texto abaixo para o meu negócio.\nObjetivo: revisar antes de usar.\nFormato: aponte afirmações que precisam ser conferidas, números sem origem, promessas que eu não posso cumprir e trechos que não parecem o jeito que eu falo.\nRestrições: não reescreva — só aponte. Eu decido o que muda.\nTexto: [TEXTO]",
    categoria: "Segurança",
    setor: "Segurança",
    dica:
      "Usar uma IA para revisar a outra funciona bem. O 'não reescreva' mantém a decisão com você.",
    exemploPreenchido:
      "Contexto: pedi a uma IA a descrição do meu serviço e ela citou números de prazo que eu nunca informei.",
    variaveis: [v("TEXTO", "O texto gerado", "cole aqui")],
    ferramentasSugeridas: ["claude-negocios", "gemini-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["revisão", "alucinação", "qualidade"],
  },
];
