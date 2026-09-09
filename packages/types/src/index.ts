import { z } from "zod";

/* ============================================================
   AUTENTICAÇÃO
   ============================================================ */

export const cadastroSchema = z
  .object({
    nome: z.string().min(3, "Informe seu nome completo").max(120),
    email: z.string().email("E-mail inválido"),
    senha: z
      .string()
      .min(8, "A senha precisa de ao menos 8 caracteres")
      .max(72, "Senha muito longa"),
    confirmarSenha: z.string(),
    disciplina: z.string().max(80).optional(),
    anoEscolar: z.string().max(40).optional(),
    escola: z.string().max(160).optional(),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Informe sua senha"),
});

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/* ============================================================
   CONTEÚDO DAS LIÇÕES
   Cada tipo tem sua própria forma; o campo `conteudo` do banco
   guarda um destes objetos.
   ============================================================ */

export const blocoTeoriaSchema = z.object({
  tipo: z.enum(["paragrafo", "traduzindo", "atencao", "dica", "destaque", "lista", "prompt", "tabela"]),
  titulo: z.string().optional(),
  texto: z.string().optional(),
  itens: z.array(z.string()).optional(),
  colunas: z.array(z.string()).optional(),
  linhas: z.array(z.array(z.string())).optional(),
});

export const conteudoTeoriaSchema = z.object({
  blocos: z.array(blocoTeoriaSchema),
});

export const conteudoPromptSchema = z.object({
  introducao: z.string(),
  promptTemplateId: z.string().optional(),
  corpo: z.string(),
  categoria: z.string(),
  dica: z.string().optional(),
});

export const conteudoDueloSchema = z.object({
  contexto: z.string(),
  promptRuim: z.string(),
  resultadoRuim: z.string(),
  promptBom: z.string(),
  resultadoBom: z.string(),
  desafio: z.string(),
  promptParaReescrever: z.string(),
});

export const conteudoCacaErroSchema = z.object({
  introducao: z.string(),
  respostaIA: z.string(),
  pergunta: z.string(),
  opcoes: z.array(z.object({ id: z.string(), texto: z.string(), correta: z.boolean() })),
  gabarito: z.string(),
  licao: z.string(),
});

export const conteudoCasoSchema = z.object({
  cena: z.string(),
  pergunta: z.string(),
  tempoMinutos: z.number().int().positive(),
  solucao: z.string(),
  promptExemplo: z.string().optional(),
  discussao: z.string().optional(),
});

export const conteudoDesafioSchema = z.object({
  titulo: z.string(),
  segundos: z.number().int().positive(),
  instrucoes: z.array(z.string()),
  fechamento: z.string().optional(),
});

export const conteudoQuizSchema = z.object({
  perguntas: z.array(
    z.object({
      enunciado: z.string(),
      opcoes: z.array(z.object({ id: z.string(), texto: z.string(), correta: z.boolean() })),
      explicacao: z.string(),
    }),
  ),
});

export const conteudoCheckpointSchema = z.object({
  titulo: z.string(),
  itens: z.array(z.string()),
  tarefa: z.string().optional(),
});

export type ConteudoTeoria = z.infer<typeof conteudoTeoriaSchema>;
export type ConteudoPrompt = z.infer<typeof conteudoPromptSchema>;
export type ConteudoDuelo = z.infer<typeof conteudoDueloSchema>;
export type ConteudoCacaErro = z.infer<typeof conteudoCacaErroSchema>;
export type ConteudoCaso = z.infer<typeof conteudoCasoSchema>;
export type ConteudoDesafio = z.infer<typeof conteudoDesafioSchema>;
export type ConteudoQuiz = z.infer<typeof conteudoQuizSchema>;
export type ConteudoCheckpoint = z.infer<typeof conteudoCheckpointSchema>;

/* ============================================================
   PROMPTS
   ============================================================ */

export const variavelPromptSchema = z.object({
  chave: z.string(),
  rotulo: z.string(),
  exemplo: z.string().optional(),
  tipo: z.enum(["texto", "selecao", "area"]).default("texto"),
  opcoes: z.array(z.string()).optional(),
});

export const executarPromptSchema = z.object({
  promptTemplateId: z.string(),
  ferramenta: z.string(),
  variaveis: z.record(z.string()),
  promptFinal: z.string(),
});

export const reflexaoSchema = z.object({
  promptRunId: z.string(),
  reflexao: z.string().max(2000).optional(),
  minutosEconomizados: z.number().int().min(0).max(600).optional(),
});

export type VariavelPrompt = z.infer<typeof variavelPromptSchema>;
export type ExecutarPromptInput = z.infer<typeof executarPromptSchema>;

/* ============================================================
   PROGRESSO E DIÁRIO
   ============================================================ */

export const concluirLicaoSchema = z.object({
  lessonId: z.string(),
  anotacoes: z.string().max(4000).optional(),
  respostas: z
    .array(z.object({ exerciseId: z.string(), resposta: z.string(), correta: z.boolean() }))
    .optional(),
});

export const diarioSchema = z.object({
  oQueFez: z.string().min(3, "Descreva o que você fez").max(500),
  ferramentaUsada: z.string().min(1, "Informe a ferramenta"),
  minutosAntes: z.number().int().min(0).max(6000).optional(),
  minutosAgora: z.number().int().min(0).max(6000).optional(),
  valeuAPena: z.boolean().default(true),
  observacao: z.string().max(1000).optional(),
});

export type ConcluirLicaoInput = z.infer<typeof concluirLicaoSchema>;
export type DiarioInput = z.infer<typeof diarioSchema>;

/* ============================================================
   ADMIN
   ============================================================ */

export const cursoSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  titulo: z.string().min(3).max(160),
  subtitulo: z.string().max(240).optional(),
  descricao: z.string().min(10),
  cargaHoraria: z.number().int().positive().default(40),
  publicado: z.boolean().default(false),
});

export const moduloSchema = z.object({
  courseId: z.string(),
  titulo: z.string().min(3).max(160),
  subtitulo: z.string().max(240).optional(),
  descricao: z.string().optional(),
  ordem: z.number().int().min(0),
  icone: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional(),
});

export const turmaSchema = z.object({
  courseId: z.string(),
  nome: z.string().min(3).max(120),
  descricao: z.string().optional(),
  inicioEm: z.coerce.date().optional(),
  fimEm: z.coerce.date().optional(),
});

export type CursoInput = z.infer<typeof cursoSchema>;
export type ModuloInput = z.infer<typeof moduloSchema>;
export type TurmaInput = z.infer<typeof turmaSchema>;
