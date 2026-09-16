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

export type PassoRoteiro = { titulo: string; blocos: BlocoRoteiro[] };

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
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕐 FORMAÇÃO COMPLETA · 40 HORAS\n  🤖\n  Inteligência Artificial\npara Educadores\n  Um guia prático, acessível e sem jargões para transformar sua rotina escolar.\n  \n    Sem jargões técnicos\n    Ferramentas 100% gratuitas\n    Inclusão real\n    Alinhado à BNCC\n  \n  4 encontros presenciais de 2 horas + aplicação em sala e Projeto de Intervenção"
          }
        ]
      },
      {
        "titulo": "Encontro 1 — Abertura",
        "blocos": [
          {
            "tipo": "texto",
            "html": "ENCONTRO 1 · 2 HORAS\n  Primeiros Passos e a Arte\nde Conversar com a IA\n  Hoje você vai entender o que é a IA sem nenhum jargão, descobrir as ferramentas realmente gratuitas e aprender a fórmula que faz toda a diferença nos resultados.\n  \n    Capítulo 1 · Entendendo a IA\n    Capítulo 2 · Engenharia de Prompts"
          }
        ]
      },
      {
        "titulo": "Onde foi parar o seu tempo?",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Encontro 1 · Por que estamos aqui\n\n\n  Você foi formado para ensinar, inspirar e transformar vidas. Mas na prática, boa parte das suas horas vai para outra coisa.\n  \n    📝Pareceres descritivos30 a 40 textos individuais, todo fim de bimestre.\n    📚PlanejamentoHoras montando planos de aula do zero.\n    ✏️CorreçãoPilhas de provas e redações no fim de semana.\n    📋BurocraciaAtas, relatórios, comunicados e diários.\n  \n  \n    A proposta desta formação\n    A IA não substitui o professor. Ela assume o trabalho braçal e repetitivo — a digitação, o rascunho, a formatação — e devolve a você o recurso mais escasso da educação: tempo para olhar nos olhos dos seus alunos."
          }
        ]
      },
      {
        "titulo": "Aquecimento 1 — quem levou trabalho pra casa?",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🔥 AQUECIMENTO · 2 MINUTOS\n  Levante a mão quem levou trabalho da escola para o fim de semana no último mês.\n  Agora mantenha a mão levantada quem fez isso mais de duas vezes.\n  Olhe em volta. Você não está sozinho — e é exatamente isso que vamos atacar hoje."
          }
        ]
      },
      {
        "titulo": "O que é IA? A metáfora do WhatsApp",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.3\n\n\n  \n    ✓\n    \n      Compromisso desta formação: R$ 0,00\n      Nenhuma ferramenta ensinada aqui exigirá cartão de crédito para o seu trabalho escolar. Muitos professores desistem por achar que IA boa custa mais de R$ 100 por mês. Isso não é verdade.\n    \n  \n  \n    \n      DeepSeek\n      🟢 Sem limite de mensagens\n      Excelente em matemática, ciências e gabaritos comentados.\n    \n    \n      NotebookLM\n      🟡 Cota diária\n      Lê a BNCC e o livro didático citando a página exata.\n    \n    \n      Canva Educação\n      🟢 Pro gratuito\n      Versão Pro liberada para docentes da rede pública."
          }
        ]
      },
      {
        "titulo": "Vitrine de ferramentas gratuitas",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.3 · Tabela completa\n\n\n\n  FerramentaTipoMelhor paraGratuidade real\n  \n    DeepSeekTextoMatemática, ciências, raciocínio passo a passo🟢 Sem limite\n    Google GeminiTextoPesquisas atuais, integração com Google Drive🟢 Gratuito\n    QwenTextoAlternativa quando outra atinge o limite🟢 Gratuito\n    ChatGPTTextoVersátil, o mais conhecido🟡 Troca p/ modelo fraco\n    NotebookLMLeitura PDFBNCC, PPP e livro didático sem inventar🟡 ~50 perguntas/dia\n    Canva EducaçãoDesignSlides, cartazes, murais, atividades🟢 Pro para docentes\n    MagicSchoolKit docente80+ ferramentas prontas para professor🟡 Exportação limitada\n    DiffitAdaptaçãoTexto em 3 níveis de leitura🟡 Não exporta p/ Docs\n    GammaSlidesApresentações rápidas🔴 Créditos acabam"
          }
        ]
      },
      {
        "titulo": "As quatro ferramentas do curso",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.8 · Cole no mural\n\n\n\n  Quando você precisa de…Use primeiroPor quê\n  \n    Plano de aula, atividade, projetoGeminiBom em português e já está na sua conta Google\n    Conta, fórmula, raciocínioDeepSeekO mais forte em matemática; mostra o passo a passo\n    BNCC, PPP, livro didático, leiNotebookLMResponde só pelo documento e cita a página\n    Texto delicado: família, parecer, ataChatGPTO melhor em tom e nuance de escrita\n    A ferramenta travouA outraA Regra dos Dois Barcos: copie o prompt e cole na segunda aba\n  \n\n\n  ⚠️ Vale para as quatro\n  Nenhuma pode receber dado que identifique aluno: nome completo, laudo, endereço, foto, nota com nome. Regra de bolso: \"aluno fictício de 9 anos\", nunca \"o Pedro do 4ºB\"."
          }
        ]
      },
      {
        "titulo": "Momento: criando as contas juntos",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Antes de sair desta tela\n\n\n  \n    \n      💳 Nunca coloque cartão\n      Nenhuma das quatro exige cartão para o trabalho escolar. Se uma tela pedir, feche: você está na página do plano pago, não na versão gratuita.\n    \n    \n      📝 Anote como entrou\n      \"Entrei com o Google\" ou \"criei senha\". Daqui a três semanas você não vai lembrar — e vai achar que perdeu a conta.\n    \n    \n      🔑 Senha diferente\n      Se criar senha nova, não use a mesma do seu e-mail principal. Vale para qualquer serviço, não só estes.\n    \n  \n  \n    💡 Travou em alguma? Levante a mão\n    É para isso que este momento existe. Criar conta às pressas, sozinho, na véspera de uma aula — é assim que as pessoas desistem da IA. Resolvemos agora, com tempo e com ajuda."
          }
        ]
      },
      {
        "titulo": "Suas quatro contas — checklist",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 1.6\n\n\n  \n    🤥 Ela pode inventarGera informações falsas com total convicção. Pode citar um livro que não existe ou uma lei que nunca foi aprovada.\n    🏫 Não conhece sua escolaNão sabe que falta laboratório, que o 3ºB é agitado ou que um aluno tem laudo. Você precisa contar.\n    ⚖️ Não substitui seu julgamentoPode sugerir uma rubrica, mas quem decide a nota é você, que conhece o contexto.\n    🎓 Não tem bom senso pedagógicoPode propor uma atividade linda e inviável com 35 alunos numa tarde quente.\n  \n  \n    📖 Traduzindo: Alucinação da IA\n    É quando a IA inventa algo que parece verdade. Não é má-fé — ela tenta completar o texto de forma coerente mesmo sem ter certeza. É como o aluno que, na prova oral, não sabe a resposta e tenta enrolar com confiança. Regra de ouro: nunca copie números, datas, leis ou citações sem verificar."
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 1 — a IA citou uma fonte",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕵️ Caça ao Erro 1 · 4 min\n\n\n  \n    1. Psicogênese da Língua Escrita — Emília Ferreiro e Ana Teberosky (1985)\n\n\n    2. A Importância do Ato de Ler — Paulo Freire (1981)\n\n\n    3. Alfabetização em Classes Populares Brasileiras — Marta Vasconcelos, Editora Pedagógica Nacional (1994), página 87, que demonstra que 87% das crianças alfabetizadas com método fônico apresentam melhor desempenho.\n  \n  🔍 Vocês têm 2 minutos: qual é o suspeito? Como confirmariam?"
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 1 — gabarito",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎯 Gabarito\n\n\n  \n    \n      ✅ Reais\n      Os itens 1 e 2 existem e são clássicos da área.\n    \n    \n      ❌ Inventado\n      O livro, a autora, a editora, a página e a estatística não existem.\n    \n  \n  \n    💡 O sinal de alerta\n    Quanto mais específico o dado (página exata, percentual quebrado), mais desconfiança ele merece. É justamente essa precisão falsa que convence.\n  \n  \n    🔎 Como confirmar em 10 segundos\n    Busque o título entre aspas no Google. Se um livro real não aparece em nenhuma livraria ou biblioteca, ele não existe."
          }
        ]
      },
      {
        "titulo": "Mão na Massa 1 — Seus dois barcos",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 2.1\n\n\n  Prompt é apenas a frase que você digita na caixa de conversa da IA. Um pedido, uma pergunta, uma instrução.\n  \n    \n      🍽️ \"Me traga comida\"\n      O garçom fica perdido. Que tipo? Salgado ou doce? Você tem alguma restrição?\n    \n    \n      🍽️ Um pedido detalhado\n      O garçom sabe exatamente o que trazer. Com a IA funciona igual.\n    \n  \n  \n    📖 Traduzindo: Engenharia de Prompt\n    É a técnica de escrever instruções claras e detalhadas. Não é \"engenharia\" no sentido técnico — é aprender a dar instruções precisas para um assistente muito rápido, mas que não consegue ler sua mente."
          }
        ]
      },
      {
        "titulo": "A Fórmula P.T.C.F.",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ Duelo 1 · 7 min\n\n\n  \n    \n      ❌ O que quase todo mundo escreve\n      Crie uma atividade de matemática.\n      A IA devolve: contas soltas, sem ano escolar, sem contexto, sem objetivo. Serve para qualquer turma — ou seja, não serve para a sua.\n    \n    \n      ✅ O mesmo pedido com P.T.C.F.\n      Aja como professora de Matemática\ndo 4º ano. Crie uma atividade de\n30 min sobre multiplicação por 2 e 3,\ncom situações do cotidiano de uma\ncriança de cidade pequena (padaria,\ncontar ovos na granja).\nInclua: texto motivador, 5 exercícios\ncrescentes e 1 desafio bônus.\nPronto para imprimir.\n      Muda tudo: idade, conteúdo, realidade do aluno e formato. Sai pronto para a impressora."
          }
        ]
      },
      {
        "titulo": "Duelo 1 — agora é a sua vez",
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ SUA VEZ · 4 MINUTOS\n  Reescreva este prompt ruim\n  \n    \"Faça um texto sobre meio ambiente.\"\n  \n  Use as 4 letras. Capriche no Contexto — a sua escola, a sua turma, a sua região."
          }
        ]
      },
      {
        "titulo": "Caso 1 — a aula de amanhã",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎭 ESTUDO DE CASO 1 · 10 MIN · EM DUPLAS\n  A aula de amanhã\n  \n    São 21h40 de uma terça-feira. Você lembra que amanhã, às 7h20, tem aula com o 6º ano e o conteúdo é \"Sistema Solar\" — um tema que você não dá há dois anos. A escola não tem projetor funcionando. Você está cansado e tem, realisticamente, 25 minutos antes de dormir.\n  \n  Em dupla: que prompt vocês escreveriam agora?"
          }
        ]
      },
      {
        "titulo": "Desafio 1 — plano de aula em 5 minutos",
        "blocos": [
          {
            "tipo": "texto",
            "html": "5:00\n  Um plano de aula completo\n  Escolha um conteúdo que você realmente dará esta semana. Escreva o prompt com as 4 letras, envie, leia e peça um refinamento.\n  Quem terminar, levante a mão."
          }
        ]
      },
      {
        "titulo": "5 técnicas avançadas de prompt",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 2.4\n\n\n  \n    1 · Pedir em etapasPrimeiro o esqueleto, depois o detalhamento de cada parte. O resultado fica muito melhor.\n    2 · Pedir um tom\"Explique como um youtuber divertido para crianças de 8 anos, com analogias de comida.\"\n    3 · Pedir o que NÃO fazer\"Me dê 3 planos de aula RUINS e explique o erro de cada um.\" Às vezes é mais fácil aprender pelo erro.\n    4 · Refinar, não recomeçarA que mais economiza tempo. \"Ficou longo, reduza.\" / \"Troque os exemplos por situações do Nordeste.\"\n  \n  5 · Dar um exemplo do que você querJá tem um modelo que a coordenação aprovou? Cole-o e peça: \"Siga exatamente esta estrutura, mas sobre o tema X.\""
          }
        ]
      },
      {
        "titulo": "Banco de 15 prompts prontos",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 2.5 · Copie e use amanhã\n\n\n  Na apostila você tem 15 prompts completos, prontos para copiar. Basta trocar o que está entre colchetes. O Anexo A traz ainda mais, organizados por disciplina.\n  \n    1 · Plano de Aula\n    2 · Prova Inédita\n    3 · Parecer Descritivo\n    4 · E-mail para Pais\n    5 · Adaptação Inclusiva\n    6 · Rotação por Estações\n    7 · Jogo Educativo\n    8 · Sequência Didática\n    9 · Projeto Interdisciplinar\n    10 · Resumo Didático\n    11 · Metáfora do Cotidiano\n    12 · Recuperação e Reforço\n    13 · Diferenciação 3 Níveis\n    14 · Comunicado às Famílias\n    15 · Plano B para Imprevistos"
          }
        ]
      },
      {
        "titulo": "Mão na Massa 2 — Seu primeiro prompt completo",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 20 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Pense numa aula que você vai dar nesta semana.\n      Escreva um prompt usando as quatro letras do P.T.C.F. Capriche no Contexto.\n      Cole na IA e leia o resultado.\n      Refine duas vezes (\"reduza\", \"troque os exemplos\", \"vire tabela\").\n      Salve o prompt final — é o começo do seu banco pessoal.\n    \n  \n  \n    💡 Crie seu banco pessoal de prompts\n    Sempre que um prompt der resultado muito bom, salve. Em poucos meses você terá uma biblioteca sob medida para a sua realidade — algo que nenhuma ferramenta paga oferece."
          }
        ]
      },
      {
        "titulo": "Saída 1 — o que você leva hoje",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "ENCONTRO 2 · 2 HORAS\n  Sua Rotina, Seu Planejamento\ne a BNCC\n  Hoje atacamos a burocracia que devora seus fins de semana — pareceres, atas, comunicados — e aprendemos a planejar aulas alinhadas à BNCC sem decorar código nenhum.\n  \n    Cap. 3 · Organização Profissional\n    Cap. 4 · Planejamento e BNCC\n    Cap. 5 · Documentos Longos"
          }
        ]
      },
      {
        "titulo": "Aquecimento 2 — quanto tempo leva um parecer?",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🔥 AQUECIMENTO · 3 MINUTOS\n  Quanto tempo levou o seu último parecer descritivo?\n  E quantos você precisa escrever por bimestre?\n  Multiplique um pelo outro. Esse número é o que vamos atacar agora."
          }
        ]
      },
      {
        "titulo": "A burocracia invisível",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎭 ESTUDO DE CASO 2 · 10 MIN · EM DUPLAS\n  Doze pareceres até segunda\n  \n    Sexta-feira, 17h. A coordenadora aparece na porta: os pareceres de 12 alunos precisam estar prontos na segunda de manhã. Você tem suas anotações — frases soltas do tipo \"melhorou leitura, ainda troca b/d, prestativa, dispersa em atividade individual\". Cada parecer à mão leva 20 minutos. São 4 horas do seu fim de semana.\n  \n  Em dupla: qual é a estratégia? Quantos minutos vocês acham que levará?"
          }
        ]
      },
      {
        "titulo": "Caso 2 — a estratégia que funciona",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ Duelo 2 · 7 min\n\n\n  \n    \n      ❌ Sem cuidado\n      Escreva um e-mail para a mãe\ndo aluno reclamando que ele\nnão faz as tarefas e conversa\ndemais na aula.\n      Resultado: e-mail correto, porém frio e acusatório. A palavra \"reclamando\" contamina tudo. A família fica na defensiva e a relação piora.\n    \n    \n      ✅ Com intenção pedagógica\n      Escreva um e-mail curto e empático\npara a mãe de um aluno fictício de\n12 anos, 7º ano.\nContexto: é inteligente e\nparticipativo quando se interessa,\nmas conversou muito nas últimas\n2 semanas e deixou 2 tarefas.\nTom: convite à parceria, nunca\npunitivo. Comece por algo positivo\nreal. Máximo 2 parágrafos.\n      Resultado: abre reconhecendo o aluno, descreve o fato sem adjetivar a criança. A família vira aliada."
          }
        ]
      },
      {
        "titulo": "Desafio 2 — a ata em 4 minutos",
        "blocos": [
          {
            "tipo": "texto",
            "html": "4:00\n  A ata que ninguém quer escrever\n  Transforme tópicos soltos de um conselho de classe em ata formal pronta para assinatura.\n  Peça a formatação oficial, leia e ajuste um detalhe."
          }
        ]
      },
      {
        "titulo": "Atas, relatórios e cartas",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 15 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Escolha um aluno real da sua turma — mas não escreva o nome dele.\n      Anote 5 ou 6 observações soltas, como num rascunho.\n      Peça o parecer descritivo usando o prompt 3 do banco.\n      Leia com olhar crítico: está fiel ao aluno que você conhece? Ajuste o que não corresponde.\n      Cronometre. Multiplique pela quantidade de pareceres que você escreve por bimestre."
          }
        ]
      },
      {
        "titulo": "Plano de aula completo",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕵️ Caça ao Erro 2 · 5 min\n\n\n  \n    \"Este plano contempla a habilidade EF07CI09 da BNCC, que trata dos sistemas do corpo humano.\n\n\n    Também dialoga com a habilidade EF07BI14 (Biologia, 7º ano), sobre fisiologia comparada dos sistemas circulatório e respiratório.\"\n  \n  🔍 Dois minutos: qual é impossível? E por quê?"
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 2 — gabarito",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎯 Gabarito\n\n\n  \n    ❌ EF07BI14 é impossível\n    No Ensino Fundamental não existe o componente \"Biologia\". Biologia só aparece no Ensino Médio. No Fundamental o componente é Ciências (CI).\n  \n  \n    EFEtapa\n    07Ano\n    CIComponente\n    09Habilidade\n  \n  \n    💡 A lição\n    Você não precisa decorar a BNCC para pegar erros — basta conhecer a lógica do código. E, na dúvida, o NotebookLM responde citando a página do documento oficial."
          }
        ]
      },
      {
        "titulo": "Sequências didáticas e metodologias ativas",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 4.2 a 4.4\n\n\n  \n    📚 Sequência didáticaAulas conectadas com progressão lógica. Uma aula isolada raramente consolida o aprendizado. Peça 3 a 5 aulas com objetivo, metodologia e avaliação de cada uma.\n    🔗 Projeto interdisciplinarCiências + Matemática na Horta Escolar. História + Geografia. A IA monta justificativa, cronograma, produto final e critérios.\n  \n  \n    🔄Rotação por Estações4 estações de 12 min: leitura, jogo, escrita e discussão.\n    🏠Sala InvertidaVídeo em casa, atividade prática na sala.\n    🎮GamificaçãoCompetição entre equipes com pontuação e premiação simbólica."
          }
        ]
      },
      {
        "titulo": "NotebookLM: o assistente que não inventa",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 5.2\n\n\n  \n    \n      ⚠️ O limite do NotebookLM\n      Cerca de 50 perguntas por dia e até 100 cadernos. Desde setembro de 2026, o uso é controlado por cota que se renova a cada poucas horas.\n      Dá e sobra para o trabalho de um professor — mas em tarde de planejamento intenso, comece cedo.\n    \n    \n      Alternativas se a cota acabar\n      Gemini e DeepSeek também aceitam PDFs anexados — menos rigorosos, então confira as respostas.\n      Recortar e colar: se precisa só de um capítulo, copie o trecho e cole na conversa. Funciona em qualquer ferramenta.\n    \n  \n  \n    💡 Quando a internet da escola cai\n    Todo professor da rede pública sabe que a internet oscila. Regra de ouro: gere seus planos em casa ou na sala dos professores, mas sempre salve em PDF ou imprima com antecedência. A tecnologia deve ser seu trampolim, nunca seu ponto único de falha."
          }
        ]
      },
      {
        "titulo": "Mão na Massa 4 — Conversando com a BNCC",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 20 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Baixe o PDF da BNCC (ou do currículo da sua rede).\n      Crie um caderno no NotebookLM e suba o documento.\n      Pergunte: \"Quais habilidades de [sua disciplina] do [seu ano] tratam de [tema que você vai dar]?\"\n      Clique na citação e confirme que a informação está mesmo no documento.\n      Peça: \"Com base nessas habilidades, sugira uma sequência de 3 aulas.\""
          }
        ]
      },
      {
        "titulo": "Saída 2 — o que você leva hoje",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "ENCONTRO 3 · 2 HORAS\n  Materiais, Inclusão\ne Recursos Visuais\n  Hoje você cria materiais sob medida para a sua turma, adapta atividades para cada necessidade em menos de um minuto e descobre como ter o Canva Pro de graça.\n  \n    Cap. 6 · Materiais Educativos\n    Cap. 7 · Inclusão e DUA\n    Cap. 8 · Recursos Visuais"
          }
        ]
      },
      {
        "titulo": "Aquecimento 3 — quem tem aluno com laudo?",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🔥 AQUECIMENTO · 3 MINUTOS\n  Levante a mão quem tem, hoje, ao menos um aluno com laudo na sala.\n  Mantenha levantada quem já recebeu da escola o material adaptado pronto para esse aluno.\n  A diferença entre as duas mãos levantadas é o assunto de hoje."
          }
        ]
      },
      {
        "titulo": "Textos que falam do mundo do aluno",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ Duelo 3 · 8 min\n\n\n  \n    \n      ❌ Genérico\n      Faça um texto sobre meio\nambiente para o 4º ano.\n      Resultado: correto e absolutamente esquecível — \"devemos preservar a natureza\". Poderia ser de uma apostila de 1998. O aluno lê sem se ver ali.\n    \n    \n      ✅ Ancorado na realidade da turma\n      Crie um texto informativo de\n3 parágrafos sobre o Cerrado para\nalunos do 4º ano que moram em Goiás.\nUse animais e frutas do dia a dia\ndeles (pequi, buriti, lobo-guará,\nseriema).\nInclua glossário de 5 palavras,\n4 perguntas e uma atividade de\ndesenho.\n      Resultado: o aluno reconhece o pequi do quintal. O texto vira o mundo dele — e a interpretação melhora porque já tem repertório."
          }
        ]
      },
      {
        "titulo": "Gabarito que ensina: distratores",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 6.3\n\n\n  \n    🔤Caça-palavras12 palavras com dicas contextualizadas por tema.\n    🧩CruzadinhaDicas que exigem raciocínio, não só sinônimo.\n    ✅Quiz V ou FCom explicação infantil de por que é falso.\n  \n  \n    ⚠️ Cuidado com a grade de letras\n    A IA é ótima para gerar as palavras e as dicas, mas costuma errar ao montar a grade — coloca palavras que não se cruzam ou letras que não batem. Peça a lista à IA e monte a grade você mesmo (ou use um gerador gratuito). Economiza tempo sem gerar material com erro."
          }
        ]
      },
      {
        "titulo": "Inclusão: onde a IA mais transforma",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 7.1\n\n\n  A educação inclusiva é lei. Mas na prática o professor recebe alunos com laudos e não tem formação nem tempo para adaptar tudo. A IA adapta uma atividade em menos de um minuto.\n  \n    📖 Traduzindo: DUA (Desenho Universal para a Aprendizagem)\n    É a ideia de que uma aula bem planejada oferece múltiplos caminhos para todo mundo: formas diferentes de apresentar o conteúdo (texto, imagem, áudio), de o aluno responder (escrevendo, falando, desenhando) e de motivá-lo. Quando adaptamos pensando em quem tem mais dificuldade, a sala inteira ganha.\n  \n  \n    🎯TDAH\n    📖Dislexia\n    🧩TEA\n    🚀Altas habilidades"
          }
        ]
      },
      {
        "titulo": "Caso 3 — uma turma, quatro necessidades",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎭 ESTUDO DE CASO 3 · 13 MIN · EM DUPLAS\n  Uma turma, quatro necessidades\n  \n    28 alunos no 5º ano, aula de interpretação de texto. Na sala: um aluno com TEA, que trava com linguagem figurada; dois com dislexia; três ainda em alfabetização; e uma aluna que termina tudo em 5 minutos e fica entediada. Você tem uma aula de 50 min e não quer que ninguém se sinta exposto.\n  \n  Quantas versões vocês prepararão? E como fazem sem que a turma perceba quem recebeu qual?"
          }
        ]
      },
      {
        "titulo": "Caso 3 — a saída elegante",
        "blocos": [
          {
            "tipo": "texto",
            "html": "💡 Solução comentada\n\n\n  \n    ❌ O erro comum\n    Preparar 4 atividades sobre temas diferentes. Dá um trabalho enorme e — pior — escancara a diferença: todo mundo vê quem recebeu \"a folha mais fácil\".\n  \n  \n    ✅ O que funciona\n    O mesmo texto e o mesmo tema para todos, em três níveis de profundidade, mais os ajustes de forma para TEA e dislexia. As folhas se parecem visualmente. A turma conversa sobre a mesma história e ninguém fica marcado."
          }
        ]
      },
      {
        "titulo": "Adaptação para TDAH e Dislexia",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕵️ Caça ao Erro 3 · 4 min\n\n\n  \n    Atividade: Viajando pelo mundo das frações\n\n\n    1. Solte a imaginação e mergulhe no universo dos números!\n\n    2. Divida a pizza como quem divide alegria entre amigos.\n\n    3. Agora você vai brilhar: pinte as partes que representam 1/4.\n\n    4. Capriche e deixe sua criatividade voar alto!\n  \n  🔍 Dois minutos: por que esta adaptação falha?"
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 3 — gabarito",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎯 Gabarito\n\n\n  \n    A IA obedeceu à forma, não ao princípio\n    Ela numerou como você pediu — mas não adaptou a linguagem, que é o que mais importa no TEA. \"Solte a imaginação\", \"mergulhe no universo\", \"dividir alegria\", \"vai brilhar\", \"voar alto\".\n  \n  \n    Um aluno que interpreta literalmente pode travar tentando entender como se mergulha em números ou como a criatividade voa.\n  \n  \n    💡 A lição\n    Peça sempre de forma explícita: \"linguagem 100% literal, sem metáforas, sem linguagem figurada\" — e depois confira. Você conhece o aluno; a IA não."
          }
        ]
      },
      {
        "titulo": "Troca com o colega — mostre o que você gerou",
        "blocos": [
          {
            "tipo": "texto",
            "html": "👥 TROCA COM O COLEGA · 4 MINUTOS\n  Vire para o lado e mostre o que você gerou.\n  O colega aponta uma coisa boa e uma a melhorar. Depois troquem os papéis.\n  A sala inteira é um banco de experiência. Use."
          }
        ]
      },
      {
        "titulo": "A mesma aula em 3 níveis",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 7.5 · A técnica mais valiosa\n\n\n  Quando a turma tem alunos em níveis muito diferentes, você não dá três aulas — dá uma aula com três versões da atividade. Todos trabalham o mesmo tema, ao mesmo tempo, e ninguém se sente exposto.\n  \n    Versão A · BásicaPara alunos com defasagem. Texto curto, perguntas com resposta localizada diretamente no texto.\n    Versão B · IntermediáriaPara o nível esperado. Texto médio, perguntas de interpretação.\n    Versão C · AvançadaPara alunos acima do nível. Perguntas de inferência, opinião e relação com outros temas.\n  \n  \n    💡 O atalho: Diffit\n    O Diffit faz os três níveis automaticamente. Ótimo atalho — mas aprenda primeiro a fazer pelo prompt. Assim você não fica refém de uma ferramenta e ajusta o nível exatamente à sua turma. No plano gratuito ele não exporta para o Docs; você copia e cola."
          }
        ]
      },
      {
        "titulo": "Desafio 3 — a mesma atividade em 3 níveis",
        "blocos": [
          {
            "tipo": "texto",
            "html": "6:00\n  A mesma atividade em 3 níveis\n  Escolha um conteúdo real. Peça as versões A, B e C do mesmo tema.\n  Verifique: as três parecem visualmente semelhantes? Ajuste o nível que ficou fora do alvo."
          }
        ]
      },
      {
        "titulo": "Mão na Massa 6 — Adaptação para o seu aluno real",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Oficina prática · 20 minutos\n\n\n  \n    ✋ Agora é a sua vez\n    \n      Pense num aluno que precisa de adaptação — sem escrever o nome dele.\n      Pegue uma atividade que você já usa e peça a adaptação adequada (TDAH, dislexia, TEA ou altas habilidades).\n      Depois, gere a mesma atividade em 3 níveis (A, B e C).\n      Compare: você produziria isso à mão em quanto tempo?\n      Revise com cuidado — você conhece o aluno, a IA não."
          }
        ]
      },
      {
        "titulo": "Canva para Educação: Pro gratuito",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 8.3 a 8.5\n\n\n  \n    🖼️Imagens sob medidaDescreva e ela desenha. Pode ajustar conversando: \"coloque óculos na criança\".\n    🧠Mapas mentaisEstrutura pronta para redesenhar no quadro ou montar no Canva.\n    🎬Roteiro de vídeoCom indicação de cenas e imagens em cada momento.\n    🎙️Roteiro de podcastDiálogo entre dois alunos, com efeitos e pausas marcados.\n  \n  \n    ⚠️ Cuidado com imagens de IA em material didático\n    Geradores ainda erram em texto dentro da imagem (letras embaralhadas), mãos e dedos e precisão científica (órgãos no lugar errado, mapas com fronteiras inventadas). Para ilustração decorativa, ótimo. Para conteúdo científico ou histórico, confira antes."
          }
        ]
      },
      {
        "titulo": "Curipod e Mão na Massa 7",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 8.6 · Oficina 7\n\n\n  \n    ⚠️ Curipod: 2 sessões ao vivo por semana\n    Gera slides com enquetes que os alunos respondem pelo celular em tempo real. O plano gratuito permite só 2 sessões por semana — reserve para momentos de alto valor. Se os alunos não têm celular, projete e peça que levantem cartões coloridos de papel (A, B, C). Funciona igual e não depende de internet na sala.\n  \n  \n    ✋ Mão na Massa 7 — Sua apresentação\n    \n      Solicite hoje a verificação do Canva para Educação.\n      Use o Design Mágico para uma apresentação sobre um tema que você dará em breve.\n      Ajuste: troque uma imagem, corrija um texto, mude uma cor.\n      Gere também um cartaz A3 para o mural da sua sala."
          }
        ]
      },
      {
        "titulo": "Saída 3 — o que você leva hoje",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "ENCONTRO 4 · 2 HORAS\n  Avaliação, Ética\ne Seu Projeto Final\n  Hoje fechamos o ciclo: avaliações que medem raciocínio, a linha vermelha da LGPD que não se cruza, e a estruturação do seu Projeto de Intervenção.\n  \n    Cap. 9 · Avaliações e Rubricas\n    Cap. 10 · Ética e LGPD\n    Cap. 11 · Projeto de Intervenção"
          }
        ]
      },
      {
        "titulo": "Aquecimento 4 — corrigir no domingo",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🔥 AQUECIMENTO · 3 MINUTOS\n  Duas perguntas, mão levantada\n  1. Quem já corrigiu prova num domingo à noite?\n  2. Quem já suspeitou que um trabalho foi feito por IA — e não soube o que fazer?\n  As duas coisas se resolvem hoje."
          }
        ]
      },
      {
        "titulo": "Provas inéditas e contextualizadas",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "6:00\n  Prova completa com gabarito\n  5 questões de múltipla escolha + 2 dissertativas, com situações do cotidiano e gabarito comentado explicando cada alternativa errada.\n  Ao final: quanto tempo você levaria sozinho?"
          }
        ]
      },
      {
        "titulo": "Rubricas: correção justa e rápida",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 9.3\n\n\n  \n    📖 Traduzindo: Rubrica\n    Tabela que define exatamente o que o aluno precisa fazer para ganhar cada nota. Em vez de avaliar \"no olho\", ela padroniza os critérios: o aluno sabe de antemão o que se espera dele, e você corrige com rapidez e segurança.\n  \n  \n    CritérioPrecisa Melhorar (4-5)Bom (7-8)Excelente (9-10)\n    \n      Clareza da falaFala muito baixo, leu o papel o tempo todo.Bom volume, consultou anotações mas explicou com suas palavras.Voz clara e segura, olhou para a sala e não precisou ler.\n      ConteúdoInformações vagas, não soube responder perguntas simples.Apresentou os conceitos principais com bons exemplos.Dominou o tema, trouxe curiosidades e respondeu com segurança.\n      EquipeApenas um aluno falou, os outros ficaram desatentos.Todos falaram, mas a divisão foi desigual.Todos participaram igualmente, com apoio mútuo."
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 4 — o gabarito está certo?",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🕵️ Caça ao Erro 4 · 8 min\n\n\n  \n    Questão: Uma camiseta custava R$ 80,00 e teve desconto de 25%. Depois, sobre o novo preço, houve acréscimo de 25%. Qual o preço final?\n\n\n    a) R$ 80,00     b) R$ 75,00     c) R$ 85,00     d) R$ 70,00\n\n\n    Gabarito da IA: (a) R$ 80,00 — \"como desconto e acréscimo são ambos de 25%, eles se anulam\".\n  \n  🔍 Peguem o celular e façam a conta."
          }
        ]
      },
      {
        "titulo": "Caça ao Erro 4 — gabarito",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎯 Gabarito\n\n\n  \n    \n      ✅ A conta correta\n      80 − 25% = 60\n60 + 25% de 60 = 60 + 15 = R$ 75,00\n    \n    \n      ❌ O erro da IA\n      Achar que percentuais iguais se anulam. Mas o desconto incide sobre 80 e o acréscimo sobre 60 — bases diferentes.\n    \n  \n  \n    ⚠️ A lição — e ela é grande\n    Se você tivesse aplicado essa prova sem conferir, teria corrigido como erro a resposta certa dos alunos. Sempre refaça as contas do gabarito. A IA erra com a mesma confiança com que acerta."
          }
        ]
      },
      {
        "titulo": "Como lidar com alunos usando IA",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 9.5\n\n\n  \n    ⚠️ Detectores de IA não são confiáveis\n    Ferramentas que prometem \"detectar\" texto de IA erram muito — e acusam textos autorais de alunos esforçados, frequentemente os que escrevem de forma mais organizada. Nunca acuse um aluno com base num detector. A injustiça de uma acusação falsa é mais grave que o problema que ela tenta resolver.\n  \n  \n    \n      ❌ Não funciona mais\n      \"Faça um resumo de 2 páginas sobre a Primeira Guerra Mundial.\"\n      A IA faz em 10 segundos.\n    \n    \n      ✅ A tarefa inteligente\n      \"Entreviste alguém mais velho da sua família sobre um evento histórico que marcou a vida dele. Compare com a Primeira Guerra. Apresente oralmente.\"\n      A IA não pode entrevistar a avó do aluno.\n    \n  \n  \n    💡 O princípio\n    A tarefa inteligente exige algo que só aquele aluno tem: a experiência da família dele, a opinião defendida oralmente, a observação do bairro onde mora. A IA vira ferramenta de pesquisa, não executora final."
          }
        ]
      },
      {
        "titulo": "Duelo 4 — a tarefa à prova de cola",
        "blocos": [
          {
            "tipo": "texto",
            "html": "⚔️ Duelo 4 · 8 min\n\n\n  \n    \n      ❌ A IA faz em 10 segundos\n      \"Faça uma pesquisa de 2 páginas\nsobre a Grécia Antiga para\nentregar na próxima semana.\"\n      O aluno pede à IA, imprime sem ler e você passa o fim de semana corrigindo texto de máquina. Ninguém aprendeu — e você não tem como provar.\n    \n    \n      ✅ Exige o aluno\n      \"Peça à IA 3 argumentos a favor e\n3 contra a democracia de Atenas.\nEscolha o mais forte e venha\npreparado para defendê-lo\noralmente por 1 minuto na roda.\nTraga impressa a conversa que\nvocê teve com a IA.\"\n      A IA vira ferramenta de pesquisa. A escolha e a defesa oral são do aluno — e o uso da IA deixa de ser escondido."
          }
        ]
      },
      {
        "titulo": "LGPD: a linha vermelha",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 10.2\n\n\n  Você pode continuar usando a IA para tudo — pareceres, adaptações, mediação — desde que troque os dados reais por fictícios.\n  \n    ❌ Errado (dados reais)✅ Correto (anonimizado)\n    \n      \"O aluno Pedro Silva Santos, laudo CID F84, mora na Rua das Flores, 123.\"\"Um aluno fictício de 10 anos com diagnóstico de TEA.\"\n      \"A mãe do João, Dona Maria, reclamou que o professor Carlos...\"\"Um responsável reclamou sobre uma situação com um professor.\"\n      \"Na Escola Municipal José de Alencar, turma 5ºB, 3 alunos têm laudos.\"\"Em uma escola pública, uma turma de 5º ano tem 3 alunos com necessidades especiais.\"\n    \n  \n  \n    💡 O teste rápido antes de apertar Enter\n    \"Se este texto vazasse publicamente amanhã, alguém conseguiria identificar meu aluno?\" Se a resposta for sim, anonimize mais."
          }
        ]
      },
      {
        "titulo": "Caso 4 — o parecer que não pode vazar",
        "blocos": [
          {
            "tipo": "texto",
            "html": "🎭 ESTUDO DE CASO 4 · 12 MIN · EM DUPLAS\n  O parecer que não pode vazar\n  \n    Você precisa escrever um relatório sobre uma aluna do 5º ano para o serviço de apoio. Você tem: nome completo, escola, turma, laudo médico com CID, o fato de que ela faltou 15 dias por saúde mental, e o nome da mãe, que pediu sigilo. Você quer usar a IA — mas tudo isso é sensível.\n  \n  Em dupla: reescrevam o pedido sem entregar um único dado identificável."
          }
        ]
      },
      {
        "titulo": "Caso 4 — a anonimização na prática",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 10.4 e 10.6\n\n\n  \n    🔍 Sempre verifique\n      Datas e fatos históricos em fontes confiáveis\n\n      Códigos da BNCC no site do MEC ou no NotebookLM\n\n      Dados científicos em livros do PNLD\n\n      Links — a IA inventa endereços que parecem reais\n    \n    ⚖️ Viés algorítmico\n      A IA aprende com a internet, e a internet tem preconceitos. Ela pode reproduzir estereótipos de gênero, raça e classe social.\n    \n  \n  \n    🔍 Exercício para a sua sala de aula\n    Peça à IA: \"Descreva um cientista\" e depois \"Descreva uma pessoa que trabalha na enfermagem\". Analise com os alunos: ela descreveu o cientista como homem e a pessoa da enfermagem como mulher? Por quê? Uma aula excelente sobre estereótipos e pensamento crítico, do 6º ano ao Ensino Médio."
          }
        ]
      },
      {
        "titulo": "No celular — a rubrica do seu próximo trabalho",
        "blocos": [
          {
            "tipo": "texto",
            "html": "📱 NO CELULAR · 8 MINUTOS\n  A rubrica do seu próximo trabalho\n  Peça uma rubrica para um trabalho que você vai avaliar em breve: 3 ou 4 critérios, níveis Precisa Melhorar / Bom / Excelente, com descrições que o próprio aluno entenda.\n  O teste decisivo: mostre ao colega e pergunte — \"se você fosse aluno, saberia o que fazer para tirar a nota máxima?\""
          }
        ]
      },
      {
        "titulo": "Seu Projeto de Intervenção",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "✍️ SUA VEZ · 10 MINUTOS\n  Escolha agora a dor que você vai resolver\n  \n    Pegue a Ficha do Projeto de Intervenção (Destacável 4, no fim da apostila) e preencha os campos 1 e 2 agora: qual é o problema real da sua rotina, e quais ferramentas você vai usar.\n  \n  Quem quiser, compartilhe em voz alta — ouvir a dor do colega ajuda a enxergar a sua."
          }
        ]
      },
      {
        "titulo": "Checklist de entrega e certificação",
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
        "blocos": [
          {
            "tipo": "texto",
            "html": "Capítulo 12 · Consulta permanente\n\n\n  O projetor queima, a chuva impede a aula na quadra, a coordenação pede substituição de última hora. Guarde este capítulo no celular.\n  \n    🔌 O projetor quebrouDinâmica só com lousa e caderno, passo a passo em 3 minutos.\n    🔄 Substituição inesperadaHistória de abertura + 3 perguntas + atividade em dupla.\n    🏃 Turma agitadaDinâmica de 5 min de regulação, sem gritos e sem bronca.\n    ⏰ Aula vaga de última hora3 atividades independentes de conteúdo, só papel e lápis.\n    🤝 Conflito entre alunosRoteiro de mediação de 10 min, com falas sugeridas.\n    👨‍👩‍👧 Reunião de pais amanhãRoteiro de 40 min com abertura, pontos e fechamento."
          }
        ]
      },
      {
        "titulo": "O kit essencial do professor",
        "blocos": [
          {
            "tipo": "texto",
            "html": "Anexo B\n\n\n  Se quiser começar com o mínimo e sem se perder, use estas três:\n  \n    \n      💬\n      Uma IA de texto\n      DeepSeek ou Gemini — e a outra como segundo barco.\n      🟢 Gratuito\n    \n    \n      📚\n      NotebookLM\n      Para BNCC, PPP e livro didático, sem risco de invenção.\n      🟡 Cota diária\n    \n    \n      🎨\n      Canva Educação\n      Para tudo que é visual. Gratuito para sempre.\n      🟢 Pro docente\n    \n  \n  \n    💡 A dica mais importante de todas\n    Ferramentas vão surgir e desaparecer. Planos gratuitos vão encolher e crescer. Nada disso importa tanto quanto o método. Se você sabe descrever Papel, Tarefa, Contexto e Formato, terá bons resultados em qualquer IA que existir daqui a cinco anos."
          }
        ]
      },
      {
        "titulo": "Encerramento — O professor é insubstituível",
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
