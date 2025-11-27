"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart2, Disc3, Clock, Loader2 } from "lucide-react";
import { cn, assetPath } from "@/lib/utils";
import { Track, getArtworkPath } from "@/lib/tracks";
import Image from "next/image";

interface TrackListProps {
    isOpen: boolean;
    onClose: () => void;
    currentTrack: Track | null;
    onSelect: (track: Track, index: number) => void;
    isPlaying: boolean;
    tracks: Track[];
}

export default function TrackList({ isOpen, onClose, currentTrack, onSelect, isPlaying, tracks }: TrackListProps) {
    const isSingleTrack = tracks.length === 1;
    const trackCountText = tracks.length === 1 ? "1_TRACK" : `${tracks.length}_TRACKS`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-16 left-0 right-0 bg-void-deep/95 border-t-2 border-signal z-[45] shadow-[0_-10px_40px_rgba(255,69,0,0.2)] backdrop-blur-xl max-h-[60vh] overflow-hidden flex flex-col"
                    id="track-list-panel"
                    role="dialog"
                    aria-label="Track list"
                >
                    <div className="flex justify-between items-center p-4 border-b border-stark/10 bg-void">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-signal" aria-hidden="true" />
                            <span className="font-mono text-sm text-signal tracking-widest">FLUX_DATABASE // {trackCountText}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-stark/50 hover:text-signal transition-colors"
                            aria-label="Close track list"
                        >
                            <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </div>

                    {isSingleTrack ? (
                        /* Single track - special display */
                        <div className="p-4 md:p-6">
                            {/* Current track - highlighted */}
                            <div className="border border-signal/50 bg-signal/5 p-4 md:p-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-signal/30 bg-signal/10 overflow-hidden">
                                            <Image
                                                src={assetPath(getArtworkPath(tracks[0]))}
                                                alt={tracks[0].title}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        {isPlaying && (
                                            <motion.div
                                                className="absolute -inset-1 border border-signal/30"
                                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-[10px] text-stark/40 mb-1">NOW_PLAYING</div>
                                        <h3 className="font-mono text-lg md:text-xl text-signal font-bold tracking-wide truncate">
                                            {tracks[0].title.toUpperCase()}
                                        </h3>
                                        <div className="font-mono text-xs text-stark/50 mt-1">
                                            Julian Guggeis
                                        </div>
                                        {isPlaying && (
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="flex gap-0.5 items-end h-3">
                                                    <motion.div animate={{ height: [4, 12, 6, 12] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-signal" />
                                                    <motion.div animate={{ height: [8, 4, 12, 8] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-signal" />
                                                    <motion.div animate={{ height: [12, 8, 4, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-signal" />
                                                    <motion.div animate={{ height: [6, 12, 4, 8] }} transition={{ repeat: Infinity, duration: 0.55 }} className="w-1 bg-signal" />
                                                </div>
                                                <span className="font-mono text-[10px] text-signal">STREAMING</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Coming soon message */}
                            <div className="border border-stark/20 bg-stark/5 p-4 md:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 border border-dashed border-stark/30 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-stark/40" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-xs text-stark/50 tracking-wider mb-1">
                                            MORE_TRACKS_INCOMING
                                        </div>
                                        <p className="font-mono text-[10px] text-stark/40">
                                            Weitere Tracks werden bald verfügbar sein
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Loader2 className="w-3 h-3 text-signal/40 animate-spin" aria-hidden="true" />
                                        <span className="font-mono text-[9px] text-signal/40 hidden md:inline">LOADING...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Multiple tracks - standard list */
                        <div className="overflow-y-auto p-2 md:p-4 space-y-1" role="listbox" aria-label="Available tracks">
                            {tracks.map((track, index) => {
                                const isActive = currentTrack?.src === track.src;
                                return (
                                    <button
                                        key={track.src}
                                        onClick={() => onSelect(track, index)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 md:p-4 text-left font-mono text-sm transition-all group border border-transparent hover:border-signal/30",
                                            isActive ? "bg-signal/10 border-signal/50" : "hover:bg-stark/5"
                                        )}
                                        role="option"
                                        aria-selected={isActive}
                                        aria-label={`${track.title}${isActive && isPlaying ? ", now playing" : ""}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={cn("w-6 text-xs", isActive ? "text-signal" : "text-stark/30")}>
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <span className={cn("uppercase tracking-wider", isActive ? "text-signal glitch-text" : "text-stark/80 group-hover:text-stark")} data-text={track.title}>
                                                {track.title}
                                            </span>
                                        </div>

                                        {isActive && isPlaying && (
                                            <div className="flex gap-1 items-end h-3" aria-hidden="true">
                                                <motion.div animate={{ height: [4, 12, 6, 12] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-signal" />
                                                <motion.div animate={{ height: [8, 4, 12, 8] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-signal" />
                                                <motion.div animate={{ height: [12, 8, 4, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-signal" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
