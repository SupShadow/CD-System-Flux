/**
 * Hearts Visualizer - "Likes and Lies" (social media hearts)
 */
import { VisualizerContext, rgba, drawHeart } from "@/lib/visualizer-utils";

export interface HeartsState {
    hearts: Array<{ x: number; y: number; size: number; opacity: number; vy: number }>;
}

export function renderHearts(
    { ctx, canvas, time, metrics, color }: VisualizerContext,
    state: HeartsState
): void {
    const { bassAvg } = metrics;

    // Spawn new hearts on bass
    if (bassAvg > 0.3 && state.hearts.length < 50) {
        state.hearts.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 50,
            size: 20 + Math.random() * 30,
            opacity: 0.8 + Math.random() * 0.2,
            vy: 2 + Math.random() * 3 + bassAvg * 3,
        });
    }

    // Update and draw hearts
    for (let i = state.hearts.length - 1; i >= 0; i--) {
        const heart = state.hearts[i];
        heart.y -= heart.vy;
        heart.opacity -= 0.005;

        // Remove faded hearts
        if (heart.opacity <= 0 || heart.y < -50) {
            state.hearts.splice(i, 1);
            continue;
        }

        // Draw heart shape
        drawHeart(ctx, heart.x, heart.y, heart.size, rgba(color, heart.opacity));

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        drawHeart(ctx, heart.x, heart.y, heart.size, rgba(color, heart.opacity * 0.5));
        ctx.shadowBlur = 0;
    }

    // "Like" counter
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = rgba(color, 0.8);
    ctx.textAlign = "center";
    const likeCount = Math.floor(time * 100 + bassAvg * 1000);
    ctx.fillText(`♥ ${likeCount.toLocaleString()}`, canvas.width / 2, canvas.height / 2);

    // Fake/glitchy numbers
    if (bassAvg > 0.5) {
        ctx.fillStyle = rgba(color, 0.3);
        const fakeCount = Math.floor(Math.random() * 999999);
        ctx.fillText(
            `♥ ${fakeCount.toLocaleString()}`,
            canvas.width / 2 + (Math.random() - 0.5) * 10,
            canvas.height / 2 + (Math.random() - 0.5) * 10
        );
    }
}
