/**
 * Roteiros da aula — os passos que o professor projeta e a turma acompanha.
 *
 * ARQUIVO GERADO. Não edite à mão: a fonte é o deck do curso, em
 * `cursos/Curso_IA_Educadores_v2/Slides_IA_Educadores_2026.html`.
 * Para atualizar, edite o deck, rode `node montar_slides.js` lá e depois:
 *
 *   pnpm tsx prisma/gerar-roteiros.ts <caminho-do-deck.html>
 *
 * O seed grava estes roteiros no banco a cada deploy, então a aula já chega
 * pronta no painel — não há nada para importar.
 */

/** Um bloco do passo. A tela do aluno sabe desenhar cada tipo. */
export type BlocoRoteiro =
  | { tipo: "texto"; html: string }
  | { tipo: "prompt"; texto: string; variaveis: string[] }
  | { tipo: "ferramentas"; chaves: string[] }
  | { tipo: "checklist"; itens: string[] }
  | { tipo: "imagem"; src: string; legenda?: string };

export type PassoRoteiro = {
  titulo: string;
  /** O slide como está no deck, desenhado com o CSS do deck. */
  html: string;
  /** A seção da apostila que este slide trata — "1.1", "2.2". */
  secaoApostila: string | null;
  blocos: BlocoRoteiro[];
};

export type RoteiroAula = {
  /** Encontro 1, 2, 3... Vira o título e a ordem do roteiro. */
  encontro: number;
  titulo: string;
  passos: PassoRoteiro[];
};

