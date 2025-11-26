"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function ParallaxLayers() {
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll();

    // Different parallax speeds for depth effect
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);

    // Smooth spring animation
    const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
    const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });

    // Opacity based on scroll - very subtle
    const opacity1 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.15, 0.25, 0.15, 0.05]);
    const opacity2 = useTransform(scrollYProgress, [0, 0.5, 1], [0.08, 0.15, 0.05]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none overflow-hidden z-[0]"
            aria-hidden="true"
        >
            {/* Layer 1 - Furthest back, slowest */}
            <motion.div
                className="absolute inset-0"
                style={{ y: springY1, opacity: opacity1 }}
            >
                {/* Large ambient orbs - very subtle */}
                <div
                    className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, rgba(var(--track-color-rgb), 0.04) 0%, transparent 70%)",
                        top: "10%",
                        left: "-10%",
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
                    style={{
                        background: "radial-gradient(circle, rgba(var(--track-color-rgb), 0.025) 0%, transparent 70%)",
                        top: "60%",
                        right: "-5%",
                    }}
                />
            </motion.div>

            {/* Layer 2 - Middle layer - subtle corner accents only */}
            <motion.div
                className="absolute inset-0"
                style={{ y: springY2, opacity: opacity2 }}
            >
                {/* Corner accents - very subtle */}
                <div className="absolute top-8 left-8 w-16 h-16" style={{ borderLeft: "1px solid rgba(var(--track-color-rgb), 0.06)", borderTop: "1px solid rgba(var(--track-color-rgb), 0.06)" }} />
                <div className="absolute top-8 right-8 w-16 h-16" style={{ borderRight: "1px solid rgba(var(--track-color-rgb), 0.06)", borderTop: "1px solid rgba(var(--track-color-rgb), 0.06)" }} />
                <div className="absolute bottom-32 left-8 w-16 h-16" style={{ borderLeft: "1px solid rgba(var(--track-color-rgb), 0.06)", borderBottom: "1px solid rgba(var(--track-color-rgb), 0.06)" }} />
                <div className="absolute bottom-32 right-8 w-16 h-16" style={{ borderRight: "1px solid rgba(var(--track-color-rgb), 0.06)", borderBottom: "1px solid rgba(var(--track-color-rgb), 0.06)" }} />
            </motion.div>

            {/* Depth gradient overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, transparent 20%, transparent 80%, rgba(10,10,15,0.5) 100%)",
                }}
            />
        </div>
    );
}
