"use client";

import { useRef, useCallback, useEffect } from "react";

/**
 * Hook that manages a silent audio element to keep iOS audio session alive.
 * This is required for background playback on iOS when the screen is locked.
 */
export function useAudioKeepalive() {
    const silentAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize silent audio element
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

        console.log("[AudioKeepalive] Silent audio initialized");
    }, []);

    // Start silent audio keepalive
    const startKeepalive = useCallback(() => {
        if (!silentAudioRef.current) {
            initSilentAudio();
        }

        const silentAudio = silentAudioRef.current;
        if (silentAudio && silentAudio.paused) {
            silentAudio.play().catch((e) => {
                console.warn("[AudioKeepalive] Silent keepalive play failed:", e);
            });
        }
    }, [initSilentAudio]);

    // Stop silent audio keepalive
    const stopKeepalive = useCallback(() => {
        const silentAudio = silentAudioRef.current;
        if (silentAudio && !silentAudio.paused) {
            silentAudio.pause();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (silentAudioRef.current) {
                silentAudioRef.current.pause();
                silentAudioRef.current.src = "";
                silentAudioRef.current = null;
            }
        };
    }, []);

    return {
        startKeepalive,
        stopKeepalive,
        initSilentAudio,
    };
}
