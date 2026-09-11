"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";

/**
 * Ícones do aplicativo, editáveis pelo painel.
 *
 * O administrador envia UMA imagem já recortada no navegador e o servidor
 * gera os tamanhos que cada plataforma pede. Sem isso, trocar o ícone
 * exigia rodar um script na máquina de quem desenvolve — o que na prática
 * significa que o dono do projeto não conseguia trocar.
 *
 * As imagens ficam no banco, em `PlatformSetting.valor` (@db.Text), como
 * data URL. Não é o lugar ideal para binário, mas é o que existe hoje:
 * o contêiner não tem volume persistente e configurar storage externo
 * seria uma dependência nova para guardar 8 arquivos que mudam uma vez
 * por ano. O custo é ~500KB no Postgres.
 *
 * Enquanto nada for enviado, `/icones/*` serve os arquivos do repositório
 * — a plataforma nunca fica sem ícone.
 */

/** Tamanhos que o navegador e os sistemas pedem. */
export type TamanhoIcone = {
  chave: string;
  lado: number;
  rotulo: string;
  onde: string;
};

const CHAVE_ORIGEM = "pwa.icone_origem";

/**
 * Tamanhos "maskable", que o Android recorta em círculo.
 *
 * Ficam separados dos demais porque não são o mesmo recorte: a arte entra
 * reduzida, sobre fundo sólido, para sobreviver ao corte. Sem eles, o
 * manifest declarava maskable e só existia a versão do repositório — o
 * ícone enviado pelo administrador nunca chegava à tela inicial, que é
 * justamente onde ele mais aparece.
 */
export async function tamanhosMaskable(): Promise<TamanhoIcone[]> {
  return [
    { chave: "pwa.icone_maskable_192", lado: 192, rotulo: "192 px recortável", onde: "Android (tela inicial)" },
    { chave: "pwa.icone_maskable_512", lado: 512, rotulo: "512 px recortável", onde: "Android (splash)" },
  ];
}

export async function tamanhosIcone(): Promise<TamanhoIcone[]> {
  return [
    { chave: "pwa.icone_96", lado: 96, rotulo: "96 px", onde: "Android (densidade baixa)" },
    { chave: "pwa.icone_128", lado: 128, rotulo: "128 px", onde: "Chrome, atalhos" },
    { chave: "pwa.icone_192", lado: 192, rotulo: "192 px", onde: "Android (tela inicial)" },
    { chave: "pwa.icone_256", lado: 256, rotulo: "256 px", onde: "Desktop" },
    { chave: "pwa.icone_384", lado: 384, rotulo: "384 px", onde: "Android (densidade alta)" },
    { chave: "pwa.icone_512", lado: 512, rotulo: "512 px", onde: "Splash e loja" },
    // O iOS escolhe pelo tamanho do aparelho: iPhone usa 180, iPad 152 ou
    // 167. Os dois últimos vinham só do repositório, então trocar a arte
    // no painel não mudava o ícone em nenhum iPad.
    { chave: "pwa.icone_152", lado: 152, rotulo: "152 px", onde: "iPad" },
    { chave: "pwa.icone_167", lado: 167, rotulo: "167 px", onde: "iPad Pro" },
    { chave: "pwa.icone_180", lado: 180, rotulo: "180 px", onde: "iPhone" },
  ];
}

/**
 * O catálogo de ícones do manifest — fonte única.
 *
 * Antes existiam duas fontes desencontradas: o `public/manifest.json`
 * estático, que declarava `image/png` em tudo, e o banco, que guarda o
 * que o painel gerou em WebP. O Chrome descarta ícone cujo tipo declarado
 * não bate com o servido (e o cabeçalho `nosniff` o impede de corrigir
 * sozinho), então o Android caía no favicon — era esta a razão de o ícone
 * enviado pelo administrador nunca aparecer no aparelho.
 *
 * Agora o manifest é gerado a partir daqui, com o tipo REAL de cada
 * arquivo e um carimbo de versão que muda quando o administrador salva.
 */
