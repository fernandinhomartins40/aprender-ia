import { TipoLicao } from "@prisma/client";
import type { Modulo } from "./tipos";

/**
 * Os módulos que faltavam para cobrir as 12 fases do curso.
 *
 * O primeiro corte cobria dez fases. Faltavam três coisas, e a auditoria
 * contra o briefing as apontou uma a uma:
 *
 * - **ChatGPT na prática (Fase 4)**: existia um módulo genérico sobre
 *   delegar, sem os recursos atuais nem o ChatGPT Work.
 * - **Analisar dados do negócio (Fase 9)**: estava misturado com
 *   planilhas. Vendas, estoque, clientes e financeiro pedem um módulo
 *   próprio, porque a pergunta muda em cada um.
 * - **Escolher entre as IAs (Fase 12)**: não existia. Sem ele o curso
 *   ensina três ferramentas e deixa o cursista sem critério para
 *   escolher entre elas.
 *
 * As ordens abrem espaço na sequência existente: os módulos de 4 a 11 do
 * arquivo original foram renumerados no `MODULOS_EMPREENDEDORES` final.
 */

/* ============================================================
   ChatGPT na prática — Fase 4
   ============================================================ */

export const MODULO_CHATGPT: Modulo = {
  ordem: 100, // reposicionado ao montar a lista final
  titulo: "ChatGPT além da conversa",
  subtitulo: "Os recursos que quase ninguém usa, e que resolvem trabalho de verdade",
  cor: "#10A37F",
  icone: "prompts",
  licoes: [
    {
      titulo: "O que você ainda não experimentou no ChatGPT",
      tipo: TipoLicao.AQUECIMENTO,
      xp: 10,
      tempo: 3,
      cap: "Cap. 4",
      conteudo: {
        pergunta:
          "Quando você abre o ChatGPT, o que costuma fazer? Escreve uma pergunta, lê a resposta e fecha?",
        fechamento:
          "A maioria das pessoas usa 5% do que a ferramenta faz — e é justamente o pedaço que menos economiza tempo. Os outros 95% não são recursos escondidos: são maneiras diferentes de pedir.",
        tempo: "Um minuto",
      },
    },
    {
      titulo: "Anexar arquivo: pare de copiar e colar",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 10,
      cap: "Cap. 4.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Quase todo mundo começa copiando e colando texto na conversa. Funciona para um parágrafo. Para um contrato de 20 páginas, uma planilha de vendas ou uma nota fiscal, não funciona — e nem precisa.",
          },
          {
            tipo: "texto",
            texto:
              "O botão de anexo aceita PDF, imagem, planilha e documento. Você envia o arquivo e faz a pergunta sobre ele. A IA lê o que está lá dentro, inclusive tabelas e texto de imagem.",
          },
          {
            tipo: "destaque",
            titulo: "O que muda na prática",
            texto:
              "Uma dona de restaurante fotografa a nota do fornecedor e pergunta 'quais itens subiram de preço em relação à nota anterior?'. Envia as duas fotos, recebe a comparação. Sem digitar nada.",
          },
          {
            tipo: "lista",
            titulo: "Usos que resolvem hoje",
            itens: [
              "Foto do cardápio do concorrente → comparar com o seu",
              "PDF do contrato → 'quais são minhas obrigações?'",
              "Planilha de vendas → 'o que mudou no último trimestre?'",
              "Foto de um documento manuscrito → transformar em texto digitado",
              "Print de uma conversa → 'me ajude a responder isso'",
            ],
          },
          {
            tipo: "lista",
            titulo: "O que ainda falha",
            itens: [
              "Foto tremida ou com sombra forte — a leitura erra números",
              "Planilha com várias abas sem explicação do que é cada uma",
              "PDF que é só imagem escaneada de baixa qualidade",
              "Documento com tabela complexa de várias páginas",
            ],
          },
          {
            tipo: "atencao",
            titulo: "Antes de anexar",
            texto:
              "O arquivo inteiro vai para o servidor da empresa — não só a parte que interessa. Uma nota fiscal tem CNPJ, endereço e às vezes CPF. Uma planilha de clientes tem nome e telefone. Apague ou tampe antes, ou mande só o trecho que importa.",
          },
          {
            tipo: "destaque",
            titulo: "A pergunta certa muda tudo",
            texto:
              "Não peça 'analise esta planilha'. Peça 'nesta planilha, a coluna D é o valor da venda e a E é o custo. Quais produtos têm margem abaixo de 20%?'. Explicar as colunas leva 20 segundos e é o que mais melhora a resposta.",
          },
          {
            tipo: "dica",
            titulo: "Faixa de acesso",
            texto:
              "Anexar arquivo funciona no plano gratuito, com cota diária. Quem usa muito esbarra no limite e espera algumas horas — ou passa para o Go, a US$ 8 por mês, que multiplica a cota por 10.",
          },
        ],
      },
    },
    {
      titulo: "Delegar um trabalho inteiro, não só pedir um texto",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 11,
      cap: "Cap. 4.2",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Existe uma diferença grande entre perguntar a um funcionário 'como se escreve uma proposta?' e dizer 'monte a proposta deste cliente, com base nestes arquivos, e me mostre antes de enviar'.",
          },
          {
            tipo: "texto",
            texto:
              "A primeira é uma pergunta. A segunda é um trabalho: tem material, tem etapas, tem um ponto em que você confere. Com a IA é igual — e é nessa segunda forma que está o ganho de tempo real.",
          },
          {
            tipo: "destaque",
            titulo: "O nome que as ferramentas usam",
            texto:
              "Chamam de trabalho agêntico ou modo de trabalho: a IA executa várias etapas seguidas, abrindo arquivos e organizando resultados, em vez de só responder. No ChatGPT isso aparece como ChatGPT Work e nos recursos de projeto; no Claude, o que já foi chamado de Cowork e hoje está no próprio Claude.",
          },
          {
            tipo: "lista",
            titulo: "Um pedido de trabalho tem quatro partes",
            itens: [
              "O material: os arquivos, as conversas, os dados — sem dado pessoal",
              "O resultado: o que precisa existir no fim, e em que formato",
              "Os limites: o que ela não pode inventar, decidir ou prometer",
              "A parada: 'me mostre antes de finalizar'",
            ],
          },
          {
            tipo: "texto",
            texto:
              "Repare que três das quatro partes não falam do que fazer — falam do que entregar, do que não fazer e de quando parar. É aí que quase todo mundo erra: descreve a tarefa e esquece o resto.",
          },
          {
            tipo: "destaque",
            titulo: "Um exemplo que acontece toda semana",
            texto:
              "Um contador recebe 30 documentos de clientes por mês, em formatos diferentes. Em vez de organizar na mão, ele entrega os arquivos e pede: agrupe por cliente (por código, nunca por nome), depois por tipo, depois por data; me diga o que está faltando em cada um comparando com os outros; não descarte nada; me mostre a organização antes de aplicar.",
          },
          {
            tipo: "dica",
            titulo: "Comece pequeno",
            texto:
              "O primeiro trabalho delegado deve ser algo que você faria em uma hora, não em um dia. Você precisa conseguir conferir o resultado inteiro para aprender onde ela erra — e todo modelo erra em algum lugar previsível do seu tipo de trabalho.",
          },
          {
            tipo: "atencao",
            titulo: "Quanto maior o trabalho, mais importante a revisão",
            texto:
              "Numa resposta curta você percebe o erro lendo. Num relatório de dez páginas montado sozinho, o erro se esconde no meio — e sai com o seu nome. Delegar não transfere a responsabilidade.",
          },
        ],
      },
    },
    {
      titulo: "Memória e instruções: ensinar a IA a trabalhar do seu jeito",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 9,
      cap: "Cap. 4.3",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Se você repete o mesmo contexto em toda conversa — 'sou dona de uma loja de roupas femininas, minhas clientes têm entre 35 e 55 anos' —, está gastando tempo com algo que a ferramenta pode guardar.",
          },
          {
            tipo: "destaque",
            titulo: "Instruções personalizadas",
            texto:
              "Nas configurações do ChatGPT há um campo para dizer quem você é e como quer as respostas. O que você escrever ali vale para todas as conversas, sem precisar repetir.",
          },
          {
            tipo: "lista",
            titulo: "O que vale escrever lá",
            itens: [
              "Seu negócio, seu público e sua região",
              "O tom que você usa com cliente — formal, direto, próximo",
              "O que você nunca promete (desconto, prazo curto, exclusividade)",
              "O formato que prefere: mensagens curtas, listas, sem emoji",
              "Que ela deve escrever [CONFIRMAR] em vez de inventar dado",
            ],
          },
          {
            tipo: "texto",
            texto:
              "A memória é diferente: ela guarda coisas que aparecem nas conversas, automaticamente. Útil, e vale conferir de vez em quando — ela pode ter guardado algo de um teste que você fez e não vale mais.",
          },
          {
            tipo: "atencao",
            titulo: "Não escreva dado de cliente nas instruções",
            texto:
              "As instruções valem para sempre e entram em toda conversa. Nome, telefone ou informação de cliente ali dentro é dado exposto em todo pedido que você fizer, para sempre.",
          },
          {
            tipo: "dica",
            titulo: "Teste depois de configurar",
            texto:
              "Faça um pedido curto e veja se o tom mudou. Se não mudou, sua instrução está vaga demais — troque 'seja profissional' por 'escreva como quem já conhece o cliente, sem formalidade de carta'.",
          },
        ],
      },
    },
    {
      titulo: "Duelo: pedir uma resposta × entregar um trabalho",
      tipo: TipoLicao.DUELO,
      xp: 25,
      tempo: 10,
      cap: "Cap. 4.2",
      conteudo: {
        situacao:
          "Uma prestadora de serviços precisa transformar três semanas de anotações soltas em um relatório para o cliente.",
        ruim: {
          titulo: "Pedido de resposta",
          prompt: "Me ajude a escrever um relatório para o meu cliente.",
          resultado:
            "Um modelo genérico de relatório, com títulos como 'Introdução' e 'Considerações finais', que ela ainda vai ter que preencher inteiro na mão. Economizou a formatação e nada mais.",
        },
        bom: {
          titulo: "Pedido de trabalho",
          prompt:
            "Contexto: sou consultora de processos e prestei serviço para um cliente durante três semanas. Anexei minhas anotações diárias, sem nome de funcionário.\nObjetivo: transformar isso num relatório de entrega que o cliente leia e entenda o que foi feito.\nFormato: o que foi diagnosticado, o que foi implantado, o que ficou pendente e a recomendação de próximo passo. Máximo de 3 páginas.\nRestrições: use apenas o que está nas anotações; não invente resultado nem número. Onde a anotação estiver vaga, marque [CONFIRMAR] em vez de completar.\nPare e me mostre a estrutura antes de escrever o texto final.",
          resultado:
            "A estrutura vem primeiro, ela corrige o que estiver fora, e só então o texto — já com o conteúdo real das anotações e os pontos duvidosos marcados para ela conferir.",
        },
        pergunta:
          "Pegue um trabalho que você faria em uma hora juntando informação de vários lugares. Escreva o pedido com as quatro partes: material, resultado, limites e parada.",
        fechamento:
          "Repare que o pedido bom é mais longo — e ainda assim economiza muito mais tempo. Os dois minutos escrevendo evitam quarenta minutos refazendo.",
      },
    },
    {
      titulo: "Laboratório: delegue um trabalho de verdade",
      tipo: TipoLicao.LABORATORIO,
      xp: 35,
      tempo: 25,
      cap: "Cap. 4.3",
      conteudo: {
        titulo: "Uma hora de trabalho, entregue",
        contexto:
          "Escolha algo que você faria em cerca de uma hora, juntando informação de lugares diferentes: um relatório do mês, a comparação de três orçamentos, a organização de uma pasta bagunçada.",
        passos: [
          "Reúna o material — arquivos, anotações, conversas — e tire nome, telefone e documento de qualquer pessoa.",
          "Escreva o pedido com as quatro partes: material, resultado, limites e parada.",
          "Envie e acompanhe. Quando ela mostrar a estrutura, corrija antes de deixar seguir.",
          "Confira o resultado inteiro, não por amostragem.",
          "Anote o que você precisou corrigir — é isso que entra no próximo pedido.",
        ],
        promptSugerido: {
          titulo: "Estrutura do pedido de trabalho",
          corpo:
            "Contexto: meu negócio é [NEGOCIO]. Anexei [MATERIAL], já sem dado pessoal.\nObjetivo: [O_QUE_PRECISO_NO_FIM].\nFormato: [COMO_DEVE_CHEGAR].\nRestrições: use somente o material anexado; não invente número, prazo ou nome; onde faltar informação, escreva [CONFIRMAR].\nPare e me mostre [O_PONTO_DE_PARADA] antes de finalizar.",
          variaveis: [
            { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "consultoria de processos" },
            { chave: "MATERIAL", rotulo: "O que você anexou", exemplo: "minhas anotações de três semanas" },
            { chave: "O_QUE_PRECISO_NO_FIM", rotulo: "O resultado", exemplo: "um relatório de entrega" },
            { chave: "COMO_DEVE_CHEGAR", rotulo: "Formato", exemplo: "no máximo 3 páginas, com pendências marcadas" },
            { chave: "O_PONTO_DE_PARADA", rotulo: "Onde parar", exemplo: "a estrutura, antes do texto final" },
          ],
        },
        campos: [
          {
            chave: "trabalho",
            rotulo: "Que trabalho você delegou?",
            curto: true,
            exemplo: "Comparar três orçamentos de fornecedor",
          },
          {
            chave: "correcoes",
            rotulo: "O que você precisou corrigir",
            ajuda: "Esta é a parte mais valiosa: mostra o que incluir no pedido da próxima vez.",
          },
          {
            chave: "tempo",
            rotulo: "Quanto tempo levou, contra quanto levaria na mão",
            curto: true,
            exemplo: "15 min contra 1 hora",
          },
        ],
        criterios: [
          "O pedido tinha material, resultado, limites e parada",
          "Você conferiu o resultado inteiro",
          "Nenhum dado pessoal foi enviado",
          "Você anotou o que corrigir no próximo pedido",
        ],
        entrega: "Um trabalho pronto e uma lição sobre como pedir melhor.",
      },
    },
    {
      titulo: "Caça ao erro: o relatório que inventou os números",
      tipo: TipoLicao.CACA_ERRO,
      xp: 25,
      tempo: 10,
      cap: "Cap. 4.3",
      conteudo: {
        contexto:
          "Uma consultora anexou as anotações e pediu o relatório. Veio isto, que parece profissional. Há três problemas.",
        texto:
          "Relatório de entrega — Consultoria de processos\n\nDiagnóstico: identificamos gargalos no fluxo de atendimento, com tempo médio de resposta de 4h12min.\n\nResultados: após a implantação, o tempo de resposta caiu 63%, gerando uma economia estimada de R$ 4.800 por mês em horas de trabalho.\n\nRecomendação: sugerimos a contratação de um analista dedicado, com retorno previsto em 5 meses.",
        erros: [
          {
            trecho: "tempo médio de resposta de 4h12min",
            porque:
              "Número com precisão de minutos. As anotações diziam 'demora muito para responder' — a IA transformou uma impressão num dado medido.",
          },
            {
            trecho: "caiu 63%, gerando uma economia estimada de R$ 4.800 por mês",
            porque:
              "Dois números inventados que se sustentam um no outro. Se o cliente perguntar como foi medido, não há resposta — e o relatório perde a credibilidade inteira.",
          },
          {
            trecho: "sugerimos a contratação de um analista dedicado, com retorno previsto em 5 meses",
            porque:
              "Recomendação de contratação com prazo de retorno. Isso é decisão do cliente e cálculo que ninguém fez; relatório de entrega descreve o que foi feito, não decide o futuro da empresa alheia.",
          },
        ],
        licao:
          "Repare no padrão: todo número foi inventado, e os três são plausíveis. A restrição que evitaria isso cabe numa linha — 'use apenas o que está nas anotações; onde faltar dado, escreva [CONFIRMAR]'.",
      },
    },
    {
      titulo: "No celular: anexe um documento e pergunte",
      tipo: TipoLicao.NO_CELULAR,
      xp: 20,
      tempo: 10,
      cap: "Cap. 4.1",
      conteudo: {
        titulo: "Dez minutos e um papel que está na sua mesa",
        tempo: "10 minutos, com o celular",
        passos: [
          "Pegue um documento físico do seu negócio — nota, contrato, manual.",
          "Tampe com o dedo ou apague nome, CPF e telefone que apareçam.",
          "Fotografe com boa luz, sem sombra sobre o texto.",
          "No ChatGPT, anexe a foto e pergunte algo cuja resposta você já sabe.",
          "Confira se acertou. Depois pergunte algo que você nunca parou para conferir nesse documento.",
        ],
        porque:
          "Testar primeiro com algo que você já sabe é o que revela se dá para confiar na leitura. Foto ruim erra número, e número errado num contrato é caro.",
      },
    },
    {
      titulo: "Checkpoint: o que você passou a fazer diferente",
      tipo: TipoLicao.CHECKPOINT,
      xp: 20,
      tempo: 5,
      cap: "Cap. 4",
      conteudo: {
        titulo: "O que você leva deste módulo",
        itens: [
          "Anexar arquivo substitui copiar e colar — e lê foto, PDF e planilha",
          "Explicar as colunas antes de pedir análise muda o resultado",
          "Pedido de trabalho tem material, resultado, limites e parada",
          "Instruções personalizadas evitam repetir o contexto toda vez",
          "Quanto maior o trabalho delegado, mais importante a revisão",
        ],
        pergunta:
          "Qual trabalho da sua semana você vai delegar inteiro na próxima vez, em vez de fazer por partes?",
      },
    },
  ],
};

