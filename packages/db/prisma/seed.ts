/**
 * Seed do Aprender IA.
 *
 * Cria o curso "IA para Educadores" com os 4 encontros, as lições
 * iniciais da trilha e o primeiro administrador.
 *
 * É idempotente: pode rodar quantas vezes for preciso sem duplicar.
 */
import { Prisma, PrismaClient, TipoLicao } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BANCO_PROMPTS } from "./banco-prompts";
import { BASE_CONHECIMENTO } from "./base-conhecimento";
import {
  CACAS,
  CASOS,
  DESAFIOS,
  DUELOS,
  TESTES_CELULAR,
} from "./conteudo-apostila";
import { ROTEIROS_AULA } from "./roteiros-aula";
import { APOSTILA } from "./apostila";

const prisma = new PrismaClient();

const CURSO = {
  slug: "ia-para-educadores",
  titulo: "IA para Educadores",
  subtitulo: "Menos burocracia, aulas melhores, seu fim de semana de volta",
  descricao:
    "Formação de 40 horas para professores da rede pública usarem Inteligência Artificial na rotina escolar, com ferramentas gratuitas e sem jargão técnico.",
  cargaHoraria: 40,
};

const FERRAMENTAS_IA = [
  { chave: "chatgpt", nome: "ChatGPT", descricao: "Conversa, escrita, planejamento e revisão de materiais.", categoria: "Assistente de texto", url: "https://chatgpt.com/", urlCadastro: "https://chatgpt.com/", ordem: 0, capacidades: ["textos", "planejamento", "avaliacao", "ideias", "imagens"], entradas: ["texto", "imagem", "arquivo"], saidas: ["texto", "imagem"], metodoAbertura: "COPIAR_E_ABRIR", observacaoIntegracao: "A interface abre o ChatGPT e copia o prompt. Não enviamos dados pela URL." },
  { chave: "gemini", nome: "Gemini", descricao: "Assistente do Google para pesquisa, ideias e materiais didáticos.", categoria: "Assistente de texto", url: "https://gemini.google.com/", urlCadastro: "https://gemini.google.com/", ordem: 1, capacidades: ["textos", "planejamento", "pesquisa", "avaliacao", "imagens"], entradas: ["texto", "imagem", "arquivo"], saidas: ["texto", "imagem"], metodoAbertura: "COPIAR_E_ABRIR", observacaoIntegracao: "A interface abre o Gemini e copia o prompt; a colagem é feita pelo professor." },
  { chave: "deepseek", nome: "DeepSeek", descricao: "Assistente de texto para testar variações de prompts.", categoria: "Assistente de texto", url: "https://chat.deepseek.com/", urlCadastro: "https://chat.deepseek.com/", ordem: 2, capacidades: ["textos", "planejamento", "avaliacao", "raciocinio"], entradas: ["texto"], saidas: ["texto"], metodoAbertura: "COPIAR_E_ABRIR", observacaoIntegracao: "Sem integração de conta ou URL de preenchimento adotada." },
  { chave: "notebooklm", nome: "NotebookLM", descricao: "Leitura assistida de fontes próprias, com citações para conferência.", categoria: "Pesquisa com fontes", url: "https://notebooklm.google.com/", urlCadastro: "https://notebooklm.google.com/", ordem: 3, capacidades: ["pesquisa", "documentos", "planejamento"], entradas: ["texto", "arquivo", "link"], saidas: ["texto", "citacoes"], metodoAbertura: "COPIAR_E_ABRIR", observacaoIntegracao: "Abra, escolha ou crie um caderno com fontes e cole o prompt. Não há API pública do NotebookLM comum." },
];

/*
 * A apostila foi concebida para encontro presencial. A trilha é individual:
 * aqui preservamos o conteúdo e trocamos apenas as instruções de sala
 * ("em dupla", "levante a mão", "mostre ao colega") por ações que a pessoa
 * consegue realizar sozinha, no próprio ritmo.
 */
function aquecimento(indice: number, pergunta: string, fechamento: string) {
  return {
    titulo: `Aquecimento do Encontro ${indice + 1}`,
    tipo: TipoLicao.AQUECIMENTO,
    xp: 10,
    tempo: 2,
    cap: `Encontro ${indice + 1}`,
    conteudo: { pergunta, fechamento, tempo: "Pausa breve para começar" },
  };
}

function duelo(indice: number) {
  const d = DUELOS[indice]!;
  return {
    titulo: `Duelo: ${d.titulo}`,
    tipo: TipoLicao.DUELO,
    xp: 30,
    tempo: Number.parseInt(d.tempo, 10),
    cap: "Prática de prompts",
    conteudo: {
      contexto: "Compare os dois pedidos, observe o que muda no resultado e escreva a sua versão.",
      ...d,
    },
  };
}

function caso(indice: number) {
  const c = CASOS[indice]!;
  return {
    titulo: `Caso: ${c.titulo}`,
    tipo: TipoLicao.CASO,
    xp: 35,
    tempo: Number.parseInt(c.tempo, 10),
    cap: "Caso da rotina escolar",
    conteudo: {
      ...c,
      pergunta: c.pergunta.replace(/^Em dupla:\s*/i, "Pense no seu contexto: "),
      tempoMinutos: Number.parseInt(c.tempo, 10),
      solucao: c.solucao.replace(/Discuss[aã]o(?: para a turma)?:/gi, "Para refletir:"),
    },
  };
}

function caca(
  indice: number,
  pergunta: string,
  opcoes: { id: string; texto: string; correta: boolean }[],
) {
  const c = CACAS[indice]!;
  return {
    titulo: `Caça ao Erro: ${c.titulo}`,
    tipo: TipoLicao.CACA_ERRO,
    xp: 25,
    tempo: Number.parseInt(c.tempo, 10),
    cap: "Verificação crítica",
    conteudo: {
      introducao: c.instrucao,
      respostaIA: c.respostaIA,
      pergunta,
      opcoes,
      gabarito: c.gabarito,
      licao: "A IA ajuda a produzir, mas a conferência é sempre sua.",
    },
  };
}

function celular(indice: number, passos: string[], porque: string) {
  const t = TESTES_CELULAR[indice]!;
  return {
    titulo: `No celular: ${t.titulo}`,
    tipo: TipoLicao.NO_CELULAR,
    xp: 20,
    tempo: 5,
    cap: "Prática no celular",
    conteudo: { titulo: t.titulo, tempo: "Faça no seu próprio aparelho", passos, porque },
  };
}

function desafio(indice: number, segundos: number, instrucoes: string[], fechamento: string) {
  return {
    titulo: DESAFIOS[indice]!.titulo,
    tipo: TipoLicao.DESAFIO,
    xp: 30,
    tempo: Math.ceil(segundos / 60),
    cap: "Desafio cronometrado",
    conteudo: { titulo: DESAFIOS[indice]!.titulo, segundos, instrucoes, fechamento },
  };
}

