"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/contexts/ExperienceContext";
import { useAudio } from "@/contexts/AudioContext";
import { TRACKS, Track } from "@/lib/tracks";
import { Map, Compass, Lock, Unlock, Play, ChevronRight } from "lucide-react";

// ============================================================================
// ZONE DEFINITIONS
// ============================================================================

export interface Zone {
    id: "core" | "zone_a" | "zone_b" | "zone_c";
    name: string;
    subtitle: string;
    description: string;
    color: string;
    accentColor: string;
    trackIndices: number[];
    position: { x: number; y: number };
    unlockCondition?: string;
    atmosphere: "cold" | "neutral" | "warm" | "chaotic";
}

export const ZONES: Zone[] = [
    {
        id: "core",
        name: "CORE_NODE",
        subtitle: "Origin Point",
        description: "The central nexus. All paths begin here.",
        color: "#FF4500",
        accentColor: "#FF6B35",
        trackIndices: [12], // Make Me the Villain (hero track)
        position: { x: 50, y: 50 },
        atmosphere: "neutral",
    },
    {
        id: "zone_a",
        name: "COLD_SECTOR",
        subtitle: "Tracks 1-8",
        description: "Precision. Control. The machine awakens.",
        color: "#00D4FF",
        accentColor: "#00A3CC",
        trackIndices: [0, 1, 2, 3, 4, 5, 6, 7],
        position: { x: 20, y: 30 },
        atmosphere: "cold",
    },
    {
        id: "zone_b",
        name: "CHAOS_REALM",
        subtitle: "Tracks 9-16",
        description: "Entropy. Disruption. The system glitches.",
        color: "#FF00FF",
        accentColor: "#CC00CC",
        trackIndices: [8, 9, 10, 11, 13, 14, 15],
        position: { x: 80, y: 30 },
        atmosphere: "chaotic",
    },
    {
        id: "zone_c",
        name: "WARM_DOMAIN",
        subtitle: "Tracks 17-25",
        description: "Resolution. Humanity. The signal persists.",
        color: "#FFD700",
        accentColor: "#CC9900",
        trackIndices: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
        position: { x: 50, y: 80 },
        atmosphere: "warm",
    },
];

// ============================================================================
// ZONE MAP COMPONENT
// ============================================================================

interface ZoneMapProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTrack?: (trackIndex: number) => void;
}

