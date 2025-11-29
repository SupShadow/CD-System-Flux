/**
 * Enigma Visualizer - "Neon Enigma" (mysterious shapes)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderEnigma({ ctx, time, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg, midAvg } = metrics;

    // Rotating mysterious geometric shapes
    const shapeCount = 5;

    for (let s = 0; s < shapeCount; s++) {
        const rotation = time * (0.3 + s * 0.1) + (s * Math.PI) / 3;
        const size = 80 + s * 40 + bassAvg * 30;
        const sides = 3 + s; // Triangle, square, pentagon, etc.

        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + rotation;
            const x = centerX + Math.cos(angle) * size;
            const y = centerY + Math.sin(angle) * size;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(color, 0.6 - s * 0.1);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Neon glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 + bassAvg * 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Question mark in center (the enigma)
    ctx.font = `bold ${100 + bassAvg * 50}px serif`;
    ctx.fillStyle = rgba(color, 0.3 + midAvg * 0.5);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", centerX, centerY);

    // Mysterious particles orbiting
    for (let i = 0; i < 20; i++) {
        const orbitRadius = 200 + Math.sin(i * 0.5) * 100;
        const angle = time * 0.5 + (i / 20) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;

        ctx.beginPath();
        ctx.arc(x, y, 3 + midAvg * 3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.5 + Math.sin(time + i) * 0.3);
        ctx.fill();
    }
}
