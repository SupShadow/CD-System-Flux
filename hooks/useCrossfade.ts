"use client";

import { useRef, useCallback, useState } from "react";
import { Track } from "@/lib/tracks";
import { assetPath } from "@/lib/utils";

interface CrossfadeConfig {
    duration: number; // Crossfade duration in seconds
    enabled: boolean;
}

interface CrossfadeState {
    isTransitioning: boolean;
    progress: number; // 0-1, how far through the crossfade
}

/**
 * useCrossfade - Handles smooth audio crossfading between tracks
 *
 * This creates a dual-audio-element system where one track fades out
 * while the next fades in, creating seamless narrative transitions.
 */
export function useCrossfade(audioContext: AudioContext | null) {
    const [config, setConfig] = useState<CrossfadeConfig>({
        duration: 2.0, // 2 second crossfade
        enabled: true,
    });

    const [state, setState] = useState<CrossfadeState>({
        isTransitioning: false,
        progress: 0,
    });

    // Secondary audio element for crossfading
    const secondaryAudioRef = useRef<HTMLAudioElement | null>(null);
    const secondarySourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const secondaryGainRef = useRef<GainNode | null>(null);

    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    /**
     * Perform a crossfade transition from the current track to a new track
     */
    const crossfadeTo = useCallback((
        newTrack: Track,
        primaryAudio: HTMLAudioElement,
        primaryGain: GainNode,
        onTransitionComplete: (audio: HTMLAudioElement, source: MediaElementAudioSourceNode, gain: GainNode) => void
    ) => {
        if (!audioContext || !config.enabled) {
            return false; // Return false to indicate crossfade was not performed
        }

        setState({ isTransitioning: true, progress: 0 });

        try {
            // Create secondary audio element
            const secondaryAudio = new Audio();
            secondaryAudio.crossOrigin = "anonymous";
            secondaryAudio.preload = "auto";
            secondaryAudio.src = assetPath(newTrack.src);
            secondaryAudioRef.current = secondaryAudio;

            // Create gain node for secondary audio
            const secondaryGain = audioContext.createGain();
            secondaryGain.gain.setValueAtTime(0, audioContext.currentTime);
            secondaryGainRef.current = secondaryGain;

            // Wait for secondary audio to be ready
            secondaryAudio.addEventListener("canplaythrough", () => {
                // Create source from secondary audio
                const secondarySource = audioContext.createMediaElementSource(secondaryAudio);
                secondarySourceRef.current = secondarySource;
                secondarySource.connect(secondaryGain);
                secondaryGain.connect(audioContext.destination);

                // Start the secondary audio
                secondaryAudio.play().catch(console.error);

                const startTime = audioContext.currentTime;
                const endTime = startTime + config.duration;

                // Animate the crossfade
                const animateCrossfade = () => {
                    const now = audioContext.currentTime;
                    const progress = Math.min(1, (now - startTime) / config.duration);

                    setState({ isTransitioning: true, progress });

                    // Fade out primary
                    primaryGain.gain.setValueAtTime(1 - progress, now);

                    // Fade in secondary
                    secondaryGain.gain.setValueAtTime(progress, now);

                    if (progress < 1) {
                        animationFrameRef.current = requestAnimationFrame(animateCrossfade);
                    } else {
                        // Transition complete
                        setState({ isTransitioning: false, progress: 1 });

                        // Stop primary audio
                        primaryAudio.pause();
                        primaryAudio.src = "";

                        // Notify completion with new audio elements
                        onTransitionComplete(secondaryAudio, secondarySource, secondaryGain);

                        // Clear refs
                        secondaryAudioRef.current = null;
                        secondarySourceRef.current = null;
                        secondaryGainRef.current = null;
                    }
                };

                animateCrossfade();
            }, { once: true });

            return true; // Crossfade initiated

        } catch (error) {
            console.error("[Crossfade] Failed:", error);
            setState({ isTransitioning: false, progress: 0 });
            return false;
        }
    }, [audioContext, config]);

    /**
     * Cancel any ongoing crossfade
     */
    const cancelCrossfade = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Clean up secondary audio
        if (secondaryAudioRef.current) {
            secondaryAudioRef.current.pause();
            secondaryAudioRef.current.src = "";
            secondaryAudioRef.current = null;
        }

        if (secondarySourceRef.current) {
            secondarySourceRef.current.disconnect();
            secondarySourceRef.current = null;
        }

        if (secondaryGainRef.current) {
            secondaryGainRef.current.disconnect();
            secondaryGainRef.current = null;
        }

        setState({ isTransitioning: false, progress: 0 });
    }, []);

    /**
     * Set crossfade configuration
     */
    const setCrossfadeConfig = useCallback((newConfig: Partial<CrossfadeConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    return {
        crossfadeTo,
        cancelCrossfade,
        setCrossfadeConfig,
        config,
        state,
    };
}

/**
 * Simple crossfade between two gain values
 * Useful for quick volume transitions
 */
export function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Equal-power crossfade curve (sounds more natural)
 */
export function equalPowerFade(t: number): { fadeOut: number; fadeIn: number } {
    const angle = t * Math.PI / 2;
    return {
        fadeOut: Math.cos(angle),
        fadeIn: Math.sin(angle),
    };
}
