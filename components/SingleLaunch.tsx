"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import TiltCard from "./TiltCard";
import { useAudio } from "@/contexts/AudioContext";
import { Skeleton } from "./Skeleton";

const STREAMING_LINKS = [
    { name: "SPOTIFY", url: "#", color: "hover:text-[#1DB954]" },
    { name: "APPLE", url: "#", color: "hover:text-[#FA57C1]" },
    { name: "YOUTUBE", url: "#", color: "hover:text-[#FF0000]" },
    { name: "AMAZON", url: "#", color: "hover:text-[#FF9900]" },
];

export default function SingleLaunch() {
    const [isGlitching, setIsGlitching] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { isPlaying, currentTrack, availableTracks, playTrack, togglePlay } = useAudio();

    // Find "Make Me the Villain" track index in available tracks
    const villainTrackIndex = availableTracks.findIndex(t => t.title === "Make Me the Villain");
    const villainTrack = availableTracks[villainTrackIndex] || availableTracks[0];
    const isThisTrackPlaying = isPlaying && currentTrack.title === villainTrack.title;

    const handlePlayClick = () => {
        if (currentTrack.title === villainTrack.title) {
            // Same track - just toggle play/pause
            togglePlay();
        } else {
            // Different track - play the villain track
            playTrack(villainTrackIndex >= 0 ? villainTrackIndex : 0);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const glitchInterval = setInterval(() => {
            if (Math.random() > 0.8) {
                setIsGlitching(true);
                setTimeout(() => setIsGlitching(false), 100);
            }
        }, 3000);

        return () => clearInterval(glitchInterval);
    }, []);

    // Show skeleton while not mounted
    if (!mounted) {
        return (
            <section className="w-full max-w-4xl">
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton variant="circular" width={8} height={8} animation="wave" />
                    <Skeleton variant="text" className="h-4 w-48" animation="wave" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-stark/10 bg-void-deep/50 p-4 md:p-6">
                    <Skeleton className="aspect-square w-full" animation="wave" />
                    <div className="flex flex-col justify-between py-2 space-y-4">
                        <div className="space-y-3">
                            <Skeleton variant="text" className="h-3 w-32" animation="wave" />
                            <Skeleton variant="text" className="h-10 w-full" animation="wave" />
                            <Skeleton variant="text" className="h-4 w-24" animation="wave" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton variant="text" className="h-3 w-20" animation="wave" />
                            <div className="grid grid-cols-2 gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-10" animation="wave" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full max-w-4xl">
            <div className="flex items-center gap-2 text-signal mb-4">
                <div className="w-2 h-2 bg-signal rounded-full animate-pulse" />
                <span className="font-mono text-sm tracking-widest">NEW_TRANSMISSION // ACTIVE</span>
            </div>

            <TiltCard tiltAmount={8} scale={1.01}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-signal/30 bg-void-deep/50 backdrop-blur-sm p-4 md:p-6">
                    {/* Artwork */}
                    <div
                    className="relative aspect-square overflow-hidden group cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Image loading skeleton */}
                    {!imageLoaded && (
                        <Skeleton className="absolute inset-0 z-10" animation="wave" />
                    )}
                    <Image
                        src="/artwork/Make me The Villain Artwork.jpg"
                        alt="Make Me The Villain - Single Artwork"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={cn(
                            "object-cover transition-all duration-500",
                            isGlitching && "translate-x-1 opacity-90",
                            isHovered && "scale-105",
                            !imageLoaded && "opacity-0"
                        )}
                        priority
                        onLoad={() => setImageLoaded(true)}
                    />

                    {/* Glitch overlay */}
                    {isGlitching && (
                        <div className="absolute inset-0 bg-signal/10 mix-blend-overlay" />
                    )}

                    {/* Play overlay on hover */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute inset-0 bg-void/60 flex items-center justify-center"
                        onClick={handlePlayClick}
                    >
                        <motion.div
                            animate={{ scale: isHovered ? 1 : 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-16 h-16 rounded-full bg-signal flex items-center justify-center cursor-pointer"
                        >
                            {isThisTrackPlaying ? (
                                <Pause className="w-8 h-8 text-void fill-void" />
                            ) : (
                                <Play className="w-8 h-8 text-void fill-void ml-1" />
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-signal" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-signal" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-signal" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-signal" />
                </div>

                {/* Track Info */}
                <div className="flex flex-col justify-between py-2">
                    <div>
                        <p className="font-mono text-xs text-stark/50 mb-2">TRACK_01 // SYSTEM FLUX</p>
                        <h2
                            className={cn(
                                "text-3xl md:text-4xl font-bold tracking-tight mb-4",
                                isGlitching && "glitch-text"
                            )}
                            data-text="MAKE ME THE VILLAIN"
                        >
                            MAKE ME THE VILLAIN
                        </h2>
                        <p className="font-mono text-sm text-stark/60 mb-6">
                            Julian Guggeis<br />
                            <span className="text-signal">OUT NOW</span>
                        </p>
                    </div>

                    {/* Streaming Links */}
                    <div className="space-y-3">
                        <p className="font-mono text-xs text-stark/40">STREAM_ON:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {STREAMING_LINKS.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 border border-stark/20 font-mono text-xs text-stark/70 transition-all hover:border-signal/50 hover:bg-signal/5 group",
                                        link.color
                                    )}
                                >
                                    <span>{link.name}</span>
                                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </TiltCard>
        </section>
    );
}
