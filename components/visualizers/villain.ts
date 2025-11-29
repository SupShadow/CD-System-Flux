/**
 * Villain Visualizer - "Make Me the Villain" (dark fire)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderVillain({ ctx, canvas, time, dataArray, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg } = metrics;

    // Dark flames rising from bottom
    const flameCount = 50;
    for (let i = 0; i < flameCount; i++) {
        const x = (i / flameCount) * canvas.width;
        const dataIndex = Math.floor((i / flameCount) * 128);
        const value = dataArray[dataIndex] / 255;
        const flameHeight = 100 + value * 300 + bassAvg * 200;

        const gradient = ctx.createLinearGradient(x, canvas.height, x, canvas.height - flameHeight);
        gradient.addColorStop(0, rgba(color, 0.9));
        gradient.addColorStop(0.3, rgba(color, 0.6));
        gradient.addColorStop(0.7, "rgba(50, 0, 0, 0.4)");
        gradient.addColorStop(1, "transparent");

        // Flame path with flickering
        ctx.beginPath();
        ctx.moveTo(x - 15, canvas.height);

        const segments = 10;
        for (let s = 0; s <= segments; s++) {
            const segY = canvas.height - (s / segments) * flameHeight;
            const flicker = Math.sin(time * 10 + i + s) * 15 * (s / segments);
            ctx.lineTo(x + flicker, segY);
        }

        ctx.lineTo(x + 15, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Villain silhouette in center
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";

    // Cape
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 150);
    ctx.quadraticCurveTo(centerX, centerY - 50, centerX + 100, centerY + 150);
    ctx.quadraticCurveTo(centerX, centerY + 100, centerX - 100, centerY + 150);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(centerX, centerY - 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Glowing eyes
    const eyeGlow = 0.5 + bassAvg * 0.5;
    ctx.fillStyle = rgba(color, eyeGlow);
    ctx.beginPath();
    ctx.arc(centerX - 15, centerY - 85, 5, 0, Math.PI * 2);
    ctx.arc(centerX + 15, centerY - 85, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = color;
    ctx.shadowBlur = 20 + bassAvg * 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Evil aura
    for (let i = 0; i < 3; i++) {
        const auraRadius = 200 + i * 50 + bassAvg * 50;
        ctx.beginPath();
        ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.2 - i * 0.05);
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}
