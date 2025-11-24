"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

interface StemProps {
    name: string;
    active: boolean;
    onToggle: () => void;
}

function StemControl({ name, active, onToggle }: StemProps) {
    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className={cn(
                    "w-8 h-32 md:h-48 rounded-full border-2 flex items-end justify-center overflow-hidden cursor-pointer transition-all duration-300",
                    active ? "border-signal bg-signal/10 shadow-[0_0_20px_rgba(255,69,0,0.3)]" : "border-stark/20 bg-void-deep"
                )}
                onClick={onToggle}
            >
                <motion.div
                    className={cn("w-full bg-signal", active ? "opacity-100" : "opacity-0")}
                    animate={{ height: active ? "100%" : "0%" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>
            <span className={cn("font-mono text-xs tracking-widest", active ? "text-signal" : "text-stark/30")}>
                {name}
            </span>
        </div>
    );
}

export default function StemMixer() {
    const [isOpen, setIsOpen] = useState(false);
    const [stems, setStems] = useState({
        DRUMS: true,
        BASS: true,
        SYNTH: true,
        FX: true,
    });

    const toggleStem = (key: keyof typeof stems) => {
        setStems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative px-6 py-3 bg-void-deep border border-signal/50 hover:bg-signal/10 transition-all overflow-hidden"
            >
                <div className="absolute inset-0 bg-signal/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative font-mono text-signal flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    DECONSTRUCT_TRACK
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center bg-void/90 backdrop-blur-xl p-4"
                    >
                        <div className="w-full max-w-2xl bg-void-deep border border-signal/30 p-8 relative shadow-2xl">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-stark/50 hover:text-signal"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-5xl font-bold glitch-text mb-2" data-text="STEM DECONSTRUCTION">
                                    STEM DECONSTRUCTION
                                </h2>
                                <p className="font-mono text-xs text-stark/50">ISOLATE THE SIGNAL // BREAK THE CODE</p>
                            </div>

                            <div className="flex justify-center gap-4 md:gap-12">
                                {(Object.keys(stems) as Array<keyof typeof stems>).map((stem) => (
                                    <StemControl
                                        key={stem}
                                        name={stem}
                                        active={stems[stem]}
                                        onToggle={() => toggleStem(stem)}
                                    />
                                ))}
                            </div>

                            <div className="mt-12 text-center font-mono text-xs text-stark/30">
                                <p>AUDIO_ENGINE: ONLINE</p>
                                <p>LATENCY: 12ms</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
