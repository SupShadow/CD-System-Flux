/**
 * SYSTEM FLUX Visualizer SDK
 *
 * This SDK allows developers to create custom visualizers for SYSTEM FLUX.
 * Each visualizer receives audio data and can render custom graphics to a canvas.
 *
 * @example
 * ```typescript
 * import { defineVisualizer, VisualizerContext, rgba } from '@/lib/visualizer-sdk';
 *
 * export const myVisualizer = defineVisualizer({
 *   id: 'my-visualizer',
 *   name: 'My Custom Visualizer',
 *   author: 'Developer Name',
 *   description: 'A cool audio-reactive visualization',
 *
 *   render: (ctx) => {
 *     const { canvas, dataArray, metrics, color, centerX, centerY } = ctx;
 *     // Your rendering code here
 *   }
 * });
 * ```
 */

import {
    VisualizerContext,
    AudioMetrics,
    rgba as rgbaUtil,
    hexToRgb as hexToRgbUtil,
    drawCorners as drawCornersUtil,
    clearWithFade as clearWithFadeUtil,
    drawHeart as drawHeartUtil,
} from './visualizer-utils';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Visualizer plugin definition
 */
export interface VisualizerPlugin<TState = void> {
    /** Unique identifier for the visualizer */
    id: string;
    /** Display name */
    name: string;
    /** Author/creator name */
    author: string;
    /** Short description */
    description: string;
    /** Version string */
    version?: string;
    /** Tags for categorization */
    tags?: string[];
    /** Whether the visualizer uses flashing effects (for epilepsy warning) */
    hasFlashing?: boolean;
    /** Preview thumbnail URL */
    thumbnail?: string;

    /** Initialize state (called once when visualizer is first selected) */
    init?: (canvas: HTMLCanvasElement) => TState;

    /** Main render function (called every animation frame) */
    render: (context: VisualizerContext, state?: TState) => void;

    /** Cleanup function (called when visualizer is deselected) */
    cleanup?: (state?: TState) => void;

    /** Handle canvas resize */
    onResize?: (canvas: HTMLCanvasElement, state?: TState) => TState;
}

/**
 * Registered visualizer with runtime state
 */
export interface RegisteredVisualizer<TState = unknown> {
    plugin: VisualizerPlugin<TState>;
    state?: TState;
    isInitialized: boolean;
}

// =============================================================================
// REGISTRY
// =============================================================================

/**
 * Global visualizer registry
 */
class VisualizerRegistry {
    private visualizers: Map<string, RegisteredVisualizer> = new Map();
    private listeners: Set<() => void> = new Set();

    /**
     * Register a new visualizer plugin
     */
    register<TState>(plugin: VisualizerPlugin<TState>): void {
        if (this.visualizers.has(plugin.id)) {
            console.warn(`[VisualizerSDK] Visualizer "${plugin.id}" already registered. Overwriting.`);
        }

        this.visualizers.set(plugin.id, {
            plugin: plugin as VisualizerPlugin<unknown>,
            state: undefined,
            isInitialized: false,
        });

        this.notifyListeners();
        console.log(`[VisualizerSDK] Registered: ${plugin.name} by ${plugin.author}`);
    }

    /**
     * Unregister a visualizer
     */
    unregister(id: string): boolean {
        const visualizer = this.visualizers.get(id);
        if (visualizer) {
            if (visualizer.plugin.cleanup) {
                visualizer.plugin.cleanup(visualizer.state);
            }
            this.visualizers.delete(id);
            this.notifyListeners();
            return true;
        }
        return false;
    }

    /**
     * Get all registered visualizers
     */
    getAll(): VisualizerPlugin<unknown>[] {
        return Array.from(this.visualizers.values()).map(v => v.plugin);
    }

    /**
     * Get a specific visualizer by ID
     */
    get(id: string): RegisteredVisualizer | undefined {
        return this.visualizers.get(id);
    }

    /**
     * Check if a visualizer is registered
     */
    has(id: string): boolean {
        return this.visualizers.has(id);
    }

