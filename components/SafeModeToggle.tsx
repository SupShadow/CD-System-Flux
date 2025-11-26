"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

export default function SafeModeToggle() {
    const { safeMode, toggleSafeMode, prefersReducedMotion } = useAccessibility();
    const [showWarning, setShowWarning] = useState(false);

    // Show initial warning on first visit (if not in reduced motion mode)
    useEffect(() => {
        const seen = localStorage.getItem("flux-epilepsy-warning-seen");
        if (!seen && !prefersReducedMotion) {
            setShowWarning(true);
        }
    }, [prefersReducedMotion]);

    const dismissWarning = (enableSafeMode: boolean) => {
        if (enableSafeMode) {
            toggleSafeMode();
        }
        setShowWarning(false);
        localStorage.setItem("flux-epilepsy-warning-seen", "true");
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                onClick={toggleSafeMode}
                className={cn(
                    "fixed bottom-24 right-4 z-40 p-3 border backdrop-blur-sm transition-all",
                    "font-mono text-[10px] flex items-center gap-2",
                    safeMode
                        ? "border-signal/50 bg-signal/10 text-signal"
                        : "border-stark/20 bg-void-deep/80 text-stark/60 hover:border-signal/30 hover:text-signal"
                )}
                aria-label={safeMode ? "Safe mode enabled - click to disable" : "Enable safe mode for reduced visual effects"}
                aria-pressed={safeMode}
                title="Epilepsie-sicherer Modus"
            >
                {safeMode ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                    {safeMode ? "SAFE_MODE" : "EFFECTS"}
                </span>
            </motion.button>

            {/* Initial Warning Modal */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-void/95 backdrop-blur-sm p-4"
                        role="alertdialog"
                        aria-labelledby="epilepsy-warning-title"
                        aria-describedby="epilepsy-warning-desc"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-void-deep border-2 border-amber-500/50 p-6 max-w-md w-full"
                        >
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-amber-500/20 text-amber-500">
                                    <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                                </div>
                                <div>
                                    <h2
                                        id="epilepsy-warning-title"
                                        className="font-mono text-lg text-amber-500 font-bold"
                                    >
                                        PHOTOSENSITIVITY WARNING
                                    </h2>
                                    <p className="font-mono text-xs text-stark/50">
                                        EPILEPSY_SAFETY_NOTICE
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div id="epilepsy-warning-desc" className="space-y-3 mb-6">
                                <p className="font-mono text-sm text-stark/80">
                                    Diese Seite enthält <span className="text-amber-500">blinkende Lichter</span>,
                                    {" "}<span className="text-amber-500">schnelle Animationen</span> und
                                    {" "}<span className="text-amber-500">Glitch-Effekte</span>.
                                </p>
                                <p className="font-mono text-sm text-stark/60">
                                    Falls du an Epilepsie leidest oder empfindlich auf visuelle Reize reagierst,
                                    aktiviere bitte den <span className="text-signal">Safe Mode</span>.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => dismissWarning(true)}
                                    className="flex-1 px-4 py-3 border-2 border-signal bg-signal/10 text-signal font-mono text-xs hover:bg-signal/20 transition-colors"
                                >
                                    <EyeOff className="w-4 h-4 inline mr-2" aria-hidden="true" />
                                    SAFE_MODE_AKTIVIEREN
                                </button>
                                <button
                                    onClick={() => dismissWarning(false)}
                                    className="flex-1 px-4 py-3 border border-stark/30 text-stark/70 font-mono text-xs hover:border-stark/50 hover:text-stark transition-colors"
                                >
                                    VERSTANDEN
                                </button>
                            </div>

                            {/* Footer */}
                            <p className="mt-4 font-mono text-[10px] text-stark/40 text-center">
                                Du kannst den Safe Mode jederzeit unten rechts umschalten
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
