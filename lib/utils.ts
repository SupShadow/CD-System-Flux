import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the base path for assets (handles GitHub Pages deployment)
 */
export function getBasePath(): string {
  return process.env.NODE_ENV === "production" ? "/CD-System-Flux" : "";
}

/**
 * Prefix a path with the base path for production
 */
export function assetPath(path: string): string {
  const base = getBasePath();
  // Don't double-prefix
  if (path.startsWith(base)) return path;
  return `${base}${path}`;
}
