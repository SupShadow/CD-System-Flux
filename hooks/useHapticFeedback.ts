"use client";

import { useCallback, useMemo } from "react";
import { useDeviceInfo } from "./useDeviceInfo";

export type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

// Vibration patterns in milliseconds [vibrate, pause, vibrate, ...]
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
    light: 10,           // Quick tap
    medium: 25,          // Standard feedback
    heavy: 50,           // Strong feedback
    success: [10, 50, 10, 50, 30],  // Double tap + long
    warning: [30, 50, 30],          // Two medium taps
    error: [50, 100, 50, 100, 50],  // Three strong taps
    selection: 5,        // Very light tap for selections
};

export interface HapticFeedback {
    /**
     * Trigger haptic feedback with a specific pattern
     */
    trigger: (pattern?: HapticPattern) => void;

    /**
     * Trigger custom vibration pattern (Android only)
     * @param pattern - Array of [vibrate, pause, vibrate, ...] in ms
     */
    triggerCustom: (pattern: number | number[]) => void;

    /**
     * Whether haptic feedback is supported
     */
    isSupported: boolean;

    /**
     * Whether haptic feedback is enabled (respects user preferences)
     */
    isEnabled: boolean;

    /**
     * Pre-defined haptic methods for common interactions
     */
    tap: () => void;
    doubleTap: () => void;
    longPress: () => void;
    success: () => void;
    warning: () => void;
    error: () => void;
}

/**
 * Hook to provide haptic feedback on Android devices
 * Uses the Vibration API for tactile feedback on interactions
 */
export function useHapticFeedback(): HapticFeedback {
    const { supportsVibration, isAndroid, isMobile } = useDeviceInfo();

    // Only enable haptics on mobile devices that support vibration
    const isSupported = supportsVibration && isMobile;
    const isEnabled = isSupported;

    const trigger = useCallback((pattern: HapticPattern = "medium") => {
        if (!isEnabled) return;

        try {
            const vibrationPattern = HAPTIC_PATTERNS[pattern];
            navigator.vibrate(vibrationPattern);
        } catch (e) {
            console.warn("[HapticFeedback] Vibration failed:", e);
        }
    }, [isEnabled]);

    const triggerCustom = useCallback((pattern: number | number[]) => {
        if (!isEnabled) return;

        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn("[HapticFeedback] Custom vibration failed:", e);
        }
    }, [isEnabled]);

    // Pre-defined haptic methods
    const tap = useCallback(() => trigger("light"), [trigger]);
    const doubleTap = useCallback(() => trigger("medium"), [trigger]);
    const longPress = useCallback(() => trigger("heavy"), [trigger]);
    const success = useCallback(() => trigger("success"), [trigger]);
    const warning = useCallback(() => trigger("warning"), [trigger]);
    const error = useCallback(() => trigger("error"), [trigger]);

    return useMemo(() => ({
        trigger,
        triggerCustom,
        isSupported,
        isEnabled,
        tap,
        doubleTap,
        longPress,
        success,
        warning,
        error,
    }), [trigger, triggerCustom, isSupported, isEnabled, tap, doubleTap, longPress, success, warning, error]);
}
