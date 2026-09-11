import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Provedores } from "@/components/provedores";

export const metadata: Metadata = {
  title: "Aprender IA — Formação prática para professores",
  description:
    "Trilha guiada para professores da rede pública usarem Inteligência Artificial na rotina escolar. Menos burocracia, aulas melhores, seu fim de semana de volta.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Aprender IA" },
  // Declarados explicitamente, e não só por convenção de arquivo: assim o
  // navegador recebe o PNG nítido quando quer um ícone grande, em vez de
  // ampliar o .ico de 48px.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icones/icone-192.png", type: "image/png", sizes: "192x192" },
    ],
    // O iOS escolhe pelo tamanho: iPhone usa 180, iPad 152 ou 167. Com um
    // só declarado, ele reescala e o ícone sai borrado no aparelho que
    // não bate.
    apple: [
      { url: "/icones/apple-touch-152.png", sizes: "152x152" },
      { url: "/icones/apple-touch-167.png", sizes: "167x167" },
      { url: "/icones/apple-touch-180.png", sizes: "180x180" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Estende o conteúdo sob a barra de status no iOS instalado; as telas
  // do aplicativo usam `env(safe-area-inset-*)` para não ficar por baixo.
  viewportFit: "cover",
};

/**
 * Captura do evento de instalação.
 *
 * O Chrome dispara `beforeinstallprompt` UMA vez, durante a carga da
 * página. Um ouvinte registrado dentro de `useEffect` chega tarde: o
 * React só hidrata depois, o evento já passou e não se repete — era por
 * isso que o convite de instalação nunca aparecia no Android.
 *
 * Este script roda antes da hidratação, guarda o evento em `window` e
 * avisa quem montar depois com um evento próprio. O componente do convite
 * lê o que já foi guardado e também escuta o aviso.
 */
const CAPTURA_INSTALACAO = `
(function(){
  window.__aprenderiaInstalar = null;
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    window.__aprenderiaInstalar = e;
    window.dispatchEvent(new CustomEvent('aprenderia:instalavel'));
  });
  window.addEventListener('appinstalled', function(){
    window.__aprenderiaInstalar = null;
    window.dispatchEvent(new CustomEvent('aprenderia:instalado'));
  });
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Antes de qualquer JavaScript da aplicação: ver comentário acima. */}
        <script dangerouslySetInnerHTML={{ __html: CAPTURA_INSTALACAO }} />
      </head>
      <body>
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
