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
    // Tracking callback for secret unlocking
    onShortcutUsed?: (shortcut: string) => void;
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

            let shortcutName: string | null = null;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    currentHandlers.onPlayPause?.();
                    shortcutName = "space";
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    currentHandlers.onNextTrack?.();
                    shortcutName = "arrow_right";
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    currentHandlers.onPrevTrack?.();
                    shortcutName = "arrow_left";
                    break;
                case "KeyM":
                    e.preventDefault();
                    currentHandlers.onToggleMute?.();
                    shortcutName = "m";
                    break;
                case "KeyF":
                    e.preventDefault();
                    currentHandlers.onToggleFullscreen?.();
                    shortcutName = "f";
                    break;
                case "KeyL":
                    e.preventDefault();
                    currentHandlers.onTogglePlaylist?.();
                    shortcutName = "l";
                    break;
                case "Slash":
                    // ? key (Shift + /)
                    if (e.shiftKey) {
                        e.preventDefault();
                        currentHandlers.onShowHelp?.();
                        shortcutName = "?";
                    }
                    break;
                case "Escape":
                    currentHandlers.onEscape?.();
                    shortcutName = "escape";
                    break;
                case "KeyJ":
                    e.preventDefault();
                    currentHandlers.onSeekBackward?.();
                    shortcutName = "j";
                    break;
                case "KeyK":
                    e.preventDefault();
                    currentHandlers.onSeekForward?.();
                    shortcutName = "k";
                    break;
                case "KeyT":
                    e.preventDefault();
                    currentHandlers.onToggleTheme?.();
                    shortcutName = "t";
                    break;
                case "KeyR":
                    e.preventDefault();
                    currentHandlers.onToggleRepeat?.();
                    shortcutName = "r";
                    break;
                case "KeyS":
                    e.preventDefault();
                    currentHandlers.onToggleShuffle?.();
                    shortcutName = "s";
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
                    shortcutName = `digit_${digit}`;
                    break;
            }

            // Track shortcut usage for secret unlocking
            if (shortcutName) {
                currentHandlers.onShortcutUsed?.(shortcutName);
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
