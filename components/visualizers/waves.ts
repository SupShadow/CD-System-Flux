/**
 * Waves Visualizer - "Tidal Weight" (ocean waves)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderWaves({ ctx, canvas, time, dataArray, metrics, color }: VisualizerContext): void {
    const { bassAvg } = metrics;
    const waveCount = 5;
    const baseY = canvas.height * 0.6;

    for (let w = 0; w < waveCount; w++) {
        const waveY = baseY + w * 40;
        const amplitude = 30 + w * 10 + bassAvg * 50;
        const frequency = 0.02 - w * 0.003;
        const speed = time * (1 + w * 0.2);

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
            const dataIndex = Math.floor((x / canvas.width) * 128);
            const audioOffset = (dataArray[dataIndex] / 255) * 20;
            const y = waveY + Math.sin(x * frequency + speed) * amplitude + audioOffset;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, waveY - amplitude, 0, canvas.height);
        gradient.addColorStop(0, rgba(color, 0.4 - w * 0.07));
        gradient.addColorStop(1, rgba(color, 0.1));

        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Foam/spray on high bass
    if (bassAvg > 0.6) {
        for (let i = 0; i < 30; i++) {
            const sprayX = Math.random() * canvas.width;
            const sprayY = baseY - Math.random() * 100;
            ctx.beginPath();
            ctx.arc(sprayX, sprayY, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fillStyle = rgba(color, 0.5 + Math.random() * 0.3);
            ctx.fill();
        }
    }

    // Underwater depth gradient
    const depthGradient = ctx.createLinearGradient(0, baseY, 0, canvas.height);
    depthGradient.addColorStop(0, "transparent");
    depthGradient.addColorStop(1, "rgba(0, 0, 20, 0.5)");
    ctx.fillStyle = depthGradient;
    ctx.fillRect(0, baseY, canvas.width, canvas.height - baseY);
}
