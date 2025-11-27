"use client";

import { useState, useEffect, useMemo } from "react";

export interface DeviceInfo {
    // Platform detection
    isAndroid: boolean;
    isIOS: boolean;
    isMobile: boolean;

    // Android-specific
    androidVersion: number | null;
    isLowEndDevice: boolean;

    // Capabilities
    supportsVibration: boolean;
    supportsBluetooth: boolean;
    supportsMediaSession: boolean;

    // Performance hints
    deviceMemory: number | null; // in GB
    hardwareConcurrency: number | null; // CPU cores
    connectionType: string | null;
    isSlowConnection: boolean;
}

/**
 * Hook to detect device type, platform, and capabilities
 * Used for platform-specific optimizations (especially Android)
 */
export function useDeviceInfo(): DeviceInfo {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
        isAndroid: false,
        isIOS: false,
        isMobile: false,
        androidVersion: null,
        isLowEndDevice: false,
        supportsVibration: false,
        supportsBluetooth: false,
        supportsMediaSession: false,
        deviceMemory: null,
        hardwareConcurrency: null,
        connectionType: null,
        isSlowConnection: false,
    });

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();

        // Platform detection
        const isAndroid = /android/i.test(ua);
        const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const isMobile = isAndroid || isIOS || /mobile/i.test(ua) || window.innerWidth < 768;

        // Android version detection
        let androidVersion: number | null = null;
        if (isAndroid) {
            const match = ua.match(/android\s*(\d+\.?\d*)/i);
            if (match) {
                androidVersion = parseFloat(match[1]);
            }
        }

        // Device capabilities
        const supportsVibration = "vibrate" in navigator;
        const supportsBluetooth = "bluetooth" in navigator;
        const supportsMediaSession = "mediaSession" in navigator;

        // Performance detection
        const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || null;
        const hardwareConcurrency = navigator.hardwareConcurrency || null;

        // Connection type detection
        const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
        const connectionType = connection?.effectiveType || null;
        const isSlowConnection = connection?.saveData ||
            connectionType === "slow-2g" ||
            connectionType === "2g" ||
            connectionType === "3g";

        // Low-end device detection
        // Consider a device "low-end" if:
        // - Android with version < 10
        // - Less than 4GB RAM
        // - Less than 4 CPU cores
        // - Slow connection
        const isLowEndDevice = (
            (isAndroid && androidVersion !== null && androidVersion < 10) ||
            (deviceMemory !== null && deviceMemory < 4) ||
            (hardwareConcurrency !== null && hardwareConcurrency < 4) ||
            isSlowConnection
        );

        setDeviceInfo({
            isAndroid,
            isIOS,
            isMobile,
            androidVersion,
            isLowEndDevice,
            supportsVibration,
            supportsBluetooth,
            supportsMediaSession,
            deviceMemory,
            hardwareConcurrency,
            connectionType,
            isSlowConnection,
        });

        // Listen for connection changes
        if (connection) {
            const handleConnectionChange = () => {
                const newConnectionType = connection.effectiveType || null;
                const newIsSlowConnection = connection.saveData ||
                    newConnectionType === "slow-2g" ||
                    newConnectionType === "2g" ||
                    newConnectionType === "3g";

                setDeviceInfo(prev => ({
                    ...prev,
                    connectionType: newConnectionType,
                    isSlowConnection: newIsSlowConnection,
                }));
            };

            // Use type assertion for network connection events
            const conn = connection as EventTarget;
            conn.addEventListener?.("change", handleConnectionChange);
            return () => {
                conn.removeEventListener?.("change", handleConnectionChange);
            };
        }
    }, []);

    return deviceInfo;
}

/**
 * Simplified hook that just returns if device is Android
 */
export function useIsAndroid(): boolean {
    const { isAndroid } = useDeviceInfo();
    return isAndroid;
}

/**
 * Hook to check if device is low-end (for performance optimizations)
 */
export function useIsLowEndDevice(): boolean {
    const { isLowEndDevice } = useDeviceInfo();
    return isLowEndDevice;
}
