/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aprender/ui", "@aprender/types", "@aprender/ai-launcher", "@aprender/db"],
  experimental: { optimizePackageImports: ["lucide-react"] },
};
export default nextConfig;
