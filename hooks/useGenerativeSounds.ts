"use client";

import { useCallback, useRef, useEffect } from "react";

interface SoundConfig {
    frequency: number;
    duration: number;
    type: OscillatorType;
    volume: number;
    attack: number;
    decay: number;
    detune?: number;
}

const SOUND_PRESETS: Record<string, SoundConfig> = {
    // UI Interactions
    hover: {
        frequency: 800,
        duration: 0.05,
        type: "sine",
        volume: 0.03,
        attack: 0.01,
        decay: 0.04,
    },
    click: {
        frequency: 1200,
        duration: 0.08,
        type: "square",
        volume: 0.05,
        attack: 0.005,
        decay: 0.07,
    },
    success: {
        frequency: 880,
        duration: 0.2,
        type: "sine",
        volume: 0.08,
        attack: 0.02,
        decay: 0.15,
        detune: 0,
    },
    error: {
        frequency: 220,
        duration: 0.3,
        type: "sawtooth",
        volume: 0.06,
        attack: 0.01,
        decay: 0.25,
    },
    achievement: {
        frequency: 660,
        duration: 0.4,
        type: "sine",
        volume: 0.1,
        attack: 0.02,
        decay: 0.35,
    },
    secret: {
        frequency: 440,
        duration: 0.5,
        type: "triangle",
        volume: 0.08,
        attack: 0.05,
        decay: 0.4,
    },

    // Navigation
    navigate: {
        frequency: 600,
        duration: 0.1,
        type: "sine",
        volume: 0.04,
        attack: 0.01,
        decay: 0.08,
    },
    back: {
        frequency: 400,
        duration: 0.1,
        type: "sine",
        volume: 0.04,
        attack: 0.01,
        decay: 0.08,
    },

    // Player controls
    play: {
        frequency: 700,
        duration: 0.12,
        type: "triangle",
        volume: 0.06,
        attack: 0.01,
        decay: 0.1,
    },
    pause: {
        frequency: 500,
        duration: 0.12,
        type: "triangle",
        volume: 0.06,
        attack: 0.01,
        decay: 0.1,
    },
    next: {
        frequency: 900,
        duration: 0.08,
        type: "sine",
        volume: 0.05,
        attack: 0.01,
        decay: 0.06,
    },
    prev: {
        frequency: 600,
        duration: 0.08,
        type: "sine",
        volume: 0.05,
        attack: 0.01,
        decay: 0.06,
    },

    // Infection/Experience
    infect: {
        frequency: 150,
        duration: 0.3,
        type: "sawtooth",
        volume: 0.04,
        attack: 0.1,
        decay: 0.2,
    },
    levelUp: {
        frequency: 440,
        duration: 0.6,
        type: "sine",
        volume: 0.1,
        attack: 0.05,
        decay: 0.5,
    },

    // Zone navigation
    zoneEnter: {
        frequency: 330,
        duration: 0.4,
        type: "sine",
        volume: 0.07,
        attack: 0.1,
        decay: 0.3,
    },

    // Terminal
    terminalKey: {
        frequency: 1000,
        duration: 0.03,
        type: "square",
        volume: 0.02,
        attack: 0.005,
        decay: 0.02,
    },
    terminalEnter: {
        frequency: 800,
        duration: 0.1,
        type: "sine",
        volume: 0.04,
        attack: 0.01,
        decay: 0.08,
    },
};