export type IconeManifest = {
  arquivo: string;
  lado: number;
  tipo: string;
  maskable: boolean;
};

/** Tipo real de cada ícone e o carimbo de versão, lidos do banco. */
export async function catalogoIcones(): Promise<{
  icones: IconeManifest[];
  versao: string;
}> {
  const comuns = await tamanhosIcone();
  const mascaras = await tamanhosMaskable();

  // Sem banco (ou sem nada enviado), valem os arquivos do repositório,
  // que são PNG.
  let tipos = new Map<string, string>();
  let versao = "padrao";

  try {
    const linhas = await prisma.platformSetting.findMany({
      where: { chave: { startsWith: "pwa.icone_" } },
      select: { chave: true, valor: true, atualizadoEm: true },
    });

    let maisRecente = 0;
    for (const l of linhas) {
      if (!l.valor?.startsWith("data:image/")) continue;
      const tipo = l.valor.slice(5, l.valor.indexOf(";"));
      if (tipo) tipos.set(l.chave, tipo);
      const t = new Date(l.atualizadoEm).getTime();
      if (t > maisRecente) maisRecente = t;
    }
    if (maisRecente > 0) versao = String(maisRecente);
  } catch (e) {
    console.error("[icones-pwa] catálogo indisponível, usando o padrão:", e);
    tipos = new Map();
  }

  const icones: IconeManifest[] = [];

  for (const t of comuns) {
    // O de 180 é do iOS e não entra no manifest do Android.
    if (t.lado === 180) continue;
    icones.push({
      arquivo: `icone-${t.lado}.png`,
      lado: t.lado,
      tipo: tipos.get(t.chave) ?? "image/png",
      maskable: false,
    });
  }

  for (const t of mascaras) {
    icones.push({
      arquivo: `icone-maskable-${t.lado}.png`,
      lado: t.lado,
      tipo: tipos.get(t.chave) ?? "image/png",
      maskable: true,
    });
  }

  return { icones, versao };
}

/** A imagem enviada, para a tela poder mostrá-la e recortar de novo. */
export async function lerIconeOrigem(): Promise<string | null> {
  await exigirAdmin();
  try {
    const r = await prisma.platformSetting.findUnique({
      where: { chave: CHAVE_ORIGEM },
      select: { valor: true },
    });
    return r?.valor || null;
  } catch {
    return null;
  }
}

/** Os tamanhos já gerados, para a prévia. */
export async function lerIconesGerados(): Promise<Record<string, string>> {
  await exigirAdmin();
  try {
    const tamanhos = [...(await tamanhosIcone()), ...(await tamanhosMaskable())];
    const linhas = await prisma.platformSetting.findMany({
      where: { chave: { in: tamanhos.map((t) => t.chave) } },
      select: { chave: true, valor: true },
    });
    return Object.fromEntries(linhas.map((l) => [l.chave, l.valor]));
  } catch {
    return {};
  }
}

export type ResultadoIcone = { ok: boolean; mensagem: string };

/**
 * Grava os ícones que o navegador gerou a partir do recorte.
 *
 * O redimensionamento acontece no cliente, via canvas: o servidor não tem
 * biblioteca de imagem instalada, e mandar 500KB de PNG por Server Action
 * para reprocessar aqui seria pior. O que chega já vem pronto.
 */
