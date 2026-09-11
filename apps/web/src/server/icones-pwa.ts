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

export async function tamanhosIcone(): Promise<TamanhoIcone[]> {
  return [
    { chave: "pwa.icone_96", lado: 96, rotulo: "96 px", onde: "Android (densidade baixa)" },
    { chave: "pwa.icone_128", lado: 128, rotulo: "128 px", onde: "Chrome, atalhos" },
    { chave: "pwa.icone_192", lado: 192, rotulo: "192 px", onde: "Android (tela inicial)" },
    { chave: "pwa.icone_256", lado: 256, rotulo: "256 px", onde: "Desktop" },
    { chave: "pwa.icone_384", lado: 384, rotulo: "384 px", onde: "Android (densidade alta)" },
    { chave: "pwa.icone_512", lado: 512, rotulo: "512 px", onde: "Splash e loja" },
    { chave: "pwa.icone_180", lado: 180, rotulo: "180 px", onde: "iPhone e iPad" },
  ];
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
    const tamanhos = await tamanhosIcone();
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

  const tamanhos = await tamanhosIcone();
  const aGravar: { chave: string; valor: string }[] = [];

  for (const t of tamanhos) {
    const valor = String(dados.get(t.chave) ?? "");
    if (!valor.startsWith("data:image/")) {
      return { ok: false, mensagem: `Faltou gerar o tamanho de ${t.rotulo}.` };
    }
    // 1,5 MB por tamanho é folgado para um PNG de 512px e barra um
    // envio que encheria a coluna de texto sem querer.
    if (valor.length > 1_500_000) {
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
  const tamanhos = await tamanhosIcone();

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
export async function iconePublico(lado: number): Promise<Buffer | null> {
  try {
    const r = await prisma.platformSetting.findUnique({
      where: { chave: `pwa.icone_${lado}` },
      select: { valor: true },
    });
    if (!r?.valor) return null;

    const base64 = r.valor.split(",")[1];
    return base64 ? Buffer.from(base64, "base64") : null;
  } catch {
    return null;
  }
}
