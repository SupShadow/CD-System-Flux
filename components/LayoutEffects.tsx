"use client";

import dynamic from "next/dynamic";

// Lazy load heavy visual effect components
// These are loaded after initial page render for better LCP

const NeuralBackground = dynamic(() => import("@/components/NeuralBackground"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 -z-10 bg-void" />,
});

const ParallaxLayers = dynamic(() => import("@/components/ParallaxLayers"), {
    ssr: false,
});

const CursorTrail = dynamic(() => import("@/components/CursorTrail"), {
    ssr: false,
});

const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), {
    ssr: false,
});

const AIBadge = dynamic(() => import("@/components/AIBadge"), {
    ssr: false,
});

const ConsoleEasterEgg = dynamic(() => import("@/components/ConsoleEasterEgg"), {
    ssr: false,
});

const SelectionGlitch = dynamic(() => import("@/components/SelectionGlitch"), {
    ssr: false,
});

const ClickExplosion = dynamic(() => import("@/components/ClickExplosion"), {
    ssr: false,
});

const ServiceWorkerRegistration = dynamic(
    () => import("@/components/ServiceWorkerRegistration"),
    { ssr: false }
);

/**
 * Layout visual effects - lazy loaded for better performance
 * These components are non-critical and can load after the main content
 */
export default function LayoutEffects() {
    return (
        <>
            <NeuralBackground />
            <ParallaxLayers />
            <CursorTrail />
            <ScrollProgress position="top" />
            <AIBadge />
            <ConsoleEasterEgg />
            <SelectionGlitch />
            <ClickExplosion />
            <ServiceWorkerRegistration />
        </>
    );
}
