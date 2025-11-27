"use client";

import { useEffect, useRef, useMemo } from "react";
import { useExperience } from "@/contexts/ExperienceContext";

interface GenerativeArtworkProps {
    size?: number;
    className?: string;
    animated?: boolean;
}

// Seeded random number generator for reproducible results
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return function() {
        hash = Math.sin(hash) * 10000;
        return hash - Math.floor(hash);
    };
}

// Generate consistent colors from seed
function generatePalette(random: () => number) {
    const hue = Math.floor(random() * 360);
    const colors = [
        `hsl(${hue}, 100%, 50%)`,
        `hsl(${(hue + 30) % 360}, 90%, 45%)`,
        `hsl(${(hue + 180) % 360}, 80%, 40%)`,
        `hsl(${(hue + 210) % 360}, 70%, 35%)`,
    ];
    return colors;
}

// Different pattern types
type PatternType = "circuits" | "fractals" | "waves" | "grid" | "organic";

function getPatternType(random: () => number): PatternType {
    const types: PatternType[] = ["circuits", "fractals", "waves", "grid", "organic"];
    return types[Math.floor(random() * types.length)];
}

export function GenerativeArtwork({ size = 200, className = "", animated = true }: GenerativeArtworkProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const { state } = useExperience();

    // Memoize the random generator based on uniqueId
    const random = useMemo(() => seededRandom(state.uniqueId), [state.uniqueId]);

    // Memoize pattern configuration
    const config = useMemo(() => {
        const localRandom = seededRandom(state.uniqueId);
        return {
            palette: generatePalette(localRandom),
            patternType: getPatternType(localRandom),
            complexity: 3 + Math.floor(localRandom() * 5),
            rotation: localRandom() * Math.PI * 2,
            scale: 0.5 + localRandom() * 0.5,
        };
    }, [state.uniqueId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        let time = 0;

        const drawCircuits = (t: number) => {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, size, size);

            const localRandom = seededRandom(state.uniqueId + "circuits");
            const nodeCount = config.complexity * 4;
            const nodes: { x: number; y: number }[] = [];

            // Generate nodes
            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: localRandom() * size,
                    y: localRandom() * size,
                });
            }

            // Draw connections
            ctx.lineWidth = 1;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = Math.hypot(nodes[j].x - nodes[i].x, nodes[j].y - nodes[i].y);
                    if (dist < size / 3) {
                        const alpha = (1 - dist / (size / 3)) * 0.5;
                        const colorIndex = (i + Math.floor(t / 50)) % config.palette.length;
                        ctx.strokeStyle = config.palette[colorIndex].replace(")", `, ${alpha})`).replace("hsl", "hsla");
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);

                        // Create right-angle paths
                        if (localRandom() > 0.5) {
                            ctx.lineTo(nodes[j].x, nodes[i].y);
                        } else {
                            ctx.lineTo(nodes[i].x, nodes[j].y);
                        }
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodes.forEach((node, i) => {
                const pulseSize = 2 + Math.sin(t / 20 + i) * 1;
                ctx.fillStyle = config.palette[i % config.palette.length];
                ctx.beginPath();
                ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const drawFractals = (t: number) => {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, size, size);

            const localRandom = seededRandom(state.uniqueId + "fractals");
            const depth = config.complexity;

            const drawBranch = (x: number, y: number, angle: number, length: number, currentDepth: number) => {
                if (currentDepth <= 0 || length < 2) return;

                const endX = x + Math.cos(angle + Math.sin(t / 100) * 0.1) * length;
                const endY = y + Math.sin(angle + Math.sin(t / 100) * 0.1) * length;

                const colorIndex = (depth - currentDepth) % config.palette.length;
                ctx.strokeStyle = config.palette[colorIndex];
                ctx.lineWidth = currentDepth / 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                const branchAngle = 0.3 + localRandom() * 0.4;
                const lengthRatio = 0.6 + localRandom() * 0.2;

                drawBranch(endX, endY, angle - branchAngle, length * lengthRatio, currentDepth - 1);
                drawBranch(endX, endY, angle + branchAngle, length * lengthRatio, currentDepth - 1);
            };

            ctx.save();
            ctx.translate(size / 2, size);
            drawBranch(0, 0, -Math.PI / 2, size / 3, depth);
            ctx.restore();
        };

        const drawWaves = (t: number) => {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, size, size);

            const waveCount = config.complexity;

            for (let w = 0; w < waveCount; w++) {
                ctx.beginPath();
                ctx.strokeStyle = config.palette[w % config.palette.length];
                ctx.lineWidth = 2;

                for (let x = 0; x <= size; x += 2) {
                    const y = size / 2 +
                        Math.sin((x / size) * Math.PI * 4 + t / 30 + w * 0.5) * (20 + w * 10) +
                        Math.sin((x / size) * Math.PI * 2 + t / 50) * 15;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }
        };

        const drawGrid = (t: number) => {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, size, size);

            const gridSize = Math.floor(size / (config.complexity + 3));
            const localRandom = seededRandom(state.uniqueId + "grid");

            for (let x = 0; x < size; x += gridSize) {
                for (let y = 0; y < size; y += gridSize) {
                    const seed = localRandom();
                    const pulse = Math.sin(t / 30 + x / 50 + y / 50) * 0.5 + 0.5;

                    if (seed > 0.3) {
                        const colorIndex = Math.floor(localRandom() * config.palette.length);
                        ctx.fillStyle = config.palette[colorIndex];
                        ctx.globalAlpha = 0.3 + pulse * 0.7;

                        const cellSize = gridSize * (0.5 + pulse * 0.4);
                        const offset = (gridSize - cellSize) / 2;

                        ctx.fillRect(x + offset, y + offset, cellSize, cellSize);
                    }
                }
            }
            ctx.globalAlpha = 1;
        };

        const drawOrganic = (t: number) => {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, size, size);

            const blobCount = config.complexity + 2;
            const localRandom = seededRandom(state.uniqueId + "organic");

            for (let b = 0; b < blobCount; b++) {
                const centerX = size / 2 + Math.sin(t / 50 + b * 2) * (size / 4);
                const centerY = size / 2 + Math.cos(t / 40 + b * 2) * (size / 4);
                const baseRadius = 20 + localRandom() * 30;

                ctx.beginPath();
                ctx.fillStyle = config.palette[b % config.palette.length];
                ctx.globalAlpha = 0.4;

                const points = 8;
                for (let i = 0; i <= points; i++) {
                    const angle = (i / points) * Math.PI * 2;
                    const radiusVariation = Math.sin(angle * 3 + t / 20) * 10;
                    const radius = baseRadius + radiusVariation;

                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        const prevAngle = ((i - 1) / points) * Math.PI * 2;
                        const prevRadius = baseRadius + Math.sin(prevAngle * 3 + t / 20) * 10;
                        const cpX = centerX + Math.cos((prevAngle + angle) / 2) * (radius + prevRadius) / 1.5;
                        const cpY = centerY + Math.sin((prevAngle + angle) / 2) * (radius + prevRadius) / 1.5;
                        ctx.quadraticCurveTo(cpX, cpY, x, y);
                    }
                }

                ctx.closePath();
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        };

        const render = () => {
            time++;

            switch (config.patternType) {
                case "circuits":
                    drawCircuits(time);
                    break;
                case "fractals":
                    drawFractals(time);
                    break;
                case "waves":
                    drawWaves(time);
                    break;
                case "grid":
                    drawGrid(time);
                    break;
                case "organic":
                    drawOrganic(time);
                    break;
            }

            // Add signature/ID overlay
            ctx.font = "8px monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.textAlign = "right";
            ctx.fillText(state.uniqueId.slice(-8), size - 4, size - 4);

            if (animated) {
                animationRef.current = requestAnimationFrame(render);
            }
        };

        render();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [size, config, state.uniqueId, animated, random]);

    return (
        <div className={`relative ${className}`}>
            <canvas
                ref={canvasRef}
                style={{ width: size, height: size }}
                className="block"
            />
            {/* Frame overlay */}
            <div className="absolute inset-0 pointer-events-none border border-[#FF4500]/30">
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#FF4500]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#FF4500]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#FF4500]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#FF4500]" />
            </div>
        </div>
    );
}

// Static version for export/save
export function GenerativeArtworkStatic({ uniqueId, size = 400 }: { uniqueId: string; size?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        // Use the same drawing logic but without animation
        const random = seededRandom(uniqueId);
        const palette = generatePalette(random);

        // Draw a static composition
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, size, size);

        // Draw based on unique pattern
        const gridSize = 20;
        for (let x = 0; x < size; x += gridSize) {
            for (let y = 0; y < size; y += gridSize) {
                if (random() > 0.5) {
                    ctx.fillStyle = palette[Math.floor(random() * palette.length)];
                    ctx.globalAlpha = 0.3 + random() * 0.7;
                    ctx.fillRect(x, y, gridSize - 2, gridSize - 2);
                }
            }
        }

        ctx.globalAlpha = 1;

        // Add SYSTEM FLUX branding
        ctx.font = "bold 16px monospace";
        ctx.fillStyle = "#FF4500";
        ctx.textAlign = "center";
        ctx.fillText("SYSTEM FLUX", size / 2, size - 30);

        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText(uniqueId, size / 2, size - 14);
    }, [uniqueId, size]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: size, height: size }}
            className="block"
        />
    );
}
