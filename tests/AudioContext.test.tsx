import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { AudioProvider, useAudio } from "@/contexts/AudioContext";
import { TRACKS } from "@/lib/tracks";

// Wrapper for hook testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AudioProvider>{children}</AudioProvider>
);

describe("AudioContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("useAudio hook", () => {
        it("throws error when used outside AudioProvider", () => {
            // Suppress console.error for this test
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            expect(() => {
                renderHook(() => useAudio());
            }).toThrow("useAudio must be used within an AudioProvider");

            consoleSpy.mockRestore();
        });

        it("provides initial state", () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.currentTrackIndex).toBe(0);
            expect(result.current.currentTrack).toEqual(TRACKS[0]);
            expect(result.current.isMuted).toBe(false);
            expect(result.current.isInitialized).toBe(false);
        });

        it("initializes audio context on initAudio call", () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            expect(result.current.isInitialized).toBe(false);

            act(() => {
                result.current.initAudio();
            });

            expect(result.current.isInitialized).toBe(true);
        });

        it("provides all stem states as true initially", () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            expect(result.current.stems).toEqual({
                DRUMS: true,
                BASS: true,
                SYNTH: true,
                FX: true,
            });
        });

        it("toggles stem state", () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            // Initialize audio first
            act(() => {
                result.current.initAudio();
            });

            // Toggle DRUMS off
            act(() => {
                result.current.toggleStem("DRUMS");
            });

            expect(result.current.stems.DRUMS).toBe(false);
            expect(result.current.stems.BASS).toBe(true);

            // Toggle DRUMS back on
            act(() => {
                result.current.toggleStem("DRUMS");
            });

            expect(result.current.stems.DRUMS).toBe(true);
        });

        it("handles mute state changes", () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            act(() => {
                result.current.initAudio();
            });

            act(() => {
                result.current.setIsMuted(true);
            });

            expect(result.current.isMuted).toBe(true);

            act(() => {
                result.current.setIsMuted(false);
            });

            expect(result.current.isMuted).toBe(false);
        });

        it("plays track and updates state", async () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            await act(async () => {
                result.current.playTrack(5);
            });

            expect(result.current.currentTrackIndex).toBe(5);
            expect(result.current.currentTrack).toEqual(TRACKS[5]);
            expect(result.current.isPlaying).toBe(true);
        });

        it("plays next track with wrap-around", async () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            // Play last track
            await act(async () => {
                result.current.playTrack(TRACKS.length - 1);
            });

            expect(result.current.currentTrackIndex).toBe(TRACKS.length - 1);

            // Play next should wrap to first
            await act(async () => {
                result.current.playNext();
            });

            expect(result.current.currentTrackIndex).toBe(0);
        });

        it("plays previous track with wrap-around", async () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            // Start at first track (default)
            expect(result.current.currentTrackIndex).toBe(0);

            // Play previous should wrap to last
            await act(async () => {
                result.current.playPrev();
            });

            expect(result.current.currentTrackIndex).toBe(TRACKS.length - 1);
        });

        it("toggles play/pause state", async () => {
            const { result } = renderHook(() => useAudio(), { wrapper });

            // Start playing
            await act(async () => {
                result.current.togglePlay();
            });

            expect(result.current.isPlaying).toBe(true);

            // Pause
            await act(async () => {
                result.current.togglePlay();
            });

            expect(result.current.isPlaying).toBe(false);
        });
    });

    describe("AudioProvider", () => {
        it("renders children correctly", () => {
            render(
                <AudioProvider>
                    <div data-testid="child">Test Child</div>
                </AudioProvider>
            );

            expect(screen.getByTestId("child")).toBeInTheDocument();
            expect(screen.getByText("Test Child")).toBeInTheDocument();
        });
    });
});
