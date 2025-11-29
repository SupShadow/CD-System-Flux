/**
 * Trace Visualizer - "Tracing" (line traces)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export interface TraceState {
    points: Array<{ x: number; y: number }>;
}

export function renderTrace(
    { ctx, canvas, time, metrics, color, centerX, centerY }: VisualizerContext,
    state: TraceState
): void {
    const { bassAvg, midAvg } = metrics;

    // Add new trace points based on audio
    const newX = centerX + Math.sin(time * 2) * 200 + Math.cos(time * 3.7) * 100;
    const newY = centerY + Math.cos(time * 2.3) * 150 + Math.sin(time * 4.1) * 80;

    state.points.push({
        x: newX + (Math.random() - 0.5) * bassAvg * 100,
        y: newY + (Math.random() - 0.5) * bassAvg * 100,
    });

    // Limit trace length
    const maxPoints = 200;
    while (state.points.length > maxPoints) {
        state.points.shift();
    }

    // Draw trace line
    if (state.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(state.points[0].x, state.points[0].y);

        for (let i = 1; i < state.points.length; i++) {
            ctx.lineTo(state.points[i].x, state.points[i].y);
        }

        ctx.strokeStyle = rgba(color, 0.8);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // Glow effect on recent points
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 + bassAvg * 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw dots at points
        for (let i = 0; i < state.points.length; i += 10) {
            const alpha = i / state.points.length;
            ctx.beginPath();
            ctx.arc(state.points[i].x, state.points[i].y, 2 + alpha * 3, 0, Math.PI * 2);
            ctx.fillStyle = rgba(color, 0.3 + alpha * 0.5);
            ctx.fill();
        }

        // Current position indicator
        const current = state.points[state.points.length - 1];
        ctx.beginPath();
        ctx.arc(current.x, current.y, 8 + midAvg * 10, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.9);
        ctx.fill();

        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Coordinate display
    if (state.points.length > 0) {
        const current = state.points[state.points.length - 1];
        ctx.font = "12px monospace";
        ctx.fillStyle = rgba(color, 0.5);
        ctx.fillText(`X: ${Math.floor(current.x)} Y: ${Math.floor(current.y)}`, 20, canvas.height - 20);
    }
}
