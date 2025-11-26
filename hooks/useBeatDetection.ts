"use client";

import { useRef, useCallback, useEffect, useState } from "react";

export interface BeatState {
    isBeat: boolean;           // True during a beat
    beatIntensity: number;     // 0-1 intensity of the beat
    bassLevel: number;         // 0-1 current bass level
    midLevel: number;          // 0-1 current mid level
    highLevel: number;         // 0-1 current high level
    energy: number;            // 0-1 overall energy
}

interface UseBeatDetectionOptions {
    sensitivity?: number;      // Beat detection sensitivity (0.5-2.0, default 1.0)
    smoothing?: number;        // Smoothing factor (0-1, default 0.8)
    minBeatInterval?: number;  // Minimum ms between beats (default 100)
}

const DEFAULT_OPTIONS: Required<UseBeatDetectionOptions> = {
    sensitivity: 1.0,
    smoothing: 0.8,
    minBeatInterval: 100,
};

export function useBeatDetection(
    analyserRef: React.RefObject<AnalyserNode | null>,
    isPlaying: boolean,
    options: UseBeatDetectionOptions = {}
): BeatState {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const [beatState, setBeatState] = useState<BeatState>({
        isBeat: false,
        beatIntensity: 0,
        bassLevel: 0,
        midLevel: 0,
        highLevel: 0,
        energy: 0,
    });

    // Beat detection state refs (to avoid re-renders)
    const lastBeatTimeRef = useRef(0);
    const prevBassLevelRef = useRef(0);
    const avgBassRef = useRef(0);
    const frameIdRef = useRef<number | null>(null);
    const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

    const analyzeRef = useRef<(() => void) | null>(null);

    const analyze = useCallback(() => {
        const analyser = analyserRef.current;
        if (!analyser) {
            frameIdRef.current = requestAnimationFrame(() => analyzeRef.current?.());
            return;
        }

        // Initialize data array if needed
        if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }

        const dataArray = dataArrayRef.current;
        analyser.getByteFrequencyData(dataArray);

        const bufferLength = dataArray.length;

        // Frequency ranges (assuming 44.1kHz sample rate, fftSize 256)
        // Each bin = sampleRate / fftSize = ~172Hz per bin
        const bassEnd = Math.floor(bufferLength * 0.1);     // 0-10% (~0-860Hz)
        const midEnd = Math.floor(bufferLength * 0.5);      // 10-50% (~860-4300Hz)
        // Rest is high frequencies

        // Calculate levels for each frequency range
        let bassSum = 0;
        let midSum = 0;
        let highSum = 0;

        for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i] / 255;
            if (i < bassEnd) {
                bassSum += value;
            } else if (i < midEnd) {
                midSum += value;
            } else {
                highSum += value;
            }
        }

        const bassLevel = bassSum / bassEnd;
        const midLevel = midSum / (midEnd - bassEnd);
        const highLevel = highSum / (bufferLength - midEnd);
        const energy = (bassLevel * 0.5 + midLevel * 0.3 + highLevel * 0.2);

        // Beat detection using bass frequencies
        const now = performance.now();
        const timeSinceLastBeat = now - lastBeatTimeRef.current;

        // Update running average
        avgBassRef.current = avgBassRef.current * opts.smoothing + bassLevel * (1 - opts.smoothing);

        // Detect beat: bass level is significantly above average
        const threshold = avgBassRef.current * (1.3 / opts.sensitivity);
        const isBeat =
            bassLevel > threshold &&
            bassLevel > prevBassLevelRef.current && // Rising edge
            timeSinceLastBeat > opts.minBeatInterval &&
            bassLevel > 0.15; // Minimum absolute level

        let beatIntensity = 0;
        if (isBeat) {
            lastBeatTimeRef.current = now;
            beatIntensity = Math.min(1, (bassLevel - threshold) / 0.3 + 0.5);
        }

        prevBassLevelRef.current = bassLevel;

        setBeatState({
            isBeat,
            beatIntensity,
            bassLevel,
            midLevel,
            highLevel,
            energy,
        });

        frameIdRef.current = requestAnimationFrame(() => analyzeRef.current?.());
    }, [analyserRef, opts.sensitivity, opts.smoothing, opts.minBeatInterval]);

    // Keep analyzeRef in sync with analyze
    analyzeRef.current = analyze;

    useEffect(() => {
        if (isPlaying) {
            frameIdRef.current = requestAnimationFrame(analyze);
        } else {
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
                frameIdRef.current = null;
            }
            // Reset state when not playing
            setBeatState({
                isBeat: false,
                beatIntensity: 0,
                bassLevel: 0,
                midLevel: 0,
                highLevel: 0,
                energy: 0,
            });
        }

        return () => {
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
                frameIdRef.current = null;
            }
        };
    }, [isPlaying, analyze]);

    return beatState;
}
