"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useAudio } from "@/contexts/AudioContext";

interface NeuralVisualizerProps {
    height?: number;
    className?: string;
}

export default function NeuralVisualizer({
    height = 60,
    className = "",
}: NeuralVisualizerProps) {
    const { analyserRef, isPlaying, currentTrack } = useAudio();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({ width: 300, height });
    const [mounted, setMounted] = useState(false);

    // Persistent state for smooth animations
    const timeRef = useRef(0);
    const smoothValuesRef = useRef<number[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle responsive resizing
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: w } = entry.contentRect;
                if (w > 0) {
                    setDimensions({ width: w, height });
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [height]);

    // Parse hex color to RGB
    const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : { r: 255, g: 69, b: 0 };
    }, []);

    // Main render function
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const analyser = analyserRef.current;
        const color = currentTrack?.color || "#FF4500";
        const { r, g, b } = hexToRgb(color);
        const w = canvas.width;
        const h = canvas.height;

        // Increment time
        timeRef.current += 0.016;
        const time = timeRef.current;

        // Clear canvas
        ctx.fillStyle = "rgba(10, 10, 15, 1)";
        ctx.fillRect(0, 0, w, h);

        // Configuration
        const dotCount = 16;
        const dotSpacing = w / (dotCount + 1);
        const centerY = h / 2;
        const maxDotSize = Math.min(h / 4, 8);
        const minDotSize = 2;

        // Initialize smooth values if needed
        if (smoothValuesRef.current.length !== dotCount) {
            smoothValuesRef.current = new Array(dotCount).fill(0.2);
        }

        // Get audio data
        let dataArray = new Uint8Array(128);
        if (analyser && isPlaying) {
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
        }

        // Draw dots
        for (let i = 0; i < dotCount; i++) {
            const x = dotSpacing * (i + 1);

            // Get frequency value for this dot
            let targetValue: number;
            if (analyser && isPlaying) {
                const dataIndex = Math.floor((i / dotCount) * (dataArray.length / 2));
                targetValue = dataArray[dataIndex] / 255;
            } else {
                // Idle animation - gentle wave
                targetValue = 0.15 + Math.sin(time * 2 + i * 0.4) * 0.1;
            }

            // Smooth the value
            const smoothing = 0.15;
            smoothValuesRef.current[i] = smoothValuesRef.current[i] * (1 - smoothing) + targetValue * smoothing;
            const value = smoothValuesRef.current[i];

            // Calculate dot properties
            const dotSize = minDotSize + value * (maxDotSize - minDotSize);
            const alpha = 0.3 + value * 0.7;

            // Draw glow
            const glowSize = dotSize * (1.5 + value);
            const gradient = ctx.createRadialGradient(x, centerY, 0, x, centerY, glowSize);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctx.beginPath();
            ctx.arc(x, centerY, glowSize, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw main dot
            ctx.beginPath();
            ctx.arc(x, centerY, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fill();

            // Draw bright center
            ctx.beginPath();
            ctx.arc(x, centerY, dotSize * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.fill();
        }

        // Draw connecting line (subtle)
        ctx.beginPath();
        ctx.moveTo(dotSpacing, centerY);
        for (let i = 0; i < dotCount; i++) {
            const x = dotSpacing * (i + 1);
            const value = smoothValuesRef.current[i];
            const y = centerY + (value - 0.3) * h * 0.3;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Status text
        ctx.font = "8px monospace";
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
        ctx.textAlign = "left";
        ctx.fillText(isPlaying ? "SIGNAL_ACTIVE" : "SIGNAL_IDLE", 4, 10);

        // Continue animation
        animationRef.current = requestAnimationFrame(render);
    }, [analyserRef, isPlaying, currentTrack, hexToRgb]);

    // Start/stop animation
    useEffect(() => {
        if (!mounted) return;

        render();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [mounted, render]);

    // Reset animation when track changes
    useEffect(() => {
        timeRef.current = 0;
        smoothValuesRef.current = [];
    }, [currentTrack]);

    if (!mounted) return null;

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            role="img"
            aria-label={`Audio visualization${isPlaying ? ", signal active" : ", signal idle"}`}
        >
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full rounded"
                style={{ height: `${height}px`, background: "rgba(10, 10, 15, 1)" }}
                aria-hidden="true"
            />
        </div>
    );
}
