"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI_CODE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
];

export default function KonamiCode() {
    const [, setInput] = useState<string[]>([]);
    const [unlocked, setUnlocked] = useState(false);
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const newKey = e.key;

            setInput((prev) => {
                const newInput = [...prev, newKey].slice(-KONAMI_CODE.length);

                if (JSON.stringify(newInput) === JSON.stringify(KONAMI_CODE)) {
                    setUnlocked(true);
                    // Clear any existing timeout before setting a new one
                    if (resetTimeoutRef.current) {
                        clearTimeout(resetTimeoutRef.current);
                    }
                    resetTimeoutRef.current = setTimeout(() => setUnlocked(false), 5000); // Reset after 5s
                    return [];
                }

                return newInput;
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            // Cleanup timeout on unmount
            if (resetTimeoutRef.current) {
                clearTimeout(resetTimeoutRef.current);
            }
        };
    }, []);

    return (
        <AnimatePresence>
            {unlocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-signal/90 flex items-center justify-center pointer-events-none mix-blend-hard-light"
                >
                    <div className="text-center space-y-4">
                        <h1 className="text-9xl font-bold text-void glitch-text" data-text="SYSTEM OVERRIDE">
                            SYSTEM OVERRIDE
                        </h1>
                        <p className="text-2xl font-mono text-void bg-stark inline-block px-4 py-2">
                            SECRET_ACCESS_GRANTED // TRACK_01_PREVIEW_UNLOCKED
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
