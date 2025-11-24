"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, ListMusic } from "lucide-react";
import { motion } from "framer-motion";
import { TRACKS } from "@/lib/tracks";
import TrackList from "./TrackList";

// Helper functions to manage global audio state outside of the component
// to avoid react-hooks/immutability lint errors
const getGlobalAudio = () => window.fluxAudio;
const setGlobalAudio = (audio: HTMLAudioElement | null) => {
    window.fluxAudio = audio;
};

export default function FluxPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const currentTrack = TRACKS[currentTrackIndex];

    const initAudio = () => {
        if (audioContextRef.current) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();

        const gain = audioContextRef.current.createGain();
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;

        gain.connect(analyser);
        analyser.connect(audioContextRef.current.destination);

        gainNodeRef.current = gain;
        analyserRef.current = analyser;
    };

    const playTrack = (index: number) => {
        if (!audioContextRef.current) initAudio();

        // Cleanup previous audio
        const currentAudio = getGlobalAudio();
        if (currentAudio) {
            currentAudio.pause();
            setGlobalAudio(null);
        }

        const track = TRACKS[index];
        const audio = new Audio(track.src);
        audio.crossOrigin = "anonymous";

        // Auto-play next track
        audio.addEventListener("ended", () => {
            playNext();
        });

        const source = audioContextRef.current!.createMediaElementSource(audio);
        source.connect(gainNodeRef.current!);

        audio.play().catch(e => console.error("Playback failed:", e));
        setGlobalAudio(audio);

        setCurrentTrackIndex(index);
        setIsPlaying(true);

        if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume();
        }
    };

    const togglePlay = () => {
        if (!audioContextRef.current) initAudio();

        const currentAudio = getGlobalAudio();

        if (isPlaying) {
            currentAudio?.pause();
            audioContextRef.current?.suspend();
        } else {
            if (!currentAudio) {
                playTrack(currentTrackIndex);
            } else {
                currentAudio?.play();
                audioContextRef.current?.resume();
            }
        }
        setIsPlaying(!isPlaying);
    };

    const playNext = () => {
        const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
        playTrack(nextIndex);
    };

    const playPrev = () => {
        const prevIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
        playTrack(prevIndex);
    };

    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = isMuted ? 0 : 1;
        }
    }, [isMuted]);

    // Visualizer Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrame: number;

        const render = () => {
            if (!analyserRef.current) {
                // Idle animation
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#FF4500";
                ctx.fillRect(0, canvas.height / 2, canvas.width, 1);
                animationFrame = requestAnimationFrame(render);
                return;
            }

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#FF4500"; // Signal

            const bars = 64;
            const barWidth = canvas.width / bars;

            for (let i = 0; i < bars; i++) {
                const value = dataArray[i * 2]; // Skip some bins for wider bars
                const percent = value / 255;
                const height = Math.max(percent * canvas.height, 2);

                // Mirrored visualizer
                ctx.fillRect(i * barWidth, (canvas.height - height) / 2, barWidth - 1, height);
            }

            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <>
            <TrackList
                isOpen={isPlaylistOpen}
                onClose={() => setIsPlaylistOpen(false)}
                currentTrack={currentTrack}
                onSelect={(track, index) => playTrack(index)}
                isPlaying={isPlaying}
            />

            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 h-20 bg-void-deep border-t border-signal/20 z-50 flex items-center justify-between px-4 md:px-8 backdrop-blur-md"
            >
                <div className="flex items-center gap-4">
                    <a
                        href="https://music.apple.com/de/artist/julian-guggeis/956406644"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stark/50 hover:text-[#FA243C] hover:scale-110 transition-all duration-300"
                        title="Apple Music"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13.06v6.24c-1.042-.625-2.396-.625-3.437 0-1.042.625-1.042 2.708 0 3.333 1.042.625 2.396.625 3.437 0 .521-.313.854-.833.958-1.396h.042v-4.813h3v-3.333h-4z" />
                        </svg>
                    </a>
                    <a
                        href="https://open.spotify.com/intl-de/artist/7sftGNX7UKWsHgOumCU2fP?si=Z4sahl_QScSUJxhscwlmvg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stark/50 hover:text-[#1DB954] hover:scale-110 transition-all duration-300"
                        title="Spotify"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.308-1.758-8.793-.963-.335.077-.67-.133-.746-.468-.077-.335.132-.67.468-.746 3.808-.87 7.076-.496 9.72 1.114.294.18.386.563.208.856zm1.226-2.726c-.225.367-.706.482-1.072.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.126-.848-.106-.974-.519-.126-.413.106-.848.519-.974 3.632-1.102 8.147-.568 11.235 1.33.367.225.482.706.257 1.072zm.104-2.835c-3.22-1.913-8.533-2.091-11.601-1.159-.479.146-.995-.126-1.142-.605-.146-.479.127-.995.605-1.142 3.557-1.081 9.396-.869 13.056 1.304.447.265.594.844.329 1.291-.265.447-.844.594-1.291.329z" />
                        </svg>
                    </a>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-2">
                        <button onClick={playPrev} className="text-stark/50 hover:text-signal transition-colors">
                            <SkipBack className="w-5 h-5" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 flex items-center justify-center bg-signal text-void hover:bg-stark transition-colors clip-path-polygon"
                            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)" }}
                        >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </button>
                        <button onClick={playNext} className="text-stark/50 hover:text-signal transition-colors">
                            <SkipForward className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="hidden md:block font-mono text-xs overflow-hidden max-w-[200px] md:max-w-xs">
                        <p className="text-stark/50 text-[10px] tracking-widest">NOW_PLAYING</p>
                        <div className="relative h-5 w-full overflow-hidden">
                            <p className="text-signal whitespace-nowrap animate-marquee">{currentTrack.title}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 mx-4 md:mx-12 h-full flex items-center">
                    <canvas ref={canvasRef} width={400} height={60} className="w-full h-full opacity-80 mix-blend-screen" />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                        className={isPlaying && isPlaylistOpen ? "text-signal" : "text-stark/50 hover:text-signal"}
                    >
                        <ListMusic className="w-6 h-6" />
                    </button>

                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-stark/50 hover:text-signal hidden md:block"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>
            </motion.div>
        </>
    );
}
