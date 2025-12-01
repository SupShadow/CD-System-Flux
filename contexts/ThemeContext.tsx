"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Theme definitions
export const THEMES = {
    signal: {
        id: "signal",
        name: "SIGNAL",
        primary: "#FF4500",
        secondary: "#1a1a1a",
        accent: "#FF6B35",
        glow: "rgba(255, 69, 0, 0.5)",
    },
    cyber: {
        id: "cyber",
        name: "CYBER",
        primary: "#00D4FF",
        secondary: "#0a1a1f",
        accent: "#00F5FF",
        glow: "rgba(0, 212, 255, 0.5)",
    },
    neon: {
        id: "neon",
        name: "NEON",
        primary: "#FF00FF",
        secondary: "#1a0a1a",
        accent: "#FF44FF",
        glow: "rgba(255, 0, 255, 0.5)",
    },
    matrix: {
        id: "matrix",
        name: "MATRIX",
        primary: "#39FF14",
        secondary: "#0a1a0a",
        accent: "#50FF30",
        glow: "rgba(57, 255, 20, 0.5)",
    },
    minimal: {
        id: "minimal",
        name: "MINIMAL",
        primary: "#FFFFFF",
        secondary: "#111111",
        accent: "#CCCCCC",
        glow: "rgba(255, 255, 255, 0.3)",
    },
} as const;

export type ThemeId = keyof typeof THEMES;
export type Theme = typeof THEMES[ThemeId];

interface ThemeContextType {
    theme: Theme;
    themeId: ThemeId;
    setTheme: (id: ThemeId) => void;
    cycleTheme: () => void;
    allThemes: typeof THEMES;
    usedThemes: Set<ThemeId>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "flux-theme";
const USED_THEMES_KEY = "flux-used-themes";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeId, setThemeId] = useState<ThemeId>("signal");
    const [usedThemes, setUsedThemes] = useState<Set<ThemeId>>(new Set(["signal"]));
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
        if (saved && THEMES[saved]) {
            setThemeId(saved);
        }

        // Load used themes
        const savedUsed = localStorage.getItem(USED_THEMES_KEY);
        if (savedUsed) {
            try {
                const parsed = JSON.parse(savedUsed) as ThemeId[];
                setUsedThemes(new Set(parsed));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    // Apply CSS variables when theme changes
    useEffect(() => {
        if (!mounted) return;

        const theme = THEMES[themeId];
        const root = document.documentElement;

        // Set CSS custom properties
        root.style.setProperty("--theme-primary", theme.primary);
        root.style.setProperty("--theme-secondary", theme.secondary);
        root.style.setProperty("--theme-accent", theme.accent);
        root.style.setProperty("--theme-glow", theme.glow);

        // Also update the signal color for consistency
        root.style.setProperty("--color-signal", theme.primary);

        // Persist to localStorage
        localStorage.setItem(STORAGE_KEY, themeId);

        // Track used themes
        setUsedThemes(prev => {
            const updated = new Set(prev);
            updated.add(themeId);
            localStorage.setItem(USED_THEMES_KEY, JSON.stringify([...updated]));
            return updated;
        });
    }, [themeId, mounted]);

    const setTheme = useCallback((id: ThemeId) => {
        if (THEMES[id]) {
            setThemeId(id);
        }
    }, []);

    const cycleTheme = useCallback(() => {
        const themeIds = Object.keys(THEMES) as ThemeId[];
        const currentIndex = themeIds.indexOf(themeId);
        const nextIndex = (currentIndex + 1) % themeIds.length;
        setThemeId(themeIds[nextIndex]);
    }, [themeId]);

    const value: ThemeContextType = {
        theme: THEMES[themeId],
        themeId,
        setTheme,
        cycleTheme,
        allThemes: THEMES,
        usedThemes,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