/* ============================================================
   Analisar os dados do negócio — Fase 9
   ============================================================ */

export const MODULO_DADOS: Modulo = {
  ordem: 101,
  titulo: "Perguntar aos próprios números",
  subtitulo: "Vendas, estoque, clientes e dinheiro — sem virar analista",
  cor: "#0369A1",
  icone: "planilhas",
  licoes: [
    {
      titulo: "A pergunta que você nunca conseguiu responder",
      tipo: TipoLicao.AQUECIMENTO,
      xp: 10,
      tempo: 3,
      cap: "Cap. 9",
      conteudo: {
        pergunta:
          "Existe alguma pergunta sobre o seu negócio que você tem há meses e nunca parou para responder? Algo como 'será que vale continuar com aquele produto?'",
        fechamento:
          "Quase sempre os dados para responder já existem — estão na planilha, no sistema ou no caderno. O que falta não é informação: é o tempo de cruzar. É exatamente isso que a IA faz em minutos.",
        tempo: "Um minuto",
      },
    },
    {
      titulo: "Perguntas melhores valem mais que gráficos bonitos",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 10,
      cap: "Cap. 9.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Muita gente acha que analisar dados é fazer gráfico. Não é. Gráfico é o que se mostra no fim; a análise começa numa pergunta — e a qualidade da pergunta decide se a resposta serve para alguma coisa.",
          },
          {
            tipo: "texto",
            texto:
              "'Como foram as vendas?' devolve um total que você já sabia. 'Quais produtos caíram nos últimos três meses e continuavam ocupando prateleira?' devolve uma decisão de compra.",
          },
          {
            tipo: "destaque",
            titulo: "O teste da decisão",
            texto:
              "Antes de perguntar, responda: se a resposta vier, o que eu faço diferente? Se não houver resposta para isso, a pergunta é curiosidade — e curiosidade pode esperar.",
          },
          {
            tipo: "lista",
            titulo: "Perguntas que mudam alguma coisa",
            itens: [
              "Quais produtos costumam ser comprados juntos? → muda a vitrine e o combo",
              "Que dia e hora concentram as vendas? → muda a escala da equipe",
              "Quem comprava sempre e parou? → vira uma lista de contatos para hoje",
              "Onde a despesa cresceu mais que o faturamento? → vira corte ou renegociação",
              "Que produto dá margem alta e vende pouco? → vira destaque no atendimento",
            ],
          },
          {
            tipo: "lista",
            titulo: "Perguntas que não mudam nada",
            itens: [
              "Quanto vendi no total? — você já sabe",
              "Qual o produto mais vendido? — você já sabe",
              "Qual a média de vendas? — não indica ação nenhuma sozinha",
            ],
          },
          {
            tipo: "destaque",
            titulo: "Comece pedindo as perguntas",
            texto:
              "O melhor primeiro pedido não é uma análise: é 'com estes dados, que perguntas eu consigo responder, e que decisão cada uma ajudaria a tomar?'. Você escolhe as três que importam e só então pede a análise.",
          },
          {
            tipo: "atencao",
            titulo: "Separe sempre fato de hipótese",
            texto:
              "A IA tende a explicar o que vê: 'as vendas caíram em agosto, provavelmente por causa das férias'. Os dados mostram a queda; o motivo é chute. Peça na restrição que ela separe o que os dados mostram do que é interpretação.",
          },
        ],
      },
    },
    {
      titulo: "Vendas: o que os dados do caixa escondem",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 10,
      cap: "Cap. 9.2",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Todo negócio que registra venda tem três informações mínimas: o que foi vendido, quando e por quanto. Com só isso já dá para responder perguntas que mudam o mês.",
          },
          {
            tipo: "lista",
            titulo: "O que essas três colunas respondem",
            itens: [
              "Que produtos saem juntos — e viram combo ou sugestão no balcão",
              "Que dias e horários concentram o movimento — e definem a escala",
              "Que produtos sumiram das vendas sem ninguém notar",
              "Se o ticket médio subiu ou caiu, e em que período",
              "Que semana do mês vende mais — e quando fazer promoção",
            ],
          },
          {
            tipo: "destaque",
            titulo: "Um caso concreto",
            texto:
              "Uma papelaria descobriu que caderno e caneta saíam juntos em 40% dos pedidos, mas ficavam em corredores opostos. Trocou a posição de uma prateleira. É o tipo de decisão que custa uma tarde e não exige sistema nenhum.",
          },
          {
            tipo: "texto",
            texto:
              "Repare que nenhuma dessas perguntas exige um sistema caro. Uma planilha exportada do que você já usa — ou digitada de um caderno — basta para começar.",
          },
          {
            tipo: "dica",
            titulo: "Se você não registra nada ainda",
            texto:
              "Comece registrando três coisas por venda: produto, data e valor. Em dois meses você tem dados suficientes para as primeiras perguntas. Não espere ter o sistema perfeito.",
          },
          {
            tipo: "atencao",
            titulo: "Código no lugar do nome",
            texto:
              "Para analisar venda por cliente, troque o nome por um código — CLIENTE 1, CLIENTE 2. A análise sai idêntica e o dado do seu cliente não vai para servidor nenhum.",
          },
        ],
      },
    },
    {
      titulo: "Estoque e clientes: as duas listas que você deveria ter",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 10,
      cap: "Cap. 9.3",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "Duas listas resolvem a maior parte dos apertos de caixa de um negócio pequeno: o que está parado no estoque e quem parou de comprar.",
          },
          {
            tipo: "destaque",
            titulo: "Estoque parado é dinheiro preso",
            texto:
              "Cada item que não gira é dinheiro que não está comprando o que vende. A conta é simples e quase ninguém faz: quanto do meu capital está em produto que não sai há mais de 90 dias?",
          },
          {
            tipo: "lista",
            titulo: "O que perguntar sobre estoque",
            itens: [
              "O que não sai há mais de 90 dias, e quanto custou",
              "O que está perto de acabar e demora a chegar do fornecedor",
              "Que itens eu recompro sempre — e poderiam ter pedido programado",
              "Onde eu perdi produto por validade nos últimos meses",
            ],
          },
          {
            tipo: "destaque",
            titulo: "Cliente que some raramente avisa",
            texto:
              "Ele não reclama, não cancela — simplesmente para de aparecer. Quem olha só o faturamento total não percebe, porque clientes novos cobrem o buraco. Quem olha a lista percebe em tempo de agir.",
          },
          {
            tipo: "lista",
            titulo: "O que perguntar sobre clientes",
            itens: [
              "Quem comprava com frequência e parou nos últimos 3 a 6 meses",
              "Quem compra mais, em valor e em frequência — e merece atenção diferente",
              "Qual a diferença de comportamento entre quem volta e quem não volta",
              "Quantos dos meus clientes compraram uma vez só",
            ],
          },
          {
            tipo: "atencao",
            titulo: "Nunca conclua o motivo pelos dados",
            texto:
              "Os dados mostram que o cliente parou. Por que ele parou, só ele sabe. A IA vai sugerir motivos plausíveis — trate como hipótese a confirmar numa ligação, nunca como fato.",
          },
        ],
      },
    },
    {
      titulo: "Antes e depois: descobrir onde o dinheiro está indo",
      tipo: TipoLicao.ANTES_DEPOIS,
      xp: 20,
      tempo: 8,
      cap: "Cap. 9.4",
      conteudo: {
        tarefa: "Entender por que sobra menos dinheiro do que deveria",
        antes: {
          titulo: "Como é hoje",
          tempo: "Não acontece — fica para o mês que vem",
          passos: [
            "Olha o extrato e sente que gastou demais",
            "Não tem tempo de somar por categoria",
            "Decide cortar o que parece mais caro, no olho",
            "Três meses depois, o problema continua",
          ],
        },
        depois: {
          titulo: "Com IA",
          tempo: "Cerca de 20 minutos, uma vez por mês",
          passos: [
            "Exporta os lançamentos e tira nome e número de conta",
            "Pede o agrupamento por categoria, com percentual do faturamento",
            "Recebe as três categorias que mais cresceram, com o quanto",
            "Decide o corte com o número na frente, não pela impressão",
          ],
        },
        economia: "A diferença não é tempo: é decidir com número em vez de impressão",
        prompt: {
          titulo: "O prompt das despesas",
          corpo:
            "Contexto: meu faturamento médio é [FATURAMENTO] por mês. Vou colar minhas saídas de [PERIODO], sem nome de fornecedor e sem número de conta.\nObjetivo: entender para onde o dinheiro está indo.\nFormato: tabela por categoria com total e percentual do faturamento, depois as três categorias que mais cresceram no período.\nRestrições: use somente os lançamentos colados; não calcule imposto; não compare com médias de mercado que você não possa citar a fonte; separe o que os dados mostram do que é suposição.",
          variaveis: [
            { chave: "FATURAMENTO", rotulo: "Faturamento médio", exemplo: "R$ 45 mil" },
            { chave: "PERIODO", rotulo: "Período", exemplo: "últimos 6 meses" },
          ],
        },
        resultadoEsperado:
          "Uma tabela por categoria em percentual — que é o que revela o gasto de R$ 800 que parecia pequeno e é 12% do que sobra.",
        atencao:
          "Ver em percentual muda a percepção, mas não substitui contador. Imposto, enquadramento e obrigação fiscal são com ele.",
      },
    },
    {
      titulo: "Caso: a loja que achava que o problema era preço",
      tipo: TipoLicao.CASO,
      xp: 25,
      tempo: 12,
      cap: "Cap. 9.2",
      conteudo: {
        titulo: "A loja que achava que o problema era preço",
        cena:
          "Uma loja de materiais de construção viu o faturamento cair 15% em quatro meses. O dono concluiu que era preço — o concorrente novo estava mais barato — e começou a dar desconto. O faturamento continuou caindo, agora com margem menor. Quando finalmente exportou as vendas e olhou por cliente, descobriu outra coisa: o número de clientes era o mesmo. O que tinha caído era o valor de cada compra. Os clientes continuavam vindo, mas levavam menos itens por vez.",
        pergunta:
          "O que os dados mostram, e o que ele supôs? Que pergunta ele deveria ter feito antes de dar o primeiro desconto?",
        pistas: [
          "Separe o que ele mediu do que ele imaginou",
          "Repare que a conclusão dele parecia óbvia — e por isso ninguém questionou",
          "Pense em quanto custou cada mês de decisão errada",
        ],
        fechamento:
          "Ticket caindo com o mesmo número de clientes aponta para outra coisa: item em falta, atendimento que não sugere, ou produto que saiu de linha. Desconto ataca o preço, que não era o problema — e ainda reduz a margem. A pergunta que faltou custa dez minutos: 'caiu o número de clientes ou o valor por compra?'",
      },
    },
    {
      titulo: "Laboratório: três perguntas sobre o seu negócio",
      tipo: TipoLicao.LABORATORIO,
      xp: 40,
      tempo: 30,
      cap: "Cap. 9.4",
      conteudo: {
        titulo: "Da pergunta à decisão",
        contexto:
          "Use dados reais. Antes de colar: troque nome de cliente por código, e tire CPF, telefone e número de conta. A análise sai igual.",
        passos: [
          "Exporte ou digite seus dados — vendas, despesas ou estoque.",
          "Peça primeiro as perguntas que esses dados conseguem responder.",
          "Escolha as três que mudariam uma decisão sua.",
          "Peça a análise dessas três, exigindo separar fato de hipótese.",
          "Escolha uma e escreva a decisão que você vai tomar esta semana.",
        ],
        promptSugerido: {
          titulo: "Comece perguntando o que perguntar",
          corpo:
            "Contexto: tenho dados de [O_QUE] de [PERIODO] do meu [NEGOCIO], já sem identificação de pessoa. As colunas são: [COLUNAS].\nObjetivo: descobrir o que eu deveria estar perguntando.\nFormato: 10 perguntas que estes dados conseguem responder, cada uma com a decisão que ela ajudaria a tomar.\nRestrições: nenhuma pergunta que exija dado que eu não tenho; nada de termo técnico de estatística; não responda ainda, só liste as perguntas.",
          variaveis: [
            { chave: "O_QUE", rotulo: "Que dados", exemplo: "vendas por produto" },
            { chave: "PERIODO", rotulo: "Período", exemplo: "últimos 12 meses" },
            { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "papelaria" },
            { chave: "COLUNAS", rotulo: "Suas colunas", exemplo: "data, produto, quantidade, valor" },
          ],
        },
        campos: [
          {
            chave: "pergunta",
            rotulo: "A pergunta que você escolheu",
            curto: true,
            exemplo: "Quais produtos são comprados juntos?",
          },
          {
            chave: "achado",
            rotulo: "O que os dados responderam",
            ajuda: "Escreva só o que é fato. Separe do que é suposição.",
          },
          {
            chave: "decisao",
            rotulo: "A decisão que você vai tomar",
            ajuda: "Com data. Análise que não muda nada foi tempo perdido.",
          },
        ],
        criterios: [
          "Os dados foram anonimizados antes de colar",
          "A resposta separa fato de hipótese",
          "Existe uma decisão concreta, com data",
          "Você conferiu ao menos um número na fonte original",
        ],
        entrega: "Uma decisão tomada com base nos seus próprios números.",
      },
    },
    {
      titulo: "Caça ao erro: a análise que parecia profissional",
      tipo: TipoLicao.CACA_ERRO,
      xp: 25,
      tempo: 10,
      cap: "Cap. 9.4",
      conteudo: {
        contexto:
          "Um dono de pet shop colou as vendas do semestre e pediu uma análise. Veio isto. Três coisas não deveriam estar aí.",
        texto:
          "Análise de vendas — jan a jun\n\n• Banho e tosa representa 42% do faturamento, seguido de ração (31%).\n• Houve queda de 18% em março, provavelmente por causa da alta sazonal de gastos no início do ano letivo.\n• O ticket médio de R$ 87 está abaixo do padrão do setor pet, que gira em torno de R$ 120.\n• Recomendo criar um pacote mensal de banho com desconto de 20% para aumentar a recorrência.",
        erros: [
          {
            trecho: "provavelmente por causa da alta sazonal de gastos no início do ano letivo",
            porque:
              "Causa inventada. Os dados mostram a queda de março; o motivo não está neles. Pode ser chuva, obra na rua, férias do tosador ou concorrente novo.",
          },
          {
            trecho: "o padrão do setor pet, que gira em torno de R$ 120",
            porque:
              "Número que não veio dos dados colados e cuja fonte não existe. É alucinação com cara de referência de mercado — e a mais perigosa, porque faz o dono achar que está mal.",
          },
          {
            trecho: "Recomendo criar um pacote mensal de banho com desconto de 20%",
            porque:
              "Decisão de preço, não análise. Desconto de 20% sobre 42% do faturamento é uma mudança grande, sugerida sem conhecer custo, capacidade de atendimento nem margem.",
          },
        ],
        licao:
          "As duas restrições que evitariam tudo: 'separe o que os dados mostram do que é interpretação' e 'não compare com médias de mercado sem citar a fonte'. A terceira se resolve com 'não decida por mim'.",
      },
    },
    {
      titulo: "No celular: exporte e pergunte, sem planilha nenhuma",
      tipo: TipoLicao.NO_CELULAR,
      xp: 20,
      tempo: 12,
      cap: "Cap. 9.1",
      conteudo: {
        titulo: "Doze minutos, do jeito mais simples possível",
        tempo: "12 minutos, no celular",
        passos: [
          "Abra onde você registra vendas — sistema, planilha ou foto do caderno.",
          "Copie ou fotografe um período que você conheça bem.",
          "Troque nome de cliente por CLIENTE 1, CLIENTE 2.",
          "Cole na IA explicando o que é cada coluna.",
          "Pergunte algo cuja resposta você já sabe, e confira se bate.",
        ],
        porque:
          "Testar com algo que você já sabe é o que revela se dá para confiar. E mostra que não é preciso sistema caro nenhum para começar a olhar os próprios números.",
      },
    },
    {
      titulo: "Checkpoint: perguntar melhor",
      tipo: TipoLicao.CHECKPOINT,
      xp: 20,
      tempo: 5,
      cap: "Cap. 9",
      conteudo: {
        titulo: "O que você leva deste módulo",
        itens: [
          "Toda pergunta passa pelo teste: o que eu faço diferente com a resposta?",
          "Comece pedindo as perguntas, não a análise",
          "Três colunas — produto, data, valor — já respondem muita coisa",
          "Estoque parado e cliente que sumiu são as duas listas que mais rendem",
          "Exija sempre separar fato de hipótese, e nunca aceite média de mercado sem fonte",
        ],
        pergunta:
          "Que pergunta sobre o seu negócio você vai responder ainda esta semana?",
      },
    },
  ],
};

