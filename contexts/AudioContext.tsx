"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAudioEngine, AudioEngine } from "@/hooks/useAudioEngine";

// Re-export types from the hook for convenience
export type { StemState, AudioError } from "@/hooks/useAudioEngine";

const AudioCtx = createContext<AudioEngine | null>(null);

export function useAudio(): AudioEngine {
    const context = useContext(AudioCtx);
    if (!context) {
        throw new Error("useAudio must be used within an AudioProvider");
    }
    return context;
}

export function AudioProvider({ children }: { children: ReactNode }) {
    const audioEngine = useAudioEngine();

    return <AudioCtx.Provider value={audioEngine}>{children}</AudioCtx.Provider>;
}
