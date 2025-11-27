"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Sunrise, Sunset } from "lucide-react";

// ============================================================================
// TIME PERIOD DEFINITIONS
// ============================================================================

export type TimePeriod = "night" | "dawn" | "day" | "dusk";

interface TimeTheme {
    period: TimePeriod;
    name: string;
    description: string;
    icon: typeof Moon;
    gradient: string;
    accentColor: string;
    ambientOpacity: number;
}

const TIME_THEMES: Record<TimePeriod, TimeTheme> = {
    night: {
        period: "night",
        name: "NIGHT_MODE",
        description: "The system sleeps... but not completely",
        icon: Moon,
        gradient: "from-[#0a0a20] via-[#1a0a2e] to-[#0a0a20]",
        accentColor: "#8B5CF6",
        ambientOpacity: 0.15,
    },
    dawn: {
        period: "dawn",
        name: "DAWN_PROTOCOL",
        description: "System awakening sequence initiated",
        icon: Sunrise,
        gradient: "from-[#1a0a15] via-[#2d1f3d] to-[#1a1a2e]",
        accentColor: "#F97316",
        ambientOpacity: 0.1,
    },
    day: {
        period: "day",
        name: "STANDARD_OPS",
        description: "Full operational capacity",
        icon: Sun,
        gradient: "from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]",
        accentColor: "#FF4500",
        ambientOpacity: 0.05,
    },
    dusk: {
        period: "dusk",
        name: "TWILIGHT_PHASE",
        description: "Transitioning to night protocols",
        icon: Sunset,
        gradient: "from-[#1a0a0a] via-[#2d1a2a] to-[#0a0a1a]",
        accentColor: "#EC4899",
        ambientOpacity: 0.12,
    },
};

function getCurrentTimePeriod(): TimePeriod {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 5) return "night";
    if (hour >= 5 && hour < 8) return "dawn";
    if (hour >= 8 && hour < 18) return "day";
    if (hour >= 18 && hour < 21) return "dusk";
    return "night";
}

// ============================================================================
// CONTEXT
// ============================================================================

interface TimeContextValue {
    period: TimePeriod;
    theme: TimeTheme;
    hour: number;
    isNightTime: boolean;
    secretContentAvailable: boolean;
}

const TimeContext = createContext<TimeContextValue | null>(null);

export function useTimeContext(): TimeContextValue {
    const context = useContext(TimeContext);
    if (!context) {
        throw new Error("useTimeContext must be used within TimeBasedProvider");
    }
    return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function TimeBasedProvider({ children }: { children: ReactNode }) {
    const [period, setPeriod] = useState<TimePeriod>("day");
    const [hour, setHour] = useState(12);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setHour(now.getHours());
            setPeriod(getCurrentTimePeriod());
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const theme = TIME_THEMES[period];
    const isNightTime = period === "night" || period === "dusk";
    const secretContentAvailable = period === "night"; // Secrets only at night

    return (
        <TimeContext.Provider value={{ period, theme, hour, isNightTime, secretContentAvailable }}>
            {children}
        </TimeContext.Provider>
    );
}

// ============================================================================
// AMBIENT OVERLAY
// ============================================================================

export function TimeAmbientOverlay() {
    const { theme, period } = useTimeContext();

    return (
        <div className="fixed inset-0 pointer-events-none z-[5]" aria-hidden="true">
            {/* Gradient overlay based on time */}
            <motion.div
                key={period}
                initial={{ opacity: 0 }}
                animate={{ opacity: theme.ambientOpacity }}
                transition={{ duration: 2 }}
                className={`absolute inset-0 bg-gradient-to-b ${theme.gradient}`}
            />

            {/* Night-specific effects */}
            {period === "night" && <NightStars />}

            {/* Dawn/Dusk glow */}
            {(period === "dawn" || period === "dusk") && (
                <div
                    className="absolute bottom-0 left-0 right-0 h-1/3"
                    style={{
                        background: `linear-gradient(to top, ${theme.accentColor}10, transparent)`,
                    }}
                />
            )}
        </div>
    );
}

function NightStars() {
    const [stars, setStars] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);

    useEffect(() => {
        const newStars = Array.from({ length: 50 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 60, // Only top 60% of screen
            size: 1 + Math.random() * 2,
            delay: Math.random() * 3,
        }));
        setStars(newStars);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {stars.map((star, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        delay: star.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// ============================================================================
// TIME INDICATOR
// ============================================================================

export function TimeIndicator() {
    const { theme, hour, period } = useTimeContext();
    const Icon = theme.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2
                       bg-black/80 border border-white/10 px-3 py-1.5 font-mono text-xs"
        >
            <Icon size={12} style={{ color: theme.accentColor }} />
            <span className="text-white/60">{theme.name}</span>
            <span className="text-white/30">|</span>
            <span style={{ color: theme.accentColor }}>
                {hour.toString().padStart(2, "0")}:00
            </span>
        </motion.div>
    );
}

// ============================================================================
// SECRET CONTENT WRAPPER
// ============================================================================

interface NightOnlyContentProps {
    children: ReactNode;
    fallback?: ReactNode;
    showHint?: boolean;
}

export function NightOnlyContent({ children, fallback, showHint = true }: NightOnlyContentProps) {
    const { secretContentAvailable, period } = useTimeContext();

    if (secretContentAvailable) {
        return (
            <motion.div
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1 }}
            >
                {children}
            </motion.div>
        );
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showHint) {
        return (
            <div className="relative p-4 border border-dashed border-[#8B5CF6]/30 bg-[#8B5CF6]/5">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <Moon size={24} className="mx-auto mb-2 text-[#8B5CF6]/50" />
                        <p className="font-mono text-xs text-[#8B5CF6]/50">
                            [NIGHT_ONLY_CONTENT]
                        </p>
                        <p className="font-mono text-[10px] text-white/30 mt-1">
                            Return after midnight to unlock
                        </p>
                    </div>
                </div>
                <div className="opacity-0 pointer-events-none">{children}</div>
            </div>
        );
    }

    return null;
}

// ============================================================================
// SPECIAL NIGHT TRACK UNLOCK
// ============================================================================

export function NightExclusiveTrackBadge() {
    const { secretContentAvailable } = useTimeContext();

    if (!secretContentAvailable) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#8B5CF6]/20
                           border border-[#8B5CF6]/50 text-[#8B5CF6] text-[10px] font-mono"
            >
                <Moon size={10} />
                NIGHT_EXCLUSIVE
            </motion.div>
        </AnimatePresence>
    );
}
