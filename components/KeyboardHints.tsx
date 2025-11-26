"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { KEYBOARD_SHORTCUTS } from "@/hooks";

interface KeyboardHintsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function KeyboardHints({ isOpen, onClose }: KeyboardHintsProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-void/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-sm"
                    >
                        <div className="border border-signal/30 bg-void-deep/95 backdrop-blur-xl shadow-[0_0_60px_rgba(255,69,0,0.2)]">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-signal/20 bg-signal/5">
                                <div className="flex items-center gap-2">
                                    <Keyboard className="w-4 h-4 text-signal" />
                                    <span className="font-mono text-sm text-signal tracking-widest">
                                        KEYBOARD_COMMANDS
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-stark/50 hover:text-signal transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Shortcuts list */}
                            <div className="p-4 space-y-2">
                                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                                    <motion.div
                                        key={shortcut.key}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between py-2 border-b border-stark/10 last:border-0"
                                    >
                                        <span className="font-mono text-xs text-stark/60">
                                            {shortcut.action}
                                        </span>
                                        <kbd className="px-2 py-1 font-mono text-xs bg-signal/10 border border-signal/30 text-signal min-w-[40px] text-center">
                                            {shortcut.key}
                                        </kbd>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 border-t border-stark/10 bg-stark/5">
                                <p className="font-mono text-[10px] text-stark/40 text-center">
                                    PRESS_ESC_OR_?_TO_CLOSE
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
