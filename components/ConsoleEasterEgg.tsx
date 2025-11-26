"use client";

import { useEffect } from "react";

export default function ConsoleEasterEgg() {
    useEffect(() => {
        // Delay to ensure it runs after initial page load
        const timer = setTimeout(() => {
            const styles = {
                title: "color: #FF4500; font-size: 24px; font-weight: bold;",
                subtitle: "color: #888; font-size: 12px;",
                link: "color: #FF4500; font-size: 14px; font-weight: bold;",
                ascii: "color: #FF4500; font-size: 10px; font-family: monospace;",
            };

            console.log(`%c
███████╗██╗     ██╗   ██╗██╗  ██╗     ██████╗ ███████╗
██╔════╝██║     ██║   ██║╚██╗██╔╝    ██╔═══██╗██╔════╝
█████╗  ██║     ██║   ██║ ╚███╔╝     ██║   ██║███████╗
██╔══╝  ██║     ██║   ██║ ██╔██╗     ██║   ██║╚════██║
██║     ███████╗╚██████╔╝██╔╝ ██╗    ╚██████╔╝███████║
╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝     ╚═════╝ ╚══════╝
            `, styles.ascii);

            console.log("%c🤖 FLUX_OS v1.0", styles.title);
            console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", styles.subtitle);
            console.log("%cBuilt with Guggeis.AI", styles.subtitle);
            console.log("%c", "");
            console.log("%cInterested? → https://derguggeis.de", styles.link);
            console.log("%c", "");
            console.log("%c⚡ System Status: ONLINE", styles.subtitle);
            console.log("%c🔊 Audio Modules: READY", styles.subtitle);
            console.log("%c🧠 Neural Network: ACTIVE", styles.subtitle);
            console.log("%c", "");
            console.log("%cType 'help()' for available commands...", styles.subtitle);

            // Add fun console commands
            (window as unknown as Record<string, () => void>).help = () => {
                console.log("%c📖 Available Commands:", styles.title);
                console.log("%cflux()     - Show system info", styles.subtitle);
                console.log("%cagent()    - Activate agent mode", styles.subtitle);
                console.log("%cmatrix()   - Enter the matrix", styles.subtitle);
            };

            (window as unknown as Record<string, () => void>).flux = () => {
                console.log("%c⚡ FLUX_OS System Info", styles.title);
                console.log("%cVersion: 1.0.0", styles.subtitle);
                console.log("%cArtist: Julian Guggeis", styles.subtitle);
                console.log("%cAlbum: System Flux", styles.subtitle);
                console.log("%cStatus: All systems operational", styles.subtitle);
            };

            (window as unknown as Record<string, () => void>).agent = () => {
                console.log("%c🤖 AGENT MODE ACTIVATED", styles.title);
                console.log("%cInitializing neural pathways...", styles.subtitle);
                setTimeout(() => console.log("%cConnecting to audio matrix...", styles.subtitle), 500);
                setTimeout(() => console.log("%cSyncing frequency patterns...", styles.subtitle), 1000);
                setTimeout(() => console.log("%c✓ Agent fully operational", styles.link), 1500);
            };

            (window as unknown as Record<string, () => void>).matrix = () => {
                const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";
                let output = "";
                for (let i = 0; i < 10; i++) {
                    let line = "";
                    for (let j = 0; j < 50; j++) {
                        line += chars[Math.floor(Math.random() * chars.length)];
                    }
                    output += line + "\n";
                }
                console.log("%c" + output, "color: #0F0; font-family: monospace;");
            };
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
