"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const TARGET_DATE = new Date("2025-11-28T00:00:00");

export default function GlitchCountdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +TARGET_DATE - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);

        // Random glitch effect
        const glitchInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                setIsGlitching(true);
                setTimeout(() => setIsGlitching(false), 150);
            }
        }, 2000);

        calculateTimeLeft();

        return () => {
            clearInterval(timer);
            clearInterval(glitchInterval);
        };
    }, []);

    const formatNumber = (num: number) => num.toString().padStart(2, "0");

    return (
        <div className="flex gap-4 md:gap-8 font-mono text-xl md:text-3xl text-signal tracking-widest">
            <div className="flex flex-col items-center">
                <span className={cn("relative", isGlitching && "glitch-text")} data-text={formatNumber(timeLeft.days)}>
                    {formatNumber(timeLeft.days)}
                </span>
                <span className="text-xs text-stark/50 mt-1">DAYS</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
                <span className={cn("relative", isGlitching && "glitch-text")} data-text={formatNumber(timeLeft.hours)}>
                    {formatNumber(timeLeft.hours)}
                </span>
                <span className="text-xs text-stark/50 mt-1">HRS</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
                <span className={cn("relative", isGlitching && "glitch-text")} data-text={formatNumber(timeLeft.minutes)}>
                    {formatNumber(timeLeft.minutes)}
                </span>
                <span className="text-xs text-stark/50 mt-1">MIN</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
                <span className={cn("relative", isGlitching && "glitch-text")} data-text={formatNumber(timeLeft.seconds)}>
                    {formatNumber(timeLeft.seconds)}
                </span>
                <span className="text-xs text-stark/50 mt-1">SEC</span>
            </div>
        </div>
    );
}