export async function salvarIconesPwa(
  _anterior: ResultadoIcone | null,
  dados: FormData,
): Promise<ResultadoIcone> {
  const admin = await exigirAdmin();

  const origem = String(dados.get("origem") ?? "");
  if (!origem.startsWith("data:image/")) {
    return { ok: false, mensagem: "Envie uma imagem antes de salvar." };
  }

  // Os maskable entram na mesma transação: metade salva deixaria o
  // aplicativo com um ícone na tela inicial e outro na lista.
  const tamanhos = [...(await tamanhosIcone()), ...(await tamanhosMaskable())];
  const aGravar: { chave: string; valor: string }[] = [];

  for (const t of tamanhos) {
    const valor = String(dados.get(t.chave) ?? "");
    if (!valor.startsWith("data:image/")) {
      return { ok: false, mensagem: `Faltou gerar o tamanho de ${t.rotulo}.` };
    }
    // 600 KB por tamanho: em WebP, um ícone de 512px fica bem abaixo
    // disso. O teto existe para barrar um envio que encheria a coluna de
    // texto sem querer.
    if (valor.length > 600_000) {
      return { ok: false, mensagem: `A imagem de ${t.rotulo} ficou grande demais.` };
    }
    aGravar.push({ chave: t.chave, valor });
  }

  aGravar.push({ chave: CHAVE_ORIGEM, valor: origem });

  try {
    // Numa transação só: metade dos tamanhos trocados deixaria o
    // aplicativo com dois ícones diferentes conforme a tela.
    await prisma.$transaction(
      aGravar.map((i) =>
        prisma.platformSetting.upsert({
          where: { chave: i.chave },
          create: {
            chave: i.chave,
            valor: i.valor,
            tipo: "TEXTO",
            grupo: "pwa",
            rotulo: `Ícone do aplicativo (${i.chave.split("_").pop()})`,
            atualizadoPor: admin.nome,
          },
          update: { valor: i.valor, atualizadoPor: admin.nome },
        }),
      ),
    );
  } catch (e) {
    console.error("[icones-pwa] falha ao salvar:", e);
    return {
      ok: false,
      mensagem: "Não foi possível salvar agora. Tente de novo em instantes.",
    };
  }

  await registrarAcao({
    acao: "pwa.icones.alterados",
    entidade: "PlatformSetting",
    resumo: `Ícones do aplicativo atualizados (${tamanhos.length} tamanhos)`,
  });

  revalidatePath("/admin/aparencia");
  return {
    ok: true,
    mensagem:
      "Ícones salvos. Quem já instalou o aplicativo verá o ícone novo quando o sistema atualizar o atalho.",
  };
}

/** Volta aos ícones do repositório. */
export async function restaurarIconesPwa(): Promise<void> {
  const admin = await exigirAdmin();
  const tamanhos = [...(await tamanhosIcone()), ...(await tamanhosMaskable())];

  try {
    await prisma.platformSetting.deleteMany({
      where: { chave: { in: [...tamanhos.map((t) => t.chave), CHAVE_ORIGEM] } },
    });
  } catch (e) {
    console.error("[icones-pwa] falha ao restaurar:", e);
    return;
  }

  await registrarAcao({
    acao: "pwa.icones.restaurados",
    entidade: "PlatformSetting",
    resumo: "Ícones do aplicativo voltaram ao padrão",
    dados: { por: admin.nome },
  });

  revalidatePath("/admin/aparencia");
}

/**
 * Um ícone pelo tamanho, para a rota que os serve.
 *
 * Sem `exigirAdmin`: esta leitura atende o navegador de qualquer pessoa
 * que instala o aplicativo.
 */
export async function iconePublico(
  lado: number,
  maskable = false,
): Promise<{ dados: Buffer; tipo: string } | null> {
  try {
    const chave = maskable ? `pwa.icone_maskable_${lado}` : `pwa.icone_${lado}`;
    const r = await prisma.platformSetting.findUnique({
      where: { chave },
      select: { valor: true },
    });
    if (!r?.valor) return null;

    // A data URL carrega o próprio tipo ("data:image/webp;base64,..."):
    // servir WebP com cabeçalho de PNG faria alguns sistemas recusarem o
    // ícone na instalação.
    const [cabecalho, base64] = r.valor.split(",");
    if (!base64) return null;

    const tipo = cabecalho?.match(/^data:([^;]+)/)?.[1] ?? "image/png";
    return { dados: Buffer.from(base64, "base64"), tipo };
  } catch {
    return null;
  }
}
