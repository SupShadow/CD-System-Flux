"use client";

import { useEffect } from "react";
import { useAudio } from "@/contexts/AudioContext";
import { useToast } from "@/contexts/ToastContext";

export function AudioErrorHandler() {
    const { setOnError, error } = useAudio();
    const { showError, showWarning } = useToast();

    useEffect(() => {
        setOnError((audioError) => {
            switch (audioError.type) {
                case "init":
                    showError(`AUDIO_INIT_FAILED: ${audioError.message}`);
                    break;
                case "playback":
                    if (audioError.message.includes("blocked")) {
                        showWarning("CLICK_TO_ENABLE_AUDIO");
                    } else {
                        showError(`PLAYBACK_ERROR: ${audioError.message}`);
                    }
                    break;
                case "load":
                    showError(`LOAD_FAILED: ${audioError.message}`);
                    break;
                case "network":
                    showWarning(`NETWORK_ISSUE: ${audioError.message}`);
                    break;
                default:
                    showError(audioError.message);
            }
        });
    }, [setOnError, showError, showWarning]);

    // This component only handles side effects, no UI
    return null;
}
