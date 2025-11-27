"use client";

import { useRef, useState, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    tiltAmount?: number; // Max tilt in degrees
    glareEnabled?: boolean;
    scale?: number; // Scale on hover
}

export default function TiltCard({
    children,
    className = "",
    tiltAmount = 15,
    glareEnabled = true,
    scale = 1.02,
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const { prefersReducedMotion, safeMode } = useAccessibility();

    // Disable 3D effects if user prefers reduced motion
    const disableEffects = prefersReducedMotion || safeMode;

    // Motion values for smooth animation
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    // Spring config for smooth, natural movement
    const springConfig = { damping: 20, stiffness: 300 };
    const rotateX = useSpring(useTransform(mouseY, [0, 1], [tiltAmount, -tiltAmount]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-tiltAmount, tiltAmount]), springConfig);

    // Glare position
    const glareX = useTransform(mouseX, [0, 1], [0, 100]);
    const glareY = useTransform(mouseY, [0, 1], [0, 100]);

    // Glare background gradient - MUST be called at top level, not in JSX
    const glareBackground = useTransform(
        [glareX, glareY],
        ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255, 69, 0, 0.8), transparent 50%)`
    );

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        mouseX.set(x);
        mouseY.set(y);
    }, [mouseX, mouseY]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        // Reset to center
        mouseX.set(0.5);
        mouseY.set(0.5);
    }, [mouseX, mouseY]);

    // If motion is disabled, render a simple container without effects
    if (disableEffects) {
        return (
            <div ref={cardRef} className={`relative ${className}`}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            ref={cardRef}
            className={`relative ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000,
            }}
            animate={{
                scale: isHovered ? scale : 1,
            }}
            transition={{
                scale: { duration: 0.2 },
            }}
        >
            {/* Card content */}
            <div style={{ transform: "translateZ(0)" }}>
                {children}
            </div>

            {/* Glare overlay */}
            {glareEnabled && (
                <motion.div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    style={{
                        opacity: isHovered ? 0.15 : 0,
                        background: glareBackground,
                    }}
                    transition={{ opacity: { duration: 0.2 } }}
                />
            )}

            {/* Highlight border on hover */}
            <motion.div
                className="absolute inset-0 pointer-events-none border border-signal/0"
                animate={{
                    borderColor: isHovered ? "rgba(255, 69, 0, 0.5)" : "rgba(255, 69, 0, 0)",
                }}
                transition={{ duration: 0.2 }}
            />

            {/* 3D shadow */}
            <motion.div
                className="absolute inset-0 -z-10"
                style={{
                    transform: "translateZ(-50px)",
                    background: "rgba(255, 69, 0, 0.1)",
                    filter: "blur(20px)",
                }}
                animate={{
                    opacity: isHovered ? 0.5 : 0,
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.div>
    );
}