    /**
     * Initialize a visualizer's state
     */
    initialize(id: string, canvas: HTMLCanvasElement): void {
        const visualizer = this.visualizers.get(id);
        if (visualizer && !visualizer.isInitialized && visualizer.plugin.init) {
            visualizer.state = visualizer.plugin.init(canvas);
            visualizer.isInitialized = true;
        }
    }

    /**
     * Render a visualizer
     */
    render(id: string, context: VisualizerContext): void {
        const visualizer = this.visualizers.get(id);
        if (visualizer) {
            visualizer.plugin.render(context, visualizer.state);
        }
    }

    /**
     * Handle canvas resize
     */
    handleResize(id: string, canvas: HTMLCanvasElement): void {
        const visualizer = this.visualizers.get(id);
        if (visualizer && visualizer.plugin.onResize) {
            visualizer.state = visualizer.plugin.onResize(canvas, visualizer.state);
        }
    }

    /**
     * Subscribe to registry changes
     */
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    /**
     * Get visualizers by tag
     */
    getByTag(tag: string): VisualizerPlugin<unknown>[] {
        return this.getAll().filter(v => v.tags?.includes(tag));
    }

    /**
     * Get visualizers by author
     */
    getByAuthor(author: string): VisualizerPlugin<unknown>[] {
        return this.getAll().filter(v => v.author.toLowerCase() === author.toLowerCase());
    }
}

// Global registry instance
export const visualizerRegistry = new VisualizerRegistry();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Define a new visualizer (syntactic sugar for creating plugins)
 */
export function defineVisualizer<TState = void>(
    plugin: VisualizerPlugin<TState>
): VisualizerPlugin<TState> {
    return {
        version: '1.0.0',
        tags: [],
        hasFlashing: false,
        ...plugin,
    };
}

/**
 * Register and define in one step
 */
export function createVisualizer<TState = void>(
    plugin: VisualizerPlugin<TState>
): VisualizerPlugin<TState> {
    const defined = defineVisualizer(plugin);
    visualizerRegistry.register(defined);
    return defined;
}

// =============================================================================
// RE-EXPORTS FOR SDK USERS
// =============================================================================

// Re-export utility functions for plugin authors
export const rgba = rgbaUtil;
export const hexToRgb = hexToRgbUtil;
export const drawCorners = drawCornersUtil;
export const clearWithFade = clearWithFadeUtil;
export const drawHeart = drawHeartUtil;

// Re-export types
export type { VisualizerContext, AudioMetrics };

// =============================================================================
// SDK UTILITIES FOR PLUGIN AUTHORS
// =============================================================================

/**
 * Create a gradient from the current color
 */
export function createColorGradient(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    stops: Array<{ offset: number; alpha: number }>
): CanvasGradient {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(stop => {
        gradient.addColorStop(stop.offset, rgba(color, stop.alpha));
    });
    return gradient;
}

/**
 * Create a radial gradient from the current color
 */
export function createRadialGradient(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    innerRadius: number,
    outerRadius: number,
    color: string,
    stops: Array<{ offset: number; alpha: number }>
): CanvasGradient {
    const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    stops.forEach(stop => {
        gradient.addColorStop(stop.offset, rgba(color, stop.alpha));
    });
    return gradient;
}

/**
 * Map audio data to a value range
 */
export function mapAudioToRange(
    dataArray: Uint8Array,
    index: number,
    minValue: number,
    maxValue: number
): number {
    const normalized = dataArray[index] / 255;
    return minValue + normalized * (maxValue - minValue);
}

/**
 * Get frequency bin for a specific frequency (Hz)
 */
export function getFrequencyBin(
    frequency: number,
    sampleRate: number = 44100,
    fftSize: number = 256
): number {
    return Math.round(frequency * fftSize / sampleRate);
}

/**
 * Smooth a value over time (for animations)
 */
export function lerp(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Convert polar coordinates to cartesian
 */
export function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angle: number
): { x: number; y: number } {
    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
    };
}

/**
 * Draw a line with glow effect
 */
export function drawGlowLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    lineWidth: number = 2,
    glowSize: number = 10
): void {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = glowSize;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

/**
 * Draw a circle with glow effect
 */
export function drawGlowCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    glowSize: number = 15
): void {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = glowSize;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
