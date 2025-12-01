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
    // New shortcuts
    onSeekBackward?: () => void;  // J - 10 seconds back
    onSeekForward?: () => void;   // K - 10 seconds forward
    onSeekPercent?: (percent: number) => void;  // 0-9 keys
    onToggleTheme?: () => void;   // T - cycle themes
    onToggleRepeat?: () => void;  // R - repeat toggle
    onToggleShuffle?: () => void; // S - shuffle toggle
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
 * - J: Seek 10s backward
 * - K: Seek 10s forward
 * - 0-9: Jump to 0-90% of track
 * - T: Cycle theme
 * - R: Toggle repeat
 * - S: Toggle shuffle
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
                case "KeyJ":
                    e.preventDefault();
                    currentHandlers.onSeekBackward?.();
                    break;
                case "KeyK":
                    e.preventDefault();
                    currentHandlers.onSeekForward?.();
                    break;
                case "KeyT":
                    e.preventDefault();
                    currentHandlers.onToggleTheme?.();
                    break;
                case "KeyR":
                    e.preventDefault();
                    currentHandlers.onToggleRepeat?.();
                    break;
                case "KeyS":
                    e.preventDefault();
                    currentHandlers.onToggleShuffle?.();
                    break;
                // Number keys 0-9 for seeking to percentage
                case "Digit0":
                case "Digit1":
                case "Digit2":
                case "Digit3":
                case "Digit4":
                case "Digit5":
                case "Digit6":
                case "Digit7":
                case "Digit8":
                case "Digit9":
                    e.preventDefault();
                    const digit = parseInt(e.code.replace("Digit", ""), 10);
                    currentHandlers.onSeekPercent?.(digit * 10);
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
    { key: "J", action: "SEEK_BACK_10S" },
    { key: "K", action: "SEEK_FWD_10S" },
    { key: "0-9", action: "JUMP_TO_%" },
    { key: "M", action: "MUTE_TOGGLE" },
    { key: "F", action: "FULLSCREEN" },
    { key: "L", action: "PLAYLIST" },
    { key: "T", action: "CYCLE_THEME" },
    { key: "R", action: "REPEAT" },
    { key: "S", action: "SHUFFLE" },
    { key: "?", action: "SHOW_HELP" },
];
