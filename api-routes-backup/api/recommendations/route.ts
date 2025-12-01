import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Track metadata for AI context
const TRACK_METADATA = [
    { index: 0, title: "Alles hat ein Ende", mood: "melancholic", energy: "low", theme: "endings" },
    { index: 1, title: "BUNKERBIT", mood: "aggressive", energy: "high", theme: "digital chaos" },
    { index: 2, title: "Breathe No More", mood: "tense", energy: "medium", theme: "suffocation" },
    { index: 3, title: "Clean Shot // Dead Mic", mood: "intense", energy: "high", theme: "precision" },
    { index: 4, title: "Click Shift Repeat", mood: "robotic", energy: "medium", theme: "routine" },
    { index: 5, title: "Double Life", mood: "conflicted", energy: "medium", theme: "duality" },
    { index: 6, title: "Glitch in the Matrix", mood: "chaotic", energy: "high", theme: "reality break" },
    { index: 7, title: "Heretic to Your Halo", mood: "defiant", energy: "high", theme: "rebellion" },
    { index: 8, title: "Higher Than the Skyline", mood: "euphoric", energy: "high", theme: "ascension" },
    { index: 9, title: "ION CORE", mood: "powerful", energy: "high", theme: "energy" },
    { index: 10, title: "KILLSWITCH PRESS CONFERENCE", mood: "aggressive", energy: "high", theme: "media chaos" },
    { index: 11, title: "Likes and Lies", mood: "cynical", energy: "medium", theme: "social media" },
    { index: 12, title: "Make Me the Villain", mood: "dark", energy: "high", theme: "anti-hero" },
    { index: 13, title: "Zero Credit", mood: "rebellious", energy: "high", theme: "debt/freedom" },
    { index: 14, title: "Mirror Match IQ", mood: "strategic", energy: "medium", theme: "competition" },
    { index: 15, title: "Neon Enigma", mood: "mysterious", energy: "medium", theme: "mystery" },
    { index: 16, title: "No Continue", mood: "final", energy: "medium", theme: "game over" },
    { index: 17, title: "Patch Notes: Me", mood: "introspective", energy: "low", theme: "self-update" },
    { index: 18, title: "Release the Frames", mood: "cinematic", energy: "medium", theme: "storytelling" },
    { index: 19, title: "Runaway", mood: "urgent", energy: "high", theme: "escape" },
    { index: 20, title: "Still Falling", mood: "vulnerable", energy: "low", theme: "descent" },
    { index: 21, title: "Tidal Weight", mood: "heavy", energy: "medium", theme: "pressure" },
    { index: 22, title: "Turn Me Louder", mood: "energetic", energy: "high", theme: "volume" },
    { index: 23, title: "Voices Are a Loaded Room", mood: "paranoid", energy: "medium", theme: "inner voices" },
    { index: 24, title: "Wenn Ich Friere", mood: "cold", energy: "low", theme: "isolation" },
    { index: 25, title: "Tracing", mood: "searching", energy: "medium", theme: "following" },
];

interface RecommendationRequest {
    currentTrackIndex: number;
    recentlyPlayed: number[];
    infectionLevel: number;
    evolutionStage: number;
    timeOfDay: "night" | "dawn" | "day" | "dusk";
}

export async function POST(request: NextRequest) {
    try {
        const body: RecommendationRequest = await request.json();
        const { currentTrackIndex, recentlyPlayed, infectionLevel, evolutionStage, timeOfDay } = body;

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                recommendation: getFallbackRecommendation(currentTrackIndex, recentlyPlayed),
                reasoning: "FALLBACK_MODE: AI offline. Using pattern matching.",
                aiPowered: false,
            });
        }

        const client = new Anthropic({ apiKey });

        const currentTrack = TRACK_METADATA[currentTrackIndex];
        const playedTracks = recentlyPlayed.map(i => TRACK_METADATA[i]?.title).filter(Boolean);
        const unplayedTracks = TRACK_METADATA.filter(t => !recentlyPlayed.includes(t.index));

        const prompt = `You are FLUX_DJ, an AI music recommendation system for the SYSTEM FLUX audio experience.

Current context:
- Current track: "${currentTrack?.title}" (mood: ${currentTrack?.mood}, energy: ${currentTrack?.energy})
- Recently played: ${playedTracks.slice(-5).join(", ") || "none"}
- User infection level: ${infectionLevel}% (higher = more engaged)
- Evolution stage: ${evolutionStage}/4 (higher = more experienced)
- Time of day: ${timeOfDay}

Available tracks (not recently played):
${unplayedTracks.map(t => `- [${t.index}] "${t.title}" (mood: ${t.mood}, energy: ${t.energy}, theme: ${t.theme})`).join("\n")}

Based on the user's listening pattern and current context, recommend the BEST next track.
Consider:
1. Flow - don't jar the listener with extreme mood shifts (unless infection is high)
2. Energy curve - ${timeOfDay === "night" ? "lean toward lower energy" : timeOfDay === "day" ? "higher energy acceptable" : "transitional energy"}
3. Theme connections - find thematic links between tracks
4. Evolution stage - stage ${evolutionStage} users ${evolutionStage >= 3 ? "can handle more intense tracks" : "prefer accessible tracks"}

Respond in JSON format:
{
  "trackIndex": <number>,
  "confidence": <0-100>,
  "reasoning": "<brief explanation for user>"
}`;

        const message = await client.messages.create({
            model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
            max_tokens: 256,
            messages: [{ role: "user", content: prompt }],
        });

        const responseText = message.content[0].type === "text" ? message.content[0].text : "";
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const aiResponse = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
                recommendation: aiResponse.trackIndex,
                confidence: aiResponse.confidence,
                reasoning: aiResponse.reasoning,
                aiPowered: true,
            });
        }

        return NextResponse.json({
            recommendation: getFallbackRecommendation(currentTrackIndex, recentlyPlayed),
            reasoning: "PARSING_ERROR: Using pattern matching.",
            aiPowered: false,
        });

    } catch (error) {
        console.error("[AI DJ] Error:", error);
        return NextResponse.json({
            recommendation: Math.floor(Math.random() * 26),
            reasoning: "ERROR: System fallback active.",
            aiPowered: false,
        }, { status: 200 });
    }
}

function getFallbackRecommendation(currentIndex: number, recentlyPlayed: number[]): number {
    const current = TRACK_METADATA[currentIndex];
    const candidates = TRACK_METADATA
        .filter(t => !recentlyPlayed.includes(t.index) && t.index !== currentIndex)
        .filter(t => t.energy === current?.energy || Math.random() > 0.5);

    if (candidates.length === 0) {
        return (currentIndex + 1) % 26;
    }

    return candidates[Math.floor(Math.random() * candidates.length)].index;
}
