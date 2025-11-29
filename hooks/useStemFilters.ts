"use client";

import { useRef, useCallback } from "react";

export interface StemState {
    DRUMS: boolean;
    BASS: boolean;
    SYNTH: boolean;
    FX: boolean;
}

interface StemGains {
    DRUMS: GainNode | null;
    BASS: GainNode | null;
    SYNTH: GainNode | null;
    FX: GainNode | null;
}

interface StemFilters {
    DRUMS: BiquadFilterNode[];
    BASS: BiquadFilterNode | null;
    SYNTH: BiquadFilterNode[];
    FX: BiquadFilterNode | null;
}

export interface StemFilterChain {
    gains: StemGains;
    filters: StemFilters;
    outputNode: GainNode | null;
}

/**
 * Creates the stem filter chain for audio isolation.
 * Each stem has specific frequency filtering to isolate different parts of the mix.
 *
 * - DRUMS: Low frequencies (kick) + high transients (snare/hats)
 * - BASS: Low-pass filter < 200Hz
 * - SYNTH: Band-pass 200Hz - 4000Hz
 * - FX: High-pass filter > 4000Hz
 */
export function createStemFilterChain(ctx: AudioContext): StemFilterChain {
    // Create track gain (output node for all stems)
    const trackGain = ctx.createGain();

    // DRUMS chain: Low frequencies (kick) + high transients (snare/hats)
    const drumsLowFilter = ctx.createBiquadFilter();
    drumsLowFilter.type = "lowshelf";
    drumsLowFilter.frequency.value = 150;
    drumsLowFilter.gain.value = 6;

    const drumsHighFilter = ctx.createBiquadFilter();
    drumsHighFilter.type = "highshelf";
    drumsHighFilter.frequency.value = 8000;
    drumsHighFilter.gain.value = 3;

    const drumsGain = ctx.createGain();

    // BASS chain: Low-pass filter < 200Hz
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = "lowpass";
    bassFilter.frequency.value = 200;
    bassFilter.Q.value = 1;

    const bassGain = ctx.createGain();

    // SYNTH chain: Band-pass 200Hz - 4000Hz
    const synthLowCut = ctx.createBiquadFilter();
    synthLowCut.type = "highpass";
    synthLowCut.frequency.value = 200;

    const synthHighCut = ctx.createBiquadFilter();
    synthHighCut.type = "lowpass";
    synthHighCut.frequency.value = 4000;

    const synthGain = ctx.createGain();

    // FX chain: High-pass filter > 4000Hz
    const fxFilter = ctx.createBiquadFilter();
    fxFilter.type = "highpass";
    fxFilter.frequency.value = 4000;
    fxFilter.Q.value = 0.5;

    const fxGain = ctx.createGain();

    // Connect stem gains to track gain
    drumsGain.connect(trackGain);
    bassGain.connect(trackGain);
    synthGain.connect(trackGain);
    fxGain.connect(trackGain);

    return {
        gains: {
            DRUMS: drumsGain,
            BASS: bassGain,
            SYNTH: synthGain,
            FX: fxGain,
        },
        filters: {
            DRUMS: [drumsLowFilter, drumsHighFilter],
            BASS: bassFilter,
            SYNTH: [synthLowCut, synthHighCut],
            FX: fxFilter,
        },
        outputNode: trackGain,
    };
}

/**
 * Connects an audio source to the stem filter chains.
 */
export function connectSourceToStems(
    source: MediaElementAudioSourceNode,
    chain: StemFilterChain
): void {
    const { gains, filters } = chain;

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
}

/**
 * Hook for managing stem filter state and controls.
 */
export function useStemControl(
    audioContextRef: React.RefObject<AudioContext | null>,
    stemGainsRef: React.RefObject<StemGains>
) {
    const toggleStem = useCallback(
        (stem: keyof StemState, currentState: boolean): void => {
            const gainNode = stemGainsRef.current?.[stem];
            const ctx = audioContextRef.current;

            if (gainNode && ctx) {
                try {
                    gainNode.gain.setTargetAtTime(
                        currentState ? 0 : 1,
                        ctx.currentTime,
                        0.05 // Smooth transition
                    );
                } catch (e) {
                    console.error(`[StemControl] Failed to toggle ${stem}:`, e);
                }
            }
        },
        [audioContextRef, stemGainsRef]
    );

    const setStemGain = useCallback(
        (stem: keyof StemState, value: number): void => {
            const gainNode = stemGainsRef.current?.[stem];
            const ctx = audioContextRef.current;

            if (gainNode && ctx) {
                try {
                    gainNode.gain.setTargetAtTime(
                        Math.max(0, Math.min(1, value)),
                        ctx.currentTime,
                        0.05
                    );
                } catch (e) {
                    console.error(`[StemControl] Failed to set ${stem} gain:`, e);
                }
            }
        },
        [audioContextRef, stemGainsRef]
    );

    return {
        toggleStem,
        setStemGain,
    };
}
