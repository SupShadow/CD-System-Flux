"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorTrail() {
    const [mounted, setMounted] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const isMovingRef = useRef(false);

    // Smooth spring animation for cursor
    const springX = useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.5 });
    const springY = useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.5 });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Store MotionValues in refs to avoid dependency array issues
    const mouseXRef = useRef(mouseX);
    const mouseYRef = useRef(mouseY);

    useEffect(() => {
        if (!mounted) return;

        let timeoutId: NodeJS.Timeout;

        const handleMouseMove = (e: MouseEvent) => {
            mouseXRef.current.set(e.clientX - 10);
            mouseYRef.current.set(e.clientY - 10);
            isMovingRef.current = true;

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                isMovingRef.current = false;
            }, 100);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(timeoutId);
        };
    }, [mounted]); // Removed MotionValues from dependencies - they are stable refs

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[55]">
            {/* Main cursor glow - uses track color and beat reactivity via CSS vars */}
            <motion.div
                className="absolute rounded-full beat-pulse"
                style={{
                    width: "calc(20px + var(--beat-glow) * 0.5px)",
                    height: "calc(20px + var(--beat-glow) * 0.5px)",
                    x: springX,
                    y: springY,
                    background: "radial-gradient(circle, rgba(var(--track-color-rgb), 0.4) 0%, transparent 70%)",
                    boxShadow: "0 0 calc(20px + var(--beat-glow) * 1px) rgba(var(--track-color-rgb), 0.3), 0 0 calc(40px + var(--beat-glow) * 2px) rgba(var(--track-color-rgb), 0.1)",
                    transition: "width 0.05s, height 0.05s, box-shadow 0.05s",
                }}
            />
        </div>
    );
}
