import { NextResponse } from "next/server";

// In production, these would be aggregated from the database
// For now, we use simulated values with some persistence
let globalStats = {
    totalListeners: 1247,
    totalListenHours: 8432,
    totalAchievementsUnlocked: 4891,
    averageInfection: 42.7,
    totalTracksPlayed: 31567,
    peakListeners: 312,
};

// Track active listeners (would use WebSocket in production)
const activeListeners: Map<string, number> = new Map();

// Clean up inactive listeners every minute
setInterval(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [id, lastSeen] of activeListeners.entries()) {
        if (lastSeen < fiveMinutesAgo) {
            activeListeners.delete(id);
        }
    }
}, 60000);

export async function GET() {
    try {
        const activeNow = activeListeners.size;

        return NextResponse.json({
            ...globalStats,
            activeNow,
            lastUpdated: Date.now(),
        });
    } catch (error) {
        console.error("[Stats] GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}

// POST to report user activity (heartbeat)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { uniqueId, listenTime, achievementsCount } = body;

        if (!uniqueId) {
            return NextResponse.json(
                { error: "uniqueId is required" },
                { status: 400 }
            );
        }

        // Update active listener
        activeListeners.set(uniqueId, Date.now());

        // Update peak if necessary
        if (activeListeners.size > globalStats.peakListeners) {
            globalStats.peakListeners = activeListeners.size;
        }

        // Increment global stats (in production, these would be aggregated properly)
        if (listenTime && listenTime > 0) {
            globalStats.totalListenHours += listenTime / 3600;
        }
        if (achievementsCount && achievementsCount > 0) {
            globalStats.totalAchievementsUnlocked += achievementsCount;
        }

        return NextResponse.json({
            success: true,
            activeNow: activeListeners.size,
        });
    } catch (error) {
        console.error("[Stats] POST error:", error);
        return NextResponse.json(
            { error: "Failed to report activity" },
            { status: 500 }
        );
    }
}
