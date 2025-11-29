/**
 * Voices Visualizer - "Voices Are a Loaded Room" (sound waves)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderVoices({ ctx, canvas, time, dataArray, metrics, color }: VisualizerContext): void {
    const { bassAvg } = metrics;

    // Multiple voice waveforms
    const voiceCount = 5;
    const waveHeight = 100;

    for (let v = 0; v < voiceCount; v++) {
        const voiceY = (canvas.height / (voiceCount + 1)) * (v + 1);
        const phase = v * 0.5;

        ctx.beginPath();
        ctx.moveTo(0, voiceY);

        for (let x = 0; x < canvas.width; x += 2) {
            const dataIndex = Math.floor((x / canvas.width) * 64) + v * 10;
            const value = dataArray[dataIndex % 128] / 255;
            const wave = Math.sin(x * 0.02 + time * 3 + phase) * waveHeight * value;

            ctx.lineTo(x, voiceY + wave);
        }

        ctx.strokeStyle = rgba(color, 0.5 - v * 0.08);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Voice label
        ctx.font = "10px monospace";
        ctx.fillStyle = rgba(color, 0.3);
        ctx.fillText(`VOICE_${v + 1}`, 10, voiceY - waveHeight - 10);
    }

    // Room reverb visualization (expanding rectangles)
    const roomDepth = 5;
    for (let i = 0; i < roomDepth; i++) {
        const padding = 30 + i * 30 + bassAvg * 20;
        ctx.strokeStyle = rgba(color, 0.2 - i * 0.03);
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, padding, canvas.width - padding * 2, canvas.height - padding * 2);
    }

    // Echo text effect
    ctx.font = "bold 24px sans-serif";
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = rgba(color, 0.5 - i * 0.1);
        ctx.fillText("voices...", 50 + i * 5, canvas.height - 50 + i * 2);
    }
}
