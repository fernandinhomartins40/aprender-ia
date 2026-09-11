/**
 * Seed do Aprender IA.
 *
 * Cria o curso "IA para Educadores" com os 4 encontros, as lições
 * iniciais da trilha e o primeiro administrador.
 *
 * É idempotente: pode rodar quantas vezes for preciso sem duplicar.
 */
import { PrismaClient, TipoLicao } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BANCO_PROMPTS } from "./banco-prompts";
import {
  CACAS,
  CASOS,
  DESAFIOS,
  DUELOS,
  TESTES_CELULAR,
} from "./conteudo-apostila";

const prisma = new PrismaClient();

const CURSO = {
  slug: "ia-para-educadores",
  titulo: "IA para Educadores",
  subtitulo: "Menos burocracia, aulas melhores, seu fim de semana de volta",
  descricao:
    "Formação de 40 horas para professores da rede pública usarem Inteligência Artificial na rotina escolar, com ferramentas gratuitas e sem jargão técnico.",
  cargaHoraria: 40,
};

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

const MODULOS = [
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
];

void MODULOS_INICIAIS;

const CONQUISTAS = [
  { chave: "primeira-licao", titulo: "Primeiro passo", descricao: "Concluiu a primeira lição", icone: "🌱", criterio: { tipo: "licoes", valor: 1 }, ordem: 0 },
  { chave: "primeiro-prompt", titulo: "Mão na massa", descricao: "Executou seu primeiro prompt numa IA", icone: "⚡", criterio: { tipo: "prompts", valor: 1 }, ordem: 1 },
  { chave: "cinco-licoes", titulo: "Pegando o ritmo", descricao: "Concluiu 5 lições", icone: "🔥", criterio: { tipo: "licoes", valor: 5 }, ordem: 2 },
  { chave: "encontro-1", titulo: "Encontro 1 completo", descricao: "Terminou o primeiro encontro", icone: "🚀", criterio: { tipo: "modulo", valor: 1 }, ordem: 3 },
  { chave: "ofensiva-3", titulo: "Três dias seguidos", descricao: "Manteve a ofensiva por 3 dias", icone: "📅", criterio: { tipo: "ofensiva", valor: 3 }, ordem: 4 },
  { chave: "curso-completo", titulo: "Formação concluída", descricao: "Completou todos os encontros", icone: "🎓", criterio: { tipo: "curso", valor: 100 }, ordem: 5 },
];

async function main() {
  console.log("Semeando o Aprender IA...\n");

  // ---- Curso ----
  const curso = await prisma.course.upsert({
    where: { slug: CURSO.slug },
    update: { ...CURSO, publicado: true },
    create: { ...CURSO, publicado: true, ordem: 0 },
  });
  console.log(`  curso: ${curso.titulo}`);

  // ---- Módulos e lições ----
  let totalLicoes = 0;
  for (const m of MODULOS) {
    const modulo = await prisma.module.upsert({
      where: { courseId_ordem: { courseId: curso.id, ordem: m.ordem } },
      update: { titulo: m.titulo, subtitulo: m.subtitulo, cor: m.cor, icone: m.icone },
      create: {
        courseId: curso.id,
        ordem: m.ordem,
        titulo: m.titulo,
        subtitulo: m.subtitulo,
        cor: m.cor,
        icone: m.icone,
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
          titulo: l.titulo,
          corpo: c.corpo,
          variaveis,
          categoria: c.categoria,
          dica: c.dica ?? null,
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

    const dados = {
      titulo: p.titulo,
      corpo: p.corpo,
      // Os prompts da apostila trazem [VARIÁVEL] no corpo; o CardPrompt
      // extrai sozinho quando `variaveis` vem vazio, e é o que queremos:
      // declarar à mão 102 conjuntos de campos seria manutenção dupla.
      variaveis: [],
      categoria: p.categoria,
      disciplina: p.disciplina,
      dica: `Da apostila — ${p.origem}.`,
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

  // ---- Conquistas ----
  for (const c of CONQUISTAS) {
    await prisma.achievement.upsert({
      where: { chave: c.chave },
      update: c,
      create: c,
    });
  }
  console.log(`  conquistas: ${CONQUISTAS.length}`);

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
