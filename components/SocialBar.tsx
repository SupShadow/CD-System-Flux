"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ShareButton } from "./ShareCard";
import { LeaderboardButton } from "./Leaderboard";
import { GlobalStatsCompact } from "./GlobalStats";

// Lazy load modal components (html2canvas dependency)
const ShareCard = dynamic(
    () => import("./ShareCard").then(mod => ({ default: mod.ShareCard })),
    { ssr: false }
);

const Leaderboard = dynamic(
    () => import("./Leaderboard").then(mod => ({ default: mod.Leaderboard })),
    { ssr: false }
);

export function SocialBar() {
    const [showShare, setShowShare] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    return (
        <>
            {/* Fixed social bar */}
            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
                <GlobalStatsCompact />
                <div className="flex gap-2">
                    <ShareButton onClick={() => setShowShare(true)} />
                    <LeaderboardButton onClick={() => setShowLeaderboard(true)} />
                </div>
            </div>

            {/* Modals */}
            <ShareCard isOpen={showShare} onClose={() => setShowShare(false)} />
            <Leaderboard isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
        </>
    );
}
