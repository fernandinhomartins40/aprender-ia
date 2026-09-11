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
 * Esta rota fica em `/icones/[arquivo]` e substitui os arquivos estáticos
 * que estavam no mesmo caminho — o Next dá precedência à rota.
 */

/** Só nomes conhecidos: o `arquivo` vem da URL e não pode virar caminho. */
const PERMITIDOS: Record<string, { lado: number | null; estatico: string }> = {
  "icone-96.png": { lado: 96, estatico: "icone-96.png" },
  "icone-128.png": { lado: 128, estatico: "icone-128.png" },
  "icone-192.png": { lado: 192, estatico: "icone-192.png" },
  "icone-256.png": { lado: 256, estatico: "icone-256.png" },
  "icone-384.png": { lado: 384, estatico: "icone-384.png" },
  "icone-512.png": { lado: 512, estatico: "icone-512.png" },
  "apple-touch-icon.png": { lado: 180, estatico: "apple-touch-icon.png" },
  "apple-touch-152.png": { lado: null, estatico: "apple-touch-152.png" },
  "apple-touch-167.png": { lado: null, estatico: "apple-touch-167.png" },
  "apple-touch-180.png": { lado: 180, estatico: "apple-touch-180.png" },
  // Os maskable continuam vindo do repositório: exigem margem de
  // segurança específica, que o recorte livre do painel não garante.
  "icone-maskable-192.png": { lado: null, estatico: "icone-maskable-192.png" },
  "icone-maskable-512.png": { lado: null, estatico: "icone-maskable-512.png" },
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
    const salvo = await iconePublico(alvo.lado);
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
    const caminho = path.join(process.cwd(), "public", "icones", alvo.estatico);
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
