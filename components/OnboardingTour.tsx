"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Play, Keyboard, Maximize2, Palette, List } from "lucide-react";

interface TourStep {
    id: string;
    title: string;
    description: string;
    icon: typeof Play;
    position: "bottom" | "top" | "center";
    highlight?: string; // CSS selector or description
}

const TOUR_STEPS: TourStep[] = [
    {
        id: "welcome",
        title: "WELCOME_TO_FLUX",
        description: "An immersive audio experience. Let me show you around.",
        icon: Play,
        position: "center",
    },
    {
        id: "playback",
        title: "PLAYBACK_CONTROLS",
        description: "Use the play button or press SPACE to start the music. Arrow keys skip tracks.",
        icon: Play,
        position: "bottom",
        highlight: "Play/Pause button",
    },
    {
        id: "tracklist",
        title: "TRACK_LIST",
        description: "Click the list icon or press L to browse all available tracks.",
        icon: List,
        position: "bottom",
        highlight: "Track list button",
    },
    {
        id: "visualizer",
        title: "FULLSCREEN_VISUALIZER",
        description: "Press F for an immersive fullscreen audio visualization experience.",
        icon: Maximize2,
        position: "bottom",
        highlight: "Fullscreen button",
    },
    {
        id: "themes",
        title: "COLOR_THEMES",
        description: "Press T to cycle through different color themes. Find your vibe.",
        icon: Palette,
        position: "center",
    },
    {
        id: "keyboard",
        title: "KEYBOARD_SHORTCUTS",
        description: "Press ? anytime to see all available keyboard shortcuts.",
        icon: Keyboard,
        position: "center",
    },
    {
        id: "secrets",
        title: "HIDDEN_SECRETS",
        description: "Explore to find hidden achievements and secrets. Some unlock special features...",
        icon: Play,
        position: "center",
    },
];

const STORAGE_KEY = "flux-onboarding-complete";

export default function OnboardingTour() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if user has completed onboarding
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
            // Delay start to let the app load
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const completeTour = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsVisible(false);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeTour();
        }
    }, [currentStep, completeTour]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const skipTour = useCallback(() => {
        completeTour();
    }, [completeTour]);

    if (!mounted || !isVisible) return null;

    const step = TOUR_STEPS[currentStep];
    const Icon = step.icon;
    const isLastStep = currentStep === TOUR_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-void/90 backdrop-blur-sm z-[200]"
                        onClick={skipTour}
                    />

                    {/* Tour card */}
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`fixed z-[201] w-full max-w-md px-4 ${
                            step.position === "bottom"
                                ? "bottom-32 left-1/2 -translate-x-1/2"
                                : step.position === "top"
                                ? "top-20 left-1/2 -translate-x-1/2"
                                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        }`}
                    >
                        <div className="relative border border-signal/50 bg-void-deep/95 backdrop-blur-xl shadow-[0_0_60px_rgba(255,69,0,0.3)]">
                            {/* Progress indicator */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-stark/10">
                                <motion.div
                                    className="h-full bg-signal"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            {/* Skip button */}
                            <button
                                onClick={skipTour}
                                className="absolute top-3 right-3 p-1 text-stark/50 hover:text-signal transition-colors"
                                aria-label="Skip tour"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="p-6 pt-8">
                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <motion.div
                                        className="w-16 h-16 border-2 border-signal/50 flex items-center justify-center"
                                        animate={{
                                            boxShadow: ["0 0 0px rgba(255,69,0,0)", "0 0 20px rgba(255,69,0,0.5)", "0 0 0px rgba(255,69,0,0)"]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Icon className="w-8 h-8 text-signal" />
                                    </motion.div>
                                </div>

                                {/* Title */}
                                <h2 className="font-mono text-lg text-signal text-center tracking-widest mb-3">
                                    {step.title}
                                </h2>

                                {/* Description */}
                                <p className="font-mono text-sm text-stark/80 text-center leading-relaxed mb-6">
                                    {step.description}
                                </p>

                                {/* Step indicator */}
                                <div className="flex justify-center gap-1 mb-6">
                                    {TOUR_STEPS.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-2 h-2 transition-colors ${
                                                index === currentStep
                                                    ? "bg-signal"
                                                    : index < currentStep
                                                    ? "bg-signal/50"
                                                    : "bg-stark/20"
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Navigation buttons */}
                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={prevStep}
                                        disabled={isFirstStep}
                                        className={`flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-wider transition-colors ${
                                            isFirstStep
                                                ? "text-stark/40 cursor-not-allowed"
                                                : "text-stark/70 hover:text-signal"
                                        }`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        BACK
                                    </button>

                                    <button
                                        onClick={skipTour}
                                        className="font-mono text-xs text-stark/50 hover:text-stark/70 transition-colors"
                                    >
                                        SKIP_TOUR
                                    </button>

                                    <button
                                        onClick={nextStep}
                                        className="flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-wider bg-signal/10 border border-signal/50 text-signal hover:bg-signal/20 transition-colors"
                                    >
                                        {isLastStep ? "START" : "NEXT"}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Corner decorations */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-signal" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-signal" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-signal" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-signal" />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Hook to manually trigger the tour
export function useOnboardingTour() {
    const resetTour = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }, []);

    return { resetTour };
}
