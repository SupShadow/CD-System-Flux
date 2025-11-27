"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDeviceInfo } from "./useDeviceInfo";

// Battery Manager type for the Battery Status API
interface BatteryManager {
    level: number;
    charging: boolean;
}

export interface PerformanceSettings {
    // Animation settings
    particleCount: number;
    nodeCount: number;
    connectionCount: number;
    enableGlow: boolean;
    enableBoxShadow: boolean;
    enableBlur: boolean;
    animationDuration: number; // multiplier (1 = normal, 1.5 = 50% slower)

    // Canvas settings
    canvasScale: number; // 1 = full resolution, 0.5 = half resolution
    targetFPS: number;

    // Feature toggles
    enableParallax: boolean;
    enableSmoothScroll: boolean;
    enableComplexAnimations: boolean;

    // Memory settings
    maxCachedImages: number;
    enableLazyLoading: boolean;
}

// Performance presets
const PRESETS: Record<"high" | "medium" | "low" | "ultra-low", PerformanceSettings> = {
    high: {
        particleCount: 12,
        nodeCount: 24,
        connectionCount: 15,
        enableGlow: true,
        enableBoxShadow: true,
        enableBlur: true,
        animationDuration: 1,
        canvasScale: 1,
        targetFPS: 60,
        enableParallax: true,
        enableSmoothScroll: true,
        enableComplexAnimations: true,
        maxCachedImages: 50,
        enableLazyLoading: true,
    },
    medium: {
        particleCount: 6,
        nodeCount: 12,
        connectionCount: 8,
        enableGlow: true,
        enableBoxShadow: false,
        enableBlur: false,
        animationDuration: 1.2,
        canvasScale: 0.75,
        targetFPS: 30,
        enableParallax: true,
        enableSmoothScroll: true,
        enableComplexAnimations: false,
        maxCachedImages: 30,
        enableLazyLoading: true,
    },
    low: {
        particleCount: 2,
        nodeCount: 8,
        connectionCount: 4,
        enableGlow: false,
        enableBoxShadow: false,
        enableBlur: false,
        animationDuration: 1.5,
        canvasScale: 0.5,
        targetFPS: 24,
        enableParallax: false,
        enableSmoothScroll: false,
        enableComplexAnimations: false,
        maxCachedImages: 15,
        enableLazyLoading: true,
    },
    "ultra-low": {
        particleCount: 0,
        nodeCount: 4,
        connectionCount: 2,
        enableGlow: false,
        enableBoxShadow: false,
        enableBlur: false,
        animationDuration: 2,
        canvasScale: 0.25,
        targetFPS: 15,
        enableParallax: false,
        enableSmoothScroll: false,
        enableComplexAnimations: false,
        maxCachedImages: 5,
        enableLazyLoading: true,
    },
};

export type PerformanceLevel = keyof typeof PRESETS;

export interface PerformanceOptimizations extends PerformanceSettings {
    level: PerformanceLevel;
    isBatteryLow: boolean;
    isDataSaver: boolean;
}

/**
 * Hook to provide performance optimizations based on device capabilities
 * Automatically adjusts visual settings for low-end Android devices
 */
export function usePerformanceOptimizations(): PerformanceOptimizations {
    const deviceInfo = useDeviceInfo();
    const [isBatteryLow, setIsBatteryLow] = useState(false);
    const [isDataSaver, setIsDataSaver] = useState(false);

    // Detect battery status (if available)
    useEffect(() => {
        let cleanupFn: (() => void) | undefined;

        const checkBattery = async () => {
            try {
                const getBattery = (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery;
                if (!getBattery) return;

                const battery = await getBattery.call(navigator);
                if (battery) {
                    const updateBatteryStatus = () => {
                        // Consider battery low if < 20% and not charging
                        setIsBatteryLow(battery.level < 0.2 && !battery.charging);
                    };

                    updateBatteryStatus();

                    // Use type assertion for battery events (BatteryManager extends EventTarget in browsers)
                    const batteryTarget = battery as unknown as EventTarget;
                    batteryTarget.addEventListener("levelchange", updateBatteryStatus);
                    batteryTarget.addEventListener("chargingchange", updateBatteryStatus);

                    cleanupFn = () => {
                        batteryTarget.removeEventListener("levelchange", updateBatteryStatus);
                        batteryTarget.removeEventListener("chargingchange", updateBatteryStatus);
                    };
                }
            } catch {
                // Battery API not available
            }
        };

        checkBattery();

        return () => {
            cleanupFn?.();
        };
    }, []);

    // Detect data saver mode
    useEffect(() => {
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (connection) {
            setIsDataSaver(connection.saveData || false);
        }
    }, []);

    // Determine performance level based on device info
    const level = useMemo<PerformanceLevel>(() => {
        const { isLowEndDevice, deviceMemory, hardwareConcurrency, isSlowConnection, isAndroid, androidVersion } = deviceInfo;

        // Ultra-low for very weak devices
        if (
            (deviceMemory !== null && deviceMemory < 2) ||
            (hardwareConcurrency !== null && hardwareConcurrency < 2) ||
            (isAndroid && androidVersion !== null && androidVersion < 8)
        ) {
            return "ultra-low";
        }

        // Low for weak devices or battery saving
        if (isLowEndDevice || isBatteryLow || isDataSaver) {
            return "low";
        }

        // Medium for mobile devices with slow connection
        if (deviceInfo.isMobile || isSlowConnection) {
            return "medium";
        }

        // High for capable devices
        return "high";
    }, [deviceInfo, isBatteryLow, isDataSaver]);

    const settings = PRESETS[level];

    return {
        ...settings,
        level,
        isBatteryLow,
        isDataSaver,
    };
}

/**
 * Hook to get a specific performance setting with proper memoization
 */
export function usePerformanceSetting<K extends keyof PerformanceSettings>(
    key: K
): PerformanceSettings[K] {
    const optimizations = usePerformanceOptimizations();
    return optimizations[key];
}
