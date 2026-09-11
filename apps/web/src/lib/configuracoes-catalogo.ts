import type { TipoConfiguracao } from "@aprender/db";

/**
 * Catálogo das configurações da plataforma.
 *
 * Vive em `lib/` e não em `server/` porque um módulo "use server" só pode
 * exportar funções async — um array exportado de lá quebra o build. Aqui
 * ele também fica disponível para o componente de formulário.
 *
 * Uma chave nunca salva responde pelo `padrao`, então a plataforma
 * funciona antes da primeira visita à tela de configurações.
 */

export type DefinicaoConfig = {
  chave: string;
  tipo: TipoConfiguracao;
  grupo: string;
  rotulo: string;
  descricao?: string;
  padrao: string;
};

export const CONFIGS: DefinicaoConfig[] = [
  // ---- Acesso gratuito ----
  {
    chave: "free.dias_padrao",
    tipo: "NUMERO",
    grupo: "acesso_free",
    rotulo: "Dias de acesso gratuito",
    descricao:
      "Quantos dias um aluno novo tem de acesso gratuito. 0 = sem prazo (acesso permanente).",
    padrao: "30",
  },
  {
    chave: "free.avisar_dias_antes",
    tipo: "NUMERO",
    grupo: "acesso_free",
    rotulo: "Avisar quantos dias antes de expirar",
    descricao: "O aluno vê um aviso na plataforma a partir desse prazo.",
    padrao: "7",
  },
  {
    chave: "free.permite_solicitar_novo",
    tipo: "BOOLEANO",
    grupo: "acesso_free",
    rotulo: "Permitir pedir novo acesso gratuito",
    descricao:
      "Quando o prazo termina, o aluno pode enviar um pedido — que só libera após sua aprovação.",
    padrao: "true",
  },
  {
    chave: "free.dias_ao_aprovar",
    tipo: "NUMERO",
    grupo: "acesso_free",
    rotulo: "Dias concedidos ao aprovar um pedido",
    descricao: "Valor sugerido na aprovação; você pode alterar caso a caso.",
    padrao: "15",
  },
  {
    chave: "free.max_solicitacoes",
    tipo: "NUMERO",
    grupo: "acesso_free",
    rotulo: "Máximo de pedidos por aluno",
    descricao: "0 = sem limite.",
    padrao: "3",
  },

  // ---- Plataforma ----
  {
    chave: "plataforma.nome",
    tipo: "TEXTO",
    grupo: "geral",
    rotulo: "Nome da plataforma",
    padrao: "Aprender IA",
  },
  {
    chave: "plataforma.email_suporte",
    tipo: "TEXTO",
    grupo: "geral",
    rotulo: "E-mail de suporte",
    descricao: "Exibido ao aluno quando ele precisa falar com a coordenação.",
    padrao: "",
  },
  {
    chave: "plataforma.whatsapp_suporte",
    tipo: "TEXTO",
    grupo: "geral",
    rotulo: "WhatsApp de suporte",
    descricao: "Só números, com DDD. Usado nos botões de contato.",
    padrao: "",
  },
  {
    chave: "plataforma.cadastro_aberto",
    tipo: "BOOLEANO",
    grupo: "geral",
    rotulo: "Cadastro público aberto",
    descricao:
      "Desligado, só entra quem tem código de turma — a landing deixa de captar inscrição livre.",
    padrao: "true",
  },

  // ---- Alunos ----
  {
    chave: "alunos.dias_para_inativo",
    tipo: "NUMERO",
    grupo: "alunos",
    rotulo: "Dias sem acesso para considerar inativo",
    descricao: "Usado nos indicadores do painel.",
    padrao: "30",
  },

  // ---- Financeiro ----
  {
    chave: "financeiro.dias_suspender_atraso",
    tipo: "NUMERO",
    grupo: "financeiro",
    rotulo: "Dias de atraso antes de suspender",
    descricao:
      "Quantos dias após o vencimento o acesso pago é suspenso. 0 = nunca suspender automaticamente.",
    padrao: "7",
  },
  {
    chave: "financeiro.valor_mensalidade",
    tipo: "NUMERO",
    grupo: "financeiro",
    rotulo: "Valor padrão da mensalidade (centavos)",
    descricao: "Sugerido ao lançar uma cobrança. 9700 = R$ 97,00.",
    padrao: "9700",
  },
  {
    chave: "financeiro.avisar_cobranca_dias_antes",
    tipo: "NUMERO",
    grupo: "financeiro",
    rotulo: "Avisar do vencimento quantos dias antes",
    descricao: "Lembrete de pagamento enviado ao aluno. 0 = não avisar.",
    padrao: "3",
  },

  // ---- Notificações ----
  {
    chave: "notificacoes.assinatura_email",
    tipo: "TEXTO",
    grupo: "notificacoes",
    rotulo: "Assinatura dos e-mails",
    descricao: "Linha final das mensagens enviadas aos alunos.",
    padrao: "Equipe Aprender IA",
  },
  {
    chave: "engajamento.max_por_dia",
    tipo: "NUMERO",
    grupo: "notificacoes",
    rotulo: "Máximo de lembretes automáticos por dia",
    descricao: "Limite por aluno. 0 desativa lembretes automáticos; avisos essenciais não entram nesta conta.",
    padrao: "1",
  },
  {
    chave: "engajamento.hora_inicio",
    tipo: "NUMERO",
    grupo: "notificacoes",
    rotulo: "Primeira hora permitida",
    descricao: "Hora de Brasília, de 0 a 23.",
    padrao: "9",
  },
  {
    chave: "engajamento.hora_fim",
    tipo: "NUMERO",
    grupo: "notificacoes",
    rotulo: "Última hora permitida",
    descricao: "Hora de Brasília, de 0 a 23.",
    padrao: "20",
  },
  {
    chave: "engajamento.inatividade_leve_dias",
    tipo: "NUMERO",
    grupo: "notificacoes",
    rotulo: "Dias para lembrete leve",
    padrao: "3",
  },
  {
    chave: "engajamento.inatividade_longa_dias",
    tipo: "NUMERO",
    grupo: "notificacoes",
    rotulo: "Dias para reengajamento",
    padrao: "10",
  },
  {
    chave: "engajamento.texto_retorno", tipo: "TEXTO", grupo: "notificacoes",
    rotulo: "Mensagem para retomar os estudos",
    descricao: "Use {atividade} para inserir o nome da próxima atividade.",
    padrao: "Seu progresso continua salvo. Retome por “{atividade}”, exatamente de onde parou.",
  },
  {
    chave: "engajamento.texto_sequencia", tipo: "TEXTO", grupo: "notificacoes",
    rotulo: "Mensagem para proteger a sequência", descricao: "Aceita {atividade} e {dias}.",
    padrao: "Você vem construindo uma sequência de {dias} dias. Continue com “{atividade}”.",
  },
  {
    chave: "engajamento.texto_quase_concluiu", tipo: "TEXTO", grupo: "notificacoes",
    rotulo: "Mensagem de trilha quase concluída", descricao: "Aceita {atividade} e {restantes}.",
    padrao: "Restam {restantes} atividades. A próxima é “{atividade}”.",
  },
  {
    chave: "engajamento.texto_nova_missao", tipo: "TEXTO", grupo: "notificacoes",
    rotulo: "Mensagem de nova missão", descricao: "Use {missao} para inserir o objetivo disponível.",
    padrao: "Uma nova missão está disponível: {missao}.",
  },
];

export const PADROES = new Map(CONFIGS.map((c) => [c.chave, c]));
