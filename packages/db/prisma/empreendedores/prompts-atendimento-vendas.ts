import type { PromptEmpreendedor } from "./prompts";

/**
 * Atendimento, Vendas e RH — o que se fala com pessoas.
 *
 * Separados do arquivo principal por volume: são três áreas com muitos
 * prompts, e um arquivo de duas mil linhas não se navega. A fronteira é
 * temática, não técnica.
 *
 * Todos seguem o C.O.F.R.E. e trazem `exemploPreenchido`, porque campo em
 * branco não ensina: ver o prompt preenchido com um caso real é o que
 * mostra o nível de detalhe esperado.
 */

const v = (chave: string, rotulo: string, exemplo: string) => ({ chave, rotulo, exemplo });

export const PROMPTS_ATENDIMENTO_VENDAS: PromptEmpreendedor[] = [
  /* ---------------- ATENDIMENTO ---------------- */
  {
    titulo: "Avisar sobre atraso antes de o cliente cobrar",
    corpo:
      "Contexto: sou de [NEGOCIO] e o pedido de um cliente vai atrasar. Motivo real: [MOTIVO].\nObjetivo: avisar antes de ele perguntar.\nFormato: mensagem curta, com o novo prazo e o que faço se não cumprir.\nRestrições: não invente desculpa, não prometa prazo que eu não confirmei e não peça desculpa três vezes. Uma vez basta.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "Avisar antes muda a conversa: quem avisa administra um problema, quem espera ser cobrado administra uma reclamação.",
    exemploPreenchido:
      "Contexto: sou de uma marcenaria e o armário vai atrasar. Motivo real: a chapa que encomendei não chegou do fornecedor.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "marcenaria"),
      v("MOTIVO", "O motivo real", "material do fornecedor atrasou"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["atraso", "proatividade", "whatsapp"],
  },
  {
    titulo: "Dizer não sem perder o cliente",
    corpo:
      "Contexto: um cliente pediu [PEDIDO] e eu não posso atender porque [MOTIVO].\nObjetivo: recusar mantendo a relação.\nFormato: mensagem curta com a recusa clara, o motivo em uma linha e uma alternativa se existir.\nRestrições: não enrole nem deixe a recusa ambígua — um 'vou ver' que nunca vira nada é pior que um não. Não invente alternativa que eu não ofereço.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "A recusa clara logo na primeira linha. Texto que enrola faz o cliente insistir e o desgaste dobra.",
    exemploPreenchido:
      "Contexto: um cliente pediu entrega no domingo e eu não posso porque não tenho equipe no fim de semana.",
    variaveis: [
      v("PEDIDO", "O que pediram", "entrega no domingo"),
      v("MOTIVO", "Por que não dá", "não tenho equipe no fim de semana"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["recusa", "limite", "relacionamento"],
  },
  {
    titulo: "Padronizar o tom de toda a equipe",
    corpo:
      "Contexto: no meu [NEGOCIO] cada pessoa responde de um jeito. Quero um padrão.\nObjetivo: escrever o guia de tom do atendimento.\nFormato: como cumprimentamos, como tratamos (você/senhor), o que nunca dizemos, como encerramos, e três exemplos — situação fácil, difícil e de recusa.\nRestrições: nada de linguagem corporativa; use o jeito que a gente fala de verdade. Máximo de uma página.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "Junte ao NotebookLM depois: a equipe consulta o guia em vez de perguntar a você.",
    exemploPreenchido:
      "Contexto: na minha ótica cada vendedor responde de um jeito no WhatsApp. Quero um padrão.",
    variaveis: [v("NEGOCIO", "Seu negócio", "ótica")],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["equipe", "padrão", "tom"],
  },
  {
    titulo: "Responder avaliação negativa em público",
    corpo:
      "Contexto: recebi esta avaliação pública: [AVALIACAO]. Minha versão do que aconteceu: [MINHA_VERSAO].\nObjetivo: responder publicamente sem piorar.\nFormato: resposta de até 4 linhas, que outras pessoas vão ler.\nRestrições: não discuta, não exponha dado do cliente, não negue o que não posso provar. Chame para resolver no privado.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "Você escreve para quem vai ler depois, não para quem reclamou. Essa é a diferença da resposta pública.",
    exemploPreenchido:
      "Contexto: avaliação de 1 estrela dizendo que o atendimento foi grosseiro. Minha versão: a cliente chegou 40 min após o horário e não havia mais vaga.",
    variaveis: [
      v("AVALIACAO", "A avaliação", "cole o texto"),
      v("MINHA_VERSAO", "Sua versão", "o que realmente aconteceu"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["avaliação", "reputação", "google"],
  },
  {
    titulo: "Classificar as mensagens do dia por urgência",
    corpo:
      "Contexto: seguem as mensagens que recebi hoje, sem nome e sem telefone: [MENSAGENS].\nObjetivo: saber o que responder primeiro.\nFormato: tabela com urgência (agora, hoje, esta semana), assunto, próxima ação e se precisa de mim ou pode ser da equipe.\nRestrições: não redija as respostas — só classifique.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "Rode no começo do dia. Ordenar antes de responder economiza mais tempo que escrever rápido.",
    exemploPreenchido:
      "Contexto: seguem as 18 mensagens que recebi hoje no WhatsApp, já sem nome e telefone.",
    variaveis: [v("MENSAGENS", "As mensagens", "cole aqui")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["triagem", "prioridade"],
  },
  {
    titulo: "Explicar um problema técnico em linguagem simples",
    corpo:
      "Contexto: preciso explicar a um cliente o que é [PROBLEMA]. Ele não é da área.\nObjetivo: que ele entenda o que houve e o que vai ser feito.\nFormato: uma comparação do dia a dia, seguida da explicação e do que fazemos agora.\nRestrições: nenhum termo técnico sem explicar antes; nada de minimizar o problema.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "Peça a comparação antes da explicação. É o que faz a pessoa entender em vez de fingir que entendeu.",
    exemploPreenchido:
      "Contexto: preciso explicar a um cliente por que a placa-mãe do notebook dele não compensa consertar.",
    variaveis: [v("PROBLEMA", "O problema", "placa-mãe queimada")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["explicação", "linguagem simples"],
  },
  {
    titulo: "Mensagem de cobrança que não constrange",
    corpo:
      "Contexto: um cliente está com [VALOR] em aberto desde [DATA]. A relação é [RELACAO].\nObjetivo: cobrar sem desgastar.\nFormato: três mensagens em sequência — lembrete, cobrança e último aviso —, cada uma para um momento.\nRestrições: nada de ameaça, nada de constrangimento, nada de mencionar terceiros. Em todas, ofereça um caminho para resolver.",
    categoria: "Atendimento",
    setor: "Financeiro",
    dica:
      "Peça as três de uma vez e guarde. A cobrança fica mais fácil quando o texto já está pronto.",
    exemploPreenchido:
      "Contexto: um cliente está com R$ 800 em aberto desde o mês passado. A relação é boa, compra há dois anos.",
    variaveis: [
      v("VALOR", "O valor", "R$ 800"),
      v("DATA", "Desde quando", "mês passado"),
      v("RELACAO", "Como é a relação", "cliente antigo e bom pagador"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["cobrança", "inadimplência"],
  },
  {
    titulo: "Script de atendimento por telefone",
    corpo:
      "Contexto: atendo [TIPO_CHAMADA] no telefone do meu [NEGOCIO].\nObjetivo: um roteiro que qualquer pessoa da equipe consiga seguir.\nFormato: abertura, perguntas na ordem, o que anotar, como encerrar e o que fazer se não souber responder.\nRestrições: linguagem natural, não robótica; nada que soe como telemarketing.",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "O 'o que fazer se não souber' é o item que salva o atendente novo — e o cliente.",
    exemploPreenchido:
      "Contexto: atendo pedidos de orçamento no telefone da minha gráfica.",
    variaveis: [
      v("TIPO_CHAMADA", "Tipo de ligação", "pedido de orçamento"),
      v("NEGOCIO", "Seu negócio", "gráfica"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["telefone", "script", "equipe"],
  },
  {
    titulo: "Recuperar cliente que sumiu",
    corpo:
      "Contexto: [QUANTOS] clientes não compram há [TEMPO] no meu [NEGOCIO].\nObjetivo: uma mensagem de reaproximação.\nFormato: três versões — uma que pergunta como ele está, uma que traz novidade, e uma com condição especial.\nRestrições: nada de 'sentimos sua falta' genérico; nada de desconto que eu não confirmei. Deixe claro como sair da lista.",
    categoria: "Atendimento",
    setor: "Vendas",
    dica:
      "Mande a primeira versão para dez pessoas antes de mandar para todas. Dez respostas dizem mais que uma suposição.",
    exemploPreenchido:
      "Contexto: 40 clientes não compram há seis meses na minha loja de suplementos.",
    variaveis: [
      v("QUANTOS", "Quantos clientes", "40"),
      v("TEMPO", "Há quanto tempo", "seis meses"),
      v("NEGOCIO", "Seu negócio", "loja de suplementos"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["reativação", "recompra"],
  },
  {
    titulo: "Transformar dúvida repetida em material de apoio",
    corpo:
      "Contexto: a pergunta [PERGUNTA] aparece toda semana no meu [NEGOCIO].\nObjetivo: parar de responder sempre do zero.\nFormato: uma resposta-base, um texto curto para post e um trecho para colocar no site ou no cardápio.\nRestrições: use apenas o que eu informar; onde faltar dado, escreva [CONFIRMAR].",
    categoria: "Atendimento",
    setor: "Atendimento",
    dica:
      "Toda pergunta que se repete três vezes merece um material. É a forma mais barata de ganhar tempo.",
    exemploPreenchido:
      "Contexto: 'vocês fazem sem lactose?' aparece toda semana na minha confeitaria.",
    variaveis: [
      v("PERGUNTA", "A pergunta", "vocês fazem sem lactose?"),
      v("NEGOCIO", "Seu negócio", "confeitaria"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["faq", "conteúdo", "tempo"],
  },

  /* ---------------- VENDAS ---------------- */
  {
    titulo: "Orçamento que o cliente entende sozinho",
    corpo:
      "Contexto: vou orçar [SERVICO]. Os itens e valores são: [ITENS].\nObjetivo: um orçamento que ele leia sem me ligar.\nFormato: cada item com o que é, por que é necessário e o valor; total; validade; forma de pagamento; e o que acontece se ele quiser tirar algum item.\nRestrições: use SOMENTE os valores que eu dei. Não some nada que eu não listei.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "O 'por que é necessário' ao lado de cada item reduz pela metade as perguntas de volta.",
    exemploPreenchido:
      "Contexto: vou orçar a instalação de ar-condicionado. Itens: aparelho R$ 2.100, instalação R$ 650, suporte R$ 120.",
    variaveis: [
      v("SERVICO", "O serviço", "instalação de ar-condicionado"),
      v("ITENS", "Itens e valores", "aparelho, instalação, suporte"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["orçamento", "clareza"],
  },
  {
    titulo: "Retomar proposta que ficou sem resposta",
    corpo:
      "Contexto: enviei uma proposta de [OFERTA] em [DATA] e não tive retorno.\nObjetivo: retomar sem parecer insistente.\nFormato: três mensagens para momentos diferentes, a última oferecendo encerrar o assunto.\nRestrições: nada de 'passando para saber'; cada mensagem tem de trazer algo novo — uma informação, um prazo, uma condição. Nada de urgência inventada.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "A terceira mensagem, que oferece encerrar, costuma ser a que traz resposta. Liberar a pessoa dá alívio.",
    exemploPreenchido:
      "Contexto: enviei uma proposta de projeto de interiores há três semanas e não tive retorno.",
    variaveis: [
      v("OFERTA", "O que foi proposto", "projeto de interiores"),
      v("DATA", "Quando", "há três semanas"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["follow-up", "proposta"],
  },
  {
    titulo: "Descobrir por que a venda não fechou",
    corpo:
      "Contexto: perdi estas vendas nos últimos meses, com o motivo que o cliente deu: [PERDAS].\nObjetivo: enxergar o padrão.\nFormato: agrupe por motivo real (não o declarado), aponte o que se repete e sugira o que testar.\nRestrições: separe o que os dados mostram do que é interpretação sua. Não conclua com um só caso.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "O motivo declarado quase nunca é o real. 'Está caro' costuma significar 'não entendi o valor'.",
    exemploPreenchido:
      "Contexto: perdi 12 vendas nos últimos três meses; a maioria disse 'vou pensar' e sumiu.",
    variaveis: [v("PERDAS", "As perdas e motivos", "liste aqui")],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["perda", "padrão", "análise"],
  },
  {
    titulo: "Apresentar preço com segurança",
    corpo:
      "Contexto: cobro [PRECO] por [OFERTA]. O que está incluso: [INCLUSO]. O que justifica: [JUSTIFICATIVA].\nObjetivo: apresentar o preço sem hesitar nem pedir desculpa.\nFormato: como introduzir o valor, o que dizer logo depois e como ficar em silêncio.\nRestrições: não sugira desconto preventivo; não use 'apenas' nem 'só' antes do valor.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Quem pede desculpa pelo preço ensina o cliente a achar caro. O silêncio depois do valor é parte da técnica.",
    exemploPreenchido:
      "Contexto: cobro R$ 2.500 por um projeto de identidade visual, com três rodadas de ajuste e arquivos finais.",
    variaveis: [
      v("PRECO", "O preço", "R$ 2.500"),
      v("OFERTA", "O que você vende", "identidade visual"),
      v("INCLUSO", "O que inclui", "três rodadas e arquivos finais"),
      v("JUSTIFICATIVA", "O que justifica", "10 anos de experiência"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["preço", "negociação"],
  },
  {
    titulo: "Oferecer algo a mais sem forçar",
    corpo:
      "Contexto: o cliente está levando [PRODUTO]. Também vendo: [OUTROS].\nObjetivo: sugerir o que faz sentido junto.\nFormato: até duas sugestões, cada uma com o motivo prático de combinar.\nRestrições: nada que ele não vá usar; se nenhum dos outros produtos fizer sentido, diga que não vale sugerir nada.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "A permissão de não sugerir nada é o que impede a lista virar empurroterapia.",
    exemploPreenchido:
      "Contexto: o cliente está levando uma bicicleta. Também vendo capacete, cadeado, bomba e farol.",
    variaveis: [
      v("PRODUTO", "O que ele leva", "bicicleta"),
      v("OUTROS", "O que mais você vende", "capacete, cadeado, farol"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["venda adicional", "ticket"],
  },
  {
    titulo: "Preparar uma reunião de venda",
    corpo:
      "Contexto: vou me reunir com [CLIENTE], que precisa de [NECESSIDADE]. O que já sei: [O_QUE_SEI].\nObjetivo: chegar preparado.\nFormato: três perguntas de abertura, os pontos a confirmar, as objeções prováveis com resposta, e o próximo passo a propor.\nRestrições: nada de script decorado; quero um roteiro que me deixe ouvir mais do que falar.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Prepare as perguntas, não as respostas. A reunião é para descobrir, não para apresentar.",
    exemploPreenchido:
      "Contexto: reunião com o dono de uma rede de farmácias que quer organizar o estoque.",
    variaveis: [
      v("CLIENTE", "Quem é", "dono de rede de farmácias"),
      v("NECESSIDADE", "O que precisa", "organizar o estoque"),
      v("O_QUE_SEI", "O que você já sabe", "tem 4 lojas, usa planilha"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["reunião", "preparação"],
  },
  {
    titulo: "Contrato simples de prestação de serviço",
    corpo:
      "Contexto: vou prestar [SERVICO] para [CLIENTE_TIPO]. Combinado: [COMBINADO].\nObjetivo: um contrato simples que proteja os dois lados.\nFormato: objeto, o que está e o que não está incluso, prazo, valor e forma de pagamento, o que acontece em caso de atraso de cada parte, e como encerrar.\nRestrições: você não é advogado e isto não é peça jurídica. Marque os pontos que merecem revisão profissional antes de eu usar.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Serve como base e como checklist do que combinar. Contrato que importa passa por advogado.",
    exemploPreenchido:
      "Contexto: vou prestar serviço de social media para uma clínica. Combinado: 12 posts por mês, R$ 1.800, pagamento no dia 5.",
    variaveis: [
      v("SERVICO", "O serviço", "gestão de social media"),
      v("CLIENTE_TIPO", "Para quem", "clínica odontológica"),
      v("COMBINADO", "O que foi combinado", "12 posts/mês, R$ 1.800"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["contrato", "serviço", "limite"],
  },
  {
    titulo: "Descrever o que eu vendo em uma frase",
    corpo:
      "Contexto: meu negócio é [NEGOCIO], atendo [PUBLICO] e resolvo [PROBLEMA].\nObjetivo: uma frase que eu use ao me apresentar.\nFormato: cinco versões, da mais direta à mais cativante, todas com menos de 20 palavras.\nRestrições: nada de 'soluções personalizadas' nem 'excelência'; use palavras que meu cliente usaria.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Teste em voz alta com alguém de fora do ramo. Se precisar explicar depois, a frase não serve.",
    exemploPreenchido:
      "Contexto: meu negócio é conserto de eletrodomésticos, atendo famílias do bairro e resolvo o aperto de ter a geladeira parada.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "conserto de eletrodomésticos"),
      v("PUBLICO", "Seu público", "famílias do bairro"),
      v("PROBLEMA", "O que resolve", "geladeira parada"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["pitch", "posicionamento"],
  },
  {
    titulo: "Tabela de preços com faixas",
    corpo:
      "Contexto: vendo [OFERTA] e hoje cobro caso a caso. Meus custos e tempo são: [CUSTOS].\nObjetivo: organizar em faixas.\nFormato: três faixas com nome, o que inclui cada uma, para quem serve e o que a diferencia da anterior.\nRestrições: não defina o preço — deixe [VALOR]; eu decido. Cada faixa precisa de uma diferença clara, não só 'mais horas'.",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Faixas encurtam a negociação: o cliente escolhe entre opções suas, em vez de negociar a única.",
    exemploPreenchido:
      "Contexto: faço fotografia de produto e cobro caso a caso. Custos: estúdio, edição, 1 dia por ensaio.",
    variaveis: [
      v("OFERTA", "O que você vende", "fotografia de produto"),
      v("CUSTOS", "Custos e tempo", "estúdio, edição, 1 dia por ensaio"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["preço", "pacotes"],
  },
  {
    titulo: "Registrar o que foi combinado depois da conversa",
    corpo:
      "Contexto: acabei de conversar com um cliente. Anotações: [NOTAS].\nObjetivo: mandar por escrito o que ficou combinado.\nFormato: mensagem curta confirmando escopo, prazo, valor e próximo passo, terminando com 'confirma se entendi certo?'.\nRestrições: não acrescente nada que não esteja nas anotações. Onde ficou vago, escreva [A CONFIRMAR].",
    categoria: "Vendas",
    setor: "Vendas",
    dica:
      "Mandar o combinado por escrito no mesmo dia evita a maior parte das discussões futuras.",
    exemploPreenchido:
      "Contexto: conversa por telefone. Anotações: quer o site em 30 dias, 5 páginas, ainda não decidiu sobre a loja virtual.",
    variaveis: [v("NOTAS", "Suas anotações", "cole aqui")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["registro", "alinhamento"],
  },

  /* ---------------- RH ---------------- */
  {
    titulo: "Perguntas para entrevistar sem enrolação",
    corpo:
      "Contexto: vou entrevistar para [VAGA] no meu [NEGOCIO]. A rotina real é: [ROTINA].\nObjetivo: perguntas que revelem se a pessoa dá conta.\nFormato: 8 perguntas sobre situações concretas que ela já viveu, com o que cada resposta revela.\nRestrições: nada de 'onde você se vê em cinco anos'; nada sobre estado civil, filhos, religião, saúde ou qualquer coisa discriminatória.",
    categoria: "RH",
    setor: "RH",
    dica:
      "Pergunte sobre o que ela já fez, não sobre o que faria. Passado é evidência; hipótese é imaginação.",
    exemploPreenchido:
      "Contexto: vou entrevistar para caixa da minha padaria. Rotina: fila grande no fim da tarde, troco, conferência no fechamento.",
    variaveis: [
      v("VAGA", "A vaga", "caixa"),
      v("NEGOCIO", "Seu negócio", "padaria"),
      v("ROTINA", "A rotina real", "fila, troco, fechamento"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["entrevista", "contratação"],
  },
  {
    titulo: "Conversa difícil com alguém da equipe",
    corpo:
      "Contexto: preciso falar com alguém da equipe sobre [ASSUNTO]. O que aconteceu: [FATOS].\nObjetivo: preparar a conversa.\nFormato: como abrir, os fatos a apresentar (sem julgamento), a pergunta que abre espaço para a versão dela, e o combinado a firmar no fim.\nRestrições: separe fato de interpretação. Nada de comparar com outra pessoa da equipe.",
    categoria: "RH",
    setor: "RH",
    dica:
      "Separar fato de interpretação é o que impede a conversa virar discussão sobre quem tem razão.",
    exemploPreenchido:
      "Contexto: preciso falar sobre atrasos. Fatos: chegou depois do horário 6 das últimas 10 vezes, sem avisar.",
    variaveis: [
      v("ASSUNTO", "O assunto", "atrasos frequentes"),
      v("FATOS", "Os fatos", "6 atrasos em 10 dias, sem aviso"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["feedback", "equipe", "conflito"],
  },
  {
    titulo: "Escala de trabalho que funciona",
    corpo:
      "Contexto: tenho [QUANTOS] na equipe, funciono [HORARIO] e o movimento é maior em [PICOS].\nObjetivo: montar a escala.\nFormato: tabela por dia e turno, com quem cobre o pico e como fica a folga de cada um.\nRestrições: respeite intervalo e folga semanal; não deixe nenhum turno com uma pessoa só no horário de pico.",
    categoria: "RH",
    setor: "RH",
    dica:
      "Confira a escala com a legislação e o acordo da categoria. A IA organiza; a regra é sua responsabilidade.",
    exemploPreenchido:
      "Contexto: tenho 5 na equipe, funciono das 9h às 22h, e o movimento é maior sexta e sábado à noite.",
    variaveis: [
      v("QUANTOS", "Tamanho da equipe", "5 pessoas"),
      v("HORARIO", "Horário", "9h às 22h"),
      v("PICOS", "Horários de pico", "sexta e sábado à noite"),
    ],
    ferramentasSugeridas: ["gemini-workspace", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["escala", "equipe"],
  },
  {
    titulo: "Reconhecer um bom trabalho de forma específica",
    corpo:
      "Contexto: alguém da equipe fez [O_QUE], e o resultado foi [RESULTADO].\nObjetivo: reconhecer de um jeito que ela saiba o que repetir.\nFormato: mensagem curta que nomeia a ação, o efeito e por que importa.\nRestrições: nada de 'parabéns pelo empenho'; o elogio tem de apontar a ação específica.",
    categoria: "RH",
    setor: "RH",
    dica:
      "Elogio genérico não ensina nada. Nomear a ação é o que faz a pessoa saber o que repetir.",
    exemploPreenchido:
      "Contexto: a atendente percebeu que um cliente estava confuso e refez a explicação de outro jeito. Resultado: ele fechou a compra.",
    variaveis: [
      v("O_QUE", "O que a pessoa fez", "refez a explicação de outro jeito"),
      v("RESULTADO", "O resultado", "o cliente fechou a compra"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["reconhecimento", "equipe"],
  },
  {
    titulo: "Passar uma tarefa adiante sem ficar refazendo",
    corpo:
      "Contexto: quero delegar [TAREFA], que hoje só eu faço. O jeito certo de fazer é: [COMO].\nObjetivo: delegar sem ter que refazer depois.\nFormato: o que entregar junto (acesso, modelo, exemplo), como explicar, o que combinar de prazo e qualidade, e em que momentos conferir.\nRestrições: nada de conferir tudo no fim — defina pontos de checagem no meio.",
    categoria: "RH",
    setor: "Administrativo",
    dica:
      "Quem delega e só olha no fim delega duas vezes. Os pontos de checagem no meio resolvem isso.",
    exemploPreenchido:
      "Contexto: quero delegar a conferência de notas fiscais, que hoje só eu faço.",
    variaveis: [
      v("TAREFA", "A tarefa", "conferência de notas"),
      v("COMO", "Como se faz", "confere valor, CNPJ e data"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["delegar", "equipe"],
  },
  {
    titulo: "Combinar o uso de IA com a equipe",
    corpo:
      "Contexto: minha equipe começou a usar IA por conta própria no meu [NEGOCIO].\nObjetivo: combinar regras antes de virar problema.\nFormato: o que pode ser usado, o que nunca pode ser colado, o que sempre precisa de revisão humana, e a quem perguntar na dúvida.\nRestrições: linguagem de combinado, não de proibição; uma página no máximo.",
    categoria: "RH",
    setor: "Segurança",
    dica:
      "Proibir não funciona: as pessoas usam escondido e sem critério. Combinar regras funciona.",
    exemploPreenchido:
      "Contexto: descobri que a equipe da minha imobiliária está usando IA para escrever anúncios, sem critério.",
    variaveis: [v("NEGOCIO", "Seu negócio", "imobiliária")],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["política", "equipe", "privacidade"],
  },
];
