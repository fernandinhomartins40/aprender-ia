import { prisma, type CategoriaRegistro, type DiaryEntry } from "@aprender/db";
import {
  classificar,
  descreverLicaoConcluida,
  descreverUsoDePrompt,
  extrairMarcadores,
  normalizar,
  type ContextoPrompt,
  type RegistroDerivado,
} from "@/lib/motor-diario";

/**
 * Diário de Bordo: captura automática, consulta e resumo.
 *
 * A regra que organiza este arquivo: o professor não para de trabalhar
 * para alimentar o diário. O que ele já fez na aplicação vira memória
 * sozinho; o que ele quiser acrescentar em palavras dele continua
 * possível, mas nunca é exigido.
 *
 * Três garantias que valem registro:
 *
 * 1. **Nada aqui inventa resultado.** Os registros automáticos descrevem
 *    o que aconteceu ("preparou material sobre frações para o 6º ano"),
 *    jamais como foi ("a turma foi bem"). Isso ninguém registrou.
 *
 * 2. **Falhar em registrar nunca quebra a ação principal.** Toda captura
 *    é `try/catch` silencioso: se o diário falhar, o professor continua
 *    usando o prompt e concluindo a lição. Memória é acessório; o
 *    trabalho dele não é.
 *
 * 3. **Isolamento por professor.** Toda consulta filtra por `userId`. O
 *    diário de um professor não é alcançável por outro — nem por engano
 *    de query, porque não existe leitura sem esse filtro.
 */

/* ============================================================
   CAPTURA
   ============================================================ */

/** De onde um registro automático veio. */
type Fonte = { tipo: "promptRun" | "licao" | "montado"; id: string };

/**
 * Grava um registro derivado de um evento real.
 *
 * `fonte` é o que impede duplicata: o índice único (userId, fonteTipo,
 * fonteId) faz a segunda tentativa do mesmo evento falhar, e nós
 * engolimos o erro. Reabrir a tela ou repetir a ação não duplica a
 * memória.
 *
 * `pendente` decide se isto entra direto na linha do tempo ou fica
 * esperando um "sim". A regra está em `registrarUsoDePrompt`.
 */
async function gravar(
  userId: string,
  derivado: RegistroDerivado,
  fonte: Fonte,
  pendente: boolean,
): Promise<void> {
  try {
    await prisma.diaryEntry.create({
      data: {
        userId,
        oQueFez: derivado.oQueFez,
        ferramentaUsada: derivado.ferramenta,
        origem: "AUTOMATICO",
        categoria: derivado.categoria,
        tema: derivado.tema,
        disciplina: derivado.disciplina,
        etapa: derivado.etapa,
        marcadores: derivado.marcadores,
        fonteTipo: fonte.tipo,
        fonteId: fonte.id,
        pendente,
      },
    });
  } catch {
    // Duplicata (o mesmo evento já virou registro) ou indisponibilidade
    // do banco. Nos dois casos o silêncio é correto: o professor não
    // pediu este registro e não deve ver erro por causa dele.
  }
}

/**
 * Quanto contexto o professor deu ao usar um prompt.
 *
 * É o que separa um registro que vale a pena de um ruído. "Preparou
 * material" não ajuda ninguém em outubro; "preparou planejamento sobre
 * sistema solar em Ciências para o 5º ano" ajuda.
 */
function riqueza(d: RegistroDerivado): number {
  return [d.tema, d.disciplina, d.etapa].filter(Boolean).length;
}

/**
 * Registra o uso de um prompt como memória pedagógica.
 *
 * A decisão entre gravar direto e sugerir é o coração do requisito "não
 * interromper": quando o professor informou tema/disciplina/turma, o
 * registro é concreto, verificável e claramente útil — entra direto, sem
 * perguntar nada. Quando ele não informou quase nada, o registro seria
 * vago, então vira sugestão discreta que ele aceita ou ignora.
 *
 * Ninguém é interrompido em nenhum dos dois caminhos: não há pop-up. As
 * sugestões esperam em silêncio na tela do diário.
 */
