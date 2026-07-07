import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportación estática: ideal para un escaparate rápido y SEO impecable,
  // desplegable en Cloudflare Pages sin servidor.
  output: "export",
  trailingSlash: true,
  // Fija la raíz del proyecto (hay otros lockfiles en el sistema).
  turbopack: { root: __dirname },
  images: {
    // Requerido con output: export (sin optimizador en runtime).
    unoptimized: true,
  },
};

export default nextConfig;
