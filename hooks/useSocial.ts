"use client";

import { useState, useCallback, useEffect } from "react";
import { useExperience } from "@/contexts/ExperienceContext";

// =============================================================================
// TYPES
// =============================================================================

export interface LeaderboardEntry {
    rank: number;
    uniqueId: string;
    infectionLevel: number;
    evolutionStage: number;
    tracksCompleted: number;
    achievements: number;
    listenTime: number;
    isCurrentUser?: boolean;
}

export interface GlobalStats {
    totalListeners: number;
    totalListenHours: number;
    totalAchievementsUnlocked: number;
    averageInfection: number;
    totalTracksPlayed: number;
    activeNow: number;
    peakListeners: number;
    lastUpdated: number;
}

export interface SyncSession {
    sessionId: string;
    hostId: string;
    currentTrack: number;
    currentTime: number;
    listeners: string[];
    isPlaying: boolean;
}

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

const PREFIXES = ["FLUX", "NODE", "SYNC", "WAVE", "CORE", "GRID", "VOID", "ECHO", "PULSE", "SIGMA"];

function generateMockLeaderboard(count: number): Omit<LeaderboardEntry, "rank" | "isCurrentUser">[] {
    return Array.from({ length: count }, () => ({
        uniqueId: `${PREFIXES[Math.floor(Math.random() * PREFIXES.length)]}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        infectionLevel: Math.random() * 100,
        evolutionStage: Math.floor(Math.random() * 5),
        tracksCompleted: Math.floor(Math.random() * 27),
        achievements: Math.floor(Math.random() * 15),
        listenTime: Math.floor(Math.random() * 36000),
    }));
}

function generateMockGlobalStats(): GlobalStats {
    return {
        totalListeners: 1247 + Math.floor(Math.random() * 100),
        totalListenHours: 8432 + Math.floor(Math.random() * 50),
        totalAchievementsUnlocked: 4891 + Math.floor(Math.random() * 20),
        averageInfection: 42.7 + (Math.random() * 5 - 2.5),
        totalTracksPlayed: 31567 + Math.floor(Math.random() * 100),
        activeNow: Math.floor(Math.random() * 50) + 10,
        peakListeners: 312,
        lastUpdated: Date.now(),
    };
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Leaderboard Hook
 * Fetches and manages leaderboard data.
 * Falls back to simulated data when API is unavailable.
 */
export function useLeaderboard() {
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLive, setIsLive] = useState(false);
    const { state } = useExperience();

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/leaderboard");
            if (!response.ok) throw new Error("API unavailable");

            const data = await response.json();
            setEntries(data.entries);
            setIsLive(true);
        } catch {
            // Fallback to mock data
            const mockData = generateMockLeaderboard(49);
            const currentUser: Omit<LeaderboardEntry, "rank"> = {
                uniqueId: state.uniqueId,
                infectionLevel: state.infectionLevel,
                evolutionStage: state.evolutionStage,
                tracksCompleted: state.stats.tracksCompleted.length,
                achievements: state.achievements.length,
                listenTime: state.stats.totalListenTime,
                isCurrentUser: true,
            };

            const allEntries = [...mockData, currentUser]
                .sort((a, b) => b.infectionLevel - a.infectionLevel)
                .map((e, i) => ({ ...e, rank: i + 1 }));

            setEntries(allEntries);
            setIsLive(false);
        } finally {
            setLoading(false);
        }
    }, [state]);

    const submitScore = useCallback(async () => {
        try {
            await fetch("/api/leaderboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uniqueId: state.uniqueId,
                    infectionLevel: state.infectionLevel,
                    evolutionStage: state.evolutionStage,
                    tracksCompleted: state.stats.tracksCompleted.length,
                    achievements: state.achievements.length,
                    listenTime: state.stats.totalListenTime,
                }),
            });
            await fetchLeaderboard();
        } catch {
            // Silently fail - local mode
        }
    }, [state, fetchLeaderboard]);

    return { entries, loading, isLive, fetchLeaderboard, submitScore };
}

/**
 * Global Stats Hook
 * Fetches community-wide statistics.
 * Falls back to simulated data when API is unavailable.
 */
export function useGlobalStats() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<GlobalStats>(generateMockGlobalStats);
    const [isLive, setIsLive] = useState(false);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/stats");
            if (!response.ok) throw new Error("API unavailable");

            const data = await response.json();
            setStats(data);
            setIsLive(true);
        } catch {
            // Fallback to mock data
            setStats(generateMockGlobalStats());
            setIsLive(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-refresh stats
    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    return { stats, loading, isLive, fetchStats };
}

/**
 * Sync Listening Hook
 * Enables synchronized playback sessions.
 * Requires backend WebSocket connection.
 */
export function useSyncListening() {
    const [session, setSession] = useState<SyncSession | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { state } = useExperience();

    const createSession = useCallback(async () => {
        try {
            const response = await fetch("/api/sync/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hostId: state.uniqueId }),
            });

            if (!response.ok) throw new Error("Failed to create session");

            const data = await response.json();
            setSession(data);
            setConnected(true);
            return data.sessionId;
        } catch (err) {
            setError("Sync listening requires server connection. Not available in local mode.");
            return null;
        }
    }, [state.uniqueId]);

    const joinSession = useCallback(async (sessionId: string) => {
        try {
            const response = await fetch(`/api/sync/join/${sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listenerId: state.uniqueId }),
            });

            if (!response.ok) throw new Error("Session not found");

            const data = await response.json();
            setSession(data);
            setConnected(true);
        } catch (err) {
            setError("Could not join session. It may have ended or sync is not available.");
        }
    }, [state.uniqueId]);

    const leaveSession = useCallback(() => {
        setSession(null);
        setConnected(false);
    }, []);

    const updatePlayback = useCallback(async (trackIndex: number, currentTime: number, isPlaying: boolean) => {
        if (!session) return;

        try {
            await fetch(`/api/sync/update/${session.sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackIndex, currentTime, isPlaying }),
            });
        } catch {
            // Silently fail
        }
    }, [session]);

    return {
        session,
        connected,
        error,
        createSession,
        joinSession,
        leaveSession,
        updatePlayback,
        isAvailable: false, // Set to true when backend is connected
    };
}

/**
 * Share Hook
 * Handles sharing functionality across platforms.
 */
export function useShare() {
    const { state } = useExperience();
    const [copied, setCopied] = useState(false);

    const generateShareText = useCallback(() => {
        const listenHours = Math.floor(state.stats.totalListenTime / 3600);
        const listenMinutes = Math.floor((state.stats.totalListenTime % 3600) / 60);

        return `🎵 SYSTEM FLUX Status Report

☣️ Infection: ${state.infectionLevel.toFixed(1)}%
⚡ Evolution: Stage ${state.evolutionStage}/4
🎧 Tracks: ${state.stats.tracksCompleted.length}/26
🏆 Achievements: ${state.achievements.length}
⏱️ Listen Time: ${listenHours}h ${listenMinutes}m

ID: ${state.uniqueId}

Experience the infection: https://systemflux.app`;
    }, [state]);

    const shareNative = useCallback(async () => {
        const text = generateShareText();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "SYSTEM FLUX Status",
                    text,
                    url: "https://systemflux.app",
                });
                return true;
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Share failed:", err);
                }
            }
        }
        return false;
    }, [generateShareText]);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(generateShareText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch {
            return false;
        }
    }, [generateShareText]);

    const shareToTwitter = useCallback(() => {
        const text = encodeURIComponent(`☣️ My SYSTEM FLUX infection: ${state.infectionLevel.toFixed(1)}% | Stage ${state.evolutionStage}/4 | ${state.stats.tracksCompleted.length}/26 tracks`);
        const url = encodeURIComponent("https://systemflux.app");
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    }, [state]);

    return {
        shareNative,
        copyToClipboard,
        shareToTwitter,
        generateShareText,
        copied,
        canShare: typeof navigator !== "undefined" && !!navigator.share,
    };
}
