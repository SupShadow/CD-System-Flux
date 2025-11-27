"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { usePageVisibility, usePerformanceOptimizations } from "@/hooks";

interface Node {
    id: number;
    x: number;
    y: number;
    delay: number;
    size: number;
}

// Memoized node component for better performance
const GlowingNode = memo(function GlowingNode({
    node,
    isVisible,
    enableGlow,
    enableBoxShadow,
    animationDuration,
    isLowPerformance
}: {
    node: Node;
    isVisible: boolean;
    enableGlow: boolean;
    enableBoxShadow: boolean;
    animationDuration: number;
    isLowPerformance: boolean;
}) {
    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: node.size * 2,
                height: node.size * 2,
                background: "radial-gradient(circle, #FF4500 0%, rgba(255,69,0,0.5) 50%, transparent 100%)",
                // Simplified shadow based on performance settings
                boxShadow: enableBoxShadow
                    ? (enableGlow
                        ? `0 0 ${node.size * 4}px rgba(255,69,0,0.6), 0 0 ${node.size * 8}px rgba(255,69,0,0.3)`
                        : `0 0 ${node.size * 4}px rgba(255,69,0,0.4)`)
                    : "none",
                willChange: "transform, opacity",
                // Force GPU acceleration
                transform: "translateZ(0)",
            }}
            animate={isVisible ? {
                x: isLowPerformance ? [0, 10, -8, 5, 0] : [0, 20, -15, 10, 0],
                y: isLowPerformance ? [0, -8, 10, -5, 0] : [0, -15, 20, -10, 0],
                scale: isLowPerformance ? [1, 1.15, 0.95, 1.1, 1] : [1, 1.3, 0.9, 1.2, 1],
                opacity: [0.6, 1, 0.7, 0.9, 0.6],
            } : {}}
            transition={{
                // Longer duration for lower performance devices
                duration: (isLowPerformance ? 20 + node.delay * 4 : 15 + node.delay * 3) * animationDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: node.delay,
            }}
        />
    );
});

// Pre-defined positions to avoid hydration mismatch
const INITIAL_NODES: Node[] = [
    { id: 0, x: 15, y: 20, delay: 0, size: 3 },
    { id: 1, x: 85, y: 15, delay: 0.5, size: 4 },
    { id: 2, x: 25, y: 75, delay: 1, size: 2 },
    { id: 3, x: 70, y: 60, delay: 1.5, size: 5 },
    { id: 4, x: 45, y: 35, delay: 2, size: 3 },
    { id: 5, x: 10, y: 55, delay: 2.5, size: 4 },
    { id: 6, x: 90, y: 45, delay: 3, size: 2 },
    { id: 7, x: 55, y: 85, delay: 3.5, size: 5 },
    { id: 8, x: 35, y: 10, delay: 4, size: 3 },
    { id: 9, x: 65, y: 90, delay: 4.5, size: 4 },
    { id: 10, x: 20, y: 40, delay: 0.2, size: 2 },
    { id: 11, x: 80, y: 70, delay: 0.7, size: 5 },
    { id: 12, x: 50, y: 50, delay: 1.2, size: 6 },
    { id: 13, x: 30, y: 65, delay: 1.7, size: 3 },
    { id: 14, x: 75, y: 25, delay: 2.2, size: 4 },
    { id: 15, x: 5, y: 80, delay: 2.7, size: 2 },
    { id: 16, x: 95, y: 30, delay: 3.2, size: 5 },
    { id: 17, x: 40, y: 95, delay: 3.7, size: 3 },
    { id: 18, x: 60, y: 5, delay: 4.2, size: 4 },
    { id: 19, x: 12, y: 88, delay: 4.7, size: 2 },
    { id: 20, x: 48, y: 22, delay: 0.3, size: 4 },
    { id: 21, x: 72, y: 78, delay: 1.8, size: 3 },
    { id: 22, x: 18, y: 62, delay: 2.8, size: 5 },
    { id: 23, x: 88, y: 38, delay: 3.8, size: 2 },
];

// Connection lines between nodes
const CONNECTIONS = [
    { from: 0, to: 4 },
    { from: 1, to: 6 },
    { from: 2, to: 7 },
    { from: 3, to: 11 },
    { from: 4, to: 12 },
    { from: 5, to: 10 },
    { from: 8, to: 14 },
    { from: 9, to: 7 },
    { from: 12, to: 3 },
    { from: 13, to: 2 },
    { from: 14, to: 1 },
    { from: 20, to: 12 },
    { from: 21, to: 11 },
    { from: 22, to: 5 },
    { from: 23, to: 6 },
];

