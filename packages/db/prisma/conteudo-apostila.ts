/**
 * Conteúdo da apostila oficial (Curso_IA_Educadores_v2, edição 2026).
 *
 * Nada aqui é inventado: cada bloco foi extraído por script dos
 * arquivos-fonte da apostila (parte*.html e bloco_*.html) — não do PDF
 * montado, onde o Capítulo 7 tem markup diferente e se perde.
 *
 * Antes disto a trilha tinha 1 dos 8 duelos, 0 dos 8 casos, 0 dos 4
 * testes no celular e 0 dos 4 desafios: 26% do curso. Os players de
 * CASO e DESAFIO já existiam prontos e sem nenhuma lição usando.
 */

/** Os 8 duelos: prompt ruim → prompt bom → o que muda → sua vez. */
export const DUELOS = [
  {
    id: "duelo1",
    titulo: "A atividade genérica",
    tempo: "7 min",
    promptRuim: "Crie uma atividade de matemática.",
    resultadoRuim: "O que a IA devolve: uma lista de contas soltas, sem ano escolar definido, sem contexto e sem objetivo pedagógico. Serve para qualquer turma — ou seja, não serve para a sua.",
    promptBom: "Aja como uma professora de Matemática do 4º ano. Crie uma atividade\nde 30 minutos sobre multiplicação por 2 e por 3, usando situações do\ncotidiano de uma criança que mora em cidade pequena (ir à padaria,\ncontar ovos na granja). A atividade deve ter: (1) um texto motivador\ncurto, (2) 5 exercícios com dificuldade crescente, (3) um desafio\nbônus. Entregue formatado e pronto para imprimir.",
    resultadoBom: "O que muda: a IA agora sabe a idade, o conteúdo exato, a realidade do aluno e o formato de entrega. O resultado sai pronto para a impressora, sem precisar de ajuste.",
    desafio: "✍️ Agora é a sua vez — reescreva este prompt ruim:",
    promptParaReescrever: "Faça um texto sobre meio ambiente.",
  },
  {
    id: "duelo2",
    titulo: "O e-mail difícil para a família",
    tempo: "7 min",
    promptRuim: "Escreva um e-mail para a mãe do aluno reclamando que ele\nnão faz as tarefas e conversa demais na aula.",
    resultadoRuim: "O que a IA devolve: um e-mail correto, porém frio e acusatório. A palavra \"reclamando\" contamina todo o texto. A família lê como convocação para bronca, fica na defensiva, e a relação piora.",
    promptBom: "Escreva um e-mail curto e empático para a mãe de um aluno fictício\nde 12 anos, do 7º ano.\n\nContexto: ele é inteligente e participativo quando se interessa, mas\nnas últimas duas semanas conversou muito durante as explicações e\ndeixou de entregar duas tarefas.\n\nTom: convite à parceria entre escola e família — nunca punitivo.\nComece por algo positivo real sobre ele. Termine convidando para uma\nconversa presencial. Máximo 2 parágrafos curtos.",
    resultadoBom: "O que muda: o e-mail abre reconhecendo o aluno, descreve o fato sem adjetivar a criança e termina com um convite. A família vira aliada em vez de ré.",
    desafio: "✍️ Sua vez — reescreva com tom de parceria:",
    promptParaReescrever: "Manda um e-mail avisando que a aluna vai reprovar se continuar faltando.",
  },
  {
    id: "duelo3",
    titulo: "O texto que fala do mundo do aluno",
    tempo: "8 min",
    promptRuim: "Faça um texto sobre meio ambiente para o 4º ano.",
    resultadoRuim: "O que a IA devolve: um texto correto e absolutamente esquecível — \"devemos preservar a natureza\", \"a poluição é um problema\". Poderia ter sido copiado de qualquer apostila de 1998. O aluno lê sem se ver ali.",
    promptBom: "Crie um texto informativo de 3 parágrafos sobre o Cerrado para\nalunos do 4º ano que moram em Goiás. Use animais e frutas que eles\nencontram no dia a dia (pequi, buriti, lobo-guará, seriema).\n\nAo final inclua: (1) glossário com 5 palavras do texto,\n(2) 4 perguntas de interpretação, (3) uma atividade de desenho.",
    resultadoBom: "O que muda: o aluno reconhece o pequi que tem no quintal e a seriema que ouve de manhã. O texto deixa de ser \"conteúdo\" e vira o mundo dele — e a interpretação melhora porque ele já tem repertório.",
    desafio: "✍️ Sua vez — ancore este pedido na SUA região:",
    promptParaReescrever: "Escreva um texto sobre alimentação saudável para o 3º ano.",
  },
  {
    id: "duelo4",
    titulo: "A tarefa à prova de cola",
    tempo: "8 min",
    promptRuim: "\"Faça uma pesquisa de 2 páginas sobre a Grécia Antiga\npara entregar na próxima semana.\"",
    resultadoRuim: "O que acontece: o aluno pede à IA, imprime sem ler e você passa o fim de semana corrigindo texto de máquina. Ninguém aprendeu nada — e você não tem como provar.",
    promptBom: "\"Peça à IA 3 argumentos a favor e 3 contra a democracia de Atenas.\nEscolha o que você achou mais forte e venha preparado para\ndefendê-lo oralmente por 1 minuto na roda de conversa.\nTraga impressa a conversa que você teve com a IA.\"",
    resultadoBom: "O que muda: a IA vira ferramenta de pesquisa, não executora. A escolha, a defesa oral e a justificativa são do aluno — e não há como terceirizar isso. O uso da IA deixa de ser escondido e vira parte declarada do processo.",
    desafio: "✍️ Sua vez — transforme uma tarefa SUA em tarefa à prova de cola:",
    promptParaReescrever: "Pense numa tarefa de casa que você costuma passar e que hoje a IA resolveria sozinha. Reescreva exigindo algo que só aquele aluno tem: a família dele, o bairro dele, a opinião dele defendida na frente dos colegas.",
  },
  {
    id: "duelo5",
    titulo: "A prova que só cobra memória",
    tempo: "6 min",
    promptRuim: "Crie uma prova de História sobre a Revolução Francesa\npara o 8º ano com 10 questões.",
    resultadoRuim: "O que a IA devolve: \"Em que ano ocorreu a Tomada da Bastilha?\", \"Quem foi Robespierre?\". Perguntas que o celular responde em 2 segundos — e que não revelam nada sobre o que o aluno entendeu.",
    promptBom: "Crie uma prova de História sobre a Revolução Francesa para o 8º ano.\n\nREGRAS OBRIGATÓRIAS:\n- Nenhuma questão pode ser respondida só com memória de data ou nome\n- Toda questão parte de um trecho curto (fonte, charge descrita ou\n situação) que o aluno precisa interpretar\n- As alternativas erradas devem representar erros de raciocínio\n comuns, não opções absurdas\n- Inclua 1 questão que peça relação com algo do mundo atual\n\nFormato: 5 múltipla escolha + 2 dissertativas + gabarito comentado\nexplicando o erro por trás de cada alternativa incorreta.",
    resultadoBom: "O que muda: a prova passa a medir interpretação e relação, não memória. E o gabarito comentado vira material de aula: você projeta e discute os erros com a turma.",
    desafio: "✍️ Sua vez — transforme numa prova que mede raciocínio:",
    promptParaReescrever: "Faça 10 questões sobre o corpo humano para o 6º ano.",
  },
  {
    id: "duelo6",
    titulo: "O resumo que não ensina",
    tempo: "6 min",
    promptRuim: "Resuma este texto para os alunos.",
    resultadoRuim: "O que a IA devolve: um resumo mais curto, mas igualmente difícil — mantém o vocabulário acadêmico e só corta parágrafos. O aluno que não entendia o original continua não entendendo.",
    promptBom: "Transforme o texto abaixo em um material de estudo para alunos do\n7º ano que têm dificuldade de leitura.\n\n- Troque TODA palavra difícil por uma simples (ou explique na hora)\n- Frases de no máximo 15 palavras\n- Divida em blocos com subtítulos que já digam a ideia principal\n- Use uma analogia do cotidiano para cada conceito abstrato\n- Ao final: um \"resumão\" de 5 tópicos e 3 perguntas de compreensão\n\nTexto: [COLE AQUI]",
    resultadoBom: "O que muda: deixa de ser encurtamento e vira tradução pedagógica. Os subtítulos que já entregam a ideia funcionam como mapa para quem se perde em textos longos.",
    desafio: "✍️ Sua vez — pegue um texto do seu livro didático e escreva o pedido:",
    promptParaReescrever: "",
  },
  {
    id: "duelo7",
    titulo: "O projeto que fica no papel",
    tempo: "7 min",
    promptRuim: "Crie um projeto interdisciplinar sobre sustentabilidade.",
    resultadoRuim: "O que a IA devolve: um projeto lindo que pressupõe horta pronta, verba para materiais, aulas conjuntas com outro professor e três semanas livres no calendário. Nada disso existe. O plano vai para a gaveta.",
    promptBom: "Crie um projeto interdisciplinar de 2 semanas unindo Ciências e\nMatemática para o 5º ano sobre resíduos na escola.\n\nRESTRIÇÕES REAIS (respeite todas):\n- Verba: R$ 0. Só materiais que os alunos já têm ou lixo reciclável\n- Eu não tenho horário comum com o professor de Matemática: o\n projeto precisa funcionar com eu sozinho conduzindo as duas frentes\n- 4 aulas no total, de 50 min, dentro do meu horário normal\n- A escola não tem pátio disponível durante a aula\n\nEntregue: objetivo por aula, o que o aluno faz em cada uma, produto\nfinal exposto no corredor, e critérios de avaliação em rubrica.",
    resultadoBom: "O que muda: o projeto passa a ser executável na segunda-feira. A restrição não empobrece o resultado — ela obriga a criatividade a trabalhar dentro do possível.",
    desafio: "✍️ Sua vez — liste as 3 restrições reais da SUA escola:",
    promptParaReescrever: "",
  },
  {
    id: "duelo8",
    titulo: "O feedback que humilha",
    tempo: "6 min",
    promptRuim: "Aponte todos os erros desta redação.",
    resultadoRuim: "O que a IA devolve: uma lista implacável de tudo que está errado. Tecnicamente correta, pedagogicamente destrutiva. O aluno lê, sente que não sabe nada e desiste de escrever.",
    promptBom: "Aja como professor de Português experiente e acolhedor. Analise a\nredação abaixo de um aluno fictício do 9º ano.\n\nEstruture assim:\n1. O que o aluno fez BEM (seja específico, cite trechos dele)\n2. As 3 prioridades de melhoria — só três, as mais importantes\n (não liste todos os erros: isso paralisa)\n3. Para cada prioridade, mostre COMO melhorar reescrevendo um\n trecho dele como exemplo\n4. Uma frase final de encorajamento que seja verdadeira, não vazia\n\nTom: de quem quer que ele escreva de novo, não de quem está\njulgando. Nunca use ironia.",
    resultadoBom: "O que muda: limitar a três prioridades é o segredo — uma lista de 15 erros paralisa, três dão um caminho. E reescrever um trecho dele ensina muito mais que explicar a regra.",
    desafio: "✍️ Sua vez — adapte para a sua disciplina:",
    promptParaReescrever: "",
  },
] as const;

