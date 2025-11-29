"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

interface AccessibilitySettings {
    /** User prefers reduced motion (OS setting) */
    prefersReducedMotion: boolean;
    /** User has enabled safe mode (no flashing/strobing) */
    safeMode: boolean;
    /** Toggle safe mode on/off */
    toggleSafeMode: () => void;
    /** Check if flashing effects should be disabled */
    disableFlashing: boolean;
    /** Check if glitch effects should be disabled or slowed */
    disableGlitch: boolean;
    /** Get safe animation duration (min 0.3s for epilepsy safety) */
    getSafeDuration: (duration: number) => number;
}

const AccessibilityCtx = createContext<AccessibilitySettings | null>(null);

export function useAccessibility(): AccessibilitySettings {
    const context = useContext(AccessibilityCtx);
    if (!context) {
        throw new Error("useAccessibility must be used within an AccessibilityProvider");
    }
    return context;
}

// Safe minimum duration for animations (WCAG 2.3.1 - no more than 3 flashes/sec)
const MIN_SAFE_DURATION = 0.334; // ~3Hz max

export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [safeMode, setSafeMode] = useState(false);

    // Check system preference on mount
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Load safe mode preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("flux-safe-mode");
        if (saved === "true") {
            setSafeMode(true);
        }
    }, []);

    const toggleSafeMode = useCallback(() => {
        setSafeMode(prev => {
            const newValue = !prev;
            localStorage.setItem("flux-safe-mode", String(newValue));
            return newValue;
        });
    }, []);

    // Add/remove safe-mode class on document body for CSS-based animation control
    useEffect(() => {
        if (safeMode) {
            document.body.classList.add("safe-mode");
        } else {
            document.body.classList.remove("safe-mode");
        }
    }, [safeMode]);

    // Disable flashing if either reduced motion or safe mode is enabled
    const disableFlashing = prefersReducedMotion || safeMode;
    const disableGlitch = prefersReducedMotion || safeMode;

    // Get safe animation duration (enforces minimum for epilepsy safety)
    const getSafeDuration = useCallback((duration: number): number => {
        if (disableFlashing) {
            return Math.max(duration, MIN_SAFE_DURATION);
        }
        return duration;
    }, [disableFlashing]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo<AccessibilitySettings>(() => ({
        prefersReducedMotion,
        safeMode,
        toggleSafeMode,
        disableFlashing,
        disableGlitch,
        getSafeDuration,
    }), [prefersReducedMotion, safeMode, toggleSafeMode, disableFlashing, disableGlitch, getSafeDuration]);

    return (
        <AccessibilityCtx.Provider value={value}>
            {children}
        </AccessibilityCtx.Provider>
    );
}