// Mantido no arquivo como referência para os prompts originais do curso.
// A trilha publicada é declarada abaixo, já completa com as 32 práticas.
const MODULOS_INICIAIS = [
  {
    ordem: 0,
    titulo: "Encontro 1",
    subtitulo: "Primeiros passos e a arte de conversar com a IA",
    cor: "#6366F1",
    icone: "🚀",
    licoes: [
      {
        titulo: "O que é Inteligência Artificial",
        tipo: TipoLicao.TEORIA,
        xp: 10,
        tempo: 6,
        cap: "Cap. 1.1",
        conteudo: {
          blocos: [
            {
              tipo: "paragrafo",
              texto:
                "Quando falamos em Inteligência Artificial, muita gente imagina um robô de filme. A realidade é bem mais simples: a IA é um programa treinado para identificar padrões e prever o que vem a seguir.",
            },
            {
              tipo: "paragrafo",
              texto:
                'Quando você digita "bom d" no WhatsApp e o teclado sugere "dia", isso já é uma forma básica de IA. Ele aprendeu que, depois de "bom", a maioria das pessoas escreve "dia".',
            },
            {
              tipo: "traduzindo",
              titulo: "LLM (Large Language Model)",
              texto:
                'É o "cérebro" por trás do ChatGPT e do Gemini. Ele não pensa de verdade — prevê a próxima palavra mais provável. É como um aluno que leu todos os livros da biblioteca, mas não tem vivência própria. Você, professor, tem a vivência. A IA tem a velocidade.',
            },
          ],
        },
      },
      {
        titulo: "Você não precisa pagar assinatura",
        tipo: TipoLicao.TEORIA,
        xp: 10,
        tempo: 5,
        cap: "Cap. 1.3",
        conteudo: {
          blocos: [
            {
              tipo: "paragrafo",
              texto:
                "Muitos professores desistem por acreditar que IA boa custa mais de R$ 100 por mês. Isso não é verdade: as melhores ferramentas para educação têm versões gratuitas de altíssimo nível.",
            },
            {
              tipo: "destaque",
              titulo: "A Regra dos Dois Barcos",
              texto:
                "Mantenha sempre duas abas abertas com ferramentas diferentes. Se uma travar ou atingir a cota, você cola o mesmo comando na outra e continua sem perder tempo.",
            },
          ],
        },
      },
      {
        titulo: "Quiz: mitos e verdades sobre IA",
        tipo: TipoLicao.QUIZ,
        xp: 15,
        tempo: 4,
        cap: "Cap. 1",
        conteudo: {
          perguntas: [
            {
              enunciado: "A IA pode inventar informações que parecem verdadeiras?",
              opcoes: [
                { id: "a", texto: "Sim, e isso se chama alucinação", correta: true },
                { id: "b", texto: "Não, ela sempre diz a verdade", correta: false },
                { id: "c", texto: "Só quando está sem internet", correta: false },
              ],
              explicacao:
                'Alucinação é quando a IA inventa algo que parece verdade. Ela não faz por má-fé: tenta completar o texto de forma coerente mesmo sem ter certeza. Nunca copie datas, leis ou citações sem verificar.',
            },
            {
              enunciado: "Preciso pagar assinatura para usar IA de qualidade na escola?",
              opcoes: [
                { id: "a", texto: "Sim, as gratuitas são fracas", correta: false },
                { id: "b", texto: "Não, há ferramentas gratuitas excelentes", correta: true },
                { id: "c", texto: "Só se for para uso profissional", correta: false },
              ],
              explicacao:
                "DeepSeek, Gemini e Canva para Educação são gratuitos e atendem plenamente o trabalho docente.",
            },
          ],
        },
      },
      {
        titulo: "A Fórmula P.T.C.F.",
        tipo: TipoLicao.TEORIA,
        xp: 15,
        tempo: 8,
        cap: "Cap. 2.2",
        conteudo: {
          blocos: [
            {
              tipo: "paragrafo",
              texto:
                "Este é o coração do curso. A diferença entre uma resposta inútil e uma resposta excelente está quase inteiramente no que você digitou.",
            },
            {
              tipo: "lista",
              titulo: "As quatro letras",
              itens: [
                "P — Papel: quem a IA deve fingir ser",
                "T — Tarefa: o que exatamente você quer",
                "C — Contexto: a sua realidade (a letra mais esquecida!)",
                "F — Formato: como você quer receber a resposta",
              ],
            },
            {
              tipo: "dica",
              titulo: "Não gostou do resultado?",
              texto:
                'Não recomece do zero — refine: "Reduza." / "Troque os exemplos por..." / "Vire tabela."',
            },
          ],
        },
      },
      {
        titulo: "Duelo: a atividade genérica",
        tipo: TipoLicao.DUELO,
        xp: 30,
        tempo: 7,
        cap: "Cap. 2.3",
        conteudo: {
          contexto:
            "Compare o pedido que quase todo mundo escreve com o mesmo pedido usando a fórmula.",
          promptRuim: "Crie uma atividade de matemática.",
          resultadoRuim:
            "A IA devolve contas soltas, sem ano escolar, sem contexto e sem objetivo pedagógico. Serve para qualquer turma — ou seja, não serve para a sua.",
          promptBom:
            "Aja como uma professora de Matemática do 4º ano. Crie uma atividade de 30 minutos sobre multiplicação por 2 e por 3, usando situações do cotidiano de uma criança que mora em cidade pequena (ir à padaria, contar ovos na granja). A atividade deve ter: (1) um texto motivador curto, (2) 5 exercícios com dificuldade crescente, (3) um desafio bônus. Entregue formatado e pronto para imprimir.",
          resultadoBom:
            "A IA agora sabe a idade, o conteúdo exato, a realidade do aluno e o formato de entrega. O resultado sai pronto para a impressora, sem precisar de ajuste.",
          desafio: "Agora é a sua vez: reescreva este prompt ruim usando as quatro letras.",
          promptParaReescrever: "Faça um texto sobre meio ambiente.",
        },
      },
      {
        titulo: "Caça ao Erro: a IA citou uma fonte",
        tipo: TipoLicao.CACA_ERRO,
        xp: 25,
        tempo: 5,
        cap: "Cap. 1.6",
        conteudo: {
          introducao:
            "Pedimos à IA indicações de leitura sobre alfabetização. Ela respondeu com três obras. Uma delas não existe.",
          respostaIA:
            "1. Psicogênese da Língua Escrita — Emília Ferreiro e Ana Teberosky (1985)\n\n2. A Importância do Ato de Ler — Paulo Freire (1981)\n\n3. Alfabetização em Classes Populares Brasileiras — Marta Vasconcelos, Editora Pedagógica Nacional (1994), página 87, que demonstra que 87% das crianças alfabetizadas com método fônico apresentam melhor desempenho.",
          pergunta: "Qual dos três itens é inventado?",
          opcoes: [
            { id: "a", texto: "O item 1", correta: false },
            { id: "b", texto: "O item 2", correta: false },
            { id: "c", texto: "O item 3", correta: true },
          ],
          gabarito:
            "O item 3 é inventado. O livro, a autora, a editora, a página e a estatística não existem — mas repare como o formato é convincente: nome plausível, ano coerente, página específica e um número exato.",
          licao:
            "Quanto mais específico o dado (página exata, percentual quebrado), mais desconfiança ele merece. Para confirmar, busque o título entre aspas no Google: se um livro real não aparece em nenhuma livraria, ele não existe.",
        },
      },
      {
        titulo: "Seu primeiro plano de aula",
        tipo: TipoLicao.PROMPT,
        xp: 20,
        tempo: 10,
        cap: "Cap. 2.5",
        conteudo: {
          introducao:
            "Hora de praticar de verdade. Personalize o prompt abaixo com a sua disciplina e o seu ano, escolha uma ferramenta e veja o resultado.",
          categoria: "planejamento",
          // [CONTEXTO] entrou no corpo porque a dica mandava "caprichar
          // no Contexto" e não havia onde escrevê-lo: o prompt saía sem
          // a letra que a própria lição diz ser a mais importante.
          corpo:
            "Aja como professor(a) de [DISCIPLINA] do [ANO]. Crie um plano de aula de 50 minutos sobre [TEMA]. Minha turma: [CONTEXTO]. Inclua: objetivo de aprendizagem, habilidade BNCC relacionada, materiais necessários (de baixo custo), passo a passo cronometrado, e uma atividade de fechamento.",
          campos: [
            { chave: "DISCIPLINA", rotulo: "Disciplina", exemplo: "Ex: Ciências" },
            { chave: "ANO", rotulo: "Ano/série", exemplo: "Ex: 5º ano" },
            { chave: "TEMA", rotulo: "Tema da aula", exemplo: "Ex: sistema solar" },
            {
              chave: "CONTEXTO",
              rotulo: "Sua turma",
              exemplo: "Ex: 28 alunos, escola rural, sem projetor, 4 com defasagem",
              linhas: 3,
            },
          ],
          dica: "Capriche no Contexto: diga quantos alunos, o que a escola tem e o que não tem.",
        },
      },
      {
        titulo: "Checkpoint do Encontro 1",
        tipo: TipoLicao.CHECKPOINT,
        xp: 50,
        tempo: 3,
        cap: "Encontro 1",
        conteudo: {
          titulo: "O que você leva deste encontro",
          itens: [
            "Conta criada em duas ferramentas de IA (seus dois barcos)",
            "1 plano de aula completo, gerado e refinado por você",
            "Seu prompt P.T.C.F. salvo para reutilizar",
            "A noção de que a IA erra — e de como conferir",
          ],
          tarefa:
            "Use a IA para preparar uma aula real esta semana. Anote quanto tempo levou e quanto levaria antes.",
        },
      },
    ],
  },
  {
    ordem: 1,
    titulo: "Encontro 2",
    subtitulo: "Sua rotina, seu planejamento e a BNCC",
    cor: "#0EA5E9",
    icone: "📋",
    licoes: [
      {
        titulo: "O fim do pesadelo dos pareceres",
        tipo: TipoLicao.TEORIA,
        xp: 10,
        tempo: 6,
        cap: "Cap. 3.3",
        conteudo: {
          blocos: [
            {
              tipo: "paragrafo",
              texto:
                "Escrever 30 a 40 pareceres individuais é o terror de todo professor. A solução não é escrever mais rápido: é definir o padrão uma vez e alimentar a IA com suas anotações soltas.",
            },
            {
              tipo: "atencao",
              titulo: "Nomes reais, nunca",
              texto:
                'Sempre escreva "aluno fictício de 9 anos" em vez do nome real. Você troca os nomes depois, no seu documento. Isso é exigência da LGPD.',
            },
          ],
        },
      },
      {
        titulo: "Parecer a partir de anotações",
        tipo: TipoLicao.PROMPT,
        xp: 20,
        tempo: 8,
        cap: "Cap. 3.3",
        conteudo: {
          introducao:
            "Este é o prompt que mais economiza tempo no ano letivo. Defina o padrão uma vez e reutilize a cada bimestre.",
          categoria: "pareceres",
          corpo:
            "Aja como coordenadora pedagógica experiente em avaliação formativa. Transforme as anotações abaixo em um parecer descritivo de 2 parágrafos, em tom acolhedor e profissional. Comece pelos avanços, aponte o que precisa de estímulo sem julgamento, e termine com uma meta positiva.\n\nAnotações sobre aluno(a) fictício(a) do [ANO]:\n[SUAS ANOTAÇÕES]",
          campos: [
            { chave: "ANO", rotulo: "Ano/série", exemplo: "Ex: 3º ano" },
            {
              chave: "SUAS ANOTAÇÕES",
              rotulo: "Suas anotações",
              // O exemplo mostra o formato esperado — tópicos soltos, do
              // jeito que o professor realmente anota no caderno — e já
              // usa nome fictício, reforçando a dica sem repeti-la.
              exemplo: "Ex: lê bem, mas escreve pouco; participa; falta às segundas",
              linhas: 4,
            },
          ],
          dica: "Nunca use o nome real do aluno. Escreva sempre 'aluno fictício'.",
        },
      },
      {
        titulo: "Caça ao Erro: o código da BNCC",
        tipo: TipoLicao.CACA_ERRO,
        xp: 25,
        tempo: 5,
        cap: "Cap. 4.1",
        conteudo: {
          introducao:
            "Pedimos um plano de Ciências para o 7º ano. A IA citou duas habilidades da BNCC. Uma delas não pode existir.",
          respostaIA:
            "Este plano contempla a habilidade EF07CI09 da BNCC, que trata dos sistemas do corpo humano.\n\nTambém dialoga com a habilidade EF07BI14 (Biologia, 7º ano), sobre fisiologia comparada dos sistemas circulatório e respiratório.",
          pergunta: "Qual código é impossível?",
          opcoes: [
            { id: "a", texto: "EF07CI09", correta: false },
            { id: "b", texto: "EF07BI14", correta: true },
            { id: "c", texto: "Os dois estão corretos", correta: false },
          ],
          gabarito:
            'EF07BI14 é impossível. No Ensino Fundamental não existe o componente "Biologia" — ele só aparece no Ensino Médio. No Fundamental, o componente é Ciências (CI).',
          licao:
            "Você não precisa decorar a BNCC para pegar erros: basta conhecer a lógica do código (etapa + ano + componente + número). Na dúvida, consulte o documento oficial.",
        },
      },
      {
        titulo: "Checkpoint do Encontro 2",
        tipo: TipoLicao.CHECKPOINT,
        xp: 50,
        tempo: 3,
        cap: "Encontro 2",
        conteudo: {
          titulo: "O que você leva deste encontro",
          itens: [
            "Seu prompt-padrão de parecer descritivo",
            "1 ata formatada a partir de tópicos soltos",
            "1 sequência didática vinculada à BNCC",
            "O hábito de conferir todo código da BNCC",
          ],
          tarefa: "Escreva os pareceres reais da sua turma usando o prompt-padrão.",
        },
      },
    ],
  },
  {
    ordem: 2,
    titulo: "Encontro 3",
    subtitulo: "Materiais, inclusão e recursos visuais",
    cor: "#10B981",
    icone: "🧡",
    licoes: [
      {
        titulo: "DUA: quando adapto para um, a sala toda ganha",
        tipo: TipoLicao.TEORIA,
        xp: 10,
        tempo: 6,
        cap: "Cap. 7.1",
        conteudo: {
          blocos: [
            {
              tipo: "traduzindo",
              titulo: "DUA (Desenho Universal para a Aprendizagem)",
              texto:
                "É a ideia de que uma aula bem planejada oferece múltiplos caminhos para todo mundo: formas diferentes de apresentar o conteúdo, de o aluno responder e de motivá-lo.",
            },
            {
              tipo: "paragrafo",
              texto:
                "Na prática da escola pública, o professor recebe alunos com laudos sem material adaptado pronto e sem horas livres. A IA adapta uma atividade em menos de um minuto.",
            },
          ],
        },
      },
      {
        titulo: "A mesma atividade em 3 níveis",
        tipo: TipoLicao.PROMPT,
        xp: 25,
        tempo: 10,
        cap: "Cap. 7.5",
        conteudo: {
          introducao:
            "A técnica mais valiosa do curso: todos trabalham o mesmo tema, em três profundidades, sem ninguém se sentir exposto.",
          categoria: "inclusao",
          // Ganhou Papel e Contexto: o corpo começava direto no "Crie",
          // sem dizer quem a IA deve ser nem como é a turma — e é uma
          // lição sobre adaptar para alunos reais.
          corpo:
            "Aja como professor(a) de [DISCIPLINA] especialista em ensino inclusivo. Crie a mesma atividade sobre [TEMA] em 3 versões para o [ANO]. Minha turma: [CONTEXTO].\n\nVersão A (Básica): para alunos com defasagem. Texto curto, perguntas com resposta localizada no texto.\nVersão B (Intermediária): para o nível esperado. Perguntas de interpretação.\nVersão C (Avançada): perguntas de inferência e opinião.\n\nAs 3 versões devem ter o MESMO tema e aparência visual semelhante.",
          campos: [
            { chave: "DISCIPLINA", rotulo: "Disciplina", exemplo: "Ex: Português" },
            { chave: "TEMA", rotulo: "Tema da atividade", exemplo: "Ex: interpretação de fábula" },
            { chave: "ANO", rotulo: "Ano/série", exemplo: "Ex: 4º ano" },
            {
              chave: "CONTEXTO",
              rotulo: "Sua turma",
              exemplo: "Ex: 30 alunos, 6 não alfabetizados, 1 com laudo de TEA",
              linhas: 3,
            },
          ],
          dica: "Folhas parecidas evitam que a turma perceba quem recebeu qual versão.",
        },
      },
      {
        titulo: "Checkpoint do Encontro 3",
        tipo: TipoLicao.CHECKPOINT,
        xp: 50,
        tempo: 3,
        cap: "Encontro 3",
        conteudo: {
          titulo: "O que você leva deste encontro",
          itens: [
            "1 atividade em 3 níveis do mesmo tema",
            "1 enunciado adaptado para leitura literal",
            "Conta do Canva para Educação solicitada",
          ],
          tarefa: "Aplique a atividade em 3 níveis com a turma real.",
        },
      },
    ],
  },
  {
    ordem: 3,
    titulo: "Encontro 4",
    subtitulo: "Avaliação, ética e seu projeto final",
    cor: "#F59E0B",
    icone: "🏆",
    licoes: [
      {
        titulo: "Caça ao Erro: o gabarito está certo?",
        tipo: TipoLicao.CACA_ERRO,
        xp: 30,
        tempo: 8,
        cap: "Cap. 9.1",
        conteudo: {
          introducao:
            "A IA gerou esta questão de Matemática para o 7º ano, com gabarito. Faça a conta antes de responder.",
          respostaIA:
            "Questão: Uma camiseta custava R$ 80,00 e teve desconto de 25%. Depois, sobre o novo preço, houve acréscimo de 25%. Qual o preço final?\n\na) R$ 80,00    b) R$ 75,00    c) R$ 85,00    d) R$ 70,00\n\nGabarito da IA: alternativa (a) R$ 80,00 — 'como desconto e acréscimo são ambos de 25%, eles se anulam'.",
          pergunta: "O gabarito da IA está correto?",
          opcoes: [
            { id: "a", texto: "Sim, os percentuais se anulam", correta: false },
            { id: "b", texto: "Não, a resposta certa é R$ 75,00", correta: true },
            { id: "c", texto: "Não, a resposta certa é R$ 70,00", correta: false },
          ],
          gabarito:
            "O gabarito da IA está errado. A conta correta: 80 − 25% = 60. Depois, 60 + 25% de 60 = 75. A resposta certa é R$ 75,00 (alternativa b).",
          licao:
            "O erro da IA é o mesmo que os alunos cometem: achar que percentuais iguais se anulam. Mas as bases são diferentes. Se você aplicasse essa prova sem conferir, corrigiria como errada a resposta certa dos alunos.",
        },
      },
      {
        titulo: "LGPD: a linha vermelha",
        tipo: TipoLicao.TEORIA,
        xp: 15,
        tempo: 7,
        cap: "Cap. 10.1",
        conteudo: {
          blocos: [
            {
              tipo: "atencao",
              titulo: "O que NUNCA digitar em uma IA",
              texto:
                "Nomes completos de alunos, CPF ou documentos, laudos médicos com nome, endereços, fotos de crianças, notas ou matrículas associadas a nomes.",
            },
            {
              tipo: "paragrafo",
              texto:
                "Tudo o que você digita pode ser armazenado nos servidores da empresa e usado para treinar os modelos. Você estaria expondo a privacidade de uma criança.",
            },
            {
              tipo: "dica",
              titulo: "O teste dos 3 segundos",
              texto:
                '"Se este texto vazasse amanhã, alguém identificaria meu aluno?" Se a resposta for sim, anonimize mais.',
            },
          ],
        },
      },
      {
        titulo: "Checkpoint final",
        tipo: TipoLicao.CHECKPOINT,
        xp: 80,
        tempo: 5,
        cap: "Cap. 11",
        conteudo: {
          titulo: "O que você leva do curso inteiro",
          itens: [
            "1 prova completa com gabarito conferido",
            "1 rubrica pronta para o próximo trabalho",
            "1 tarefa reformulada à prova de cola",
            "Seu banco pessoal de prompts",
            "O hábito de anonimizar antes de usar a IA",
          ],
          tarefa:
            "Finalize e aplique o Projeto de Intervenção na sua escola. É ele que completa as 40 horas.",
        },
      },
    ],
  },
];

