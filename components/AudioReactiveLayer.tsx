"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export default function AudioReactiveLayer() {
    const { analyserRef, isPlaying } = useAudio();
    const { disableFlashing } = useAccessibility();
    const [bassLevel, setBassLevel] = useState(0);
    const [midLevel, setMidLevel] = useState(0);
    const [highLevel, setHighLevel] = useState(0);
    const [mounted, setMounted] = useState(false);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const analyzeAudio = () => {
            const analyser = analyserRef.current;

            if (analyser && isPlaying) {
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);

                // Get frequency bands
                // Bass: 0-10 (roughly 0-200Hz)
                let bassSum = 0;
                for (let i = 0; i < 10; i++) {
                    bassSum += dataArray[i];
                }
                const bassAvg = bassSum / 10 / 255;

                // Mids: 10-50 (roughly 200Hz-2kHz)
                let midSum = 0;
                for (let i = 10; i < 50; i++) {
                    midSum += dataArray[i];
                }
                const midAvg = midSum / 40 / 255;

                // Highs: 50-128 (roughly 2kHz-20kHz)
                let highSum = 0;
                for (let i = 50; i < bufferLength; i++) {
                    highSum += dataArray[i];
                }
                const highAvg = highSum / (bufferLength - 50) / 255;

                setBassLevel(bassAvg);
                setMidLevel(midAvg);
                setHighLevel(highAvg);
            } else {
                // Fade out when not playing
                setBassLevel(prev => prev * 0.95);
                setMidLevel(prev => prev * 0.95);
                setHighLevel(prev => prev * 0.95);
            }

            animationRef.current = requestAnimationFrame(analyzeAudio);
        };

        analyzeAudio();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyserRef, isPlaying, mounted]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
            {/* Bass-reactive center glow */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    width: 400 + bassLevel * 300,
                    height: 400 + bassLevel * 300,
                    background: `radial-gradient(circle, rgba(255,69,0,${0.1 + bassLevel * 0.3}) 0%, transparent 70%)`,
                    filter: `blur(${40 + bassLevel * 20}px)`,
                }}
                animate={{
                    scale: [1, 1 + bassLevel * 0.3, 1],
                }}
                transition={{
                    duration: 0.1,
                    ease: "easeOut",
                }}
            />

            {/* Left side pulse - reacts to mids */}
            <motion.div
                className="absolute left-0 top-1/3 rounded-full"
                style={{
                    width: 300 + midLevel * 200,
                    height: 300 + midLevel * 200,
                    background: `radial-gradient(circle, rgba(255,69,0,${0.05 + midLevel * 0.2}) 0%, transparent 70%)`,
                    filter: `blur(${50 + midLevel * 30}px)`,
                    transform: `translateX(-50%)`,
                }}
            />

            {/* Right side pulse - reacts to highs */}
            <motion.div
                className="absolute right-0 top-2/3 rounded-full"
                style={{
                    width: 250 + highLevel * 150,
                    height: 250 + highLevel * 150,
                    background: `radial-gradient(circle, rgba(255,69,0,${0.05 + highLevel * 0.15}) 0%, transparent 70%)`,
                    filter: `blur(${60 + highLevel * 20}px)`,
                    transform: `translateX(50%)`,
                }}
            />

            {/* Bass hit flash - very brief, only on strong hits - disabled in safe mode */}
            {!disableFlashing && bassLevel > 0.6 && (
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0.15 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        background: "radial-gradient(circle at center, rgba(255,69,0,0.1) 0%, transparent 50%)",
                    }}
                />
            )}

            {/* Floating particles that react to audio */}
            {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-signal"
                    style={{
                        width: 4 + bassLevel * 8,
                        height: 4 + bassLevel * 8,
                        left: `${15 + i * 15}%`,
                        top: `${20 + (i % 3) * 25}%`,
                        opacity: 0.3 + (i % 2 === 0 ? bassLevel : midLevel) * 0.5,
                        filter: `blur(${1 + bassLevel * 2}px)`,
                        boxShadow: `0 0 ${10 + bassLevel * 20}px rgba(255,69,0,${0.5 + bassLevel * 0.5})`,
                    }}
                    animate={{
                        y: [0, -20 - bassLevel * 30, 0],
                        scale: [1, 1 + bassLevel * 0.5, 1],
                    }}
                    transition={{
                        duration: 0.3 + i * 0.1,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Edge vignette that pulses with bass */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 40%, rgba(255,69,0,${bassLevel * 0.08}) 100%)`,
                    pointerEvents: "none",
                }}
            />
        </div>
    );
}
