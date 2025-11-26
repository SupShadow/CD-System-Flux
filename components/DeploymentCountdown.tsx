"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, AlertTriangle, CheckCircle, Calendar, Bell, BellRing, X, ChevronDown } from "lucide-react";
import { getCountdownTrack, Track } from "@/lib/tracks";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
}

type UrgencyState = "normal" | "approaching" | "critical" | "imminent" | "deployed";

// Calculate urgency based on time remaining
function getUrgencyState(timeLeft: TimeLeft | null): UrgencyState {
    if (!timeLeft) return "deployed";
    const { totalSeconds } = timeLeft;

    if (totalSeconds <= 0) return "deployed";
    if (totalSeconds <= 60) return "imminent"; // < 1 minute
    if (totalSeconds <= 3600) return "critical"; // < 1 hour
    if (totalSeconds <= 86400) return "approaching"; // < 1 day
    return "normal";
}

// Urgency config for colors and effects
const urgencyConfig: Record<UrgencyState, {
    color: string;
    bgColor: string;
    label: string;
    pulse: boolean;
    glitch: boolean;
}> = {
    normal: {
        color: "text-signal",
        bgColor: "bg-signal/10",
        label: "COUNTDOWN_ACTIVE",
        pulse: false,
        glitch: false
    },
    approaching: {
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        label: "T-MINUS_APPROACHING",
        pulse: true,
        glitch: false
    },
    critical: {
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        label: "CRITICAL_COUNTDOWN",
        pulse: true,
        glitch: true
    },
    imminent: {
        color: "text-red-500",
        bgColor: "bg-red-500/20",
        label: "DEPLOYMENT_IMMINENT",
        pulse: true,
        glitch: true
    },
    deployed: {
        color: "text-signal",
        bgColor: "bg-signal/20",
        label: "DEPLOYED",
        pulse: false,
        glitch: false
    },
};

// Time module component with flip animation
function TimeModule({
    value,
    label,
    urgency,
    prevValue
}: {
    value: number;
    label: string;
    urgency: UrgencyState;
    prevValue: number;
}) {
    const displayValue = String(value).padStart(2, "0");
    const config = urgencyConfig[urgency];
    const hasChanged = value !== prevValue;

    return (
        <motion.div
            className="flex flex-col items-center group cursor-default"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            <div className="relative">
                {/* Binary overlay */}
                <div className="absolute inset-0 font-mono text-[6px] text-stark/5 overflow-hidden pointer-events-none select-none group-hover:text-stark/10 transition-colors">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i}>
                            {Array.from({ length: 4 }, () => Math.random() > 0.5 ? "1" : "0").join("")}
                        </div>
                    ))}
                </div>

                {/* Main value display */}
                <motion.div
                    className={cn(
                        "relative w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center border-2 transition-all duration-200",
                        "font-mono text-2xl sm:text-3xl font-bold tabular-nums",
                        config.color,
                        urgency === "deployed" ? "border-signal/50" : "border-stark/20",
                        config.bgColor,
                        "group-hover:border-signal/50 group-hover:shadow-[0_0_15px_rgba(255,69,0,0.2)]"
                    )}
                    animate={hasChanged ? {
                        rotateX: [0, -10, 0],
                        scale: [1, 1.05, 1],
                    } : {}}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    {/* Glitch effect for critical states */}
                    {config.glitch && (
                        <>
                            <motion.span
                                className="absolute inset-0 flex items-center justify-center text-cyan-500/30"
                                animate={{ x: [-1, 1, -1], opacity: [0, 0.5, 0] }}
                                transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2 }}
                            >
                                {displayValue}
                            </motion.span>
                            <motion.span
                                className="absolute inset-0 flex items-center justify-center text-red-500/30"
                                animate={{ x: [1, -1, 1], opacity: [0, 0.5, 0] }}
                                transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2.1 }}
                            >
                                {displayValue}
                            </motion.span>
                        </>
                    )}

                    <span className="relative z-10">{displayValue}</span>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />
                </motion.div>
            </div>

            {/* Label */}
            <span className="mt-2 font-mono text-[10px] text-stark/60 tracking-wider group-hover:text-stark/80 transition-colors">
                {label}
            </span>
        </motion.div>
    );
}

