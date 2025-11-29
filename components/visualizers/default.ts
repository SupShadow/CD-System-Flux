/**
 * Default Visualizer - Fallback circular waveform
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderDefault({ ctx, dataArray, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg } = metrics;

    // Circular waveform
    const radius = 150 + bassAvg * 50;
    const points = 64;

    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
        const dataIndex = Math.floor((i / points) * 128);
        const value = dataArray[dataIndex] / 255;
        const waveRadius = radius + value * 100;

        const x = centerX + Math.cos(angle) * waveRadius;
        const y = centerY + Math.sin(angle) * waveRadius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center pulse
    const pulseSize = 50 + bassAvg * 30;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
    gradient.addColorStop(0, rgba(color, 0.8));
    gradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}
