/**
 * Cinema Visualizer - "Release the Frames" (film strips)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderCinema({ ctx, canvas, time, color, centerX }: VisualizerContext): void {
    // Film strip borders
    const stripHeight = 100;
    const sprocketSize = 15;
    const sprocketSpacing = 30;

    // Top strip
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, stripHeight);
    ctx.fillRect(0, canvas.height - stripHeight, canvas.width, stripHeight);

    // Sprocket holes
    ctx.fillStyle = "rgba(30, 30, 30, 1)";
    for (let x = 0; x < canvas.width; x += sprocketSpacing) {
        const offset = (time * 50) % sprocketSpacing;
        ctx.fillRect(x - offset, 20, sprocketSize, sprocketSize * 1.5);
        ctx.fillRect(x - offset, stripHeight - 35, sprocketSize, sprocketSize * 1.5);
        ctx.fillRect(x - offset, canvas.height - stripHeight + 20, sprocketSize, sprocketSize * 1.5);
        ctx.fillRect(x - offset, canvas.height - 35, sprocketSize, sprocketSize * 1.5);
    }

    // Frame lines
    const frameWidth = 200;
    const frameCount = Math.ceil(canvas.width / frameWidth) + 1;
    const frameOffset = (time * 100) % frameWidth;

    for (let i = 0; i < frameCount; i++) {
        const x = i * frameWidth - frameOffset;
        ctx.strokeStyle = rgba(color, 0.5);
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 10, stripHeight + 10, frameWidth - 20, canvas.height - stripHeight * 2 - 20);

        // Frame number
        ctx.font = "12px monospace";
        ctx.fillStyle = rgba(color, 0.5);
        ctx.fillText(`FR ${String(i + Math.floor(time * 24)).padStart(4, "0")}`, x + 15, stripHeight + 25);
    }

    // Projector light cone
    const centerY = canvas.height / 2;
    const coneGradient = ctx.createRadialGradient(centerX, stripHeight, 0, centerX, centerY + 100, 400);
    coneGradient.addColorStop(0, rgba(color, 0.1));
    coneGradient.addColorStop(0.5, rgba(color, 0.05));
    coneGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.moveTo(centerX - 50, stripHeight);
    ctx.lineTo(centerX - 300, canvas.height - stripHeight);
    ctx.lineTo(centerX + 300, canvas.height - stripHeight);
    ctx.lineTo(centerX + 50, stripHeight);
    ctx.closePath();
    ctx.fillStyle = coneGradient;
    ctx.fill();

    // Film grain
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = stripHeight + Math.random() * (canvas.height - stripHeight * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
        ctx.fillRect(x, y, 1, 1);
    }
}
