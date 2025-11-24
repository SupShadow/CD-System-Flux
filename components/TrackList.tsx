"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRACKS, Track } from "@/lib/tracks";

interface TrackListProps {
    isOpen: boolean;
    onClose: () => void;
    currentTrack: Track | null;
    onSelect: (track: Track, index: number) => void;
    isPlaying: boolean;
}

export default function TrackList({ isOpen, onClose, currentTrack, onSelect, isPlaying }: TrackListProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-16 left-0 right-0 bg-void-deep/95 border-t-2 border-signal z-[45] shadow-[0_-10px_40px_rgba(255,69,0,0.2)] backdrop-blur-xl max-h-[60vh] overflow-hidden flex flex-col"
                >
                    <div className="flex justify-between items-center p-4 border-b border-stark/10 bg-void">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-signal" />
                            <span className="font-mono text-sm text-signal tracking-widest">FLUX_DATABASE // {TRACKS.length}_TRACKS</span>
                        </div>
                        <button onClick={onClose} className="text-stark/50 hover:text-signal transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-2 md:p-4 space-y-1">
                        {TRACKS.map((track, index) => {
                            const isActive = currentTrack?.src === track.src;
                            return (
                                <button
                                    key={track.src}
                                    onClick={() => onSelect(track, index)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 md:p-4 text-left font-mono text-sm transition-all group border border-transparent hover:border-signal/30",
                                        isActive ? "bg-signal/10 border-signal/50" : "hover:bg-stark/5"
                                    )}
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
                                        <div className="flex gap-1 items-end h-3">
                                            <motion.div animate={{ height: [4, 12, 6, 12] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-signal" />
                                            <motion.div animate={{ height: [8, 4, 12, 8] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-signal" />
                                            <motion.div animate={{ height: [12, 8, 4, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-signal" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
