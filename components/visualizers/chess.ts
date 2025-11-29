/**
 * Chess Visualizer - "Mirror Match IQ" (strategic patterns)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export function renderChess({ ctx, canvas, time, dataArray, color }: VisualizerContext): void {
    const boardSize = 8;
    const cellSize = Math.min(canvas.width, canvas.height) / (boardSize + 2);
    const offsetX = (canvas.width - boardSize * cellSize) / 2;
    const offsetY = (canvas.height - boardSize * cellSize) / 2;

    // Draw board
    for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
            const isLight = (x + y) % 2 === 0;
            const dataIndex = (x + y * boardSize) % 128;
            const value = dataArray[dataIndex] / 255;

            const cellX = offsetX + x * cellSize;
            const cellY = offsetY + y * cellSize;

            // Base color
            ctx.fillStyle = isLight ? rgba(color, 0.2 + value * 0.3) : "rgba(20, 20, 25, 0.8)";
            ctx.fillRect(cellX, cellY, cellSize, cellSize);

            // Highlight active squares
            if (value > 0.5) {
                ctx.strokeStyle = rgba(color, value);
                ctx.lineWidth = 2;
                ctx.strokeRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
            }
        }
    }

    // Chess piece silhouettes (simplified)
    const piecePositions = [
        { x: 0, y: 0, type: "rook" },
        { x: 7, y: 0, type: "rook" },
        { x: 4, y: 0, type: "king" },
        { x: 3, y: 0, type: "queen" },
    ];

    ctx.fillStyle = rgba(color, 0.8);
    piecePositions.forEach((piece) => {
        const px = offsetX + piece.x * cellSize + cellSize / 2;
        const py = offsetY + piece.y * cellSize + cellSize / 2;

        // Simple piece shapes
        ctx.beginPath();
        if (piece.type === "king") {
            // Crown shape
            ctx.moveTo(px, py - 20);
            ctx.lineTo(px - 15, py + 15);
            ctx.lineTo(px + 15, py + 15);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(px - 3, py - 30, 6, 15);
        } else if (piece.type === "queen") {
            ctx.arc(px, py - 10, 15, 0, Math.PI * 2);
            ctx.fill();
        } else if (piece.type === "rook") {
            ctx.fillRect(px - 12, py - 15, 24, 30);
            ctx.fillRect(px - 15, py - 20, 8, 10);
            ctx.fillRect(px + 7, py - 20, 8, 10);
        }
    });

    // Move indicator
    const moveX = offsetX + (Math.floor(time) % boardSize) * cellSize;
    const moveY = offsetY + (Math.floor(time * 0.7) % boardSize) * cellSize;
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 3;
    ctx.strokeRect(moveX, moveY, cellSize, cellSize);
}
