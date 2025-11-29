/**
 * Shared utilities for audio visualizers
 * Extracted from FullscreenVisualizer to reduce code duplication
 */

/**
 * Parse hex color to RGB components
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : { r: 255, g: 69, b: 0 }; // Default orange
}

/**
 * Create rgba string from hex color and alpha
 */
export function rgba(hex: string, alpha: number): string {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Calculate audio metrics from frequency data
 */
export interface AudioMetrics {
    bassAvg: number;
    midAvg: number;
    highAvg: number;
}

export function calculateAudioMetrics(dataArray: Uint8Array, bufferLength: number): AudioMetrics {
    let bassAvg = 0;
    let midAvg = 0;
    let highAvg = 0;

    // Bass: 0-10 bins
    for (let i = 0; i < 10; i++) bassAvg += dataArray[i];
    bassAvg = bassAvg / 10 / 255;

    // Mids: 10-50 bins
    for (let i = 10; i < 50; i++) midAvg += dataArray[i];
    midAvg = midAvg / 40 / 255;

    // Highs: 50+ bins
    for (let i = 50; i < bufferLength; i++) highAvg += dataArray[i];
    highAvg = highAvg / (bufferLength - 50) / 255;

    return { bassAvg, midAvg, highAvg };
}

/**
 * Draw corner decorations on canvas
 */
export function drawCorners(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    color: string
): void {
    const cornerSize = 100;
    ctx.strokeStyle = rgba(color, 0.5);
    ctx.lineWidth = 2;

    // Top left
    ctx.beginPath();
    ctx.moveTo(20, 20 + cornerSize);
    ctx.lineTo(20, 20);
    ctx.lineTo(20 + cornerSize, 20);
    ctx.stroke();

    // Top right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20 - cornerSize, 20);
    ctx.lineTo(canvas.width - 20, 20);
    ctx.lineTo(canvas.width - 20, 20 + cornerSize);
    ctx.stroke();

    // Bottom left
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 20 - cornerSize);
    ctx.lineTo(20, canvas.height - 20);
    ctx.lineTo(20 + cornerSize, canvas.height - 20);
    ctx.stroke();

    // Bottom right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20 - cornerSize, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 20 - cornerSize);
    ctx.stroke();
}

/**
 * Clear canvas with fade effect
 */
export function clearWithFade(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    fadeAlpha: number = 0.15
): void {
    ctx.fillStyle = `rgba(10, 10, 15, ${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw heart shape at position
 */
export function drawHeart(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.fill();
}

/**
 * Common render context passed to all visualizers
 */
export interface VisualizerContext {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    time: number;
    dataArray: Uint8Array;
    metrics: AudioMetrics;
    color: string;
    centerX: number;
    centerY: number;
}

/**
 * Visualizer render function type
 */
export type VisualizerRenderer = (context: VisualizerContext, state?: unknown) => void;

/**
 * Persistent state types for visualizers that need them
 */
export interface MatrixState {
    drops: number[];
}

export interface FallingState {
    particles: Array<{ x: number; y: number; speed: number; size: number }>;
}

export interface HeartsState {
    hearts: Array<{ x: number; y: number; size: number; opacity: number; vy: number }>;
}

export interface CodeState {
    lines: Array<{ y: number; text: string; speed: number }>;
}

export interface IceState {
    particles: Array<{ x: number; y: number; size: number; angle: number; branches: number }>;
}

export interface TraceState {
    points: Array<{ x: number; y: number }>;
}

/**
 * Initialize matrix drops
 */
export function initMatrixDrops(width: number): number[] {
    const drops: number[] = [];
    for (let i = 0; i < Math.ceil(width / 20); i++) {
        drops[i] = Math.random() * 1000; // Start at random positions
    }
    return drops;
}

/**
 * Initialize falling particles
 */
export function initFallingParticles(
    width: number,
    height: number,
    count: number = 100
): FallingState["particles"] {
    const particles: FallingState["particles"] = [];
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 1 + Math.random() * 3,
            size: 2 + Math.random() * 4,
        });
    }
    return particles;
}

/**
 * Initialize code lines for code visualizer
 */
export function initCodeLines(): CodeState["lines"] {
    const codeSnippets = [
        "const self = await rebuild();",
        "if (broken) { fix(me); }",
        "// TODO: be better",
        "export default NewMe;",
        "patch.apply(mistakes);",
        "version = version + 1;",
        "bugs.forEach(learn);",
        "return stronger;",
    ];

    const lines: CodeState["lines"] = [];
    for (let i = 0; i < 15; i++) {
        lines.push({
            y: Math.random() * 1000, // Will be scaled to canvas height
            text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
            speed: 0.5 + Math.random() * 1.5,
        });
    }
    return lines;
}
