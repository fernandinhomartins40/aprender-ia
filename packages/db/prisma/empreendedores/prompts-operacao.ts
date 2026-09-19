import type { PromptEmpreendedor } from "./prompts";

/**
 * Financeiro, Administrativo, Estoque, Compras, Documentos e Dados —
 * o que se organiza.
 *
 * Quase todos pedem anonimização antes de colar, e vários exigem que a
 * IA separe fato de hipótese. Não é excesso de zelo: é nestes prompts
 * que entram números reais do negócio, e é aqui que uma alucinação vira
 * decisão errada.
 */

const v = (chave: string, rotulo: string, exemplo: string) => ({ chave, rotulo, exemplo });

export const PROMPTS_OPERACAO: PromptEmpreendedor[] = [
  /* ---------------- FINANCEIRO ---------------- */
  {
    titulo: "Saber se o preço cobre os custos",
    corpo:
      "Contexto: vendo [PRODUTO] por [PRECO]. Meus custos diretos são: [CUSTOS]. Meus custos fixos mensais somam [FIXOS] e vendo cerca de [VOLUME] por mês.\nObjetivo: saber se esse preço se sustenta.\nFormato: custo por unidade, margem, quanto sobra depois do rateio do fixo, e em que volume começo a ter lucro.\nRestrições: use apenas os números que dei; não estime imposto nem substitua contador. Aponte o que falta para a conta ficar completa.",
    categoria: "Financeiro",
    setor: "Financeiro",
    dica:
      "O 'aponte o que falta' costuma revelar custos esquecidos — embalagem, taxa de cartão, frete.",
    exemploPreenchido:
      "Contexto: vendo marmita por R$ 22. Custos diretos: R$ 9 de ingredientes e R$ 1,50 de embalagem. Fixos: R$ 3.200. Volume: 600 por mês.",
    variaveis: [
      v("PRODUTO", "O produto", "marmita"),
      v("PRECO", "Preço de venda", "R$ 22"),
      v("CUSTOS", "Custos diretos", "ingredientes e embalagem"),
      v("FIXOS", "Custos fixos", "R$ 3.200"),
      v("VOLUME", "Volume mensal", "600 unidades"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Intermediário",
    tags: ["precificação", "margem", "custo"],
  },
  {
    titulo: "Organizar contas a pagar e receber",
    corpo:
      "Contexto: seguem meus compromissos do mês, sem nome de pessoa: [COMPROMISSOS].\nObjetivo: enxergar onde aperta.\nFormato: calendário por semana com entradas e saídas, saldo acumulado, e os dias em que o saldo fica negativo.\nRestrições: não sugira empréstimo nem produto financeiro; aponte o que dá para renegociar ou antecipar.",
    categoria: "Financeiro",
    setor: "Financeiro",
    dica:
      "Ver o saldo por semana, e não por mês, mostra o aperto que o total do mês esconde.",
    exemploPreenchido:
      "Contexto: seguem meus compromissos de outubro, com datas e valores, sem nome de fornecedor.",
    variaveis: [v("COMPROMISSOS", "Contas do mês", "cole a lista")],
    ferramentasSugeridas: ["gemini-workspace", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["fluxo de caixa", "planejamento"],
    porteEmpresa: "MEI",
  },
  {
    titulo: "Entender o extrato e separar o que é do negócio",
    corpo:
      "Contexto: vou colar lançamentos do extrato, sem número de conta e sem nome de pessoa: [LANCAMENTOS].\nObjetivo: separar o que é do negócio do que é pessoal e agrupar por categoria.\nFormato: tabela por categoria, com total, e uma lista à parte do que não deu para classificar.\nRestrições: não chute a categoria — o que estiver ambíguo vai para a lista de dúvidas. Não calcule imposto.",
    categoria: "Financeiro",
    setor: "Financeiro",
    dica:
      "Misturar conta pessoal e do negócio é o erro mais comum de MEI. Este prompt é o primeiro passo para separar.",
    exemploPreenchido:
      "Contexto: vou colar os lançamentos do último mês, já sem número de conta.",
    variaveis: [v("LANCAMENTOS", "Os lançamentos", "cole aqui")],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["extrato", "categorias", "MEI"],
    porteEmpresa: "MEI",
  },
  {
    titulo: "Avaliar se vale contratar mais alguém",
    corpo:
      "Contexto: penso em contratar para [FUNCAO]. Hoje a situação é: [SITUACAO]. Faturamento médio: [FATURAMENTO]. Custo estimado da contratação: [CUSTO].\nObjetivo: pensar a decisão com clareza.\nFormato: o que muda se eu contratar, o que muda se não contratar, o que precisa acontecer para se pagar, e os sinais de que estou adiando demais.\nRestrições: não decida por mim; aponte o que eu precisaria medir antes.",
    categoria: "Financeiro",
    setor: "Planejamento",
    dica:
      "O 'sinais de que estou adiando demais' costuma ser a parte mais útil: quase todo mundo contrata tarde.",
    exemploPreenchido:
      "Contexto: penso em contratar um ajudante. Hoje trabalho 12h por dia e recuso serviço. Faturamento médio: R$ 18 mil. Custo estimado: R$ 2.600.",
    variaveis: [
      v("FUNCAO", "A função", "ajudante"),
      v("SITUACAO", "Situação atual", "trabalho 12h e recuso serviço"),
      v("FATURAMENTO", "Faturamento médio", "R$ 18 mil"),
      v("CUSTO", "Custo da contratação", "R$ 2.600"),
    ],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Avançado",
    tags: ["decisão", "contratação", "custo"],
  },
  {
    titulo: "Preparar os números para o contador",
    corpo:
      "Contexto: preciso enviar ao contador as informações de [PERIODO] do meu [NEGOCIO].\nObjetivo: organizar antes de mandar.\nFormato: lista do que separar, como organizar cada coisa, e as perguntas que devo fazer a ele.\nRestrições: você não é contador; não dê orientação fiscal nem calcule imposto. O objetivo é eu chegar organizado.",
    categoria: "Financeiro",
    setor: "Financeiro",
    dica:
      "Chegar organizado ao contador reduz o retrabalho dos dois lados — e o custo, quando se paga por hora.",
    exemploPreenchido:
      "Contexto: preciso enviar ao contador as informações do trimestre da minha loja.",
    variaveis: [
      v("PERIODO", "Período", "último trimestre"),
      v("NEGOCIO", "Seu negócio", "loja de roupas"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["contador", "organização", "limite"],
  },

  /* ---------------- ADMINISTRATIVO ---------------- */
  {
    titulo: "Checklist de abertura e fechamento",
    corpo:
      "Contexto: meu [NEGOCIO] abre e fecha todo dia, e às vezes alguma coisa passa batido. O que precisa ser feito: [TAREFAS].\nObjetivo: dois checklists, de abertura e de fechamento.\nFormato: itens na ordem em que se faz, cada um com um verbo no início e uma caixa para marcar.\nRestrições: nada com mais de 12 itens; se passar disso, agrupe. Cada item tem de ser verificável, não subjetivo.",
    categoria: "Administrativo",
    setor: "Administrativo",
    dica:
      "Item verificável: 'conferir se a fritadeira está desligada', não 'garantir a segurança da cozinha'.",
    exemploPreenchido:
      "Contexto: minha lanchonete abre e fecha todo dia. Tarefas: ligar equipamentos, conferir estoque do dia, contar caixa, limpar chapa, trancar.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "lanchonete"),
      v("TAREFAS", "O que precisa ser feito", "liste aqui"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["checklist", "rotina"],
  },
  {
    titulo: "Organizar a semana por blocos",
    corpo:
      "Contexto: no meu [NEGOCIO] eu faço: [TAREFAS]. Trabalho [HORARIO] e o movimento é maior em [PICO].\nObjetivo: organizar a semana para parar de apagar incêndio.\nFormato: blocos por dia, separando o que é atendimento, produção, administrativo e o que só eu posso fazer.\nRestrições: deixe espaço para imprevisto todo dia; nada de agenda cheia das 8h às 18h.",
    categoria: "Administrativo",
    setor: "Planejamento",
    dica:
      "O espaço para imprevisto não é luxo: é o que faz a agenda sobreviver à terça-feira.",
    exemploPreenchido:
      "Contexto: na minha oficina eu atendo, orço, executo e cobro. Trabalho das 8h às 18h, movimento maior na segunda.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "oficina"),
      v("TAREFAS", "O que você faz", "atender, orçar, executar, cobrar"),
      v("HORARIO", "Seu horário", "8h às 18h"),
      v("PICO", "Quando é o pico", "segunda-feira"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["agenda", "produtividade"],
  },
  {
    titulo: "Aviso interno que a equipe realmente lê",
    corpo:
      "Contexto: preciso comunicar à equipe: [ASSUNTO]. Vale a partir de [QUANDO].\nObjetivo: um aviso curto que não gere dez perguntas depois.\nFormato: o que muda, a partir de quando, o que cada um precisa fazer, e a quem perguntar.\nRestrições: no máximo 6 linhas; nada de justificar demais; se houver exceção, diga qual.",
    categoria: "Administrativo",
    setor: "Administrativo",
    dica:
      "Aviso que gera dez perguntas foi mal escrito. O 'a quem perguntar' resolve as que sobrarem.",
    exemploPreenchido:
      "Contexto: preciso comunicar que o horário de almoço passa a ser escalonado. Vale a partir de segunda.",
    variaveis: [
      v("ASSUNTO", "O assunto", "horário de almoço escalonado"),
      v("QUANDO", "A partir de quando", "segunda-feira"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["comunicação interna", "equipe"],
  },
  {
    titulo: "Organizar arquivos e documentos",
    corpo:
      "Contexto: meus documentos do [NEGOCIO] estão espalhados. O que tenho: [TIPOS].\nObjetivo: uma estrutura de pastas simples de manter.\nFormato: a árvore de pastas, o padrão de nome dos arquivos, e a regra de por quanto tempo guardar cada tipo.\nRestrições: no máximo três níveis de pasta; o padrão de nome tem de começar pela data, para ordenar sozinho.",
    categoria: "Administrativo",
    setor: "Administrativo",
    dica:
      "Nome começando por data (2026-09-19) faz a pasta se ordenar sozinha. É o truque que mais economiza tempo.",
    exemploPreenchido:
      "Contexto: meus documentos estão espalhados. Tenho notas fiscais, contratos, comprovantes e fotos de serviço.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "empresa de reformas"),
      v("TIPOS", "O que você tem", "notas, contratos, comprovantes"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["arquivos", "organização", "drive"],
  },
  {
    titulo: "Pauta de reunião que não desperdiça tempo",
    corpo:
      "Contexto: vou reunir [QUEM] para tratar de [ASSUNTOS]. Tenho [TEMPO].\nObjetivo: uma pauta com horário.\nFormato: cada assunto com tempo, o que precisa ser decidido e quem prepara o quê antes.\nRestrições: nada de 'informes gerais'; todo item tem de terminar numa decisão ou numa tarefa com dono.",
    categoria: "Administrativo",
    setor: "Administrativo",
    dica:
      "Eliminar 'informes gerais' costuma cortar metade do tempo da reunião. Informe se manda por escrito.",
    exemploPreenchido:
      "Contexto: vou reunir os 4 da equipe para tratar da nova tabela de preços e da escala de dezembro. Tenho 40 minutos.",
    variaveis: [
      v("QUEM", "Quem participa", "os 4 da equipe"),
      v("ASSUNTOS", "Assuntos", "tabela de preços e escala"),
      v("TEMPO", "Tempo disponível", "40 minutos"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["reunião", "pauta"],
  },

  /* ---------------- ESTOQUE ---------------- */
  {
    titulo: "Quanto comprar e de quanto em quanto tempo",
    corpo:
      "Contexto: vendo cerca de [VENDA] de [PRODUTO] por mês. O fornecedor entrega em [PRAZO] e o pedido mínimo é [MINIMO].\nObjetivo: saber quando pedir e quanto.\nFormato: o ponto de pedido, a quantidade sugerida, e a margem de segurança para o caso de atraso.\nRestrições: use apenas os números que dei; se a venda variar muito no ano, diga que a conta precisa considerar isso.",
    categoria: "Estoque",
    setor: "Estoque",
    dica:
      "O ponto de pedido é o número que evita tanto a falta quanto o dinheiro parado na prateleira.",
    exemploPreenchido:
      "Contexto: vendo cerca de 80 unidades de ração 15kg por mês. O fornecedor entrega em 7 dias e o mínimo é 50.",
    variaveis: [
      v("VENDA", "Venda mensal", "80 unidades"),
      v("PRODUTO", "O produto", "ração 15kg"),
      v("PRAZO", "Prazo de entrega", "7 dias"),
      v("MINIMO", "Pedido mínimo", "50 unidades"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Intermediário",
    tags: ["reposição", "ponto de pedido"],
  },
  {
    titulo: "O que fazer com o que não vende",
    corpo:
      "Contexto: tenho estes itens parados há mais de [TEMPO]: [ITENS]. Custaram [CUSTO].\nObjetivo: decidir o que fazer com cada um.\nFormato: agrupe por saída possível — liquidar, combinar com outro produto, devolver ao fornecedor, doar ou descartar — com o critério de cada grupo.\nRestrições: não sugira preço abaixo do custo sem dizer claramente que é prejuízo assumido para liberar espaço e capital.",
    categoria: "Estoque",
    setor: "Estoque",
    dica:
      "Dinheiro parado em prateleira é dinheiro que não está comprando o que vende. Assumir o prejuízo às vezes é o certo.",
    exemploPreenchido:
      "Contexto: tenho 40 peças de coleção antiga paradas há 8 meses. Custaram R$ 3.500.",
    variaveis: [
      v("TEMPO", "Há quanto tempo", "8 meses"),
      v("ITENS", "Os itens", "liste aqui"),
      v("CUSTO", "O que custaram", "R$ 3.500"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["encalhe", "liquidação"],
  },
  {
    titulo: "Inventário sem parar o negócio",
    corpo:
      "Contexto: preciso conferir o estoque do meu [NEGOCIO], que tem cerca de [QUANTOS] itens.\nObjetivo: um jeito de conferir sem fechar as portas.\nFormato: como dividir por partes, a ordem de conferência, o que anotar e como tratar a diferença encontrada.\nRestrições: nada que exija sistema que eu não tenho; considere que quem confere também atende.",
    categoria: "Estoque",
    setor: "Estoque",
    dica:
      "Contagem por partes, ao longo do mês, funciona melhor que o inventário geral que nunca acontece.",
    exemploPreenchido:
      "Contexto: preciso conferir o estoque da minha papelaria, que tem cerca de 1.200 itens.",
    variaveis: [
      v("NEGOCIO", "Seu negócio", "papelaria"),
      v("QUANTOS", "Quantos itens", "1.200"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["inventário", "contagem"],
  },

  /* ---------------- COMPRAS ---------------- */
  {
    titulo: "Pedido de cotação que traz resposta comparável",
    corpo:
      "Contexto: preciso comprar [O_QUE] para meu [NEGOCIO]. As especificações são: [ESPECIFICACOES].\nObjetivo: um pedido de cotação que faça os fornecedores responderem na mesma base.\nFormato: o que preciso, em que quantidade, o que quero que conste na resposta, e o prazo para responder.\nRestrições: peça preço unitário, prazo, forma de pagamento e validade — sem isso as respostas não se comparam.",
    categoria: "Compras",
    setor: "Compras",
    dica:
      "Cotação que não pede os mesmos itens volta impossível de comparar. Este prompt resolve isso na origem.",
    exemploPreenchido:
      "Contexto: preciso comprar 500 embalagens personalizadas para minha confeitaria.",
    variaveis: [
      v("O_QUE", "O que comprar", "500 embalagens"),
      v("NEGOCIO", "Seu negócio", "confeitaria"),
      v("ESPECIFICACOES", "Especificações", "tamanho, material, cor"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["cotação", "fornecedor"],
  },
  {
    titulo: "Negociar melhor condição com fornecedor antigo",
    corpo:
      "Contexto: compro de [FORNECEDOR_TIPO] há [TEMPO], gastando cerca de [VALOR] por mês. A condição atual é [CONDICAO].\nObjetivo: pedir uma condição melhor sem azedar a relação.\nFormato: mensagem que reconhece a parceria, apresenta o que eu represento em números e faz um pedido específico.\nRestrições: peça uma coisa só; não ameace trocar de fornecedor; não invente proposta de concorrente.",
    categoria: "Compras",
    setor: "Compras",
    dica:
      "Pedir uma coisa só aumenta a chance de conseguir. Três pedidos juntos viram um 'vou ver' que não volta.",
    exemploPreenchido:
      "Contexto: compro de um distribuidor de bebidas há 4 anos, cerca de R$ 12 mil por mês, pagando à vista.",
    variaveis: [
      v("FORNECEDOR_TIPO", "Tipo de fornecedor", "distribuidor de bebidas"),
      v("TEMPO", "Há quanto tempo", "4 anos"),
      v("VALOR", "Quanto por mês", "R$ 12 mil"),
      v("CONDICAO", "Condição atual", "pagamento à vista"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["negociação", "fornecedor"],
  },
  {
    titulo: "Conferir se a entrega veio certa",
    corpo:
      "Contexto: pedi isto: [PEDIDO]. Chegou isto: [ENTREGA].\nObjetivo: saber o que está errado e o que cobrar.\nFormato: tabela do que bate, do que falta, do que veio a mais e do que veio diferente. Depois, a mensagem para o fornecedor.\nRestrições: baseie-se só no que eu listei; não presuma o que não foi dito.",
    categoria: "Compras",
    setor: "Compras",
    dica:
      "Conferir contra o pedido, e não contra a nota, pega o erro que a nota já incorporou.",
    exemploPreenchido:
      "Contexto: pedi 20 caixas de papel A4 e 5 de A3. Chegaram 20 de A4 e 3 de A3, mais 2 de papel fotográfico que não pedi.",
    variaveis: [
      v("PEDIDO", "O que foi pedido", "liste"),
      v("ENTREGA", "O que chegou", "liste"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["conferência", "entrega"],
  },

  /* ---------------- ANÁLISE DE DADOS ---------------- */
  {
    titulo: "Descobrir o que é vendido junto",
    corpo:
      "Contexto: seguem meus pedidos, cada linha com os itens de uma mesma compra, sem identificação de cliente: [PEDIDOS].\nObjetivo: descobrir o que costuma sair junto.\nFormato: os pares e trios mais frequentes, com quantas vezes apareceram, e sugestões do que isso permite fazer — combo, posição na loja, sugestão no atendimento.\nRestrições: não conclua com combinações que apareceram poucas vezes; diga a partir de quantas ocorrências a informação começa a valer.",
    categoria: "Análise de dados",
    setor: "Dados",
    dica:
      "Descobrir o que sai junto muda a vitrine, o combo e a fala do atendente. É das análises que mais rendem.",
    exemploPreenchido:
      "Contexto: seguem 800 pedidos do último trimestre, um por linha, sem identificação.",
    variaveis: [v("PEDIDOS", "Seus pedidos", "cole a tabela")],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Avançado",
    tags: ["cesta", "combo", "vendas"],
  },
  {
    titulo: "Entender o movimento ao longo do ano",
    corpo:
      "Contexto: seguem minhas vendas por mês nos últimos [PERIODO]: [DADOS].\nObjetivo: entender o padrão do meu ano.\nFormato: os meses fortes e fracos, a variação entre eles, e o que isso sugere para estoque, equipe e caixa.\nRestrições: com menos de dois anos de dados, avise que o padrão ainda é hipótese. Não projete o futuro como certeza.",
    categoria: "Análise de dados",
    setor: "Dados",
    dica:
      "Saber o mês fraco com antecedência muda tudo: é quando se planeja férias, manutenção e caixa de reserva.",
    exemploPreenchido:
      "Contexto: seguem as vendas mensais dos últimos 24 meses da minha sorveteria.",
    variaveis: [
      v("PERIODO", "Período", "24 meses"),
      v("DADOS", "Os dados", "cole a tabela"),
    ],
    ferramentasSugeridas: ["gemini-workspace", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["sazonalidade", "planejamento"],
  },
  {
    titulo: "Transformar uma planilha bagunçada em tabela útil",
    corpo:
      "Contexto: tenho uma planilha com dados inconsistentes — nomes escritos de formas diferentes, datas em formatos variados, células vazias. Amostra: [AMOSTRA].\nObjetivo: padronizar antes de analisar.\nFormato: aponte os problemas encontrados, a regra de padronização para cada um, e devolva a amostra corrigida.\nRestrições: não invente dado para preencher vazio — marque como [SEM DADO]. Não junte registros parecidos sem me perguntar.",
    categoria: "Análise de dados",
    setor: "Dados",
    dica:
      "Nunca deixe a IA preencher vazio por conta própria. Dado inventado numa planilha some no meio dos reais.",
    exemploPreenchido:
      "Contexto: planilha de clientes com 'Jose Silva', 'JOSÉ SILVA' e 'j. silva' como entradas diferentes.",
    variaveis: [v("AMOSTRA", "Amostra da planilha", "cole algumas linhas")],
    ferramentasSugeridas: ["gemini-workspace", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["limpeza", "planilha", "dados"],
  },
  {
    titulo: "Comparar dois períodos sem se enganar",
    corpo:
      "Contexto: quero comparar [PERIODO_A] com [PERIODO_B]. Dados: [DADOS].\nObjetivo: entender o que mudou de verdade.\nFormato: o que subiu, o que caiu, e quanto disso pode ser explicado por diferença de dias úteis, sazonalidade ou evento pontual.\nRestrições: não atribua causa sem evidência; separe o que os dados mostram do que seria preciso investigar.",
    categoria: "Análise de dados",
    setor: "Dados",
    dica:
      "Comparar mês com mês sem ajustar dias úteis engana. Fevereiro sempre parece pior que março.",
    exemploPreenchido:
      "Contexto: quero comparar o primeiro semestre deste ano com o do ano passado.",
    variaveis: [
      v("PERIODO_A", "Primeiro período", "1º semestre de 2026"),
      v("PERIODO_B", "Segundo período", "1º semestre de 2025"),
      v("DADOS", "Os dados", "cole"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "gemini-workspace"],
    nivelDificuldade: "Avançado",
    tags: ["comparação", "período"],
  },
  {
    titulo: "Fórmula de planilha explicada",
    corpo:
      "Contexto: preciso que a planilha faça isto: [O_QUE_PRECISO]. Minhas colunas são: [COLUNAS].\nObjetivo: a fórmula pronta e o entendimento dela.\nFormato: a fórmula para colar, o que cada parte faz, e o que acontece se a coluna estiver vazia ou com texto no lugar de número.\nRestrições: use funções que existam no Google Planilhas gratuito; nada de macro nem script.",
    categoria: "Análise de dados",
    setor: "Dados",
    dica:
      "Peça sempre o que acontece com célula vazia. É onde a planilha quebra, e sempre no dia em que você precisa dela.",
    exemploPreenchido:
      "Contexto: preciso somar as vendas só do vendedor X no mês Y. Colunas: data, vendedor, produto, valor.",
    variaveis: [
      v("O_QUE_PRECISO", "O que a planilha deve fazer", "somar por vendedor e mês"),
      v("COLUNAS", "Suas colunas", "data, vendedor, produto, valor"),
    ],
    ferramentasSugeridas: ["gemini-workspace", "chatgpt-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["fórmula", "planilha", "sheets"],
  },

  /* ---------------- DOCUMENTOS ---------------- */
  {
    titulo: "Comparar duas versões de um documento",
    corpo:
      "Contexto: recebi uma nova versão de [DOCUMENTO]. Versão anterior: [ANTERIOR]. Nova: [NOVA].\nObjetivo: saber o que mudou.\nFormato: o que foi acrescentado, o que saiu, o que mudou de sentido, e quais mudanças me afetam.\nRestrições: liste tudo que mudou, inclusive o que parecer detalhe; deixe que eu decida o que é relevante.",
    categoria: "Documentos",
    setor: "Administrativo",
    dica:
      "Mudança de uma palavra em contrato pode mudar tudo. Peça a lista completa e filtre você.",
    exemploPreenchido:
      "Contexto: recebi a nova versão do contrato de aluguel, com reajuste anual.",
    variaveis: [
      v("DOCUMENTO", "O documento", "contrato de aluguel"),
      v("ANTERIOR", "Versão anterior", "cole"),
      v("NOVA", "Versão nova", "cole"),
    ],
    ferramentasSugeridas: ["claude-negocios", "notebooklm-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["contrato", "comparação"],
  },
  {
    titulo: "Transformar áudio de reunião em registro escrito",
    corpo:
      "Contexto: segue a transcrição de uma conversa do meu negócio: [TRANSCRICAO].\nObjetivo: transformar em registro útil.\nFormato: resumo do que foi tratado, decisões tomadas, tarefas com dono e prazo, e pontos que ficaram em aberto.\nRestrições: não invente decisão que não foi tomada; o que ficou em aberto tem de aparecer como aberto, não resolvido.",
    categoria: "Documentos",
    setor: "Administrativo",
    dica:
      "A lista de pontos em aberto é o que faz a próxima reunião começar de onde esta parou.",
    exemploPreenchido:
      "Contexto: transcrição da conversa com o sócio sobre abrir a segunda unidade.",
    variaveis: [v("TRANSCRICAO", "A transcrição", "cole aqui")],
    ferramentasSugeridas: ["claude-negocios", "chatgpt-negocios"],
    nivelDificuldade: "Inicial",
    tags: ["reunião", "ata", "registro"],
  },
  {
    titulo: "Preencher um formulário ou edital complicado",
    corpo:
      "Contexto: preciso preencher [FORMULARIO] e não entendo o que pedem em [CAMPOS]. Meu negócio é: [NEGOCIO].\nObjetivo: entender o que cada campo quer.\nFormato: para cada campo, o que estão perguntando em linguagem simples, um exemplo de resposta adequada ao meu caso, e o que não se deve escrever ali.\nRestrições: não preencha por mim com dado inventado; onde depender de informação minha, indique o que buscar e onde.",
    categoria: "Documentos",
    setor: "Administrativo",
    dica:
      "Formulário de edital usa vocabulário próprio. Traduzir campo a campo é o que impede a desclassificação por bobagem.",
    exemploPreenchido:
      "Contexto: preciso preencher o cadastro de fornecedor de uma prefeitura e não entendo 'objeto social' nem 'capacidade técnica'.",
    variaveis: [
      v("FORMULARIO", "Qual formulário", "cadastro de fornecedor"),
      v("CAMPOS", "Campos difíceis", "objeto social, capacidade técnica"),
      v("NEGOCIO", "Seu negócio", "empresa de limpeza"),
    ],
    ferramentasSugeridas: ["chatgpt-negocios", "claude-negocios"],
    nivelDificuldade: "Intermediário",
    tags: ["formulário", "edital", "burocracia"],
  },
];
