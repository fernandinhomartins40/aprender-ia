import { TipoLicao } from "@prisma/client";

/**
 * O conteúdo do curso "IA para Empreendedores".
 *
 * Três regras guiaram a escrita, e vale explicá-las porque elas explicam
 * o formato de quase toda lição:
 *
 * 1. **A aula não repete a apostila.** A apostila é consulta; a lição
 *    interpreta, demonstra e faz produzir. Quando o assunto pede mais
 *    fôlego, a lição aponta o capítulo (`cap`) em vez de copiá-lo.
 *
 * 2. **Termo técnico vem depois da explicação simples.** Nunca se abre
 *    com "agente executa workflows multi-step". Abre-se com o que a
 *    pessoa já entende, e só então se dá o nome.
 *
 * 3. **Toda ferramenta tem faixa de acesso declarada.** O curso promete
 *    priorizar o gratuito; a promessa só vale se o preço estiver visível.
 *
 * O material antigo (4 casos, 4 duelos, 4 caças ao erro) foi aproveitado.
 * O que foi descartado: os dois moldes de "Trilha N" e "Módulo N" que o
 * deck repetia quatro vezes cada, preenchendo 62% dos slides com texto
 * genérico.
 */

type Licao = {
  titulo: string;
  tipo: TipoLicao;
  xp: number;
  tempo: number;
  cap?: string;
  conteudo: Record<string, unknown>;
};

type Modulo = {
  ordem: number;
  titulo: string;
  subtitulo: string;
  cor: string;
  icone: string;
  licoes: Licao[];
};

/* ============================================================
   MÓDULO 1 — IA sem complicação
   ============================================================ */

