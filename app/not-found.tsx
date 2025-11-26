"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertTriangle, Terminal } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Glitch background effect */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,69,0,0.03)_2px,rgba(255,69,0,0.03)_4px)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center z-10"
            >
                {/* Error Code */}
                <motion.div
                    className="relative mb-8"
                    animate={{
                        textShadow: [
                            "0 0 10px rgba(255,69,0,0.5)",
                            "0 0 20px rgba(255,69,0,0.8)",
                            "0 0 10px rgba(255,69,0,0.5)"
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <h1 className="text-[120px] md:text-[200px] font-bold text-signal/20 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl md:text-8xl font-bold text-signal glitch-text" data-text="404">
                            404
                        </span>
                    </div>
                </motion.div>

                {/* Terminal Style Message */}
                <div className="bg-void-deep/80 border border-signal/30 p-6 mb-8 max-w-md mx-auto text-left font-mono">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stark/10">
                        <Terminal className="w-4 h-4 text-signal" />
                        <span className="text-xs text-signal">SYSTEM_ERROR</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-stark/60">
                            <span className="text-signal">$</span> locate requested_route
                        </p>
                        <p className="text-red-500/80 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            ERROR: Route not found in FLUX_DATABASE
                        </p>
                        <p className="text-stark/40 text-xs mt-4">
                            // Die angeforderte Seite existiert nicht
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                <Link href="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-signal/10 border border-signal text-signal font-mono text-sm hover:bg-signal/20 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        RETURN_TO_MAINFRAME
                    </motion.button>
                </Link>

                {/* Decorative Elements */}
                <div className="mt-12 font-mono text-xs text-stark/30 space-y-1">
                    <p>FLUX_OS // ERROR_HANDLER v1.0</p>
                    <p>SYSTEM STATUS: ROUTE_NOT_FOUND</p>
                </div>
            </motion.div>
        </main>
    );
}
