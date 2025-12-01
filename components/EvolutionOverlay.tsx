"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/contexts/ExperienceContext";
import { Zap } from "lucide-react";

// Evolution stage names and descriptions
const EVOLUTION_STAGES = [
    { name: "INIT", description: "System initialized" },
    { name: "AWARE", description: "Pattern recognition active" },
    { name: "CONNECTED", description: "Neural pathways forming" },
    { name: "INTEGRATED", description: "Full synchronization" },
    { name: "FLUX", description: "Transcendence achieved" },
];

export function EvolutionOverlay() {
    const { state, getEvolutionColors } = useExperience();
    const [showTransition, setShowTransition] = useState(false);
    const [prevStage, setPrevStage] = useState(state.evolutionStage);
    const colors = getEvolutionColors();
    const isFirstRender = useRef(true);

    // Apply evolution colors as CSS variables
    useEffect(() => {
        document.documentElement.style.setProperty("--evolution-primary", colors.primary);
        document.documentElement.style.setProperty("--evolution-secondary", colors.secondary);
        document.documentElement.style.setProperty("--evolution-glow", colors.glow);
        document.documentElement.style.setProperty("--evolution-stage", state.evolutionStage.toString());
    }, [colors, state.evolutionStage]);

    // Show transition animation when stage changes
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (state.evolutionStage !== prevStage && state.evolutionStage > prevStage) {
            setShowTransition(true);
            const timeout = setTimeout(() => {
                setShowTransition(false);
                setPrevStage(state.evolutionStage);
            }, 3000);
            return () => clearTimeout(timeout);
        }
        setPrevStage(state.evolutionStage);
    }, [state.evolutionStage, prevStage]);

    const stageInfo = EVOLUTION_STAGES[state.evolutionStage] || EVOLUTION_STAGES[0];

    return (
        <>
            {/* Evolution glow effect on edges */}
            <div
                className="fixed inset-0 pointer-events-none z-[4]"
                style={{
                    boxShadow: `inset 0 0 ${60 + state.evolutionStage * 20}px ${colors.glow}`,
                    transition: "box-shadow 2s ease-in-out",
                }}
                aria-hidden="true"
            />

            {/* Stage transition animation */}
            <AnimatePresence>
                {showTransition && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
                    >
                        {/* Flash effect */}
                        <motion.div
                            initial={{ opacity: 0.8, scale: 0.5 }}
                            animate={{ opacity: 0, scale: 3 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0"
                            style={{ backgroundColor: colors.primary }}
                        />

                        {/* Stage info card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="relative bg-black/90 border-2 px-8 py-6 text-center"
                            style={{ borderColor: colors.primary }}
                        >
                            {/* Glitch lines */}
                            <motion.div
                                className="absolute inset-0"
                                style={{ backgroundColor: colors.primary }}
                                animate={{ opacity: [0, 0.3, 0], scaleX: [1, 1.02, 1] }}
                                transition={{ duration: 0.1, repeat: 5, repeatDelay: 0.2 }}
                            />

                            <div className="relative">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Zap size={16} style={{ color: colors.primary }} />
                                    <span className="font-mono text-xs" style={{ color: colors.primary }}>
                                        EVOLUTION_DETECTED
                                    </span>
                                </div>

                                <motion.div
                                    className="font-mono text-4xl font-bold mb-2"
                                    style={{ color: colors.primary }}
                                    animate={{ textShadow: [`0 0 10px ${colors.glow}`, `0 0 30px ${colors.glow}`, `0 0 10px ${colors.glow}`] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    STAGE_{state.evolutionStage}
                                </motion.div>

                                <div className="font-mono text-lg text-white mb-1">
                                    {stageInfo.name}
                                </div>

                                <div className="font-mono text-xs text-white/60">
                                    {stageInfo.description}
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 h-1 bg-white/10 w-48 mx-auto">
                                    <motion.div
                                        className="h-full"
                                        style={{ backgroundColor: colors.primary }}
                                        initial={{ width: `${((state.evolutionStage - 1) / 4) * 100}%` }}
                                        animate={{ width: `${(state.evolutionStage / 4) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Corner decorations */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2" style={{ borderColor: colors.primary }} />
                            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2" style={{ borderColor: colors.primary }} />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2" style={{ borderColor: colors.primary }} />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2" style={{ borderColor: colors.primary }} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient particles based on evolution stage */}
            {state.evolutionStage >= 2 && <EvolutionParticles stage={state.evolutionStage} color={colors.primary} />}
        </>
    );
}

function EvolutionParticles({ stage, color }: { stage: number; color: string }) {
    const particleCount = stage * 5;
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; speed: number }[]>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 3,
            speed: 10 + Math.random() * 20,
        }));
        setParticles(newParticles);
    }, [particleCount]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden" aria-hidden="true">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: color,
                        opacity: 0.3,
                    }}
                    animate={{
                        y: ["-10vh", "110vh"],
                        opacity: [0, 0.5, 0],
                    }}
                    transition={{
                        duration: particle.speed,
                        repeat: Infinity,
                        delay: Math.random() * particle.speed,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
}

// Evolution stage indicator for header/footer
export function EvolutionBadge() {
    const { state, getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();
    const stageInfo = EVOLUTION_STAGES[state.evolutionStage] || EVOLUTION_STAGES[0];

    return (
        <motion.div
            className="inline-flex items-center gap-2 px-2 py-1 border font-mono text-xs"
            style={{
                borderColor: colors.primary + "50",
                backgroundColor: colors.primary + "10",
                color: colors.primary,
            }}
            animate={{
                boxShadow: [`0 0 5px ${colors.glow}`, `0 0 15px ${colors.glow}`, `0 0 5px ${colors.glow}`],
            }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <Zap size={12} />
            <span>STAGE_{state.evolutionStage}</span>
            <span className="text-white/40">|</span>
            <span className="text-white/60">{stageInfo.name}</span>
        </motion.div>
    );
}
