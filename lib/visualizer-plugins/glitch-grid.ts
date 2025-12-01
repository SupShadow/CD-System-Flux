/**
 * Glitch Grid Visualizer
 *
 * A cyberpunk-style grid with glitch effects triggered by audio peaks.
 * Demonstrates how to create glitch effects and peak detection.
 */

import {
    defineVisualizer,
    rgba,
} from '../visualizer-sdk';

interface GlitchGridState {
    glitchIntensity: number;
    lastPeakTime: number;
    gridOffset: number;
    scanlineY: number;
}

export const glitchGridVisualizer = defineVisualizer<GlitchGridState>({
    id: 'plugin-glitch-grid',
    name: 'Glitch Grid',
    author: 'FLUX_SDK',
    description: 'Cyberpunk grid with audio-triggered glitch effects',
    version: '1.0.0',
    tags: ['cyberpunk', 'glitch', 'grid', 'retro'],
    hasFlashing: true,

    init: () => ({
        glitchIntensity: 0,
        lastPeakTime: 0,
        gridOffset: 0,
        scanlineY: 0,
    }),

    render: (context, state) => {
        if (!state) return;

        const { ctx, canvas, metrics, color, time } = context;
        const { bassAvg, midAvg, highAvg } = metrics;

        // Detect peaks for glitch trigger
        if (bassAvg > 0.7 && time - state.lastPeakTime > 0.3) {
            state.glitchIntensity = 1;
            state.lastPeakTime = time;
        }

        // Decay glitch
        state.glitchIntensity *= 0.95;

        // Update grid offset (scrolling effect)
        state.gridOffset = (state.gridOffset + 2 + bassAvg * 5) % 40;

        // Update scanline
        state.scanlineY = (state.scanlineY + 3) % canvas.height;

        // Clear
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply glitch offset
        const glitchX = state.glitchIntensity * (Math.random() - 0.5) * 20;
        const glitchY = state.glitchIntensity * (Math.random() - 0.5) * 10;

        ctx.save();
        ctx.translate(glitchX, glitchY);

        // Draw perspective grid
        const gridSize = 40;
        const horizon = canvas.height * 0.4;
        const vanishX = canvas.width / 2;

        // Horizontal lines (with perspective)
        ctx.strokeStyle = rgba(color, 0.3 + bassAvg * 0.3);
        ctx.lineWidth = 1;

        for (let y = horizon; y < canvas.height; y += gridSize) {
            const adjustedY = y + state.gridOffset;
            if (adjustedY > canvas.height) continue;

            // Perspective factor
            const perspectiveFactor = (adjustedY - horizon) / (canvas.height - horizon);
            const lineAlpha = 0.2 + perspectiveFactor * 0.5;

            ctx.beginPath();
            ctx.moveTo(0, adjustedY);
            ctx.lineTo(canvas.width, adjustedY);
            ctx.strokeStyle = rgba(color, lineAlpha * (1 + midAvg));
            ctx.stroke();
        }

        // Vertical lines (converging to vanish point)
        const verticalLines = 20;
        for (let i = -verticalLines; i <= verticalLines; i++) {
            const baseX = vanishX + i * (canvas.width / verticalLines);

            ctx.beginPath();
            ctx.moveTo(vanishX, horizon);
            ctx.lineTo(baseX, canvas.height);
            ctx.strokeStyle = rgba(color, 0.3);
            ctx.stroke();
        }

        // Horizon glow
        const horizonGradient = ctx.createLinearGradient(0, horizon - 50, 0, horizon + 50);
        horizonGradient.addColorStop(0, 'transparent');
        horizonGradient.addColorStop(0.5, rgba(color, 0.5 + bassAvg * 0.5));
        horizonGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = horizonGradient;
        ctx.fillRect(0, horizon - 50, canvas.width, 100);

        ctx.restore();

        // Scanline effect
        ctx.fillStyle = rgba(color, 0.05);
        ctx.fillRect(0, state.scanlineY, canvas.width, 2);
        ctx.fillRect(0, state.scanlineY + 4, canvas.width, 1);

        // Glitch bars
        if (state.glitchIntensity > 0.1) {
            const bars = Math.floor(state.glitchIntensity * 5);
            for (let i = 0; i < bars; i++) {
                const barY = Math.random() * canvas.height;
                const barHeight = 2 + Math.random() * 5;
                const barOffset = (Math.random() - 0.5) * 30;

                ctx.save();
                ctx.translate(barOffset, 0);
                ctx.fillStyle = rgba(color, 0.5);
                ctx.fillRect(0, barY, canvas.width, barHeight);
                ctx.restore();
            }
        }

        // RGB split on glitch
        if (state.glitchIntensity > 0.3) {
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            ctx.fillRect(-3, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.fillRect(3, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
        }

        // Title overlay
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = rgba(color, 0.6);
        ctx.textAlign = 'left';
        ctx.fillText('GRID_SYNC: ACTIVE', 20, 30);
        ctx.fillText(`GLITCH_LVL: ${(state.glitchIntensity * 100).toFixed(0)}%`, 20, 50);

        // Corner frame
        const frameSize = 20;
        ctx.strokeStyle = rgba(color, 0.5);
        ctx.lineWidth = 2;

        // Top left
        ctx.beginPath();
        ctx.moveTo(10, 10 + frameSize);
        ctx.lineTo(10, 10);
        ctx.lineTo(10 + frameSize, 10);
        ctx.stroke();

        // Top right
        ctx.beginPath();
        ctx.moveTo(canvas.width - 10 - frameSize, 10);
        ctx.lineTo(canvas.width - 10, 10);
        ctx.lineTo(canvas.width - 10, 10 + frameSize);
        ctx.stroke();

        // Bottom left
        ctx.beginPath();
        ctx.moveTo(10, canvas.height - 10 - frameSize);
        ctx.lineTo(10, canvas.height - 10);
        ctx.lineTo(10 + frameSize, canvas.height - 10);
        ctx.stroke();

        // Bottom right
        ctx.beginPath();
        ctx.moveTo(canvas.width - 10 - frameSize, canvas.height - 10);
        ctx.lineTo(canvas.width - 10, canvas.height - 10);
        ctx.lineTo(canvas.width - 10, canvas.height - 10 - frameSize);
        ctx.stroke();
    },

    onResize: (canvas, state) => state || {
        glitchIntensity: 0,
        lastPeakTime: 0,
        gridOffset: 0,
        scanlineY: 0,
    },
});
