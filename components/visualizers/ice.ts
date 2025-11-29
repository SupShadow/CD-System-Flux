/**
 * Ice Visualizer - "Wenn Ich Friere" (ice crystals)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export interface IceState {
    particles: Array<{ x: number; y: number; size: number; angle: number; branches: number }>;
}

export function renderIce(
    { ctx, canvas, time, metrics, color }: VisualizerContext,
    state: IceState
): void {
    const { bassAvg, highAvg } = metrics;

    // Generate ice crystals
    while (state.particles.length < 15) {
        state.particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 30 + Math.random() * 50,
            angle: Math.random() * Math.PI * 2,
            branches: 6,
        });
    }

    // Draw ice crystals (snowflake pattern)
    state.particles.forEach((crystal) => {
        ctx.save();
        ctx.translate(crystal.x, crystal.y);
        ctx.rotate(crystal.angle + time * 0.1);

        const size = crystal.size + bassAvg * 20;

        // Draw 6-pointed crystal
        for (let b = 0; b < crystal.branches; b++) {
            const branchAngle = (b / crystal.branches) * Math.PI * 2;

            ctx.save();
            ctx.rotate(branchAngle);

            // Main branch
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size, 0);
            ctx.strokeStyle = rgba(color, 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();

            // Sub-branches
            for (let s = 1; s <= 3; s++) {
                const subPos = (s / 4) * size;
                const subSize = size * 0.3 * (1 - s / 4);

                ctx.beginPath();
                ctx.moveTo(subPos, 0);
                ctx.lineTo(subPos + subSize, -subSize);
                ctx.moveTo(subPos, 0);
                ctx.lineTo(subPos + subSize, subSize);
                ctx.strokeStyle = rgba(color, 0.4);
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.restore();
        }

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + highAvg * 20;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.8);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Slowly move crystals
        crystal.y += 0.5;
        crystal.angle += 0.002;

        if (crystal.y > canvas.height + 50) {
            crystal.y = -50;
            crystal.x = Math.random() * canvas.width;
        }
    });

    // Frost border effect
    const frostWidth = 50 + bassAvg * 30;
    const frostGradient = ctx.createLinearGradient(0, 0, frostWidth, 0);
    frostGradient.addColorStop(0, rgba(color, 0.3));
    frostGradient.addColorStop(1, "transparent");

    ctx.fillStyle = frostGradient;
    ctx.fillRect(0, 0, frostWidth, canvas.height);

    const frostGradientRight = ctx.createLinearGradient(canvas.width, 0, canvas.width - frostWidth, 0);
    frostGradientRight.addColorStop(0, rgba(color, 0.3));
    frostGradientRight.addColorStop(1, "transparent");

    ctx.fillStyle = frostGradientRight;
    ctx.fillRect(canvas.width - frostWidth, 0, frostWidth, canvas.height);
}