/** Os 8 estudos de caso: situação real de escola + solução comentada. */
export const CASOS = [
  {
    id: "caso1",
    titulo: "A aula de amanhã",
    tempo: "10 min · em duplas",
    cena: "São 21h40 de uma terça-feira. Você lembra que amanhã, às 7h20, tem aula com o 6º ano e o conteúdo é \"Sistema Solar\" — um tema que você não dá há dois anos. A escola não tem projetor funcionando. Você está cansado e tem, realisticamente, 25 minutos antes de dormir.",
    pergunta: "Em dupla: que prompt vocês escreveriam agora? Escrevam a versão completa.",
    solucao: "O erro comum: pedir \"um plano de aula sobre Sistema Solar\" e receber algo que exige projetor, internet e material que você não tem.\n\n O que funciona melhor: colocar a limitação dentro do prompt, não descobrir depois.\n\n Aja como professor de Ciências do 6º ano. Crie um plano de aula de\n50 minutos sobre Sistema Solar para amanhã de manhã.\n\nRestrições reais: sem projetor, sem internet na sala, apenas lousa,\ngiz e o caderno dos alunos. Turma de 32 alunos, agitada no primeiro\nhorário.\n\nEntregue: (1) uma abertura de 5 min que capture a atenção, (2)\nexplicação com um desenho que eu consiga reproduzir na lousa,\n(3) uma atividade em duplas, (4) fechamento com registro no caderno.\nCronometre cada momento.\n Discussão para a turma: quantos minutos essa dupla economizou? E o que ainda precisa da revisão do professor antes de entrar em sala?",
    promptExemplo: "Aja como professor de Ciências do 6º ano. Crie um plano de aula de\n50 minutos sobre Sistema Solar para amanhã de manhã.\n\nRestrições reais: sem projetor, sem internet na sala, apenas lousa,\ngiz e o caderno dos alunos. Turma de 32 alunos, agitada no primeiro\nhorário.\n\nEntregue: (1) uma abertura de 5 min que capture a atenção, (2)\nexplicação com um desenho que eu consiga reproduzir na lousa,\n(3) uma atividade em duplas, (4) fechamento com registro no caderno.\nCronometre cada momento.",
  },
  {
    id: "caso2",
    titulo: "Doze pareceres até segunda",
    tempo: "10 min · em duplas",
    cena: "Sexta-feira, 17h. A coordenadora aparece na porta: os pareceres descritivos de 12 alunos precisam estar prontos na segunda de manhã. Você tem suas anotações do bimestre — mas são frases soltas, tipo \"melhorou leitura, ainda troca b/d, é prestativa, dispersa em atividade individual\". Escrever cada parecer à mão leva uns 20 minutos. São 4 horas de trabalho no seu fim de semana.",
    pergunta: "Em dupla: qual é a estratégia? Escrevam o prompt e digam quantos minutos vocês acham que levará.",
    solucao: "O erro comum: pedir um parecer de cada vez, do zero, doze vezes. Não economiza quase nada.\n\n O que funciona: definir o padrão uma vez e depois só alimentar com as anotações.\n\n Aja como coordenadora pedagógica experiente em avaliação formativa.\n\nVou enviar anotações soltas sobre vários alunos fictícios, um por vez.\nPara cada um, escreva um parecer descritivo de 2 parágrafos:\n- Tom acolhedor e profissional\n- Comece pelos avanços concretos\n- Aponte o que precisa de estímulo, sem julgamento\n- Termine com uma meta positiva para o próximo bimestre\n\nConfirme que entendeu e eu envio o primeiro.\n Depois disso, cada aluno leva 30 segundos: você cola as 4 ou 5 anotações e recebe o texto pronto. Os 12 pareceres saem em cerca de 20 minutos — contra 4 horas.\n\n ⚠️ Atenção obrigatória: nenhum nome real. Escreva \"aluna fictícia de 9 anos, 3º ano\". Você troca os nomes depois, no seu documento. Veremos isso em detalhe no Encontro 4.",
    promptExemplo: "Aja como coordenadora pedagógica experiente em avaliação formativa.\n\nVou enviar anotações soltas sobre vários alunos fictícios, um por vez.\nPara cada um, escreva um parecer descritivo de 2 parágrafos:\n- Tom acolhedor e profissional\n- Comece pelos avanços concretos\n- Aponte o que precisa de estímulo, sem julgamento\n- Termine com uma meta positiva para o próximo bimestre\n\nConfirme que entendeu e eu envio o primeiro.",
  },
  {
    id: "caso3",
    titulo: "Uma turma, quatro necessidades",
    tempo: "13 min · em duplas",
    cena: "Você tem 28 alunos no 5º ano e vai trabalhar interpretação de texto. Na sala:\n um aluno com TEA, que trava com linguagem figurada;\n dois com dislexia, que se perdem em textos longos;\n três ainda em processo de alfabetização;\n e uma aluna que termina tudo em cinco minutos e fica entediada.\n Você tem uma aula de 50 minutos e não quer que ninguém se sinta exposto.",
    pergunta: "Em dupla: quantas versões da atividade vocês vão preparar? E como fazem sem que a turma perceba quem recebeu qual?",
    solucao: "O erro comum: preparar 4 atividades diferentes, sobre temas diferentes. Dá um trabalho enorme e — pior — escancara a diferença: todo mundo vê que fulano recebeu \"a folha mais fácil\".\n\n O que funciona: o mesmo texto e o mesmo tema para todos, em três níveis de profundidade, mais os ajustes de forma para TEA e dislexia. Visualmente as folhas se parecem. A turma trabalha junta, conversa sobre a mesma história, e ninguém fica marcado.\n\n Crie uma atividade de interpretação de texto para o 5º ano sobre\n[TEMA], em 3 versões do MESMO texto:\n\nVersão A: texto de 5 linhas, perguntas com resposta localizada\ndiretamente no texto.\nVersão B: texto de 10 linhas, perguntas de interpretação.\nVersão C: texto de 15 linhas, perguntas de inferência e opinião.\n\nDepois, gere duas adaptações de FORMA da versão B:\n- Para dislexia: frases de até 10 palavras, ordem direta, sem\n fonemas parecidos, negrito nos nomes, espaçamento duplo.\n- Para TEA: linguagem 100% literal, sem metáforas, instruções\n numeradas passo a passo, checklist final.\n\nMantenha o MESMO tema e a mesma aparência visual em todas.\n Discussão: quanto tempo isso levaria à mão? E qual é o ganho para a aluna de altas habilidades, que costuma ser a mais esquecida?",
    promptExemplo: "Crie uma atividade de interpretação de texto para o 5º ano sobre\n[TEMA], em 3 versões do MESMO texto:\n\nVersão A: texto de 5 linhas, perguntas com resposta localizada\ndiretamente no texto.\nVersão B: texto de 10 linhas, perguntas de interpretação.\nVersão C: texto de 15 linhas, perguntas de inferência e opinião.\n\nDepois, gere duas adaptações de FORMA da versão B:\n- Para dislexia: frases de até 10 palavras, ordem direta, sem\n fonemas parecidos, negrito nos nomes, espaçamento duplo.\n- Para TEA: linguagem 100% literal, sem metáforas, instruções\n numeradas passo a passo, checklist final.\n\nMantenha o MESMO tema e a mesma aparência visual em todas.",
  },
  {
    id: "caso4",
    titulo: "O parecer que não pode vazar",
    tempo: "12 min · em duplas",
    cena: "Você precisa escrever um relatório sobre uma aluna do 5º ano para encaminhamento ao serviço de apoio. As informações que você tem: nome completo, a escola, a turma, o laudo médico com CID, o fato de que ela faltou 15 dias por questões de saúde mental, e o nome da mãe, que pediu sigilo. Você quer usar a IA para redigir — mas todo esse conteúdo é sensível.",
    pergunta: "Em dupla: reescrevam o pedido de forma que a IA ajude sem receber um único dado identificável.",
    solucao: "O erro grave: colar a ficha inteira e pedir \"escreva o relatório\". Isso é compartilhamento de dado sensível de menor — violação de LGPD, e a informação pode ficar armazenada no servidor da empresa.\n\n O que fazer: a IA não precisa saber quem é para escrever bem.\n\n Aja como psicopedagoga. Escreva um relatório pedagógico de 3\nparágrafos para encaminhamento ao serviço de apoio.\n\nPerfil (fictício): estudante do 5º ano, com ausências frequentes no\nbimestre por questões de saúde, que mantém bom vínculo afetivo com\na turma e demonstra interesse quando presente. Apresenta defasagem\nem leitura decorrente das faltas.\n\nTom: técnico, respeitoso, focado em potencialidades e nas\nprovidências pedagógicas necessárias. Sem juízo de valor sobre a\nfamília.\n Depois: você recebe o texto pronto e insere os dados reais no seu documento, offline. A IA nunca viu o nome, a escola nem o CID.\n\n O teste de segurança: \"se este texto vazasse publicamente amanhã, alguém identificaria minha aluna?\" Se a resposta for sim, anonimize mais.",
    promptExemplo: "Aja como psicopedagoga. Escreva um relatório pedagógico de 3\nparágrafos para encaminhamento ao serviço de apoio.\n\nPerfil (fictício): estudante do 5º ano, com ausências frequentes no\nbimestre por questões de saúde, que mantém bom vínculo afetivo com\na turma e demonstra interesse quando presente. Apresenta defasagem\nem leitura decorrente das faltas.\n\nTom: técnico, respeitoso, focado em potencialidades e nas\nprovidências pedagógicas necessárias. Sem juízo de valor sobre a\nfamília.",
  },
  {
    id: "caso5",
    titulo: "A colega que não quer nem ouvir falar",
    tempo: "8 min · em duplas",
    cena: "Na sala dos professores, uma colega com 22 anos de magistério ouve você falar de IA e responde: \"Isso aí é moda. E ainda vai tirar o emprego da gente. Prefiro fazer do meu jeito, que sempre funcionou.\" Ela é respeitada pela equipe e a opinião dela pesa. Você não quer discutir — quer que ela experimente.",
    pergunta: "Em dupla: o que vocês responderiam? E qual seria a primeira tarefa que dariam a ela?",
    solucao: "O erro comum: tentar convencer com argumento técnico (\"é o futuro\", \"todo mundo já usa\"). Isso reforça a resistência, porque soa como se a experiência dela valesse menos.\n\n O que funciona: não defender a ferramenta — atacar uma dor concreta que ela tem. E escolher a tarefa mais chata da rotina dela, não a mais impressionante da IA.\n\n Uma resposta possível: \"Você tem razão que ela não substitui ninguém — quem conhece os alunos é você. Mas me diz uma coisa: quanto tempo você gasta escrevendo os pareceres no fim do bimestre? Me deixa te mostrar uma coisa de 5 minutos.\"\n\n A primeira tarefa ideal é sempre a mesma: parecer descritivo ou comunicado para família. São dolorosas, repetitivas, e o resultado é bom o suficiente para impressionar sem parecer mágica. Nunca comece mostrando geração de imagem ou slide bonito — isso confirma a suspeita de que é \"moda\".",
    promptExemplo: "",
  },
  {
    id: "caso6",
    titulo: "O plano que a coordenação devolveu",
    tempo: "10 min · em duplas",
    cena: "Você entregou um plano de aula feito com IA e a coordenadora devolveu com um bilhete: \"Está bonito, mas genérico. Não vejo a nossa realidade aqui, e a habilidade da BNCC citada não bate com o conteúdo. Refaça.\" Você tem até amanhã para reapresentar. E ela está certa — você não revisou o que a IA gerou.",
    pergunta: "Em dupla: o que deu errado no processo? Listem três falhas e como evitá-las.",
    solucao: "1. Faltou Contexto no prompt. \"Genérico\" quase sempre significa que o C do P.T.C.F. ficou vazio. Sem a escola, a turma, os recursos e as dificuldades reais, a IA entrega o denominador comum de todas as escolas do mundo.\n\n 2. O código da BNCC não foi conferido. A IA erra códigos com frequência e com confiança. Nunca entregue um plano com código não verificado — use o NotebookLM com o PDF oficial, ou confira no site do MEC.\n\n 3. Faltou a revisão humana. A IA entrega um rascunho, não um produto final. O trabalho do professor não desapareceu — ele mudou de \"escrever do zero\" para \"revisar com olhar crítico\", o que leva 10 minutos em vez de 2 horas.\n\n A regra que evita tudo isso: nada sai das suas mãos sem que você tenha lido linha por linha e perguntado: \"isto funciona com a minha turma, na minha escola?\"",
    promptExemplo: "",
  },
  {
    id: "caso7",
    titulo: "O aluno que chegou no meio do ano",
    tempo: "10 min · em duplas",
    cena: "Chega um aluno novo no 4º ano, transferido em agosto. Na primeira semana você percebe: ele não lê fluentemente, tem vergonha de ler em voz alta e já começou a se isolar no recreio. A turma toda está trabalhando produção de texto. Você tem uma aula por dia com eles e nenhum apoio de reforço disponível na escola.",
    pergunta: "Em dupla: qual é o plano para as duas primeiras semanas dele? O que a IA ajuda a preparar?",
    solucao: "O erro comum: dar a ele uma atividade visivelmente diferente e mais fácil. Isso resolve o acadêmico e agrava o social — que, neste caso, é o problema mais urgente.\n\n Prioridade 1 — pertencimento. Ele participa da mesma produção de texto da turma, na Versão A (texto curto, apoio visual, perguntas com resposta localizada). Mesmo tema, mesma conversa, folha parecida.\n\n Prioridade 2 — fluência sem exposição. Peça à IA textos curtíssimos de 5 a 8 linhas, vocabulário repetitivo, temas que ele goste. Leitura em voz alta só para você, ou em dupla com um colega acolhedor — nunca para a turma inteira, até ele ganhar confiança.\n\n Crie 5 textos curtíssimos (5 a 8 linhas) para treinar fluência\nleitora de um aluno fictício de 9 anos que lê com dificuldade e tem\nvergonha de ler em voz alta.\n- Vocabulário simples e repetitivo\n- Temas divertidos (animais, futebol, super-heróis)\n- Frases curtas, uma ideia por frase\n- Para cada texto: 2 perguntas com resposta localizada no texto\n- Tom que não infantilize: ele tem 9 anos, não 5\n Discussão: quanto tempo levaria montar isso à mão? E por que o pedido diz explicitamente \"não infantilize\"?",
    promptExemplo: "Crie 5 textos curtíssimos (5 a 8 linhas) para treinar fluência\nleitora de um aluno fictício de 9 anos que lê com dificuldade e tem\nvergonha de ler em voz alta.\n- Vocabulário simples e repetitivo\n- Temas divertidos (animais, futebol, super-heróis)\n- Frases curtas, uma ideia por frase\n- Para cada texto: 2 perguntas com resposta localizada no texto\n- Tom que não infantilize: ele tem 9 anos, não 5",
  },
  {
    id: "caso8",
    titulo: "A redação boa demais",
    tempo: "10 min · em duplas",
    cena: "Um aluno do 9º ano entrega uma redação muito acima do que ele costuma produzir: vocabulário sofisticado, argumentação impecável, zero erros. Você suspeita que foi feita por IA — mas não tem prova. Ele é um aluno quieto, que nunca deu problema. Você joga o texto num detector online e ele acusa \"92% gerado por IA\".",
    pergunta: "Em dupla: o que vocês fazem? E o que não fazem?",
    solucao: "❌ Jamais: acusar com base no detector. Eles erram muito, e erram especialmente contra alunos que escrevem de forma organizada, alunos neurodivergentes e quem aprendeu redação por estrutura. Uma acusação falsa destrói a confiança do aluno e a sua autoridade — e você não tem como provar nada.\n\n ❌ Jamais: zerar o trabalho sem conversar.\n\n ✅ O que fazer — a conversa curiosa, não acusatória: chame-o e peça que ele explique o texto. \"Gostei muito deste argumento aqui. Como você chegou nele? Me conta o que você leu.\" Quem escreveu, sabe defender. Quem colou, trava — e o problema se resolve sozinho, sem acusação.\n\n ✅ E depois: mude o formato da próxima tarefa. Se ele usou IA, o problema não é ele — é a tarefa, que podia ser feita por máquina. Peça defesa oral, relação com a vida dele, entrevista com alguém da família.\n\n Uma possibilidade que quase ninguém considera: ele pode ter escrito mesmo. Alunos quietos às vezes surpreendem. Se for o caso e você tiver acusado, o dano é grave e difícil de reparar.",
    promptExemplo: "",
  },
] as const;

