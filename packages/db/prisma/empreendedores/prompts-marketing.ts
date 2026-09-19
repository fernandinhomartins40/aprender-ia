import type { PromptEmpreendedor } from "./prompts";

/**
 * Marketing, Redes sociais, Imagens e Vídeos — o que se mostra.
 *
 * Os prompts de imagem seguem a estrutura de oito partes do Módulo 5
 * (assunto, ambiente, composição, iluminação, estilo, cores, formato,
 * restrições) e quase todos proíbem texto na imagem: letra gerada por IA
 * sai torta, e o texto entra depois no Canva.
 */

const v = (chave: string, rotulo: string, exemplo: string) => ({ chave, rotulo, exemplo });

export const PROMPTS_MARKETING: PromptEmpreendedor[] = [
  /* ---------------- MARKETING ---------------- */
  {
    titulo: "Encontrar o que falar quando não há novidade",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e não tenho novidade para anunciar esta semana.\nObjetivo: assuntos para publicar mesmo sem lançamento.\nFormato: 10 ideias em quatro grupos — bastidor, dúvida de cliente, prova do trabalho e opinião do ramo. Cada uma com a primeira frase pronta.\nRestrições: nada que exija produção elaborada; tudo tem de sair do que já acontece no dia a dia.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "A maioria trava por achar que só se publica novidade. Bastidor e dúvida de cliente rendem o ano inteiro.",
    exemploPreenchido: "Contexto: meu negócio é uma serralheria e não tenho novidade esta semana.",
    variaveis: [v("NEGOCIO", "Seu negócio", "serralheria")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["pauta", "conteúdo", "redes sociais"],
  },
  {
    titulo: "Campanha para uma data específica",
    corpo:
      "Contexto: meu negócio é [NEGOCIO] e quero aproveitar [DATA].\nObjetivo: uma campanha que eu consiga executar.\nFormato: a ideia central, o que anunciar, três peças com texto pronto, e o que preparar antes (estoque, equipe, horário).\nRestrições: nada de promessa de desconto que eu não confirmei; nada que exija mais gente do que eu tenho.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "O 'o que preparar antes' é o que separa campanha de correria. Estoque e equipe primeiro, anúncio depois.",
    exemploPreenchido: "Contexto: meu negócio é uma floricultura e quero aproveitar o Dia das Mães.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "floricultura"),
      v("DATA", "A data", "Dia das Mães"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["campanha", "sazonalidade"],
  },
  {
    titulo: "Transformar cliente satisfeito em prova",
    corpo:
      "Contexto: um cliente elogiou assim: [ELOGIO]. Ele autorizou o uso.\nObjetivo: transformar em material de divulgação.\nFormato: um texto curto para post, uma versão para o site e uma sugestão do que mostrar na imagem.\nRestrições: não invente nada além do que ele disse; não use nome completo nem foto sem autorização explícita; não corrija o jeito dele falar a ponto de descaracterizar.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Depoimento real convence mais que texto publicitário justamente por não parecer publicidade. Não limpe demais.",
    exemploPreenchido:
      "Contexto: uma cliente escreveu 'chegou no dia certo, embalado com capricho, e minha mãe chorou'. Ela autorizou.",
    variaveis: [v("ELOGIO", "O que o cliente disse", "cole o texto")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["depoimento", "prova social"],
  },
  {
    titulo: "Texto para o perfil do negócio",
    corpo:
      "Contexto: meu negócio é [NEGOCIO], fica em [LUGAR], atende [PUBLICO] e o diferencial é [DIFERENCIAL].\nObjetivo: a descrição do perfil.\nFormato: três versões em até 150 caracteres, cada uma com um foco diferente, e a chamada de ação final.\nRestrições: nada de emoji em excesso; que fique claro o que eu vendo e onde encontrar.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Muita gente descreve o que sente pelo negócio em vez do que vende. Quem chega precisa entender em três segundos.",
    exemploPreenchido:
      "Contexto: meu negócio é uma barbearia, fica no centro, atende homens de 25 a 50 anos, e o diferencial é atender com hora marcada.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "barbearia"),
      v("LUGAR", "Onde fica", "centro da cidade"),
      v("PUBLICO", "Público", "homens de 25 a 50"),
      v("DIFERENCIAL", "Diferencial", "hora marcada"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["bio", "perfil", "instagram"],
  },
  {
    titulo: "Adaptar o mesmo conteúdo para cada canal",
    corpo:
      "Contexto: escrevi isto: [TEXTO]. Quero publicar em [CANAIS].\nObjetivo: adaptar para cada canal sem reescrever do zero.\nFormato: uma versão por canal, respeitando o tamanho e o jeito de cada um.\nRestrições: mantenha a informação idêntica; mude só o formato e o tom. Nada de hashtag genérica.",
    categoria: "Redes sociais",
    setor: "Marketing",
    dica:
      "Escreva uma vez, adapte várias. É o caminho mais curto para manter presença em mais de um canal.",
    exemploPreenchido:
      "Contexto: escrevi um texto sobre a nova linha de pães sem glúten. Quero publicar no Instagram, no WhatsApp e no Google Meu Negócio.",
    variaveis: [
      v("TEXTO", "Seu texto", "cole aqui"),
      v("CANAIS", "Onde publicar", "Instagram, WhatsApp, Google"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["canais", "adaptação"],
  },
  {
    titulo: "Post que responde a uma objeção",
    corpo:
      "Contexto: meus clientes costumam dizer [OBJECAO] antes de comprar [OFERTA].\nObjetivo: um post que responda isso antes de a pessoa perguntar.\nFormato: primeira frase que prende, a objeção nomeada, a resposta com um fato concreto e a chamada final.\nRestrições: não seja defensivo; reconheça o que a objeção tem de legítimo antes de responder.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Reconhecer a parte legítima da objeção é o que faz a resposta soar honesta e não publicitária.",
    exemploPreenchido:
      "Contexto: meus clientes dizem 'vou esperar a promoção' antes de comprar móveis planejados.",
    variaveis: [
      v("OBJECAO", "A objeção", "vou esperar a promoção"),
      v("OFERTA", "O que você vende", "móveis planejados"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["objeção", "conteúdo"],
  },
  {
    titulo: "Reaproveitar um conteúdo que funcionou",
    corpo:
      "Contexto: este conteúdo teve bom resultado: [CONTEUDO]. O que funcionou, na minha leitura: [POR_QUE].\nObjetivo: extrair mais dele.\nFormato: cinco desdobramentos — mesmo tema por outro ângulo, versão mais curta, versão mais longa, formato diferente e continuação.\nRestrições: nada de repetir igual; cada desdobramento precisa acrescentar algo.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Conteúdo que funcionou merece cinco filhos. É mais barato desdobrar o que deu certo do que inventar de novo.",
    exemploPreenchido:
      "Contexto: o post mostrando o antes e depois de um sofá reformado teve muito alcance.",
    variaveis: [
      v("CONTEUDO", "O conteúdo", "descreva ou cole"),
      v("POR_QUE", "Por que funcionou", "as pessoas gostam de transformação"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["reaproveitamento", "conteúdo"],
  },
  {
    titulo: "E-mail ou mensagem para a lista de clientes",
    corpo:
      "Contexto: tenho uma lista de clientes do meu [NEGOCIO] e quero avisar sobre [ASSUNTO].\nObjetivo: uma mensagem que as pessoas leiam até o fim.\nFormato: assunto, abertura de duas linhas, o recado, e uma única chamada de ação.\nRestrições: uma chamada só; nada de urgência inventada; inclua como sair da lista.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Uma chamada de ação por mensagem. Duas opções fazem a pessoa não escolher nenhuma.",
    exemploPreenchido:
      "Contexto: tenho lista de clientes da minha loja de tintas e quero avisar da mudança de endereço.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "loja de tintas"),
      v("ASSUNTO", "O assunto", "mudança de endereço"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["e-mail", "lista", "aviso"],
  },
  {
    titulo: "Entender por que um conteúdo não funcionou",
    corpo:
      "Contexto: publiquei isto e não teve retorno: [CONTEUDO]. Meu público é [PUBLICO].\nObjetivo: entender o que pode ter falhado.\nFormato: análise da primeira frase, da clareza da oferta, do encaixe com o público e da chamada final. Depois, uma versão reescrita.\nRestrições: seja franco; se o problema for o conteúdo não interessar a ninguém, diga.",
    categoria: "Marketing",
    setor: "Marketing",
    dica:
      "Pedir franqueza explicitamente muda a resposta. Sem isso, a IA tende a elogiar e sugerir ajustes cosméticos.",
    exemploPreenchido:
      "Contexto: publiquei um post institucional sobre os 10 anos da empresa e ninguém interagiu.",
    variaveis: [
      v("CONTEUDO", "O conteúdo", "cole aqui"),
      v("PUBLICO", "Seu público", "donos de pequenos comércios"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["análise", "conteúdo"],
  },
  {
    titulo: "Calendário de conteúdo para um mês",
    corpo:
      "Contexto: meu negócio é [NEGOCIO], publico em [CANAL] e consigo produzir [FREQUENCIA].\nObjetivo: um mês de conteúdo planejado.\nFormato: tabela por semana, com tema, formato, objetivo e o que preparar. Inclua uma semana de folga para imprevisto.\nRestrições: respeite minha frequência real — nada de plano diário se eu só consigo publicar duas vezes por semana.",
    categoria: "Redes sociais",
    setor: "Marketing",
    dica:
      "A semana de folga não é preguiça: é o que faz o plano sobreviver ao primeiro imprevisto.",
    exemploPreenchido:
      "Contexto: meu negócio é um estúdio de pilates, publico no Instagram e consigo produzir duas vezes por semana.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "estúdio de pilates"),
      v("CANAL", "Canal", "Instagram"),
      v("FREQUENCIA", "Frequência real", "2 posts por semana"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["calendário", "planejamento"],
  },

  /* ---------------- IMAGENS ---------------- */
  {
    titulo: "Imagem para post de rede social",
    corpo:
      "Assunto: [ASSUNTO].\nAmbiente: [AMBIENTE].\nComposição: espaço vazio na parte superior para o texto entrar depois.\nIluminação: [LUZ].\nEstilo: [ESTILO].\nCores: [CORES].\nFormato: quadrado, alta resolução.\nRestrições: sem texto na imagem, sem marca de terceiros, sem elementos cortados na borda.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "Peça o espaço vazio para o texto já na composição. Sem isso, você gera uma imagem bonita e sem onde escrever.",
    exemploPreenchido:
      "Assunto: uma mesa posta com café da manhã completo, visto de cima.\nAmbiente: mesa de madeira clara perto da janela.\nIluminação: luz da manhã, suave.",
    variaveis: [
      v("ASSUNTO", "O que aparece", "mesa de café da manhã"),
      v("AMBIENTE", "Onde", "mesa de madeira clara"),
      v("LUZ", "Iluminação", "luz da manhã"),
      v("ESTILO", "Estilo", "fotografia realista"),
      v("CORES", "Cores", "tons claros e quentes"),
    ],
    ferramentasSugeridas: ["chatgpt-imagens"],
    nivelDificuldade: "Inicial",
    tags: ["post", "imagem", "instagram"],
  },
  {
    titulo: "Imagem de fundo para cardápio ou tabela de preços",
    corpo:
      "Assunto: fundo decorativo para [MATERIAL] de [NEGOCIO].\nComposição: os elementos nas bordas, centro limpo para o texto.\nIluminação: uniforme, sem sombra forte.\nEstilo: [ESTILO].\nCores: [CORES], em tom suave para não competir com o texto.\nFormato: [FORMATO].\nRestrições: sem texto, sem elementos no centro, nada com contraste alto que atrapalhe a leitura por cima.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "Fundo tem de ser discreto. Se a imagem é bonita demais, o preço não é lido — e o cardápio existe para isso.",
    exemploPreenchido:
      "Assunto: fundo decorativo para cardápio de cafeteria, com grãos e folhas nas bordas.\nCores: tons de marrom e creme.",
    variaveis: [
      v("MATERIAL", "Que material", "cardápio"),
      v("NEGOCIO", "Seu negócio", "cafeteria"),
      v("ESTILO", "Estilo", "aquarela discreta"),
      v("CORES", "Cores", "marrom e creme"),
      v("FORMATO", "Formato", "retrato A4"),
    ],
    ferramentasSugeridas: ["chatgpt-imagens", "canva-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["cardápio", "fundo", "impresso"],
  },
  {
    titulo: "Melhorar uma foto que eu mesmo tirei",
    corpo:
      "Contexto: vou enviar uma foto que tirei com o celular de [O_QUE].\nObjetivo: deixá-la utilizável para divulgação.\nFormato: descreva o que melhorar — iluminação, fundo, enquadramento — e gere a versão ajustada.\nRestrições: não mude o produto em si: cor, formato e proporção têm de continuar fiéis ao real. O cliente vai receber o que está na foto.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "Esta restrição é a mais importante do curso em imagens: produto embelezado além do real vira reclamação na entrega.",
    exemploPreenchido:
      "Contexto: vou enviar a foto que tirei de um bolo decorado, com fundo bagunçado da cozinha.",
    variaveis: [v("O_QUE", "O que está na foto", "bolo decorado")],
    ferramentasSugeridas: ["chatgpt-imagens"],
    nivelDificuldade: "Intermediário",
    tags: ["edição", "foto", "honestidade"],
  },
  {
    titulo: "Mockup do produto em uso",
    corpo:
      "Assunto: [PRODUTO] sendo usado em situação real de [CONTEXTO].\nAmbiente: [AMBIENTE].\nComposição: o produto em destaque, a pessoa em segundo plano e sem rosto identificável.\nIluminação: natural.\nEstilo: fotografia realista de estilo de vida.\nCores: [CORES].\nFormato: [FORMATO].\nRestrições: sem rosto reconhecível, sem texto, sem marca de terceiros, sem exagero que não corresponda ao produto real.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "Pedir sem rosto identificável evita dois problemas: a imagem estranha que a IA às vezes gera e a questão de direito de imagem.",
    exemploPreenchido:
      "Assunto: uma mochila sendo usada em situação real de caminhada urbana.\nAmbiente: calçada arborizada no fim da tarde.",
    variaveis: [
      v("PRODUTO", "O produto", "mochila"),
      v("CONTEXTO", "Situação de uso", "caminhada urbana"),
      v("AMBIENTE", "Ambiente", "calçada arborizada"),
      v("CORES", "Cores", "tons naturais"),
      v("FORMATO", "Formato", "vertical"),
    ],
    ferramentasSugeridas: ["chatgpt-imagens"],
    nivelDificuldade: "Intermediário",
    tags: ["mockup", "estilo de vida"],
  },
  {
    titulo: "Conjunto de ícones para o meu serviço",
    corpo:
      "Assunto: [QUANTOS] ícones representando [TEMAS].\nEstilo: linha simples, espessura uniforme, sem preenchimento.\nCores: traço em [COR] sobre fundo transparente.\nFormato: quadrado, PNG.\nRestrições: todos no mesmo estilo e peso de traço; sem texto; sem detalhe pequeno demais para ver em tamanho reduzido.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "O 'mesmo peso de traço' é o que faz o conjunto parecer conjunto. Gere todos de uma vez, não um por um.",
    exemploPreenchido:
      "Assunto: 4 ícones representando entrega, montagem, garantia e suporte.\nCores: traço em azul-escuro sobre fundo transparente.",
    variaveis: [
      v("QUANTOS", "Quantos", "4"),
      v("TEMAS", "Os temas", "entrega, montagem, garantia, suporte"),
      v("COR", "Cor do traço", "azul-escuro"),
    ],
    ferramentasSugeridas: ["chatgpt-imagens"],
    nivelDificuldade: "Avançado",
    tags: ["ícones", "identidade visual"],
  },
  {
    titulo: "Corrigir o que saiu errado na imagem",
    corpo:
      "Contexto: gerei uma imagem e ficou quase boa. O que está errado: [PROBLEMA].\nObjetivo: corrigir só isso.\nFormato: gere de novo mantendo tudo igual e mudando apenas o que apontei.\nRestrições: não altere composição, cores nem iluminação. Se não der para corrigir sem mudar o resto, diga.",
    categoria: "Imagens",
    setor: "Marketing",
    dica:
      "Corrija uma coisa por vez. Quem pede três ajustes juntos recebe uma imagem diferente, não uma imagem corrigida.",
    exemploPreenchido:
      "Contexto: gerei a foto do produto e ficou boa, mas a sombra embaixo está dura demais.",
    variaveis: [v("PROBLEMA", "O que está errado", "sombra dura demais")],
    ferramentasSugeridas: ["chatgpt-imagens"],
    nivelDificuldade: "Intermediário",
    tags: ["ajuste", "iteração"],
  },

  /* ---------------- VÍDEOS ---------------- */
  {
    titulo: "Primeira frase que segura o vídeo",
    corpo:
      "Contexto: meu vídeo é sobre [ASSUNTO] e meu público é [PUBLICO].\nObjetivo: a primeira frase, que decide se a pessoa fica.\nFormato: 8 opções — pergunta, número, erro comum, contradição, cena, promessa, bastidor e história.\nRestrições: no máximo 12 palavras cada; nada de 'você sabia que'; nada que não se cumpra no resto do vídeo.",
    categoria: "Vídeos",
    setor: "Marketing",
    dica:
      "Os três primeiros segundos decidem o resto. Vale gastar mais tempo na primeira frase que no vídeo inteiro.",
    exemploPreenchido:
      "Contexto: meu vídeo é sobre o erro de lavar o carro no sol e meu público é dono de carro.",
    variaveis: [
      v("ASSUNTO", "Assunto", "erro de lavar carro no sol"),
      v("PUBLICO", "Público", "donos de carro"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["gancho", "vídeo", "retenção"],
  },
  {
    titulo: "Storyboard: o que aparece em cada segundo",
    corpo:
      "Contexto: tenho este roteiro: [ROTEIRO]. O vídeo terá [DURACAO].\nObjetivo: saber o que filmar ou gerar em cada trecho.\nFormato: tabela com tempo, o que aparece, o que se fala e o texto na tela.\nRestrições: nada que exija equipamento além de celular; no máximo uma troca de cena a cada 3 segundos.",
    categoria: "Vídeos",
    setor: "Marketing",
    dica:
      "Storyboard antes de gravar economiza o dobro do tempo em edição. Vale mesmo para vídeo de 30 segundos.",
    exemploPreenchido:
      "Contexto: roteiro sobre como escolher o colchão certo. O vídeo terá 45 segundos.",
    variaveis: [
      v("ROTEIRO", "Seu roteiro", "cole aqui"),
      v("DURACAO", "Duração", "45 segundos"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["storyboard", "produção"],
  },
  {
    titulo: "Legendas para quem assiste sem som",
    corpo:
      "Contexto: este é o texto falado no meu vídeo: [FALA].\nObjetivo: legendas que funcionem sozinhas.\nFormato: blocos de no máximo 6 palavras, com a marcação de tempo aproximada.\nRestrições: não resuma — legenda é o que foi dito; quebre as frases em pontos naturais de respiração.",
    categoria: "Vídeos",
    setor: "Marketing",
    dica:
      "A maioria assiste sem som. Vídeo sem legenda perde essa maioria antes do terceiro segundo.",
    exemploPreenchido:
      "Contexto: texto falado explicando as três formas de pagamento da loja.",
    variaveis: [v("FALA", "O que é falado", "cole o texto")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["legenda", "acessibilidade"],
  },
  {
    titulo: "Roteiro de depoimento de cliente",
    corpo:
      "Contexto: um cliente do meu [NEGOCIO] topou gravar um depoimento sobre [EXPERIENCIA].\nObjetivo: perguntas que gerem um depoimento natural.\nFormato: 5 perguntas na ordem, do aquecimento ao que mais importa, com o que evitar dizer antes de cada uma.\nRestrições: nada de pedir para elogiar; nada de texto decorado. Perguntas que ele responda com o que viveu.",
    categoria: "Vídeos",
    setor: "Marketing",
    dica:
      "Depoimento decorado se reconhece de longe. Pergunte sobre a experiência e deixe o elogio aparecer sozinho.",
    exemploPreenchido:
      "Contexto: um cliente da minha assistência técnica topou gravar sobre o conserto de um notebook que outros recusaram.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "assistência técnica"),
      v("EXPERIENCIA", "A experiência", "conserto que outros recusaram"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["depoimento", "vídeo", "prova social"],
  },
  {
    titulo: "Vídeo de demonstração do produto",
    corpo:
      "Contexto: quero demonstrar [PRODUTO], cujo diferencial é [DIFERENCIAL].\nObjetivo: um roteiro que mostre em vez de contar.\nFormato: a cena de abertura sem palavra nenhuma, a demonstração passo a passo e o fechamento com o que fazer agora.\nRestrições: mostre o produto funcionando de verdade; nada de efeito que sugira resultado diferente do real.",
    categoria: "Vídeos",
    setor: "Marketing",
    dica:
      "Abrir mostrando o produto funcionando, sem narração, é o que prende. Explicação vem depois.",
    exemploPreenchido:
      "Contexto: quero demonstrar um limpador multiuso cujo diferencial é tirar gordura sem esfregar.",
    variaveis: [
      v("PRODUTO", "O produto", "limpador multiuso"),
      v("DIFERENCIAL", "O diferencial", "tira gordura sem esfregar"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "veo"],
    nivelDificuldade: "Intermediário",
    tags: ["demonstração", "produto"],
  },
];