export const ROTEIROS_AULA: RoteiroAula[] = [
  {
    "encontro": 1,
    "titulo": "Encontro 1",
    "passos": [
      {
        "titulo": "Capa — IA para Educadores",
        "html": "<div class=\"slide active\" data-n=\"1\" data-title=\"Capa — IA para Educadores\">\r\n<div class=\"capa\">\r\n  <div style=\"background:var(--indigo);color:#fff;font-family:var(--titulo);font-size:15px;font-weight:700;letter-spacing:.8px;padding:9px 24px;border-radius:999px;margin-bottom:26px\">🕐 FORMAÇÃO COMPLETA · 40 HORAS</div>\r\n  <div style=\"font-size:60px;line-height:1;margin-bottom:10px\">🤖</div>\r\n  <h1 style=\"font-family:var(--titulo);font-size:56px;font-weight:800;color:var(--tinta);line-height:1.1\">Inteligência Artificial<br><span style=\"color:var(--laranja)\">para Educadores</span></h1>\r\n  <p style=\"font-size:21px;color:var(--tinta-clara);margin-top:20px;max-width:700px\">Um guia prático, acessível e sem jargões para transformar sua rotina escolar.</p>\r\n  <div style=\"display:flex;gap:11px;margin-top:30px;flex-wrap:wrap;justify-content:center\">\r\n    <span style=\"background:#fff;border:1.5px solid var(--indigo-line);color:var(--indigo-dark);font-family:var(--titulo);font-size:14px;font-weight:700;padding:9px 17px;border-radius:999px\">Sem jargões técnicos</span>\r\n    <span style=\"background:#fff;border:1.5px solid var(--indigo-line);color:var(--indigo-dark);font-family:var(--titulo);font-size:14px;font-weight:700;padding:9px 17px;border-radius:999px\">Ferramentas 100% gratuitas</span>\r\n    <span style=\"background:#fff;border:1.5px solid var(--indigo-line);color:var(--indigo-dark);font-family:var(--titulo);font-size:14px;font-weight:700;padding:9px 17px;border-radius:999px\">Inclusão real</span>\r\n    <span style=\"background:#fff;border:1.5px solid var(--indigo-line);color:var(--indigo-dark);font-family:var(--titulo);font-size:14px;font-weight:700;padding:9px 17px;border-radius:999px\">Alinhado à BNCC</span>\r\n  </div>\r\n  <p style=\"font-size:15px;color:var(--cinza);margin-top:32px;border-top:1.5px solid var(--indigo-line);padding-top:16px\">4 encontros presenciais de 2 horas + aplicação em sala e Projeto de Intervenção</p>\r\n</div>\r\n</div>",
        "secaoApostila": null,
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕐 FORMAÇÃO COMPLETA · 40 HORAS\n  🤖\n  Inteligência Artificial\npara Educadores\n  Um guia prático, acessível e sem jargões para transformar sua rotina escolar.\n  \n    Sem jargões técnicos\n    Ferramentas 100% gratuitas\n    Inclusão real\n    Alinhado à BNCC\n  \n  4 encontros presenciais de 2 horas + aplicação em sala e Projeto de Intervenção"
          }
        ]
      },
      {
        "titulo": "Encontro 1 — Abertura",
        "html": "<div class=\"slide\" data-n=\"2\" data-title=\"Encontro 1 — Abertura\">\r\n<div class=\"divisor\">\r\n  <div class=\"num\">ENCONTRO 1 · 2 HORAS</div>\r\n  <h2>Primeiros Passos e a Arte<br>de Conversar com a IA</h2>\r\n  <p>Hoje você vai entender o que é a IA sem nenhum jargão, descobrir as ferramentas realmente gratuitas e aprender a fórmula que faz toda a diferença nos resultados.</p>\r\n  <div class=\"caps\">\r\n    <span class=\"cap-tag\">Capítulo 1 · Entendendo a IA</span>\r\n    <span class=\"cap-tag\">Capítulo 2 · Engenharia de Prompts</span>\r\n  </div>\r\n</div>\r\n</div>",
        "secaoApostila": null,
        "blocos": [
          {
            "tipo": "texto",
            "html": "ENCONTRO 1 · 2 HORAS\n  Primeiros Passos e a Arte\nde Conversar com a IA\n  Hoje você vai entender o que é a IA sem nenhum jargão, descobrir as ferramentas realmente gratuitas e aprender a fórmula que faz toda a diferença nos resultados.\n  \n    Capítulo 1 · Entendendo a IA\n    Capítulo 2 · Engenharia de Prompts"
          }
        ]
      },
      {
        "titulo": "Onde foi parar o seu tempo?",
        "html": "<div class=\"slide\" data-n=\"3\" data-title=\"Onde foi parar o seu tempo?\">\r\n<div class=\"topo laranja\"></div>\r\n<div class=\"badge laranja\">Encontro 1 · Por que estamos aqui</div>\r\n<h1 class=\"st\">Onde foi parar o seu tempo?</h1>\r\n<div class=\"corpo\">\r\n  <p class=\"lead\" style=\"margin-bottom:20px\">Você foi formado para ensinar, inspirar e transformar vidas. Mas na prática, boa parte das suas horas vai para outra coisa.</p>\r\n  <div class=\"grid4\" style=\"margin-bottom:20px\">\r\n    <div class=\"card\" style=\"text-align:center\"><div style=\"font-size:34px;margin-bottom:8px\">📝</div><h4 style=\"font-size:15px\">Pareceres descritivos</h4><p style=\"font-size:13px\">30 a 40 textos individuais, todo fim de bimestre.</p></div>\r\n    <div class=\"card\" style=\"text-align:center\"><div style=\"font-size:34px;margin-bottom:8px\">📚</div><h4 style=\"font-size:15px\">Planejamento</h4><p style=\"font-size:13px\">Horas montando planos de aula do zero.</p></div>\r\n    <div class=\"card\" style=\"text-align:center\"><div style=\"font-size:34px;margin-bottom:8px\">✏️</div><h4 style=\"font-size:15px\">Correção</h4><p style=\"font-size:13px\">Pilhas de provas e redações no fim de semana.</p></div>\r\n    <div class=\"card\" style=\"text-align:center\"><div style=\"font-size:34px;margin-bottom:8px\">📋</div><h4 style=\"font-size:15px\">Burocracia</h4><p style=\"font-size:13px\">Atas, relatórios, comunicados e diários.</p></div>\r\n  </div>\r\n  <div class=\"lilas\">\r\n    <div class=\"t\">A proposta desta formação</div>\r\n    <p>A IA <strong>não substitui</strong> o professor. Ela assume o trabalho braçal e repetitivo — a digitação, o rascunho, a formatação — e devolve a você o recurso mais escasso da educação: <strong>tempo para olhar nos olhos dos seus alunos.</strong></p>\r\n  </div>\r\n</div>\r\n</div>",
        "secaoApostila": null,
        "blocos": [
          {
            "tipo": "texto",
            "html": "Encontro 1 · Por que estamos aqui\n\n\n  Você foi formado para ensinar, inspirar e transformar vidas. Mas na prática, boa parte das suas horas vai para outra coisa.\n  \n    📝Pareceres descritivos30 a 40 textos individuais, todo fim de bimestre.\n    📚PlanejamentoHoras montando planos de aula do zero.\n    ✏️CorreçãoPilhas de provas e redações no fim de semana.\n    📋BurocraciaAtas, relatórios, comunicados e diários.\n  \n  \n    A proposta desta formação\n    A IA não substitui o professor. Ela assume o trabalho braçal e repetitivo — a digitação, o rascunho, a formatação — e devolve a você o recurso mais escasso da educação: tempo para olhar nos olhos dos seus alunos."
          }
        ]
      },
      {
        "titulo": "Aquecimento 1 — quem levou trabalho pra casa?",
        "html": "<div class=\"slide\" data-n=\"4\" data-title=\"Aquecimento 1 — quem levou trabalho pra casa?\" data-enc=\"1\" data-pos=\"apos:3\">\n<div class=\"sl-aquec\">\n  <div class=\"et\">🔥 AQUECIMENTO · 2 MINUTOS</div>\n  <h2>Levante a mão quem levou trabalho da escola para o fim de semana no último mês.</h2>\n  <p>Agora <strong>mantenha a mão levantada</strong> quem fez isso mais de duas vezes.</p>\n  <p style=\"margin-top:18px;font-style:italic\">Olhe em volta. Você não está sozinho — e é exatamente isso que vamos atacar hoje.</p>\n</div>\n</div>",
        "secaoApostila": null,
        "blocos": [
          {
            "tipo": "texto",
            "html": "🔥 AQUECIMENTO · 2 MINUTOS\n  Levante a mão quem levou trabalho da escola para o fim de semana no último mês.\n  Agora mantenha a mão levantada quem fez isso mais de duas vezes.\n  Olhe em volta. Você não está sozinho — e é exatamente isso que vamos atacar hoje."
          }
        ]
      },
      {
        "titulo": "O que é IA? A metáfora do WhatsApp",
        "html": "<div class=\"slide com-fig\" data-n=\"5\" data-title=\"O que é IA? A metáfora do WhatsApp\">\r\n<div class=\"topo\"></div>\r\n<div class=\"badge\">Capítulo 1.1</div>\r\n<h1 class=\"st\">O que é Inteligência Artificial?</h1>\r\n<div class=\"corpo\">\r\n  <div class=\"grid2\" style=\"margin-bottom:18px\">\r\n    <div class=\"card\">\r\n      <h4>Não é o robô do cinema</h4>\r\n      <p>A IA é apenas um <strong>programa de computador treinado para identificar padrões</strong> e prever o que vem a seguir.</p>\r\n      <p style=\"margin-top:10px\">Quando você digita <strong>\"bom d\"</strong> no WhatsApp e o teclado sugere <strong>\"dia\"</strong>, isso já é uma forma básica de IA. Ele aprendeu que, depois de \"bom\", a maioria das pessoas escreve \"dia\".</p>\r\n    </div>\r\n    <div class=\"card\" style=\"background:var(--indigo-soft);border-color:var(--indigo-line)\">\r\n      <h4 style=\"color:var(--indigo-dark)\">Agora multiplique por bilhões</h4>\r\n      <p style=\"color:#3730A3\">Os modelos de IA leram praticamente toda a internet: livros, artigos, enciclopédias e <strong>milhões de planos de aula escritos por professores reais</strong>.</p>\r\n      <p style=\"color:#3730A3;margin-top:10px\">Por isso, quando você pede um plano de aula, ela consegue gerar um texto coerente e útil.</p>\r\n    </div>\r\n  </div>\r\n  <div class=\"traduzindo\">\r\n    <div class=\"t\">📖 Traduzindo: LLM (Large Language Model)</div>\r\n    <p>\"Modelo de Linguagem Grande\" é o cérebro por trás do ChatGPT e do Gemini. Ele não pensa de verdade — prevê a próxima palavra mais provável. É como um aluno que leu todos os livros da biblioteca, mas não tem vivência própria. <strong>Você, professor, tem a vivência. A IA tem a velocidade.</strong></p>\r\n  </div>\r\n</div>\r\n<div class=\"fig-slide\"><img src=\"/curso/imagens/01_whatsapp_teclado_previsao.png\" alt=\"A IA prevê a próxima palavra, como o teclado do celular.\"><div class=\"fig-leg\">A IA prevê a próxima palavra, como o teclado do celular.</div></div>\n</div>",
        "secaoApostila": "1.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.1\n\n\n  \n    \n      Não é o robô do cinema\n      A IA é apenas um programa de computador treinado para identificar padrões e prever o que vem a seguir.\n      Quando você digita \"bom d\" no WhatsApp e o teclado sugere \"dia\", isso já é uma forma básica de IA. Ele aprendeu que, depois de \"bom\", a maioria das pessoas escreve \"dia\".\n    \n    \n      Agora multiplique por bilhões\n      Os modelos de IA leram praticamente toda a internet: livros, artigos, enciclopédias e milhões de planos de aula escritos por professores reais.\n      Por isso, quando você pede um plano de aula, ela consegue gerar um texto coerente e útil.\n    \n  \n  \n    📖 Traduzindo: LLM (Large Language Model)\n    \"Modelo de Linguagem Grande\" é o cérebro por trás do ChatGPT e do Gemini. Ele não pensa de verdade — prevê a próxima palavra mais provável. É como um aluno que leu todos os livros da biblioteca, mas não tem vivência própria. Você, professor, tem a vivência. A IA tem a velocidade."
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/01_whatsapp_teclado_previsao.png",
            "legenda": "A IA prevê a próxima palavra, como o teclado do celular."
          }
        ]
      },
      {
        "titulo": "O fim do mito: você não precisa pagar",
        "html": "<div class=\"slide\" data-n=\"6\" data-title=\"O fim do mito: você não precisa pagar\">\r\n<div class=\"topo verde\"></div>\r\n<div class=\"badge verde\">Capítulo 1.3</div>\r\n<h1 class=\"st\">O fim do mito: você <span class=\"lar\">não</span> precisa pagar assinatura</h1>\r\n<div class=\"corpo\">\r\n  <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0;display:flex;align-items:center;gap:20px;margin-bottom:20px\">\r\n    <div style=\"width:56px;height:56px;border-radius:50%;background:var(--verde);color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0\">✓</div>\r\n    <div>\r\n      <h4 style=\"color:#065F46\">Compromisso desta formação: R$ 0,00</h4>\r\n      <p style=\"color:#047857\">Nenhuma ferramenta ensinada aqui exigirá cartão de crédito para o seu trabalho escolar. Muitos professores desistem por achar que IA boa custa mais de R$ 100 por mês. <strong>Isso não é verdade.</strong></p>\r\n    </div>\r\n  </div>\r\n  <div class=\"grid3\">\r\n    <div class=\"card\" style=\"text-align:center\">\r\n      <p style=\"font-family:var(--titulo);font-size:18px;font-weight:800;color:#4D6BFE;margin-bottom:8px\">DeepSeek</p>\r\n      <span class=\"selo verde\">🟢 Sem limite de mensagens</span>\r\n      <p style=\"margin-top:10px;font-size:13.5px\">Excelente em matemática, ciências e gabaritos comentados.</p>\r\n    </div>\r\n    <div class=\"card\" style=\"text-align:center\">\r\n      <p style=\"font-family:var(--titulo);font-size:18px;font-weight:800;color:#F97316;margin-bottom:8px\">NotebookLM</p>\r\n      <span class=\"selo amarelo\">🟡 Cota diária</span>\r\n      <p style=\"margin-top:10px;font-size:13.5px\">Lê a BNCC e o livro didático citando a página exata.</p>\r\n    </div>\r\n    <div class=\"card\" style=\"text-align:center\">\r\n      <p style=\"font-family:var(--titulo);font-size:18px;font-weight:800;color:#00A8B0;margin-bottom:8px\">Canva Educação</p>\r\n      <span class=\"selo verde\">🟢 Pro gratuito</span>\r\n      <p style=\"margin-top:10px;font-size:13.5px\">Versão Pro liberada para docentes da rede pública.</p>\r\n    </div>\r\n  </div>\r\n</div>\r\n</div>",
        "secaoApostila": "1.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.3\n\n\n  \n    ✓\n    \n      Compromisso desta formação: R$ 0,00\n      Nenhuma ferramenta ensinada aqui exigirá cartão de crédito para o seu trabalho escolar. Muitos professores desistem por achar que IA boa custa mais de R$ 100 por mês. Isso não é verdade.\n    \n  \n  \n    \n      DeepSeek\n      🟢 Sem limite de mensagens\n      Excelente em matemática, ciências e gabaritos comentados.\n    \n    \n      NotebookLM\n      🟡 Cota diária\n      Lê a BNCC e o livro didático citando a página exata.\n    \n    \n      Canva Educação\n      🟢 Pro gratuito\n      Versão Pro liberada para docentes da rede pública."
          }
        ]
      },
      {
        "titulo": "Vitrine de ferramentas gratuitas",
        "html": "<div class=\"slide\" data-n=\"7\" data-title=\"Vitrine de ferramentas gratuitas\">\r\n<div class=\"topo\"></div>\r\n<div class=\"badge\">Capítulo 1.3 · Tabela completa</div>\r\n<h1 class=\"st\">As ferramentas que usaremos no curso</h1>\r\n<div class=\"corpo alto\">\r\n<table>\r\n  <thead><tr><th style=\"width:24%\">Ferramenta</th><th style=\"width:15%\">Tipo</th><th style=\"width:35%\">Melhor para</th><th style=\"width:26%\">Gratuidade real</th></tr></thead>\r\n  <tbody>\r\n    <tr><td class=\"fer\" style=\"color:#4D6BFE\">DeepSeek</td><td>Texto</td><td>Matemática, ciências, raciocínio passo a passo</td><td><span class=\"selo verde\">🟢 Sem limite</span></td></tr>\r\n    <tr><td class=\"fer\" style=\"color:#4285F4\">Google Gemini</td><td>Texto</td><td>Pesquisas atuais, integração com Google Drive</td><td><span class=\"selo verde\">🟢 Gratuito</span></td></tr>\r\n    <tr><td class=\"fer\" style=\"color:#615CED\">Qwen</td><td>Texto</td><td>Alternativa quando outra atinge o limite</td><td><span class=\"selo verde\">🟢 Gratuito</span></td></tr>\r\n    <tr><td class=\"fer\" style=\"color:#10A37F\">ChatGPT</td><td>Texto</td><td>Versátil, o mais conhecido</td><td><span class=\"selo amarelo\">🟡 Troca p/ modelo fraco</span></td></tr>\r\n    <tr><td class=\"fer\" style=\"color:#F97316\">NotebookLM</td><td>Leitura PDF</td><td>BNCC, PPP e livro didático sem inventar</td><td><span class=\"selo amarelo\">🟡 ~50 perguntas/dia</span></td></tr>\r\n    <tr><td class=\"fer\" style=\"color:#00A8B0\">Canva Educação</td><td>Design</td><td>Slides, cartazes, murais, atividades</td><td><span class=\"selo verde\">🟢 Pro para docentes</span></td></tr>\r\n    <tr><td class=\"fer\" style=\"color:#7C3AED\">MagicSchool</td><td>Kit docente</td><td>80+ ferramentas prontas para professor</td><td><span class=\"selo amarelo\">🟡 Exportação limitada</span></td></tr>\r\n    <tr><td class=\"fer\" style=\"color:#EC4899\">Diffit</td><td>Adaptação</td><td>Texto em 3 níveis de leitura</td><td><span class=\"selo amarelo\">🟡 Não exporta p/ Docs</span></td></tr>\r\n    <tr><td class=\"fer\" style=\"color:#8B5CF6\">Gamma</td><td>Slides</td><td>Apresentações rápidas</td><td><span class=\"selo vermelho\">🔴 Créditos acabam</span></td></tr>\r\n  </tbody>\r\n</table>\r\n</div>\r\n</div>",
        "secaoApostila": "1.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.3 · Tabela completa\n\n\n\n  FerramentaTipoMelhor paraGratuidade real\n  \n    DeepSeekTextoMatemática, ciências, raciocínio passo a passo🟢 Sem limite\n    Google GeminiTextoPesquisas atuais, integração com Google Drive🟢 Gratuito\n    QwenTextoAlternativa quando outra atinge o limite🟢 Gratuito\n    ChatGPTTextoVersátil, o mais conhecido🟡 Troca p/ modelo fraco\n    NotebookLMLeitura PDFBNCC, PPP e livro didático sem inventar🟡 ~50 perguntas/dia\n    Canva EducaçãoDesignSlides, cartazes, murais, atividades🟢 Pro para docentes\n    MagicSchoolKit docente80+ ferramentas prontas para professor🟡 Exportação limitada\n    DiffitAdaptaçãoTexto em 3 níveis de leitura🟡 Não exporta p/ Docs\n    GammaSlidesApresentações rápidas🔴 Créditos acabam"
          }
        ]
      },
      {
        "titulo": "As quatro ferramentas do curso",
        "html": "<div class=\"slide com-ia\" data-n=\"8\" data-title=\"As quatro ferramentas do curso\" data-enc=\"1\" data-pos=\"apos:6\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 1.7 · Momento ferramentas</div>\n<h1 class=\"st\">Quatro ferramentas. Só quatro.</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:22px\">Quem tenta aprender dez ao mesmo tempo não aprende nenhuma. Estas quatro cobrem a rotina docente inteira — e são as que você vai encontrar na plataforma do curso.</p>\n  <div class=\"grid4\">\n    <div class=\"card\" style=\"text-align:center;border-top:5px solid #10A37F\">\n      <p style=\"font-family:var(--titulo);font-size:19px;font-weight:800;color:#10A37F;margin-bottom:6px\">ChatGPT</p>\n      <p style=\"font-size:14px\">Escrita delicada:<br>família, parecer, ata</p>\n    </div>\n    <div class=\"card\" style=\"text-align:center;border-top:5px solid #4285F4\">\n      <p style=\"font-family:var(--titulo);font-size:19px;font-weight:800;color:#4285F4;margin-bottom:6px\">Gemini</p>\n      <p style=\"font-size:14px\">Planejar e pesquisar.<br><strong>Já é sua conta Google</strong></p>\n    </div>\n    <div class=\"card\" style=\"text-align:center;border-top:5px solid #4D6BFE\">\n      <p style=\"font-family:var(--titulo);font-size:19px;font-weight:800;color:#4D6BFE;margin-bottom:6px\">DeepSeek</p>\n      <p style=\"font-size:14px\">Matemática e raciocínio<br>passo a passo</p>\n    </div>\n    <div class=\"card\" style=\"text-align:center;border-top:5px solid #F97316\">\n      <p style=\"font-family:var(--titulo);font-size:19px;font-weight:800;color:#F97316;margin-bottom:6px\">NotebookLM</p>\n      <p style=\"font-size:14px\">BNCC e PPP<br><strong>citando a página</strong></p>\n    </div>\n  </div>\n  <div class=\"lilas\" style=\"margin-top:20px\">\n    <div class=\"t\">Nos próximos 15 minutos</div>\n    <p>Vamos ver <strong>o que dá para fazer em cada uma</strong>, com exemplo real na tela. Depois, os 15 minutos seguintes são para <strong>criar as contas juntos</strong> — ninguém sai daqui sem conseguir entrar.</p>\n  </div>\n</div>\n<div class=\"ia-barra\"><span class=\"rot\">Abrir agora</span><div class=\"ia-btns\"><a class=\"ia-btn gemini\" href=\"https://gemini.google.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>Gemini</a><a class=\"ia-btn chatgpt\" href=\"https://chatgpt.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>ChatGPT</a><a class=\"ia-btn deepseek\" href=\"https://chat.deepseek.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>DeepSeek</a><a class=\"ia-btn notebook\" href=\"https://notebooklm.google.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>NotebookLM</a></div></div>\n</div>",
        "secaoApostila": "1.7",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.7 · Momento ferramentas\n\n\n  Quem tenta aprender dez ao mesmo tempo não aprende nenhuma. Estas quatro cobrem a rotina docente inteira — e são as que você vai encontrar na plataforma do curso.\n  \n    \n      ChatGPT\n      Escrita delicada:\nfamília, parecer, ata\n    \n    \n      Gemini\n      Planejar e pesquisar.\nJá é sua conta Google\n    \n    \n      DeepSeek\n      Matemática e raciocínio\npasso a passo\n    \n    \n      NotebookLM\n      BNCC e PPP\ncitando a página\n    \n  \n  \n    Nos próximos 15 minutos\n    Vamos ver o que dá para fazer em cada uma, com exemplo real na tela. Depois, os 15 minutos seguintes são para criar as contas juntos — ninguém sai daqui sem conseguir entrar."
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "chatgpt",
              "gemini",
              "deepseek",
              "notebooklm"
            ]
          }
        ]
      },
      {
        "titulo": "ChatGPT — escrita e nuance",
        "html": "<div class=\"slide com-acoes\" data-n=\"9\" data-title=\"ChatGPT — escrita e nuance\" data-enc=\"1\" data-pos=\"apos:E1\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\" style=\"background:#10A37F\">ChatGPT · chatgpt.com</div>\n<h1 class=\"st\">ChatGPT — quando o <span class=\"lar\">tom</span> importa</h1>\n<div class=\"corpo\">\n  <div class=\"grid3\" style=\"margin-bottom:18px\">\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:15px\">📨 Envia</h4><p style=\"font-size:13.5px\">Texto, imagem e arquivo</p></div>\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:15px\">📩 Devolve</h4><p style=\"font-size:13.5px\">Texto e imagem</p></div>\n    <div class=\"card\" style=\"padding:16px;background:var(--amarelo-sf);border-color:#FDE68A\"><h4 style=\"font-size:15px;color:var(--amarelo-dk)\">🟡 Limite</h4><p style=\"font-size:13.5px;color:#92400E\">Troca para modelo fraco após uso pesado</p></div>\n  </div>\n  <div class=\"grid2\" style=\"margin-bottom:16px\">\n    <div class=\"card\"><h4>O que ele faz melhor</h4><p style=\"font-size:14.5px\">Comunicado à família, parecer descritivo, ata de reunião — tudo que exige <strong>cuidado no tom</strong>. É o mais sensível a nuance de escrita.</p></div>\n    <div class=\"card\"><h4>Também faz</h4><p style=\"font-size:14.5px\">Plano de aula, prova com gabarito, rubrica, feedback, ideias de analogia e até imagem simples para atividade.</p></div>\n  </div>\n  <div class=\"etiqueta verde\">✅ Teste na tela agora</div>\n  <div class=\"prompt\" style=\"font-size:14px\">Aja como professor(a) de [DISCIPLINA] do [ANO]. Me dê 3 formas\ndiferentes de explicar [CONTEÚDO] para quem não entendeu da\nprimeira vez.</div><div class=\"prompt-acoes\" data-prompt-txt=\"Aja como professor(a) de [DISCIPLINA] do [ANO]. Me dê 3 formas\ndiferentes de explicar [CONTEÚDO] para quem não entendeu da\nprimeira vez.\"></div>\n</div>\n</div>",
        "secaoApostila": "1.7",
        "blocos": [
          {
            "tipo": "texto",
            "html": "ChatGPT · chatgpt.com\n\n\n  \n    📨 EnviaTexto, imagem e arquivo\n    📩 DevolveTexto e imagem\n    🟡 LimiteTroca para modelo fraco após uso pesado\n  \n  \n    O que ele faz melhorComunicado à família, parecer descritivo, ata de reunião — tudo que exige cuidado no tom. É o mais sensível a nuance de escrita.\n    Também fazPlano de aula, prova com gabarito, rubrica, feedback, ideias de analogia e até imagem simples para atividade.\n  \n  ✅ Teste na tela agora"
          },
          {
            "tipo": "prompt",
            "texto": "Aja como professor(a) de [DISCIPLINA] do [ANO]. Me dê 3 formas\ndiferentes de explicar [CONTEÚDO] para quem não entendeu da\nprimeira vez.",
            "variaveis": [
              "DISCIPLINA",
              "ANO",
              "CONTEÚDO"
            ]
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "chatgpt"
            ]
          }
        ]
      },
      {
        "titulo": "Gemini — planejar e pesquisar",
        "html": "<div class=\"slide com-acoes\" data-n=\"10\" data-title=\"Gemini — planejar e pesquisar\" data-enc=\"1\" data-pos=\"apos:E2\">\n<div class=\"topo\"></div>\n<div class=\"badge\" style=\"background:#4285F4\">Google Gemini · gemini.google.com</div>\n<h1 class=\"st\">Gemini — o que você <span class=\"lar\">já tem</span></h1>\n<div class=\"corpo\">\n  <div class=\"grid3\" style=\"margin-bottom:18px\">\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:15px\">📨 Envia</h4><p style=\"font-size:13.5px\">Texto, imagem e arquivo</p></div>\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:15px\">📩 Devolve</h4><p style=\"font-size:13.5px\">Texto e imagem</p></div>\n    <div class=\"card\" style=\"padding:16px;background:var(--verde-soft);border-color:#A7F3D0\"><h4 style=\"font-size:15px;color:var(--verde-dark)\">🟢 Limite</h4><p style=\"font-size:13.5px;color:#047857\">Gratuito com conta Google</p></div>\n  </div>\n  <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0;display:flex;align-items:center;gap:20px;margin-bottom:16px\">\n    <div style=\"width:52px;height:52px;border-radius:50%;background:var(--verde);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0\">✓</div>\n    <div>\n      <h4 style=\"color:#065F46\">Se você tem Gmail, já tem conta</h4>\n      <p style=\"color:#047857\">Sem cadastro novo, sem senha nova, sem confirmação por SMS. <strong>É por aqui que começamos daqui a pouco.</strong></p>\n    </div>\n  </div>\n  <div class=\"etiqueta verde\">✅ Teste na tela agora</div>\n  <div class=\"prompt\" style=\"font-size:14px\">Me dê 3 ideias criativas para ensinar [CONTEÚDO] para alunos do\n[ANO], usando materiais que custem menos de 10 reais.</div><div class=\"prompt-acoes\" data-prompt-txt=\"Me dê 3 ideias criativas para ensinar [CONTEÚDO] para alunos do\n[ANO], usando materiais que custem menos de 10 reais.\"></div>\n</div>\n</div>",
        "secaoApostila": "1.7",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Google Gemini · gemini.google.com\n\n\n  \n    📨 EnviaTexto, imagem e arquivo\n    📩 DevolveTexto e imagem\n    🟢 LimiteGratuito com conta Google\n  \n  \n    ✓\n    \n      Se você tem Gmail, já tem conta\n      Sem cadastro novo, sem senha nova, sem confirmação por SMS. É por aqui que começamos daqui a pouco.\n    \n  \n  ✅ Teste na tela agora"
          },
          {
            "tipo": "prompt",
            "texto": "Me dê 3 ideias criativas para ensinar [CONTEÚDO] para alunos do\n[ANO], usando materiais que custem menos de 10 reais.",
            "variaveis": [
              "CONTEÚDO",
              "ANO"
            ]
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "gemini"
            ]
          }
        ]
      },
      {
        "titulo": "DeepSeek — matemática e raciocínio",
        "html": "<div class=\"slide com-ia\" data-n=\"11\" data-title=\"DeepSeek — matemática e raciocínio\" data-enc=\"1\" data-pos=\"apos:E3\">\n<div class=\"topo\"></div>\n<div class=\"badge\" style=\"background:#4D6BFE\">DeepSeek · chat.deepseek.com</div>\n<h1 class=\"st\">DeepSeek — conta, fórmula e <span class=\"lar\">passo a passo</span></h1>\n<div class=\"corpo\">\n  <div class=\"grid3\" style=\"margin-bottom:18px\">\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:15px\">📨 Envia</h4><p style=\"font-size:13.5px\">Texto</p></div>\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:15px\">📩 Devolve</h4><p style=\"font-size:13.5px\">Texto</p></div>\n    <div class=\"card\" style=\"padding:16px;background:var(--verde-soft);border-color:#A7F3D0\"><h4 style=\"font-size:15px;color:var(--verde-dark)\">🟢 Limite</h4><p style=\"font-size:13.5px;color:#047857\"><strong>Sem limite</strong> de mensagens</p></div>\n  </div>\n  <div class=\"grid2\" style=\"margin-bottom:16px\">\n    <div class=\"card\"><h4>O melhor em cálculo</h4><p style=\"font-size:14.5px\">Situação-problema, gabarito comentado, diagnóstico de erro conceitual. Mostra <strong>o raciocínio</strong>, não só a resposta.</p></div>\n    <div class=\"card\" style=\"background:var(--indigo-soft);border-color:var(--indigo-line)\"><h4 style=\"color:var(--indigo-dark)\">Onde testar à vontade</h4><p style=\"font-size:14.5px;color:var(--indigo-dark)\">Como não tem limite, é aqui que você experimenta variações de prompt sem medo de acabar a cota.</p></div>\n  </div>\n  <div class=\"atencao\">\n    <div class=\"t\">⚠️ Mesmo o melhor em matemática erra</div>\n    <p>No Encontro 4 você vai encontrar um gabarito de porcentagem <strong>errado</strong>, gerado por IA. Refaça sempre as contas antes de aplicar a prova.</p>\n  </div>\n</div>\n<div class=\"ia-barra\"><span class=\"rot\">Abrir e demonstrar</span><div class=\"ia-btns\"><a class=\"ia-btn deepseek\" href=\"https://chat.deepseek.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>DeepSeek</a></div></div>\n</div>",
        "secaoApostila": "1.7",
        "blocos": [
          {
            "tipo": "texto",
            "html": "DeepSeek · chat.deepseek.com\n\n\n  \n    📨 EnviaTexto\n    📩 DevolveTexto\n    🟢 LimiteSem limite de mensagens\n  \n  \n    O melhor em cálculoSituação-problema, gabarito comentado, diagnóstico de erro conceitual. Mostra o raciocínio, não só a resposta.\n    Onde testar à vontadeComo não tem limite, é aqui que você experimenta variações de prompt sem medo de acabar a cota.\n  \n  \n    ⚠️ Mesmo o melhor em matemática erra\n    No Encontro 4 você vai encontrar um gabarito de porcentagem errado, gerado por IA. Refaça sempre as contas antes de aplicar a prova."
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "deepseek"
            ]
          }
        ]
      },
      {
        "titulo": "NotebookLM — responde citando a página",
        "html": "<div class=\"slide com-acoes\" data-n=\"12\" data-title=\"NotebookLM — responde citando a página\" data-enc=\"1\" data-pos=\"apos:E4\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">NotebookLM · notebooklm.google.com</div>\n<h1 class=\"st\">NotebookLM — o que <span class=\"lar\">não pode</span> estar errado</h1>\n<div class=\"corpo\">\n  <div class=\"grid3\" style=\"margin-bottom:18px\">\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:15px\">📨 Envia</h4><p style=\"font-size:13.5px\">Texto, arquivo e link</p></div>\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:15px\">📩 Devolve</h4><p style=\"font-size:13.5px\">Texto <strong>+ citação</strong></p></div>\n    <div class=\"card\" style=\"padding:16px;background:var(--amarelo-sf);border-color:#FDE68A\"><h4 style=\"font-size:15px;color:var(--amarelo-dk)\">🟡 Limite</h4><p style=\"font-size:13.5px;color:#92400E\">~50 perguntas por dia</p></div>\n  </div>\n  <div class=\"card\" style=\"background:var(--laranja-soft);border-color:#FDBA74;margin-bottom:16px\">\n    <h4 style=\"color:#C2410C\">A diferença que importa</h4>\n    <p style=\"color:#9A3412;font-size:15px\">As outras três respondem pelo que aprenderam na internet — e por isso <strong>podem inventar</strong>. O NotebookLM responde <strong>só pelo documento que você entregou</strong> e mostra a página. É a ferramenta certa para BNCC, PPP, lei e regimento.</p>\n  </div>\n  <div class=\"etiqueta laranja\">✅ Teste na tela agora</div>\n  <div class=\"prompt\" style=\"font-size:14px\">Quais habilidades de [DISCIPLINA] do [ANO] tratam de [TEMA]?\nListe o código e a descrição de cada uma.</div><div class=\"prompt-acoes\" data-prompt-txt=\"Quais habilidades de [DISCIPLINA] do [ANO] tratam de [TEMA]?\nListe o código e a descrição de cada uma.\"></div>\n</div>\n</div>",
        "secaoApostila": "1.7",
        "blocos": [
          {
            "tipo": "texto",
            "html": "NotebookLM · notebooklm.google.com\n\n\n  \n    📨 EnviaTexto, arquivo e link\n    📩 DevolveTexto + citação\n    🟡 Limite~50 perguntas por dia\n  \n  \n    A diferença que importa\n    As outras três respondem pelo que aprenderam na internet — e por isso podem inventar. O NotebookLM responde só pelo documento que você entregou e mostra a página. É a ferramenta certa para BNCC, PPP, lei e regimento.\n  \n  ✅ Teste na tela agora"
          },
          {
            "tipo": "prompt",
            "texto": "Quais habilidades de [DISCIPLINA] do [ANO] tratam de [TEMA]?\nListe o código e a descrição de cada uma.",
            "variaveis": [
              "DISCIPLINA",
              "ANO",
              "TEMA"
            ]
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "notebooklm"
            ]
          }
        ]
      },
      {
        "titulo": "Qual ferramenta usar em cada situação",
        "html": "<div class=\"slide\" data-n=\"13\" data-title=\"Qual ferramenta usar em cada situação\" data-enc=\"1\" data-pos=\"apos:E5\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 1.8 · Cole no mural</div>\n<h1 class=\"st\">\"Tenho quatro abas abertas. Em qual eu digito?\"</h1>\n<div class=\"corpo alto\">\n<table>\n  <thead><tr><th style=\"width:36%\">Quando você precisa de…</th><th style=\"width:22%\">Use primeiro</th><th style=\"width:42%\">Por quê</th></tr></thead>\n  <tbody>\n    <tr><td>Plano de aula, atividade, projeto</td><td class=\"fer\" style=\"color:#4285F4\">Gemini</td><td>Bom em português e já está na sua conta Google</td></tr>\n    <tr><td>Conta, fórmula, raciocínio</td><td class=\"fer\" style=\"color:#4D6BFE\">DeepSeek</td><td>O mais forte em matemática; mostra o passo a passo</td></tr>\n    <tr><td>BNCC, PPP, livro didático, lei</td><td class=\"fer\" style=\"color:#F97316\">NotebookLM</td><td>Responde só pelo documento e cita a página</td></tr>\n    <tr><td>Texto delicado: família, parecer, ata</td><td class=\"fer\" style=\"color:#10A37F\">ChatGPT</td><td>O melhor em tom e nuance de escrita</td></tr>\n    <tr><td>A ferramenta travou</td><td class=\"fer\">A outra</td><td><strong>A Regra dos Dois Barcos:</strong> copie o prompt e cole na segunda aba</td></tr>\n  </tbody>\n</table>\n<div class=\"atencao\" style=\"margin-top:14px\">\n  <div class=\"t\">⚠️ Vale para as quatro</div>\n  <p>Nenhuma pode receber dado que identifique aluno: nome completo, laudo, endereço, foto, nota com nome. Regra de bolso: <strong>\"aluno fictício de 9 anos\"</strong>, nunca <strong>\"o Pedro do 4ºB\"</strong>.</p>\n</div>\n</div>\n</div>",
        "secaoApostila": "1.8",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.8 · Cole no mural\n\n\n\n  Quando você precisa de…Use primeiroPor quê\n  \n    Plano de aula, atividade, projetoGeminiBom em português e já está na sua conta Google\n    Conta, fórmula, raciocínioDeepSeekO mais forte em matemática; mostra o passo a passo\n    BNCC, PPP, livro didático, leiNotebookLMResponde só pelo documento e cita a página\n    Texto delicado: família, parecer, ataChatGPTO melhor em tom e nuance de escrita\n    A ferramenta travouA outraA Regra dos Dois Barcos: copie o prompt e cole na segunda aba\n  \n\n\n  ⚠️ Vale para as quatro\n  Nenhuma pode receber dado que identifique aluno: nome completo, laudo, endereço, foto, nota com nome. Regra de bolso: \"aluno fictício de 9 anos\", nunca \"o Pedro do 4ºB\"."
          }
        ]
      },
      {
        "titulo": "Momento: criando as contas juntos",
        "html": "<div class=\"slide\" data-n=\"14\" data-title=\"Momento: criando as contas juntos\" data-enc=\"1\" data-pos=\"apos:E6\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Mão na Massa 0 · 15 minutos</div>\n<h1 class=\"st\">Agora vamos criar as contas — juntos</h1>\n<div class=\"corpo alto\">\n  <p class=\"lead\" style=\"margin-bottom:16px\">Nesta ordem. Começamos pela mais fácil e terminamos na que exige mais paciência. <strong>Ninguém segue para o Capítulo 2 com conta pela metade.</strong></p>\n  <div class=\"col\" style=\"gap:11px\">\n    <div class=\"card\" style=\"display:flex;gap:16px;align-items:center;padding:14px 18px;border-left:5px solid #4285F4\">\n      <div style=\"width:36px;height:36px;border-radius:50%;background:#4285F4;color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--titulo);font-weight:800;font-size:18px;flex-shrink:0\">1</div>\n      <div style=\"flex:1\"><h4 style=\"margin-bottom:2px\">Gemini <span style=\"font-size:13px;color:var(--cinza);font-weight:700\">· 1 min</span></h4><p style=\"font-size:14px\"><a class=\"mono url-ia\" href=\"https://gemini.google.com\" target=\"_blank\" rel=\"noopener\">gemini.google.com</a> → \"Fazer login\" → <strong>sua conta Google de sempre</strong></p></div>\n    </div>\n    <div class=\"card\" style=\"display:flex;gap:16px;align-items:center;padding:14px 18px;border-left:5px solid #F97316\">\n      <div style=\"width:36px;height:36px;border-radius:50%;background:#F97316;color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--titulo);font-weight:800;font-size:18px;flex-shrink:0\">2</div>\n      <div style=\"flex:1\"><h4 style=\"margin-bottom:2px\">NotebookLM <span style=\"font-size:13px;color:var(--cinza);font-weight:700\">· 1 min</span></h4><p style=\"font-size:14px\"><a class=\"mono url-ia\" href=\"https://notebooklm.google.com\" target=\"_blank\" rel=\"noopener\">notebooklm.google.com</a> → <strong>mesma conta Google</strong> → \"Criar novo\"</p></div>\n    </div>\n    <div class=\"card\" style=\"display:flex;gap:16px;align-items:center;padding:14px 18px;border-left:5px solid #4D6BFE\">\n      <div style=\"width:36px;height:36px;border-radius:50%;background:#4D6BFE;color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--titulo);font-weight:800;font-size:18px;flex-shrink:0\">3</div>\n      <div style=\"flex:1\"><h4 style=\"margin-bottom:2px\">DeepSeek <span style=\"font-size:13px;color:var(--cinza);font-weight:700\">· 2 min</span></h4><p style=\"font-size:14px\"><a class=\"mono url-ia\" href=\"https://chat.deepseek.com\" target=\"_blank\" rel=\"noopener\">chat.deepseek.com</a> → \"Sign up\" → <strong>\"Continue with Google\"</strong></p></div>\n    </div>\n    <div class=\"card\" style=\"display:flex;gap:16px;align-items:center;padding:14px 18px;border-left:5px solid #10A37F\">\n      <div style=\"width:36px;height:36px;border-radius:50%;background:#10A37F;color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--titulo);font-weight:800;font-size:18px;flex-shrink:0\">4</div>\n      <div style=\"flex:1\"><h4 style=\"margin-bottom:2px\">ChatGPT <span style=\"font-size:13px;color:var(--cinza);font-weight:700\">· 3 min</span></h4><p style=\"font-size:14px\"><a class=\"mono url-ia\" href=\"https://chatgpt.com\" target=\"_blank\" rel=\"noopener\">chatgpt.com</a> → \"Cadastre-se\" → \"Continuar com Google\" <em>(pode pedir SMS)</em></p></div>\n    </div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "1.8",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Mão na Massa 0 · 15 minutos\n\n\n  Nesta ordem. Começamos pela mais fácil e terminamos na que exige mais paciência. Ninguém segue para o Capítulo 2 com conta pela metade.\n  \n    \n      1\n      Gemini · 1 mingemini.google.com → \"Fazer login\" → sua conta Google de sempre\n    \n    \n      2\n      NotebookLM · 1 minnotebooklm.google.com → mesma conta Google → \"Criar novo\"\n    \n    \n      3\n      DeepSeek · 2 minchat.deepseek.com → \"Sign up\" → \"Continue with Google\"\n    \n    \n      4\n      ChatGPT · 3 minchatgpt.com → \"Cadastre-se\" → \"Continuar com Google\" (pode pedir SMS)"
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "chatgpt",
              "gemini",
              "deepseek",
              "notebooklm"
            ]
          }
        ]
      },
      {
        "titulo": "Três cuidados ao criar conta",
        "html": "<div class=\"slide\" data-n=\"15\" data-title=\"Três cuidados ao criar conta\" data-enc=\"1\" data-pos=\"apos:E7\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">Antes de sair desta tela</div>\n<h1 class=\"st\">Três cuidados que evitam dor de cabeça</h1>\n<div class=\"corpo\">\n  <div class=\"grid3\" style=\"margin-bottom:20px\">\n    <div class=\"card\" style=\"border-top:5px solid var(--vermelho)\">\n      <h4 style=\"color:var(--vermelho-dk)\">💳 Nunca coloque cartão</h4>\n      <p>Nenhuma das quatro exige cartão para o trabalho escolar. Se uma tela pedir, <strong>feche</strong>: você está na página do plano pago, não na versão gratuita.</p>\n    </div>\n    <div class=\"card\" style=\"border-top:5px solid var(--amarelo)\">\n      <h4 style=\"color:var(--amarelo-dk)\">📝 Anote como entrou</h4>\n      <p>\"Entrei com o Google\" ou \"criei senha\". Daqui a três semanas você não vai lembrar — e vai achar que perdeu a conta.</p>\n    </div>\n    <div class=\"card\" style=\"border-top:5px solid var(--indigo)\">\n      <h4 style=\"color:var(--indigo-dark)\">🔑 Senha diferente</h4>\n      <p>Se criar senha nova, não use a mesma do seu e-mail principal. Vale para qualquer serviço, não só estes.</p>\n    </div>\n  </div>\n  <div class=\"dica\">\n    <div class=\"t\">💡 Travou em alguma? Levante a mão</div>\n    <p>É para isso que este momento existe. Criar conta às pressas, sozinho, na véspera de uma aula — <strong>é assim que as pessoas desistem da IA.</strong> Resolvemos agora, com tempo e com ajuda.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "1.8",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Antes de sair desta tela\n\n\n  \n    \n      💳 Nunca coloque cartão\n      Nenhuma das quatro exige cartão para o trabalho escolar. Se uma tela pedir, feche: você está na página do plano pago, não na versão gratuita.\n    \n    \n      📝 Anote como entrou\n      \"Entrei com o Google\" ou \"criei senha\". Daqui a três semanas você não vai lembrar — e vai achar que perdeu a conta.\n    \n    \n      🔑 Senha diferente\n      Se criar senha nova, não use a mesma do seu e-mail principal. Vale para qualquer serviço, não só estes.\n    \n  \n  \n    💡 Travou em alguma? Levante a mão\n    É para isso que este momento existe. Criar conta às pressas, sozinho, na véspera de uma aula — é assim que as pessoas desistem da IA. Resolvemos agora, com tempo e com ajuda."
          }
        ]
      },
      {
        "titulo": "Suas quatro contas — checklist",
        "html": "<div class=\"slide com-ia\" data-n=\"16\" data-title=\"Suas quatro contas — checklist\" data-enc=\"1\" data-pos=\"apos:E8\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">Fechamento do momento ferramentas</div>\n<h1 class=\"st\">Antes de seguirmos: você tem seus dois barcos?</h1>\n<div class=\"corpo\">\n  <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0;margin-bottom:18px\">\n    <h4 style=\"color:#065F46\">✅ O mínimo para continuar o curso</h4>\n    <p style=\"color:#047857;font-size:15.5px\">Duas ferramentas de texto funcionando — <strong>Gemini e DeepSeek</strong> é a dupla recomendada. As outras duas você completa em casa, com calma.</p>\n  </div>\n  <div class=\"grid2\" style=\"gap:16px\">\n    <div class=\"card\" style=\"padding:18px\">\n      <h4 style=\"font-size:16px\"><span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Gemini</span></span> &nbsp;&nbsp; <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">NotebookLM</span></span></h4>\n      <p style=\"font-size:14px\">Mesma conta Google. Se uma funciona, a outra funciona.</p>\n    </div>\n    <div class=\"card\" style=\"padding:18px\">\n      <h4 style=\"font-size:16px\"><span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">DeepSeek</span></span> &nbsp;&nbsp; <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">ChatGPT</span></span></h4>\n      <p style=\"font-size:14px\">Cadastro próprio. O ChatGPT pode pedir SMS — deixe para casa se o sinal estiver ruim.</p>\n    </div>\n  </div>\n  <div class=\"lilas\" style=\"margin-top:18px\">\n    <div class=\"t\">Na apostila</div>\n    <p>O <strong>Capítulo 1.7</strong> traz a ficha completa das quatro, o <strong>1.8</strong> a tabela de qual usar quando, e o <strong>1.9</strong> este passo a passo com a lista para marcar. O <strong>Anexo B</strong> detalha os limites de cada uma.</p>\n  </div>\n</div>\n<div class=\"ia-barra\"><span class=\"rot\">Abrir agora</span><div class=\"ia-btns\"><a class=\"ia-btn gemini\" href=\"https://gemini.google.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>Gemini</a><a class=\"ia-btn chatgpt\" href=\"https://chatgpt.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>ChatGPT</a><a class=\"ia-btn deepseek\" href=\"https://chat.deepseek.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>DeepSeek</a><a class=\"ia-btn notebook\" href=\"https://notebooklm.google.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>NotebookLM</a></div></div>\n</div>",
        "secaoApostila": "1.8",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Fechamento do momento ferramentas\n\n\n  \n    ✅ O mínimo para continuar o curso\n    Duas ferramentas de texto funcionando — Gemini e DeepSeek é a dupla recomendada. As outras duas você completa em casa, com calma.\n  \n  \n    \n          \n      Mesma conta Google. Se uma funciona, a outra funciona.\n    \n    \n          \n      Cadastro próprio. O ChatGPT pode pedir SMS — deixe para casa se o sinal estiver ruim.\n    \n  \n  \n    Na apostila\n    O Capítulo 1.7 traz a ficha completa das quatro, o 1.8 a tabela de qual usar quando, e o 1.9 este passo a passo com a lista para marcar. O Anexo B detalha os limites de cada uma."
          },
          {
            "tipo": "checklist",
            "itens": [
              "Gemini",
              "NotebookLM",
              "DeepSeek",
              "ChatGPT"
            ]
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "chatgpt",
              "gemini",
              "deepseek",
              "notebooklm"
            ]
          }
        ]
      },
      {
        "titulo": "A Regra dos Dois Barcos",
        "html": "<div class=\"slide com-fig\" data-n=\"17\" data-title=\"A Regra dos Dois Barcos\">\r\n<div class=\"topo amarelo\"></div>\r\n<div class=\"badge amarelo\">Capítulo 1.4 · Estratégia de ouro</div>\r\n<h1 class=\"st\">A Regra dos Dois Barcos</h1>\r\n<div class=\"corpo\">\r\n  <p class=\"lead\" style=\"margin-bottom:20px\">Toda ferramenta gratuita tem um limite. Se você depender de uma só, uma hora vai ficar na mão — geralmente na noite de domingo, com a aula de segunda por preparar.</p>\r\n  <div class=\"grid2\" style=\"margin-bottom:20px\">\r\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\">\r\n      <div style=\"font-size:44px;margin-bottom:8px\">🚣</div>\r\n      <h4 style=\"color:var(--indigo-dark)\">Barco 1</h4>\r\n      <p style=\"color:#3730A3\">Sua ferramenta principal.<br><strong>Ex: Google Gemini</strong></p>\r\n    </div>\r\n    <div class=\"card\" style=\"text-align:center;background:var(--laranja-soft);border-color:#FDBA74\">\r\n      <div style=\"font-size:44px;margin-bottom:8px\">🚣</div>\r\n      <h4 style=\"color:#C2410C\">Barco 2</h4>\r\n      <p style=\"color:#9A3412\">Sua reserva, sempre aberta.<br><strong>Ex: DeepSeek</strong></p>\r\n    </div>\r\n  </div>\r\n  <div class=\"dica\">\r\n    <div class=\"t\">💡 Na prática</div>\r\n    <p>Mantenha <strong>duas abas abertas</strong> no navegador. Se uma travar ou atingir a cota, copie o mesmo comando e cole na outra. <strong>Crie conta nas duas hoje</strong>, antes de precisar — quem cria às pressas, no meio da tarefa, acaba desistindo.</p>\r\n  </div>\r\n</div>\r\n<div class=\"fig-slide\"><img src=\"/curso/imagens/03_dois_barcos_estrategia.png\" alt=\"A Regra dos Dois Barcos: nunca dependa de uma ferramenta só.\"><div class=\"fig-leg\">A Regra dos Dois Barcos: nunca dependa de uma ferramenta só.</div></div>\n</div>",
        "secaoApostila": "1.4",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.4 · Estratégia de ouro\n\n\n  Toda ferramenta gratuita tem um limite. Se você depender de uma só, uma hora vai ficar na mão — geralmente na noite de domingo, com a aula de segunda por preparar.\n  \n    \n      🚣\n      Barco 1\n      Sua ferramenta principal.\nEx: Google Gemini\n    \n    \n      🚣\n      Barco 2\n      Sua reserva, sempre aberta.\nEx: DeepSeek\n    \n  \n  \n    💡 Na prática\n    Mantenha duas abas abertas no navegador. Se uma travar ou atingir a cota, copie o mesmo comando e cole na outra. Crie conta nas duas hoje, antes de precisar — quem cria às pressas, no meio da tarefa, acaba desistindo."
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/03_dois_barcos_estrategia.png",
            "legenda": "A Regra dos Dois Barcos: nunca dependa de uma ferramenta só."
          }
        ]
      },
      {
        "titulo": "O que a IA NÃO consegue fazer",
        "html": "<div class=\"slide\" data-n=\"18\" data-title=\"O que a IA NÃO consegue fazer\">\r\n<div class=\"topo vermelho\"></div>\r\n<div class=\"badge vermelho\">Capítulo 1.6</div>\r\n<h1 class=\"st\">O que a IA <span class=\"lar\">não</span> consegue fazer</h1>\r\n<div class=\"corpo\">\r\n  <div class=\"grid2\" style=\"margin-bottom:18px\">\r\n    <div class=\"card\"><h4>🤥 Ela pode inventar</h4><p>Gera informações falsas com total convicção. Pode citar um livro que não existe ou uma lei que nunca foi aprovada.</p></div>\r\n    <div class=\"card\"><h4>🏫 Não conhece sua escola</h4><p>Não sabe que falta laboratório, que o 3ºB é agitado ou que um aluno tem laudo. Você precisa contar.</p></div>\r\n    <div class=\"card\"><h4>⚖️ Não substitui seu julgamento</h4><p>Pode sugerir uma rubrica, mas quem decide a nota é você, que conhece o contexto.</p></div>\r\n    <div class=\"card\"><h4>🎓 Não tem bom senso pedagógico</h4><p>Pode propor uma atividade linda e inviável com 35 alunos numa tarde quente.</p></div>\r\n  </div>\r\n  <div class=\"traduzindo\">\r\n    <div class=\"t\">📖 Traduzindo: Alucinação da IA</div>\r\n    <p>É quando a IA inventa algo que parece verdade. Não é má-fé — ela tenta completar o texto de forma coerente mesmo sem ter certeza. É como o aluno que, na prova oral, não sabe a resposta e tenta enrolar com confiança. <strong>Regra de ouro: nunca copie números, datas, leis ou citações sem verificar.</strong></p>\r\n  </div>\r\n</div>\r\n</div>",
        "secaoApostila": "1.6",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.6\n\n\n  \n    🤥 Ela pode inventarGera informações falsas com total convicção. Pode citar um livro que não existe ou uma lei que nunca foi aprovada.\n    🏫 Não conhece sua escolaNão sabe que falta laboratório, que o 3ºB é agitado ou que um aluno tem laudo. Você precisa contar.\n    ⚖️ Não substitui seu julgamentoPode sugerir uma rubrica, mas quem decide a nota é você, que conhece o contexto.\n    🎓 Não tem bom senso pedagógicoPode propor uma atividade linda e inviável com 35 alunos numa tarde quente.\n  \n  \n    📖 Traduzindo: Alucinação da IA\n    É quando a IA inventa algo que parece verdade. Não é má-fé — ela tenta completar o texto de forma coerente mesmo sem ter certeza. É como o aluno que, na prova oral, não sabe a resposta e tenta enrolar com confiança. Regra de ouro: nunca copie números, datas, leis ou citações sem verificar."
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 1 — a IA citou uma fonte",
        "html": "<div class=\"slide\" data-n=\"19\" data-title=\"Caça ao Erro 1 — a IA citou uma fonte\" data-enc=\"1\" data-pos=\"apos:8\">\n<div class=\"topo amarelo\"></div>\n<div class=\"badge amarelo\">🕵️ Caça ao Erro 1 · 4 min</div>\n<h1 class=\"st\">A IA citou três livros. Um não existe.</h1>\n<div class=\"sl-caca\" style=\"top:150px;height:auto;padding:0 70px\">\n  <div class=\"resp\">\n    1. <em>Psicogênese da Língua Escrita</em> — Emília Ferreiro e Ana Teberosky (1985)<br><br>\n    2. <em>A Importância do Ato de Ler</em> — Paulo Freire (1981)<br><br>\n    3. <em>Alfabetização em Classes Populares Brasileiras</em> — Marta Vasconcelos, Editora Pedagógica Nacional (1994), <strong>página 87</strong>, que demonstra que <strong>87% das crianças alfabetizadas com método fônico apresentam melhor desempenho</strong>.\n  </div>\n  <div class=\"desafio-txt\">🔍 Vocês têm 2 minutos: qual é o suspeito? Como confirmariam?</div>\n</div>\n</div>",
        "secaoApostila": "1.6",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕵️ Caça ao Erro 1 · 4 min\n\n\n  \n    1. Psicogênese da Língua Escrita — Emília Ferreiro e Ana Teberosky (1985)\n\n\n    2. A Importância do Ato de Ler — Paulo Freire (1981)\n\n\n    3. Alfabetização em Classes Populares Brasileiras — Marta Vasconcelos, Editora Pedagógica Nacional (1994), página 87, que demonstra que 87% das crianças alfabetizadas com método fônico apresentam melhor desempenho.\n  \n  🔍 Vocês têm 2 minutos: qual é o suspeito? Como confirmariam?"
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 1 — gabarito",
        "html": "<div class=\"slide\" data-n=\"20\" data-title=\"Caça ao Erro 1 — gabarito\" data-enc=\"1\" data-pos=\"apos:A2\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">🎯 Gabarito</div>\n<h1 class=\"st\">O item 3 é inventado — e repare como engana</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\">\n    <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0\">\n      <h4 style=\"color:var(--verde-dark)\">✅ Reais</h4>\n      <p style=\"color:#047857\">Os itens <strong>1 e 2</strong> existem e são clássicos da área.</p>\n    </div>\n    <div class=\"card\" style=\"background:var(--vermelho-sf);border-color:#FBD5D5\">\n      <h4 style=\"color:var(--vermelho-dk)\">❌ Inventado</h4>\n      <p style=\"color:#991B1B\">O livro, a autora, a editora, a página e a estatística <strong>não existem</strong>.</p>\n    </div>\n  </div>\n  <div class=\"dica\">\n    <div class=\"t\">💡 O sinal de alerta</div>\n    <p>Quanto <strong>mais específico</strong> o dado (página exata, percentual quebrado), <strong>mais desconfiança ele merece</strong>. É justamente essa precisão falsa que convence.</p>\n  </div>\n  <div class=\"traduzindo\">\n    <div class=\"t\">🔎 Como confirmar em 10 segundos</div>\n    <p>Busque o título <strong>entre aspas</strong> no Google. Se um livro real não aparece em nenhuma livraria ou biblioteca, ele não existe.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "1.6",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎯 Gabarito\n\n\n  \n    \n      ✅ Reais\n      Os itens 1 e 2 existem e são clássicos da área.\n    \n    \n      ❌ Inventado\n      O livro, a autora, a editora, a página e a estatística não existem.\n    \n  \n  \n    💡 O sinal de alerta\n    Quanto mais específico o dado (página exata, percentual quebrado), mais desconfiança ele merece. É justamente essa precisão falsa que convence.\n  \n  \n    🔎 Como confirmar em 10 segundos\n    Busque o título entre aspas no Google. Se um livro real não aparece em nenhuma livraria ou biblioteca, ele não existe."
          }
        ]
      },
      {
        "titulo": "Mão na Massa 1 — Seus dois barcos",
        "html": "<div class=\"slide\" data-n=\"21\" data-title=\"Mão na Massa 1 — Seus dois barcos\">\r\n<div class=\"topo laranja\"></div>\r\n<div class=\"badge laranja\">Oficina prática · 15 minutos</div>\r\n<h1 class=\"st\">Mão na Massa 1 — Seus dois barcos</h1>\r\n<div class=\"corpo\">\r\n  <div class=\"oficina\" style=\"margin-bottom:18px\">\r\n    <div class=\"t\">✋ Agora é a sua vez</div>\r\n    <ol>\r\n      <li>Crie conta em <strong>duas</strong> ferramentas de texto (sugestão: Gemini + DeepSeek).</li>\r\n      <li>Faça a <em>mesma</em> pergunta nas duas: <em>\"Me dê 3 ideias de atividade para ensinar [um tema que você vai dar esta semana] para o [seu ano escolar].\"</em></li>\r\n      <li>Compare as respostas. Qual foi mais útil para a sua realidade?</li>\r\n      <li>Peça a uma delas: <em>\"Refaça a ideia 2 com materiais que custem menos de 10 reais.\"</em></li>\r\n    </ol>\r\n  </div>\r\n  <div class=\"grid2\">\r\n    <div class=\"card\" style=\"padding:15px\"><p style=\"font-size:14px\"><strong>Endereços:</strong> <a class=\"mono url-ia\" href=\"https://gemini.google.com\" target=\"_blank\" rel=\"noopener\">gemini.google.com</a> · <a class=\"mono url-ia\" href=\"https://chat.deepseek.com\" target=\"_blank\" rel=\"noopener\">chat.deepseek.com</a></p></div>\r\n    <div class=\"card\" style=\"padding:15px\"><p style=\"font-size:14px\">💡 Anote qual ferramenta você prefere para cada tipo de tarefa.</p></div>\r\n  </div>\r\n</div>\r\n</div>",
        "secaoApostila": "1.6",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 15 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Crie conta em duas ferramentas de texto (sugestão: Gemini + DeepSeek).\n      Faça a mesma pergunta nas duas: \"Me dê 3 ideias de atividade para ensinar [um tema que você vai dar esta semana] para o [seu ano escolar].\"\n      Compare as respostas. Qual foi mais útil para a sua realidade?\n      Peça a uma delas: \"Refaça a ideia 2 com materiais que custem menos de 10 reais.\"\n    \n  \n  \n    Endereços: gemini.google.com · chat.deepseek.com\n    💡 Anote qual ferramenta você prefere para cada tipo de tarefa."
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "gemini",
              "deepseek"
            ]
          }
        ]
      },
      {
        "titulo": "O que é um prompt? A metáfora do restaurante",
        "html": "<div class=\"slide\" data-n=\"22\" data-title=\"O que é um prompt? A metáfora do restaurante\">\r\n<div class=\"topo\"></div>\r\n<div class=\"badge\">Capítulo 2.1</div>\r\n<h1 class=\"st\">O que é um prompt?</h1>\r\n<div class=\"corpo\">\r\n  <p class=\"lead\" style=\"margin-bottom:18px\">Prompt é apenas <strong>a frase que você digita</strong> na caixa de conversa da IA. Um pedido, uma pergunta, uma instrução.</p>\r\n  <div class=\"grid2\" style=\"margin-bottom:18px\">\r\n    <div class=\"card\" style=\"background:var(--vermelho-sf);border-color:#FBD5D5\">\r\n      <h4 style=\"color:var(--vermelho-dk)\">🍽️ \"Me traga comida\"</h4>\r\n      <p style=\"color:#991B1B\">O garçom fica perdido. Que tipo? Salgado ou doce? Você tem alguma restrição?</p>\r\n    </div>\r\n    <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0\">\r\n      <h4 style=\"color:var(--verde-dark)\">🍽️ Um pedido detalhado</h4>\r\n      <p style=\"color:#047857\">O garçom sabe exatamente o que trazer. Com a IA funciona igual.</p>\r\n    </div>\r\n  </div>\r\n  <div class=\"traduzindo\">\r\n    <div class=\"t\">📖 Traduzindo: Engenharia de Prompt</div>\r\n    <p>É a técnica de escrever instruções claras e detalhadas. Não é \"engenharia\" no sentido técnico — é aprender a dar instruções precisas para um assistente muito rápido, <strong>mas que não consegue ler sua mente</strong>.</p>\r\n  </div>\r\n</div>\r\n</div>",
        "secaoApostila": "2.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 2.1\n\n\n  Prompt é apenas a frase que você digita na caixa de conversa da IA. Um pedido, uma pergunta, uma instrução.\n  \n    \n      🍽️ \"Me traga comida\"\n      O garçom fica perdido. Que tipo? Salgado ou doce? Você tem alguma restrição?\n    \n    \n      🍽️ Um pedido detalhado\n      O garçom sabe exatamente o que trazer. Com a IA funciona igual.\n    \n  \n  \n    📖 Traduzindo: Engenharia de Prompt\n    É a técnica de escrever instruções claras e detalhadas. Não é \"engenharia\" no sentido técnico — é aprender a dar instruções precisas para um assistente muito rápido, mas que não consegue ler sua mente."
          }
        ]
      },
      {
        "titulo": "A Fórmula P.T.C.F.",
        "html": "<div class=\"slide com-fig\" data-n=\"23\" data-title=\"A Fórmula P.T.C.F.\">\r\n<div class=\"topo\"></div>\r\n<div class=\"badge\">Capítulo 2.2 · O coração do curso</div>\r\n<h1 class=\"st\">A Fórmula P.T.C.F. — sua receita de bolo</h1>\r\n<div class=\"corpo alto\">\r\n  <div class=\"col\" style=\"gap:11px;justify-content:center\">\r\n    <div class=\"card\" style=\"display:flex;gap:16px;align-items:flex-start;padding:14px 18px;border-left:5px solid var(--indigo)\">\r\n      <div style=\"width:38px;height:38px;border-radius:50%;background:var(--indigo);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--titulo);font-weight:800;font-size:20px;flex-shrink:0\">P</div>\r\n      <div><h4 style=\"margin-bottom:3px\">Papel — quem a IA deve fingir ser</h4><p style=\"font-size:14px;font-style:italic;color:var(--indigo)\">\"Aja como uma professora de alfabetização com 20 anos de experiência em escolas públicas do interior.\"</p></div>\r\n    </div>\r\n    <div class=\"card\" style=\"display:flex;gap:16px;align-items:flex-start;padding:14px 18px;border-left:5px solid var(--indigo)\">\r\n      <div style=\"width:38px;height:38px;border-radius:50%;background:var(--indigo);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--titulo);font-weight:800;font-size:20px;flex-shrink:0\">T</div>\r\n      <div><h4 style=\"margin-bottom:3px\">Tarefa — o que exatamente você quer</h4><p style=\"font-size:14px;font-style:italic;color:var(--indigo)\">\"Elabore uma sequência didática de 3 aulas sobre o sistema respiratório.\"</p></div>\r\n    </div>\r\n    <div class=\"card\" style=\"display:flex;gap:16px;align-items:flex-start;padding:14px 18px;border-left:5px solid var(--laranja);background:var(--laranja-soft)\">\r\n      <div style=\"width:38px;height:38px;border-radius:50%;background:var(--laranja);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--titulo);font-weight:800;font-size:20px;flex-shrink:0\">C</div>\r\n      <div><h4 style=\"margin-bottom:3px;color:#C2410C\">Contexto — a sua realidade <span style=\"font-size:13px;font-weight:700\">(a letra mais esquecida!)</span></h4><p style=\"font-size:14px;font-style:italic;color:#9A3412\">\"Meus alunos têm 11 anos, a escola fica na zona rural e não tem internet na sala. Muitos são filhos de agricultores.\"</p></div>\r\n    </div>\r\n    <div class=\"card\" style=\"display:flex;gap:16px;align-items:flex-start;padding:14px 18px;border-left:5px solid var(--indigo)\">\r\n      <div style=\"width:38px;height:38px;border-radius:50%;background:var(--indigo);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--titulo);font-weight:800;font-size:20px;flex-shrink:0\">F</div>\r\n      <div><h4 style=\"margin-bottom:3px\">Formato — como você quer receber</h4><p style=\"font-size:14px;font-style:italic;color:var(--indigo)\">\"Entregue em tabela com colunas: Momento da Aula | Duração | Atividade | Material.\"</p></div>\r\n    </div>\r\n  </div>\r\n</div>\r\n<div class=\"fig-slide\"><img src=\"/curso/imagens/02_formula_ptcf_esquema.png\" alt=\"A fórmula P.T.C.F., estrutura recomendada para prompts pedagógicos.\"><div class=\"fig-leg\">A fórmula P.T.C.F., estrutura recomendada para prompts pedagógicos.</div></div>\n</div>",
        "secaoApostila": "2.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 2.2 · O coração do curso\n\n\n  \n    \n      P\n      Papel — quem a IA deve fingir ser\"Aja como uma professora de alfabetização com 20 anos de experiência em escolas públicas do interior.\"\n    \n    \n      T\n      Tarefa — o que exatamente você quer\"Elabore uma sequência didática de 3 aulas sobre o sistema respiratório.\"\n    \n    \n      C\n      Contexto — a sua realidade (a letra mais esquecida!)\"Meus alunos têm 11 anos, a escola fica na zona rural e não tem internet na sala. Muitos são filhos de agricultores.\"\n    \n    \n      F\n      Formato — como você quer receber\"Entregue em tabela com colunas: Momento da Aula | Duração | Atividade | Material.\""
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/02_formula_ptcf_esquema.png",
            "legenda": "A fórmula P.T.C.F., estrutura recomendada para prompts pedagógicos."
          }
        ]
      },
      {
        "titulo": "Prompt ruim vs. prompt bom",
        "html": "<div class=\"slide com-acoes\" data-n=\"24\" data-title=\"Prompt ruim vs. prompt bom\">\r\n<div class=\"topo\"></div>\r\n<div class=\"badge\">Capítulo 2.3 · A diferença na prática</div>\r\n<h1 class=\"st\">Prompt ruim vs. prompt bom</h1>\r\n<div class=\"corpo\">\r\n  <div class=\"etiqueta vermelha\">❌ Evite</div>\r\n  <div class=\"prompt\" style=\"margin-bottom:6px\">Crie uma atividade de matemática.</div>\r\n  <p style=\"font-size:14px;color:var(--cinza);font-style:italic;margin-bottom:16px\">Resultado: algo genérico, sem saber o ano, o tema, o nível ou o objetivo.</p>\r\n  <div class=\"etiqueta verde\">✅ Use este</div>\r\n  <div class=\"prompt p12\">Aja como uma professora de Matemática do 4º ano. Crie uma atividade de\r\n30 minutos sobre multiplicação por 2 e por 3, usando situações do\r\ncotidiano de uma criança que mora em cidade pequena (ir à padaria,\r\ncontar ovos na granja). A atividade deve ter: (1) um texto motivador\r\ncurto, (2) 5 exercícios com grau crescente de dificuldade, (3) um\r\ndesafio bônus para os alunos mais rápidos. Entregue formatado e\r\npronto para imprimir.</div><div class=\"prompt-acoes\" data-prompt-txt=\"Aja como uma professora de Matemática do 4º ano. Crie uma atividade de\n30 minutos sobre multiplicação por 2 e por 3, usando situações do\ncotidiano de uma criança que mora em cidade pequena (ir à padaria,\ncontar ovos na granja). A atividade deve ter: (1) um texto motivador\ncurto, (2) 5 exercícios com grau crescente de dificuldade, (3) um\ndesafio bônus para os alunos mais rápidos. Entregue formatado e\npronto para imprimir.\"></div>\r\n</div>\r\n</div>",
        "secaoApostila": "2.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 2.3 · A diferença na prática\n\n\n  ❌ Evite\n  \n  Resultado: algo genérico, sem saber o ano, o tema, o nível ou o objetivo.\n  ✅ Use este"
          },
          {
            "tipo": "prompt",
            "texto": "Aja como uma professora de Matemática do 4º ano. Crie uma atividade de\n30 minutos sobre multiplicação por 2 e por 3, usando situações do\ncotidiano de uma criança que mora em cidade pequena (ir à padaria,\ncontar ovos na granja). A atividade deve ter: (1) um texto motivador\ncurto, (2) 5 exercícios com grau crescente de dificuldade, (3) um\ndesafio bônus para os alunos mais rápidos. Entregue formatado e\npronto para imprimir.",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Duelo 1 — a atividade genérica",
        "html": "<div class=\"slide\" data-n=\"25\" data-title=\"Duelo 1 — a atividade genérica\" data-enc=\"1\" data-pos=\"apos:12\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">⚔️ Duelo 1 · 7 min</div>\n<h1 class=\"st\">A atividade genérica</h1>\n<div class=\"sl-duelo\" style=\"top:150px;padding:0 70px 40px\">\n  <div class=\"lado\">\n    <div class=\"box ruim\">\n      <div class=\"rot\">❌ O que quase todo mundo escreve</div>\n      <div class=\"pr\">Crie uma atividade de matemática.</div>\n      <div class=\"res\"><strong>A IA devolve:</strong> contas soltas, sem ano escolar, sem contexto, sem objetivo. Serve para qualquer turma — ou seja, não serve para a sua.</div>\n    </div>\n    <div class=\"box bom\">\n      <div class=\"rot\">✅ O mesmo pedido com P.T.C.F.</div>\n      <div class=\"pr\">Aja como professora de Matemática\ndo 4º ano. Crie uma atividade de\n30 min sobre multiplicação por 2 e 3,\ncom situações do cotidiano de uma\ncriança de cidade pequena (padaria,\ncontar ovos na granja).\nInclua: texto motivador, 5 exercícios\ncrescentes e 1 desafio bônus.\nPronto para imprimir.</div>\n      <div class=\"res\"><strong>Muda tudo:</strong> idade, conteúdo, realidade do aluno e formato. Sai pronto para a impressora.</div>\n    </div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "2.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ Duelo 1 · 7 min\n\n\n  \n    \n      ❌ O que quase todo mundo escreve\n      Crie uma atividade de matemática.\n      A IA devolve: contas soltas, sem ano escolar, sem contexto, sem objetivo. Serve para qualquer turma — ou seja, não serve para a sua.\n    \n    \n      ✅ O mesmo pedido com P.T.C.F.\n      Aja como professora de Matemática\ndo 4º ano. Crie uma atividade de\n30 min sobre multiplicação por 2 e 3,\ncom situações do cotidiano de uma\ncriança de cidade pequena (padaria,\ncontar ovos na granja).\nInclua: texto motivador, 5 exercícios\ncrescentes e 1 desafio bônus.\nPronto para imprimir.\n      Muda tudo: idade, conteúdo, realidade do aluno e formato. Sai pronto para a impressora."
          }
        ]
      },
      {
        "titulo": "Duelo 1 — agora é a sua vez",
        "html": "<div class=\"slide\" data-n=\"26\" data-title=\"Duelo 1 — agora é a sua vez\" data-enc=\"1\" data-pos=\"apos:A4\">\n<div class=\"sl-caso\">\n  <div class=\"et\">⚔️ SUA VEZ · 4 MINUTOS</div>\n  <h2>Reescreva este prompt ruim</h2>\n  <div class=\"cena-sl\" style=\"font-family:var(--mono);font-size:24px;text-align:center;padding:36px\">\n    \"Faça um texto sobre meio ambiente.\"\n  </div>\n  <div class=\"perg\">Use as 4 letras. Capriche no <span style=\"color:var(--laranja)\">Contexto</span> — a sua escola, a sua turma, a sua região.</div>\n</div>\n</div>",
        "secaoApostila": "2.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ SUA VEZ · 4 MINUTOS\n  Reescreva este prompt ruim\n  \n    \"Faça um texto sobre meio ambiente.\"\n  \n  Use as 4 letras. Capriche no Contexto — a sua escola, a sua turma, a sua região."
          }
        ]
      },
      {
        "titulo": "Caso 1 — a aula de amanhã",
        "html": "<div class=\"slide\" data-n=\"27\" data-title=\"Caso 1 — a aula de amanhã\" data-enc=\"1\" data-pos=\"apos:A5\">\n<div class=\"sl-caso\">\n  <div class=\"et\">🎭 ESTUDO DE CASO 1 · 10 MIN · EM DUPLAS</div>\n  <h2>A aula de amanhã</h2>\n  <div class=\"cena-sl\">\n    São <strong>21h40 de uma terça-feira</strong>. Você lembra que amanhã, às 7h20, tem aula com o 6º ano e o conteúdo é <strong>\"Sistema Solar\"</strong> — um tema que você não dá há dois anos. A escola não tem projetor funcionando. Você está cansado e tem, realisticamente, <strong>25 minutos</strong> antes de dormir.\n  </div>\n  <div class=\"perg\">Em dupla: que prompt vocês escreveriam agora?</div>\n</div>\n</div>",
        "secaoApostila": "2.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎭 ESTUDO DE CASO 1 · 10 MIN · EM DUPLAS\n  A aula de amanhã\n  \n    São 21h40 de uma terça-feira. Você lembra que amanhã, às 7h20, tem aula com o 6º ano e o conteúdo é \"Sistema Solar\" — um tema que você não dá há dois anos. A escola não tem projetor funcionando. Você está cansado e tem, realisticamente, 25 minutos antes de dormir.\n  \n  Em dupla: que prompt vocês escreveriam agora?"
          }
        ]
      },
      {
        "titulo": "Desafio 1 — plano de aula em 5 minutos",
        "html": "<div class=\"slide\" data-n=\"28\" data-title=\"Desafio 1 — plano de aula em 5 minutos\" data-enc=\"1\" data-pos=\"apos:A6\">\n<div class=\"sl-crono\">\n  <div class=\"num\">5:00</div>\n  <h2>Um plano de aula completo</h2>\n  <p>Escolha um conteúdo que você <strong>realmente dará esta semana</strong>. Escreva o prompt com as 4 letras, envie, leia e peça <strong>um</strong> refinamento.</p>\n  <p style=\"margin-top:20px;font-weight:700\">Quem terminar, levante a mão.</p>\n</div>\n</div>",
        "secaoApostila": "2.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "5:00\n  Um plano de aula completo\n  Escolha um conteúdo que você realmente dará esta semana. Escreva o prompt com as 4 letras, envie, leia e peça um refinamento.\n  Quem terminar, levante a mão."
          }
        ]
      },
      {
        "titulo": "5 técnicas avançadas de prompt",
        "html": "<div class=\"slide\" data-n=\"29\" data-title=\"5 técnicas avançadas de prompt\">\r\n<div class=\"topo\"></div>\r\n<div class=\"badge\">Capítulo 2.4</div>\r\n<h1 class=\"st\">5 técnicas que melhoram qualquer resultado</h1>\r\n<div class=\"corpo\">\r\n  <div class=\"grid2\" style=\"gap:14px\">\r\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:16px\">1 · Pedir em etapas</h4><p style=\"font-size:13.5px\">Primeiro o esqueleto, depois o detalhamento de cada parte. O resultado fica muito melhor.</p></div>\r\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:16px\">2 · Pedir um tom</h4><p style=\"font-size:13.5px\">\"Explique como um youtuber divertido para crianças de 8 anos, com analogias de comida.\"</p></div>\r\n    <div class=\"card\" style=\"padding:16px\"><h4 style=\"font-size:16px\">3 · Pedir o que NÃO fazer</h4><p style=\"font-size:13.5px\">\"Me dê 3 planos de aula RUINS e explique o erro de cada um.\" Às vezes é mais fácil aprender pelo erro.</p></div>\r\n    <div class=\"card\" style=\"padding:16px;background:var(--laranja-soft);border-color:#FDBA74\"><h4 style=\"font-size:16px;color:#C2410C\">4 · Refinar, não recomeçar</h4><p style=\"font-size:13.5px;color:#9A3412\"><strong>A que mais economiza tempo.</strong> \"Ficou longo, reduza.\" / \"Troque os exemplos por situações do Nordeste.\"</p></div>\r\n  </div>\r\n  <div class=\"card\" style=\"padding:16px;margin-top:14px\"><h4 style=\"font-size:16px\">5 · Dar um exemplo do que você quer</h4><p style=\"font-size:13.5px\">Já tem um modelo que a coordenação aprovou? Cole-o e peça: <em>\"Siga exatamente esta estrutura, mas sobre o tema X.\"</em></p></div>\r\n</div>\r\n</div>",
        "secaoApostila": "2.4",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 2.4\n\n\n  \n    1 · Pedir em etapasPrimeiro o esqueleto, depois o detalhamento de cada parte. O resultado fica muito melhor.\n    2 · Pedir um tom\"Explique como um youtuber divertido para crianças de 8 anos, com analogias de comida.\"\n    3 · Pedir o que NÃO fazer\"Me dê 3 planos de aula RUINS e explique o erro de cada um.\" Às vezes é mais fácil aprender pelo erro.\n    4 · Refinar, não recomeçarA que mais economiza tempo. \"Ficou longo, reduza.\" / \"Troque os exemplos por situações do Nordeste.\"\n  \n  5 · Dar um exemplo do que você querJá tem um modelo que a coordenação aprovou? Cole-o e peça: \"Siga exatamente esta estrutura, mas sobre o tema X.\""
          }
        ]
      },
      {
        "titulo": "Banco de 15 prompts prontos",
        "html": "<div class=\"slide\" data-n=\"30\" data-title=\"Banco de 15 prompts prontos\">\r\n<div class=\"topo verde\"></div>\r\n<div class=\"badge verde\">Capítulo 2.5 · Copie e use amanhã</div>\r\n<h1 class=\"st\">Banco de 15 prompts prontos</h1>\r\n<div class=\"corpo alto\">\r\n  <p class=\"lead\" style=\"margin-bottom:14px\">Na apostila você tem 15 prompts completos, prontos para copiar. Basta trocar o que está entre colchetes. <strong>O Anexo A traz ainda mais, organizados por disciplina.</strong></p>\r\n  <div class=\"grid3\" style=\"gap:12px\">\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"0\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">1 · Plano de Aula</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"1\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">2 · Prova Inédita</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"2\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">3 · Parecer Descritivo</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"3\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">4 · E-mail para Pais</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"4\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">5 · Adaptação Inclusiva</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"5\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">6 · Rotação por Estações</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"6\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">7 · Jogo Educativo</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"7\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">8 · Sequência Didática</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"8\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">9 · Projeto Interdisciplinar</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"9\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">10 · Resumo Didático</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"10\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">11 · Metáfora do Cotidiano</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"11\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">12 · Recuperação e Reforço</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"12\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">13 · Diferenciação 3 Níveis</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"13\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">14 · Comunicado às Famílias</p></div>\r\n    <div class=\"card abrivel\" style=\"padding:14px\" data-prompt=\"14\"><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;color:var(--indigo)\">15 · Plano B para Imprevistos</p></div>\r\n  </div>\r\n</div>\r\n</div>",
        "secaoApostila": "2.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 2.5 · Copie e use amanhã\n\n\n  Na apostila você tem 15 prompts completos, prontos para copiar. Basta trocar o que está entre colchetes. O Anexo A traz ainda mais, organizados por disciplina.\n  \n    1 · Plano de Aula\n    2 · Prova Inédita\n    3 · Parecer Descritivo\n    4 · E-mail para Pais\n    5 · Adaptação Inclusiva\n    6 · Rotação por Estações\n    7 · Jogo Educativo\n    8 · Sequência Didática\n    9 · Projeto Interdisciplinar\n    10 · Resumo Didático\n    11 · Metáfora do Cotidiano\n    12 · Recuperação e Reforço\n    13 · Diferenciação 3 Níveis\n    14 · Comunicado às Famílias\n    15 · Plano B para Imprevistos"
          }
        ]
      },
      {
        "titulo": "Mão na Massa 2 — Seu primeiro prompt completo",
        "html": "<div class=\"slide\" data-n=\"31\" data-title=\"Mão na Massa 2 — Seu primeiro prompt completo\">\r\n<div class=\"topo laranja\"></div>\r\n<div class=\"badge laranja\">Oficina prática · 20 minutos</div>\r\n<h1 class=\"st\">Mão na Massa 2 — Seu primeiro prompt completo</h1>\r\n<div class=\"corpo\">\r\n  <div class=\"oficina\" style=\"margin-bottom:16px\">\r\n    <div class=\"t\">✋ Agora é a sua vez</div>\r\n    <ol>\r\n      <li>Pense numa aula que você vai dar <strong>nesta semana</strong>.</li>\r\n      <li>Escreva um prompt usando as <strong>quatro letras</strong> do P.T.C.F. Capriche no <strong>Contexto</strong>.</li>\r\n      <li>Cole na IA e leia o resultado.</li>\r\n      <li><strong>Refine duas vezes</strong> (\"reduza\", \"troque os exemplos\", \"vire tabela\").</li>\r\n      <li>Salve o prompt final — <strong>é o começo do seu banco pessoal</strong>.</li>\r\n    </ol>\r\n  </div>\r\n  <div class=\"dica\">\r\n    <div class=\"t\">💡 Crie seu banco pessoal de prompts</div>\r\n    <p>Sempre que um prompt der resultado muito bom, <strong>salve</strong>. Em poucos meses você terá uma biblioteca sob medida para a sua realidade — algo que nenhuma ferramenta paga oferece.</p>\r\n  </div>\r\n</div>\r\n</div>",
        "secaoApostila": "2.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 20 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Pense numa aula que você vai dar nesta semana.\n      Escreva um prompt usando as quatro letras do P.T.C.F. Capriche no Contexto.\n      Cole na IA e leia o resultado.\n      Refine duas vezes (\"reduza\", \"troque os exemplos\", \"vire tabela\").\n      Salve o prompt final — é o começo do seu banco pessoal.\n    \n  \n  \n    💡 Crie seu banco pessoal de prompts\n    Sempre que um prompt der resultado muito bom, salve. Em poucos meses você terá uma biblioteca sob medida para a sua realidade — algo que nenhuma ferramenta paga oferece."
          }
        ]
      },
      {
        "titulo": "Saída 1 — o que você leva hoje",
        "html": "<div class=\"slide\" data-n=\"32\" data-title=\"Saída 1 — o que você leva hoje\" data-enc=\"1\" data-pos=\"fim\">\n<div class=\"sl-saida\">\n  <h2>✅ Antes de ir embora</h2>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\">Conta criada em <strong>duas</strong> ferramentas (seus dois barcos)</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 plano de aula completo</strong>, gerado e refinado</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\">Seu <strong>prompt P.T.C.F.</strong> salvo no celular</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\">O <strong>Cartão de Bolso P.T.C.F.</strong> no crachá</span></div>\n  <div class=\"it\" style=\"color:var(--laranja);font-weight:700;margin-top:8px\">📌 Tarefa da semana: prepare uma aula real e anote o tempo no Diário de Bordo</div>\n</div>\n</div>",
        "secaoApostila": "2.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "✅ Antes de ir embora\n  \n  \n  \n  \n  📌 Tarefa da semana: prepare uma aula real e anote o tempo no Diário de Bordo"
          },
          {
            "tipo": "checklist",
            "itens": [
              "Conta criada em duas ferramentas (seus dois barcos)",
              "1 plano de aula completo, gerado e refinado",
              "Seu prompt P.T.C.F. salvo no celular",
              "O Cartão de Bolso P.T.C.F. no crachá"
            ]
          }
        ]
      }
    ]
  },
  {
    "encontro": 2,
    "titulo": "Encontro 2",
    "passos": [
      {
        "titulo": "Encontro 2 — Abertura",
        "html": "<div class=\"slide\" data-n=\"33\" data-title=\"Encontro 2 — Abertura\">\n<div class=\"divisor\">\n  <div class=\"num\">ENCONTRO 2 · 2 HORAS</div>\n  <h2>Sua Rotina, Seu Planejamento<br>e a BNCC</h2>\n  <p>Hoje atacamos a burocracia que devora seus fins de semana — pareceres, atas, comunicados — e aprendemos a planejar aulas alinhadas à BNCC sem decorar código nenhum.</p>\n  <div class=\"caps\">\n    <span class=\"cap-tag\">Cap. 3 · Organização Profissional</span>\n    <span class=\"cap-tag\">Cap. 4 · Planejamento e BNCC</span>\n    <span class=\"cap-tag\">Cap. 5 · Documentos Longos</span>\n  </div>\n</div>\n</div>",
        "secaoApostila": "2.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "ENCONTRO 2 · 2 HORAS\n  Sua Rotina, Seu Planejamento\ne a BNCC\n  Hoje atacamos a burocracia que devora seus fins de semana — pareceres, atas, comunicados — e aprendemos a planejar aulas alinhadas à BNCC sem decorar código nenhum.\n  \n    Cap. 3 · Organização Profissional\n    Cap. 4 · Planejamento e BNCC\n    Cap. 5 · Documentos Longos"
          }
        ]
      },
      {
        "titulo": "Aquecimento 2 — quanto tempo leva um parecer?",
        "html": "<div class=\"slide\" data-n=\"34\" data-title=\"Aquecimento 2 — quanto tempo leva um parecer?\" data-enc=\"2\" data-pos=\"apos:16\">\n<div class=\"sl-aquec\">\n  <div class=\"et\">🔥 AQUECIMENTO · 3 MINUTOS</div>\n  <h2>Quanto tempo levou o seu último parecer descritivo?</h2>\n  <p>E quantos você precisa escrever por bimestre?</p>\n  <p style=\"margin-top:20px;font-style:italic\">Multiplique um pelo outro. <strong>Esse número é o que vamos atacar agora.</strong></p>\n</div>\n</div>",
        "secaoApostila": "2.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🔥 AQUECIMENTO · 3 MINUTOS\n  Quanto tempo levou o seu último parecer descritivo?\n  E quantos você precisa escrever por bimestre?\n  Multiplique um pelo outro. Esse número é o que vamos atacar agora."
          }
        ]
      },
      {
        "titulo": "A burocracia invisível",
        "html": "<div class=\"slide com-fig\" data-n=\"35\" data-title=\"A burocracia invisível\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Capítulo 3</div>\n<h1 class=\"st\">Este capítulo é sobre <span class=\"lar\">você</span></h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:20px\">Não é sobre aula, não é sobre aluno — é sobre como organizar sua vida profissional para não adoecer.</p>\n  <div class=\"card\" style=\"background:var(--indigo-soft);border-color:var(--indigo-line);margin-bottom:20px\">\n    <h4 style=\"color:var(--indigo-dark)\">A causa real da exaustão docente</h4>\n    <p style=\"color:#3730A3\">Não é a sala de aula em si, mas a <strong>avalanche de tarefas burocráticas invisíveis</strong> que levamos para casa à noite e nos fins de semana. Em vez de encarar a folha em branco, você dá à IA duas ou três linhas de anotações e ela devolve o texto formal pronto.</p>\n  </div>\n  <div class=\"grid4\">\n    <div class=\"card\" style=\"text-align:center;padding:16px\"><div style=\"font-size:30px\">📅</div><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;margin-top:6px\">Cronogramas</p></div>\n    <div class=\"card\" style=\"text-align:center;padding:16px\"><div style=\"font-size:30px\">✉️</div><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;margin-top:6px\">E-mails e comunicados</p></div>\n    <div class=\"card\" style=\"text-align:center;padding:16px\"><div style=\"font-size:30px\">📝</div><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;margin-top:6px\">Pareceres descritivos</p></div>\n    <div class=\"card\" style=\"text-align:center;padding:16px\"><div style=\"font-size:30px\">📋</div><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;margin-top:6px\">Atas e relatórios</p></div>\n  </div>\n</div>\n<div class=\"fig-slide\"><img src=\"/curso/imagens/06_organizacao_rotina_professor.png\" alt=\"A IA como assistente na organização do tempo extraclasse.\"><div class=\"fig-leg\">A IA como assistente na organização do tempo extraclasse.</div></div>\n</div>",
        "secaoApostila": "3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 3\n\n\n  Não é sobre aula, não é sobre aluno — é sobre como organizar sua vida profissional para não adoecer.\n  \n    A causa real da exaustão docente\n    Não é a sala de aula em si, mas a avalanche de tarefas burocráticas invisíveis que levamos para casa à noite e nos fins de semana. Em vez de encarar a folha em branco, você dá à IA duas ou três linhas de anotações e ela devolve o texto formal pronto.\n  \n  \n    📅Cronogramas\n    ✉️E-mails e comunicados\n    📝Pareceres descritivos\n    📋Atas e relatórios"
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/06_organizacao_rotina_professor.png",
            "legenda": "A IA como assistente na organização do tempo extraclasse."
          }
        ]
      },
      {
        "titulo": "E-mails e comunicados delicados",
        "html": "<div class=\"slide com-acoes\" data-n=\"36\" data-title=\"E-mails e comunicados delicados\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 3.2</div>\n<h1 class=\"st\">Comunicar sem gerar atrito</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:16px\">Comunicar indisciplina ou nota baixa é terreno sensível. Uma palavra mal colocada vira conflito com a família. A IA transforma um comunicado punitivo em <strong>proposta de parceria</strong>.</p>\n  <div class=\"etiqueta\">E-mail aos pais</div>\n  <div class=\"prompt p12\">Escreva um e-mail empático para os pais de um aluno fictício de\n12 anos do 7º ano. Ele tem sido desrespeitoso com os colegas e se\nrecusou a fazer 3 atividades em sala esta semana. O tom deve ser\nde parceria escola-família, nunca punitivo. Mencione os pontos\npositivos dele (é inteligente e participativo quando quer).\nTermine convidando para uma conversa presencial.</div><div class=\"prompt-acoes\" data-prompt-txt=\"Escreva um e-mail empático para os pais de um aluno fictício de\n12 anos do 7º ano. Ele tem sido desrespeitoso com os colegas e se\nrecusou a fazer 3 atividades em sala esta semana. O tom deve ser\nde parceria escola-família, nunca punitivo. Mencione os pontos\npositivos dele (é inteligente e participativo quando quer).\nTermine convidando para uma conversa presencial.\"></div>\n  <div class=\"atencao\" style=\"margin-top:14px\">\n    <div class=\"t\">⚠️ Repare: \"aluno fictício\", sem nome</div>\n    <p>Todos os prompts sobre alunos vão para a IA <strong>sem nome, sem escola, sem turma</strong>. Isso é exigência da LGPD — veremos em profundidade no Encontro 4.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "3.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 3.2\n\n\n  Comunicar indisciplina ou nota baixa é terreno sensível. Uma palavra mal colocada vira conflito com a família. A IA transforma um comunicado punitivo em proposta de parceria.\n  E-mail aos pais\n  \n  \n    ⚠️ Repare: \"aluno fictício\", sem nome\n    Todos os prompts sobre alunos vão para a IA sem nome, sem escola, sem turma. Isso é exigência da LGPD — veremos em profundidade no Encontro 4."
          },
          {
            "tipo": "prompt",
            "texto": "Escreva um e-mail empático para os pais de um aluno fictício de\n12 anos do 7º ano. Ele tem sido desrespeitoso com os colegas e se\nrecusou a fazer 3 atividades em sala esta semana. O tom deve ser\nde parceria escola-família, nunca punitivo. Mencione os pontos\npositivos dele (é inteligente e participativo quando quer).\nTermine convidando para uma conversa presencial.",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "O pesadelo dos pareceres descritivos",
        "html": "<div class=\"slide com-acoes\" data-n=\"37\" data-title=\"O pesadelo dos pareceres descritivos\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 3.3</div>\n<h1 class=\"st\">O pesadelo dos pareceres descritivos</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:14px\">30 a 40 pareceres individuais. A pilha de fichas em branco na noite de domingo. <strong>Você anota solto durante o bimestre; a IA redige o texto formal.</strong></p>\n  <div class=\"etiqueta\">Parecer a partir de anotações</div>\n  <div class=\"prompt p12\">Transforme minhas anotações abaixo em um parecer descritivo\nbimestral de 2 parágrafos, em tom acolhedor e profissional. Foque\nnos avanços. Termine com uma meta positiva para o próximo bimestre.\n\nAnotações sobre aluna fictícia de 9 anos, 3º ano:\n- Melhorou muito na leitura em voz alta este bimestre\n- Ainda troca algumas letras (p/b, t/d) na escrita\n- É muito prestativa, ajuda os colegas\n- Tem dificuldade em ficar parada por muito tempo\n- Adorou o projeto do Horário da Leitura</div><div class=\"prompt-acoes\" data-prompt-txt=\"Transforme minhas anotações abaixo em um parecer descritivo\nbimestral de 2 parágrafos, em tom acolhedor e profissional. Foque\nnos avanços. Termine com uma meta positiva para o próximo bimestre.\n\nAnotações sobre aluna fictícia de 9 anos, 3º ano:\n- Melhorou muito na leitura em voz alta este bimestre\n- Ainda troca algumas letras (p/b, t/d) na escrita\n- É muito prestativa, ajuda os colegas\n- Tem dificuldade em ficar parada por muito tempo\n- Adorou o projeto do Horário da Leitura\"></div>\n</div>\n</div>",
        "secaoApostila": "3.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 3.3\n\n\n  30 a 40 pareceres individuais. A pilha de fichas em branco na noite de domingo. Você anota solto durante o bimestre; a IA redige o texto formal.\n  Parecer a partir de anotações"
          },
          {
            "tipo": "prompt",
            "texto": "Transforme minhas anotações abaixo em um parecer descritivo\nbimestral de 2 parágrafos, em tom acolhedor e profissional. Foque\nnos avanços. Termine com uma meta positiva para o próximo bimestre.\n\nAnotações sobre aluna fictícia de 9 anos, 3º ano:\n- Melhorou muito na leitura em voz alta este bimestre\n- Ainda troca algumas letras (p/b, t/d) na escrita\n- É muito prestativa, ajuda os colegas\n- Tem dificuldade em ficar parada por muito tempo\n- Adorou o projeto do Horário da Leitura",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Caso 2 — doze pareceres até segunda",
        "html": "<div class=\"slide\" data-n=\"38\" data-title=\"Caso 2 — doze pareceres até segunda\" data-enc=\"2\" data-pos=\"apos:19\">\n<div class=\"sl-caso\">\n  <div class=\"et\">🎭 ESTUDO DE CASO 2 · 10 MIN · EM DUPLAS</div>\n  <h2>Doze pareceres até segunda</h2>\n  <div class=\"cena-sl\">\n    <strong>Sexta-feira, 17h.</strong> A coordenadora aparece na porta: os pareceres de <strong>12 alunos</strong> precisam estar prontos na segunda de manhã. Você tem suas anotações — frases soltas do tipo <em>\"melhorou leitura, ainda troca b/d, prestativa, dispersa em atividade individual\"</em>. Cada parecer à mão leva 20 minutos. <strong>São 4 horas do seu fim de semana.</strong>\n  </div>\n  <div class=\"perg\">Em dupla: qual é a estratégia? Quantos minutos vocês acham que levará?</div>\n</div>\n</div>",
        "secaoApostila": "3.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎭 ESTUDO DE CASO 2 · 10 MIN · EM DUPLAS\n  Doze pareceres até segunda\n  \n    Sexta-feira, 17h. A coordenadora aparece na porta: os pareceres de 12 alunos precisam estar prontos na segunda de manhã. Você tem suas anotações — frases soltas do tipo \"melhorou leitura, ainda troca b/d, prestativa, dispersa em atividade individual\". Cada parecer à mão leva 20 minutos. São 4 horas do seu fim de semana.\n  \n  Em dupla: qual é a estratégia? Quantos minutos vocês acham que levará?"
          }
        ]
      },
      {
        "titulo": "Caso 2 — a estratégia que funciona",
        "html": "<div class=\"slide com-acoes\" data-n=\"39\" data-title=\"Caso 2 — a estratégia que funciona\" data-enc=\"2\" data-pos=\"apos:B2\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">💡 Solução comentada</div>\n<h1 class=\"st\">Defina o padrão uma vez, alimente doze</h1>\n<div class=\"corpo\">\n  <div class=\"card\" style=\"background:var(--vermelho-sf);border-color:#FBD5D5;margin-bottom:16px\">\n    <h4 style=\"color:var(--vermelho-dk)\">❌ O erro comum</h4>\n    <p style=\"color:#991B1B\">Pedir um parecer de cada vez, do zero, doze vezes. <strong>Não economiza quase nada.</strong></p>\n  </div>\n  <div class=\"etiqueta verde\">✅ O prompt-padrão, enviado uma única vez</div>\n  <div class=\"prompt p12\">Aja como coordenadora pedagógica experiente em avaliação formativa.\nVou enviar anotações soltas sobre vários alunos fictícios, um por vez.\nPara cada um, escreva um parecer de 2 parágrafos: tom acolhedor,\ncomece pelos avanços, aponte o que precisa de estímulo sem julgamento,\ntermine com meta positiva. Confirme e eu envio o primeiro.</div><div class=\"prompt-acoes\" data-prompt-txt=\"Aja como coordenadora pedagógica experiente em avaliação formativa.\nVou enviar anotações soltas sobre vários alunos fictícios, um por vez.\nPara cada um, escreva um parecer de 2 parágrafos: tom acolhedor,\ncomece pelos avanços, aponte o que precisa de estímulo sem julgamento,\ntermine com meta positiva. Confirme e eu envio o primeiro.\"></div>\n  <div class=\"dica\" style=\"margin-top:14px\">\n    <div class=\"t\">⏱ O resultado</div>\n    <p>Depois disso, cada aluno leva <strong>30 segundos</strong>. Os 12 pareceres saem em <strong>~20 minutos</strong> — contra 4 horas.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "3.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "💡 Solução comentada\n\n\n  \n    ❌ O erro comum\n    Pedir um parecer de cada vez, do zero, doze vezes. Não economiza quase nada.\n  \n  ✅ O prompt-padrão, enviado uma única vez\n  \n  \n    ⏱ O resultado\n    Depois disso, cada aluno leva 30 segundos. Os 12 pareceres saem em ~20 minutos — contra 4 horas."
          },
          {
            "tipo": "prompt",
            "texto": "Aja como coordenadora pedagógica experiente em avaliação formativa.\nVou enviar anotações soltas sobre vários alunos fictícios, um por vez.\nPara cada um, escreva um parecer de 2 parágrafos: tom acolhedor,\ncomece pelos avanços, aponte o que precisa de estímulo sem julgamento,\ntermine com meta positiva. Confirme e eu envio o primeiro.",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Duelo 2 — o e-mail difícil",
        "html": "<div class=\"slide\" data-n=\"40\" data-title=\"Duelo 2 — o e-mail difícil\" data-enc=\"2\" data-pos=\"apos:B3\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">⚔️ Duelo 2 · 7 min</div>\n<h1 class=\"st\">O e-mail difícil para a família</h1>\n<div class=\"sl-duelo\" style=\"top:150px;padding:0 70px 40px\">\n  <div class=\"lado\">\n    <div class=\"box ruim\">\n      <div class=\"rot\">❌ Sem cuidado</div>\n      <div class=\"pr\">Escreva um e-mail para a mãe\ndo aluno reclamando que ele\nnão faz as tarefas e conversa\ndemais na aula.</div>\n      <div class=\"res\"><strong>Resultado:</strong> e-mail correto, porém <strong>frio e acusatório</strong>. A palavra \"reclamando\" contamina tudo. A família fica na defensiva e a relação piora.</div>\n    </div>\n    <div class=\"box bom\">\n      <div class=\"rot\">✅ Com intenção pedagógica</div>\n      <div class=\"pr\">Escreva um e-mail curto e empático\npara a mãe de um aluno fictício de\n12 anos, 7º ano.\nContexto: é inteligente e\nparticipativo quando se interessa,\nmas conversou muito nas últimas\n2 semanas e deixou 2 tarefas.\nTom: convite à parceria, nunca\npunitivo. Comece por algo positivo\nreal. Máximo 2 parágrafos.</div>\n      <div class=\"res\"><strong>Resultado:</strong> abre reconhecendo o aluno, descreve o fato sem adjetivar a criança. <strong>A família vira aliada.</strong></div>\n    </div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "3.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ Duelo 2 · 7 min\n\n\n  \n    \n      ❌ Sem cuidado\n      Escreva um e-mail para a mãe\ndo aluno reclamando que ele\nnão faz as tarefas e conversa\ndemais na aula.\n      Resultado: e-mail correto, porém frio e acusatório. A palavra \"reclamando\" contamina tudo. A família fica na defensiva e a relação piora.\n    \n    \n      ✅ Com intenção pedagógica\n      Escreva um e-mail curto e empático\npara a mãe de um aluno fictício de\n12 anos, 7º ano.\nContexto: é inteligente e\nparticipativo quando se interessa,\nmas conversou muito nas últimas\n2 semanas e deixou 2 tarefas.\nTom: convite à parceria, nunca\npunitivo. Comece por algo positivo\nreal. Máximo 2 parágrafos.\n      Resultado: abre reconhecendo o aluno, descreve o fato sem adjetivar a criança. A família vira aliada."
          }
        ]
      },
      {
        "titulo": "Desafio 2 — a ata em 4 minutos",
        "html": "<div class=\"slide\" data-n=\"41\" data-title=\"Desafio 2 — a ata em 4 minutos\" data-enc=\"2\" data-pos=\"apos:B4\">\n<div class=\"sl-crono\">\n  <div class=\"num\">4:00</div>\n  <h2>A ata que ninguém quer escrever</h2>\n  <p>Transforme tópicos soltos de um conselho de classe em <strong>ata formal pronta para assinatura</strong>.</p>\n  <p style=\"margin-top:16px\">Peça a formatação oficial, leia e ajuste <strong>um</strong> detalhe.</p>\n</div>\n</div>",
        "secaoApostila": "3.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "4:00\n  A ata que ninguém quer escrever\n  Transforme tópicos soltos de um conselho de classe em ata formal pronta para assinatura.\n  Peça a formatação oficial, leia e ajuste um detalhe."
          }
        ]
      },
      {
        "titulo": "Atas, relatórios e cartas",
        "html": "<div class=\"slide com-acoes\" data-n=\"42\" data-title=\"Atas, relatórios e cartas\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 3.4 e 3.5</div>\n<h1 class=\"st\">Atas, relatórios e cartas de recomendação</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\" style=\"gap:16px\">\n    <div>\n      <div class=\"etiqueta\">Ata de reunião</div>\n      <div class=\"prompt p12\">Redija uma ata formal de reunião\npedagógica com base nos tópicos:\n- Data: 15/05/2026, 14h às 16h\n- Presentes: coordenadora e 3 professores\n- Pautas: rendimento do 7ºB, reforço no\n  contraturno, Feira de Ciências\n- Decisões: reforço às terças e quintas,\n  feira em 20/08\n- Próxima reunião: 29/05/2026</div><div class=\"prompt-acoes\" data-prompt-txt=\"Redija uma ata formal de reunião\npedagógica com base nos tópicos:\n- Data: 15/05/2026, 14h às 16h\n- Presentes: coordenadora e 3 professores\n- Pautas: rendimento do 7ºB, reforço no\n  contraturno, Feira de Ciências\n- Decisões: reforço às terças e quintas,\n  feira em 20/08\n- Próxima reunião: 29/05/2026\"></div>\n    </div>\n    <div>\n      <div class=\"etiqueta\">Relatório à Secretaria</div>\n      <div class=\"prompt p12\">Escreva um relatório semestral de uma\nturma fictícia do 5º ano para a\nSecretaria Municipal. Inclua: 28 alunos,\nfrequência 87%, avanços (leitura e\ninterpretação), dificuldades (frações e\ngeometria), projetos (Feira do Livro,\nHorta Escolar), necessidades (sala de\ninformática).</div><div class=\"prompt-acoes\" data-prompt-txt=\"Escreva um relatório semestral de uma\nturma fictícia do 5º ano para a\nSecretaria Municipal. Inclua: 28 alunos,\nfrequência 87%, avanços (leitura e\ninterpretação), dificuldades (frações e\ngeometria), projetos (Feira do Livro,\nHorta Escolar), necessidades (sala de\ninformática).\"></div>\n    </div>\n  </div>\n  <div class=\"dica\" style=\"margin-top:16px\">\n    <div class=\"t\">💡 O princípio é sempre o mesmo</div>\n    <p>Você fornece os <strong>dados brutos em tópicos</strong>; a IA cuida do vocabulário técnico, da coesão e da formatação oficial. O conteúdo é seu, o trabalho de digitação é dela.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "3.4",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 3.4 e 3.5\n\n\n  \n    \n      Ata de reunião\n      \n    \n    \n      Relatório à Secretaria\n      \n    \n  \n  \n    💡 O princípio é sempre o mesmo\n    Você fornece os dados brutos em tópicos; a IA cuida do vocabulário técnico, da coesão e da formatação oficial. O conteúdo é seu, o trabalho de digitação é dela."
          },
          {
            "tipo": "prompt",
            "texto": "Redija uma ata formal de reunião\npedagógica com base nos tópicos:\n- Data: 15/05/2026, 14h às 16h\n- Presentes: coordenadora e 3 professores\n- Pautas: rendimento do 7ºB, reforço no\n  contraturno, Feira de Ciências\n- Decisões: reforço às terças e quintas,\n  feira em 20/08\n- Próxima reunião: 29/05/2026",
            "variaveis": []
          },
          {
            "tipo": "prompt",
            "texto": "Escreva um relatório semestral de uma\nturma fictícia do 5º ano para a\nSecretaria Municipal. Inclua: 28 alunos,\nfrequência 87%, avanços (leitura e\ninterpretação), dificuldades (frações e\ngeometria), projetos (Feira do Livro,\nHorta Escolar), necessidades (sala de\ninformática).",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Mão na Massa 3 — O parecer que você já precisa escrever",
        "html": "<div class=\"slide\" data-n=\"43\" data-title=\"Mão na Massa 3 — O parecer que você já precisa escrever\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Oficina prática · 15 minutos</div>\n<h1 class=\"st\">Mão na Massa 3 — O parecer real</h1>\n<div class=\"corpo\">\n  <div class=\"oficina\">\n    <div class=\"t\">✋ Agora é a sua vez</div>\n    <ol>\n      <li>Escolha um aluno real da sua turma — mas <strong>não escreva o nome dele</strong>.</li>\n      <li>Anote 5 ou 6 observações soltas, como num rascunho.</li>\n      <li>Peça o parecer descritivo usando o prompt 3 do banco.</li>\n      <li>Leia com olhar crítico: <strong>está fiel ao aluno que você conhece?</strong> Ajuste o que não corresponde.</li>\n      <li>Cronometre. Multiplique pela quantidade de pareceres que você escreve por bimestre.</li>\n    </ol>\n  </div>\n</div>\n</div>",
        "secaoApostila": "3.4",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 15 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Escolha um aluno real da sua turma — mas não escreva o nome dele.\n      Anote 5 ou 6 observações soltas, como num rascunho.\n      Peça o parecer descritivo usando o prompt 3 do banco.\n      Leia com olhar crítico: está fiel ao aluno que você conhece? Ajuste o que não corresponde.\n      Cronometre. Multiplique pela quantidade de pareceres que você escreve por bimestre."
          }
        ]
      },
      {
        "titulo": "Plano de aula completo",
        "html": "<div class=\"slide com-acoes\" data-n=\"44\" data-title=\"Plano de aula completo\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 4.1</div>\n<h1 class=\"st\">Plano de aula: 2 horas viram 10 minutos</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:12px\">A IA não elimina sua criatividade — ela acelera a execução. Você revisa o rascunho em vez de partir do zero.</p>\n  <div class=\"etiqueta\">Plano completo</div>\n  <div class=\"prompt p12\">Aja como um professor de Ciências do 7º ano com 15 anos de\nexperiência. Crie um plano de aula de 50 minutos sobre \"Estados\nFísicos da Matéria\". Minha escola não tem laboratório, então a\natividade prática deve usar materiais de baixo custo (gelo, água,\nvela, panela).\n\nEstruture assim:\n1. Tema e habilidade BNCC        4. Momentos cronometrados\n2. Objetivo de aprendizagem      5. Avaliação da aprendizagem\n3. Materiais com quantidades     6. Plano B se a prática falhar</div><div class=\"prompt-acoes\" data-prompt-txt=\"Aja como um professor de Ciências do 7º ano com 15 anos de\nexperiência. Crie um plano de aula de 50 minutos sobre &quot;Estados\nFísicos da Matéria&quot;. Minha escola não tem laboratório, então a\natividade prática deve usar materiais de baixo custo (gelo, água,\nvela, panela).\n\nEstruture assim:\n1. Tema e habilidade BNCC        4. Momentos cronometrados\n2. Objetivo de aprendizagem      5. Avaliação da aprendizagem\n3. Materiais com quantidades     6. Plano B se a prática falhar\"></div>\n</div>\n</div>",
        "secaoApostila": "4.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 4.1\n\n\n  A IA não elimina sua criatividade — ela acelera a execução. Você revisa o rascunho em vez de partir do zero.\n  Plano completo"
          },
          {
            "tipo": "prompt",
            "texto": "Aja como um professor de Ciências do 7º ano com 15 anos de\nexperiência. Crie um plano de aula de 50 minutos sobre \"Estados\nFísicos da Matéria\". Minha escola não tem laboratório, então a\natividade prática deve usar materiais de baixo custo (gelo, água,\nvela, panela).\n\nEstruture assim:\n1. Tema e habilidade BNCC        4. Momentos cronometrados\n2. Objetivo de aprendizagem      5. Avaliação da aprendizagem\n3. Materiais com quantidades     6. Plano B se a prática falhar",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "A BNCC sem mistério",
        "html": "<div class=\"slide com-fig\" data-n=\"45\" data-title=\"A BNCC sem mistério\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 4.1 · Traduzindo</div>\n<h1 class=\"st\">A BNCC sem mistério</h1>\n<div class=\"corpo\">\n  <div class=\"traduzindo\" style=\"margin-bottom:18px\">\n    <div class=\"t\">📖 Traduzindo: o código da BNCC</div>\n    <p>Um código como <strong>EF07CI01</strong> se lê assim:</p>\n  </div>\n  <div class=\"grid4\" style=\"margin-bottom:18px\">\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\"><p style=\"font-family:var(--titulo);font-size:26px;font-weight:800;color:var(--indigo)\">EF</p><p style=\"font-size:13px;color:#3730A3\">Ensino Fundamental</p></div>\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\"><p style=\"font-family:var(--titulo);font-size:26px;font-weight:800;color:var(--indigo)\">07</p><p style=\"font-size:13px;color:#3730A3\">7º ano</p></div>\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\"><p style=\"font-family:var(--titulo);font-size:26px;font-weight:800;color:var(--indigo)\">CI</p><p style=\"font-size:13px;color:#3730A3\">Ciências</p></div>\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\"><p style=\"font-family:var(--titulo);font-size:26px;font-weight:800;color:var(--indigo)\">01</p><p style=\"font-size:13px;color:#3730A3\">Habilidade nº 1</p></div>\n  </div>\n  <div class=\"atencao\">\n    <div class=\"t\">⚠️ Sempre confira o código</div>\n    <p>A IA acerta a maioria dos códigos, mas <strong>erra alguns — e erra com confiança</strong>. Antes de entregar à coordenação, confira no site do MEC. No Capítulo 5 você aprende a usar o NotebookLM, que consulta o documento real e cita a página.</p>\n  </div>\n</div>\n<div class=\"fig-slide\"><img src=\"/curso/imagens/08_bncc_codigo_explicado.png\" alt=\"Cada código da BNCC diz etapa, ano, componente e habilidade.\"><div class=\"fig-leg\">Cada código da BNCC diz etapa, ano, componente e habilidade.</div></div>\n</div>",
        "secaoApostila": "4.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 4.1 · Traduzindo\n\n\n  \n    📖 Traduzindo: o código da BNCC\n    Um código como EF07CI01 se lê assim:\n  \n  \n    EFEnsino Fundamental\n    077º ano\n    CICiências\n    01Habilidade nº 1\n  \n  \n    ⚠️ Sempre confira o código\n    A IA acerta a maioria dos códigos, mas erra alguns — e erra com confiança. Antes de entregar à coordenação, confira no site do MEC. No Capítulo 5 você aprende a usar o NotebookLM, que consulta o documento real e cita a página."
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/08_bncc_codigo_explicado.png",
            "legenda": "Cada código da BNCC diz etapa, ano, componente e habilidade."
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 2 — o código da BNCC",
        "html": "<div class=\"slide\" data-n=\"46\" data-title=\"Caça ao Erro 2 — o código da BNCC\" data-enc=\"2\" data-pos=\"apos:23\">\n<div class=\"topo amarelo\"></div>\n<div class=\"badge amarelo\">🕵️ Caça ao Erro 2 · 5 min</div>\n<h1 class=\"st\">Um destes dois códigos não pode existir</h1>\n<div class=\"sl-caca\" style=\"top:150px;height:auto;padding:0 70px\">\n  <div class=\"resp\">\n    \"Este plano contempla a habilidade <strong>EF07CI09</strong> da BNCC, que trata dos sistemas do corpo humano.<br><br>\n    Também dialoga com a habilidade <strong>EF07BI14</strong> (Biologia, 7º ano), sobre fisiologia comparada dos sistemas circulatório e respiratório.\"\n  </div>\n  <div class=\"desafio-txt\">🔍 Dois minutos: qual é impossível? E por quê?</div>\n</div>\n</div>",
        "secaoApostila": "4.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕵️ Caça ao Erro 2 · 5 min\n\n\n  \n    \"Este plano contempla a habilidade EF07CI09 da BNCC, que trata dos sistemas do corpo humano.\n\n\n    Também dialoga com a habilidade EF07BI14 (Biologia, 7º ano), sobre fisiologia comparada dos sistemas circulatório e respiratório.\"\n  \n  🔍 Dois minutos: qual é impossível? E por quê?"
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 2 — gabarito",
        "html": "<div class=\"slide\" data-n=\"47\" data-title=\"Caça ao Erro 2 — gabarito\" data-enc=\"2\" data-pos=\"apos:B6\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">🎯 Gabarito</div>\n<h1 class=\"st\">Dá para saber sem consultar nada</h1>\n<div class=\"corpo\">\n  <div class=\"atencao\" style=\"margin-bottom:16px\">\n    <div class=\"t\">❌ EF07<span style=\"background:#FCA5A5;padding:0 4px;border-radius:3px\">BI</span>14 é impossível</div>\n    <p>No <strong>Ensino Fundamental não existe o componente \"Biologia\"</strong>. Biologia só aparece no Ensino Médio. No Fundamental o componente é <strong>Ciências (CI)</strong>.</p>\n  </div>\n  <div class=\"grid4\" style=\"margin-bottom:16px\">\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\"><p style=\"font-family:var(--titulo);font-size:24px;font-weight:800;color:var(--indigo)\">EF</p><p style=\"font-size:14px;color:#3730A3\">Etapa</p></div>\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\"><p style=\"font-family:var(--titulo);font-size:24px;font-weight:800;color:var(--indigo)\">07</p><p style=\"font-size:14px;color:#3730A3\">Ano</p></div>\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\"><p style=\"font-family:var(--titulo);font-size:24px;font-weight:800;color:var(--indigo)\">CI</p><p style=\"font-size:14px;color:#3730A3\">Componente</p></div>\n    <div class=\"card\" style=\"text-align:center;background:var(--indigo-soft);border-color:var(--indigo-line)\"><p style=\"font-family:var(--titulo);font-size:24px;font-weight:800;color:var(--indigo)\">09</p><p style=\"font-size:14px;color:#3730A3\">Habilidade</p></div>\n  </div>\n  <div class=\"dica\">\n    <div class=\"t\">💡 A lição</div>\n    <p>Você <strong>não precisa decorar a BNCC</strong> para pegar erros — basta conhecer a lógica do código. E, na dúvida, o NotebookLM responde citando a página do documento oficial.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "4.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎯 Gabarito\n\n\n  \n    ❌ EF07BI14 é impossível\n    No Ensino Fundamental não existe o componente \"Biologia\". Biologia só aparece no Ensino Médio. No Fundamental o componente é Ciências (CI).\n  \n  \n    EFEtapa\n    07Ano\n    CIComponente\n    09Habilidade\n  \n  \n    💡 A lição\n    Você não precisa decorar a BNCC para pegar erros — basta conhecer a lógica do código. E, na dúvida, o NotebookLM responde citando a página do documento oficial."
          }
        ]
      },
      {
        "titulo": "Sequências didáticas e metodologias ativas",
        "html": "<div class=\"slide\" data-n=\"48\" data-title=\"Sequências didáticas e metodologias ativas\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 4.2 a 4.4</div>\n<h1 class=\"st\">Sequências, projetos e metodologias ativas</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\" style=\"gap:16px;margin-bottom:16px\">\n    <div class=\"card\"><h4>📚 Sequência didática</h4><p>Aulas conectadas com progressão lógica. Uma aula isolada raramente consolida o aprendizado. Peça 3 a 5 aulas com objetivo, metodologia e avaliação de cada uma.</p></div>\n    <div class=\"card\"><h4>🔗 Projeto interdisciplinar</h4><p>Ciências + Matemática na Horta Escolar. História + Geografia. A IA monta justificativa, cronograma, produto final e critérios.</p></div>\n  </div>\n  <div class=\"grid3\" style=\"gap:14px\">\n    <div class=\"card\" style=\"padding:16px;text-align:center\"><div style=\"font-size:28px\">🔄</div><h4 style=\"font-size:15px;margin-top:6px\">Rotação por Estações</h4><p style=\"font-size:13px\">4 estações de 12 min: leitura, jogo, escrita e discussão.</p></div>\n    <div class=\"card\" style=\"padding:16px;text-align:center\"><div style=\"font-size:28px\">🏠</div><h4 style=\"font-size:15px;margin-top:6px\">Sala Invertida</h4><p style=\"font-size:13px\">Vídeo em casa, atividade prática na sala.</p></div>\n    <div class=\"card\" style=\"padding:16px;text-align:center\"><div style=\"font-size:28px\">🎮</div><h4 style=\"font-size:15px;margin-top:6px\">Gamificação</h4><p style=\"font-size:13px\">Competição entre equipes com pontuação e premiação simbólica.</p></div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "4.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 4.2 a 4.4\n\n\n  \n    📚 Sequência didáticaAulas conectadas com progressão lógica. Uma aula isolada raramente consolida o aprendizado. Peça 3 a 5 aulas com objetivo, metodologia e avaliação de cada uma.\n    🔗 Projeto interdisciplinarCiências + Matemática na Horta Escolar. História + Geografia. A IA monta justificativa, cronograma, produto final e critérios.\n  \n  \n    🔄Rotação por Estações4 estações de 12 min: leitura, jogo, escrita e discussão.\n    🏠Sala InvertidaVídeo em casa, atividade prática na sala.\n    🎮GamificaçãoCompetição entre equipes com pontuação e premiação simbólica."
          }
        ]
      },
      {
        "titulo": "NotebookLM: o assistente que não inventa",
        "html": "<div class=\"slide com-fig com-ia\" data-n=\"49\" data-title=\"NotebookLM: o assistente que não inventa\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">Capítulo 5.1</div>\n<h1 class=\"st\">NotebookLM: o assistente que <span class=\"lar\">não inventa</span></h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:16px\">A BNCC completa. O PPP da escola. O livro didático do PNLD. Ler tudo para achar um parágrafo é inviável — e existe uma ferramenta gratuita que resolve isso.</p>\n  <div class=\"grid3\" style=\"gap:14px;margin-bottom:16px\">\n    <div class=\"card\"><h4 style=\"font-size:16px\">🎯 Só responde pelo documento</h4><p style=\"font-size:13.5px\">Se a resposta não está no PDF, ele diz que não encontrou — em vez de inventar.</p></div>\n    <div class=\"card\"><h4 style=\"font-size:16px\">📄 Cita a página exata</h4><p style=\"font-size:13.5px\">Clique na nota e ele abre o trecho de onde tirou. Você confere na hora.</p></div>\n    <div class=\"card\"><h4 style=\"font-size:16px\">📊 Gera guias de estudo</h4><p style=\"font-size:13.5px\">Resumos, glossários e perguntas a partir do capítulo do livro.</p></div>\n  </div>\n  <div class=\"dica\">\n    <div class=\"t\">💡 Por que isso importa para a BNCC</div>\n    <p>Lembra que a IA às vezes erra o código? Suba o <strong>PDF oficial da BNCC</strong> e pergunte a ele: a resposta vem do documento real, com a página citada. <strong>É a diferença entre um palpite e uma consulta.</strong></p>\n  </div>\n</div>\n<div class=\"ia-barra\"><span class=\"rot\">Abrir e demonstrar</span><div class=\"ia-btns\"><a class=\"ia-btn notebook\" href=\"https://notebooklm.google.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>NotebookLM</a></div></div>\n<div class=\"fig-slide\"><img src=\"/curso/imagens/09_notebooklm_documentos.png\" alt=\"O NotebookLM localiza a informação exata dentro de documentos longos.\"><div class=\"fig-leg\">O NotebookLM localiza a informação exata dentro de documentos longos.</div></div>\n</div>",
        "secaoApostila": "5.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 5.1\n\n\n  A BNCC completa. O PPP da escola. O livro didático do PNLD. Ler tudo para achar um parágrafo é inviável — e existe uma ferramenta gratuita que resolve isso.\n  \n    🎯 Só responde pelo documentoSe a resposta não está no PDF, ele diz que não encontrou — em vez de inventar.\n    📄 Cita a página exataClique na nota e ele abre o trecho de onde tirou. Você confere na hora.\n    📊 Gera guias de estudoResumos, glossários e perguntas a partir do capítulo do livro.\n  \n  \n    💡 Por que isso importa para a BNCC\n    Lembra que a IA às vezes erra o código? Suba o PDF oficial da BNCC e pergunte a ele: a resposta vem do documento real, com a página citada. É a diferença entre um palpite e uma consulta."
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "notebooklm"
            ]
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/09_notebooklm_documentos.png",
            "legenda": "O NotebookLM localiza a informação exata dentro de documentos longos."
          }
        ]
      },
      {
        "titulo": "Passo a passo no NotebookLM",
        "html": "<div class=\"slide com-acoes\" data-n=\"50\" data-title=\"Passo a passo no NotebookLM\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">Capítulo 5.1 · Passo a passo</div>\n<h1 class=\"st\">Como usar o NotebookLM</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\" style=\"gap:18px\">\n    <div>\n      <div class=\"card\" style=\"margin-bottom:11px;padding:15px;display:flex;gap:13px;align-items:center\"><div style=\"width:32px;height:32px;border-radius:50%;background:var(--verde);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0\">1</div><p style=\"font-size:14px\">Acesse <a class=\"mono url-ia\" href=\"https://notebooklm.google.com\" target=\"_blank\" rel=\"noopener\">notebooklm.google.com</a> e entre com sua conta Google.</p></div>\n      <div class=\"card\" style=\"margin-bottom:11px;padding:15px;display:flex;gap:13px;align-items:center\"><div style=\"width:32px;height:32px;border-radius:50%;background:var(--verde);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0\">2</div><p style=\"font-size:14px\">Clique em <strong>\"Criar novo\"</strong> e dê um nome ao caderno.</p></div>\n      <div class=\"card\" style=\"margin-bottom:11px;padding:15px;display:flex;gap:13px;align-items:center\"><div style=\"width:32px;height:32px;border-radius:50%;background:var(--verde);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0\">3</div><p style=\"font-size:14px\">Clique em <strong>\"Adicionar fontes\"</strong> e envie seu PDF.</p></div>\n      <div class=\"card\" style=\"padding:15px;display:flex;gap:13px;align-items:center\"><div style=\"width:32px;height:32px;border-radius:50%;background:var(--verde);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0\">4</div><p style=\"font-size:14px\">Converse com o documento na caixa de texto.</p></div>\n    </div>\n    <div>\n      <div class=\"etiqueta verde\">O que perguntar</div>\n      <div class=\"prompt p12\">\"Quais são as habilidades de Ciências\ndo 7º ano relacionadas a\nsustentabilidade? Liste código e\ndescrição de cada uma.\"\n\n\"Crie 5 perguntas de interpretação\nbaseadas nas páginas 45 a 52.\"\n\n\"Resuma o capítulo 3 em tópicos que eu\npossa usar como roteiro de aula.\"</div><div class=\"prompt-acoes\" data-prompt-txt=\"&quot;Quais são as habilidades de Ciências\ndo 7º ano relacionadas a\nsustentabilidade? Liste código e\ndescrição de cada uma.&quot;\n\n&quot;Crie 5 perguntas de interpretação\nbaseadas nas páginas 45 a 52.&quot;\n\n&quot;Resuma o capítulo 3 em tópicos que eu\npossa usar como roteiro de aula.&quot;\"></div>\n    </div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "5.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 5.1 · Passo a passo\n\n\n  \n    \n      1Acesse notebooklm.google.com e entre com sua conta Google.\n      2Clique em \"Criar novo\" e dê um nome ao caderno.\n      3Clique em \"Adicionar fontes\" e envie seu PDF.\n      4Converse com o documento na caixa de texto.\n    \n    \n      O que perguntar"
          },
          {
            "tipo": "prompt",
            "texto": "\"Quais são as habilidades de Ciências\ndo 7º ano relacionadas a\nsustentabilidade? Liste código e\ndescrição de cada uma.\"\n\n\"Crie 5 perguntas de interpretação\nbaseadas nas páginas 45 a 52.\"\n\n\"Resuma o capítulo 3 em tópicos que eu\npossa usar como roteiro de aula.\"",
            "variaveis": []
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "notebooklm"
            ]
          }
        ]
      },
      {
        "titulo": "O Plano B quando a internet cai",
        "html": "<div class=\"slide\" data-n=\"51\" data-title=\"O Plano B quando a internet cai\">\n<div class=\"topo amarelo\"></div>\n<div class=\"badge amarelo\">Capítulo 5.2</div>\n<h1 class=\"st\">O Plano B obrigatório</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\" style=\"gap:18px;margin-bottom:18px\">\n    <div class=\"card\" style=\"background:var(--vermelho-sf);border-color:#FBD5D5\">\n      <h4 style=\"color:var(--vermelho-dk)\">⚠️ O limite do NotebookLM</h4>\n      <p style=\"color:#991B1B\">Cerca de <strong>50 perguntas por dia</strong> e até 100 cadernos. Desde setembro de 2026, o uso é controlado por cota que se renova a cada poucas horas.</p>\n      <p style=\"color:#991B1B;margin-top:8px\">Dá e sobra para o trabalho de um professor — mas em tarde de planejamento intenso, comece cedo.</p>\n    </div>\n    <div class=\"card\">\n      <h4>Alternativas se a cota acabar</h4>\n      <p><strong>Gemini</strong> e <strong>DeepSeek</strong> também aceitam PDFs anexados — menos rigorosos, então confira as respostas.</p>\n      <p style=\"margin-top:8px\"><strong>Recortar e colar:</strong> se precisa só de um capítulo, copie o trecho e cole na conversa. Funciona em qualquer ferramenta.</p>\n    </div>\n  </div>\n  <div class=\"dica\">\n    <div class=\"t\">💡 Quando a internet da escola cai</div>\n    <p>Todo professor da rede pública sabe que a internet oscila. <strong>Regra de ouro:</strong> gere seus planos em casa ou na sala dos professores, mas <strong>sempre salve em PDF ou imprima com antecedência</strong>. A tecnologia deve ser seu trampolim, nunca seu ponto único de falha.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "5.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 5.2\n\n\n  \n    \n      ⚠️ O limite do NotebookLM\n      Cerca de 50 perguntas por dia e até 100 cadernos. Desde setembro de 2026, o uso é controlado por cota que se renova a cada poucas horas.\n      Dá e sobra para o trabalho de um professor — mas em tarde de planejamento intenso, comece cedo.\n    \n    \n      Alternativas se a cota acabar\n      Gemini e DeepSeek também aceitam PDFs anexados — menos rigorosos, então confira as respostas.\n      Recortar e colar: se precisa só de um capítulo, copie o trecho e cole na conversa. Funciona em qualquer ferramenta.\n    \n  \n  \n    💡 Quando a internet da escola cai\n    Todo professor da rede pública sabe que a internet oscila. Regra de ouro: gere seus planos em casa ou na sala dos professores, mas sempre salve em PDF ou imprima com antecedência. A tecnologia deve ser seu trampolim, nunca seu ponto único de falha."
          }
        ]
      },
      {
        "titulo": "Mão na Massa 4 — Conversando com a BNCC",
        "html": "<div class=\"slide\" data-n=\"52\" data-title=\"Mão na Massa 4 — Conversando com a BNCC\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Oficina prática · 20 minutos</div>\n<h1 class=\"st\">Mão na Massa 4 — Conversando com a BNCC</h1>\n<div class=\"corpo\">\n  <div class=\"oficina\">\n    <div class=\"t\">✋ Agora é a sua vez</div>\n    <ol>\n      <li>Baixe o PDF da BNCC (ou do currículo da sua rede).</li>\n      <li>Crie um caderno no NotebookLM e suba o documento.</li>\n      <li>Pergunte: <em>\"Quais habilidades de [sua disciplina] do [seu ano] tratam de [tema que você vai dar]?\"</em></li>\n      <li><strong>Clique na citação</strong> e confirme que a informação está mesmo no documento.</li>\n      <li>Peça: <em>\"Com base nessas habilidades, sugira uma sequência de 3 aulas.\"</em></li>\n    </ol>\n  </div>\n</div>\n</div>",
        "secaoApostila": "5.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 20 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Baixe o PDF da BNCC (ou do currículo da sua rede).\n      Crie um caderno no NotebookLM e suba o documento.\n      Pergunte: \"Quais habilidades de [sua disciplina] do [seu ano] tratam de [tema que você vai dar]?\"\n      Clique na citação e confirme que a informação está mesmo no documento.\n      Peça: \"Com base nessas habilidades, sugira uma sequência de 3 aulas.\""
          }
        ]
      },
      {
        "titulo": "Saída 2 — o que você leva hoje",
        "html": "<div class=\"slide\" data-n=\"53\" data-title=\"Saída 2 — o que você leva hoje\" data-enc=\"2\" data-pos=\"fim\">\n<div class=\"sl-saida\">\n  <h2>✅ Antes de ir embora</h2>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>3 pareceres descritivos</strong> prontos (dados fictícios)</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 ata</strong> formatada</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 sequência didática</strong> vinculada à BNCC</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\">Um caderno no <strong>NotebookLM</strong> com a BNCC dentro</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\">Seu <strong>prompt-padrão de parecer</strong> salvo para todo bimestre</span></div>\n  <div class=\"it\" style=\"color:var(--laranja);font-weight:700;margin-top:8px\">📌 Tarefa: escreva os pareceres reais da sua turma e cronometre</div>\n</div>\n</div>",
        "secaoApostila": "5.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "✅ Antes de ir embora\n  \n  \n  \n  \n  \n  📌 Tarefa: escreva os pareceres reais da sua turma e cronometre"
          },
          {
            "tipo": "checklist",
            "itens": [
              "3 pareceres descritivos prontos (dados fictícios)",
              "1 ata formatada",
              "1 sequência didática vinculada à BNCC",
              "Um caderno no NotebookLM com a BNCC dentro",
              "Seu prompt-padrão de parecer salvo para todo bimestre"
            ]
          }
        ]
      }
    ]
  },
  {
    "encontro": 3,
    "titulo": "Encontro 3",
    "passos": [
      {
        "titulo": "Encontro 3 — Abertura",
        "html": "<div class=\"slide\" data-n=\"54\" data-title=\"Encontro 3 — Abertura\">\n<div class=\"divisor\">\n  <div class=\"num\">ENCONTRO 3 · 2 HORAS</div>\n  <h2>Materiais, Inclusão<br>e Recursos Visuais</h2>\n  <p>Hoje você cria materiais sob medida para a sua turma, adapta atividades para cada necessidade em menos de um minuto e descobre como ter o Canva Pro de graça.</p>\n  <div class=\"caps\">\n    <span class=\"cap-tag\">Cap. 6 · Materiais Educativos</span>\n    <span class=\"cap-tag\">Cap. 7 · Inclusão e DUA</span>\n    <span class=\"cap-tag\">Cap. 8 · Recursos Visuais</span>\n  </div>\n</div>\n</div>",
        "secaoApostila": "5.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "ENCONTRO 3 · 2 HORAS\n  Materiais, Inclusão\ne Recursos Visuais\n  Hoje você cria materiais sob medida para a sua turma, adapta atividades para cada necessidade em menos de um minuto e descobre como ter o Canva Pro de graça.\n  \n    Cap. 6 · Materiais Educativos\n    Cap. 7 · Inclusão e DUA\n    Cap. 8 · Recursos Visuais"
          }
        ]
      },
      {
        "titulo": "Aquecimento 3 — quem tem aluno com laudo?",
        "html": "<div class=\"slide\" data-n=\"55\" data-title=\"Aquecimento 3 — quem tem aluno com laudo?\" data-enc=\"3\" data-pos=\"apos:29\">\n<div class=\"sl-aquec\">\n  <div class=\"et\">🔥 AQUECIMENTO · 3 MINUTOS</div>\n  <h2>Levante a mão quem tem, hoje, ao menos um aluno com laudo na sala.</h2>\n  <p><strong>Mantenha levantada</strong> quem já recebeu da escola o material adaptado <em>pronto</em> para esse aluno.</p>\n  <p style=\"margin-top:20px;font-style:italic\">A diferença entre as duas mãos levantadas é o assunto de hoje.</p>\n</div>\n</div>",
        "secaoApostila": "5.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🔥 AQUECIMENTO · 3 MINUTOS\n  Levante a mão quem tem, hoje, ao menos um aluno com laudo na sala.\n  Mantenha levantada quem já recebeu da escola o material adaptado pronto para esse aluno.\n  A diferença entre as duas mãos levantadas é o assunto de hoje."
          }
        ]
      },
      {
        "titulo": "Textos que falam do mundo do aluno",
        "html": "<div class=\"slide com-acoes\" data-n=\"56\" data-title=\"Textos que falam do mundo do aluno\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 6.1</div>\n<h1 class=\"st\">Textos que falam do mundo do seu aluno</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:14px\">Em vez de textos genéricos da internet, crie textos que tenham a ver com a realidade deles. <strong>Um texto que fala do lugar onde a criança mora prende muito mais a atenção.</strong></p>\n  <div class=\"etiqueta\">Texto regional</div>\n  <div class=\"prompt p12\">Crie um texto informativo de 3 parágrafos sobre o Cerrado\nbrasileiro para alunos do 4º ano que moram em Goiás. Use nomes de\nanimais e frutas que eles encontram no dia a dia (pequi, buriti,\nlobo-guará, seriema). Ao final, inclua: (1) um glossário com 5\npalavras, (2) 4 perguntas de interpretação, (3) uma atividade de\ndesenho.</div><div class=\"prompt-acoes\" data-prompt-txt=\"Crie um texto informativo de 3 parágrafos sobre o Cerrado\nbrasileiro para alunos do 4º ano que moram em Goiás. Use nomes de\nanimais e frutas que eles encontram no dia a dia (pequi, buriti,\nlobo-guará, seriema). Ao final, inclua: (1) um glossário com 5\npalavras, (2) 4 perguntas de interpretação, (3) uma atividade de\ndesenho.\"></div>\n  <div class=\"dica\" style=\"margin-top:14px\">\n    <div class=\"t\">💡 A mesma lógica com metáforas</div>\n    <p>Peça: <em>\"Explique fotossíntese usando a metáfora de recarregar a bateria, como nos jogos de videogame.\"</em> A atenção dos estudantes é imediata.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "6.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 6.1\n\n\n  Em vez de textos genéricos da internet, crie textos que tenham a ver com a realidade deles. Um texto que fala do lugar onde a criança mora prende muito mais a atenção.\n  Texto regional\n  \n  \n    💡 A mesma lógica com metáforas\n    Peça: \"Explique fotossíntese usando a metáfora de recarregar a bateria, como nos jogos de videogame.\" A atenção dos estudantes é imediata."
          },
          {
            "tipo": "prompt",
            "texto": "Crie um texto informativo de 3 parágrafos sobre o Cerrado\nbrasileiro para alunos do 4º ano que moram em Goiás. Use nomes de\nanimais e frutas que eles encontram no dia a dia (pequi, buriti,\nlobo-guará, seriema). Ao final, inclua: (1) um glossário com 5\npalavras, (2) 4 perguntas de interpretação, (3) uma atividade de\ndesenho.",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Duelo 3 — o texto que fala do mundo do aluno",
        "html": "<div class=\"slide\" data-n=\"57\" data-title=\"Duelo 3 — o texto que fala do mundo do aluno\" data-enc=\"3\" data-pos=\"apos:30\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">⚔️ Duelo 3 · 8 min</div>\n<h1 class=\"st\">O texto que fala do mundo do aluno</h1>\n<div class=\"sl-duelo\" style=\"top:150px;padding:0 70px 40px\">\n  <div class=\"lado\">\n    <div class=\"box ruim\">\n      <div class=\"rot\">❌ Genérico</div>\n      <div class=\"pr\">Faça um texto sobre meio\nambiente para o 4º ano.</div>\n      <div class=\"res\"><strong>Resultado:</strong> correto e absolutamente esquecível — \"devemos preservar a natureza\". Poderia ser de uma apostila de 1998. <strong>O aluno lê sem se ver ali.</strong></div>\n    </div>\n    <div class=\"box bom\">\n      <div class=\"rot\">✅ Ancorado na realidade da turma</div>\n      <div class=\"pr\">Crie um texto informativo de\n3 parágrafos sobre o Cerrado para\nalunos do 4º ano que moram em Goiás.\nUse animais e frutas do dia a dia\ndeles (pequi, buriti, lobo-guará,\nseriema).\nInclua glossário de 5 palavras,\n4 perguntas e uma atividade de\ndesenho.</div>\n      <div class=\"res\"><strong>Resultado:</strong> o aluno reconhece o pequi do quintal. <strong>O texto vira o mundo dele</strong> — e a interpretação melhora porque já tem repertório.</div>\n    </div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "6.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ Duelo 3 · 8 min\n\n\n  \n    \n      ❌ Genérico\n      Faça um texto sobre meio\nambiente para o 4º ano.\n      Resultado: correto e absolutamente esquecível — \"devemos preservar a natureza\". Poderia ser de uma apostila de 1998. O aluno lê sem se ver ali.\n    \n    \n      ✅ Ancorado na realidade da turma\n      Crie um texto informativo de\n3 parágrafos sobre o Cerrado para\nalunos do 4º ano que moram em Goiás.\nUse animais e frutas do dia a dia\ndeles (pequi, buriti, lobo-guará,\nseriema).\nInclua glossário de 5 palavras,\n4 perguntas e uma atividade de\ndesenho.\n      Resultado: o aluno reconhece o pequi do quintal. O texto vira o mundo dele — e a interpretação melhora porque já tem repertório."
          }
        ]
      },
      {
        "titulo": "Gabarito que ensina: distratores",
        "html": "<div class=\"slide com-acoes\" data-n=\"58\" data-title=\"Gabarito que ensina: distratores\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 6.2</div>\n<h1 class=\"st\">O gabarito que ensina no momento do erro</h1>\n<div class=\"corpo\">\n  <div class=\"traduzindo\" style=\"margin-bottom:16px\">\n    <div class=\"t\">📖 Traduzindo: Distrator</div>\n    <p>São as alternativas erradas de uma questão. Um bom distrator não é absurdo — ele representa um <strong>erro que o aluno realmente comete</strong>. Quando você sabe qual distrator ele escolheu, descobre exatamente onde está o buraco no raciocínio.</p>\n  </div>\n  <div class=\"etiqueta\">Gabarito que ensina</div>\n  <div class=\"prompt p12\">Crie 3 questões de múltipla escolha inéditas sobre \"Porcentagem\nno Comércio\" para o 7º ano.\n- Enunciado contextualizado com compras na feira ou supermercado\n- 4 alternativas (A, B, C, D), sendo apenas uma correta\n- Gabarito comentado explicando o cálculo correto\n- Análise das alternativas erradas: explique qual erro de\n  raciocínio comum do aluno gerou cada alternativa incorreta</div><div class=\"prompt-acoes\" data-prompt-txt=\"Crie 3 questões de múltipla escolha inéditas sobre &quot;Porcentagem\nno Comércio&quot; para o 7º ano.\n- Enunciado contextualizado com compras na feira ou supermercado\n- 4 alternativas (A, B, C, D), sendo apenas uma correta\n- Gabarito comentado explicando o cálculo correto\n- Análise das alternativas erradas: explique qual erro de\n  raciocínio comum do aluno gerou cada alternativa incorreta\"></div>\n</div>\n</div>",
        "secaoApostila": "6.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 6.2\n\n\n  \n    📖 Traduzindo: Distrator\n    São as alternativas erradas de uma questão. Um bom distrator não é absurdo — ele representa um erro que o aluno realmente comete. Quando você sabe qual distrator ele escolheu, descobre exatamente onde está o buraco no raciocínio.\n  \n  Gabarito que ensina"
          },
          {
            "tipo": "prompt",
            "texto": "Crie 3 questões de múltipla escolha inéditas sobre \"Porcentagem\nno Comércio\" para o 7º ano.\n- Enunciado contextualizado com compras na feira ou supermercado\n- 4 alternativas (A, B, C, D), sendo apenas uma correta\n- Gabarito comentado explicando o cálculo correto\n- Análise das alternativas erradas: explique qual erro de\n  raciocínio comum do aluno gerou cada alternativa incorreta",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Jogos, caça-palavras e cruzadinhas",
        "html": "<div class=\"slide\" data-n=\"59\" data-title=\"Jogos, caça-palavras e cruzadinhas\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 6.3</div>\n<h1 class=\"st\">Jogos, caça-palavras e cruzadinhas</h1>\n<div class=\"corpo\">\n  <div class=\"grid3\" style=\"gap:14px;margin-bottom:18px\">\n    <div class=\"card\" style=\"text-align:center\"><div style=\"font-size:30px\">🔤</div><h4 style=\"font-size:16px;margin-top:6px\">Caça-palavras</h4><p style=\"font-size:13.5px\">12 palavras com dicas contextualizadas por tema.</p></div>\n    <div class=\"card\" style=\"text-align:center\"><div style=\"font-size:30px\">🧩</div><h4 style=\"font-size:16px;margin-top:6px\">Cruzadinha</h4><p style=\"font-size:13.5px\">Dicas que exigem raciocínio, não só sinônimo.</p></div>\n    <div class=\"card\" style=\"text-align:center\"><div style=\"font-size:30px\">✅</div><h4 style=\"font-size:16px;margin-top:6px\">Quiz V ou F</h4><p style=\"font-size:13.5px\">Com explicação infantil de por que é falso.</p></div>\n  </div>\n  <div class=\"atencao\">\n    <div class=\"t\">⚠️ Cuidado com a grade de letras</div>\n    <p>A IA é ótima para gerar <strong>as palavras e as dicas</strong>, mas costuma errar ao montar a <strong>grade</strong> — coloca palavras que não se cruzam ou letras que não batem. <strong>Peça a lista à IA e monte a grade você mesmo</strong> (ou use um gerador gratuito). Economiza tempo sem gerar material com erro.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "6.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 6.3\n\n\n  \n    🔤Caça-palavras12 palavras com dicas contextualizadas por tema.\n    🧩CruzadinhaDicas que exigem raciocínio, não só sinônimo.\n    ✅Quiz V ou FCom explicação infantil de por que é falso.\n  \n  \n    ⚠️ Cuidado com a grade de letras\n    A IA é ótima para gerar as palavras e as dicas, mas costuma errar ao montar a grade — coloca palavras que não se cruzam ou letras que não batem. Peça a lista à IA e monte a grade você mesmo (ou use um gerador gratuito). Economiza tempo sem gerar material com erro."
          }
        ]
      },
      {
        "titulo": "Inclusão: onde a IA mais transforma",
        "html": "<div class=\"slide\" data-n=\"60\" data-title=\"Inclusão: onde a IA mais transforma\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">Capítulo 7.1</div>\n<h1 class=\"st\">Inclusão: onde a IA mais transforma</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:16px\">A educação inclusiva é lei. Mas na prática o professor recebe alunos com laudos e não tem formação nem tempo para adaptar tudo. <strong>A IA adapta uma atividade em menos de um minuto.</strong></p>\n  <div class=\"traduzindo\" style=\"margin-bottom:16px\">\n    <div class=\"t\">📖 Traduzindo: DUA (Desenho Universal para a Aprendizagem)</div>\n    <p>É a ideia de que uma aula bem planejada oferece <strong>múltiplos caminhos para todo mundo</strong>: formas diferentes de apresentar o conteúdo (texto, imagem, áudio), de o aluno responder (escrevendo, falando, desenhando) e de motivá-lo. <strong>Quando adaptamos pensando em quem tem mais dificuldade, a sala inteira ganha.</strong></p>\n  </div>\n  <div class=\"grid4\" style=\"gap:13px\">\n    <div class=\"card\" style=\"text-align:center;padding:15px\"><div style=\"font-size:26px\">🎯</div><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;margin-top:5px\">TDAH</p></div>\n    <div class=\"card\" style=\"text-align:center;padding:15px\"><div style=\"font-size:26px\">📖</div><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;margin-top:5px\">Dislexia</p></div>\n    <div class=\"card\" style=\"text-align:center;padding:15px\"><div style=\"font-size:26px\">🧩</div><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;margin-top:5px\">TEA</p></div>\n    <div class=\"card\" style=\"text-align:center;padding:15px\"><div style=\"font-size:26px\">🚀</div><p style=\"font-family:var(--titulo);font-weight:700;font-size:14px;margin-top:5px\">Altas habilidades</p></div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "7.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 7.1\n\n\n  A educação inclusiva é lei. Mas na prática o professor recebe alunos com laudos e não tem formação nem tempo para adaptar tudo. A IA adapta uma atividade em menos de um minuto.\n  \n    📖 Traduzindo: DUA (Desenho Universal para a Aprendizagem)\n    É a ideia de que uma aula bem planejada oferece múltiplos caminhos para todo mundo: formas diferentes de apresentar o conteúdo (texto, imagem, áudio), de o aluno responder (escrevendo, falando, desenhando) e de motivá-lo. Quando adaptamos pensando em quem tem mais dificuldade, a sala inteira ganha.\n  \n  \n    🎯TDAH\n    📖Dislexia\n    🧩TEA\n    🚀Altas habilidades"
          }
        ]
      },
      {
        "titulo": "Caso 3 — uma turma, quatro necessidades",
        "html": "<div class=\"slide\" data-n=\"61\" data-title=\"Caso 3 — uma turma, quatro necessidades\" data-enc=\"3\" data-pos=\"apos:33\">\n<div class=\"sl-caso\">\n  <div class=\"et\">🎭 ESTUDO DE CASO 3 · 13 MIN · EM DUPLAS</div>\n  <h2>Uma turma, quatro necessidades</h2>\n  <div class=\"cena-sl\">\n    <strong>28 alunos no 5º ano</strong>, aula de interpretação de texto. Na sala: <strong>um aluno com TEA</strong>, que trava com linguagem figurada; <strong>dois com dislexia</strong>; <strong>três ainda em alfabetização</strong>; e <strong>uma aluna que termina tudo em 5 minutos</strong> e fica entediada. Você tem <strong>uma</strong> aula de 50 min e <strong>não</strong> quer que ninguém se sinta exposto.\n  </div>\n  <div class=\"perg\">Quantas versões vocês prepararão? E como fazem sem que a turma perceba quem recebeu qual?</div>\n</div>\n</div>",
        "secaoApostila": "7.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎭 ESTUDO DE CASO 3 · 13 MIN · EM DUPLAS\n  Uma turma, quatro necessidades\n  \n    28 alunos no 5º ano, aula de interpretação de texto. Na sala: um aluno com TEA, que trava com linguagem figurada; dois com dislexia; três ainda em alfabetização; e uma aluna que termina tudo em 5 minutos e fica entediada. Você tem uma aula de 50 min e não quer que ninguém se sinta exposto.\n  \n  Quantas versões vocês prepararão? E como fazem sem que a turma perceba quem recebeu qual?"
          }
        ]
      },
      {
        "titulo": "Caso 3 — a saída elegante",
        "html": "<div class=\"slide\" data-n=\"62\" data-title=\"Caso 3 — a saída elegante\" data-enc=\"3\" data-pos=\"apos:C3\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">💡 Solução comentada</div>\n<h1 class=\"st\">Mesmo tema, mesma aparência, três profundidades</h1>\n<div class=\"corpo\">\n  <div class=\"card\" style=\"background:var(--vermelho-sf);border-color:#FBD5D5;margin-bottom:16px\">\n    <h4 style=\"color:var(--vermelho-dk)\">❌ O erro comum</h4>\n    <p style=\"color:#991B1B\">Preparar 4 atividades sobre temas diferentes. Dá um trabalho enorme e — pior — <strong>escancara a diferença</strong>: todo mundo vê quem recebeu \"a folha mais fácil\".</p>\n  </div>\n  <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0\">\n    <h4 style=\"color:var(--verde-dark)\">✅ O que funciona</h4>\n    <p style=\"color:#047857\"><strong>O mesmo texto e o mesmo tema para todos</strong>, em três níveis de profundidade, mais os ajustes de forma para TEA e dislexia. As folhas se parecem visualmente. A turma conversa sobre a mesma história e <strong>ninguém fica marcado</strong>.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "7.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "💡 Solução comentada\n\n\n  \n    ❌ O erro comum\n    Preparar 4 atividades sobre temas diferentes. Dá um trabalho enorme e — pior — escancara a diferença: todo mundo vê quem recebeu \"a folha mais fácil\".\n  \n  \n    ✅ O que funciona\n    O mesmo texto e o mesmo tema para todos, em três níveis de profundidade, mais os ajustes de forma para TEA e dislexia. As folhas se parecem visualmente. A turma conversa sobre a mesma história e ninguém fica marcado."
          }
        ]
      },
      {
        "titulo": "Adaptação para TDAH e Dislexia",
        "html": "<div class=\"slide com-fig\" data-n=\"63\" data-title=\"Adaptação para TDAH e Dislexia\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">Capítulo 7.1 e 7.2</div>\n<h1 class=\"st\">Adaptação para TDAH e Dislexia</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\" style=\"gap:16px\">\n    <div>\n      <div class=\"traduzindo\" style=\"margin-bottom:10px;padding:14px\">\n        <div class=\"t\" style=\"font-size:15px\">📖 TDAH</div>\n        <p style=\"font-size:13.5px\">Dificuldade em manter foco por longos períodos. Textos longos e atividades monótonas são especialmente difíceis.</p>\n      </div>\n      <div class=\"card\" style=\"padding:15px\">\n        <p style=\"font-size:13.5px\"><strong>O que pedir:</strong> parágrafos de no máximo 3 linhas, marcadores visuais, uma <strong>pausa ativa</strong> no meio, atividade final manual, microetapas com caixas de marcação, tempo total menor.</p>\n      </div>\n    </div>\n    <div>\n      <div class=\"traduzindo\" style=\"margin-bottom:10px;padding:14px\">\n        <div class=\"t\" style=\"font-size:15px\">📖 Dislexia</div>\n        <p style=\"font-size:13.5px\">Afeta a decodificação das palavras. O aluno <strong>não</strong> tem menos capacidade — o cérebro processa as letras de forma diferente.</p>\n      </div>\n      <div class=\"card\" style=\"padding:15px\">\n        <p style=\"font-size:13.5px\"><strong>O que pedir:</strong> fonte 14 ou 16, espaçamento duplo, frases de até 10 palavras, ordem direta, sem fonemas parecidos, negrito em nomes, mini-glossário e \"resumão\" final.</p>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"fig-slide\"><img src=\"/curso/imagens/12_inclusao_escolar_sala.png\" alt=\"A IA permite adaptar materiais para cada necessidade, em minutos.\"><div class=\"fig-leg\">A IA permite adaptar materiais para cada necessidade, em minutos.</div></div>\n</div>",
        "secaoApostila": "7.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 7.1 e 7.2\n\n\n  \n    \n      \n        📖 TDAH\n        Dificuldade em manter foco por longos períodos. Textos longos e atividades monótonas são especialmente difíceis.\n      \n      \n        O que pedir: parágrafos de no máximo 3 linhas, marcadores visuais, uma pausa ativa no meio, atividade final manual, microetapas com caixas de marcação, tempo total menor.\n      \n    \n    \n      \n        📖 Dislexia\n        Afeta a decodificação das palavras. O aluno não tem menos capacidade — o cérebro processa as letras de forma diferente.\n      \n      \n        O que pedir: fonte 14 ou 16, espaçamento duplo, frases de até 10 palavras, ordem direta, sem fonemas parecidos, negrito em nomes, mini-glossário e \"resumão\" final."
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/12_inclusao_escolar_sala.png",
            "legenda": "A IA permite adaptar materiais para cada necessidade, em minutos."
          }
        ]
      },
      {
        "titulo": "Adaptação para TEA e altas habilidades",
        "html": "<div class=\"slide com-acoes\" data-n=\"64\" data-title=\"Adaptação para TEA e altas habilidades\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">Capítulo 7.3 e 7.4</div>\n<h1 class=\"st\">Adaptação para TEA e altas habilidades</h1>\n<div class=\"corpo\">\n  <div class=\"traduzindo\" style=\"margin-bottom:14px;padding:15px\">\n    <div class=\"t\" style=\"font-size:16px\">📖 Traduzindo: TEA</div>\n    <p style=\"font-size:14px\">Alunos autistas costumam interpretar instruções <strong>de forma rigorosamente literal</strong>. Metáforas, ironias e comandos abertos geram angústia e travamento.</p>\n  </div>\n  <div class=\"grid2\" style=\"gap:16px\">\n    <div>\n      <div class=\"etiqueta vermelha\">❌ Enunciado original</div>\n      <div class=\"prompt p12\">\"Dê asas à sua imaginação e viaje\npelo relevo brasileiro explicando\nos altos e baixos da paisagem.\"</div>\n    </div>\n    <div>\n      <div class=\"etiqueta verde\">✅ O que pedir à IA</div>\n      <div class=\"prompt p12\">\"Remova todas as metáforas. Seja\n100% literal, concreto e\nsequencial: diga exatamente o que\nele deve fazer, passo a passo,\nem 2 linhas objetivas.\"</div><div class=\"prompt-acoes\" data-prompt-txt=\"&quot;Remova todas as metáforas. Seja\n100% literal, concreto e\nsequencial: diga exatamente o que\nele deve fazer, passo a passo,\nem 2 linhas objetivas.&quot;\"></div>\n    </div>\n  </div>\n  <div class=\"dica\" style=\"margin-top:14px\">\n    <div class=\"t\">💡 Não esqueça dos que terminam em 5 minutos</div>\n    <p>Peça <strong>\"Desafios do Mestre\"</strong>: problemas lógicos complexos em formato de enigma, usando o mesmo conteúdo. <strong>O tédio também é uma forma de exclusão.</strong></p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "7.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 7.3 e 7.4\n\n\n  \n    📖 Traduzindo: TEA\n    Alunos autistas costumam interpretar instruções de forma rigorosamente literal. Metáforas, ironias e comandos abertos geram angústia e travamento.\n  \n  \n    \n      ❌ Enunciado original\n      \n    \n    \n      ✅ O que pedir à IA\n      \n    \n  \n  \n    💡 Não esqueça dos que terminam em 5 minutos\n    Peça \"Desafios do Mestre\": problemas lógicos complexos em formato de enigma, usando o mesmo conteúdo. O tédio também é uma forma de exclusão."
          },
          {
            "tipo": "prompt",
            "texto": "\"Remova todas as metáforas. Seja\n100% literal, concreto e\nsequencial: diga exatamente o que\nele deve fazer, passo a passo,\nem 2 linhas objetivas.\"",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 3 — a adaptação que não adapta",
        "html": "<div class=\"slide\" data-n=\"65\" data-title=\"Caça ao Erro 3 — a adaptação que não adapta\" data-enc=\"3\" data-pos=\"apos:35\">\n<div class=\"topo amarelo\"></div>\n<div class=\"badge amarelo\">🕵️ Caça ao Erro 3 · 4 min</div>\n<h1 class=\"st\">Pedimos adaptação para TEA. Ela devolveu isto.</h1>\n<div class=\"sl-caca\" style=\"top:150px;height:auto;padding:0 70px\">\n  <div class=\"resp\">\n    <strong>Atividade: Viajando pelo mundo das frações</strong><br><br>\n    1. <em>Solte a imaginação</em> e <em>mergulhe no universo</em> dos números!<br>\n    2. Divida a pizza como quem <em>divide alegria</em> entre amigos.<br>\n    3. Agora você vai <em>brilhar</em>: pinte as partes que representam 1/4.<br>\n    4. Capriche e deixe sua <em>criatividade voar alto</em>!\n  </div>\n  <div class=\"desafio-txt\">🔍 Dois minutos: por que esta adaptação falha?</div>\n</div>\n</div>",
        "secaoApostila": "7.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕵️ Caça ao Erro 3 · 4 min\n\n\n  \n    Atividade: Viajando pelo mundo das frações\n\n\n    1. Solte a imaginação e mergulhe no universo dos números!\n\n    2. Divida a pizza como quem divide alegria entre amigos.\n\n    3. Agora você vai brilhar: pinte as partes que representam 1/4.\n\n    4. Capriche e deixe sua criatividade voar alto!\n  \n  🔍 Dois minutos: por que esta adaptação falha?"
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 3 — gabarito",
        "html": "<div class=\"slide\" data-n=\"66\" data-title=\"Caça ao Erro 3 — gabarito\" data-enc=\"3\" data-pos=\"apos:C5\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">🎯 Gabarito</div>\n<h1 class=\"st\">Cinco metáforas em quatro linhas</h1>\n<div class=\"corpo\">\n  <div class=\"atencao\" style=\"margin-bottom:16px\">\n    <div class=\"t\">A IA obedeceu à forma, não ao princípio</div>\n    <p>Ela <strong>numerou</strong> como você pediu — mas não adaptou a <strong>linguagem</strong>, que é o que mais importa no TEA. \"Solte a imaginação\", \"mergulhe no universo\", \"dividir alegria\", \"vai brilhar\", \"voar alto\".</p>\n  </div>\n  <div class=\"card\" style=\"margin-bottom:14px\">\n    <p style=\"font-size:17px\">Um aluno que interpreta literalmente pode <strong>travar</strong> tentando entender como se mergulha em números ou como a criatividade voa.</p>\n  </div>\n  <div class=\"dica\">\n    <div class=\"t\">💡 A lição</div>\n    <p>Peça sempre de forma explícita: <strong>\"linguagem 100% literal, sem metáforas, sem linguagem figurada\"</strong> — e depois <strong>confira</strong>. Você conhece o aluno; a IA não.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "7.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎯 Gabarito\n\n\n  \n    A IA obedeceu à forma, não ao princípio\n    Ela numerou como você pediu — mas não adaptou a linguagem, que é o que mais importa no TEA. \"Solte a imaginação\", \"mergulhe no universo\", \"dividir alegria\", \"vai brilhar\", \"voar alto\".\n  \n  \n    Um aluno que interpreta literalmente pode travar tentando entender como se mergulha em números ou como a criatividade voa.\n  \n  \n    💡 A lição\n    Peça sempre de forma explícita: \"linguagem 100% literal, sem metáforas, sem linguagem figurada\" — e depois confira. Você conhece o aluno; a IA não."
          }
        ]
      },
      {
        "titulo": "Troca com o colega — mostre o que você gerou",
        "html": "<div class=\"slide\" data-n=\"67\" data-title=\"Troca com o colega — mostre o que você gerou\" data-enc=\"3\" data-pos=\"apos:35\">\n<div class=\"sl-aquec\" style=\"background:linear-gradient(150deg,#ECFDF5 0%,#D1FAE5 60%,#F0FDF4 100%)\">\n  <div class=\"et\" style=\"color:var(--verde-dark)\">👥 TROCA COM O COLEGA · 4 MINUTOS</div>\n  <h2 style=\"color:var(--verde-dark)\">Vire para o lado e mostre o que você gerou.</h2>\n  <p style=\"color:#047857\">O colega aponta <strong>uma coisa boa</strong> e <strong>uma a melhorar</strong>. Depois troquem os papéis.</p>\n  <p style=\"margin-top:20px;font-style:italic;color:#047857\">A sala inteira é um banco de experiência. Use.</p>\n</div>\n</div>",
        "secaoApostila": "7.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "👥 TROCA COM O COLEGA · 4 MINUTOS\n  Vire para o lado e mostre o que você gerou.\n  O colega aponta uma coisa boa e uma a melhorar. Depois troquem os papéis.\n  A sala inteira é um banco de experiência. Use."
          }
        ]
      },
      {
        "titulo": "A mesma aula em 3 níveis",
        "html": "<div class=\"slide\" data-n=\"68\" data-title=\"A mesma aula em 3 níveis\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Capítulo 7.5 · A técnica mais valiosa</div>\n<h1 class=\"st\">A mesma aula em 3 níveis</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:16px\">Quando a turma tem alunos em níveis muito diferentes, você não dá três aulas — <strong>dá uma aula com três versões da atividade.</strong> Todos trabalham o mesmo tema, ao mesmo tempo, e ninguém se sente exposto.</p>\n  <div class=\"grid3\" style=\"gap:14px;margin-bottom:16px\">\n    <div class=\"card\" style=\"border-top:5px solid #94A3B8\"><h4>Versão A · Básica</h4><p style=\"font-size:13.5px\">Para alunos com defasagem. Texto curto, perguntas com resposta localizada diretamente no texto.</p></div>\n    <div class=\"card\" style=\"border-top:5px solid var(--indigo)\"><h4>Versão B · Intermediária</h4><p style=\"font-size:13.5px\">Para o nível esperado. Texto médio, perguntas de interpretação.</p></div>\n    <div class=\"card\" style=\"border-top:5px solid var(--laranja)\"><h4>Versão C · Avançada</h4><p style=\"font-size:13.5px\">Para alunos acima do nível. Perguntas de inferência, opinião e relação com outros temas.</p></div>\n  </div>\n  <div class=\"dica\">\n    <div class=\"t\">💡 O atalho: Diffit</div>\n    <p>O <strong>Diffit</strong> faz os três níveis automaticamente. Ótimo atalho — <strong>mas aprenda primeiro a fazer pelo prompt.</strong> Assim você não fica refém de uma ferramenta e ajusta o nível exatamente à sua turma. No plano gratuito ele não exporta para o Docs; você copia e cola.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "7.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 7.5 · A técnica mais valiosa\n\n\n  Quando a turma tem alunos em níveis muito diferentes, você não dá três aulas — dá uma aula com três versões da atividade. Todos trabalham o mesmo tema, ao mesmo tempo, e ninguém se sente exposto.\n  \n    Versão A · BásicaPara alunos com defasagem. Texto curto, perguntas com resposta localizada diretamente no texto.\n    Versão B · IntermediáriaPara o nível esperado. Texto médio, perguntas de interpretação.\n    Versão C · AvançadaPara alunos acima do nível. Perguntas de inferência, opinião e relação com outros temas.\n  \n  \n    💡 O atalho: Diffit\n    O Diffit faz os três níveis automaticamente. Ótimo atalho — mas aprenda primeiro a fazer pelo prompt. Assim você não fica refém de uma ferramenta e ajusta o nível exatamente à sua turma. No plano gratuito ele não exporta para o Docs; você copia e cola."
          }
        ]
      },
      {
        "titulo": "Desafio 3 — a mesma atividade em 3 níveis",
        "html": "<div class=\"slide\" data-n=\"69\" data-title=\"Desafio 3 — a mesma atividade em 3 níveis\" data-enc=\"3\" data-pos=\"apos:36\">\n<div class=\"sl-crono\">\n  <div class=\"num\">6:00</div>\n  <h2>A mesma atividade em 3 níveis</h2>\n  <p>Escolha um conteúdo real. Peça as versões <strong>A, B e C</strong> do mesmo tema.</p>\n  <p style=\"margin-top:16px\">Verifique: <strong>as três parecem visualmente semelhantes?</strong> Ajuste o nível que ficou fora do alvo.</p>\n</div>\n</div>",
        "secaoApostila": "7.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "6:00\n  A mesma atividade em 3 níveis\n  Escolha um conteúdo real. Peça as versões A, B e C do mesmo tema.\n  Verifique: as três parecem visualmente semelhantes? Ajuste o nível que ficou fora do alvo."
          }
        ]
      },
      {
        "titulo": "Mão na Massa 6 — Adaptação para o seu aluno real",
        "html": "<div class=\"slide\" data-n=\"70\" data-title=\"Mão na Massa 6 — Adaptação para o seu aluno real\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Oficina prática · 20 minutos</div>\n<h1 class=\"st\">Mão na Massa 6 — Adaptação real</h1>\n<div class=\"corpo\">\n  <div class=\"oficina\">\n    <div class=\"t\">✋ Agora é a sua vez</div>\n    <ol>\n      <li>Pense num aluno que precisa de adaptação — <strong>sem escrever o nome dele</strong>.</li>\n      <li>Pegue uma atividade que você já usa e peça a adaptação adequada (TDAH, dislexia, TEA ou altas habilidades).</li>\n      <li>Depois, gere a <strong>mesma atividade em 3 níveis</strong> (A, B e C).</li>\n      <li>Compare: você produziria isso à mão em quanto tempo?</li>\n      <li>Revise com cuidado — <strong>você conhece o aluno, a IA não.</strong></li>\n    </ol>\n  </div>\n</div>\n</div>",
        "secaoApostila": "7.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 20 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Pense num aluno que precisa de adaptação — sem escrever o nome dele.\n      Pegue uma atividade que você já usa e peça a adaptação adequada (TDAH, dislexia, TEA ou altas habilidades).\n      Depois, gere a mesma atividade em 3 níveis (A, B e C).\n      Compare: você produziria isso à mão em quanto tempo?\n      Revise com cuidado — você conhece o aluno, a IA não."
          }
        ]
      },
      {
        "titulo": "Canva para Educação: Pro gratuito",
        "html": "<div class=\"slide com-fig\" data-n=\"71\" data-title=\"Canva para Educação: Pro gratuito\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">Capítulo 8.1</div>\n<h1 class=\"st\">Canva para Educação: Pro gratuito para docentes</h1>\n<div class=\"corpo\">\n  <div class=\"lilas\" style=\"margin-bottom:16px\">\n    <div class=\"t\">✅ Como liberar o seu</div>\n    <p style=\"color:#3730A3\">1. Acesse <span class=\"mono\">canva.com/education</span> · 2. Escolha a opção para <strong>professores</strong> · 3. Cadastre-se com o <strong>e-mail institucional</strong>, se sua rede tiver · 4. Se não houver, envie <strong>holerite ou declaração da escola</strong> · 5. Aprovação em horas ou poucos dias — depois é gratuito e permanente.</p>\n  </div>\n  <div class=\"grid2\" style=\"gap:16px\">\n    <div class=\"card\"><h4>🪄 Design Mágico</h4><p>Digite o tema com detalhes e ele gera 10+ slides com texto, imagem e layout. Você só revisa e ajusta.</p><p style=\"margin-top:8px;font-style:italic;font-size:13.5px;color:var(--indigo)\">\"Apresentação lúdica sobre o Sistema Solar para crianças de 8 anos, com ilustrações coloridas\"</p></div>\n    <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0\"><h4 style=\"color:var(--verde-dark)\">📍 Em várias redes já é automático</h4><p style=\"color:#047857\">A rede estadual de São Paulo tem acordo com o Canva de <strong>2026 a 2029</strong>: o login é feito direto com o e-mail <span class=\"mono\" style=\"color:#047857\">@educacao.sp.gov.br</span>, sem precisar enviar documento.</p></div>\n  </div>\n</div>\n<div class=\"fig-slide\"><img src=\"/curso/imagens/15_canva_educacao_design.png\" alt=\"O Canva para Educação gera apresentações e cartazes prontos.\"><div class=\"fig-leg\">O Canva para Educação gera apresentações e cartazes prontos.</div></div>\n</div>",
        "secaoApostila": "8.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 8.1\n\n\n  \n    ✅ Como liberar o seu\n    1. Acesse canva.com/education · 2. Escolha a opção para professores · 3. Cadastre-se com o e-mail institucional, se sua rede tiver · 4. Se não houver, envie holerite ou declaração da escola · 5. Aprovação em horas ou poucos dias — depois é gratuito e permanente.\n  \n  \n    🪄 Design MágicoDigite o tema com detalhes e ele gera 10+ slides com texto, imagem e layout. Você só revisa e ajusta.\"Apresentação lúdica sobre o Sistema Solar para crianças de 8 anos, com ilustrações coloridas\"\n    📍 Em várias redes já é automáticoA rede estadual de São Paulo tem acordo com o Canva de 2026 a 2029: o login é feito direto com o e-mail @educacao.sp.gov.br, sem precisar enviar documento."
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/15_canva_educacao_design.png",
            "legenda": "O Canva para Educação gera apresentações e cartazes prontos."
          }
        ]
      },
      {
        "titulo": "Imagens, mapas mentais, vídeo e podcast",
        "html": "<div class=\"slide\" data-n=\"72\" data-title=\"Imagens, mapas mentais, vídeo e podcast\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 8.3 a 8.5</div>\n<h1 class=\"st\">Imagens, mapas mentais, vídeo e podcast</h1>\n<div class=\"corpo\">\n  <div class=\"grid4\" style=\"gap:14px;margin-bottom:16px\">\n    <div class=\"card\" style=\"padding:16px\"><div style=\"font-size:26px\">🖼️</div><h4 style=\"font-size:15px;margin-top:5px\">Imagens sob medida</h4><p style=\"font-size:13px\">Descreva e ela desenha. Pode ajustar conversando: \"coloque óculos na criança\".</p></div>\n    <div class=\"card\" style=\"padding:16px\"><div style=\"font-size:26px\">🧠</div><h4 style=\"font-size:15px;margin-top:5px\">Mapas mentais</h4><p style=\"font-size:13px\">Estrutura pronta para redesenhar no quadro ou montar no Canva.</p></div>\n    <div class=\"card\" style=\"padding:16px\"><div style=\"font-size:26px\">🎬</div><h4 style=\"font-size:15px;margin-top:5px\">Roteiro de vídeo</h4><p style=\"font-size:13px\">Com indicação de cenas e imagens em cada momento.</p></div>\n    <div class=\"card\" style=\"padding:16px\"><div style=\"font-size:26px\">🎙️</div><h4 style=\"font-size:15px;margin-top:5px\">Roteiro de podcast</h4><p style=\"font-size:13px\">Diálogo entre dois alunos, com efeitos e pausas marcados.</p></div>\n  </div>\n  <div class=\"atencao\">\n    <div class=\"t\">⚠️ Cuidado com imagens de IA em material didático</div>\n    <p>Geradores ainda erram em <strong>texto dentro da imagem</strong> (letras embaralhadas), <strong>mãos e dedos</strong> e <strong>precisão científica</strong> (órgãos no lugar errado, mapas com fronteiras inventadas). Para ilustração decorativa, ótimo. Para <strong>conteúdo científico ou histórico</strong>, confira antes.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "8.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 8.3 a 8.5\n\n\n  \n    🖼️Imagens sob medidaDescreva e ela desenha. Pode ajustar conversando: \"coloque óculos na criança\".\n    🧠Mapas mentaisEstrutura pronta para redesenhar no quadro ou montar no Canva.\n    🎬Roteiro de vídeoCom indicação de cenas e imagens em cada momento.\n    🎙️Roteiro de podcastDiálogo entre dois alunos, com efeitos e pausas marcados.\n  \n  \n    ⚠️ Cuidado com imagens de IA em material didático\n    Geradores ainda erram em texto dentro da imagem (letras embaralhadas), mãos e dedos e precisão científica (órgãos no lugar errado, mapas com fronteiras inventadas). Para ilustração decorativa, ótimo. Para conteúdo científico ou histórico, confira antes."
          }
        ]
      },
      {
        "titulo": "Curipod e Mão na Massa 7",
        "html": "<div class=\"slide\" data-n=\"73\" data-title=\"Curipod e Mão na Massa 7\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Capítulo 8.6 · Oficina 7</div>\n<h1 class=\"st\">Aula interativa e sua apresentação em 10 minutos</h1>\n<div class=\"corpo\">\n  <div class=\"atencao\" style=\"margin-bottom:16px\">\n    <div class=\"t\">⚠️ Curipod: 2 sessões ao vivo por semana</div>\n    <p>Gera slides com enquetes que os alunos respondem pelo celular em tempo real. O plano gratuito permite só <strong>2 sessões por semana</strong> — reserve para momentos de alto valor. <strong>Se os alunos não têm celular</strong>, projete e peça que levantem cartões coloridos de papel (A, B, C). Funciona igual e não depende de internet na sala.</p>\n  </div>\n  <div class=\"oficina\">\n    <div class=\"t\">✋ Mão na Massa 7 — Sua apresentação</div>\n    <ol>\n      <li>Solicite hoje a verificação do <strong>Canva para Educação</strong>.</li>\n      <li>Use o <strong>Design Mágico</strong> para uma apresentação sobre um tema que você dará em breve.</li>\n      <li>Ajuste: troque uma imagem, corrija um texto, mude uma cor.</li>\n      <li>Gere também um <strong>cartaz A3</strong> para o mural da sua sala.</li>\n    </ol>\n  </div>\n</div>\n</div>",
        "secaoApostila": "8.6",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 8.6 · Oficina 7\n\n\n  \n    ⚠️ Curipod: 2 sessões ao vivo por semana\n    Gera slides com enquetes que os alunos respondem pelo celular em tempo real. O plano gratuito permite só 2 sessões por semana — reserve para momentos de alto valor. Se os alunos não têm celular, projete e peça que levantem cartões coloridos de papel (A, B, C). Funciona igual e não depende de internet na sala.\n  \n  \n    ✋ Mão na Massa 7 — Sua apresentação\n    \n      Solicite hoje a verificação do Canva para Educação.\n      Use o Design Mágico para uma apresentação sobre um tema que você dará em breve.\n      Ajuste: troque uma imagem, corrija um texto, mude uma cor.\n      Gere também um cartaz A3 para o mural da sua sala."
          }
        ]
      },
      {
        "titulo": "Saída 3 — o que você leva hoje",
        "html": "<div class=\"slide\" data-n=\"74\" data-title=\"Saída 3 — o que você leva hoje\" data-enc=\"3\" data-pos=\"fim\">\n<div class=\"sl-saida\">\n  <h2>✅ Antes de ir embora</h2>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 atividade em 3 níveis</strong> (A, B e C) do mesmo tema</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 enunciado adaptado</strong> para leitura literal</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 texto contextualizado</strong> com a sua região</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\">Conta do <strong>Canva para Educação</strong> solicitada</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 apresentação ou cartaz</strong> gerado</span></div>\n  <div class=\"it\" style=\"color:var(--laranja);font-weight:700;margin-top:8px\">📌 Tarefa: aplique a atividade em 3 níveis. Os alunos perceberam a diferença?</div>\n</div>\n</div>",
        "secaoApostila": "8.6",
        "blocos": [
          {
            "tipo": "texto",
            "html": "✅ Antes de ir embora\n  \n  \n  \n  \n  \n  📌 Tarefa: aplique a atividade em 3 níveis. Os alunos perceberam a diferença?"
          },
          {
            "tipo": "checklist",
            "itens": [
              "1 atividade em 3 níveis (A, B e C) do mesmo tema",
              "1 enunciado adaptado para leitura literal",
              "1 texto contextualizado com a sua região",
              "Conta do Canva para Educação solicitada",
              "1 apresentação ou cartaz gerado"
            ]
          }
        ]
      }
    ]
  },
  {
    "encontro": 4,
    "titulo": "Encontro 4",
    "passos": [
      {
        "titulo": "Encontro 4 — Abertura",
        "html": "<div class=\"slide\" data-n=\"75\" data-title=\"Encontro 4 — Abertura\">\n<div class=\"divisor\">\n  <div class=\"num\">ENCONTRO 4 · 2 HORAS</div>\n  <h2>Avaliação, Ética<br>e Seu Projeto Final</h2>\n  <p>Hoje fechamos o ciclo: avaliações que medem raciocínio, a linha vermelha da LGPD que não se cruza, e a estruturação do seu Projeto de Intervenção.</p>\n  <div class=\"caps\">\n    <span class=\"cap-tag\">Cap. 9 · Avaliações e Rubricas</span>\n    <span class=\"cap-tag\">Cap. 10 · Ética e LGPD</span>\n    <span class=\"cap-tag\">Cap. 11 · Projeto de Intervenção</span>\n  </div>\n</div>\n</div>",
        "secaoApostila": "8.6",
        "blocos": [
          {
            "tipo": "texto",
            "html": "ENCONTRO 4 · 2 HORAS\n  Avaliação, Ética\ne Seu Projeto Final\n  Hoje fechamos o ciclo: avaliações que medem raciocínio, a linha vermelha da LGPD que não se cruza, e a estruturação do seu Projeto de Intervenção.\n  \n    Cap. 9 · Avaliações e Rubricas\n    Cap. 10 · Ética e LGPD\n    Cap. 11 · Projeto de Intervenção"
          }
        ]
      },
      {
        "titulo": "Aquecimento 4 — corrigir no domingo",
        "html": "<div class=\"slide\" data-n=\"76\" data-title=\"Aquecimento 4 — corrigir no domingo\" data-enc=\"4\" data-pos=\"apos:41\">\n<div class=\"sl-aquec\">\n  <div class=\"et\">🔥 AQUECIMENTO · 3 MINUTOS</div>\n  <h2>Duas perguntas, mão levantada</h2>\n  <p><strong>1.</strong> Quem já corrigiu prova num domingo à noite?</p>\n  <p style=\"margin-top:12px\"><strong>2.</strong> Quem já suspeitou que um trabalho foi feito por IA — e não soube o que fazer?</p>\n  <p style=\"margin-top:20px;font-style:italic\">As duas coisas se resolvem hoje.</p>\n</div>\n</div>",
        "secaoApostila": "8.6",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🔥 AQUECIMENTO · 3 MINUTOS\n  Duas perguntas, mão levantada\n  1. Quem já corrigiu prova num domingo à noite?\n  2. Quem já suspeitou que um trabalho foi feito por IA — e não soube o que fazer?\n  As duas coisas se resolvem hoje."
          }
        ]
      },
      {
        "titulo": "Provas inéditas e contextualizadas",
        "html": "<div class=\"slide com-acoes\" data-n=\"77\" data-title=\"Provas inéditas e contextualizadas\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 9.1</div>\n<h1 class=\"st\">Provas inéditas e contextualizadas</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:14px\">Os alunos encontram provas antigas no Google. A IA gera questões originais, ancoradas no cotidiano.</p>\n  <div class=\"etiqueta\">Prova contextualizada</div>\n  <div class=\"prompt p12\">Crie uma prova de Ciências para o 6º ano sobre \"Misturas\nHomogêneas e Heterogêneas\": 5 questões de múltipla escolha, 2\ndissertativas curtas e 1 desafio.\n\nREGRAS:\n- NÃO faça perguntas de decorar definições\n- Use situações do cotidiano (fazer café, separar feijão)\n- As alternativas erradas devem ser plausíveis\n- Gabarito comentado explicando POR QUE cada uma é certa ou errada</div><div class=\"prompt-acoes\" data-prompt-txt=\"Crie uma prova de Ciências para o 6º ano sobre &quot;Misturas\nHomogêneas e Heterogêneas&quot;: 5 questões de múltipla escolha, 2\ndissertativas curtas e 1 desafio.\n\nREGRAS:\n- NÃO faça perguntas de decorar definições\n- Use situações do cotidiano (fazer café, separar feijão)\n- As alternativas erradas devem ser plausíveis\n- Gabarito comentado explicando POR QUE cada uma é certa ou errada\"></div>\n  <div class=\"dica\" style=\"margin-top:14px\">\n    <div class=\"t\">💡 Para questões de raciocínio, use o DeepSeek</div>\n    <p>Ele tem um modo de <strong>raciocínio passo a passo</strong> que \"pensa\" antes de responder — produz questões de matemática e ciências mais consistentes e gabaritos melhor explicados.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "9.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 9.1\n\n\n  Os alunos encontram provas antigas no Google. A IA gera questões originais, ancoradas no cotidiano.\n  Prova contextualizada\n  \n  \n    💡 Para questões de raciocínio, use o DeepSeek\n    Ele tem um modo de raciocínio passo a passo que \"pensa\" antes de responder — produz questões de matemática e ciências mais consistentes e gabaritos melhor explicados."
          },
          {
            "tipo": "prompt",
            "texto": "Crie uma prova de Ciências para o 6º ano sobre \"Misturas\nHomogêneas e Heterogêneas\": 5 questões de múltipla escolha, 2\ndissertativas curtas e 1 desafio.\n\nREGRAS:\n- NÃO faça perguntas de decorar definições\n- Use situações do cotidiano (fazer café, separar feijão)\n- As alternativas erradas devem ser plausíveis\n- Gabarito comentado explicando POR QUE cada uma é certa ou errada",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Desafio 4 — prova completa em 6 minutos",
        "html": "<div class=\"slide\" data-n=\"78\" data-title=\"Desafio 4 — prova completa em 6 minutos\" data-enc=\"4\" data-pos=\"apos:42\">\n<div class=\"sl-crono\">\n  <div class=\"num\">6:00</div>\n  <h2>Prova completa com gabarito</h2>\n  <p>5 questões de múltipla escolha + 2 dissertativas, com <strong>situações do cotidiano</strong> e <strong>gabarito comentado</strong> explicando cada alternativa errada.</p>\n  <p style=\"margin-top:18px;font-weight:700\">Ao final: quanto tempo você levaria sozinho?</p>\n</div>\n</div>",
        "secaoApostila": "9.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "6:00\n  Prova completa com gabarito\n  5 questões de múltipla escolha + 2 dissertativas, com situações do cotidiano e gabarito comentado explicando cada alternativa errada.\n  Ao final: quanto tempo você levaria sozinho?"
          }
        ]
      },
      {
        "titulo": "Rubricas: correção justa e rápida",
        "html": "<div class=\"slide\" data-n=\"79\" data-title=\"Rubricas: correção justa e rápida\">\n<div class=\"topo\"></div>\n<div class=\"badge\">Capítulo 9.3</div>\n<h1 class=\"st\">Rubricas: correção justa e rápida</h1>\n<div class=\"corpo alto\">\n  <div class=\"traduzindo\" style=\"margin-bottom:14px;padding:15px\">\n    <div class=\"t\" style=\"font-size:16px\">📖 Traduzindo: Rubrica</div>\n    <p style=\"font-size:14px\">Tabela que define exatamente o que o aluno precisa fazer para ganhar cada nota. Em vez de avaliar \"no olho\", ela padroniza os critérios: <strong>o aluno sabe de antemão o que se espera dele</strong>, e você corrige com rapidez e segurança.</p>\n  </div>\n  <table>\n    <thead><tr><th style=\"width:17%\">Critério</th><th style=\"width:27%\">Precisa Melhorar (4-5)</th><th style=\"width:28%\">Bom (7-8)</th><th style=\"width:28%\">Excelente (9-10)</th></tr></thead>\n    <tbody>\n      <tr><td><strong>Clareza da fala</strong></td><td>Fala muito baixo, leu o papel o tempo todo.</td><td>Bom volume, consultou anotações mas explicou com suas palavras.</td><td>Voz clara e segura, olhou para a sala e não precisou ler.</td></tr>\n      <tr><td><strong>Conteúdo</strong></td><td>Informações vagas, não soube responder perguntas simples.</td><td>Apresentou os conceitos principais com bons exemplos.</td><td>Dominou o tema, trouxe curiosidades e respondeu com segurança.</td></tr>\n      <tr><td><strong>Equipe</strong></td><td>Apenas um aluno falou, os outros ficaram desatentos.</td><td>Todos falaram, mas a divisão foi desigual.</td><td>Todos participaram igualmente, com apoio mútuo.</td></tr>\n    </tbody>\n  </table>\n</div>\n</div>",
        "secaoApostila": "9.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 9.3\n\n\n  \n    📖 Traduzindo: Rubrica\n    Tabela que define exatamente o que o aluno precisa fazer para ganhar cada nota. Em vez de avaliar \"no olho\", ela padroniza os critérios: o aluno sabe de antemão o que se espera dele, e você corrige com rapidez e segurança.\n  \n  \n    CritérioPrecisa Melhorar (4-5)Bom (7-8)Excelente (9-10)\n    \n      Clareza da falaFala muito baixo, leu o papel o tempo todo.Bom volume, consultou anotações mas explicou com suas palavras.Voz clara e segura, olhou para a sala e não precisou ler.\n      ConteúdoInformações vagas, não soube responder perguntas simples.Apresentou os conceitos principais com bons exemplos.Dominou o tema, trouxe curiosidades e respondeu com segurança.\n      EquipeApenas um aluno falou, os outros ficaram desatentos.Todos falaram, mas a divisão foi desigual.Todos participaram igualmente, com apoio mútuo."
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 4 — o gabarito está certo?",
        "html": "<div class=\"slide\" data-n=\"80\" data-title=\"Caça ao Erro 4 — o gabarito está certo?\" data-enc=\"4\" data-pos=\"apos:43\">\n<div class=\"topo amarelo\"></div>\n<div class=\"badge amarelo\">🕵️ Caça ao Erro 4 · 8 min</div>\n<h1 class=\"st\">Façam a conta. O gabarito está certo?</h1>\n<div class=\"sl-caca\" style=\"top:150px;height:auto;padding:0 70px\">\n  <div class=\"resp\">\n    <strong>Questão:</strong> Uma camiseta custava R$ 80,00 e teve desconto de 25%. Depois, sobre o novo preço, houve acréscimo de 25%. Qual o preço final?<br><br>\n    <strong>a)</strong> R$ 80,00 &nbsp;&nbsp;&nbsp; <strong>b)</strong> R$ 75,00 &nbsp;&nbsp;&nbsp; <strong>c)</strong> R$ 85,00 &nbsp;&nbsp;&nbsp; <strong>d)</strong> R$ 70,00<br><br>\n    <strong style=\"color:#B91C1C\">Gabarito da IA: (a) R$ 80,00</strong> — \"como desconto e acréscimo são ambos de 25%, eles se anulam\".\n  </div>\n  <div class=\"desafio-txt\">🔍 Peguem o celular e façam a conta.</div>\n</div>\n</div>",
        "secaoApostila": "9.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕵️ Caça ao Erro 4 · 8 min\n\n\n  \n    Questão: Uma camiseta custava R$ 80,00 e teve desconto de 25%. Depois, sobre o novo preço, houve acréscimo de 25%. Qual o preço final?\n\n\n    a) R$ 80,00     b) R$ 75,00     c) R$ 85,00     d) R$ 70,00\n\n\n    Gabarito da IA: (a) R$ 80,00 — \"como desconto e acréscimo são ambos de 25%, eles se anulam\".\n  \n  🔍 Peguem o celular e façam a conta."
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 4 — gabarito",
        "html": "<div class=\"slide\" data-n=\"81\" data-title=\"Caça ao Erro 4 — gabarito\" data-enc=\"4\" data-pos=\"apos:D3\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">🎯 Gabarito</div>\n<h1 class=\"st\">A resposta certa é R$ 75,00 — letra (b)</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\" style=\"margin-bottom:16px\">\n    <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0\">\n      <h4 style=\"color:var(--verde-dark)\">✅ A conta correta</h4>\n      <p style=\"color:#047857;font-size:19px\">80 − 25% = <strong>60</strong><br>60 + 25% de 60 = 60 + 15 = <strong>R$ 75,00</strong></p>\n    </div>\n    <div class=\"card\" style=\"background:var(--vermelho-sf);border-color:#FBD5D5\">\n      <h4 style=\"color:var(--vermelho-dk)\">❌ O erro da IA</h4>\n      <p style=\"color:#991B1B\">Achar que percentuais iguais se anulam. Mas o desconto incide sobre 80 e o acréscimo sobre 60 — <strong>bases diferentes</strong>.</p>\n    </div>\n  </div>\n  <div class=\"atencao\">\n    <div class=\"t\">⚠️ A lição — e ela é grande</div>\n    <p>Se você tivesse aplicado essa prova sem conferir, teria <strong>corrigido como erro a resposta certa dos alunos</strong>. Sempre refaça as contas do gabarito. <strong>A IA erra com a mesma confiança com que acerta.</strong></p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "9.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎯 Gabarito\n\n\n  \n    \n      ✅ A conta correta\n      80 − 25% = 60\n60 + 25% de 60 = 60 + 15 = R$ 75,00\n    \n    \n      ❌ O erro da IA\n      Achar que percentuais iguais se anulam. Mas o desconto incide sobre 80 e o acréscimo sobre 60 — bases diferentes.\n    \n  \n  \n    ⚠️ A lição — e ela é grande\n    Se você tivesse aplicado essa prova sem conferir, teria corrigido como erro a resposta certa dos alunos. Sempre refaça as contas do gabarito. A IA erra com a mesma confiança com que acerta."
          }
        ]
      },
      {
        "titulo": "Como lidar com alunos usando IA",
        "html": "<div class=\"slide\" data-n=\"82\" data-title=\"Como lidar com alunos usando IA\">\n<div class=\"topo amarelo\"></div>\n<div class=\"badge amarelo\">Capítulo 9.5</div>\n<h1 class=\"st\">Seus alunos <span class=\"lar\">vão</span> usar IA. E daí?</h1>\n<div class=\"corpo\">\n  <div class=\"atencao\" style=\"margin-bottom:16px\">\n    <div class=\"t\">⚠️ Detectores de IA não são confiáveis</div>\n    <p>Ferramentas que prometem \"detectar\" texto de IA <strong>erram muito</strong> — e acusam textos autorais de alunos esforçados, frequentemente os que escrevem de forma mais organizada. <strong>Nunca acuse um aluno com base num detector.</strong> A injustiça de uma acusação falsa é mais grave que o problema que ela tenta resolver.</p>\n  </div>\n  <div class=\"grid2\" style=\"gap:16px\">\n    <div class=\"card\" style=\"background:var(--vermelho-sf);border-color:#FBD5D5\">\n      <h4 style=\"color:var(--vermelho-dk)\">❌ Não funciona mais</h4>\n      <p style=\"color:#991B1B\">\"Faça um resumo de 2 páginas sobre a Primeira Guerra Mundial.\"</p>\n      <p style=\"color:#991B1B;margin-top:8px;font-style:italic\">A IA faz em 10 segundos.</p>\n    </div>\n    <div class=\"card\" style=\"background:var(--verde-soft);border-color:#A7F3D0\">\n      <h4 style=\"color:var(--verde-dark)\">✅ A tarefa inteligente</h4>\n      <p style=\"color:#047857\">\"Entreviste alguém mais velho da sua família sobre um evento histórico que marcou a vida dele. Compare com a Primeira Guerra. Apresente oralmente.\"</p>\n      <p style=\"color:#047857;margin-top:8px;font-style:italic\">A IA não pode entrevistar a avó do aluno.</p>\n    </div>\n  </div>\n  <div class=\"dica\" style=\"margin-top:14px\">\n    <div class=\"t\">💡 O princípio</div>\n    <p>A tarefa inteligente exige <strong>algo que só aquele aluno tem</strong>: a experiência da família dele, a opinião defendida oralmente, a observação do bairro onde mora. <strong>A IA vira ferramenta de pesquisa, não executora final.</strong></p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "9.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 9.5\n\n\n  \n    ⚠️ Detectores de IA não são confiáveis\n    Ferramentas que prometem \"detectar\" texto de IA erram muito — e acusam textos autorais de alunos esforçados, frequentemente os que escrevem de forma mais organizada. Nunca acuse um aluno com base num detector. A injustiça de uma acusação falsa é mais grave que o problema que ela tenta resolver.\n  \n  \n    \n      ❌ Não funciona mais\n      \"Faça um resumo de 2 páginas sobre a Primeira Guerra Mundial.\"\n      A IA faz em 10 segundos.\n    \n    \n      ✅ A tarefa inteligente\n      \"Entreviste alguém mais velho da sua família sobre um evento histórico que marcou a vida dele. Compare com a Primeira Guerra. Apresente oralmente.\"\n      A IA não pode entrevistar a avó do aluno.\n    \n  \n  \n    💡 O princípio\n    A tarefa inteligente exige algo que só aquele aluno tem: a experiência da família dele, a opinião defendida oralmente, a observação do bairro onde mora. A IA vira ferramenta de pesquisa, não executora final."
          }
        ]
      },
      {
        "titulo": "Duelo 4 — a tarefa à prova de cola",
        "html": "<div class=\"slide\" data-n=\"83\" data-title=\"Duelo 4 — a tarefa à prova de cola\" data-enc=\"4\" data-pos=\"apos:44\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">⚔️ Duelo 4 · 8 min</div>\n<h1 class=\"st\">A tarefa à prova de cola</h1>\n<div class=\"sl-duelo\" style=\"top:150px;padding:0 70px 40px\">\n  <div class=\"lado\">\n    <div class=\"box ruim\">\n      <div class=\"rot\">❌ A IA faz em 10 segundos</div>\n      <div class=\"pr\">\"Faça uma pesquisa de 2 páginas\nsobre a Grécia Antiga para\nentregar na próxima semana.\"</div>\n      <div class=\"res\">O aluno pede à IA, imprime sem ler e você passa o fim de semana <strong>corrigindo texto de máquina</strong>. Ninguém aprendeu — e você não tem como provar.</div>\n    </div>\n    <div class=\"box bom\">\n      <div class=\"rot\">✅ Exige o aluno</div>\n      <div class=\"pr\">\"Peça à IA 3 argumentos a favor e\n3 contra a democracia de Atenas.\nEscolha o mais forte e venha\npreparado para defendê-lo\noralmente por 1 minuto na roda.\nTraga impressa a conversa que\nvocê teve com a IA.\"</div>\n      <div class=\"res\">A IA vira <strong>ferramenta de pesquisa</strong>. A escolha e a defesa oral são do aluno — <strong>e o uso da IA deixa de ser escondido</strong>.</div>\n    </div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "9.5",
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ Duelo 4 · 8 min\n\n\n  \n    \n      ❌ A IA faz em 10 segundos\n      \"Faça uma pesquisa de 2 páginas\nsobre a Grécia Antiga para\nentregar na próxima semana.\"\n      O aluno pede à IA, imprime sem ler e você passa o fim de semana corrigindo texto de máquina. Ninguém aprendeu — e você não tem como provar.\n    \n    \n      ✅ Exige o aluno\n      \"Peça à IA 3 argumentos a favor e\n3 contra a democracia de Atenas.\nEscolha o mais forte e venha\npreparado para defendê-lo\noralmente por 1 minuto na roda.\nTraga impressa a conversa que\nvocê teve com a IA.\"\n      A IA vira ferramenta de pesquisa. A escolha e a defesa oral são do aluno — e o uso da IA deixa de ser escondido."
          }
        ]
      },
      {
        "titulo": "LGPD: a linha vermelha",
        "html": "<div class=\"slide com-fig\" data-n=\"84\" data-title=\"LGPD: a linha vermelha\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">Capítulo 10.1 · Obrigatório</div>\n<h1 class=\"st\">LGPD: a linha vermelha que não se cruza</h1>\n<div class=\"corpo\">\n  <div class=\"atencao\" style=\"margin-bottom:16px\">\n    <div class=\"t\">⚠️ O que NUNCA digitar em uma IA pública</div>\n    <p style=\"margin-bottom:6px\">❌ Nomes completos de alunos reais &nbsp;·&nbsp; ❌ CPF, RG ou documentos &nbsp;·&nbsp; ❌ Laudos médicos com nome</p>\n    <p style=\"margin-bottom:6px\">❌ Endereços residenciais &nbsp;·&nbsp; ❌ Fotos reais de alunos &nbsp;·&nbsp; ❌ Notas ou matrículas com nome</p>\n    <p style=\"margin-top:10px\"><strong>Por quê?</strong> Tudo o que você digita pode ser armazenado nos servidores da empresa e usado para treinar os modelos. Você estaria expondo a privacidade de uma criança.</p>\n  </div>\n  <div class=\"traduzindo\">\n    <div class=\"t\">📖 Traduzindo: LGPD</div>\n    <p>Lei nº 13.709/2018, que protege os dados pessoais de todos os cidadãos, <strong>incluindo crianças e adolescentes</strong>. Na escola, significa que você precisa de consentimento dos responsáveis para compartilhar dados dos alunos — e <strong>inserir dados numa IA pública é considerado compartilhamento</strong>.</p>\n  </div>\n</div>\n<div class=\"fig-slide\"><img src=\"/curso/imagens/17_seguranca_lgpd_escola.png\" alt=\"Proteger os dados dos alunos é obrigação legal e ética.\"><div class=\"fig-leg\">Proteger os dados dos alunos é obrigação legal e ética.</div></div>\n</div>",
        "secaoApostila": "10.1",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 10.1 · Obrigatório\n\n\n  \n    ⚠️ O que NUNCA digitar em uma IA pública\n    ❌ Nomes completos de alunos reais  ·  ❌ CPF, RG ou documentos  ·  ❌ Laudos médicos com nome\n    ❌ Endereços residenciais  ·  ❌ Fotos reais de alunos  ·  ❌ Notas ou matrículas com nome\n    Por quê? Tudo o que você digita pode ser armazenado nos servidores da empresa e usado para treinar os modelos. Você estaria expondo a privacidade de uma criança.\n  \n  \n    📖 Traduzindo: LGPD\n    Lei nº 13.709/2018, que protege os dados pessoais de todos os cidadãos, incluindo crianças e adolescentes. Na escola, significa que você precisa de consentimento dos responsáveis para compartilhar dados dos alunos — e inserir dados numa IA pública é considerado compartilhamento."
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/17_seguranca_lgpd_escola.png",
            "legenda": "Proteger os dados dos alunos é obrigação legal e ética."
          }
        ]
      },
      {
        "titulo": "A técnica da anonimização",
        "html": "<div class=\"slide\" data-n=\"85\" data-title=\"A técnica da anonimização\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">Capítulo 10.2</div>\n<h1 class=\"st\">A técnica da anonimização</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:14px\">Você pode continuar usando a IA para tudo — pareceres, adaptações, mediação — <strong>desde que troque os dados reais por fictícios</strong>.</p>\n  <table style=\"margin-bottom:16px\">\n    <thead><tr><th style=\"width:50%;background:var(--vermelho-sf);color:var(--vermelho-dk)\">❌ Errado (dados reais)</th><th style=\"width:50%;background:var(--verde-soft);color:var(--verde-dark)\">✅ Correto (anonimizado)</th></tr></thead>\n    <tbody>\n      <tr><td>\"O aluno Pedro Silva Santos, laudo CID F84, mora na Rua das Flores, 123.\"</td><td>\"Um aluno fictício de 10 anos com diagnóstico de TEA.\"</td></tr>\n      <tr><td>\"A mãe do João, Dona Maria, reclamou que o professor Carlos...\"</td><td>\"Um responsável reclamou sobre uma situação com um professor.\"</td></tr>\n      <tr><td>\"Na Escola Municipal José de Alencar, turma 5ºB, 3 alunos têm laudos.\"</td><td>\"Em uma escola pública, uma turma de 5º ano tem 3 alunos com necessidades especiais.\"</td></tr>\n    </tbody>\n  </table>\n  <div class=\"dica\">\n    <div class=\"t\">💡 O teste rápido antes de apertar Enter</div>\n    <p><em>\"Se este texto vazasse publicamente amanhã, alguém conseguiria identificar meu aluno?\"</em> Se a resposta for sim, <strong>anonimize mais</strong>.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "10.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 10.2\n\n\n  Você pode continuar usando a IA para tudo — pareceres, adaptações, mediação — desde que troque os dados reais por fictícios.\n  \n    ❌ Errado (dados reais)✅ Correto (anonimizado)\n    \n      \"O aluno Pedro Silva Santos, laudo CID F84, mora na Rua das Flores, 123.\"\"Um aluno fictício de 10 anos com diagnóstico de TEA.\"\n      \"A mãe do João, Dona Maria, reclamou que o professor Carlos...\"\"Um responsável reclamou sobre uma situação com um professor.\"\n      \"Na Escola Municipal José de Alencar, turma 5ºB, 3 alunos têm laudos.\"\"Em uma escola pública, uma turma de 5º ano tem 3 alunos com necessidades especiais.\"\n    \n  \n  \n    💡 O teste rápido antes de apertar Enter\n    \"Se este texto vazasse publicamente amanhã, alguém conseguiria identificar meu aluno?\" Se a resposta for sim, anonimize mais."
          }
        ]
      },
      {
        "titulo": "Caso 4 — o parecer que não pode vazar",
        "html": "<div class=\"slide\" data-n=\"86\" data-title=\"Caso 4 — o parecer que não pode vazar\" data-enc=\"4\" data-pos=\"apos:46\">\n<div class=\"sl-caso\">\n  <div class=\"et\">🎭 ESTUDO DE CASO 4 · 12 MIN · EM DUPLAS</div>\n  <h2>O parecer que não pode vazar</h2>\n  <div class=\"cena-sl\">\n    Você precisa escrever um relatório sobre uma aluna do 5º ano para o serviço de apoio. Você tem: <strong>nome completo</strong>, escola, turma, <strong>laudo médico com CID</strong>, o fato de que ela <strong>faltou 15 dias por saúde mental</strong>, e o nome da mãe, <strong>que pediu sigilo</strong>. Você quer usar a IA — mas tudo isso é sensível.\n  </div>\n  <div class=\"perg\">Em dupla: reescrevam o pedido sem entregar um único dado identificável.</div>\n</div>\n</div>",
        "secaoApostila": "10.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎭 ESTUDO DE CASO 4 · 12 MIN · EM DUPLAS\n  O parecer que não pode vazar\n  \n    Você precisa escrever um relatório sobre uma aluna do 5º ano para o serviço de apoio. Você tem: nome completo, escola, turma, laudo médico com CID, o fato de que ela faltou 15 dias por saúde mental, e o nome da mãe, que pediu sigilo. Você quer usar a IA — mas tudo isso é sensível.\n  \n  Em dupla: reescrevam o pedido sem entregar um único dado identificável."
          }
        ]
      },
      {
        "titulo": "Caso 4 — a anonimização na prática",
        "html": "<div class=\"slide com-acoes\" data-n=\"87\" data-title=\"Caso 4 — a anonimização na prática\" data-enc=\"4\" data-pos=\"apos:D6\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">💡 Solução comentada</div>\n<h1 class=\"st\">A IA não precisa saber quem é para escrever bem</h1>\n<div class=\"corpo\">\n  <div class=\"atencao\" style=\"margin-bottom:14px\">\n    <div class=\"t\">❌ O erro grave</div>\n    <p>Colar a ficha inteira e pedir \"escreva o relatório\" é <strong>compartilhamento de dado sensível de menor</strong> — violação de LGPD. A informação pode ficar armazenada no servidor da empresa.</p>\n  </div>\n  <div class=\"etiqueta verde\">✅ O pedido anonimizado</div>\n  <div class=\"prompt p12\">Aja como psicopedagoga. Escreva um relatório pedagógico de 3\nparágrafos para encaminhamento ao serviço de apoio.\n\nPerfil (fictício): estudante do 5º ano, com ausências frequentes no\nbimestre por questões de saúde, que mantém bom vínculo com a turma\ne demonstra interesse quando presente. Defasagem em leitura pelas\nfaltas. Tom técnico, respeitoso, focado em potencialidades.</div><div class=\"prompt-acoes\" data-prompt-txt=\"Aja como psicopedagoga. Escreva um relatório pedagógico de 3\nparágrafos para encaminhamento ao serviço de apoio.\n\nPerfil (fictício): estudante do 5º ano, com ausências frequentes no\nbimestre por questões de saúde, que mantém bom vínculo com a turma\ne demonstra interesse quando presente. Defasagem em leitura pelas\nfaltas. Tom técnico, respeitoso, focado em potencialidades.\"></div>\n  <div class=\"dica\" style=\"margin-top:12px\">\n    <div class=\"t\">🔐 O teste dos 3 segundos</div>\n    <p><em>\"Se este texto vazasse amanhã, alguém identificaria minha aluna?\"</em> Se sim — <strong>anonimize mais</strong>. Os dados reais você insere depois, no seu documento, offline.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "10.2",
        "blocos": [
          {
            "tipo": "texto",
            "html": "💡 Solução comentada\n\n\n  \n    ❌ O erro grave\n    Colar a ficha inteira e pedir \"escreva o relatório\" é compartilhamento de dado sensível de menor — violação de LGPD. A informação pode ficar armazenada no servidor da empresa.\n  \n  ✅ O pedido anonimizado\n  \n  \n    🔐 O teste dos 3 segundos\n    \"Se este texto vazasse amanhã, alguém identificaria minha aluna?\" Se sim — anonimize mais. Os dados reais você insere depois, no seu documento, offline."
          },
          {
            "tipo": "prompt",
            "texto": "Aja como psicopedagoga. Escreva um relatório pedagógico de 3\nparágrafos para encaminhamento ao serviço de apoio.\n\nPerfil (fictício): estudante do 5º ano, com ausências frequentes no\nbimestre por questões de saúde, que mantém bom vínculo com a turma\ne demonstra interesse quando presente. Defasagem em leitura pelas\nfaltas. Tom técnico, respeitoso, focado em potencialidades.",
            "variaveis": []
          }
        ]
      },
      {
        "titulo": "Viés algorítmico e verificação",
        "html": "<div class=\"slide\" data-n=\"88\" data-title=\"Viés algorítmico e verificação\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">Capítulo 10.4 e 10.6</div>\n<h1 class=\"st\">O que sempre conferir — e uma aula de brinde</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\" style=\"gap:16px;margin-bottom:16px\">\n    <div class=\"card\"><h4>🔍 Sempre verifique</h4>\n      <p style=\"font-size:13.5px\"><strong>Datas e fatos históricos</strong> em fontes confiáveis<br>\n      <strong>Códigos da BNCC</strong> no site do MEC ou no NotebookLM<br>\n      <strong>Dados científicos</strong> em livros do PNLD<br>\n      <strong>Links</strong> — a IA inventa endereços que parecem reais</p>\n    </div>\n    <div class=\"card\" style=\"background:var(--indigo-soft);border-color:var(--indigo-line)\"><h4 style=\"color:var(--indigo-dark)\">⚖️ Viés algorítmico</h4>\n      <p style=\"color:#3730A3\">A IA aprende com a internet, e a internet tem preconceitos. Ela pode reproduzir estereótipos de gênero, raça e classe social.</p>\n    </div>\n  </div>\n  <div class=\"lilas\">\n    <div class=\"t\">🔍 Exercício para a sua sala de aula</div>\n    <p>Peça à IA: <em>\"Descreva um cientista\"</em> e depois <em>\"Descreva uma pessoa que trabalha na enfermagem\"</em>. Analise com os alunos: ela descreveu o cientista como homem e a pessoa da enfermagem como mulher? Por quê? <strong>Uma aula excelente sobre estereótipos e pensamento crítico, do 6º ano ao Ensino Médio.</strong></p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "10.4",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 10.4 e 10.6\n\n\n  \n    🔍 Sempre verifique\n      Datas e fatos históricos em fontes confiáveis\n\n      Códigos da BNCC no site do MEC ou no NotebookLM\n\n      Dados científicos em livros do PNLD\n\n      Links — a IA inventa endereços que parecem reais\n    \n    ⚖️ Viés algorítmico\n      A IA aprende com a internet, e a internet tem preconceitos. Ela pode reproduzir estereótipos de gênero, raça e classe social.\n    \n  \n  \n    🔍 Exercício para a sua sala de aula\n    Peça à IA: \"Descreva um cientista\" e depois \"Descreva uma pessoa que trabalha na enfermagem\". Analise com os alunos: ela descreveu o cientista como homem e a pessoa da enfermagem como mulher? Por quê? Uma aula excelente sobre estereótipos e pensamento crítico, do 6º ano ao Ensino Médio."
          }
        ]
      },
      {
        "titulo": "No celular — a rubrica do seu próximo trabalho",
        "html": "<div class=\"slide\" data-n=\"89\" data-title=\"No celular — a rubrica do seu próximo trabalho\" data-enc=\"4\" data-pos=\"apos:47\">\n<div class=\"sl-aquec\" style=\"background:linear-gradient(150deg,#ECFDF5 0%,#D1FAE5 60%,#F0FDF4 100%)\">\n  <div class=\"et\" style=\"color:var(--verde-dark)\">📱 NO CELULAR · 8 MINUTOS</div>\n  <h2 style=\"color:var(--verde-dark)\">A rubrica do seu próximo trabalho</h2>\n  <p style=\"color:#047857\">Peça uma rubrica para um trabalho que você <strong>vai avaliar em breve</strong>: 3 ou 4 critérios, níveis Precisa Melhorar / Bom / Excelente, com descrições que <strong>o próprio aluno entenda</strong>.</p>\n  <p style=\"margin-top:20px;color:#047857\"><strong>O teste decisivo:</strong> mostre ao colega e pergunte — <em>\"se você fosse aluno, saberia o que fazer para tirar a nota máxima?\"</em></p>\n</div>\n</div>",
        "secaoApostila": "10.4",
        "blocos": [
          {
            "tipo": "texto",
            "html": "📱 NO CELULAR · 8 MINUTOS\n  A rubrica do seu próximo trabalho\n  Peça uma rubrica para um trabalho que você vai avaliar em breve: 3 ou 4 critérios, níveis Precisa Melhorar / Bom / Excelente, com descrições que o próprio aluno entenda.\n  O teste decisivo: mostre ao colega e pergunte — \"se você fosse aluno, saberia o que fazer para tirar a nota máxima?\""
          }
        ]
      },
      {
        "titulo": "Seu Projeto de Intervenção",
        "html": "<div class=\"slide com-fig\" data-n=\"90\" data-title=\"Seu Projeto de Intervenção\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Capítulo 11</div>\n<h1 class=\"st\">Seu Projeto de Intervenção</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:16px\">Escolha uma <strong>\"dor\" real</strong> da sua rotina, resolva com o que aprendeu e apresente aos colegas. Você não sai daqui com teoria — sai com material pronto para usar na semana seguinte.</p>\n  <table>\n    <thead><tr><th style=\"width:33%\">Problema real</th><th style=\"width:33%\">Solução com IA</th><th style=\"width:34%\">Produto final</th></tr></thead>\n    <tbody>\n      <tr><td>Demoro 2 horas para fazer planos de aula</td><td>Fórmula P.T.C.F. (Cap. 2)</td><td>5 planos prontos (1 bimestre)</td></tr>\n      <tr><td>Tenho 3 alunos com laudo e não sei adaptar</td><td>Prompts de adaptação (Cap. 7)</td><td>Material adaptado de uma unidade</td></tr>\n      <tr><td>Gasto o fim de semana corrigindo redações</td><td>Rubrica + feedback (Cap. 9)</td><td>Rubrica + banco de feedbacks</td></tr>\n      <tr><td>Não consigo achar nada na BNCC</td><td>NotebookLM (Cap. 5)</td><td>Mapa de habilidades da minha disciplina</td></tr>\n      <tr><td>Preciso organizar a Feira de Ciências</td><td>Cronograma e comunicados (Cap. 3)</td><td>Cronograma + convites + rubricas</td></tr>\n    </tbody>\n  </table>\n</div>\n<div class=\"fig-slide\"><img src=\"/curso/imagens/19_projeto_intervencao_final.png\" alt=\"O Projeto de Intervenção aplicado na realidade da sua escola.\"><div class=\"fig-leg\">O Projeto de Intervenção aplicado na realidade da sua escola.</div></div>\n</div>",
        "secaoApostila": "11",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 11\n\n\n  Escolha uma \"dor\" real da sua rotina, resolva com o que aprendeu e apresente aos colegas. Você não sai daqui com teoria — sai com material pronto para usar na semana seguinte.\n  \n    Problema realSolução com IAProduto final\n    \n      Demoro 2 horas para fazer planos de aulaFórmula P.T.C.F. (Cap. 2)5 planos prontos (1 bimestre)\n      Tenho 3 alunos com laudo e não sei adaptarPrompts de adaptação (Cap. 7)Material adaptado de uma unidade\n      Gasto o fim de semana corrigindo redaçõesRubrica + feedback (Cap. 9)Rubrica + banco de feedbacks\n      Não consigo achar nada na BNCCNotebookLM (Cap. 5)Mapa de habilidades da minha disciplina\n      Preciso organizar a Feira de CiênciasCronograma e comunicados (Cap. 3)Cronograma + convites + rubricas"
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/19_projeto_intervencao_final.png",
            "legenda": "O Projeto de Intervenção aplicado na realidade da sua escola."
          }
        ]
      },
      {
        "titulo": "Escolha agora a sua dor",
        "html": "<div class=\"slide\" data-n=\"91\" data-title=\"Escolha agora a sua dor\" data-enc=\"4\" data-pos=\"apos:48\">\n<div class=\"sl-caso\">\n  <div class=\"et\">✍️ SUA VEZ · 10 MINUTOS</div>\n  <h2>Escolha agora a dor que você vai resolver</h2>\n  <div class=\"cena-sl\">\n    Pegue a <strong>Ficha do Projeto de Intervenção</strong> (Destacável 4, no fim da apostila) e preencha os campos <strong>1 e 2</strong> agora: qual é o problema real da sua rotina, e quais ferramentas você vai usar.\n  </div>\n  <div class=\"perg\">Quem quiser, compartilhe em voz alta — ouvir a dor do colega ajuda a enxergar a sua.</div>\n</div>\n</div>",
        "secaoApostila": "11",
        "blocos": [
          {
            "tipo": "texto",
            "html": "✍️ SUA VEZ · 10 MINUTOS\n  Escolha agora a dor que você vai resolver\n  \n    Pegue a Ficha do Projeto de Intervenção (Destacável 4, no fim da apostila) e preencha os campos 1 e 2 agora: qual é o problema real da sua rotina, e quais ferramentas você vai usar.\n  \n  Quem quiser, compartilhe em voz alta — ouvir a dor do colega ajuda a enxergar a sua."
          }
        ]
      },
      {
        "titulo": "Checklist de entrega e certificação",
        "html": "<div class=\"slide com-ia\" data-n=\"92\" data-title=\"Checklist de entrega e certificação\">\n<div class=\"topo laranja\"></div>\n<div class=\"badge laranja\">Capítulo 11.3 e 11.4</div>\n<h1 class=\"st\">Checklist de entrega e certificação</h1>\n<div class=\"corpo\">\n  <div class=\"grid2\" style=\"gap:18px\">\n    <div>\n      <div class=\"card\" style=\"background:var(--indigo-soft);border-color:var(--indigo-line);height:100%\">\n        <h4 style=\"color:var(--indigo-dark);margin-bottom:10px\">✅ Antes de entregar</h4>\n        <p style=\"color:#3730A3;font-size:14px;line-height:2\"><span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Escolhi meu tema/problema</span></span><br>\n        <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Usei pelo menos 2 ferramentas diferentes</span></span><br>\n        <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Salvei os prompts que utilizei</span></span><br>\n        <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Revisei e editei o material gerado</span></span><br>\n        <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Vinculei 1 habilidade da BNCC</span></span><br>\n        <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Verifiquei se não há dados pessoais reais</span></span><br>\n        <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Conferi datas, códigos e dados</span></span><br>\n        <span class=\"chk\"><span class=\"bx\"></span><span class=\"tx\">Preparei a apresentação de 5 minutos</span></span></p>\n      </div>\n    </div>\n    <div>\n      <div class=\"card\" style=\"margin-bottom:14px\">\n        <h4>🎤 Roteiro do pitch (5 min)</h4>\n        <p style=\"font-size:14px\"><strong>1. O Problema</strong> — qual dor você resolveu? (1 min)<br>\n        <strong>2. O Processo</strong> — ferramentas e prompts (2 min)<br>\n        <strong>3. O Resultado</strong> — o que a IA entregou (1 min)<br>\n        <strong>4. A Reflexão</strong> — o que faria diferente (1 min)</p>\n      </div>\n      <div class=\"atencao\">\n        <div class=\"t\">⚠️ Certificação de 40 horas</div>\n        <p><strong>8h presenciais</strong> (4 encontros) + <strong>32h</strong> de aplicação e projeto. Exige <strong>75% de frequência</strong> e a <strong>entrega e apresentação</strong> do projeto.</p>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"ia-barra\"><span class=\"rot\">Abrir agora</span><div class=\"ia-btns\"><a class=\"ia-btn gemini\" href=\"https://gemini.google.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>Gemini</a><a class=\"ia-btn chatgpt\" href=\"https://chatgpt.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>ChatGPT</a><a class=\"ia-btn deepseek\" href=\"https://chat.deepseek.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>DeepSeek</a><a class=\"ia-btn notebook\" href=\"https://notebooklm.google.com\" target=\"_blank\" rel=\"noopener\"><span class=\"pt\"></span>NotebookLM</a></div></div>\n</div>",
        "secaoApostila": "11.3",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 11.3 e 11.4\n\n\n  \n    \n      \n        ✅ Antes de entregar\n        \n\n        \n\n        \n\n        \n\n        \n\n        \n\n        \n\n        \n      \n    \n    \n      \n        🎤 Roteiro do pitch (5 min)\n        1. O Problema — qual dor você resolveu? (1 min)\n\n        2. O Processo — ferramentas e prompts (2 min)\n\n        3. O Resultado — o que a IA entregou (1 min)\n\n        4. A Reflexão — o que faria diferente (1 min)\n      \n      \n        ⚠️ Certificação de 40 horas\n        8h presenciais (4 encontros) + 32h de aplicação e projeto. Exige 75% de frequência e a entrega e apresentação do projeto."
          },
          {
            "tipo": "checklist",
            "itens": [
              "Escolhi meu tema/problema",
              "Usei pelo menos 2 ferramentas diferentes",
              "Salvei os prompts que utilizei",
              "Revisei e editei o material gerado",
              "Vinculei 1 habilidade da BNCC",
              "Verifiquei se não há dados pessoais reais",
              "Conferi datas, códigos e dados",
              "Preparei a apresentação de 5 minutos"
            ]
          },
          {
            "tipo": "ferramentas",
            "chaves": [
              "chatgpt",
              "gemini",
              "deepseek",
              "notebooklm"
            ]
          }
        ]
      },
      {
        "titulo": "Guia de Bolso: emergências da rotina",
        "html": "<div class=\"slide\" data-n=\"93\" data-title=\"Guia de Bolso: emergências da rotina\">\n<div class=\"topo vermelho\"></div>\n<div class=\"badge vermelho\">Capítulo 12 · Consulta permanente</div>\n<h1 class=\"st\">Guia de Bolso: quando tudo dá errado</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:16px\">O projetor queima, a chuva impede a aula na quadra, a coordenação pede substituição de última hora. <strong>Guarde este capítulo no celular.</strong></p>\n  <div class=\"grid3\" style=\"gap:14px\">\n    <div class=\"card\" style=\"border-left:4px solid var(--vermelho);padding:16px\"><h4 style=\"font-size:15px\">🔌 O projetor quebrou</h4><p style=\"font-size:13px\">Dinâmica só com lousa e caderno, passo a passo em 3 minutos.</p></div>\n    <div class=\"card\" style=\"border-left:4px solid var(--vermelho);padding:16px\"><h4 style=\"font-size:15px\">🔄 Substituição inesperada</h4><p style=\"font-size:13px\">História de abertura + 3 perguntas + atividade em dupla.</p></div>\n    <div class=\"card\" style=\"border-left:4px solid var(--vermelho);padding:16px\"><h4 style=\"font-size:15px\">🏃 Turma agitada</h4><p style=\"font-size:13px\">Dinâmica de 5 min de regulação, sem gritos e sem bronca.</p></div>\n    <div class=\"card\" style=\"border-left:4px solid var(--vermelho);padding:16px\"><h4 style=\"font-size:15px\">⏰ Aula vaga de última hora</h4><p style=\"font-size:13px\">3 atividades independentes de conteúdo, só papel e lápis.</p></div>\n    <div class=\"card\" style=\"border-left:4px solid var(--vermelho);padding:16px\"><h4 style=\"font-size:15px\">🤝 Conflito entre alunos</h4><p style=\"font-size:13px\">Roteiro de mediação de 10 min, com falas sugeridas.</p></div>\n    <div class=\"card\" style=\"border-left:4px solid var(--vermelho);padding:16px\"><h4 style=\"font-size:15px\">👨‍👩‍👧 Reunião de pais amanhã</h4><p style=\"font-size:13px\">Roteiro de 40 min com abertura, pontos e fechamento.</p></div>\n  </div>\n</div>\n</div>",
        "secaoApostila": "12",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 12 · Consulta permanente\n\n\n  O projetor queima, a chuva impede a aula na quadra, a coordenação pede substituição de última hora. Guarde este capítulo no celular.\n  \n    🔌 O projetor quebrouDinâmica só com lousa e caderno, passo a passo em 3 minutos.\n    🔄 Substituição inesperadaHistória de abertura + 3 perguntas + atividade em dupla.\n    🏃 Turma agitadaDinâmica de 5 min de regulação, sem gritos e sem bronca.\n    ⏰ Aula vaga de última hora3 atividades independentes de conteúdo, só papel e lápis.\n    🤝 Conflito entre alunosRoteiro de mediação de 10 min, com falas sugeridas.\n    👨‍👩‍👧 Reunião de pais amanhãRoteiro de 40 min com abertura, pontos e fechamento."
          }
        ]
      },
      {
        "titulo": "O kit essencial do professor",
        "html": "<div class=\"slide\" data-n=\"94\" data-title=\"O kit essencial do professor\">\n<div class=\"topo verde\"></div>\n<div class=\"badge verde\">Anexo B</div>\n<h1 class=\"st\">O kit essencial do professor da rede pública</h1>\n<div class=\"corpo\">\n  <p class=\"lead\" style=\"margin-bottom:18px\">Se quiser começar com o mínimo e sem se perder, use estas três:</p>\n  <div class=\"grid3\" style=\"gap:16px;margin-bottom:18px\">\n    <div class=\"card\" style=\"text-align:center;border-top:5px solid var(--indigo)\">\n      <div style=\"font-size:38px\">💬</div>\n      <h4 style=\"margin-top:8px\">Uma IA de texto</h4>\n      <p style=\"font-size:13.5px\">DeepSeek ou Gemini — e a outra como segundo barco.</p>\n      <span class=\"selo verde\" style=\"margin-top:8px\">🟢 Gratuito</span>\n    </div>\n    <div class=\"card\" style=\"text-align:center;border-top:5px solid var(--laranja)\">\n      <div style=\"font-size:38px\">📚</div>\n      <h4 style=\"margin-top:8px\">NotebookLM</h4>\n      <p style=\"font-size:13.5px\">Para BNCC, PPP e livro didático, sem risco de invenção.</p>\n      <span class=\"selo amarelo\" style=\"margin-top:8px\">🟡 Cota diária</span>\n    </div>\n    <div class=\"card\" style=\"text-align:center;border-top:5px solid var(--verde)\">\n      <div style=\"font-size:38px\">🎨</div>\n      <h4 style=\"margin-top:8px\">Canva Educação</h4>\n      <p style=\"font-size:13.5px\">Para tudo que é visual. Gratuito para sempre.</p>\n      <span class=\"selo verde\" style=\"margin-top:8px\">🟢 Pro docente</span>\n    </div>\n  </div>\n  <div class=\"dica\">\n    <div class=\"t\">💡 A dica mais importante de todas</div>\n    <p>Ferramentas vão surgir e desaparecer. Planos gratuitos vão encolher e crescer. <strong>Nada disso importa tanto quanto o método.</strong> Se você sabe descrever Papel, Tarefa, Contexto e Formato, terá bons resultados em qualquer IA que existir daqui a cinco anos.</p>\n  </div>\n</div>\n</div>",
        "secaoApostila": "12",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Anexo B\n\n\n  Se quiser começar com o mínimo e sem se perder, use estas três:\n  \n    \n      💬\n      Uma IA de texto\n      DeepSeek ou Gemini — e a outra como segundo barco.\n      🟢 Gratuito\n    \n    \n      📚\n      NotebookLM\n      Para BNCC, PPP e livro didático, sem risco de invenção.\n      🟡 Cota diária\n    \n    \n      🎨\n      Canva Educação\n      Para tudo que é visual. Gratuito para sempre.\n      🟢 Pro docente\n    \n  \n  \n    💡 A dica mais importante de todas\n    Ferramentas vão surgir e desaparecer. Planos gratuitos vão encolher e crescer. Nada disso importa tanto quanto o método. Se você sabe descrever Papel, Tarefa, Contexto e Formato, terá bons resultados em qualquer IA que existir daqui a cinco anos."
          }
        ]
      },
      {
        "titulo": "Encerramento — O professor é insubstituível",
        "html": "<div class=\"slide com-fig\" data-n=\"95\" data-title=\"Encerramento — O professor é insubstituível\">\n<div class=\"capa\">\n  <div style=\"font-size:56px;margin-bottom:14px\">🎉</div>\n  <h1 style=\"font-family:var(--titulo);font-size:44px;font-weight:800;color:var(--indigo-dark);line-height:1.18;margin-bottom:20px\">Parabéns! Você concluiu<br>a formação.</h1>\n  <p style=\"font-size:19px;color:var(--tinta-clara);max-width:860px;line-height:1.6;margin-bottom:16px\">Você aprendeu a usar a IA para organizar sua vida profissional, planejar aulas alinhadas à BNCC, criar materiais, avaliar com justiça, incluir todos os alunos e proteger seus dados.</p>\n  <p style=\"font-size:18px;color:var(--tinta-clara);max-width:860px;line-height:1.6\">Nenhum algoritmo consola uma criança que chegou triste, vibra com a primeira palavra lida por um aluno que superou a dislexia ou desperta a curiosidade com o brilho no olhar.</p>\n  <p style=\"font-family:var(--titulo);font-size:21px;font-weight:800;color:var(--indigo-dark);margin-top:26px;line-height:1.5\">Agora, compartilhe esse conhecimento com seus colegas.<br><span style=\"color:var(--laranja)\">A educação muda quando o professor muda.</span></p>\n</div>\n<div class=\"fig-slide\"><img src=\"/curso/imagens/20_professor_insubstituivel.png\" alt=\"A tecnologia amplia o alcance; o vínculo humano é insubstituível.\"><div class=\"fig-leg\">A tecnologia amplia o alcance; o vínculo humano é insubstituível.</div></div>\n</div>",
        "secaoApostila": "12",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎉\n  Parabéns! Você concluiu\na formação.\n  Você aprendeu a usar a IA para organizar sua vida profissional, planejar aulas alinhadas à BNCC, criar materiais, avaliar com justiça, incluir todos os alunos e proteger seus dados.\n  Nenhum algoritmo consola uma criança que chegou triste, vibra com a primeira palavra lida por um aluno que superou a dislexia ou desperta a curiosidade com o brilho no olhar.\n  Agora, compartilhe esse conhecimento com seus colegas.\nA educação muda quando o professor muda."
          },
          {
            "tipo": "imagem",
            "src": "/curso/imagens/20_professor_insubstituivel.png",
            "legenda": "A tecnologia amplia o alcance; o vínculo humano é insubstituível."
          }
        ]
      },
      {
        "titulo": "Saída 4 — o que você leva do curso",
        "html": "<div class=\"slide\" data-n=\"96\" data-title=\"Saída 4 — o que você leva do curso\" data-enc=\"4\" data-pos=\"fim\">\n<div class=\"sl-saida\">\n  <h2>✅ O que você leva do curso inteiro</h2>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 prova completa</strong> com gabarito conferido</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 rubrica</strong> pronta para o próximo trabalho</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>1 tarefa reformulada</strong> à prova de cola</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\"><strong>Esqueleto do Projeto de Intervenção</strong> preenchido</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\">Os <strong>4 destacáveis</strong> impressos</span></div>\n  <div class=\"it marcavel\"><span class=\"bx\"></span><span class=\"tx\">Seu <strong>banco pessoal de prompts</strong> — o mais valioso de todos</span></div>\n</div>\n</div>",
        "secaoApostila": "12",
        "blocos": [
          {
            "tipo": "texto",
            "html": "✅ O que você leva do curso inteiro"
          },
          {
            "tipo": "checklist",
            "itens": [
              "1 prova completa com gabarito conferido",
              "1 rubrica pronta para o próximo trabalho",
              "1 tarefa reformulada à prova de cola",
              "Esqueleto do Projeto de Intervenção preenchido",
              "Os 4 destacáveis impressos",
              "Seu banco pessoal de prompts — o mais valioso de todos"
            ]
          }
        ]
      }
    ]
  }
];
