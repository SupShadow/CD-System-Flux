"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/AudioContext";
import { getCountdownTrack } from "@/lib/tracks";

// Streaming platform icons as simple SVG paths
const STREAMING_LINKS = [
    {
        name: "Spotify",
        url: "#",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
        ),
        hoverColor: "#1DB954"
    },
    {
        name: "Apple Music",
        url: "#",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.401-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.56-2.09-1.434-.303-.87.067-1.86.906-2.33.39-.218.82-.34 1.263-.413.525-.09 1.056-.145 1.573-.27.322-.078.485-.28.503-.62V10.95c0-.05-.01-.1-.026-.15-.03-.093-.1-.14-.192-.13a.4.4 0 00-.1.024c-.553.12-1.105.24-1.656.36l-3.57.768a.497.497 0 00-.075.018c-.156.044-.233.145-.257.305-.007.05-.01.1-.01.15v7.208c0 .428-.058.848-.248 1.235-.29.59-.76.963-1.39 1.14-.348.1-.704.156-1.067.173-.95.044-1.787-.558-2.092-1.432-.305-.874.068-1.864.91-2.333.39-.22.82-.342 1.262-.414.525-.088 1.055-.143 1.572-.268.325-.08.487-.282.504-.622V7.59c0-.156.026-.31.09-.452.1-.216.27-.36.5-.41.11-.022.215-.04.322-.057L15.49 5.6c.478-.103.96-.2 1.438-.305.23-.05.344.06.364.3.007.06.01.123.01.186v4.332h.27z"/>
            </svg>
        ),
        hoverColor: "#FA57C1"
    },
    {
        name: "YouTube",
        url: "#",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
        ),
        hoverColor: "#FF0000"
    },
    {
        name: "Amazon",
        url: "#",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.13.12.205.076.4-.134.59-.406.37-.86.724-1.363 1.067-1.7 1.166-3.556 1.993-5.57 2.478-2.012.485-4.063.727-6.153.727-2.09 0-4.13-.226-6.117-.682-1.986-.456-3.86-1.167-5.617-2.135-.175-.088-.272-.2-.29-.33-.018-.13.04-.257.17-.38zm6.628-6.478c0-.32.055-.623.163-.91l.322-.857h-.162c-.326 0-.57.044-.733.13-.163.086-.37.268-.622.545l-.21.217c-.056.058-.113.1-.17.126-.058.025-.133.038-.226.038-.12 0-.215-.042-.283-.125-.068-.084-.102-.194-.102-.332 0-.2.08-.393.24-.58.16-.187.354-.356.58-.51.227-.15.493-.27.796-.358.305-.09.618-.134.94-.134h2.95c.276 0 .47.07.58.212.11.14.166.348.166.624 0 .156-.03.322-.09.495l-1.632 4.412c-.053.143-.08.26-.08.35 0 .09.027.178.08.26.054.084.127.166.22.246.093.08.187.147.28.2l.2.113c.093.054.14.137.14.248 0 .106-.05.2-.15.28-.1.08-.237.12-.41.12h-2.56c-.147 0-.262-.04-.343-.118-.08-.08-.122-.185-.122-.318 0-.093.036-.186.108-.278l.2-.23c.09-.1.166-.2.23-.3.063-.1.094-.228.094-.386 0-.132-.024-.27-.072-.414l-.91-2.516c-.073-.2-.11-.38-.11-.538zm9.118-.93c-.556 0-1.03.116-1.42.347-.39.23-.584.54-.584.928 0 .173.05.318.15.435.098.117.236.175.412.175.2 0 .4-.087.595-.26.196-.175.365-.365.506-.57l.147-.213c.1-.15.217-.3.35-.448.133-.148.325-.222.577-.222.326 0 .57.118.733.356.162.238.244.526.244.866 0 .27-.066.536-.197.795-.13.26-.324.492-.583.698-.26.207-.587.37-.984.49-.396.12-.844.18-1.343.18-.62 0-1.152-.093-1.593-.277-.442-.184-.8-.434-1.078-.75-.277-.316-.48-.68-.607-1.094-.127-.413-.19-.85-.19-1.31 0-.6.1-1.157.3-1.674.2-.516.488-.96.866-1.335.377-.374.835-.666 1.373-.875.538-.21 1.14-.314 1.808-.314.545 0 1.023.066 1.435.197.413.132.757.31 1.033.537.277.226.485.487.624.783.14.297.21.61.21.937 0 .376-.067.69-.2.942-.135.252-.356.38-.666.38-.24 0-.424-.068-.55-.205-.127-.138-.19-.322-.19-.554 0-.136.018-.258.053-.365.036-.107.054-.22.054-.34 0-.178-.07-.335-.21-.47-.14-.134-.326-.202-.556-.202z"/>
            </svg>
        ),
        hoverColor: "#FF9900"
    },
];

