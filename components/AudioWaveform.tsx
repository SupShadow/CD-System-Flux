"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";
import { cn } from "@/lib/utils";

type WaveformStyle = "bars" | "wave" | "circular" | "mirror" | "dots";

interface AudioWaveformProps {
    style?: WaveformStyle;
    width?: number;
    height?: number;
    barCount?: number;
    color?: string;
    backgroundColor?: string;
    className?: string;
    responsive?: boolean;
    showLabel?: boolean;
}

export default function AudioWaveform({
    style = "bars",
    width = 300,
    height = 60,
    barCount = 64,
    color = "#FF4500",
    backgroundColor = "transparent",
    className = "",
    responsive = true,
    showLabel = false,
}: AudioWaveformProps) {
    const { analyserRef, isPlaying } = useAudio();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width, height });

    // Pre-allocate data array to avoid GC pressure at 60fps
    const dataArrayRef = useRef<Uint8Array | null>(null);

    // Handle responsive resizing
    useEffect(() => {
        if (!responsive || !containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: w } = entry.contentRect;
                setDimensions({ width: w, height });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [responsive, height]);

    // Render waveform
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrame: number;

        const render = () => {
            const analyser = analyserRef.current;

            // Clear canvas
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (!analyser || !isPlaying) {
                // Idle state visualization
                renderIdleState(ctx, canvas.width, canvas.height, color, style);
                animationFrame = requestAnimationFrame(render);
                return;
            }

            // Reuse pre-allocated array to avoid GC pressure at 60fps
            const bufferLength = analyser.frequencyBinCount;
            if (!dataArrayRef.current || dataArrayRef.current.length !== bufferLength) {
                dataArrayRef.current = new Uint8Array(bufferLength);
            }
            const dataArray = dataArrayRef.current;
            analyser.getByteFrequencyData(dataArray);

            switch (style) {
                case "bars":
                    renderBars(ctx, dataArray, canvas.width, canvas.height, barCount, color);
                    break;
                case "wave":
                    renderWave(ctx, dataArray, canvas.width, canvas.height, color);
                    break;
                case "circular":
                    renderCircular(ctx, dataArray, canvas.width, canvas.height, color);
                    break;
                case "mirror":
                    renderMirror(ctx, dataArray, canvas.width, canvas.height, barCount, color);
                    break;
                case "dots":
                    renderDots(ctx, dataArray, canvas.width, canvas.height, barCount, color);
                    break;
            }

            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [analyserRef, isPlaying, style, barCount, color, backgroundColor, dimensions]);

    const styleLabels: Record<WaveformStyle, string> = {
        bars: "frequency spectrum",
        wave: "waveform",
        circular: "radial audio visualization",
        mirror: "stereo field visualization",
        dots: "particle audio visualization"
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative", className)}
            role="img"
            aria-label={`Audio visualization: ${styleLabels[style]}${isPlaying ? ", audio is playing" : ", audio is idle"}`}
        >
            {showLabel && (
                <div className="absolute -top-4 left-0 font-mono text-[8px] text-stark/40 uppercase" aria-hidden="true">
                    {style === "bars" && "FREQ_ANALYSIS"}
                    {style === "wave" && "WAVEFORM"}
                    {style === "circular" && "RADIAL_SCAN"}
                    {style === "mirror" && "STEREO_FIELD"}
                    {style === "dots" && "PARTICLE_FLOW"}
                </div>
            )}
            <motion.canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full"
                style={{ height: `${height}px` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                aria-hidden="true"
            />
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-stark/30">AUDIO_IDLE</span>
                </div>
            )}
        </div>
    );
}

// Idle state animation
function renderIdleState(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string,
    style: WaveformStyle
) {
    const time = Date.now() / 1000;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.2;

    if (style === "circular") {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing effect
        const pulseRadius = radius + Math.sin(time * 2) * 5;
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Subtle horizontal line with pulse
        const y = height / 2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);

        for (let x = 0; x < width; x++) {
            const wave = Math.sin(x * 0.02 + time * 2) * 2;
            ctx.lineTo(x, y + wave);
        }

        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

// Bar visualization
function renderBars(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    barCount: number,
    color: string
) {
    const barWidth = width / barCount;
    const step = Math.floor(dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const barHeight = Math.max(percent * height * 0.9, 2);
        const y = height - barHeight;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}40`);

        ctx.fillStyle = gradient;
        ctx.fillRect(
            i * barWidth + 1,
            y,
            barWidth - 2,
            barHeight
        );

        // Glow effect for active bars
        if (percent > 0.5) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fillRect(i * barWidth + 1, y, barWidth - 2, 2);
            ctx.shadowBlur = 0;
        }
    }
}

// Wave visualization
function renderWave(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string
) {
    const centerY = height / 2;

    // Main wave
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] / 255;
        const y = centerY + (value - 0.5) * height * 0.8;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(width, centerY);

    // Fill gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(0.5, `${color}20`);
    gradient.addColorStop(1, `${color}40`);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
}

// Circular visualization
function renderCircular(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string
) {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 4;
    const segments = 64;
    const step = Math.floor(dataArray.length / segments);

    // Draw circular bars
    for (let i = 0; i < segments; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;

        const innerRadius = baseRadius;
        const outerRadius = baseRadius + percent * baseRadius;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3 + percent * 0.7;
        ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.3, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
}

// Mirror visualization (stereo-style)
function renderMirror(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    barCount: number,
    color: string
) {
    const barWidth = width / barCount;
    const step = Math.floor(dataArray.length / barCount);
    const centerY = height / 2;

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const barHeight = percent * centerY * 0.9;

        // Top half
        const gradientTop = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY);
        gradientTop.addColorStop(0, color);
        gradientTop.addColorStop(1, `${color}60`);

        ctx.fillStyle = gradientTop;
        ctx.fillRect(
            i * barWidth + 1,
            centerY - barHeight,
            barWidth - 2,
            barHeight
        );

        // Bottom half (mirrored)
        const gradientBottom = ctx.createLinearGradient(0, centerY, 0, centerY + barHeight);
        gradientBottom.addColorStop(0, `${color}60`);
        gradientBottom.addColorStop(1, color);

        ctx.fillStyle = gradientBottom;
        ctx.fillRect(
            i * barWidth + 1,
            centerY,
            barWidth - 2,
            barHeight
        );
    }

    // Center line
    ctx.strokeStyle = `${color}40`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
}

// Dots visualization
function renderDots(
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    dotCount: number,
    color: string
) {
    const step = Math.floor(dataArray.length / dotCount);
    const time = Date.now() / 1000;

    for (let i = 0; i < dotCount; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;

        const x = (i / dotCount) * width + width / dotCount / 2;
        const baseY = height / 2;
        const offsetY = Math.sin(i * 0.3 + time * 3) * 5;
        const y = baseY + offsetY + (percent - 0.5) * height * 0.6;

        const radius = 2 + percent * 4;

        // Glow effect
        ctx.shadowBlur = 10 + percent * 10;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 + percent * 0.7;
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
}

// Mini waveform for inline use
export function MiniWaveform({ className = "" }: { className?: string }) {
    return (
        <AudioWaveform
            style="bars"
            height={20}
            barCount={16}
            responsive={true}
            className={className}
        />
    );
}

// Circular waveform for decorative use
export function CircularWaveform({ size = 100, className = "" }: { size?: number; className?: string }) {
    return (
        <AudioWaveform
            style="circular"
            width={size}
            height={size}
            responsive={false}
            className={className}
        />
    );
}
