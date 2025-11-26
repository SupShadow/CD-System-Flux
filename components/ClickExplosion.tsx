"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ClickExplosion() {
    const [explosions, setExplosions] = useState<Explosion[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const createExplosion = useCallback((x: number, y: number) => {
        const particleCount = 12 + Math.floor(Math.random() * 8); // 12-20 particles
        const particles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                id: i,
                x: 0,
                y: 0,
                angle: (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5,
                velocity: 80 + Math.random() * 120, // 80-200px
                size: 2 + Math.random() * 4, // 2-6px
                color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
            });
        }

        const explosion: Explosion = {
            id: Date.now() + Math.random(),
            x,
            y,
            particles,
        };

        setExplosions(prev => [...prev, explosion]);

        // Remove explosion after animation
        setTimeout(() => {
            setExplosions(prev => prev.filter(e => e.id !== explosion.id));
        }, 600);
    }, []);

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
            <AnimatePresence>
                {explosions.map(explosion => (
                    <div
                        key={explosion.id}
                        className="absolute"
                        style={{
                            left: explosion.x,
                            top: explosion.y,
                        }}
                    >
                        {/* Central flash */}
                        <motion.div
                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                            initial={{
                                width: 10,
                                height: 10,
                                opacity: 1,
                                background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,69,0,0.8) 50%, transparent 100%)"
                            }}
                            animate={{
                                width: 40,
                                height: 40,
                                opacity: 0
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        />

                        {/* Particles */}
                        {explosion.particles.map(particle => (
                            <motion.div
                                key={particle.id}
                                className="absolute rounded-full"
                                style={{
                                    width: particle.size,
                                    height: particle.size,
                                    backgroundColor: particle.color,
                                    boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                                    left: -particle.size / 2,
                                    top: -particle.size / 2,
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
                                    duration: 0.4 + Math.random() * 0.2,
                                    ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
                                }}
                            />
                        ))}

                        {/* Ring expand effect */}
                        <motion.div
                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/50"
                            initial={{ width: 0, height: 0, opacity: 0.8 }}
                            animate={{ width: 60, height: 60, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />

                        {/* Spark lines */}
                        {[0, 1, 2, 3].map(i => (
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
