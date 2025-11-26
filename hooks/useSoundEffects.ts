"use client";

import { useCallback, useRef, useEffect } from "react";

type SoundType = "hover" | "click" | "success" | "error" | "whoosh";

export function useSoundEffects() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const enabledRef = useRef(true);

    useEffect(() => {
        // Initialize AudioContext on first user interaction
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            }
            document.removeEventListener("click", initAudio);
            document.removeEventListener("keydown", initAudio);
        };

        document.addEventListener("click", initAudio);
        document.addEventListener("keydown", initAudio);

        return () => {
            document.removeEventListener("click", initAudio);
            document.removeEventListener("keydown", initAudio);
        };
    }, []);

    const playSound = useCallback((type: SoundType) => {
        if (!enabledRef.current || !audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case "hover":
                // Subtle high-pitched blip
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gainNode.gain.setValueAtTime(0.03, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                oscillator.start(now);
                oscillator.stop(now + 0.08);
                break;

            case "click":
                // Short, satisfying click
                oscillator.type = "square";
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.1);
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case "success":
                // Ascending pleasant tone
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            case "error":
                // Low buzzy error sound
                oscillator.type = "sawtooth";
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                oscillator.start(now);
                oscillator.stop(now + 0.25);
                break;

            case "whoosh":
                // Swoosh/transition sound using noise
                oscillator.type = "sawtooth";
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gainNode.gain.setValueAtTime(0.02, now);
                gainNode.gain.linearRampToValueAtTime(0.04, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                oscillator.start(now);
                oscillator.stop(now + 0.35);
                break;
        }
    }, []);

    const setEnabled = useCallback((enabled: boolean) => {
        enabledRef.current = enabled;
    }, []);

    return { playSound, setEnabled };
}
