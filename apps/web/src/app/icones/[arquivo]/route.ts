import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { iconePublico } from "@/server/icones-pwa";

/**
 * Serve os ícones do aplicativo.
 *
 * Primeiro procura o que o administrador enviou pelo painel; se não há
 * nada salvo, entrega o arquivo do repositório. É isso que permite trocar
 * o ícone sem deploy e, ao mesmo tempo, garante que a plataforma nunca
 * fique sem ícone.
 *
 * Esta rota fica em `/icones/[arquivo]`. Os arquivos de reserva moraram
 * um tempo em `public/icones/` com EXATAMENTE estes nomes, e isso anulava
 * a rota inteira: no Next, um arquivo de `public/` vence uma rota de
 * mesmo caminho — o contrário do que este comentário afirmava antes. O
 * efeito era silencioso e completo: o ícone enviado pelo painel ficava
 * guardado no banco, correto, e o servidor entregava o PNG do
 * repositório. Por isso as reservas agora ficam em `public/icones/padrao/`,
 * um caminho que não colide com nada.
 */

/** Onde ficam as reservas — fora do caminho servido por esta rota. */
const PASTA_PADRAO = ["public", "icones", "padrao"];

type Alvo = {
  /// Lado em pixels quando existe versão enviada pelo painel; `null`
  /// quando o arquivo só pode vir do repositório.
  lado: number | null;
  estatico: string;
  /// Versão com margem para o recorte circular do Android.
  maskable?: boolean;
};

/** Só nomes conhecidos: o `arquivo` vem da URL e não pode virar caminho. */
const PERMITIDOS: Record<string, Alvo> = {
  "icone-96.png": { lado: 96, estatico: "icone-96.png" },
  "icone-128.png": { lado: 128, estatico: "icone-128.png" },
  "icone-192.png": { lado: 192, estatico: "icone-192.png" },
  "icone-256.png": { lado: 256, estatico: "icone-256.png" },
  "icone-384.png": { lado: 384, estatico: "icone-384.png" },
  "icone-512.png": { lado: 512, estatico: "icone-512.png" },
  "apple-touch-icon.png": { lado: 180, estatico: "apple-touch-icon.png" },
  // 152 e 167 tinham `lado: null`, ou seja, só vinham do repositório:
  // trocar a arte no painel não mudava o ícone em nenhum iPad.
  "apple-touch-152.png": { lado: 152, estatico: "apple-touch-152.png" },
  "apple-touch-167.png": { lado: 167, estatico: "apple-touch-167.png" },
  "apple-touch-180.png": { lado: 180, estatico: "apple-touch-180.png" },
  // O maskable é o que o Android prefere para o atalho. Ele tem chave
  // própria no banco (`pwa.icone_maskable_*`), gerada pelo painel com a
  // margem de segurança do recorte circular — antes vinha só do
  // repositório, e era por isso que o ícone enviado pelo administrador
  // nunca aparecia no aparelho.
  "icone-maskable-192.png": { lado: 192, estatico: "icone-maskable-192.png", maskable: true },
  "icone-maskable-512.png": { lado: 512, estatico: "icone-maskable-512.png", maskable: true },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ arquivo: string }> },
) {
  const { arquivo } = await params;
  const alvo = PERMITIDOS[arquivo];

  if (!alvo) return new NextResponse("Ícone não encontrado", { status: 404 });

  // 1) O que o administrador enviou.
  if (alvo.lado !== null) {
    const salvo = await iconePublico(alvo.lado, alvo.maskable === true);
    if (salvo) {
      return new NextResponse(new Uint8Array(salvo.dados), {
        headers: {
          "Content-Type": salvo.tipo,
          // Curto de propósito: trocar o ícone no painel precisa aparecer
          // em minutos, não depois que o cache do navegador expirar.
          "Cache-Control": "public, max-age=300, must-revalidate",
        },
      });
    }
  }

  // 2) O arquivo do repositório.
  try {
    const caminho = path.join(process.cwd(), ...PASTA_PADRAO, alvo.estatico);
    const conteudo = await readFile(caminho);
    return new NextResponse(new Uint8Array(conteudo), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Ícone não encontrado", { status: 404 });
  }
}