const MODULOS: {
  ordem: number;
  titulo: string;
  subtitulo: string;
  cor: string;
  icone: string;
  faixa?: string;
  pago?: boolean;
  licoes: any[];
}[] = [
  {
    ordem: 0,
    titulo: "Encontro 1",
    subtitulo: "Primeiros passos e a arte de conversar com a IA",
    cor: "#6366F1",
    icone: "🚀",
    licoes: [
      aquecimento(0, "Você já levou trabalho da escola para o fim de semana no último mês?", "Este encontro começa por recuperar tempo para o que importa."),
      { titulo: "O que é Inteligência Artificial", tipo: TipoLicao.TEORIA, xp: 10, tempo: 6, cap: "Cap. 1.1", conteudo: { blocos: [{ tipo: "paragrafo", texto: "IA é um programa treinado para reconhecer padrões e prever respostas. Ela é rápida; o seu repertório pedagógico é o que dá direção e sentido ao resultado." }, { tipo: "traduzindo", titulo: "LLM", texto: "É o modelo por trás do ChatGPT e do Gemini. Ele prevê palavras prováveis, por isso pode acertar muito e também inventar informações." }] } },
      celular(0, ["Abra o navegador do seu celular e acesse gemini.google.com.", "Entre com sua conta do Google.", "Digite: Me dê 3 ideias criativas para ensinar [conteúdo] para alunos do [ano], usando materiais de baixo custo.", "Leia a resposta e escolha uma ideia aproveitável.", "Peça: Detalhe a ideia escolhida com um passo a passo."], "Seu celular já é uma porta de entrada para testar, adaptar e salvar ideias onde você estiver."),
      duelo(0),
      caso(0),
      caca(0, "Qual obra parece inventada?", [{ id: "a", texto: "Psicogênese da Língua Escrita", correta: false }, { id: "b", texto: "A Importância do Ato de Ler", correta: false }, { id: "c", texto: "Alfabetização em Classes Populares Brasileiras", correta: true }]),
      { titulo: "A fórmula P.T.C.F.", tipo: TipoLicao.TEORIA, xp: 15, tempo: 7, cap: "Cap. 2", conteudo: { blocos: [{ tipo: "lista", titulo: "O pedido que funciona", itens: ["Papel: quem a IA deve ser", "Tarefa: o que você quer", "Contexto: sua turma e suas restrições", "Formato: como quer receber a resposta"] }, { tipo: "dica", titulo: "Refine", texto: "Em vez de recomeçar, peça para reduzir, trocar exemplos ou transformar em tabela." }] } },
      duelo(4),
      caso(4),
      desafio(0, 300, ["Escolha uma aula real que você dará nesta semana.", "Escreva o pedido com Papel, Tarefa, Contexto e Formato.", "Envie, revise o resultado e peça um refinamento.", "Salve o plano final para usar ou adaptar."], "Produto de saída: um plano de aula real, salvo e revisado por você."),
      { titulo: "Seu primeiro plano de aula", tipo: TipoLicao.PROMPT, xp: 25, tempo: 10, cap: "Cap. 2.5", conteudo: { introducao: "Personalize o prompt com sua disciplina, seu conteúdo e as condições reais da turma.", categoria: "planejamento", corpo: "Aja como professor(a) de [DISCIPLINA] do [ANO]. Crie um plano de aula de 50 minutos sobre [TEMA]. Minha turma: [CONTEXTO]. Inclua objetivo, materiais de baixo custo, passo a passo cronometrado e fechamento.", campos: [{ chave: "DISCIPLINA", rotulo: "Disciplina", exemplo: "Ex.: Ciências" }, { chave: "ANO", rotulo: "Ano/série", exemplo: "Ex.: 5º ano" }, { chave: "TEMA", rotulo: "Tema", exemplo: "Ex.: sistema solar" }, { chave: "CONTEXTO", rotulo: "Sua turma", exemplo: "Ex.: 28 alunos, sem projetor", linhas: 3 }], dica: "Conte à IA o que existe e o que falta na sua escola." } },
      { titulo: "Checkpoint do Encontro 1", tipo: TipoLicao.CHECKPOINT, xp: 50, tempo: 3, cap: "Encontro 1", conteudo: { titulo: "Você já consegue começar", itens: ["Conversar com uma IA pelo celular", "Usar P.T.C.F. para pedir algo específico", "Conferir fontes antes de usar", "Salvar um plano de aula adaptado"], tarefa: "Teste o plano em uma aula real e registre o que você ajustaria." } },
    ],
  },
  {
    ordem: 1, titulo: "Encontro 2", subtitulo: "Rotina, planejamento e BNCC", cor: "#0EA5E9", icone: "📋",
    licoes: [
      aquecimento(1, "Quanto tempo você levou para escrever seu último parecer descritivo?", "Transformar anotações em um primeiro rascunho libera tempo para a revisão que só você sabe fazer."),
      { titulo: "Pareceres sem começar do zero", tipo: TipoLicao.TEORIA, xp: 10, tempo: 6, cap: "Cap. 3", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Defina um padrão de parecer uma vez e alimente a IA com anotações de alunos fictícios. A revisão final continua sendo sua." }, { tipo: "atencao", titulo: "Privacidade", texto: "Nunca inclua nome, laudo ou qualquer dado identificável de estudante." }] } },
      caso(1), duelo(1),
      desafio(1, 240, ["Leia os tópicos da reunião fictícia.", "Peça à IA uma ata formal, com data, participantes, pauta e decisões.", "Revise a clareza e ajuste um detalhe antes de salvar."], "Produto de saída: uma ata-modelo que você pode reaproveitar."),
      caca(1, "Qual código não pode existir no Ensino Fundamental?", [{ id: "a", texto: "EF07CI09", correta: false }, { id: "b", texto: "EF07BI14", correta: true }, { id: "c", texto: "Os dois são válidos", correta: false }]),
      celular(1, ["Acesse notebooklm.google.com no celular e entre com sua conta.", "Crie um caderno para sua disciplina.", "Adicione o PDF oficial da BNCC como fonte.", "Pergunte quais habilidades tratam de um tema e ano que você ensina.", "Abra a citação e confira a página indicada."], "Uma fonte oficial com citações é muito mais segura do que aceitar um código sugerido sem conferir."),
      { titulo: "Parecer a partir de anotações", tipo: TipoLicao.PROMPT, xp: 25, tempo: 8, cap: "Cap. 3.3", conteudo: { introducao: "Use apenas informações fictícias no teste e faça a revisão pedagógica antes de aproveitar qualquer texto.", categoria: "pareceres", corpo: "Aja como coordenadora pedagógica. Transforme estas anotações sobre estudante fictício do [ANO] em parecer de 2 parágrafos. Comece pelos avanços, indique o que precisa de estímulo sem julgamento e termine com uma meta positiva. Anotações: [ANOTACOES]", campos: [{ chave: "ANO", rotulo: "Ano/série", exemplo: "Ex.: 3º ano" }, { chave: "ANOTACOES", rotulo: "Anotações fictícias", exemplo: "Ex.: lê bem; participa; falta às segundas", linhas: 4 }], dica: "Troque dados reais por descrições genéricas antes de usar uma ferramenta." } },
      caso(5), duelo(5),
      { titulo: "Planejamento com restrições reais", tipo: TipoLicao.TEORIA, xp: 10, tempo: 6, cap: "Cap. 4", conteudo: { blocos: [{ tipo: "paragrafo", texto: "O plano útil não é o mais bonito: é o que cabe no seu tempo, materiais e calendário. Diga essas restrições no prompt." }, { tipo: "destaque", titulo: "BNCC", texto: "Use a IA para localizar e organizar; confirme o código e a descrição no documento oficial." }] } },
      { titulo: "Checkpoint do Encontro 2", tipo: TipoLicao.CHECKPOINT, xp: 50, tempo: 3, cap: "Encontro 2", conteudo: { titulo: "Você já consegue organizar a rotina", itens: ["Gerar um rascunho seguro de parecer", "Transformar tópicos em ata", "Consultar a BNCC com fonte", "Planejar dentro das restrições reais"], tarefa: "Escolha uma tarefa burocrática da semana e crie seu prompt-modelo." } },
    ],
  },
  {
    ordem: 2, titulo: "Encontro 3", subtitulo: "Materiais, inclusão e recursos visuais", cor: "#10B981", icone: "🧡",
    licoes: [
      aquecimento(2, "Há algum aluno na sua turma que precisa de mais de um caminho para aprender?", "Inclusão começa quando o planejamento prevê diferenças sem expor ninguém."),
      { titulo: "DUA: mais de um caminho para aprender", tipo: TipoLicao.TEORIA, xp: 10, tempo: 6, cap: "Cap. 7.1", conteudo: { blocos: [{ tipo: "traduzindo", titulo: "DUA", texto: "Desenho Universal para a Aprendizagem: oferecer diferentes formas de acessar conteúdo, participar e demonstrar aprendizagem." }, { tipo: "paragrafo", texto: "Adaptar forma, linguagem e profundidade pode beneficiar a turma toda — sem rotular estudantes." }] } },
      duelo(2), caso(2),
      celular(2, ["Escolha um enunciado real que você usa em aula.", "Abra sua ferramenta de IA no celular.", "Peça: Reescreva para estudante autista, com linguagem literal, concreta e passos numerados em até 3 linhas.", "Cole o enunciado fictício ou sem dados pessoais e envie.", "Compare a versão original e a adaptada: está clara sem exigir interpretação figurada?"], "A adaptação só funciona quando você revisa se a linguagem atende à necessidade concreta."),
      caca(2, "Por que esta adaptação falha para um estudante com TEA?", [{ id: "a", texto: "Porque tem frases curtas demais", correta: false }, { id: "b", texto: "Porque usa muitas metáforas e linguagem figurada", correta: true }, { id: "c", texto: "Porque está numerada", correta: false }]),
      desafio(2, 360, ["Escolha um conteúdo que você ensinará nas próximas semanas.", "Peça três versões do mesmo tema: básica, intermediária e avançada.", "Verifique se todas mantêm o mesmo tema e aparência semelhante.", "Ajuste a versão que ficou fora do nível esperado."], "Produto de saída: três caminhos para o mesmo objetivo de aprendizagem."),
      { titulo: "A mesma atividade em 3 níveis", tipo: TipoLicao.PROMPT, xp: 25, tempo: 10, cap: "Cap. 7.5", conteudo: { introducao: "Crie níveis de profundidade, não rótulos para alunos. Todas as versões devem preservar o mesmo tema.", categoria: "inclusao", corpo: "Aja como professor(a) de [DISCIPLINA] especialista em inclusão. Crie atividade sobre [TEMA] para [ANO], em três versões. Contexto: [CONTEXTO]. Versão A: texto curto e respostas localizadas. B: interpretação. C: inferência e opinião. Mantenha mesmo tema e aparência semelhante.", campos: [{ chave: "DISCIPLINA", rotulo: "Disciplina", exemplo: "Ex.: Português" }, { chave: "TEMA", rotulo: "Tema", exemplo: "Ex.: uma fábula" }, { chave: "ANO", rotulo: "Ano/série", exemplo: "Ex.: 4º ano" }, { chave: "CONTEXTO", rotulo: "Contexto", exemplo: "Ex.: 30 alunos, ritmos diversos", linhas: 3 }], dica: "Revise cada versão para que ela acolha sem infantilizar." } },
      caso(6), duelo(6),
      { titulo: "Recursos visuais com intenção", tipo: TipoLicao.TEORIA, xp: 10, tempo: 5, cap: "Cap. 8", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Canva e IA visual ajudam a tornar uma explicação visível, mas imagem não substitui objetivo. Defina o que o aluno precisa perceber antes de criar." }, { tipo: "dica", titulo: "Acessibilidade", texto: "Prefira contraste, texto legível e descrições claras; não dependa apenas de cor para comunicar." }] } },
      { titulo: "Checkpoint do Encontro 3", tipo: TipoLicao.CHECKPOINT, xp: 50, tempo: 3, cap: "Encontro 3", conteudo: { titulo: "Você já consegue adaptar com propósito", itens: ["Criar uma atividade em três níveis", "Simplificar linguagem figurada", "Preservar pertencimento na adaptação", "Planejar um recurso visual acessível"], tarefa: "Aplique uma adaptação e anote o que facilitou a participação." } },
    ],
  },
  {
    ordem: 3, titulo: "Encontro 4", subtitulo: "Avaliação, ética e projeto final", cor: "#F59E0B", icone: "🏆",
    licoes: [
      aquecimento(3, "Qual parte da avaliação mais consome seu tempo: criar, corrigir ou lidar com dúvidas sobre autoria?", "Hoje você transforma esse trabalho em um processo mais claro, justo e seguro."),
      { titulo: "Avaliar raciocínio, não só memória", tipo: TipoLicao.TEORIA, xp: 10, tempo: 6, cap: "Cap. 9", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Uma boa avaliação pede interpretação, justificativa e relação com contexto. A IA pode gerar um primeiro rascunho; você calibra o nível e confere tudo." }, { tipo: "dica", titulo: "Distratores", texto: "Alternativas erradas úteis representam equívocos reais de raciocínio, não opções absurdas." }] } },
      desafio(3, 360, ["Escolha um conteúdo que você avaliará neste bimestre.", "Peça cinco questões objetivas e duas discursivas, com situações contextualizadas.", "Exija gabarito comentado para cada alternativa incorreta.", "Revise ambiguidade, nível da turma e correção antes de salvar."], "Produto de saída: uma avaliação revisada, não uma prova aceita sem conferência."),
      caca(3, "O gabarito está correto?", [{ id: "a", texto: "Sim, percentuais iguais se anulam", correta: false }, { id: "b", texto: "Não; o preço final é R$ 75,00", correta: true }, { id: "c", texto: "Não; o preço final é R$ 70,00", correta: false }]),
      celular(3, ["Escolha um trabalho ou projeto que você avaliará em breve.", "Peça uma rubrica com critérios e níveis: Precisa melhorar, Bom e Excelente.", "Leia cada nível como se você fosse estudante: ele explica o que fazer?", "Se estiver abstrato, peça critérios mais concretos e observáveis.", "Salve a rubrica revisada."], "Uma rubrica clara reduz dúvidas e torna a correção mais consistente."),
      { titulo: "LGPD: a linha vermelha", tipo: TipoLicao.TEORIA, xp: 15, tempo: 7, cap: "Cap. 10", conteudo: { blocos: [{ tipo: "atencao", titulo: "Nunca envie", texto: "Nomes completos, documentos, laudos identificáveis, endereços, fotos, notas ou matrículas associadas a nomes." }, { tipo: "dica", titulo: "Teste de segurança", texto: "Se este texto vazasse amanhã, alguém identificaria o estudante? Se sim, anonimize mais." }] } },
      caso(3), duelo(3),
      caso(7),
      { titulo: "Feedback que faz o aluno continuar", tipo: TipoLicao.TEORIA, xp: 10, tempo: 5, cap: "Cap. 9.4", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Peça feedback que reconheça avanços, priorize poucas melhorias e mostre como avançar. A meta é ensinar o próximo passo, não listar todos os erros." }] } },
      duelo(7),
      { titulo: "Checkpoint final", tipo: TipoLicao.CHECKPOINT, xp: 80, tempo: 5, cap: "Encontro 4", conteudo: { titulo: "Você concluiu a trilha", itens: ["Criar e revisar avaliações", "Usar rubricas claras", "Anonimizar dados antes de usar IA", "Lidar com autoria sem depender de detectores", "Manter um banco pessoal de prompts"], tarefa: "Aplique seu projeto de intervenção e registre o que mudou na sua prática." } },
    ],
  },
  {
    ordem: 4, titulo: "Extra: oficina de planejamento", subtitulo: "Prática guiada para transformar a apostila em rotina", cor: "#14B8A6", icone: "🧭", faixa: "Extra", pago: false,
    licoes: [
      { titulo: "Do prompt ao material utilizável", tipo: TipoLicao.TEORIA, xp: 15, tempo: 6, cap: "Extensão pedagógica", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Esta oficina é uma extensão nova, baseada nos princípios de P.T.C.F., revisão humana, acessibilidade e privacidade vistos na apostila. O objetivo é reunir esses passos em uma rotina repetível." }, { tipo: "lista", titulo: "Ciclo de qualidade", itens: ["Defina objetivo e restrições", "Peça um primeiro rascunho", "Confira fatos, linguagem e inclusão", "Teste um trecho com a turma", "Registre o que ajustará na próxima vez"] }] } },
      { titulo: "Caso: um material bonito, mas inviável", tipo: TipoLicao.CASO, xp: 35, tempo: 8, cap: "Extensão pedagógica", conteudo: { titulo: "Um material bonito, mas inviável", contexto: "Uma professora recebeu da IA uma sequência visualmente atraente, mas ela pressupõe projetor, impressão colorida e 90 minutos que a turma não tem.", pergunta: "Quais restrições devem entrar no próximo prompt e quais partes você manteria?", solucao: "Volte ao P.T.C.F.: informe tempo, recursos existentes, número de alunos e objetivo. Preserve a ideia pedagógica, não a forma que a IA escolheu.", tempoMinutos: 8 } },
      { titulo: "Desafio: seu roteiro de revisão", tipo: TipoLicao.DESAFIO, xp: 35, tempo: 8, cap: "Extensão pedagógica", conteudo: { titulo: "Desafio: seu roteiro de revisão", segundos: 480, instrucoes: ["Escolha um material que você já gerou com IA.", "Revise objetivo, fontes, adequação ao ano, acessibilidade e dados pessoais.", "Escreva um refinamento com as duas correções mais importantes.", "Salve uma checklist curta para reaplicar."], fechamento: "Produto de saída: uma rotina de revisão que evita aceitar respostas prontas sem critério." } },
      { titulo: "Checkpoint da oficina extra", tipo: TipoLicao.CHECKPOINT, xp: 50, tempo: 4, cap: "Extensão pedagógica", conteudo: { titulo: "Planejamento com qualidade", itens: ["Transformar restrições em contexto", "Revisar antes de aplicar", "Checar acessibilidade e privacidade", "Salvar um modelo que melhora com o uso"], tarefa: "Use sua checklist em um material real antes da próxima aula." } },
    ],
  },
  {
    ordem: 5, titulo: "Fase 1: Fundamentos avançados", subtitulo: "Decisões pedagógicas, projeto e uso responsável", cor: "#7C3AED", icone: "🎓", faixa: "Avançado · Fase 1", pago: true,
    licoes: [
      { titulo: "Projetar antes de gerar", tipo: TipoLicao.TEORIA, xp: 20, tempo: 8, cap: "Extensão avançada", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Conteúdo avançado novo: aqui a IA entra em um projeto pedagógico inteiro, mas as escolhas continuam sendo do educador. Use os fundamentos da apostila como critério: objetivo claro, contexto real, conferência e proteção de dados." }, { tipo: "lista", titulo: "Antes do primeiro prompt", itens: ["Qual aprendizagem será evidenciada?", "Que decisão continua humana?", "Que evidência mostrará progresso?", "Como estudantes com ritmos diferentes participarão?"] }] } },
      { titulo: "Caso: automação que reduz a escuta", tipo: TipoLicao.CASO, xp: 40, tempo: 10, cap: "Extensão avançada", conteudo: { titulo: "Automação que reduz a escuta", contexto: "A equipe quer gerar feedbacks em massa para uma turma. Os textos ficam corretos, mas estudantes não reconhecem suas produções nem sabem qual próximo passo priorizar.", pergunta: "Como redesenhar o fluxo para ganhar tempo sem transformar feedback em mensagem genérica?", solucao: "Use a IA para estruturar rascunhos anônimos e critérios; o professor seleciona evidências reais, define uma prioridade por estudante e revisa o tom. Eficiência não substitui escuta.", tempoMinutos: 10 } },
      { titulo: "Duelo: pedido genérico ou evidência clara?", tipo: TipoLicao.DUELO, xp: 35, tempo: 7, cap: "Extensão avançada", conteudo: { titulo: "Pedido genérico ou evidência clara?", tempo: "7 min", contexto: "Compare os dois pedidos antes de escrever sua versão.", promptRuim: "Crie um projeto sobre meio ambiente para minha turma.", resultadoRuim: "Sem objetivo, duração, recursos ou evidência, a resposta tende a ser genérica e difícil de aplicar.", promptBom: "Atue como co-planejador. Para 8º ano, proponha um projeto de 3 aulas sobre consumo de água. Contexto: 32 alunos e pouco acesso à internet. A evidência final deve ser uma proposta local justificada com dados. Entregue etapas, materiais de baixo custo, apoios de leitura e rubrica de 3 critérios.", resultadoBom: "O pedido explicita objetivo, contexto, evidência, restrições e formato; a IA recebe direção e o professor preserva o julgamento.", desafio: "Escreva uma versão desse pedido para um projeto real seu:", promptParaReescrever: "Crie um projeto para minha turma." } },
      { titulo: "Desafio: protocolo de uso responsável", tipo: TipoLicao.DESAFIO, xp: 45, tempo: 12, cap: "Extensão avançada", conteudo: { titulo: "Desafio: protocolo de uso responsável", segundos: 720, instrucoes: ["Escolha uma tarefa recorrente da sua escola.", "Defina o que a IA pode rascunhar e o que exige decisão humana.", "Liste quais dados precisam ser anonimizados ou não podem sair da escola.", "Crie um critério de qualidade que você conferirá antes de usar o resultado.", "Escreva como comunicará esse uso de modo transparente."], fechamento: "Produto de saída: um protocolo que torna o uso de IA verificável, seguro e pedagógico." } },
      { titulo: "Checkpoint avançado", tipo: TipoLicao.CHECKPOINT, xp: 90, tempo: 5, cap: "Extensão avançada", conteudo: { titulo: "Projeto com decisão humana", itens: ["Projetar evidências antes de gerar", "Usar IA para rascunho, não para julgar", "Criar apoios sem reduzir expectativas", "Proteger dados e explicar o processo"], tarefa: "Aplique o protocolo em uma atividade pequena, registre o resultado e revise-o antes de escalar." } },
    ],
  },
];

/*
 * Formação Avançada — seis fases que transformam a base gratuita em uma
 * prática profissional contínua. Cada fase entrega um produto aplicável e
 * usa os mesmos players, progresso, XP e desbloqueio sequencial da trilha.
 * Não é conteúdo extra por volume: cada lição resolve uma decisão real da
 * rotina docente e prepara a fase seguinte.
 */
MODULOS.push(
  {
    ordem: 6, titulo: "Fase 2: Prompt Engineering docente", subtitulo: "Pedidos precisos, revisáveis e reutilizáveis", cor: "#8B5CF6", icone: "🧭", faixa: "Avançado · Fase 2", pago: true,
    licoes: [
      { titulo: "Do pedido ao briefing pedagógico", tipo: TipoLicao.TEORIA, xp: 20, tempo: 8, cap: "Fase 2.1", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Um prompt profissional funciona como um briefing: define aprendizagem, público, evidência, restrições e formato. Isso reduz retrabalho e deixa claro o que você precisa revisar." }, { tipo: "lista", titulo: "Checklist do briefing", itens: ["Objetivo observável e habilidade a conferir", "Turma, repertório e barreiras previstas", "Tempo, recursos e limites reais", "Produto final e critérios de qualidade"] }] } },
      { titulo: "Prompt para sequência didática", tipo: TipoLicao.PROMPT, xp: 35, tempo: 12, cap: "Fase 2.2", conteudo: { introducao: "Transforme uma intenção de aula em uma sequência que você consegue revisar e adaptar.", categoria: "planejamento-avancado", corpo: "Atue como co-planejador pedagógico de [DISCIPLINA]. Para [ANO], crie uma sequência de [NUMERO_DE_AULAS] aulas sobre [TEMA]. Contexto da turma: [CONTEXTO]. A evidência final será [EVIDENCIA]. Em cada aula, entregue objetivo, abertura, atividade, apoio para diferentes ritmos, recursos disponíveis, avaliação formativa e plano B. Não invente códigos da BNCC; marque onde eu devo conferir.", campos: [{ chave: "DISCIPLINA", rotulo: "Disciplina", exemplo: "Ex.: Geografia" }, { chave: "ANO", rotulo: "Ano/série", exemplo: "Ex.: 7º ano" }, { chave: "NUMERO_DE_AULAS", rotulo: "Quantidade de aulas", exemplo: "Ex.: 4" }, { chave: "TEMA", rotulo: "Tema", exemplo: "Ex.: consumo de água" }, { chave: "CONTEXTO", rotulo: "Turma e condições reais", exemplo: "Ex.: 32 alunos, internet instável", linhas: 3 }, { chave: "EVIDENCIA", rotulo: "Evidência final", exemplo: "Ex.: proposta local justificada" }], dica: "Salve a versão revisada: ela vira um modelo vivo, não um texto descartável." } },
      { titulo: "Duelo: ideia solta ou especificação?", tipo: TipoLicao.DUELO, xp: 30, tempo: 7, cap: "Fase 2.3", conteudo: { titulo: "Duelo: ideia solta ou especificação?", tempo: "7 min", contexto: "Compare o que cada pedido permite decidir antes de gerar.", promptRuim: "Crie atividades criativas sobre frações.", resultadoRuim: "A resposta pode ser interessante, mas não informa ano, objetivo, tempo, recursos ou como saber se a turma aprendeu.", promptBom: "Para o 5º ano, crie duas atividades de 25 minutos sobre equivalência de frações. Tenho papel, lápis e tampinhas; não tenho projetor. A evidência é explicar oralmente por que 1/2 e 2/4 representam a mesma quantidade. Inclua um apoio visual e um erro comum para discutir.", resultadoBom: "O pedido orienta escolhas pedagógicas, preserva a realidade da escola e já define como observar a aprendizagem.", desafio: "Reescreva um pedido real seu usando objetivo, contexto, evidência e restrições:", promptParaReescrever: "Crie uma atividade para minha turma." } },
      { titulo: "Desafio: sua biblioteca profissional", tipo: TipoLicao.DESAFIO, xp: 45, tempo: 15, cap: "Fase 2.4", conteudo: { titulo: "Desafio: sua biblioteca profissional", segundos: 900, instrucoes: ["Escolha três tarefas recorrentes da sua semana.", "Escreva um briefing reutilizável para cada uma.", "Defina os campos que mudam e os critérios que você sempre revisará.", "Teste um deles com um tema real e refine o modelo.", "Salve os três prompts com nomes fáceis de encontrar."], fechamento: "Produto de saída: três modelos de prompt que diminuem o trabalho de começar do zero." } },
      { titulo: "Checkpoint da Fase 2", tipo: TipoLicao.CHECKPOINT, xp: 70, tempo: 5, cap: "Fase 2", conteudo: { titulo: "Briefings que geram material utilizável", itens: ["Transformar uma intenção em especificação", "Pedir evidência de aprendizagem", "Declarar restrições reais", "Salvar e evoluir modelos de prompt"], tarefa: "Use um modelo da sua biblioteca no próximo planejamento e registre um ajuste que ele ainda precisa." } },
    ],
  },
  {
    ordem: 7, titulo: "Fase 3: Planejamento e projetos", subtitulo: "Sequências, metodologias ativas e interdisciplinaridade", cor: "#2563EB", icone: "🗺️", faixa: "Avançado · Fase 3", pago: true,
    licoes: [
      { titulo: "Planejar da evidência para a experiência", tipo: TipoLicao.TEORIA, xp: 20, tempo: 8, cap: "Fase 3.1", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Projetos fortes não começam pela ferramenta ou por um cartaz bonito. Começam pela evidência: o que o estudante fará, explicará ou produzirá para mostrar que aprendeu? A IA ajuda a desenhar rotas; a decisão pedagógica é sua." }, { tipo: "dica", titulo: "Metodologia ativa com propósito", texto: "Use investigação, debate, estação ou projeto quando a ação ajuda a construir a aprendizagem — não apenas para deixar a aula movimentada." }] } },
      { titulo: "Projeto interdisciplinar com IA", tipo: TipoLicao.PROMPT, xp: 35, tempo: 12, cap: "Fase 3.2", conteudo: { introducao: "Crie um projeto viável, com papéis claros para estudantes e professores.", categoria: "projetos", corpo: "Crie um projeto interdisciplinar para [ANO] sobre [PROBLEMA_LOCAL], integrando [DISCIPLINAS]. Duração: [DURACAO]. Recursos disponíveis: [RECURSOS]. Produto público: [PRODUTO]. Organize pergunta norteadora, etapas por aula, fontes que precisam ser conferidas, papéis dos estudantes, apoios de leitura, critérios de avaliação e alternativa sem internet.", campos: [{ chave: "ANO", rotulo: "Ano/série", exemplo: "Ex.: 8º ano" }, { chave: "PROBLEMA_LOCAL", rotulo: "Problema local", exemplo: "Ex.: desperdício de água na escola" }, { chave: "DISCIPLINAS", rotulo: "Disciplinas", exemplo: "Ex.: Ciências e Matemática" }, { chave: "DURACAO", rotulo: "Duração", exemplo: "Ex.: 3 aulas de 50 min" }, { chave: "RECURSOS", rotulo: "Recursos", exemplo: "Ex.: papel, celulares compartilhados" }, { chave: "PRODUTO", rotulo: "Produto público", exemplo: "Ex.: proposta para a comunidade escolar" }], dica: "Confira se cada disciplina contribui com uma aprendizagem real, e não apenas com uma decoração do projeto." } },
      { titulo: "Caso: o projeto que não cabe na escola", tipo: TipoLicao.CASO, xp: 40, tempo: 10, cap: "Fase 3.3", conteudo: { titulo: "O projeto que não cabe na escola", contexto: "A IA propõe uma feira científica de três semanas, laboratório, impressão colorida e pesquisa online individual. Você tem duas aulas, uma turma grande e internet irregular.", pergunta: "Como preservar a pergunta investigativa e a autoria dos estudantes sem copiar o projeto inviável?", solucao: "Reduza o escopo, mantenha uma evidência alcançável e transforme recursos escassos em parte do contexto. Por exemplo: usar observação do consumo de água na própria escola, tabelas no caderno e uma proposta curta para a gestão.", tempoMinutos: 10 } },
      { titulo: "Desafio: uma aula com plano B", tipo: TipoLicao.DESAFIO, xp: 45, tempo: 15, cap: "Fase 3.4", conteudo: { titulo: "Desafio: uma aula com plano B", segundos: 900, instrucoes: ["Escolha uma aula das próximas duas semanas.", "Defina a evidência mínima de aprendizagem.", "Planeje abertura, investigação ou prática e fechamento.", "Peça à IA um plano B para falta de internet, ausência de material ou menos tempo.", "Revise para garantir que o plano B preserva o mesmo objetivo."], fechamento: "Produto de saída: uma aula real com alternativas, pronta para a realidade imprevisível da escola." } },
      { titulo: "Checkpoint da Fase 3", tipo: TipoLicao.CHECKPOINT, xp: 70, tempo: 5, cap: "Fase 3", conteudo: { titulo: "Projetos que cabem na realidade", itens: ["Definir evidência antes da atividade", "Criar projetos interdisciplinares coerentes", "Planejar metodologias ativas com propósito", "Manter um plano B pedagógico"], tarefa: "Aplique uma etapa curta do projeto e anote o que os estudantes efetivamente conseguiram evidenciar." } },
    ],
  },
  {
    ordem: 8, titulo: "Fase 4: Avaliação e feedback", subtitulo: "Questões, rubricas e decisões orientadas por evidências", cor: "#DB2777", icone: "📊", faixa: "Avançado · Fase 4", pago: true,
    licoes: [
      { titulo: "Avaliar sem terceirizar o julgamento", tipo: TipoLicao.TEORIA, xp: 20, tempo: 8, cap: "Fase 4.1", conteudo: { blocos: [{ tipo: "paragrafo", texto: "A IA pode sugerir questões, organizar padrões e rascunhar feedbacks. Ela não conhece o percurso do estudante nem decide o que é justo. Use-a para ganhar estrutura e deixe o julgamento, a evidência e o tom sob responsabilidade humana." }, { tipo: "lista", titulo: "Antes de aplicar", itens: ["Confira correção e ambiguidade", "Calibre a exigência para a turma", "Use critérios observáveis", "Leia o feedback como se você fosse o estudante"] }] } },
      { titulo: "Rubrica e feedback acionável", tipo: TipoLicao.PROMPT, xp: 35, tempo: 12, cap: "Fase 4.2", conteudo: { introducao: "Crie critérios que esclareçam o próximo passo, não apenas uma nota.", categoria: "avaliacao", corpo: "Para uma atividade de [ATIVIDADE] em [DISCIPLINA], [ANO], crie uma rubrica com [NUMERO_CRITERIOS] critérios observáveis e três níveis de desempenho. Depois, escreva três modelos curtos de feedback: um para avanço consistente, um para dificuldade específica e um para revisão. Use linguagem respeitosa, descreva evidências e indique apenas um próximo passo. Não use dados identificáveis de estudantes.", campos: [{ chave: "ATIVIDADE", rotulo: "Atividade", exemplo: "Ex.: texto de opinião" }, { chave: "DISCIPLINA", rotulo: "Disciplina", exemplo: "Ex.: Língua Portuguesa" }, { chave: "ANO", rotulo: "Ano/série", exemplo: "Ex.: 6º ano" }, { chave: "NUMERO_CRITERIOS", rotulo: "Quantidade de critérios", exemplo: "Ex.: 3" }], dica: "Troque a palavra abstrata 'bom' por evidências que o estudante reconhece no próprio trabalho." } },
      { titulo: "Caça ao erro: rubrica que parece clara", tipo: TipoLicao.CACA_ERRO, xp: 30, tempo: 7, cap: "Fase 4.3", conteudo: { introducao: "Leia o critério antes de aceitar a rubrica gerada.", respostaIA: "Critério: criatividade. Excelente: muito criativo. Bom: criativo. Precisa melhorar: pouco criativo.", pergunta: "Por que esse critério não orienta uma devolutiva justa?", opcoes: [{ id: "a", texto: "Porque usa três níveis em vez de quatro", correta: false }, { id: "b", texto: "Porque não define evidências observáveis nem diferenças entre os níveis", correta: true }, { id: "c", texto: "Porque criatividade não pode ser avaliada", correta: false }], gabarito: "Os níveis repetem a mesma palavra e não dizem o que observar. Critérios precisam descrever evidências do trabalho.", licao: "A IA pode escrever uma tabela bonita; o professor verifica se ela realmente ajuda alguém a melhorar." } },
      { titulo: "Desafio: calibrar um feedback", tipo: TipoLicao.DESAFIO, xp: 45, tempo: 15, cap: "Fase 4.4", conteudo: { titulo: "Desafio: calibrar um feedback", segundos: 900, instrucoes: ["Escolha uma produção fictícia ou anonimizada de estudante.", "Defina uma evidência de avanço e uma prioridade de melhoria.", "Peça um rascunho de feedback curto usando sua rubrica.", "Retire qualquer generalização, rótulo ou promessa que você não possa sustentar.", "Reescreva o próximo passo para que seja realizável na próxima atividade."], fechamento: "Produto de saída: uma devolutiva específica, humana e utilizável." } },
      { titulo: "Checkpoint da Fase 4", tipo: TipoLicao.CHECKPOINT, xp: 70, tempo: 5, cap: "Fase 4", conteudo: { titulo: "Avaliação que orienta aprendizagem", itens: ["Criar questões e rubricas revisáveis", "Reconhecer critérios vagos", "Dar um próximo passo acionável", "Proteger dados em qualquer análise"], tarefa: "Teste uma rubrica em uma pequena atividade e ajuste um critério que os estudantes não compreenderem." } },
    ],
  },
  {
    ordem: 9, titulo: "Fase 5: Inclusão e materiais", subtitulo: "Personalização, recuperação e recursos acessíveis", cor: "#059669", icone: "🧩", faixa: "Avançado · Fase 5", pago: true,
    licoes: [
      { titulo: "Personalizar sem reduzir expectativas", tipo: TipoLicao.TEORIA, xp: 20, tempo: 8, cap: "Fase 5.1", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Personalização não é criar uma atividade menor para quem aprende de outro jeito. É oferecer apoios, percursos e formas de demonstrar aprendizagem, preservando o objetivo comum sempre que possível." }, { tipo: "dica", titulo: "Recuperação com diagnóstico", texto: "Comece pelo obstáculo específico: vocabulário, leitura de dados, procedimento ou conceito. Uma lista longa de exercícios iguais raramente resolve a causa." }] } },
      { titulo: "Rota de recuperação e reforço", tipo: TipoLicao.PROMPT, xp: 35, tempo: 12, cap: "Fase 5.2", conteudo: { introducao: "Planeje apoio sem expor estudantes e sem baixar o objetivo da turma.", categoria: "inclusao", corpo: "Para [TEMA] em [ANO], crie uma rota de recuperação de [DURACAO] para estudantes que apresentam dificuldade em [OBSTACULO]. Preserve o objetivo [OBJETIVO]. Inclua diagnóstico inicial sem nota, explicação em linguagem clara, exemplo concreto, prática guiada, atividade autônoma em dois níveis de apoio e uma verificação final. Sugira adaptações de acesso sem usar nomes, laudos ou dados pessoais.", campos: [{ chave: "TEMA", rotulo: "Tema", exemplo: "Ex.: operações com frações" }, { chave: "ANO", rotulo: "Ano/série", exemplo: "Ex.: 6º ano" }, { chave: "DURACAO", rotulo: "Duração", exemplo: "Ex.: 2 aulas" }, { chave: "OBSTACULO", rotulo: "Obstáculo observado", exemplo: "Ex.: confunde denominador e numerador" }, { chave: "OBJETIVO", rotulo: "Objetivo comum", exemplo: "Ex.: comparar frações simples" }], dica: "Descreva a barreira de aprendizagem, não o estudante." } },
      { titulo: "Caso: adaptação que afasta", tipo: TipoLicao.CASO, xp: 40, tempo: 10, cap: "Fase 5.3", conteudo: { titulo: "Adaptação que afasta", contexto: "Para incluir um estudante com dificuldade de leitura, a IA sugere uma folha infantilizada, com outro tema e sem o desafio central da turma. O material chama atenção para a diferença e reduz a participação.", pergunta: "Como adaptar acesso e linguagem sem tirar pertencimento ou alterar desnecessariamente o objetivo?", solucao: "Mantenha o mesmo tema e objetivo, simplifique instruções, ofereça texto segmentado, apoio visual e possibilidade de resposta oral ou em dupla. A adaptação deve remover barreiras, não isolar o estudante.", tempoMinutos: 10 } },
      { titulo: "Desafio: material em três formatos", tipo: TipoLicao.DESAFIO, xp: 45, tempo: 15, cap: "Fase 5.4", conteudo: { titulo: "Desafio: material em três formatos", segundos: 900, instrucoes: ["Escolha uma explicação difícil do seu conteúdo.", "Peça uma versão curta para leitura, um roteiro visual e uma pergunta para discussão oral.", "Confira contraste, linguagem, tamanho do texto e se nenhuma versão depende apenas de cor.", "Verifique se os três formatos preservam a mesma ideia central.", "Escolha qual formato será apoio e qual será evidência de aprendizagem."], fechamento: "Produto de saída: um pequeno conjunto acessível de materiais para uma aula real." } },
      { titulo: "Checkpoint da Fase 5", tipo: TipoLicao.CHECKPOINT, xp: 70, tempo: 5, cap: "Fase 5", conteudo: { titulo: "Mais caminhos para a mesma aprendizagem", itens: ["Diagnosticar obstáculos específicos", "Criar rotas de recuperação", "Adaptar sem infantilizar", "Produzir materiais acessíveis em mais de um formato"], tarefa: "Aplique um apoio em uma aula e anote se ele aumentou participação sem mudar o objetivo." } },
    ],
  },
  {
    ordem: 10, titulo: "Fase 6: Fluxos, ética e projeto final", subtitulo: "Implementação responsável e certificação avançada", cor: "#EA580C", icone: "🏁", faixa: "Avançado · Fase 6", pago: true,
    licoes: [
      { titulo: "Fluxos de trabalho que preservam o professor", tipo: TipoLicao.TEORIA, xp: 25, tempo: 9, cap: "Fase 6.1", conteudo: { blocos: [{ tipo: "paragrafo", texto: "Produtividade não significa entregar mais textos. Um bom fluxo define onde a IA rascunha, onde você confere fontes, onde decide pedagogicamente e como registra versões. A economia de tempo deve voltar para escuta, planejamento e acompanhamento." }, { tipo: "atencao", titulo: "Limites éticos", texto: "Não use detectores de IA como prova de autoria. Investigue processo, versões, conversa e evidências da aprendizagem. Nunca envie dados identificáveis para uma ferramenta sem autorização e proteção adequadas." }] } },
      { titulo: "Seu sistema semanal de produção", tipo: TipoLicao.PROMPT, xp: 35, tempo: 12, cap: "Fase 6.2", conteudo: { introducao: "Desenhe um fluxo que diminua tarefas repetitivas sem automatizar decisões sensíveis.", categoria: "produtividade", corpo: "Ajude-me a organizar um fluxo semanal para [TAREFAS]. Tenho [TEMPO_DISPONIVEL] e uso [FERRAMENTAS]. Para cada tarefa, indique: entrada anonimizada, primeira versão que a IA pode rascunhar, checagens humanas obrigatórias, resultado a salvar e risco a evitar. Marque claramente o que não deve ser automatizado, especialmente decisões sobre estudantes.", campos: [{ chave: "TAREFAS", rotulo: "Tarefas recorrentes", exemplo: "Ex.: planejar, criar atividade e registrar devolutivas" }, { chave: "TEMPO_DISPONIVEL", rotulo: "Tempo disponível", exemplo: "Ex.: 90 min por semana" }, { chave: "FERRAMENTAS", rotulo: "Ferramentas disponíveis", exemplo: "Ex.: ChatGPT e Google Docs" }], dica: "Se uma etapa exige julgamento sobre uma pessoa, ela continua humana." } },
      { titulo: "Caso: dados que parecem inofensivos", tipo: TipoLicao.CASO, xp: 40, tempo: 10, cap: "Fase 6.3", conteudo: { titulo: "Dados que parecem inofensivos", contexto: "Uma planilha sem nomes traz turma, data de nascimento, faltas, notas e um comentário sobre comportamento. A equipe quer enviar tudo para a IA identificar quem precisa de reforço.", pergunta: "Que riscos existem e como reorganizar a análise para que ela ajude sem expor estudantes ou delegar uma decisão?", solucao: "A combinação de dados pode reidentificar pessoas e gerar rótulos injustos. Agregue informações, remova identificadores e use a IA para sugerir perguntas ou formatos de acompanhamento. A decisão sobre apoio exige evidências pedagógicas e responsabilidade da equipe.", tempoMinutos: 10 } },
      { titulo: "Projeto final: intervenção com IA", tipo: TipoLicao.DESAFIO, xp: 80, tempo: 30, cap: "Fase 6.4", conteudo: { titulo: "Projeto final: intervenção com IA", segundos: 1800, instrucoes: ["Escolha um problema real e delimitado da sua prática docente.", "Defina objetivo, evidência de aprendizagem, turma e restrições.", "Use um prompt da sua biblioteca para criar e revisar uma sequência, material ou avaliação.", "Descreva os apoios de inclusão, as checagens humanas e a proteção de dados.", "Registre o que funcionou, o que mudará e qual será o próximo ciclo de melhoria."], fechamento: "Produto de saída: uma intervenção pedagógica aplicável, documentada e responsável — seu portfólio avançado." } },
      { titulo: "Conclusão da Formação Avançada", tipo: TipoLicao.CHECKPOINT, xp: 120, tempo: 8, cap: "Fase 6", conteudo: { titulo: "Você concluiu a formação avançada", itens: ["Criar prompts profissionais e uma biblioteca própria", "Planejar projetos e materiais aplicáveis", "Avaliar e personalizar com critérios", "Organizar fluxos sem abrir mão do julgamento", "Implementar IA com ética, privacidade e evidências"], tarefa: "Guarde seu projeto final e compartilhe apenas uma versão sem dados pessoais com sua coordenação ou comunidade de prática." } },
    ],
  },
);

void MODULOS_INICIAIS;

/**
 * Conquistas — marcos permanentes, avaliados em `server/acoes.ts`.
 *
 * O avaliador reconhece CINCO tipos de critério, e só eles:
 *
 *   licoes    total de lições concluídas (acumulado, nunca zera)
 *   prompts   total de prompts executados
 *   ofensiva  dias seguidos na maior sequência atual
 *   curso     progressoPct da matrícula (0 a 100)
 *   modulo    quantos módulos estão 100% concluídos
 *
 * Diferença para as missões: conquista não tem ciclo. Uma vez obtida, fica.
 * Por isso os alvos são crescentes e cobrem toda a jornada — de 1 lição a 82.
 *
 * `oculto: true` esconde a conquista até ser obtida: usado nas surpresas, para
 * que descobrir seja parte da graça. As demais ficam visíveis como metas.
 *
 * Ícones limitados aos 10 de `lib/icones-gamificacao.ts`.
 */
const CONQUISTAS = [
  // ---- Primeiros passos ----------------------------------------------
  { chave: "primeira-licao", titulo: "Primeiro passo", descricao: "Concluiu a primeira atividade", icone: "conquistas", criterio: { tipo: "licoes", valor: 1 }, ordem: 0, recompensaTitulo: "Iniciante em IA" },
  { chave: "primeiro-prompt", titulo: "Mão na massa", descricao: "Executou seu primeiro prompt numa IA", icone: "prompt", criterio: { tipo: "prompts", valor: 1 }, ordem: 1, recompensaTitulo: "Professor que experimenta" },
  { chave: "tres-licoes", titulo: "Não foi sorte", descricao: "Concluiu 3 atividades", icone: "progresso", criterio: { tipo: "licoes", valor: 3 }, ordem: 2, recompensaTitulo: "Começo firme" },
  { chave: "cinco-licoes", titulo: "Pegando o ritmo", descricao: "Concluiu 5 atividades", icone: "progresso", criterio: { tipo: "licoes", valor: 5 }, ordem: 3, recompensaTitulo: "Ritmo de aprendizagem" },

  // ---- Progressão em atividades ---------------------------------------
  { chave: "dez-licoes", titulo: "Dez atividades", descricao: "Concluiu 10 atividades da formação", icone: "progresso", criterio: { tipo: "licoes", valor: 10 }, ordem: 4, recompensaTitulo: "Primeira dezena" },
  { chave: "vinte-licoes", titulo: "Vinte atividades", descricao: "Concluiu 20 atividades da formação", icone: "metas", criterio: { tipo: "licoes", valor: 20 }, ordem: 5, recompensaTitulo: "Caminho consolidado" },
  { chave: "quarenta-licoes", titulo: "Quarenta atividades", descricao: "Concluiu 40 atividades — quase metade da formação", icone: "metas", criterio: { tipo: "licoes", valor: 40 }, ordem: 6, recompensaTitulo: "Meio caminho andado" },
  { chave: "sessenta-licoes", titulo: "Sessenta atividades", descricao: "Concluiu 60 atividades da formação", icone: "desafios", criterio: { tipo: "licoes", valor: 60 }, ordem: 7, recompensaTitulo: "Reta final à vista" },
  { chave: "todas-as-licoes", titulo: "Nenhuma atividade pendente", descricao: "Concluiu todas as 82 atividades da formação", icone: "certificados", criterio: { tipo: "licoes", valor: 82 }, ordem: 8, recompensaTitulo: "Formação integral" },

  // ---- Prática com prompts ---------------------------------------------
  { chave: "cinco-prompts", titulo: "Testando de verdade", descricao: "Executou 5 prompts em ferramentas de IA", icone: "prompt", criterio: { tipo: "prompts", valor: 5 }, ordem: 9, recompensaTitulo: "Curiosidade prática" },
  { chave: "vinte-prompts", titulo: "Vinte prompts", descricao: "Executou 20 prompts em ferramentas de IA", icone: "prompt", criterio: { tipo: "prompts", valor: 20 }, ordem: 10, recompensaTitulo: "Praticante de prompts" },
  { chave: "cinquenta-prompts", titulo: "Cinquenta prompts", descricao: "Executou 50 prompts — a prática que vira repertório", icone: "prompt", criterio: { tipo: "prompts", valor: 50 }, ordem: 11, recompensaTitulo: "Repertório construído" },
  { chave: "cem-prompts", titulo: "Cem prompts", descricao: "Executou 100 prompts em ferramentas de IA", icone: "certificados", criterio: { tipo: "prompts", valor: 100 }, ordem: 12, recompensaTitulo: "Especialista em prompts" },

  // ---- Constância -------------------------------------------------------
  { chave: "ofensiva-3", titulo: "Três dias seguidos", descricao: "Manteve a ofensiva por 3 dias", icone: "calendario", criterio: { tipo: "ofensiva", valor: 3 }, ordem: 13, recompensaTitulo: "Professor consistente" },
  { chave: "ofensiva-7", titulo: "Uma semana inteira", descricao: "Manteve a ofensiva por 7 dias seguidos", icone: "calendario", criterio: { tipo: "ofensiva", valor: 7 }, ordem: 14, recompensaTitulo: "Semana sem falhar" },
  { chave: "ofensiva-14", titulo: "Duas semanas", descricao: "Manteve a ofensiva por 14 dias seguidos", icone: "calendario", criterio: { tipo: "ofensiva", valor: 14 }, ordem: 15, recompensaTitulo: "Disciplina de quinzena" },
  { chave: "ofensiva-30", titulo: "Um mês de prática", descricao: "Manteve a ofensiva por 30 dias seguidos", icone: "conquistas", criterio: { tipo: "ofensiva", valor: 30 }, ordem: 16, recompensaTitulo: "Hábito formado" },
  { chave: "ofensiva-60", titulo: "Dois meses seguidos", descricao: "Manteve a ofensiva por 60 dias seguidos", icone: "certificados", criterio: { tipo: "ofensiva", valor: 60 }, ordem: 17, recompensaTitulo: "Constância rara", oculto: true },

  // ---- Módulos completos -------------------------------------------------
  { chave: "encontro-1", titulo: "Encontro 1 completo", descricao: "Terminou o primeiro encontro", icone: "recompensas", criterio: { tipo: "modulo", valor: 1 }, ordem: 18, recompensaTitulo: "Explorador de possibilidades" },
  { chave: "encontro-2", titulo: "Dois encontros completos", descricao: "Terminou dois encontros da formação", icone: "recompensas", criterio: { tipo: "modulo", valor: 2 }, ordem: 19, recompensaTitulo: "Rotina em transformação" },
  { chave: "encontro-3", titulo: "Três encontros completos", descricao: "Terminou três encontros da formação", icone: "recompensas", criterio: { tipo: "modulo", valor: 3 }, ordem: 20, recompensaTitulo: "Prática que rende tempo" },
  { chave: "encontros-presenciais", titulo: "Quatro encontros completos", descricao: "Terminou os quatro encontros da formação presencial", icone: "certificados", criterio: { tipo: "modulo", valor: 4 }, ordem: 21, recompensaTitulo: "Formação presencial concluída" },
  { chave: "primeira-fase-avancada", titulo: "Prática avançada", descricao: "Concluiu a primeira fase da formação avançada", icone: "progresso", criterio: { tipo: "modulo", valor: 6 }, ordem: 22, recompensaTitulo: "Projetista pedagógico" },
  { chave: "oito-modulos", titulo: "Oito módulos completos", descricao: "Concluiu oito módulos da formação", icone: "desafios", criterio: { tipo: "modulo", valor: 8 }, ordem: 23, recompensaTitulo: "Domínio em construção" },
  { chave: "formacao-avancada", titulo: "Formação avançada concluída", descricao: "Concluiu todas as fases premium", icone: "certificados", criterio: { tipo: "modulo", valor: 11 }, ordem: 24, recompensaTitulo: "Educador avançado com IA" },

  // ---- Progresso da trilha (percentual) -----------------------------------
  { chave: "trilha-10", titulo: "Saiu do zero", descricao: "Chegou a 10% da formação", icone: "progresso", criterio: { tipo: "curso", valor: 10 }, ordem: 25, recompensaTitulo: "Primeiros dez por cento" },
  { chave: "trilha-25", titulo: "Um quarto da trilha", descricao: "Chegou a 25% da formação", icone: "metas", criterio: { tipo: "curso", valor: 25 }, ordem: 26, recompensaTitulo: "Primeiro quarto vencido" },
  { chave: "trilha-40", titulo: "Quase na metade", descricao: "Chegou a 40% da formação", icone: "metas", criterio: { tipo: "curso", valor: 40 }, ordem: 27, recompensaTitulo: "Ritmo firme" },
  { chave: "trilha-50", titulo: "Metade da trilha", descricao: "Chegou a 50% da formação", icone: "metas", criterio: { tipo: "curso", valor: 50 }, ordem: 28, recompensaTitulo: "Metade conquistada" },
  { chave: "trilha-60", titulo: "Passou da metade", descricao: "Chegou a 60% da formação", icone: "progresso", criterio: { tipo: "curso", valor: 60 }, ordem: 29, recompensaTitulo: "Mais da metade" },
  { chave: "trilha-75", titulo: "Três quartos da trilha", descricao: "Chegou a 75% da formação", icone: "desafios", criterio: { tipo: "curso", valor: 75 }, ordem: 30, recompensaTitulo: "Reta final" },
  { chave: "trilha-90", titulo: "Reta finalíssima", descricao: "Chegou a 90% da formação — falta pouquíssimo", icone: "desafios", criterio: { tipo: "curso", valor: 90 }, ordem: 31, recompensaTitulo: "Quase lá" },
  { chave: "curso-completo", titulo: "Formação concluída", descricao: "Completou todos os encontros", icone: "certificados", criterio: { tipo: "curso", valor: 100 }, ordem: 32, recompensaTitulo: "Educador com IA" },

  // ---- Degraus intermediários de atividades --------------------------------
  // Faixas curtas entre os marcos grandes: o vão de 20 para 40 era longo
  // demais para quem avança devagar, e sumiço de recompensa no meio do
  // caminho é onde as pessoas desistem.
  { chave: "quinze-licoes", titulo: "Quinze atividades", descricao: "Concluiu 15 atividades da formação", icone: "progresso", criterio: { tipo: "licoes", valor: 15 }, ordem: 33, recompensaTitulo: "Avanço constante" },
  { chave: "trinta-licoes", titulo: "Trinta atividades", descricao: "Concluiu 30 atividades da formação", icone: "metas", criterio: { tipo: "licoes", valor: 30 }, ordem: 34, recompensaTitulo: "Trinta vencidas" },
  { chave: "cinquenta-licoes", titulo: "Cinquenta atividades", descricao: "Concluiu 50 atividades da formação", icone: "desafios", criterio: { tipo: "licoes", valor: 50 }, ordem: 35, recompensaTitulo: "Meia centena" },
  { chave: "setenta-licoes", titulo: "Setenta atividades", descricao: "Concluiu 70 atividades — faltam poucas", icone: "desafios", criterio: { tipo: "licoes", valor: 70 }, ordem: 36, recompensaTitulo: "Fôlego de reta final" },

  // ---- Mais faixas de prompts ----------------------------------------------
  { chave: "dez-prompts-conquista", titulo: "Dez prompts", descricao: "Executou 10 prompts em ferramentas de IA", icone: "prompt", criterio: { tipo: "prompts", valor: 10 }, ordem: 37, recompensaTitulo: "Primeira dezena de prompts" },
  { chave: "trinta-prompts", titulo: "Trinta prompts", descricao: "Executou 30 prompts em ferramentas de IA", icone: "prompt", criterio: { tipo: "prompts", valor: 30 }, ordem: 38, recompensaTitulo: "Prática que virou rotina" },
  { chave: "setenta-e-cinco-prompts", titulo: "Setenta e cinco prompts", descricao: "Executou 75 prompts em ferramentas de IA", icone: "prompt", criterio: { tipo: "prompts", valor: 75 }, ordem: 39, recompensaTitulo: "Fluência em prompts" },
  { chave: "duzentos-prompts", titulo: "Duzentos prompts", descricao: "Executou 200 prompts — uso diário de verdade", icone: "certificados", criterio: { tipo: "prompts", valor: 200 }, ordem: 40, recompensaTitulo: "IA incorporada à rotina", oculto: true },

  // ---- Módulos: degraus que faltavam ---------------------------------------
  { chave: "cinco-modulos", titulo: "Cinco módulos completos", descricao: "Concluiu cinco módulos da formação", icone: "recompensas", criterio: { tipo: "modulo", valor: 5 }, ordem: 41, recompensaTitulo: "Base sólida" },
  { chave: "sete-modulos", titulo: "Sete módulos completos", descricao: "Concluiu sete módulos da formação", icone: "recompensas", criterio: { tipo: "modulo", valor: 7 }, ordem: 42, recompensaTitulo: "Maioria vencida" },
  { chave: "nove-modulos", titulo: "Nove módulos completos", descricao: "Concluiu nove módulos da formação", icone: "desafios", criterio: { tipo: "modulo", valor: 9 }, ordem: 43, recompensaTitulo: "Faltam dois" },
  { chave: "dez-modulos", titulo: "Dez módulos completos", descricao: "Concluiu dez dos onze módulos", icone: "desafios", criterio: { tipo: "modulo", valor: 10 }, ordem: 44, recompensaTitulo: "Um módulo para o fim" },

  // ---- Constância: faixas longas --------------------------------------------
  { chave: "ofensiva-21", titulo: "Vinte e um dias", descricao: "Manteve a ofensiva por 21 dias — o tempo que um hábito leva para firmar", icone: "calendario", criterio: { tipo: "ofensiva", valor: 21 }, ordem: 45, recompensaTitulo: "Hábito em formação" },
  { chave: "ofensiva-45", titulo: "Quarenta e cinco dias", descricao: "Manteve a ofensiva por 45 dias seguidos", icone: "conquistas", criterio: { tipo: "ofensiva", valor: 45 }, ordem: 46, recompensaTitulo: "Persistência notável" },
  { chave: "ofensiva-90", titulo: "Noventa dias seguidos", descricao: "Manteve a ofensiva por 90 dias — um trimestre inteiro", icone: "certificados", criterio: { tipo: "ofensiva", valor: 90 }, ordem: 47, recompensaTitulo: "Um trimestre de disciplina", oculto: true },
  { chave: "ofensiva-180", titulo: "Meio ano de prática", descricao: "Manteve a ofensiva por 180 dias seguidos", icone: "certificados", criterio: { tipo: "ofensiva", valor: 180 }, ordem: 48, recompensaTitulo: "Meio ano sem parar", oculto: true },
  { chave: "ofensiva-365", titulo: "Um ano inteiro", descricao: "Manteve a ofensiva por 365 dias seguidos", icone: "certificados", criterio: { tipo: "ofensiva", valor: 365 }, ordem: 49, recompensaTitulo: "Um ano transformando a sala de aula", oculto: true },
];

/**
 * Missões da plataforma.
 *
 * O motor (`server/missoes.ts`) reconhece QUATRO critérios, e só eles:
 *
 *   licoes           lições concluídas no ciclo (é o padrão)
 *   prompts          prompts executados numa IA no ciclo
 *   sequencia        dias seguidos de ofensiva (ignora o ciclo: é acumulado)
 *   tipos_atividade  quantos TIPOS distintos de lição foram concluídos
 *
 * Um `criterio` fora dessa lista não quebra nada — cai no padrão `licoes` —,
 * mas produz uma missão que mede outra coisa em silêncio. Por isso nenhuma
 * missão abaixo inventa critério novo.
 *
 * Os ciclos vêm do tipo: DIARIA zera à meia-noite, SEMANAL na segunda,
 * ESPECIAL nunca zera (ciclo "unica") — é a de conquista permanente.
 *
 * Os alvos são calibrados para o curso real: 11 módulos, 82 lições e 10
 * tipos de atividade (AQUECIMENTO, TEORIA, QUIZ, PROMPT, DUELO, CACA_ERRO,
 * CASO, NO_CELULAR, DESAFIO, CHECKPOINT).
 *
 * Ícones: só os 10 nomes de `lib/icones-gamificacao.ts` são válidos. Qualquer
 * outro vira "conquistas" silenciosamente — era o caso de "explorar", usado
 * na versão anterior desta lista e que nunca existiu na biblioteca.
 */
const MISSOES = [
  // ---- Diárias: pequenas, alcançáveis no mesmo dia -------------------
  { chave: "passo-do-dia", titulo: "Passo do dia", descricao: "Conclua uma atividade hoje.", tipo: "DIARIA" as const, criterio: "licoes", alvo: 1, icone: "metas", recompensaTitulo: "Ritmo em construção", ativo: true },
  { chave: "dose-dupla", titulo: "Dose dupla", descricao: "Conclua duas atividades hoje.", tipo: "DIARIA" as const, criterio: "licoes", alvo: 2, icone: "progresso", recompensaTitulo: "Dia produtivo", ativo: true },
  { chave: "maratona-do-dia", titulo: "Maratona do dia", descricao: "Conclua quatro atividades hoje.", tipo: "DIARIA" as const, criterio: "licoes", alvo: 4, icone: "desafios", recompensaTitulo: "Fôlego de maratonista", ativo: true },
  { chave: "prompt-do-dia", titulo: "Prompt do dia", descricao: "Teste um prompt numa ferramenta de IA hoje.", tipo: "DIARIA" as const, criterio: "prompts", alvo: 1, icone: "prompt", recompensaTitulo: "Mão na massa diária", ativo: true },
  { chave: "tres-prompts", titulo: "Oficina de prompts", descricao: "Teste três prompts hoje e compare os resultados.", tipo: "DIARIA" as const, criterio: "prompts", alvo: 3, icone: "prompt", recompensaTitulo: "Refinador de prompts", ativo: true },
  { chave: "variedade-do-dia", titulo: "Variedade no cardápio", descricao: "Conclua dois tipos diferentes de atividade hoje.", tipo: "DIARIA" as const, criterio: "tipos_atividade", alvo: 2, icone: "aulas", recompensaTitulo: "Aberto a formatos", ativo: true },

  // ---- Semanais: exigem voltar mais de uma vez na semana --------------
  { chave: "ritmo-da-semana", titulo: "Ritmo da semana", descricao: "Conclua duas atividades nesta semana.", tipo: "SEMANAL" as const, criterio: "licoes", alvo: 2, icone: "progresso", recompensaTitulo: "Constância semanal", ativo: true },
  { chave: "semana-cheia", titulo: "Semana cheia", descricao: "Conclua cinco atividades nesta semana.", tipo: "SEMANAL" as const, criterio: "licoes", alvo: 5, icone: "calendario", recompensaTitulo: "Semana bem aproveitada", ativo: true },
  { chave: "semana-intensa", titulo: "Semana intensa", descricao: "Conclua dez atividades nesta semana.", tipo: "SEMANAL" as const, criterio: "licoes", alvo: 10, icone: "desafios", recompensaTitulo: "Imersão na formação", ativo: true },
  { chave: "laboratorio-semanal", titulo: "Laboratório da semana", descricao: "Teste cinco prompts nesta semana.", tipo: "SEMANAL" as const, criterio: "prompts", alvo: 5, icone: "prompt", recompensaTitulo: "Laboratório aberto", ativo: true },
  { chave: "repertorio-semanal", titulo: "Repertório da semana", descricao: "Conclua quatro tipos diferentes de atividade nesta semana.", tipo: "SEMANAL" as const, criterio: "tipos_atividade", alvo: 4, icone: "aulas", recompensaTitulo: "Repertório variado", ativo: true },

  // ---- Especiais: marcos permanentes, ciclo "unica" -------------------
  { chave: "explorador-de-formatos", titulo: "Explorador de formatos", descricao: "Conclua quatro tipos diferentes de atividade.", tipo: "ESPECIAL" as const, criterio: "tipos_atividade", alvo: 4, icone: "conquistas", recompensaTitulo: "Explorador pedagógico", ativo: true },
  { chave: "todos-os-formatos", titulo: "Conhece o curso inteiro", descricao: "Experimente os dez tipos de atividade da formação.", tipo: "ESPECIAL" as const, criterio: "tipos_atividade", alvo: 10, icone: "certificados", recompensaTitulo: "Domina todos os formatos", ativo: true },
  { chave: "sequencia-tres", titulo: "Três dias de prática", descricao: "Mantenha uma sequência de três dias.", tipo: "ESPECIAL" as const, criterio: "sequencia", alvo: 3, icone: "calendario", recompensaTitulo: "Professor consistente", ativo: true },
  { chave: "sequencia-sete", titulo: "Uma semana sem falhar", descricao: "Mantenha uma sequência de sete dias seguidos.", tipo: "ESPECIAL" as const, criterio: "sequencia", alvo: 7, icone: "calendario", recompensaTitulo: "Sete dias de disciplina", ativo: true },
  { chave: "sequencia-quinze", titulo: "Quinze dias de constância", descricao: "Mantenha uma sequência de quinze dias seguidos.", tipo: "ESPECIAL" as const, criterio: "sequencia", alvo: 15, icone: "conquistas", recompensaTitulo: "Hábito formado", ativo: true },
  { chave: "sequencia-trinta", titulo: "Um mês de prática", descricao: "Mantenha uma sequência de trinta dias seguidos.", tipo: "ESPECIAL" as const, criterio: "sequencia", alvo: 30, icone: "certificados", recompensaTitulo: "Um mês transformando a rotina", ativo: true },
  { chave: "dez-atividades", titulo: "Dez atividades concluídas", descricao: "Conclua dez atividades da formação.", tipo: "ESPECIAL" as const, criterio: "licoes", alvo: 10, icone: "progresso", recompensaTitulo: "Primeira dezena", ativo: true },
  { chave: "vinte-e-cinco-atividades", titulo: "Vinte e cinco atividades", descricao: "Conclua vinte e cinco atividades da formação.", tipo: "ESPECIAL" as const, criterio: "licoes", alvo: 25, icone: "progresso", recompensaTitulo: "Caminho consolidado", ativo: true },
  { chave: "metade-do-caminho", titulo: "Metade do caminho", descricao: "Conclua quarenta atividades — quase metade da formação.", tipo: "ESPECIAL" as const, criterio: "licoes", alvo: 40, icone: "metas", recompensaTitulo: "Meio caminho andado", ativo: true },
  { chave: "todas-as-atividades", titulo: "Formação inteira concluída", descricao: "Conclua as 82 atividades da formação.", tipo: "ESPECIAL" as const, criterio: "licoes", alvo: 82, icone: "certificados", recompensaTitulo: "Formação completa", ativo: true },
  { chave: "dez-prompts", titulo: "Dez prompts testados", descricao: "Teste dez prompts em ferramentas de IA.", tipo: "ESPECIAL" as const, criterio: "prompts", alvo: 10, icone: "prompt", recompensaTitulo: "Praticante de prompts", ativo: true },
  { chave: "cinquenta-prompts", titulo: "Cinquenta prompts testados", descricao: "Teste cinquenta prompts — a prática que vira repertório.", tipo: "ESPECIAL" as const, criterio: "prompts", alvo: 50, icone: "prompt", recompensaTitulo: "Repertório de prompts", ativo: true },
  { chave: "cem-prompts", titulo: "Cem prompts testados", descricao: "Teste cem prompts em ferramentas de IA.", tipo: "ESPECIAL" as const, criterio: "prompts", alvo: 100, icone: "certificados", recompensaTitulo: "Especialista em prompts", ativo: true },
];

/**
 * Marcador de versão do seed.
 *
 * O seed é idempotente — roda quantas vezes for preciso sem duplicar nada —,
 * mas isso não o torna barato: são 8 blocos de `upsert`, alguns em laço,
 * cobrindo 82 lições, 50 verbetes, o banco de prompts e os planos. Reescrever
 * tudo isso a cada deploy gera escrita em disco e churn de WAL para produzir um
 * estado que, na imensa maioria das vezes, já é idêntico ao que está lá.
 *
 * A assinatura é o hash do PRÓPRIO ARQUIVO em execução, e não dos fontes: na
 * imagem final só existe `seed.mjs` (compilado pelo esbuild no build), sem os
 * `.ts` de origem. Como o esbuild empacota todo o conteúdo — `banco-prompts`,
 * `base-conhecimento`, `conteudo-apostila` — qualquer mudança em qualquer um
 * deles muda o arquivo compilado, e portanto o hash.
 *
 * Para forçar a execução mesmo sem mudança: FORCE_SEED=1.
 */
const CHAVE_ASSINATURA = "seed.assinatura";

async function assinaturaAtual(): Promise<string | null> {
  try {
    const { createHash } = await import("node:crypto");
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const esteArquivo = fileURLToPath(import.meta.url);
    const conteudo = await readFile(esteArquivo);
    return createHash("sha256").update(conteudo).digest("hex").slice(0, 16);
  } catch {
    // Sem assinatura calculável, o seed roda — o padrão seguro é executar.
    // Pular por não conseguir verificar deixaria conteúdo faltando em
    // produção, e o sintoma não seria um erro de deploy: seriam lições
    // ausentes na trilha do aluno.
    return null;
  }
}

async function main() {
  console.log("Semeando o Aprender IA...\n");

  const assinatura = await assinaturaAtual();
  const forcado = process.env.FORCE_SEED === "1";

  if (assinatura && !forcado) {
    const gravada = await prisma.platformSetting.findUnique({
      where: { chave: CHAVE_ASSINATURA },
      select: { valor: true },
    });
    if (gravada?.valor === assinatura) {
      console.log(`  conteúdo inalterado (assinatura ${assinatura}); seed ignorado.`);
      console.log("  use FORCE_SEED=1 para executar mesmo assim.\n");
      return;
    }
    console.log(
      gravada
        ? `  conteúdo mudou (${gravada.valor} → ${assinatura}); semeando.`
        : `  primeira execução (assinatura ${assinatura}); semeando.`,
    );
  } else if (forcado) {
    console.log("  FORCE_SEED=1; semeando mesmo sem mudança.");
  }

  // ---- Curso ----
  const curso = await prisma.course.upsert({
    where: { slug: CURSO.slug },
    update: { ...CURSO, publicado: true },
    create: { ...CURSO, publicado: true, ordem: 0 },
  });
  console.log(`  curso: ${curso.titulo}`);

  // As ferramentas pertencem a ESTE curso. Sem o `courseId` elas ficavam
  // valendo para todos, e quem abria Empreendedores — que tem ficha
  // própria de ChatGPT, Gemini e NotebookLM, com faixa de acesso e limite
  // conferido — via cada uma duas vezes.
  for (const ferramenta of FERRAMENTAS_IA) {
    const dados = { ...ferramenta, courseId: curso.id };
    await prisma.aiTool.upsert({
      where: { chave: ferramenta.chave },
      update: dados,
      create: dados,
    });
  }
  console.log(`  ferramentas de IA: ${FERRAMENTAS_IA.length}`);

  // ---- Módulos e lições ----
  let totalLicoes = 0;
  for (const m of MODULOS) {
    const modulo = await prisma.module.upsert({
      where: { courseId_ordem: { courseId: curso.id, ordem: m.ordem } },
      update: { titulo: m.titulo, subtitulo: m.subtitulo, cor: m.cor, icone: m.icone, pago: m.pago ?? false, faixa: m.faixa ?? null },
      create: {
        courseId: curso.id,
        ordem: m.ordem,
        titulo: m.titulo,
        subtitulo: m.subtitulo,
        cor: m.cor,
        icone: m.icone,
        pago: m.pago ?? false,
        faixa: m.faixa ?? null,
      },
    });

    for (const [i, l] of m.licoes.entries()) {
      const licao = await prisma.lesson.upsert({
        where: { moduleId_ordem: { moduleId: modulo.id, ordem: i } },
        update: {
          titulo: l.titulo,
          tipo: l.tipo,
          conteudo: l.conteudo,
          xpRecompensa: l.xp,
          tempoEstimado: l.tempo,
          capituloRef: l.cap,
        },
        create: {
          moduleId: modulo.id,
          ordem: i,
          titulo: l.titulo,
          tipo: l.tipo,
          conteudo: l.conteudo,
          xpRecompensa: l.xp,
          tempoEstimado: l.tempo,
          capituloRef: l.cap,
        },
      });
      totalLicoes++;

      // Lições do tipo PROMPT ganham um template reutilizável na biblioteca
      if (l.tipo === TipoLicao.PROMPT && "corpo" in l.conteudo) {
        const c = l.conteudo as {
          corpo: string;
          categoria: string;
          dica?: string;
          campos?: { chave: string; rotulo: string; exemplo: string; linhas?: number }[];
        };

        // Os campos vêm escritos na lição quando existem.
        //
        // Antes o rótulo era derivado da chave e não havia exemplo
        // nenhum, então a tela mostrava "Disciplina / Ex: disciplina" —
        // o placeholder repetindo a pergunta em vez de responder. Quem
        // nunca escreveu um prompt não aprende nada com isso; um exemplo
        // concreto ("Ex: Ciências") ensina o tipo de resposta esperada.
        //
        // O fallback continua para qualquer variável que apareça no
        // corpo sem estar declarada: melhor um rótulo tosco do que um
        // campo que some da tela.
        const declarados = new Map((c.campos ?? []).map((v) => [v.chave, v]));
        const variaveis = [...new Set(c.corpo.match(/\[([A-ZÀ-Ú0-9_ /]+)\]/g) ?? [])].map(
          (v) => {
            const chave = v.slice(1, -1);
            const declarado = declarados.get(chave);
            if (declarado) return { ...declarado, tipo: "texto" };
            return { chave, rotulo: chave.charAt(0) + chave.slice(1).toLowerCase(), tipo: "texto" };
          },
        );

        const existente = await prisma.promptTemplate.findFirst({
          where: { lessonId: licao.id },
        });

        const dados = {
          lessonId: licao.id,
          // O prompt nasce de uma lição deste curso, então pertence a ele
          // — senão entraria na biblioteca do curso de Empreendedores.
          courseId: curso.id,
          titulo: l.titulo,
          corpo: c.corpo,
          variaveis,
          categoria: c.categoria,
          dica: c.dica ?? null,
          origem: l.cap ?? null,
          faixa: m.faixa ?? "Gratuito",
          ferramentasSugeridas: ["gemini", "deepseek", "chatgpt"],
        };

        if (existente) {
          await prisma.promptTemplate.update({ where: { id: existente.id }, data: dados });
        } else {
          await prisma.promptTemplate.create({ data: dados });
        }
      }
    }
    console.log(`  módulo: ${m.titulo} — ${m.licoes.length} lições`);
  }

  // ---- Banco de prompts ----
  //
  // Os prompts avulsos da apostila: os dos 12 capítulos, os do Anexo A
  // (por disciplina) e os 6 do Guia de Bolso. Antes disto a biblioteca
  // tinha 3 itens, e todos eram subproduto das lições de PROMPT — o
  // Anexo A inteiro e as emergências não existiam na plataforma.
  //
  // `lessonId` fica nulo: são de consulta, não pertencem a uma lição.
  // A chave de idempotência é o título, que o gerador garante único.
  let novosPrompts = 0;
  for (const p of BANCO_PROMPTS) {
    const existente = await prisma.promptTemplate.findFirst({
      where: { titulo: p.titulo, lessonId: null },
      select: { id: true },
    });

    const categoriaParaMeta: Record<string, { objetivo: string; atividade: string; tags: string[] }> = {
      planejamento: { objetivo: "Planejar experiências de aprendizagem", atividade: "planejamento de aula", tags: ["planejamento", "aula"] },
      avaliacao: { objetivo: "Avaliar e dar devolutivas", atividade: "avaliação", tags: ["avaliação", "feedback"] },
      inclusao: { objetivo: "Adaptar para diferentes ritmos e necessidades", atividade: "adaptação pedagógica", tags: ["inclusão", "diferenciação"] },
      materiais: { objetivo: "Criar material didático", atividade: "material para aula", tags: ["material", "atividade"] },
      emergencias: { objetivo: "Resolver uma situação imediata de sala", atividade: "ação rápida", tags: ["urgente", "sala de aula"] },
      etica: { objetivo: "Promover uso responsável de IA", atividade: "orientação", tags: ["ética", "privacidade"] },
    };
    const meta = categoriaParaMeta[p.categoria] ?? { objetivo: "Apoiar a prática pedagógica", atividade: "atividade pedagógica", tags: ["educação"] };
    const dados = {
      titulo: p.titulo,
      corpo: p.corpo,
      // Estes prompts são da apostila de Educadores e falam de disciplina,
      // ano escolar e BNCC. Sem o curso preenchido, contariam como acervo
      // comum e apareceriam também para quem cursa Empreendedores.
      courseId: curso.id,
      // Os prompts da apostila trazem [VARIÁVEL] no corpo; o CardPrompt
      // extrai sozinho quando `variaveis` vem vazio, e é o que queremos:
      // declarar à mão 102 conjuntos de campos seria manutenção dupla.
      variaveis: [],
      categoria: p.categoria,
      disciplina: p.disciplina,
      dica: `Da apostila — ${p.origem}.`,
      origem: p.origem,
      faixa: "Gratuito",
      etapaEnsino: p.disciplina === "Educação Infantil" ? "Educação Infantil" : "Educação Básica",
      objetivoPedagogico: meta.objetivo,
      tipoAtividade: meta.atividade,
      nivelDificuldade: "Flexível",
      tags: [...meta.tags, ...(p.disciplina ? [p.disciplina.toLowerCase()] : [])],
      ferramentasSugeridas: ["gemini", "deepseek", "chatgpt"],
    };

    if (existente) {
      await prisma.promptTemplate.update({ where: { id: existente.id }, data: dados });
    } else {
      await prisma.promptTemplate.create({ data: dados });
      novosPrompts++;
    }
  }
  console.log(
    `  banco de prompts: ${BANCO_PROMPTS.length} (${novosPrompts} novos)`,
  );

  for (const item of BASE_CONHECIMENTO) {
    // `importancias` é Json? no schema: `null` em TypeScript significaria
    // "não mexa neste campo" para o Prisma, e o verbete manteria o valor
    // antigo. `Prisma.DbNull` é o que grava NULL de verdade.
    // Este acervo é pedagógico — BNCC, DUA, sequência didática, parecer.
    // Fica preso ao curso; o de Empreendedores tem os verbetes dele.
    const dados = {
      ...item,
      importancias: item.importancias ?? Prisma.DbNull,
      courseId: curso.id,
    };
    await prisma.knowledgeEntry.upsert({
      where: { slug: item.slug },
      update: dados,
      create: dados,
    });
  }
  console.log(`  base de conhecimento: ${BASE_CONHECIMENTO.length} termos`);

  // ---- Plano gratuito ----
  //
  // O acesso gratuito precisa ser um PLANO de verdade, e não uma condição
  // especial no código: é ele que determina o que recebe quem não tem
  // plano pago, e o administrador precisa poder editá-lo como qualquer
  // outro.
  //
  // O conteúdo inicial reproduz o que já valia: os módulos não marcados
  // como `pago`. Assim ninguém ganha nem perde acesso na migração.
  {
    const planoFree = await prisma.plan.upsert({
      where: { slug: "gratuito" },
      update: { gratuito: true },
      create: {
        slug: "gratuito",
        nome: "Acesso gratuito",
        descricao: "O que todo professor recebe ao entrar na plataforma.",
        precoCentavos: 0,
        periodicidade: "MENSAL",
        gratuito: true,
        ativo: true,
        // Fora da vitrine: não é algo que se compre.
        publico: false,
        ordem: 0,
        beneficios: ["Encontros iniciais da formação", "Banco de prompts", "Central de Conhecimento"],
      },
      select: { id: true },
    });

    const cursoBase = await prisma.course.findFirst({
      where: { publicado: true },
      orderBy: { ordem: "asc" },
      select: {
        id: true,
        modulos: { where: { pago: false }, select: { id: true } },
      },
    });

    // Só semeia quando o plano ainda não tem conteúdo: reexecutar o seed
    // não pode desfazer o que o administrador configurou depois.
    const jaConfigurado = await prisma.planCourse.count({ where: { planId: planoFree.id } });

    if (cursoBase && jaConfigurado === 0 && cursoBase.modulos.length > 0) {
      const vinculo = await prisma.planCourse.create({
        data: {
          planId: planoFree.id,
          courseId: cursoBase.id,
          abrangencia: "MODULOS_ESPECIFICOS",
        },
        select: { id: true },
      });
      await prisma.planModule.createMany({
        data: cursoBase.modulos.map((m) => ({ planCourseId: vinculo.id, moduleId: m.id })),
        skipDuplicates: true,
      });
      console.log(`  plano gratuito: ${cursoBase.modulos.length} módulos liberados`);
    } else {
      console.log("  plano gratuito: já configurado");
    }
  }

  // ---- Conquistas ----
  // Vão para este curso, e não para o acervo comum: várias falam do
  // número exato de atividades desta formação ("as 82") e do público
  // ("Professor que experimenta"). Num curso de negócios, a medalha
  // prometeria um marco que não existe lá.
  for (const c of CONQUISTAS) {
    await prisma.achievement.upsert({
      where: { chave: c.chave },
      update: { ...c, courseId: curso.id },
      create: { ...c, courseId: curso.id },
    });
  }
  console.log(`  conquistas: ${CONQUISTAS.length}`);

  for (const missao of MISSOES) {
    await prisma.mission.upsert({
      where: { chave: missao.chave },
      update: { ...missao, courseId: curso.id },
      create: { ...missao, courseId: curso.id },
    });
  }
  console.log(`  missões: ${MISSOES.length}`);

  // ---- Primeiro administrador ----
  const emailAdmin = process.env.ADMIN_EMAIL ?? "admin@aprenderia.site";
  const senhaAdmin = process.env.ADMIN_PASSWORD;

  const jaExiste = await prisma.user.findUnique({ where: { email: emailAdmin } });

  if (jaExiste) {
    if (jaExiste.papel !== "ADMIN") {
      await prisma.user.update({ where: { id: jaExiste.id }, data: { papel: "ADMIN" } });
      console.log(`  admin: ${emailAdmin} promovido a ADMIN`);
    } else {
      console.log(`  admin: ${emailAdmin} já existe`);
    }
  } else if (senhaAdmin) {
    const admin = await prisma.user.create({
      data: {
        nome: "Administrador",
        email: emailAdmin,
        senhaHash: await bcrypt.hash(senhaAdmin, 12),
        papel: "ADMIN",
        ofensiva: { create: {} },
      },
    });
    console.log(`  admin criado: ${admin.email}`);
  } else {
    console.log(
      `  admin: não criado — defina ADMIN_PASSWORD para criar ${emailAdmin}`,
    );
  }

  // ---- Roteiros da aula ----
  //
  // O roteiro é conteúdo do curso, como as lições e o banco de prompts: chega
  // pronto no deploy. O painel do professor é só a ferramenta de apresentar —
  // não há deck para importar antes da aula.
  //
  // Os passos são atualizados por `(scriptId, ordem)`, e não apagados e
  // recriados: `StepProgress` cascateia do passo, então regravar do zero
  // apagaria o que os alunos marcaram e digitaram nas aulas já dadas.
  let totalPassos = 0;
  for (const roteiro of ROTEIROS_AULA) {
    const existente = await prisma.lessonScript.findFirst({
      where: { titulo: roteiro.titulo, cohortId: null },
      select: { id: true },
    });

    // O roteiro é deste curso. Sem o vínculo, ele conta como comum e
    // aparece também na lista de aulas do curso de Empreendedores.
    const script = existente
      ? await prisma.lessonScript.update({
          where: { id: existente.id },
          data: { ordem: roteiro.encontro, ativo: true, courseId: curso.id },
        })
      : await prisma.lessonScript.create({
          data: { titulo: roteiro.titulo, ordem: roteiro.encontro, courseId: curso.id },
        });

    for (const [i, passo] of roteiro.passos.entries()) {
      await prisma.scriptStep.upsert({
        where: { scriptId_ordem: { scriptId: script.id, ordem: i + 1 } },
        update: {
          titulo: passo.titulo,
          html: passo.html,
          secaoApostila: passo.secaoApostila,
          blocos: passo.blocos as unknown as object,
        },
        create: {
          scriptId: script.id,
          ordem: i + 1,
          titulo: passo.titulo,
          html: passo.html,
          secaoApostila: passo.secaoApostila,
          blocos: passo.blocos as unknown as object,
        },
      });
    }

    // Se o deck encurtou, as sobras do roteiro antigo saem — só elas.
    await prisma.scriptStep.deleteMany({
      where: { scriptId: script.id, ordem: { gt: roteiro.passos.length } },
    });

    totalPassos += roteiro.passos.length;
  }
  console.log(
    `  roteiros da aula: ${ROTEIROS_AULA.length} encontros · ${totalPassos} passos`,
  );

  // ---- Apostila ----
  //
  // O aluno lê a apostila como página, e não como PDF de 9 MB aberto no
  // celular: o slide leva direto ao trecho que ele trata. O PDF continua
  // disponível para baixar, para quem prefere imprimir ou ler off-line.
  //
  // Capítulos e seções são atualizados pela chave e pela ordem, não apagados
  // e recriados, para que o endereço de uma seção continue valendo depois de
  // um deploy — é link que o aluno pode ter guardado.
  let totalSecoes = 0;
  for (const [i, cap] of APOSTILA.entries()) {
    const capitulo = await prisma.handbookChapter.upsert({
      where: { chave: cap.id },
      update: {
        numero: cap.numero,
        titulo: cap.titulo,
        icone: cap.icone,
        aberturaHtml: cap.aberturaHtml,
        ordem: i + 1,
        // Cada curso tem a sua apostila. Sem o curso aqui, os capítulos
        // sobre BNCC e parecer descritivo apareceriam no de Empreendedores.
        courseId: curso.id,
      },
      create: {
        chave: cap.id,
        numero: cap.numero,
        titulo: cap.titulo,
        icone: cap.icone,
        aberturaHtml: cap.aberturaHtml,
        ordem: i + 1,
        courseId: curso.id,
      },
    });

    for (const [j, sec] of cap.secoes.entries()) {
      await prisma.handbookSection.upsert({
        where: { chapterId_ordem: { chapterId: capitulo.id, ordem: j + 1 } },
        update: { numero: sec.numero, titulo: sec.titulo, html: sec.html },
        create: {
          chapterId: capitulo.id,
          ordem: j + 1,
          numero: sec.numero,
          titulo: sec.titulo,
          html: sec.html,
        },
      });
    }

    // Se um capítulo encurtou, as sobras saem — só elas.
    await prisma.handbookSection.deleteMany({
      where: { chapterId: capitulo.id, ordem: { gt: cap.secoes.length } },
    });

    totalSecoes += cap.secoes.length;
  }
  console.log(
    `  apostila: ${APOSTILA.length} capítulos · ${totalSecoes} seções`,
  );

  // Grava a assinatura por ÚLTIMO, e só aqui.
  //
  // Se qualquer upsert acima falhar, a exceção sobe e esta linha não roda —
  // então a assinatura antiga permanece e o próximo deploy semeia de novo.
  // Gravar no início marcaria como concluído um seed que parou no meio, e o
  // deploy seguinte pularia um conteúdo incompleto sem avisar ninguém.
  if (assinatura) {
    await prisma.platformSetting.upsert({
      where: { chave: CHAVE_ASSINATURA },
      update: { valor: assinatura },
      create: {
        chave: CHAVE_ASSINATURA,
        valor: assinatura,
        tipo: "TEXTO",
        grupo: "sistema",
        rotulo: "Assinatura do seed",
        descricao:
          "Hash do seed aplicado por último. Serve para pular a reexecução quando o conteúdo não mudou. Alterar à mão força o próximo deploy a semear.",
      },
    });
  }

  console.log(`\nPronto. ${MODULOS.length} módulos e ${totalLicoes} lições.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
