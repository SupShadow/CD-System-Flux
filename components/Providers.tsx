"use client";

import { ReactNode, useEffect, useRef } from "react";
import { AudioProvider } from "@/contexts/AudioContext";
import { BeatProvider } from "@/contexts/BeatContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ExperienceProvider, useExperience } from "@/contexts/ExperienceContext";
import { ThemeProvider, useTheme, THEMES } from "@/contexts/ThemeContext";
import { SecretProvider } from "@/components/SecretChallenges";
import { TimeBasedProvider } from "@/components/TimeBasedContent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SafeModeToggle from "@/components/SafeModeToggle";
import dynamic from "next/dynamic";

// Lazy load onboarding tour (only needed once per user)
const OnboardingTour = dynamic(() => import("./OnboardingTour"), { ssr: false });

// Bridge component to sync theme changes with achievements
function ThemeAchievementBridge() {
    const { usedThemes, themeId } = useTheme();
    const { checkThemeAchievement } = useExperience();
    const prevThemeIdRef = useRef(themeId);

    useEffect(() => {
        // Only trigger on actual theme changes (not initial load)
        if (prevThemeIdRef.current !== themeId) {
            prevThemeIdRef.current = themeId;
            const allThemesUsed = usedThemes.size >= Object.keys(THEMES).length;
            checkThemeAchievement(allThemesUsed);
        }
    }, [themeId, usedThemes.size, checkThemeAchievement]);

    return null;
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <TimeBasedProvider>
                    <AccessibilityProvider>
                        <ExperienceProvider>
                            <ThemeAchievementBridge />
                        <SecretProvider>
                            <ToastProvider>
                                <SoundProvider>
                                    <AudioProvider>
                                        <BeatProvider>
                                            <SafeModeToggle />
                                            <OnboardingTour />
                                            {children}
                                        </BeatProvider>
                                    </AudioProvider>
                                </SoundProvider>
                            </ToastProvider>
                        </SecretProvider>
                        </ExperienceProvider>
                    </AccessibilityProvider>
                </TimeBasedProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
