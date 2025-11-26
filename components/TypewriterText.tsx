"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterTextProps {
    text: string;
    speed?: number; // ms per character
    className?: string;
    onComplete?: () => void;
    cursor?: boolean;
}

export default function TypewriterText({
    text,
    speed = 50,
    className = "",
    onComplete,
    cursor = true,
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const previousTextRef = useRef(text);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        // Only trigger typewriter effect if text actually changed
        if (text !== previousTextRef.current) {
            previousTextRef.current = text;
            setDisplayedText("");
            setIsTyping(true);

            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Start typing animation
            let currentIndex = 0;
            const typeNextChar = () => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                    timeoutRef.current = setTimeout(typeNextChar, speed + Math.random() * 30);
                } else {
                    setIsTyping(false);
                    onComplete?.();
                }
            };

            // Small delay before starting
            timeoutRef.current = setTimeout(typeNextChar, 100);
        } else if (displayedText === "") {
            // Initial render - show text immediately
            setDisplayedText(text);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [text, speed, onComplete]);

    // Cursor blink effect
    useEffect(() => {
        if (!cursor) return;

        const blinkInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => clearInterval(blinkInterval);
    }, [cursor]);

    return (
        <span className={className}>
            {displayedText}
            {cursor && (
                <motion.span
                    className="inline-block ml-0.5"
                    animate={{ opacity: isTyping ? 1 : showCursor ? 1 : 0 }}
                    transition={{ duration: 0.1 }}
                >
                    {isTyping ? "▌" : "_"}
                </motion.span>
            )}
        </span>
    );
}
