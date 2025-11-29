import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    createStemFilterChain,
    connectSourceToStems,
    StemState,
} from "@/hooks/useStemFilters";

// Mock AudioContext and nodes
class MockGainNode {
    gain = { value: 1, setTargetAtTime: vi.fn() };
    connect = vi.fn(() => this);
    disconnect = vi.fn();
}

class MockBiquadFilterNode {
    type: BiquadFilterType = "lowpass";
    frequency = { value: 1000 };
    Q = { value: 1 };
    gain = { value: 0 };
    connect = vi.fn(() => this);
    disconnect = vi.fn();
}

class MockMediaElementSource {
    connect = vi.fn(() => this);
    disconnect = vi.fn();
}

class MockAudioContext {
    createGain = vi.fn(() => new MockGainNode());
    createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
}

describe("useStemFilters", () => {
    let mockCtx: MockAudioContext;

    beforeEach(() => {
        mockCtx = new MockAudioContext();
    });

    describe("createStemFilterChain", () => {
        it("creates all required gain nodes", () => {
            const chain = createStemFilterChain(mockCtx as unknown as AudioContext);

            expect(chain.gains.DRUMS).toBeDefined();
            expect(chain.gains.BASS).toBeDefined();
            expect(chain.gains.SYNTH).toBeDefined();
            expect(chain.gains.FX).toBeDefined();
            expect(chain.outputNode).toBeDefined();
        });

        it("creates all required filter nodes", () => {
            const chain = createStemFilterChain(mockCtx as unknown as AudioContext);

            // DRUMS has 2 filters (low shelf + high shelf)
            expect(chain.filters.DRUMS).toHaveLength(2);

            // BASS has 1 filter (lowpass)
            expect(chain.filters.BASS).toBeDefined();

            // SYNTH has 2 filters (highpass + lowpass for bandpass)
            expect(chain.filters.SYNTH).toHaveLength(2);

            // FX has 1 filter (highpass)
            expect(chain.filters.FX).toBeDefined();
        });

        it("creates the correct number of gain nodes (5 total)", () => {
            createStemFilterChain(mockCtx as unknown as AudioContext);

            // 4 stem gains + 1 track gain (output)
            expect(mockCtx.createGain).toHaveBeenCalledTimes(5);
        });

        it("creates the correct number of filter nodes (6 total)", () => {
            createStemFilterChain(mockCtx as unknown as AudioContext);

            // DRUMS: 2, BASS: 1, SYNTH: 2, FX: 1 = 6 total
            expect(mockCtx.createBiquadFilter).toHaveBeenCalledTimes(6);
        });

        it("connects stem gains to output node", () => {
            const chain = createStemFilterChain(mockCtx as unknown as AudioContext);

            // Each stem gain should be connected to the track gain (output)
            expect(chain.gains.DRUMS?.connect).toHaveBeenCalled();
            expect(chain.gains.BASS?.connect).toHaveBeenCalled();
            expect(chain.gains.SYNTH?.connect).toHaveBeenCalled();
            expect(chain.gains.FX?.connect).toHaveBeenCalled();
        });
    });

    describe("connectSourceToStems", () => {
        it("connects source to all stem filter chains", () => {
            const chain = createStemFilterChain(mockCtx as unknown as AudioContext);
            const mockSource = new MockMediaElementSource() as unknown as MediaElementAudioSourceNode;

            connectSourceToStems(mockSource, chain);

            // Source should be connected to the first filter of each chain
            expect(mockSource.connect).toHaveBeenCalledTimes(4);
        });

        it("connects DRUMS chain correctly (source → lowFilter → highFilter → gain)", () => {
            const chain = createStemFilterChain(mockCtx as unknown as AudioContext);
            const mockSource = new MockMediaElementSource() as unknown as MediaElementAudioSourceNode;

            connectSourceToStems(mockSource, chain);

            // Verify DRUMS filter chain is connected
            expect(chain.filters.DRUMS[0].connect).toHaveBeenCalled();
            expect(chain.filters.DRUMS[1].connect).toHaveBeenCalled();
        });

        it("connects BASS chain correctly (source → filter → gain)", () => {
            const chain = createStemFilterChain(mockCtx as unknown as AudioContext);
            const mockSource = new MockMediaElementSource() as unknown as MediaElementAudioSourceNode;

            connectSourceToStems(mockSource, chain);

            expect(chain.filters.BASS?.connect).toHaveBeenCalled();
        });

        it("connects SYNTH chain correctly (source → lowCut → highCut → gain)", () => {
            const chain = createStemFilterChain(mockCtx as unknown as AudioContext);
            const mockSource = new MockMediaElementSource() as unknown as MediaElementAudioSourceNode;

            connectSourceToStems(mockSource, chain);

            expect(chain.filters.SYNTH[0].connect).toHaveBeenCalled();
            expect(chain.filters.SYNTH[1].connect).toHaveBeenCalled();
        });

        it("connects FX chain correctly (source → filter → gain)", () => {
            const chain = createStemFilterChain(mockCtx as unknown as AudioContext);
            const mockSource = new MockMediaElementSource() as unknown as MediaElementAudioSourceNode;

            connectSourceToStems(mockSource, chain);

            expect(chain.filters.FX?.connect).toHaveBeenCalled();
        });
    });

    describe("StemState type", () => {
        it("has correct structure", () => {
            const state: StemState = {
                DRUMS: true,
                BASS: true,
                SYNTH: true,
                FX: true,
            };

            expect(state.DRUMS).toBe(true);
            expect(state.BASS).toBe(true);
            expect(state.SYNTH).toBe(true);
            expect(state.FX).toBe(true);
        });

        it("can toggle individual stems", () => {
            const state: StemState = {
                DRUMS: true,
                BASS: true,
                SYNTH: true,
                FX: true,
            };

            state.DRUMS = false;
            expect(state.DRUMS).toBe(false);
            expect(state.BASS).toBe(true);
        });
    });
});
