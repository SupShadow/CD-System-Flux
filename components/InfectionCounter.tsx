"use client";

import { useEffect, useState } from "react";

export default function InfectionCounter() {
    const [count, setCount] = useState(8492);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            // Randomly increment by 1-3 every 2-5 seconds
            if (Math.random() > 0.6) {
                setCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-40 font-mono text-xs text-signal/70 bg-void/80 backdrop-blur px-2 py-1 border border-signal/20 rounded">
            SYSTEMS_INFECTED: {count.toLocaleString()}
        </div>
    );
}
