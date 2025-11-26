"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ScrollPosition {
    scrollY: number;
    scrollX: number;
    scrollProgress: number; // 0-1 progress through page
    direction: "up" | "down" | null;
    velocity: number; // pixels per frame
}

export function useScrollPosition(): ScrollPosition {
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
        scrollY: 0,
        scrollX: 0,
        scrollProgress: 0,
        direction: null,
        velocity: 0,
    });

    const lastScrollY = useRef(0);
    const frameRef = useRef<number | null>(null);

    const updateScrollPosition = useCallback(() => {
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = docHeight > 0 ? scrollY / docHeight : 0;

        const velocity = scrollY - lastScrollY.current;
        const direction = velocity > 0 ? "down" : velocity < 0 ? "up" : null;

        setScrollPosition({
            scrollY,
            scrollX,
            scrollProgress: Math.min(1, Math.max(0, scrollProgress)),
            direction,
            velocity: Math.abs(velocity),
        });

        lastScrollY.current = scrollY;
        frameRef.current = null;
    }, []);

    const handleScroll = useCallback(() => {
        if (frameRef.current === null) {
            frameRef.current = requestAnimationFrame(updateScrollPosition);
        }
    }, [updateScrollPosition]);

    useEffect(() => {
        // Initial position
        updateScrollPosition();

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [handleScroll, updateScrollPosition]);

    return scrollPosition;
}
