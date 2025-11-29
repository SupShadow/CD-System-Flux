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

/**
 * Format seconds into human-readable time string
 * Extracted to shared utility to avoid recreating function on every render
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
