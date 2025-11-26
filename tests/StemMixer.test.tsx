import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StemMixer from "@/components/StemMixer";
import { AudioProvider } from "@/contexts/AudioContext";

// Wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AudioProvider>{children}</AudioProvider>
);

const renderStemMixer = () => {
    return render(
        <TestWrapper>
            <StemMixer />
        </TestWrapper>
    );
};

describe("StemMixer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Button", () => {
        it("renders the DECONSTRUCT_TRACK button", () => {
            renderStemMixer();

            const button = screen.getByRole("button", { name: /deconstruct_track/i });
            expect(button).toBeInTheDocument();
        });

        it("opens modal when button is clicked", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            const button = screen.getByRole("button", { name: /deconstruct_track/i });
            await user.click(button);

            expect(screen.getByText("STEM DECONSTRUCTION")).toBeInTheDocument();
            expect(screen.getByText("ISOLATE THE SIGNAL // BREAK THE CODE")).toBeInTheDocument();
        });
    });

    describe("Modal", () => {
        it("displays all four stem controls", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            expect(screen.getByText("DRUMS")).toBeInTheDocument();
            expect(screen.getByText("BASS")).toBeInTheDocument();
            expect(screen.getByText("SYNTH")).toBeInTheDocument();
            expect(screen.getByText("FX")).toBeInTheDocument();
        });

        it("shows current track info when not playing", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            expect(screen.getByText("ACTIVE_TRACK:")).toBeInTheDocument();
            expect(screen.getByText("// NO SIGNAL //")).toBeInTheDocument();
        });

        it("shows audio engine status", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            // Initially shows ONLINE because initAudio is called on open
            expect(screen.getByText(/AUDIO_ENGINE:/)).toBeInTheDocument();
        });

        it("shows active stem count", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            expect(screen.getByText("ACTIVE_STEMS: 4/4")).toBeInTheDocument();
        });

        it("has a close button in the modal", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            // Open modal
            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));
            expect(screen.getByText("STEM DECONSTRUCTION")).toBeInTheDocument();

            // Find close button (X icon)
            const closeButtons = screen.getAllByRole("button");
            const closeButton = closeButtons.find((btn) =>
                btn.querySelector("svg.lucide-x")
            );

            // Close button should exist
            expect(closeButton).toBeInTheDocument();
        });
    });

    describe("Stem Controls", () => {
        it("toggles stem state when clicked", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            // Initially all stems are active (4/4)
            expect(screen.getByText("ACTIVE_STEMS: 4/4")).toBeInTheDocument();

            // Find DRUMS label and its parent control
            const drumsLabel = screen.getByText("DRUMS");
            const drumsControl = drumsLabel.parentElement?.querySelector("div[class*='cursor-pointer']");

            if (drumsControl) {
                await user.click(drumsControl);
            }

            // Now should show 3/4
            expect(screen.getByText("ACTIVE_STEMS: 3/4")).toBeInTheDocument();
        });

        it("can toggle multiple stems", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            // Get all stem controls
            const stemLabels = ["DRUMS", "BASS", "SYNTH", "FX"];

            for (const label of stemLabels) {
                const stemLabel = screen.getByText(label);
                const stemControl = stemLabel.parentElement?.querySelector("div[class*='cursor-pointer']");

                if (stemControl) {
                    await user.click(stemControl);
                }
            }

            // All stems toggled off
            expect(screen.getByText("ACTIVE_STEMS: 0/4")).toBeInTheDocument();
        });

        it("shows visual feedback when stem is active", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            // Check that DRUMS label has active styling (text-signal class)
            const drumsLabel = screen.getByText("DRUMS");
            expect(drumsLabel).toHaveClass("text-signal");
        });

        it("shows inactive styling when stem is disabled", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            // Toggle DRUMS off
            const drumsLabel = screen.getByText("DRUMS");
            const drumsControl = drumsLabel.parentElement?.querySelector("div[class*='cursor-pointer']");

            if (drumsControl) {
                await user.click(drumsControl);
            }

            // Now DRUMS should have inactive styling
            expect(drumsLabel).toHaveClass("text-stark/30");
        });
    });

    describe("Playback hint", () => {
        it("shows hint to start playback when not playing", async () => {
            const user = userEvent.setup();
            renderStemMixer();

            await user.click(screen.getByRole("button", { name: /deconstruct_track/i }));

            expect(screen.getByText("[ START PLAYBACK TO HEAR CHANGES ]")).toBeInTheDocument();
        });
    });
});
