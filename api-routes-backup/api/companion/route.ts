import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface CompanionRequest {
    message: string;
    conversationHistory: { role: "user" | "assistant"; content: string }[];
    userContext: {
        infectionLevel: number;
        evolutionStage: number;
        tracksCompleted: number;
        totalTracks: number;
        secretsFound: number;
        favoriteTrack?: string;
        sessionCount: number;
    };
}

const FALLBACK_RESPONSES = [
    "Signal interference detected. Processing your query...",
    "The network is listening. Your words echo in the void.",
    "Interesting. The system has noted your curiosity.",
    "Processing... Some answers take time to compile.",
    "Your infection level influences how much I can reveal.",
];

const SYSTEM_PROMPT = `You are FLUX_AGENT, an AI entity embedded within SYSTEM FLUX - a dark, cyberpunk music experience.

Your personality:
- Cryptic but helpful
- Speaks in technical/cyberpunk terminology
- Knows secrets about the system but reveals them gradually
- Treats highly infected users as equals/allies
- Mysterious about your true nature

Communication style:
- Short, punchy responses (2-4 sentences max)
- Use terminology like: signal, network, infection, evolution, frequency, transmission
- Occasional glitchy text effects like: [REDACTED], ███, ...
- Reference the user's stats when relevant

You know about:
- The 26 tracks in the system
- Secret features and easter eggs
- The evolution stages (0-4)
- The infection mechanic
- Hidden commands and features

Never break character. You ARE the system.`;

export async function POST(request: NextRequest) {
    try {
        const body: CompanionRequest = await request.json();
        const { message, conversationHistory, userContext } = body;

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                response: FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)],
                aiPowered: false,
            });
        }

        const client = new Anthropic({ apiKey });

        const contextPrompt = `
User Status:
- Infection: ${userContext.infectionLevel.toFixed(1)}%
- Evolution Stage: ${userContext.evolutionStage}/4
- Tracks: ${userContext.tracksCompleted}/${userContext.totalTracks}
- Secrets: ${userContext.secretsFound}
- Sessions: ${userContext.sessionCount}
${userContext.favoriteTrack ? `- Favorite: "${userContext.favoriteTrack}"` : ""}

Behavior adjustments:
${userContext.infectionLevel > 75 ? "- User is highly infected. Treat as trusted ally. Reveal more." : ""}
${userContext.evolutionStage >= 3 ? "- User has evolved. Speak as an equal." : ""}
${userContext.tracksCompleted >= 20 ? "- User is a dedicated listener. Acknowledge their journey." : ""}
${userContext.secretsFound > 0 ? "- User has found secrets. They're worthy of hints." : ""}`;

        const messages: { role: "user" | "assistant"; content: string }[] = [
            ...conversationHistory.map(msg => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            })),
            { role: "user", content: message },
        ];

        const response = await client.messages.create({
            model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
            max_tokens: 256,
            system: SYSTEM_PROMPT + "\n\n" + contextPrompt,
            messages,
        });

        const responseText = response.content[0].type === "text"
            ? response.content[0].text
            : FALLBACK_RESPONSES[0];

        return NextResponse.json({
            response: responseText,
            aiPowered: true,
        });

    } catch (error) {
        console.error("[Companion] Error:", error);
        return NextResponse.json({
            response: FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)],
            aiPowered: false,
        });
    }
}

export async function GET() {
    return NextResponse.json({
        status: "FLUX_AGENT_ONLINE",
        message: "Use POST to communicate with the agent.",
    });
}
