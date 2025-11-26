"use client";

import { ReactNode } from "react";
import { AudioProvider } from "@/contexts/AudioContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AudioErrorHandler } from "@/components/AudioErrorHandler";
import GlobalSoundEffects from "@/components/GlobalSoundEffects";
import AudioReactiveLayer from "@/components/AudioReactiveLayer";
import TrackThemeProvider from "@/components/TrackThemeProvider";
import SafeModeToggle from "@/components/SafeModeToggle";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <AccessibilityProvider>
                <ToastProvider>
                    <SoundProvider>
                        <GlobalSoundEffects />
                        <AudioProvider>
                            <AudioErrorHandler />
                            <AudioReactiveLayer />
                            <TrackThemeProvider />
                            <SafeModeToggle />
                            {children}
                        </AudioProvider>
                    </SoundProvider>
                </ToastProvider>
            </AccessibilityProvider>
        </ErrorBoundary>
    );
}
