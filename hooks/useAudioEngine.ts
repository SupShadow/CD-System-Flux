"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { TRACKS, Track, getReleasedTracks, getArtworkPath } from "@/lib/tracks";
import { assetPath } from "@/lib/utils";

// Platform detection utilities
const getPlatformInfo = () => {
    if (typeof window === "undefined") {
        return { isAndroid: false, isIOS: false, androidVersion: null };
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    let androidVersion: number | null = null;
    if (isAndroid) {
        const match = ua.match(/android\s*(\d+\.?\d*)/i);
        if (match) {
            androidVersion = parseFloat(match[1]);
        }
    }

    return { isAndroid, isIOS, androidVersion };
};

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
    const silentAudioRef = useRef<HTMLAudioElement | null>(null); // Silent audio for iOS keepalive
    const wasPlayingBeforeHiddenRef = useRef<boolean>(false); // Track if we were playing before page hide
    const wasPlayingBeforeInterruptionRef = useRef<boolean>(false); // Track if we were playing before audio interruption (Android)
    const platformInfoRef = useRef(getPlatformInfo()); // Cache platform info
    const stateChangeHandlerRef = useRef<(() => void) | null>(null); // Store statechange handler for cleanup
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

            // iOS/Safari & Android: Handle AudioContext state changes (interrupted/suspended)
            // Store handler in ref for proper cleanup on unmount
            const handleStateChange = () => {
                const { isAndroid, isIOS } = platformInfoRef.current;
                console.log("[AudioEngine] AudioContext state changed to:", ctx.state, "Platform:", isAndroid ? "Android" : isIOS ? "iOS" : "Other");

                if (ctx.state === "suspended" || (ctx.state as string) === "interrupted") {
                    // Try to resume if we were playing
                    if (audioElementRef.current && !audioElementRef.current.paused) {
                        ctx.resume().catch((e) => {
                            console.warn("[AudioEngine] Failed to resume AudioContext:", e);
                        });
                    }
                } else if (ctx.state === "running" && isAndroid) {
                    // Android: AudioContext resumed, try to resume playback if we were interrupted
                    const audio = audioElementRef.current;
                    if (audio && audio.paused && wasPlayingBeforeInterruptionRef.current) {
                        console.log("[AudioEngine] Android: AudioContext running, resuming playback");
                        // Ensure consistent pitch after AudioContext resume
                        audio.playbackRate = 1;
                        audio.play().catch((e) => {
                            console.warn("[AudioEngine] Android: Failed to resume after interruption:", e);
                        });
                        wasPlayingBeforeInterruptionRef.current = false;
                    }
                }
            };
            stateChangeHandlerRef.current = handleStateChange;
            ctx.addEventListener("statechange", handleStateChange);
        } catch (e) {
            handleError({
                type: "init",
                message: e instanceof Error ? e.message : "Failed to initialize audio system",
            });
        }
    }, [handleError, clearError]);

    // iOS Safari Keepalive: Create silent audio to maintain audio session
    const initSilentAudio = useCallback(() => {
        if (silentAudioRef.current) return;

        // Create a very short silent audio using a data URI (minimal 1-sample WAV)
        // This keeps the iOS audio session alive when the screen is locked
        const silentDataUri =
            "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

        const silentAudio = new Audio();
        silentAudio.src = silentDataUri;
        silentAudio.loop = true;
        silentAudio.volume = 0.001; // Nearly silent but not zero (iOS might optimize away zero volume)
        silentAudio.setAttribute("playsinline", "true");
        silentAudio.setAttribute("webkit-playsinline", "true");
        silentAudioRef.current = silentAudio;

        console.log("[AudioEngine] Silent audio keepalive initialized");
    }, []);

    // Start silent audio keepalive (call when main audio starts playing)
    const startSilentKeepalive = useCallback(() => {
        if (!silentAudioRef.current) {
            initSilentAudio();
        }

        const silentAudio = silentAudioRef.current;
        if (silentAudio && silentAudio.paused) {
            silentAudio.play().catch((e) => {
                console.warn("[AudioEngine] Silent keepalive play failed:", e);
            });
        }
    }, [initSilentAudio]);

    // Stop silent audio keepalive (call when main audio pauses)
    const stopSilentKeepalive = useCallback(() => {
        const silentAudio = silentAudioRef.current;
        if (silentAudio && !silentAudio.paused) {
            silentAudio.pause();
        }
    }, []);

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
            // Ensure consistent pitch - prevent browser from altering playbackRate
            audio.playbackRate = 1;
            audio.defaultPlaybackRate = 1;
            // iOS Safari: Required for background playback
            audio.setAttribute("playsinline", "true");
            audio.setAttribute("webkit-playsinline", "true");

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
                        // Start silent keepalive for iOS background playback
                        startSilentKeepalive();
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
                        stopSilentKeepalive();
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
        [initAudio, connectSourceToStems, handleError, clearError, startSilentKeepalive, stopSilentKeepalive]
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
            stopSilentKeepalive();
        } else {
            if (!audio || !audio.src || audio.src === window.location.href) {
                playTrack(currentTrackIndex);
            } else {
                // Ensure consistent pitch before resuming
                audio.playbackRate = 1;
                audio
                    .play()
                    .then(() => {
                        ctx?.resume();
                        setIsPlaying(true);
                        clearError();
                        startSilentKeepalive();
                    })
                    .catch((e) => {
                        handleError({
                            type: "playback",
                            message: `Resume failed: ${e.message}`,
                        });
                    });
            }
        }
    }, [isPlaying, currentTrackIndex, initAudio, playTrack, handleError, clearError, startSilentKeepalive, stopSilentKeepalive]);

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

    // Media Session API for iOS Lock Screen controls
    const updateMediaSession = useCallback(() => {
        if (!("mediaSession" in navigator)) return;

        const track = availableTracks[currentTrackIndex];
        if (!track) return;

        try {
            // Get track-specific artwork or fallback to app icons
            const artworkPath = getArtworkPath(track);

            // Set metadata for lock screen display
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: "Julian Guggeis",
                album: "SYSTEM FLUX",
                artwork: [
                    // Track-specific artwork (if exists)
                    {
                        src: assetPath(artworkPath),
                        sizes: "512x512",
                        type: "image/jpeg",
                    },
                    // Fallback to app icons for different sizes
                    {
                        src: assetPath("/icons/icon-512x512.png"),
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: assetPath("/icons/icon-384x384.png"),
                        sizes: "384x384",
                        type: "image/png",
                    },
                    {
                        src: assetPath("/icons/icon-192x192.png"),
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: assetPath("/icons/icon-128x128.png"),
                        sizes: "128x128",
                        type: "image/png",
                    },
                ],
            });

            // Update playback state
            navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
        } catch (e) {
            console.warn("[MediaSession] Failed to update metadata:", e);
        }
    }, [availableTracks, currentTrackIndex, isPlaying]);

    // Register Media Session action handlers
    useEffect(() => {
        if (!("mediaSession" in navigator)) return;

        try {
            // Play/Pause handlers
            navigator.mediaSession.setActionHandler("play", () => {
                togglePlay();
            });

            navigator.mediaSession.setActionHandler("pause", () => {
                togglePlay();
            });

            // Track navigation
            navigator.mediaSession.setActionHandler("previoustrack", () => {
                playPrev();
            });

            navigator.mediaSession.setActionHandler("nexttrack", () => {
                playNext();
            });

            // Seek handlers
            navigator.mediaSession.setActionHandler("seekto", (details) => {
                if (details.seekTime !== undefined) {
                    seek(details.seekTime);
                }
            });

            navigator.mediaSession.setActionHandler("seekbackward", (details) => {
                const skipTime = details.seekOffset || 10;
                seek(Math.max(0, currentTime - skipTime));
            });

            navigator.mediaSession.setActionHandler("seekforward", (details) => {
                const skipTime = details.seekOffset || 10;
                seek(Math.min(duration, currentTime + skipTime));
            });
        } catch (e) {
            console.warn("[MediaSession] Failed to set action handlers:", e);
        }

        return () => {
            // Cleanup handlers on unmount
            if ("mediaSession" in navigator) {
                try {
                    navigator.mediaSession.setActionHandler("play", null);
                    navigator.mediaSession.setActionHandler("pause", null);
                    navigator.mediaSession.setActionHandler("previoustrack", null);
                    navigator.mediaSession.setActionHandler("nexttrack", null);
                    navigator.mediaSession.setActionHandler("seekto", null);
                    navigator.mediaSession.setActionHandler("seekbackward", null);
                    navigator.mediaSession.setActionHandler("seekforward", null);
                } catch {
                    // Ignore cleanup errors
                }
            }
        };
    }, [togglePlay, playPrev, playNext, seek, currentTime, duration]);

    // Update Media Session metadata when track or playback state changes
    useEffect(() => {
        updateMediaSession();
    }, [updateMediaSession]);

    // Update position state every second for lock screen progress bar
    useEffect(() => {
        if (!("mediaSession" in navigator) || !isPlaying || duration <= 0) return;

        const updatePositionState = () => {
            try {
                navigator.mediaSession.setPositionState({
                    duration: duration,
                    playbackRate: 1,
                    position: Math.min(currentTime, duration),
                });
            } catch (e) {
                // Position state not supported or invalid values
                console.warn("[MediaSession] Failed to update position state:", e);
            }
        };

        // Update immediately
        updatePositionState();

        // Then update every second
        const interval = setInterval(updatePositionState, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, duration, currentTime]);

    // iOS/Safari: Handle page visibility changes to resume audio after screen unlock
    useEffect(() => {
        const handleVisibilityChange = () => {
            const ctx = audioContextRef.current;
            const audio = audioElementRef.current;

            if (document.hidden) {
                // Page is being hidden (screen locked, tab switched, etc.)
                // Remember if we were playing
                wasPlayingBeforeHiddenRef.current = isPlaying;
                console.log("[AudioEngine] Page hidden, was playing:", isPlaying);
            } else {
                // Page is visible again (screen unlocked, tab focused)
                console.log("[AudioEngine] Page visible, was playing:", wasPlayingBeforeHiddenRef.current);

                if (wasPlayingBeforeHiddenRef.current && audio && ctx) {
                    // Resume AudioContext if suspended
                    if (ctx.state === "suspended" || (ctx.state as string) === "interrupted") {
                        ctx.resume().then(() => {
                            console.log("[AudioEngine] AudioContext resumed after visibility change");
                        }).catch((e) => {
                            console.warn("[AudioEngine] Failed to resume AudioContext:", e);
                        });
                    }

                    // Resume audio playback if it was paused by iOS
                    if (audio.paused) {
                        // Ensure consistent pitch after resume
                        audio.playbackRate = 1;
                        audio.play().then(() => {
                            console.log("[AudioEngine] Audio playback resumed after visibility change");
                            setIsPlaying(true);
                            startSilentKeepalive();
                        }).catch((e) => {
                            console.warn("[AudioEngine] Failed to resume audio playback:", e);
                        });
                    } else {
                        // Even if not paused, ensure playbackRate is correct
                        audio.playbackRate = 1;
                    }
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isPlaying, startSilentKeepalive]);

    // iOS/Safari: Handle audio element pause events that might be triggered by iOS
    useEffect(() => {
        const audio = audioElementRef.current;
        if (!audio) return;

        const handlePause = () => {
            // Only update state if this wasn't a user-initiated pause
            // iOS might pause audio when screen locks
            if (!document.hidden && isPlaying) {
                console.log("[AudioEngine] Unexpected pause detected, attempting to resume...");
                const ctx = audioContextRef.current;

                // Try to resume after a brief delay (iOS needs this)
                setTimeout(() => {
                    if (ctx && (ctx.state === "suspended" || (ctx.state as string) === "interrupted")) {
                        ctx.resume().catch(console.warn);
                    }
                    // Ensure consistent pitch after resume
                    audio.playbackRate = 1;
                    audio.play().then(() => {
                        console.log("[AudioEngine] Audio resumed after unexpected pause");
                    }).catch((e) => {
                        console.warn("[AudioEngine] Could not resume after pause:", e);
                        setIsPlaying(false);
                    });
                }, 100);
            }
        };

        audio.addEventListener("pause", handlePause);

        return () => {
            audio.removeEventListener("pause", handlePause);
        };
    }, [isPlaying]);

    // Cleanup silent audio on unmount
    useEffect(() => {
        return () => {
            if (silentAudioRef.current) {
                silentAudioRef.current.pause();
                silentAudioRef.current.src = "";
                silentAudioRef.current = null;
            }
        };
    }, []);

    // Cleanup AudioContext and statechange listener on unmount
    useEffect(() => {
        return () => {
            const ctx = audioContextRef.current;
            const handler = stateChangeHandlerRef.current;

            // Remove statechange listener before closing
            if (ctx && handler) {
                ctx.removeEventListener("statechange", handler);
                stateChangeHandlerRef.current = null;
            }

            // Close AudioContext to release resources
            if (ctx && ctx.state !== "closed") {
                ctx.close().catch((e) => {
                    console.warn("[AudioEngine] Failed to close AudioContext:", e);
                });
                audioContextRef.current = null;
            }
        };
    }, []);

    // Android: Handle audio focus changes (phone calls, notifications, other apps)
    // This uses multiple event listeners to detect when audio focus is lost/gained
    useEffect(() => {
        const { isAndroid } = platformInfoRef.current;
        if (!isAndroid) return;

        const audio = audioElementRef.current;

        // Handle audio focus loss through blur event (when another app takes focus)
        const handleWindowBlur = () => {
            if (isPlaying && audio && !audio.paused) {
                console.log("[AudioEngine] Android: Window blur detected, saving playback state");
                wasPlayingBeforeInterruptionRef.current = true;
            }
        };

        // Handle audio focus gain through focus event
        const handleWindowFocus = () => {
            const ctx = audioContextRef.current;
            if (wasPlayingBeforeInterruptionRef.current && audio && ctx) {
                console.log("[AudioEngine] Android: Window focus gained, attempting to resume");

                // Small delay to let Android settle
                setTimeout(() => {
                    // Ensure consistent pitch after resume
                    audio.playbackRate = 1;
                    if (ctx.state === "suspended") {
                        ctx.resume().then(() => {
                            if (audio.paused) {
                                audio.play().catch(console.warn);
                            }
                        }).catch(console.warn);
                    } else if (audio.paused) {
                        audio.play().catch(console.warn);
                    }
                    wasPlayingBeforeInterruptionRef.current = false;
                }, 300);
            }
        };

        // Handle audio interruptions through the audio element's events
        const handleAudioWaiting = () => {
            console.log("[AudioEngine] Android: Audio waiting (buffering or interrupted)");
        };

        const handleAudioStalled = () => {
            console.log("[AudioEngine] Android: Audio stalled");
        };

        // Handle Bluetooth audio device changes
        const handleDeviceChange = () => {
            const ctx = audioContextRef.current;
            console.log("[AudioEngine] Android: Audio device changed (Bluetooth connect/disconnect)");

            // When Bluetooth disconnects, audio often pauses - try to resume
            if (ctx && ctx.state === "suspended") {
                ctx.resume().catch(console.warn);
            }

            // Reconnect audio if it was playing
            if (audio && audio.paused && wasPlayingBeforeInterruptionRef.current) {
                setTimeout(() => {
                    // Ensure consistent pitch after device change
                    audio.playbackRate = 1;
                    audio.play().catch(console.warn);
                }, 500);
            }
        };

        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);

        if (audio) {
            audio.addEventListener("waiting", handleAudioWaiting);
            audio.addEventListener("stalled", handleAudioStalled);
        }

        // Listen for audio output device changes (Bluetooth, etc.)
        if (navigator.mediaDevices?.addEventListener) {
            navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
        }

        return () => {
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);

            if (audio) {
                audio.removeEventListener("waiting", handleAudioWaiting);
                audio.removeEventListener("stalled", handleAudioStalled);
            }

            if (navigator.mediaDevices?.removeEventListener) {
                navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
            }
        };
    }, [isPlaying]);

    // Android: Handle phone calls and other system audio interruptions
    // Uses the beforeunload event as a proxy for detecting system interruptions
    useEffect(() => {
        const { isAndroid } = platformInfoRef.current;
        if (!isAndroid) return;

        // Android Chrome fires 'pagehide' when receiving calls or switching apps
        const handlePageHide = (event: PageTransitionEvent) => {
            if (isPlaying) {
                console.log("[AudioEngine] Android: Page hide detected (possible phone call)");
                wasPlayingBeforeInterruptionRef.current = true;
            }
        };

        const handlePageShow = (event: PageTransitionEvent) => {
            const audio = audioElementRef.current;
            const ctx = audioContextRef.current;

            if (event.persisted && wasPlayingBeforeInterruptionRef.current && audio && ctx) {
                console.log("[AudioEngine] Android: Page show detected, resuming playback");

                // Resume AudioContext first
                if (ctx.state === "suspended") {
                    ctx.resume().catch(console.warn);
                }

                // Then resume audio with a delay
                setTimeout(() => {
                    // Ensure consistent pitch after page show
                    audio.playbackRate = 1;
                    if (audio.paused) {
                        audio.play().then(() => {
                            setIsPlaying(true);
                            startSilentKeepalive();
                        }).catch((e) => {
                            console.warn("[AudioEngine] Android: Could not resume after page show:", e);
                        });
                    }
                    wasPlayingBeforeInterruptionRef.current = false;
                }, 300);
            }
        };

        window.addEventListener("pagehide", handlePageHide);
        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener("pagehide", handlePageHide);
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, [isPlaying, startSilentKeepalive]);

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
