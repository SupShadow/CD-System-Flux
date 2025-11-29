/**
 * Mirror Visualizer - "Double Life" (mirrored visualization)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderMirror({ ctx, canvas, dataArray, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg } = metrics;

    // Draw on one side, mirror to other
    const barCount = 64;
    const barWidth = canvas.width / 2 / barCount;

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * 2] / 255;
        const barHeight = value * canvas.height * 0.4;

        // Right side (original)
        const gradient1 = ctx.createLinearGradient(0, centerY, 0, centerY - barHeight);
        gradient1.addColorStop(0, rgba(color, 0.3));
        gradient1.addColorStop(1, rgba(color, 0.8 + value * 0.2));

        ctx.fillStyle = gradient1;
        ctx.fillRect(centerX + i * barWidth, centerY - barHeight, barWidth - 1, barHeight);
        ctx.fillRect(centerX + i * barWidth, centerY, barWidth - 1, barHeight);

        // Left side (mirrored)
        ctx.fillRect(centerX - (i + 1) * barWidth, centerY - barHeight, barWidth - 1, barHeight);
        ctx.fillRect(centerX - (i + 1) * barWidth, centerY, barWidth - 1, barHeight);
    }

    // Center dividing line with glow
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Mirror reflection effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 + bassAvg * 30;
    ctx.stroke();
    ctx.shadowBlur = 0;
}