/** Os 4 caça ao erro: resposta da IA com erro plantado + gabarito. */
export const CACAS = [
  {
    id: "caca1",
    titulo: "A IA citou uma fonte",
    tempo: "4 min",
    instrucao: "🔍 Você tem 2 minutos: qual desses três itens é suspeito? Como você confirmaria?",
    respostaIA: "\"Recomendo três obras fundamentais sobre alfabetização:\n\n 1. Psicogênese da Língua Escrita, de Emília Ferreiro e Ana Teberosky (1985)\n\n 2. A Importância do Ato de Ler, de Paulo Freire (1981)\n\n 3. Alfabetização em Classes Populares Brasileiras, de Marta Vasconcelos, Editora Pedagógica Nacional (1994), página 87, que demonstra que 87% das crianças alfabetizadas com método fônico apresentam melhor desempenho.\"",
    gabarito: "Os itens 1 e 2 são reais e muito conhecidos na área.\n\n O item 3 é inventado. O livro, a autora, a editora, a página e a estatística não existem — mas repare como o formato é convincente: nome plausível, ano coerente, página específica e um número exato. É exatamente assim que a alucinação engana.\n\n Sinais de alerta: quanto mais específico o dado (página exata, percentual quebrado), mais desconfiança ele merece. Como confirmar: buscar o título entre aspas no Google. Se um livro real não aparece em nenhuma livraria ou biblioteca, ele não existe.",
  },
  {
    id: "caca2",
    titulo: "O código da BNCC",
    tempo: "5 min",
    instrucao: "🔍 Dois minutos: um desses códigos não pode existir. Qual? Por quê?",
    respostaIA: "\"Este plano contempla a habilidade EF07CI09 da BNCC, que trata da compreensão dos sistemas do corpo humano.\n\n Também dialoga com a habilidade EF07BI14 (Biologia, 7º ano), que aborda a fisiologia comparada dos sistemas circulatório e respiratório.\"",
    gabarito: "O segundo código é impossível — e dá para saber sem consultar nada.\n\n No Ensino Fundamental não existe o componente \"Biologia\". Biologia só aparece no Ensino Médio. No Fundamental, o componente é Ciências (CI). Portanto EF07BI14 não pode existir: a sigla BI não é válida nessa etapa.\n\n A lição: você não precisa decorar a BNCC para pegar erros — basta conhecer a lógica do código (etapa + ano + componente + número). E, na dúvida, o NotebookLM com o PDF oficial responde citando a página.",
  },
  {
    id: "caca3",
    titulo: "A adaptação que não adapta",
    tempo: "4 min",
    instrucao: "🔍 Dois minutos: por que esta adaptação falha para um aluno com TEA?",
    respostaIA: "\"Atividade: Viajando pelo mundo das frações\n\n 1. Solte a imaginação e mergulhe no universo dos números!\n\n 2. Divida a pizza como quem divide alegria entre amigos.\n\n 3. Agora você vai brilhar: pinte as partes que representam 1/4.\n\n 4. Capriche e deixe sua criatividade voar alto!\"",
    gabarito: "A IA formatou como lista numerada, mas não adaptou a linguagem — que é justamente o que mais importa no TEA.\n\n Estão lá: \"solte a imaginação\", \"mergulhe no universo\", \"dividir alegria\", \"você vai brilhar\", \"criatividade voar alto\". Cinco metáforas em quatro linhas. Um aluno que interpreta literalmente pode travar tentando entender como se mergulha em números ou como a criatividade voa.\n\n A lição: a IA obedece à forma que você pediu (numerar) e ignora o princípio se você não o explicitar. Peça sempre: \"linguagem 100% literal, sem metáforas, sem linguagem figurada\" — e depois confira. Você conhece o aluno; a IA não.",
  },
  {
    id: "caca4",
    titulo: "O gabarito está certo?",
    tempo: "8 min",
    instrucao: "🔍 Façam a conta. O gabarito está correto? Se não, qual é a resposta certa?",
    respostaIA: "Questão: Uma camiseta custava R$ 80,00 e teve desconto de 25%. Depois, sobre o novo preço, houve um acréscimo de 25%. Qual o preço final?\n\n a) R$ 80,00    b) R$ 75,00    c) R$ 85,00    d) R$ 70,00\n\n Gabarito da IA: alternativa (a) R$ 80,00. \"Como o desconto e o acréscimo são ambos de 25%, eles se anulam e o preço volta ao valor original.\"",
    gabarito: "O gabarito da IA está errado — e o erro é conceitual, não de conta.\n\n A conta correta: 80 − 25% = 60. Depois, 60 + 25% de 60 = 60 + 15 = R$ 75,00. A resposta certa é a alternativa (b).\n\n O erro da IA é o mesmo que os alunos cometem: achar que percentuais iguais se anulam. Mas o desconto incide sobre 80 e o acréscimo sobre 60 — bases diferentes.\n\n A lição — e ela é grande: se você tivesse aplicado essa prova sem conferir, teria corrigido como erro a resposta certa dos alunos. Sempre refaça as contas do gabarito. A IA erra com a mesma confiança com que acerta.",
  },
] as const;

