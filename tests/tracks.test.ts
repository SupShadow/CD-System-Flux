import { describe, it, expect } from "vitest";
import { TRACKS, Track } from "@/lib/tracks";

describe("Tracks Data", () => {
    it("exports an array of tracks", () => {
        expect(Array.isArray(TRACKS)).toBe(true);
        expect(TRACKS.length).toBeGreaterThan(0);
    });

    it("has the correct number of tracks", () => {
        expect(TRACKS.length).toBe(25);
    });

    it("each track has required properties", () => {
        TRACKS.forEach((track, index) => {
            expect(track).toHaveProperty("title");
            expect(track).toHaveProperty("src");

            expect(typeof track.title).toBe("string");
            expect(typeof track.src).toBe("string");

            expect(track.title.length).toBeGreaterThan(0);
            expect(track.src.length).toBeGreaterThan(0);
        });
    });

    it("all tracks have valid MP3 file paths", () => {
        TRACKS.forEach((track) => {
            expect(track.src).toMatch(/^\/music\/.*\.mp3$/);
        });
    });

    it("track titles are unique", () => {
        const titles = TRACKS.map((track) => track.title);
        const uniqueTitles = new Set(titles);

        expect(uniqueTitles.size).toBe(titles.length);
    });

    it("track sources are unique", () => {
        const sources = TRACKS.map((track) => track.src);
        const uniqueSources = new Set(sources);

        expect(uniqueSources.size).toBe(sources.length);
    });

    describe("Track interface", () => {
        it("Track type has correct structure", () => {
            const testTrack: Track = {
                title: "Test Track",
                src: "/music/test.mp3",
            };

            expect(testTrack.title).toBe("Test Track");
            expect(testTrack.src).toBe("/music/test.mp3");
        });

        it("Track type allows optional duration", () => {
            const trackWithDuration: Track = {
                title: "Test Track",
                src: "/music/test.mp3",
                duration: "3:45",
            };

            expect(trackWithDuration.duration).toBe("3:45");
        });
    });

    describe("Specific tracks", () => {
        it("contains expected tracks", () => {
            const trackTitles = TRACKS.map((t) => t.title);

            expect(trackTitles).toContain("Alles hat ein Ende");
            expect(trackTitles).toContain("BUNKERBIT");
            expect(trackTitles).toContain("Turn Me Louder");
            expect(trackTitles).toContain("Glitch in the Matrix");
            expect(trackTitles).toContain("ION CORE");
        });

        it("first track is Alles hat ein Ende", () => {
            expect(TRACKS[0].title).toBe("Alles hat ein Ende");
            expect(TRACKS[0].src).toBe("/music/alles_hat_ein_ende.mp3");
        });

        it("last track is Tracing", () => {
            const lastTrack = TRACKS[TRACKS.length - 1];
            expect(lastTrack.title).toBe("Tracing");
            expect(lastTrack.src).toBe("/music/tracing.mp3");
        });
    });
});
