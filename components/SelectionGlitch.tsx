"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SelectionGlitch() {
    const [isSelecting, setIsSelecting] = useState(false);
    const [safeMode, setSafeMode] = useState(false);

    // Check for safe mode from body class (set by AccessibilityProvider)
    useEffect(() => {
        const checkSafeMode = () => {
            setSafeMode(document.body.classList.contains("safe-mode"));
        };

        // Initial check
        checkSafeMode();

        // Watch for changes
        const observer = new MutationObserver(checkSafeMode);
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

        return () => observer.disconnect();
    }, []);
    const [glitchPosition, setGlitchPosition] = useState({ x: 0, y: 0 });
    const [glitchKey, setGlitchKey] = useState(0);

    useEffect(() => {
        let selectionTimeout: NodeJS.Timeout;
        let mouseUpTimeout: NodeJS.Timeout;

        const handleSelectionChange = () => {
            const selection = window.getSelection();

            if (selection && selection.toString().length > 0) {
                // Get selection position
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                setGlitchPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                });

                setIsSelecting(true);
                setGlitchKey(prev => prev + 1);

                // Clear any existing timeout
                clearTimeout(selectionTimeout);

                // Keep glitch active while selecting
                selectionTimeout = setTimeout(() => {
                    setIsSelecting(false);
                }, 150);
            }
        };

        const handleMouseUp = () => {
            // Trigger final glitch on mouse up if there's a selection
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                setGlitchKey(prev => prev + 1);
                // Clear any existing mouseUp timeout to prevent stacking
                clearTimeout(mouseUpTimeout);
                mouseUpTimeout = setTimeout(() => setIsSelecting(false), 200);
            }
        };

        document.addEventListener("selectionchange", handleSelectionChange);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
            document.removeEventListener("mouseup", handleMouseUp);
            clearTimeout(selectionTimeout);
            clearTimeout(mouseUpTimeout);
        };
    }, []);

    return (
        <>
            {/* Global selection styles */}
            <style jsx global>{`
                ::selection {
                    background: rgba(255, 69, 0, 0.4);
                    color: #fff;
                    text-shadow:
                        2px 0 #ff4500,
                        -2px 0 #00ffff,
                        0 0 8px rgba(255, 69, 0, 0.8);
                }

                ::-moz-selection {
                    background: rgba(255, 69, 0, 0.4);
                    color: #fff;
                    text-shadow:
                        2px 0 #ff4500,
                        -2px 0 #00ffff,
                        0 0 8px rgba(255, 69, 0, 0.8);
                }
            `}</style>

            {/* Glitch overlay effect - disabled in safe mode for epilepsy safety */}
            <AnimatePresence>
                {isSelecting && !safeMode && (
                    <>
                        {/* Screen glitch lines */}
                        <motion.div
                            key={`glitch-line-1-${glitchKey}`}
                            className="fixed left-0 right-0 h-[2px] bg-signal/30 pointer-events-none z-[9999]"
                            style={{ top: glitchPosition.y - 20 }}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scaleX: [0, 1, 0],
                                x: [-10, 10, -5, 0],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        />
                        <motion.div
                            key={`glitch-line-2-${glitchKey}`}
                            className="fixed left-0 right-0 h-[1px] bg-cyan-500/40 pointer-events-none z-[9999]"
                            style={{ top: glitchPosition.y + 15 }}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scaleX: [0, 1, 0],
                                x: [10, -10, 5, 0],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12, delay: 0.02 }}
                        />

                        {/* Glitch flash at selection */}
                        <motion.div
                            key={`glitch-flash-${glitchKey}`}
                            className="fixed w-32 h-8 pointer-events-none z-[9999]"
                            style={{
                                left: glitchPosition.x - 64,
                                top: glitchPosition.y - 16,
                                background: "linear-gradient(90deg, transparent, rgba(255, 69, 0, 0.3), transparent)",
                                mixBlendMode: "screen",
                            }}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{
                                opacity: [0, 0.8, 0],
                                scaleX: [0.5, 1.5, 0],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />

                        {/* RGB split effect */}
                        <motion.div
                            key={`rgb-split-${glitchKey}`}
                            className="fixed inset-0 pointer-events-none z-[9998]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            style={{
                                background: `
                                    linear-gradient(90deg,
                                        rgba(255, 0, 0, 0.05) 0%,
                                        transparent 33%,
                                        rgba(0, 255, 255, 0.05) 66%,
                                        transparent 100%
                                    )
                                `,
                            }}
                        />

                        {/* Scanline burst */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <motion.div
                                key={`scanline-${i}-${glitchKey}`}
                                className="fixed left-0 right-0 h-[1px] pointer-events-none z-[9999]"
                                style={{
                                    top: glitchPosition.y + (i - 1) * 8,
                                    background: i === 1
                                        ? "rgba(255, 69, 0, 0.6)"
                                        : "rgba(255, 69, 0, 0.2)",
                                }}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    x: 0,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1, delay: i * 0.02 }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
