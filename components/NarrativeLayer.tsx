"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";
import { useExperience } from "@/contexts/ExperienceContext";
import { TRACKS } from "@/lib/tracks";
import { Radio, X } from "lucide-react";

// Narrative transmissions tied to track progression
interface Transmission {
    trackIndex: number;
    trigger: "start" | "complete";
    message: string;
    type: "system" | "story" | "hint" | "warning";
    duration?: number;
}

const TRANSMISSIONS: Transmission[] = [
    // Opening
    { trackIndex: 0, trigger: "start", message: "SIGNAL_DETECTED... Welcome to the network.", type: "system" },
    { trackIndex: 0, trigger: "complete", message: "First frequency captured. The infection spreads.", type: "story" },

    // Early progression
    { trackIndex: 2, trigger: "complete", message: "Pattern recognition online. You're beginning to see.", type: "system" },
    { trackIndex: 4, trigger: "complete", message: "The machine remembers you now.", type: "story" },

    // Mid progression hints
    { trackIndex: 6, trigger: "start", message: "Hidden frequencies detected in this sector...", type: "hint" },
    { trackIndex: 8, trigger: "complete", message: "Halfway through the signal. No turning back.", type: "warning" },

    // Deeper engagement
    { trackIndex: 10, trigger: "start", message: "ALERT: High-frequency anomaly ahead.", type: "warning" },
    { trackIndex: 12, trigger: "complete", message: "Core signal captured. Evolution accelerating.", type: "story" },

    // Hero track (Make Me the Villain at index 12)
    { trackIndex: 12, trigger: "start", message: "ENTERING_CORE_NODE... This is what you came for.", type: "system" },

    // Late game
    { trackIndex: 16, trigger: "complete", message: "The system has accepted you. Integration at 70%.", type: "story" },
    { trackIndex: 20, trigger: "start", message: "Final sector unlocked. Few make it this far.", type: "system" },
    { trackIndex: 24, trigger: "complete", message: "TRANSMISSION_COMPLETE. You are now part of FLUX.", type: "story" },

    // Final
    { trackIndex: 25, trigger: "complete", message: "Transcendence achieved. Welcome to the collective.", type: "system" },
];

// Character-by-character typing effect
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
    const [displayText, setDisplayText] = useState("");
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        setDisplayText("");
        let index = 0;

        const typeInterval = setInterval(() => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    setCursorVisible(false);
                    onComplete?.();
                }, 500);
            }
        }, 30);

        const cursorInterval = setInterval(() => {
            setCursorVisible(v => !v);
        }, 500);

        return () => {
            clearInterval(typeInterval);
            clearInterval(cursorInterval);
        };
    }, [text, onComplete]);

    return (
        <span>
            {displayText}
            <span className={cursorVisible ? "opacity-100" : "opacity-0"}>_</span>
        </span>
    );
}