// Progress bar component
function DeploymentProgress({
    progress,
    urgency
}: {
    progress: number;
    urgency: UrgencyState;
}) {
    const config = urgencyConfig[urgency];

    return (
        <div className="w-full group cursor-default">
            <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[9px] text-stark/40 group-hover:text-stark/60 transition-colors">
                    DEPLOYMENT_PROGRESS
                </span>
                <span className={cn("font-mono text-[9px] transition-all", config.color, "group-hover:scale-110")}>
                    {(progress * 100).toFixed(1)}%
                </span>
            </div>
            <div className="h-1.5 bg-stark/10 relative overflow-hidden group-hover:bg-stark/15 transition-colors group-hover:h-2">
                <motion.div
                    className={cn(
                        "absolute inset-y-0 left-0",
                        urgency === "critical" || urgency === "imminent"
                            ? "bg-red-500"
                            : urgency === "approaching"
                                ? "bg-amber-500"
                                : "bg-signal"
                    )}
                    style={{ width: `${progress * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
                {/* Scanning effect */}
                {progress < 1 && (
                    <motion.div
                        className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "400%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </div>
        </div>
    );
}

// Calendar modal
function CalendarModal({
    isOpen,
    onClose,
    track,
    targetDate
}: {
    isOpen: boolean;
    onClose: () => void;
    track: Track;
    targetDate: Date;
}) {
    const createGoogleCalendarUrl = () => {
        const title = encodeURIComponent(`${track.title} - Release`);
        const details = encodeURIComponent(`"${track.title}" by Julian Guggeis drops today! Listen on SYSTEM FLUX.`);
        const dateStr = targetDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dateStr}/${dateStr}`;
    };

    const createICSFile = () => {
        const dateStr = targetDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${dateStr}
DTEND:${dateStr}
SUMMARY:${track.title} - Release
DESCRIPTION:"${track.title}" by Julian Guggeis drops today! Listen on SYSTEM FLUX.
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${track.title.replace(/[^a-z0-9]/gi, "_")}_release.ics`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-void/90 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-void-deep border border-signal/30 p-6 max-w-sm w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-signal" />
                        <span className="font-mono text-xs text-signal">ADD_TO_CALENDAR</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-stark/50 hover:text-signal transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-stark/5 border border-stark/10">
                    <div className="font-mono text-sm text-signal mb-1">{track.title}</div>
                    <div className="font-mono text-xs text-stark/50">
                        {targetDate.toLocaleDateString("de-DE", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <a
                        href={createGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-3 py-2 font-mono text-xs border border-stark/20 hover:border-signal/50 hover:bg-signal/5 transition-all"
                    >
                        <span className="text-stark/70">GOOGLE_CALENDAR</span>
                        <ChevronDown className="w-3 h-3 text-stark/40 rotate-[-90deg]" />
                    </a>
                    <button
                        onClick={createICSFile}
                        className="flex items-center justify-between w-full px-3 py-2 font-mono text-xs border border-stark/20 hover:border-signal/50 hover:bg-signal/5 transition-all"
                    >
                        <span className="text-stark/70">APPLE_CALENDAR</span>
                        <ChevronDown className="w-3 h-3 text-stark/40 rotate-[-90deg]" />
                    </button>
                    <button
                        onClick={createICSFile}
                        className="flex items-center justify-between w-full px-3 py-2 font-mono text-xs border border-stark/20 hover:border-signal/50 hover:bg-signal/5 transition-all"
                    >
                        <span className="text-stark/70">OUTLOOK</span>
                        <ChevronDown className="w-3 h-3 text-stark/40 rotate-[-90deg]" />
                    </button>
                </div>

                <div className="mt-4 pt-3 border-t border-stark/10">
                    <div className="font-mono text-[8px] text-stark/30 text-center">
                        SYNC_CALENDAR_REMINDER
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Main component
export default function DeploymentCountdown() {
    const [countdownData, setCountdownData] = useState(getCountdownTrack());
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
    const [showNotifyConfirm, setShowNotifyConfirm] = useState(false);

    const { disableGlitch } = useAccessibility();

    const urgency = getUrgencyState(timeLeft);
    // Override glitch setting when safe mode is enabled (epilepsy safety)
    const config = useMemo(() => ({
        ...urgencyConfig[urgency],
        glitch: disableGlitch ? false : urgencyConfig[urgency].glitch,
    }), [urgency, disableGlitch]);

    // Calculate progress (assuming 30 days announcement period)
    const progress = useMemo(() => {
        if (!timeLeft || !countdownData) return 1;
        const announcementPeriod = 30 * 24 * 60 * 60; // 30 days in seconds
        const elapsed = announcementPeriod - timeLeft.totalSeconds;
        return Math.max(0, Math.min(1, elapsed / announcementPeriod));
    }, [timeLeft, countdownData]);

    // Target date for calendar
    const targetDate = useMemo(() => {
        if (!countdownData?.track.releaseDate) return new Date();
        return new Date(countdownData.track.releaseDate + "T00:00:00");
    }, [countdownData]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!countdownData || countdownData.isReleased) return;

        const calculateTimeLeft = (): TimeLeft | null => {
            const target = new Date(countdownData.track.releaseDate + "T00:00:00");
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            if (difference <= 0) return null;

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                totalSeconds: Math.floor(difference / 1000),
            };
        };

        const updateCountdown = () => {
            setTimeLeft(prev => {
                setPrevTimeLeft(prev);
                const newTimeLeft = calculateTimeLeft();
                if (!newTimeLeft) {
                    setCountdownData(getCountdownTrack());
                }
                return newTimeLeft;
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [countdownData]);

    // Notification request
    const handleNotifyClick = useCallback(async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support notifications");
            return;
        }

        if (Notification.permission === "granted") {
            setIsNotifyEnabled(true);
            setShowNotifyConfirm(true);
            setTimeout(() => setShowNotifyConfirm(false), 2000);
        } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                setIsNotifyEnabled(true);
                setShowNotifyConfirm(true);
                setTimeout(() => setShowNotifyConfirm(false), 2000);
            }
        }
    }, []);

    if (!isClient || !countdownData) return null;

    const { track, isReleased } = countdownData;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                    scale: 1.01,
                    boxShadow: "0 0 30px rgba(255,69,0,0.15)"
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "relative p-4 sm:p-6 border backdrop-blur-sm overflow-hidden cursor-default group",
                    "bg-void-deep/90 transition-colors duration-300",
                    urgency === "deployed"
                        ? "border-signal/50 hover:border-signal/70"
                        : urgency === "critical" || urgency === "imminent"
                            ? "border-red-500/50 hover:border-red-500/70"
                            : urgency === "approaching"
                                ? "border-amber-500/30 hover:border-amber-500/50"
                                : "border-stark/20 hover:border-signal/40"
                )}
            >
                {/* Scanning line effect */}
                {!isReleased && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-signal/5 to-transparent pointer-events-none"
                        animate={{ y: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <motion.div
                        className="flex items-center gap-2 cursor-default"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isReleased ? (
                            <CheckCircle className="w-4 h-4 text-signal" />
                        ) : urgency === "critical" || urgency === "imminent" ? (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </motion.div>
                        ) : (
                            <motion.div
                                animate={config.pulse ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Rocket className={cn("w-4 h-4", config.color)} />
                            </motion.div>
                        )}
                        <span className={cn("font-mono text-[10px] tracking-wider", config.color)}>
                            {config.label}
                        </span>
                    </motion.div>

                    {/* Status indicator */}
                    <motion.div
                        className="flex items-center gap-2 cursor-default"
                        whileHover={{ x: -3 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className={cn(
                                "w-2 h-2 rounded-full",
                                isReleased ? "bg-signal" :
                                urgency === "critical" || urgency === "imminent" ? "bg-red-500" :
                                urgency === "approaching" ? "bg-amber-500" : "bg-signal"
                            )}
                            animate={!isReleased ? {
                                boxShadow: [
                                    "0 0 0px currentColor",
                                    "0 0 8px currentColor",
                                    "0 0 0px currentColor"
                                ]
                            } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="font-mono text-[9px] text-stark/40">
                            {isReleased ? "LIVE" : "PENDING"}
                        </span>
                    </motion.div>
                </div>

                {/* Track title */}
                <motion.div
                    className="mb-4 cursor-default group/title"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="font-mono text-[10px] text-stark/40 mb-1 group-hover/title:text-stark/60 transition-colors">
                        TARGET: TRACK_DEPLOYMENT
                    </div>
                    <motion.h3
                        className={cn(
                            "font-mono text-xl sm:text-2xl font-bold transition-all",
                            isReleased ? "text-signal" : config.color,
                            "group-hover/title:tracking-wider"
                        )}
                        animate={config.glitch ? {
                            x: [-1, 1, -1, 0],
                        } : {}}
                        transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
                    >
                        {track.title}
                    </motion.h3>
                </motion.div>

                {isReleased ? (
                    /* Deployed state */
                    <div className="text-center py-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-3 border-2 border-signal bg-signal/10"
                        >
                            <CheckCircle className="w-6 h-6 text-signal" />
                            <span className="font-mono text-lg text-signal font-bold">
                                DEPLOYMENT_COMPLETE
                            </span>
                        </motion.div>
                        <div className="mt-4 font-mono text-xs text-stark/50">
                            Track is now available for streaming
                        </div>
                    </div>
                ) : (
                    <>
                        {/* T-MINUS display */}
                        <div className="mb-4" role="timer" aria-live="polite" aria-atomic="true" aria-label={`Countdown: ${timeLeft?.days || 0} days, ${timeLeft?.hours || 0} hours, ${timeLeft?.minutes || 0} minutes, ${timeLeft?.seconds || 0} seconds remaining`}>
                            <div className="font-mono text-[10px] text-stark/60 mb-3 text-center" aria-hidden="true">
                                T-MINUS
                            </div>
                            <div className="flex items-center justify-center gap-2 sm:gap-4">
                                <TimeModule
                                    value={timeLeft?.days || 0}
                                    label="DAYS"
                                    urgency={urgency}
                                    prevValue={prevTimeLeft?.days || 0}
                                />
                                <span className={cn("font-mono text-2xl", config.color, "hidden sm:block")}>:</span>
                                <TimeModule
                                    value={timeLeft?.hours || 0}
                                    label="HRS"
                                    urgency={urgency}
                                    prevValue={prevTimeLeft?.hours || 0}
                                />
                                <span className={cn("font-mono text-2xl", config.color, "hidden sm:block")}>:</span>
                                <TimeModule
                                    value={timeLeft?.minutes || 0}
                                    label="MIN"
                                    urgency={urgency}
                                    prevValue={prevTimeLeft?.minutes || 0}
                                />
                                <span className={cn("font-mono text-2xl", config.color, "hidden sm:block")}>:</span>
                                <TimeModule
                                    value={timeLeft?.seconds || 0}
                                    label="SEC"
                                    urgency={urgency}
                                    prevValue={prevTimeLeft?.seconds || 0}
                                />
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <DeploymentProgress progress={progress} urgency={urgency} />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2" role="group" aria-label="Countdown actions">
                            <motion.button
                                onClick={() => setShowCalendar(true)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-3 py-2",
                                    "font-mono text-xs border transition-all",
                                    "border-stark/20 text-stark/60 hover:border-signal/50 hover:text-signal hover:bg-signal/5"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                aria-label={`Add ${track.title} release to calendar`}
                            >
                                <Calendar className="w-3 h-3" aria-hidden="true" />
                                <span>ADD_TO_CAL</span>
                            </motion.button>

                            <motion.button
                                onClick={handleNotifyClick}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-3 py-2",
                                    "font-mono text-xs border transition-all",
                                    isNotifyEnabled
                                        ? "border-signal/50 text-signal bg-signal/10"
                                        : "border-stark/20 text-stark/60 hover:border-signal/50 hover:text-signal hover:bg-signal/5"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                aria-label={isNotifyEnabled ? "Notifications enabled" : "Enable notifications for release"}
                                aria-pressed={isNotifyEnabled}
                            >
                                {isNotifyEnabled ? (
                                    <>
                                        <BellRing className="w-3 h-3" aria-hidden="true" />
                                        <span>{showNotifyConfirm ? "ENABLED!" : "NOTIFY_ON"}</span>
                                    </>
                                ) : (
                                    <>
                                        <Bell className="w-3 h-3" aria-hidden="true" />
                                        <span>NOTIFY_ME</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </>
                )}

                {/* Footer info */}
                <div className="mt-4 pt-3 border-t border-stark/10 flex justify-between items-center group/footer">
                    <div className="font-mono text-[8px] text-stark/60 group-hover/footer:text-stark/80 transition-colors">
                        SYSTEM_FLUX // DEPLOYMENT_PROTOCOL
                    </div>
                    <div className="font-mono text-[8px] text-stark/60 group-hover/footer:text-signal/80 transition-colors">
                        {targetDate.toLocaleDateString("de-DE")}
                    </div>
                </div>

                {/* Corner decorations - animate on parent hover */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-signal/30 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-signal/60" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-signal/30 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-signal/60" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-signal/30 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-signal/60" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-signal/30 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-signal/60" />
            </motion.div>

            {/* Calendar Modal */}
            <AnimatePresence>
                {showCalendar && (
                    <CalendarModal
                        isOpen={showCalendar}
                        onClose={() => setShowCalendar(false)}
                        track={track}
                        targetDate={targetDate}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// Compact inline version for header/nav
export function MiniDeploymentCountdown() {
    const [countdownData, setCountdownData] = useState(getCountdownTrack());
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!countdownData || countdownData.isReleased) return;

        const calculateTimeLeft = (): TimeLeft | null => {
            const target = new Date(countdownData.track.releaseDate + "T00:00:00");
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            if (difference <= 0) return null;

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                totalSeconds: Math.floor(difference / 1000),
            };
        };

        const updateCountdown = () => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (!newTimeLeft) {
                setCountdownData(getCountdownTrack());
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [countdownData]);

    if (!isClient || !countdownData) return null;

    const { track, isReleased } = countdownData;
    const urgency = getUrgencyState(timeLeft);
    const config = urgencyConfig[urgency];

    const formatCompact = () => {
        if (!timeLeft) return "NOW";
        if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h`;
        if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m`;
        return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5",
                "bg-void-deep/80 border backdrop-blur-sm",
                urgency === "deployed" ? "border-signal/50" :
                urgency === "critical" || urgency === "imminent" ? "border-red-500/30" :
                urgency === "approaching" ? "border-amber-500/30" : "border-signal/30"
            )}
        >
            {isReleased ? (
                <>
                    <CheckCircle className="w-3 h-3 text-signal" />
                    <span className="font-mono text-xs text-stark/70">
                        <span className="text-signal">{track.title}</span>
                        <span className="text-stark/50 ml-1.5">OUT_NOW</span>
                    </span>
                </>
            ) : (
                <>
                    <motion.div
                        animate={config.pulse ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    >
                        <Rocket className={cn("w-3 h-3", config.color)} />
                    </motion.div>
                    <span className="font-mono text-xs text-stark/70">
                        <span className={config.color}>{track.title}</span>
                        <span className="text-stark/50 mx-1.5">T-</span>
                        <span className={cn("tabular-nums", config.color)}>
                            {formatCompact()}
                        </span>
                    </span>
                </>
            )}
        </motion.div>
    );
}