/** Os 4 testes no celular: o cursista faz agora, sem laboratório. */
export const TESTES_CELULAR = [
  {
    id: "cel1",
    cabecalho: "📱 NO CELULAR",
    titulo: "Sua primeira conversa com a IA",
    passos: [
      "Pegue seu celular e abra o navegador (Chrome, Safari).",
      "Digite: gemini.google.com",
      "Entre com a sua conta do Google — a mesma do Gmail.",
      "Na caixa de texto embaixo, digite exatamente:",
      "\"Me dê 3 ideias criativas para ensinar [seu conteúdo] para alunos do [seu ano], usando materiais que custem menos de 10 reais.\"",
      "Leia a resposta. Levante a mão quando terminar.",
      "Agora digite: \"Detalhe melhor a ideia 2, com passo a passo.\"",
      "Por que no celular? Porque é o aparelho que você tem sempre. Se funciona aqui, funciona na sala dos professores, na fila do banco e no sofá de casa.",
    ],
  },
  {
    id: "cel2",
    cabecalho: "📱 NO CELULAR",
    titulo: "Conversando com a BNCC",
    passos: [
      "No celular, acesse notebooklm.google.com e entre com sua conta Google.",
      "Toque em \"Criar novo\" e dê o nome da sua disciplina.",
      "Toque em \"Adicionar fontes\" e envie o PDF da BNCC (o formador vai compartilhar o arquivo ou o link).",
      "Espere alguns segundos enquanto ele lê o documento.",
      "Pergunte: \"Quais habilidades de [minha disciplina] do [meu ano] tratam de [tema que vou dar]? Liste código e descrição.\"",
      "Toque na citação numerada que aparece na resposta — ele abre a página exata do documento.",
      "Confira: a informação está mesmo lá? Essa é a diferença entre palpite e consulta.",
    ],
  },
  {
    id: "cel3",
    cabecalho: "📱 NO CELULAR",
    titulo: "Adapte um enunciado seu agora",
    passos: [
      "Pense em um enunciado real que você usou recentemente e que tem linguagem figurada (\"dê asas à imaginação\", \"mergulhe no tema\", \"viaje pela história\").",
      "No celular, abra a IA e digite:",
      "\"Reescreva este enunciado para um estudante autista do [ano]. Remova todas as metáforas. Seja 100% literal, concreto e sequencial. Diga exatamente o que ele deve fazer, passo a passo, em no máximo 3 linhas.\"",
      "Cole o seu enunciado e envie.",
      "Compare as duas versões. Leia a nova em voz alta para o colega ao lado.",
      "Pergunte ao colega: \"ficou claro sem precisar interpretar nada?\"",
    ],
  },
  {
    id: "cel4",
    cabecalho: "📱 NO CELULAR",
    titulo: "A rubrica do seu próximo trabalho",
    passos: [
      "Pense num trabalho, seminário ou projeto que você vai avaliar em breve.",
      "No celular, digite:",
      "\"Crie uma rubrica de avaliação para [tipo de trabalho] do [ano]. Critérios: [liste 3 ou 4]. Níveis: Precisa Melhorar, Bom, Excelente. Para cada célula, descreva exatamente o que o aluno fez para merecer aquele nível — em linguagem que o próprio aluno entenda.\"",
      "Leia a rubrica gerada.",
      "O teste decisivo: mostre para o colega ao lado e pergunte — \"se você fosse aluno, saberia o que fazer para tirar a nota máxima?\"",
      "Se a resposta for não, peça à IA: \"deixe os critérios mais concretos e observáveis\".",
    ],
  },
] as const;