export default function NeuralBackground() {
    const [mounted, setMounted] = useState(false);
    const isVisible = usePageVisibility();
    const perf = usePerformanceOptimizations();

    // Determine if we're in a low-performance mode
    const isLowPerformance = perf.level === "low" || perf.level === "ultra-low" || perf.level === "medium";

    useEffect(() => {
        setMounted(true);
    }, []);

    // Dynamically adjust based on performance settings
    const displayNodes = useMemo(() =>
        INITIAL_NODES.slice(0, perf.nodeCount),
        [perf.nodeCount]
    );
    const displayConnections = useMemo(() =>
        CONNECTIONS.slice(0, perf.connectionCount),
        [perf.connectionCount]
    );
    // Use performance-optimized particle count
    const particleCount = perf.particleCount;

    if (!mounted) return null;

    // Pause animations when tab is not visible
    const animationState = isVisible ? "animate" : "paused";

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
            {/* Large ambient glow spots - reduced and optimized based on performance */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    // Smaller on low performance devices
                    width: isLowPerformance ? 400 : 600,
                    height: isLowPerformance ? 400 : 600,
                    background: `radial-gradient(circle, rgba(255,69,0,${isLowPerformance ? 0.12 : 0.15}) 0%, transparent 70%)`,
                    left: "10%",
                    top: "20%",
                    willChange: "transform, opacity",
                    transform: "translateZ(0)",
                }}
                animate={isVisible ? {
                    scale: isLowPerformance ? [1, 1.1, 1] : [1, 1.2, 1],
                    opacity: isLowPerformance ? [0.4, 0.6, 0.4] : [0.5, 0.8, 0.5],
                } : {}}
                transition={{
                    // Slower on low performance devices
                    duration: (isLowPerformance ? 12 : 8) * perf.animationDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            {perf.enableComplexAnimations && (
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(255,69,0,0.1) 0%, transparent 70%)",
                        right: "5%",
                        bottom: "10%",
                    }}
                    animate={isVisible ? {
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.6, 0.3],
                    } : {}}
                    transition={{
                        duration: 10 * perf.animationDuration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />
            )}
            {perf.enableComplexAnimations && (
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(255,69,0,0.12) 0%, transparent 70%)",
                        left: "50%",
                        top: "60%",
                        transform: "translateX(-50%)",
                    }}
                    animate={isVisible ? {
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.7, 0.4],
                    } : {}}
                    transition={{
                        duration: 6 * perf.animationDuration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4,
                    }}
                />
            )}

            {/* SVG for connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ willChange: "auto" }}>
                {/* Only render glow filter when enabled - very expensive on mobile GPUs */}
                {perf.enableGlow && (
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                )}

                {/* Animated connection lines - reduced based on performance */}
                {displayConnections.map((conn, i) => {
                    const fromNode = INITIAL_NODES[conn.from];
                    const toNode = INITIAL_NODES[conn.to];
                    return (
                        <motion.line
                            key={i}
                            x1={`${fromNode.x}%`}
                            y1={`${fromNode.y}%`}
                            x2={`${toNode.x}%`}
                            y2={`${toNode.y}%`}
                            stroke={isLowPerformance ? "rgba(255, 69, 0, 0.4)" : "rgba(255, 69, 0, 0.3)"}
                            strokeWidth="1"
                            // Skip expensive filter on low performance devices
                            filter={perf.enableGlow ? "url(#glow)" : undefined}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={isVisible ? {
                                pathLength: [0, 1, 1, 0],
                                opacity: [0, 0.6, 0.6, 0],
                            } : {}}
                            transition={{
                                // Slower animation for lower performance devices
                                duration: (isLowPerformance ? 6 : 4) * perf.animationDuration,
                                delay: i * (isLowPerformance ? 1.2 : 0.8),
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    );
                })}

                {/* Data pulses along connections - significantly reduced based on performance */}
                {displayConnections.slice(0, isLowPerformance ? 2 : 8).map((conn, i) => {
                    const fromNode = INITIAL_NODES[conn.from];
                    const toNode = INITIAL_NODES[conn.to];
                    return (
                        <motion.circle
                            key={`pulse-${i}`}
                            r={isLowPerformance ? 2 : 3}
                            fill="#FF4500"
                            // Skip expensive filter on low performance devices
                            filter={perf.enableGlow ? "url(#glow)" : undefined}
                            initial={{
                                cx: `${fromNode.x}%`,
                                cy: `${fromNode.y}%`,
                                opacity: 0,
                            }}
                            animate={isVisible ? {
                                cx: [`${fromNode.x}%`, `${toNode.x}%`],
                                cy: [`${fromNode.y}%`, `${toNode.y}%`],
                                opacity: [0, 1, 1, 0],
                            } : {}}
                            transition={{
                                // Slower animation for lower performance devices
                                duration: (isLowPerformance ? 3 : 2) * perf.animationDuration,
                                delay: i * 2 + 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    );
                })}
            </svg>

            {/* Glowing Nodes - use memoized component for better performance */}
            {displayNodes.map((node) => (
                <GlowingNode
                    key={node.id}
                    node={node}
                    isVisible={isVisible}
                    enableGlow={perf.enableGlow}
                    enableBoxShadow={perf.enableBoxShadow}
                    animationDuration={perf.animationDuration}
                    isLowPerformance={isLowPerformance}
                />
            ))}

            {/* Floating particles - significantly reduced based on performance */}
            {[...Array(particleCount)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        left: `${10 + i * (isLowPerformance ? 30 : 7)}%`,
                        top: `${15 + (i % 4) * 20}%`,
                        background: "rgba(255, 69, 0, 0.6)",
                        willChange: "transform, opacity",
                        transform: "translateZ(0)",
                    }}
                    animate={isVisible ? {
                        y: isLowPerformance ? [0, -60, 0] : [0, -100, 0],
                        x: isLowPerformance ? [0, 15, 0] : [0, 30, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0.5, 1, 0.5],
                    } : {}}
                    transition={{
                        // Slower animation for lower performance devices
                        duration: (isLowPerformance ? 12 + i * 2 : 8 + i) * perf.animationDuration,
                        delay: i * (isLowPerformance ? 1 : 0.5),
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
            {/* Grid overlay removed - handled by ParallaxLayers */}
        </div>
    );
}
