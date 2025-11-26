"use client";

import { useRef } from "react";
import { motion, useInView, Variant } from "framer-motion";

type AnimationType =
    | "fade"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "scale"
    | "scaleUp"
    | "glitch"
    | "blur"
    | "rotate"
    | "flip";

interface ScrollRevealProps {
    children: React.ReactNode;
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
    threshold?: number;
}

const animations: Record<AnimationType, { hidden: Variant; visible: Variant }> = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    slideUp: {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    },
    slideDown: {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    },
    slideRight: {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
    },
    scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    },
    scaleUp: {
        hidden: { opacity: 0, scale: 1.2 },
        visible: { opacity: 1, scale: 1 },
    },
    glitch: {
        hidden: { opacity: 0, x: -20, filter: "blur(10px)" },
        visible: { opacity: 1, x: 0, filter: "blur(0px)" },
    },
    blur: {
        hidden: { opacity: 0, filter: "blur(20px)" },
        visible: { opacity: 1, filter: "blur(0px)" },
    },
    rotate: {
        hidden: { opacity: 0, rotate: -10, y: 30 },
        visible: { opacity: 1, rotate: 0, y: 0 },
    },
    flip: {
        hidden: { opacity: 0, rotateX: 90 },
        visible: { opacity: 1, rotateX: 0 },
    },
};

export default function ScrollReveal({
    children,
    animation = "slideUp",
    delay = 0,
    duration = 0.6,
    className = "",
    once = true,
    threshold = 0.1,
}: ScrollRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount: threshold });

    const selectedAnimation = animations[animation];

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: selectedAnimation.hidden,
                visible: selectedAnimation.visible,
            }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Staggered children animation wrapper
interface StaggerContainerProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function StaggerContainer({
    children,
    className = "",
    staggerDelay = 0.1
}: StaggerContainerProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Individual stagger item
interface StaggerItemProps {
    children: React.ReactNode;
    className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
