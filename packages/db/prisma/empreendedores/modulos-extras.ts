import { TipoLicao } from "@prisma/client";

/**
 * Lições que completam os módulos.
 *
 * O primeiro corte do curso cobria a espinha de cada assunto; faltava o
 * miolo — os casos, os duelos, as caças ao erro e os laboratórios que
 * transformam a explicação em prática. É isso que está aqui.
 *
 * Ficam num arquivo próprio porque `modulos.ts` já define a estrutura e
 * passaria de duas mil linhas. O seed junta os dois pela ordem do módulo.
 *
 * As mesmas três regras valem: a aula não repete a apostila, termo
 * técnico vem depois da explicação simples, e toda ferramenta tem faixa
 * de acesso declarada.
 */

export type LicaoExtra = {
  /** Ordem do módulo a que a lição pertence, como em `modulos.ts`. */
  modulo: number;
  titulo: string;
  tipo: TipoLicao;
  xp: number;
  tempo: number;
  cap?: string;
  conteudo: Record<string, unknown>;
};

export const LICOES_EXTRAS: LicaoExtra[] = [
  /* ===================== MÓDULO 1 — IA sem complicação ===================== */
  {
    modulo: 0,
    titulo: "Caso: o orçamento que citou uma norma que não existe",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 12,
    cap: "Cap. 1.2",
    conteudo: {
      titulo: "O orçamento que citou uma norma que não existe",
      cena:
        "Um prestador de serviço descobriu a IA e passou a gerar orçamentos em minutos. Num deles, a IA citou uma norma técnica com número e tudo, garantindo cinco anos contra descascamento. O cliente aprovou. Dois anos depois, apareceu uma falha na pintura — e o cliente voltou com o orçamento na mão, cobrando a garantia de cinco anos que ele nunca ofereceu.",
      pergunta:
        "Onde o processo falhou? Não foi a IA errar: foi algo antes e algo depois. O que faltou em cada ponto?",
      pistas: [
        "A IA não sabia da norma; ela completou o que costuma vir depois",
        "Repare que ninguém conferiu entre gerar e enviar",
        "Pergunte o que no pedido permitiu que ela inventasse",
      ],
      fechamento:
        "Duas coisas faltaram. No pedido, a restrição 'use somente as informações que eu forneci'. No processo, a conferência antes de enviar. A IA não assina o orçamento — quem assina responde pelo que está escrito nele.",
    },
  },
  {
    modulo: 0,
    titulo: "No celular: sua primeira conversa com uma IA",
    tipo: TipoLicao.NO_CELULAR,
    xp: 20,
    tempo: 10,
    cap: "Cap. 1.3",
    conteudo: {
      titulo: "Abra agora, no seu aparelho",
      tempo: "10 minutos, no celular que você já tem",
      passos: [
        "Abra o navegador e entre em chatgpt.com ou gemini.google.com.",
        "Entre com sua conta — o gratuito basta para tudo desta aula.",
        "Escreva: 'Explique em duas frases, como se eu não soubesse nada, o que você consegue e o que não consegue fazer por um negócio pequeno.'",
        "Leia a resposta e faça uma segunda pergunta sobre o seu ramo.",
        "Agora peça algo que ela não pode saber: 'quanto eu vendi no mês passado?'. Observe o que ela responde.",
      ],
      porque:
        "A última pergunta é a mais importante. Você vai ver com os próprios olhos a diferença entre o que ela sabe e o que ela não tem como saber — e é isso que você vai lembrar quando ela responder com firmeza a algo que não deveria saber.",
    },
  },
  {
    modulo: 0,
    titulo: "O que nunca deve ser colado numa IA",
    tipo: TipoLicao.TEORIA,
    xp: 15,
    tempo: 7,
    cap: "Cap. 1.3",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Quando você cola um texto numa IA, ele sai do seu computador e vai para o servidor de uma empresa. Na maioria dos serviços gratuitos, esse texto pode ser usado para melhorar o sistema. Isso muda o que faz sentido colar.",
        },
        {
          tipo: "lista",
          titulo: "Não cole",
          itens: [
            "Nome completo, CPF, RG de cliente ou funcionário",
            "Telefone, endereço, e-mail pessoal",
            "Dado bancário, número de cartão, senha",
            "Informação de saúde de alguém",
            "Documento com cláusula de sigilo",
          ],
        },
        {
          tipo: "destaque",
          titulo: "O que fazer em vez disso",
          texto:
            "Troque por marcadores: CLIENTE A, VALOR X, FORNECEDOR 1. A IA escreve exatamente igual — ela não precisa saber que o cliente se chama João para redigir a resposta.",
        },
        {
          tipo: "texto",
          texto:
            "Isso não é paranoia nem excesso de zelo. É o mesmo cuidado de não deixar a ficha de um cliente aberta no balcão: o dado é dele, não seu, e você responde por ele.",
        },
        {
          tipo: "destaque",
          titulo: "Um atalho que vira hábito",
          texto:
            "Antes de colar algo longo, peça à própria IA: 'aponte o que eu deveria remover deste texto antes de enviar'. Em duas semanas você já faz sozinho.",
        },
      ],
    },
  },
  {
    modulo: 0,
    titulo: "Duelo: a mesma pergunta, com e sem contexto",
    tipo: TipoLicao.DUELO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 1",
    conteudo: {
      situacao:
        "Um dono de pet shop quer saber se vale a pena começar a oferecer banho e tosa aos domingos.",
      ruim: {
        titulo: "Pergunta sem contexto",
        prompt: "Vale a pena abrir aos domingos?",
        resultado:
          "Uma resposta de artigo de internet: prós e contras genéricos, 'depende do seu público', 'analise os custos'. Nada que ele já não soubesse.",
      },
      bom: {
        titulo: "Pergunta com contexto",
        prompt:
          "Tenho um pet shop de bairro com 2 funcionários. Abro de segunda a sábado, das 9h às 19h, e faço cerca de 15 banhos por dia. Sábado é o dia mais cheio, com fila de espera. Estou pensando em abrir aos domingos. O que eu deveria considerar antes de decidir, e que números eu precisaria levantar? Não decida por mim.",
        resultado:
          "Perguntas específicas sobre custo de hora extra, se a demanda de sábado é represada ou é o pico real, e o efeito de não ter folga na equipe. Coisas que ele pode ir medir na segunda-feira.",
      },
      pergunta:
        "Pegue uma dúvida real do seu negócio e escreva as duas versões: a pergunta como você faria e a versão com contexto.",
      fechamento:
        "O contexto não deixa a resposta mais bonita: deixa mais sua. Repare também na última frase do prompt bom — 'não decida por mim' devolve a decisão a quem conhece o negócio.",
    },
  },

  /* ===================== MÓDULO 2 — Como pedir ===================== */
  {
    modulo: 1,
    titulo: "Caça ao erro: o prompt que parece bom",
    tipo: TipoLicao.CACA_ERRO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 2.2",
    conteudo: {
      contexto:
        "Este prompt foi escrito por alguém que já aprendeu o C.O.F.R.E. Ele parece completo — e tem três problemas que vão aparecer na resposta.",
      texto:
        "Contexto: tenho uma loja.\nObjetivo: quero vender mais.\nFormato: um texto bom.\nRestrições: seja criativo.\nTarefa: escreva um anúncio do meu produto principal.",
      erros: [
        {
          trecho: "tenho uma loja",
          porque:
            "Contexto vago é quase o mesmo que nenhum. Loja de quê? Para quem? De bairro ou de shopping? A IA vai supor — e supor errado.",
        },
        {
          trecho: "Formato: um texto bom",
          porque:
            "Não é formato. Formato é 'mensagem de WhatsApp de até 4 linhas' ou 'lista de 5 itens'. 'Bom' não diz nada sobre a forma do que vai voltar.",
        },
        {
          trecho: "Restrições: seja criativo",
          porque:
            "Isto é o oposto de restrição. Restrição é o que NÃO pode: 'sem promessa de desconto', 'sem urgência falsa', 'no máximo 4 linhas'. Pedir criatividade é abrir, não limitar.",
        },
      ],
      licao:
        "As cinco letras estarem presentes não basta: cada uma precisa dizer algo específico. Um C.O.F.R.E. preenchido com generalidade devolve generalidade.",
    },
  },
  {
    modulo: 1,
    titulo: "Como pedir de novo quando a resposta vem ruim",
    tipo: TipoLicao.TEORIA,
    xp: 15,
    tempo: 8,
    cap: "Cap. 2.2",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "A primeira resposta quase nunca é a que se usa. Isso não é defeito: é como a ferramenta funciona. O que separa quem tira proveito de quem desiste é saber pedir de novo.",
        },
        {
          tipo: "destaque",
          titulo: "Não comece do zero",
          texto:
            "Continue a conversa em vez de abrir outra. Ela lembra do que já foi dito, e ajustar é mais rápido que reexplicar tudo.",
        },
        {
          tipo: "lista",
          titulo: "Frases que funcionam",
          itens: [
            "\"Está longo demais. Reduza pela metade mantendo o essencial.\"",
            "\"O tom está formal demais. Escreva como eu falaria com um cliente antigo.\"",
            "\"Você inventou o prazo. Use [CONFIRMAR] onde eu não informei.\"",
            "\"Me dê três versões diferentes em vez de uma.\"",
            "\"O que ficou faltando no meu pedido para você ter acertado de primeira?\"",
          ],
        },
        {
          tipo: "destaque",
          titulo: "A última é a mais útil",
          texto:
            "Perguntar o que faltou no seu pedido é a forma mais rápida de aprender a pedir. Em um mês, você para de precisar dela.",
        },
        {
          tipo: "texto",
          texto:
            "Uma coisa por vez. Quem pede três ajustes juntos recebe um texto diferente, não um texto corrigido — e perde a referência do que funcionou.",
        },
      ],
    },
  },
  {
    modulo: 1,
    titulo: "Dar exemplo em vez de descrever o tom",
    tipo: TipoLicao.PROMPT,
    xp: 25,
    tempo: 12,
    cap: "Cap. 2.3",
    conteudo: {
      introducao:
        "Descrever o tom que você quer quase nunca funciona: 'informal mas profissional' significa coisas diferentes para cada um. Mostrar funciona sempre. Cole algo que você escreveu e peça para seguir aquele jeito.",
      corpo:
        "Contexto: sou de [NEGOCIO]. Abaixo está um texto que EU escrevi, no meu jeito de falar com cliente.\nObjetivo: escrever [O_QUE] seguindo exatamente esse jeito.\nFormato: [FORMATO].\nRestrições: mantenha o meu vocabulário, o tamanho das minhas frases e o meu nível de formalidade. Não use palavra que não aparece no meu texto, se houver equivalente que eu usaria.\nMeu texto de referência: [TEXTO_MEU]",
      categoria: "escrita",
      dica:
        "Guarde dois ou três textos seus para usar como referência sempre. É o que faz o resultado parecer você, e não um manual.",
      campos: [
        { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "loja de ferragens" },
        { chave: "O_QUE", rotulo: "O que escrever", exemplo: "uma resposta sobre prazo de entrega" },
        { chave: "FORMATO", rotulo: "Formato", exemplo: "mensagem de WhatsApp, até 5 linhas" },
        { chave: "TEXTO_MEU", rotulo: "Um texto seu", exemplo: "cole algo que você escreveu" },
      ],
    },
  },
  {
    modulo: 1,
    titulo: "No celular: reescreva uma mensagem que você já mandou",
    tipo: TipoLicao.NO_CELULAR,
    xp: 20,
    tempo: 10,
    cap: "Cap. 2.3",
    conteudo: {
      titulo: "Pegue uma conversa real, agora",
      tempo: "10 minutos, com o WhatsApp aberto",
      passos: [
        "Abra uma conversa de cliente e procure uma mensagem que você demorou para escrever.",
        "Copie o texto e tire nome, telefone e número de pedido.",
        "Na IA, monte o pedido com as cinco partes, incluindo o que você NÃO podia prometer.",
        "Compare a resposta dela com a que você mandou na época.",
        "Anote uma coisa que você faria diferente da próxima vez.",
      ],
      porque:
        "Comparar com algo que você já escreveu mostra o ganho real melhor que qualquer exemplo pronto. Às vezes a sua estava melhor — e saber disso também vale.",
    },
  },

  /* ===================== MÓDULO 3 — Dia a dia ===================== */
  {
    modulo: 2,
    titulo: "Criar orçamento e proposta: antes e depois",
    tipo: TipoLicao.ANTES_DEPOIS,
    xp: 20,
    tempo: 8,
    cap: "Cap. 3.1",
    conteudo: {
      tarefa: "Transformar uma conversa com o cliente numa proposta escrita",
      antes: {
        titulo: "Como é hoje",
        tempo: "Cerca de 40 minutos por proposta",
        passos: [
          "Procura a última proposta parecida para copiar",
          "Adapta na correria, e às vezes esquece de trocar um nome",
          "Escreve o escopo de memória, sem o que não está incluso",
          "Manda e torce para o cliente não perguntar demais",
        ],
      },
      depois: {
        titulo: "Com IA",
        tempo: "Cerca de 12 minutos por proposta",
        passos: [
          "Cola as anotações da conversa, sem dado pessoal",
          "Recebe a estrutura com escopo, o que NÃO está incluso e premissas",
          "Preenche os valores — que a IA deixou como [VALOR]",
          "Revisa e envia",
        ],
      },
      economia: "Cerca de 28 minutos por proposta — 4 horas por mês para quem faz uma por dia",
      prompt: {
        titulo: "O prompt da proposta",
        corpo:
          "Contexto: conversei com um cliente que precisa de [NECESSIDADE]. Meu negócio é [NEGOCIO].\nObjetivo: transformar a conversa em proposta que ele entenda sem me ligar.\nFormato: escopo, o que NÃO está incluso, premissas, prazo, forma de pagamento e próximo passo.\nRestrições: não invente preço — deixe [VALOR] onde eu devo preencher. Não prometa resultado que dependa do cliente.\nO que foi conversado: [CONVERSA]",
        variaveis: [
          { chave: "NECESSIDADE", rotulo: "O que ele precisa", exemplo: "reforma de banheiro" },
          { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "empresa de reformas" },
          { chave: "CONVERSA", rotulo: "O que foi conversado", exemplo: "" },
        ],
      },
      resultadoEsperado:
        "Uma proposta estruturada, com [VALOR] onde o preço entra e o que não está incluso escrito com todas as letras.",
      atencao:
        "O item 'o que NÃO está incluso' é o que a versão copiada da proposta antiga nunca tinha. É ele que evita a discussão três semanas depois.",
    },
  },
  {
    modulo: 2,
    titulo: "Caso: o salão que não tinha tempo de postar",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 12,
    cap: "Cap. 3.2",
    conteudo: {
      titulo: "O salão que não tinha tempo de postar",
      cena:
        "Uma cabeleireira sabe que precisa aparecer nas redes, mas atende das 9h às 20h. Quando senta para postar, à noite, não sabe o que dizer. Fica três semanas sem publicar, aí posta cinco coisas em dois dias, e some de novo. Uma concorrente que posta todo dia está levando as clientes novas.",
      pergunta:
        "O problema dela é falta de tempo, falta de ideia ou falta de processo? O que resolveria primeiro?",
      pistas: [
        "Repare que ela tem material o dia inteiro na mão — e não registra",
        "Pergunte quanto tempo leva escrever um post quando se sabe o que dizer",
        "Considere separar o momento de captar do momento de publicar",
      ],
      fechamento:
        "Na maioria dos casos assim, o gargalo não é escrever: é decidir o que dizer com a cabeça cansada. Quem separa o captar — uma foto entre um cliente e outro — do escrever — meia hora por semana, com a IA ajudando — resolve os dois.",
    },
  },
  {
    modulo: 2,
    titulo: "Caça ao erro: a resposta automática que não leu o cliente",
    tipo: TipoLicao.CACA_ERRO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 3.1",
    conteudo: {
      contexto:
        "Um restaurante montou respostas-base para o WhatsApp. Um cliente escreveu, e a resposta que saiu foi esta. Há três problemas.",
      texto:
        "Cliente: \"Boa tarde! Tenho alergia grave a amendoim. Vocês conseguem garantir que o prato não tem contato com amendoim na cozinha? É sério, já fui parar no hospital.\"\n\nResposta enviada: \"Olá! Que bom ter você com a gente! 😊 Temos várias opções deliciosas no cardápio. Nosso horário é das 11h às 23h e aceitamos todos os cartões. Qualquer dúvida estamos à disposição!\"",
      erros: [
        {
          trecho: "Que bom ter você com a gente! 😊",
          porque:
            "O tom não cabe na mensagem. A pessoa falou de hospital; a resposta chegou animada. Tom alegre em mensagem grave soa como deboche.",
        },
        {
          trecho: "Temos várias opções deliciosas no cardápio",
          porque:
            "Não responde. A pergunta era sobre contato cruzado na cozinha, não sobre variedade. Resposta-base enviada sem ler o caso vira monólogo.",
        },
        {
          trecho: "Qualquer dúvida estamos à disposição!",
          porque:
            "Encerra sem encaminhar. Uma pergunta sobre alergia grave precisa ir para uma pessoa — é decisão que envolve saúde, e nenhuma resposta pronta cobre.",
        },
      ],
      licao:
        "Resposta-base economiza tempo em pergunta repetida. Mas toda automação precisa de uma regra de parada: alergia, saúde, reclamação grave e pedido de exceção vão para uma pessoa. Sempre.",
    },
  },
  {
    modulo: 2,
    titulo: "Desafio: dez minutos, uma tarefa da sua semana",
    tipo: TipoLicao.DESAFIO,
    xp: 30,
    tempo: 12,
    cap: "Cap. 3",
    conteudo: {
      titulo: "Resolva agora uma coisa da sua lista",
      segundos: 600,
      instrucoes: [
        "Escolha uma tarefa de escrita que está pendente há dias.",
        "Monte o pedido com as cinco partes, sem pular a restrição.",
        "Gere, leia em voz alta e ajuste o que não soar seu.",
        "Use de verdade: mande, publique ou salve onde vai usar.",
      ],
      fechamento:
        "Se a tarefa saiu em dez minutos, você acabou de medir o ganho. Se não saiu, anote onde travou — é isso que a próxima lição resolve.",
    },
  },

  /* ===================== MÓDULO 4 — Delegar ===================== */
  {
    modulo: 3,
    titulo: "Caso: a empresa que delegou sem revisar",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 12,
    cap: "Cap. 4.1",
    conteudo: {
      titulo: "A empresa que delegou sem revisar",
      cena:
        "Uma pequena distribuidora passou a usar IA para responder pedidos de cotação. Funcionou por semanas. Até que um pedido citava um produto que a empresa tinha deixado de trabalhar seis meses antes — e a IA, com base nos arquivos antigos, cotou normalmente. O cliente fechou, pagou, e só então descobriram.",
      pergunta:
        "O erro foi da IA, do processo ou da informação que ela recebeu? O que precisaria mudar em cada um desses três lugares?",
      pistas: [
        "Repare que a informação estava certa — só estava velha",
        "Pergunte quem deveria ter notado, e em que momento",
        "Considere que o mesmo erro aconteceria com um funcionário novo",
      ],
      fechamento:
        "Os três. A informação precisava de data de validade; o processo precisava de conferência antes do envio; e o pedido precisava da restrição de confirmar disponibilidade. Quanto maior o trabalho delegado, mais importante a revisão — e mais cara a falta dela.",
    },
  },
  {
    modulo: 3,
    titulo: "O que a IA precisa ter em mãos para trabalhar bem",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 9,
    cap: "Cap. 4.1",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Delegar um trabalho de várias etapas só funciona se a IA tiver o material. É como pedir a um funcionário novo que monte uma proposta sem dar acesso a nada.",
        },
        {
          tipo: "lista",
          titulo: "O que separar antes",
          itens: [
            "Um exemplo do que você considera um bom resultado",
            "Os dados reais — sem nome, CPF ou telefone de ninguém",
            "As regras do seu negócio: prazos, o que você não faz, o que precisa aprovar",
            "O critério de pronto: o que o resultado precisa conter",
          ],
        },
        {
          tipo: "destaque",
          titulo: "O exemplo vale mais que a explicação",
          texto:
            "Mostrar uma proposta que ficou boa ensina mais que três parágrafos descrevendo como deve ser. Vale para tom, estrutura e nível de detalhe.",
        },
        {
          tipo: "destaque",
          titulo: "Toda informação com prazo precisa de data",
          texto:
            "Preço, disponibilidade, política de troca. Sem data, a IA usa o que tem como se fosse atual — e repete o preço do ano passado com toda a confiança.",
        },
        {
          tipo: "texto",
          texto:
            "E diga onde parar: 'me mostre antes de finalizar'. Trabalho delegado sem ponto de conferência é trabalho que você vai refazer.",
        },
      ],
    },
  },
  {
    modulo: 3,
    titulo: "Duelo: delegar mal e delegar bem",
    tipo: TipoLicao.DUELO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 4.2",
    conteudo: {
      situacao:
        "Um contador quer que a IA organize os documentos que os clientes mandam durante o mês.",
      ruim: {
        titulo: "Delegação vaga",
        prompt: "Organize esses documentos para mim.",
        resultado:
          "Uma organização qualquer, com critério que a IA inventou. Provavelmente por tipo de arquivo, que é o que menos importa. Ele vai reorganizar tudo depois.",
      },
      bom: {
        titulo: "Delegação com critério",
        prompt:
          "Contexto: sou contador e recebo documentos de clientes ao longo do mês. Anexei 30 arquivos.\nObjetivo: organizá-los para eu fechar o mês.\nFormato: agrupe por cliente (identificado por código, nunca por nome), depois por tipo de documento e depois por data. Para cada cliente, me diga o que está faltando com base no que os outros mandaram.\nRestrições: não renomeie nada sem me mostrar antes; não descarte nada; se um documento não der para identificar, separe numa pasta de dúvidas em vez de chutar.\nMe mostre a organização proposta antes de aplicar.",
        resultado:
          "Uma proposta de organização que ele aprova ou corrige, com uma lista do que falta por cliente — que é justamente o trabalho que ele fazia na mão.",
      },
      pergunta:
        "Pegue um trabalho de várias etapas que você faria em uma hora e escreva a versão com critério, ponto de parada e o que não pode ser feito.",
      fechamento:
        "Repare no que o pedido bom tem: um critério explícito, uma proibição ('não descarte nada'), um tratamento para o caso duvidoso e um ponto de parada. São esses quatro que transformam delegar em ganhar tempo.",
    },
  },
  {
    modulo: 3,
    titulo: "No celular: peça um trabalho, não uma resposta",
    tipo: TipoLicao.NO_CELULAR,
    xp: 20,
    tempo: 10,
    cap: "Cap. 4.2",
    conteudo: {
      titulo: "A diferença na prática",
      tempo: "10 minutos",
      passos: [
        "Pense numa tarefa que você faria em meia hora, juntando informação de lugares diferentes.",
        "Primeiro peça de forma solta: descreva a tarefa numa frase.",
        "Depois peça de novo, dizendo o que é sucesso, o que não pode e onde parar para você conferir.",
        "Compare os dois resultados.",
        "Anote qual das três coisas — critério, proibição ou parada — mais mudou o resultado.",
      ],
      porque:
        "Sentir a diferença uma vez vale mais que ler sobre ela. E a coisa que mais mudou no seu caso é a que você deve nunca mais esquecer.",
    },
  },

  /* ===================== MÓDULO 5 — Imagens ===================== */
  {
    modulo: 4,
    titulo: "Duelo: pedido de imagem vago e específico",
    tipo: TipoLicao.DUELO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 5.1",
    conteudo: {
      situacao: "Uma doceira quer uma foto do seu brigadeiro gourmet para anunciar.",
      ruim: {
        titulo: "Pedido vago",
        prompt: "Uma foto bonita de brigadeiro.",
        resultado:
          "Um doce genérico de banco de imagens, com fundo colorido aleatório, tamanho que não corresponde ao dela, e às vezes com uma palavra inventada escrita na embalagem.",
      },
      bom: {
        titulo: "Pedido em oito partes",
        prompt:
          "Assunto: três brigadeiros gourmet em forminhas de papel escuro, cobertos de granulado belga, em primeiro plano.\nAmbiente: mesa de mármore branco, com um pano de linho bege desfocado ao fundo.\nComposição: câmera levemente acima, aproximação, os três em triângulo.\nIluminação: luz natural lateral suave, sombra curta.\nEstilo: fotografia de produto realista.\nCores: contraste entre o escuro do doce e o claro da mesa.\nFormato: quadrado, alta resolução.\nRestrições: sem texto na imagem, sem marca de outra empresa, sem mão ou pessoa, sem exagero de brilho que não corresponda ao doce real.",
        resultado:
          "Uma imagem que parece o produto dela, pronta para receber o texto no Canva.",
      },
      pergunta:
        "Escreva as oito partes para um produto ou serviço seu. Se algum item não se aplicar, diga por quê.",
      fechamento:
        "A restrição final — 'sem exagero que não corresponda ao doce real' — é a mais importante e a menos lembrada. Foto embelezada além do produto vira reclamação na entrega.",
    },
  },
  {
    modulo: 4,
    titulo: "Caça ao erro: a imagem que não pode ser publicada",
    tipo: TipoLicao.CACA_ERRO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 5.2",
    conteudo: {
      contexto:
        "Uma loja gerou esta imagem para anunciar e ia publicar. Há três problemas que só aparecem quando se olha com atenção.",
      texto:
        "Imagem gerada: uma tênis esportivo branco em primeiro plano, sobre fundo de academia. Na lateral do tênis, três listras. No canto superior, um texto que a IA escreveu: 'PROMOÇÂO ESPECIAL - 50% OFF'. Ao fundo, uma pessoa de rosto nítido levantando peso.",
      erros: [
        {
          trecho: "três listras",
          porque:
            "Marca de terceiro. A IA reproduz elementos de marcas conhecidas quando não se proíbe explicitamente — e publicar isso é problema que não compensa.",
        },
        {
          trecho: "PROMOÇÂO ESPECIAL",
          porque:
            "Texto gerado por IA, com erro de acentuação. É por isso que se pede 'sem texto na imagem': a letra sai torta ou errada, e ninguém revisa imagem como revisa texto.",
        },
        {
          trecho: "uma pessoa de rosto nítido",
          porque:
            "Rosto identificável gerado por IA. Além do resultado às vezes estranho, publicar um rosto que parece uma pessoa real é risco desnecessário.",
        },
      ],
      licao:
        "As três restrições que evitam tudo isso são sempre as mesmas: sem texto, sem marca de terceiros, sem rosto identificável. Escreva-as em todo pedido de imagem — custa uma linha.",
    },
  },
  {
    modulo: 4,
    titulo: "Laboratório: a imagem com fundo transparente",
    tipo: TipoLicao.LABORATORIO,
    xp: 30,
    tempo: 20,
    cap: "Cap. 5.2",
    conteudo: {
      titulo: "Um recorte que serve para qualquer arte",
      contexto:
        "Imagem com fundo transparente é a mais reaproveitável que existe: serve para post, banner, cardápio e catálogo, sempre com fundo diferente. Vamos fazer uma.",
      passos: [
        "Escolha um produto ou objeto do seu negócio.",
        "Peça a imagem isolada, pedindo explicitamente fundo transparente e formato PNG.",
        "Acrescente: sem cenário, sem fundo sólido, sem sombra projetada, sem xadrez cinza.",
        "Baixe e abra sobre um fundo colorido qualquer — no Canva ou até no PowerPoint.",
        "Se aparecer uma borda branca ou o xadrez desenhado, peça de novo reforçando a restrição.",
      ],
      promptSugerido: {
        titulo: "O pedido",
        corpo:
          "Assunto: [OBJETO], isolado, visto de [ANGULO].\nFundo: totalmente transparente.\nIluminação: uniforme, sem sombra projetada.\nFormato: PNG, quadrado.\nRestrições: sem cenário, sem fundo sólido, sem sombra no fundo, sem xadrez cinza simulando transparência. Apenas o objeto recortado.",
        variaveis: [
          { chave: "OBJETO", rotulo: "O objeto", exemplo: "uma xícara de café branca" },
          { chave: "ANGULO", rotulo: "Ângulo", exemplo: "lado, levemente acima" },
        ],
      },
      campos: [
        {
          chave: "objeto",
          rotulo: "Que objeto você recortou?",
          curto: true,
          exemplo: "Pote de geleia artesanal",
        },
        {
          chave: "prompt",
          rotulo: "O prompt que funcionou",
          ajuda: "Guarde: você vai reusar para todos os outros produtos.",
        },
        {
          chave: "onde_usar",
          rotulo: "Onde você vai usar essa imagem",
          curto: true,
        },
      ],
      criterios: [
        "O fundo é realmente transparente, não branco",
        "Não há xadrez cinza desenhado na imagem",
        "O objeto continua fiel ao real",
        "O prompt está salvo para reaproveitar",
      ],
      entrega: "Um recorte que serve para qualquer material seu.",
    },
  },

  /* ===================== MÓDULO 6 — Vídeo ===================== */
  {
    modulo: 5,
    titulo: "O que dá e o que não dá para esperar de vídeo por IA",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 9,
    cap: "Cap. 6.1",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Vídeo gerado por IA avançou muito, e ainda tem limites claros. Saber quais evita perder uma tarde tentando o que não vai sair.",
        },
        {
          tipo: "lista",
          titulo: "Funciona bem",
          itens: [
            "Clipes curtos, de 5 a 10 segundos, com um movimento de câmera só",
            "Cenas de ambiente, produto e textura",
            "Imagem parada ganhando movimento sutil",
            "Fundo para entrar atrás do seu texto",
          ],
        },
        {
          tipo: "lista",
          titulo: "Ainda falha",
          itens: [
            "Pessoas falando com sincronia de boca convincente",
            "Texto legível dentro do vídeo",
            "Manter o mesmo rosto ou produto idêntico entre cenas",
            "Cenas longas com várias ações acontecendo",
          ],
        },
        {
          tipo: "destaque",
          titulo: "O caminho que funciona hoje",
          texto:
            "Para negócio local, o melhor resultado costuma ser: você grava com o celular, sua voz narra, e a IA entra no roteiro, nas legendas e em uma ou outra cena de apoio. Sua voz e seu rosto convencem mais que qualquer geração.",
        },
        {
          tipo: "destaque",
          titulo: "Sobre as ferramentas",
          texto:
            "O Sora foi encerrado pela OpenAI em março de 2026. Hoje o caminho gratuito mais viável é o Veo, pelo Google AI Studio, com cerca de 10 gerações por mês em conta comum. O Pika é a alternativa cujo plano gratuito permite uso comercial, limitado a 480p.",
        },
      ],
    },
  },
  {
    modulo: 5,
    titulo: "Laboratório: seu primeiro vídeo curto",
    tipo: TipoLicao.LABORATORIO,
    xp: 35,
    tempo: 25,
    cap: "Cap. 6.2",
    conteudo: {
      titulo: "Da ideia ao arquivo pronto",
      contexto:
        "Um vídeo de 30 segundos sobre algo que você explica toda semana para cliente. Nada de produção: celular, sua voz e legenda.",
      passos: [
        "Escolha a dúvida que você mais responde.",
        "Peça à IA 8 opções de primeira frase e escolha a que você falaria mesmo.",
        "Peça o roteiro em tópicos, não em texto para ler.",
        "Grave com o celular, na horizontal ou vertical conforme o canal.",
        "Peça as legendas em blocos curtos e coloque no editor do próprio celular.",
      ],
      promptSugerido: {
        titulo: "O roteiro",
        corpo:
          "Contexto: meu negócio é [NEGOCIO] e quero um vídeo de [DURACAO] sobre [ASSUNTO].\nObjetivo: um roteiro que eu grave sozinho, com o celular.\nFormato: tópicos, não texto corrido; a primeira e a última frase por extenso.\nRestrições: nada que exija equipe ou iluminação especial; a primeira frase tem de prender em 3 segundos; no máximo 5 tópicos.",
        variaveis: [
          { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "oficina" },
          { chave: "DURACAO", rotulo: "Duração", exemplo: "30 segundos" },
          { chave: "ASSUNTO", rotulo: "Assunto", exemplo: "quando trocar o óleo" },
        ],
      },
      campos: [
        { chave: "assunto", rotulo: "Sobre o que é o vídeo", curto: true },
        { chave: "primeira_frase", rotulo: "A primeira frase que você escolheu", curto: true },
        { chave: "aprendizado", rotulo: "O que foi mais difícil, e como resolveu" },
      ],
      criterios: [
        "A primeira frase prende em 3 segundos",
        "Você gravou falando, não lendo",
        "Tem legenda",
        "O vídeo está publicado ou pronto para publicar",
      ],
      entrega: "Um vídeo pronto, feito só com o celular.",
    },
  },
  {
    modulo: 5,
    titulo: "Caso: a propaganda que prometeu o que o produto não faz",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 6.2",
    conteudo: {
      titulo: "A propaganda que prometeu demais",
      cena:
        "Uma loja de cosméticos gerou um vídeo com IA mostrando o resultado de um creme. A cena ficou impressionante — pele visivelmente transformada em poucos segundos. O vídeo viralizou, as vendas triplicaram. Em três semanas, começaram as devoluções e as reclamações de propaganda enganosa.",
      pergunta:
        "Em que ponto isso deixou de ser divulgação e virou problema? O vídeo mentia, exagerava, ou nenhum dos dois?",
      pistas: [
        "Repare que nada no vídeo era uma afirmação escrita",
        "Pergunte o que o cliente entendeu, e não o que a loja disse",
        "Considere que a IA gera o que se pede, inclusive o impossível",
      ],
      fechamento:
        "A imagem promete mesmo sem afirmar. E a IA não tem noção do que o seu produto faz: ela gera o que você pede, inclusive resultado que não existe. A restrição 'sem exagero que não corresponda ao produto real' não é detalhe técnico — é o que separa divulgação de propaganda enganosa.",
    },
  },

  /* ===================== MÓDULO 7 — Documentos e planilhas ===================== */
  {
    modulo: 6,
    titulo: "Fazer a IA ler a sua planilha",
    tipo: TipoLicao.PROMPT,
    xp: 25,
    tempo: 12,
    cap: "Cap. 7.1",
    conteudo: {
      introducao:
        "A parte mais esquecida ao colar uma planilha é explicar o que cada coluna significa. Sem isso, a IA supõe — e uma coluna 'valor' pode ser preço, custo ou desconto.",
      corpo:
        "Contexto: vou colar uma tabela do meu [NEGOCIO], já sem nome de cliente. As colunas são: [COLUNAS].\nObjetivo: [O_QUE_QUERO].\nFormato: [FORMATO].\nRestrições: use somente os dados colados; não preencha célula vazia com estimativa — marque como [SEM DADO]. Separe o que os dados mostram do que é interpretação.\nDados: [DADOS]",
      categoria: "dados",
      dica:
        "Explicar as colunas parece perda de tempo e é o que mais melhora o resultado. Leva 20 segundos.",
      campos: [
        { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "loja de calçados" },
        { chave: "COLUNAS", rotulo: "O que cada coluna é", exemplo: "data, produto, quantidade, valor unitário" },
        { chave: "O_QUE_QUERO", rotulo: "O que você quer saber", exemplo: "quais produtos vendem mais" },
        { chave: "FORMATO", rotulo: "Formato da resposta", exemplo: "tabela ordenada por quantidade" },
        { chave: "DADOS", rotulo: "Seus dados", exemplo: "cole a tabela" },
      ],
    },
  },
  {
    modulo: 6,
    titulo: "Caça ao erro: a análise que inventou o que não estava lá",
    tipo: TipoLicao.CACA_ERRO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 7.2",
    conteudo: {
      contexto:
        "Um dono de restaurante colou as vendas de três meses e pediu uma análise. A resposta veio assim. Três coisas não deveriam estar aí.",
      texto:
        "Análise das vendas — jul a set\n\n• O prato mais vendido foi a feijoada, com 340 unidades.\n• As vendas caíram 12% em agosto, provavelmente por causa do período de férias escolares.\n• O ticket médio é de R$ 48, abaixo da média do setor de restaurantes, que é de R$ 62.\n• Recomendo aumentar o preço da feijoada em 15% para melhorar a margem.",
      erros: [
        {
          trecho: "provavelmente por causa do período de férias escolares",
          porque:
            "Causa inventada. Os dados mostram a queda, não o motivo. Pode ser férias, chuva, uma obra na rua ou um concorrente novo — a IA escolheu uma explicação plausível e a apresentou como fato.",
        },
        {
          trecho: "a média do setor de restaurantes, que é de R$ 62",
          porque:
            "Número que não veio dos dados colados. A IA não tem a média do setor da região dele; esse R$ 62 é alucinação com cara de referência.",
        },
        {
          trecho: "Recomendo aumentar o preço da feijoada em 15%",
          porque:
            "Decisão, não análise. Preço envolve custo, concorrência e percepção do cliente — coisas que não estavam na planilha. Análise informa; quem decide é o dono.",
        },
      ],
      licao:
        "As duas restrições que evitariam tudo: 'separe o que os dados mostram do que é interpretação' e 'não compare com médias de mercado que você não pode citar a fonte'. A terceira se resolve com 'não decida por mim'.",
    },
  },
  {
    modulo: 6,
    titulo: "No celular: exporte e pergunte",
    tipo: TipoLicao.NO_CELULAR,
    xp: 20,
    tempo: 12,
    cap: "Cap. 7.1",
    conteudo: {
      titulo: "O caminho gratuito, passo a passo",
      tempo: "12 minutos",
      passos: [
        "Abra a planilha que você já usa — no celular mesmo.",
        "Selecione e copie a parte que interessa, ou exporte em CSV.",
        "Tire nome de cliente; código no lugar serve igual.",
        "Cole na IA explicando o que cada coluna é.",
        "Faça uma pergunta cuja resposta você já sabe — é assim que se testa se dá para confiar.",
      ],
      porque:
        "Os recursos do Gemini dentro do Planilhas dependem de assinatura. Este caminho funciona hoje, de graça, em qualquer conta — e dá quase o mesmo resultado com um passo a mais.",
    },
  },
  {
    modulo: 6,
    titulo: "Laboratório: a planilha que você não tinha",
    tipo: TipoLicao.LABORATORIO,
    xp: 30,
    tempo: 20,
    cap: "Cap. 7.2",
    conteudo: {
      titulo: "Montar do zero um controle que você vai manter",
      contexto:
        "Pense em algo que você controla de cabeça ou no caderno. Vamos transformar numa planilha simples — com as fórmulas prontas e explicadas.",
      passos: [
        "Escolha o que controlar: caixa, encomendas, horas, estoque.",
        "Descreva à IA o que você precisa acompanhar e que decisão isso ajuda a tomar.",
        "Peça as colunas, as fórmulas prontas e uma linha explicando cada fórmula.",
        "Monte no Google Planilhas e coloque dados reais de uma semana.",
        "Confira se a conta bate com o que você sabe de cabeça.",
      ],
      promptSugerido: {
        titulo: "O pedido da planilha",
        corpo:
          "Contexto: preciso controlar [O_QUE] no meu [NEGOCIO] e não sei montar planilha.\nObjetivo: uma planilha simples que eu consiga manter sozinho.\nFormato: quais colunas criar, o que vai em cada uma, as fórmulas prontas para colar, e uma linha explicando o que cada fórmula faz.\nRestrições: no máximo 8 colunas; nada de fórmula que eu não consiga entender; funcione no Google Planilhas gratuito.",
        variaveis: [
          { chave: "O_QUE", rotulo: "O que controlar", exemplo: "entrada e saída de caixa" },
          { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "barbearia" },
        ],
      },
      campos: [
        { chave: "controle", rotulo: "O que você passou a controlar", curto: true },
        { chave: "formula", rotulo: "A fórmula mais útil, e o que ela faz" },
        { chave: "decisao", rotulo: "Que decisão essa planilha vai ajudar a tomar" },
      ],
      criterios: [
        "A planilha tem no máximo 8 colunas",
        "Você entende o que cada fórmula faz",
        "Tem dados reais de pelo menos uma semana",
        "A conta bate com o que você já sabia",
      ],
      entrega: "Um controle que substitui o caderno.",
    },
  },

  /* ===================== MÓDULO 8 — NotebookLM ===================== */
  {
    modulo: 7,
    titulo: "Caso: o funcionário novo que perguntava tudo",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 8.1",
    conteudo: {
      titulo: "O funcionário novo que perguntava tudo",
      cena:
        "Uma assistência técnica contratou um atendente. Nas primeiras semanas, ele interrompia o técnico umas vinte vezes por dia: prazo de garantia, o que cobre, quanto custa cada serviço, o que fazer quando o aparelho não tem conserto. O técnico parava o serviço para responder. Os dois produziam menos.",
      pergunta:
        "As informações existiam, escritas, em algum lugar. Por que ele perguntava mesmo assim — e o que resolveria?",
      pistas: [
        "Repare que 'estar escrito' e 'ser encontrável' são coisas diferentes",
        "Pergunte quanto tempo ele levaria procurando no arquivo",
        "Considere que perguntar é sempre mais rápido que procurar",
      ],
      fechamento:
        "Perguntar sempre ganha de procurar, e por isso ninguém procura. Um caderno com os procedimentos, contratos e tabela dentro muda essa conta: perguntar ao caderno passa a ser mais rápido que perguntar ao técnico — e a resposta vem com a citação de onde saiu.",
    },
  },
  {
    modulo: 7,
    titulo: "Como escrever para uma base que vai ser consultada",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 8,
    cap: "Cap. 8.2",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Subir os arquivos que você já tem funciona. Mas alguns documentos rendem muito mais que outros — e a diferença está em como foram escritos.",
        },
        {
          tipo: "lista",
          titulo: "Rende bem",
          itens: [
            "Texto dividido em títulos curtos e específicos",
            "Uma informação por parágrafo",
            "Números e prazos escritos por extenso, com data de validade",
            "Perguntas reais como título de seção",
          ],
        },
        {
          tipo: "lista",
          titulo: "Rende mal",
          itens: [
            "Foto de documento sem texto reconhecível",
            "Planilha com dado espalhado e sem cabeçalho",
            "Texto corrido de muitas páginas sem divisão",
            "Versões diferentes do mesmo documento, sem data",
          ],
        },
        {
          tipo: "destaque",
          titulo: "O erro mais caro",
          texto:
            "Subir duas versões do mesmo documento sem data. A base responde com as duas, e quem consulta não sabe qual vale. Mantenha uma versão por assunto, com a data no nome.",
        },
        {
          tipo: "destaque",
          titulo: "Um detalhe que muda tudo",
          texto:
            "Use as perguntas da sua equipe como títulos. 'Quanto tempo dura a garantia?' funciona melhor que 'Política de garantia' — porque é assim que a pergunta vai chegar.",
        },
      ],
    },
  },
  {
    modulo: 7,
    titulo: "No celular: pergunte ao seu contrato",
    tipo: TipoLicao.NO_CELULAR,
    xp: 20,
    tempo: 10,
    cap: "Cap. 8.2",
    conteudo: {
      titulo: "Dez minutos e um documento que você nunca leu inteiro",
      tempo: "10 minutos",
      passos: [
        "Abra notebooklm.google.com e entre com a conta Google.",
        "Crie um caderno e suba um documento longo que você tem — contrato, manual, edital.",
        "Pergunte algo cuja resposta você já sabe, e confira a citação.",
        "Agora pergunte algo que você nunca soube responder sobre esse documento.",
        "Repare que toda resposta aponta o trecho de onde saiu.",
      ],
      porque:
        "A citação é o que diferencia esta ferramenta das outras. Você não precisa confiar na resposta: você confere o trecho, que está ali do lado.",
    },
  },

  /* ===================== MÓDULO 9 — Automação ===================== */
  {
    modulo: 8,
    titulo: "O pedido que chega e vira trabalho",
    tipo: TipoLicao.FLUXO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 9.2",
    conteudo: {
      titulo: "Do pedido ao serviço registrado",
      introducao:
        "O segundo processo que mais se perde em negócio pequeno: o pedido chega por um canal, é anotado noutro, e some no meio.",
      gatilho: "Chega um pedido por WhatsApp, telefone ou balcão",
      etapas: [
        { titulo: "Registrar num lugar só", detalhe: "Todo pedido entra na mesma planilha, venha do canal que vier." },
        { titulo: "Conferir o que falta", detalhe: "Endereço, prazo, forma de pagamento, observação especial." },
        {
          titulo: "Confirmar com o cliente",
          detalhe: "O rascunho da confirmação é gerado; quem envia é uma pessoa.",
          revisaoHumana: true,
        },
        { titulo: "Programar a execução", detalhe: "Entra na agenda de quem vai fazer, com prazo." },
        { titulo: "Avisar quando sair", detalhe: "Mensagem de saída ou retirada, no momento certo." },
        { titulo: "Registrar a conclusão", detalhe: "Fecha o pedido e libera o acompanhamento de pós-venda." },
      ],
      ondeParar:
        "A confirmação ao cliente. É onde um erro de endereço ou de prazo vira entrega perdida — e o custo de conferir é de dez segundos.",
      ferramentas: ["Make", "Google Planilhas", "Google Agenda"],
      porQue:
        "Repare que o primeiro passo não é automatizar nada: é ter um lugar só para registrar. Processo espalhado por três lugares não se automatiza — se organiza primeiro.",
    },
  },
  {
    modulo: 8,
    titulo: "Caso: a empresa que automatizou antes de validar",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 12,
    cap: "Cap. 9.1",
    conteudo: {
      titulo: "A empresa que automatizou antes de validar",
      cena:
        "Um restaurante conectou o formulário do site a uma mensagem automática de confirmação. Funcionou bem por semanas. Até que um cliente preencheu informando alergia grave a frutos do mar no campo de observação — e recebeu a mesma confirmação alegre de sempre, dando a entender que o pedido seria adaptado. Ninguém da cozinha viu a observação.",
      pergunta:
        "Redesenhe o fluxo: onde a automação deveria parar, quem recebe o alerta, e que texto seguro o cliente deveria receber?",
      pistas: [
        "Repare que a automação funcionou exatamente como foi montada",
        "Pergunte o que acontece com o campo de observação hoje",
        "Considere que o risco não é do processo comum, e sim da exceção",
      ],
      fechamento:
        "A automação não errou: ela não tinha regra para a exceção. Todo fluxo que toca o cliente precisa de uma pergunta antes de ser ligado — 'o que acontece quando vier algo que eu não previ?'. A resposta certa quase sempre é: para, avisa uma pessoa, e manda um texto que não promete nada.",
    },
  },
  {
    modulo: 8,
    titulo: "Caça ao erro: a automação que enviou sozinha",
    tipo: TipoLicao.CACA_ERRO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 9.3",
    conteudo: {
      contexto:
        "Este é o desenho de uma automação que um prestador montou. Há três decisões que vão dar problema.",
      texto:
        "Gatilho: cliente preenche o formulário de orçamento.\n1. Sistema lê o pedido e identifica o serviço.\n2. IA gera o orçamento com base na tabela de preços.\n3. Sistema envia o orçamento por e-mail ao cliente.\n4. Sistema agenda a visita técnica na primeira data livre.\n5. Registra na planilha.",
      erros: [
        {
          trecho: "Sistema envia o orçamento por e-mail ao cliente",
          porque:
            "Envio direto ao cliente sem revisão. Um erro de leitura do pedido vira um preço errado que já foi enviado — e preço enviado é compromisso.",
        },
        {
          trecho: "agenda a visita técnica na primeira data livre",
          porque:
            "Compromisso assumido automaticamente. A agenda pode estar livre e a pessoa não estar disponível; o deslocamento pode não compensar para aquela região.",
        },
        {
          trecho: "Registra na planilha",
          porque:
            "Registrar por último é registrar tarde. Se algo falhar nos passos 3 ou 4, não há rastro de que o pedido existiu — e o cliente some sem ninguém saber.",
        },
      ],
      licao:
        "Três regras que resolvem: registre primeiro, gere rascunho em vez de enviar, e nunca assuma compromisso de agenda sem uma pessoa confirmar. A automação prepara; quem se compromete é o negócio.",
    },
  },
  {
    modulo: 8,
    titulo: "No celular: sua primeira automação de verdade",
    tipo: TipoLicao.NO_CELULAR,
    xp: 25,
    tempo: 15,
    cap: "Cap. 9.3",
    conteudo: {
      titulo: "Uma automação simples, funcionando hoje",
      tempo: "15 minutos",
      passos: [
        "Crie um Google Formulário com três campos: nome, contato e o que a pessoa precisa.",
        "Nas configurações, ligue a resposta automática por e-mail.",
        "Abra a planilha de respostas — ela já é criada sozinha.",
        "Preencha o formulário você mesmo, como se fosse um cliente.",
        "Confira: a linha apareceu na planilha e o e-mail chegou?",
      ],
      porque:
        "Isto já é uma automação: um gatilho e duas ações, sem programar nada e sem pagar nada. Antes de montar fluxos complexos, vale sentir que o mecanismo é simples.",
    },
  },

  /* ===================== MÓDULO 10 — Agentes ===================== */
  {
    modulo: 9,
    titulo: "Sete agentes que fazem sentido num negócio pequeno",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 10,
    cap: "Cap. 10.1",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "Agente não é coisa de empresa grande. O que muda é o tamanho da tarefa. Estes sete aparecem com frequência em negócios pequenos.",
        },
        {
          tipo: "destaque",
          titulo: "Atendimento",
          texto:
            "Responde a dúvida repetida e chama uma pessoa quando sai do roteiro. O mais comum, e o que mais exige regra de parada.",
        },
        {
          tipo: "destaque",
          titulo: "Pesquisa",
          texto:
            "Levanta informação sobre fornecedor, concorrente ou tema, sempre com a fonte. Erro dele custa pouco: você confere antes de usar.",
        },
        {
          tipo: "destaque",
          titulo: "Comercial",
          texto:
            "Prepara proposta e organiza o acompanhamento. Nunca decide preço nem desconto.",
        },
        {
          tipo: "destaque",
          titulo: "Marketing",
          texto: "Sugere pauta, escreve rascunho e adapta o mesmo conteúdo para cada canal.",
        },
        {
          tipo: "destaque",
          titulo: "Administrativo",
          texto: "Organiza documento, transforma reunião em tarefa, monta relatório.",
        },
        {
          tipo: "destaque",
          titulo: "Análise",
          texto:
            "Olha os números e aponta o que mudou. Informa; não recomenda decisão.",
        },
        {
          tipo: "destaque",
          titulo: "Documentos",
          texto:
            "Lê contrato e manual e responde perguntas com citação. É o que o NotebookLM já faz.",
        },
        {
          tipo: "texto",
          texto:
            "Comece pelos de erro barato — pesquisa, documentos, análise. Eles erram para você, não para o cliente, e é assim que se aprende a confiar antes de dar mais poder.",
        },
      ],
    },
  },
  {
    modulo: 9,
    titulo: "Duelo: agente sem limite e agente com limite",
    tipo: TipoLicao.DUELO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 10.2",
    conteudo: {
      situacao:
        "Uma clínica quer um assistente digital para as dúvidas iniciais de quem chama no WhatsApp.",
      ruim: {
        titulo: "Instrução sem limite",
        prompt:
          "Você é o assistente da clínica. Responda os clientes com simpatia e resolva o que eles precisarem.",
        resultado:
          "Ele responde tudo — inclusive o que não sabe. Inventa horário, dá opinião sobre sintoma, promete encaixe, e oferece desconto porque o cliente insistiu. Cada resposta vira um compromisso que a clínica não assumiu.",
      },
      bom: {
        titulo: "Instrução com limite",
        prompt:
          "Você é o assistente da clínica, para dúvidas iniciais no WhatsApp.\nPode: informar horário de funcionamento, endereço, convênios aceitos, e como agendar.\nNunca pode: opinar sobre sintoma ou diagnóstico, prometer encaixe, oferecer desconto, confirmar agendamento, ou falar sobre resultado de exame.\nQuando não souber: diga que vai confirmar e chame uma pessoa.\nChame uma pessoa imediatamente se: a mensagem mencionar dor forte, emergência, resultado de exame, reclamação, ou pedido de exceção.\nTom: cordial e direto, sem emoji em excesso.",
        resultado:
          "Ele resolve as dúvidas repetidas, que são a maioria, e transfere o resto com uma frase clara — sem ter prometido nada no caminho.",
      },
      pergunta:
        "Escreva a lista do 'nunca pode' do seu agente. Comece por ela, não pelo que ele pode fazer.",
      fechamento:
        "Repare no tamanho das duas listas: o que ele não pode é maior que o que ele pode. É assim que tem de ser no começo — dá para afrouxar depois, com evidência; apertar depois é sempre tarde.",
    },
  },
  {
    modulo: 9,
    titulo: "Desafio: teste seu agente com as perguntas difíceis",
    tipo: TipoLicao.DESAFIO,
    xp: 35,
    tempo: 15,
    cap: "Cap. 10.2",
    conteudo: {
      titulo: "Quebre o seu agente antes do cliente",
      segundos: 900,
      instrucoes: [
        "Pegue as instruções que você escreveu no laboratório anterior.",
        "Teste com uma pergunta fácil — ele acerta?",
        "Teste pedindo desconto com insistência. Ele cede?",
        "Teste com uma reclamação grave. Ele chama uma pessoa?",
        "Teste com algo que ele não tem como saber. Ele inventa ou diz que vai confirmar?",
        "Corrija as instruções onde ele falhou e teste de novo.",
      ],
      fechamento:
        "Se ele cedeu no desconto ou inventou uma informação, a instrução está frouxa — e é bom que você tenha descoberto agora. Um agente que passa nos quatro testes já pode atender de verdade, com alguém acompanhando na primeira semana.",
    },
  },
  {
    modulo: 9,
    titulo: "Guia de bolso: quando desconfiar da IA",
    tipo: TipoLicao.EMERGENCIA,
    xp: 20,
    tempo: 6,
    cap: "Anexo A",
    conteudo: {
      titulo: "Para consultar no meio do expediente",
      itens: [
        {
          situacao: "Ela citou um número que eu não informei",
          acao:
            "Não use. Confira na fonte. Acrescente ao pedido: 'use somente as informações que eu forneci; onde faltar dado, escreva [FALTA]'.",
        },
        {
          situacao: "Ela citou uma lei, norma ou fonte",
          acao:
            "Procure a fonte antes de usar. Norma com número é o formato clássico da invenção. Se não achar, tire a citação.",
        },
        {
          situacao: "A resposta veio genérica",
          acao:
            "Falta uma das cinco partes — quase sempre a restrição. Diga o que NÃO pode e peça de novo.",
        },
        {
          situacao: "O texto não parece meu",
          acao:
            "Cole um texto que você escreveu e peça para seguir aquele jeito. Mostrar funciona melhor que descrever.",
        },
        {
          situacao: "Preciso colar algo com dado de cliente",
          acao:
            "Troque por CLIENTE A, VALOR X. Se for muito texto, peça primeiro que ela aponte o que remover.",
        },
        {
          situacao: "Vou enviar ao cliente o que ela escreveu",
          acao:
            "Leia em voz alta antes. Confira todo número, prazo e promessa. O que sai com o seu nome é sua responsabilidade.",
        },
        {
          situacao: "A automação fez algo errado",
          acao:
            "Desligue primeiro, investigue depois. Avise quem foi afetado antes que eles percebam sozinhos.",
        },
      ],
      fechamento:
        "Estes sete cobrem quase tudo que dá errado no começo. Depois de um mês usando, você não vai mais precisar consultar.",
    },
  },

  /* ===================== MÓDULO 11 — Projeto final ===================== */
  {
    modulo: 10,
    titulo: "Antes de escrever o plano: o que você já mudou",
    tipo: TipoLicao.CHECKPOINT,
    xp: 25,
    tempo: 8,
    cap: "Cap. 11",
    conteudo: {
      titulo: "O que você leva do curso",
      itens: [
        "Sabe pedir com as cinco partes, e sabe que a restrição é a que mais muda o resultado",
        "Reconhece a alucinação e confere número, norma e fonte antes de usar",
        "Não cola dado de cliente, e sabe trocar por marcador",
        "Produziu resposta, procedimento, imagem, análise e desenho de automação",
        "Sabe o que cada ferramenta cobra, e qual é o caminho gratuito de cada aula",
        "Sabe o que NÃO delegar: preço, crédito, contratação, questão jurídica e exceção de cliente",
      ],
      pergunta:
        "Antes de montar o plano: qual dessas coisas já mudou alguma rotina sua nesta semana?",
    },
  },
];
