"use client";

import { useRef, useCallback, useEffect } from "react";

/**
 * Hook for managing a single timeout with automatic cleanup
 * Useful for debouncing or delayed state changes
 */
export function useSafeTimeout(): {
    set: (callback: () => void, delay: number) => void;
    clear: () => void;
} {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clear = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const set = useCallback(
        (callback: () => void, delay: number) => {
            clear();
            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null;
                callback();
            }, delay);
        },
        [clear]
    );

    // Cleanup on unmount
    useEffect(() => {
        return clear;
    }, [clear]);

    return { set, clear };
}

/**
 * Hook for managing multiple dynamic timeouts with automatic cleanup
 * Useful for components that create many timeouts (like TransmitButton)
 */
export function useTimeoutManager(): {
    schedule: (callback: () => void, delay: number) => NodeJS.Timeout;
    clear: (id: NodeJS.Timeout) => void;
    clearAll: () => void;
} {
    const timeoutIdsRef = useRef<Set<NodeJS.Timeout>>(new Set());

    const clear = useCallback((id: NodeJS.Timeout) => {
        clearTimeout(id);
        timeoutIdsRef.current.delete(id);
    }, []);

    const clearAll = useCallback(() => {
        timeoutIdsRef.current.forEach((id) => clearTimeout(id));
        timeoutIdsRef.current.clear();
    }, []);

    const schedule = useCallback(
        (callback: () => void, delay: number): NodeJS.Timeout => {
            const id = setTimeout(() => {
                timeoutIdsRef.current.delete(id);
                callback();
            }, delay);
            timeoutIdsRef.current.add(id);
            return id;
        },
        []
    );

    // Cleanup all on unmount
    useEffect(() => {
        return clearAll;
    }, [clearAll]);

    return { schedule, clear, clearAll };
}

/**
 * Hook to track component mounted state
 * Useful for preventing state updates after unmount in async operations
 */
export function useMountedRef(): React.RefObject<boolean> {
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return mountedRef;
}

/**
 * Hook for intervals that need to trigger short timeouts
 * Solves the common pattern of setTimeout inside setInterval
 */
export function useIntervalWithTimeout(
    intervalCallback: (triggerTimeout: (callback: () => void, delay: number) => void) => void,
    intervalMs: number,
    isActive: boolean = true
): void {
    const callbackRef = useRef(intervalCallback);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        callbackRef.current = intervalCallback;
    }, [intervalCallback]);

    useEffect(() => {
        if (!isActive || intervalMs <= 0) return;

        const triggerTimeout = (callback: () => void, delay: number) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null;
                callback();
            }, delay);
        };

        const intervalId = setInterval(() => {
            callbackRef.current(triggerTimeout);
        }, intervalMs);

        return () => {
            clearInterval(intervalId);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [intervalMs, isActive]);
}