const MODULO_1: Modulo = {
  ordem: 0,
  titulo: "IA sem complicação",
  subtitulo: "O que ela faz, o que não faz e como não passar vergonha",
  cor: "#6366F1",
  icone: "ferramentas",
  licoes: [
    {
      titulo: "O que a IA já faria por você esta semana",
      tipo: TipoLicao.AQUECIMENTO,
      xp: 10,
      tempo: 3,
      cap: "Cap. 1",
      conteudo: {
        pergunta:
          "Pense na sua última semana de trabalho. Qual tarefa você refez quase igual à da semana anterior — e à da anterior?",
        fechamento:
          "Essa tarefa é o seu ponto de partida. Não a mais importante do negócio: a mais repetida. É onde a IA ajuda primeiro e onde um erro custa menos.",
        tempo: "Um minuto pensando antes de começar",
      },
    },
    {
      titulo: "O que é IA generativa, sem jargão",
      tipo: TipoLicao.TEORIA,
      xp: 15,
      tempo: 8,
      cap: "Cap. 1.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Você já usou o teclado do celular sugerindo a próxima palavra. Você escreve 'bom' e ele oferece 'dia'. Ele não sabe que dia é hoje: aprendeu que, depois de 'bom', costuma vir 'dia'.",
          },
          {
            tipo: "texto",
            texto:
              "A IA generativa faz a mesma coisa, numa escala muito maior. Em vez de sugerir a próxima palavra, ela escreve parágrafos, tabelas e textos inteiros — sempre montando o que costuma vir depois.",
          },
          {
            tipo: "destaque",
            titulo: "O nome técnico",
            texto:
              "Esse tipo de programa se chama modelo de linguagem. ChatGPT, Gemini e Claude são modelos de linguagem. Saber o nome não muda o uso, mas é bom reconhecer quando alguém falar.",
          },
          {
            tipo: "texto",
            texto:
              "Isso explica as duas coisas que mais confundem quem começa: por que ela escreve tão bem e por que ela erra com tanta segurança. Ela não está consultando uma verdade — está montando o texto mais provável.",
          },
          {
            tipo: "lista",
            titulo: "Faz bem",
            itens: [
              "Escrever, reescrever e resumir",
              "Organizar informação bagunçada",
              "Dar ideias e variações de um mesmo texto",
              "Explicar algo complicado em linguagem simples",
              "Transformar anotação solta em documento",
            ],
          },
          {
            tipo: "lista",
            titulo: "Não faz",
            itens: [
              "Saber o que aconteceu no seu negócio ontem",
              "Garantir que um número está certo",
              "Decidir preço, crédito ou contratação por você",
              "Conhecer seus clientes, contratos ou estoque — a menos que você mostre",
            ],
          },
        ],
      },
    },
    {
      titulo: "Quando a IA inventa com segurança",
      tipo: TipoLicao.TEORIA,
      xp: 15,
      tempo: 7,
      cap: "Cap. 1.2",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Peça a uma IA o telefone de um fornecedor que ela não conhece. Muitas vezes ela devolve um número. Bem formatado, com DDD plausível, escrito com toda a convicção. E inventado.",
          },
          {
            tipo: "destaque",
            titulo: "O nome disso",
            texto:
              "Chama-se alucinação: quando a IA produz uma informação que parece certa e não é. Não é mentira, porque não há intenção. É o programa completando o que costuma vir depois, mesmo sem ter o dado.",
          },
          {
            tipo: "texto",
            texto:
              "O perigo não está no erro, e sim na confiança com que ele vem. Um texto hesitante a gente confere. Um texto seguro a gente copia e envia ao cliente.",
          },
          {
            tipo: "lista",
            titulo: "Onde ela mais inventa",
            itens: [
              "Preço, prazo e medida de produto",
              "Telefone, endereço e CNPJ",
              "Lei, artigo e número de norma",
              "Dados do seu próprio negócio, que ela não tem",
              "Fonte de pesquisa — inclusive links que não existem",
            ],
          },
          {
            tipo: "destaque",
            titulo: "A regra que resolve",
            texto:
              "Nada que tenha número, nome ou consequência sai sem você conferir. Para o resto — texto, ideia, organização —, ela é uma excelente primeira versão.",
          },
        ],
      },
    },
    {
      titulo: "Quiz: o que dá e o que não dá para esperar",
      tipo: TipoLicao.QUIZ,
      xp: 20,
      tempo: 5,
      cap: "Cap. 1",
      conteudo: {
        perguntas: [
          {
            pergunta:
              "Você pede à IA o prazo de garantia do produto que você vende. Ela responde '12 meses', com firmeza. O que fazer?",
            opcoes: [
              { texto: "Usar: ela respondeu com segurança", correta: false },
              { texto: "Conferir na sua ficha do produto antes de usar", correta: true },
              { texto: "Perguntar de novo para ver se repete", correta: false },
            ],
            explicacao:
              "Ela não conhece o seu produto. Repetir a resposta não confirma nada: ela pode repetir o mesmo palpite. Prazo de garantia é informação com consequência — confira na fonte.",
          },
          {
            pergunta: "Qual destas a IA faz bem sozinha?",
            opcoes: [
              { texto: "Dizer quanto você vendeu no mês passado", correta: false },
              {
                texto: "Reescrever uma resposta ríspida em tom cordial",
                correta: true,
              },
              { texto: "Decidir o preço do seu serviço", correta: false },
            ],
            explicacao:
              "Reescrever texto é exatamente o que ela faz melhor. Seus números ela não tem; seu preço envolve custo, mercado e decisão sua.",
          },
          {
            pergunta:
              "Um cliente reclamou por escrito. Você quer ajuda para responder. O que NÃO deve colar?",
            opcoes: [
              { texto: "O texto da reclamação, sem o nome e o telefone", correta: false },
              { texto: "O nome completo, telefone e endereço do cliente", correta: true },
              { texto: "A descrição do problema", correta: false },
            ],
            explicacao:
              "A IA não precisa do nome para escrever a resposta. Dado pessoal de cliente não deve ser colado — troque por 'CLIENTE A' e o resultado é o mesmo.",
          },
          {
            pergunta: "A IA escreveu um texto ótimo citando uma pesquisa. E agora?",
            opcoes: [
              { texto: "Publicar: a fonte dá credibilidade", correta: false },
              {
                texto: "Procurar a pesquisa. Se não achar, tirar a citação",
                correta: true,
              },
              { texto: "Pedir o link para a IA e confiar nele", correta: false },
            ],
            explicacao:
              "Fonte inventada é das alucinações mais comuns — inclusive links que abrem em página de erro. Se você não achou a pesquisa, ela não entra no seu material.",
          },
        ],
      },
    },
    {
      titulo: "Caça ao erro: o orçamento com dado inventado",
      tipo: TipoLicao.CACA_ERRO,
      xp: 25,
      tempo: 8,
      cap: "Cap. 1.2",
      conteudo: {
        contexto:
          "Um prestador pediu à IA um orçamento de pintura. Ela devolveu o texto abaixo, que parece profissional. Há três problemas escondidos.",
        texto:
          "Orçamento de pintura residencial — 80 m²\n\nValor: R$ 3.200,00, já incluso material.\nPrazo: 4 dias úteis, conforme a média do setor.\nGarantia: 5 anos contra descascamento, de acordo com a norma ABNT NBR 13245.\n\nTinta acrílica premium de primeira linha, com rendimento de 12 m² por litro.",
        erros: [
          {
            trecho: "R$ 3.200,00",
            porque:
              "Preço que você não informou. A IA não sabe seu custo, sua margem nem a sua região — este número saiu do nada.",
          },
          {
            trecho: "5 anos contra descascamento, de acordo com a norma ABNT NBR 13245",
            porque:
              "Citação de norma com número específico. É o formato clássico da alucinação: preciso demais para ser chute, inventado do mesmo jeito. Nunca cite norma sem conferir.",
          },
          {
            trecho: "rendimento de 12 m² por litro",
            porque:
              "Especificação técnica de um produto que você não informou. Rendimento varia por marca, superfície e número de demãos.",
          },
        ],
        licao:
          "Repare no padrão: tudo que tem número foi inventado. Foi exatamente por isso que o prompt de orçamento deste curso tem a restrição 'não invente preço — deixe [VALOR] onde eu devo preencher'.",
      },
    },
    {
      titulo: "Escolher a ferramenta pelo trabalho, não pela fama",
      tipo: TipoLicao.TEORIA,
      xp: 15,
      tempo: 7,
      cap: "Cap. 1.3",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "A pergunta 'qual IA é a melhor' não tem resposta útil. A pergunta que resolve é 'qual delas serve para o que eu preciso fazer agora'.",
          },
          {
            tipo: "lista",
            titulo: "Para começar hoje, de graça",
            itens: [
              "ChatGPT — escrever, responder, organizar. Conversa de texto sem limite fixo; imagem e upload têm cota.",
              "Gemini — bom para quem já usa Gmail, Drive e Planilhas do Google.",
              "Claude — forte em texto longo e documento.",
              "NotebookLM — responde com base nos SEUS arquivos, citando de onde tirou.",
            ],
          },
          {
            tipo: "destaque",
            titulo: "Sobre o que é gratuito",
            texto:
              "Quase nada é simplesmente 'grátis'. O comum é gratuito com limite: você usa até certo ponto e depois espera ou paga. Na tela de Ferramentas, cada uma mostra a faixa e o limite real.",
          },
          {
            tipo: "texto",
            texto:
              "Escolha uma e use por duas semanas antes de testar outra. Trocar de ferramenta toda semana faz você aprender o botão de cada uma e o ofício de nenhuma.",
          },
        ],
      },
    },
    {
      titulo: "Checkpoint: o que você já sabe",
      tipo: TipoLicao.CHECKPOINT,
      xp: 20,
      tempo: 5,
      cap: "Cap. 1",
      conteudo: {
        titulo: "O que você leva deste módulo",
        itens: [
          "IA generativa monta o texto mais provável — por isso escreve bem e erra com confiança",
          "Alucinação é inventar com segurança: cuidado redobrado com número, norma e fonte",
          "Dado pessoal de cliente não vai para a IA — troque por CLIENTE A",
          "Ferramenta se escolhe pelo trabalho, e cada uma tem um limite gratuito real",
        ],
        pergunta:
          "Qual tarefa da sua semana você vai levar para o próximo módulo, para transformar em um pedido bem-feito?",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 2 — Como conversar com uma IA
   ============================================================ */

const MODULO_2: Modulo = {
  ordem: 1,
  titulo: "Como pedir e receber o que você precisa",
  subtitulo: "A diferença entre um pedido vago e um pedido que funciona",
  cor: "#0EA5E9",
  icone: "prompts",
  licoes: [
    {
      titulo: "Por que a resposta veio genérica",
      tipo: TipoLicao.AQUECIMENTO,
      xp: 10,
      tempo: 3,
      cap: "Cap. 2",
      conteudo: {
        pergunta:
          "Se você pedisse a um funcionário novo 'escreva algo para os clientes', o que ele entregaria?",
        fechamento:
          "Provavelmente algo genérico — e a culpa não seria dele. Com a IA é igual: resposta vaga quase sempre é resposta a um pedido vago.",
        tempo: "Um minuto",
      },
    },
    {
      titulo: "C.O.F.R.E.: as cinco partes de um bom pedido",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 10,
      cap: "Cap. 2.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Um pedido que funciona tem cinco partes. A palavra C.O.F.R.E. ajuda a lembrar — e também a ideia: é onde você guarda o que tem valor.",
          },
          {
            tipo: "destaque",
            titulo: "C — Contexto",
            texto:
              "Quem é você e qual é a situação. 'Sou dona de um salão de bairro, com três cadeiras e duas funcionárias.'",
          },
          {
            tipo: "destaque",
            titulo: "O — Objetivo",
            texto:
              "O que você quer conseguir. Não 'fale sobre promoções', mas 'quero trazer de volta clientes que não aparecem há três meses'.",
          },
          {
            tipo: "destaque",
            titulo: "F — Formato",
            texto:
              "Como a resposta deve chegar. Mensagem de WhatsApp? Tabela? Lista de cinco itens? Sem isso, você recebe um texto corrido que terá de reformatar.",
          },
          {
            tipo: "destaque",
            titulo: "R — Restrições",
            texto:
              "O que não pode. É a parte que quase ninguém escreve e a que mais muda o resultado: 'não prometa desconto', 'não invente prazo', 'no máximo 4 linhas'.",
          },
          {
            tipo: "destaque",
            titulo: "E — Entrada",
            texto:
              "O material com que ela deve trabalhar: a mensagem do cliente, a lista de produtos, suas anotações. Sem dado pessoal.",
          },
          {
            tipo: "texto",
            texto:
              "Não precisa das cinco toda vez. Mas quando a resposta vier ruim, olhe para esta lista: quase sempre falta uma delas — e quase sempre é a R.",
          },
        ],
      },
    },
    {
      titulo: "Duelo: o mesmo pedido, dois resultados",
      tipo: TipoLicao.DUELO,
      xp: 25,
      tempo: 10,
      cap: "Cap. 2.2",
      conteudo: {
        situacao:
          "Uma loja de roupas quer avisar os clientes sobre a chegada da coleção nova.",
        ruim: {
          titulo: "Pedido vago",
          prompt: "Escreva uma mensagem divulgando a coleção nova da minha loja.",
          resultado:
            "Texto genérico, com emojis demais, 'não perca essa oportunidade única' e 'corra que é por tempo limitado'. Serve para qualquer loja do país — e por isso não serve para a sua.",
        },
        bom: {
          titulo: "Pedido C.O.F.R.E.",
          prompt:
            "Contexto: tenho uma loja de roupa feminina de bairro; minhas clientes têm entre 35 e 55 anos e compram quando avisamos por WhatsApp.\nObjetivo: avisar da coleção de inverno que chegou.\nFormato: mensagem de WhatsApp de até 4 linhas.\nRestrições: sem emoji em excesso, sem urgência falsa, sem promessa de desconto — não vou dar desconto. Tom de quem conhece a cliente.\nEntrada: peças que chegaram — tricôs, calças de alfaiataria e casacos.",
          resultado:
            "Mensagem curta, no tom de quem já conhece a cliente, citando as peças reais e sem prometer o que a loja não vai cumprir.",
        },
        pergunta:
          "Escreva agora a versão C.O.F.R.E. de um aviso que você precisa mandar esta semana.",
        fechamento:
          "Repare: o pedido bom não é mais bonito, é mais específico. E a parte que mais mudou o resultado foi a restrição.",
      },
    },
    {
      titulo: "Laboratório 01: sua resposta ao cliente difícil",
      tipo: TipoLicao.LABORATORIO,
      xp: 35,
      tempo: 20,
      cap: "Cap. 2.3",
      conteudo: {
        titulo: "Uma resposta profissional, pronta para enviar",
        contexto:
          "Pegue uma mensagem difícil que você recebeu de verdade — uma reclamação, uma cobrança, um cliente irritado. Vamos transformar em resposta.",
        passos: [
          "Copie a mensagem do cliente e tire nome, telefone e número de pedido. Troque por CLIENTE A.",
          "Monte o pedido com as cinco partes do C.O.F.R.E.",
          "Na parte das restrições, escreva o que você NÃO pode prometer.",
          "Gere a resposta e leia em voz alta: soa como você falaria?",
          "Ajuste o que não soar seu e salve abaixo.",
        ],
        promptSugerido: {
          titulo: "Use este como ponto de partida",
          corpo:
            "Contexto: sou dono de [NEGOCIO]. Um cliente enviou a mensagem abaixo e está insatisfeito.\nObjetivo: escrever uma resposta que reconheça o problema e proponha um próximo passo concreto.\nFormato: uma mensagem de até 6 linhas, tom [TOM], pronta para enviar por WhatsApp.\nRestrições: não admita culpa sobre o que ainda não foi verificado, não prometa prazo que eu não confirmei e não ofereça desconto por conta própria.\nMensagem do cliente: [MENSAGEM]",
          variaveis: [
            { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "loja de roupas" },
            { chave: "TOM", rotulo: "Tom", exemplo: "cordial e direto" },
            { chave: "MENSAGEM", rotulo: "Mensagem do cliente", exemplo: "" },
          ],
        },
        campos: [
          {
            chave: "situacao",
            rotulo: "A situação, em uma frase",
            curto: true,
            exemplo: "Cliente esperando entrega atrasada há 10 dias",
          },
          {
            chave: "restricoes",
            rotulo: "O que você NÃO pode prometer",
            ajuda: "Escreva antes de gerar. É a parte que mais muda o resultado.",
            exemplo: "Não posso confirmar nova data nem oferecer frete grátis.",
          },
          {
            chave: "resposta",
            rotulo: "Sua resposta final, já revisada",
            ajuda: "Cole a versão que você realmente enviaria.",
          },
        ],
        criterios: [
          "Não promete nada que você não possa cumprir",
          "Reconhece o problema sem admitir culpa não verificada",
          "Termina com um próximo passo concreto",
          "Soa como você fala, e não como um manual",
        ],
        entrega: "Uma resposta pronta para enviar hoje.",
      },
    },
    {
      titulo: "Checkpoint: pedir bem",
      tipo: TipoLicao.CHECKPOINT,
      xp: 20,
      tempo: 5,
      cap: "Cap. 2",
      conteudo: {
        titulo: "O que você leva deste módulo",
        itens: [
          "Cinco partes: Contexto, Objetivo, Formato, Restrições e Entrada",
          "A restrição é a parte mais esquecida e a que mais muda o resultado",
          "Resposta genérica costuma ser sintoma de pedido genérico",
          "Leia em voz alta antes de enviar: tem de soar como você",
        ],
        pergunta: "Qual restrição você vai passar a escrever sempre?",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 3 — IA no dia a dia
   ============================================================ */

const MODULO_3: Modulo = {
  ordem: 2,
  titulo: "IA no dia a dia da empresa",
  subtitulo: "As tarefas que tomam sua semana, uma a uma",
  cor: "#10B981",
  icone: "rotina",
  licoes: [
    {
      titulo: "Responder no WhatsApp: antes e depois",
      tipo: TipoLicao.ANTES_DEPOIS,
      xp: 20,
      tempo: 8,
      cap: "Cap. 3.1",
      conteudo: {
        tarefa: "Responder as mesmas dúvidas de clientes, todos os dias",
        antes: {
          titulo: "Como é hoje",
          tempo: "Cerca de 50 minutos por dia",
          passos: [
            "Lê a mensagem e lembra o que respondeu da última vez",
            "Escreve de novo, quase igual, com o cansaço do dia",
            "Responde diferente conforme a hora e o humor",
            "As respostas do fim do dia saem mais secas",
          ],
        },
        depois: {
          titulo: "Com IA",
          tempo: "Cerca de 15 minutos por dia",
          passos: [
            "Uma única vez: lista as 10 dúvidas mais comuns e gera as respostas-base",
            "Revisa, ajusta ao seu jeito de falar e salva",
            "No dia a dia, adapta a resposta pronta ao caso",
            "O tom fica igual às 9h e às 19h",
          ],
        },
        economia: "Cerca de 35 minutos por dia — quase 3 horas por semana",
        prompt: {
          titulo: "O prompt que monta o seu FAQ",
          corpo:
            "Contexto: meu negócio é [NEGOCIO] e recebo sempre as mesmas dúvidas.\nObjetivo: montar respostas-base que minha equipe possa usar.\nFormato: para cada dúvida, resposta curta de até 3 linhas e a regra de quando encaminhar para uma pessoa.\nRestrições: não invente política de troca, prazo ou preço — onde eu não informei, escreva [CONFIRMAR].\nDúvidas: [DUVIDAS]",
          variaveis: [
            { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "pet shop" },
            { chave: "DUVIDAS", rotulo: "Dúvidas comuns", exemplo: "horário, preço, agendamento" },
          ],
        },
        resultadoEsperado:
          "Um conjunto de respostas-base no seu tom, com [CONFIRMAR] onde faltar informação sua.",
        atencao:
          "O ganho de tempo é real e por isso mesmo perigoso: resposta-base enviada sem ler o caso do cliente soa automática. Leia antes de mandar — leva 10 segundos.",
      },
    },
    {
      titulo: "Caso: a loja que responde tudo no WhatsApp",
      tipo: TipoLicao.CASO,
      xp: 25,
      tempo: 12,
      cap: "Cap. 3.2",
      conteudo: {
        titulo: "A loja que responde tudo no WhatsApp",
        cena:
          "Uma loja de roupas recebe 80 mensagens por dia. A dona responde entre atender no balcão. À noite, ainda há 20 sem resposta. Algumas se perdem, e o cliente compra em outro lugar. Ela pensa em contratar alguém só para o WhatsApp.",
        pergunta:
          "Antes de contratar: quais dessas mensagens são sempre as mesmas? Quais precisam mesmo dela? Onde a IA ajuda e onde ela atrapalharia?",
        pistas: [
          "Separe o que é dúvida repetida do que é negociação",
          "Repare que o problema não é escrever: é lembrar de responder",
          "Pergunte o que acontece se a resposta automática errar com um cliente antigo",
        ],
        fechamento:
          "Na maioria dos casos como este, cerca de 70% das mensagens são cinco perguntas repetidas. Resolver essas cinco devolve o tempo dela para as outras 30% — que são as que vendem.",
      },
    },
    {
      titulo: "Laboratório 02: seu procedimento de uma página",
      tipo: TipoLicao.LABORATORIO,
      xp: 35,
      tempo: 25,
      cap: "Cap. 3.3",
      conteudo: {
        titulo: "Escrever como se faz, para alguém poder fazer sem você",
        contexto:
          "Escolha uma tarefa que só você sabe fazer. Se você ficasse doente amanhã, o que travaria? É essa.",
        passos: [
          "Descreva, do seu jeito, como a tarefa é feita hoje — inclusive as gambiarras.",
          "Peça à IA para transformar em procedimento numerado.",
          "Confira: alguém que nunca fez conseguiria seguir?",
          "Acrescente o que fazer quando der errado — é o que falta em quase todo procedimento.",
          "Salve abaixo e teste com outra pessoa.",
        ],
        promptSugerido: {
          titulo: "Prompt do procedimento",
          corpo:
            "Contexto: no meu [NEGOCIO], [PROCESSO] é feito assim: [COMO_E_HOJE].\nObjetivo: transformar isso num procedimento de uma página que uma pessoa nova consiga seguir.\nFormato: passo a passo numerado, responsável por passo, o que fazer quando der errado e um checklist final.\nRestrições: linguagem simples, sem jargão; cada passo começando com um verbo; máximo de uma página.",
          variaveis: [
            { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "restaurante" },
            { chave: "PROCESSO", rotulo: "O processo", exemplo: "fechamento do caixa" },
            { chave: "COMO_E_HOJE", rotulo: "Como é feito hoje", exemplo: "" },
          ],
        },
        campos: [
          {
            chave: "processo",
            rotulo: "Que tarefa travaria sem você?",
            curto: true,
            exemplo: "Fechamento do caixa",
          },
          {
            chave: "procedimento",
            rotulo: "O procedimento, já revisado",
            ajuda: "Cole aqui a versão final, com os passos numerados.",
          },
          {
            chave: "quando_da_errado",
            rotulo: "O que fazer quando der errado",
            ajuda: "A parte que quase todo procedimento esquece.",
          },
        ],
        criterios: [
          "Alguém que nunca fez conseguiria seguir sozinho",
          "Cada passo começa com um verbo",
          "Diz o que fazer quando algo sai do esperado",
          "Cabe em uma página",
        ],
        entrega: "Um procedimento que permite você tirar férias.",
      },
    },
    {
      titulo: "Checkpoint: a semana mais leve",
      tipo: TipoLicao.CHECKPOINT,
      xp: 20,
      tempo: 5,
      cap: "Cap. 3",
      conteudo: {
        titulo: "O que você leva deste módulo",
        itens: [
          "Tarefa repetida é onde a IA ajuda primeiro",
          "Resposta-base economiza tempo, mas exige leitura antes do envio",
          "Procedimento escrito é o que permite delegar e, depois, automatizar",
          "O gargalo nem sempre é escrever — às vezes é lembrar",
        ],
        pergunta: "Quanto tempo por semana você recuperou até aqui?",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 4 — Delegar trabalho
   ============================================================ */

const MODULO_4: Modulo = {
  ordem: 3,
  titulo: "Delegar um trabalho, não pedir uma resposta",
  subtitulo: "Quando a tarefa tem várias etapas",
  cor: "#8B5CF6",
  icone: "documentos",
  licoes: [
    {
      titulo: "Pedir uma resposta × entregar um trabalho",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 8,
      cap: "Cap. 4.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Até aqui você fez perguntas e recebeu respostas. Existe outro modo de usar: entregar um trabalho inteiro, com várias etapas, e acompanhar enquanto é feito.",
          },
          {
            tipo: "texto",
            texto:
              "A diferença é a mesma entre perguntar a um funcionário 'como se escreve uma proposta?' e dizer 'monte a proposta para este cliente, com base nestes arquivos, e me mostre antes de enviar'.",
          },
          {
            tipo: "destaque",
            titulo: "O nome técnico",
            texto:
              "As ferramentas chamam isso de trabalho agêntico: a IA executa várias etapas seguidas, usando arquivos e programas, em vez de só responder. No Claude, esse modo já foi um produto separado chamado Cowork; hoje está no próprio Claude.",
          },
          {
            tipo: "lista",
            titulo: "Serve bem para",
            itens: [
              "Ler vários arquivos e produzir um resumo comparando",
              "Montar uma proposta a partir de conversas e modelos antigos",
              "Organizar uma pasta bagunçada de documentos",
              "Transformar anotações de uma semana em relatório",
            ],
          },
          {
            tipo: "destaque",
            titulo: "A regra não muda",
            texto:
              "Quanto maior o trabalho delegado, mais importante a revisão. Você continua responsável pelo que sai com o seu nome.",
          },
        ],
      },
    },
    {
      titulo: "Laboratório 03: um trabalho de várias etapas",
      tipo: TipoLicao.LABORATORIO,
      xp: 35,
      tempo: 25,
      cap: "Cap. 4.2",
      conteudo: {
        titulo: "Delegar de verdade",
        contexto:
          "Escolha algo que você faria em uma hora, juntando informação de vários lugares: uma proposta, um relatório do mês, a comparação de três orçamentos.",
        passos: [
          "Reúna o material — sem dados pessoais de clientes.",
          "Descreva o trabalho inteiro, não só o primeiro passo.",
          "Diga o que é sucesso: o que o resultado precisa conter.",
          "Diga onde parar: 'me mostre antes de finalizar'.",
          "Acompanhe, corrija no meio e salve o resultado.",
        ],
        campos: [
          {
            chave: "trabalho",
            rotulo: "Que trabalho você delegou?",
            curto: true,
            exemplo: "Comparar três orçamentos de fornecedor",
          },
          {
            chave: "resultado",
            rotulo: "O que veio de volta",
            ajuda: "Cole o resultado ou descreva o que foi entregue.",
          },
          {
            chave: "correcoes",
            rotulo: "O que você precisou corrigir",
            ajuda: "Isto é o mais valioso: mostra o que incluir no pedido da próxima vez.",
          },
        ],
        criterios: [
          "O pedido descrevia o trabalho todo, não só o começo",
          "Havia um critério de sucesso explícito",
          "Você revisou antes de usar",
          "Você anotou o que corrigir no próximo pedido",
        ],
        entrega: "Um trabalho pronto e uma lição sobre como pedir melhor.",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 5 — Imagens
   ============================================================ */

const MODULO_5: Modulo = {
  ordem: 4,
  titulo: "Imagens que vendem",
  subtitulo: "Foto de produto, cardápio, banner e post",
  cor: "#EC4899",
  icone: "imagens",
  licoes: [
    {
      titulo: "As oito partes de um pedido de imagem",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 10,
      cap: "Cap. 5.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Pedir imagem é como explicar a um fotógrafo o que você quer. 'Uma foto bonita do meu produto' não basta — nem para o fotógrafo, nem para a IA.",
          },
          {
            tipo: "lista",
            titulo: "Descreva estas oito coisas",
            itens: [
              "Assunto — o que aparece, com detalhe ('pote de mel de 300 g', não 'mel')",
              "Ambiente — onde está ('mesa de madeira clara', 'fundo branco')",
              "Composição — de onde se vê ('de cima', 'na altura do produto')",
              "Iluminação — 'luz natural lateral', 'luz quente de fim de tarde'",
              "Estilo — 'fotografia realista', 'ilustração simples'",
              "Cores — a paleta que combina com sua marca",
              "Formato — quadrado para post, deitado para banner",
              "Restrições — sem texto, sem marca de terceiros, sem pessoas",
            ],
          },
          {
            tipo: "destaque",
            titulo: "Sempre peça sem texto",
            texto:
              "Letra gerada por IA costuma sair torta ou com erro de grafia. Gere a imagem limpa e escreva o texto depois, no Canva. Fica melhor e você corrige quando quiser.",
          },
        ],
      },
    },
    {
      titulo: "Laboratório 04: a foto do seu produto",
      tipo: TipoLicao.LABORATORIO,
      xp: 35,
      tempo: 25,
      cap: "Cap. 5.2",
      conteudo: {
        titulo: "Uma imagem que você usaria de verdade",
        contexto:
          "Escolha um produto ou serviço seu. Vamos produzir uma imagem pronta para anúncio.",
        passos: [
          "Escreva as oito partes, uma por linha.",
          "Gere a primeira versão e olhe com calma: o que está errado?",
          "Ajuste uma coisa por vez — mudar tudo junto impede saber o que funcionou.",
          "Quando acertar, peça outras variações usando essa imagem como referência.",
          "Salve o prompt que funcionou: ele vale mais que a imagem.",
        ],
        promptSugerido: {
          titulo: "Estrutura do prompt visual",
          corpo:
            "Assunto: [PRODUTO], em primeiro plano.\nAmbiente: [AMBIENTE].\nComposição: [ENQUADRAMENTO].\nIluminação: [LUZ].\nEstilo: fotografia de produto realista.\nCores: [CORES].\nFormato: quadrado, alta resolução.\nRestrições: sem texto na imagem, sem marca de outra empresa, sem pessoas, fundo limpo.",
          variaveis: [
            { chave: "PRODUTO", rotulo: "O produto", exemplo: "pote de mel artesanal" },
            { chave: "AMBIENTE", rotulo: "Ambiente", exemplo: "mesa de madeira clara" },
            { chave: "ENQUADRAMENTO", rotulo: "Enquadramento", exemplo: "na altura do produto" },
            { chave: "LUZ", rotulo: "Iluminação", exemplo: "luz natural lateral" },
            { chave: "CORES", rotulo: "Cores", exemplo: "tons quentes" },
          ],
        },
        campos: [
          {
            chave: "prompt_final",
            rotulo: "O prompt que funcionou",
            ajuda: "Guarde este texto. É ele que você vai reaproveitar para sempre.",
          },
          {
            chave: "ajustes",
            rotulo: "O que precisou ajustar da primeira para a última versão",
            exemplo: "A luz estava dura demais; troquei por luz natural lateral.",
          },
        ],
        criterios: [
          "A imagem serviria para um anúncio seu",
          "Não tem texto gerado pela IA",
          "O prompt está salvo e dá para reaproveitar",
          "Você sabe qual ajuste melhorou o resultado",
        ],
        entrega: "Uma imagem usável e um prompt reaproveitável.",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 6 — Vídeo
   ============================================================ */

const MODULO_6: Modulo = {
  ordem: 5,
  titulo: "Vídeo curto sem equipe",
  subtitulo: "Da ideia à publicação",
  cor: "#F59E0B",
  icone: "video",
  licoes: [
    {
      titulo: "O caminho de um vídeo, do começo ao fim",
      tipo: TipoLicao.FLUXO,
      xp: 20,
      tempo: 10,
      cap: "Cap. 6.1",
      conteudo: {
        titulo: "Da ideia ao vídeo publicado",
        introducao:
          "Vídeo não começa na ferramenta de vídeo. Começa no roteiro — e é por isso que tanta gente trava: abre a ferramenta sem saber o que quer dizer.",
        gatilho: "Você tem algo para contar ao cliente",
        etapas: [
          { titulo: "Ideia", detalhe: "Uma coisa só. Vídeo que fala de três assuntos não fala de nenhum." },
          { titulo: "Roteiro", detalhe: "O que se fala e o que aparece, segundo a segundo." },
          { titulo: "Imagens ou gravação", detalhe: "Grave com o celular ou gere as cenas por IA." },
          { titulo: "Narração", detalhe: "Sua voz funciona melhor que voz sintética para negócio local." },
          { titulo: "Legenda", detalhe: "A maioria assiste sem som. Sem legenda, você perde essa maioria." },
          {
            titulo: "Revisão antes de publicar",
            detalhe: "Dado errado no vídeo circula e não volta.",
            revisaoHumana: true,
          },
          { titulo: "Publicação", detalhe: "Um canal por vez, com o formato certo de cada um." },
        ],
        ondeParar:
          "A IA ajuda no roteiro, nas imagens e na legenda. Quem decide o que a empresa promete é você — e isso não se delega.",
        ferramentas: ["Google Veo", "Pika", "Canva", "ChatGPT"],
        porQue:
          "Sobre ferramentas de vídeo: o Sora foi encerrado pela OpenAI em março de 2026. Hoje o caminho gratuito mais viável é o Veo, pelo Google AI Studio, com cerca de 10 gerações mensais em conta comum. O Pika é a alternativa cujo plano gratuito permite uso comercial.",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 7 — Workspace e planilhas
   ============================================================ */

const MODULO_7: Modulo = {
  ordem: 6,
  titulo: "Documentos e planilhas com IA",
  subtitulo: "Para quem nunca aprendeu fórmula",
  cor: "#0891B2",
  icone: "planilhas",
  licoes: [
    {
      titulo: "O caminho gratuito e o caminho pago",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 8,
      cap: "Cap. 7.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "O Google mostra a IA montando planilhas inteiras por descrição, criando painéis e cruzando dados dos seus arquivos. Funciona bem — e é preciso dizer uma coisa que a propaganda não diz.",
          },
          {
            tipo: "destaque",
            titulo: "A parte que depende de assinatura",
            texto:
              "Os recursos mais fortes do Gemini dentro do Documentos e do Planilhas estão em versão de testes para assinantes do Google AI Pro e Ultra. Sem assinatura, você não tem esses botões.",
          },
          {
            tipo: "texto",
            texto:
              "O que não impede nada. O caminho gratuito dá quase o mesmo resultado com um passo a mais: exporte a planilha em CSV e cole no chat de IA. A análise é a mesma; só não acontece dentro da planilha.",
          },
          {
            tipo: "lista",
            titulo: "Gratuito, funciona hoje",
            itens: [
              "Exportar CSV e pedir análise no ChatGPT, Gemini ou Claude",
              "Pedir a fórmula pronta e colar na planilha",
              "Pedir para explicar uma fórmula que você herdou e não entende",
              "Descrever a planilha que você precisa e receber a estrutura",
            ],
          },
          {
            tipo: "destaque",
            titulo: "Peça sempre a explicação da fórmula",
            texto:
              "Uma fórmula que você não entende é uma fórmula que você não conserta. Peça uma linha explicando o que cada uma faz.",
          },
        ],
      },
    },
    {
      titulo: "Laboratório 05: analisar os seus números",
      tipo: TipoLicao.LABORATORIO,
      xp: 40,
      tempo: 30,
      cap: "Cap. 7.2",
      conteudo: {
        titulo: "Perguntas melhores sobre o seu negócio",
        contexto:
          "Use dados reais seus — vendas, despesas, estoque. Antes de colar: tire nome de cliente, CPF e número de conta. Código no lugar do nome funciona igual.",
        passos: [
          "Exporte seus dados em CSV ou copie a tabela.",
          "Anonimize: troque nomes por CLIENTE A, CLIENTE B.",
          "Peça primeiro as perguntas que esses dados conseguem responder.",
          "Escolha as três que mudariam uma decisão sua.",
          "Peça a análise dessas três, exigindo separar fato de hipótese.",
        ],
        promptSugerido: {
          titulo: "Comece perguntando o que perguntar",
          corpo:
            "Contexto: tenho os dados de [O_QUE] de [PERIODO], já sem nome de cliente.\nObjetivo: descobrir o que eu deveria estar perguntando.\nFormato: 10 perguntas que esses dados conseguem responder, cada uma com a decisão que ela ajudaria a tomar.\nRestrições: nenhuma pergunta que exija dado que eu não tenho; sem termo técnico de estatística.",
          variaveis: [
            { chave: "O_QUE", rotulo: "Que dados", exemplo: "vendas por produto" },
            { chave: "PERIODO", rotulo: "Período", exemplo: "últimos 12 meses" },
          ],
        },
        campos: [
          {
            chave: "pergunta",
            rotulo: "A pergunta que mais importa para você",
            curto: true,
            exemplo: "Quais produtos vendem juntos?",
          },
          {
            chave: "achado",
            rotulo: "O que os dados responderam",
            ajuda: "Escreva o que é fato. Separe do que é suposição.",
          },
          {
            chave: "decisao",
            rotulo: "O que você vai fazer com isso",
            ajuda: "Análise que não muda decisão nenhuma foi tempo perdido.",
          },
        ],
        criterios: [
          "Os dados foram anonimizados antes de colar",
          "A análise separa fato de hipótese",
          "Existe uma decisão concreta no fim",
          "Você conferiu ao menos um número na fonte",
        ],
        entrega: "Uma decisão tomada com base nos seus próprios números.",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 8 — NotebookLM
   ============================================================ */

const MODULO_8: Modulo = {
  ordem: 7,
  titulo: "Seus documentos respondendo por você",
  subtitulo: "NotebookLM, também chamado Gemini Notebook",
  cor: "#7C3AED",
  icone: "conhecimento",
  licoes: [
    {
      titulo: "Uma IA que só responde com os seus arquivos",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 8,
      cap: "Cap. 8.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Todas as IAs que você usou até agora respondem com o que aprenderam na internet. Existe uma que faz o contrário: responde só com o que você entregou a ela.",
          },
          {
            tipo: "texto",
            texto:
              "Você sobe seus contratos, manuais e procedimentos. Ela responde perguntas sobre eles — e mostra o trecho de onde tirou cada resposta. Isso muda tudo: dá para conferir.",
          },
          {
            tipo: "destaque",
            titulo: "Sobre o nome",
            texto:
              "Chama-se NotebookLM. O Google está renomeando para Gemini Notebook, então você pode encontrar os dois nomes. É a mesma ferramenta.",
          },
          {
            tipo: "lista",
            titulo: "Usos que resolvem problema real",
            itens: [
              "Funcionário novo pergunta ao manual, em vez de perguntar a você",
              "Achar a cláusula do contrato sem reler 40 páginas",
              "Conferir o que o seu próprio procedimento diz antes de decidir",
              "Preparar reunião a partir de documentos longos",
            ],
          },
          {
            tipo: "destaque",
            titulo: "O limite gratuito",
            texto:
              "Até 50 fontes por caderno, cada uma com até 500 mil palavras ou 200 MB. Para um negócio pequeno, sobra.",
          },
        ],
      },
    },
    {
      titulo: "Laboratório 06: a base de conhecimento do seu negócio",
      tipo: TipoLicao.LABORATORIO,
      xp: 35,
      tempo: 25,
      cap: "Cap. 8.2",
      conteudo: {
        titulo: "Um lugar onde a resposta já está",
        contexto:
          "Junte os documentos que você mais procura: procedimentos, contratos, manuais, tabela de preços.",
        passos: [
          "Crie um caderno e suba de 3 a 5 arquivos.",
          "Faça uma pergunta cuja resposta você já sabe — é assim que se testa a ferramenta.",
          "Confira a citação: ela apontou o trecho certo?",
          "Faça uma pergunta que você não sabe responder.",
          "Anote três perguntas que sua equipe faz sempre e teste todas.",
        ],
        campos: [
          {
            chave: "documentos",
            rotulo: "Que documentos você subiu",
            curto: true,
            exemplo: "Manual do equipamento, tabela de preços, contrato padrão",
          },
          {
            chave: "teste",
            rotulo: "A pergunta de teste e se a citação estava certa",
            ajuda: "Testar com algo que você já sabe é o que revela se dá para confiar.",
          },
          {
            chave: "uso",
            rotulo: "Quem vai usar isso, e para quê",
          },
        ],
        criterios: [
          "A ferramenta respondeu citando o trecho certo",
          "Você testou com uma pergunta cuja resposta já conhecia",
          "Os documentos não têm dado pessoal desnecessário",
          "Alguém da equipe conseguiria usar",
        ],
        entrega: "Uma base que responde no seu lugar.",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 9 — Automação
   ============================================================ */

const MODULO_9: Modulo = {
  ordem: 8,
  titulo: "Automação sem programar",
  subtitulo: "Primeiro a lógica, depois a ferramenta",
  cor: "#059669",
  icone: "automacao",
  licoes: [
    {
      titulo: "O que é automação, na prática",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 8,
      cap: "Cap. 9.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Automatizar é ensinar um sistema a fazer sozinho o que você faria na mão — sempre do mesmo jeito, sem esquecer.",
          },
          {
            tipo: "texto",
            texto:
              "Você já usa automação: o alarme do celular é uma. Chegou a hora, toca. Um gatilho e uma ação.",
          },
          {
            tipo: "destaque",
            titulo: "A parte que as pessoas pulam",
            texto:
              "A maioria abre a ferramenta primeiro e trava. O caminho certo é desenhar o processo no papel: o que dispara, o que acontece, onde uma pessoa confere. A ferramenta é a última decisão — e a mais fácil de trocar.",
          },
          {
            tipo: "destaque",
            titulo: "A regra de ouro",
            texto:
              "Automação gera rascunho; ela não envia sozinha nada que chegue ao cliente. Quem confere é uma pessoa. Essa é a diferença entre economizar tempo e pedir desculpa depois.",
          },
        ],
      },
    },
    {
      titulo: "O lead que chega e não se perde",
      tipo: TipoLicao.FLUXO,
      xp: 25,
      tempo: 10,
      cap: "Cap. 9.2",
      conteudo: {
        titulo: "Do formulário ao atendimento",
        introducao:
          "Este é o processo que mais se perde em negócio pequeno: a pessoa demonstra interesse e ninguém retorna.",
        gatilho: "Alguém preenche o formulário do site",
        etapas: [
          { titulo: "Registrar", detalhe: "A resposta entra numa planilha, com data e origem." },
          { titulo: "Classificar", detalhe: "Separa por tipo de pedido ou região." },
          { titulo: "Gerar rascunho de resposta", detalhe: "A IA prepara o texto com base no que a pessoa pediu." },
          {
            titulo: "Uma pessoa lê e envia",
            detalhe: "É aqui que a automação para. O rascunho está pronto; quem manda é gente.",
            revisaoHumana: true,
          },
          { titulo: "Avisar o responsável", detalhe: "Notificação com o resumo, para ninguém depender de abrir e-mail." },
          { titulo: "Marcar prazo de retorno", detalhe: "Sem prazo, o lead some na planilha." },
        ],
        ondeParar:
          "O envio ao cliente. Um erro numa mensagem automática chega ao cliente antes de você saber que existiu.",
        ferramentas: ["Make", "Google Formulários", "Google Planilhas"],
        porQue:
          "O curso usa o Make porque o plano gratuito dele é o mais utilizável entre os grandes: 1.000 operações por mês e 2 automações ativas — suficiente para o primeiro processo de um negócio pequeno.",
      },
    },
    {
      titulo: "Laboratório 07: desenhar a sua automação",
      tipo: TipoLicao.LABORATORIO,
      xp: 40,
      tempo: 30,
      cap: "Cap. 9.3",
      conteudo: {
        titulo: "O processo antes da ferramenta",
        contexto:
          "Escolha um processo pequeno, de começo e fim claros, em que um erro não gere prejuízo grande.",
        passos: [
          "Escreva o gatilho: o que faz o processo começar.",
          "Liste os passos em ordem, como você faz hoje.",
          "Marque onde uma pessoa precisa conferir.",
          "Escreva o que fazer quando der errado.",
          "Responda: como eu desligo isso numa sexta às duas da tarde?",
        ],
        promptSugerido: {
          titulo: "Prompt do desenho",
          corpo:
            "Contexto: no meu [NEGOCIO], quando [GATILHO], hoje eu faço manualmente: [PASSOS_MANUAIS].\nObjetivo: desenhar como isso poderia funcionar sozinho.\nFormato: gatilho, passos em ordem, dados que circulam, onde uma pessoa aprova, o que fazer em caso de erro e como desligar.\nRestrições: a automação gera rascunho e nunca envia sozinha nada que chegue ao cliente. Liste o que NÃO deve ser automatizado neste processo.",
          variaveis: [
            { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "imobiliária" },
            { chave: "GATILHO", rotulo: "O que dispara", exemplo: "alguém preenche o formulário" },
            { chave: "PASSOS_MANUAIS", rotulo: "O que você faz hoje", exemplo: "" },
          ],
        },
        campos: [
          { chave: "gatilho", rotulo: "O que faz começar", curto: true, exemplo: "Chega um pedido pelo site" },
          { chave: "passos", rotulo: "Os passos, em ordem" },
          {
            chave: "parada",
            rotulo: "Onde uma pessoa confere antes de seguir",
            ajuda: "Todo processo que chega ao cliente tem uma parada obrigatória.",
          },
          { chave: "desligar", rotulo: "Como você desliga se der problema", curto: true },
        ],
        criterios: [
          "Tem gatilho claro",
          "Tem ao menos uma parada com revisão humana",
          "Diz o que fazer quando der errado",
          "Você sabe como desligar",
        ],
        entrega: "Um desenho pronto para virar automação de verdade.",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 10 — Agentes
   ============================================================ */

const MODULO_10: Modulo = {
  ordem: 9,
  titulo: "Agentes sem complicação",
  subtitulo: "Chatbot, automação e agente: o que muda",
  cor: "#DC2626",
  icone: "agentes",
  licoes: [
    {
      titulo: "Chatbot, automação e agente",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 10,
      cap: "Cap. 10.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Três palavras que aparecem juntas e significam coisas diferentes. A diferença está em quem decide os passos.",
          },
          {
            tipo: "destaque",
            titulo: "Chatbot",
            texto:
              "Responde perguntas. Você pergunta, ele responde. Não faz nada além disso.",
          },
          {
            tipo: "destaque",
            titulo: "Automação",
            texto:
              "Executa passos fixos, sempre na mesma ordem. Aconteceu isto, faça aquilo. Não decide nada — e é por isso que é previsível.",
          },
          {
            tipo: "destaque",
            titulo: "Agente",
            texto:
              "Recebe um objetivo e decide os passos. 'Descubra quais clientes não compram há 6 meses e prepare uma mensagem para cada um.' Ele escolhe como chegar lá.",
          },
          {
            tipo: "texto",
            texto:
              "Em linguagem simples: um agente é um assistente digital a quem você entrega um objetivo e algumas regras. Em vez de só responder, ele executa várias etapas de um trabalho.",
          },
          {
            tipo: "destaque",
            titulo: "O que isso exige de você",
            texto:
              "Justamente porque ele decide, as regras do que ele NÃO pode fazer importam mais que as do que pode. Escreva-as primeiro.",
          },
        ],
      },
    },
    {
      titulo: "Laboratório 08: as regras do seu primeiro agente",
      tipo: TipoLicao.LABORATORIO,
      xp: 40,
      tempo: 30,
      cap: "Cap. 10.2",
      conteudo: {
        titulo: "Escrever o que ele pode e o que nunca pode",
        contexto:
          "Escolha uma tarefa repetitiva, com regra clara, cujo erro seja barato de corrigir e que dê para revisar antes de o cliente ver.",
        passos: [
          "Escreva o objetivo dele em uma frase.",
          "Liste o que ele pode fazer.",
          "Liste o que ele NUNCA pode — comece por aqui se travar.",
          "Defina o que ele faz quando não souber a resposta.",
          "Defina em que situações ele chama uma pessoa.",
        ],
        promptSugerido: {
          titulo: "Prompt das regras",
          corpo:
            "Contexto: quero um assistente digital que cuide de [TAREFA] no meu [NEGOCIO].\nObjetivo: escrever as instruções dele.\nFormato: objetivo em uma frase, o que pode fazer, o que nunca pode, tom, o que fazer quando não souber, e quando chamar uma pessoa.\nRestrições: ele nunca decide preço, desconto, crédito, cancelamento ou questão jurídica. Nunca inventa informação: quando não souber, diz que vai confirmar.",
          variaveis: [
            { chave: "TAREFA", rotulo: "A tarefa", exemplo: "dúvidas sobre horário" },
            { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "clínica" },
          ],
        },
        campos: [
          { chave: "objetivo", rotulo: "O objetivo, em uma frase", curto: true },
          { chave: "pode", rotulo: "O que ele pode fazer" },
          {
            chave: "nunca",
            rotulo: "O que ele NUNCA pode fazer",
            ajuda: "A parte mais importante. Preço, crédito, cancelamento e questão jurídica ficam sempre fora.",
          },
          { chave: "chama_pessoa", rotulo: "Quando ele chama uma pessoa", curto: true },
        ],
        criterios: [
          "As proibições estão escritas com todas as letras",
          "Ele sabe o que fazer quando não souber a resposta",
          "Existe um caminho claro para chamar uma pessoa",
          "A tarefa escolhida tem erro barato de corrigir",
        ],
        entrega: "As instruções do seu primeiro assistente digital.",
      },
    },
  ],
};

/* ============================================================
   MÓDULO 11 — Projeto final
   ============================================================ */

const MODULO_11: Modulo = {
  ordem: 10,
  titulo: "Minha Empresa Aumentada por IA",
  subtitulo: "O plano que você leva para fora do curso",
  cor: "#4F46E5",
  icone: "metas",
  licoes: [
    {
      titulo: "Seu plano de adoção de IA",
      tipo: TipoLicao.PROJETO,
      xp: 60,
      tempo: 40,
      cap: "Cap. 11",
      conteudo: {
        titulo: "Minha Empresa Aumentada por IA",
        introducao:
          "Responda com o seu negócio em mente. No fim, isto vira um documento que faz sentido para quem nunca fez este curso — o seu sócio, o seu contador, ou você daqui a três meses.",
        secoes: [
          {
            chave: "tarefas",
            titulo: "Tarefas que se repetem toda semana",
            pergunta: "Quais três tarefas você refaz quase igual toda semana?",
            ajuda: "Responder as mesmas dúvidas, montar orçamento, escrever a mesma postagem.",
            quantidade: 3,
          },
          {
            chave: "oportunidades",
            titulo: "Onde a IA ajuda primeiro",
            pergunta: "Em quais três dessas a IA pode fazer uma primeira versão?",
            quantidade: 3,
          },
          {
            chave: "automacao",
            titulo: "O processo a automatizar",
            pergunta: "Qual processo pequeno vale automatizar primeiro?",
            ajuda: "Começo e fim claros, e um erro que não gere prejuízo grande.",
          },
          {
            chave: "marketing",
            titulo: "Um uso para divulgação",
            pergunta: "Que peça de divulgação a IA pode ajudar a produzir?",
          },
          {
            chave: "dados",
            titulo: "Uma pergunta sobre os números",
            pergunta: "Que pergunta sobre seus números você ainda não consegue responder?",
          },
          {
            chave: "agente",
            titulo: "Um agente possível",
            pergunta: "Que trabalho você delegaria a um assistente digital com regras claras?",
          },
          {
            chave: "limites",
            titulo: "Onde a IA não entra",
            pergunta: "Que decisões continuam sendo só suas?",
            quantidade: 2,
          },
          {
            chave: "primeiro_passo",
            titulo: "O primeiro passo, com data",
            pergunta: "O que você vai fazer nos próximos 30 dias, e quando?",
          },
        ],
        fechamento:
          "Seu plano se monta sozinho conforme você responde. Abra 'Ver meu plano completo' para lê-lo inteiro e salvar em PDF pelo navegador.",
      },
    },
  ],
};

export const MODULOS_EMPREENDEDORES: Modulo[] = [
  MODULO_1,
  MODULO_2,
  MODULO_3,
  MODULO_4,
  MODULO_5,
  MODULO_6,
  MODULO_7,
  MODULO_8,
  MODULO_9,
  MODULO_10,
  MODULO_11,
];
