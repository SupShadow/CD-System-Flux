"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, KeyRound, Bell, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import TiltCard from "./TiltCard";

export default function MerchTeaser() {
    const [accessAttempts, setAccessAttempts] = useState(0);
    const [overrideCode, setOverrideCode] = useState("████████");
    const [mounted, setMounted] = useState(false);
    const [scanLine, setScanLine] = useState(0);

    useEffect(() => {
        setMounted(true);

        // Simulate access attempts
        const attemptsInterval = setInterval(() => {
            setAccessAttempts(prev => {
                if (prev >= 47) return 47; // Stuck at 47
                return prev + 1;
            });
        }, 100);

        // Glitching override code
        const chars = "█▓▒░ABCDEF0123456789";
        const codeInterval = setInterval(() => {
            const length = 8;
            let result = "";
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
            setOverrideCode(result);
        }, 100);

        // Scan line animation
        const scanInterval = setInterval(() => {
            setScanLine(prev => (prev >= 100 ? 0 : prev + 2));
        }, 50);

        return () => {
            clearInterval(attemptsInterval);
            clearInterval(codeInterval);
            clearInterval(scanInterval);
        };
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-signal">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="font-mono text-sm tracking-widest">RESTRICTED_ACCESS</h2>
            </div>

            <TiltCard tiltAmount={10} scale={1.02}>
                <div className="relative h-56 border border-red-500/30 bg-void-deep/50 overflow-hidden group">
                {/* Scanning effect */}
                <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none"
                    style={{ top: `${mounted ? scanLine : 0}%` }}
                />

                {/* Grid background */}
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(255,69,0,0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,69,0,0.3) 1px, transparent 1px)
                            `,
                            backgroundSize: "20px 20px"
                        }}
                    />
                </div>

                {/* Main content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 p-4 font-mono">
                    {/* Access Level Warning */}
                    <div className="flex items-center gap-2 text-red-500/80">
                        <ShieldAlert className="w-6 h-6" />
                        <span className="text-xs tracking-wider">ACCESS_DENIED</span>
                    </div>

                    {/* Terminal style messages */}
                    <div className="text-[11px] text-stark/50 space-y-1 text-center">
                        <div className="flex items-center gap-1 justify-center">
                            <Terminal className="w-3 h-3" />
                            <span>&gt; ACCESS_LEVEL: <span className="text-red-500/80">INSUFFICIENT</span></span>
                        </div>
                        <div>&gt; CLEARANCE_REQUIRED: <span className="text-signal">LEVEL_5</span></div>
                        <div className="flex items-center gap-1 justify-center">
                            <KeyRound className="w-3 h-3" />
                            <span>&gt; OVERRIDE_CODE: <span className="text-signal">[{mounted ? overrideCode : "████████"}]</span></span>
                        </div>
                    </div>

                    {/* Access attempts counter */}
                    <div className="mt-2">
                        <div className="text-[10px] text-stark/40 mb-1 text-center">
                            BYPASS_ATTEMPTS: {mounted ? accessAttempts : 0}/99
                        </div>
                        <div className="w-32 h-1 bg-stark/10 overflow-hidden">
                            <motion.div
                                className="h-full bg-red-500/50"
                                style={{ width: `${mounted ? (accessAttempts / 99) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <p className="text-[10px] text-stark/30 mt-2">
                        STATUS: <span className="text-stark/50">AWAITING_AUTHORIZATION</span>
                    </p>
                </div>

                {/* Hover state - Request Access button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    className="absolute inset-0 bg-void/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <button className={cn(
                        "flex items-center gap-2 px-4 py-2",
                        "border border-signal text-signal font-mono text-sm",
                        "hover:bg-signal hover:text-void transition-colors"
                    )}>
                        <Bell className="w-4 h-4" />
                        REQUEST_ACCESS
                    </button>
                </motion.div>

                {/* Scan lines overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px]" />

                {/* Corner markers */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-red-500/50" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-red-500/50" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-red-500/50" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-red-500/50" />
            </div>
            </TiltCard>
        </div>
    );
}
