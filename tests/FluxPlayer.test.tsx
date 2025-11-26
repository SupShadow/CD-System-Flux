import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FluxPlayer from "@/components/FluxPlayer";
import { AudioProvider } from "@/contexts/AudioContext";
import { TRACKS } from "@/lib/tracks";

// Wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AudioProvider>{children}</AudioProvider>
);

const renderFluxPlayer = () => {
    return render(
        <TestWrapper>
            <FluxPlayer />
        </TestWrapper>
    );
};

describe("FluxPlayer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("renders the player bar", () => {
            renderFluxPlayer();

            // Check for NOW_PLAYING label
            expect(screen.getByText("NOW_PLAYING")).toBeInTheDocument();
        });

        it("displays the first track title initially", () => {
            renderFluxPlayer();

            expect(screen.getByText(TRACKS[0].title)).toBeInTheDocument();
        });

        it("renders play/pause button", () => {
            renderFluxPlayer();

            // Should show play icon initially (not playing)
            const buttons = screen.getAllByRole("button");
            const playButton = buttons.find(
                (btn) => btn.querySelector("svg.lucide-play") || btn.querySelector("svg.lucide-pause")
            );

            expect(playButton).toBeInTheDocument();
        });

        it("renders skip buttons", () => {
            renderFluxPlayer();

            const buttons = screen.getAllByRole("button");

            const skipBackButton = buttons.find((btn) =>
                btn.querySelector("svg.lucide-skip-back")
            );
            const skipForwardButton = buttons.find((btn) =>
                btn.querySelector("svg.lucide-skip-forward")
            );

            expect(skipBackButton).toBeInTheDocument();
            expect(skipForwardButton).toBeInTheDocument();
        });

        it("renders volume button", () => {
            renderFluxPlayer();

            const buttons = screen.getAllByRole("button");
            const volumeButton = buttons.find(
                (btn) =>
                    btn.querySelector("svg.lucide-volume-2") ||
                    btn.querySelector("svg.lucide-volume-x")
            );

            expect(volumeButton).toBeInTheDocument();
        });

        it("renders playlist button", () => {
            renderFluxPlayer();

            const buttons = screen.getAllByRole("button");
            const playlistButton = buttons.find((btn) =>
                btn.querySelector("svg.lucide-list-music")
            );

            expect(playlistButton).toBeInTheDocument();
        });

        it("renders canvas for visualizer", () => {
            renderFluxPlayer();

            const canvas = document.querySelector("canvas");
            expect(canvas).toBeInTheDocument();
            expect(canvas).toHaveAttribute("width", "400");
            expect(canvas).toHaveAttribute("height", "40");
        });
    });

    describe("External Links", () => {
        it("renders Apple Music link", () => {
            renderFluxPlayer();

            const appleLink = screen.getByTitle("Apple Music");
            expect(appleLink).toBeInTheDocument();
            expect(appleLink).toHaveAttribute("href", expect.stringContaining("music.apple.com"));
            expect(appleLink).toHaveAttribute("target", "_blank");
        });

        it("renders Spotify link", () => {
            renderFluxPlayer();

            const spotifyLink = screen.getByTitle("Spotify");
            expect(spotifyLink).toBeInTheDocument();
            expect(spotifyLink).toHaveAttribute("href", expect.stringContaining("spotify.com"));
            expect(spotifyLink).toHaveAttribute("target", "_blank");
        });
    });

    describe("Playback Controls", () => {
        it("toggles play state when play button is clicked", async () => {
            const user = userEvent.setup();
            renderFluxPlayer();

            const buttons = screen.getAllByRole("button");
            const playButton = buttons.find(
                (btn) => btn.querySelector("svg.lucide-play") || btn.querySelector("svg.lucide-pause")
            );

            if (playButton) {
                // Initially should show play icon
                expect(playButton.querySelector("svg.lucide-play")).toBeInTheDocument();

                // Click to play
                await user.click(playButton);

                // Should now show pause icon
                expect(playButton.querySelector("svg.lucide-pause")).toBeInTheDocument();
            }
        });

        it("skips to next track when skip forward is clicked", async () => {
            const user = userEvent.setup();
            renderFluxPlayer();

            // Start with first track
            expect(screen.getByText(TRACKS[0].title)).toBeInTheDocument();

            const buttons = screen.getAllByRole("button");
            const skipForwardButton = buttons.find((btn) =>
                btn.querySelector("svg.lucide-skip-forward")
            );

            if (skipForwardButton) {
                await user.click(skipForwardButton);
            }

            // Should show second track
            expect(screen.getByText(TRACKS[1].title)).toBeInTheDocument();
        });

        it("skips to previous track when skip back is clicked", async () => {
            const user = userEvent.setup();
            renderFluxPlayer();

            // Start with first track, skip back should go to last
            const buttons = screen.getAllByRole("button");
            const skipBackButton = buttons.find((btn) =>
                btn.querySelector("svg.lucide-skip-back")
            );

            if (skipBackButton) {
                await user.click(skipBackButton);
            }

            // Should show last track (wrap around)
            expect(screen.getByText(TRACKS[TRACKS.length - 1].title)).toBeInTheDocument();
        });

        it("toggles mute state when volume button is clicked", async () => {
            const user = userEvent.setup();
            renderFluxPlayer();

            const buttons = screen.getAllByRole("button");
            const volumeButton = buttons.find(
                (btn) =>
                    btn.querySelector("svg.lucide-volume-2") ||
                    btn.querySelector("svg.lucide-volume-x")
            );

            if (volumeButton) {
                // Initially should show volume icon (not muted)
                expect(volumeButton.querySelector("svg.lucide-volume-2")).toBeInTheDocument();

                // Click to mute
                await user.click(volumeButton);

                // Should now show muted icon
                expect(volumeButton.querySelector("svg.lucide-volume-x")).toBeInTheDocument();
            }
        });
    });

    describe("Playlist", () => {
        it("opens playlist when playlist button is clicked", async () => {
            const user = userEvent.setup();
            renderFluxPlayer();

            const buttons = screen.getAllByRole("button");
            const playlistButton = buttons.find((btn) =>
                btn.querySelector("svg.lucide-list-music")
            );

            if (playlistButton) {
                await user.click(playlistButton);
            }

            // TrackList modal should be visible - shows FLUX_DATABASE header
            expect(screen.getByText(/FLUX_DATABASE/)).toBeInTheDocument();
        });

        it("shows track list content when opened", async () => {
            const user = userEvent.setup();
            renderFluxPlayer();

            const buttons = screen.getAllByRole("button");
            const playlistButton = buttons.find((btn) =>
                btn.querySelector("svg.lucide-list-music")
            );

            if (playlistButton) {
                await user.click(playlistButton);
            }

            // Should show track count
            expect(screen.getByText(/25_TRACKS/)).toBeInTheDocument();
        });
    });
});
