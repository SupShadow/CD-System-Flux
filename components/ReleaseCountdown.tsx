"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle } from "lucide-react";
import { getCountdownTrack } from "@/lib/tracks";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
    const target = new Date(targetDate + "T00:00:00");
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
        return null;
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
}

function formatCountdown(timeLeft: TimeLeft): string {
    const parts: string[] = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.hours}h`);
    if (timeLeft.days === 0) {
        if (timeLeft.minutes > 0 || timeLeft.hours > 0) parts.push(`${timeLeft.minutes}m`);
        if (timeLeft.hours === 0) parts.push(`${timeLeft.seconds}s`);
    }
    return parts.join(" ");
}

export default function ReleaseCountdown() {
    const [countdownData, setCountdownData] = useState(getCountdownTrack());
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!countdownData || countdownData.isReleased) return;

        const updateCountdown = () => {
            const newTimeLeft = calculateTimeLeft(countdownData.track.releaseDate!);
            setTimeLeft(newTimeLeft);

            // If countdown finished, refresh the countdown data
            if (!newTimeLeft) {
                setCountdownData(getCountdownTrack());
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [countdownData]);

    // Don't render on server or if no countdown data
    if (!isClient || !countdownData) return null;

    const { track, isReleased } = countdownData;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-void-deep/80 border border-signal/30 backdrop-blur-sm"
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
                    <Clock className="w-3 h-3 text-signal animate-pulse" />
                    <span className="font-mono text-xs text-stark/70">
                        <span className="text-signal">{track.title}</span>
                        <span className="text-stark/50 mx-1.5">drops in</span>
                        {timeLeft && (
                            <span className="text-signal tabular-nums">
                                {formatCountdown(timeLeft)}
                            </span>
                        )}
                    </span>
                </>
            )}
        </motion.div>
    );
}
