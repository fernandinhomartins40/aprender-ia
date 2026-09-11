import { NextResponse } from "next/server";
import { catalogoIcones } from "@/server/icones-pwa";

/**
 * O manifest do aplicativo, gerado a partir do que está no banco.
 *
 * Antes era um arquivo estático em `public/manifest.json`, e isso criava
 * duas fontes de verdade que se contradiziam: o arquivo declarava
 * `"type": "image/png"` em todos os ícones, enquanto o painel passou a
 * gerar WebP (formato escolhido para o conjunto caber no limite de corpo
 * da Server Action).
 *
 * O Chrome descarta ícone cujo tipo declarado não corresponde ao servido,
 * e o cabeçalho `X-Content-Type-Options: nosniff` o impede de corrigir
 * sozinho. Sem ícone válido, o Android cai no favicon — era exatamente
 * esse o motivo de a arte enviada pelo administrador nunca aparecer na
 * tela inicial, mesmo estando corretamente gravada e sendo servida.
 *
 * Aqui o tipo declarado vem do arquivo real. E cada URL leva `?v=`, com o
 * instante do último salvamento: o endereço muda quando a arte muda, que
 * é o que faz o navegador buscar a nova em vez de reaproveitar a antiga.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const { icones, versao } = await catalogoIcones();

  const manifest = {
    name: "Aprender IA — Formação para professores",
    short_name: "Aprender IA",
    description:
      "Trilha prática para professores da rede pública usarem Inteligência Artificial na rotina escolar.",
    id: "/app/entrar",
    start_url: "/app/entrar",
    scope: "/app",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#4F46E5",
    theme_color: "#4F46E5",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["education", "productivity"],
    prefer_related_applications: false,
    icons: icones.map((i) => ({
      src: `/icones/${i.arquivo}?v=${versao}`,
      sizes: `${i.lado}x${i.lado}`,
      type: i.tipo,
      purpose: i.maskable ? "maskable" : "any",
    })),
    shortcuts: [
      {
        name: "Minha trilha",
        short_name: "Trilha",
        description: "Continuar de onde parei",
        url: "/app/trilha",
        icons: [{ src: `/icones/icone-96.png?v=${versao}`, sizes: "96x96" }],
      },
      {
        name: "Banco de prompts",
        short_name: "Prompts",
        description: "Buscar um prompt pronto",
        url: "/app/prompts",
        icons: [{ src: `/icones/icone-96.png?v=${versao}`, sizes: "96x96" }],
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      // Curto: trocar o ícone no painel precisa chegar ao aparelho em
      // minutos. O `?v=` nas URLs já garante que o ícone em si não venha
      // de cache antigo.
      "Cache-Control": "public, max-age=60, must-revalidate",
    },
  });
}
