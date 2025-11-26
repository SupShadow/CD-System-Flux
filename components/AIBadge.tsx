"use client";

import { useState, useEffect } from "react";

export default function AIBadge() {
    const [isHovered, setIsHovered] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <a
            href="https://derguggeis.de"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Erstellt von Guggeis.AI (öffnet in neuem Fenster)"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="beat-pulse"
            style={{
                position: "fixed",
                bottom: "144px",
                right: "16px",
                zIndex: 60,
                display: "block",
            }}
        >
            <div
                style={{
                    position: "relative",
                    padding: "6px 12px",
                    backgroundColor: "rgba(10, 10, 15, 0.95)",
                    backdropFilter: "blur(4px)",
                    border: `1px solid ${isHovered ? "rgba(255, 69, 0, 0.9)" : "rgba(255, 69, 0, 0.4)"}`,
                    boxShadow: isHovered
                        ? "0 0 20px rgba(255, 69, 0, 0.3), inset 0 0 20px rgba(255, 69, 0, 0.05)"
                        : "none",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                }}
            >
                {/* Scan line effect */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, transparent, rgba(255, 69, 0, 0.1), transparent)",
                        transform: isHovered ? "translateY(100%)" : "translateY(-100%)",
                        transition: "transform 0.8s linear",
                        pointerEvents: "none",
                    }}
                />

                {/* Content */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Pulsing icon */}
                    <span
                        style={{
                            fontSize: "12px",
                            animation: "pulse 2s ease-in-out infinite",
                        }}
                    >
                        ⚡
                    </span>

                    {/* Text */}
                    <span
                        style={{
                            fontFamily: "monospace",
                            fontSize: "10px",
                            letterSpacing: "0.05em",
                            color: isHovered ? "#e0e0e0" : "rgba(224, 224, 224, 0.7)",
                            transition: "color 0.3s",
                        }}
                    >
                        CRAFTED BY{" "}
                        <span
                            style={{
                                color: "#FF4500",
                                fontWeight: "bold",
                                display: "inline-block",
                                textShadow: isHovered
                                    ? "2px 0 0 #00ffff, -2px 0 0 #ff00ff"
                                    : "none",
                                transition: "text-shadow 0.3s",
                            }}
                        >
                            GUGGEIS.AI
                        </span>
                    </span>
                </div>

                {/* Corner brackets */}
                <div style={{ position: "absolute", top: 0, left: 0, width: "8px", height: "8px", borderTop: "1px solid rgba(255, 69, 0, 0.6)", borderLeft: "1px solid rgba(255, 69, 0, 0.6)" }} />
                <div style={{ position: "absolute", top: 0, right: 0, width: "8px", height: "8px", borderTop: "1px solid rgba(255, 69, 0, 0.6)", borderRight: "1px solid rgba(255, 69, 0, 0.6)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "8px", height: "8px", borderBottom: "1px solid rgba(255, 69, 0, 0.6)", borderLeft: "1px solid rgba(255, 69, 0, 0.6)" }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "8px", height: "8px", borderBottom: "1px solid rgba(255, 69, 0, 0.6)", borderRight: "1px solid rgba(255, 69, 0, 0.6)" }} />
            </div>

            {/* Status indicator dot */}
            <div
                style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#FF4500",
                    animation: "pulse 1.5s ease-in-out infinite",
                }}
            />

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                }
            `}</style>
        </a>
    );
}
