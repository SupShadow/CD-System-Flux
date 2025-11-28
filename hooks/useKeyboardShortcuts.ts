"use client";

import { useEffect, useRef } from "react";

export interface KeyboardShortcutHandlers {
    onPlayPause?: () => void;
    onNextTrack?: () => void;
    onPrevTrack?: () => void;
    onToggleMute?: () => void;
    onToggleFullscreen?: () => void;
    onTogglePlaylist?: () => void;
    onShowHelp?: () => void;
    onEscape?: () => void;
}

/**
 * Global keyboard shortcuts for the audio player
 * - Space: Play/Pause
 * - ArrowRight: Next track
 * - ArrowLeft: Previous track
 * - M: Mute/Unmute
 * - F: Fullscreen visualizer
 * - L: Toggle playlist
 * - ?: Show help
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
    // Use a ref to store handlers to avoid re-registering event listener on every render
    const handlersRef = useRef(handlers);

    // Keep handlers ref up to date synchronously (more efficient than useEffect)
    handlersRef.current = handlers;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            const currentHandlers = handlersRef.current;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    currentHandlers.onPlayPause?.();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    currentHandlers.onNextTrack?.();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    currentHandlers.onPrevTrack?.();
                    break;
                case "KeyM":
                    e.preventDefault();
                    currentHandlers.onToggleMute?.();
                    break;
                case "KeyF":
                    e.preventDefault();
                    currentHandlers.onToggleFullscreen?.();
                    break;
                case "KeyL":
                    e.preventDefault();
                    currentHandlers.onTogglePlaylist?.();
                    break;
                case "Slash":
                    // ? key (Shift + /)
                    if (e.shiftKey) {
                        e.preventDefault();
                        currentHandlers.onShowHelp?.();
                    }
                    break;
                case "Escape":
                    currentHandlers.onEscape?.();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []); // Empty dependency array - handler is registered only once
}

// Shortcut definitions for help display
export const KEYBOARD_SHORTCUTS = [
    { key: "Space", action: "PLAY_PAUSE" },
    { key: "←", action: "PREV_TRACK" },
    { key: "→", action: "NEXT_TRACK" },
    { key: "M", action: "MUTE_TOGGLE" },
    { key: "F", action: "FULLSCREEN" },
    { key: "L", action: "PLAYLIST" },
    { key: "?", action: "SHOW_HELP" },
];
