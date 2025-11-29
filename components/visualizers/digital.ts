/**
 * Digital Visualizer - "BUNKERBIT" (pixelated blocks)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderDigital({ ctx, canvas, time, dataArray, metrics, color }: VisualizerContext): void {
    const { bassAvg } = metrics;
    const blockSize = 20 + bassAvg * 10;
    const cols = Math.ceil(canvas.width / blockSize);
    const rows = Math.ceil(canvas.height / blockSize);

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const dataIndex = (x + y * cols) % 128;
            const value = dataArray[dataIndex] / 255;

            // Digital noise pattern
            const noise = Math.sin(x * 0.5 + time * 2) * Math.cos(y * 0.5 + time * 1.5);
            const shouldRender = value > 0.2 || (noise > 0.5 && bassAvg > 0.3);

            if (shouldRender) {
                const alpha = value * 0.8 + 0.1;
                ctx.fillStyle = rgba(color, alpha);
                ctx.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2);

                // Glitch offset on bass
                if (bassAvg > 0.5 && Math.random() > 0.9) {
                    ctx.fillStyle = rgba(color, 0.5);
                    ctx.fillRect(
                        x * blockSize + (Math.random() - 0.5) * 20,
                        y * blockSize,
                        blockSize - 2,
                        blockSize - 2
                    );
                }
            }
        }
    }
}
