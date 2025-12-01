"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/contexts/ExperienceContext";
import { Book, Code, Zap, Copy, Check, ChevronDown, ChevronRight, Terminal, Cpu, Layers } from "lucide-react";

interface DocSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: string;
}

const DOC_SECTIONS: DocSection[] = [
    {
        id: "quickstart",
        title: "Quick Start",
        icon: <Zap size={16} />,
        content: `# Quick Start

Create your first visualizer in minutes:

\`\`\`typescript
import { defineVisualizer, rgba } from '@/lib/visualizer-sdk';

export const myVisualizer = defineVisualizer({
    id: 'my-visualizer',
    name: 'My Visualizer',
    author: 'Your Name',
    description: 'My first custom visualizer',

    render: ({ ctx, canvas, metrics, color, centerX, centerY }) => {
        const { bassAvg } = metrics;

        // Clear canvas
        ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw a bass-reactive circle
        const radius = 50 + bassAvg * 100;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.8);
        ctx.fill();
    }
});
\`\`\``,
    },
    {
        id: "context",
        title: "Visualizer Context",
        icon: <Cpu size={16} />,
        content: `# VisualizerContext

Every render function receives a context object with:

\`\`\`typescript
interface VisualizerContext {
    ctx: CanvasRenderingContext2D;  // Canvas 2D context
    canvas: HTMLCanvasElement;       // Canvas element
    time: number;                    // Current time in seconds
    dataArray: Uint8Array;           // Raw frequency data (256 bins)
    metrics: AudioMetrics;           // Processed audio metrics
    color: string;                   // Current theme color (hex)
    centerX: number;                 // Canvas center X
    centerY: number;                 // Canvas center Y
}

interface AudioMetrics {
    bassAvg: number;   // 0-1, average of 0-10 Hz bins
    midAvg: number;    // 0-1, average of 10-50 Hz bins
    highAvg: number;   // 0-1, average of 50+ Hz bins
}
\`\`\``,
    },
    {
        id: "state",
        title: "State Management",
        icon: <Layers size={16} />,
        content: `# State Management

For visualizers that need persistent state:

\`\`\`typescript
interface MyState {
    particles: Array<{ x: number; y: number }>;
    lastBeat: number;
}

export const myVisualizer = defineVisualizer<MyState>({
    id: 'stateful-viz',
    name: 'Stateful Visualizer',
    author: 'Developer',
    description: 'Uses persistent state',

    // Initialize state when visualizer loads
    init: (canvas) => ({
        particles: [],
        lastBeat: 0,
    }),

    // Use state in render
    render: (context, state) => {
        if (!state) return;
        // Access state.particles, state.lastBeat, etc.
    },

    // Handle canvas resize
    onResize: (canvas, state) => {
        // Adjust particles to new canvas size
        return state;
    },

    // Cleanup when visualizer unloads
    cleanup: (state) => {
        // Clean up any resources
    }
});
\`\`\``,
    },
    {
        id: "utilities",
        title: "SDK Utilities",
        icon: <Code size={16} />,
        content: `# SDK Utilities

Helper functions available in the SDK:

\`\`\`typescript
import {
    // Color utilities
    rgba,              // rgba(hex, alpha) => "rgba(r,g,b,a)"
    hexToRgb,          // hexToRgb("#FF4500") => { r, g, b }

    // Drawing helpers
    drawCorners,       // Draw corner decorations
    clearWithFade,     // Clear with fade effect
    drawHeart,         // Draw heart shape
    drawGlowLine,      // Line with glow effect
    drawGlowCircle,    // Circle with glow effect

    // Gradients
    createColorGradient,   // Linear gradient
    createRadialGradient,  // Radial gradient

    // Math helpers
    polarToCartesian,  // (cx, cy, r, angle) => { x, y }
    lerp,              // Linear interpolation
    clamp,             // Clamp value to range
    mapAudioToRange,   // Map frequency data to range
    getFrequencyBin,   // Get bin for frequency (Hz)
} from '@/lib/visualizer-sdk';
\`\`\``,
    },
    {
        id: "examples",
        title: "Example Plugins",
        icon: <Terminal size={16} />,
        content: `# Example Plugins

Check out these example visualizers in \`lib/visualizer-plugins/\`:

1. **spiral.ts** - Spiral Galaxy
   - Audio-reactive spiral arms
   - Simple state management
   - Polar coordinates

2. **particle-field.ts** - Particle Field
   - 150 interconnected particles
   - Complex state management
   - Frequency-based movement

3. **waveform-rings.ts** - Waveform Rings
   - Concentric frequency rings
   - Frequency band separation
   - Subtle animations

4. **glitch-grid.ts** - Glitch Grid
   - Cyberpunk perspective grid
   - Peak detection for glitches
   - Scanline effects

Each demonstrates different SDK features and patterns.`,
    },
];

