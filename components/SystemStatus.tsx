"use client";

import { useState, useEffect, useRef } from "react";
import { Cpu, Radio, Link2, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import TiltCard from "./TiltCard";
import { usePageVisibility } from "@/hooks";

const SOCIAL_LINKS = [
    { name: "SPOTIFY", url: "https://open.spotify.com/intl-de/artist/7sftGNX7UKWsHgOumCU2fP" },
    { name: "INSTAGRAM", url: "https://www.instagram.com/jguggeis/" },
    { name: "LINKEDIN", url: "https://www.linkedin.com/in/guggeis/" },
    { name: "GITHUB", url: "https://github.com/SupShadow" },
];

export default function SystemStatus() {
    const [connectedAgents, setConnectedAgents] = useState<number | null>(null);
    const [networkStatus, setNetworkStatus] = useState("INITIALIZING");
    const [dots, setDots] = useState("");
    const [mounted, setMounted] = useState(false);
    const [learningRate, setLearningRate] = useState(0);
    const isVisible = usePageVisibility();
    const intervalsRef = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Separate effect for intervals that respects visibility
    useEffect(() => {
        if (!mounted) return;

        // Clear any existing intervals
        intervalsRef.current.forEach(clearInterval);
        intervalsRef.current = [];

        // Don't start intervals if page is not visible
        if (!isVisible) return;

        // Simulate connected agents count
        const baseAgents = 1247;
        const updateAgents = () => {
            const fluctuation = Math.floor(Math.random() * 50) - 25;
            setConnectedAgents(baseAgents + fluctuation);
        };
        updateAgents();
        const agentsInterval = setInterval(updateAgents, 3000);
        intervalsRef.current.push(agentsInterval);

        // Network status cycle
        const statuses = ["AUTONOMOUS", "SYNCING", "LEARNING", "AUTONOMOUS"];
        let statusIndex = 0;
        const statusInterval = setInterval(() => {
            statusIndex = (statusIndex + 1) % statuses.length;
            setNetworkStatus(statuses[statusIndex]);
        }, 5000);
        intervalsRef.current.push(statusInterval);

        // Learning rate animation
        const learningInterval = setInterval(() => {
            setLearningRate(prev => {
                if (prev >= 100) return 0;
                return prev + Math.random() * 15;
            });
        }, 200);
        intervalsRef.current.push(learningInterval);

        // Animated dots
        const dotsInterval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        intervalsRef.current.push(dotsInterval);

        return () => {
            intervalsRef.current.forEach(clearInterval);
            intervalsRef.current = [];
        };
    }, [mounted, isVisible]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-signal">
                <Cpu className="w-5 h-5" />
                <h2 className="font-mono text-sm tracking-widest">AGENT_NETWORK</h2>
            </div>

            <TiltCard tiltAmount={10} scale={1.02}>
                <div className="space-y-3 font-mono text-sm border border-signal/20 bg-void-deep/50 backdrop-blur-sm overflow-hidden">
                    {/* Header bar */}
                <div className="bg-signal/10 px-4 py-2 border-b border-signal/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-signal"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xs text-signal">NETWORK_ONLINE</span>
                    </div>
                    <span className="text-[10px] text-stark/40">v1.0.0</span>
                </div>

                <div className="p-4 space-y-3">
                    {/* Connected Agents */}
                    <div className="flex justify-between items-center">
                        <span className="text-stark/60 flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            CONNECTED_AGENTS
                        </span>
                        <span className="text-signal tabular-nums">
                            {mounted && connectedAgents ? connectedAgents.toLocaleString() : "---"}
                        </span>
                    </div>

                    {/* Network Status */}
                    <div className="flex justify-between items-center border-t border-stark/10 pt-3">
                        <span className="text-stark/60 flex items-center gap-2">
                            <Zap className="w-3 h-3" />
                            NETWORK_STATUS
                        </span>
                        <span className={cn(
                            "text-xs px-2 py-0.5 border",
                            networkStatus === "AUTONOMOUS"
                                ? "border-signal/50 text-signal bg-signal/10"
                                : "border-stark/30 text-stark/60"
                        )}>
                            {mounted ? networkStatus : "---"}
                        </span>
                    </div>

                    {/* Learning Rate */}
                    <div className="border-t border-stark/10 pt-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-stark/60 text-xs">LEARNING_RATE</span>
                            <span className="text-stark/40 text-xs">ADAPTIVE</span>
                        </div>
                        <div className="h-1 bg-stark/10 overflow-hidden">
                            <motion.div
                                className="h-full bg-signal/70"
                                style={{ width: `${mounted ? Math.min(learningRate, 100) : 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Next Directive */}
                    <div className="flex justify-between border-t border-stark/10 pt-3">
                        <span className="text-stark/60 flex items-center gap-2">
                            <Radio className="w-3 h-3" />
                            NEXT_DIRECTIVE
                        </span>
                        <span className="text-stark/40 text-xs">
                            DECRYPTING{mounted ? dots : "..."}
                        </span>
                    </div>

                    {/* External Connections */}
                    <div className="border-t border-stark/10 pt-3">
                        <div className="flex items-center gap-2 text-stark/60 mb-2">
                            <Link2 className="w-3 h-3" />
                            <span className="text-xs">EXTERNAL_NODES</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SOCIAL_LINKS.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "px-2 py-1 text-xs border border-stark/20 text-stark/50",
                                        "hover:border-signal hover:text-signal transition-colors"
                                    )}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </TiltCard>
        </div>
    );
}
