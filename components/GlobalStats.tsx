"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useExperience } from "@/contexts/ExperienceContext";
import { Activity, Users, Clock, Zap, Radio, Globe } from "lucide-react";

// Types for global stats
interface GlobalStatsData {
    totalListeners: number;
    totalListenHours: number;
    totalAchievementsUnlocked: number;
    averageInfection: number;
    totalTracksPlayed: number;
    activeNow: number;
    peakListeners: number;
    lastUpdated: number;
}

// Mock global stats generator (simulates community data)
function generateMockGlobalStats(): GlobalStatsData {
    const base = {
        totalListeners: 1247,
        totalListenHours: 8432,
        totalAchievementsUnlocked: 4891,
        averageInfection: 42.7,
        totalTracksPlayed: 31567,
        activeNow: Math.floor(Math.random() * 50) + 10,
        peakListeners: 312,
        lastUpdated: Date.now(),
    };

    // Add some randomness for "live" feel
    return {
        ...base,
        activeNow: base.activeNow + Math.floor(Math.random() * 5) - 2,
        totalListenHours: base.totalListenHours + Math.floor(Math.random() * 10),
    };
}

export function GlobalStats() {
    const { state, getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();
    const [stats, setStats] = useState<GlobalStatsData>(generateMockGlobalStats);
    const [isLive, setIsLive] = useState(true);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(generateMockGlobalStats());
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Calculate user's contribution
    const userContribution = useMemo(() => {
        const userHours = state.stats.totalListenTime / 3600;
        const percentOfTotal = (userHours / stats.totalListenHours) * 100;
        return {
            hours: userHours,
            percent: percentOfTotal,
            achievements: state.achievements.length,
        };
    }, [state, stats]);

    return (
        <div className="font-mono">
            {/* Header with live indicator */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Globe size={16} style={{ color: colors.primary }} />
                    <span className="text-sm font-bold" style={{ color: colors.primary }}>
                        NETWORK_STATUS
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isLive ? "#00ff00" : "#666" }}
                        animate={isLive ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs text-white/40">
                        {isLive ? "LIVE" : "OFFLINE"}
                    </span>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    icon={<Users size={14} />}
                    label="TOTAL_NODES"
                    value={stats.totalListeners.toLocaleString()}
                    color={colors.primary}
                />
                <StatCard
                    icon={<Activity size={14} />}
                    label="ACTIVE_NOW"
                    value={stats.activeNow.toString()}
                    color="#00ff00"
                    pulse
                />
                <StatCard
                    icon={<Clock size={14} />}
                    label="LISTEN_HOURS"
                    value={stats.totalListenHours.toLocaleString()}
                    color={colors.primary}
                />
                <StatCard
                    icon={<Zap size={14} />}
                    label="AVG_INFECTION"
                    value={`${stats.averageInfection.toFixed(1)}%`}
                    color={colors.primary}
                />
            </div>

            {/* Your contribution */}
            <div className="mt-4 p-3 border border-white/10 bg-white/5">
                <div className="text-xs text-white/40 mb-2">YOUR_CONTRIBUTION</div>
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <span style={{ color: colors.primary }}>{userContribution.hours.toFixed(1)}h</span>
                        <span className="text-white/40"> listened</span>
                    </div>
                    <div className="text-sm">
                        <span style={{ color: colors.primary }}>{userContribution.achievements}</span>
                        <span className="text-white/40"> achievements</span>
                    </div>
                </div>
                {userContribution.percent > 0 && (
                    <div className="mt-2 text-xs text-white/30">
                        You represent {userContribution.percent.toFixed(4)}% of total network activity
                    </div>
                )}
            </div>

            {/* Network status bar */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                    <span>NETWORK_LOAD</span>
                    <span>{Math.round((stats.activeNow / stats.peakListeners) * 100)}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: colors.primary }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.activeNow / stats.peakListeners) * 100}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3 text-xs text-white/20 text-center">
                LOCAL_MODE: Stats are simulated
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
    pulse,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    pulse?: boolean;
}) {
    return (
        <div className="p-3 border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                <span style={{ color }}>{icon}</span>
                <span>{label}</span>
            </div>
            <motion.div
                className="text-lg font-bold"
                style={{ color }}
                animate={pulse ? { opacity: [1, 0.7, 1] } : {}}
                transition={pulse ? { duration: 2, repeat: Infinity } : {}}
            >
                {value}
            </motion.div>
        </div>
    );
}

// Compact version for sidebar/header
export function GlobalStatsCompact() {
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();
    const [activeNow, setActiveNow] = useState(Math.floor(Math.random() * 50) + 10);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNow((prev) => Math.max(5, prev + Math.floor(Math.random() * 5) - 2));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 font-mono text-xs">
            <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white/40">
                <Radio size={12} className="inline mr-1" />
                <span style={{ color: colors.primary }}>{activeNow}</span> online
            </span>
        </div>
    );
}
