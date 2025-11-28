"use client";

import { useEffect, useRef } from "react";
import { getBasePath } from "@/lib/utils";

export default function ServiceWorkerRegistration() {
    const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
    const newWorkerRef = useRef<ServiceWorker | null>(null);
    const updateFoundHandlerRef = useRef<(() => void) | null>(null);
    const stateChangeHandlerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            // Handler for registering service worker
            const swPath = `${getBasePath()}/sw.js`;
            const handleLoad = () => {
                navigator.serviceWorker
                    .register(swPath)
                    .then((registration) => {
                        console.log("[PWA] Service Worker registered:", registration.scope);
                        registrationRef.current = registration;

                        // Define updatefound handler
                        const handleUpdateFound = () => {
                            try {
                                const newWorker = registration.installing;
                                if (newWorker) {
                                    newWorkerRef.current = newWorker;

                                    // Define statechange handler
                                    const handleStateChange = () => {
                                        try {
                                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                                // New content available
                                                console.log("[PWA] New content available, refresh to update");
                                            }
                                        } catch (error) {
                                            console.warn("[PWA] Error in statechange handler:", error);
                                        }
                                    };
                                    stateChangeHandlerRef.current = handleStateChange;
                                    newWorker.addEventListener("statechange", handleStateChange);
                                }
                            } catch (error) {
                                console.warn("[PWA] Error in updatefound handler:", error);
                            }
                        };
                        updateFoundHandlerRef.current = handleUpdateFound;

                        // Check for updates
                        registration.addEventListener("updatefound", handleUpdateFound);
                    })
                    .catch((error) => {
                        console.error("[PWA] Service Worker registration failed:", error);
                    });
            };

            // Register service worker after page load
            // Check if page already loaded (for hot reloads)
            if (document.readyState === "complete") {
                handleLoad();
            } else {
                window.addEventListener("load", handleLoad);
            }

            // Cleanup: remove all event listeners on unmount
            return () => {
                window.removeEventListener("load", handleLoad);

                // Remove updatefound listener
                if (registrationRef.current && updateFoundHandlerRef.current) {
                    registrationRef.current.removeEventListener("updatefound", updateFoundHandlerRef.current);
                }

                // Remove statechange listener
                if (newWorkerRef.current && stateChangeHandlerRef.current) {
                    newWorkerRef.current.removeEventListener("statechange", stateChangeHandlerRef.current);
                }
            };
        }
    }, []);

    return null;
}
