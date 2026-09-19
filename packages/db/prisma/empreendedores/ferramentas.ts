/**
 * Catálogo de ferramentas do curso de Empreendedores.
 *
 * Cada linha traz a faixa de acesso e o limite concreto, conferidos na
 * documentação oficial em 19/09/2026 — a data está em `verificadoEm`
 * justamente porque isto envelhece: plano e limite de ferramenta de IA
 * mudam em meses.
 *
 * Duas decisões que vêm da pesquisa e não são óbvias:
 *
 * - **Sora ficou de fora.** A OpenAI concluiu o encerramento em 24/03/2026.
 *   Ensiná-lo seria ensinar uma ferramenta que não existe mais.
 * - **Cowork não é produto separado.** A Anthropic fundiu Cowork e chat num
 *   só Claude. O curso ensina o conceito (delegar um trabalho de várias
 *   etapas), que sobrevive ao nome.
 */

const EM = new Date("2026-09-19");

export const FERRAMENTAS_EMPREENDEDORES = [
  {
    chave: "chatgpt-negocios",
    nome: "ChatGPT",
    descricao:
      "Escrever, responder cliente, resumir documento e organizar ideia. É o ponto de partida para quem nunca usou IA.",
    categoria: "Assistente de texto",
    url: "https://chatgpt.com/",
    urlCadastro: "https://chatgpt.com/",
    ordem: 0,
    capacidades: ["textos", "atendimento", "vendas", "ideias", "imagens"],
    entradas: ["texto", "imagem", "arquivo"],
    saidas: ["texto", "imagem"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao:
      "A interface abre o ChatGPT e copia o prompt. Não enviamos nada pela URL.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito:
      "Conversa de texto sem limite fixo; imagem, upload de arquivo e voz têm cota. O plano Go (US$ 8/mês) multiplica por 10.",
    verificadoEm: EM,
    fonteUrl: "https://help.openai.com/en/articles/9275245-chatgpt-free-tier-faq",
  },
  {
    chave: "gemini-negocios",
    // O nome tem de bater com o da ferramenta genérica ("Gemini"): é por
    // ele que a listagem sabe que esta entrada substitui aquela, em vez
    // de as duas aparecerem lado a lado.
    nome: "Gemini",
    descricao:
      "Assistente do Google. Útil para quem já trabalha com Gmail, Drive, Documentos e Planilhas.",
    categoria: "Assistente de texto",
    url: "https://gemini.google.com/",
    urlCadastro: "https://gemini.google.com/",
    ordem: 1,
    capacidades: ["textos", "pesquisa", "planilhas", "documentos"],
    entradas: ["texto", "imagem", "arquivo"],
    saidas: ["texto", "imagem"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao:
      "O Gemini não aceita prompt pela URL — copiamos para você colar.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito: "Gratuito com conta Google; cota diária nos modelos melhores.",
    verificadoEm: EM,
    fonteUrl: "https://gemini.google.com/",
  },
  {
    chave: "gemini-workspace",
    nome: "Gemini no Documentos e Planilhas",
    descricao:
      "O Gemini dentro do Google Documentos e Planilhas: monta planilha por descrição, cria fórmula e resume documento.",
    categoria: "Produtividade",
    url: "https://workspace.google.com/",
    ordem: 2,
    capacidades: ["planilhas", "documentos", "dados"],
    entradas: ["texto", "arquivo"],
    saidas: ["texto", "planilha"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao:
      "Usa-se dentro do próprio Documentos ou Planilhas, não por aqui.",
    // Marcado sem rodeio: os recursos fortes de 2026 estão em beta para
    // assinantes AI Ultra e Pro. Prometer isso como gratuito seria vender
    // ao cursista uma aula que ele não consegue fazer.
    faixaAcesso: "DEPENDE_DO_PLANO",
    limiteGratuito:
      "Montar planilha inteira por descrição e criar mini-apps exigem Google AI Pro ou Ultra. Sem assinatura, o caminho do curso é exportar CSV e analisar no chat.",
    verificadoEm: EM,
    fonteUrl:
      "https://blog.google/products-and-platforms/products/workspace/gemini-workspace-updates-march-2026/",
  },
  {
    chave: "claude-negocios",
    nome: "Claude",
    descricao:
      "Bom em texto longo e em trabalho de várias etapas sobre seus arquivos — o que antes se chamava Cowork.",
    categoria: "Assistente de texto",
    url: "https://claude.ai/",
    urlCadastro: "https://claude.ai/",
    ordem: 3,
    capacidades: ["textos", "documentos", "analise", "agentes"],
    entradas: ["texto", "arquivo"],
    saidas: ["texto", "arquivo"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao:
      "Cowork e chat viraram um produto só. O curso ensina o conceito de delegar, não a marca.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito:
      "Uso gratuito com cota por período. Delegar trabalho sobre pastas de arquivos é recurso dos planos pagos.",
    verificadoEm: EM,
    fonteUrl: "https://claude.com/blog/cowork-is-now-claude",
  },
  {
    chave: "notebooklm-negocios",
    nome: "NotebookLM",
    descricao:
      "Transforma seus PDFs, manuais e procedimentos numa base que responde com a fonte de cada resposta. O Google está renomeando para Gemini Notebook — é a mesma ferramenta.",
    categoria: "Base de conhecimento",
    url: "https://notebooklm.google.com/",
    urlCadastro: "https://notebooklm.google.com/",
    ordem: 4,
    capacidades: ["documentos", "pesquisa", "treinamento"],
    entradas: ["arquivo", "link", "texto"],
    saidas: ["texto", "citacoes"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao:
      "Abra, crie um caderno com seus arquivos e cole o prompt. O Google está renomeando para Gemini Notebook.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito:
      "Até 50 fontes por caderno; cada fonte até 500 mil palavras ou 200 MB.",
    verificadoEm: EM,
    fonteUrl: "https://support.google.com/notebooklm/answer/16213268?hl=en",
  },
  {
    chave: "chatgpt-imagens",
    nome: "ChatGPT Imagens",
    descricao:
      "Cria e edita imagem: foto de produto, cardápio, banner, post. Aceita fundo transparente e edição por seleção.",
    categoria: "Imagens",
    url: "https://chatgpt.com/",
    ordem: 5,
    capacidades: ["imagens", "marketing", "produto"],
    entradas: ["texto", "imagem"],
    saidas: ["imagem"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao: "Abre o ChatGPT; a geração de imagem é feita lá dentro.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito: "Poucas imagens por dia no gratuito. O plano Go amplia a cota.",
    verificadoEm: EM,
    fonteUrl: "https://openai.com/index/introducing-chatgpt-images-2-5/",
  },
  {
    chave: "veo",
    nome: "Google Veo",
    descricao:
      "Gera vídeo curto a partir de texto ou imagem. Serve para anúncio e conteúdo de rede social.",
    categoria: "Vídeo",
    url: "https://aistudio.google.com/",
    ordem: 6,
    capacidades: ["video", "marketing"],
    entradas: ["texto", "imagem"],
    saidas: ["video"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao: "Pelo Google AI Studio ou pelo Google Vids.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito:
      "Cerca de 10 gerações por mês em conta Google comum; assinantes AI Pro e Ultra têm bem mais.",
    verificadoEm: EM,
    fonteUrl:
      "https://sunra.ai/blog/ai-video-generation-2026-sora-shutdown-veo-free-kling-viral",
  },
  {
    chave: "pika",
    nome: "Pika",
    descricao:
      "Alternativa de vídeo cujo plano gratuito permite uso comercial — o que a maioria não permite.",
    categoria: "Vídeo",
    url: "https://pika.art/",
    ordem: 7,
    capacidades: ["video", "marketing"],
    entradas: ["texto", "imagem"],
    saidas: ["video"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao:
      "Escolhida por causa do uso comercial: várias concorrentes proíbem no gratuito.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito: "Clipes curtos, qualidade limitada a 480p no gratuito.",
    verificadoEm: EM,
    fonteUrl: "https://pika.art/",
  },
  {
    chave: "make",
    nome: "Make",
    descricao:
      "Liga uma coisa à outra sem programar: chegou formulário, registra na planilha e avisa o responsável.",
    categoria: "Automação",
    url: "https://www.make.com/",
    urlCadastro: "https://www.make.com/en/register",
    ordem: 8,
    capacidades: ["automacao", "integracao"],
    entradas: ["texto"],
    saidas: ["texto"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao:
      "Escolhida para o curso por ter o plano gratuito mais utilizável entre as três grandes.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito: "1.000 operações por mês e 2 automações ativas.",
    verificadoEm: EM,
    fonteUrl: "https://www.betterclaw.io/blog/n8n-vs-make-vs-zapier-ai-agents",
  },
  {
    chave: "canva-negocios",
    nome: "Canva",
    descricao:
      "Para dar acabamento: pegar a imagem gerada e montar o post, o cardápio ou o banner com o seu texto.",
    categoria: "Design",
    url: "https://www.canva.com/",
    urlCadastro: "https://www.canva.com/signup",
    ordem: 9,
    capacidades: ["imagens", "marketing", "documentos"],
    entradas: ["texto", "imagem"],
    saidas: ["imagem"],
    metodoAbertura: "COPIAR_E_ABRIR",
    observacaoIntegracao: "Abre o Canva; o prompt fica copiado para a IA de lá.",
    faixaAcesso: "GRATUITO_COM_LIMITES",
    limiteGratuito: "Modelos e edição no gratuito; parte dos recursos de IA é do plano pago.",
    verificadoEm: EM,
    fonteUrl: "https://www.canva.com/",
  },
];
