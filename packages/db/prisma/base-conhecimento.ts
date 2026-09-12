/**
 * Base de Conhecimento Educacional.
 *
 * É a única fonte das explicações que aparecem em toda a aplicação: o
 * ícone ⓘ ao lado de um termo, a Central de Conhecimento e a consulta em
 * linguagem natural leem daqui. Editar um verbete aqui (ou pelo painel
 * administrativo) muda a explicação em todas as telas de uma vez.
 *
 * Campos que merecem explicação:
 *
 * - `importancias` responde "por que isso aparece AQUI?" por contexto. A
 *   mesma palavra não significa a mesma coisa no planejamento e no banco
 *   de prompts, e uma explicação genérica nos dois lugares não ajuda
 *   ninguém. Os contextos são os das telas: `inicio`, `trilha`, `licao`,
 *   `prompts`, `criar-prompt`, `gerador`, `ferramentas`, `diario`,
 *   `missoes`, `conquistas`, `planejamento`, `privacidade`.
 *
 * - `fonteNome`/`fonteUrl` só existem quando há documento oficial. A
 *   ausência é informativa: sem fonte, a interface mostra o verbete como
 *   "explicação didática da plataforma", nunca como norma.
 *
 * - `saibaMaisUrl` aceita rota interna (`/app/...`) — preferida quando o
 *   material existe aqui dentro — ou link externo oficial.
 *
 * Regra que não pode ser quebrada: nenhum código da BNCC é descrito por
 * aproximação. Os verbetes explicam COMO ler um código e mandam conferir
 * a descrição no documento oficial; não afirmam o conteúdo de habilidade
 * nenhuma.
 */

export type VerbeteConhecimento = {
  slug: string;
  termo: string;
  sinonimos: string[];
  categoria: string;
  resumo: string;
  explicacao: string;
  importancias: Record<string, string> | null;
  fonteNome: string | null;
  fonteUrl: string | null;
  saibaMaisUrl: string | null;
  relacionadoSlugs: string[];
};

/** Categorias da Central de Conhecimento, na ordem de exibição. */
export const CATEGORIAS_CONHECIMENTO = [
  "Documento educacional",
  "BNCC",
  "Planejamento",
  "Avaliação",
  "Inclusão",
  "Metodologias",
  "Uso de IA",
  "Segurança",
  "A plataforma",
] as const;

