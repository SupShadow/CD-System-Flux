"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, List, Volume2, Volume1, VolumeX, Maximize2, Keyboard } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";
import { useKeyboardShortcuts } from "@/hooks";
import { getArtworkPath } from "@/lib/tracks";
import TrackList from "./TrackList";
import FullscreenVisualizer from "./FullscreenVisualizer";
import KeyboardHints from "./KeyboardHints";
import TypewriterText from "./TypewriterText";
import TransmitButton from "./TransmitButton";
import { cn, assetPath } from "@/lib/utils";
import Image from "next/image";

function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Thinking dots animation component
function ThinkingDots() {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? "" : prev + ".");
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return <span className="inline-block w-6">{dots}</span>;
}

// Agent status indicator
function AgentStatus({ isActive }: { isActive: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <motion.div
                className={cn(
                    "w-2 h-2 rounded-full",
                    isActive ? "bg-signal" : "bg-stark/30"
                )}
                animate={isActive ? {
                    boxShadow: ["0 0 0px #FF4500", "0 0 8px #FF4500", "0 0 0px #FF4500"],
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
            />
            <span className={cn(
                "font-mono text-[10px] tracking-wider",
                isActive ? "text-signal" : "text-stark/50"
            )}>
                {isActive ? "ACTIVE" : "IDLE"}
            </span>
        </div>
    );
}

export default function FluxPlayer() {
    const {
        isPlaying,
        currentTrack,
        currentTrackIndex,
        availableTracks,
        togglePlay,
        playNext,
        playPrev,
        playTrack,
        isMuted,
        setIsMuted,
        volume,
        setVolume,
        duration,
        currentTime,
        progress,
        seekToPercent,
    } = useAudio();

    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const swipeX = useMotionValue(0);
    const swipeOpacity = useTransform(swipeX, [-100, 0, 100], [0.5, 1, 0.5]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onPlayPause: togglePlay,
        onNextTrack: playNext,
        onPrevTrack: playPrev,
        onToggleMute: () => setIsMuted(!isMuted),
        onToggleFullscreen: () => setIsVisualizerOpen(prev => !prev),
        onTogglePlaylist: () => setIsPlaylistOpen(prev => !prev),
        onShowHelp: () => setIsHelpOpen(prev => !prev),
        onEscape: () => {
            setIsHelpOpen(false);
            setIsPlaylistOpen(false);
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Share data for TransmitButton
    const shareData = {
        title: `${currentTrack.title} - Julian Guggeis`,
        text: `Check out "${currentTrack.title}" from SYSTEM FLUX by Julian Guggeis`,
        url: typeof window !== "undefined" ? window.location.href : "",
    };

    // Swipe gesture handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const deltaX = e.touches[0].clientX - touchStartX.current;
        const deltaY = e.touches[0].clientY - touchStartY.current;

        // Only register horizontal swipes (prevent scroll interference)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            swipeX.set(deltaX);
            if (deltaX > 50) {
                setSwipeDirection("right");
            } else if (deltaX < -50) {
                setSwipeDirection("left");
            } else {
                setSwipeDirection(null);
            }
        }
    }, [swipeX]);

    const handleTouchEnd = useCallback(() => {
        const currentX = swipeX.get();
        const threshold = 80;

        if (currentX > threshold) {
            // Swipe right - previous track
            playPrev();
            animate(swipeX, 0, { duration: 0.3 });
        } else if (currentX < -threshold) {
            // Swipe left - next track
            playNext();
            animate(swipeX, 0, { duration: 0.3 });
        } else {
            // Snap back
            animate(swipeX, 0, { duration: 0.2 });
        }

        setSwipeDirection(null);
    }, [swipeX, playNext, playPrev]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressRef.current;
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;
        seekToPercent(percent);
    };

    // Keyboard navigation for progress bar
    const handleProgressKeyDown = (e: React.KeyboardEvent) => {
        const step = e.shiftKey ? 0.1 : 0.02; // 10% or 2% step
        if (e.key === "ArrowRight") {
            e.preventDefault();
            seekToPercent(Math.min(1, progress + step));
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            seekToPercent(Math.max(0, progress - step));
        } else if (e.key === "Home") {
            e.preventDefault();
            seekToPercent(0);
        } else if (e.key === "End") {
            e.preventDefault();
            seekToPercent(1);
        }
    };

    const agentNumber = String(currentTrackIndex + 1).padStart(2, "0");

    return (
        <>
            <TrackList
                isOpen={isPlaylistOpen}
                onClose={() => setIsPlaylistOpen(false)}
                currentTrack={currentTrack}
                onSelect={(_, index) => playTrack(index)}
                isPlaying={isPlaying}
                tracks={availableTracks}
            />

            <FullscreenVisualizer
                isOpen={isVisualizerOpen}
                onClose={() => setIsVisualizerOpen(false)}
            />

            <KeyboardHints
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
            />

            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50"
            >
                {/* Swipe indicator overlays - only visible on touch */}
                {swipeDirection === "left" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono text-[10px] text-signal flex items-center gap-2 bg-void-deep/90 px-3 py-1 border border-signal/30"
                    >
                        <SkipForward className="w-3 h-3" />
                        NEXT_AGENT
                    </motion.div>
                )}
                {swipeDirection === "right" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono text-[10px] text-signal flex items-center gap-2 bg-void-deep/90 px-3 py-1 border border-signal/30"
                    >
                        <SkipBack className="w-3 h-3" />
                        PREV_AGENT
                    </motion.div>
                )}

                {/* Main container with border - beat reactive */}
                <motion.div
                    className="bg-void-deep/95 backdrop-blur-xl border-t border-signal/30 beat-border"
                    style={{ x: swipeX, opacity: swipeOpacity }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Top accent line */}
                    <div className="h-[2px] bg-gradient-to-r from-transparent via-signal to-transparent" />

                    {/* Progress bar - full width at top */}
                    <div
                        ref={progressRef}
                        onClick={handleProgressClick}
                        onKeyDown={handleProgressKeyDown}
                        role="slider"
                        aria-label="Track progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round((mounted ? progress : 0) * 100)}
                        aria-valuetext={`${formatTime(mounted ? currentTime : 0)} of ${formatTime(duration)}`}
                        tabIndex={0}
                        className="h-1 bg-stark/10 cursor-pointer relative group focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-void-deep"
                    >
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-signal"
                            style={{ width: `${(mounted ? progress : 0) * 100}%` }}
                            layoutId="progress"
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-signal rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,69,0,0.8)]"
                            style={{ left: `calc(${(mounted ? progress : 0) * 100}% - 6px)` }}
                        />
                        {/* Glow effect */}
                        {isPlaying && (
                            <div
                                className="absolute inset-y-0 left-0 bg-signal/20 blur-sm"
                                style={{ width: `${(mounted ? progress : 0) * 100}%` }}
                            />
                        )}
                    </div>

                    {/* Main player content */}
                    <div className="px-4 md:px-6 py-3">
                        <div className="flex items-center justify-between gap-4">
                            {/* Left: Agent Info */}
                            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                {/* Artwork on mobile, Agent badge on desktop */}
                                <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 border border-signal/30 bg-signal/5 beat-border overflow-hidden">
                                    {/* Mobile: Artwork */}
                                    <Image
                                        src={assetPath(getArtworkPath(currentTrack))}
                                        alt={currentTrack.title}
                                        fill
                                        className="object-cover md:hidden"
                                        sizes="48px"
                                        unoptimized
                                    />
                                    {/* Desktop: Agent number badge */}
                                    <div className="hidden md:flex flex-col items-center justify-center w-full h-full">
                                        <span className="font-mono text-[10px] text-stark/50">AGENT</span>
                                        <span className="font-mono text-xl text-signal font-bold">{agentNumber}</span>
                                    </div>
                                </div>

                                {/* Track info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 md:gap-3 mb-1">
                                        <AgentStatus isActive={isPlaying} />
                                        <span className="font-mono text-[10px] text-stark/60 hidden lg:inline">
                                            {formatTime(mounted ? currentTime : 0)} / {formatTime(duration)}
                                        </span>
                                    </div>
                                    <div className="font-mono text-sm text-stark truncate">
                                        <span className="text-stark/50">&gt; </span>
                                        <TypewriterText
                                            text={currentTrack.title.toUpperCase()}
                                            speed={40}
                                            cursor={true}
                                            className={cn(isPlaying && "text-signal")}
                                        />
                                    </div>
                                    <div className="font-mono text-[10px] text-stark/60 mt-0.5">
                                        {isPlaying ? (
                                            <span>executing audio_stream<ThinkingDots /></span>
                                        ) : (
                                            <span>awaiting_input...</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Controls */}
                            <div className="flex items-center gap-1 md:gap-2">
                                {/* Playback controls */}
                                <div className="flex items-center gap-0.5 md:gap-1" role="group" aria-label="Playback controls">
                                    <button
                                        onClick={playPrev}
                                        className="p-1.5 md:p-2 text-stark/50 hover:text-signal transition-colors"
                                        aria-label="Previous track"
                                    >
                                        <SkipBack className="w-4 h-4" aria-hidden="true" />
                                    </button>

                                    <button
                                        onClick={togglePlay}
                                        className={cn(
                                            "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 transition-all",
                                            isPlaying
                                                ? "border-signal bg-signal/10 text-signal shadow-[0_0_20px_rgba(255,69,0,0.3)]"
                                                : "border-stark/30 text-stark/70 hover:border-signal hover:text-signal"
                                        )}
                                        aria-label={isPlaying ? "Pause" : "Play"}
                                        aria-pressed={isPlaying}
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                                        ) : (
                                            <Play className="w-4 h-4 md:w-5 md:h-5 ml-0.5" aria-hidden="true" />
                                        )}
                                    </button>

                                    <button
                                        onClick={playNext}
                                        className="p-1.5 md:p-2 text-stark/50 hover:text-signal transition-colors"
                                        aria-label="Next track"
                                    >
                                        <SkipForward className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Secondary controls */}
                                <div className="flex items-center gap-1 md:gap-2 border-l border-stark/10 pl-1 md:pl-4" role="group" aria-label="Additional controls">
                                    <button
                                        onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                                        className={cn(
                                            "p-1.5 md:p-2 transition-colors",
                                            isPlaylistOpen ? "text-signal" : "text-stark/50 hover:text-signal"
                                        )}
                                        aria-label={`Track list, ${availableTracks.length} tracks available`}
                                        aria-expanded={isPlaylistOpen}
                                        aria-controls="track-list-panel"
                                    >
                                        <List className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                                    </button>

                                    {/* Volume control group */}
                                    <div className="hidden md:flex items-center gap-2">
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            className="p-2 text-stark/50 hover:text-signal transition-colors"
                                            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                                            aria-pressed={isMuted}
                                        >
                                            {isMuted || volume === 0 ? (
                                                <VolumeX className="w-5 h-5" aria-hidden="true" />
                                            ) : volume < 0.5 ? (
                                                <Volume1 className="w-5 h-5" aria-hidden="true" />
                                            ) : (
                                                <Volume2 className="w-5 h-5" aria-hidden="true" />
                                            )}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="w-20 h-1 bg-stark/20 rounded-full appearance-none cursor-pointer
                                                [&::-webkit-slider-thumb]:appearance-none
                                                [&::-webkit-slider-thumb]:w-3
                                                [&::-webkit-slider-thumb]:h-3
                                                [&::-webkit-slider-thumb]:rounded-full
                                                [&::-webkit-slider-thumb]:bg-signal
                                                [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,69,0,0.6)]
                                                [&::-webkit-slider-thumb]:cursor-pointer
                                                [&::-moz-range-thumb]:w-3
                                                [&::-moz-range-thumb]:h-3
                                                [&::-moz-range-thumb]:rounded-full
                                                [&::-moz-range-thumb]:bg-signal
                                                [&::-moz-range-thumb]:border-0
                                                [&::-moz-range-thumb]:cursor-pointer"
                                            aria-label="Volume"
                                        />
                                        <span className="font-mono text-[9px] text-stark/40">
                                            {Math.round((isMuted ? 0 : volume) * 100)}%
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setIsVisualizerOpen(true)}
                                        className="p-2 text-stark/50 hover:text-signal transition-colors hidden sm:block"
                                        aria-label="Open fullscreen visualizer (press F)"
                                    >
                                        <Maximize2 className="w-5 h-5" aria-hidden="true" />
                                    </button>

                                    <button
                                        onClick={() => setIsHelpOpen(true)}
                                        className="p-2 text-stark/50 hover:text-signal transition-colors hidden sm:block"
                                        aria-label="Show keyboard shortcuts (press ?)"
                                    >
                                        <Keyboard className="w-5 h-5" aria-hidden="true" />
                                    </button>

                                    <TransmitButton
                                        shareData={shareData}
                                        compact={false}
                                        className="hidden sm:block"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom info bar - hidden on mobile for cleaner UI */}
                    <div className="hidden md:flex px-6 py-1 border-t border-stark/5 justify-between items-center">
                        <div className="font-mono text-[9px] text-stark/60">
                            FLUX_OS v1.0
                        </div>
                        <div className="font-mono text-[9px] text-stark/40 flex items-center gap-2">
                            <a href="https://derguggeis.de/impressum" target="_blank" rel="noopener noreferrer" className="hover:text-signal transition-colors">IMPRESSUM</a>
                            <span className="text-stark/20">//</span>
                            <a href="https://derguggeis.de/datenschutz" target="_blank" rel="noopener noreferrer" className="hover:text-signal transition-colors">DATENSCHUTZ</a>
                        </div>
                        <div className="font-mono text-[9px] text-stark/60">
                            {availableTracks.length} AGENTS
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}
