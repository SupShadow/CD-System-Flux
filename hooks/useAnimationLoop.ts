import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for running animation loops with requestAnimationFrame
 * Properly cleans up on unmount and pauses when not active
 *
 * @param callback - Function to call on each animation frame
 * @param isActive - Whether the animation should be running
 */
export function useAnimationLoop(
    callback: (deltaTime: number) => void,
    isActive: boolean = true
): void {
    const frameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const callbackRef = useRef(callback);

    // Keep callback ref updated to avoid stale closures
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!isActive) return;

        const animate = (currentTime: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = currentTime;
            }

            const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
            lastTimeRef.current = currentTime;

            callbackRef.current(deltaTime);

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameRef.current);
            lastTimeRef.current = 0;
        };
    }, [isActive]);
}

/**
 * Custom hook for running interval-based animations
 * More performant than setInterval for simple state updates
 *
 * @param callback - Function to call on each interval
 * @param interval - Interval in milliseconds
 * @param isActive - Whether the animation should be running
 */
export function useInterval(
    callback: () => void,
    interval: number,
    isActive: boolean = true
): void {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!isActive || interval <= 0) return;

        const id = setInterval(() => {
            callbackRef.current();
        }, interval);

        return () => clearInterval(id);
    }, [interval, isActive]);
}

/**
 * Custom hook for throttled callbacks
 * Useful for expensive operations that shouldn't run on every frame
 *
 * @param callback - Function to throttle
 * @param delay - Minimum time between calls in milliseconds
 * @returns Throttled callback function
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number
): T {
    const lastCallRef = useRef<number>(0);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastCallRef.current >= delay) {
                lastCallRef.current = now;
                callbackRef.current(...args);
            }
        },
        [delay]
    ) as T;
}
