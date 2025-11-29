/**
 * Speed Visualizer - "Runaway" (motion blur trails)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderSpeed({ ctx, time, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg, midAvg } = metrics;

    // Speed lines radiating from center
    const lineCount = 100;

    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const startRadius = 50 + Math.random() * 50;
        const endRadius = 300 + Math.random() * 300 + bassAvg * 200;
        const speed = time * (5 + Math.random() * 5);

        const lineStart = startRadius + (speed % (endRadius - startRadius));
        const lineEnd = lineStart + 50 + midAvg * 100;

        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * lineStart, centerY + Math.sin(angle) * lineStart);
        ctx.lineTo(centerX + Math.cos(angle) * lineEnd, centerY + Math.sin(angle) * lineEnd);

        const gradient = ctx.createLinearGradient(
            centerX + Math.cos(angle) * lineStart,
            centerY + Math.sin(angle) * lineStart,
            centerX + Math.cos(angle) * lineEnd,
            centerY + Math.sin(angle) * lineEnd
        );
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, rgba(color, 0.5 + bassAvg * 0.3));
        gradient.addColorStop(1, "transparent");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.stroke();
    }

    // Central blur effect
    const blurGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
    blurGradient.addColorStop(0, rgba(color, 0.5));
    blurGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY, 100 + bassAvg * 50, 0, Math.PI * 2);
    ctx.fillStyle = blurGradient;
    ctx.fill();

    // Motion blur text
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = rgba(color, 0.3);
    for (let i = 0; i < 5; i++) {
        ctx.fillText("RUN", centerX - 60 - i * 10, centerY + 150 - i * 2);
    }
    ctx.fillStyle = rgba(color, 0.8);
    ctx.fillText("RUN", centerX - 60, centerY + 150);
}
