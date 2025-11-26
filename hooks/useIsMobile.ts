"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect mobile devices for performance optimization
 * Returns true on mobile devices - used to reduce particle counts and effects
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Check screen width and touch capability
            const isMobileWidth = window.innerWidth < 768;
            const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
            setIsMobile(isMobileWidth || isTouchDevice);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
}
