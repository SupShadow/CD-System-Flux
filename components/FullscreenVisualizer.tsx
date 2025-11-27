"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { VisualizerType } from "@/lib/tracks";
import { usePageVisibility } from "@/hooks";

interface FullscreenVisualizerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Helper to parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : { r: 255, g: 69, b: 0 };
}

// Helper to create rgba string
function rgba(hex: string, alpha: number): string {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function FullscreenVisualizer({ isOpen, onClose }: FullscreenVisualizerProps) {
    const { analyserRef, isPlaying, currentTrack } = useAudio();
    const { disableFlashing } = useAccessibility();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const isVisible = usePageVisibility();

    useEffect(() => {
        setMounted(true);
        // Check if device is mobile/small screen
        const checkMobile = () => {
            setIsMobileDevice(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Auto-close on mobile devices to prevent issues
    useEffect(() => {
        if (isOpen && isMobileDevice) {
            onClose();
        }
    }, [isOpen, isMobileDevice, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Main visualization
    useEffect(() => {
        if (!isOpen || !mounted || !isVisible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        let animationFrame: number;
        let time = 0;
        const color = currentTrack.color;
        const visualizer = currentTrack.visualizer;

        // Persistent state for visualizers
        const matrixDrops: number[] = [];
        const fallingParticles: { x: number; y: number; speed: number; size: number }[] = [];
        const hearts: { x: number; y: number; size: number; opacity: number; vy: number }[] = [];
        const codeLines: { y: number; text: string; speed: number }[] = [];
        const iceParticles: { x: number; y: number; size: number; angle: number; branches: number }[] = [];
        const tracePoints: { x: number; y: number }[] = [];

        // Initialize matrix drops
        for (let i = 0; i < Math.ceil(canvas.width / 20); i++) {
            matrixDrops[i] = Math.random() * canvas.height;
        }

        // Initialize falling particles
        for (let i = 0; i < 100; i++) {
            fallingParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: 1 + Math.random() * 3,
                size: 2 + Math.random() * 4,
            });
        }

        // Initialize code lines
        const codeSnippets = [
            "const self = await rebuild();",
            "if (broken) { fix(me); }",
            "// TODO: be better",
            "export default NewMe;",
            "patch.apply(mistakes);",
            "version = version + 1;",
            "bugs.forEach(learn);",
            "return stronger;",
        ];
        for (let i = 0; i < 15; i++) {
            codeLines.push({
                y: Math.random() * canvas.height,
                text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
                speed: 0.5 + Math.random() * 1.5,
            });
        }

        const render = () => {
            time += 0.016;

            // Get audio data
            let dataArray: Uint8Array<ArrayBuffer>;
            let bufferLength = 128;

            if (analyserRef.current) {
                bufferLength = analyserRef.current.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>;
                analyserRef.current.getByteFrequencyData(dataArray);
            } else {
                dataArray = new Uint8Array(bufferLength).fill(0) as Uint8Array<ArrayBuffer>;
            }

            // Calculate audio metrics
            let bassAvg = 0, midAvg = 0, highAvg = 0;
            for (let i = 0; i < 10; i++) bassAvg += dataArray[i];
            bassAvg = bassAvg / 10 / 255;
            for (let i = 10; i < 50; i++) midAvg += dataArray[i];
            midAvg = midAvg / 40 / 255;
            for (let i = 50; i < bufferLength; i++) highAvg += dataArray[i];
            highAvg = highAvg / (bufferLength - 50) / 255;

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Clear with fade effect
            ctx.fillStyle = "rgba(10, 10, 15, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Render based on visualizer type
            switch (visualizer) {
                case "dissolve":
                    renderDissolve(ctx, canvas, time, dataArray, bassAvg, midAvg, color, centerX, centerY);
                    break;
                case "digital":
                    renderDigital(ctx, canvas, time, dataArray, bassAvg, color);
                    break;
                case "breathe":
                    renderBreathe(ctx, canvas, time, bassAvg, midAvg, color, centerX, centerY);
                    break;
                case "targeting":
                    renderTargeting(ctx, canvas, time, bassAvg, highAvg, color, centerX, centerY);
                    break;
                case "grid":
                    renderGrid(ctx, canvas, time, dataArray, bassAvg, color);
                    break;
                case "mirror":
                    renderMirror(ctx, canvas, time, dataArray, bassAvg, midAvg, color, centerX, centerY);
                    break;
                case "matrix":
                    renderMatrix(ctx, canvas, time, bassAvg, color, matrixDrops);
                    break;
                case "halo":
                    renderHalo(ctx, canvas, time, bassAvg, midAvg, highAvg, color, centerX, centerY);
                    break;
                case "skyline":
                    renderSkyline(ctx, canvas, time, dataArray, bassAvg, color);
                    break;
                case "atomic":
                    renderAtomic(ctx, canvas, time, bassAvg, midAvg, highAvg, color, centerX, centerY);
                    break;
                case "flash":
                    // Use safer alternative when safe mode is enabled (epilepsy safety)
                    if (disableFlashing) {
                        renderHalo(ctx, canvas, time, bassAvg, midAvg, highAvg, color, centerX, centerY);
                    } else {
                        renderFlash(ctx, canvas, time, bassAvg, color, centerX, centerY);
                    }
                    break;
                case "hearts":
                    renderHearts(ctx, canvas, time, bassAvg, color, hearts);
                    break;
                case "villain":
                    renderVillain(ctx, canvas, time, dataArray, bassAvg, midAvg, color, centerX, centerY);
                    break;
                case "chess":
                    renderChess(ctx, canvas, time, dataArray, bassAvg, color);
                    break;
                case "enigma":
                    renderEnigma(ctx, canvas, time, bassAvg, midAvg, color, centerX, centerY);
                    break;
                case "gameover":
                    renderGameover(ctx, canvas, time, bassAvg, color, centerX, centerY);
                    break;
                case "code":
                    renderCode(ctx, canvas, time, bassAvg, color, codeLines);
                    break;
                case "cinema":
                    renderCinema(ctx, canvas, time, dataArray, bassAvg, color, centerX, centerY);
                    break;
                case "speed":
                    renderSpeed(ctx, canvas, time, bassAvg, midAvg, color, centerX, centerY);
                    break;
                case "falling":
                    renderFalling(ctx, canvas, bassAvg, color, fallingParticles);
                    break;
                case "waves":
                    renderWaves(ctx, canvas, time, dataArray, bassAvg, color);
                    break;
                case "speaker":
                    renderSpeaker(ctx, canvas, time, dataArray, bassAvg, color, centerX, centerY);
                    break;
                case "voices":
                    renderVoices(ctx, canvas, time, dataArray, bassAvg, midAvg, color, centerX, centerY);
                    break;
                case "ice":
                    renderIce(ctx, canvas, time, bassAvg, highAvg, color, iceParticles, centerX, centerY);
                    break;
                case "trace":
                    renderTrace(ctx, canvas, time, bassAvg, midAvg, color, tracePoints, centerX, centerY);
                    break;
                default:
                    renderDefault(ctx, canvas, time, dataArray, bassAvg, color, centerX, centerY);
            }

            // Corner decorations
            renderCorners(ctx, canvas, color);

            animationFrame = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrame);
        };
    }, [isOpen, mounted, isVisible, analyserRef, currentTrack, disableFlashing]);

    // Don't render on mobile or before mounting
    if (!mounted || isMobileDevice) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] bg-void"
                >
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                    {/* Track info overlay */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
                    >
                        <div className="font-mono text-xs tracking-widest mb-2" style={{ color: rgba(currentTrack.color, 0.5) }}>
                            NOW_PLAYING
                        </div>
                        <div className="font-bold text-2xl md:text-4xl text-stark tracking-tight">
                            {currentTrack.title.toUpperCase()}
                        </div>
                        <div className="font-mono text-sm text-stark/50 mt-2">
                            JULIAN GUGGEIS // SYSTEM FLUX
                        </div>
                    </motion.div>

                    {/* Visualizer type indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="absolute top-8 left-8 font-mono text-[10px] tracking-widest"
                        style={{ color: rgba(currentTrack.color, 0.5) }}
                    >
                        VIS_MODE: {currentTrack.visualizer.toUpperCase()}
                    </motion.div>

                    {/* Status indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
                    >
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentTrack.color }}
                            animate={isPlaying ? {
                                scale: [1, 1.5, 1],
                                opacity: [1, 0.5, 1],
                            } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="font-mono text-xs text-stark/50 tracking-widest">
                            {isPlaying ? "SIGNAL_ACTIVE" : "SIGNAL_PAUSED"}
                        </span>
                    </motion.div>

                    {/* Close button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 border text-stark/70 hover:text-stark transition-colors bg-void/50 backdrop-blur-sm"
                        style={{ borderColor: rgba(currentTrack.color, 0.3) }}
                    >
                        <X className="w-6 h-6" />
                    </motion.button>

                    {/* ESC hint */}
                    <div className="absolute bottom-8 right-8 font-mono text-[10px] text-stark/30">
                        [ESC] EXIT
                    </div>

                    {/* Scanlines overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ===== VISUALIZER RENDER FUNCTIONS =====

function renderCorners(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string) {
    const cornerSize = 100;
    ctx.strokeStyle = rgba(color, 0.5);
    ctx.lineWidth = 2;

    // Top left
    ctx.beginPath();
    ctx.moveTo(20, 20 + cornerSize);
    ctx.lineTo(20, 20);
    ctx.lineTo(20 + cornerSize, 20);
    ctx.stroke();

    // Top right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20 - cornerSize, 20);
    ctx.lineTo(canvas.width - 20, 20);
    ctx.lineTo(canvas.width - 20, 20 + cornerSize);
    ctx.stroke();

    // Bottom left
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 20 - cornerSize);
    ctx.lineTo(20, canvas.height - 20);
    ctx.lineTo(20 + cornerSize, canvas.height - 20);
    ctx.stroke();

    // Bottom right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20 - cornerSize, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 20 - cornerSize);
    ctx.stroke();
}

// DISSOLVE - Alles hat ein Ende (fading particles)
function renderDissolve(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, midAvg: number, color: string, centerX: number, centerY: number) {
    const particleCount = 200;
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.1;
        const baseRadius = 150 + Math.sin(time + i * 0.1) * 50;
        const audioBoost = dataArray[i % 128] / 255;
        const radius = baseRadius + audioBoost * 200 + bassAvg * 100;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Particles fade and dissolve outward
        const fadeProgress = (Math.sin(time * 0.5 + i * 0.05) + 1) / 2;
        const alpha = (1 - fadeProgress * 0.7) * (0.3 + audioBoost * 0.7);
        const size = 3 + fadeProgress * 5 + bassAvg * 5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, alpha);
        ctx.fill();

        // Dissolving trails
        if (fadeProgress > 0.5) {
            for (let j = 0; j < 3; j++) {
                const trailX = x + (Math.random() - 0.5) * 30;
                const trailY = y + (Math.random() - 0.5) * 30;
                ctx.beginPath();
                ctx.arc(trailX, trailY, size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = rgba(color, alpha * 0.3);
                ctx.fill();
            }
        }
    }
}

// DIGITAL - BUNKERBIT (pixelated blocks)
function renderDigital(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, color: string) {
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
                ctx.fillRect(
                    x * blockSize + 1,
                    y * blockSize + 1,
                    blockSize - 2,
                    blockSize - 2
                );

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

// BREATHE - Breathe No More (pulsing organic waves)
function renderBreathe(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, midAvg: number, color: string, centerX: number, centerY: number) {
    // Breathing pulse from center
    const breathCycle = Math.sin(time * 0.5) * 0.5 + 0.5;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

    // Multiple breathing rings
    for (let ring = 0; ring < 8; ring++) {
        const ringProgress = (ring / 8 + breathCycle * 0.2) % 1;
        const radius = ringProgress * maxRadius + bassAvg * 100;
        const alpha = (1 - ringProgress) * 0.5;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, alpha);
        ctx.lineWidth = 3 + midAvg * 5;
        ctx.stroke();
    }

    // Organic wave distortion
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 2) {
        const angle = (i * Math.PI) / 180;
        const waveOffset = Math.sin(angle * 6 + time * 2) * 30 * midAvg;
        const breathRadius = 100 + breathCycle * 80 + waveOffset + bassAvg * 50;
        const x = centerX + Math.cos(angle) * breathRadius;
        const y = centerY + Math.sin(angle) * breathRadius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100 + bassAvg * 50);
    gradient.addColorStop(0, rgba(color, 0.5 + breathCycle * 0.3));
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fill();
}

// TARGETING - Clean Shot // Dead Mic (sniper scope)
function renderTargeting(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, highAvg: number, color: string, centerX: number, centerY: number) {
    const scopeRadius = 200 + bassAvg * 50;

    // Outer scope ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, scopeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner rings
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, scopeRadius * (i / 4), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Crosshairs
    ctx.strokeStyle = rgba(color, 0.9);
    ctx.lineWidth = 2;

    // Horizontal
    ctx.beginPath();
    ctx.moveTo(centerX - scopeRadius - 50, centerY);
    ctx.lineTo(centerX - 30, centerY);
    ctx.moveTo(centerX + 30, centerY);
    ctx.lineTo(centerX + scopeRadius + 50, centerY);
    ctx.stroke();

    // Vertical
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - scopeRadius - 50);
    ctx.lineTo(centerX, centerY - 30);
    ctx.moveTo(centerX, centerY + 30);
    ctx.lineTo(centerX, centerY + scopeRadius + 50);
    ctx.stroke();

    // Distance markers
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const markerY = centerY + i * 40;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, markerY);
        ctx.lineTo(centerX + 10, markerY);
        ctx.stroke();
    }

    // Target lock animation on bass
    if (bassAvg > 0.4) {
        ctx.strokeStyle = rgba(color, highAvg);
        ctx.lineWidth = 3;
        const lockSize = 40 + Math.sin(time * 10) * 10;
        ctx.strokeRect(centerX - lockSize, centerY - lockSize, lockSize * 2, lockSize * 2);

        // Corner brackets
        const bracketSize = 15;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(centerX - lockSize, centerY - lockSize + bracketSize);
        ctx.lineTo(centerX - lockSize, centerY - lockSize);
        ctx.lineTo(centerX - lockSize + bracketSize, centerY - lockSize);
        // Top-right
        ctx.moveTo(centerX + lockSize - bracketSize, centerY - lockSize);
        ctx.lineTo(centerX + lockSize, centerY - lockSize);
        ctx.lineTo(centerX + lockSize, centerY - lockSize + bracketSize);
        // Bottom-left
        ctx.moveTo(centerX - lockSize, centerY + lockSize - bracketSize);
        ctx.lineTo(centerX - lockSize, centerY + lockSize);
        ctx.lineTo(centerX - lockSize + bracketSize, centerY + lockSize);
        // Bottom-right
        ctx.moveTo(centerX + lockSize - bracketSize, centerY + lockSize);
        ctx.lineTo(centerX + lockSize, centerY + lockSize);
        ctx.lineTo(centerX + lockSize, centerY + lockSize - bracketSize);
        ctx.stroke();
    }

    // Scanning line
    const scanAngle = time * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(scanAngle) * scopeRadius,
        centerY + Math.sin(scanAngle) * scopeRadius
    );
    ctx.strokeStyle = rgba(color, 0.3);
    ctx.lineWidth = 2;
    ctx.stroke();
}

// GRID - Click Shift Repeat (shifting grid)
function renderGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, color: string) {
    const gridSize = 50;
    const cols = Math.ceil(canvas.width / gridSize) + 1;
    const rows = Math.ceil(canvas.height / gridSize) + 1;

    // Shifting offset
    const shiftX = (time * 30) % gridSize;
    const shiftY = (time * 20) % gridSize;

    ctx.strokeStyle = rgba(color, 0.3 + bassAvg * 0.3);
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i < cols; i++) {
        const x = i * gridSize - shiftX;
        const waveOffset = Math.sin(time * 2 + i * 0.3) * 10 * bassAvg;
        ctx.beginPath();
        ctx.moveTo(x + waveOffset, 0);
        ctx.lineTo(x - waveOffset, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i < rows; i++) {
        const y = i * gridSize - shiftY;
        const waveOffset = Math.cos(time * 2 + i * 0.3) * 10 * bassAvg;
        ctx.beginPath();
        ctx.moveTo(0, y + waveOffset);
        ctx.lineTo(canvas.width, y - waveOffset);
        ctx.stroke();
    }

    // Highlight intersections with audio
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const dataIndex = (x + y * cols) % 128;
            const value = dataArray[dataIndex] / 255;

            if (value > 0.4) {
                const px = x * gridSize - shiftX;
                const py = y * gridSize - shiftY;

                ctx.beginPath();
                ctx.arc(px, py, 3 + value * 5, 0, Math.PI * 2);
                ctx.fillStyle = rgba(color, value);
                ctx.fill();
            }
        }
    }
}

// MIRROR - Double Life (mirrored visualization)
function renderMirror(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, midAvg: number, color: string, centerX: number, centerY: number) {
    // Draw on one side, mirror to other
    const barCount = 64;
    const barWidth = (canvas.width / 2) / barCount;

    for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * 2] / 255;
        const barHeight = value * canvas.height * 0.4;

        // Right side (original)
        const gradient1 = ctx.createLinearGradient(0, centerY, 0, centerY - barHeight);
        gradient1.addColorStop(0, rgba(color, 0.3));
        gradient1.addColorStop(1, rgba(color, 0.8 + value * 0.2));

        ctx.fillStyle = gradient1;
        ctx.fillRect(
            centerX + i * barWidth,
            centerY - barHeight,
            barWidth - 1,
            barHeight
        );
        ctx.fillRect(
            centerX + i * barWidth,
            centerY,
            barWidth - 1,
            barHeight
        );

        // Left side (mirrored)
        ctx.fillRect(
            centerX - (i + 1) * barWidth,
            centerY - barHeight,
            barWidth - 1,
            barHeight
        );
        ctx.fillRect(
            centerX - (i + 1) * barWidth,
            centerY,
            barWidth - 1,
            barHeight
        );
    }

    // Center dividing line with glow
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Mirror reflection effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 + bassAvg * 30;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// MATRIX - Glitch in the Matrix (matrix rain)
function renderMatrix(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, color: string, drops: number[]) {
    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < columns; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Gradient fade effect
        const alpha = 0.8 + bassAvg * 0.2;
        ctx.fillStyle = rgba(color, alpha);
        ctx.fillText(char, x, y);

        // Trail effect
        for (let j = 1; j < 20; j++) {
            const trailY = y - j * fontSize;
            const trailAlpha = (1 - j / 20) * 0.5;
            ctx.fillStyle = rgba(color, trailAlpha);
            const trailChar = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(trailChar, x, trailY);
        }

        // Reset drop when it reaches bottom or randomly
        if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Move drop down, speed affected by bass
        drops[i] += 1 + bassAvg * 2;
    }

    // Glitch effect on high bass
    if (bassAvg > 0.6) {
        const glitchY = Math.random() * canvas.height;
        const glitchHeight = 20 + Math.random() * 50;
        ctx.drawImage(
            canvas,
            0, glitchY, canvas.width, glitchHeight,
            (Math.random() - 0.5) * 20, glitchY, canvas.width, glitchHeight
        );
    }
}

// HALO - Heretic to Your Halo (angelic rings)
function renderHalo(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, midAvg: number, highAvg: number, color: string, centerX: number, centerY: number) {
    // Multiple tilted halos
    const haloCount = 5;

    for (let h = 0; h < haloCount; h++) {
        const baseRadius = 100 + h * 60;
        const radius = baseRadius + bassAvg * 50;
        const tilt = 0.3 + h * 0.1; // Perspective tilt
        const rotation = time * 0.5 + h * 0.5;

        ctx.beginPath();
        for (let i = 0; i <= 360; i += 5) {
            const angle = (i * Math.PI) / 180 + rotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY - 100 + Math.sin(angle) * radius * tilt;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.strokeStyle = rgba(color, 0.6 - h * 0.1);
        ctx.lineWidth = 3 - h * 0.4;
        ctx.stroke();

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 + bassAvg * 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Light rays emanating from center
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + time * 0.2;
        const rayLength = 300 + midAvg * 200;

        const gradient = ctx.createLinearGradient(
            centerX, centerY - 100,
            centerX + Math.cos(angle) * rayLength,
            centerY - 100 + Math.sin(angle) * rayLength * 0.3
        );
        gradient.addColorStop(0, rgba(color, 0.5));
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 100);
        ctx.lineTo(
            centerX + Math.cos(angle) * rayLength,
            centerY - 100 + Math.sin(angle) * rayLength * 0.3
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Center glow
    const centerGradient = ctx.createRadialGradient(
        centerX, centerY - 100, 0,
        centerX, centerY - 100, 80
    );
    centerGradient.addColorStop(0, rgba(color, 0.8));
    centerGradient.addColorStop(0.5, rgba(color, 0.3));
    centerGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY - 100, 80, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();
}

// SKYLINE - Higher Than the Skyline (city bars)
function renderSkyline(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, color: string) {
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
                    ctx.fillRect(
                        x + 4 + col * windowWidth,
                        y + 10 + row * 20,
                        windowWidth - 2,
                        windowHeight
                    );
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
        const starX = (Math.sin(i * 100) + 1) / 2 * canvas.width;
        const starY = (Math.cos(i * 100) + 1) / 2 * (baseY - 150);
        const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;

        ctx.beginPath();
        ctx.arc(starX, starY, 1 + twinkle, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.3 + twinkle * 0.5);
        ctx.fill();
    }
}

// ATOMIC - ION CORE (atomic orbits)
function renderAtomic(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, midAvg: number, highAvg: number, color: string, centerX: number, centerY: number) {
    // Nucleus
    const nucleusSize = 30 + bassAvg * 20;
    const nucleusGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, nucleusSize
    );
    nucleusGradient.addColorStop(0, rgba(color, 1));
    nucleusGradient.addColorStop(0.5, rgba(color, 0.6));
    nucleusGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusSize, 0, Math.PI * 2);
    ctx.fillStyle = nucleusGradient;
    ctx.fill();

    // Electron orbits
    const orbitCount = 4;
    const electrons = [3, 5, 7, 9];

    for (let o = 0; o < orbitCount; o++) {
        const orbitRadius = 80 + o * 70;
        const tiltX = 1;
        const tiltY = 0.3 + o * 0.15;
        const orbitRotation = time * (0.5 + o * 0.2) + o * Math.PI / 4;

        // Draw orbit path
        ctx.beginPath();
        for (let i = 0; i <= 360; i += 5) {
            const angle = (i * Math.PI) / 180;
            const x = centerX + Math.cos(angle + orbitRotation) * orbitRadius * tiltX;
            const y = centerY + Math.sin(angle + orbitRotation) * orbitRadius * tiltY;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(color, 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw electrons
        for (let e = 0; e < electrons[o]; e++) {
            const electronAngle = (e / electrons[o]) * Math.PI * 2 + time * (2 + o * 0.5);
            const ex = centerX + Math.cos(electronAngle + orbitRotation) * orbitRadius * tiltX;
            const ey = centerY + Math.sin(electronAngle + orbitRotation) * orbitRadius * tiltY;

            // Electron glow
            ctx.beginPath();
            ctx.arc(ex, ey, 8 + midAvg * 5, 0, Math.PI * 2);
            ctx.fillStyle = rgba(color, 0.8);
            ctx.fill();

            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Trail
            for (let t = 1; t < 5; t++) {
                const trailAngle = electronAngle - t * 0.1;
                const tx = centerX + Math.cos(trailAngle + orbitRotation) * orbitRadius * tiltX;
                const ty = centerY + Math.sin(trailAngle + orbitRotation) * orbitRadius * tiltY;

                ctx.beginPath();
                ctx.arc(tx, ty, 4 - t * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = rgba(color, 0.3 - t * 0.05);
                ctx.fill();
            }
        }
    }

    // Energy pulses on bass
    if (bassAvg > 0.5) {
        const pulseRadius = 50 + (time % 1) * 200;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.5 - (pulseRadius / 250) * 0.5);
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// FLASH - KILLSWITCH PRESS CONFERENCE (camera flashes)
function renderFlash(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, color: string, centerX: number, centerY: number) {
    // Random camera flashes
    if (bassAvg > 0.4 && Math.random() > 0.7) {
        // Full screen flash
        ctx.fillStyle = rgba(color, 0.3 + Math.random() * 0.3);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Flash point
        const flashX = Math.random() * canvas.width;
        const flashY = Math.random() * canvas.height;

        const flashGradient = ctx.createRadialGradient(
            flashX, flashY, 0,
            flashX, flashY, 200
        );
        flashGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        flashGradient.addColorStop(0.3, rgba(color, 0.5));
        flashGradient.addColorStop(1, "transparent");

        ctx.fillStyle = flashGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Crowd silhouettes at bottom
    const silhouetteHeight = 150;
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";

    for (let i = 0; i < 30; i++) {
        const x = (i / 30) * canvas.width;
        const headY = canvas.height - silhouetteHeight + Math.sin(i * 2) * 20;
        const headSize = 15 + Math.random() * 10;

        // Head
        ctx.beginPath();
        ctx.arc(x, headY, headSize, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillRect(x - 15, headY + headSize, 30, silhouetteHeight);

        // Phone screens (some holding up phones)
        if (Math.random() > 0.6) {
            const phoneGlow = Math.sin(time * 5 + i) * 0.3 + 0.7;
            ctx.fillStyle = rgba(color, phoneGlow);
            ctx.fillRect(x - 5, headY - 40, 10, 15);
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        }
    }

    // Stage lights
    for (let i = 0; i < 5; i++) {
        const lightX = (i / 4) * canvas.width;
        const gradient = ctx.createLinearGradient(lightX, 0, lightX, canvas.height * 0.6);
        gradient.addColorStop(0, rgba(color, 0.3));
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(lightX, 0);
        ctx.lineTo(lightX - 100, canvas.height * 0.6);
        ctx.lineTo(lightX + 100, canvas.height * 0.6);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// HEARTS - Likes and Lies (social media hearts)
function renderHearts(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, color: string, hearts: { x: number; y: number; size: number; opacity: number; vy: number }[]) {
    // Spawn new hearts on bass
    if (bassAvg > 0.3 && hearts.length < 50) {
        hearts.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 50,
            size: 20 + Math.random() * 30,
            opacity: 0.8 + Math.random() * 0.2,
            vy: 2 + Math.random() * 3 + bassAvg * 3,
        });
    }

    // Update and draw hearts
    for (let i = hearts.length - 1; i >= 0; i--) {
        const heart = hearts[i];
        heart.y -= heart.vy;
        heart.opacity -= 0.005;

        // Remove faded hearts
        if (heart.opacity <= 0 || heart.y < -50) {
            hearts.splice(i, 1);
            continue;
        }

        // Draw heart shape
        drawHeart(ctx, heart.x, heart.y, heart.size, rgba(color, heart.opacity));

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        drawHeart(ctx, heart.x, heart.y, heart.size, rgba(color, heart.opacity * 0.5));
        ctx.shadowBlur = 0;
    }

    // "Like" counter
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = rgba(color, 0.8);
    ctx.textAlign = "center";
    const likeCount = Math.floor(time * 100 + bassAvg * 1000);
    ctx.fillText(`♥ ${likeCount.toLocaleString()}`, canvas.width / 2, canvas.height / 2);

    // Fake/glitchy numbers
    if (bassAvg > 0.5) {
        ctx.fillStyle = rgba(color, 0.3);
        const fakeCount = Math.floor(Math.random() * 999999);
        ctx.fillText(`♥ ${fakeCount.toLocaleString()}`, canvas.width / 2 + (Math.random() - 0.5) * 10, canvas.height / 2 + (Math.random() - 0.5) * 10);
    }
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.fill();
}

// VILLAIN - Make Me the Villain (dark fire)
function renderVillain(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, midAvg: number, color: string, centerX: number, centerY: number) {
    // Dark flames rising from bottom
    const flameCount = 50;
    for (let i = 0; i < flameCount; i++) {
        const x = (i / flameCount) * canvas.width;
        const dataIndex = Math.floor((i / flameCount) * 128);
        const value = dataArray[dataIndex] / 255;
        const flameHeight = 100 + value * 300 + bassAvg * 200;

        const gradient = ctx.createLinearGradient(x, canvas.height, x, canvas.height - flameHeight);
        gradient.addColorStop(0, rgba(color, 0.9));
        gradient.addColorStop(0.3, rgba(color, 0.6));
        gradient.addColorStop(0.7, "rgba(50, 0, 0, 0.4)");
        gradient.addColorStop(1, "transparent");

        // Flame path with flickering
        ctx.beginPath();
        ctx.moveTo(x - 15, canvas.height);

        const segments = 10;
        for (let s = 0; s <= segments; s++) {
            const segY = canvas.height - (s / segments) * flameHeight;
            const flicker = Math.sin(time * 10 + i + s) * 15 * (s / segments);
            ctx.lineTo(x + flicker, segY);
        }

        ctx.lineTo(x + 15, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Villain silhouette in center
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";

    // Cape
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 150);
    ctx.quadraticCurveTo(centerX, centerY - 50, centerX + 100, centerY + 150);
    ctx.quadraticCurveTo(centerX, centerY + 100, centerX - 100, centerY + 150);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(centerX, centerY - 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Glowing eyes
    const eyeGlow = 0.5 + bassAvg * 0.5;
    ctx.fillStyle = rgba(color, eyeGlow);
    ctx.beginPath();
    ctx.arc(centerX - 15, centerY - 85, 5, 0, Math.PI * 2);
    ctx.arc(centerX + 15, centerY - 85, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = color;
    ctx.shadowBlur = 20 + bassAvg * 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Evil aura
    for (let i = 0; i < 3; i++) {
        const auraRadius = 200 + i * 50 + bassAvg * 50;
        ctx.beginPath();
        ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.2 - i * 0.05);
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

// CHESS - Mirror Match IQ (strategic patterns)
function renderChess(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, color: string) {
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
    piecePositions.forEach(piece => {
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
    const moveX = offsetX + ((Math.floor(time) % boardSize) * cellSize);
    const moveY = offsetY + ((Math.floor(time * 0.7) % boardSize) * cellSize);
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 3;
    ctx.strokeRect(moveX, moveY, cellSize, cellSize);
}

// ENIGMA - Neon Enigma (mysterious shapes)
function renderEnigma(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, midAvg: number, color: string, centerX: number, centerY: number) {
    // Rotating mysterious geometric shapes
    const shapeCount = 5;

    for (let s = 0; s < shapeCount; s++) {
        const rotation = time * (0.3 + s * 0.1) + s * Math.PI / 3;
        const size = 80 + s * 40 + bassAvg * 30;
        const sides = 3 + s; // Triangle, square, pentagon, etc.

        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + rotation;
            const x = centerX + Math.cos(angle) * size;
            const y = centerY + Math.sin(angle) * size;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(color, 0.6 - s * 0.1);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Neon glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 + bassAvg * 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Question mark in center (the enigma)
    ctx.font = `bold ${100 + bassAvg * 50}px serif`;
    ctx.fillStyle = rgba(color, 0.3 + midAvg * 0.5);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", centerX, centerY);

    // Mysterious particles orbiting
    for (let i = 0; i < 20; i++) {
        const orbitRadius = 200 + Math.sin(i * 0.5) * 100;
        const angle = time * 0.5 + (i / 20) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;

        ctx.beginPath();
        ctx.arc(x, y, 3 + midAvg * 3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.5 + Math.sin(time + i) * 0.3);
        ctx.fill();
    }
}

// GAMEOVER - No Continue (game over screen)
function renderGameover(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, color: string, centerX: number, centerY: number) {
    // Retro game over text
    ctx.font = "bold 72px monospace";
    ctx.fillStyle = rgba(color, 0.8 + Math.sin(time * 5) * 0.2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Glitchy text effect
    const glitchOffset = bassAvg > 0.5 ? (Math.random() - 0.5) * 10 : 0;
    ctx.fillText("GAME OVER", centerX + glitchOffset, centerY - 50);

    // Continue countdown
    ctx.font = "24px monospace";
    const continueTime = 9 - (Math.floor(time) % 10);
    ctx.fillStyle = rgba(color, 0.6);
    ctx.fillText(`CONTINUE? ${continueTime}`, centerX, centerY + 30);

    // Insert coin text
    ctx.font = "18px monospace";
    ctx.fillStyle = rgba(color, 0.3 + Math.sin(time * 3) * 0.2);
    ctx.fillText("INSERT COIN", centerX, centerY + 80);

    // Falling "NO" text
    for (let i = 0; i < 10; i++) {
        const x = ((i * 137) % canvas.width);
        const y = ((time * 100 + i * 100) % canvas.height);
        ctx.font = "16px monospace";
        ctx.fillStyle = rgba(color, 0.2);
        ctx.fillText("NO", x, y);
    }

    // Static noise
    if (bassAvg > 0.3) {
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // Border flicker
    ctx.strokeStyle = rgba(color, 0.5 + Math.sin(time * 8) * 0.3);
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
}

// CODE - Patch Notes: Me (scrolling changelog)
function renderCode(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, color: string, codeLines: { y: number; text: string; speed: number }[]) {
    ctx.font = "14px monospace";

    // Update and draw code lines
    codeLines.forEach((line, index) => {
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
        if (index === Math.floor(time) % codeLines.length) {
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

// CINEMA - Release the Frames (film strips)
function renderCinema(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, color: string, centerX: number, centerY: number) {
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
    const coneGradient = ctx.createRadialGradient(
        centerX, stripHeight, 0,
        centerX, centerY + 100, 400
    );
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

// SPEED - Runaway (motion blur trails)
function renderSpeed(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, midAvg: number, color: string, centerX: number, centerY: number) {
    // Speed lines radiating from center
    const lineCount = 100;

    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const startRadius = 50 + Math.random() * 50;
        const endRadius = 300 + Math.random() * 300 + bassAvg * 200;
        const speed = time * (5 + Math.random() * 5);

        const lineStart = startRadius + (speed % (endRadius - startRadius));
        const lineEnd = lineStart + 50 + midAvg * 100;

        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(angle) * lineStart,
            centerY + Math.sin(angle) * lineStart
        );
        ctx.lineTo(
            centerX + Math.cos(angle) * lineEnd,
            centerY + Math.sin(angle) * lineEnd
        );

        const gradient = ctx.createLinearGradient(
            centerX + Math.cos(angle) * lineStart,
            centerY + Math.sin(angle) * lineStart,
            centerX + Math.cos(angle) * lineEnd,
            centerY + Math.sin(angle) * lineEnd
        );
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, rgba(color, 0.5 + bassAvg * 0.3));
        gradient.addColorStop(1, "transparent");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.stroke();
    }

    // Central blur effect
    const blurGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
    blurGradient.addColorStop(0, rgba(color, 0.5));
    blurGradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY, 100 + bassAvg * 50, 0, Math.PI * 2);
    ctx.fillStyle = blurGradient;
    ctx.fill();

    // Motion blur text
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = rgba(color, 0.3);
    for (let i = 0; i < 5; i++) {
        ctx.fillText("RUN", centerX - 60 - i * 10, centerY + 150 - i * 2);
    }
    ctx.fillStyle = rgba(color, 0.8);
    ctx.fillText("RUN", centerX - 60, centerY + 150);
}

// FALLING - Still Falling (gravity particles)
function renderFalling(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bassAvg: number, color: string, particles: { x: number; y: number; speed: number; size: number }[]) {
    particles.forEach(p => {
        // Gravity effect
        p.y += p.speed + bassAvg * 5;
        p.speed += 0.1; // Acceleration

        // Reset when off screen
        if (p.y > canvas.height + 50) {
            p.y = -50;
            p.x = Math.random() * canvas.width;
            p.speed = 1 + Math.random() * 3;
        }

        // Draw particle with trail
        const trailLength = p.speed * 5;
        const gradient = ctx.createLinearGradient(p.x, p.y - trailLength, p.x, p.y);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, rgba(color, 0.8));

        ctx.beginPath();
        ctx.moveTo(p.x, p.y - trailLength);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.stroke();

        // Particle head
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.9);
        ctx.fill();
    });

    // Ground impact ripples
    if (bassAvg > 0.5) {
        const rippleX = Math.random() * canvas.width;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(rippleX, canvas.height - 20, 20 + i * 20, Math.PI, 0);
            ctx.strokeStyle = rgba(color, 0.3 - i * 0.1);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

// WAVES - Tidal Weight (ocean waves)
function renderWaves(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, color: string) {
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

// SPEAKER - Turn Me Louder (speaker cones)
function renderSpeaker(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, color: string, centerX: number, centerY: number) {
    // Main speaker cone
    const coneRadius = 200 + bassAvg * 100;

    // Outer rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, coneRadius + 30, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 10;
    ctx.stroke();

    // Cone rings (concentric circles)
    for (let i = 0; i < 8; i++) {
        const ringRadius = (coneRadius / 8) * (i + 1);
        const displacement = bassAvg * 20 * (1 - i / 8);

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.3 + (i / 8) * 0.4);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Center dust cap
    const dustCapRadius = 40 + bassAvg * 30;
    const dustCapGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, dustCapRadius
    );
    dustCapGradient.addColorStop(0, rgba(color, 0.9));
    dustCapGradient.addColorStop(0.7, rgba(color, 0.5));
    dustCapGradient.addColorStop(1, rgba(color, 0.2));

    ctx.beginPath();
    ctx.arc(centerX, centerY, dustCapRadius, 0, Math.PI * 2);
    ctx.fillStyle = dustCapGradient;
    ctx.fill();

    // Sound waves emanating
    for (let i = 0; i < 5; i++) {
        const waveRadius = coneRadius + 50 + i * 60 + (time * 100) % 60;
        const alpha = Math.max(0, 0.4 - (waveRadius - coneRadius) / 400);

        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, alpha);
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Volume meter bars
    const meterWidth = 300;
    const meterHeight = 20;
    const meterX = centerX - meterWidth / 2;
    const meterY = centerY + coneRadius + 80;
    const barCount = 20;

    for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArray[i * 6] / 255) * 50 + 5;
        const barX = meterX + (i / barCount) * meterWidth;
        const barWidth = (meterWidth / barCount) - 2;

        ctx.fillStyle = rgba(color, 0.5 + (i / barCount) * 0.5);
        ctx.fillRect(barX, meterY - barHeight, barWidth, barHeight);
    }

    // dB label
    ctx.font = "14px monospace";
    ctx.fillStyle = rgba(color, 0.5);
    ctx.fillText(`${Math.floor(bassAvg * 100)}dB`, meterX + meterWidth + 10, meterY);
}

// VOICES - Voices Are a Loaded Room (sound waves)
function renderVoices(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, midAvg: number, color: string, centerX: number, centerY: number) {
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

// ICE - Wenn Ich Friere (ice crystals)
function renderIce(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, highAvg: number, color: string, iceParticles: { x: number; y: number; size: number; angle: number; branches: number }[], centerX: number, centerY: number) {
    // Generate ice crystals
    while (iceParticles.length < 15) {
        iceParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 30 + Math.random() * 50,
            angle: Math.random() * Math.PI * 2,
            branches: 6,
        });
    }

    // Draw ice crystals (snowflake pattern)
    iceParticles.forEach((crystal, index) => {
        ctx.save();
        ctx.translate(crystal.x, crystal.y);
        ctx.rotate(crystal.angle + time * 0.1);

        const size = crystal.size + bassAvg * 20;

        // Draw 6-pointed crystal
        for (let b = 0; b < crystal.branches; b++) {
            const branchAngle = (b / crystal.branches) * Math.PI * 2;

            ctx.save();
            ctx.rotate(branchAngle);

            // Main branch
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size, 0);
            ctx.strokeStyle = rgba(color, 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();

            // Sub-branches
            for (let s = 1; s <= 3; s++) {
                const subPos = (s / 4) * size;
                const subSize = size * 0.3 * (1 - s / 4);

                ctx.beginPath();
                ctx.moveTo(subPos, 0);
                ctx.lineTo(subPos + subSize, -subSize);
                ctx.moveTo(subPos, 0);
                ctx.lineTo(subPos + subSize, subSize);
                ctx.strokeStyle = rgba(color, 0.4);
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.restore();
        }

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + highAvg * 20;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.8);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Slowly move crystals
        crystal.y += 0.5;
        crystal.angle += 0.002;

        if (crystal.y > canvas.height + 50) {
            crystal.y = -50;
            crystal.x = Math.random() * canvas.width;
        }
    });

    // Frost border effect
    const frostWidth = 50 + bassAvg * 30;
    const frostGradient = ctx.createLinearGradient(0, 0, frostWidth, 0);
    frostGradient.addColorStop(0, rgba(color, 0.3));
    frostGradient.addColorStop(1, "transparent");

    ctx.fillStyle = frostGradient;
    ctx.fillRect(0, 0, frostWidth, canvas.height);

    const frostGradientRight = ctx.createLinearGradient(canvas.width, 0, canvas.width - frostWidth, 0);
    frostGradientRight.addColorStop(0, rgba(color, 0.3));
    frostGradientRight.addColorStop(1, "transparent");

    ctx.fillStyle = frostGradientRight;
    ctx.fillRect(canvas.width - frostWidth, 0, frostWidth, canvas.height);
}

// TRACE - Tracing (line traces)
function renderTrace(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, bassAvg: number, midAvg: number, color: string, tracePoints: { x: number; y: number }[], centerX: number, centerY: number) {
    // Add new trace points based on audio
    const newX = centerX + Math.sin(time * 2) * 200 + Math.cos(time * 3.7) * 100;
    const newY = centerY + Math.cos(time * 2.3) * 150 + Math.sin(time * 4.1) * 80;

    tracePoints.push({ x: newX + (Math.random() - 0.5) * bassAvg * 100, y: newY + (Math.random() - 0.5) * bassAvg * 100 });

    // Limit trace length
    const maxPoints = 200;
    while (tracePoints.length > maxPoints) {
        tracePoints.shift();
    }

    // Draw trace line
    if (tracePoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(tracePoints[0].x, tracePoints[0].y);

        for (let i = 1; i < tracePoints.length; i++) {
            const alpha = i / tracePoints.length;
            ctx.lineTo(tracePoints[i].x, tracePoints[i].y);
        }

        ctx.strokeStyle = rgba(color, 0.8);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // Glow effect on recent points
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 + bassAvg * 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw dots at points
        for (let i = 0; i < tracePoints.length; i += 10) {
            const alpha = i / tracePoints.length;
            ctx.beginPath();
            ctx.arc(tracePoints[i].x, tracePoints[i].y, 2 + alpha * 3, 0, Math.PI * 2);
            ctx.fillStyle = rgba(color, 0.3 + alpha * 0.5);
            ctx.fill();
        }

        // Current position indicator
        const current = tracePoints[tracePoints.length - 1];
        ctx.beginPath();
        ctx.arc(current.x, current.y, 8 + midAvg * 10, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.9);
        ctx.fill();

        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Coordinate display
    if (tracePoints.length > 0) {
        const current = tracePoints[tracePoints.length - 1];
        ctx.font = "12px monospace";
        ctx.fillStyle = rgba(color, 0.5);
        ctx.fillText(`X: ${Math.floor(current.x)} Y: ${Math.floor(current.y)}`, 20, canvas.height - 20);
    }
}

// DEFAULT - Fallback visualization
function renderDefault(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, dataArray: Uint8Array, bassAvg: number, color: string, centerX: number, centerY: number) {
    // Circular waveform
    const radius = 150 + bassAvg * 50;
    const points = 64;

    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
        const dataIndex = Math.floor((i / points) * 128);
        const value = dataArray[dataIndex] / 255;
        const waveRadius = radius + value * 100;

        const x = centerX + Math.cos(angle) * waveRadius;
        const y = centerY + Math.sin(angle) * waveRadius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(color, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center pulse
    const pulseSize = 50 + bassAvg * 30;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
    gradient.addColorStop(0, rgba(color, 0.8));
    gradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}
