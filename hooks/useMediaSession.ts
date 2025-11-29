"use client";

import { useEffect, useCallback } from "react";
import { Track, getArtworkPath } from "@/lib/tracks";
import { assetPath } from "@/lib/utils";

interface MediaSessionOptions {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    onPlay: () => void;
    onPause: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onSeek: (time: number) => void;
}

/**
 * Hook that manages the Media Session API for lock screen controls.
 * Provides metadata display and playback control on iOS/Android lock screens.
 */
export function useMediaSession({
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    onPlay,
    onPause,
    onPrevious,
    onNext,
    onSeek,
}: MediaSessionOptions): void {
    // Update media session metadata
    const updateMediaSession = useCallback(() => {
        if (!("mediaSession" in navigator) || !currentTrack) return;

        try {
            const artworkPath = getArtworkPath(currentTrack);

            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: "Julian Guggeis",
                album: "SYSTEM FLUX",
                artwork: [
                    {
                        src: assetPath(artworkPath),
                        sizes: "512x512",
                        type: "image/jpeg",
                    },
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

            navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
        } catch (e) {
            console.warn("[MediaSession] Failed to update metadata:", e);
        }
    }, [currentTrack, isPlaying]);

    // Register Media Session action handlers
    useEffect(() => {
        if (!("mediaSession" in navigator)) return;

        try {
            navigator.mediaSession.setActionHandler("play", onPlay);
            navigator.mediaSession.setActionHandler("pause", onPause);
            navigator.mediaSession.setActionHandler("previoustrack", onPrevious);
            navigator.mediaSession.setActionHandler("nexttrack", onNext);

            navigator.mediaSession.setActionHandler("seekto", (details) => {
                if (details.seekTime !== undefined) {
                    onSeek(details.seekTime);
                }
            });

            navigator.mediaSession.setActionHandler("seekbackward", (details) => {
                const skipTime = details.seekOffset || 10;
                onSeek(Math.max(0, currentTime - skipTime));
            });

            navigator.mediaSession.setActionHandler("seekforward", (details) => {
                const skipTime = details.seekOffset || 10;
                onSeek(Math.min(duration, currentTime + skipTime));
            });
        } catch (e) {
            console.warn("[MediaSession] Failed to set action handlers:", e);
        }

        return () => {
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
    }, [onPlay, onPause, onPrevious, onNext, onSeek, currentTime, duration]);

    // Update metadata when track or playback state changes
    useEffect(() => {
        updateMediaSession();
    }, [updateMediaSession]);

    // Update position state for lock screen progress bar
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
                console.warn("[MediaSession] Failed to update position state:", e);
            }
        };

        updatePositionState();
        const interval = setInterval(updatePositionState, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, duration, currentTime]);
}
