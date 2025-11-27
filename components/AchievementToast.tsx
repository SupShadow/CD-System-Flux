"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Achievement, useExperience } from "@/contexts/ExperienceContext";

interface AchievementNotification {
    achievement: Achievement;
    id: number;
}

export function AchievementToast() {
    const { state } = useExperience();
    const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
    const [lastAchievementCount, setLastAchievementCount] = useState(state.achievements.length);

    // Watch for new achievements
    useEffect(() => {
        if (state.achievements.length > lastAchievementCount) {
            // New achievement unlocked
            const newAchievements = state.achievements.slice(lastAchievementCount);
            const newNotifications = newAchievements.map((ach, i) => ({
                achievement: ach,
                id: Date.now() + i,
            }));
            setNotifications(prev => [...prev, ...newNotifications]);
        }
        setLastAchievementCount(state.achievements.length);
    }, [state.achievements.length, lastAchievementCount]);

    const dismissNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Auto-dismiss after 5 seconds
    useEffect(() => {
        if (notifications.length === 0) return;

        const timer = setTimeout(() => {
            setNotifications(prev => prev.slice(1));
        }, 5000);

        return () => clearTimeout(timer);
    }, [notifications]);

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={() => dismissNotification(notification.id)}
                        className="pointer-events-auto cursor-pointer"
                    >
                        <div className="relative overflow-hidden">
                            {/* Glitch background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF4500]/20 via-transparent to-[#FF00FF]/20 animate-pulse" />

                            {/* Main container */}
                            <div className="relative bg-black/90 border border-[#FF4500] px-4 py-3 min-w-[280px]">
                                {/* Scan line effect */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,69,0,0.03)_50%)] bg-[length:100%_4px]" />
                                </div>

                                {/* Header */}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[#FF4500] text-xs font-mono tracking-wider animate-pulse">
                                        [ACHIEVEMENT_UNLOCKED]
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex items-center gap-3">
                                    {/* Icon */}
                                    <div className="w-10 h-10 flex items-center justify-center text-2xl bg-[#FF4500]/10 border border-[#FF4500]/30">
                                        {notification.achievement.icon}
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1">
                                        <div className="font-mono text-white text-sm font-bold tracking-wide">
                                            {notification.achievement.title}
                                        </div>
                                        <div className="font-mono text-white/60 text-xs">
                                            {notification.achievement.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Secret badge */}
                                {notification.achievement.secret && (
                                    <div className="absolute top-2 right-2">
                                        <span className="text-[10px] font-mono text-[#FF00FF] bg-[#FF00FF]/10 px-1.5 py-0.5 border border-[#FF00FF]/30">
                                            SECRET
                                        </span>
                                    </div>
                                )}

                                {/* Corner decorations */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#FF4500]" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#FF4500]" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#FF4500]" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#FF4500]" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
