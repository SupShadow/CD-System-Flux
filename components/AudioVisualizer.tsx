"use client";

import { useEffect, useRef } from "react";

export default function AudioVisualizer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        const bars = 64;
        const barWidth = canvas.width / bars;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Simulate frequency data
            for (let i = 0; i < bars; i++) {
                const height = Math.random() * canvas.height * 0.5 + (Math.sin(Date.now() * 0.005 + i * 0.2) * 20);
                const x = i * barWidth;
                const y = canvas.height - Math.max(height, 5); // Ensure at least a small bar is visible

                // Gradient fill
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - height);
                gradient.addColorStop(0, "#FF4500"); // Signal Orange
                gradient.addColorStop(1, "#050505"); // Void

                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth - 2, Math.max(height, 5));
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={100}
            className="w-full h-24 opacity-50 mix-blend-screen"
        />
    );
}
