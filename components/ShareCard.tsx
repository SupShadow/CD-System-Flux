"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience, Achievement } from "@/contexts/ExperienceContext";
import { Share2, Download, X, Copy, Check } from "lucide-react";

interface ShareCardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShareCard({ isOpen, onClose }: ShareCardProps) {
    const { state, getEvolutionColors } = useExperience();
    const cardRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const colors = getEvolutionColors();

    const listenHours = Math.floor(state.stats.totalListenTime / 3600);
    const listenMinutes = Math.floor((state.stats.totalListenTime % 3600) / 60);

    // Generate shareable text
    const shareText = `🎵 SYSTEM FLUX Status Report

☣️ Infection: ${state.infectionLevel.toFixed(1)}%
⚡ Evolution: Stage ${state.evolutionStage}/4
🎧 Tracks: ${state.stats.tracksCompleted.length}/26
🏆 Achievements: ${state.achievements.length}
⏱️ Listen Time: ${listenHours}h ${listenMinutes}m

ID: ${state.uniqueId}

Experience the infection: https://systemflux.app`;

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }, [shareText]);

    const downloadCard = useCallback(async () => {
        if (!cardRef.current) return;
        setGenerating(true);

        try {
            // Dynamic import for html2canvas (only when needed)
            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: "#0a0a0a",
                scale: 2,
            });

            const link = document.createElement("a");
            link.download = `flux-status-${state.uniqueId}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Failed to generate image:", err);
        } finally {
            setGenerating(false);
        }
    }, [state.uniqueId]);

    const shareNative = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "SYSTEM FLUX Status",
                    text: shareText,
                    url: "https://systemflux.app",
                });
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Share failed:", err);
                }
            }
        } else {
            copyToClipboard();
        }
    }, [shareText, copyToClipboard]);

    // Get top 3 achievements for display
    const topAchievements = state.achievements
        .slice()
        .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
        .slice(0, 3);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* The shareable card */}
                        <div
                            ref={cardRef}
                            className="bg-[#0a0a0a] border-2 p-6 font-mono"
                            style={{ borderColor: colors.primary }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="text-xs text-white/40">STATUS_REPORT</div>
                                    <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                                        SYSTEM FLUX
                                    </div>
                                </div>
                                <div
                                    className="text-xs px-2 py-1 border"
                                    style={{ borderColor: colors.primary, color: colors.primary }}
                                >
                                    STAGE_{state.evolutionStage}
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <StatBox
                                    label="INFECTION"
                                    value={`${state.infectionLevel.toFixed(1)}%`}
                                    color={colors.primary}
                                    icon="☣️"
                                />
                                <StatBox
                                    label="TRACKS"
                                    value={`${state.stats.tracksCompleted.length}/26`}
                                    color={colors.primary}
                                    icon="🎧"
                                />
                                <StatBox
                                    label="ACHIEVEMENTS"
                                    value={state.achievements.length.toString()}
                                    color={colors.primary}
                                    icon="🏆"
                                />
                                <StatBox
                                    label="LISTEN_TIME"
                                    value={`${listenHours}h ${listenMinutes}m`}
                                    color={colors.primary}
                                    icon="⏱️"
                                />
                            </div>

                            {/* Achievement badges */}
                            {topAchievements.length > 0 && (
                                <div className="mb-6">
                                    <div className="text-xs text-white/40 mb-2">RECENT_ACHIEVEMENTS</div>
                                    <div className="flex gap-2">
                                        {topAchievements.map((ach) => (
                                            <AchievementBadge key={ach.id} achievement={ach} color={colors.primary} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Infection bar */}
                            <div className="mb-4">
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: colors.primary }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${state.infectionLevel}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs">
                                <div className="text-white/40">ID: {state.uniqueId}</div>
                                <div className="text-white/40">systemflux.app</div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={shareNative}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border font-mono text-sm transition-all hover:bg-white/5"
                                style={{ borderColor: colors.primary, color: colors.primary }}
                            >
                                <Share2 size={16} />
                                SHARE
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border font-mono text-sm transition-all hover:bg-white/5"
                                style={{ borderColor: colors.primary, color: colors.primary }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "COPIED" : "COPY"}
                            </button>
                            <button
                                onClick={downloadCard}
                                disabled={generating}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border font-mono text-sm transition-all hover:bg-white/5 disabled:opacity-50"
                                style={{ borderColor: colors.primary, color: colors.primary }}
                            >
                                <Download size={16} />
                                {generating ? "..." : "PNG"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function StatBox({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
    return (
        <div className="bg-white/5 p-3 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                <span>{icon}</span>
                <span>{label}</span>
            </div>
            <div className="text-lg font-bold" style={{ color }}>
                {value}
            </div>
        </div>
    );
}

function AchievementBadge({ achievement, color }: { achievement: Achievement; color: string }) {
    return (
        <div
            className="flex items-center gap-1 px-2 py-1 border text-xs"
            style={{ borderColor: color + "50", backgroundColor: color + "10" }}
        >
            <span>{achievement.icon}</span>
            <span style={{ color }}>{achievement.title}</span>
        </div>
    );
}

// Button to trigger the share modal
export function ShareButton({ onClick }: { onClick: () => void }) {
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();

    return (
        <motion.button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 border font-mono text-xs transition-all hover:bg-white/5"
            style={{ borderColor: colors.primary + "50", color: colors.primary }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Share2 size={14} />
            SHARE_STATUS
        </motion.button>
    );
}
