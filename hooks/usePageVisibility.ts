"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the page/tab is currently visible
 * Returns false when user switches to another tab - saves CPU/battery
 */
export function usePageVisibility(): boolean {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        // Set initial state
        setIsVisible(!document.hidden);

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return isVisible;
}