export default function SingleLaunch() {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [scanLinePosition, setScanLinePosition] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const { isPlaying, currentTrack, availableTracks, playTrack, togglePlay } = useAudio();

    // Get the countdown track (next upcoming or most recently released)
    const countdownData = getCountdownTrack();
    const featuredTrack = countdownData?.track;
    const isReleased = countdownData?.isReleased ?? false;

    // Find track index in available tracks
    const trackIndex = featuredTrack
        ? availableTracks.findIndex(t => t.title === featuredTrack.title)
        : -1;
    const isThisTrackPlaying = isPlaying && featuredTrack && currentTrack.title === featuredTrack.title;

    // Track color for theming
    const trackColor = featuredTrack?.color || "#FF4500";

    const handlePlayClick = () => {
        if (!featuredTrack) return;

        if (currentTrack.title === featuredTrack.title) {
            togglePlay();
        } else if (trackIndex >= 0) {
            playTrack(trackIndex);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    // Scan line animation
    useEffect(() => {
        if (!isHovered) return;

        const interval = setInterval(() => {
            setScanLinePosition(prev => (prev + 2) % 100);
        }, 30);

        return () => clearInterval(interval);
    }, [isHovered]);

    // Countdown calculation
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        if (!featuredTrack?.releaseDate || isReleased) return;

        const updateCountdown = () => {
            const release = new Date(featuredTrack.releaseDate + "T00:00:00");
            const now = new Date();
            const diff = release.getTime() - now.getTime();

            if (diff <= 0) {
                setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown({ days, hours, mins, secs });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [featuredTrack, isReleased]);

    if (!mounted || !featuredTrack) {
        return (
            <section className="w-full max-w-3xl mx-auto">
                <div className="aspect-[4/3] bg-void-deep/50 animate-pulse rounded-lg" />
            </section>
        );
    }

    // Get artwork path based on track title
    const artworkPath = `/artwork/${featuredTrack.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, ' ')} Artwork.jpg`;

    return (
        <section className="w-full max-w-3xl mx-auto">
            {/* Status Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 mb-6"
            >
                <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: trackColor }}
                    animate={{
                        boxShadow: [
                            `0 0 0px ${trackColor}`,
                            `0 0 12px ${trackColor}`,
                            `0 0 0px ${trackColor}`
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-mono text-xs tracking-[0.3em]" style={{ color: trackColor }}>
                    {isReleased ? "SIGNAL_LIVE" : "INCOMING_TRANSMISSION"}
                </span>
            </motion.div>

            {/* Main Card */}
            <motion.div
                ref={containerRef}
                className="relative cursor-pointer group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handlePlayClick}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Ambient Glow */}
                <div
                    className="absolute -inset-4 rounded-2xl opacity-30 blur-2xl transition-opacity duration-500"
                    style={{
                        backgroundColor: trackColor,
                        opacity: isHovered ? 0.4 : 0.2
                    }}
                />

                {/* Card Container */}
                <div className="relative bg-void-deep/80 backdrop-blur-sm rounded-lg overflow-hidden border border-white/5">
                    {/* Artwork */}
                    <div className="relative aspect-square max-w-md mx-auto">
                        <Image
                            src={artworkPath}
                            alt={`${featuredTrack.title} - Artwork`}
                            fill
                            sizes="(max-width: 768px) 100vw, 448px"
                            className={cn(
                                "object-cover transition-all duration-700",
                                isHovered && "scale-105 brightness-110",
                                !imageLoaded && "opacity-0"
                            )}
                            priority
                            onLoad={() => setImageLoaded(true)}
                        />

                        {/* Scan Line Effect */}
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 pointer-events-none overflow-hidden"
                                >
                                    <div
                                        className="absolute left-0 right-0 h-[2px] opacity-60"
                                        style={{
                                            top: `${scanLinePosition}%`,
                                            background: `linear-gradient(90deg, transparent, ${trackColor}, transparent)`
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Play Overlay */}
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-void/40 flex items-center justify-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0.8 }}
                                        className="w-20 h-20 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: trackColor }}
                                    >
                                        {isThisTrackPlaying ? (
                                            <Pause className="w-10 h-10 text-void" />
                                        ) : (
                                            <Play className="w-10 h-10 text-void ml-1" />
                                        )}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Glow Border */}
                        <div
                            className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-500"
                            style={{
                                boxShadow: `inset 0 0 30px ${trackColor}30`,
                                opacity: isHovered ? 1 : 0.5
                            }}
                        />
                    </div>

                    {/* Track Info */}
                    <div className="p-6 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                            {featuredTrack.title.toUpperCase()}
                        </h2>
                        <p className="font-mono text-sm text-stark/60 mb-4">
                            Julian Guggeis
                        </p>

                        {/* Status / Countdown */}
                        {isReleased ? (
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm"
                                style={{ backgroundColor: `${trackColor}20`, color: trackColor }}
                                animate={{
                                    boxShadow: [
                                        `0 0 0px ${trackColor}`,
                                        `0 0 15px ${trackColor}50`,
                                        `0 0 0px ${trackColor}`
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: trackColor }} />
                                OUT NOW
                            </motion.div>
                        ) : (
                            <div className="space-y-2">
                                <p className="font-mono text-xs text-stark/40">RELEASING IN</p>
                                <div className="flex items-center justify-center gap-3 font-mono">
                                    {countdown.days > 0 && (
                                        <div className="text-center">
                                            <div className="text-2xl font-bold" style={{ color: trackColor }}>{countdown.days}</div>
                                            <div className="text-[10px] text-stark/40">DAYS</div>
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <div className="text-2xl font-bold" style={{ color: trackColor }}>{countdown.hours}</div>
                                        <div className="text-[10px] text-stark/40">HRS</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold" style={{ color: trackColor }}>{countdown.mins}</div>
                                        <div className="text-[10px] text-stark/40">MIN</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold" style={{ color: trackColor }}>{countdown.secs}</div>
                                        <div className="text-[10px] text-stark/40">SEC</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Streaming Links - Floating Icons */}
                {isReleased && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-4 mt-6"
                    >
                        {STREAMING_LINKS.map((link, index) => (
                            <motion.a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${link.name} (öffnet in neuem Fenster)`}
                                className="p-3 rounded-full bg-void-deep/50 border border-white/10 text-stark/50 transition-all duration-300 hover:border-transparent"
                                style={{
                                    ["--hover-color" as string]: link.hoverColor
                                }}
                                whileHover={{
                                    scale: 1.1,
                                    backgroundColor: `${link.hoverColor}20`,
                                    color: link.hoverColor,
                                    borderColor: link.hoverColor
                                }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span aria-hidden="true">{link.icon}</span>
                                <span className="sr-only">{link.name}</span>
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </motion.div>

            {/* Click hint */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center font-mono text-[10px] text-stark/30 mt-4"
            >
                {isReleased ? "CLICK TO PLAY" : "PREVIEW AVAILABLE ON RELEASE"}
            </motion.p>
        </section>
    );
}
