/**
 * Flash Visualizer - "KILLSWITCH PRESS CONFERENCE" (camera flashes)
 * Note: This visualizer contains flashing effects. Use halo as alternative for accessibility.
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderFlash({ ctx, canvas, time, metrics, color }: VisualizerContext): void {
    const { bassAvg } = metrics;

    // Random camera flashes
    if (bassAvg > 0.4 && Math.random() > 0.7) {
        // Full screen flash
        ctx.fillStyle = rgba(color, 0.3 + Math.random() * 0.3);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Flash point
        const flashX = Math.random() * canvas.width;
        const flashY = Math.random() * canvas.height;

        const flashGradient = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, 200);
        flashGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        flashGradient.addColorStop(0.3, rgba(color, 0.5));
        flashGradient.addColorStop(1, "transparent");

        ctx.fillStyle = flashGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Crowd silhouettes at bottom
    const silhouetteHeight = 150;
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";

    for (let i = 0; i < 30; i++) {
        const x = (i / 30) * canvas.width;
        const headY = canvas.height - silhouetteHeight + Math.sin(i * 2) * 20;
        const headSize = 15 + Math.random() * 10;

        // Head
        ctx.beginPath();
        ctx.arc(x, headY, headSize, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillRect(x - 15, headY + headSize, 30, silhouetteHeight);

        // Phone screens (some holding up phones)
        if (Math.random() > 0.6) {
            const phoneGlow = Math.sin(time * 5 + i) * 0.3 + 0.7;
            ctx.fillStyle = rgba(color, phoneGlow);
            ctx.fillRect(x - 5, headY - 40, 10, 15);
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        }
    }

    // Stage lights
    for (let i = 0; i < 5; i++) {
        const lightX = (i / 4) * canvas.width;
        const gradient = ctx.createLinearGradient(lightX, 0, lightX, canvas.height * 0.6);
        gradient.addColorStop(0, rgba(color, 0.3));
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(lightX, 0);
        ctx.lineTo(lightX - 100, canvas.height * 0.6);
        ctx.lineTo(lightX + 100, canvas.height * 0.6);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}