export async function registrarUsoDePrompt(
  userId: string,
  promptRunId: string,
  ctx: ContextoPrompt,
): Promise<void> {
  const derivado = descreverUsoDePrompt(ctx);
  // Dois ou mais campos de contexto = registro concreto o bastante para
  // entrar sozinho.
  const pendente = riqueza(derivado) < 2;
  await gravar(userId, derivado, { tipo: "promptRun", id: promptRunId }, pendente);
}

/**
 * Registra a conclusão de uma lição da formação.
 *
 * Sempre pendente, e de propósito: concluir uma lição é estudo, não
 * prática de sala. Vale para reconstituir o percurso, mas não é o
 * professor trabalhando com a turma dele — então ele decide se quer isso
 * na memória pedagógica.
 */
export async function registrarLicaoConcluida(
  userId: string,
  lessonId: string,
  titulo: string,
  modulo: string,
): Promise<void> {
  await gravar(
    userId,
    descreverLicaoConcluida(titulo, modulo),
    { tipo: "licao", id: lessonId },
    true,
  );
}

/**
 * Registra um prompt montado do zero (gerador ou criador guiado).
 *
 * Estes dois não passam pelo catálogo: o professor descreve a ideia com
 * as próprias palavras e informa disciplina, ano e objetivo. Era contexto
 * pedagógico rico que se perdia inteiro — nada era gravado.
 *
 * Entra sempre como sugestão. Diferente do banco de prompts, aqui não há
 * curadoria por trás: o texto é rascunho dele, e transformar rascunho em
 * memória sem perguntar seria registrar intenção como se fosse prática.
 *
 * `chave` distingue uma montagem da outra para não duplicar quando ele
 * ajusta os campos e gera de novo.
 */
export async function registrarPromptMontado(
  userId: string,
  chave: string,
  dados: {
    ideia: string;
    disciplina: string | null;
    etapa: string | null;
    objetivo: string | null;
    ferramenta: string | null;
  },
): Promise<void> {
  const tema = dados.ideia.trim().slice(0, 140) || null;
  if (!tema) return;

  const partes = ["Montou um prompt"];
  if (tema) partes.push(`sobre ${tema}`);
  if (dados.disciplina) partes.push(`em ${dados.disciplina}`);
  if (dados.etapa) partes.push(`para ${dados.etapa}`);
  let frase = partes.join(" ");
  if (dados.objetivo) frase += `, com o objetivo de ${dados.objetivo}`;

  await gravar(
    userId,
    {
      oQueFez: frase,
      categoria: classificar(`${dados.ideia} ${dados.objetivo ?? ""}`) ?? "PLANEJAMENTO",
      tema,
      disciplina: dados.disciplina,
      etapa: dados.etapa,
      marcadores: extrairMarcadores(
        [dados.ideia, dados.disciplina, dados.etapa].filter(Boolean).join(" "),
      ),
      ferramenta: dados.ferramenta,
    },
    { tipo: "montado", id: chave },
    true,
  );
}

/* ============================================================
   LEITURA
   ============================================================ */

/** Registros confirmados, do mais recente ao mais antigo. */
export async function linhaDoTempo(
  userId: string,
  opcoes: { categoria?: CategoriaRegistro; busca?: string; limite?: number } = {},
): Promise<DiaryEntry[]> {
  const { categoria, busca, limite = 60 } = opcoes;

  const registros = await prisma.diaryEntry.findMany({
    where: {
      userId,
      // Sugestões não entram na linha do tempo: elas têm lugar próprio.
      pendente: false,
      ...(categoria ? { categoria } : {}),
    },
    orderBy: { registradoEm: "desc" },
    take: limite,
  });

  if (!busca?.trim()) return registros;

  // A busca é feita em memória porque o conjunto é pequeno (dezenas por
  // professor) e assim encontra com e sem acento, o que um ILIKE do
  // Postgres não faria sem extensão.
  const q = normalizar(busca);
  return registros.filter((r) =>
    normalizar(
      [r.oQueFez, r.observacao, r.tema, r.disciplina, r.etapa, ...r.marcadores]
        .filter(Boolean)
        .join(" "),
    ).includes(q),
  );
}

