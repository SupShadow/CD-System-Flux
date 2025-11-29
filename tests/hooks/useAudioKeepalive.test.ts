import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAudioKeepalive } from "@/hooks/useAudioKeepalive";

describe("useAudioKeepalive", () => {
    describe("initialization", () => {
        it("returns startKeepalive, stopKeepalive, and initSilentAudio functions", () => {
            const { result } = renderHook(() => useAudioKeepalive());

            expect(typeof result.current.startKeepalive).toBe("function");
            expect(typeof result.current.stopKeepalive).toBe("function");
            expect(typeof result.current.initSilentAudio).toBe("function");
        });

        it("functions are stable across re-renders", () => {
            const { result, rerender } = renderHook(() => useAudioKeepalive());

            const firstStartKeepalive = result.current.startKeepalive;
            const firstStopKeepalive = result.current.stopKeepalive;
            const firstInitSilentAudio = result.current.initSilentAudio;

            rerender();

            expect(result.current.startKeepalive).toBe(firstStartKeepalive);
            expect(result.current.stopKeepalive).toBe(firstStopKeepalive);
            expect(result.current.initSilentAudio).toBe(firstInitSilentAudio);
        });
    });

    describe("stopKeepalive", () => {
        it("does not throw when called before startKeepalive", () => {
            const { result } = renderHook(() => useAudioKeepalive());

            expect(() => result.current.stopKeepalive()).not.toThrow();
        });
    });
});
