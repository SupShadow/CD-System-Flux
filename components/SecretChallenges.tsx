"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/contexts/ExperienceContext";
import { Lock, Unlock, Eye, EyeOff, Zap, Terminal, Music, Clock, MousePointer } from "lucide-react";

// ============================================================================
// SECRET DEFINITIONS
// ============================================================================

export interface Secret {
    id: string;
    name: string;
    description: string;
    hint: string;
    difficulty: "easy" | "medium" | "hard" | "legendary";
    category: "interaction" | "time" | "audio" | "exploration" | "code";
    icon: typeof Lock;
    reward?: string;
}

export const SECRETS: Secret[] = [
    // Interaction secrets
    {
        id: "rapid_clicker",
        name: "RAPID_FIRE",
        description: "Click 10 times in 2 seconds",
        hint: "Speed is key...",
        difficulty: "easy",
        category: "interaction",
        icon: MousePointer,
    },
    {
        id: "idle_master",
        name: "PATIENCE_PROTOCOL",
        description: "Stay idle for 5 minutes",
        hint: "Sometimes the best action is no action",
        difficulty: "medium",
        category: "interaction",
        icon: Clock,
    },
    {
        id: "corner_explorer",
        name: "CORNER_CASE",
        description: "Move mouse to all 4 corners quickly",
        hint: "Explore the boundaries",
        difficulty: "easy",
        category: "interaction",
        icon: MousePointer,
    },

    // Audio secrets
    {
        id: "volume_dancer",
        name: "VOLUME_DANCE",
        description: "Change volume 20 times in one session",
        hint: "The volume slider hides a secret",
        difficulty: "medium",
        category: "audio",
        icon: Music,
    },
    {
        id: "stem_master",
        name: "DECONSTRUCTOR",
        description: "Toggle all stems off, then back on",
        hint: "Break it down, build it up",
        difficulty: "easy",
        category: "audio",
        icon: Music,
    },
    {
        id: "full_journey",
        name: "MARATHON_RUNNER",
        description: "Listen to 5 full tracks without skipping",
        hint: "Commitment is rewarded",
        difficulty: "hard",
        category: "audio",
        icon: Music,
    },

    // Time secrets
    {
        id: "midnight_listener",
        name: "WITCHING_HOUR",
        description: "Play a track at exactly midnight",
        hint: "When the clock strikes twelve...",
        difficulty: "hard",
        category: "time",
        icon: Clock,
    },
    {
        id: "sunrise_witness",
        name: "FIRST_LIGHT",
        description: "Be listening when the sun rises",
        hint: "Early birds get the worm",
        difficulty: "hard",
        category: "time",
        icon: Clock,
    },

    // Exploration secrets
    {
        id: "scroll_explorer",
        name: "DEEP_DIVER",
        description: "Scroll to the very bottom of every section",
        hint: "There's always more below",
        difficulty: "medium",
        category: "exploration",
        icon: Eye,
    },
    {
        id: "hover_collector",
        name: "CURIOUS_CURSOR",
        description: "Hover over 50 different interactive elements",
        hint: "Explore everything",
        difficulty: "medium",
        category: "exploration",
        icon: MousePointer,
    },

    // Code secrets
    {
        id: "console_hacker",
        name: "CONSOLE_COWBOY",
        description: "Open browser console and find the message",
        hint: "F12 is your friend",
        difficulty: "easy",
        category: "code",
        icon: Terminal,
    },
    {
        id: "konami_master",
        name: "RETRO_GAMER",
        description: "Enter the Konami code",
        hint: "Up, up, down, down...",
        difficulty: "easy",
        category: "code",
        icon: Zap,
    },
    {
        id: "terminal_explorer",
        name: "COMMAND_LINE_WARRIOR",
        description: "Use all terminal commands",
        hint: "` opens doors",
        difficulty: "medium",
        category: "code",
        icon: Terminal,
    },

    // Legendary
    {
        id: "completionist",
        name: "FLUX_MASTER",
        description: "Unlock all other secrets",
        hint: "The ultimate challenge",
        difficulty: "legendary",
        category: "exploration",
        icon: Unlock,
    },
];

// ============================================================================
// CONTEXT
// ============================================================================

interface SecretTrackerState {
    clickTimes: number[];
    lastActivity: number;
    cornersVisited: Set<string>;
    volumeChanges: number;
    stemsToggled: Set<string>;
    tracksCompletedWithoutSkip: number;
    currentTrackStartTime: number | null;
    hoverCount: number;
    terminalCommandsUsed: Set<string>;
}

