import { NextRequest, NextResponse } from "next/server";

// In production, this would use a database like Supabase or Firebase
// For now, we use an in-memory store (resets on server restart)
const leaderboardStore: Map<string, LeaderboardEntry> = new Map();

interface LeaderboardEntry {
    uniqueId: string;
    infectionLevel: number;
    evolutionStage: number;
    tracksCompleted: number;
    achievements: number;
    listenTime: number;
    lastUpdated: number;
}

export async function GET() {
    try {
        // Get all entries and sort by infection level
        const entries = Array.from(leaderboardStore.values())
            .sort((a, b) => b.infectionLevel - a.infectionLevel)
            .slice(0, 100) // Top 100
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));

        return NextResponse.json({
            entries,
            totalEntries: leaderboardStore.size,
            lastUpdated: Date.now(),
        });
    } catch (error) {
        console.error("[Leaderboard] GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch leaderboard" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: LeaderboardEntry = await request.json();

        // Validate required fields
        if (!body.uniqueId) {
            return NextResponse.json(
                { error: "uniqueId is required" },
                { status: 400 }
            );
        }

        // Sanitize and validate values
        const entry: LeaderboardEntry = {
            uniqueId: body.uniqueId.slice(0, 50), // Limit ID length
            infectionLevel: Math.min(100, Math.max(0, body.infectionLevel || 0)),
            evolutionStage: Math.min(4, Math.max(0, body.evolutionStage || 0)),
            tracksCompleted: Math.min(26, Math.max(0, body.tracksCompleted || 0)),
            achievements: Math.max(0, body.achievements || 0),
            listenTime: Math.max(0, body.listenTime || 0),
            lastUpdated: Date.now(),
        };

        // Update or create entry
        leaderboardStore.set(entry.uniqueId, entry);

        // Clean up old entries (older than 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        for (const [id, e] of leaderboardStore.entries()) {
            if (e.lastUpdated < thirtyDaysAgo) {
                leaderboardStore.delete(id);
            }
        }

        // Get user's current rank
        const sortedEntries = Array.from(leaderboardStore.values())
            .sort((a, b) => b.infectionLevel - a.infectionLevel);
        const userRank = sortedEntries.findIndex(e => e.uniqueId === entry.uniqueId) + 1;

        return NextResponse.json({
            success: true,
            rank: userRank,
            totalEntries: leaderboardStore.size,
        });
    } catch (error) {
        console.error("[Leaderboard] POST error:", error);
        return NextResponse.json(
            { error: "Failed to submit score" },
            { status: 500 }
        );
    }
}
