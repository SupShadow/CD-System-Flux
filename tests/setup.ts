import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock GainNode
class MockGainNode {
    gain = {
        value: 1,
        setTargetAtTime: vi.fn(),
    };
    connect = vi.fn(() => this);
    disconnect = vi.fn();
}

// Mock AnalyserNode
class MockAnalyserNode {
    fftSize = 256;
    frequencyBinCount = 128;
    getByteFrequencyData = vi.fn();
    connect = vi.fn(() => this);
    disconnect = vi.fn();
}

// Mock BiquadFilterNode
class MockBiquadFilterNode {
    type = "lowpass";
    frequency = { value: 1000 };
    Q = { value: 1 };
    gain = { value: 0 };
    connect = vi.fn(() => this);
    disconnect = vi.fn();
}

// Mock MediaElementAudioSourceNode
class MockMediaElementSource {
    connect = vi.fn(() => this);
    disconnect = vi.fn();
}

// Mock AudioContext as a class
class MockAudioContext {
    state = "running";
    currentTime = 0;
    destination = {};

    createGain() {
        return new MockGainNode();
    }

    createAnalyser() {
        return new MockAnalyserNode();
    }

    createBiquadFilter() {
        return new MockBiquadFilterNode();
    }

    createMediaElementSource() {
        return new MockMediaElementSource();
    }

    resume = vi.fn(() => Promise.resolve());
    suspend = vi.fn(() => Promise.resolve());
    close = vi.fn(() => Promise.resolve());
}

// @ts-expect-error - Mock AudioContext
global.AudioContext = MockAudioContext;
// @ts-expect-error - Mock webkitAudioContext
global.webkitAudioContext = MockAudioContext;

// Mock HTMLMediaElement
Object.defineProperty(global.HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn(() => Promise.resolve()),
});

Object.defineProperty(global.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
});

Object.defineProperty(global.HTMLMediaElement.prototype, "load", {
    configurable: true,
    value: vi.fn(),
});

// Mock canvas context
const mockCanvasContext = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext);

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
    return setTimeout(cb, 16) as unknown as number;
});

global.cancelAnimationFrame = vi.fn((id) => {
    clearTimeout(id);
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Export mocks for use in tests
export { MockAudioContext, MockGainNode, MockAnalyserNode, MockBiquadFilterNode };
