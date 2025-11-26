"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { TRACKS, Track, getReleasedTracks } from "@/lib/tracks";
import { assetPath } from "@/lib/utils";

interface StemGains {
    DRUMS: GainNode | null;
    BASS: GainNode | null;
    SYNTH: GainNode | null;
    FX: GainNode | null;
}

export interface StemState {
    DRUMS: boolean;
    BASS: boolean;
    SYNTH: boolean;
    FX: boolean;
}

export interface AudioError {
    type: "init" | "playback" | "load" | "network";
    message: string;
    trackIndex?: number;
}

export interface AudioEngineState {
    // Playback state
    isPlaying: boolean;
    currentTrackIndex: number;
    currentTrack: Track;

    // Available tracks (only released ones)
    availableTracks: Track[];

    // Time tracking
    duration: number;
    currentTime: number;
    progress: number;

    // Volume
    isMuted: boolean;
    volume: number; // 0-1

    // Stem control
    stems: StemState;

    // Initialization
    isInitialized: boolean;

    // Error handling
    error: AudioError | null;

    // Analyser for visualizer
    analyserRef: React.RefObject<AnalyserNode | null>;
}

export interface AudioEngineActions {
    playTrack: (index: number) => void;
    togglePlay: () => void;
    playNext: () => void;
    playPrev: () => void;
    seek: (time: number) => void;
    seekToPercent: (percent: number) => void;
    setIsMuted: (muted: boolean) => void;
    setVolume: (volume: number) => void;
    toggleStem: (stem: keyof StemState) => void;
    initAudio: () => void;
    clearError: () => void;
    setOnError: (handler: (error: AudioError) => void) => void;
}

export type AudioEngine = AudioEngineState & AudioEngineActions;

