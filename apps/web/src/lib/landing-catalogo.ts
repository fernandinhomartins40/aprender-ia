/**
 * Catálogo das seções da landing page.
 *
 * As seções são FIXAS: cada chave corresponde a um bloco que o código sabe
 * desenhar, e o painel edita textos, ordem e visibilidade — não cria
 * layout. Isso é escolha, não limitação de tempo: um construtor de páginas
 * livre permitiria quebrar o desenho da página, e o que o projeto precisa
 * é trocar palavras sem deploy.
 *
 * Os valores aqui são o conteúdo atual da página e servem de fallback: se
 * o banco não tiver nada salvo (ou a migration não tiver rodado), a landing
 * aparece exatamente como hoje. Nunca uma página em branco.
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
      "É o que a pessoa lê nos primeiros três segundos. Use quebra de linha no título para controlar onde ele parte.",
    ordem: 1,
    campos: ["selo", "titulo", "subtitulo", "cta", "cta2", "texto"],
    selo: "Formação de 40 horas · Rede pública",
    titulo: "Menos burocracia.\nAulas melhores.\nSeu fim de semana de volta.",
    subtitulo:
      "Uma trilha prática para você usar Inteligência Artificial na rotina escolar — com ferramentas 100% gratuitas, sem jargão técnico e sem precisar de cartão de crédito.",
    ctaTexto: "Criar minha conta gratuita",
    ctaLink: "/cadastro",
    cta2Texto: "Ver como funciona",
    cta2Link: "#trilha",
    texto: "Gratuito para professores da rede pública · Sem cartão de crédito",
  },
  {
    chave: "dor",
    rotulo: "O problema (ladrões de tempo)",
    ajuda:
      "Os quatro cartões do que consome o tempo do professor. O texto final é a faixa destacada abaixo deles.",
    ordem: 2,
    campos: ["titulo", "subtitulo", "texto"],
    titulo: "Onde foi parar o seu tempo?",
    subtitulo:
      "Você foi formado para ensinar, inspirar e transformar vidas. Mas boa parte das suas horas vai para outra coisa.",
    texto:
      "A IA não substitui o professor. Ela assume o trabalho braçal e repetitivo — a digitação, o rascunho, a formatação — e devolve a você o recurso mais escasso da educação: tempo para olhar nos olhos dos seus alunos.",
    listaRotulo: "Ladrões de tempo",
    camposItem: ["texto", "icone"],
    itens: [
      { titulo: "Pareceres descritivos", texto: "30 a 40 textos individuais, todo fim de bimestre.", icone: "file-text" },
      { titulo: "Planejamento", texto: "Horas montando planos de aula do zero.", icone: "notebook" },
      { titulo: "Correção", texto: "Pilhas de provas e redações no fim de semana.", icone: "pencil" },
      { titulo: "Burocracia", texto: "Atas, relatórios, comunicados e diários.", icone: "folder" },
    ],
  },
  {
    chave: "trilha",
    rotulo: "A trilha (encontros)",
    ajuda:
      'Os encontros do curso. Em cada um, "Você leva" é o material que o professor sai com a mão. A cor pinta a borda e o número.',
    ordem: 3,
    campos: ["titulo", "subtitulo"],
    titulo: "Quatro encontros. Sempre com algo pronto na mão.",
    subtitulo:
      "Você não sai de nenhum encontro de mãos vazias — cada um termina com material que dá para usar na segunda-feira.",
    listaRotulo: "Encontros",
    camposItem: ["extra", "cor"],
    itens: [
      {
        titulo: "Primeiros passos e a arte de conversar com a IA",
        extra: "1 plano de aula completo, gerado e refinado por você",
        cor: "#6366F1",
      },
      {
        titulo: "Sua rotina, seu planejamento e a BNCC",
        extra: "3 pareceres, 1 ata e 1 sequência didática prontos",
        cor: "#0EA5E9",
      },
      {
        titulo: "Materiais, inclusão e recursos visuais",
        extra: "1 atividade em 3 níveis e 1 material adaptado",
        cor: "#10B981",
      },
      {
        titulo: "Avaliação, ética e seu projeto final",
        extra: "1 prova com gabarito, 1 rubrica e seu projeto",
        cor: "#F59E0B",
      },
    ],
  },
  {
    chave: "ferramentas",
    rotulo: "Ferramentas",
    ajuda:
      'As ferramentas e seus limites reais. O selo "verde" mostra "Gratuito"; qualquer outro valor mostra "Com limite".',
    ordem: 4,
    campos: ["titulo", "subtitulo"],
    titulo: "Ferramentas gratuitas de verdade",
    subtitulo:
      "Nada de descobrir na terceira pergunta que precisa pagar. Dizemos os limites reais de cada uma — verificados em setembro de 2026.",
    listaRotulo: "Ferramentas",
    camposItem: ["texto", "cor", "selo", "link"],
    itens: [
      { titulo: "DeepSeek", texto: "Sem limite de mensagens", cor: "#4D6BFE", selo: "verde" },
      { titulo: "Google Gemini", texto: "Gratuito com conta Google", cor: "#4285F4", selo: "verde" },
      { titulo: "Canva Educação", texto: "Pro gratuito para docentes", cor: "#00A8B0", selo: "verde" },
      { titulo: "NotebookLM", texto: "~50 perguntas por dia", cor: "#F97316", selo: "amarelo" },
      { titulo: "ChatGPT", texto: "Troca de modelo após uso intenso", cor: "#10A37F", selo: "amarelo" },
      { titulo: "Diffit", texto: "Não exporta para Docs no free", cor: "#EC4899", selo: "amarelo" },
    ],
  },
  {
    chave: "depoimentos",
    rotulo: "Depoimentos",
    ajuda:
      "Fica escondido enquanto não houver depoimento cadastrado — uma seção vazia é pior que seção nenhuma. Em cada item: título é o nome, extra é a escola ou cargo.",
    ordem: 5,
    campos: ["titulo", "subtitulo"],
    titulo: "Quem já passou por aqui",
    subtitulo: "",
    listaRotulo: "Depoimentos",
    camposItem: ["texto", "extra", "imagem"],
    itens: [],
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
    chave: "faq",
    rotulo: "Perguntas frequentes",
    ajuda:
      "Em cada item, o título é a pergunta e o texto é a resposta. Fica escondida sem perguntas cadastradas.",
    ordem: 7,
    campos: ["titulo", "subtitulo"],
    titulo: "Perguntas frequentes",
    listaRotulo: "Perguntas",
    camposItem: ["texto"],
    itens: [
      {
        titulo: "Preciso saber de tecnologia para acompanhar?",
        texto:
          "Não. A formação parte do zero e usa linguagem do dia a dia da escola, sem jargão técnico.",
      },
      {
        titulo: "As ferramentas são realmente gratuitas?",
        texto:
          "Sim. Todas as ferramentas da trilha têm versão gratuita, e dizemos com clareza os limites de cada uma.",
      },
      {
        titulo: "Vou receber certificado?",
        texto:
          "Sim, ao concluir a trilha completa de 40 horas você recebe o certificado pela plataforma.",
      },
    ],
  },
  {
    chave: "chamada_final",
    rotulo: "Chamada final",
    ajuda: "O último empurrão, antes do rodapé.",
    ordem: 8,
    campos: ["titulo", "subtitulo", "cta"],
    titulo: "Comece hoje. A primeira lição leva 5 minutos.",
    subtitulo: "Sem instalação, sem cartão de crédito, direto do seu celular.",
    ctaTexto: "Criar minha conta gratuita",
    ctaLink: "/cadastro",
  },
  {
    chave: "rodape",
    rotulo: "Rodapé",
    ajuda: "A linha de descrição embaixo da marca.",
    ordem: 9,
    campos: ["texto"],
    texto: "Formação em Inteligência Artificial para professores da rede pública.",
  },
];

export const SECAO_POR_CHAVE = new Map(SECOES.map((s) => [s.chave, s]));