/* ============================================================
   Escolher entre as IAs — Fase 12
   ============================================================ */

export const MODULO_ESCOLHER: Modulo = {
  ordem: 102,
  titulo: "Qual IA usar para cada coisa",
  subtitulo: "Sem discutir qual é a melhor — escolhendo pela tarefa",
  cor: "#7C2D12",
  icone: "ferramentas",
  licoes: [
    {
      titulo: "A pergunta errada que todo mundo faz",
      tipo: TipoLicao.AQUECIMENTO,
      xp: 10,
      tempo: 3,
      cap: "Cap. 12",
      conteudo: {
        pergunta:
          "Se alguém te perguntasse hoje 'qual IA é a melhor?', o que você responderia?",
        fechamento:
          "A pergunta não tem resposta útil — é como perguntar qual ferramenta é melhor numa caixa de ferramentas. A pergunta que resolve é outra: qual delas serve para o que eu preciso fazer agora.",
        tempo: "Um minuto",
      },
    },
    {
      titulo: "O que cada uma faz melhor, na prática",
      tipo: TipoLicao.TEORIA,
      xp: 20,
      tempo: 12,
      cap: "Cap. 12.1",
      conteudo: {
        blocos: [
          {
            tipo: "texto",
            texto:
              "As três grandes — ChatGPT, Gemini e Claude — fazem quase tudo que as outras fazem. As diferenças aparecem nas bordas, e é nas bordas que está a escolha.",
          },
          {
            tipo: "destaque",
            titulo: "ChatGPT",
            texto:
              "O mais versátil e o mais conhecido. Forte em escrita do dia a dia, imagem e trabalho de várias etapas sobre arquivos. É o melhor lugar para começar se você nunca usou nada.",
          },
          {
            tipo: "destaque",
            titulo: "Gemini",
            texto:
              "A vantagem é a casa: se o seu negócio já vive no Gmail, Drive, Documentos e Planilhas, ele está ali dentro. Também é a porta para o NotebookLM e para geração de vídeo.",
          },
          {
            tipo: "destaque",
            titulo: "Claude",
            texto:
              "Melhor com texto longo e documento — contrato, manual, relatório. Costuma ser mais cuidadoso em dizer que não sabe, em vez de inventar, o que importa quando o assunto tem consequência.",
          },
          {
            tipo: "lista",
            titulo: "Escolhendo pela tarefa",
            itens: [
              "Responder cliente, escrever post, criar imagem → ChatGPT",
              "Mexer em planilha, documento e e-mail do Google → Gemini",
              "Ler contrato longo, escrever relatório, analisar documento → Claude",
              "Perguntar aos seus próprios arquivos com citação → NotebookLM",
              "Gerar vídeo curto → Veo, pelo Google AI Studio",
            ],
          },
          {
            tipo: "texto",
            texto:
              "Repare que a lista é por tarefa, não por qualidade. Nenhuma dessas escolhas significa que as outras fariam mal — significa que uma tem menos atrito para aquele caso.",
          },
          {
            tipo: "dica",
            titulo: "Use uma só por duas semanas",
            texto:
              "Trocar de ferramenta toda semana faz você aprender o botão de cada uma e o ofício de nenhuma. Escolha uma pelo trabalho que você mais repete e fique nela até o pedido sair natural.",
          },
          {
            tipo: "atencao",
            titulo: "Nenhuma delas conhece o seu negócio",
            texto:
              "A diferença entre as três é pequena perto da diferença entre um pedido vago e um pedido com contexto. Trocar de ferramenta não resolve resposta ruim — melhorar o pedido resolve.",
          },
        ],
      },
    },
    {
      titulo: "O mesmo pedido nas três: o que muda de verdade",
      tipo: TipoLicao.PROMPT,
      xp: 25,
      tempo: 15,
      cap: "Cap. 12.2",
      conteudo: {
        introducao:
          "A melhor forma de escolher não é ler comparação na internet: é rodar o seu próprio pedido nas três e ver qual resposta você usaria sem reescrever. Leva quinze minutos e vale mais que qualquer lista de recursos.",
        corpo:
          "Contexto: meu negócio é [NEGOCIO] e preciso de [O_QUE_PRECISO].\nObjetivo: [RESULTADO].\nFormato: [FORMATO].\nRestrições: não invente dado que eu não informei; onde faltar informação, escreva [CONFIRMAR]; não prometa o que depende de eu confirmar.\nEntrada: [MATERIAL]",
        categoria: "comparacao",
        dica:
          "Rode exatamente o mesmo texto nas três, sem ajustar para nenhuma. Compare quanto você precisaria reescrever de cada resposta antes de usar — esse é o número que importa.",
        campos: [
          { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "assistência técnica" },
          { chave: "O_QUE_PRECISO", rotulo: "O que precisa", exemplo: "responder um orçamento recusado" },
          { chave: "RESULTADO", rotulo: "O resultado", exemplo: "manter o cliente para uma próxima" },
          { chave: "FORMATO", rotulo: "Formato", exemplo: "mensagem de até 5 linhas" },
          { chave: "MATERIAL", rotulo: "O material", exemplo: "o que o cliente escreveu" },
        ],
      },
    },
    {
      titulo: "Duelo: trocar de ferramenta × melhorar o pedido",
      tipo: TipoLicao.DUELO,
      xp: 25,
      tempo: 10,
      cap: "Cap. 12.2",
      conteudo: {
        situacao:
          "Um lojista pediu um texto de divulgação, não gostou do resultado e precisa decidir o que fazer.",
        ruim: {
          titulo: "Trocar de ferramenta",
          prompt:
            "Mesmo pedido — 'escreva um texto divulgando minha loja' — agora em outra IA, depois em uma terceira.",
          resultado:
            "Três textos igualmente genéricos, com palavras diferentes. Ele perdeu meia hora e concluiu que 'IA não serve para o negócio dele'.",
        },
        bom: {
          titulo: "Melhorar o pedido",
          prompt:
            "Contexto: tenho uma loja de ferragens de bairro há 12 anos; meus clientes são pedreiros e moradores que fazem reforma pequena.\nObjetivo: divulgar que agora entrego no mesmo dia dentro do bairro.\nFormato: mensagem de WhatsApp de até 4 linhas.\nRestrições: sem emoji em excesso, sem urgência falsa, sem promessa de preço; fale como quem já conhece o cliente.",
          resultado:
            "Na primeira ferramenta mesmo, um texto que ele mandaria sem mudar quase nada — porque agora o pedido tinha o que só ele sabia.",
        },
        pergunta:
          "Pegue um pedido seu que deu resultado ruim. Antes de trocar de ferramenta, reescreva com contexto e restrição. Mudou?",
        fechamento:
          "Na maioria dos casos, o problema não estava na ferramenta. Trocar só faz sentido depois que o pedido está bom e a resposta ainda não serve.",
      },
    },
    {
      titulo: "Laboratório: monte a sua tabela de escolha",
      tipo: TipoLicao.LABORATORIO,
      xp: 35,
      tempo: 25,
      cap: "Cap. 12.2",
      conteudo: {
        titulo: "Qual ferramenta para qual tarefa sua",
        contexto:
          "Em vez de decorar comparações da internet, monte a sua — com as tarefas que você de fato faz e o que você testou.",
        passos: [
          "Liste as cinco tarefas que você mais repete no negócio.",
          "Para cada uma, escreva qual ferramenta você usaria hoje e por quê.",
          "Escolha a tarefa mais frequente e rode o mesmo pedido em duas ferramentas.",
          "Compare quanto você precisaria reescrever de cada resposta.",
          "Anote a escolha e o motivo. Revise em três meses — isso muda.",
        ],
        campos: [
          {
            chave: "tarefas",
            rotulo: "Suas cinco tarefas mais repetidas",
            ajuda: "Uma por linha, com a ferramenta que você escolheu para cada.",
          },
          {
            chave: "teste",
            rotulo: "O que o teste lado a lado mostrou",
            ajuda: "Qual resposta exigiu menos reescrita, e por quê.",
          },
          {
            chave: "padrao",
            rotulo: "A sua regra, em uma frase",
            curto: true,
            exemplo: "Texto de cliente no ChatGPT, planilha no Gemini, contrato no Claude",
          },
        ],
        criterios: [
          "A tabela tem as suas tarefas, não tarefas genéricas",
          "Pelo menos uma foi testada lado a lado de verdade",
          "A escolha tem motivo escrito, não preferência",
          "Existe uma data para revisar",
        ],
        entrega: "Uma regra de escolha que é sua, baseada no que você testou.",
      },
    },
    {
      titulo: "Guia de bolso: qual abrir agora",
      tipo: TipoLicao.EMERGENCIA,
      xp: 20,
      tempo: 6,
      cap: "Anexo A",
      conteudo: {
        titulo: "Consulta rápida, no meio do expediente",
        itens: [
          {
            situacao: "Preciso responder um cliente agora",
            acao: "ChatGPT ou Gemini. Cole a mensagem sem nome e diga o que você NÃO pode prometer.",
          },
          {
            situacao: "Recebi um contrato e não entendi",
            acao: "Claude ou NotebookLM. Peça obrigações suas, prazos, multas e o que perguntar ao advogado.",
          },
          {
            situacao: "Preciso mexer numa planilha",
            acao: "Gemini, se você usa Google. Ou exporte CSV e cole no ChatGPT — o resultado é o mesmo.",
          },
          {
            situacao: "Quero uma imagem do meu produto",
            acao: "ChatGPT Imagens. Descreva as oito partes e peça sem texto na imagem.",
          },
          {
            situacao: "Quero perguntar aos meus próprios documentos",
            acao: "NotebookLM. Suba os arquivos e confira a citação de cada resposta.",
          },
          {
            situacao: "Preciso de um vídeo curto",
            acao: "Roteiro no ChatGPT, cenas no Veo pelo Google AI Studio. Grave o que puder com o celular.",
          },
          {
            situacao: "A resposta veio ruim em todas",
            acao: "O problema é o pedido, não a ferramenta. Acrescente contexto e restrição antes de trocar de novo.",
          },
        ],
        fechamento:
          "Se você está em dúvida entre duas, use a que já está aberta. A diferença entre elas é menor que o tempo que você perde decidindo.",
      },
    },
  ],
};
