"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
    { text: "> INITIALIZING FLUX_OS v1.0...", delay: 0 },
    { text: "> LOADING NEURAL NETWORK", delay: 400, hasProgress: true },
    { text: "> ESTABLISHING AGENT_CONNECTION...", delay: 1800 },
    { text: "> SYNCING AUDIO_MODULES...", delay: 2400 },
    { text: "> CALIBRATING VISUAL_CORTEX...", delay: 3000 },
    { text: "> AUTHENTICATION: AUTHORIZED", delay: 3600, isSuccess: true },
    { text: "> SYSTEM ONLINE.", delay: 4200, isSuccess: true, isFinal: true },
];

function ProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const duration = 1200;
        const interval = 30;
        const increment = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return Math.min(prev + increment + Math.random() * 5, 100);
            });
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const blocks = Math.floor(progress / 5);
    const progressBar = "█".repeat(blocks) + "░".repeat(20 - blocks);

    return (
        <span className="text-signal">
            [{progressBar}] {Math.floor(progress)}%
        </span>
    );
}

export default function BootSequence({ children }: { children: React.ReactNode }) {
    const [isBooting, setIsBooting] = useState(true);
    const [visibleLines, setVisibleLines] = useState<number[]>([]);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Check if already booted this session
        const hasBooted = sessionStorage.getItem("flux_booted");
        if (hasBooted) {
            setIsBooting(false);
            setShowContent(true);
            return;
        }

        // Track all timeout IDs for cleanup
        const timeoutIds: NodeJS.Timeout[] = [];

        // Show boot sequence
        BOOT_LINES.forEach((line, index) => {
            const timeoutId = setTimeout(() => {
                setVisibleLines(prev => [...prev, index]);
            }, line.delay);
            timeoutIds.push(timeoutId);
        });

        // End boot sequence
        const endBootTimeoutId = setTimeout(() => {
            sessionStorage.setItem("flux_booted", "true");
            setIsBooting(false);
            const showContentTimeoutId = setTimeout(() => setShowContent(true), 500);
            timeoutIds.push(showContentTimeoutId);
        }, 5000);
        timeoutIds.push(endBootTimeoutId);

        // Cleanup: clear all timeouts on unmount
        return () => {
            timeoutIds.forEach(id => clearTimeout(id));
        };
    }, []);

    return (
        <>
            <AnimatePresence>
                {isBooting && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[100] bg-void flex items-center justify-center"
                    >
                        {/* Scanlines overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-30" />

                        {/* Boot terminal */}
                        <div className="w-full max-w-2xl px-8">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-8 text-center"
                            >
                                <div className="font-mono text-xs text-stark/30 mb-2">
                                    ╔══════════════════════════════════════╗
                                </div>
                                <div className="font-mono text-signal text-lg tracking-widest glitch-text" data-text="FLUX_OS">
                                    FLUX_OS
                                </div>
                                <div className="font-mono text-xs text-stark/30 mt-2">
                                    ╚══════════════════════════════════════╝
                                </div>
                            </motion.div>

                            {/* Boot lines */}
                            <div className="font-mono text-sm space-y-2">
                                {BOOT_LINES.map((line, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={visibleLines.includes(index) ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.2 }}
                                        className={`${line.isSuccess ? "text-signal" : "text-stark/70"}`}
                                    >
                                        {line.text}
                                        {line.hasProgress && visibleLines.includes(index) && (
                                            <span className="ml-2">
                                                <ProgressBar />
                                            </span>
                                        )}
                                        {line.isFinal && visibleLines.includes(index) && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 1, 0, 1] }}
                                                transition={{ duration: 0.5, times: [0, 0.25, 0.5, 1] }}
                                                className="ml-2"
                                            >
                                                █
                                            </motion.span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Loading indicator */}
                            {visibleLines.length < BOOT_LINES.length && (
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="mt-4 font-mono text-xs text-stark/50"
                                >
                                    Processing...
                                </motion.div>
                            )}
                        </div>

                        {/* Corner decorations */}
                        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-signal/30" />
                        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-signal/30" />
                        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-signal/30" />
                        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-signal/30" />

                        {/* Guggeis.AI credit */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] text-stark/30"
                        >
                            POWERED BY GUGGEIS.AI
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            >
                {children}
            </motion.div>
        </>
    );
}