export function useGenerativeSounds() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const enabledRef = useRef(true);

    // Initialize audio context on first interaction
    const initContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Play a synthesized sound
    const playSound = useCallback((presetOrConfig: string | SoundConfig) => {
        if (!enabledRef.current) return;

        try {
            const ctx = initContext();
            if (ctx.state === "suspended") {
                ctx.resume();
            }

            const config = typeof presetOrConfig === "string"
                ? SOUND_PRESETS[presetOrConfig]
                : presetOrConfig;

            if (!config) return;

            const now = ctx.currentTime;

            // Create oscillator
            const oscillator = ctx.createOscillator();
            oscillator.type = config.type;
            oscillator.frequency.setValueAtTime(config.frequency, now);

            if (config.detune !== undefined) {
                oscillator.detune.setValueAtTime(config.detune, now);
            }

            // Create gain for envelope
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0, now);

            // Attack
            gainNode.gain.linearRampToValueAtTime(config.volume, now + config.attack);

            // Decay
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

            // Connect and play
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(now);
            oscillator.stop(now + config.duration + 0.1);

            // Cleanup
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch (error) {
            // Silently fail - audio is not critical
            console.debug("[GenerativeSounds] Failed to play:", error);
        }
    }, [initContext]);

    // Play a chord (multiple frequencies)
    const playChord = useCallback((frequencies: number[], config: Partial<SoundConfig> = {}) => {
        if (!enabledRef.current) return;

        try {
            const ctx = initContext();
            if (ctx.state === "suspended") {
                ctx.resume();
            }

            const now = ctx.currentTime;
            const baseConfig: SoundConfig = {
                frequency: 440,
                duration: 0.3,
                type: "sine",
                volume: 0.05,
                attack: 0.02,
                decay: 0.25,
                ...config,
            };

            frequencies.forEach((freq, i) => {
                const oscillator = ctx.createOscillator();
                oscillator.type = baseConfig.type;
                oscillator.frequency.setValueAtTime(freq, now);

                const gainNode = ctx.createGain();
                const individualVolume = baseConfig.volume / frequencies.length;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(individualVolume, now + baseConfig.attack);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + baseConfig.duration);

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                // Slight delay for arpeggio effect
                const startTime = now + i * 0.03;
                oscillator.start(startTime);
                oscillator.stop(startTime + baseConfig.duration);

                oscillator.onended = () => {
                    oscillator.disconnect();
                    gainNode.disconnect();
                };
            });
        } catch (error) {
            console.debug("[GenerativeSounds] Failed to play chord:", error);
        }
    }, [initContext]);

    // Achievement fanfare
    const playAchievementFanfare = useCallback(() => {
        // C major arpeggio: C5, E5, G5, C6
        playChord([523, 659, 784, 1047], {
            duration: 0.5,
            volume: 0.08,
            type: "sine",
        });
    }, [playChord]);

    // Secret unlock sound
    const playSecretUnlock = useCallback(() => {
        // Mysterious descending pattern
        const ctx = initContext();
        if (!ctx) return;

        const frequencies = [880, 660, 440, 330];
        frequencies.forEach((freq, i) => {
            setTimeout(() => playSound({
                frequency: freq,
                duration: 0.15,
                type: "triangle",
                volume: 0.06,
                attack: 0.02,
                decay: 0.12,
            }), i * 100);
        });
    }, [initContext, playSound]);

    // Infection pulse
    const playInfectionPulse = useCallback((intensity: number) => {
        const baseFreq = 80 + intensity * 1.5; // 80-230 Hz based on infection level
        playSound({
            frequency: baseFreq,
            duration: 0.4,
            type: "sawtooth",
            volume: 0.03 + (intensity / 100) * 0.03,
            attack: 0.1,
            decay: 0.3,
        });
    }, [playSound]);

    // Level up sequence
    const playLevelUp = useCallback((level: number) => {
        const baseFreq = 220 * Math.pow(2, level / 12); // Rise with each level
        const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

        frequencies.forEach((freq, i) => {
            setTimeout(() => playSound({
                frequency: freq,
                duration: 0.2,
                type: "sine",
                volume: 0.07,
                attack: 0.02,
                decay: 0.15,
            }), i * 80);
        });
    }, [playSound]);

    // Enable/disable sounds
    const setEnabled = useCallback((enabled: boolean) => {
        enabledRef.current = enabled;
    }, []);

    return {
        playSound,
        playChord,
        playAchievementFanfare,
        playSecretUnlock,
        playInfectionPulse,
        playLevelUp,
        setEnabled,
        presets: Object.keys(SOUND_PRESETS),
    };
}

// Type for window with webkit audio context
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}