export function useAudioEngine(): AudioEngine {
    // Get only released tracks (memoized to avoid recalculating)
    const availableTracks = useMemo(() => {
        const released = getReleasedTracks();
        // Fallback to first track if nothing is released yet
        return released.length > 0 ? released : [TRACKS[0]];
    }, []);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMutedState] = useState(false);
    const [volume, setVolumeState] = useState(0.8); // Default 80%
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<AudioError | null>(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [stems, setStems] = useState<StemState>({
        DRUMS: true,
        BASS: true,
        SYNTH: true,
        FX: true,
    });

    // Refs for Web Audio API nodes
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const trackGainRef = useRef<GainNode | null>(null); // Per-track volume normalization
    const analyserRef = useRef<AnalyserNode | null>(null);
    const onErrorRef = useRef<((error: AudioError) => void) | null>(null);
    const stemGainsRef = useRef<StemGains>({
        DRUMS: null,
        BASS: null,
        SYNTH: null,
        FX: null,
    });
    const stemFiltersRef = useRef<{
        DRUMS: BiquadFilterNode[];
        BASS: BiquadFilterNode | null;
        SYNTH: BiquadFilterNode[];
        FX: BiquadFilterNode | null;
    }>({
        DRUMS: [],
        BASS: null,
        SYNTH: [],
        FX: null,
    });

    const currentTrack = availableTracks[currentTrackIndex] || availableTracks[0];
    const progress = duration > 0 ? currentTime / duration : 0;

    // Error handling
    const handleError = useCallback((audioError: AudioError) => {
        console.error(`[AudioEngine] ${audioError.type}:`, audioError.message);
        setError(audioError);
        onErrorRef.current?.(audioError);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const setOnError = useCallback((handler: (error: AudioError) => void) => {
        onErrorRef.current = handler;
    }, []);

    // Initialize Web Audio API
    const initAudio = useCallback(() => {
        if (audioContextRef.current) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) {
                handleError({
                    type: "init",
                    message: "Web Audio API not supported in this browser",
                });
                return;
            }

            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;

            // Create master gain
            const masterGain = ctx.createGain();
            masterGainRef.current = masterGain;

            // Create track gain (for per-track volume normalization)
            const trackGain = ctx.createGain();
            trackGainRef.current = trackGain;

            // Create analyser
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            // Create stem filter chains
            // DRUMS: Low frequencies (kick) + high transients (snare/hats)
            const drumsLowFilter = ctx.createBiquadFilter();
            drumsLowFilter.type = "lowshelf";
            drumsLowFilter.frequency.value = 150;
            drumsLowFilter.gain.value = 6;

            const drumsHighFilter = ctx.createBiquadFilter();
            drumsHighFilter.type = "highshelf";
            drumsHighFilter.frequency.value = 8000;
            drumsHighFilter.gain.value = 3;

            const drumsGain = ctx.createGain();
            stemFiltersRef.current.DRUMS = [drumsLowFilter, drumsHighFilter];
            stemGainsRef.current.DRUMS = drumsGain;

            // BASS: Low-pass filter < 200Hz
            const bassFilter = ctx.createBiquadFilter();
            bassFilter.type = "lowpass";
            bassFilter.frequency.value = 200;
            bassFilter.Q.value = 1;

            const bassGain = ctx.createGain();
            stemFiltersRef.current.BASS = bassFilter;
            stemGainsRef.current.BASS = bassGain;

            // SYNTH: Band-pass 200Hz - 4000Hz
            const synthLowCut = ctx.createBiquadFilter();
            synthLowCut.type = "highpass";
            synthLowCut.frequency.value = 200;

            const synthHighCut = ctx.createBiquadFilter();
            synthHighCut.type = "lowpass";
            synthHighCut.frequency.value = 4000;

            const synthGain = ctx.createGain();
            stemFiltersRef.current.SYNTH = [synthLowCut, synthHighCut];
            stemGainsRef.current.SYNTH = synthGain;

            // FX: High-pass filter > 4000Hz
            const fxFilter = ctx.createBiquadFilter();
            fxFilter.type = "highpass";
            fxFilter.frequency.value = 4000;
            fxFilter.Q.value = 0.5;

            const fxGain = ctx.createGain();
            stemFiltersRef.current.FX = fxFilter;
            stemGainsRef.current.FX = fxGain;

            // Connect stem gains to track gain (for per-track volume)
            drumsGain.connect(trackGain);
            bassGain.connect(trackGain);
            synthGain.connect(trackGain);
            fxGain.connect(trackGain);

            // Track Gain → Master Gain → Analyser → Destination
            trackGain.connect(masterGain);
            masterGain.connect(analyser);
            analyser.connect(ctx.destination);

            setIsInitialized(true);
            clearError();
        } catch (e) {
            handleError({
                type: "init",
                message: e instanceof Error ? e.message : "Failed to initialize audio system",
            });
        }
    }, [handleError, clearError]);

    // Connect audio source to stem filters
    const connectSourceToStems = useCallback(
        (source: MediaElementAudioSourceNode) => {
            const ctx = audioContextRef.current;
            if (!ctx) return;

            const filters = stemFiltersRef.current;
            const gains = stemGainsRef.current;

            try {
                // DRUMS chain: source → lowFilter → highFilter → gain
                if (filters.DRUMS.length === 2 && gains.DRUMS) {
                    source.connect(filters.DRUMS[0]);
                    filters.DRUMS[0].connect(filters.DRUMS[1]);
                    filters.DRUMS[1].connect(gains.DRUMS);
                }

                // BASS chain: source → filter → gain
                if (filters.BASS && gains.BASS) {
                    source.connect(filters.BASS);
                    filters.BASS.connect(gains.BASS);
                }

                // SYNTH chain: source → lowCut → highCut → gain
                if (filters.SYNTH.length === 2 && gains.SYNTH) {
                    source.connect(filters.SYNTH[0]);
                    filters.SYNTH[0].connect(filters.SYNTH[1]);
                    filters.SYNTH[1].connect(gains.SYNTH);
                }

                // FX chain: source → filter → gain
                if (filters.FX && gains.FX) {
                    source.connect(filters.FX);
                    filters.FX.connect(gains.FX);
                }
            } catch {
                handleError({
                    type: "init",
                    message: "Failed to connect audio filters",
                });
            }
        },
        [handleError]
    );

    // Play a specific track
    const playTrack = useCallback(
        (index: number) => {
            if (!audioContextRef.current) initAudio();

            const ctx = audioContextRef.current;
            if (!ctx) return;

            // Cleanup previous audio
            if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current.src = "";
                audioElementRef.current.removeAttribute("src");
            }

            // Disconnect previous source
            if (sourceNodeRef.current) {
                try {
                    sourceNodeRef.current.disconnect();
                } catch {
                    // Source might already be disconnected
                }
            }

            const track = availableTracks[index];
            if (!track) return;

            // Apply per-track gain (volume normalization)
            if (trackGainRef.current) {
                const trackGainValue = track.gain ?? 1.0; // Default to 1.0 if not specified
                trackGainRef.current.gain.setTargetAtTime(
                    trackGainValue,
                    ctx.currentTime,
                    0.05
                );
            }

            const audio = new Audio();
            audio.crossOrigin = "anonymous";
            audio.preload = "auto";

            // Error handlers for audio element
            audio.addEventListener("error", () => {
                const mediaError = audio.error;
                let message = "Failed to load audio";

                if (mediaError) {
                    switch (mediaError.code) {
                        case MediaError.MEDIA_ERR_ABORTED:
                            message = "Playback aborted";
                            break;
                        case MediaError.MEDIA_ERR_NETWORK:
                            message = "Network error while loading audio";
                            break;
                        case MediaError.MEDIA_ERR_DECODE:
                            message = "Audio decoding error";
                            break;
                        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            message = "Audio format not supported";
                            break;
                    }
                }

                handleError({
                    type: "load",
                    message: `${message}: ${track.title}`,
                    trackIndex: index,
                });
                setIsPlaying(false);
            });

            audio.addEventListener("stalled", () => {
                handleError({
                    type: "network",
                    message: `Buffering stalled: ${track.title}`,
                    trackIndex: index,
                });
            });

            // Duration and time tracking
            audio.addEventListener("loadedmetadata", () => {
                setDuration(audio.duration || 0);
            });

            audio.addEventListener("timeupdate", () => {
                setCurrentTime(audio.currentTime || 0);
            });

            audio.addEventListener("durationchange", () => {
                setDuration(audio.duration || 0);
            });

            // Auto-play next track
            audio.addEventListener("ended", () => {
                const nextIndex = (index + 1) % availableTracks.length;
                playTrack(nextIndex);
            });

            // Set source after adding event listeners (with basePath for production)
            audio.src = assetPath(track.src);
            audioElementRef.current = audio;

            try {
                // Create new source and connect to stem filters
                const source = ctx.createMediaElementSource(audio);
                sourceNodeRef.current = source;
                connectSourceToStems(source);

                audio
                    .play()
                    .then(() => {
                        clearError();
                    })
                    .catch((e) => {
                        // Handle autoplay restrictions
                        if (e.name === "NotAllowedError") {
                            handleError({
                                type: "playback",
                                message: "Playback blocked. Click to enable audio.",
                                trackIndex: index,
                            });
                        } else {
                            handleError({
                                type: "playback",
                                message: `Playback failed: ${e.message}`,
                                trackIndex: index,
                            });
                        }
                        setIsPlaying(false);
                    });

                setCurrentTrackIndex(index);
                setIsPlaying(true);

                if (ctx.state === "suspended") {
                    ctx.resume().catch((e) => {
                        handleError({
                            type: "playback",
                            message: `Failed to resume audio context: ${e.message}`,
                        });
                    });
                }
            } catch (e) {
                handleError({
                    type: "playback",
                    message: e instanceof Error ? e.message : "Playback initialization failed",
                    trackIndex: index,
                });
                setIsPlaying(false);
            }
        },
        [initAudio, connectSourceToStems, handleError, clearError]
    );

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        if (!audioContextRef.current) initAudio();

        const ctx = audioContextRef.current;
        const audio = audioElementRef.current;

        if (isPlaying) {
            audio?.pause();
            ctx?.suspend();
            setIsPlaying(false);
        } else {
            if (!audio || !audio.src || audio.src === window.location.href) {
                playTrack(currentTrackIndex);
            } else {
                audio
                    .play()
                    .then(() => {
                        ctx?.resume();
                        setIsPlaying(true);
                        clearError();
                    })
                    .catch((e) => {
                        handleError({
                            type: "playback",
                            message: `Resume failed: ${e.message}`,
                        });
                    });
            }
        }
    }, [isPlaying, currentTrackIndex, initAudio, playTrack, handleError, clearError]);

    // Play next track
    const playNext = useCallback(() => {
        const nextIndex = (currentTrackIndex + 1) % availableTracks.length;
        playTrack(nextIndex);
    }, [currentTrackIndex, availableTracks.length, playTrack]);

    // Play previous track
    const playPrev = useCallback(() => {
        const prevIndex = (currentTrackIndex - 1 + availableTracks.length) % availableTracks.length;
        playTrack(prevIndex);
    }, [currentTrackIndex, availableTracks.length, playTrack]);

    // Toggle stem on/off
    const toggleStem = useCallback(
        (stem: keyof StemState) => {
            setStems((prev) => {
                const newState = { ...prev, [stem]: !prev[stem] };

                // Update gain node
                const gainNode = stemGainsRef.current[stem];
                if (gainNode) {
                    try {
                        gainNode.gain.setTargetAtTime(
                            newState[stem] ? 1 : 0,
                            audioContextRef.current?.currentTime || 0,
                            0.05 // Smooth transition
                        );
                    } catch {
                        handleError({
                            type: "playback",
                            message: `Failed to toggle ${stem} stem`,
                        });
                    }
                }

                return newState;
            });
        },
        [handleError]
    );

    // Set muted state
    const setIsMuted = useCallback(
        (muted: boolean) => {
            setIsMutedState(muted);
            if (masterGainRef.current) {
                try {
                    masterGainRef.current.gain.setTargetAtTime(
                        muted ? 0 : volume,
                        audioContextRef.current?.currentTime || 0,
                        0.05
                    );
                } catch {
                    handleError({
                        type: "playback",
                        message: "Failed to change volume",
                    });
                }
            }
        },
        [handleError, volume]
    );

    // Set volume (0-1)
    const setVolume = useCallback(
        (newVolume: number) => {
            const clampedVolume = Math.max(0, Math.min(1, newVolume));
            setVolumeState(clampedVolume);

            // Auto-unmute when adjusting volume
            if (clampedVolume > 0 && isMuted) {
                setIsMutedState(false);
            }

            if (masterGainRef.current && !isMuted) {
                try {
                    masterGainRef.current.gain.setTargetAtTime(
                        clampedVolume,
                        audioContextRef.current?.currentTime || 0,
                        0.05
                    );
                } catch {
                    handleError({
                        type: "playback",
                        message: "Failed to change volume",
                    });
                }
            }
        },
        [handleError, isMuted]
    );

    // Seek to specific time
    const seek = useCallback((time: number) => {
        const audio = audioElementRef.current;
        if (audio && isFinite(time)) {
            const clampedTime = Math.max(0, Math.min(time, audio.duration || 0));
            audio.currentTime = clampedTime;
            setCurrentTime(clampedTime);
        }
    }, []);

    // Seek to percentage (0-1)
    const seekToPercent = useCallback((percent: number) => {
        const audio = audioElementRef.current;
        if (audio && audio.duration && isFinite(audio.duration)) {
            const clampedPercent = Math.max(0, Math.min(1, percent));
            const time = clampedPercent * audio.duration;
            audio.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    // Reset time when track changes
    useEffect(() => {
        setCurrentTime(0);
        setDuration(0);
    }, [currentTrackIndex]);

    return {
        // State
        isPlaying,
        currentTrackIndex,
        currentTrack,
        availableTracks,
        duration,
        currentTime,
        progress,
        isMuted,
        volume,
        stems,
        isInitialized,
        error,
        analyserRef,

        // Actions
        playTrack,
        togglePlay,
        playNext,
        playPrev,
        seek,
        seekToPercent,
        setIsMuted,
        setVolume,
        toggleStem,
        initAudio,
        clearError,
        setOnError,
    };
}
