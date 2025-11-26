"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAudio } from "@/contexts/AudioContext";
import { useBeatDetection, BeatState } from "@/hooks/useBeatDetection";

const defaultBeatState: BeatState = {
    isBeat: false,
    beatIntensity: 0,
    bassLevel: 0,
    midLevel: 0,
    highLevel: 0,
    energy: 0,
};

const BeatCtx = createContext<BeatState>(defaultBeatState);

export function useBeat(): BeatState {
    return useContext(BeatCtx);
}

export function BeatProvider({ children }: { children: ReactNode }) {
    const { analyserRef, isPlaying } = useAudio();

    const beatState = useBeatDetection(analyserRef, isPlaying, {
        sensitivity: 1.2,
        smoothing: 0.85,
        minBeatInterval: 120,
    });

    return <BeatCtx.Provider value={beatState}>{children}</BeatCtx.Provider>;
}
