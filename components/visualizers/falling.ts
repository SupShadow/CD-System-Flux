/**
 * Falling Visualizer - "Still Falling" (gravity particles)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export interface FallingState {
    particles: Array<{ x: number; y: number; speed: number; size: number }>;
}

export function renderFalling(
    { ctx, canvas, metrics, color }: VisualizerContext,
    state: FallingState
): void {
    const { bassAvg } = metrics;

    state.particles.forEach((p) => {
        // Gravity effect
        p.y += p.speed + bassAvg * 5;
        p.speed += 0.1; // Acceleration

        // Reset when off screen
        if (p.y > canvas.height + 50) {
            p.y = -50;
            p.x = Math.random() * canvas.width;
            p.speed = 1 + Math.random() * 3;
        }

        // Draw particle with trail
        const trailLength = p.speed * 5;
        const gradient = ctx.createLinearGradient(p.x, p.y - trailLength, p.x, p.y);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, rgba(color, 0.8));

        ctx.beginPath();
        ctx.moveTo(p.x, p.y - trailLength);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.stroke();

        // Particle head
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.9);
        ctx.fill();
    });

    // Ground impact ripples
    if (bassAvg > 0.5) {
        const rippleX = Math.random() * canvas.width;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(rippleX, canvas.height - 20, 20 + i * 20, Math.PI, 0);
            ctx.strokeStyle = rgba(color, 0.3 - i * 0.1);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}
