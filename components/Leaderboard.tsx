"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/contexts/ExperienceContext";
import { Trophy, ChevronUp, ChevronDown, Users, Zap, Clock, Star } from "lucide-react";

// Types for leaderboard entries
interface LeaderboardEntry {
    rank: number;
    uniqueId: string;
    infectionLevel: number;
    evolutionStage: number;
    tracksCompleted: number;
    achievements: number;
    listenTime: number; // in seconds
    isCurrentUser?: boolean;
}

type SortField = "infection" | "evolution" | "tracks" | "achievements" | "time";

// Mock data generator for demo (simulates other users)
function generateMockEntries(count: number): Omit<LeaderboardEntry, "rank" | "isCurrentUser">[] {
    const prefixes = ["FLUX", "NODE", "SYNC", "WAVE", "CORE", "GRID", "VOID", "ECHO"];
    return Array.from({ length: count }, () => ({
        uniqueId: `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        infectionLevel: Math.random() * 100,
        evolutionStage: Math.floor(Math.random() * 5),
        tracksCompleted: Math.floor(Math.random() * 27),
        achievements: Math.floor(Math.random() * 15),
        listenTime: Math.floor(Math.random() * 36000), // up to 10 hours
    }));
}

interface LeaderboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
    const { state, getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();
    const [sortField, setSortField] = useState<SortField>("infection");
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

    // Generate mock data + current user on mount
    useEffect(() => {
        const mockData = generateMockEntries(49); // 49 mock + 1 real = 50 entries

        const currentUser: Omit<LeaderboardEntry, "rank"> = {
            uniqueId: state.uniqueId,
            infectionLevel: state.infectionLevel,
            evolutionStage: state.evolutionStage,
            tracksCompleted: state.stats.tracksCompleted.length,
            achievements: state.achievements.length,
            listenTime: state.stats.totalListenTime,
            isCurrentUser: true,
        };

        const allEntries = [...mockData, currentUser];
        setEntries(allEntries.map((e, i) => ({ ...e, rank: i + 1 })));
    }, [state]);

    // Sort entries based on selected field
    const sortedEntries = useMemo(() => {
        const sorted = [...entries].sort((a, b) => {
            switch (sortField) {
                case "infection":
                    return b.infectionLevel - a.infectionLevel;
                case "evolution":
                    return b.evolutionStage - a.evolutionStage;
                case "tracks":
                    return b.tracksCompleted - a.tracksCompleted;
                case "achievements":
                    return b.achievements - a.achievements;
                case "time":
                    return b.listenTime - a.listenTime;
                default:
                    return 0;
            }
        });

        return sorted.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
    }, [entries, sortField]);

    // Find current user's rank
    const currentUserEntry = sortedEntries.find((e) => e.isCurrentUser);
    const userRank = currentUserEntry?.rank || 0;

    // Get top 10 + surrounding entries for current user
    const displayEntries = useMemo(() => {
        const top10 = sortedEntries.slice(0, 10);

        if (userRank <= 10) {
            return top10;
        }

        // Show top 10 + separator + user's position with neighbors
        const userIndex = sortedEntries.findIndex((e) => e.isCurrentUser);
        const surrounding = sortedEntries.slice(Math.max(0, userIndex - 1), userIndex + 2);

        return [...top10, null, ...surrounding]; // null = separator
    }, [sortedEntries, userRank]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

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
                        className="relative max-w-2xl w-full max-h-[80vh] overflow-hidden bg-[#0a0a0a] border-2"
                        style={{ borderColor: colors.primary }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Trophy size={20} style={{ color: colors.primary }} />
                                <div>
                                    <div className="font-mono text-lg font-bold" style={{ color: colors.primary }}>
                                        INFECTION_LEADERBOARD
                                    </div>
                                    <div className="font-mono text-xs text-white/40">
                                        <Users size={12} className="inline mr-1" />
                                        {entries.length} CONNECTED_NODES
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/40 hover:text-white transition-colors font-mono"
                            >
                                [ESC]
                            </button>
                        </div>

                        {/* Sort options */}
                        <div className="flex gap-2 p-3 border-b border-white/10 overflow-x-auto">
                            <SortButton
                                active={sortField === "infection"}
                                onClick={() => setSortField("infection")}
                                color={colors.primary}
                                icon={<Zap size={12} />}
                                label="INFECTION"
                            />
                            <SortButton
                                active={sortField === "evolution"}
                                onClick={() => setSortField("evolution")}
                                color={colors.primary}
                                icon={<Star size={12} />}
                                label="EVOLUTION"
                            />
                            <SortButton
                                active={sortField === "tracks"}
                                onClick={() => setSortField("tracks")}
                                color={colors.primary}
                                icon={<span className="text-xs">🎧</span>}
                                label="TRACKS"
                            />
                            <SortButton
                                active={sortField === "achievements"}
                                onClick={() => setSortField("achievements")}
                                color={colors.primary}
                                icon={<Trophy size={12} />}
                                label="ACHIEVEMENTS"
                            />
                            <SortButton
                                active={sortField === "time"}
                                onClick={() => setSortField("time")}
                                color={colors.primary}
                                icon={<Clock size={12} />}
                                label="TIME"
                            />
                        </div>

                        {/* Your rank banner */}
                        {currentUserEntry && (
                            <div
                                className="p-3 border-b font-mono text-sm flex items-center justify-between"
                                style={{ borderColor: colors.primary + "50", backgroundColor: colors.primary + "10" }}
                            >
                                <span style={{ color: colors.primary }}>YOUR_RANK</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-white">#{userRank}</span>
                                    <span className="text-white/60">
                                        {sortField === "infection" && `${currentUserEntry.infectionLevel.toFixed(1)}%`}
                                        {sortField === "evolution" && `Stage ${currentUserEntry.evolutionStage}`}
                                        {sortField === "tracks" && `${currentUserEntry.tracksCompleted}/26`}
                                        {sortField === "achievements" && `${currentUserEntry.achievements} badges`}
                                        {sortField === "time" && formatTime(currentUserEntry.listenTime)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Leaderboard entries */}
                        <div className="overflow-y-auto max-h-[50vh]">
                            {displayEntries.map((entry, index) =>
                                entry === null ? (
                                    <div key="separator" className="py-2 text-center font-mono text-xs text-white/30">
                                        • • •
                                    </div>
                                ) : (
                                    <LeaderboardRow
                                        key={entry.uniqueId}
                                        entry={entry}
                                        sortField={sortField}
                                        color={colors.primary}
                                        formatTime={formatTime}
                                    />
                                )
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/10 font-mono text-xs text-white/30 text-center">
                            LOCAL_MODE: Rankings are simulated. Connect to network for global leaderboard.
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function SortButton({
    active,
    onClick,
    color,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    color: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 px-2 py-1 font-mono text-xs border transition-all whitespace-nowrap"
            style={{
                borderColor: active ? color : "rgba(255,255,255,0.2)",
                backgroundColor: active ? color + "20" : "transparent",
                color: active ? color : "rgba(255,255,255,0.6)",
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function LeaderboardRow({
    entry,
    sortField,
    color,
    formatTime,
}: {
    entry: LeaderboardEntry;
    sortField: SortField;
    color: string;
    formatTime: (s: number) => string;
}) {
    const getRankDisplay = (rank: number) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    };

    const getValue = () => {
        switch (sortField) {
            case "infection":
                return `${entry.infectionLevel.toFixed(1)}%`;
            case "evolution":
                return `Stage ${entry.evolutionStage}`;
            case "tracks":
                return `${entry.tracksCompleted}/26`;
            case "achievements":
                return entry.achievements.toString();
            case "time":
                return formatTime(entry.listenTime);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center justify-between p-3 border-b border-white/5 font-mono text-sm ${
                entry.isCurrentUser ? "bg-white/5" : ""
            }`}
            style={entry.isCurrentUser ? { borderLeftColor: color, borderLeftWidth: 3 } : {}}
        >
            <div className="flex items-center gap-3">
                <span className="w-8 text-center" style={entry.rank <= 3 ? {} : { color: "rgba(255,255,255,0.4)" }}>
                    {getRankDisplay(entry.rank)}
                </span>
                <span className={entry.isCurrentUser ? "" : "text-white/60"} style={entry.isCurrentUser ? { color } : {}}>
                    {entry.uniqueId}
                </span>
                {entry.isCurrentUser && (
                    <span className="text-xs px-1 border" style={{ borderColor: color, color }}>
                        YOU
                    </span>
                )}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-white/40 text-xs">
                    Stg.{entry.evolutionStage}
                </span>
                <span style={{ color }}>{getValue()}</span>
            </div>
        </motion.div>
    );
}

// Button to open leaderboard
export function LeaderboardButton({ onClick }: { onClick: () => void }) {
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
            <Trophy size={14} />
            LEADERBOARD
        </motion.button>
    );
}
