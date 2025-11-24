"use client";

import { motion } from "framer-motion";

export default function MeltingSquare() {
    return (
        <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
            {/* SVG Filter Definition */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="melt">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.01"
                            numOctaves="3"
                            result="noise"
                        >
                            <animate
                                attributeName="baseFrequency"
                                dur="10s"
                                values="0.01;0.05;0.02"
                                repeatCount="indefinite"
                            />
                        </feTurbulence>
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="20"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                    <filter id="glitch-heavy">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.5"
                            numOctaves="1"
                            result="noise"
                        />
                        <feColorMatrix
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
                            in="noise"
                            result="coloredNoise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="coloredNoise"
                            scale="10"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            {/* The Square */}
            <motion.div
                className="w-32 h-32 bg-stark relative z-10"
                style={{ filter: "url(#melt)" }}
                animate={{
                    scale: [1, 1.05, 0.95, 1],
                    rotate: [0, 1, -1, 0],
                    filter: [
                        "url(#melt)",
                        "url(#melt)",
                        "url(#glitch-heavy)",
                        "url(#melt)",
                    ],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    times: [0, 0.8, 0.85, 1],
                }}
            >
                {/* Inner Glitch Elements */}
                <div className="absolute inset-0 bg-signal mix-blend-exclusion opacity-50 animate-pulse"></div>
            </motion.div>

            {/* Background Glow/Bleed */}
            <div className="absolute inset-0 bg-signal/20 blur-3xl rounded-full opacity-20 animate-pulse"></div>
        </div>
    );
}
