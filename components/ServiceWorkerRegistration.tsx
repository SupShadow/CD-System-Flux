"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            // Handler for registering service worker
            const handleLoad = () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then((registration) => {
                        console.log("[PWA] Service Worker registered:", registration.scope);

                        // Check for updates
                        registration.addEventListener("updatefound", () => {
                            const newWorker = registration.installing;
                            if (newWorker) {
                                newWorker.addEventListener("statechange", () => {
                                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                        // New content available
                                        console.log("[PWA] New content available, refresh to update");
                                    }
                                });
                            }
                        });
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

            // Cleanup: remove event listener on unmount
            return () => {
                window.removeEventListener("load", handleLoad);
            };
        }
    }, []);

    return null;
}
