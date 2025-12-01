"use client";

import { useState } from "react";
import { ShareCard, ShareButton } from "./ShareCard";
import { Leaderboard, LeaderboardButton } from "./Leaderboard";
import { GlobalStatsCompact } from "./GlobalStats";

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