interface SecretContextValue {
    unlockedSecrets: string[];
    isSecretUnlocked: (secretId: string) => boolean;
    getSecret: (secretId: string) => Secret | undefined;
    trackClick: () => void;
    trackMouseCorner: (corner: string) => void;
    trackVolumeChange: () => void;
    trackStemToggle: (stem: string) => void;
    trackTrackComplete: (skipped: boolean) => void;
    trackHover: () => void;
    trackTerminalCommand: (command: string) => void;
    checkTimeBasedSecrets: () => void;
}

const SecretContext = createContext<SecretContextValue | null>(null);

export function useSecrets(): SecretContextValue {
    const context = useContext(SecretContext);
    if (!context) {
        throw new Error("useSecrets must be used within SecretProvider");
    }
    return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function SecretProvider({ children }: { children: ReactNode }) {
    const { findSecret, unlockAchievement, state: experienceState } = useExperience();

    const [trackerState, setTrackerState] = useState<SecretTrackerState>({
        clickTimes: [],
        lastActivity: Date.now(),
        cornersVisited: new Set(),
        volumeChanges: 0,
        stemsToggled: new Set(),
        tracksCompletedWithoutSkip: 0,
        currentTrackStartTime: null,
        hoverCount: 0,
        terminalCommandsUsed: new Set(),
    });

    const unlockSecret = useCallback((secretId: string) => {
        if (!experienceState.secretsFound.includes(secretId)) {
            findSecret(secretId);

            // Also unlock corresponding achievement if exists
            const secret = SECRETS.find(s => s.id === secretId);
            if (secret) {
                unlockAchievement(secretId);
            }
        }
    }, [findSecret, unlockAchievement, experienceState.secretsFound]);

    // Check for rapid clicker
    const trackClick = useCallback(() => {
        const now = Date.now();
        setTrackerState(prev => {
            const recentClicks = [...prev.clickTimes, now].filter(t => now - t < 2000);

            if (recentClicks.length >= 10) {
                unlockSecret("rapid_clicker");
            }

            return { ...prev, clickTimes: recentClicks, lastActivity: now };
        });
    }, [unlockSecret]);

    // Check for corner explorer
    const trackMouseCorner = useCallback((corner: string) => {
        setTrackerState(prev => {
            const newCorners = new Set(prev.cornersVisited).add(corner);

            if (newCorners.size >= 4) {
                unlockSecret("corner_explorer");
            }

            return { ...prev, cornersVisited: newCorners };
        });
    }, [unlockSecret]);

    // Volume changes
    const trackVolumeChange = useCallback(() => {
        setTrackerState(prev => {
            const newCount = prev.volumeChanges + 1;

            if (newCount >= 20) {
                unlockSecret("volume_dancer");
            }

            return { ...prev, volumeChanges: newCount };
        });
    }, [unlockSecret]);

    // Stem toggles
    const trackStemToggle = useCallback((stem: string) => {
        setTrackerState(prev => {
            const newStems = new Set(prev.stemsToggled).add(stem);

            if (newStems.size >= 4) {
                unlockSecret("stem_master");
            }

            return { ...prev, stemsToggled: newStems };
        });
    }, [unlockSecret]);

    // Track completion
    const trackTrackComplete = useCallback((skipped: boolean) => {
        setTrackerState(prev => {
            if (skipped) {
                return { ...prev, tracksCompletedWithoutSkip: 0 };
            }

            const newCount = prev.tracksCompletedWithoutSkip + 1;

            if (newCount >= 5) {
                unlockSecret("full_journey");
            }

            return { ...prev, tracksCompletedWithoutSkip: newCount };
        });
    }, [unlockSecret]);

    // Hover tracking
    const trackHover = useCallback(() => {
        setTrackerState(prev => {
            const newCount = prev.hoverCount + 1;

            if (newCount >= 50) {
                unlockSecret("hover_collector");
            }

            return { ...prev, hoverCount: newCount };
        });
    }, [unlockSecret]);

    // Terminal commands
    const trackTerminalCommand = useCallback((command: string) => {
        setTrackerState(prev => {
            const newCommands = new Set(prev.terminalCommandsUsed).add(command);

            // Assuming 5 main commands: help, list_tracks, secret, clear, exit
            if (newCommands.size >= 5) {
                unlockSecret("terminal_explorer");
            }

            return { ...prev, terminalCommandsUsed: newCommands };
        });
    }, [unlockSecret]);

    // Time-based secrets
    const checkTimeBasedSecrets = useCallback(() => {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();

        // Midnight check (between 00:00 and 00:01)
        if (hour === 0 && minutes === 0) {
            unlockSecret("midnight_listener");
        }

        // Sunrise check (around 6:00)
        if (hour === 6 && minutes >= 0 && minutes <= 5) {
            unlockSecret("sunrise_witness");
        }
    }, [unlockSecret]);

    // Check for idle master
    useEffect(() => {
        const checkIdle = setInterval(() => {
            const idleTime = Date.now() - trackerState.lastActivity;
            if (idleTime >= 5 * 60 * 1000) { // 5 minutes
                unlockSecret("idle_master");
            }
        }, 10000);

        return () => clearInterval(checkIdle);
    }, [trackerState.lastActivity, unlockSecret]);

    // Check for completionist
    useEffect(() => {
        const nonLegendarySecrets = SECRETS.filter(s => s.difficulty !== "legendary");
        const allUnlocked = nonLegendarySecrets.every(s =>
            experienceState.secretsFound.includes(s.id)
        );

        if (allUnlocked && !experienceState.secretsFound.includes("completionist")) {
            unlockSecret("completionist");
        }
    }, [experienceState.secretsFound, unlockSecret]);

    const isSecretUnlocked = useCallback((secretId: string) => {
        return experienceState.secretsFound.includes(secretId);
    }, [experienceState.secretsFound]);

    const getSecret = useCallback((secretId: string) => {
        return SECRETS.find(s => s.id === secretId);
    }, []);

    return (
        <SecretContext.Provider
            value={{
                unlockedSecrets: experienceState.secretsFound,
                isSecretUnlocked,
                getSecret,
                trackClick,
                trackMouseCorner,
                trackVolumeChange,
                trackStemToggle,
                trackTrackComplete,
                trackHover,
                trackTerminalCommand,
                checkTimeBasedSecrets,
            }}
        >
            {children}
        </SecretContext.Provider>
    );
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

export function SecretUnlockNotification({ secret }: { secret: Secret }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999]"
        >
            <div className="relative bg-black border-2 border-[#39FF14] p-4 min-w-[300px]">
                {/* Glitch effect */}
                <div className="absolute inset-0 bg-[#39FF14]/10 animate-pulse" />

                {/* Content */}
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <Unlock size={16} className="text-[#39FF14]" />
                        <span className="font-mono text-[#39FF14] text-xs tracking-wider">
                            [SECRET_UNLOCKED]
                        </span>
                    </div>

                    <div className="font-mono text-white text-lg font-bold">
                        {secret.name}
                    </div>

                    <div className="font-mono text-white/60 text-sm mt-1">
                        {secret.description}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <span
                            className={`text-[10px] font-mono px-2 py-0.5 border ${
                                secret.difficulty === "legendary"
                                    ? "text-[#FFD700] border-[#FFD700]"
                                    : secret.difficulty === "hard"
                                    ? "text-[#FF4500] border-[#FF4500]"
                                    : secret.difficulty === "medium"
                                    ? "text-[#00D4FF] border-[#00D4FF]"
                                    : "text-[#39FF14] border-[#39FF14]"
                            }`}
                        >
                            {secret.difficulty.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">
                            {secret.category.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#39FF14]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#39FF14]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#39FF14]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#39FF14]" />
            </div>
        </motion.div>
    );
}

export function SecretProgress() {
    const { unlockedSecrets } = useSecrets();
    const totalSecrets = SECRETS.length;
    const unlockedCount = unlockedSecrets.length;
    const percentage = (unlockedCount / totalSecrets) * 100;

    return (
        <div className="font-mono text-xs">
            <div className="flex items-center gap-2 mb-1">
                <Lock size={12} className="text-[#FF4500]" />
                <span className="text-white/60">SECRETS</span>
                <span className="text-[#FF4500]">
                    {unlockedCount}/{totalSecrets}
                </span>
            </div>
            <div className="h-1 bg-white/10 w-32">
                <motion.div
                    className="h-full bg-[#FF4500]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
}

export function SecretsList({ showLocked = false }: { showLocked?: boolean }) {
    const { isSecretUnlocked } = useSecrets();

    const sortedSecrets = [...SECRETS].sort((a, b) => {
        const aUnlocked = isSecretUnlocked(a.id);
        const bUnlocked = isSecretUnlocked(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });

    return (
        <div className="space-y-2">
            {sortedSecrets.map(secret => {
                const unlocked = isSecretUnlocked(secret.id);

                if (!showLocked && !unlocked) return null;

                return (
                    <div
                        key={secret.id}
                        className={`p-3 border font-mono text-sm ${
                            unlocked
                                ? "border-[#39FF14]/50 bg-[#39FF14]/5"
                                : "border-white/10 bg-white/5"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {unlocked ? (
                                <Unlock size={14} className="text-[#39FF14]" />
                            ) : (
                                <Lock size={14} className="text-white/30" />
                            )}
                            <span className={unlocked ? "text-white" : "text-white/30"}>
                                {unlocked ? secret.name : "???"}
                            </span>
                        </div>
                        <p className="text-white/50 text-xs mt-1 ml-6">
                            {unlocked ? secret.description : secret.hint}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
