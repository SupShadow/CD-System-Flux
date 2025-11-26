"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";

export default function GlitchTransition() {
    const { currentTrackIndex, isPlaying } = useAudio();
    const [showGlitch, setShowGlitch] = useState(false);
    const [mounted, setMounted] = useState(false);
    const prevTrackRef = useRef(currentTrackIndex);
    const isFirstRender = useRef(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Trigger glitch on track change
    useEffect(() => {
        if (!mounted) return;

        // Skip first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            prevTrackRef.current = currentTrackIndex;
            return;
        }

        // Only trigger if track actually changed and we're playing
        if (prevTrackRef.current !== currentTrackIndex) {
            prevTrackRef.current = currentTrackIndex;

            setShowGlitch(true);

            // Glitch duration
            setTimeout(() => {
                setShowGlitch(false);
            }, 400);
        }
    }, [currentTrackIndex, mounted]);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {showGlitch && (
                <>
                    {/* Main glitch overlay */}
                    <motion.div
                        className="fixed inset-0 pointer-events-none z-[9998]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        {/* Chromatic aberration layers */}
                        <motion.div
                            className="absolute inset-0 mix-blend-screen"
                            style={{
                                background: "linear-gradient(90deg, rgba(255,0,0,0.1) 0%, transparent 50%, rgba(0,255,255,0.1) 100%)",
                            }}
                            animate={{
                                x: [0, -10, 5, -3, 0],
                                opacity: [0, 1, 0.5, 1, 0],
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        />

                        {/* Horizontal scan line burst */}
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(var(--track-color-rgb), 0.3) 2px, rgba(var(--track-color-rgb), 0.3) 4px)",
                            }}
                            initial={{ opacity: 0, scaleY: 0.5 }}
                            animate={{
                                opacity: [0, 0.8, 0.4, 0.6, 0],
                                scaleY: [0.5, 1, 1, 1, 0.5],
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />

                        {/* Noise layer */}
                        <motion.div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                            }}
                            animate={{
                                opacity: [0, 0.3, 0.1, 0.2, 0],
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.div>

                    {/* Glitch slice effects */}
                    <GlitchSlices />

                    {/* Flash */}
                    <motion.div
                        className="fixed inset-0 pointer-events-none z-[9997]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.3, 0] }}
                        transition={{ duration: 0.2, times: [0, 0.1, 1] }}
                        style={{
                            background: "var(--track-color)",
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    );
}

// Horizontal glitch slices that appear briefly
function GlitchSlices() {
    const slices = [
        { top: "15%", height: "3px", delay: 0 },
        { top: "35%", height: "5px", delay: 0.05 },
        { top: "52%", height: "2px", delay: 0.1 },
        { top: "68%", height: "4px", delay: 0.03 },
        { top: "85%", height: "3px", delay: 0.08 },
    ];

    return (
        <>
            {slices.map((slice, i) => (
                <motion.div
                    key={i}
                    className="fixed left-0 right-0 pointer-events-none z-[9999] overflow-hidden"
                    style={{
                        top: slice.top,
                        height: slice.height,
                    }}
                    initial={{ x: 0, opacity: 0 }}
                    animate={{
                        x: [0, Math.random() > 0.5 ? 20 : -20, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 0.15,
                        delay: slice.delay,
                        ease: "easeInOut",
                    }}
                >
                    <div
                        className="w-full h-full"
                        style={{
                            background: `linear-gradient(90deg,
                                transparent 0%,
                                rgba(var(--track-color-rgb), 0.8) 20%,
                                rgba(0, 255, 255, 0.5) 50%,
                                rgba(255, 0, 255, 0.5) 80%,
                                transparent 100%
                            )`,
                        }}
                    />
                </motion.div>
            ))}
        </>
    );
}
