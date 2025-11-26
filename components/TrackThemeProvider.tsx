"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

export default function TrackThemeProvider() {
    const { currentTrack } = useAudio();
    const [mounted, setMounted] = useState(false);
    const [prevColor, setPrevColor] = useState<string | null>(null);
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const color = currentTrack.color;
        const rgb = hexToRgb(color);

        if (rgb) {
            // Set CSS variables on document root
            document.documentElement.style.setProperty("--track-color", color);
            document.documentElement.style.setProperty("--track-color-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);

            // Trigger flash effect on color change
            if (prevColor && prevColor !== color) {
                setShowFlash(true);
                setTimeout(() => setShowFlash(false), 300);
            }

            setPrevColor(color);
        }
    }, [currentTrack.color, mounted, prevColor]);

    if (!mounted) return null;

    return (
        <>
            {/* Global style injection */}
            <style jsx global>{`
                :root {
                    --track-color: ${currentTrack.color};
                    --track-color-rgb: ${hexToRgb(currentTrack.color)?.r || 255}, ${hexToRgb(currentTrack.color)?.g || 69}, ${hexToRgb(currentTrack.color)?.b || 0};
                }

                /* Override signal color with track color */
                .text-signal {
                    color: var(--track-color) !important;
                }

                .bg-signal {
                    background-color: var(--track-color) !important;
                }

                .border-signal {
                    border-color: var(--track-color) !important;
                }

                .border-signal\\/30 {
                    border-color: rgba(var(--track-color-rgb), 0.3) !important;
                }

                .border-signal\\/50 {
                    border-color: rgba(var(--track-color-rgb), 0.5) !important;
                }

                .bg-signal\\/5 {
                    background-color: rgba(var(--track-color-rgb), 0.05) !important;
                }

                .bg-signal\\/10 {
                    background-color: rgba(var(--track-color-rgb), 0.1) !important;
                }

                .bg-signal\\/20 {
                    background-color: rgba(var(--track-color-rgb), 0.2) !important;
                }

                .fill-signal {
                    fill: var(--track-color) !important;
                }

                .shadow-\\[0_0_20px_rgba\\(255\\,69\\,0\\,0\\.3\\)\\] {
                    box-shadow: 0 0 20px rgba(var(--track-color-rgb), 0.3) !important;
                }

                .shadow-\\[0_0_10px_rgba\\(255\\,69\\,0\\,0\\.8\\)\\] {
                    box-shadow: 0 0 10px rgba(var(--track-color-rgb), 0.8) !important;
                }

                /* Selection color */
                ::selection {
                    background: rgba(var(--track-color-rgb), 0.4) !important;
                }

                ::-moz-selection {
                    background: rgba(var(--track-color-rgb), 0.4) !important;
                }
            `}</style>

            {/* Color transition flash effect */}
            <AnimatePresence>
                {showFlash && (
                    <motion.div
                        className="fixed inset-0 pointer-events-none z-[9999]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            background: `radial-gradient(circle at center, ${currentTrack.color} 0%, transparent 70%)`,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Ambient glow that changes with track */}
            <motion.div
                className="fixed inset-0 pointer-events-none z-[1]"
                animate={{
                    background: `radial-gradient(ellipse at 50% 100%, rgba(var(--track-color-rgb), 0.05) 0%, transparent 50%)`,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
            />
        </>
    );
}
