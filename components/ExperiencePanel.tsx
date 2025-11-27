"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience, ACHIEVEMENTS } from "@/contexts/ExperienceContext";
import { useSecrets, SECRETS, SecretProgress } from "@/components/SecretChallenges";
import { GenerativeArtwork } from "@/components/GenerativeArtwork";
import { ZoneMap, ZoneMapButton, ZONES } from "@/components/ZoneNavigator";
import {
    User,
    Trophy,
    Clock,
    Music,
    Zap,
    Map,
    ChevronDown,
    ChevronUp,
    Download,
    Share2,
    X,
} from "lucide-react";

export function ExperiencePanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"stats" | "achievements" | "secrets" | "artwork">("stats");
    const [showZoneMap, setShowZoneMap] = useState(false);

    const { state, getEvolutionColors } = useExperience();
    const { unlockedSecrets } = useSecrets();
    const colors = getEvolutionColors();

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <>
            {/* Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 left-4 z-[500] flex items-center gap-2 px-3 py-2
                    bg-black/80 border border-white/20 hover:border-[#FF4500]/50
                    font-mono text-xs transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <User size={14} style={{ color: colors.primary }} />
                <span className="text-white/60">LVL</span>
                <span style={{ color: colors.primary }}>{state.evolutionStage}</span>
                <span className="text-white/30">|</span>
                <span className="text-white/60">{state.infectionLevel.toFixed(0)}%</span>
            </motion.button>

            {/* Zone Map Button */}
            <div className="fixed bottom-20 left-36 z-[500]">
                <ZoneMapButton onClick={() => setShowZoneMap(true)} />
            </div>

            {/* Zone Map Modal */}
            <ZoneMap
                isOpen={showZoneMap}
                onClose={() => setShowZoneMap(false)}
            />

            {/* Main Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[80vh] bg-black border overflow-hidden"
                            style={{ borderColor: colors.primary + "50" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div
                                className="p-4 border-b flex items-center justify-between"
                                style={{
                                    borderColor: colors.primary + "30",
                                    background: `linear-gradient(135deg, ${colors.primary}10, transparent)`,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center border"
                                        style={{ borderColor: colors.primary }}
                                    >
                                        <Zap size={20} style={{ color: colors.primary }} />
                                    </div>
                                    <div>
                                        <div className="font-mono text-xs text-white/50">AGENT_ID</div>
                                        <div className="font-mono text-sm" style={{ color: colors.primary }}>
                                            {state.uniqueId}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} className="text-white/50" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b" style={{ borderColor: colors.primary + "20" }}>
                                {(["stats", "achievements", "secrets", "artwork"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-3 font-mono text-xs uppercase tracking-wider
                                            transition-colors ${
                                                activeTab === tab
                                                    ? "bg-white/5"
                                                    : "hover:bg-white/5"
                                            }`}
                                        style={{
                                            color: activeTab === tab ? colors.primary : "rgba(255,255,255,0.5)",
                                            borderBottom: activeTab === tab ? `2px solid ${colors.primary}` : "2px solid transparent",
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)]">
                                {activeTab === "stats" && <StatsTab />}
                                {activeTab === "achievements" && <AchievementsTab />}
                                {activeTab === "secrets" && <SecretsTab />}
                                {activeTab === "artwork" && <ArtworkTab />}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function StatsTab() {
    const { state, getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const stats = [
        { label: "LISTEN_TIME", value: formatTime(state.stats.totalListenTime), icon: Clock },
        { label: "TRACKS_COMPLETED", value: `${state.stats.tracksCompleted.length}/25`, icon: Music },
        { label: "SESSIONS", value: state.stats.sessionsCount.toString(), icon: User },
        { label: "INFECTION_LEVEL", value: `${state.infectionLevel.toFixed(1)}%`, icon: Zap },
        { label: "EVOLUTION_STAGE", value: state.evolutionStage.toString(), icon: Trophy },
        { label: "SECRETS_FOUND", value: `${state.secretsFound.length}/${SECRETS.length}`, icon: Map },
    ];

    return (
        <div className="space-y-6">
            {/* Evolution Progress */}
            <div className="p-4 border" style={{ borderColor: colors.primary + "30" }}>
                <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-white/50">EVOLUTION_PROGRESS</span>
                    <span className="font-mono text-sm" style={{ color: colors.primary }}>
                        STAGE {state.evolutionStage}/4
                    </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: colors.primary }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(state.evolutionStage / 4) * 100}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <div className="flex justify-between mt-2 font-mono text-[10px] text-white/30">
                    <span>INIT</span>
                    <span>AWARE</span>
                    <span>CONNECTED</span>
                    <span>INTEGRATED</span>
                    <span>FLUX</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="p-3 border border-white/10 bg-white/5"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon size={12} className="text-white/40" />
                            <span className="font-mono text-[10px] text-white/40">{stat.label}</span>
                        </div>
                        <div className="font-mono text-lg" style={{ color: colors.primary }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Zone Info */}
            <div className="p-4 border border-white/10">
                <div className="font-mono text-xs text-white/50 mb-2">CURRENT_ZONE</div>
                <div className="flex items-center gap-3">
                    <Map size={20} style={{ color: ZONES.find(z => z.id === state.currentZone)?.color }} />
                    <span className="font-mono" style={{ color: ZONES.find(z => z.id === state.currentZone)?.color }}>
                        {ZONES.find(z => z.id === state.currentZone)?.name || "CORE_NODE"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function AchievementsTab() {
    const { state } = useExperience();
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();

    const unlockedIds = state.achievements.map(a => a.id);

    return (
        <div className="space-y-3">
            <div className="font-mono text-xs text-white/50 mb-4">
                UNLOCKED: {state.achievements.length}/{ACHIEVEMENTS.length}
            </div>

            {ACHIEVEMENTS.map((achievement) => {
                const unlocked = unlockedIds.includes(achievement.id);

                return (
                    <div
                        key={achievement.id}
                        className={`p-3 border transition-all ${
                            unlocked
                                ? "border-[#39FF14]/50 bg-[#39FF14]/5"
                                : "border-white/10 bg-white/5 opacity-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">{achievement.icon}</div>
                            <div className="flex-1">
                                <div className="font-mono text-sm text-white">
                                    {unlocked ? achievement.title : "???"}
                                </div>
                                <div className="font-mono text-xs text-white/50">
                                    {unlocked ? achievement.description : "Achievement locked"}
                                </div>
                            </div>
                            {achievement.secret && unlocked && (
                                <span className="text-[10px] font-mono text-[#FF00FF] px-2 py-0.5 border border-[#FF00FF]/50">
                                    SECRET
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function SecretsTab() {
    const { unlockedSecrets, isSecretUnlocked } = useSecrets();

    return (
        <div className="space-y-3">
            <SecretProgress />

            <div className="mt-6 space-y-2">
                {SECRETS.map((secret) => {
                    const unlocked = isSecretUnlocked(secret.id);

                    return (
                        <div
                            key={secret.id}
                            className={`p-3 border font-mono text-sm ${
                                unlocked
                                    ? "border-[#39FF14]/50 bg-[#39FF14]/5"
                                    : "border-white/10 bg-white/5"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <secret.icon size={14} className={unlocked ? "text-[#39FF14]" : "text-white/30"} />
                                <span className={unlocked ? "text-white" : "text-white/30"}>
                                    {unlocked ? secret.name : "???"}
                                </span>
                                <span
                                    className={`ml-auto text-[10px] px-1.5 py-0.5 border ${
                                        secret.difficulty === "legendary"
                                            ? "text-[#FFD700] border-[#FFD700]/50"
                                            : secret.difficulty === "hard"
                                            ? "text-[#FF4500] border-[#FF4500]/50"
                                            : secret.difficulty === "medium"
                                            ? "text-[#00D4FF] border-[#00D4FF]/50"
                                            : "text-[#39FF14] border-[#39FF14]/50"
                                    }`}
                                >
                                    {secret.difficulty.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-white/50 text-xs ml-6">
                                {unlocked ? secret.description : secret.hint}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ArtworkTab() {
    const { state } = useExperience();
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="font-mono text-xs text-white/50 mb-4">
                    YOUR_UNIQUE_ARTWORK
                </div>
                <div className="flex justify-center">
                    <GenerativeArtwork size={250} />
                </div>
                <div className="font-mono text-xs text-white/30 mt-4">
                    Generated from your unique ID: {state.uniqueId}
                </div>
            </div>

            <div className="flex justify-center gap-3">
                <button
                    className="flex items-center gap-2 px-4 py-2 border border-white/20
                        hover:border-[#FF4500]/50 font-mono text-xs transition-colors"
                >
                    <Download size={14} />
                    DOWNLOAD
                </button>
                <button
                    className="flex items-center gap-2 px-4 py-2 border border-white/20
                        hover:border-[#FF4500]/50 font-mono text-xs transition-colors"
                >
                    <Share2 size={14} />
                    SHARE
                </button>
            </div>

            <div className="p-4 border border-white/10 text-center">
                <div className="font-mono text-xs text-white/50 mb-2">
                    ARTWORK_EVOLUTION
                </div>
                <p className="font-mono text-[11px] text-white/40">
                    Your artwork evolves as you progress. Complete more tracks and unlock secrets
                    to see new patterns emerge.
                </p>
            </div>
        </div>
    );
}
