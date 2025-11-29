/**
 * Lazy-loaded visualizer registry
 *
 * This module provides dynamic loading of visualizers to reduce initial bundle size.
 * Visualizers are loaded on-demand when first used.
 */

import { VisualizerContext } from "@/lib/visualizer-utils";
import { VisualizerType, VisualizerState } from "./index";

type VisualizerRenderer = (context: VisualizerContext, state?: unknown) => void;

// Cache for loaded visualizers
const visualizerCache = new Map<VisualizerType, VisualizerRenderer>();

// Preloaded visualizers (most commonly used - loaded with main bundle)
// These are the visualizers for the first few tracks that users are likely to see
const PRELOADED_VISUALIZERS: VisualizerType[] = ["default", "dissolve", "halo"];

/**
 * Dynamically imports a visualizer module
 */
async function loadVisualizer(type: VisualizerType): Promise<VisualizerRenderer> {
    // Check cache first
    const cached = visualizerCache.get(type);
    if (cached) return cached;

    let renderer: VisualizerRenderer;

    // Dynamic imports for each visualizer
    switch (type) {
        case "dissolve": {
            const mod = await import("./dissolve");
            renderer = mod.renderDissolve;
            break;
        }
        case "digital": {
            const mod = await import("./digital");
            renderer = mod.renderDigital;
            break;
        }
        case "breathe": {
            const mod = await import("./breathe");
            renderer = mod.renderBreathe;
            break;
        }
        case "targeting": {
            const mod = await import("./targeting");
            renderer = mod.renderTargeting;
            break;
        }
        case "grid": {
            const mod = await import("./grid");
            renderer = mod.renderGrid;
            break;
        }
        case "mirror": {
            const mod = await import("./mirror");
            renderer = mod.renderMirror;
            break;
        }
        case "matrix": {
            const mod = await import("./matrix");
            renderer = mod.renderMatrix as VisualizerRenderer;
            break;
        }
        case "halo": {
            const mod = await import("./halo");
            renderer = mod.renderHalo;
            break;
        }
        case "skyline": {
            const mod = await import("./skyline");
            renderer = mod.renderSkyline;
            break;
        }
        case "atomic": {
            const mod = await import("./atomic");
            renderer = mod.renderAtomic;
            break;
        }
        case "flash": {
            const mod = await import("./flash");
            renderer = mod.renderFlash;
            break;
        }
        case "hearts": {
            const mod = await import("./hearts");
            renderer = mod.renderHearts as VisualizerRenderer;
            break;
        }
        case "villain": {
            const mod = await import("./villain");
            renderer = mod.renderVillain;
            break;
        }
        case "chess": {
            const mod = await import("./chess");
            renderer = mod.renderChess;
            break;
        }
        case "enigma": {
            const mod = await import("./enigma");
            renderer = mod.renderEnigma;
            break;
        }
        case "gameover": {
            const mod = await import("./gameover");
            renderer = mod.renderGameover;
            break;
        }
        case "code": {
            const mod = await import("./code");
            renderer = mod.renderCode as VisualizerRenderer;
            break;
        }
        case "cinema": {
            const mod = await import("./cinema");
            renderer = mod.renderCinema;
            break;
        }
        case "speed": {
            const mod = await import("./speed");
            renderer = mod.renderSpeed;
            break;
        }
        case "falling": {
            const mod = await import("./falling");
            renderer = mod.renderFalling as VisualizerRenderer;
            break;
        }
        case "waves": {
            const mod = await import("./waves");
            renderer = mod.renderWaves;
            break;
        }
        case "speaker": {
            const mod = await import("./speaker");
            renderer = mod.renderSpeaker;
            break;
        }
        case "voices": {
            const mod = await import("./voices");
            renderer = mod.renderVoices;
            break;
        }
        case "ice": {
            const mod = await import("./ice");
            renderer = mod.renderIce as VisualizerRenderer;
            break;
        }
        case "trace": {
            const mod = await import("./trace");
            renderer = mod.renderTrace as VisualizerRenderer;
            break;
        }
        default: {
            const mod = await import("./default");
            renderer = mod.renderDefault;
        }
    }

    visualizerCache.set(type, renderer);
    return renderer;
}

/**
 * Preloads commonly used visualizers in the background
 */
export async function preloadCommonVisualizers(): Promise<void> {
    await Promise.all(
        PRELOADED_VISUALIZERS.map((type) => loadVisualizer(type))
    );
}

/**
 * Preloads a specific visualizer (call when user is about to switch tracks)
 */
export async function preloadVisualizer(type: VisualizerType): Promise<void> {
    await loadVisualizer(type);
}

/**
 * Gets the state key for a visualizer type (if it uses persistent state)
 */
function getStateKey(type: VisualizerType): keyof VisualizerState | null {
    switch (type) {
        case "matrix":
            return "matrix";
        case "falling":
            return "falling";
        case "hearts":
            return "hearts";
        case "code":
            return "code";
        case "ice":
            return "ice";
        case "trace":
            return "trace";
        default:
            return null;
    }
}

/**
 * Renders a visualizer, loading it dynamically if needed.
 * Returns true if the visualizer was already loaded, false if it's loading.
 */
export function renderVisualizerLazy(
    type: VisualizerType,
    context: VisualizerContext,
    state: VisualizerState,
    options?: { disableFlashing?: boolean }
): boolean {
    // Handle flash -> halo substitution for epilepsy safety
    const actualType = type === "flash" && options?.disableFlashing ? "halo" : type;

    const cached = visualizerCache.get(actualType);

    if (cached) {
        // Visualizer is loaded, render it
        const stateKey = getStateKey(actualType);
        if (stateKey) {
            cached(context, state[stateKey]);
        } else {
            cached(context);
        }
        return true;
    }

    // Visualizer not loaded yet, start loading and render default in the meantime
    loadVisualizer(actualType).catch(console.error);

    // Render default visualizer while loading
    const defaultRenderer = visualizerCache.get("default");
    if (defaultRenderer) {
        defaultRenderer(context);
    }

    return false;
}

/**
 * Checks if a visualizer is already loaded
 */
export function isVisualizerLoaded(type: VisualizerType): boolean {
    return visualizerCache.has(type);
}

/**
 * Clears the visualizer cache (useful for testing or memory management)
 */
export function clearVisualizerCache(): void {
    visualizerCache.clear();
}
