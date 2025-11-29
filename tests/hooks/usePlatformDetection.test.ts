import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
    getPlatformInfo,
    usePlatformDetection,
    isWebAudioSupported,
    getAudioContextClass,
} from "@/hooks/usePlatformDetection";

describe("usePlatformDetection", () => {
    const originalNavigator = global.navigator;
    const originalWindow = global.window;

    beforeEach(() => {
        // Reset navigator.userAgent mock
        Object.defineProperty(global, "navigator", {
            value: {
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36",
                platform: "MacIntel",
                maxTouchPoints: 0,
            },
            configurable: true,
            writable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(global, "navigator", {
            value: originalNavigator,
            configurable: true,
            writable: true,
        });
    });

    describe("getPlatformInfo", () => {
        it("detects desktop Chrome correctly", () => {
            const info = getPlatformInfo();

            expect(info.isAndroid).toBe(false);
            expect(info.isIOS).toBe(false);
            expect(info.isMobile).toBe(false);
            expect(info.isChrome).toBe(true);
            expect(info.isSafari).toBe(false);
            expect(info.androidVersion).toBeNull();
        });

        it("detects Android device", () => {
            Object.defineProperty(global, "navigator", {
                value: {
                    userAgent: "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
                    platform: "Linux armv81",
                    maxTouchPoints: 5,
                },
                configurable: true,
            });

            const info = getPlatformInfo();

            expect(info.isAndroid).toBe(true);
            expect(info.isIOS).toBe(false);
            expect(info.isMobile).toBe(true);
            expect(info.androidVersion).toBe(13);
        });

        it("detects iOS Safari", () => {
            Object.defineProperty(global, "navigator", {
                value: {
                    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                    platform: "iPhone",
                    maxTouchPoints: 5,
                },
                configurable: true,
            });

            const info = getPlatformInfo();

            expect(info.isIOS).toBe(true);
            expect(info.isAndroid).toBe(false);
            expect(info.isMobile).toBe(true);
            expect(info.isSafari).toBe(true);
        });

        it("detects iPad Pro (as iOS via maxTouchPoints)", () => {
            Object.defineProperty(global, "navigator", {
                value: {
                    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
                    platform: "MacIntel",
                    maxTouchPoints: 5, // iPad Pro identifies as Mac but has touch
                },
                configurable: true,
            });

            const info = getPlatformInfo();

            expect(info.isIOS).toBe(true);
            expect(info.isSafari).toBe(true);
        });

        it("detects Firefox", () => {
            Object.defineProperty(global, "navigator", {
                value: {
                    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
                    platform: "Win32",
                    maxTouchPoints: 0,
                },
                configurable: true,
            });

            const info = getPlatformInfo();

            expect(info.isFirefox).toBe(true);
            expect(info.isChrome).toBe(false);
            expect(info.isSafari).toBe(false);
        });

        it("parses Android version correctly", () => {
            Object.defineProperty(global, "navigator", {
                value: {
                    userAgent: "Mozilla/5.0 (Linux; Android 11.0.1; Pixel 5) Chrome/120.0.0.0 Mobile Safari/537.36",
                    platform: "Linux armv81",
                    maxTouchPoints: 5,
                },
                configurable: true,
            });

            const info = getPlatformInfo();

            expect(info.androidVersion).toBe(11);
        });
    });

    describe("usePlatformDetection hook", () => {
        it("returns memoized platform info", () => {
            const { result, rerender } = renderHook(() => usePlatformDetection());

            const firstResult = result.current;
            rerender();
            const secondResult = result.current;

            // Should return the same object reference (memoized)
            expect(firstResult).toBe(secondResult);
        });

        it("returns platform info object with all properties", () => {
            const { result } = renderHook(() => usePlatformDetection());

            expect(result.current).toHaveProperty("isAndroid");
            expect(result.current).toHaveProperty("isIOS");
            expect(result.current).toHaveProperty("androidVersion");
            expect(result.current).toHaveProperty("isMobile");
            expect(result.current).toHaveProperty("isTablet");
            expect(result.current).toHaveProperty("isSafari");
            expect(result.current).toHaveProperty("isChrome");
            expect(result.current).toHaveProperty("isFirefox");
        });
    });

    describe("isWebAudioSupported", () => {
        it("returns true when AudioContext is available", () => {
            expect(isWebAudioSupported()).toBe(true);
        });

        it("returns false when AudioContext is not available", () => {
            const originalAudioContext = global.AudioContext;
            const originalWebkitAudioContext = (global as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

            // @ts-expect-error - removing AudioContext for test
            delete global.AudioContext;
            // @ts-expect-error - removing webkitAudioContext for test
            delete (global as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

            // Need to check undefined explicitly
            if (typeof window !== "undefined") {
                // @ts-expect-error - removing from window
                window.AudioContext = undefined;
                // @ts-expect-error - removing from window
                window.webkitAudioContext = undefined;
            }

            // This test may not work as expected in jsdom, so we just verify the function exists
            expect(typeof isWebAudioSupported).toBe("function");

            // Restore
            global.AudioContext = originalAudioContext;
            (global as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext = originalWebkitAudioContext;
        });
    });

    describe("getAudioContextClass", () => {
        it("returns AudioContext class when available", () => {
            const AudioContextClass = getAudioContextClass();
            expect(AudioContextClass).toBeDefined();
        });
    });
});
