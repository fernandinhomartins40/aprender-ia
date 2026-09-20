import { TipoLicao } from "@prisma/client";
import type { LicaoExtra } from "./modulos-extras";

/**
 * Módulo de Imagens, reconstruído.
 *
 * Era o pior caso do curso: quatro lições de TEORIA seguidas — editar,
 * referência, consistência e texto na imagem. Ninguém aprende a fazer
 * imagem lendo sobre fazer imagem.
 *
 * As três primeiras viram LABORATORIO: o aluno edita, usa referência e
 * gera um conjunto consistente, e a entrega fica salva. A quarta some,
 * porque "sem texto na imagem" já é uma das oito restrições da lição de
 * abertura — repeti-la em lição própria era encher.
 *
 * Entram também a ficha da ferramenta (o "Momento Ferramenta" que o
 * curso de Educadores tem e este não tinha) e o fluxo que leva da foto
 * ruim ao post publicado.
 *
 * As lições que já funcionavam — as oito partes, a foto de produto, o
 * duelo, a caça ao erro, o fundo transparente, o cardápio e o no
 * celular — ficam como estão, em `modulos.ts` e `modulos-extras2.ts`.
 */

export const LICOES_IMAGENS: LicaoExtra[] = [
  /* ============================================================
     A ficha da ferramenta — o "Momento Ferramenta"
     ============================================================ */
  {
    modulo: "Imagens que vendem",
    // Segunda lição do módulo, logo depois da teoria de abertura: quem
    // vai gerar imagem precisa reconhecer a tela antes de receber o
    // primeiro laboratório. No fim do módulo a ficha não serve para nada.
    posicao: 2,
    titulo: "Ferramenta: ChatGPT Imagens, por dentro",
    tipo: TipoLicao.NO_CELULAR,
    xp: 25,
    tempo: 12,
    cap: "Cap. 5.1",
    conteudo: {
      abrirAgora: ["chatgpt-imagens"],
      titulo: "Abra e reconheça o que tem ali",
      tempo: "12 minutos, com a ferramenta aberta",
      passos: [
        "Abra chatgpt.com e entre com sua conta. O plano gratuito basta para esta aula.",
        "Na caixa de mensagem, procure o botão de anexo (+) e repare nas opções: enviar foto, criar imagem.",
        "Peça: 'crie uma imagem de um caderno sobre uma mesa de madeira, luz natural, sem texto'.",
        "Quando a imagem aparecer, clique nela. Veja que dá para selecionar uma área e pedir mudança só ali.",
        "Peça 'deixe a luz mais suave' e observe: a imagem muda, o caderno continua o mesmo.",
      ],
      porque:
        "Este é o ponto que mais confunde quem começa: gerar de novo traz outra imagem; editar mantém a que você já tinha. Ver isso funcionando uma vez economiza dezenas de gerações perdidas.",
      ficha: {
        nome: "ChatGPT Imagens 2.5",
        oQueE:
          "A parte do ChatGPT que cria e edita imagem a partir de uma descrição em português.",
        paraQueServe:
          "Foto de produto, post, banner, cardápio, mockup, material promocional — tudo o que um negócio pequeno precisaria pedir a um designer para o dia a dia.",
        quandoUsar:
          "Quando você precisa de uma imagem que não existe, ou quando a foto que você tem tem um problema de luz ou fundo.",
        quandoNaoUsar:
          "Quando a imagem precisa mostrar o produto exatamente como ele é para fins de venda — aí a foto real, corrigida, vale mais. E nunca para reproduzir marca, logotipo ou arte de terceiros.",
        acesso: "GRATUITO COM LIMITES",
        limite:
          "Poucas imagens por dia no plano gratuito; o plano Go (US$ 8/mês) amplia a cota. Conferido em 20/09/2026.",
        exemploNegocio:
          "Uma doceria fotografa o doce no balcão, com fundo bagunçado. Envia a foto e pede fundo limpo e luz de janela. Em dois minutos tem a imagem do post.",
        atalho: "https://chatgpt.com/",
      },
    },
  },

  /* ============================================================
     Editar — era TEORIA
     ============================================================ */
  {
    modulo: "Imagens que vendem",
    titulo: "Laboratório: conserte uma imagem em vez de gerar outra",
    tipo: TipoLicao.LABORATORIO,
    xp: 35,
    tempo: 22,
    cap: "Cap. 5.3",
    conteudo: {
      abrirAgora: ["chatgpt-imagens"],
      titulo: "Um ajuste de cada vez, até ficar usável",
      contexto:
        "Quando a imagem sai quase boa, a reação comum é gerar de novo — e vem outra, diferente em tudo. Editar mantém o que já estava certo. Vamos praticar isso com uma imagem sua.",
      passos: [
        "Gere uma imagem do seu produto, ou envie uma foto sua que ficou mais ou menos.",
        "Olhe com calma e escreva UMA coisa que incomoda: fundo, luz, sombra, enquadramento.",
        "Peça a correção só dessa coisa. Nada de duas de uma vez.",
        "Compare com a anterior. Melhorou? Peça o próximo ajuste. Mudou o produto? Refaça pedindo fidelidade.",
        "Quando ficar usável, baixe — antes de continuar editando, porque versão intermediária não volta.",
      ],
      promptSugerido: {
        titulo: "O pedido do ajuste",
        corpo:
          "Nesta imagem, mantenha tudo igual e mude apenas [O_QUE_MUDAR].\nNão altere composição, cores do produto nem enquadramento.\nSe não der para corrigir sem mudar o resto, me diga em vez de gerar outra imagem.",
        variaveis: [
          {
            chave: "O_QUE_MUDAR",
            rotulo: "O que ajustar",
            exemplo: "a sombra embaixo, que está dura demais",
          },
        ],
      },
      campos: [
        {
          chave: "problema",
          rotulo: "O que estava errado na primeira versão?",
          curto: true,
          exemplo: "Fundo bagunçado da cozinha aparecendo atrás",
        },
        {
          chave: "ajustes",
          rotulo: "Os ajustes que você pediu, na ordem",
          ajuda: "Um por linha. Serve para você ver quantos foram necessários.",
        },
        {
          chave: "prompt_final",
          rotulo: "O pedido de ajuste que mais funcionou",
          ajuda: "Guarde: você vai reusar em toda imagem daqui para a frente.",
        },
      ],
      criterios: [
        "Você pediu um ajuste por vez",
        "O produto continua fiel ao real",
        "A imagem final está baixada",
        "Você sabe qual ajuste resolveu",
      ],
      entrega: "Uma imagem consertada e o pedido que a consertou.",
    },
  },

  /* ============================================================
     Referência — era TEORIA
     ============================================================ */
  {
    modulo: "Imagens que vendem",
    titulo: "Laboratório: use uma imagem como referência",
    tipo: TipoLicao.LABORATORIO,
    xp: 35,
    tempo: 20,
    cap: "Cap. 5.3",
    conteudo: {
      abrirAgora: ["chatgpt-imagens"],
      titulo: "Mostrar funciona melhor que descrever",
      contexto:
        "Descrever um estilo em palavras é impreciso — 'moderno e clean' significa coisas diferentes para cada pessoa, inclusive para a IA. Enviar uma imagem de referência resolve em um passo o que dez adjetivos não resolvem.",
      passos: [
        "Escolha uma imagem cujo visual você gostaria de repetir. Pode ser uma que você mesmo gerou e ficou boa.",
        "Anexe essa imagem e diga EXATAMENTE o que copiar dela: a luz, as cores, o enquadramento.",
        "Peça a mesma coisa com o SEU produto no lugar.",
        "Compare: o visual veio junto? Se veio genérico, você foi vago no que copiar.",
        "Repita com um segundo produto, usando a mesma referência.",
      ],
      promptSugerido: {
        titulo: "O pedido com referência",
        corpo:
          "Use a imagem anexada apenas como referência de [O_QUE_COPIAR].\nAssunto: [MEU_PRODUTO].\nMantenha a mesma iluminação, a mesma paleta de cores e o mesmo tipo de enquadramento da referência.\nRestrições: sem texto na imagem, sem marca de terceiros, sem copiar logotipo ou arte da referência — só o estilo.",
        variaveis: [
          {
            chave: "O_QUE_COPIAR",
            rotulo: "O que copiar da referência",
            exemplo: "iluminação e paleta de cores",
          },
          { chave: "MEU_PRODUTO", rotulo: "Seu produto", exemplo: "um pote de geleia artesanal" },
        ],
      },
      campos: [
        {
          chave: "referencia",
          rotulo: "Que imagem você usou como referência?",
          curto: true,
          exemplo: "A foto do mel que ficou boa no laboratório anterior",
        },
        {
          chave: "resultado",
          rotulo: "O visual veio junto? O que funcionou e o que não",
        },
      ],
      criterios: [
        "Você disse especificamente o que copiar, não 'faça parecida'",
        "O segundo produto saiu com o mesmo visual do primeiro",
        "Nada da referência foi copiado além do estilo",
      ],
      entrega: "Duas imagens que parecem da mesma marca.",
    },
  },

  /* ============================================================
     Consistência — era TEORIA
     ============================================================ */
  {
    modulo: "Imagens que vendem",
    titulo: "Laboratório: quatro imagens que parecem da mesma marca",
    tipo: TipoLicao.LABORATORIO,
    xp: 40,
    tempo: 25,
    cap: "Cap. 5.4",
    conteudo: {
      abrirAgora: ["chatgpt-imagens"],
      titulo: "O padrão visual do seu negócio, escrito e aplicado",
      contexto:
        "Dez imagens bonitas e diferentes entre si não formam uma marca. Quatro parecidas, sim. Vamos escrever o seu padrão em três linhas e gerar quatro imagens com ele.",
      passos: [
        "Escolha três coisas e escreva num papel: a paleta de cores, o tipo de luz e o tipo de fundo.",
        "Escolha quatro produtos ou serviços seus.",
        "Gere os quatro NO MESMO PEDIDO, colando as três linhas do padrão em cada um.",
        "Coloque os quatro lado a lado. Parecem do mesmo lugar?",
        "Se um destoar, ajuste só ele — mantendo as três linhas.",
      ],
      promptSugerido: {
        titulo: "O pedido do conjunto",
        corpo:
          "Gere 4 imagens, uma para cada item: [OS_QUATRO].\nTodas devem seguir o mesmo padrão:\n- Cores: [CORES]\n- Iluminação: [LUZ]\n- Fundo: [FUNDO]\nComposição: produto em primeiro plano, espaço vazio na parte superior para o texto entrar depois.\nFormato: quadrado.\nRestrições: sem texto na imagem, sem marca de terceiros, sem pessoas, sem exagero que não corresponda ao produto real.",
        variaveis: [
          { chave: "OS_QUATRO", rotulo: "Os quatro itens", exemplo: "brigadeiro, beijinho, cajuzinho e bem-casado" },
          { chave: "CORES", rotulo: "Sua paleta", exemplo: "tons quentes de marrom e creme" },
          { chave: "LUZ", rotulo: "Sua luz", exemplo: "natural lateral, sombra suave" },
          { chave: "FUNDO", rotulo: "Seu fundo", exemplo: "mármore branco" },
        ],
      },
      campos: [
        {
          chave: "padrao",
          rotulo: "O seu padrão, em três linhas",
          ajuda: "Cores, luz e fundo. Este é o texto que você vai colar em todo pedido de imagem daqui para a frente.",
          exemplo: "Cores: tons quentes\nLuz: natural lateral\nFundo: mármore branco",
        },
        {
          chave: "conjunto",
          rotulo: "Os quatro itens que você gerou",
          curto: true,
        },
        {
          chave: "avaliacao",
          rotulo: "Lado a lado, parecem da mesma marca? O que destoou?",
        },
      ],
      criterios: [
        "As três linhas do padrão estão escritas",
        "Os quatro foram gerados no mesmo pedido",
        "Lado a lado, parecem do mesmo lugar",
        "O padrão está salvo para reutilizar",
      ],
      entrega: "O padrão visual do seu negócio e quatro imagens que o seguem.",
    },
  },

  /* ============================================================
     Da foto ruim ao post publicado — o processo
     ============================================================ */
  {
    modulo: "Imagens que vendem",
    titulo: "Da foto no celular ao post publicado",
    tipo: TipoLicao.FLUXO,
    xp: 25,
    tempo: 12,
    cap: "Cap. 5.4",
    conteudo: {
      abrirAgora: ["chatgpt-imagens", "canva-negocios"],
      titulo: "O caminho inteiro, sem designer",
      introducao:
        "A imagem gerada não é o post. Falta o texto, o preço, a chamada — e é aí que muita gente para, com uma imagem bonita e nenhum post publicado.",
      gatilho: "Você quer divulgar um produto ou serviço",
      etapas: [
        {
          titulo: "Fotografe ou gere a imagem",
          detalhe: "Com o celular, ou pelo ChatGPT se o produto ainda não existe fisicamente.",
        },
        {
          titulo: "Corrija o que atrapalha",
          detalhe: "Fundo, luz, sombra. Um ajuste por vez, sem mudar o produto.",
        },
        {
          titulo: "Peça sem texto e com espaço vazio",
          detalhe: "Letra gerada por IA sai torta. O espaço vazio é onde o texto entra depois.",
        },
        {
          titulo: "Monte a peça no Canva",
          detalhe:
            "Dá para fazer pelo próprio ChatGPT: o app do Canva abre ali dentro. Ou no Canva direto, colando a imagem.",
        },
        {
          titulo: "Escreva o texto e o preço",
          detalhe: "Agora sim — em fonte de verdade, que dá para corrigir depois sem gerar imagem nova.",
        },
        {
          titulo: "Confira antes de publicar",
          detalhe: "Preço certo? Promessa que você cumpre? Produto igual ao que o cliente recebe?",
          revisaoHumana: true,
        },
        { titulo: "Publique", detalhe: "No formato do canal: quadrado para feed, vertical para story." },
      ],
      ondeParar:
        "A conferência antes de publicar. Preço errado num post circula e não volta — e produto embelezado além do real vira devolução.",
      ferramentas: ["ChatGPT Imagens", "Canva", "o celular que você já tem"],
      porQue:
        "Repare que a IA entra em dois pontos e sai. O resto é decisão sua: o que anunciar, por quanto, e se a imagem corresponde ao que o cliente vai receber.",
    },
  },

  /* ============================================================
     Canva dentro do ChatGPT — pesquisado em 20/09/2026
     ============================================================ */
  {
    modulo: "Imagens que vendem",
    titulo: "Laboratório: monte o post sem sair do ChatGPT",
    tipo: TipoLicao.LABORATORIO,
    xp: 35,
    tempo: 22,
    cap: "Cap. 5.4",
    conteudo: {
      abrirAgora: ["chatgpt-imagens", "canva-negocios"],
      titulo: "O app do Canva dentro da conversa",
      contexto:
        "O Canva tem um aplicativo que funciona dentro do ChatGPT. Você descreve a peça, ele mostra opções de design, e você abre para editar — sem trocar de aba e sem refazer o pedido.",
      passos: [
        "No ChatGPT, vá em Configurações → Apps e conectores → Canva e autorize a conexão.",
        "Na conversa, descreva a peça: 'quero um post para Instagram divulgando [produto], no estilo [estilo], para criar no Canva'.",
        "O ChatGPT mostra opções de design. Escolha uma e abra no Canva.",
        "Coloque o seu texto e o seu preço por cima.",
        "Baixe no formato do canal onde vai publicar.",
      ],
      promptSugerido: {
        titulo: "O pedido da peça",
        corpo:
          "Crie no Canva um post para [CANAL] divulgando [PRODUTO].\nPúblico: [PUBLICO].\nEstilo: [ESTILO], com espaço claro para o preço e a chamada.\nRestrições: sem promessa de desconto que eu não confirmei; deixe o texto editável para eu ajustar.",
        variaveis: [
          { chave: "CANAL", rotulo: "Onde publicar", exemplo: "Instagram, formato quadrado" },
          { chave: "PRODUTO", rotulo: "O que divulgar", exemplo: "café da tarde com bolo caseiro" },
          { chave: "PUBLICO", rotulo: "Para quem", exemplo: "quem trabalha no bairro" },
          { chave: "ESTILO", rotulo: "Estilo", exemplo: "aconchegante, tons quentes" },
        ],
      },
      campos: [
        { chave: "peca", rotulo: "Que peça você montou?", curto: true, exemplo: "Post de café da tarde" },
        {
          chave: "dificuldade",
          rotulo: "O que foi mais difícil, e como resolveu",
        },
      ],
      criterios: [
        "A peça tem o seu texto e o seu preço",
        "Nada foi prometido que você não cumpre",
        "O arquivo está baixado no formato certo",
      ],
      entrega: "Um post pronto para publicar hoje.",
      atencao:
        "O app do Canva no ChatGPT está disponível nos planos Free, Plus e Pro, fora da União Europeia. Recursos pagos do Canva, como Magic Resize e Brand Kit, ainda não funcionam por ali. Conferido em 20/09/2026.",
    },
  },
];
