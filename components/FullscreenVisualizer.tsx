"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { usePageVisibility } from "@/hooks";
import { rgba, calculateAudioMetrics, drawCorners, clearWithFade } from "@/lib/visualizer-utils";
import {
    renderVisualizer,
    VisualizerState,
    VisualizerType,
} from "@/components/visualizers";
import {
    initMatrixDrops,
    initFallingParticles,
    initCodeLines,
} from "@/lib/visualizer-utils";

interface FullscreenVisualizerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Wrapper component - only mounts inner component when open
export default function FullscreenVisualizer({ isOpen, onClose }: FullscreenVisualizerProps) {
    // Use ref to store onClose to avoid re-registering event listener when onClose changes
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    // Handle escape key at wrapper level (no other hooks here)
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCloseRef.current();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    // Only render inner component when open to avoid hook count issues
    if (!isOpen) return null;

    return <FullscreenVisualizerInner onClose={onClose} />;
}

// Inner component with all the visualization hooks
function FullscreenVisualizerInner({ onClose }: { onClose: () => void }) {
    const { analyserRef, isPlaying, currentTrack } = useAudio();
    const { disableFlashing } = useAccessibility();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isVisible = usePageVisibility();

    // Pre-allocate audio data array to avoid GC pressure - stored in ref
    const dataArrayRef = useRef<Uint8Array | null>(null);

    // Initialize persistent state for visualizers that need it
    const visualizerState = useMemo<VisualizerState>(() => ({
        matrix: { drops: [] },
        falling: { particles: [] },
        hearts: { hearts: [] },
        code: { lines: initCodeLines() },
        ice: { particles: [] },
        trace: { points: [] },
    }), []);

    // Main visualization
    useEffect(() => {
        if (!isVisible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Reinitialize state that depends on canvas size
            visualizerState.matrix.drops = initMatrixDrops(canvas.width);
            visualizerState.falling.particles = initFallingParticles(canvas.width, canvas.height);
        };
        resize();
        window.addEventListener("resize", resize);

        let animationFrame: number;
        let time = 0;
        const color = currentTrack.color;
        const visualizer = currentTrack.visualizer as VisualizerType;

        const render = () => {
            time += 0.016;

            // Get audio data - reuse pre-allocated array to avoid GC pressure
            let bufferLength = 128;

            if (analyserRef.current) {
                bufferLength = analyserRef.current.frequencyBinCount;
                // Reallocate only if buffer size changed (rare)
                if (!dataArrayRef.current || dataArrayRef.current.length !== bufferLength) {
                    dataArrayRef.current = new Uint8Array(bufferLength);
                }
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            } else {
                // Fill with zeros when no analyser (reuse existing array)
                if (!dataArrayRef.current) {
                    dataArrayRef.current = new Uint8Array(bufferLength);
                }
                dataArrayRef.current.fill(0);
            }

            const dataArray = dataArrayRef.current;

            // Calculate audio metrics
            const metrics = calculateAudioMetrics(dataArray, bufferLength);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Clear with fade effect
            clearWithFade(ctx, canvas);

            // Create visualizer context
            const vizContext = {
                ctx,
                canvas,
                time,
                dataArray,
                metrics,
                color,
                centerX,
                centerY,
            };

            // Render the appropriate visualizer
            renderVisualizer(visualizer, vizContext, visualizerState, {
                disableFlashing,
            });

            // Corner decorations
            drawCorners(ctx, canvas, color);

            animationFrame = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrame);
        };
    }, [isVisible, analyserRef, currentTrack, disableFlashing, visualizerState]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-void"
        >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Track info overlay */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
            >
                <div
                    className="font-mono text-xs tracking-widest mb-2"
                    style={{ color: rgba(currentTrack.color, 0.5) }}
                >
                    NOW_PLAYING
                </div>
                <div className="font-bold text-2xl md:text-4xl text-stark tracking-tight">
                    {currentTrack.title.toUpperCase()}
                </div>
                <div className="font-mono text-sm text-stark/50 mt-2">
                    JULIAN GUGGEIS // SYSTEM FLUX
                </div>
            </motion.div>

            {/* Visualizer type indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute top-8 left-8 font-mono text-[10px] tracking-widest"
                style={{ color: rgba(currentTrack.color, 0.5) }}
            >
                VIS_MODE: {currentTrack.visualizer.toUpperCase()}
            </motion.div>

            {/* Status indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
            >
                <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentTrack.color }}
                    animate={
                        isPlaying
                            ? {
                                  scale: [1, 1.5, 1],
                                  opacity: [1, 0.5, 1],
                              }
                            : {}
                    }
                    transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="font-mono text-xs text-stark/50 tracking-widest">
                    {isPlaying ? "SIGNAL_ACTIVE" : "SIGNAL_PAUSED"}
                </span>
            </motion.div>

            {/* Close button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="absolute top-6 right-6 p-3 border text-stark/70 hover:text-stark transition-colors bg-void/50 backdrop-blur-sm"
                style={{ borderColor: rgba(currentTrack.color, 0.3) }}
            >
                <X className="w-6 h-6" />
            </motion.button>

            {/* ESC hint */}
            <div className="absolute bottom-8 right-8 font-mono text-[10px] text-stark/30">
                [ESC] EXIT
            </div>

            {/* Scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30" />
        </motion.div>
    );
}
