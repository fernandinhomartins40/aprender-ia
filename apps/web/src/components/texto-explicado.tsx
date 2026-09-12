"use client";

import { useMemo } from "react";
import { AjudaContextual, type ItemAjuda } from "./ajuda-contextual";

/**
 * Texto com os termos da Base de Conhecimento marcados automaticamente.
 *
 * Serve ao conteúdo que não é escrito à mão na interface — o texto das
 * lições, sobretudo. Marcar cada termo manualmente ali seria impossível:
 * o conteúdo vem do banco e muda.
 *
 * Três limites deliberados, que atendem ao requisito de não poluir a
 * interface com uma fileira de ícones:
 *
 * 1. Só o PRIMEIRO uso de cada termo em cada bloco recebe ícone. Um texto
 *    que menciona "habilidade" seis vezes ganha um ícone, não seis.
 *
 * 2. No máximo `limite` termos por bloco (padrão 3). Um parágrafo dentro
 *    de um material pedagógico costuma mencionar vários conceitos, e
 *    marcar todos transformaria o texto numa árvore de Natal.
 *
 * 3. Só casa palavra inteira, respeitando limites de palavra em
 *    português. Sem isso "IA" acenderia dentro de "criativa" e
 *    "prompt" dentro de "prompts" duas vezes.
 *
 * Custo: o índice de padrões é montado uma vez por conjunto de verbetes
 * (memoizado) e a varredura é um `split` por regex sobre o texto do
 * bloco. Nada de percorrer o DOM nem observar mutações.
 */

/** O verbete, mais os sinônimos que também devem acender o ícone. */
export type TermoDetectavel = ItemAjuda & { sinonimos: string[] };

type Marca = { slug: string; item: ItemAjuda; padrao: string };

/**
 * Escapa o que seria metacaractere de regex.
 *
 * Os termos vêm do banco, editáveis pelo administrador: um "P.T.C.F."
 * sem escape viraria um padrão que casa "PXTXCXFX".
 */
function escapar(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TextoExplicado({
  texto,
  termos,
  contexto,
  limite = 3,
  className,
}: {
  texto: string;
  /** Verbetes candidatos, indexados por slug (vêm da página). */
  termos: Record<string, TermoDetectavel>;
  contexto?: string;
  /** Máximo de ícones neste bloco. */
  limite?: number;
  className?: string;
}) {
  const candidatos = useMemo<Marca[]>(() => {
    const lista: Marca[] = [];
    for (const item of Object.values(termos)) {
      // Termo e sinônimos concorrem pela mesma marca: o que aparecer
      // primeiro no texto vence.
      for (const p of [item.termo, ...item.sinonimos]) {
        if (p.length >= 3) lista.push({ slug: item.slug, item, padrao: p });
      }
    }
    // Padrões mais longos primeiro: "código da habilidade" deve vencer
    // "habilidade" quando os dois casam no mesmo ponto.
    return lista.sort((a, b) => b.padrao.length - a.padrao.length);
  }, [termos]);

  const partes = useMemo(() => {
    if (candidatos.length === 0 || !texto) return [texto];

    const jaMarcados = new Set<string>();
    const fragmentos: (string | Marca)[] = [texto];

    for (const marca of candidatos) {
      if (jaMarcados.size >= limite) break;
      if (jaMarcados.has(marca.slug)) continue;

      // `(?<![\p{L}])` e `(?![\p{L}])`: limite de palavra que funciona com
      // acentos, onde `\b` falha ("competência" tem 'ê' no meio).
      const re = new RegExp(`(?<!\\p{L})(${escapar(marca.padrao)})(?!\\p{L})`, "iu");

      for (let i = 0; i < fragmentos.length; i++) {
        const f = fragmentos[i];
        if (typeof f !== "string") continue;
        const m = re.exec(f);
        if (!m || m.index === undefined) continue;

        const antes = f.slice(0, m.index + m[0].length);
        const depois = f.slice(m.index + m[0].length);
        // O ícone vai DEPOIS da palavra, como em "BNCC ⓘ": o texto
        // continua legível e nada é reescrito.
        fragmentos.splice(i, 1, antes, marca, depois);
        jaMarcados.add(marca.slug);
        break;
      }
    }

    return fragmentos;
  }, [texto, candidatos, limite]);

  return (
    <span className={className}>
      {partes.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <AjudaContextual key={`${p.slug}-${i}`} item={p.item} contexto={contexto} />
        ),
      )}
    </span>
  );
}
