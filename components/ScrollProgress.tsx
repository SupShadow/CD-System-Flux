"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressProps {
    position?: "top" | "bottom" | "left" | "right";
    color?: string;
    height?: number;
    showPercentage?: boolean;
}

export default function ScrollProgress({
    position = "top",
    color = "var(--color-signal)",
    height = 3,
    showPercentage = false,
}: ScrollProgressProps) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        return scrollYProgress.on("change", (latest) => {
            setPercentage(Math.round(latest * 100));
        });
    }, [scrollYProgress]);

    const isHorizontal = position === "top" || position === "bottom";

    const positionStyles: Record<string, React.CSSProperties> = {
        top: { top: 0, left: 0, right: 0, height, transformOrigin: "0%" },
        bottom: { bottom: 0, left: 0, right: 0, height, transformOrigin: "0%" },
        left: { top: 0, bottom: 0, left: 0, width: height, transformOrigin: "0% 100%" },
        right: { top: 0, bottom: 0, right: 0, width: height, transformOrigin: "0% 100%" },
    };

    return (
        <>
            <motion.div
                className="fixed z-[100] pointer-events-none"
                style={{
                    ...positionStyles[position],
                    backgroundColor: color,
                    scaleX: isHorizontal ? scaleX : 1,
                    scaleY: isHorizontal ? 1 : scaleX,
                    boxShadow: `0 0 10px ${color}`,
                }}
            />
            {showPercentage && (
                <motion.div
                    className="fixed z-[100] font-mono text-xs px-2 py-1 bg-void/80 border border-signal/30 backdrop-blur-sm"
                    style={{
                        top: position === "top" ? height + 8 : "auto",
                        bottom: position === "bottom" ? height + 8 : "auto",
                        right: 16,
                        color,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: percentage > 0 ? 1 : 0 }}
                >
                    {percentage}%
                </motion.div>
            )}
        </>
    );
}

// Scroll indicator arrow that shows user can scroll down
export function ScrollIndicator({ className = "" }: { className?: string }) {
    const [isVisible, setIsVisible] = useState(true);
    const { scrollY } = useScroll();

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setIsVisible(latest < 100);
        });
    }, [scrollY]);

    return (
        <motion.div
            className={`flex flex-col items-center gap-2 ${className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{
                opacity: isVisible ? 1 : 0,
                y: isVisible ? 0 : -10,
            }}
            transition={{ duration: 0.3 }}
        >
            <span className="font-mono text-xs text-stark/40 tracking-widest">SCROLL</span>
            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-signal/60"
                >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
            </motion.div>
        </motion.div>
    );
}

// Section that animates when it enters viewport with parallax effect
interface ParallaxSectionProps {
    children: React.ReactNode;
    className?: string;
    speed?: number; // 0.5 = half speed, 2 = double speed
    direction?: "up" | "down";
}

export function ParallaxSection({
    children,
    className = "",
    speed = 0.5,
    direction = "up",
}: ParallaxSectionProps) {
    const { scrollYProgress } = useScroll();
    const [offsetY, setOffsetY] = useState(0);

    useEffect(() => {
        return scrollYProgress.on("change", (latest) => {
            const offset = latest * 100 * speed;
            setOffsetY(direction === "up" ? -offset : offset);
        });
    }, [scrollYProgress, speed, direction]);

    return (
        <motion.div
            className={className}
            style={{
                transform: `translateY(${offsetY}px)`,
                transition: "transform 0.1s ease-out",
            }}
        >
            {children}
        </motion.div>
    );
}

// Scroll-triggered counter animation
interface ScrollCounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function ScrollCounter({
    end,
    duration = 2,
    suffix = "",
    prefix = "",
    className = "",
}: ScrollCounterProps) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const { scrollYProgress } = useScroll();

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (latest > 0.1 && !hasAnimated) {
                setHasAnimated(true);

                const startTime = performance.now();
                const animate = (currentTime: number) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / (duration * 1000), 1);

                    // Easing function
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.floor(easeOut * end));

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };

                requestAnimationFrame(animate);
            }
        });

        return unsubscribe;
    }, [end, duration, hasAnimated, scrollYProgress]);

    return (
        <span className={className}>
            {prefix}{count}{suffix}
        </span>
    );
}
