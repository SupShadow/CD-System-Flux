"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDeviceInfo } from "./useDeviceInfo";

export interface AndroidBackButtonOptions {
    /**
     * Called when the back button is pressed
     * Return true to prevent default behavior (leaving the app)
     */
    onBackPress?: () => boolean;

    /**
     * Whether the handler is currently active
     */
    enabled?: boolean;
}

/**
 * Hook to handle Android hardware back button in PWA
 * Uses the History API to intercept back navigation
 */
export function useAndroidBackButton(options: AndroidBackButtonOptions = {}) {
    const { onBackPress, enabled = true } = options;
    const { isAndroid, isMobile } = useDeviceInfo();
    const isActiveRef = useRef(false);

    const handleBackPress = useCallback(() => {
        if (onBackPress) {
            const handled = onBackPress();
            if (handled) {
                // Push a new state to allow back button to work again
                window.history.pushState({ androidBackHandler: true }, "");
                return true;
            }
        }
        return false;
    }, [onBackPress]);

    useEffect(() => {
        // Only activate on Android PWA or mobile devices
        if (!enabled || !isMobile) return;

        // Check if running as PWA (standalone mode)
        const isPWA = window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
            document.referrer.includes("android-app://");

        // Also handle non-PWA mobile browsers for better UX
        const shouldHandle = isPWA || isAndroid;

        if (!shouldHandle) return;

        // Push initial state to create history entry
        if (!isActiveRef.current) {
            window.history.pushState({ androidBackHandler: true }, "");
            isActiveRef.current = true;
        }

        const handlePopState = (event: PopStateEvent) => {
            // Check if this is our custom state
            const handled = handleBackPress();

            if (!handled) {
                // If not handled, allow normal navigation
                // But we've already gone back, so nothing to do
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
            isActiveRef.current = false;
        };
    }, [enabled, isMobile, isAndroid, handleBackPress]);
}

/**
 * Simple hook to prevent accidental back navigation in PWA
 * Shows a confirmation before leaving
 */
export function usePreventAccidentalBack(enabled: boolean = true) {
    const lastBackPressRef = useRef<number>(0);

    const handleBackPress = useCallback(() => {
        const now = Date.now();
        const timeSinceLastPress = now - lastBackPressRef.current;

        // If pressed twice within 2 seconds, allow exit
        if (timeSinceLastPress < 2000) {
            return false; // Don't prevent, allow exit
        }

        lastBackPressRef.current = now;
        // Could show a toast here: "Press back again to exit"
        return true; // Prevent exit
    }, []);

    useAndroidBackButton({
        onBackPress: handleBackPress,
        enabled,
    });
}
