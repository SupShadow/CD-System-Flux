"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";
import { useBeat } from "@/contexts/BeatContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";

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
    const { currentTrack, isPlaying } = useAudio();
    const { isBeat, beatIntensity, bassLevel, energy } = useBeat();
    const { disableFlashing } = useAccessibility();
    const [mounted, setMounted] = useState(false);
    const [prevColor, setPrevColor] = useState<string | null>(null);
    const [showFlash, setShowFlash] = useState(false);
    const [showBeatFlash, setShowBeatFlash] = useState(false);
    const lastBeatRef = useRef(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Track color change effect
    useEffect(() => {
        if (!mounted) return;

        const color = currentTrack.color;
        const rgb = hexToRgb(color);

        if (rgb) {
            // Set CSS variables on document root
            document.documentElement.style.setProperty("--track-color", color);
            document.documentElement.style.setProperty("--track-color-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);

            // Trigger flash effect on color change (disabled in safe mode for epilepsy safety)
            if (prevColor && prevColor !== color && !disableFlashing) {
                setShowFlash(true);
                setTimeout(() => setShowFlash(false), 300);
            }

            setPrevColor(color);
        }
    }, [currentTrack.color, mounted, prevColor, disableFlashing]);

    // Beat reactive CSS variables
    useEffect(() => {
        if (!mounted) return;

        // Set beat-reactive CSS variables
        document.documentElement.style.setProperty("--beat-intensity", beatIntensity.toFixed(3));
        document.documentElement.style.setProperty("--bass-level", bassLevel.toFixed(3));
        document.documentElement.style.setProperty("--energy", energy.toFixed(3));
        document.documentElement.style.setProperty("--beat-scale", (1 + beatIntensity * 0.05).toFixed(3));
        document.documentElement.style.setProperty("--beat-glow", (beatIntensity * 20).toFixed(1));
    }, [mounted, beatIntensity, bassLevel, energy]);

    // Beat flash effect (throttled) - disabled in safe mode for epilepsy safety
    useEffect(() => {
        if (isBeat && isPlaying && !disableFlashing) {
            const now = Date.now();
            if (now - lastBeatRef.current > 150) { // Throttle beat flashes
                lastBeatRef.current = now;
                setShowBeatFlash(true);
                setTimeout(() => setShowBeatFlash(false), 100);
            }
        }
    }, [isBeat, isPlaying, disableFlashing]);

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

                /* Beat-reactive CSS variables defaults */
                :root {
                    --beat-intensity: 0;
                    --bass-level: 0;
                    --energy: 0;
                    --beat-scale: 1;
                    --beat-glow: 0;
                }

                /* Beat-reactive utility classes */
                .beat-pulse {
                    transform: scale(var(--beat-scale));
                    transition: transform 0.05s ease-out;
                }

                .beat-glow {
                    filter: drop-shadow(0 0 calc(var(--beat-glow) * 1px) var(--track-color));
                    transition: filter 0.05s ease-out;
                }

                .beat-border {
                    border-color: rgba(var(--track-color-rgb), calc(0.3 + var(--beat-intensity) * 0.5)) !important;
                    box-shadow: 0 0 calc(var(--beat-glow) * 0.5px) rgba(var(--track-color-rgb), calc(var(--beat-intensity) * 0.3));
                    transition: border-color 0.05s ease-out, box-shadow 0.05s ease-out;
                }

                .energy-opacity {
                    opacity: calc(0.5 + var(--energy) * 0.5);
                    transition: opacity 0.1s ease-out;
                }

                /* Beat-reactive background glow */
                .beat-bg-glow {
                    background: radial-gradient(
                        circle at center,
                        rgba(var(--track-color-rgb), calc(var(--beat-intensity) * 0.15)) 0%,
                        transparent 70%
                    );
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

            {/* Beat flash effect - subtle pulse on beat */}
            <AnimatePresence>
                {showBeatFlash && isPlaying && (
                    <motion.div
                        className="fixed inset-0 pointer-events-none z-[2]"
                        initial={{ opacity: 0.08 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            background: `radial-gradient(circle at 50% 80%, ${currentTrack.color} 0%, transparent 50%)`,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Ambient glow that reacts to bass level */}
            <div
                className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-100"
                style={{
                    background: `radial-gradient(ellipse at 50% 100%, rgba(var(--track-color-rgb), ${isPlaying ? 0.03 + bassLevel * 0.08 : 0.03}) 0%, transparent 50%)`,
                    opacity: 1,
                }}
            />
        </>
    );
}