export function ZoneMap({ isOpen, onClose, onSelectTrack }: ZoneMapProps) {
    const { state, setZone } = useExperience();
    const { playTrack, currentTrackIndex, isPlaying } = useAudio();
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);

    const handleZoneClick = useCallback((zone: Zone) => {
        setSelectedZone(zone);
        setZone(zone.id);
    }, [setZone]);

    const handleTrackPlay = useCallback((trackIndex: number) => {
        playTrack(trackIndex);
        onSelectTrack?.(trackIndex);
    }, [playTrack, onSelectTrack]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (selectedZone) {
                    setSelectedZone(null);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedZone, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-sm"
                    onClick={() => selectedZone ? setSelectedZone(null) : onClose()}
                >
                    {/* Header */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Map size={20} className="text-[#FF4500]" />
                            <span className="font-mono text-white text-sm tracking-wider">
                                ZONE_NAVIGATOR
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="font-mono text-white/50 hover:text-white text-xs"
                        >
                            [ESC_TO_CLOSE]
                        </button>
                    </div>

                    {/* Map Container */}
                    <div
                        className="absolute inset-0 m-16"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Connection lines between zones */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {ZONES.map((zone, i) =>
                                ZONES.slice(i + 1).map((otherZone, j) => (
                                    <line
                                        key={`${zone.id}-${otherZone.id}`}
                                        x1={`${zone.position.x}%`}
                                        y1={`${zone.position.y}%`}
                                        x2={`${otherZone.position.x}%`}
                                        y2={`${otherZone.position.y}%`}
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                    />
                                ))
                            )}
                        </svg>

                        {/* Zone nodes */}
                        {ZONES.map((zone) => (
                            <ZoneNode
                                key={zone.id}
                                zone={zone}
                                isActive={state.currentZone === zone.id}
                                isSelected={selectedZone?.id === zone.id}
                                isHovered={hoveredZone?.id === zone.id}
                                onClick={() => handleZoneClick(zone)}
                                onHover={(hovered) => setHoveredZone(hovered ? zone : null)}
                                completedTracks={state.stats.tracksCompleted}
                            />
                        ))}

                        {/* Zone detail panel */}
                        <AnimatePresence>
                            {selectedZone && (
                                <ZoneDetailPanel
                                    zone={selectedZone}
                                    currentTrackIndex={currentTrackIndex}
                                    isPlaying={isPlaying}
                                    onPlayTrack={handleTrackPlay}
                                    completedTracks={state.stats.tracksCompleted}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/40 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#39FF14]" />
                            <span>Completed tracks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#FF4500]" />
                            <span>Current zone</span>
                        </div>
                    </div>

                    {/* Navigation hint */}
                    <div className="absolute bottom-4 right-4 font-mono text-[10px] text-white/40">
                        CLICK_ZONE_TO_EXPLORE // WASD_COMING_SOON
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// ZONE NODE
// ============================================================================

interface ZoneNodeProps {
    zone: Zone;
    isActive: boolean;
    isSelected: boolean;
    isHovered: boolean;
    onClick: () => void;
    onHover: (hovered: boolean) => void;
    completedTracks: string[];
}

function ZoneNode({
    zone,
    isActive,
    isSelected,
    isHovered,
    onClick,
    onHover,
    completedTracks,
}: ZoneNodeProps) {
    const trackCount = zone.trackIndices.length;
    const completedCount = zone.trackIndices.filter((i) =>
        completedTracks.includes(TRACKS[i]?.title)
    ).length;
    const progress = trackCount > 0 ? completedCount / trackCount : 0;

    return (
        <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
                left: `${zone.position.x}%`,
                top: `${zone.position.y}%`,
            }}
            onClick={onClick}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: zone.color }}
                animate={{
                    opacity: isActive ? 0.4 : isHovered ? 0.3 : 0.1,
                    scale: isActive ? 1.5 : 1,
                }}
            />

            {/* Main node */}
            <div
                className={`relative w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center
                    transition-all duration-300 ${
                        isSelected
                            ? "bg-black/80 border-white"
                            : "bg-black/60 hover:bg-black/80"
                    }`}
                style={{ borderColor: isActive ? zone.color : `${zone.color}80` }}
            >
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="none"
                        stroke={`${zone.color}30`}
                        strokeWidth="4"
                    />
                    <motion.circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="none"
                        stroke={zone.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={276}
                        animate={{ strokeDashoffset: 276 - 276 * progress }}
                        transition={{ duration: 1 }}
                    />
                </svg>

                {/* Content */}
                <div className="relative text-center z-10">
                    {zone.id === "core" ? (
                        <Compass size={20} style={{ color: zone.color }} className="mx-auto" />
                    ) : (
                        <span className="font-mono text-xs" style={{ color: zone.color }}>
                            {completedCount}/{trackCount}
                        </span>
                    )}
                    <div className="font-mono text-[10px] text-white/80 mt-1">
                        {zone.name.split("_")[0]}
                    </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                    <motion.div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: zone.color }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </div>

            {/* Zone name label */}
            <div
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                    font-mono text-[10px] text-white/60"
            >
                {zone.subtitle}
            </div>
        </motion.div>
    );
}

// ============================================================================
// ZONE DETAIL PANEL
// ============================================================================

interface ZoneDetailPanelProps {
    zone: Zone;
    currentTrackIndex: number;
    isPlaying: boolean;
    onPlayTrack: (index: number) => void;
    completedTracks: string[];
}

function ZoneDetailPanel({
    zone,
    currentTrackIndex,
    isPlaying,
    onPlayTrack,
    completedTracks,
}: ZoneDetailPanelProps) {
    const zoneTracks = zone.trackIndices
        .map((i) => ({ track: TRACKS[i], index: i }))
        .filter((t) => t.track);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 border-l overflow-auto"
            style={{ borderColor: `${zone.color}50` }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div
                className="p-4 border-b"
                style={{
                    borderColor: `${zone.color}30`,
                    background: `linear-gradient(135deg, ${zone.color}10, transparent)`,
                }}
            >
                <div className="font-mono text-xs text-white/50 mb-1">
                    [{zone.atmosphere.toUpperCase()}_ATMOSPHERE]
                </div>
                <h2 className="font-mono text-xl font-bold" style={{ color: zone.color }}>
                    {zone.name}
                </h2>
                <p className="font-mono text-sm text-white/60 mt-2">{zone.description}</p>
            </div>

            {/* Track list */}
            <div className="p-4">
                <div className="font-mono text-xs text-white/40 mb-3">
                    TRACKS_IN_ZONE: {zoneTracks.length}
                </div>

                <div className="space-y-2">
                    {zoneTracks.map(({ track, index }) => {
                        const isCompleted = completedTracks.includes(track.title);
                        const isCurrent = currentTrackIndex === index;

                        return (
                            <motion.button
                                key={track.title}
                                className={`w-full p-3 border text-left font-mono text-sm
                                    transition-all group ${
                                        isCurrent
                                            ? "bg-white/10 border-white/30"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                                onClick={() => onPlayTrack(index)}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Status icon */}
                                    <div className="flex-shrink-0">
                                        {isCurrent && isPlaying ? (
                                            <motion.div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: zone.color }}
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            />
                                        ) : isCompleted ? (
                                            <Unlock size={12} className="text-[#39FF14]" />
                                        ) : (
                                            <Play
                                                size={12}
                                                className="text-white/30 group-hover:text-white/60"
                                            />
                                        )}
                                    </div>

                                    {/* Track info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate text-white/90">{track.title}</div>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight
                                        size={14}
                                        className="text-white/20 group-hover:text-white/50"
                                    />
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================================
// ZONE BUTTON (for triggering the map)
// ============================================================================

export function ZoneMapButton({ onClick }: { onClick: () => void }) {
    const { state } = useExperience();
    const currentZone = ZONES.find((z) => z.id === state.currentZone);

    return (
        <motion.button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-white/10
                hover:border-[#FF4500]/50 transition-colors font-mono text-xs"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Map size={14} className="text-[#FF4500]" />
            <span className="text-white/60">ZONE:</span>
            <span style={{ color: currentZone?.color || "#FF4500" }}>
                {currentZone?.name || "CORE_NODE"}
            </span>
        </motion.button>
    );
}
