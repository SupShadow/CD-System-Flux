"use client";

import { motion } from "framer-motion";
import { useTheme, THEMES, ThemeId } from "@/contexts/ThemeContext";
import { Palette, Check } from "lucide-react";

interface ThemePickerProps {
    compact?: boolean;
}

export function ThemePicker({ compact = false }: ThemePickerProps) {
    const { themeId, setTheme, theme } = useTheme();

    const themeIds = Object.keys(THEMES) as ThemeId[];

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Palette size={14} style={{ color: theme.primary }} />
                <div className="flex gap-1">
                    {themeIds.map((id) => (
                        <button
                            key={id}
                            onClick={() => setTheme(id)}
                            className="relative w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                            style={{
                                backgroundColor: THEMES[id].primary,
                                borderColor: themeId === id ? "#FFFFFF" : "transparent",
                            }}
                            title={THEMES[id].name}
                        >
                            {themeId === id && (
                                <Check
                                    size={10}
                                    className="absolute inset-0 m-auto"
                                    style={{ color: id === "minimal" ? "#000" : "#FFF" }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs text-white/60">
                <Palette size={14} style={{ color: theme.primary }} />
                <span>THEME_SELECT</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {themeIds.map((id) => {
                    const t = THEMES[id];
                    const isSelected = themeId === id;

                    return (
                        <motion.button
                            key={id}
                            onClick={() => setTheme(id)}
                            className="relative p-2 border transition-all"
                            style={{
                                borderColor: isSelected ? t.primary : "rgba(255,255,255,0.1)",
                                backgroundColor: isSelected ? `${t.primary}15` : "transparent",
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Color preview */}
                            <div
                                className="w-full aspect-square rounded-sm mb-1"
                                style={{
                                    backgroundColor: t.primary,
                                    boxShadow: isSelected ? `0 0 10px ${t.glow}` : "none",
                                }}
                            />

                            {/* Theme name */}
                            <div
                                className="font-mono text-[8px] text-center truncate"
                                style={{ color: isSelected ? t.primary : "rgba(255,255,255,0.5)" }}
                            >
                                {t.name}
                            </div>

                            {/* Selected indicator */}
                            {isSelected && (
                                <motion.div
                                    className="absolute top-1 right-1"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    <Check size={10} style={{ color: t.primary }} />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="font-mono text-[10px] text-white/30 text-center">
                Press [T] to cycle themes
            </div>
        </div>
    );
}

// Floating theme button for quick access
export function ThemeButton() {
    const { cycleTheme, theme, themeId } = useTheme();

    return (
        <motion.button
            onClick={cycleTheme}
            className="flex items-center gap-2 px-3 py-2 border font-mono text-xs transition-all hover:bg-white/5"
            style={{ borderColor: `${theme.primary}50`, color: theme.primary }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Cycle theme (T)"
        >
            <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.primary }}
            />
            {themeId.toUpperCase()}
        </motion.button>
    );
}
