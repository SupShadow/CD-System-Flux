"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Copy, Check, X, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareTarget {
    id: string;
    name: string;
    label: string;
    color: string;
    bgColor: string;
    icon?: React.ReactNode;
    action: (data: ShareData) => void | Promise<void>;
}

interface ShareData {
    title: string;
    text: string;
    url: string;
}

interface TransmitButtonProps {
    shareData: ShareData;
    className?: string;
    compact?: boolean;
}

// Particle component for the transmission effect
function TransmitParticle({ delay, angle }: { delay: number; angle: number }) {
    return (
        <motion.div
            className="absolute w-1 h-1 bg-signal rounded-full"
            initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1
            }}
            animate={{
                x: Math.cos(angle) * 60,
                y: Math.sin(angle) * 60,
                opacity: 0,
                scale: 0
            }}
            transition={{
                duration: 0.6,
                delay,
                ease: "easeOut"
            }}
        />
    );
}

// QR Code Modal
function QRCodeModal({
    isOpen,
    onClose,
    url
}: {
    isOpen: boolean;
    onClose: () => void;
    url: string;
}) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && url) {
            // Generate QR code using canvas
            generateQRCode(url).then(setQrDataUrl);
        }
    }, [isOpen, url]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-void/90 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-void-deep border border-signal/30 p-6 max-w-sm w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-signal" />
                        <span className="font-mono text-xs text-signal">SCAN_FREQUENCY</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-stark/50 hover:text-signal transition-colors"
                        aria-label="Close QR code modal"
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="bg-stark p-4 mb-4">
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR Code" className="w-full" />
                    ) : (
                        <div className="aspect-square flex items-center justify-center">
                            <div className="font-mono text-xs text-void animate-pulse">
                                GENERATING...
                            </div>
                        </div>
                    )}
                </div>

                <div className="font-mono text-[10px] text-stark/40 text-center break-all">
                    {url}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Simple QR code generator using canvas
async function generateQRCode(text: string): Promise<string> {
    // Using a simple pattern for demo - in production, use a QR library
    const canvas = document.createElement("canvas");
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    // Simple pattern based on text hash (placeholder for real QR)
    ctx.fillStyle = "#000000";
    const moduleSize = 8;
    const modules = Math.floor(size / moduleSize);

    // Generate deterministic pattern from URL
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash = hash & hash;
    }

    // Position patterns (corners)
    const drawPositionPattern = (x: number, y: number) => {
        ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
        ctx.fillStyle = "#000000";
        ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
    };

    drawPositionPattern(moduleSize, moduleSize);
    drawPositionPattern(size - moduleSize * 8, moduleSize);
    drawPositionPattern(moduleSize, size - moduleSize * 8);

    // Data pattern
    for (let i = 9; i < modules - 1; i++) {
        for (let j = 9; j < modules - 1; j++) {
            const val = (hash * (i + 1) * (j + 1)) % 100;
            if (val > 45) {
                ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize - 1, moduleSize - 1);
            }
        }
    }

    return canvas.toDataURL();
}

