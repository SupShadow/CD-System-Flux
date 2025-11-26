"use client";

import { useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";

export default function GlobalSoundEffects() {
    const { playSound } = useSound();

    useEffect(() => {
        // Add click sound to all buttons and links
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const clickable = target.closest("button, a, [role='button'], .cursor-pointer");
            if (clickable) {
                playSound("click");
            }
        };

        // Add hover sound to interactive elements (throttled)
        let lastHoverTime = 0;
        const handleMouseOver = (e: MouseEvent) => {
            const now = Date.now();
            if (now - lastHoverTime < 100) return; // Throttle to prevent spam

            const target = e.target as HTMLElement;
            const hoverable = target.closest("button, a, [role='button'], .cursor-pointer, input, .hover\\:border-signal");
            if (hoverable) {
                lastHoverTime = now;
                playSound("hover");
            }
        };

        document.addEventListener("click", handleClick);
        document.addEventListener("mouseover", handleMouseOver);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("mouseover", handleMouseOver);
        };
    }, [playSound]);

    return null;
}
