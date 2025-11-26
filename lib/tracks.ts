export type VisualizerType =
    | "dissolve"    // Alles hat ein Ende - fading particles
    | "digital"     // BUNKERBIT - pixelated blocks
    | "breathe"     // Breathe No More - pulsing organic waves
    | "targeting"   // Clean Shot // Dead Mic - sniper scope
    | "grid"        // Click Shift Repeat - shifting grid
    | "mirror"      // Double Life - mirrored dual visualization
    | "matrix"      // Glitch in the Matrix - matrix rain
    | "halo"        // Heretic to Your Halo - angelic rings
    | "skyline"     // Higher Than the Skyline - city bars
    | "atomic"      // ION CORE - atomic orbits
    | "flash"       // KILLSWITCH PRESS CONFERENCE - camera flashes
    | "hearts"      // Likes and Lies - social media hearts
    | "villain"     // Make Me the Villain - dark fire
    | "chess"       // Mirror Match IQ - strategic patterns
    | "enigma"      // Neon Enigma - mysterious shapes
    | "gameover"    // No Continue - game over screen
    | "code"        // Patch Notes: Me - scrolling changelog
    | "cinema"      // Release the Frames - film strips
    | "speed"       // Runaway - motion blur trails
    | "falling"     // Still Falling - gravity particles
    | "waves"       // Tidal Weight - ocean waves
    | "speaker"     // Turn Me Louder - speaker cones
    | "voices"      // Voices Are a Loaded Room - sound waves
    | "ice"         // Wenn Ich Friere - ice crystals
    | "trace";      // Tracing - line traces

export interface Track {
    title: string;
    src: string;
    duration?: string;
    color: string;
    visualizer: VisualizerType;
    releaseDate?: string; // Format: "YYYY-MM-DD" - tracks without date are unreleased
}

// Color palette for different moods
const COLORS = {
    orange: "#FF4500",      // Signal orange (default)
    cyan: "#00D4FF",        // Cyber blue
    magenta: "#FF00FF",     // Neon pink
    lime: "#39FF14",        // Matrix green
    purple: "#9D00FF",      // Deep purple
    gold: "#FFD700",        // Gold
    red: "#FF1744",         // Intense red
    teal: "#00FFA3",        // Teal
    blue: "#4169E1",        // Royal blue
    pink: "#FF69B4",        // Hot pink
};

export const TRACKS: Track[] = [
    { title: "Alles hat ein Ende", src: "/music/alles_hat_ein_ende.mp3", color: COLORS.purple, visualizer: "dissolve" },
    { title: "BUNKERBIT", src: "/music/bunkerbit.mp3", color: COLORS.lime, visualizer: "digital" },
    { title: "Breathe No More", src: "/music/breathe_no_more.mp3", color: COLORS.cyan, visualizer: "breathe" },
    { title: "Clean Shot // Dead Mic", src: "/music/clean_shot_dead_mic.mp3", color: COLORS.red, visualizer: "targeting" },
    { title: "Click Shift Repeat", src: "/music/click_shift_repeat.mp3", color: COLORS.teal, visualizer: "grid" },
    { title: "Double Life", src: "/music/double_life.mp3", color: COLORS.magenta, visualizer: "mirror" },
    { title: "Glitch in the Matrix", src: "/music/glitch_in_the_matrix.mp3", color: COLORS.lime, visualizer: "matrix" },
    { title: "Heretic to Your Halo", src: "/music/heretic_to_your_halo.mp3", color: COLORS.gold, visualizer: "halo" },
    { title: "Higher Than the Skyline", src: "/music/higher_than_the_skyline.mp3", color: COLORS.cyan, visualizer: "skyline" },
    { title: "ION CORE", src: "/music/ion_core.mp3", color: COLORS.blue, visualizer: "atomic" },
    { title: "KILLSWITCH PRESS CONFERENCE", src: "/music/killswitch_press_conference.mp3", color: COLORS.red, visualizer: "flash" },
    { title: "Likes and Lies", src: "/music/likes_and_lies.mp3", color: COLORS.pink, visualizer: "hearts" },
    { title: "Make Me the Villain", src: "/music/make_me_the_villain.mp3", color: COLORS.orange, visualizer: "villain", releaseDate: "2025-11-28" },
    { title: "Mirror Match IQ", src: "/music/mirror_match_iq.mp3", color: COLORS.teal, visualizer: "chess" },
    { title: "Neon Enigma", src: "/music/neon_enigma.mp3", color: COLORS.magenta, visualizer: "enigma" },
    { title: "No Continue", src: "/music/no_continue.mp3", color: COLORS.purple, visualizer: "gameover" },
    { title: "Patch Notes: Me", src: "/music/patch_notes_me.mp3", color: COLORS.lime, visualizer: "code" },
    { title: "Release the Frames", src: "/music/release_the_frames.mp3", color: COLORS.gold, visualizer: "cinema" },
    { title: "Runaway", src: "/music/runaway.mp3", color: COLORS.cyan, visualizer: "speed" },
    { title: "Still Falling", src: "/music/still_falling.mp3", color: COLORS.blue, visualizer: "falling" },
    { title: "Tidal Weight", src: "/music/tidal_weight.mp3", color: COLORS.purple, visualizer: "waves" },
    { title: "Turn Me Louder", src: "/music/turn_me_louder.mp3", color: COLORS.red, visualizer: "speaker" },
    { title: "Voices Are a Loaded Room", src: "/music/voices_are_a_loaded_room.mp3", color: COLORS.magenta, visualizer: "voices" },
    { title: "Wenn Ich Friere", src: "/music/wenn_ich_friere.mp3", color: COLORS.cyan, visualizer: "ice" },
    { title: "Tracing", src: "/music/tracing.mp3", color: COLORS.teal, visualizer: "trace" },
];

/**
 * Returns only tracks that have been released (releaseDate <= today)
 */
export function getReleasedTracks(): Track[] {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    return TRACKS.filter(track => track.releaseDate && track.releaseDate <= today);
}

/**
 * Check if a specific track is released
 */
export function isTrackReleased(track: Track): boolean {
    if (!track.releaseDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return track.releaseDate <= today;
}

/**
 * Returns the next upcoming track (not yet released, sorted by release date)
 */
export function getNextUpcomingTrack(): Track | null {
    const today = new Date().toISOString().split('T')[0];
    const upcomingTracks = TRACKS
        .filter(track => track.releaseDate && track.releaseDate > today)
        .sort((a, b) => (a.releaseDate! > b.releaseDate! ? 1 : -1));
    return upcomingTracks[0] || null;
}

/**
 * Returns the track that was most recently released or is releasing next
 * Used for the countdown display
 */
export function getCountdownTrack(): { track: Track; isReleased: boolean } | null {
    const today = new Date().toISOString().split('T')[0];

    // First, check for an upcoming track
    const upcoming = getNextUpcomingTrack();
    if (upcoming) {
        return { track: upcoming, isReleased: false };
    }

    // If no upcoming, get the most recently released track
    const released = getReleasedTracks()
        .sort((a, b) => (b.releaseDate! > a.releaseDate! ? 1 : -1));

    if (released[0]) {
        return { track: released[0], isReleased: true };
    }

    return null;
}
