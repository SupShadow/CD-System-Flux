"use client";

import { useState, useCallback } from "react";
import { useExperience } from "@/contexts/ExperienceContext";
import { useAudio } from "@/contexts/AudioContext";

// Types
interface RecommendationResponse {
    recommendation: number;
    confidence?: number;
    reasoning: string;
    aiPowered: boolean;
}

interface TransmissionResponse {
    transmission: string;
    type: string;
    aiPowered: boolean;
}

interface CompanionResponse {
    response: string;
    aiPowered: boolean;
}

type ConversationMessage = { role: "user" | "assistant"; content: string };

// =============================================================================
// FALLBACK DATA (Used when AI API is unavailable - e.g., static export)
// =============================================================================

const FALLBACK_TRANSMISSIONS = {
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

const FALLBACK_COMPANION_RESPONSES = [
    "Signal interference detected. Processing your query...",
    "The network is listening. Your words echo in the void.",
    "Interesting. The system has noted your curiosity.",
    "Processing... Some answers take time to compile.",
    "Your infection level influences how much I can reveal.",
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getTimeOfDay(): "night" | "dawn" | "day" | "dusk" {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) return "night";
    if (hour >= 5 && hour < 8) return "dawn";
    if (hour >= 18 && hour < 21) return "dusk";
    if (hour >= 21) return "night";
    return "day";
}

function getLocalRecommendation(currentIndex: number, recentlyPlayed: number[]): RecommendationResponse {
    const candidates = Array.from({ length: 26 }, (_, i) => i)
        .filter(i => i !== currentIndex && !recentlyPlayed.includes(i));

    const recommendation = candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : (currentIndex + 1) % 26;

    return {
        recommendation,
        reasoning: "LOCAL_MODE: Pattern-based selection active.",
        aiPowered: false,
    };
}

function getLocalTransmission(type: keyof typeof FALLBACK_TRANSMISSIONS): TransmissionResponse {
    const messages = FALLBACK_TRANSMISSIONS[type];
    return {
        transmission: messages[Math.floor(Math.random() * messages.length)],
        type,
        aiPowered: false,
    };
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * AI DJ Recommendations Hook
 * Provides smart track recommendations based on user context.
 * Falls back to local pattern-matching when API is unavailable.
 */
export function useAIRecommendations() {
    const [loading, setLoading] = useState(false);
    const [lastRecommendation, setLastRecommendation] = useState<RecommendationResponse | null>(null);
    const { state } = useExperience();
    const { currentTrackIndex } = useAudio();

    const getRecommendation = useCallback(async (recentlyPlayed: number[] = []): Promise<RecommendationResponse> => {
        setLoading(true);
        try {
            const response = await fetch("/api/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentTrackIndex,
                    recentlyPlayed,
                    infectionLevel: state.infectionLevel,
                    evolutionStage: state.evolutionStage,
                    timeOfDay: getTimeOfDay(),
                }),
            });

            if (!response.ok) throw new Error("API unavailable");

            const data: RecommendationResponse = await response.json();
            setLastRecommendation(data);
            return data;
        } catch {
            // Graceful fallback to local logic
            const fallback = getLocalRecommendation(currentTrackIndex, recentlyPlayed);
            setLastRecommendation(fallback);
            return fallback;
        } finally {
            setLoading(false);
        }
    }, [currentTrackIndex, state.infectionLevel, state.evolutionStage]);

    return { getRecommendation, loading, lastRecommendation };
}

/**
 * AI Transmissions Hook
 * Provides dynamic narrative text based on user journey.
 * Falls back to predefined messages when API is unavailable.
 */
export function useAITransmissions() {
    const [loading, setLoading] = useState(false);
    const { state } = useExperience();
    const { currentTrack } = useAudio();

    const getTransmission = useCallback(async (
        type: "system" | "story" | "hint" | "prophecy" = "story"
    ): Promise<TransmissionResponse> => {
        setLoading(true);
        try {
            const response = await fetch("/api/transmissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context: {
                        currentTrack: currentTrack?.title,
                        tracksCompleted: state.stats.tracksCompleted.length,
                        totalTracks: 26,
                        infectionLevel: state.infectionLevel,
                        evolutionStage: state.evolutionStage,
                        secretsFound: state.secretsFound.length,
                        timeOfDay: getTimeOfDay(),
                        sessionDuration: (Date.now() - state.stats.lastVisit) / 60000,
                    },
                    type,
                }),
            });

            if (!response.ok) throw new Error("API unavailable");

            return await response.json();
        } catch {
            // Graceful fallback to local messages
            return getLocalTransmission(type);
        } finally {
            setLoading(false);
        }
    }, [currentTrack, state]);

    return { getTransmission, loading };
}

