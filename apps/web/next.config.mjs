import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Empacota só o necessário para SERVIR o site: um servidor Node mínimo,
  // as páginas compiladas e apenas os módulos de fato importados.
  //
  // Sem isto a imagem levava o `node_modules` inteiro — TypeScript,
  // Tailwind, Vitest e todo o ferramental que só serve para CONSTRUIR.
  // Corta a maior parte do tamanho da imagem, o que encurta build, cópia
  // e subida do container.
  output: "standalone",

  // Obrigatório em monorepo. Sem isto o Next rastreia a partir de
  // `apps/web` e deixa de fora os pacotes do workspace (@aprender/db,
  // @aprender/auth...), e o container sobe quebrado por módulo ausente.
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),

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
