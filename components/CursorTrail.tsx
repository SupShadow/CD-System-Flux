"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
}

export default function CursorTrail() {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const createParticle = useCallback((x: number, y: number) => {
        const particle: Particle = {
            id: Date.now() + Math.random(),
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            size: Math.random() * 4 + 2,
            opacity: Math.random() * 0.5 + 0.3,
        };
        return particle;
    }, []);

    useEffect(() => {
        if (!mounted) return;

        let timeoutId: NodeJS.Timeout;
        let particleInterval: NodeJS.Timeout;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            setIsMoving(true);

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setIsMoving(false), 100);
        };

        const spawnParticles = () => {
            if (isMoving) {
                setParticles(prev => {
                    const newParticles = [...prev, createParticle(mousePos.x, mousePos.y)];
                    // Keep max 15 particles for performance
                    return newParticles.slice(-15);
                });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        particleInterval = setInterval(spawnParticles, 50);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(timeoutId);
            clearInterval(particleInterval);
        };
    }, [mounted, isMoving, mousePos, createParticle]);

    // Clean up old particles
    useEffect(() => {
        if (!mounted) return;

        const cleanup = setInterval(() => {
            setParticles(prev => prev.slice(-12));
        }, 500);

        return () => clearInterval(cleanup);
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[60]">
            {/* Main cursor glow */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 20,
                    height: 20,
                    background: "radial-gradient(circle, rgba(255,69,0,0.4) 0%, transparent 70%)",
                    boxShadow: "0 0 20px rgba(255,69,0,0.3), 0 0 40px rgba(255,69,0,0.1)",
                }}
                animate={{
                    x: mousePos.x - 10,
                    y: mousePos.y - 10,
                    scale: isMoving ? 1.2 : 1,
                }}
                transition={{
                    type: "spring",
                    damping: 30,
                    stiffness: 200,
                    mass: 0.5,
                }}
            />

            {/* Trailing particles */}
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            background: `radial-gradient(circle, rgba(255,69,0,${particle.opacity}) 0%, transparent 100%)`,
                            boxShadow: `0 0 ${particle.size * 2}px rgba(255,69,0,${particle.opacity * 0.5})`,
                        }}
                        initial={{
                            x: particle.x - particle.size / 2,
                            y: particle.y - particle.size / 2,
                            scale: 1,
                            opacity: particle.opacity,
                        }}
                        animate={{
                            y: particle.y - particle.size / 2 - 30,
                            scale: 0.5,
                            opacity: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 1,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Connection line to cursor */}
            {particles.length > 0 && (
                <svg className="absolute inset-0 w-full h-full">
                    <defs>
                        <linearGradient id="cursorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,69,0,0)" />
                            <stop offset="100%" stopColor="rgba(255,69,0,0.3)" />
                        </linearGradient>
                    </defs>
                    {particles.slice(-3).map((particle, i) => (
                        <motion.line
                            key={`line-${particle.id}`}
                            x1={particle.x}
                            y1={particle.y}
                            x2={mousePos.x}
                            y2={mousePos.y}
                            stroke="url(#cursorGradient)"
                            strokeWidth="1"
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        />
                    ))}
                </svg>
            )}
        </div>
    );
}
