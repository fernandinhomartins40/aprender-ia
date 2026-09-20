import { prisma } from "@aprender/db";

/**
 * Credenciais de envio de e-mail, vindas do banco.
 *
 * A chave da VeloMail expira, é revogada e precisa ser trocada sem um
 * deploy — foi exatamente isso que deixou a recuperação de senha muda em
 * produção. Por isso ela passa a viver no banco, editável pelo painel,
 * com a variável de ambiente valendo como origem secundária.
 *
 * Precedência: banco > ambiente. O banco vence porque é o que o
 * administrador acabou de digitar; se lá estiver vazio, o `.env` da VPS
 * ainda atende, e nada quebra em quem já estava configurado.
 *
 * Isto NÃO usa `unstable_cache` do Next de propósito: o módulo é
 * importado por `packages/auth`, que também roda fora de requisição
 * (jobs, seed). O cache é um TTL curto em memória, suficiente para não
 * consultar o banco a cada e-mail e curto o bastante para uma chave nova
 * valer quase imediatamente.
 */

/** Chaves das configurações no banco. */
export const CHAVE_API_VELOMAIL = "email.velomail_api_key";
export const CHAVE_REMETENTE_EMAIL = "email.remetente_email";
export const CHAVE_REMETENTE_NOME = "email.remetente_nome";
export const CHAVE_TRACKING = "email.tracking";

/**
 * Templates privados da VeloMail, um por tipo de mensagem.
 *
 * Sem ID, vale o HTML institucional montado pela própria aplicação —
 * por isso o padrão é "nenhum" e não um template obrigatório.
 */
export const TIPOS_TEMPLATE = [
  {
    chave: "email.template.recuperacao",
    rotulo: "Recuperação de senha",
    descricao: "Variáveis: nome, link_redefinicao, validade_minutos.",
    env: "ULTRAZEND_TEMPLATE_PASSWORD_RESET_ID",
  },
  {
    chave: "email.template.acesso_aprovado",
    rotulo: "Acesso aprovado",
    descricao: "Variáveis: nome, dias, ate, link.",
    env: null,
  },
  {
    chave: "email.template.acesso_recusado",
    rotulo: "Acesso recusado",
    descricao: "Variáveis: nome, contato.",
    env: null,
  },
  {
    chave: "email.template.acesso_expirando",
    rotulo: "Acesso expirando",
    descricao: "Variáveis: nome, dias_restantes, ate, link.",
    env: null,
  },
  {
    chave: "email.template.notificacao",
    rotulo: "Notificação avulsa",
    descricao: "Variáveis: titulo, corpo, link.",
    env: null,
  },
] as const;

export type ChaveTemplate = (typeof TIPOS_TEMPLATE)[number]["chave"];

const TTL_MS = 30_000;

/**
 * Um cache só para todas as chaves de e-mail.
 *
 * Elas são lidas juntas em cada envio, então uma consulta que traz tudo
 * custa menos que cinco idas ao banco — e invalidar vira uma linha.
 */
let cache: { valores: Map<string, string>; expira: number } | null = null;

/** Descarta o cache — chamado logo após o painel salvar algo. */
export function esquecerCredenciaisEmail(): void {
  cache = null;
}

const PREFIXO = "email.";

async function valores(): Promise<Map<string, string>> {
  const agora = Date.now();
  if (cache && cache.expira > agora) return cache.valores;

  let mapa = new Map<string, string>();
  try {
    const linhas = await prisma.platformSetting.findMany({
      where: { chave: { startsWith: PREFIXO } },
      select: { chave: true, valor: true },
    });
    for (const l of linhas) {
      const valor = l.valor.trim();
      // Vazio no banco é "não configurado", e não string vazia: assim o
      // ambiente ainda responde por aquela chave.
      if (valor) mapa.set(l.chave, valor);
    }
  } catch (e) {
    // A tabela pode não existir ainda (deploy sobe o container antes das
    // migrations). Cair para o ambiente é melhor que derrubar o envio.
    console.error("[email] não foi possível ler as configurações no banco:", e);
  }

  cache = { valores: mapa, expira: agora + TTL_MS };
  return mapa;
}

async function lerChaveDoBanco(): Promise<string | null> {
  return (await valores()).get(CHAVE_API_VELOMAIL) ?? null;
}

/** A chave em uso, considerando banco e ambiente. */
export async function chaveVeloMail(): Promise<string | null> {
  return (await lerChaveDoBanco()) ?? doAmbiente();
}

function doAmbiente(): string | null {
  const valor = (process.env.ULTRAZEND_API_KEY ?? process.env.VELOMAIL_API_KEY)?.trim();
  return valor ? valor : null;
}

/** De onde veio a chave ativa — o painel mostra isso ao administrador. */
export async function origemDaChave(): Promise<"banco" | "ambiente" | "nenhuma"> {
  if (await lerChaveDoBanco()) return "banco";
  if (doAmbiente()) return "ambiente";
  return "nenhuma";
}

/* ============================================================
   REMETENTE, TRACKING E TEMPLATES
   ============================================================ */

export type Remetente = { email: string; nome?: string };

/**
 * O remetente em uso.
 *
 * O painel guarda endereço e nome em campos separados justamente porque
 * a API da VeloMail recusa a forma composta "Nome <email>" no campo
 * `from`. O caminho SMTP remonta a forma composta quando precisa.
 */
export async function remetenteConfigurado(): Promise<Remetente | null> {
  const v = await valores();
  const email = v.get(CHAVE_REMETENTE_EMAIL);
  if (email) {
    const nome = v.get(CHAVE_REMETENTE_NOME);
    return { email, ...(nome ? { nome } : {}) };
  }
  return null;
}

/** Tracking de abertura/clique. Padrão ligado, como na VeloMail. */
export async function trackingConfigurado(): Promise<boolean | null> {
  const bruto = (await valores()).get(CHAVE_TRACKING);
  if (bruto === undefined) return null;
  return bruto !== "false";
}

/**
 * ID do template para um tipo de mensagem.
 *
 * Zero, vazio ou texto inválido significam "sem template": o HTML
 * institucional da aplicação continua valendo, e um valor digitado
 * errado nunca derruba o envio.
 */
export async function templateDe(chave: ChaveTemplate): Promise<number | null> {
  const doBanco = (await valores()).get(chave);
  const tipo = TIPOS_TEMPLATE.find((t) => t.chave === chave);
  const bruto = doBanco ?? (tipo?.env ? process.env[tipo.env] : undefined);

  const n = Number(bruto);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Versão mascarada, segura para exibir.
 *
 * O valor integral nunca volta para a tela: uma chave gravada é para ser
 * substituída, não relida. Mostramos só o suficiente para o administrador
 * reconhecer QUAL chave está lá.
 */
export function mascarar(chave: string): string {
  const limpa = chave.trim();
  if (limpa.length <= 11) return `${limpa.slice(0, 3)}…`;
  return `${limpa.slice(0, 6)}…${limpa.slice(-4)}`;
}
