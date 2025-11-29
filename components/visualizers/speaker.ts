/**
 * Speaker Visualizer - "Turn Me Louder" (speaker cones)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderSpeaker({ ctx, time, dataArray, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg } = metrics;

    // Main speaker cone
    const coneRadius = 200 + bassAvg * 100;

    // Outer rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, coneRadius + 30, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 10;
    ctx.stroke();

    // Cone rings (concentric circles)
    for (let i = 0; i < 8; i++) {
        const ringRadius = (coneRadius / 8) * (i + 1);

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.3 + (i / 8) * 0.4);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Center dust cap
    const dustCapRadius = 40 + bassAvg * 30;
    const dustCapGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, dustCapRadius);
    dustCapGradient.addColorStop(0, rgba(color, 0.9));
    dustCapGradient.addColorStop(0.7, rgba(color, 0.5));
    dustCapGradient.addColorStop(1, rgba(color, 0.2));

    ctx.beginPath();
    ctx.arc(centerX, centerY, dustCapRadius, 0, Math.PI * 2);
    ctx.fillStyle = dustCapGradient;
    ctx.fill();

    // Sound waves emanating
    for (let i = 0; i < 5; i++) {
        const waveRadius = coneRadius + 50 + i * 60 + (time * 100) % 60;
        const alpha = Math.max(0, 0.4 - (waveRadius - coneRadius) / 400);

        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, alpha);
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Volume meter bars
    const meterWidth = 300;
    const meterX = centerX - meterWidth / 2;
    const meterY = centerY + coneRadius + 80;
    const barCount = 20;

    for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArray[i * 6] / 255) * 50 + 5;
        const barX = meterX + (i / barCount) * meterWidth;
        const barWidth = meterWidth / barCount - 2;

        ctx.fillStyle = rgba(color, 0.5 + (i / barCount) * 0.5);
        ctx.fillRect(barX, meterY - barHeight, barWidth, barHeight);
    }

    // dB label
    ctx.font = "14px monospace";
    ctx.fillStyle = rgba(color, 0.5);
    ctx.fillText(`${Math.floor(bassAvg * 100)}dB`, meterX + meterWidth + 10, meterY);
}
