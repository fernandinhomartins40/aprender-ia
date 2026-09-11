/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aprender/ui", "@aprender/types", "@aprender/auth", "@aprender/ai-launcher", "@aprender/db"],
  // O web-push usa crypto nativo do Node e não sobrevive ao empacotamento
  // do bundler: precisa ser exigido em tempo de execução pelo servidor.
  serverExternalPackages: ["web-push"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      // Ícones e mídia editorial. O servidor limita cada vídeo/imagem a
      // 25 MB; a margem absorve o multipart sem aceitar upload ilimitado.
      bodySizeLimit: "28mb",
    },
  },
};
export default nextConfig;
