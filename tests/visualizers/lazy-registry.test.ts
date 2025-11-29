import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    preloadVisualizer,
    preloadCommonVisualizers,
    isVisualizerLoaded,
    clearVisualizerCache,
} from "@/components/visualizers/lazy-registry";

describe("Visualizer Lazy Registry", () => {
    beforeEach(() => {
        clearVisualizerCache();
    });

    describe("preloadVisualizer", () => {
        it("loads a visualizer and caches it", async () => {
            expect(isVisualizerLoaded("default")).toBe(false);

            await preloadVisualizer("default");

            expect(isVisualizerLoaded("default")).toBe(true);
        });

        it("loads different visualizer types", async () => {
            await preloadVisualizer("halo");
            await preloadVisualizer("matrix");

            expect(isVisualizerLoaded("halo")).toBe(true);
            expect(isVisualizerLoaded("matrix")).toBe(true);
        });

        it("does not reload already cached visualizers", async () => {
            await preloadVisualizer("dissolve");
            const firstLoad = isVisualizerLoaded("dissolve");

            await preloadVisualizer("dissolve");
            const secondLoad = isVisualizerLoaded("dissolve");

            expect(firstLoad).toBe(true);
            expect(secondLoad).toBe(true);
        });
    });

    describe("preloadCommonVisualizers", () => {
        it("preloads the default set of common visualizers", async () => {
            await preloadCommonVisualizers();

            // These are defined as PRELOADED_VISUALIZERS in the module
            expect(isVisualizerLoaded("default")).toBe(true);
            expect(isVisualizerLoaded("dissolve")).toBe(true);
            expect(isVisualizerLoaded("halo")).toBe(true);
        });
    });

    describe("isVisualizerLoaded", () => {
        it("returns false for unloaded visualizers", () => {
            expect(isVisualizerLoaded("chess")).toBe(false);
        });

        it("returns true for loaded visualizers", async () => {
            await preloadVisualizer("chess");
            expect(isVisualizerLoaded("chess")).toBe(true);
        });
    });

    describe("clearVisualizerCache", () => {
        it("clears all cached visualizers", async () => {
            await preloadVisualizer("grid");
            await preloadVisualizer("waves");

            expect(isVisualizerLoaded("grid")).toBe(true);
            expect(isVisualizerLoaded("waves")).toBe(true);

            clearVisualizerCache();

            expect(isVisualizerLoaded("grid")).toBe(false);
            expect(isVisualizerLoaded("waves")).toBe(false);
        });
    });

    describe("visualizer loading", () => {
        const visualizerTypes = [
            "dissolve",
            "digital",
            "breathe",
            "targeting",
            "grid",
            "mirror",
            "matrix",
            "halo",
            "skyline",
            "atomic",
            "flash",
            "hearts",
            "villain",
            "chess",
            "enigma",
            "gameover",
            "code",
            "cinema",
            "speed",
            "falling",
            "waves",
            "speaker",
            "voices",
            "ice",
            "trace",
            "default",
        ] as const;

        it.each(visualizerTypes)("can load %s visualizer", async (type) => {
            await preloadVisualizer(type);
            expect(isVisualizerLoaded(type)).toBe(true);
        });
    });
});
