/**
 * Catálogo das seções da landing page.
 *
 * As seções são FIXAS: cada chave corresponde a um bloco que o código sabe
 * desenhar, e o painel edita textos, itens, ordem e visibilidade — não cria
 * layout. Escolha deliberada: um construtor de páginas livre permitiria
 * quebrar o desenho, e o que o projeto precisa é trocar palavras sem deploy.
 *
 * Os valores aqui são o conteúdo atual da página e servem de fallback: sem
 * nada salvo no banco (ou com a migration pendente), a landing aparece
 * completa. A porta de entrada do projeto nunca fica em branco.
 *
 * Vive em `lib/` porque um módulo "use server" só exporta funções async.
 */

export type ItemPadrao = {
  titulo: string;
  texto?: string;
  extra?: string;
  icone?: string;
  cor?: string;
  selo?: string;
  imagem?: string;
  link?: string;
};

export type SecaoPadrao = {
  chave: string;
  rotulo: string;
  /// O que o administrador precisa saber antes de editar.
  ajuda: string;
  ordem: number;
  titulo?: string;
  subtitulo?: string;
  texto?: string;
  selo?: string;
  ctaTexto?: string;
  ctaLink?: string;
  cta2Texto?: string;
  cta2Link?: string;
  imagem?: string;
  /// Quais campos a tela mostra — nem toda seção usa todos.
  campos: ("selo" | "titulo" | "subtitulo" | "texto" | "cta" | "cta2" | "imagem" | "video")[];
  /// Rótulo da lista, quando a seção tem itens. Ausente = sem lista.
  listaRotulo?: string;
  /// Quais campos de item aparecem na tela.
  camposItem?: ("texto" | "extra" | "icone" | "cor" | "selo" | "link" | "imagem")[];
  itens?: ItemPadrao[];
};

