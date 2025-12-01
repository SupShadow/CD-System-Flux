/**
 * Spiral Visualizer
 *
 * An audio-reactive spiral that responds to bass frequencies.
 * Demonstrates basic SDK usage with simple state management.
 */

import {
    defineVisualizer,
    rgba,
    polarToCartesian,
    drawGlowCircle,
} from '../visualizer-sdk';

interface SpiralState {
    rotation: number;
    lastBass: number;
}

export const spiralVisualizer = defineVisualizer<SpiralState>({
    id: 'plugin-spiral',
    name: 'Spiral Galaxy',
    author: 'FLUX_SDK',
    description: 'An audio-reactive spiral that pulses with the bass',
    version: '1.0.0',
    tags: ['geometric', 'bass-reactive', 'hypnotic'],
    hasFlashing: false,

    init: () => ({
        rotation: 0,
        lastBass: 0,
    }),

    render: (context, state) => {
        if (!state) return;

        const { ctx, canvas, metrics, color, centerX, centerY, time } = context;
        const { bassAvg, midAvg } = metrics;

        // Smooth bass response
        state.lastBass = state.lastBass + (bassAvg - state.lastBass) * 0.1;

        // Rotate based on audio
        state.rotation += 0.01 + midAvg * 0.05;

        // Clear with fade
        ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw spiral arms
        const arms = 3;
        const points = 100;
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

        for (let arm = 0; arm < arms; arm++) {
            const armOffset = (arm / arms) * Math.PI * 2;

            ctx.beginPath();

            for (let i = 0; i < points; i++) {
                const progress = i / points;
                const angle = progress * Math.PI * 4 + state.rotation + armOffset;
                const baseRadius = progress * maxRadius;
                const audioRadius = baseRadius * (1 + state.lastBass * 0.5);

                const pos = polarToCartesian(centerX, centerY, audioRadius, angle);

                if (i === 0) {
                    ctx.moveTo(pos.x, pos.y);
                } else {
                    ctx.lineTo(pos.x, pos.y);
                }
            }

            const gradient = ctx.createLinearGradient(
                centerX - maxRadius,
                centerY,
                centerX + maxRadius,
                centerY
            );
            gradient.addColorStop(0, rgba(color, 0));
            gradient.addColorStop(0.5, rgba(color, 0.8));
            gradient.addColorStop(1, rgba(color, 0));

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2 + bassAvg * 3;
            ctx.stroke();
        }

        // Center glow
        const centerSize = 20 + state.lastBass * 40;
        drawGlowCircle(ctx, centerX, centerY, centerSize, rgba(color, 0.8), 30);
    },

    onResize: (canvas, state) => state || { rotation: 0, lastBass: 0 },
});