interface DevDocsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DevDocs({ isOpen, onClose }: DevDocsProps) {
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();
    const [activeSection, setActiveSection] = useState("quickstart");
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyCode = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const currentSection = DOC_SECTIONS.find(s => s.id === activeSection);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex bg-black/90 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="w-64 border-r border-white/10 bg-[#0a0a0a] p-4 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Sidebar header */}
                        <div className="flex items-center gap-2 mb-6">
                            <Book size={20} style={{ color: colors.primary }} />
                            <span className="font-mono text-sm font-bold" style={{ color: colors.primary }}>
                                SDK_DOCS
                            </span>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-1">
                            {DOC_SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 font-mono text-xs text-left transition-colors rounded ${
                                        activeSection === section.id
                                            ? "bg-white/10"
                                            : "hover:bg-white/5"
                                    }`}
                                    style={activeSection === section.id ? { color: colors.primary } : { color: "rgba(255,255,255,0.6)" }}
                                >
                                    {section.icon}
                                    {section.title}
                                </button>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-white/10">
                            <div className="text-xs text-white/40 font-mono">
                                VISUALIZER_SDK v1.0.0
                            </div>
                            <a
                                href="https://github.com/systemflux"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs hover:underline font-mono mt-2 block"
                                style={{ color: colors.primary }}
                            >
                                View on GitHub →
                            </a>
                        </div>
                    </motion.div>

                    {/* Main content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 overflow-y-auto p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/40 hover:text-white font-mono text-sm"
                        >
                            [ESC] CLOSE
                        </button>

                        {currentSection && (
                            <div className="max-w-3xl">
                                <MarkdownContent
                                    content={currentSection.content}
                                    color={colors.primary}
                                    onCopyCode={copyCode}
                                    copiedCode={copiedCode}
                                />
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function MarkdownContent({
    content,
    color,
    onCopyCode,
    copiedCode,
}: {
    content: string;
    color: string;
    onCopyCode: (code: string) => void;
    copiedCode: string | null;
}) {
    const lines = content.split("\n");
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeContent = "";
    let codeLanguage = "";

    lines.forEach((line, index) => {
        if (line.startsWith("```")) {
            if (inCodeBlock) {
                // End of code block
                const code = codeContent.trim();
                elements.push(
                    <div key={index} className="relative my-4 bg-black/50 border border-white/10 rounded">
                        <div className="flex items-center justify-between px-3 py-1 border-b border-white/10">
                            <span className="font-mono text-xs text-white/40">{codeLanguage || "code"}</span>
                            <button
                                onClick={() => onCopyCode(code)}
                                className="flex items-center gap-1 text-xs font-mono transition-colors hover:text-white"
                                style={{ color: copiedCode === code ? color : "rgba(255,255,255,0.4)" }}
                            >
                                {copiedCode === code ? <Check size={12} /> : <Copy size={12} />}
                                {copiedCode === code ? "COPIED" : "COPY"}
                            </button>
                        </div>
                        <pre className="p-4 overflow-x-auto font-mono text-xs text-white/80">
                            {code}
                        </pre>
                    </div>
                );
                codeContent = "";
                inCodeBlock = false;
            } else {
                // Start of code block
                inCodeBlock = true;
                codeLanguage = line.slice(3);
            }
            return;
        }

        if (inCodeBlock) {
            codeContent += line + "\n";
            return;
        }

        // Headers
        if (line.startsWith("# ")) {
            elements.push(
                <h1 key={index} className="text-2xl font-bold font-mono mb-4" style={{ color }}>
                    {line.slice(2)}
                </h1>
            );
            return;
        }

        // List items
        if (line.match(/^\d+\.\s\*\*/)) {
            const match = line.match(/^\d+\.\s\*\*(.+?)\*\*\s*-?\s*(.*)/);
            if (match) {
                elements.push(
                    <div key={index} className="flex gap-2 mb-2 ml-4">
                        <span style={{ color }}>•</span>
                        <span>
                            <strong className="text-white">{match[1]}</strong>
                            {match[2] && <span className="text-white/60"> - {match[2]}</span>}
                        </span>
                    </div>
                );
                return;
            }
        }

        // Regular paragraph
        if (line.trim()) {
            elements.push(
                <p key={index} className="text-white/70 font-mono text-sm mb-2">
                    {line}
                </p>
            );
        }
    });

    return <>{elements}</>;
}

// Button to open docs
export function DevDocsButton({ onClick }: { onClick: () => void }) {
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();

    return (
        <motion.button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 border font-mono text-xs transition-all hover:bg-white/5"
            style={{ borderColor: colors.primary + "50", color: colors.primary }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Book size={14} />
            SDK_DOCS
        </motion.button>
    );
}
