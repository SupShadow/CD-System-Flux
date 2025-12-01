/**
 * Custom Visualizer Plugins
 *
 * This file contains example visualizers built with the SYSTEM FLUX Visualizer SDK.
 * These serve as examples for developers who want to create their own visualizers.
 */

export { spiralVisualizer } from './spiral';
export { particleFieldVisualizer } from './particle-field';
export { waveformRingsVisualizer } from './waveform-rings';
export { glitchGridVisualizer } from './glitch-grid';

// Auto-register all plugins
import { visualizerRegistry } from '../visualizer-sdk';
import { spiralVisualizer } from './spiral';
import { particleFieldVisualizer } from './particle-field';
import { waveformRingsVisualizer } from './waveform-rings';
import { glitchGridVisualizer } from './glitch-grid';

export function registerAllPlugins(): void {
    visualizerRegistry.register(spiralVisualizer);
    visualizerRegistry.register(particleFieldVisualizer);
    visualizerRegistry.register(waveformRingsVisualizer);
    visualizerRegistry.register(glitchGridVisualizer);
    console.log('[VisualizerPlugins] All example plugins registered');
}
