"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useExperience } from "@/contexts/ExperienceContext";

/**
 * InfectionOverlay - Visual representation of the user's "infection level"
 * As the user engages more with the experience, the UI becomes more "infected"
 * with glitches, color shifts, and organic patterns spreading from the edges.
 */
export function InfectionOverlay() {
    const { state } = useExperience();
    const [veins, setVeins] = useState<{ id: number; path: string; delay: number }[]>([]);

    // Generate organic "vein" patterns based on infection level
    useEffect(() => {
        if (state.infectionLevel < 10) {
            setVeins([]);
            return;
        }

        const veinCount = Math.floor(state.infectionLevel / 10);
        const newVeins = [];

        for (let i = 0; i < veinCount; i++) {
            const startX = Math.random() > 0.5 ? 0 : 100;
            const startY = Math.random() * 100;
            const endX = startX === 0 ? 20 + Math.random() * 30 : 50 + Math.random() * 30;
            const endY = startY + (Math.random() - 0.5) * 40;

            const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 20;
            const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 20;

            const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

            newVeins.push({
                id: i,
                path,
                delay: Math.random() * 2,
            });
        }

        setVeins(newVeins);
    }, [state.infectionLevel]);

    // Don't render anything if infection is too low
    if (state.infectionLevel < 5) return null;

    const opacity = Math.min(state.infectionLevel / 100, 0.8);
    const glitchIntensity = state.infectionLevel / 100;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
            {/* Edge vignette that intensifies with infection */}
            <div
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 50%, rgba(255, 0, 68, ${opacity * 0.15}) 100%)`,
                }}
            />

            {/* Organic vein patterns */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                    <filter id="veinGlow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {veins.map((vein) => (
                    <motion.path
                        key={vein.id}
                        d={vein.path}
                        fill="none"
                        stroke="rgba(255, 0, 68, 0.4)"
                        strokeWidth="1"
                        filter="url(#veinGlow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{
                            duration: 3,
                            delay: vein.delay,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </svg>

            {/* Scan line effect that intensifies */}
            {state.infectionLevel > 30 && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: `repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 2px,
                            rgba(255, 0, 68, ${glitchIntensity * 0.03}) 2px,
                            rgba(255, 0, 68, ${glitchIntensity * 0.03}) 4px
                        )`,
                        animation: state.infectionLevel > 50 ? "scanlines 8s linear infinite" : undefined,
                    }}
                />
            )}

            {/* Random glitch blocks at high infection */}
            {state.infectionLevel > 60 && (
                <GlitchBlocks intensity={glitchIntensity} />
            )}

            {/* Corner corruption */}
            {state.infectionLevel > 40 && (
                <>
                    <CornerCorruption position="top-left" intensity={glitchIntensity} />
                    <CornerCorruption position="bottom-right" intensity={glitchIntensity} />
                </>
            )}

            {/* Infection percentage indicator */}
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-[#FF0044]/50">
                INFECTION: {state.infectionLevel.toFixed(1)}%
            </div>

            <style jsx>{`
                @keyframes scanlines {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(4px); }
                }
            `}</style>
        </div>
    );
}

function GlitchBlocks({ intensity }: { intensity: number }) {
    const [blocks, setBlocks] = useState<{ id: number; x: number; y: number; w: number; h: number }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < intensity * 0.3) {
                const newBlock = {
                    id: Date.now(),
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    w: 5 + Math.random() * 15,
                    h: 2 + Math.random() * 5,
                };
                setBlocks((prev) => [...prev.slice(-5), newBlock]);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [intensity]);

    return (
        <>
            {blocks.map((block) => (
                <motion.div
                    key={block.id}
                    className="absolute bg-[#FF0044]/20"
                    style={{
                        left: `${block.x}%`,
                        top: `${block.y}%`,
                        width: `${block.w}%`,
                        height: `${block.h}%`,
                    }}
                    initial={{ opacity: 1, scaleX: 1 }}
                    animate={{ opacity: 0, scaleX: 0.5 }}
                    transition={{ duration: 0.5 }}
                />
            ))}
        </>
    );
}

function CornerCorruption({ position, intensity }: { position: "top-left" | "bottom-right"; intensity: number }) {
    const isTopLeft = position === "top-left";
    const size = 50 + intensity * 100;

    return (
        <div
            className={`absolute ${isTopLeft ? "top-0 left-0" : "bottom-0 right-0"}`}
            style={{
                width: size,
                height: size,
                background: isTopLeft
                    ? `linear-gradient(135deg, rgba(255, 0, 68, ${intensity * 0.1}) 0%, transparent 70%)`
                    : `linear-gradient(315deg, rgba(255, 0, 68, ${intensity * 0.1}) 0%, transparent 70%)`,
            }}
        >
            {/* Corruption lines */}
            {Array.from({ length: Math.floor(intensity * 5) }).map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-[#FF0044]/30"
                    style={{
                        width: 2 + Math.random() * 20,
                        height: 1,
                        left: isTopLeft ? i * 10 : undefined,
                        right: isTopLeft ? undefined : i * 10,
                        top: isTopLeft ? i * 8 + Math.random() * 10 : undefined,
                        bottom: isTopLeft ? undefined : i * 8 + Math.random() * 10,
                        transform: `rotate(${isTopLeft ? 45 : -45}deg)`,
                    }}
                />
            ))}
        </div>
    );
}
