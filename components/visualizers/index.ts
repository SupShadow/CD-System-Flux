/**
 * Visualizer registry - exports all visualizers and provides a lookup function
 */

import { VisualizerContext } from "@/lib/visualizer-utils";
import { renderDissolve } from "./dissolve";
import { renderDigital } from "./digital";
import { renderBreathe } from "./breathe";
import { renderTargeting } from "./targeting";
import { renderGrid } from "./grid";
import { renderMirror } from "./mirror";
import { renderMatrix, MatrixState } from "./matrix";
import { renderHalo } from "./halo";
import { renderSkyline } from "./skyline";
import { renderAtomic } from "./atomic";
import { renderFlash } from "./flash";
import { renderHearts, HeartsState } from "./hearts";
import { renderVillain } from "./villain";
import { renderChess } from "./chess";
import { renderEnigma } from "./enigma";
import { renderGameover } from "./gameover";
import { renderCode, CodeState } from "./code";
import { renderCinema } from "./cinema";
import { renderSpeed } from "./speed";
import { renderFalling, FallingState } from "./falling";
import { renderWaves } from "./waves";
import { renderSpeaker } from "./speaker";
import { renderVoices } from "./voices";
import { renderIce, IceState } from "./ice";
import { renderTrace, TraceState } from "./trace";
import { renderDefault } from "./default";

export type VisualizerType =
    | "dissolve"
    | "digital"
    | "breathe"
    | "targeting"
    | "grid"
    | "mirror"
    | "matrix"
    | "halo"
    | "skyline"
    | "atomic"
    | "flash"
    | "hearts"
    | "villain"
    | "chess"
    | "enigma"
    | "gameover"
    | "code"
    | "cinema"
    | "speed"
    | "falling"
    | "waves"
    | "speaker"
    | "voices"
    | "ice"
    | "trace"
    | "default";

/**
 * Combined persistent state for all visualizers
 */
export interface VisualizerState {
    matrix: MatrixState;
    falling: FallingState;
    hearts: HeartsState;
    code: CodeState;
    ice: IceState;
    trace: TraceState;
}

/**
 * Render the appropriate visualizer based on type
 */
export function renderVisualizer(
    type: VisualizerType,
    context: VisualizerContext,
    state: VisualizerState,
    options?: { disableFlashing?: boolean }
): void {
    switch (type) {
        case "dissolve":
            renderDissolve(context);
            break;
        case "digital":
            renderDigital(context);
            break;
        case "breathe":
            renderBreathe(context);
            break;
        case "targeting":
            renderTargeting(context);
            break;
        case "grid":
            renderGrid(context);
            break;
        case "mirror":
            renderMirror(context);
            break;
        case "matrix":
            renderMatrix(context, state.matrix);
            break;
        case "halo":
            renderHalo(context);
            break;
        case "skyline":
            renderSkyline(context);
            break;
        case "atomic":
            renderAtomic(context);
            break;
        case "flash":
            // Use safer alternative when safe mode is enabled (epilepsy safety)
            if (options?.disableFlashing) {
                renderHalo(context);
            } else {
                renderFlash(context);
            }
            break;
        case "hearts":
            renderHearts(context, state.hearts);
            break;
        case "villain":
            renderVillain(context);
            break;
        case "chess":
            renderChess(context);
            break;
        case "enigma":
            renderEnigma(context);
            break;
        case "gameover":
            renderGameover(context);
            break;
        case "code":
            renderCode(context, state.code);
            break;
        case "cinema":
            renderCinema(context);
            break;
        case "speed":
            renderSpeed(context);
            break;
        case "falling":
            renderFalling(context, state.falling);
            break;
        case "waves":
            renderWaves(context);
            break;
        case "speaker":
            renderSpeaker(context);
            break;
        case "voices":
            renderVoices(context);
            break;
        case "ice":
            renderIce(context, state.ice);
            break;
        case "trace":
            renderTrace(context, state.trace);
            break;
        default:
            renderDefault(context);
    }
}

// Re-export state types for initialization
export type { MatrixState, FallingState, HeartsState, CodeState, IceState, TraceState };
