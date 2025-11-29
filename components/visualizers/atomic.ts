/**
 * Atomic Visualizer - "ION CORE" (atomic orbits)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderAtomic({ ctx, time, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg, midAvg } = metrics;

    // Nucleus
    const nucleusSize = 30 + bassAvg * 20;
    const nucleusGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, nucleusSize);
    nucleusGradient.addColorStop(0, rgba(color, 1));
    nucleusGradient.addColorStop(0.5, rgba(color, 0.6));
    nucleusGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusSize, 0, Math.PI * 2);
    ctx.fillStyle = nucleusGradient;
    ctx.fill();

    // Electron orbits
    const orbitCount = 4;
    const electrons = [3, 5, 7, 9];

    for (let o = 0; o < orbitCount; o++) {
        const orbitRadius = 80 + o * 70;
        const tiltX = 1;
        const tiltY = 0.3 + o * 0.15;
        const orbitRotation = time * (0.5 + o * 0.2) + (o * Math.PI) / 4;

        // Draw orbit path
        ctx.beginPath();
        for (let i = 0; i <= 360; i += 5) {
            const angle = (i * Math.PI) / 180;
            const x = centerX + Math.cos(angle + orbitRotation) * orbitRadius * tiltX;
            const y = centerY + Math.sin(angle + orbitRotation) * orbitRadius * tiltY;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(color, 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw electrons
        for (let e = 0; e < electrons[o]; e++) {
            const electronAngle = (e / electrons[o]) * Math.PI * 2 + time * (2 + o * 0.5);
            const ex = centerX + Math.cos(electronAngle + orbitRotation) * orbitRadius * tiltX;
            const ey = centerY + Math.sin(electronAngle + orbitRotation) * orbitRadius * tiltY;

            // Electron glow
            ctx.beginPath();
            ctx.arc(ex, ey, 8 + midAvg * 5, 0, Math.PI * 2);
            ctx.fillStyle = rgba(color, 0.8);
            ctx.fill();

            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Trail
            for (let t = 1; t < 5; t++) {
                const trailAngle = electronAngle - t * 0.1;
                const tx = centerX + Math.cos(trailAngle + orbitRotation) * orbitRadius * tiltX;
                const ty = centerY + Math.sin(trailAngle + orbitRotation) * orbitRadius * tiltY;

                ctx.beginPath();
                ctx.arc(tx, ty, 4 - t * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = rgba(color, 0.3 - t * 0.05);
                ctx.fill();
            }
        }
    }

    // Energy pulses on bass
    if (bassAvg > 0.5) {
        const pulseRadius = 50 + (time % 1) * 200;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.5 - (pulseRadius / 250) * 0.5);
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
