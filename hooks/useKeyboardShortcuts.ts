"use client";

import { useEffect, useCallback } from "react";

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
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in inputs
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
            return;
        }

        switch (e.code) {
            case "Space":
                e.preventDefault();
                handlers.onPlayPause?.();
                break;
            case "ArrowRight":
                e.preventDefault();
                handlers.onNextTrack?.();
                break;
            case "ArrowLeft":
                e.preventDefault();
                handlers.onPrevTrack?.();
                break;
            case "KeyM":
                e.preventDefault();
                handlers.onToggleMute?.();
                break;
            case "KeyF":
                e.preventDefault();
                handlers.onToggleFullscreen?.();
                break;
            case "KeyL":
                e.preventDefault();
                handlers.onTogglePlaylist?.();
                break;
            case "Slash":
                // ? key (Shift + /)
                if (e.shiftKey) {
                    e.preventDefault();
                    handlers.onShowHelp?.();
                }
                break;
            case "Escape":
                handlers.onEscape?.();
                break;
        }
    }, [handlers]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
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