export const BASE_CONHECIMENTO: VerbeteConhecimento[] = [
  // ---------------------------------------------------------------- BNCC
  {
    slug: "bncc",
    termo: "BNCC",
    sinonimos: ["Base Nacional Comum Curricular", "base nacional", "base comum"],
    categoria: "Documento educacional",
    resumo: "Documento normativo que define as aprendizagens essenciais de toda a Educação Básica.",
    explicacao:
      "A Base Nacional Comum Curricular (BNCC) é um documento de caráter normativo que define o conjunto orgânico e progressivo de aprendizagens essenciais que todos os estudantes devem desenvolver ao longo da Educação Básica — da Educação Infantil ao Ensino Médio.\n\nEla não é um currículo pronto nem um plano de aula. É uma referência comum: as redes de ensino e as escolas constroem seus currículos a partir dela, considerando a realidade local. O seu planejamento continua sendo seu.\n\nNa prática, a BNCC diz o que se espera que os estudantes aprendam; você decide como isso acontece na sua turma.",
    importancias: {
      planejamento: "Serve para conferir se o objetivo da sua aula conversa com uma aprendizagem prevista para aquela etapa — não para preencher um campo por obrigação.",
      prompts: "Quando você pede à IA uma atividade alinhada à BNCC, ela pode inventar códigos. Confira sempre a descrição na fonte oficial antes de usar.",
      gerador: "Informar a etapa e o objetivo ajuda o prompt a gerar algo compatível com a turma; a conferência do alinhamento continua sendo sua.",
      licao: "Este curso usa a BNCC como referência comum para falar de objetivos de aprendizagem sem depender do currículo de uma rede específica.",
    },
    fonteNome: "Portal oficial da BNCC · MEC",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/",
    saibaMaisUrl: "/app/conhecimento/bncc",
    relacionadoSlugs: ["competencia", "habilidade-bncc", "codigo-bncc", "competencias-gerais", "etapa-ensino"],
  },
  {
    slug: "competencia",
    termo: "Competência",
    sinonimos: ["competências", "competencia"],
    categoria: "BNCC",
    resumo: "Mobilizar conhecimentos, habilidades, atitudes e valores para resolver demandas complexas.",
    explicacao:
      "Na BNCC, competência é definida como a mobilização de conhecimentos (conceitos e procedimentos), habilidades (práticas, cognitivas e socioemocionais), atitudes e valores para resolver demandas complexas da vida cotidiana, do pleno exercício da cidadania e do mundo do trabalho.\n\nÉ um conceito mais amplo que conteúdo. Saber a regra de três é conhecimento; usá-la para decidir uma compra é competência.\n\nA BNCC organiza dez competências gerais que atravessam todas as etapas e componentes — elas não pertencem a uma disciplina só.",
    importancias: {
      planejamento: "Ajuda a olhar a aula por inteiro: o que o estudante vai conseguir fazer, e não apenas o que vai memorizar.",
      prompts: "Pedir 'desenvolva a competência X' costuma render material mais interessante que pedir 'ensine o conteúdo Y'.",
    },
    fonteNome: "BNCC · MEC",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: "/app/conhecimento/bncc",
    relacionadoSlugs: ["bncc", "habilidade-bncc", "competencias-gerais"],
  },
  {
    slug: "competencias-gerais",
    termo: "Competências gerais da Educação Básica",
    sinonimos: ["10 competências", "dez competências", "competências gerais"],
    categoria: "BNCC",
    resumo: "As dez competências que atravessam todas as etapas e todos os componentes curriculares.",
    explicacao:
      "A BNCC define dez competências gerais que devem ser desenvolvidas ao longo de toda a Educação Básica, em todos os componentes. Elas tratam, entre outros pontos, de conhecimento, pensamento científico e crítico, repertório cultural, comunicação, cultura digital, trabalho e projeto de vida, argumentação, autoconhecimento, empatia e cooperação, e responsabilidade e cidadania.\n\nNão são uma disciplina nem um conteúdo a mais na lista: são o que se espera que atravesse as aulas que você já dá.\n\nA redação completa das dez está no documento oficial — vale ler na fonte, porque cada uma é um parágrafo denso que resumos costumam distorcer.",
    importancias: {
      planejamento: "Uma delas trata explicitamente de cultura digital — é onde o uso crítico de IA na escola se ancora.",
      licao: "Este curso se apoia especialmente na competência de cultura digital: usar tecnologia de forma crítica, significativa e ética.",
    },
    fonteNome: "BNCC · MEC (competências gerais)",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: "/app/conhecimento/bncc",
    relacionadoSlugs: ["bncc", "competencia", "cultura-digital"],
  },
  {
    slug: "habilidade-bncc",
    termo: "Habilidade",
    sinonimos: ["habilidades", "habilidade da BNCC"],
    categoria: "BNCC",
    resumo: "Aprendizagem específica e observável, descrita para uma etapa e um componente.",
    explicacao:
      "Habilidade, na BNCC, é a descrição de uma aprendizagem específica esperada em determinada etapa e componente curricular. Cada habilidade é escrita começando por um verbo que indica o processo cognitivo envolvido (identificar, comparar, analisar, justificar…), seguido do objeto de conhecimento e, quando há, do contexto de aplicação.\n\nÉ o nível mais concreto da Base: é a partir das habilidades que se desenham objetivo de aula, atividade e evidência de aprendizagem.\n\nUma habilidade não é uma etiqueta para colar no plano depois de a aula estar pronta. Se a atividade não pede o processo cognitivo que o verbo descreve, o alinhamento é só aparente.",
    importancias: {
      planejamento: "Use-a para checar coerência: o verbo da habilidade e o que a atividade realmente pede precisam ser o mesmo processo.",
      prompts: "Modelos de IA erram códigos e descrições de habilidade com frequência. Nunca copie um código sem conferir na fonte oficial.",
      gerador: "Descrever a aprendizagem desejada em palavras suas funciona melhor que citar um código que você ainda não conferiu.",
    },
    fonteNome: "BNCC · MEC",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: "/app/conhecimento/bncc",
    relacionadoSlugs: ["bncc", "competencia", "codigo-bncc", "objeto-conhecimento"],
  },
  {
    slug: "codigo-bncc",
    termo: "Código da habilidade",
    sinonimos: ["código da BNCC", "EF05CI05", "código alfanumérico", "codigo habilidade"],
    categoria: "BNCC",
    resumo: "Identificador alfanumérico que localiza uma habilidade no documento oficial.",
    explicacao:
      "Cada habilidade da BNCC recebe um código alfanumérico que serve para localizá-la no documento. No Ensino Fundamental, a estrutura tem quatro partes:\n\n• As duas primeiras letras indicam a etapa — EF para Ensino Fundamental.\n• Os dois números seguintes indicam o ano (01 a 09) ou o bloco de anos a que a habilidade se refere.\n• As duas letras seguintes indicam o componente curricular ou a área.\n• Os dois últimos números identificam a habilidade dentro daquele conjunto.\n\nAssim, em EF05CI05, lê-se: Ensino Fundamental, 5º ano, Ciências, quinta habilidade da lista. A Educação Infantil e o Ensino Médio usam estruturas próprias, com outros elementos.\n\nO código é endereço, não conteúdo. Ele diz onde a habilidade está; a descrição oficial é o que permite julgar se ela combina com a sua aula. Consulte sempre o documento antes de usar um código que você não verificou — inclusive (e principalmente) quando foi uma IA que sugeriu.",
    importancias: {
      planejamento: "Serve para registrar e localizar. A decisão pedagógica se baseia na descrição da habilidade, não na sigla.",
      prompts: "É o erro mais comum de IA em contexto escolar: código plausível com descrição errada, ou código que simplesmente não existe.",
    },
    fonteNome: "BNCC · documento oficial em PDF (MEC)",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf",
    saibaMaisUrl: "/app/conhecimento/bncc",
    relacionadoSlugs: ["bncc", "habilidade-bncc", "etapa-ensino", "componente-curricular"],
  },
  {
    slug: "objeto-conhecimento",
    termo: "Objeto de conhecimento",
    sinonimos: ["objetos de conhecimento", "conteúdo"],
    categoria: "BNCC",
    resumo: "O conteúdo, conceito ou processo sobre o qual a habilidade se aplica.",
    explicacao:
      "Objeto de conhecimento é o termo que a BNCC usa para o que tradicionalmente se chamava de conteúdo: conceitos, processos e práticas sobre os quais a habilidade incide.\n\nA Base organiza as habilidades em unidades temáticas, que reúnem objetos de conhecimento afins. A escolha do termo é intencional: 'objeto de conhecimento' aponta para algo que se investiga, não para uma lista a cumprir.",
    importancias: {
      planejamento: "É a ponte entre o tema que você quer dar e a habilidade prevista para aquela etapa.",
    },
    fonteNome: "BNCC · MEC",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: null,
    relacionadoSlugs: ["habilidade-bncc", "unidade-tematica"],
  },
  {
    slug: "unidade-tematica",
    termo: "Unidade temática",
    sinonimos: ["unidades temáticas"],
    categoria: "BNCC",
    resumo: "Agrupamento de objetos de conhecimento afins dentro de um componente.",
    explicacao:
      "Unidade temática é como a BNCC agrupa os objetos de conhecimento de um componente curricular. Em Matemática, por exemplo, as unidades organizam grandes campos como números, álgebra, geometria, grandezas e medidas, probabilidade e estatística.\n\nElas ajudam a ver a progressão: a mesma unidade reaparece em anos diferentes, com habilidades cada vez mais exigentes.",
    importancias: {
      planejamento: "Útil para enxergar o que vem antes e o que vem depois do que você está ensinando.",
    },
    fonteNome: "BNCC · MEC",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: null,
    relacionadoSlugs: ["objeto-conhecimento", "habilidade-bncc", "progressao"],
  },
  {
    slug: "etapa-ensino",
    termo: "Etapa de ensino",
    sinonimos: ["etapa", "Educação Infantil", "Ensino Fundamental", "Ensino Médio", "anos iniciais", "anos finais"],
    categoria: "BNCC",
    resumo: "As três grandes divisões da Educação Básica: Infantil, Fundamental e Médio.",
    explicacao:
      "A Educação Básica se organiza em três etapas: Educação Infantil, Ensino Fundamental (dividido em anos iniciais, 1º ao 5º, e anos finais, 6º ao 9º) e Ensino Médio.\n\nCada etapa tem estrutura própria na BNCC. A Educação Infantil trabalha com campos de experiência e objetivos de aprendizagem e desenvolvimento, não com componentes curriculares no formato das outras etapas. O Ensino Fundamental se organiza por áreas e componentes. O Ensino Médio combina a formação geral básica com itinerários formativos.\n\nPor isso a etapa muda a leitura de tudo: o mesmo tema tem formatos, códigos e expectativas diferentes em cada uma.",
    importancias: {
      prompts: "É o contexto que mais muda o resultado de um prompt. 'Atividade sobre água' sem etapa gera algo para ninguém.",
      gerador: "Informar o ano ou a faixa etária é o que faz o material chegar no nível de linguagem da sua turma.",
      planejamento: "Define qual parte do documento oficial você precisa consultar.",
    },
    fonteNome: "BNCC · MEC",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: null,
    relacionadoSlugs: ["bncc", "codigo-bncc", "campos-experiencia"],
  },
  {
    slug: "componente-curricular",
    termo: "Componente curricular",
    sinonimos: ["componentes curriculares", "disciplina", "área do conhecimento"],
    categoria: "BNCC",
    resumo: "O que a escola costuma chamar de disciplina, agrupado em áreas do conhecimento.",
    explicacao:
      "Componente curricular é o termo da BNCC para o que a escola geralmente chama de disciplina — Língua Portuguesa, Matemática, Ciências, História, e assim por diante.\n\nOs componentes se agrupam em áreas do conhecimento: Linguagens, Matemática, Ciências da Natureza, Ciências Humanas e Ensino Religioso no Ensino Fundamental.\n\nO agrupamento por área tem uma consequência prática: ele sinaliza onde o trabalho interdisciplinar tem mais afinidade natural.",
    importancias: {
      prompts: "Informar o componente ajuda a IA a usar o vocabulário e os exemplos daquele campo.",
    },
    fonteNome: "BNCC · MEC",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: null,
    relacionadoSlugs: ["codigo-bncc", "interdisciplinaridade", "etapa-ensino"],
  },
  {
    slug: "campos-experiencia",
    termo: "Campos de experiência",
    sinonimos: ["campo de experiência", "Educação Infantil BNCC"],
    categoria: "BNCC",
    resumo: "A forma como a BNCC organiza a Educação Infantil — não há componentes curriculares nessa etapa.",
    explicacao:
      "Na Educação Infantil, a BNCC não trabalha com componentes curriculares nem com habilidades no mesmo formato das outras etapas. Ela organiza cinco campos de experiência e define objetivos de aprendizagem e desenvolvimento, articulados a seis direitos de aprendizagem: conviver, brincar, participar, explorar, expressar e conhecer-se.\n\nOs campos partem das experiências concretas da criança — o corpo, os gestos, a fala, os sons, as formas, as quantidades e as relações com o outro.\n\nÉ um erro comum tratar a Educação Infantil como uma versão simplificada do Fundamental. A estrutura é outra, e os códigos também.",
    importancias: {
      prompts: "Se a sua turma é de Educação Infantil, diga isso: pedir 'habilidade da BNCC' aqui costuma fazer a IA devolver código de Fundamental.",
      planejamento: "O planejamento se ancora em campos de experiência e direitos de aprendizagem, não em lista de conteúdos.",
    },
    fonteNome: "BNCC · Educação Infantil (MEC)",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: null,
    relacionadoSlugs: ["bncc", "etapa-ensino"],
  },
  {
    slug: "progressao",
    termo: "Progressão das aprendizagens",
    sinonimos: ["progressão", "progressão curricular"],
    categoria: "Planejamento",
    resumo: "A forma como as aprendizagens ficam mais complexas ao longo dos anos.",
    explicacao:
      "Progressão é o encadeamento entre o que se aprende em um ano e o que se espera no seguinte. A BNCC é explicitamente progressiva: habilidades da mesma unidade temática reaparecem ao longo das etapas com verbos e objetos mais exigentes.\n\nOlhar a progressão evita dois problemas comuns: repetir no 7º ano o que já foi feito no 6º, e cobrar um processo cognitivo para o qual a turma ainda não teve as condições anteriores.",
    importancias: {
      planejamento: "Ajuda a decidir o ponto de partida real da aula, que às vezes está um ano atrás do previsto.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["unidade-tematica", "habilidade-bncc", "sequencia-didatica"],
  },

  // -------------------------------------------------------- Planejamento
  {
    slug: "objetivo-pedagogico",
    termo: "Objetivo pedagógico",
    sinonimos: ["objetivo de aprendizagem", "objetivo da aula", "objetivo"],
    categoria: "Planejamento",
    resumo: "Descrição clara da aprendizagem que a aula pretende favorecer.",
    explicacao:
      "O objetivo pedagógico responde a uma pergunta: ao fim desta aula, o que o estudante deve conseguir fazer ou compreender que antes não conseguia?\n\nUm bom objetivo é observável. 'Trabalhar frações' não é objetivo — é assunto. 'Comparar frações com denominadores diferentes usando representação visual' é objetivo: dá para desenhar uma atividade a partir dele e dá para saber se aconteceu.\n\nEle é a peça que organiza todas as outras: atividade, tempo, recursos e avaliação decorrem dele.",
    importancias: {
      prompts: "É o campo que mais melhora o resultado. Sem objetivo, a IA entrega material bonito e desconectado da aprendizagem.",
      gerador: "Preencher o objetivo é o que diferencia uma atividade útil de um material genérico sobre o tema.",
      planejamento: "Se você não consegue escrever o objetivo, a aula ainda não está planejada — só o assunto está escolhido.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/criar-prompt",
    relacionadoSlugs: ["habilidade-bncc", "avaliacao-formativa", "evidencia-aprendizagem"],
  },
  {
    slug: "sequencia-didatica",
    termo: "Sequência didática",
    sinonimos: ["sequências didáticas", "sequencia didatica"],
    categoria: "Planejamento",
    resumo: "Conjunto de aulas encadeadas em torno de um mesmo objetivo de aprendizagem.",
    explicacao:
      "Uma sequência didática é um conjunto de aulas planejadas em ordem, ligadas por um mesmo objetivo. Não é uma lista de aulas sobre o mesmo tema: cada etapa depende da anterior e prepara a seguinte.\n\nEla costuma ter um movimento reconhecível: uma abertura que ativa o que a turma já sabe, momentos de aprofundamento com apoio, prática cada vez mais autônoma e um fechamento que produz alguma evidência de aprendizagem.\n\nPlanejar em sequência, e não aula por aula, é o que permite retomar o que não funcionou sem perder o fio.",
    importancias: {
      prompts: "Pedir uma sequência exige informar quantas aulas, a duração de cada uma e a evidência final — sem isso a IA devolve aulas soltas.",
      planejamento: "É a unidade de planejamento mais útil na prática: uma aula isolada raramente dá conta de um objetivo inteiro.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["objetivo-pedagogico", "progressao", "plano-aula"],
  },
  {
    slug: "plano-aula",
    termo: "Plano de aula",
    sinonimos: ["planos de aula", "planejamento de aula"],
    categoria: "Planejamento",
    resumo: "Registro do que se pretende que aconteça em uma aula e por quê.",
    explicacao:
      "O plano de aula organiza a intenção: objetivo, o que a turma já sabe, etapas com tempo estimado, materiais realmente disponíveis, como a aprendizagem será observada e o que fazer se algo não funcionar.\n\nEle não existe para ser entregue à coordenação. Existe para que a aula tenha direção e para que você possa ajustá-la com informação, em vez de memória.\n\nUm plano honesto inclui um plano B. Internet que cai, projetor que não liga e metade da turma em prova de outra disciplina são condições reais.",
    importancias: {
      prompts: "Informar os recursos que existem de verdade na sua escola é o que evita um plano que depende de laboratório.",
      planejamento: "O plano é seu instrumento de trabalho; a IA pode rascunhar, mas a decisão sobre a turma é sempre sua.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["sequencia-didatica", "objetivo-pedagogico", "plano-b"],
  },
  {
    slug: "plano-b",
    termo: "Plano B",
    sinonimos: ["alternativa sem internet", "contingência"],
    categoria: "Planejamento",
    resumo: "A versão da aula que funciona quando o recurso principal falha.",
    explicacao:
      "Plano B é a alternativa prevista para quando a condição que a aula pressupõe não se cumpre: a internet cai, o projetor não liga, os tablets não foram carregados, chegou metade da turma.\n\nNão é pessimismo — é planejamento. Uma aula que só existe em uma configuração ideal é uma aula que frequentemente não acontece.\n\nAo pedir material a uma IA, peça explicitamente a alternativa sem tecnologia. Ela raramente oferece isso por conta própria.",
    importancias: {
      prompts: "Peça sempre 'inclua uma alternativa sem internet': é uma linha no prompt que salva a aula.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["plano-aula"],
  },
  {
    slug: "evidencia-aprendizagem",
    termo: "Evidência de aprendizagem",
    sinonimos: ["evidências de aprendizagem", "evidência"],
    categoria: "Avaliação",
    resumo: "O que o estudante produz ou demonstra e que permite dizer que a aprendizagem ocorreu.",
    explicacao:
      "Evidência de aprendizagem é aquilo que você pode observar e que sustenta a afirmação 'esta turma aprendeu isto'. Pode ser uma produção escrita, uma explicação oral, a resolução de um problema novo, um registro em caderno, a participação em uma discussão.\n\nA palavra-chave é observável. Engajamento não é evidência: uma turma pode estar animada e não ter aprendido; uma turma silenciosa pode ter aprendido.\n\nDefinir a evidência antes da atividade evita descobrir no fim que nada do que aconteceu permite avaliar o objetivo.",
    importancias: {
      planejamento: "Decidir a evidência junto com o objetivo é o que torna a avaliação parte da aula, e não um evento posterior.",
      prompts: "Pedir 'indique qual evidência de aprendizagem cada etapa produz' melhora muito a qualidade do material gerado.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["avaliacao-formativa", "objetivo-pedagogico", "rubrica"],
  },
  {
    slug: "interdisciplinaridade",
    termo: "Interdisciplinaridade",
    sinonimos: ["interdisciplinar", "projeto interdisciplinar"],
    categoria: "Metodologias",
    resumo: "Trabalho que articula componentes diferentes em torno de um mesmo problema.",
    explicacao:
      "Interdisciplinaridade é a articulação de dois ou mais componentes curriculares em torno de uma questão que nenhum deles resolveria sozinho.\n\nO teste é simples: cada componente contribui com uma aprendizagem própria e necessária? Se Matemática entra só para 'fazer o gráfico' de um projeto de Ciências, não é interdisciplinaridade — é decoração.\n\nProjetos interdisciplinares funcionam melhor quando partem de um problema real e local, com um produto que alguém além do professor vai ver.",
    importancias: {
      prompts: "Diga quais componentes entram e o que cada um precisa desenvolver — senão a IA distribui tarefas superficiais.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["componente-curricular", "aprendizagem-baseada-projetos"],
  },
  {
    slug: "aprendizagem-baseada-projetos",
    termo: "Aprendizagem baseada em projetos",
    sinonimos: ["ABP", "PBL", "projetos"],
    categoria: "Metodologias",
    resumo: "Metodologia em que a turma investiga um problema real e produz algo para um público.",
    explicacao:
      "Na aprendizagem baseada em projetos, a turma investiga uma pergunta ou problema autêntico durante um período estendido e produz um resultado público — uma proposta, uma campanha, um protótipo, uma apresentação para a comunidade.\n\nO que distingue um projeto de um trabalho longo é a pergunta norteadora: ela precisa ser aberta o suficiente para exigir investigação, e concreta o suficiente para ter resposta.\n\nA aprendizagem tem que estar no caminho, não só no produto final. Um cartaz bonito no fim não garante que houve aprendizagem no meio.",
    importancias: {
      prompts: "Um bom prompt de projeto define pergunta norteadora, etapas por aula, papéis dos estudantes e critérios de avaliação.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["interdisciplinaridade", "metodologias-ativas", "rubrica"],
  },
  {
    slug: "metodologias-ativas",
    termo: "Metodologias ativas",
    sinonimos: ["metodologia ativa", "aprendizagem ativa"],
    categoria: "Metodologias",
    resumo: "Abordagens em que o estudante age sobre o conhecimento em vez de apenas receber a exposição.",
    explicacao:
      "Metodologias ativas é o nome que reúne abordagens em que o estudante ocupa um papel de investigação, produção ou decisão — resolução de problemas, projetos, estudo de caso, sala de aula invertida, aprendizagem entre pares.\n\nAtivo não significa agitado, e passivo não é sinônimo de exposição. Uma aula expositiva bem conduzida, com perguntas que exigem pensar, pode ser mais ativa que um trabalho em grupo sem propósito claro.\n\nO critério é cognitivo: a atividade exige que o estudante processe, decida, justifique? Então é ativa.",
    importancias: {
      prompts: "Nomear a metodologia desejada é mais eficaz que pedir 'uma aula dinâmica' — que a IA traduz em jogos genéricos.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["aprendizagem-baseada-projetos", "sala-aula-invertida"],
  },
  {
    slug: "sala-aula-invertida",
    termo: "Sala de aula invertida",
    sinonimos: ["ensino híbrido invertido", "flipped classroom"],
    categoria: "Metodologias",
    resumo: "O primeiro contato com o conteúdo acontece antes da aula; o tempo de aula vira prática e mediação.",
    explicacao:
      "Na sala de aula invertida, o primeiro contato com o conteúdo acontece fora do encontro — texto, vídeo, roteiro de leitura — e o tempo de aula é usado para o que precisa do professor presente: dúvida, prática guiada, discussão, erro trabalhado.\n\nA aposta é sobre onde a mediação docente vale mais. Explicar um conceito pela primeira vez pode ser gravado; ajudar alguém que travou no meio de um problema, não.\n\nDepende de uma condição real: acesso ao material prévio. Sem isso, a aula invertida vira aula perdida para quem não conseguiu ver nada antes.",
    importancias: {
      prompts: "Peça o roteiro prévio e a atividade de aula separadamente, e uma alternativa para quem chegou sem ter acessado o material.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["metodologias-ativas"],
  },

  // ------------------------------------------------------------ Avaliação
  {
    slug: "avaliacao-formativa",
    termo: "Avaliação formativa",
    sinonimos: ["feedback", "devolutiva", "avaliação de processo"],
    categoria: "Avaliação",
    resumo: "Coleta de evidências durante o processo para ajustar o ensino e orientar o estudante.",
    explicacao:
      "Avaliação formativa acontece durante o percurso e serve para decidir o próximo passo — do professor e do estudante. Pode ser uma pergunta bem colocada, a observação de como a turma resolve um problema, um bilhete de saída, a leitura rápida de três cadernos.\n\nA diferença em relação à avaliação somativa não está no instrumento, e sim no uso: se o resultado muda o que você vai fazer na aula seguinte, é formativa; se apenas registra um desempenho, é somativa.\n\nSem devolutiva, não há avaliação formativa. A informação precisa voltar para quem pode agir sobre ela.",
    importancias: {
      planejamento: "Planeje o que observar e o que fará com essa informação — não apenas qual instrumento aplicar.",
      prompts: "Pedir 'inclua um momento de avaliação formativa com o que observar' é mais útil que pedir 'inclua avaliação'.",
      diario: "Registrar o que funcionou e o que não funcionou é avaliação formativa aplicada à sua própria prática.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["avaliacao-somativa", "rubrica", "evidencia-aprendizagem", "feedback-acionavel"],
  },
  {
    slug: "avaliacao-somativa",
    termo: "Avaliação somativa",
    sinonimos: ["avaliação de resultado", "prova"],
    categoria: "Avaliação",
    resumo: "Avaliação que sintetiza o que foi aprendido ao fim de um percurso.",
    explicacao:
      "Avaliação somativa faz um balanço ao final de um período ou unidade: sintetiza o que foi aprendido e normalmente alimenta um registro formal, como uma nota ou conceito.\n\nEla não é o oposto ruim da formativa — as duas cumprem funções diferentes e necessárias. O problema aparece quando a somativa é a única que existe: aí a informação sobre a aprendizagem chega quando já não dá para agir sobre ela.\n\nUma somativa bem feita avalia o que foi de fato ensinado, no mesmo nível de exigência com que foi trabalhado.",
    importancias: {
      planejamento: "Vale conferir o alinhamento: o que a prova cobra é o mesmo processo cognitivo que a aula desenvolveu?",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["avaliacao-formativa", "rubrica"],
  },
  {
    slug: "avaliacao-diagnostica",
    termo: "Avaliação diagnóstica",
    sinonimos: ["diagnóstico inicial", "sondagem"],
    categoria: "Avaliação",
    resumo: "Levantamento do que a turma já sabe, antes de planejar o percurso.",
    explicacao:
      "A avaliação diagnóstica acontece antes ou no início de um percurso e serve para descobrir de onde partir: o que a turma já domina, quais pré-requisitos estão frágeis, que concepções alternativas aparecem.\n\nNão precisa de nota nem de prova. Uma pergunta bem escolhida, um problema para resolver em duplas ou um mapa rápido de ideias já dão a informação necessária.\n\nO valor dela depende inteiramente do que se faz depois: um diagnóstico que não altera o planejamento foi tempo gasto sem retorno.",
    importancias: {
      planejamento: "É o que evita planejar para uma turma imaginária.",
      prompts: "Peça 'um diagnóstico inicial sem nota' quando for planejar recuperação ou reforço.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["avaliacao-formativa", "recuperacao"],
  },
  {
    slug: "rubrica",
    termo: "Rubrica",
    sinonimos: ["rubrica de avaliação", "matriz de critérios"],
    categoria: "Avaliação",
    resumo: "Quadro que descreve critérios de qualidade e níveis de desempenho observáveis.",
    explicacao:
      "Uma rubrica torna visíveis os critérios de qualidade de um trabalho. Ela cruza critérios (o que se avalia) com níveis de desempenho (como se reconhece cada grau), descrevendo em cada cruzamento o que se observa concretamente.\n\nO que faz uma rubrica funcionar é a descrição, não a escala. 'Bom: argumenta bem' não ajuda ninguém. 'Apresenta ao menos dois argumentos sustentados por dados do texto' ajuda — o estudante consegue verificar sozinho.\n\nEntregar a rubrica antes da atividade, e não junto com a nota, é o que a transforma em instrumento de aprendizagem.",
    importancias: {
      prompts: "Ao pedir uma rubrica à IA, defina os critérios você mesmo e revise se os níveis são compreensíveis para a sua turma.",
      planejamento: "Compartilhar a rubrica com a turma antecipadamente muda a qualidade do que é entregue.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["avaliacao-formativa", "evidencia-aprendizagem", "feedback-acionavel"],
  },
  {
    slug: "feedback-acionavel",
    termo: "Feedback acionável",
    sinonimos: ["devolutiva acionável", "retorno ao estudante"],
    categoria: "Avaliação",
    resumo: "Retorno que descreve evidências e indica um próximo passo concreto.",
    explicacao:
      "Feedback acionável tem três partes: o que foi observado (evidência), por que isso importa em relação ao critério, e qual o próximo passo.\n\n'Está confuso' não é acionável. 'O segundo parágrafo apresenta duas ideias diferentes sem ligação entre elas; escolha uma delas e desenvolva com um exemplo' é acionável — há algo a fazer.\n\nUm próximo passo por vez. Dez apontamentos numa produção paralisam em vez de orientar.",
    importancias: {
      prompts: "É um dos usos de IA com melhor retorno: rascunhar modelos de devolutiva que você depois ajusta e personaliza.",
      privacidade: "Nunca cole a produção identificada de um estudante em ferramenta externa para gerar devolutiva.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["avaliacao-formativa", "rubrica", "parecer-descritivo"],
  },
  {
    slug: "parecer-descritivo",
    termo: "Parecer descritivo",
    sinonimos: ["pareceres", "relatório individual", "parecer"],
    categoria: "Avaliação",
    resumo: "Texto que descreve o percurso de aprendizagem de um estudante em determinado período.",
    explicacao:
      "O parecer descritivo relata o percurso de aprendizagem de um estudante: o que se consolidou, o que está em processo, que apoios funcionaram e que metas fazem sentido adiante.\n\nEle descreve aprendizagem, não personalidade. 'É desatento' fala do estudante; 'sustenta a atenção em tarefas curtas e se dispersa em atividades longas de leitura' descreve algo observável, sobre o qual é possível agir.\n\nÉ uma das tarefas em que a IA economiza mais tempo — e uma das mais sensíveis em privacidade. Use descrições genéricas ou fictícias no rascunho e personalize depois, fora da ferramenta.",
    importancias: {
      prompts: "Substitua nome, laudo e nota por descrições genéricas antes de colar qualquer coisa em ferramenta externa.",
      diario: "É a tarefa em que professores costumam registrar a maior economia de tempo neste diário.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["feedback-acionavel", "privacidade", "anonimizacao"],
  },
  {
    slug: "recuperacao",
    termo: "Recuperação e reforço",
    sinonimos: ["recuperação", "reforço", "rota de recuperação"],
    categoria: "Avaliação",
    resumo: "Percurso de apoio para quem não consolidou uma aprendizagem, sem reduzir o objetivo.",
    explicacao:
      "Recuperação é o percurso planejado para quem não consolidou uma aprendizagem específica. O que a distingue de 'dar a mesma aula de novo' é o diagnóstico: é preciso saber onde exatamente a compreensão travou.\n\nDois cuidados fazem diferença. O primeiro é preservar o objetivo: apoiar o caminho, não rebaixar a meta. O segundo é não expor: um agrupamento que a turma identifica como 'o grupo dos que não sabem' produz mais dano que benefício.\n\nDescreva a barreira de aprendizagem, nunca o estudante.",
    importancias: {
      prompts: "Diga qual obstáculo específico foi observado — 'confunde numerador e denominador' rende material muito melhor que 'tem dificuldade em frações'.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["avaliacao-diagnostica", "diferenciacao", "privacidade"],
  },

  // -------------------------------------------------------------- Inclusão
  {
    slug: "diferenciacao",
    termo: "Diferenciação pedagógica",
    sinonimos: ["diferenciação", "níveis de apoio", "atividade em níveis"],
    categoria: "Inclusão",
    resumo: "Ajustar caminhos e apoios para que a turma inteira alcance o mesmo objetivo.",
    explicacao:
      "Diferenciação é oferecer caminhos e apoios distintos para um objetivo comum. Varia o grau de suporte, o formato do material, o tempo, o tamanho do texto — não o que se espera aprender.\n\nA confusão frequente é entre diferenciar e rebaixar. Uma versão com texto mais curto e vocabulário controlado mantém a exigência cognitiva; uma versão que troca 'justificar' por 'copiar' mudou o objetivo.\n\nDois cuidados de forma: as versões devem parecer semelhantes entre si, e os níveis descrevem a atividade, nunca os estudantes. Rótulo colado em criança fica.",
    importancias: {
      prompts: "Peça 'três versões com o mesmo tema e aparência semelhante, variando o nível de apoio' — e revise se nenhuma infantiliza.",
      planejamento: "Prever dois níveis de apoio na atividade principal costuma ser mais viável que criar material separado.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["acessibilidade", "recuperacao", "desenho-universal"],
  },
  {
    slug: "acessibilidade",
    termo: "Acessibilidade",
    sinonimos: ["material acessível", "acesso"],
    categoria: "Inclusão",
    resumo: "Garantir que o material e a atividade possam ser usados por todos os estudantes.",
    explicacao:
      "Acessibilidade, no material didático, significa remover barreiras de acesso à informação e à participação: contraste suficiente, fonte legível, descrição de imagens que carregam informação, instruções em passos curtos, linguagem sem ambiguidade, alternativa para quem não ouve ou não vê o recurso principal.\n\nA maior parte dessas escolhas beneficia a turma inteira, não apenas quem tem uma necessidade específica. Instrução clara é melhor para todos.\n\nMaterial gerado por IA raramente já vem acessível. Vale pedir explicitamente e revisar.",
    importancias: {
      prompts: "Inclua acessibilidade na revisão do prompt: descrição de imagens, instruções curtas, alternativa ao recurso visual.",
      ferramentas: "Ao exportar material de uma ferramenta, confira contraste e legibilidade antes de imprimir ou projetar.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["diferenciacao", "desenho-universal"],
  },
  {
    slug: "desenho-universal",
    termo: "Desenho Universal para a Aprendizagem",
    sinonimos: ["DUA", "desenho universal"],
    categoria: "Inclusão",
    resumo: "Planejar desde o início com múltiplas formas de acesso, participação e expressão.",
    explicacao:
      "O Desenho Universal para a Aprendizagem (DUA) propõe planejar a aula já prevendo a variabilidade da turma, em vez de adaptar depois caso a caso. Trabalha com múltiplas formas de apresentar a informação, de engajar e de permitir que o estudante demonstre o que aprendeu.\n\nUm exemplo concreto: se a evidência de aprendizagem pode ser um texto, um áudio ou um esquema, mais estudantes conseguem mostrar o que sabem — e nenhum precisa de adaptação especial no dia.\n\nÉ mais econômico que adaptar: uma aula planejada com alternativas desde o começo poupa retrabalho.",
    importancias: {
      planejamento: "Prever alternativas no plano original custa menos que criar adaptações separadas depois.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["acessibilidade", "diferenciacao"],
  },

  // ------------------------------------------------------------ Uso de IA
  {
    slug: "ptcf",
    termo: "P.T.C.F.",
    sinonimos: ["PTCF", "Papel Tarefa Contexto Formato", "estrutura de prompt"],
    categoria: "Uso de IA",
    resumo: "Estrutura de quatro partes que torna um pedido à IA claro e utilizável.",
    explicacao:
      "P.T.C.F. organiza um pedido à IA em quatro partes:\n\n• Papel — de que perspectiva a IA deve responder. 'Professor de Ciências dos anos finais' produz outro texto que 'especialista em educação'.\n• Tarefa — o que exatamente produzir, com quantidade e recorte. 'Crie uma sequência de 3 aulas' em vez de 'fale sobre'.\n• Contexto — turma, etapa, tempo, recursos disponíveis, restrições reais. É a parte que mais muda o resultado e a mais esquecida.\n• Formato — como a resposta deve chegar: tabela, lista, texto corrido, quantas seções.\n\nA plataforma acrescenta uma quinta: o que você vai conferir. Serve para lembrar que a revisão pedagógica é sua, sempre — a IA não conhece a sua turma e não responde pelo que produz.",
    importancias: {
      prompts: "É a estrutura usada nos criadores de prompt da plataforma para transformar uma ideia solta em pedido concreto.",
      "criar-prompt": "Os cinco campos desta tela são exatamente essas partes — preencher os quatro primeiros já resolve a maior parte dos casos.",
      gerador: "O gerador monta o P.T.C.F. no seu dispositivo a partir da ideia que você escreveu; nada é enviado à plataforma.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/criar-prompt",
    relacionadoSlugs: ["prompt", "objetivo-pedagogico", "revisao-humana"],
  },
  {
    slug: "prompt",
    termo: "Prompt",
    sinonimos: ["prompts", "comando", "pedido à IA"],
    categoria: "Uso de IA",
    resumo: "O pedido escrito que você faz a uma ferramenta de IA.",
    explicacao:
      "Prompt é o texto com que você pede algo a uma ferramenta de inteligência artificial. Não é uma fórmula mágica nem um comando de programação: é instrução escrita, e vale o que vale qualquer instrução — quanto mais clara e mais contextualizada, melhor o resultado.\n\nDuas coisas melhoram um prompt mais que qualquer truque: dizer o contexto real (turma, etapa, tempo, recursos) e dizer o formato esperado.\n\nPrompt não é conversa encerrada. Pedir ajuste — 'reduza para 30 minutos', 'troque o exemplo', 'simplifique a linguagem' — costuma ser mais rápido que reescrever do zero.",
    importancias: {
      prompts: "Os prompts deste banco são pontos de partida revisados; personalize os campos entre colchetes com a sua realidade.",
      gerador: "Escreva a ideia como você falaria; a estruturação em P.T.C.F. é feita aqui, no seu aparelho.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["ptcf", "variavel-prompt", "revisao-humana", "alucinacao"],
  },
  {
    slug: "variavel-prompt",
    termo: "Variável do prompt",
    sinonimos: ["variáveis", "campo entre colchetes", "placeholder"],
    categoria: "Uso de IA",
    resumo: "Os trechos entre colchetes que você substitui pela sua realidade.",
    explicacao:
      "As variáveis são os campos marcados entre colchetes num prompt — [DISCIPLINA], [ANO], [TEMA], [CONTEXTO]. Elas existem para que o mesmo prompt sirva a situações diferentes sem ser reescrito.\n\nO campo de contexto é o que mais influencia o resultado, e o mais frequentemente deixado vazio. 'Ex.: 28 alunos, sem projetor, 50 minutos' muda completamente o material que volta.\n\nSe um campo não se aplica à sua situação, é melhor removê-lo do texto que deixar o colchete: a IA tenta interpretar o marcador literalmente.",
    importancias: {
      prompts: "Preencher todos os campos antes de copiar evita receber material que ignora a sua turma.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["prompt", "ptcf"],
  },
  {
    slug: "alucinacao",
    termo: "Alucinação da IA",
    sinonimos: ["alucinação", "invenção", "erro factual da IA", "confabulação"],
    categoria: "Uso de IA",
    resumo: "Quando a IA apresenta informação inventada com aparência de correta.",
    explicacao:
      "Alucinação é quando uma ferramenta de IA gera informação falsa com toda a aparência de verdadeira: uma referência bibliográfica que não existe, uma data errada, uma lei atribuída ao artigo errado, um código da BNCC inventado.\n\nA causa está no funcionamento: esses sistemas produzem texto plausível a partir de padrões, sem verificar fatos. Plausível e verdadeiro não são a mesma coisa, e o texto errado vem com a mesma confiança do texto certo.\n\nNo contexto escolar, os pontos de maior risco são códigos e descrições da BNCC, legislação, dados estatísticos, citações e referências. Todos exigem conferência em fonte oficial — sem exceção.",
    importancias: {
      prompts: "Todo código da BNCC, lei ou dado numérico que a IA devolver precisa ser conferido na fonte antes de ir para a mão do estudante.",
      ferramentas: "Nenhuma ferramenta desta lista está livre disso, independentemente de quão segura a resposta pareça.",
      gerador: "O gerador estrutura o seu pedido, mas não verifica o que a IA vai responder depois.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/trilha",
    relacionadoSlugs: ["revisao-humana", "codigo-bncc", "prompt"],
  },
  {
    slug: "revisao-humana",
    termo: "Revisão humana",
    sinonimos: ["revisão docente", "mediação docente", "conferência"],
    categoria: "Uso de IA",
    resumo: "A conferência pedagógica, factual e ética que cabe a você antes de usar qualquer material de IA.",
    explicacao:
      "Revisão humana é a etapa não delegável: antes de o material de IA chegar aos estudantes, alguém que conhece a turma confere.\n\nQuatro verificações dão conta da maior parte dos problemas: os fatos estão certos (especialmente códigos, leis, datas e números); a linguagem é adequada à etapa; o material é acessível e não exclui ninguém; e não há dado pessoal de estudante envolvido.\n\nHá decisões que não se automatizam, e não por cautela excessiva: julgamento sobre uma pessoa — nota, parecer definitivo, encaminhamento, diagnóstico — é responsabilidade profissional sua e continua sua.",
    importancias: {
      prompts: "O quinto campo dos criadores de prompt existe para você declarar o que vai conferir antes de usar.",
      ferramentas: "Vale para toda ferramenta desta página, sem exceção.",
      licao: "É o princípio que atravessa o curso inteiro: a IA rascunha, o professor decide.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/trilha",
    relacionadoSlugs: ["alucinacao", "ptcf", "privacidade", "etica-ia"],
  },
  {
    slug: "etica-ia",
    termo: "Uso ético de IA na educação",
    sinonimos: ["ética", "uso responsável", "IA responsável"],
    categoria: "Uso de IA",
    resumo: "Transparência, proteção de dados, revisão humana e cuidado com vieses.",
    explicacao:
      "Uso ético de IA na escola se sustenta em alguns compromissos práticos: transparência sobre quando e como a ferramenta foi usada; proteção dos dados dos estudantes; revisão humana antes de qualquer uso com a turma; atenção a vieses que o material pode reproduzir; e a recusa de automatizar decisões sobre pessoas.\n\nViés não é hipótese distante. Materiais gerados por IA tendem a reproduzir representações desiguais de gênero, raça, região e classe, e a usar exemplos culturalmente distantes da realidade de muitas turmas. Isso se corrige na revisão.\n\nTransparência também vale com os estudantes: dizer que um material foi rascunhado com IA e revisado por você ensina mais sobre uso crítico de tecnologia que qualquer aula sobre o tema.",
    importancias: {
      ferramentas: "Cada ferramenta tem sua política de dados; conhecê-la antes de usar com a turma faz parte do trabalho.",
      licao: "O curso trata isso como condição do uso profissional, não como capítulo opcional.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/trilha",
    relacionadoSlugs: ["privacidade", "revisao-humana", "vies-algoritmico", "cultura-digital"],
  },
  {
    slug: "vies-algoritmico",
    termo: "Viés algorítmico",
    sinonimos: ["viés", "vieses", "estereótipo"],
    categoria: "Uso de IA",
    resumo: "Padrões desiguais que a IA reproduz porque estavam nos dados com que aprendeu.",
    explicacao:
      "Viés algorítmico é a reprodução, pela ferramenta, de desigualdades e estereótipos presentes nos dados de treinamento. Aparece de formas discretas: os nomes que povoam os exemplos, quem exerce qual profissão nos enunciados, que realidade geográfica e cultural é tratada como padrão, que variedade linguística é 'a correta'.\n\nNo material didático isso importa muito, porque exemplo é currículo oculto: a turma aprende também com quem aparece e quem não aparece nos enunciados.\n\nA correção é simples e cabe na revisão: variar nomes e contextos, trocar exemplos distantes por referências locais, conferir se algum grupo aparece sempre no mesmo papel.",
    importancias: {
      prompts: "Pedir 'use nomes e contextos brasileiros diversos' na revisão do prompt já melhora bastante o resultado.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["etica-ia", "revisao-humana"],
  },
  {
    slug: "cultura-digital",
    termo: "Cultura digital",
    sinonimos: ["competência digital", "letramento digital"],
    categoria: "BNCC",
    resumo: "Usar tecnologias digitais de forma crítica, significativa, reflexiva e ética.",
    explicacao:
      "Cultura digital é o tema de uma das dez competências gerais da BNCC: compreender, utilizar e criar tecnologias digitais de informação e comunicação de forma crítica, significativa, reflexiva e ética nas diversas práticas sociais.\n\nNote o que a redação oficial exige: não é só usar, é compreender e criar — e sob quatro qualificadores. Isso desloca o trabalho de 'ensinar a mexer na ferramenta' para 'formar quem entende o que a ferramenta faz e decide quando usá-la'.\n\nÉ nessa competência que o uso de IA na escola se ancora, tanto na formação do professor quanto no trabalho com os estudantes.",
    importancias: {
      licao: "É a competência da BNCC em que esta formação se apoia diretamente.",
      planejamento: "Ajuda a justificar o uso de IA no planejamento como desenvolvimento de competência prevista, não como novidade.",
    },
    fonteNome: "BNCC · MEC (competências gerais)",
    fonteUrl: "https://basenacionalcomum.mec.gov.br/abase/",
    saibaMaisUrl: "/app/conhecimento/bncc",
    relacionadoSlugs: ["competencias-gerais", "etica-ia", "bncc"],
  },

  // ------------------------------------------------------------ Segurança
  {
    slug: "privacidade",
    termo: "Privacidade de estudantes",
    sinonimos: ["dados pessoais", "dados de estudantes", "LGPD"],
    categoria: "Segurança",
    resumo: "Proteger informações que identifiquem estudantes ou exponham sua vida escolar.",
    explicacao:
      "Não envie a ferramentas externas nada que identifique um estudante: nome, matrícula, documento, endereço, foto, laudo ou diagnóstico, nota individualizada, registro disciplinar, situação familiar.\n\nO cuidado precisa ir além do nome. Uma combinação aparentemente inócua — 'o aluno com deficiência auditiva do 3º B' — identifica uma pessoa específica para qualquer um que conheça a escola. Em turma pequena, quase todo detalhe identifica.\n\nO caminho prático: trabalhe com descrição genérica ou caso fictício no rascunho, e personalize depois, fora da ferramenta. Dados agregados ('cerca de um terço da turma') costumam ser suficientes para o que você precisa pedir.\n\nEsta plataforma não envia os seus textos a serviços de IA: os prompts são montados no seu aparelho e copiados para você colar. O que vai para a ferramenta externa é decidido por você, na hora da colagem — e é aí que a atenção vale.",
    importancias: {
      prompts: "A plataforma copia o prompt para você colar em serviço externo; remover dado identificável antes de colar é a etapa que só você pode fazer.",
      ferramentas: "Cada ferramenta externa tem sua própria política de retenção de dados. Vale conhecer antes de usar com material da escola.",
      diario: "Este diário fica só com você e não é enviado a nenhuma IA.",
      "criar-prompt": "Nada digitado aqui é enviado à plataforma nem a terceiros — o prompt é montado no seu dispositivo.",
    },
    fonteNome: "Lei Geral de Proteção de Dados (Lei nº 13.709/2018) · Planalto",
    fonteUrl: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
    saibaMaisUrl: "/app/trilha",
    relacionadoSlugs: ["anonimizacao", "etica-ia", "revisao-humana"],
  },
  {
    slug: "anonimizacao",
    termo: "Anonimização",
    sinonimos: ["anonimizar", "dado anonimizado", "descaracterização"],
    categoria: "Segurança",
    resumo: "Remover ou substituir informações que permitam identificar uma pessoa.",
    explicacao:
      "Anonimizar é transformar o texto de modo que não seja possível identificar a pessoa de que ele trata — nem diretamente, nem por cruzamento de detalhes.\n\nNa prática escolar: troque nomes por 'estudante A', remova idade exata e turma, elimine laudos e diagnósticos, substitua notas individuais por descrição de nível, tire referências a eventos que só aconteceram com uma pessoa.\n\nO teste útil é este: alguém que trabalha na escola conseguiria dizer de quem se trata? Se sim, não está anonimizado — mesmo sem o nome.",
    importancias: {
      prompts: "É a última coisa a conferir antes de colar qualquer texto sobre estudantes em uma ferramenta externa.",
    },
    fonteNome: "Lei Geral de Proteção de Dados (Lei nº 13.709/2018) · Planalto",
    fonteUrl: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
    saibaMaisUrl: null,
    relacionadoSlugs: ["privacidade", "parecer-descritivo"],
  },

  // --------------------------------------------------------- A plataforma
  {
    slug: "xp",
    termo: "XP",
    sinonimos: ["pontos de experiência", "experiência", "pontos"],
    categoria: "A plataforma",
    resumo: "Pontos que registram o que você concluiu na formação.",
    explicacao:
      "XP (pontos de experiência) é o registro do seu percurso: cada lição concluída soma pontos, e a soma determina o seu nível na plataforma.\n\nNão é nota nem avaliação de desempenho — ninguém é comparado a ninguém. Serve para dar visibilidade ao progresso em uma formação que acontece em pedaços, entre aulas e correções, e em que é fácil perder a noção do quanto já se caminhou.\n\nLições mais longas ou mais exigentes valem mais pontos.",
    importancias: {
      inicio: "O XP acumulado e o nível resumem o que você já concluiu nesta formação.",
      trilha: "Cada lição mostra quantos pontos vale antes de você começar.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["nivel", "ofensiva", "missao"],
  },
  {
    slug: "nivel",
    termo: "Nível",
    sinonimos: ["níveis", "nivel"],
    categoria: "A plataforma",
    resumo: "Faixa de progresso alcançada pelo total de XP acumulado.",
    explicacao:
      "O nível é a faixa em que o seu XP acumulado se encontra. Cada faixa tem um título e uma quantidade de pontos necessária.\n\nÉ um indicador de percurso, não de competência: não diz o quanto você sabe sobre IA na educação, diz o quanto da formação você já percorreu. Ninguém é comparado com ninguém, e não há tempo mínimo nem máximo.",
    importancias: {
      inicio: "Mostra em que ponto da formação você está e quanto falta para a próxima faixa.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["xp", "trilha-formacao"],
  },
  {
    slug: "ofensiva",
    termo: "Ofensiva",
    sinonimos: ["dias seguidos", "sequência", "streak"],
    categoria: "A plataforma",
    resumo: "Quantidade de dias consecutivos em que você estudou.",
    explicacao:
      "A ofensiva conta os dias consecutivos em que você registrou alguma atividade na plataforma.\n\nO motivo de ela existir é prático: em formação continuada, constância rende mais que intensidade. Vinte minutos em cinco dias sustentam mais aprendizagem que duas horas de uma vez.\n\nPerder a ofensiva não apaga nada. O XP, as lições concluídas e as conquistas continuam onde estavam.",
    importancias: {
      inicio: "Acompanha a sua constância; interromper não faz você perder progresso nenhum.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["xp", "missao"],
  },
  {
    slug: "missao",
    termo: "Missão",
    sinonimos: ["missões", "missao", "desafio"],
    categoria: "A plataforma",
    resumo: "Objetivo opcional, diário ou semanal, ligado ao seu progresso real.",
    explicacao:
      "Missões são objetivos opcionais — diários, semanais ou especiais — que acompanham o que você já está fazendo na formação. Concluir uma libera uma recompensa.\n\nElas são opcionais de verdade: ignorar todas não trava lição nenhuma nem atrasa o curso. Existem para quem gosta de ter um próximo passo sugerido.\n\nAlgumas aparecem como secretas e se revelam conforme você avança.",
    importancias: {
      missoes: "O progresso é calculado a partir do que você concluiu de fato — não há como marcar como feito sem fazer.",
      inicio: "A missão em destaque é sempre a mais próxima de ser concluída.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/missoes",
    relacionadoSlugs: ["xp", "conquista", "ofensiva"],
  },
  {
    slug: "conquista",
    termo: "Conquista",
    sinonimos: ["conquistas", "medalha", "insígnia"],
    categoria: "A plataforma",
    resumo: "Marco permanente que registra algo relevante que você alcançou na formação.",
    explicacao:
      "Conquistas são marcos permanentes: concluir um módulo, manter uma sequência de estudo, praticar um número de prompts, registrar economia de tempo no diário.\n\nDiferente das missões, elas não expiram e não se repetem — uma vez alcançadas, ficam. Algumas são secretas e só se revelam quando o marco é atingido.\n\nTambém aqui não há comparação entre pessoas: o painel mostra o seu próprio percurso.",
    importancias: {
      conquistas: "Cada cartão mostra o que é preciso para alcançar o marco; os secretos se revelam quando você chega neles.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/conquistas",
    relacionadoSlugs: ["missao", "xp"],
  },
  {
    slug: "trilha-formacao",
    termo: "Trilha",
    sinonimos: ["trilha de formação", "percurso", "módulos"],
    categoria: "A plataforma",
    resumo: "O percurso da formação, organizado em encontros e lições na ordem sugerida.",
    explicacao:
      "A trilha é o seu percurso na formação, organizado em encontros (módulos) e, dentro deles, em lições.\n\nA ordem é sugerida por dependência: algumas lições assumem que você já viu conceitos anteriores, e por isso ficam disponíveis depois. Não é para criar obstáculo — é para que nada apareça sem a base necessária.\n\nA trilha guarda onde você parou. Não há prazo para concluir.",
    importancias: {
      trilha: "Cada encontro mostra quantas lições você já concluiu do total.",
      inicio: "O cartão 'Continuar de onde parei' aponta para a próxima lição disponível da sua trilha.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/trilha",
    relacionadoSlugs: ["licao", "xp", "nivel"],
  },
  {
    slug: "licao",
    termo: "Lição",
    sinonimos: ["lições", "licao", "aula da trilha"],
    categoria: "A plataforma",
    resumo: "Unidade de estudo da trilha, com tempo estimado e XP definidos.",
    explicacao:
      "Lição é a unidade de estudo da trilha. Cada uma indica o tempo estimado e o XP que vale, e há tipos diferentes: leitura, vídeo, prática de prompt, desafio.\n\nAs lições de prática são as que mais mudam o trabalho no dia seguinte: você personaliza um prompt com a sua realidade e usa o resultado na sua aula.\n\nDá para interromper no meio; o progresso fica salvo.",
    importancias: {
      trilha: "O tempo indicado ajuda a encaixar a lição em uma janela real do seu dia.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: null,
    relacionadoSlugs: ["trilha-formacao", "xp", "prompt"],
  },
  {
    slug: "diario-bordo",
    termo: "Diário de bordo",
    sinonimos: ["diário", "registro de prática", "tempo economizado"],
    categoria: "A plataforma",
    resumo: "Registro pessoal do que você fez com IA e de quanto tempo isso poupou.",
    explicacao:
      "O diário de bordo é onde você registra o que fez com apoio de IA, quanto tempo a tarefa levava antes e quanto levou agora. A diferença acumulada aparece como tempo economizado.\n\nDuas coisas valem saber. A primeira: é um registro seu, privado — não é enviado a nenhuma ferramenta de IA e não é comparado com o de ninguém. A segunda: o número serve mais como evidência do que como meta. Ele existe para você poder mostrar, a si mesmo e à escola, o que mudou na sua rotina.\n\nRegistrar também o que não funcionou é o que transforma o diário em prática reflexiva, e não em contabilidade.",
    importancias: {
      diario: "Os minutos são a sua estimativa honesta; o valor do registro está na comparação ao longo do tempo, não na precisão.",
      inicio: "O tempo economizado mostrado no início vem exclusivamente dos seus próprios registros.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/diario",
    relacionadoSlugs: ["avaliacao-formativa", "privacidade"],
  },
  {
    slug: "banco-prompts",
    termo: "Banco de prompts",
    sinonimos: ["biblioteca de prompts", "catálogo de prompts"],
    categoria: "A plataforma",
    resumo: "Coleção de prompts revisados, organizados por categoria, disciplina e tipo de atividade.",
    explicacao:
      "O banco reúne prompts já revisados pedagogicamente, organizados por categoria, disciplina, etapa e tipo de atividade. Cada um tem campos entre colchetes para você preencher com a sua realidade.\n\nSão pontos de partida, não receitas. O prompt que serve à sua turma é quase sempre o do banco mais o seu contexto — turma, tempo, recursos, o que você já tentou.\n\nO contador de usos mostra o que outros professores têm aproveitado mais; favoritar guarda o que serve para você.",
    importancias: {
      prompts: "Filtre por disciplina e etapa antes de procurar por tema: reduz muito a lista.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/prompts",
    relacionadoSlugs: ["prompt", "variavel-prompt", "ptcf"],
  },
  {
    slug: "ferramenta-ia",
    termo: "Ferramenta de IA",
    sinonimos: ["ferramentas de IA", "assistente de IA", "modelo de linguagem", "chatbot"],
    categoria: "Uso de IA",
    resumo: "Serviço externo que gera texto, imagem ou áudio a partir do seu pedido.",
    explicacao:
      "As ferramentas listadas na plataforma são serviços externos, mantidos por outras empresas. A plataforma não as substitui nem intermedeia o seu conteúdo: ela ajuda a montar o prompt e abre a ferramenta para você colar.\n\nElas têm perfis diferentes — algumas trabalham melhor com texto longo, outras com pesquisa referenciada em fontes que você fornece, outras com imagem. Vale conhecer duas ou três bem, em vez de todas superficialmente.\n\nTrês pontos práticos: cada uma tem política própria de dados (a plataforma não controla isso); todas podem inventar informação; e nenhuma conhece a sua turma.",
    importancias: {
      ferramentas: "A plataforma abre a ferramenta e copia o prompt; o texto não vai pela URL nem passa por servidor nosso.",
      prompts: "A escolha da ferramenta muda o resultado — o mesmo prompt rende materiais diferentes em cada uma.",
    },
    fonteNome: null,
    fonteUrl: null,
    saibaMaisUrl: "/app/ferramentas",
    relacionadoSlugs: ["prompt", "alucinacao", "privacidade", "etica-ia"],
  },
];