/** Sugestões aguardando decisão. */
export async function sugestoes(userId: string): Promise<DiaryEntry[]> {
  return prisma.diaryEntry.findMany({
    where: { userId, pendente: true },
    orderBy: { registradoEm: "desc" },
    // Um teto baixo é intencional: uma pilha de 40 sugestões é uma
    // obrigação disfarçada. Mostramos as mais recentes e o resto expira
    // sozinho em `limparSugestoesAntigas`.
    take: 5,
  });
}

/**
 * Descarta sugestões que o professor ignorou por tempo demais.
 *
 * Sem isto, quem nunca clica acumula uma dívida crescente de decisões —
 * exatamente a obrigação que este trabalho existe para eliminar.
 */
export async function limparSugestoesAntigas(userId: string): Promise<void> {
  const limite = new Date();
  limite.setDate(limite.getDate() - 14);
  try {
    await prisma.diaryEntry.deleteMany({
      where: { userId, pendente: true, registradoEm: { lt: limite } },
    });
  } catch {
    // Limpeza é manutenção: falhar não pode atrapalhar a leitura da tela.
  }
}

/* ============================================================
   RESUMO
   ============================================================ */

export type ResumoPeriodo = {
  total: number;
  temas: string[];
  disciplinas: string[];
  etapas: string[];
  porCategoria: { categoria: CategoriaRegistro; quantidade: number }[];
  dificuldades: DiaryEntry[];
  ideias: DiaryEntry[];
  minutosEconomizados: number;
};

/**
 * O que aconteceu num período, a partir dos registros reais.
 *
 * Tudo aqui é contagem e agrupamento do que está gravado — nenhuma
 * frase é gerada sobre qualidade ou desempenho. "Três registros em
 * Matemática" é fato; "a semana foi produtiva" seria invenção.
 */
export async function resumoDoPeriodo(
  userId: string,
  desde: Date,
): Promise<ResumoPeriodo> {
  const registros = await prisma.diaryEntry.findMany({
    where: { userId, pendente: false, registradoEm: { gte: desde } },
    orderBy: { registradoEm: "desc" },
  });

  const contagem = new Map<CategoriaRegistro, number>();
  const temas = new Set<string>();
  const disciplinas = new Set<string>();
  const etapas = new Set<string>();
  let minutos = 0;

  for (const r of registros) {
    if (r.categoria) contagem.set(r.categoria, (contagem.get(r.categoria) ?? 0) + 1);
    if (r.tema) temas.add(r.tema);
    if (r.disciplina) disciplinas.add(r.disciplina);
    if (r.etapa) etapas.add(r.etapa);
    minutos += Math.max(0, (r.minutosAntes ?? 0) - (r.minutosAgora ?? 0));
  }

  return {
    total: registros.length,
    temas: [...temas].slice(0, 8),
    disciplinas: [...disciplinas],
    etapas: [...etapas],
    porCategoria: [...contagem.entries()]
      .map(([categoria, quantidade]) => ({ categoria, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade),
    // Dificuldade e ideia futura são o que o professor mais procura
    // reler: "o que travou" e "o que eu queria ter feito".
    dificuldades: registros.filter((r) => r.categoria === "DIFICULDADE").slice(0, 3),
    ideias: registros.filter((r) => r.categoria === "IDEIA_FUTURA").slice(0, 3),
    minutosEconomizados: minutos,
  };
}

/* ============================================================
   MEMÓRIA REUTILIZÁVEL
   ============================================================ */

/**
 * Já trabalhei este assunto antes?
 *
 * É a consulta que transforma o diário em memória útil: antes de
 * preparar algo sobre frações, o professor descobre que já fez isso em
 * maio, com que abordagem e o que anotou.
 *
 * Usada pela Central de Conhecimento e disponível para o gerador de
 * prompts sugerir uma abordagem diferente da anterior.
 */
export async function jaTrabalhou(
  userId: string,
  assunto: string,
): Promise<DiaryEntry[]> {
  const q = normalizar(assunto);
  if (q.length < 3) return [];

  const registros = await prisma.diaryEntry.findMany({
    where: { userId, pendente: false },
    orderBy: { registradoEm: "desc" },
    take: 200,
  });

  return registros
    .filter((r) =>
      normalizar(
        [r.oQueFez, r.observacao, r.tema, r.disciplina, ...r.marcadores]
          .filter(Boolean)
          .join(" "),
      ).includes(q),
    )
    .slice(0, 6);
}