/**
 * AI Companion Chat Hook
 * Provides an interactive chat experience with FLUX_AGENT.
 * Falls back to simple responses when API is unavailable.
 */
export function useAICompanion() {
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState<ConversationMessage[]>([]);
    const { state } = useExperience();

    const favoriteTrack = Object.entries(state.stats.trackPlayCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

    const sendMessage = useCallback(async (message: string): Promise<CompanionResponse> => {
        setLoading(true);

        // Handle local commands
        if (message.startsWith("/")) {
            const response = handleLocalCommand(message, state, favoriteTrack);
            setConversation(prev => [
                ...prev,
                { role: "user", content: message },
                { role: "assistant", content: response.response },
            ]);
            setLoading(false);
            return response;
        }

        setConversation(prev => [...prev, { role: "user", content: message }]);

        try {
            const response = await fetch("/api/companion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    conversationHistory: conversation.slice(-10),
                    userContext: {
                        infectionLevel: state.infectionLevel,
                        evolutionStage: state.evolutionStage,
                        tracksCompleted: state.stats.tracksCompleted.length,
                        totalTracks: 26,
                        secretsFound: state.secretsFound.length,
                        favoriteTrack,
                        sessionCount: state.stats.sessionsCount,
                    },
                }),
            });

            if (!response.ok) throw new Error("API unavailable");

            const data: CompanionResponse = await response.json();
            setConversation(prev => [...prev, { role: "assistant", content: data.response }]);
            return data;
        } catch {
            const fallbackResponse = {
                response: FALLBACK_COMPANION_RESPONSES[Math.floor(Math.random() * FALLBACK_COMPANION_RESPONSES.length)],
                aiPowered: false,
            };
            setConversation(prev => [...prev, { role: "assistant", content: fallbackResponse.response }]);
            return fallbackResponse;
        } finally {
            setLoading(false);
        }
    }, [conversation, state, favoriteTrack]);

    const clearConversation = useCallback(() => {
        setConversation([]);
    }, []);

    return { sendMessage, loading, conversation, clearConversation };
}

// Local command handler for companion
function handleLocalCommand(
    message: string,
    state: ReturnType<typeof useExperience>["state"],
    favoriteTrack?: string
): CompanionResponse {
    const command = message.slice(1).toLowerCase().split(" ")[0];

    const responses: Record<string, string> = {
        help: `FLUX_AGENT COMMAND LIST:

/status  - View your infection status
/tracks  - Track catalog info
/secrets - Hint at hidden features
/about   - About SYSTEM FLUX
/clear   - Clear conversation

Or just talk to me...`,

        status: `STATUS_CHECK:

INFECTION_LEVEL: ${state.infectionLevel.toFixed(1)}%
EVOLUTION_STAGE: ${state.evolutionStage}/4
TRACKS_COMPLETED: ${state.stats.tracksCompleted.length}/26
SECRETS_FOUND: ${state.secretsFound.length}
SESSIONS: ${state.stats.sessionsCount}
${favoriteTrack ? `FAVORITE: "${favoriteTrack}"` : ""}

STATUS: ${state.infectionLevel > 75 ? "HIGHLY_INFECTED" : state.infectionLevel > 50 ? "INFECTED" : state.infectionLevel > 25 ? "EXPOSED" : "INITIALIZING"}`,

        tracks: "CATALOG_ACCESS: 26 frequencies detected. Each carries a unique signature.",
        secrets: "ACCESS_RESTRICTED: Some things must be discovered, not told. Try the Konami code...",
        about: "SYSTEM FLUX: An AI-built audio experience by Julian Guggeis. Every feature constructed by autonomous agents.",
    };

    return {
        response: responses[command] || "UNKNOWN_COMMAND: Try /help for available commands.",
        aiPowered: false,
    };
}
