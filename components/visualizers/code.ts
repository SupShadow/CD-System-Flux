/**
 * Code Visualizer - "Patch Notes: Me" (scrolling changelog)
 */
import { VisualizerContext, rgba } from "@/lib/visualizer-utils";

export interface CodeState {
    lines: Array<{ y: number; text: string; speed: number }>;
}

export function renderCode(
    { ctx, canvas, time, metrics, color }: VisualizerContext,
    state: CodeState
): void {
    const { bassAvg } = metrics;

    ctx.font = "14px monospace";

    // Update and draw code lines
    state.lines.forEach((line, index) => {
        line.y -= line.speed + bassAvg * 2;

        // Reset when off screen
        if (line.y < -20) {
            line.y = canvas.height + 20;
        }

        // Line number
        ctx.fillStyle = rgba(color, 0.3);
        const lineNum = String(Math.floor(time * 10 + index) % 1000).padStart(3, "0");
        ctx.fillText(lineNum, 30, line.y);

        // Code text
        ctx.fillStyle = rgba(color, 0.7 + bassAvg * 0.3);
        ctx.fillText(line.text, 80, line.y);

        // Cursor on current line
        if (index === Math.floor(time) % state.lines.length) {
            const cursorVisible = Math.sin(time * 5) > 0;
            if (cursorVisible) {
                ctx.fillStyle = rgba(color, 0.8);
                ctx.fillRect(80 + line.text.length * 8.4, line.y - 12, 8, 14);
            }
        }
    });

    // Header
    ctx.fillStyle = rgba(color, 0.5);
    ctx.font = "bold 16px monospace";
    ctx.fillText("// PATCH_NOTES_v" + (1 + Math.floor(time / 10)).toFixed(1), 30, 40);
    ctx.fillText("// CHANGELOG: self.js", 30, 60);

    // Syntax highlighting simulation
    ctx.fillStyle = "rgba(100, 200, 100, 0.3)";
    ctx.fillRect(0, 0, 20, canvas.height);
}
