"use client";

import { useRef, useCallback } from "react";
import { useAudio } from "@/contexts/AudioContext";
import { cn } from "@/lib/utils";

// Format seconds to MM:SS
function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface ProgressBarProps {
    className?: string;
    showTime?: boolean;
}

export default function ProgressBar({ className, showTime = true }: ProgressBarProps) {
    const { progress, duration, currentTime, seekToPercent, isPlaying } = useAudio();
    const progressRef = useRef<HTMLDivElement>(null);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const bar = progressRef.current;
            if (!bar) return;

            const rect = bar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = clickX / rect.width;
            seekToPercent(percent);
        },
        [seekToPercent]
    );

    const handleDrag = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.buttons !== 1) return; // Only left mouse button
            handleClick(e);
        },
        [handleClick]
    );

    return (
        <div className={cn("flex items-center gap-3 w-full", className)}>
            {showTime && (
                <span className="font-mono text-[10px] text-stark/50 w-10 text-right tabular-nums">
                    {formatTime(currentTime)}
                </span>
            )}

            <div
                ref={progressRef}
                onClick={handleClick}
                onMouseMove={handleDrag}
                className="flex-1 h-1 bg-stark/10 cursor-pointer group relative"
            >
                {/* Progress fill */}
                <div
                    className={cn(
                        "absolute inset-y-0 left-0 bg-signal transition-all",
                        isPlaying && "shadow-[0_0_8px_rgba(255,69,0,0.5)]"
                    )}
                    style={{ width: `${progress * 100}%` }}
                />

                {/* Hover highlight */}
                <div className="absolute inset-0 bg-stark/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Scrubber handle */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-signal rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    style={{ left: `calc(${progress * 100}% - 6px)` }}
                />
            </div>

            {showTime && (
                <span className="font-mono text-[10px] text-stark/50 w-10 tabular-nums">
                    {formatTime(duration)}
                </span>
            )}
        </div>
    );
}