export default function TransmitButton({
    shareData,
    className = "",
    compact = false,
}: TransmitButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [transmitSuccess, setTransmitSuccess] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    // Track timeout IDs for cleanup
    const timeoutIdsRef = useRef<Set<NodeJS.Timeout>>(new Set());

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutIdsRef.current.forEach(id => clearTimeout(id));
            timeoutIdsRef.current.clear();
        };
    }, []);

    const shareTargets: ShareTarget[] = [
        {
            id: "x",
            name: "X",
            label: "FREQ_01",
            color: "#FFFFFF",
            bgColor: "bg-white/10",
            action: async (data) => {
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`,
                    "_blank",
                    "width=550,height=420"
                );
            },
        },
        {
            id: "whatsapp",
            name: "WHATSAPP",
            label: "FREQ_02",
            color: "#25D366",
            bgColor: "bg-[#25D366]/10",
            action: async (data) => {
                window.open(
                    `https://wa.me/?text=${encodeURIComponent(`${data.text}\n${data.url}`)}`,
                    "_blank"
                );
            },
        },
        {
            id: "telegram",
            name: "TELEGRAM",
            label: "FREQ_03",
            color: "#0088cc",
            bgColor: "bg-[#0088cc]/10",
            action: async (data) => {
                window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`,
                    "_blank"
                );
            },
        },
        {
            id: "copy",
            name: "COPY_SIGNAL",
            label: "FREQ_04",
            color: "#FF4500",
            bgColor: "bg-signal/10",
            icon: <Copy className="w-3 h-3" />,
            action: async (data) => {
                await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
                setCopiedId("copy");
                const copyTimeout = setTimeout(() => {
                    timeoutIdsRef.current.delete(copyTimeout);
                    setCopiedId(null);
                }, 2000);
                timeoutIdsRef.current.add(copyTimeout);
            },
        },
        {
            id: "qr",
            name: "QR_SCAN",
            label: "FREQ_05",
            color: "#FF4500",
            bgColor: "bg-signal/10",
            icon: <QrCode className="w-3 h-3" />,
            action: () => {
                setShowQR(true);
                setIsOpen(false);
            },
        },
    ];

    const handleTransmit = useCallback(async (target: ShareTarget) => {
        setIsTransmitting(true);
        setShowParticles(true);

        try {
            await target.action(shareData);

            // Show success state - track timeout IDs for cleanup
            const timeout1 = setTimeout(() => {
                timeoutIdsRef.current.delete(timeout1);
                setIsTransmitting(false);
                setTransmitSuccess(true);
                const timeout2 = setTimeout(() => {
                    timeoutIdsRef.current.delete(timeout2);
                    setTransmitSuccess(false);
                    setIsOpen(false);
                }, 1500);
                timeoutIdsRef.current.add(timeout2);
            }, 500);
            timeoutIdsRef.current.add(timeout1);
        } catch (error) {
            setIsTransmitting(false);
        }

        const particleTimeout = setTimeout(() => {
            timeoutIdsRef.current.delete(particleTimeout);
            setShowParticles(false);
        }, 600);
        timeoutIdsRef.current.add(particleTimeout);
    }, [shareData]);

    // Native share for mobile
    const handleNativeShare = useCallback(async () => {
        if (navigator.share) {
            setIsTransmitting(true);
            setShowParticles(true);

            try {
                await navigator.share(shareData);
                setTransmitSuccess(true);
                const successTimeout = setTimeout(() => {
                    timeoutIdsRef.current.delete(successTimeout);
                    setTransmitSuccess(false);
                }, 2000);
                timeoutIdsRef.current.add(successTimeout);
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Share failed:", err);
                }
            }

            setIsTransmitting(false);
            const particleTimeout = setTimeout(() => {
                timeoutIdsRef.current.delete(particleTimeout);
                setShowParticles(false);
            }, 600);
            timeoutIdsRef.current.add(particleTimeout);
        } else {
            setIsOpen(true);
        }
    }, [shareData]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Particle angles for transmission effect
    const particleAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

    return (
        <>
            <div ref={buttonRef} className={cn("relative", className)}>
                {/* Main Button */}
                <motion.button
                    onClick={handleNativeShare}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }}
                    className={cn(
                        "relative flex items-center gap-2 px-3 py-2 border font-mono text-xs transition-all overflow-hidden group",
                        isOpen || isTransmitting
                            ? "border-signal bg-signal/10 text-signal"
                            : "border-stark/20 text-stark/60 hover:border-signal/50 hover:text-signal",
                        transmitSuccess && "border-signal bg-signal/20 text-signal"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={transmitSuccess ? "Shared successfully" : isTransmitting ? "Sharing in progress" : "Share this track"}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                >
                    {/* Scanning line effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-signal/20 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={isTransmitting ? { x: "100%" } : { x: "-100%" }}
                        transition={{
                            duration: 0.8,
                            repeat: isTransmitting ? Infinity : 0,
                            ease: "linear"
                        }}
                    />

                    {/* Icon */}
                    <motion.div
                        animate={isTransmitting ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 1, repeat: isTransmitting ? Infinity : 0, ease: "linear" }}
                    >
                        {transmitSuccess ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Radio className="w-4 h-4" />
                        )}
                    </motion.div>

                    {/* Label */}
                    {!compact && (
                        <span className="relative">
                            {transmitSuccess ? "TRANSMITTED" : isTransmitting ? "SENDING..." : "TRANSMIT"}
                        </span>
                    )}

                    {/* Particles */}
                    <AnimatePresence>
                        {showParticles && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                {particleAngles.map((angle, i) => (
                                    <TransmitParticle key={i} delay={i * 0.05} angle={angle} />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Radial Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="absolute bottom-full mb-2 right-0 bg-void-deep border border-signal/30 p-3 min-w-[200px] z-50"
                            role="menu"
                            aria-label="Share options"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stark/10">
                                <span className="font-mono text-[10px] text-signal">
                                    BROADCAST_PROTOCOL
                                </span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 text-stark/30 hover:text-signal transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Share targets */}
                            <div className="space-y-1" role="group">
                                {shareTargets.map((target, index) => (
                                    <motion.button
                                        key={target.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleTransmit(target)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-2 py-1.5 font-mono text-[10px] transition-all group",
                                            target.bgColor,
                                            "hover:bg-signal/20 border border-transparent hover:border-signal/30"
                                        )}
                                        disabled={isTransmitting}
                                        role="menuitem"
                                        aria-label={`Share via ${target.name}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-stark/40">{target.label}:</span>
                                            <span style={{ color: target.color }}>
                                                {target.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {copiedId === target.id ? (
                                                <Check className="w-3 h-3 text-signal" />
                                            ) : (
                                                target.icon || (
                                                    <motion.div
                                                        className="w-1.5 h-1.5 rounded-full"
                                                        style={{ backgroundColor: target.color }}
                                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="mt-3 pt-2 border-t border-stark/10">
                                <div className="font-mono text-[8px] text-stark/30 text-center">
                                    RIGHT_CLICK FOR OPTIONS
                                </div>
                            </div>

                            {/* Connection lines decoration */}
                            <svg
                                className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-16 text-signal/30"
                                viewBox="0 0 8 64"
                            >
                                {shareTargets.map((_, i) => (
                                    <motion.line
                                        key={i}
                                        x1="8"
                                        y1={12 + i * 10}
                                        x2="0"
                                        y2={12 + i * 10}
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ delay: i * 0.1, duration: 0.3 }}
                                    />
                                ))}
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQR && (
                    <QRCodeModal
                        isOpen={showQR}
                        onClose={() => setShowQR(false)}
                        url={shareData.url}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// Compact version for inline use
export function TransmitIcon({
    shareData,
    className = ""
}: {
    shareData: ShareData;
    className?: string;
}) {
    return (
        <TransmitButton
            shareData={shareData}
            compact={true}
            className={className}
        />
    );
}
