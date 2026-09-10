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
    apple: [{ url: "/icones/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
