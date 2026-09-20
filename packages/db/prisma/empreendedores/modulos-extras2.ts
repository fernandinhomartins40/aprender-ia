import { TipoLicao } from "@prisma/client";
import type { LicaoExtra } from "./modulos-extras";

/**
 * A segunda leva de lições complementares.
 *
 * Cobre o que a auditoria contra o briefing apontou como raso:
 *
 * - **Imagens (Fase 5)**: o briefing lista 17 tópicos — edição, uso de
 *   referências, consistência visual, texto em imagem, mockup, banner,
 *   cardápio. Havia 5 lições.
 * - **Vídeo (Fase 6)**: 6 casos pedidos (propaganda, Instagram,
 *   apresentação de serviço, institucional, rede social, demonstração).
 *   Havia 4 lições.
 * - **Dia a dia (Fase 3)**: o briefing lista 15 casos, cada um com
 *   ANTES / COM IA / TEMPO ECONOMIZADO / PROMPT / RESULTADO. Havia 2.
 *
 * O formato `ANTES_DEPOIS` foi criado exatamente para esses 15 casos e
 * estava sendo usado em dois. Aqui ele carrega o peso que devia.
 */

export const LICOES_EXTRAS_2: LicaoExtra[] = [
  /* ============================================================
     FASE 3 — IA no dia a dia: os casos que faltavam
     ============================================================ */
  {
    modulo: "IA no dia a dia da empresa",
    titulo: "Responder reclamação: antes e depois",
    tipo: TipoLicao.ANTES_DEPOIS,
    xp: 20,
    tempo: 8,
    cap: "Cap. 3.1",
    conteudo: {
      tarefa: "Responder uma reclamação séria sem piorar a situação",
      antes: {
        titulo: "Como é hoje",
        tempo: "40 minutos, e o dia estragado",
        passos: [
          "Lê a mensagem e sente o estômago apertar",
          "Escreve uma resposta, apaga, escreve outra",
          "Deixa para depois e a reclamação envelhece",
          "Responde tarde, já irritado, e o tom vaza no texto",
        ],
      },
      depois: {
        titulo: "Com IA",
        tempo: "10 minutos, com a cabeça mais fria",
        passos: [
          "Cola a reclamação sem nome e telefone",
          "Escreve o que você NÃO pode prometer — essa é a parte que salva",
          "Recebe uma resposta que reconhece sem admitir culpa não verificada",
          "Ajusta o que não soa seu e envia no mesmo dia",
        ],
      },
      economia: "30 minutos por reclamação — e a resposta sai no mesmo dia, que é o que o cliente mede",
      prompt: {
        titulo: "O prompt da reclamação",
        corpo:
          "Contexto: sou dono de [NEGOCIO]. Recebi a reclamação abaixo. O que realmente aconteceu, pelo que eu sei: [SUA_VERSAO].\nObjetivo: responder de um jeito que resolva e preserve a relação.\nFormato: mensagem de até 6 linhas, pronta para enviar.\nRestrições: não admita culpa sobre o que ainda não foi verificado; não prometa prazo, desconto ou reembolso que eu não autorizei; não use 'lamentamos o ocorrido' — escreva como gente.\nReclamação: [RECLAMACAO]",
        variaveis: [
          { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "assistência técnica" },
          { chave: "SUA_VERSAO", rotulo: "O que aconteceu", exemplo: "a peça atrasou no fornecedor" },
          { chave: "RECLAMACAO", rotulo: "A reclamação", exemplo: "cole aqui" },
        ],
      },
      resultadoEsperado:
        "Uma resposta que reconhece o problema, explica sem se justificar demais, e termina com um próximo passo concreto.",
      atencao:
        "Reclamação que envolve saúde, segurança ou dano grave não se responde por texto gerado. Ligue. A IA ajuda a preparar o que dizer, não a evitar a conversa.",
    },
  },
  {
    modulo: "IA no dia a dia da empresa",
    titulo: "Criar anúncio e campanha: antes e depois",
    tipo: TipoLicao.ANTES_DEPOIS,
    xp: 20,
    tempo: 8,
    cap: "Cap. 3.2",
    conteudo: {
      tarefa: "Montar uma campanha de uma semana para uma data ou oferta",
      antes: {
        titulo: "Como é hoje",
        tempo: "Uma tarde inteira, quando acontece",
        passos: [
          "Olha o que os concorrentes estão postando",
          "Copia a ideia e adapta às pressas",
          "Escreve os textos no dia de postar, com o movimento na loja",
          "Metade da campanha não sai porque faltou tempo",
        ],
      },
      depois: {
        titulo: "Com IA",
        tempo: "50 minutos, uma vez, na segunda-feira",
        passos: [
          "Descreve o negócio, o público e a oferta real",
          "Recebe sete dias com ideia, primeira frase e o que mostrar na imagem",
          "Ajusta o que não combina com o seu jeito",
          "Agenda tudo de uma vez e a semana corre sozinha",
        ],
      },
      economia: "Cerca de 3 horas por campanha — e a campanha inteira sai, em vez de metade",
      prompt: {
        titulo: "O prompt da campanha",
        corpo:
          "Contexto: meu negócio é [NEGOCIO], falo com [PUBLICO] e quero destacar [OFERTA] durante uma semana.\nObjetivo: uma campanha de 7 dias que eu consiga executar sozinho.\nFormato: para cada dia — a ideia, a primeira frase do post, o que aparece na imagem e a chamada final.\nRestrições: um post por dia; nada que exija equipe de filmagem; sem promessa de desconto que eu não confirmei; sem urgência falsa. Inclua o que preparar antes (estoque, equipe, horário).",
        variaveis: [
          { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "floricultura" },
          { chave: "PUBLICO", rotulo: "Seu público", exemplo: "moradores do bairro" },
          { chave: "OFERTA", rotulo: "O que destacar", exemplo: "arranjos de Dia das Mães" },
        ],
      },
      resultadoEsperado:
        "Sete dias planejados, com o que preparar antes — que é o item que separa campanha de correria.",
      atencao:
        "O calendário só funciona se respeitar a sua frequência real. Plano de um post por dia para quem consegue dois por semana é plano abandonado no dia quatro.",
    },
  },
  {
    modulo: "IA no dia a dia da empresa",
    titulo: "Organizar tarefas e reunião: antes e depois",
    tipo: TipoLicao.ANTES_DEPOIS,
    xp: 20,
    tempo: 8,
    cap: "Cap. 3.3",
    conteudo: {
      tarefa: "Transformar uma reunião em tarefas que alguém de fato faz",
      antes: {
        titulo: "Como é hoje",
        tempo: "A reunião acaba e some",
        passos: [
          "Todo mundo concorda com tudo durante a conversa",
          "Ninguém anota quem faz o quê",
          "Duas semanas depois, a mesma pauta volta",
          "A sensação é de que a reunião foi perda de tempo — e foi",
        ],
      },
      depois: {
        titulo: "Com IA",
        tempo: "10 minutos depois da reunião",
        passos: [
          "Cola as anotações, mesmo bagunçadas",
          "Recebe decisão, ação, responsável e prazo em tabela",
          "Vê a lista do que ficou sem resposta — a parte mais útil",
          "Manda no grupo e todo mundo sabe o que ficou com quem",
        ],
      },
      economia: "A reunião passa a produzir resultado — que é diferente de economizar tempo",
      prompt: {
        titulo: "O prompt da ata",
        corpo:
          "Contexto: seguem as anotações de uma reunião do meu negócio: [NOTAS]\nObjetivo: transformar em plano de ação.\nFormato: tabela com decisão, ação, responsável, prazo e o que depende de outra coisa. Depois, uma lista do que ficou sem resposta.\nRestrições: não invente responsável nem prazo — onde não foi dito, escreva [DEFINIR]. Não transforme em decisão o que ficou como dúvida.",
        variaveis: [{ chave: "NOTAS", rotulo: "Suas anotações", exemplo: "cole aqui" }],
      },
      resultadoEsperado:
        "Uma tabela com [DEFINIR] nos pontos que ninguém combinou — que é exatamente onde a próxima reunião deve começar.",
      atencao:
        "Se a lista de [DEFINIR] vier maior que a de decisões, o problema não é a ata: é a reunião. Vale rever a pauta antes de marcar a próxima.",
    },
  },
  {
    modulo: "IA no dia a dia da empresa",
    titulo: "Contrato e documento simples: antes e depois",
    tipo: TipoLicao.ANTES_DEPOIS,
    xp: 20,
    tempo: 8,
    cap: "Cap. 3.3",
    conteudo: {
      tarefa: "Colocar no papel o que foi combinado com o cliente",
      antes: {
        titulo: "Como é hoje",
        tempo: "Não acontece — fica no combinado verbal",
        passos: [
          "Combina tudo por WhatsApp, em mensagens espalhadas",
          "Começa o trabalho sem nada escrito",
          "No meio, o cliente lembra diferente do que foi dito",
          "A discussão custa a relação, o dinheiro, ou os dois",
        ],
      },
      depois: {
        titulo: "Com IA",
        tempo: "20 minutos, uma vez — e depois só adaptar",
        passos: [
          "Descreve o que foi combinado, com suas palavras",
          "Recebe escopo, o que NÃO está incluso, prazo e forma de pagamento",
          "Vê marcados os pontos que merecem revisão de advogado",
          "Envia e pede confirmação por escrito antes de começar",
        ],
      },
      economia: "Uma discussão evitada paga o tempo de um ano fazendo isso",
      prompt: {
        titulo: "O prompt do contrato simples",
        corpo:
          "Contexto: vou prestar [SERVICO] para [CLIENTE_TIPO]. O combinado foi: [COMBINADO].\nObjetivo: um documento simples que proteja os dois lados.\nFormato: objeto, o que está e o que NÃO está incluso, prazo, valor e forma de pagamento, o que acontece se cada parte atrasar, e como encerrar.\nRestrições: você não é advogado e isto não é peça jurídica. Marque os pontos que merecem revisão profissional antes de eu usar. Não invente cláusula que eu não mencionei.",
        variaveis: [
          { chave: "SERVICO", rotulo: "O serviço", exemplo: "gestão de redes sociais" },
          { chave: "CLIENTE_TIPO", rotulo: "Para quem", exemplo: "uma clínica" },
          { chave: "COMBINADO", rotulo: "O combinado", exemplo: "12 posts/mês, R$ 1.800, pago dia 5" },
        ],
      },
      resultadoEsperado:
        "Um documento de uma página com o 'não incluso' escrito — que é a cláusula que evita 90% das discussões.",
      atencao:
        "Serve como base e como checklist do que combinar. Contrato de valor alto ou de risco passa por advogado, sempre.",
    },
  },
  {
    modulo: "IA no dia a dia da empresa",
    titulo: "Resumir documento longo: antes e depois",
    tipo: TipoLicao.ANTES_DEPOIS,
    xp: 20,
    tempo: 8,
    cap: "Cap. 3.4",
    conteudo: {
      tarefa: "Entender um edital, contrato ou norma que chegou",
      antes: {
        titulo: "Como é hoje",
        tempo: "Duas horas, ou nunca",
        passos: [
          "Abre o PDF de 40 páginas e fecha",
          "Deixa para o fim de semana",
          "No fim de semana, lê na diagonal e não entende",
          "Perde o prazo ou assina sem saber o que assinou",
        ],
      },
      depois: {
        titulo: "Com IA",
        tempo: "15 minutos",
        passos: [
          "Anexa o documento e diz qual decisão está em jogo",
          "Recebe o que ele diz sobre essa decisão — e só sobre ela",
          "Vê o que o documento não responde",
          "Sai com três perguntas certas para fazer a quem enviou",
        ],
      },
      economia: "Mais de uma hora por documento — e a decisão passa a ser informada",
      prompt: {
        titulo: "O prompt do resumo com destino",
        corpo:
          "Contexto: preciso entender [DOCUMENTO] para decidir [DECISAO].\nObjetivo: um resumo voltado para essa decisão, não um resumo geral.\nFormato: o que o documento diz sobre a minha decisão, o que ele NÃO responde, e três perguntas que eu deveria fazer.\nRestrições: não resuma tudo — foque na decisão. Se o documento não tratar do assunto, diga. Não interprete cláusula jurídica como se fosse parecer.",
        variaveis: [
          { chave: "DOCUMENTO", rotulo: "O documento", exemplo: "edital de um programa de crédito" },
          { chave: "DECISAO", rotulo: "A decisão", exemplo: "se vale me inscrever" },
        ],
      },
      resultadoEsperado:
        "Um resumo com destino, mais a lista do que ficou sem resposta — que é o que você leva para a conversa.",
      atencao:
        "Resumo bom é resumo com destino. Peça 'resuma este edital' e receba o mesmo texto encurtado; diga a decisão e receba o que interessa.",
    },
  },
  {
    modulo: "IA no dia a dia da empresa",
    titulo: "Caso: o prestador que perdia serviço por demorar a orçar",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 12,
    cap: "Cap. 3.2",
    conteudo: {
      titulo: "O prestador que perdia serviço por demorar a orçar",
      cena:
        "Um instalador de ar-condicionado recebia uns 12 pedidos de orçamento por semana. Fazia todos à noite, depois do serviço, e levava de dois a três dias para responder. Quando respondia, metade já tinha contratado outro. Ele achava que o problema era preço — até que um cliente falou: 'na verdade eu ia com você, mas precisava resolver naquele dia'.",
      pergunta:
        "Onde ele está perdendo, e qual parte do processo a IA resolve? Cuidado: nem tudo aqui é problema de texto.",
      pistas: [
        "Separe o tempo de escrever do tempo de decidir o preço",
        "Repare que ele responde quando está cansado",
        "Pergunte o que poderia sair no mesmo dia mesmo sem o preço final",
      ],
      fechamento:
        "A IA não define o preço dele — isso depende de deslocamento, material e agenda. Mas o que trava não é o preço: é montar o texto do orçamento do zero toda vez, à noite. Com um modelo pronto onde ele só preenche os valores, o orçamento sai em cinco minutos, no intervalo entre dois serviços. E o que ganha o cliente é a resposta no mesmo dia.",
    },
  },

  /* ============================================================
     FASE 5 — Imagens: os tópicos que faltavam
     ============================================================ */
  {
    modulo: "Imagens que vendem",
    titulo: "Editar uma imagem em vez de gerar outra",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 10,
    cap: "Cap. 5.3",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Quando a imagem sai quase boa, a reação comum é gerar de novo. Na maioria das vezes isso piora: vem outra imagem, diferente em tudo, e você perdeu a que estava perto.",
        },
        {
          tipo: "texto",
          texto:
            "Editar é diferente de gerar. Você aponta o que mudar e o resto fica como está — mesma luz, mesma composição, mesmo produto.",
        },
        {
          tipo: "lista",
          titulo: "Duas formas de editar",
          itens: [
            "Selecionar a área e descrever a mudança: 'troque o fundo desta parte'",
            "Descrever na conversa: 'a sombra está dura demais, deixe mais suave'",
          ],
        },
        {
          tipo: "destaque",
          titulo: "Uma coisa por vez",
          texto:
            "Peça um ajuste, veja o resultado, peça o próximo. Quem manda três mudanças juntas recebe uma imagem diferente, não uma imagem corrigida — e perde a referência de qual pedido funcionou.",
        },
        {
          tipo: "lista",
          titulo: "O que a edição resolve bem",
          itens: [
            "Trocar ou limpar o fundo mantendo o produto",
            "Ajustar iluminação e sombra",
            "Remover um objeto que não deveria estar na cena",
            "Mudar a cor de um elemento específico",
            "Ampliar a imagem para outro formato sem cortar o principal",
          ],
        },
        {
          tipo: "atencao",
          titulo: "O limite que importa no seu negócio",
          texto:
            "Editar a foto do seu produto para ficar mais bonita que o produto real é o caminho mais curto para devolução e reclamação. Corrija luz e fundo; não corrija o que o cliente vai receber.",
        },
        {
          tipo: "dica",
          titulo: "Guarde a versão que funcionou",
          texto:
            "Baixe a imagem boa antes de continuar editando. Conversa longa se perde, e recuperar uma versão intermediária costuma ser impossível.",
        },
      ],
    },
  },
  {
    modulo: "Imagens que vendem",
    titulo: "Usar uma imagem como referência",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 9,
    cap: "Cap. 5.3",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Descrever um estilo em palavras é difícil e impreciso. 'Moderno e clean' significa coisas diferentes para cada pessoa — inclusive para a IA.",
        },
        {
          tipo: "texto",
          texto:
            "Enviar uma imagem como referência resolve em um passo o que dez adjetivos não resolvem. Você anexa e diz o que quer daquela imagem: o estilo, a luz, o enquadramento ou a paleta.",
        },
        {
          tipo: "destaque",
          titulo: "Seja específico sobre o que copiar",
          texto:
            "Não diga 'faça parecida com esta'. Diga 'use a mesma iluminação lateral e a mesma paleta de cores desta imagem, mas com o meu produto'. Sem isso, ela copia o que achar que importa.",
        },
        {
          tipo: "lista",
          titulo: "O que dá para pedir a partir de uma referência",
          itens: [
            "A mesma iluminação e clima",
            "A mesma paleta de cores",
            "O mesmo tipo de enquadramento e distância",
            "O mesmo estilo de fundo",
            "A mesma proporção entre produto e espaço vazio",
          ],
        },
        {
          tipo: "atencao",
          titulo: "Referência não é para copiar concorrente",
          texto:
            "Usar a foto do concorrente como referência de estilo é diferente de reproduzir a peça dele. Copiar arte, logotipo ou layout alheio é problema — de imagem de marca e, dependendo do caso, jurídico.",
        },
        {
          tipo: "dica",
          titulo: "A melhor referência é sua",
          texto:
            "Quando uma imagem sua der certo, guarde. Ela vira a referência de todas as próximas, e é assim que o material passa a parecer de uma marca só.",
        },
      ],
    },
  },
  {
    modulo: "Imagens que vendem",
    titulo: "Consistência visual: parecer uma marca, não imagens avulsas",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 10,
    cap: "Cap. 5.4",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Dez imagens bonitas e diferentes entre si não formam uma marca. Cinco imagens parecidas, com a mesma luz e as mesmas cores, formam — mesmo que cada uma isolada seja mais simples.",
        },
        {
          tipo: "destaque",
          titulo: "O que mantém a consistência",
          texto:
            "Três coisas: a mesma paleta de cores, o mesmo tipo de iluminação e o mesmo tipo de fundo. Se você fixar essas três e variar o resto, tudo vai parecer da mesma casa.",
        },
        {
          tipo: "lista",
          titulo: "Como fixar na prática",
          itens: [
            "Escreva as três decisões num papel: cores, luz, fundo",
            "Cole essas três linhas em todo pedido de imagem",
            "Use sempre a mesma imagem aprovada como referência",
            "Gere as variações de uma vez, não uma por semana",
          ],
        },
        {
          tipo: "texto",
          texto:
            "Gerar tudo de uma vez importa mais do que parece: imagens feitas em dias diferentes, com pedidos levemente diferentes, saem levemente diferentes — e o conjunto perde a unidade.",
        },
        {
          tipo: "destaque",
          titulo: "Um exemplo concreto",
          texto:
            "Uma doceria fixou: fundo de mármore branco, luz natural lateral, tons quentes. Toda foto de doce novo usa essas três linhas mais a descrição do doce. O feed inteiro parece de um estúdio só, e ela nunca contratou fotógrafo.",
        },
        {
          tipo: "dica",
          titulo: "Escreva o seu padrão hoje",
          texto:
            "Não precisa de designer. Escolha três cores que combinam com o que você vende, decida entre luz natural e luz de estúdio, e escolha um fundo. Pronto — esse é o seu padrão, e ele já vale mais que nenhum.",
        },
      ],
    },
  },
  {
    modulo: "Imagens que vendem",
    titulo: "Texto na imagem: por que sai errado e o que fazer",
    tipo: TipoLicao.TEORIA,
    xp: 15,
    tempo: 8,
    cap: "Cap. 5.4",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Peça uma imagem com o nome da sua loja escrito e, na maioria das vezes, vem uma letra torta, uma palavra com letra a mais, ou algo que parece texto mas não é.",
        },
        {
          tipo: "texto",
          texto:
            "Melhorou muito nos últimos anos, e ainda erra — principalmente em texto longo, fonte específica e palavra em português com acento.",
        },
        {
          tipo: "destaque",
          titulo: "A regra que resolve",
          texto:
            "Gere a imagem limpa, sem texto, e escreva o texto depois no Canva. Leva dois minutos, sai certo, e você pode mudar o preço no mês seguinte sem gerar a imagem de novo.",
        },
        {
          tipo: "lista",
          titulo: "Peça sempre isto no pedido de imagem",
          itens: [
            "Sem texto na imagem",
            "Espaço vazio na parte superior (ou onde o texto vai entrar)",
            "Sem marca ou logotipo de outra empresa",
            "Fundo limpo na área reservada ao texto",
          ],
        },
        {
          tipo: "texto",
          texto:
            "O 'espaço vazio' é o detalhe que quase ninguém pede e que mais poupa retrabalho: sem ele você recebe uma imagem bonita e cheia, sem onde escrever.",
        },
        {
          tipo: "atencao",
          titulo: "Quando você precisa mesmo do texto na imagem",
          texto:
            "Se for inevitável, use palavra curta, em inglês ou sem acento, e confira letra por letra antes de publicar. Uma palavra errada num banner circula e não volta.",
        },
      ],
    },
  },
  {
    modulo: "Imagens que vendem",
    titulo: "Laboratório: o cardápio ou a tabela de preços",
    tipo: TipoLicao.LABORATORIO,
    xp: 35,
    tempo: 25,
    cap: "Cap. 5.4",
    conteudo: {
      titulo: "Um material que você vai imprimir ou publicar",
      contexto:
        "Cardápio, tabela de serviços, lista de preços — o material que o cliente lê antes de decidir. Vamos fazer o fundo na IA e o texto no Canva.",
      passos: [
        "Liste seus itens e preços num papel antes de abrir qualquer ferramenta.",
        "Peça à IA o fundo decorativo, com elementos nas bordas e centro limpo.",
        "Baixe e abra no Canva.",
        "Escreva os itens por cima, agrupados por categoria.",
        "Confira: dá para ler o preço a um braço de distância?",
      ],
      promptSugerido: {
        titulo: "O fundo do material",
        corpo:
          "Assunto: fundo decorativo para [MATERIAL] de [NEGOCIO].\nComposição: elementos nas bordas, centro totalmente limpo para o texto entrar depois.\nIluminação: uniforme, sem sombra forte.\nEstilo: [ESTILO].\nCores: [CORES], em tom suave para não competir com o texto.\nFormato: [FORMATO].\nRestrições: sem texto, sem elementos no centro, nada de contraste alto que atrapalhe a leitura por cima.",
        variaveis: [
          { chave: "MATERIAL", rotulo: "Que material", exemplo: "cardápio" },
          { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "cafeteria" },
          { chave: "ESTILO", rotulo: "Estilo", exemplo: "aquarela discreta" },
          { chave: "CORES", rotulo: "Cores", exemplo: "marrom e creme" },
          { chave: "FORMATO", rotulo: "Formato", exemplo: "retrato A4" },
        ],
      },
      campos: [
        { chave: "material", rotulo: "Que material você fez", curto: true, exemplo: "Cardápio de café da tarde" },
        { chave: "prompt", rotulo: "O prompt do fundo que funcionou" },
        { chave: "teste", rotulo: "Dá para ler a um braço de distância?", curto: true },
      ],
      criterios: [
        "O texto é legível a um braço de distância",
        "O fundo não compete com o preço",
        "Nenhum texto foi gerado pela IA",
        "Dá para trocar um preço sem refazer a imagem",
      ],
      entrega: "Um material pronto para imprimir ou publicar.",
    },
  },
  {
    modulo: "Imagens que vendem",
    titulo: "No celular: melhore uma foto que você já tirou",
    tipo: TipoLicao.NO_CELULAR,
    xp: 20,
    tempo: 10,
    cap: "Cap. 5.3",
    conteudo: {
      titulo: "A foto que está na sua galeria agora",
      tempo: "10 minutos",
      passos: [
        "Abra a galeria e ache uma foto de produto ou serviço seu que ficou mais ou menos.",
        "Envie para a IA e descreva o que incomoda: fundo bagunçado, luz fraca, enquadramento torto.",
        "Peça a correção de UMA coisa só.",
        "Compare com a original lado a lado.",
        "Se melhorou, peça o próximo ajuste. Se mudou o produto, refaça pedindo fidelidade.",
      ],
      porque:
        "Comparar lado a lado é o que revela o exagero. Muita edição deixa a imagem bonita e o produto irreconhecível — e o cliente percebe na entrega.",
    },
  },

  /* ============================================================
     FASE 6 — Vídeo: os casos que faltavam
     ============================================================ */
  {
    modulo: "Vídeo curto sem equipe",
    titulo: "Seis tipos de vídeo que um negócio pequeno usa",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 11,
    cap: "Cap. 6.2",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Vídeo não é uma coisa só. Cada tipo tem um objetivo diferente, e misturar os dois num vídeo só é o erro mais comum — o resultado não serve para nenhum.",
        },
        {
          tipo: "destaque",
          titulo: "1. Propaganda de produto",
          texto:
            "Mostra o produto funcionando e termina com uma chamada. Curto, de 15 a 30 segundos. Abre com o produto em uso, não com o logotipo.",
        },
        {
          tipo: "destaque",
          titulo: "2. Conteúdo para rede social",
          texto:
            "Ensina ou responde uma dúvida. Não vende diretamente. É o que faz gente que não te conhece parar — e é o que mais rende no longo prazo.",
        },
        {
          tipo: "destaque",
          titulo: "3. Apresentação de serviço",
          texto:
            "Explica como funciona o seu trabalho, passo a passo. Serve no site e para mandar a quem pediu orçamento — economiza a explicação repetida.",
        },
        {
          tipo: "destaque",
          titulo: "4. Demonstração",
          texto:
            "Mostra o antes e depois, ou o produto em uso real. Não precisa de narração: a imagem faz o trabalho. É o mais fácil de gravar com celular.",
        },
        {
          tipo: "destaque",
          titulo: "5. Institucional",
          texto:
            "Conta quem você é e por que faz o que faz. Um por ano basta. Serve no site e em apresentação para cliente grande.",
        },
        {
          tipo: "destaque",
          titulo: "6. Depoimento de cliente",
          texto:
            "O cliente conta a experiência dele. Convence mais que qualquer coisa que você diga — desde que não pareça decorado.",
        },
        {
          tipo: "dica",
          titulo: "Por onde começar",
          texto:
            "Demonstração e conteúdo. São os dois mais fáceis de gravar com o celular e os que mais alcançam quem ainda não te conhece.",
        },
      ],
    },
  },
  {
    modulo: "Vídeo curto sem equipe",
    titulo: "Gravar com o celular sem parecer amador",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 9,
    cap: "Cap. 6.2",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "O que separa um vídeo de celular que funciona de um que parece improvisado não é a câmera — os celulares de hoje filmam bem. São três coisas simples.",
        },
        {
          tipo: "lista",
          titulo: "As três que mais importam",
          itens: [
            "Luz na sua frente, nunca atrás — janela de frente, não de costas",
            "Celular apoiado em algo, nunca na mão solta",
            "Som: grave em lugar silencioso, ou use fone com microfone",
          ],
        },
        {
          tipo: "destaque",
          titulo: "O som importa mais que a imagem",
          texto:
            "Imagem tremida a pessoa tolera; áudio ruim ela não escuta. Se tiver que escolher onde investir atenção, escolha o som.",
        },
        {
          tipo: "lista",
          titulo: "O que a IA resolve aqui",
          itens: [
            "O roteiro em tópicos, para você falar sem decorar",
            "A primeira frase, que decide se a pessoa fica",
            "As legendas, para quem assiste sem som",
            "A descrição e os assuntos do post",
          ],
        },
        {
          tipo: "atencao",
          titulo: "Sua voz convence mais que voz sintética",
          texto:
            "Para negócio local, a voz gerada soa distante. Quem compra de você quer reconhecer a pessoa. Grave você mesmo, com os tropeços — eles ajudam.",
        },
        {
          tipo: "dica",
          titulo: "Regrave só o que ficou ruim",
          texto:
            "Não refaça o vídeo inteiro por causa de uma frase. Grave o trecho de novo e junte na edição do próprio celular.",
        },
      ],
    },
  },
  {
    modulo: "Vídeo curto sem equipe",
    titulo: "Duelo: vídeo que vende × vídeo que ensina",
    tipo: TipoLicao.DUELO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 6.2",
    conteudo: {
      situacao:
        "Uma loja de tintas quer aparecer para gente que ainda não a conhece.",
      ruim: {
        titulo: "Vídeo que vende",
        prompt:
          "Roteiro de vídeo divulgando minha loja de tintas, com nossas ofertas e diferenciais.",
        resultado:
          "Um vídeo institucional curto: fachada, prateleiras, 'qualidade e bom atendimento há 12 anos', preço. Quem já é cliente assiste; quem não é, passa direto — não havia motivo para parar.",
      },
      bom: {
        titulo: "Vídeo que ensina",
        prompt:
          "Contexto: tenho loja de tintas e atendo gente que faz reforma pequena em casa.\nObjetivo: um vídeo de 30 segundos que interesse a quem vai pintar um cômodo pela primeira vez.\nFormato: tópicos para eu falar, com a primeira e a última frase escritas.\nRestrições: não mencione minha loja até o final; o assunto tem de valer mesmo para quem vai comprar em outro lugar; nada que exija equipe.",
        resultado:
          "Um vídeo sobre quantas demãos realmente precisa, ou por que a tinta descasca. Quem tem essa dúvida para — e no fim descobre onde comprar.",
      },
      pergunta:
        "Que dúvida seus clientes têm antes de comprar de você? Escreva o roteiro que responde essa dúvida sem falar do seu negócio até o fim.",
      fechamento:
        "Conteúdo que só fala do próprio negócio alcança quem já comprou. O assunto precisa valer sozinho — a loja aparece no fim, para quem ficou.",
    },
  },
  {
    modulo: "Vídeo curto sem equipe",
    titulo: "No celular: grave 30 segundos hoje",
    tipo: TipoLicao.NO_CELULAR,
    xp: 25,
    tempo: 15,
    cap: "Cap. 6.2",
    conteudo: {
      titulo: "Do roteiro ao arquivo, em 15 minutos",
      tempo: "15 minutos, só com o celular",
      passos: [
        "Escolha a dúvida que você mais responde a cliente.",
        "Peça à IA 8 primeiras frases e escolha a que você falaria mesmo.",
        "Peça o roteiro em tópicos — nunca texto para ler.",
        "Apoie o celular, fique de frente para a janela, e grave.",
        "Peça as legendas em blocos curtos e coloque no editor do celular.",
      ],
      porque:
        "O primeiro vídeo é sempre o mais difícil. Feito uma vez, os próximos levam cinco minutos — e você descobre que a parte demorada era decidir o que dizer, não gravar.",
    },
  },
  {
    modulo: "Vídeo curto sem equipe",
    titulo: "Checkpoint: vídeo sem complicação",
    tipo: TipoLicao.CHECKPOINT,
    xp: 20,
    tempo: 5,
    cap: "Cap. 6",
    conteudo: {
      titulo: "O que você leva deste módulo",
      itens: [
        "Vídeo começa no roteiro, não na ferramenta",
        "Seis tipos, e demonstração e conteúdo são por onde começar",
        "Luz na frente, celular apoiado, som limpo — nessa ordem",
        "Sua voz convence mais que voz sintética em negócio local",
        "Legenda não é opcional: a maioria assiste sem som",
      ],
      pergunta: "Que vídeo você vai gravar esta semana?",
    },
  },
];
