/**
 * Debug utility for controlled logging in development vs production
 * Replaces direct console.log calls throughout the codebase
 */

const IS_DEV = process.env.NODE_ENV === "development";
const IS_BROWSER = typeof window !== "undefined";

// Allow runtime debug override via localStorage
const getDebugEnabled = (): boolean => {
    if (!IS_BROWSER) return IS_DEV;
    try {
        return localStorage.getItem("debug") === "true" || IS_DEV;
    } catch {
        return IS_DEV;
    }
};

type LogLevel = "log" | "warn" | "error" | "info";

interface LogOptions {
    level?: LogLevel;
    data?: unknown;
    force?: boolean; // Force log even in production
}

/**
 * Contextual logger - only logs in development or when debug is enabled
 * @param context - The component/module name (e.g., "AudioEngine", "Visualizer")
 * @param message - The log message
 * @param options - Additional options (level, data, force)
 */
export function log(context: string, message: string, options: LogOptions = {}): void {
    const { level = "log", data, force = false } = options;

    if (!force && !getDebugEnabled()) return;

    const prefix = `[${context}]`;
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);

    if (data !== undefined) {
        console[level](`${timestamp} ${prefix} ${message}`, data);
    } else {
        console[level](`${timestamp} ${prefix} ${message}`);
    }
}

/**
 * Shorthand loggers for specific contexts
 */
export const logger = {
    audio: (message: string, options?: LogOptions) => log("AudioEngine", message, options),
    visualizer: (message: string, options?: LogOptions) => log("Visualizer", message, options),
    media: (message: string, options?: LogOptions) => log("MediaSession", message, options),
    experience: (message: string, options?: LogOptions) => log("Experience", message, options),
    performance: (message: string, options?: LogOptions) => log("Performance", message, options),
};

/**
 * Warning logger - logs in dev, optionally in prod for critical warnings
 */
export function warn(context: string, message: string, data?: unknown): void {
    log(context, message, { level: "warn", data });
}

/**
 * Error logger - always logs errors (even in production)
 */
export function error(context: string, message: string, data?: unknown): void {
    log(context, message, { level: "error", data, force: true });
}

/**
 * Performance timing utility
 */
export function time(label: string): () => void {
    if (!getDebugEnabled()) return () => {};

    const start = performance.now();
    return () => {
        const duration = performance.now() - start;
        log("Perf", `${label}: ${duration.toFixed(2)}ms`);
    };
}

/**
 * Enable/disable debug mode at runtime
 */
export function setDebugMode(enabled: boolean): void {
    if (!IS_BROWSER) return;
    try {
        if (enabled) {
            localStorage.setItem("debug", "true");
            console.log("[Debug] Debug mode enabled. Refresh to see logs.");
        } else {
            localStorage.removeItem("debug");
            console.log("[Debug] Debug mode disabled.");
        }
    } catch {
        // localStorage not available
    }
}

// Export for use in browser console
if (IS_BROWSER) {
    (window as unknown as { setDebugMode: typeof setDebugMode }).setDebugMode = setDebugMode;
}