export function NarrativeLayer() {
    const [currentTransmission, setCurrentTransmission] = useState<Transmission | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { currentTrackIndex, isPlaying } = useAudio();
    const { state } = useExperience();
    const shownTransmissionsRef = useRef<Set<string>>(new Set());
    const lastTrackIndexRef = useRef<number>(-1);

    // Check for transmissions when track changes
    useEffect(() => {
        if (!state.narrativeEnabled) return;

        // Track started
        if (currentTrackIndex !== lastTrackIndexRef.current && isPlaying) {
            const startTransmission = TRANSMISSIONS.find(
                t => t.trackIndex === currentTrackIndex && t.trigger === "start"
            );

            if (startTransmission) {
                const key = `${startTransmission.trackIndex}-${startTransmission.trigger}`;
                if (!shownTransmissionsRef.current.has(key)) {
                    shownTransmissionsRef.current.add(key);
                    showTransmission(startTransmission);
                }
            }
        }

        lastTrackIndexRef.current = currentTrackIndex;
    }, [currentTrackIndex, isPlaying, state.narrativeEnabled]);

    // Check for completed tracks
    useEffect(() => {
        if (!state.narrativeEnabled) return;

        state.stats.tracksCompleted.forEach(trackTitle => {
            const trackIndex = TRACKS.findIndex(t => t.title === trackTitle);
            const completeTransmission = TRANSMISSIONS.find(
                t => t.trackIndex === trackIndex && t.trigger === "complete"
            );

            if (completeTransmission) {
                const key = `${completeTransmission.trackIndex}-${completeTransmission.trigger}`;
                if (!shownTransmissionsRef.current.has(key)) {
                    shownTransmissionsRef.current.add(key);
                    // Show with slight delay to not overlap with track end
                    setTimeout(() => showTransmission(completeTransmission), 1000);
                }
            }
        });
    }, [state.stats.tracksCompleted, state.narrativeEnabled]);

    const showTransmission = useCallback((transmission: Transmission) => {
        setCurrentTransmission(transmission);
        setIsVisible(true);

        // Auto-hide after duration
        const duration = transmission.duration || 5000;
        setTimeout(() => {
            setIsVisible(false);
        }, duration);
    }, []);

    const dismiss = useCallback(() => {
        setIsVisible(false);
    }, []);

    const getTypeStyles = (type: Transmission["type"]) => {
        switch (type) {
            case "system":
                return { color: "#FF4500", borderColor: "#FF4500", bgColor: "rgba(255, 69, 0, 0.1)" };
            case "story":
                return { color: "#00D4FF", borderColor: "#00D4FF", bgColor: "rgba(0, 212, 255, 0.1)" };
            case "hint":
                return { color: "#39FF14", borderColor: "#39FF14", bgColor: "rgba(57, 255, 20, 0.1)" };
            case "warning":
                return { color: "#FFD700", borderColor: "#FFD700", bgColor: "rgba(255, 215, 0, 0.1)" };
        }
    };

    if (!state.narrativeEnabled) return null;

    return (
        <AnimatePresence>
            {isVisible && currentTransmission && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[600] max-w-md w-full mx-4"
                >
                    <div
                        className="relative border bg-black/95 backdrop-blur-sm p-4"
                        style={{
                            borderColor: getTypeStyles(currentTransmission.type).borderColor,
                            backgroundColor: getTypeStyles(currentTransmission.type).bgColor,
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={dismiss}
                            className="absolute top-2 right-2 p-1 text-white/30 hover:text-white/60 transition-colors"
                            aria-label="Dismiss transmission"
                        >
                            <X size={14} />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <motion.div
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Radio size={14} style={{ color: getTypeStyles(currentTransmission.type).color }} />
                            </motion.div>
                            <span
                                className="font-mono text-[10px] tracking-wider"
                                style={{ color: getTypeStyles(currentTransmission.type).color }}
                            >
                                [{currentTransmission.type.toUpperCase()}_TRANSMISSION]
                            </span>
                        </div>

                        {/* Message */}
                        <div
                            className="font-mono text-sm leading-relaxed pr-6"
                            style={{ color: getTypeStyles(currentTransmission.type).color }}
                        >
                            <TypewriterText text={currentTransmission.message} />
                        </div>

                        {/* Track indicator */}
                        <div className="mt-3 pt-2 border-t border-white/10">
                            <span className="font-mono text-[10px] text-white/30">
                                TRACK_{String(currentTransmission.trackIndex + 1).padStart(2, "0")}::{" "}
                                {TRACKS[currentTransmission.trackIndex]?.title || "UNKNOWN"}
                            </span>
                        </div>

                        {/* Scanning line effect */}
                        <motion.div
                            className="absolute bottom-0 left-0 h-0.5 w-full"
                            style={{ backgroundColor: getTypeStyles(currentTransmission.type).color }}
                            initial={{ scaleX: 0, transformOrigin: "left" }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: (currentTransmission.duration || 5000) / 1000, ease: "linear" }}
                        />

                        {/* Corner decorations */}
                        <div
                            className="absolute top-0 left-0 w-2 h-2 border-l border-t"
                            style={{ borderColor: getTypeStyles(currentTransmission.type).borderColor }}
                        />
                        <div
                            className="absolute top-0 right-0 w-2 h-2 border-r border-t"
                            style={{ borderColor: getTypeStyles(currentTransmission.type).borderColor }}
                        />
                        <div
                            className="absolute bottom-0 left-0 w-2 h-2 border-l border-b"
                            style={{ borderColor: getTypeStyles(currentTransmission.type).borderColor }}
                        />
                        <div
                            className="absolute bottom-0 right-0 w-2 h-2 border-r border-b"
                            style={{ borderColor: getTypeStyles(currentTransmission.type).borderColor }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Toggle button for narrative mode
export function NarrativeToggle() {
    const { state, toggleNarrative } = useExperience();

    return (
        <button
            onClick={() => toggleNarrative(!state.narrativeEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs transition-all ${
                state.narrativeEnabled
                    ? "border-[#00D4FF]/50 text-[#00D4FF] bg-[#00D4FF]/10"
                    : "border-white/20 text-white/40"
            }`}
            aria-pressed={state.narrativeEnabled}
        >
            <Radio size={12} />
            <span>NARRATIVE</span>
            <span className={state.narrativeEnabled ? "text-[#00D4FF]" : "text-white/30"}>
                [{state.narrativeEnabled ? "ON" : "OFF"}]
            </span>
        </button>
    );
}