/** Os 4 desafios cronometrados. */
export const DESAFIOS = [
  {
    id: "des1",
    cabecalho: "⏱ 5:00",
    titulo: "Desafio: um plano de aula em 5 minutos",
    passos: [
      "O cronômetro vai para a tela. Em 5 minutos, você precisa sair com um plano de aula completo de um conteúdo que você realmente dará nesta semana.",
      "Escolha o conteúdo e o ano (30 segundos)",
      "Escreva o prompt com as 4 letras do P.T.C.F. (2 minutos)",
      "Envie e leia o resultado (1 minuto)",
      "Peça um refinamento (1 minuto)",
      "Salve ou tire print (30 segundos)",
      "Quem terminar, levante a mão. Vamos ouvir dois ou três resultados.",
    ],
  },
  {
    id: "des2",
    cabecalho: "⏱ 4:00",
    titulo: "Desafio: a ata que ninguém quer escrever",
    passos: [
      "Todo mundo foge de ser o secretário da reunião. Em 4 minutos, transforme estes tópicos soltos em uma ata formal pronta para assinatura:",
      "Copie os tópicos abaixo e peça a formatação oficial à IA",
      "Leia o resultado e ajuste um detalhe",
      "Reunião de conselho de classe, 8º ano A, 14/04/2026, 14h às 16h.",
      "Presentes: equipe gestora e professores da turma.",
      "Pauta: rendimento em Português e Matemática; casos de infrequência.",
      "Decisões: grupo de estudos no contraturno para 5 alunos com",
      "defasagem; 2 casos de infrequência encaminhados ao Conselho Tutelar;",
      "elogio formal à turma pela evolução no respeito.",
    ],
  },
  {
    id: "des3",
    cabecalho: "⏱ 6:00",
    titulo: "Desafio: a mesma atividade em 3 níveis",
    passos: [
      "Em 6 minutos, produza a mesma atividade em três níveis para a sua turma real:",
      "Escolha um conteúdo que você dará nas próximas duas semanas",
      "Peça as três versões (A, B e C) do mesmo tema",
      "Leia rapidamente e verifique: as três parecem visualmente semelhantes?",
      "Peça um ajuste no nível que ficou fora do alvo",
      "Ao final: quem conseguiu, levante a mão. Vamos ouvir uma turma que ficou boa e uma que precisou de ajuste.",
    ],
  },
  {
    id: "des4",
    cabecalho: "⏱ 6:00",
    titulo: "Desafio: prova completa com gabarito",
    passos: [
      "Em 6 minutos, gere uma avaliação pronta sobre um conteúdo que você vai avaliar neste bimestre:",
      "5 questões de múltipla escolha + 2 dissertativas",
      "Exija: situações do cotidiano, nada de decorar definição",
      "Peça: gabarito comentado explicando por que cada alternativa errada está errada",
      "Leia as questões com olhar crítico: alguma está ambígua? Fora do nível da turma?",
      "Ao final, responda em voz alta: quanto tempo você levaria para montar isso sozinho?",
    ],
  },
] as const;

