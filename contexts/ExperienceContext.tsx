"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from "react";
import { Track, TRACKS } from "@/lib/tracks";

// ============================================================================
// TYPES
// ============================================================================

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: number; // timestamp
    secret?: boolean;
}

export interface ListeningStats {
    totalListenTime: number; // in seconds
    tracksCompleted: string[]; // track titles that were listened to >80%
    sessionsCount: number;
    firstVisit: number;
    lastVisit: number;
    favoriteTrack?: string;
    trackPlayCounts: Record<string, number>;
}

export interface ExperienceState {
    // Infection level (0-100) - increases as user engages more
    infectionLevel: number;

    // Listening statistics
    stats: ListeningStats;

    // Unlocked achievements
    achievements: Achievement[];

    // Secret modes
    nightModeUnlocked: boolean;
    devModeUnlocked: boolean;

    // User's unique ID (for generative artwork)
    uniqueId: string;

    // Current "zone" in the experience
    currentZone: "core" | "zone_a" | "zone_b" | "zone_c";

    // UI evolution stage (0-4)
    evolutionStage: number;

    // Easter eggs found
    secretsFound: string[];

    // Narrative state
    narrativeEnabled: boolean;

    // Has completed the full album at least once
    albumCompleted: boolean;
}

type ExperienceAction =
    | { type: "INCREMENT_INFECTION"; amount: number }
    | { type: "ADD_LISTEN_TIME"; seconds: number }
    | { type: "COMPLETE_TRACK"; trackTitle: string }
    | { type: "INCREMENT_PLAY_COUNT"; trackTitle: string }
    | { type: "UNLOCK_ACHIEVEMENT"; achievement: Achievement }
    | { type: "FIND_SECRET"; secretId: string }
    | { type: "SET_ZONE"; zone: ExperienceState["currentZone"] }
    | { type: "TOGGLE_NARRATIVE"; enabled: boolean }
    | { type: "EVOLVE_UI" }
    | { type: "COMPLETE_ALBUM" }
    | { type: "INCREMENT_SESSION" }
    | { type: "LOAD_STATE"; state: Partial<ExperienceState> };

// ============================================================================
// ACHIEVEMENTS DEFINITIONS
// ============================================================================

export const ACHIEVEMENTS: Achievement[] = [
    // Listening achievements
    { id: "first_play", title: "SYSTEM_INIT", description: "Started your first track", icon: "▶" },
    { id: "listen_10min", title: "ENGAGED", description: "Listened for 10 minutes", icon: "⏱" },
    { id: "listen_1hour", title: "DEEP_DIVE", description: "Listened for 1 hour", icon: "🎧" },
    { id: "listen_5hours", title: "OBSESSED", description: "Listened for 5 hours", icon: "🔥" },

    // Track achievements
    { id: "complete_1", title: "FIRST_BLOOD", description: "Completed a full track", icon: "✓" },
    { id: "complete_5", title: "CURIOUS", description: "Completed 5 tracks", icon: "🔍" },
    { id: "complete_all", title: "FLUX_MASTER", description: "Heard every track", icon: "👑" },

    // Secret achievements
    { id: "night_owl", title: "NIGHT_OWL", description: "Listened after midnight", icon: "🌙", secret: true },
    { id: "early_bird", title: "EARLY_BIRD", description: "Listened before 6 AM", icon: "🌅", secret: true },
    { id: "konami", title: "OLD_SCHOOL", description: "Entered the Konami code", icon: "🎮", secret: true },
    { id: "terminal_hacker", title: "HACKER", description: "Used the terminal", icon: "💻", secret: true },
    { id: "full_infection", title: "FULLY_INFECTED", description: "Reached 100% infection", icon: "☣", secret: true },

    // Zone achievements
    { id: "explore_all_zones", title: "EXPLORER", description: "Visited all zones", icon: "🗺" },

    // Album completion
    { id: "album_complete", title: "THE_END?", description: "Completed the full album journey", icon: "∞" },
];

// ============================================================================
// REDUCER
// ============================================================================