export const SECOES: SecaoPadrao[] = [
  {
    chave: "hero",
    rotulo: "Capa (primeira dobra)",
    ajuda:
      "O que a pessoa lê nos primeiros três segundos. No título, cada quebra de linha vira uma quebra na página; a última linha sai em destaque azul.",
    ordem: 1,
    // Sem campo de imagem: a capa é montada em camadas no código (um fundo
    // por faixa de tela + o mascote em PNG transparente), então não existe
    // uma arte única para trocar pelo painel. Oferecer o campo daria a
    // impressão de que trocá-lo mudaria a capa, e não mudaria.
    campos: ["selo", "titulo", "subtitulo", "cta", "cta2"],
    selo: "Plataforma Aprender IA",
    titulo: "Aprenda. Pratique.\nEvolua com IA.",
    subtitulo:
      "A plataforma completa para você aprender, aplicar e se atualizar em Inteligência Artificial, com cursos gratuitos e pagos, ferramentas, materiais práticos e uma comunidade que acelera o seu desenvolvimento.",
    ctaTexto: "Criar minha conta gratuita",
    ctaLink: "/cadastro",
    cta2Texto: "Conheça os cursos",
    cta2Link: "#trilhas",
    listaRotulo: "Selos abaixo dos botões",
    camposItem: ["icone", "cor"],
    itens: [
      { titulo: "Conteúdo para todos os níveis", icone: "check", cor: "#10B981" },
      { titulo: "Comunidade ativa de educadores", icone: "pessoas", cor: "#6366F1" },
      { titulo: "Ferramentas e materiais gratuitos", icone: "infinito", cor: "#F59E0B" },
    ],
  },
  {
    chave: "publico",
    rotulo: "Para quem é a plataforma",
    ajuda:
      "Os quatro perfis de público, cada um com sua foto e cor de fundo. É onde a pessoa se reconhece.",
    ordem: 2,
    campos: ["selo", "titulo", "subtitulo"],
    selo: "APRENDER IA É PARA TODOS",
    titulo: "Para quem é a plataforma?",
    subtitulo:
      "Seja você educador, estudante, profissional ou apenas curioso, aqui você encontra conteúdos práticos e acessíveis para usar a IA no seu dia a dia.",
    listaRotulo: "Perfis",
    camposItem: ["texto", "cor", "imagem"],
    itens: [
      {
        titulo: "Educadores",
        texto:
          "Planeje aulas incríveis, economize tempo e transforme a sua prática pedagógica.",
        cor: "#EFF6FF",
        imagem: "/landing/publico-educadores.webp",
      },
      {
        titulo: "Estudantes",
        texto: "Descubra novas formas de aprender e potencialize seus estudos.",
        cor: "#ECFDF5",
        imagem: "/landing/publico-estudantes.webp",
      },
      {
        titulo: "Profissionais",
        texto: "Aumente sua produtividade e destaque-se no mercado de trabalho.",
        cor: "#FEF3C7",
        imagem: "/landing/publico-profissionais.webp",
      },
      {
        titulo: "Curiosos",
        texto: "Explore o mundo da IA de forma simples, prática e descomplicada.",
        cor: "#FDF2F8",
        imagem: "/landing/publico-curiosos.webp",
      },
    ],
  },
  {
    chave: "plataforma",
    rotulo: "Faixa roxa (mais que cursos)",
    ajuda:
      "A faixa escura com o robô à esquerda e quatro pilares à direita. Serve para dizer que a plataforma é mais do que uma lista de aulas.",
    ordem: 3,
    campos: ["titulo", "texto", "imagem"],
    titulo: "Muito mais que cursos.\nUma plataforma completa.",
    texto:
      "No Aprender IA você encontra cursos, ferramentas, materiais, desafios práticos e uma comunidade engajada para aprender e aplicar a Inteligência Artificial de verdade.",
    imagem: "/landing/robo-notebook.webp",
    listaRotulo: "Pilares",
    camposItem: ["icone", "cor"],
    itens: [
      { titulo: "Cursos gratuitos e pagos", icone: "capelo", cor: "#6366F1" },
      { titulo: "Ferramentas de IA selecionadas", icone: "engrenagem", cor: "#2563EB" },
      { titulo: "Materiais e templates prontos", icone: "documento", cor: "#10B981" },
      { titulo: "Comunidade e suporte", icone: "pessoas", cor: "#F97316" },
    ],
  },
  {
    chave: "trilhas",
    rotulo: "Trilhas de aprendizado",
    ajuda:
      "Os caminhos de estudo. Cada trilha tem cor própria, que pinta o ícone e o fundo do cartão. O link leva para o curso correspondente.",
    ordem: 4,
    campos: ["selo", "titulo", "subtitulo", "cta"],
    selo: "TRILHAS DE APRENDIZADO",
    titulo: "Comece a aprender hoje",
    subtitulo:
      "Escolha sua trilha e desenvolva novas habilidades com o apoio da nossa plataforma.",
    ctaTexto: "Ver todos os cursos",
    ctaLink: "/cadastro",
    listaRotulo: "Trilhas",
    camposItem: ["texto", "icone", "cor", "link"],
    itens: [
      {
        titulo: "IA na Educação",
        texto: "Do planejamento à avaliação, com IA na prática.",
        icone: "livro",
        cor: "#2563EB",
        link: "/cadastro",
      },
      {
        titulo: "Produtividade",
        texto: "Faça mais em menos tempo com IA.",
        icone: "foguete",
        cor: "#7C3AED",
        link: "/cadastro",
      },
      {
        titulo: "Criação de Conteúdo",
        texto: "Textos, imagens, vídeos e apresentações.",
        icone: "lapis",
        cor: "#10B981",
        link: "/cadastro",
      },
      {
        titulo: "Carreira e Negócios",
        texto: "IA para o seu desenvolvimento profissional.",
        icone: "maleta",
        cor: "#F97316",
        link: "/cadastro",
      },
      {
        titulo: "Explorando a IA",
        texto: "Primeiros passos para curiosos e iniciantes.",
        icone: "lampada",
        cor: "#EC4899",
        link: "/cadastro",
      },
    ],
  },
  {
    chave: "numeros",
    rotulo: "Números da plataforma",
    ajuda:
      "A faixa de indicadores. São números que você declara aqui — não são calculados do banco. Mantenha-os verdadeiros.",
    ordem: 5,
    campos: ["texto"],
    texto: "Juntos por um futuro mais inteligente!",
    listaRotulo: "Indicadores",
    camposItem: ["texto", "icone", "cor"],
    itens: [
      { titulo: "+50 mil", texto: "pessoas na comunidade", icone: "pessoas", cor: "#6366F1" },
      { titulo: "+200", texto: "aulas e tutoriais", icone: "livro", cor: "#2563EB" },
      { titulo: "4,9", texto: "avaliação média", icone: "coracao", cor: "#EC4899" },
      { titulo: "Conteúdo sempre atualizado", texto: "", icone: "estrela", cor: "#EAB308" },
    ],
  },
  {
    chave: "planos",
    rotulo: "Planos",
    ajuda:
      'Os planos vêm da tela "Planos" — aqui você edita só o título e o texto de apoio. Sem plano público cadastrado, a seção não aparece.',
    ordem: 6,
    campos: ["titulo", "subtitulo", "texto"],
    titulo: "Escolha como estudar",
    subtitulo: "Comece de graça. Se fizer sentido, siga com acesso completo.",
    texto: "",
  },
  {
    chave: "depoimentos",
    rotulo: "Depoimentos",
    ajuda:
      "Fica escondida enquanto não houver depoimento cadastrado — uma seção vazia é pior que seção nenhuma. Em cada item: título é o nome, extra é a escola ou cargo.",
    ordem: 7,
    campos: ["titulo", "subtitulo"],
    titulo: "Quem já passou por aqui",
    listaRotulo: "Depoimentos",
    camposItem: ["texto", "extra", "imagem"],
    itens: [],
  },
  {
    chave: "faq",
    rotulo: "Perguntas frequentes",
    ajuda:
      "Em cada item, o título é a pergunta e o texto é a resposta. Fica escondida sem perguntas cadastradas.",
    ordem: 8,
    campos: ["titulo", "subtitulo"],
    titulo: "Perguntas frequentes",
    listaRotulo: "Perguntas",
    camposItem: ["texto"],
    itens: [
      {
        titulo: "Preciso saber de tecnologia para acompanhar?",
        texto:
          "Não. A plataforma parte do zero e usa linguagem do dia a dia, sem jargão técnico.",
      },
      {
        titulo: "As ferramentas são realmente gratuitas?",
        texto:
          "Sim. Todas as ferramentas indicadas têm versão gratuita, e dizemos com clareza os limites de cada uma.",
      },
      {
        titulo: "Vou receber certificado?",
        texto:
          "Sim, ao concluir a trilha completa você recebe o certificado pela plataforma.",
      },
    ],
  },
  {
    chave: "chamada_final",
    rotulo: "Chamada final",
    ajuda: "A faixa colorida com o robô, logo antes do rodapé.",
    ordem: 9,
    campos: ["titulo", "subtitulo", "texto", "cta", "imagem"],
    titulo: "Seu próximo passo\ncomeça aqui.",
    subtitulo:
      "Crie sua conta gratuita, explore os conteúdos e faça parte da comunidade Aprender IA.",
    ctaTexto: "Criar minha conta gratuita",
    ctaLink: "/cadastro",
    texto: "Sem cartão de crédito. Comece em menos de 1 minuto.",
    imagem: "/landing/robo-comemorando.webp",
  },
  {
    chave: "rodape",
    rotulo: "Rodapé",
    ajuda: "A linha de descrição embaixo da marca e os links de redes sociais.",
    ordem: 10,
    campos: ["titulo", "texto"],
    titulo: "Aprender IA",
    texto: "Inteligência Artificial para um futuro com mais oportunidades.",
    listaRotulo: "Redes sociais",
    camposItem: ["icone", "link"],
    // O ícone aqui é a marca da rede, desenhada em SVG no componente:
    // logo de terceiro não se redesenha no nosso estilo 3D, e no rodapé
    // ela funciona melhor monocromática. Sem link, a rede não aparece.
    itens: [
      { titulo: "YouTube", icone: "youtube", link: "" },
      { titulo: "Instagram", icone: "instagram", link: "" },
      { titulo: "LinkedIn", icone: "linkedin", link: "" },
      { titulo: "Discord", icone: "discord", link: "" },
    ],
  },
];

export const SECAO_POR_CHAVE = new Map(SECOES.map((s) => [s.chave, s]));

/**
 * Menu do topo da landing.
 *
 * Fica no código e não no banco: são âncoras e rotas que precisam existir
 * de verdade, então deixá-las editáveis por texto livre convidaria a links
 * quebrados na porta de entrada do site.
 */
export const MENU_TOPO: { rotulo: string; href: string }[] = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Cursos", href: "#trilhas" },
  { rotulo: "Ferramentas", href: "#plataforma" },
  { rotulo: "Comunidade", href: "#numeros" },
  { rotulo: "Sobre", href: "#publico" },
];
