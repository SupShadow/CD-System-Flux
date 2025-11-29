/**
 * Skyline Visualizer - "Higher Than the Skyline" (city bars)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderSkyline({ ctx, canvas, time, dataArray, metrics, color }: VisualizerContext): void {
    const { bassAvg } = metrics;
    const buildingCount = 40;
    const buildingWidth = canvas.width / buildingCount;
    const baseY = canvas.height * 0.8;

    for (let i = 0; i < buildingCount; i++) {
        const dataIndex = Math.floor((i / buildingCount) * 128);
        const value = dataArray[dataIndex] / 255;
        const height = 100 + value * (canvas.height * 0.5);

        const x = i * buildingWidth;
        const y = baseY - height;

        // Building shape
        ctx.fillStyle = rgba(color, 0.3 + value * 0.5);
        ctx.fillRect(x + 2, y, buildingWidth - 4, height);

        // Windows
        const windowRows = Math.floor(height / 20);
        const windowCols = 3;
        const windowWidth = (buildingWidth - 8) / windowCols;
        const windowHeight = 10;

        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const lit = Math.random() > 0.3 || value > 0.5;
                if (lit) {
                    ctx.fillStyle = rgba(color, 0.8 + Math.random() * 0.2);
                    ctx.fillRect(x + 4 + col * windowWidth, y + 10 + row * 20, windowWidth - 2, windowHeight);
                }
            }
        }
    }

    // Horizon glow
    const horizonGradient = ctx.createLinearGradient(0, baseY - 50, 0, baseY + 50);
    horizonGradient.addColorStop(0, "transparent");
    horizonGradient.addColorStop(0.5, rgba(color, 0.3 + bassAvg * 0.3));
    horizonGradient.addColorStop(1, "transparent");
    ctx.fillStyle = horizonGradient;
    ctx.fillRect(0, baseY - 50, canvas.width, 100);

    // Stars
    for (let i = 0; i < 50; i++) {
        const starX = ((Math.sin(i * 100) + 1) / 2) * canvas.width;
        const starY = ((Math.cos(i * 100) + 1) / 2) * (baseY - 150);
        const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;

        ctx.beginPath();
        ctx.arc(starX, starY, 1 + twinkle, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.3 + twinkle * 0.5);
        ctx.fill();
    }
}
