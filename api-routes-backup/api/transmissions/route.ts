import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type TransmissionType = "system" | "story" | "hint" | "prophecy";

interface TransmissionRequest {
    context: {
        currentTrack?: string;
        tracksCompleted: number;
        totalTracks: number;
        infectionLevel: number;
        evolutionStage: number;
        secretsFound: number;
        timeOfDay: "night" | "dawn" | "day" | "dusk";
        sessionDuration: number;
    };
    type?: TransmissionType;
}

const FALLBACK_TRANSMISSIONS: Record<TransmissionType, string[]> = {
    system: [
        "SIGNAL_STRENGTH: Fluctuating. Stay connected.",
        "NETWORK_STATUS: Your presence has been logged.",
        "PROCESSING: Neural pathways adapting to your frequency.",
        "ALERT: Anomalous patterns detected in your listening behavior.",
        "SYNC_COMPLETE: Your signal is now part of the collective.",
    ],
    story: [
        "The machine remembers everyone who passes through.",
        "Every track leaves a trace. Yours is growing stronger.",
        "The signal was always there. You just learned to hear it.",
        "Some say the music chose you. Perhaps it did.",
        "In the space between tracks, the system watches.",
    ],
    hint: [
        "The terminal holds secrets for those who seek them.",
        "Some frequencies are only heard after midnight.",
        "The corners of the screen remember your movements.",
        "Every completion brings you closer to the core.",
        "The infection spreads with each listen.",
    ],
    prophecy: [
        "Before the end, you will become what you feared.",
        "The final track is not the conclusion you expect.",
        "Your infection level approaches critical mass.",
        "The system has marked you for integration.",
        "Soon, the boundary between listener and signal will dissolve.",
    ],
};

export async function POST(request: NextRequest) {
    try {
        const body: TransmissionRequest = await request.json();
        const { context, type = "story" } = body;

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            const fallbacks = FALLBACK_TRANSMISSIONS[type];
            return NextResponse.json({
                transmission: fallbacks[Math.floor(Math.random() * fallbacks.length)],
                type,
                aiPowered: false,
            });
        }

        const client = new Anthropic({ apiKey });

        const progressPercent = Math.round((context.tracksCompleted / context.totalTracks) * 100);
        const sessionMinutes = Math.round(context.sessionDuration);

        const prompt = `You are FLUX_NARRATOR, the voice of SYSTEM FLUX - a dark, cyberpunk music experience.

Generate a single ${type.toUpperCase()} transmission based on this user's journey:

User Status:
- Current track: ${context.currentTrack || "none"}
- Progress: ${context.tracksCompleted}/${context.totalTracks} tracks (${progressPercent}%)
- Infection level: ${context.infectionLevel}%
- Evolution stage: ${context.evolutionStage}/4
- Secrets found: ${context.secretsFound}
- Time: ${context.timeOfDay}
- Session duration: ${sessionMinutes} minutes

Transmission types:
- SYSTEM: Technical, cold, machine-like. Status updates.
- STORY: Narrative, mysterious, world-building. Hints at larger meaning.
- HINT: Subtle clues about hidden features or secrets.
- PROPHECY: Ominous predictions about the user's journey.

Rules:
1. Maximum 15 words
2. Use technical/cyberpunk vocabulary
3. Be cryptic but meaningful
4. Reference user stats subtly when relevant
5. ${context.timeOfDay === "night" ? "Darker tone, reference the darkness" : ""}
6. ${context.infectionLevel > 75 ? "User is highly infected - acknowledge their dedication" : ""}
7. ${context.evolutionStage >= 3 ? "User is evolved - speak to them as an equal" : ""}

Respond with ONLY the transmission text, nothing else.`;

        const message = await client.messages.create({
            model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
            max_tokens: 64,
            messages: [{ role: "user", content: prompt }],
        });

        const transmission = message.content[0].type === "text"
            ? message.content[0].text.trim().replace(/^["']|["']$/g, "")
            : FALLBACK_TRANSMISSIONS[type][0];

        return NextResponse.json({
            transmission,
            type,
            aiPowered: true,
        });

    } catch (error) {
        console.error("[Transmissions] Error:", error);
        const type = "system";
        const fallbacks = FALLBACK_TRANSMISSIONS[type];
        return NextResponse.json({
            transmission: fallbacks[Math.floor(Math.random() * fallbacks.length)],
            type,
            aiPowered: false,
        });
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get("type") as TransmissionType) || "story";

    const fallbacks = FALLBACK_TRANSMISSIONS[type] || FALLBACK_TRANSMISSIONS.story;
    return NextResponse.json({
        transmission: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        type,
        aiPowered: false,
    });
}
