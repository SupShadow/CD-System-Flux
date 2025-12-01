import { NextRequest, NextResponse } from "next/server";

// Sync session storage (in production, use Redis or similar)
interface SyncSession {
    sessionId: string;
    hostId: string;
    currentTrack: number;
    currentTime: number;
    listeners: string[];
    isPlaying: boolean;
    createdAt: number;
    updatedAt: number;
}

const sessions: Map<string, SyncSession> = new Map();

// Clean up old sessions every 5 minutes
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, session] of sessions.entries()) {
        if (session.updatedAt < oneHourAgo) {
            sessions.delete(id);
        }
    }
}, 5 * 60 * 1000);

function generateSessionId(): string {
    return `SYNC_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
}

// GET - List active sessions or get specific session
export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (sessionId) {
        const session = sessions.get(sessionId);
        if (!session) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(session);
    }

    // Return list of active sessions
    const activeSessions = Array.from(sessions.values())
        .filter(s => Date.now() - s.updatedAt < 5 * 60 * 1000)
        .map(s => ({
            sessionId: s.sessionId,
            hostId: s.hostId,
            listenerCount: s.listeners.length,
            isPlaying: s.isPlaying,
        }));

    return NextResponse.json({ sessions: activeSessions });
}

// POST - Create new session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hostId } = body;

        if (!hostId) {
            return NextResponse.json(
                { error: "hostId is required" },
                { status: 400 }
            );
        }

        const sessionId = generateSessionId();
        const session: SyncSession = {
            sessionId,
            hostId,
            currentTrack: 0,
            currentTime: 0,
            listeners: [hostId],
            isPlaying: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        sessions.set(sessionId, session);

        return NextResponse.json(session);
    } catch (error) {
        console.error("[Sync] Create error:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}

// PUT - Update session (playback state)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, currentTrack, currentTime, isPlaying, requesterId } = body;

        const session = sessions.get(sessionId);
        if (!session) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        // Only host can update playback
        if (requesterId !== session.hostId) {
            return NextResponse.json(
                { error: "Only host can update playback" },
                { status: 403 }
            );
        }

        session.currentTrack = currentTrack ?? session.currentTrack;
        session.currentTime = currentTime ?? session.currentTime;
        session.isPlaying = isPlaying ?? session.isPlaying;
        session.updatedAt = Date.now();

        sessions.set(sessionId, session);

        return NextResponse.json(session);
    } catch (error) {
        console.error("[Sync] Update error:", error);
        return NextResponse.json(
            { error: "Failed to update session" },
            { status: 500 }
        );
    }
}

// DELETE - End session or leave
export async function DELETE(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const listenerId = request.nextUrl.searchParams.get("listenerId");

    if (!sessionId) {
        return NextResponse.json(
            { error: "sessionId is required" },
            { status: 400 }
        );
    }

    const session = sessions.get(sessionId);
    if (!session) {
        return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
        );
    }

    if (listenerId === session.hostId) {
        // Host is leaving - end session
        sessions.delete(sessionId);
        return NextResponse.json({ success: true, action: "session_ended" });
    }

    if (listenerId) {
        // Listener leaving
        session.listeners = session.listeners.filter(id => id !== listenerId);
        session.updatedAt = Date.now();
        sessions.set(sessionId, session);
        return NextResponse.json({ success: true, action: "listener_left" });
    }

    return NextResponse.json(
        { error: "listenerId is required" },
        { status: 400 }
    );
}
