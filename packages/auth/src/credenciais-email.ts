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

/** Chave da configuração no banco. Igual à usada pelo catálogo do painel. */
export const CHAVE_API_VELOMAIL = "email.velomail_api_key";

const TTL_MS = 30_000;

let cache: { valor: string | null; expira: number } | null = null;

/** Descarta o cache — chamado logo após o painel salvar uma chave nova. */
export function esquecerCredenciaisEmail(): void {
  cache = null;
}

async function lerChaveDoBanco(): Promise<string | null> {
  try {
    const registro = await prisma.platformSetting.findUnique({
      where: { chave: CHAVE_API_VELOMAIL },
      select: { valor: true },
    });
    const valor = registro?.valor.trim();
    return valor ? valor : null;
  } catch (e) {
    // A tabela pode não existir ainda (deploy sobe o container antes das
    // migrations). Cair para o ambiente é melhor que derrubar o envio.
    console.error("[email] não foi possível ler a chave no banco:", e);
    return null;
  }
}

/** A chave em uso, considerando banco e ambiente. */
export async function chaveVeloMail(): Promise<string | null> {
  const agora = Date.now();
  if (cache && cache.expira > agora) return cache.valor ?? doAmbiente();

  const doBanco = await lerChaveDoBanco();
  cache = { valor: doBanco, expira: agora + TTL_MS };
  return doBanco ?? doAmbiente();
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
