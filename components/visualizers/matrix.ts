/**
 * Matrix Visualizer - "Glitch in the Matrix" (matrix rain)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export interface MatrixState {
    drops: number[];
}

export function renderMatrix(
    { ctx, canvas, time, metrics, color }: VisualizerContext,
    state: MatrixState
): void {
    const { bassAvg } = metrics;
    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

    ctx.font = `${fontSize}px monospace`;

    // Ensure drops array is properly sized
    while (state.drops.length < columns) {
        state.drops.push(Math.random() * canvas.height / fontSize);
    }

    for (let i = 0; i < columns; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = state.drops[i] * fontSize;

        // Gradient fade effect
        const alpha = 0.8 + bassAvg * 0.2;
        ctx.fillStyle = rgba(color, alpha);
        ctx.fillText(char, x, y);

        // Trail effect
        for (let j = 1; j < 20; j++) {
            const trailY = y - j * fontSize;
            const trailAlpha = (1 - j / 20) * 0.5;
            ctx.fillStyle = rgba(color, trailAlpha);
            const trailChar = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(trailChar, x, trailY);
        }

        // Reset drop when it reaches bottom or randomly
        if (y > canvas.height && Math.random() > 0.975) {
            state.drops[i] = 0;
        }

        // Move drop down, speed affected by bass
        state.drops[i] += 1 + bassAvg * 2;
    }

    // Glitch effect on high bass
    if (bassAvg > 0.6) {
        const glitchY = Math.random() * canvas.height;
        const glitchHeight = 20 + Math.random() * 50;
        ctx.drawImage(
            canvas,
            0,
            glitchY,
            canvas.width,
            glitchHeight,
            (Math.random() - 0.5) * 20,
            glitchY,
            canvas.width,
            glitchHeight
        );
    }
}
