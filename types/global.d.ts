export { };

declare global {
    interface Window {
        fluxAudio: HTMLAudioElement | null;
        webkitAudioContext: typeof AudioContext;
    }
}
