/**
 * Grid Visualizer - "Click Shift Repeat" (shifting grid)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderGrid({ ctx, canvas, time, dataArray, metrics, color }: VisualizerContext): void {
    const { bassAvg } = metrics;
    const gridSize = 50;
    const cols = Math.ceil(canvas.width / gridSize) + 1;
    const rows = Math.ceil(canvas.height / gridSize) + 1;

    // Shifting offset
    const shiftX = (time * 30) % gridSize;
    const shiftY = (time * 20) % gridSize;

    ctx.strokeStyle = rgba(color, 0.3 + bassAvg * 0.3);
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i < cols; i++) {
        const x = i * gridSize - shiftX;
        const waveOffset = Math.sin(time * 2 + i * 0.3) * 10 * bassAvg;
        ctx.beginPath();
        ctx.moveTo(x + waveOffset, 0);
        ctx.lineTo(x - waveOffset, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i < rows; i++) {
        const y = i * gridSize - shiftY;
        const waveOffset = Math.cos(time * 2 + i * 0.3) * 10 * bassAvg;
        ctx.beginPath();
        ctx.moveTo(0, y + waveOffset);
        ctx.lineTo(canvas.width, y - waveOffset);
        ctx.stroke();
    }

    // Highlight intersections with audio
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const dataIndex = (x + y * cols) % 128;
            const value = dataArray[dataIndex] / 255;

            if (value > 0.4) {
                const px = x * gridSize - shiftX;
                const py = y * gridSize - shiftY;

                ctx.beginPath();
                ctx.arc(px, py, 3 + value * 5, 0, Math.PI * 2);
                ctx.fillStyle = rgba(color, value);
                ctx.fill();
            }
        }
    }
}
