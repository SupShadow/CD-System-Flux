"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks";

interface Particle {
    id: number;
    x: number;
    y: number;
    angle: number;
    velocity: number;
    size: number;
    color: string;
}

interface Explosion {
    id: number;
    x: number;
    y: number;
    particles: Particle[];
}

const PARTICLE_COLORS = [
    "rgba(255, 69, 0, 1)",      // Signal orange
    "rgba(255, 69, 0, 0.8)",
    "rgba(255, 120, 50, 1)",    // Lighter orange
    "rgba(255, 200, 100, 1)",   // Yellow-orange
    "rgba(255, 255, 255, 0.8)", // White spark
];

// Simplified colors for mobile (fewer variations = less computation)
const PARTICLE_COLORS_MOBILE = [
    "rgba(255, 69, 0, 1)",
    "rgba(255, 120, 50, 1)",
    "rgba(255, 255, 255, 0.8)",
];

export default function ClickExplosion() {
    const [explosions, setExplosions] = useState<Explosion[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isWarmedUp, setIsWarmedUp] = useState(false);
    const isMobile = useIsMobile();
    // Track if we've done the initial "warm-up" animation
    const warmupDoneRef = useRef(false);

    useEffect(() => {
        setMounted(true);

        // Prewarm Framer Motion on mount to prevent first-click stutter
        // This triggers the animation engine initialization ahead of time
        if (!warmupDoneRef.current) {
            warmupDoneRef.current = true;
            // Small delay to not block initial render
            const timer = setTimeout(() => {
                setIsWarmedUp(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    const createExplosion = useCallback((x: number, y: number) => {
        // Significantly fewer particles on mobile (6-8 vs 12-20)
        const particleCount = isMobile
            ? 6 + Math.floor(Math.random() * 3)  // 6-8 particles on mobile
            : 12 + Math.floor(Math.random() * 8); // 12-20 particles on desktop

        const particles: Particle[] = [];
        const colors = isMobile ? PARTICLE_COLORS_MOBILE : PARTICLE_COLORS;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                id: i,
                x: 0,
                y: 0,
                angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5,
                // Shorter distance on mobile for snappier feel
                velocity: isMobile
                    ? 50 + Math.random() * 60   // 50-110px on mobile
                    : 80 + Math.random() * 120, // 80-200px on desktop
                // Slightly smaller particles on mobile
                size: isMobile
                    ? 2 + Math.random() * 2     // 2-4px on mobile
                    : 2 + Math.random() * 4,    // 2-6px on desktop
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        const explosion: Explosion = {
            id: Date.now() + Math.random(),
            x,
            y,
            particles,
        };

        setExplosions(prev => [...prev, explosion]);

        // Remove explosion after animation (shorter on mobile)
        setTimeout(() => {
            setExplosions(prev => prev.filter(e => e.id !== explosion.id));
        }, isMobile ? 400 : 600);
    }, [isMobile]);

    useEffect(() => {
        if (!mounted) return;

        const handleClick = (e: MouseEvent) => {
            createExplosion(e.clientX, e.clientY);
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [mounted, createExplosion]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {/* Pre-warm element: invisible animated div to initialize Framer Motion */}
            {isWarmedUp && (
                <motion.div
                    className="absolute opacity-0 w-1 h-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.001 }}
                    style={{ pointerEvents: "none" }}
                />
            )}

            <AnimatePresence>
                {explosions.map(explosion => (
                    <div
                        key={explosion.id}
                        className="absolute"
                        style={{
                            left: explosion.x,
                            top: explosion.y,
                            willChange: "transform",
                        }}
                    >
                        {/* Central flash - smaller on mobile */}
                        <motion.div
                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{
                                willChange: "width, height, opacity",
                                transform: "translateZ(0)",
                            }}
                            initial={{
                                width: isMobile ? 8 : 10,
                                height: isMobile ? 8 : 10,
                                opacity: 1,
                                background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,69,0,0.8) 50%, transparent 100%)"
                            }}
                            animate={{
                                width: isMobile ? 25 : 40,
                                height: isMobile ? 25 : 40,
                                opacity: 0
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: isMobile ? 0.2 : 0.3, ease: "easeOut" }}
                        />

                        {/* Particles - no boxShadow on mobile for better performance */}
                        {explosion.particles.map(particle => (
                            <motion.div
                                key={particle.id}
                                className="absolute rounded-full"
                                style={{
                                    width: particle.size,
                                    height: particle.size,
                                    backgroundColor: particle.color,
                                    // Skip expensive boxShadow on mobile
                                    boxShadow: isMobile ? undefined : `0 0 ${particle.size * 2}px ${particle.color}`,
                                    left: -particle.size / 2,
                                    top: -particle.size / 2,
                                    willChange: "transform, opacity",
                                    // Force GPU acceleration
                                    transform: "translateZ(0)",
                                }}
                                initial={{
                                    x: 0,
                                    y: 0,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                animate={{
                                    x: Math.cos(particle.angle) * particle.velocity,
                                    y: Math.sin(particle.angle) * particle.velocity,
                                    opacity: 0,
                                    scale: 0,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    // Shorter, more consistent duration on mobile
                                    duration: isMobile ? 0.25 : 0.4 + Math.random() * 0.2,
                                    ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
                                }}
                            />
                        ))}

                        {/* Ring expand effect - smaller on mobile */}
                        <motion.div
                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/50"
                            style={{
                                willChange: "width, height, opacity",
                                transform: "translateZ(0)",
                            }}
                            initial={{ width: 0, height: 0, opacity: isMobile ? 0.6 : 0.8 }}
                            animate={{ width: isMobile ? 40 : 60, height: isMobile ? 40 : 60, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: isMobile ? 0.25 : 0.4, ease: "easeOut" }}
                        />

                        {/* Spark lines - skip on mobile for better performance */}
                        {!isMobile && [0, 1, 2, 3].map(i => (
                            <motion.div
                                key={`spark-${i}`}
                                className="absolute bg-signal/80"
                                style={{
                                    width: 2,
                                    height: 15,
                                    left: -1,
                                    top: -7.5,
                                    transformOrigin: "center center",
                                    rotate: `${i * 90 + 45}deg`,
                                    willChange: "transform, opacity",
                                }}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        ))}
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
