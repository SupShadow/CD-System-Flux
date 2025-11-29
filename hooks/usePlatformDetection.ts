"use client";

import { useRef, useMemo } from "react";

export interface PlatformInfo {
    isAndroid: boolean;
    isIOS: boolean;
    androidVersion: number | null;
    isMobile: boolean;
    isTablet: boolean;
    isSafari: boolean;
    isChrome: boolean;
    isFirefox: boolean;
}

/**
 * Detects the current platform and browser information.
 * Results are memoized and cached for the lifetime of the component.
 */
export function getPlatformInfo(): PlatformInfo {
    if (typeof window === "undefined") {
        return {
            isAndroid: false,
            isIOS: false,
            androidVersion: null,
            isMobile: false,
            isTablet: false,
            isSafari: false,
            isChrome: false,
            isFirefox: false,
        };
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    let androidVersion: number | null = null;
    if (isAndroid) {
        const match = ua.match(/android\s*(\d+\.?\d*)/i);
        if (match) {
            androidVersion = parseFloat(match[1]);
        }
    }

    const isMobile = isAndroid || isIOS || /mobile/i.test(ua);
    const isTablet = /ipad|tablet/i.test(ua) ||
        (isAndroid && !/mobile/i.test(ua));
    const isSafari = /safari/i.test(ua) && !/chrome|chromium|crios/i.test(ua);
    const isChrome = /chrome|chromium|crios/i.test(ua);
    const isFirefox = /firefox|fxios/i.test(ua);

    return {
        isAndroid,
        isIOS,
        androidVersion,
        isMobile,
        isTablet,
        isSafari,
        isChrome,
        isFirefox,
    };
}

/**
 * Hook that provides platform detection information.
 * The result is cached and won't change during the component's lifetime.
 */
export function usePlatformDetection(): PlatformInfo {
    const platformInfoRef = useRef<PlatformInfo | null>(null);

    return useMemo(() => {
        if (!platformInfoRef.current) {
            platformInfoRef.current = getPlatformInfo();
        }
        return platformInfoRef.current;
    }, []);
}

/**
 * Checks if the Web Audio API is supported in the current browser.
 */
export function isWebAudioSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
}

/**
 * Gets the AudioContext constructor for the current browser.
 */
export function getAudioContextClass(): typeof AudioContext | null {
    if (typeof window === "undefined") return null;
    return window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext || null;
}
