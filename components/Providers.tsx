"use client";

import { ReactNode } from "react";
import { AudioProvider } from "@/contexts/AudioContext";
import { BeatProvider } from "@/contexts/BeatContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ExperienceProvider } from "@/contexts/ExperienceContext";
import { SecretProvider } from "@/components/SecretChallenges";
import { TimeBasedProvider } from "@/components/TimeBasedContent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SafeModeToggle from "@/components/SafeModeToggle";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <TimeBasedProvider>
                <AccessibilityProvider>
                    <ExperienceProvider>
                    <SecretProvider>
                        <ToastProvider>
                            <SoundProvider>
                                <AudioProvider>
                                    <BeatProvider>
                                        <SafeModeToggle />
                                        {children}
                                    </BeatProvider>
                                </AudioProvider>
                            </SoundProvider>
                        </ToastProvider>
                    </SecretProvider>
                    </ExperienceProvider>
                </AccessibilityProvider>
            </TimeBasedProvider>
        </ErrorBoundary>
    );
}
