import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const isGitHubPages = isProd && !isVercel;

const nextConfig: NextConfig = {
  // Static export only for GitHub Pages (Vercel supports SSR/API routes)
  ...(isGitHubPages && { output: "export" }),

  // Base path only for GitHub Pages (repo name)
  basePath: isGitHubPages ? "/CD-System-Flux" : "",

  // Asset prefix only for GitHub Pages
  assetPrefix: isGitHubPages ? "/CD-System-Flux/" : "",

  // Image optimization: disabled for GitHub Pages, enabled for Vercel
  images: {
    unoptimized: isGitHubPages,
  },

  // Trailing slash for better compatibility
  trailingSlash: true,

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_DEPLOYMENT: isVercel ? "vercel" : isGitHubPages ? "github" : "local",
  },
};

export default nextConfig;
