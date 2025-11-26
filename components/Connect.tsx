"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TiltCard from "./TiltCard";

const SOCIAL_LINKS = [
    {
        name: "SPOTIFY",
        url: "https://open.spotify.com/intl-de/artist/7sftGNX7UKWsHgOumCU2fP",
        color: "#1DB954",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
        ),
    },
    {
        name: "INSTAGRAM",
        url: "https://www.instagram.com/jguggeis/",
        color: "#E4405F",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
        ),
    },
    {
        name: "APPLE MUSIC",
        url: "https://music.apple.com/de/artist/julian-guggeis/956406644",
        color: "#FA243C",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.99c-.042.003-.083.01-.124.013-.492.028-.983.08-1.468.17a5.076 5.076 0 0 0-1.97.81c-1.042.678-1.77 1.604-2.13 2.85a9.93 9.93 0 0 0-.27 2.32c-.003.04-.01.083-.013.124v11.452c.003.04.01.083.013.124.028.54.085 1.08.194 1.612.327 1.318 1.038 2.36 2.15 3.12.518.354 1.088.6 1.708.74.482.113.975.178 1.474.206.045.003.09.01.134.013h12.03c.04-.003.083-.01.124-.013.5-.028.995-.083 1.478-.2a5.076 5.076 0 0 0 1.97-.81c1.042-.678 1.77-1.604 2.13-2.85.17-.59.275-1.196.31-1.81.003-.05.01-.093.013-.14V6.248c-.003-.042-.01-.083-.013-.124zM17.994 10.63v5.87c0 .53-.09 1.03-.33 1.49-.34.65-.87 1.08-1.55 1.31-.38.13-.77.2-1.17.23-.67.05-1.3-.09-1.88-.43-.7-.42-1.11-1.04-1.18-1.87-.06-.73.17-1.35.67-1.87.52-.54 1.17-.85 1.91-.96.46-.07.92-.08 1.38-.12.36-.03.71-.08 1.04-.23.24-.11.38-.29.4-.55.01-.1.01-.2.01-.3V8.47c0-.2-.06-.35-.24-.43-.13-.06-.27-.08-.41-.08-.64.07-1.29.15-1.93.23-1.21.15-2.42.3-3.63.45-.29.04-.43.17-.45.46-.01.08 0 .16 0 .24v7.49c0 .53-.09 1.03-.33 1.49-.34.65-.87 1.08-1.55 1.31-.38.13-.77.2-1.17.23-.67.05-1.3-.09-1.88-.43-.7-.42-1.11-1.04-1.18-1.87-.06-.73.17-1.35.67-1.87.52-.54 1.17-.85 1.91-.96.46-.07.92-.08 1.38-.12.36-.03.72-.08 1.05-.23.23-.11.37-.29.4-.54.01-.1.01-.2.01-.31V6.25c0-.34.11-.55.43-.64.21-.06.42-.08.64-.11l3.58-.44c1.19-.15 2.39-.29 3.58-.44.36-.04.72-.09 1.08-.13.27-.03.49.1.57.36.03.1.04.2.04.31v5.47z"/>
            </svg>
        ),
    },
    {
        name: "GITHUB",
        url: "https://github.com/SupShadow",
        color: "#ffffff",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
        ),
    },
];

export default function Connect() {
    const [mounted, setMounted] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-2 text-signal">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-signal/30 to-transparent" />
                <h2 className="font-mono text-sm tracking-widest px-4">CONNECT</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-signal/30 to-transparent" />
            </div>

            <TiltCard tiltAmount={5} scale={1.01}>
                <div className="relative border border-signal/20 bg-void-deep/50 backdrop-blur-sm p-8 overflow-hidden">
                    {/* Subtle animated background */}
                    <div className="absolute inset-0 opacity-[0.03]">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `radial-gradient(circle at 50% 50%, #FF4500 1px, transparent 1px)`,
                                backgroundSize: "32px 32px",
                            }}
                        />
                    </div>

                    {/* Social links grid */}
                    <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-6">
                        {SOCIAL_LINKS.map((link, index) => (
                            <motion.a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex flex-col items-center gap-2 p-4 min-w-[100px]"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                            >
                                {/* Glow effect on hover */}
                                <motion.div
                                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: `radial-gradient(circle at 50% 50%, ${link.color}15 0%, transparent 70%)`,
                                    }}
                                />

                                {/* Icon container */}
                                <motion.div
                                    className="relative p-3 border border-stark/20 bg-void/50 transition-all duration-300 group-hover:border-opacity-0"
                                    style={{
                                        borderColor: hoveredIndex === index ? link.color : undefined,
                                        boxShadow: hoveredIndex === index ? `0 0 20px ${link.color}30` : undefined,
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div
                                        className="text-stark/60 transition-colors duration-300"
                                        style={{ color: hoveredIndex === index ? link.color : undefined }}
                                        aria-hidden="true"
                                    >
                                        {link.icon}
                                    </div>
                                </motion.div>

                                {/* Label */}
                                <span
                                    className="font-mono text-[10px] tracking-wider text-stark/40 transition-colors duration-300"
                                    style={{ color: hoveredIndex === index ? link.color : undefined }}
                                >
                                    {link.name}
                                </span>
                                <span className="sr-only"> (öffnet in neuem Fenster)</span>

                                {/* Underline on hover */}
                                <motion.div
                                    className="absolute bottom-0 left-1/2 h-px"
                                    style={{ backgroundColor: link.color }}
                                    initial={{ width: 0, x: "-50%" }}
                                    animate={{
                                        width: hoveredIndex === index ? "60%" : 0,
                                        x: "-50%"
                                    }}
                                    transition={{ duration: 0.2 }}
                                />
                            </motion.a>
                        ))}
                    </div>

                    {/* Status line */}
                    <div className="relative z-10 flex justify-center mt-6 pt-4 border-t border-stark/10">
                        <span className="font-mono text-[10px] text-stark/30 tracking-wider">
                            NODE_STATUS: <span className="text-signal/60">ACTIVE</span>
                        </span>
                    </div>
                </div>
            </TiltCard>
        </div>
    );
}