function generateUniqueId(): string {
    return `FLUX_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

function getInitialState(): ExperienceState {
    return {
        infectionLevel: 0,
        stats: {
            totalListenTime: 0,
            tracksCompleted: [],
            sessionsCount: 1,
            firstVisit: Date.now(),
            lastVisit: Date.now(),
            trackPlayCounts: {},
        },
        achievements: [],
        nightModeUnlocked: false,
        devModeUnlocked: false,
        uniqueId: generateUniqueId(),
        currentZone: "core",
        evolutionStage: 0,
        secretsFound: [],
        narrativeEnabled: true,
        albumCompleted: false,
    };
}

function calculateEvolutionStage(stats: ListeningStats): number {
    const completedCount = stats.tracksCompleted.length;
    const listenHours = stats.totalListenTime / 3600;

    if (completedCount >= TRACKS.length && listenHours >= 5) return 4; // Final form
    if (completedCount >= 15 && listenHours >= 2) return 3;
    if (completedCount >= 8 && listenHours >= 0.5) return 2;
    if (completedCount >= 3 || listenHours >= 0.1) return 1;
    return 0;
}

function experienceReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
    switch (action.type) {
        case "INCREMENT_INFECTION": {
            const newLevel = Math.min(100, state.infectionLevel + action.amount);
            return { ...state, infectionLevel: newLevel };
        }

        case "ADD_LISTEN_TIME": {
            const newStats = {
                ...state.stats,
                totalListenTime: state.stats.totalListenTime + action.seconds,
                lastVisit: Date.now(),
            };
            const newEvolution = calculateEvolutionStage(newStats);
            return {
                ...state,
                stats: newStats,
                evolutionStage: Math.max(state.evolutionStage, newEvolution),
            };
        }

        case "COMPLETE_TRACK": {
            if (state.stats.tracksCompleted.includes(action.trackTitle)) {
                return state;
            }
            const newStats = {
                ...state.stats,
                tracksCompleted: [...state.stats.tracksCompleted, action.trackTitle],
            };
            const newEvolution = calculateEvolutionStage(newStats);
            const albumCompleted = newStats.tracksCompleted.length >= TRACKS.length;
            return {
                ...state,
                stats: newStats,
                evolutionStage: Math.max(state.evolutionStage, newEvolution),
                albumCompleted: state.albumCompleted || albumCompleted,
            };
        }

        case "INCREMENT_PLAY_COUNT": {
            const currentCount = state.stats.trackPlayCounts[action.trackTitle] || 0;
            return {
                ...state,
                stats: {
                    ...state.stats,
                    trackPlayCounts: {
                        ...state.stats.trackPlayCounts,
                        [action.trackTitle]: currentCount + 1,
                    },
                },
            };
        }

        case "UNLOCK_ACHIEVEMENT": {
            if (state.achievements.some(a => a.id === action.achievement.id)) {
                return state;
            }
            return {
                ...state,
                achievements: [...state.achievements, { ...action.achievement, unlockedAt: Date.now() }],
            };
        }

        case "FIND_SECRET": {
            if (state.secretsFound.includes(action.secretId)) {
                return state;
            }
            return {
                ...state,
                secretsFound: [...state.secretsFound, action.secretId],
            };
        }

        case "SET_ZONE": {
            return { ...state, currentZone: action.zone };
        }

        case "TOGGLE_NARRATIVE": {
            return { ...state, narrativeEnabled: action.enabled };
        }

        case "EVOLVE_UI": {
            return { ...state, evolutionStage: Math.min(4, state.evolutionStage + 1) };
        }

        case "COMPLETE_ALBUM": {
            return { ...state, albumCompleted: true };
        }

        case "INCREMENT_SESSION": {
            return {
                ...state,
                stats: {
                    ...state.stats,
                    sessionsCount: state.stats.sessionsCount + 1,
                    lastVisit: Date.now(),
                },
            };
        }

        case "LOAD_STATE": {
            return { ...state, ...action.state };
        }

        default:
            return state;
    }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ExperienceContextValue {
    state: ExperienceState;

    // Actions
    incrementInfection: (amount?: number) => void;
    addListenTime: (seconds: number) => void;
    completeTrack: (track: Track) => void;
    incrementPlayCount: (track: Track) => void;
    unlockAchievement: (achievementId: string) => void;
    findSecret: (secretId: string) => void;
    setZone: (zone: ExperienceState["currentZone"]) => void;
    toggleNarrative: (enabled: boolean) => void;

    // Queries
    hasAchievement: (achievementId: string) => boolean;
    getAchievement: (achievementId: string) => Achievement | undefined;
    getInfectionPercentage: () => number;
    getEvolutionColors: () => { primary: string; secondary: string; glow: string };
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const STORAGE_KEY = "flux_experience_v1";

export function ExperienceProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(experienceReducer, getInitialState());

    // Load state from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                dispatch({ type: "LOAD_STATE", state: parsed });
            }
        } catch (e) {
            console.warn("[Experience] Failed to load saved state:", e);
        }
    }, []);

    // Save state to localStorage on changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn("[Experience] Failed to save state:", e);
        }
    }, [state]);

    // Check for time-based achievements
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 6) {
            const nightOwl = ACHIEVEMENTS.find(a => a.id === "night_owl");
            if (nightOwl && !state.achievements.some(a => a.id === "night_owl")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: nightOwl });
            }
        }
        if (hour >= 4 && hour < 6) {
            const earlyBird = ACHIEVEMENTS.find(a => a.id === "early_bird");
            if (earlyBird && !state.achievements.some(a => a.id === "early_bird")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: earlyBird });
            }
        }
    }, [state.achievements]);

    // Check for listen time achievements
    useEffect(() => {
        const minutes = state.stats.totalListenTime / 60;

        if (minutes >= 10) {
            const ach = ACHIEVEMENTS.find(a => a.id === "listen_10min");
            if (ach && !state.achievements.some(a => a.id === "listen_10min")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: ach });
            }
        }
        if (minutes >= 60) {
            const ach = ACHIEVEMENTS.find(a => a.id === "listen_1hour");
            if (ach && !state.achievements.some(a => a.id === "listen_1hour")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: ach });
            }
        }
        if (minutes >= 300) {
            const ach = ACHIEVEMENTS.find(a => a.id === "listen_5hours");
            if (ach && !state.achievements.some(a => a.id === "listen_5hours")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: ach });
            }
        }
    }, [state.stats.totalListenTime, state.achievements]);

    // Check for track completion achievements
    useEffect(() => {
        const count = state.stats.tracksCompleted.length;

        if (count >= 1) {
            const ach = ACHIEVEMENTS.find(a => a.id === "complete_1");
            if (ach && !state.achievements.some(a => a.id === "complete_1")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: ach });
            }
        }
        if (count >= 5) {
            const ach = ACHIEVEMENTS.find(a => a.id === "complete_5");
            if (ach && !state.achievements.some(a => a.id === "complete_5")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: ach });
            }
        }
        if (count >= TRACKS.length) {
            const ach = ACHIEVEMENTS.find(a => a.id === "complete_all");
            if (ach && !state.achievements.some(a => a.id === "complete_all")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: ach });
            }
        }
    }, [state.stats.tracksCompleted.length, state.achievements]);

    // Check for full infection achievement
    useEffect(() => {
        if (state.infectionLevel >= 100) {
            const ach = ACHIEVEMENTS.find(a => a.id === "full_infection");
            if (ach && !state.achievements.some(a => a.id === "full_infection")) {
                dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: ach });
            }
        }
    }, [state.infectionLevel, state.achievements]);

    // Actions
    const incrementInfection = useCallback((amount: number = 1) => {
        dispatch({ type: "INCREMENT_INFECTION", amount });
    }, []);

    const addListenTime = useCallback((seconds: number) => {
        dispatch({ type: "ADD_LISTEN_TIME", seconds });
    }, []);

    const completeTrack = useCallback((track: Track) => {
        dispatch({ type: "COMPLETE_TRACK", trackTitle: track.title });
    }, []);

    const incrementPlayCount = useCallback((track: Track) => {
        dispatch({ type: "INCREMENT_PLAY_COUNT", trackTitle: track.title });

        // First play achievement
        const firstPlay = ACHIEVEMENTS.find(a => a.id === "first_play");
        if (firstPlay && !state.achievements.some(a => a.id === "first_play")) {
            dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: firstPlay });
        }
    }, [state.achievements]);

    const unlockAchievement = useCallback((achievementId: string) => {
        const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (ach) {
            dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: ach });
        }
    }, []);

    const findSecret = useCallback((secretId: string) => {
        dispatch({ type: "FIND_SECRET", secretId });
    }, []);

    const setZone = useCallback((zone: ExperienceState["currentZone"]) => {
        dispatch({ type: "SET_ZONE", zone });
    }, []);

    const toggleNarrative = useCallback((enabled: boolean) => {
        dispatch({ type: "TOGGLE_NARRATIVE", enabled });
    }, []);

    // Queries
    const hasAchievement = useCallback((achievementId: string) => {
        return state.achievements.some(a => a.id === achievementId);
    }, [state.achievements]);

    const getAchievement = useCallback((achievementId: string) => {
        return ACHIEVEMENTS.find(a => a.id === achievementId);
    }, []);

    const getInfectionPercentage = useCallback(() => {
        return state.infectionLevel;
    }, [state.infectionLevel]);

    // Evolution stage colors - UI gets more intense as you progress
    const getEvolutionColors = useCallback(() => {
        const stages = [
            { primary: "#FF4500", secondary: "#1a1a1a", glow: "rgba(255, 69, 0, 0.3)" },    // Stage 0: Default orange
            { primary: "#FF4500", secondary: "#1f1a1a", glow: "rgba(255, 69, 0, 0.4)" },    // Stage 1: Warmer
            { primary: "#FF3300", secondary: "#221515", glow: "rgba(255, 51, 0, 0.5)" },    // Stage 2: More red
            { primary: "#FF0044", secondary: "#250f15", glow: "rgba(255, 0, 68, 0.6)" },    // Stage 3: Magenta shift
            { primary: "#FF00FF", secondary: "#1a0a1a", glow: "rgba(255, 0, 255, 0.7)" },   // Stage 4: Full infection
        ];
        return stages[state.evolutionStage] || stages[0];
    }, [state.evolutionStage]);

    const value: ExperienceContextValue = {
        state,
        incrementInfection,
        addListenTime,
        completeTrack,
        incrementPlayCount,
        unlockAchievement,
        findSecret,
        setZone,
        toggleNarrative,
        hasAchievement,
        getAchievement,
        getInfectionPercentage,
        getEvolutionColors,
    };

    return (
        <ExperienceContext.Provider value={value}>
            {children}
        </ExperienceContext.Provider>
    );
}

export function useExperience(): ExperienceContextValue {
    const context = useContext(ExperienceContext);
    if (!context) {
        throw new Error("useExperience must be used within an ExperienceProvider");
    }
    return context;
}
