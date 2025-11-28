"use client";

import { createContext, useContext, ReactNode, useCallback, useRef, useEffect, useState } from "react";

type SoundType = "hover" | "click" | "success" | "error" | "whoosh";

interface SoundContextType {
    playSound: (type: SoundType) => void;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const [enabled, setEnabledState] = useState(true);
    const enabledRef = useRef(true);

    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    useEffect(() => {
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
            // Close AudioContext to prevent memory leak
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, []);

    const playSound = useCallback((type: SoundType) => {
        if (!enabledRef.current || !audioContextRef.current) return;

        const ctx = audioContextRef.current;

        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === "suspended") {
            ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case "hover":
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gainNode.gain.setValueAtTime(0.02, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                oscillator.start(now);
                oscillator.stop(now + 0.08);
                break;

            case "click":
                oscillator.type = "square";
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.1);
                gainNode.gain.setValueAtTime(0.06, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case "success":
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                gainNode.gain.setValueAtTime(0.04, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            case "error":
                oscillator.type = "sawtooth";
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.04, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                oscillator.start(now);
                oscillator.stop(now + 0.25);
                break;

            case "whoosh":
                oscillator.type = "sawtooth";
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gainNode.gain.setValueAtTime(0.015, now);
                gainNode.gain.linearRampToValueAtTime(0.03, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                oscillator.start(now);
                oscillator.stop(now + 0.35);
                break;
        }
    }, []);

    const setEnabled = useCallback((value: boolean) => {
        setEnabledState(value);
    }, []);

    return (
        <SoundContext.Provider value={{ playSound, enabled, setEnabled }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error("useSound must be used within a SoundProvider");
    }
    return context;
}
