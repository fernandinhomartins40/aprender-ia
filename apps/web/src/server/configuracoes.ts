"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { registrarAcao } from "./auditoria";
import { CONFIGS, PADROES } from "@/lib/configuracoes-catalogo";

/**
 * Configurações da plataforma.
 *
 * O objetivo é que nenhuma regra operacional exija tocar no código: os
 * valores vivem no banco e o painel os edita. O catálogo das chaves (com
 * os padrões) fica em `lib/configuracoes-catalogo` — um módulo
 * "use server" só pode exportar funções async, então a lista não pode
 * morar aqui.
 */

/* ============================================================
   LEITURA
   ============================================================ */

/**
 * A tabela pode não existir ainda.
 *
 * O deploy sobe o container antes de aplicar as migrations, então há uma
 * janela em que o código novo consulta um banco velho. Uma configuração
 * ausente tem resposta óbvia — o padrão — e derrubar o painel inteiro por
 * causa disso é desproporcional. Erro de verdade continua no log.
 */
async function tolerandoTabelaAusente<T>(
  consulta: () => Promise<T>,
  aoFalhar: T,
  ondeFoi: string,
): Promise<T> {
  try {
    return await consulta();
  } catch (e) {
    console.error(`[configuracoes] ${ondeFoi} falhou; usando padrões.`, e);
    return aoFalhar;
  }
}

/** Todas as configurações, com os padrões preenchendo o que falta. */
export async function lerConfiguracoes(): Promise<Record<string, string>> {
  const salvas = await tolerandoTabelaAusente(
    () => prisma.platformSetting.findMany({ select: { chave: true, valor: true } }),
    [] as { chave: string; valor: string }[],
    "lerConfiguracoes",
  );
  const mapa: Record<string, string> = {};
  for (const c of CONFIGS) mapa[c.chave] = c.padrao;
  for (const s of salvas) mapa[s.chave] = s.valor;
  return mapa;
}

export async function lerTexto(chave: string): Promise<string> {
  const salva = await tolerandoTabelaAusente(
    () =>
      prisma.platformSetting.findUnique({
        where: { chave },
        select: { valor: true },
      }),
    null as { valor: string } | null,
    `lerTexto(${chave})`,
  );
  return salva?.valor ?? PADROES.get(chave)?.padrao ?? "";
}

export async function lerNumero(chave: string): Promise<number> {
  const bruto = await lerTexto(chave);
  const n = Number(bruto);
  // Valor corrompido cai no padrão em vez de virar NaN e contaminar contas.
  if (Number.isFinite(n)) return n;
  return Number(PADROES.get(chave)?.padrao ?? 0) || 0;
}

export async function lerBooleano(chave: string): Promise<boolean> {
  return (await lerTexto(chave)) === "true";
}

/** As definições com o valor atual, para desenhar a tela. */
export async function listarConfiguracoesParaTela() {
  await exigirAdmin();
  const valores = await lerConfiguracoes();
  const salvas = await tolerandoTabelaAusente(
    () =>
      prisma.platformSetting.findMany({
        select: { chave: true, atualizadoEm: true, atualizadoPor: true },
      }),
    [] as { chave: string; atualizadoEm: Date; atualizadoPor: string | null }[],
    "listarConfiguracoesParaTela",
  );
  const meta = new Map(salvas.map((s) => [s.chave, s]));

  return CONFIGS.map((c) => ({
    ...c,
    valor: valores[c.chave] ?? c.padrao,
    /// Nunca salva = está no padrão; a tela diz isso ao administrador.
    personalizada: meta.has(c.chave),
    atualizadoEm: meta.get(c.chave)?.atualizadoEm ?? null,
    atualizadoPor: meta.get(c.chave)?.atualizadoPor ?? null,
  }));
}

/* ============================================================
   ESCRITA
   ============================================================ */

export type ResultadoConfig = { ok: boolean; mensagem: string };

export async function salvarConfiguracoes(
  _anterior: ResultadoConfig | null,
  dados: FormData,
): Promise<ResultadoConfig> {
  const admin = await exigirAdmin();

  const alteracoes: { chave: string; de: string; para: string; rotulo: string }[] = [];
  const atuais = await lerConfiguracoes();

  for (const def of CONFIGS) {
    // Um campo ausente no envio (ex.: outra seção do formulário) não é
    // "apagar": só processamos o que veio.
    if (!dados.has(def.chave)) continue;

    const bruto = String(dados.get(def.chave) ?? "").trim();
    let valor = bruto;

    if (def.tipo === "BOOLEANO") {
      valor = bruto === "on" || bruto === "true" ? "true" : "false";
    } else if (def.tipo === "NUMERO") {
      const n = Number(bruto.replace(",", "."));
      if (!Number.isFinite(n) || n < 0) {
        return { ok: false, mensagem: `"${def.rotulo}" precisa ser um número igual ou maior que zero.` };
      }
      valor = String(Math.round(n));
    } else if (def.tipo === "JSON") {
      try {
        JSON.parse(bruto || "null");
      } catch {
        return { ok: false, mensagem: `"${def.rotulo}" não é um JSON válido.` };
      }
    }

    const antes = atuais[def.chave] ?? def.padrao;
    if (antes === valor) continue;

    alteracoes.push({ chave: def.chave, de: antes, para: valor, rotulo: def.rotulo });

    await prisma.platformSetting.upsert({
      where: { chave: def.chave },
      create: {
        chave: def.chave,
        valor,
        tipo: def.tipo,
        grupo: def.grupo,
        rotulo: def.rotulo,
        descricao: def.descricao ?? null,
        atualizadoPor: admin.nome,
      },
      update: { valor, atualizadoPor: admin.nome, rotulo: def.rotulo, grupo: def.grupo },
    });
  }

  if (alteracoes.length === 0) {
    return { ok: true, mensagem: "Nada mudou." };
  }

  await registrarAcao({
    acao: "configuracao.alterada",
    entidade: "PlatformSetting",
    resumo:
      alteracoes.length === 1
        ? `${alteracoes[0]!.rotulo}: "${alteracoes[0]!.de}" → "${alteracoes[0]!.para}"`
        : `${alteracoes.length} configurações alteradas`,
    dados: { alteracoes },
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin");
  return {
    ok: true,
    mensagem: `${alteracoes.length} configuração(ões) salva(s).`,
  };
}

/** Devolve uma chave ao valor padrão. */
export async function restaurarPadrao(dados: FormData): Promise<void> {
  const admin = await exigirAdmin();
  const chave = String(dados.get("chave") ?? "");
  const def = PADROES.get(chave);
  if (!def) return;

  await prisma.platformSetting.deleteMany({ where: { chave } });

  await registrarAcao({
    acao: "configuracao.restaurada",
    entidade: "PlatformSetting",
    entidadeId: chave,
    resumo: `${def.rotulo} voltou ao padrão ("${def.padrao}")`,
  });

  revalidatePath("/admin/configuracoes");
}
