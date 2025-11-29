/**
 * Halo Visualizer - "Heretic to Your Halo" (angelic rings)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderHalo({ ctx, time, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg, midAvg } = metrics;

    // Multiple tilted halos
    const haloCount = 5;

    for (let h = 0; h < haloCount; h++) {
        const baseRadius = 100 + h * 60;
        const radius = baseRadius + bassAvg * 50;
        const tilt = 0.3 + h * 0.1; // Perspective tilt
        const rotation = time * 0.5 + h * 0.5;

        ctx.beginPath();
        for (let i = 0; i <= 360; i += 5) {
            const angle = (i * Math.PI) / 180 + rotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY - 100 + Math.sin(angle) * radius * tilt;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.strokeStyle = rgba(color, 0.6 - h * 0.1);
        ctx.lineWidth = 3 - h * 0.4;
        ctx.stroke();

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 + bassAvg * 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Light rays emanating from center
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + time * 0.2;
        const rayLength = 300 + midAvg * 200;

        const gradient = ctx.createLinearGradient(
            centerX,
            centerY - 100,
            centerX + Math.cos(angle) * rayLength,
            centerY - 100 + Math.sin(angle) * rayLength * 0.3
        );
        gradient.addColorStop(0, rgba(color, 0.5));
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 100);
        ctx.lineTo(
            centerX + Math.cos(angle) * rayLength,
            centerY - 100 + Math.sin(angle) * rayLength * 0.3
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Center glow
    const centerGradient = ctx.createRadialGradient(centerX, centerY - 100, 0, centerX, centerY - 100, 80);
    centerGradient.addColorStop(0, rgba(color, 0.8));
    centerGradient.addColorStop(0.5, rgba(color, 0.3));
    centerGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY - 100, 80, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();
}
