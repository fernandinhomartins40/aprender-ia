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

const prisma = new PrismaClient();

const CURSO = {
  slug: "ia-para-educadores",
  titulo: "IA para Educadores",
  subtitulo: "Menos burocracia, aulas melhores, seu fim de semana de volta",
  descricao:
    "Formação de 40 horas para professores da rede pública usarem Inteligência Artificial na rotina escolar, com ferramentas gratuitas e sem jargão técnico.",
  cargaHoraria: 40,
};

const MODULOS = [
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
