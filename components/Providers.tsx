"use client";

import { ReactNode } from "react";
import { AudioProvider } from "@/contexts/AudioContext";
import { BeatProvider } from "@/contexts/BeatContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ExperienceProvider } from "@/contexts/ExperienceContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AudioErrorHandler } from "@/components/AudioErrorHandler";
import { AchievementToast } from "@/components/AchievementToast";
import { InfectionOverlay } from "@/components/InfectionOverlay";
import { SecretProvider } from "@/components/SecretChallenges";
import { TimeBasedProvider, TimeAmbientOverlay } from "@/components/TimeBasedContent";
import GlobalSoundEffects from "@/components/GlobalSoundEffects";
import AudioReactiveLayer from "@/components/AudioReactiveLayer";
import TrackThemeProvider from "@/components/TrackThemeProvider";
import GlitchTransition from "@/components/GlitchTransition";
import SafeModeToggle from "@/components/SafeModeToggle";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <AccessibilityProvider>
                <ExperienceProvider>
                    <SecretProvider>
                        <TimeBasedProvider>
                            <ToastProvider>
                                <SoundProvider>
                                    <GlobalSoundEffects />
                                    <AudioProvider>
                                        <BeatProvider>
                                            <AudioErrorHandler />
                                            <AudioReactiveLayer />
                                            <TrackThemeProvider />
                                            <GlitchTransition />
                                            <SafeModeToggle />
                                            <AchievementToast />
                                            <InfectionOverlay />
                                            <TimeAmbientOverlay />
                                            {children}
                                        </BeatProvider>
                                    </AudioProvider>
                                </SoundProvider>
                            </ToastProvider>
                        </TimeBasedProvider>
                    </SecretProvider>
                </ExperienceProvider>
            </AccessibilityProvider>
        </ErrorBoundary>
    );
}
