/**
 * Game Over Visualizer - "No Continue" (game over screen)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderGameover({ ctx, canvas, time, metrics, color, centerX, centerY }: VisualizerContext): void {
    const { bassAvg } = metrics;

    // Retro game over text
    ctx.font = "bold 72px monospace";
    ctx.fillStyle = rgba(color, 0.8 + Math.sin(time * 5) * 0.2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Glitchy text effect
    const glitchOffset = bassAvg > 0.5 ? (Math.random() - 0.5) * 10 : 0;
    ctx.fillText("GAME OVER", centerX + glitchOffset, centerY - 50);

    // Continue countdown
    ctx.font = "24px monospace";
    const continueTime = 9 - (Math.floor(time) % 10);
    ctx.fillStyle = rgba(color, 0.6);
    ctx.fillText(`CONTINUE? ${continueTime}`, centerX, centerY + 30);

    // Insert coin text
    ctx.font = "18px monospace";
    ctx.fillStyle = rgba(color, 0.3 + Math.sin(time * 3) * 0.2);
    ctx.fillText("INSERT COIN", centerX, centerY + 80);

    // Falling "NO" text
    for (let i = 0; i < 10; i++) {
        const x = (i * 137) % canvas.width;
        const y = ((time * 100 + i * 100) % canvas.height);
        ctx.font = "16px monospace";
        ctx.fillStyle = rgba(color, 0.2);
        ctx.fillText("NO", x, y);
    }

    // Static noise
    if (bassAvg > 0.3) {
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // Border flicker
    ctx.strokeStyle = rgba(color, 0.5 + Math.sin(time * 8) * 0.3);
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
}