/** Os 4 aquecimentos relâmpago que abrem cada encontro. */
export const AQUECIMENTOS = [
  {
    id: "aq1",
    cabecalho: "🔥 Aquecimento Relâmpago · 2 minutos",
    titulo: "Levante a mão quem já levou trabalho da escola para o fim de semana no último mês.",
    passos: [
      "Agora, mantenha a mão levantada quem fez isso mais de duas vezes.",
      "Olhe em volta. Você não está sozinho — e é exatamente isso que vamos atacar hoje.",
    ],
  },
  {
    id: "aq2",
    cabecalho: "🔥 Aquecimento Relâmpago · 3 minutos",
    titulo: "Pergunta rápida, resposta em voz alta: quanto tempo você levou para escrever o seu último parecer descritivo? E quantos você precisa escrever por bimestre?",
    passos: [
      "Multiplique um pelo outro. Esse número é o que vamos atacar agora.",
    ],
  },
  {
    id: "aq3",
    cabecalho: "🔥 Aquecimento Relâmpago · 3 minutos",
    titulo: "Levante a mão quem tem, neste momento, pelo menos um aluno com laudo na sala.",
    passos: [
      "Mantenha levantada quem já recebeu da escola o material adaptado pronto para esse aluno.",
      "A diferença entre as duas mãos levantadas é o assunto de hoje.",
    ],
  },
  {
    id: "aq4",
    cabecalho: "🔥 Aquecimento Relâmpago · 3 minutos",
    titulo: "Duas perguntas, mão levantada:",
    passos: [
      "1. Quem já corrigiu prova num domingo à noite?",
      "2. Quem já suspeitou que um trabalho entregue foi feito por IA — e não soube o que fazer?",
      "As duas coisas se resolvem hoje.",
    ],
  },
] as const;

