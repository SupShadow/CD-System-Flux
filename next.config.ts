import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",

  // Base path for GitHub Pages (repo name)
  basePath: isProd ? "/CD-System-Flux" : "",

  // Asset prefix for correct resource loading
  assetPrefix: isProd ? "/CD-System-Flux/" : "",

  // GitHub Pages doesn't support Next.js image optimization
  images: {
    unoptimized: true,
  },

  // Trailing slash for better compatibility
  trailingSlash: true,
};

export default nextConfig;
