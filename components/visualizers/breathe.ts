/**
 * Breathe Visualizer - "Breathe No More" (pulsing organic waves)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderBreathe({ ctx, canvas, time, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg, midAvg } = metrics;

    // Breathing pulse from center
    const breathCycle = Math.sin(time * 0.5) * 0.5 + 0.5;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

    // Multiple breathing rings
    for (let ring = 0; ring < 8; ring++) {
        const ringProgress = (ring / 8 + breathCycle * 0.2) % 1;
        const radius = ringProgress * maxRadius + bassAvg * 100;
        const alpha = (1 - ringProgress) * 0.5;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, alpha);
        ctx.lineWidth = 3 + midAvg * 5;
        ctx.stroke();
    }

    // Organic wave distortion
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 2) {
        const angle = (i * Math.PI) / 180;
        const waveOffset = Math.sin(angle * 6 + time * 2) * 30 * midAvg;
        const breathRadius = 100 + breathCycle * 80 + waveOffset + bassAvg * 50;
        const x = centerX + Math.cos(angle) * breathRadius;
        const y = centerY + Math.sin(angle) * breathRadius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100 + bassAvg * 50);
    gradient.addColorStop(0, rgba(color, 0.5 + breathCycle * 0.3));
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fill();
}
