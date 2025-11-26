"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi } from "lucide-react";

export default function InfectionCounter() {
    const [nodes, setNodes] = useState(8492);
    const [isActive, setIsActive] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const interval = setInterval(() => {
            if (Math.random() > 0.5) {
                setNodes(prev => prev + Math.floor(Math.random() * 5) + 1);
                setIsActive(true);
                setTimeout(() => setIsActive(false), 300);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-20 left-4 md:bottom-24 md:left-6 z-40"
        >
            <div className="font-mono text-[10px] bg-void-deep/90 backdrop-blur-sm border border-signal/20 overflow-hidden">
                {/* Header */}
                <div className="bg-signal/10 px-3 py-1 border-b border-signal/20 flex items-center gap-2">
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-signal"
                        animate={isActive ? {
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1]
                        } : {}}
                        transition={{ duration: 0.3 }}
                    />
                    <span className="text-signal/80 tracking-wider">NETWORK_SPREAD</span>
                </div>

                {/* Content */}
                <div className="px-3 py-2 flex items-center gap-3">
                    <Wifi className="w-3 h-3 text-signal/50" />
                    <div>
                        <div className="text-stark/50 text-[9px]">NODES_CONNECTED</div>
                        <div className="text-signal font-bold tabular-nums">
                            {nodes.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
