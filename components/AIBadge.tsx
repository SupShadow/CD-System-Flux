"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function AIBadge() {
    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <motion.a
            href="https://derguggeis.de"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-24 right-4 md:bottom-28 md:right-6 z-[60] group cursor-pointer"
        >
            <motion.div
                className="relative flex items-center gap-2 px-3 py-1.5 bg-void-deep/90 backdrop-blur-sm border border-signal/30 overflow-hidden"
                animate={{
                    borderColor: isHovered ? "rgba(255, 69, 0, 0.8)" : "rgba(255, 69, 0, 0.3)",
                }}
                transition={{ duration: 0.3 }}
            >
                {/* Animated background glow on hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-signal/0 via-signal/10 to-signal/0"
                    animate={{
                        x: isHovered ? ["-100%", "100%"] : "-100%",
                    }}
                    transition={{
                        duration: 1,
                        repeat: isHovered ? Infinity : 0,
                        ease: "linear",
                    }}
                />

                {/* Icon */}
                <motion.div
                    animate={{
                        scale: isHovered ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: isHovered ? Infinity : 0,
                    }}
                >
                    <Zap className="w-3 h-3 text-signal fill-signal" />
                </motion.div>

                {/* Text */}
                <span className="font-mono text-[10px] tracking-wider text-stark/70 group-hover:text-stark transition-colors relative z-10">
                    CRAFTED BY{" "}
                    <span className="text-signal font-bold">GUGGEIS.AI</span>
                </span>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-signal/50" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-signal/50" />
                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-signal/50" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-signal/50" />

                {/* Pulse ring on hover */}
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 border border-signal/50"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />
                )}
            </motion.div>
        </motion.a>
    );
}
