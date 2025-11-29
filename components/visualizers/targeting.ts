/**
 * Targeting Visualizer - "Clean Shot // Dead Mic" (sniper scope)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderTargeting({ ctx, time, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg, highAvg } = metrics;
    const scopeRadius = 200 + bassAvg * 50;

    // Outer scope ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, scopeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner rings
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, scopeRadius * (i / 4), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Crosshairs
    ctx.strokeStyle = rgba(color, 0.9);
    ctx.lineWidth = 2;

    // Horizontal
    ctx.beginPath();
    ctx.moveTo(centerX - scopeRadius - 50, centerY);
    ctx.lineTo(centerX - 30, centerY);
    ctx.moveTo(centerX + 30, centerY);
    ctx.lineTo(centerX + scopeRadius + 50, centerY);
    ctx.stroke();

    // Vertical
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - scopeRadius - 50);
    ctx.lineTo(centerX, centerY - 30);
    ctx.moveTo(centerX, centerY + 30);
    ctx.lineTo(centerX, centerY + scopeRadius + 50);
    ctx.stroke();

    // Distance markers
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const markerY = centerY + i * 40;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, markerY);
        ctx.lineTo(centerX + 10, markerY);
        ctx.stroke();
    }

    // Target lock animation on bass
    if (bassAvg > 0.4) {
        ctx.strokeStyle = rgba(color, highAvg);
        ctx.lineWidth = 3;
        const lockSize = 40 + Math.sin(time * 10) * 10;
        ctx.strokeRect(centerX - lockSize, centerY - lockSize, lockSize * 2, lockSize * 2);

        // Corner brackets
        const bracketSize = 15;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(centerX - lockSize, centerY - lockSize + bracketSize);
        ctx.lineTo(centerX - lockSize, centerY - lockSize);
        ctx.lineTo(centerX - lockSize + bracketSize, centerY - lockSize);
        // Top-right
        ctx.moveTo(centerX + lockSize - bracketSize, centerY - lockSize);
        ctx.lineTo(centerX + lockSize, centerY - lockSize);
        ctx.lineTo(centerX + lockSize, centerY - lockSize + bracketSize);
        // Bottom-left
        ctx.moveTo(centerX - lockSize, centerY + lockSize - bracketSize);
        ctx.lineTo(centerX - lockSize, centerY + lockSize);
        ctx.lineTo(centerX - lockSize + bracketSize, centerY + lockSize);
        // Bottom-right
        ctx.moveTo(centerX + lockSize - bracketSize, centerY + lockSize);
        ctx.lineTo(centerX + lockSize, centerY + lockSize);
        ctx.lineTo(centerX + lockSize, centerY + lockSize - bracketSize);
        ctx.stroke();
    }

    // Scanning line
    const scanAngle = time * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(scanAngle) * scopeRadius, centerY + Math.sin(scanAngle) * scopeRadius);
    ctx.strokeStyle = rgba(color, 0.3);
    ctx.lineWidth = 2;
    ctx.stroke();
}
