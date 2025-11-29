/**
 * Dissolve Visualizer - "Alles hat ein Ende" (fading particles)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderDissolve({ ctx, time, dataArray, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg } = metrics;
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.1;
        const baseRadius = 150 + Math.sin(time + i * 0.1) * 50;
        const audioBoost = dataArray[i % 128] / 255;
        const radius = baseRadius + audioBoost * 200 + bassAvg * 100;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Particles fade and dissolve outward
        const fadeProgress = (Math.sin(time * 0.5 + i * 0.05) + 1) / 2;
        const alpha = (1 - fadeProgress * 0.7) * (0.3 + audioBoost * 0.7);
        const size = 3 + fadeProgress * 5 + bassAvg * 5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, alpha);
        ctx.fill();

        // Dissolving trails
        if (fadeProgress > 0.5) {
            for (let j = 0; j < 3; j++) {
                const trailX = x + (Math.random() - 0.5) * 30;
                const trailY = y + (Math.random() - 0.5) * 30;
                ctx.beginPath();
                ctx.arc(trailX, trailY, size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = rgba(color, alpha * 0.3);
                ctx.fill();
            }
        }
    }
}
