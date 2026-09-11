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
      // O padrão é 1 MB e o envio dos ícones do PWA estourava: são sete
      // PNGs na mesma submissão, e base64 ainda cresce ~33% sobre o
      // binário. 4 MB cobre o conjunto com folga — o servidor continua
      // recusando qualquer imagem individual acima de 1,5 MB.
      bodySizeLimit: "4mb",
    },
  },
};
export default nextConfig;
