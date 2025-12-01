"use client";

import { useState } from "react";
import { DevDocs, DevDocsButton } from "./DevDocs";
import { ArtistTools, ArtistToolsButton } from "./ArtistTools";
import { useExperience } from "@/contexts/ExperienceContext";
import { Code } from "lucide-react";

export function DevBar() {
    const [showDocs, setShowDocs] = useState(false);
    const [showArtistTools, setShowArtistTools] = useState(false);
    const { getEvolutionColors } = useExperience();
    const colors = getEvolutionColors();

    return (
        <>
            {/* Fixed dev bar */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 font-mono text-xs text-white/30 mb-1">
                    <Code size={12} style={{ color: colors.primary }} />
                    <span>DEVELOPER</span>
                </div>
                <div className="flex gap-2">
                    <DevDocsButton onClick={() => setShowDocs(true)} />
                    <ArtistToolsButton onClick={() => setShowArtistTools(true)} />
                </div>
            </div>

            {/* Modals */}
            <DevDocs isOpen={showDocs} onClose={() => setShowDocs(false)} />
            <ArtistTools isOpen={showArtistTools} onClose={() => setShowArtistTools(false)} />
        </>
    );
}
