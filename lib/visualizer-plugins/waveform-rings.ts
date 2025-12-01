/**
 * Waveform Rings Visualizer
 *
 * Concentric rings that display audio waveform data.
 * Demonstrates frequency band separation and ring-based visualization.
 */

import {
    defineVisualizer,
    rgba,
    polarToCartesian,
} from '../visualizer-sdk';

interface WaveformRingsState {
    rotation: number;
}

export const waveformRingsVisualizer = defineVisualizer<WaveformRingsState>({
    id: 'plugin-waveform-rings',
    name: 'Waveform Rings',
    author: 'FLUX_SDK',
    description: 'Concentric rings displaying different frequency bands',
    version: '1.0.0',
    tags: ['waveform', 'rings', 'frequency'],
    hasFlashing: false,

    init: () => ({ rotation: 0 }),

    render: (context, state) => {
        if (!state) return;

        const { ctx, canvas, metrics, color, dataArray, centerX, centerY } = context;
        const { bassAvg, midAvg, highAvg } = metrics;

        // Slow rotation
        state.rotation += 0.002;

        // Clear with fade
        ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
        const rings = 5;

        // Draw each ring with different frequency data
        for (let ring = 0; ring < rings; ring++) {
            const ringProgress = ring / rings;
            const baseRadius = 50 + ringProgress * maxRadius;
            const points = 64;

            // Get frequency range for this ring
            const startFreq = Math.floor(ring * 25);
            const endFreq = startFreq + 25;

            ctx.beginPath();

            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2 + state.rotation * (ring + 1);

                // Sample frequency for this point
                const freqIndex = startFreq + Math.floor((i / points) * (endFreq - startFreq));
                const freqValue = dataArray[freqIndex] / 255;

                // Calculate radius with audio modulation
                const audioOffset = freqValue * 30 * (1 + ring * 0.3);
                const radius = baseRadius + audioOffset;

                const pos = polarToCartesian(centerX, centerY, radius, angle);

                if (i === 0) {
                    ctx.moveTo(pos.x, pos.y);
                } else {
                    ctx.lineTo(pos.x, pos.y);
                }
            }

            ctx.closePath();

            // Color gradient based on ring position
            const alpha = 0.6 - ringProgress * 0.3;
            ctx.strokeStyle = rgba(color, alpha);
            ctx.lineWidth = 2 - ringProgress;
            ctx.stroke();

            // Fill with subtle gradient
            if (ring === 0) {
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, baseRadius
                );
                gradient.addColorStop(0, rgba(color, 0.2));
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        // Center display
        const centerRadius = 40 + bassAvg * 20;
        const centerGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, centerRadius
        );
        centerGradient.addColorStop(0, rgba(color, 0.9));
        centerGradient.addColorStop(0.5, rgba(color, 0.5));
        centerGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
        ctx.fillStyle = centerGradient;
        ctx.fill();

        // Frequency labels (subtle)
        ctx.font = '10px monospace';
        ctx.fillStyle = rgba(color, 0.3);
        ctx.textAlign = 'center';

        const labels = ['BASS', 'LOW', 'MID', 'HIGH', 'ULTRA'];
        labels.forEach((label, i) => {
            const labelRadius = 50 + (i / rings) * maxRadius + 15;
            const labelAngle = -Math.PI / 2 + state.rotation * (i + 1);
            const pos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);
            ctx.fillText(label, pos.x, pos.y);
        });
    },

    onResize: (canvas, state) => state || { rotation: 0 },
});
