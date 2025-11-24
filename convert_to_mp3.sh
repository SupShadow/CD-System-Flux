#!/bin/bash

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg is not installed. Install it with: brew install ffmpeg"
    exit 1
fi

cd "/Users/julianguggeis/CD System Flux"
mkdir -p public/music

# Convert all WAV files to MP3 (high quality: 320kbps)
echo "Converting WAV files to MP3..."

ffmpeg -i "music/Alles hat ein Ende (Cover) (Cover).wav" -b:a 320k "public/music/alles_hat_ein_ende.mp3" -y &
ffmpeg -i "music/BUNKERBIT (Cover).wav" -b:a 320k "public/music/bunkerbit.mp3" -y &
ffmpeg -i "music/Breathe No More.wav" -b:a 320k "public/music/breathe_no_more.mp3" -y &
ffmpeg -i "music/Clean Shot _ Dead Mic (Remix) (Cover) (Cover).wav" -b:a 320k "public/music/clean_shot_dead_mic.mp3" -y &
ffmpeg -i "music/Click Shift Repeat (Cover) (Cover) (Cover).wav" -b:a 320k "public/music/click_shift_repeat.mp3" -y &
ffmpeg -i "music/Double Life (Cover) (Cover) (Cover) (Cover).wav" -b:a 320k "public/music/double_life.mp3" -y &
ffmpeg -i "music/Glitch in the Matrix (Cover).wav" -b:a 320k "public/music/glitch_in_the_matrix.mp3" -y &
ffmpeg -i "music/Heretic to Your Halo (Cover).wav" -b:a 320k "public/music/heretic_to_your_halo.mp3" -y &
ffmpeg -i "music/Higher Than the Skyline (Remix) (Cover).wav" -b:a 320k "public/music/higher_than_the_skyline.mp3" -y &
ffmpeg -i "music/ION CORE (Cover).wav" -b:a 320k "public/music/ion_core.mp3" -y &
ffmpeg -i "music/KILLSWITCH PRESS CONFERENCE.wav" -b:a 320k "public/music/killswitch_press_conference.mp3" -y &
ffmpeg -i "music/Likes and Lies.wav" -b:a 320k "public/music/likes_and_lies.mp3" -y &
ffmpeg -i "music/Make Me the Villain.wav" -b:a 320k "public/music/make_me_the_villain.mp3" -y &
ffmpeg -i "music/Mirror Match IQ (Cover) (Cover) (Cover).wav" -b:a 320k "public/music/mirror_match_iq.mp3" -y &
ffmpeg -i "music/Neon Enigma (Cover).wav" -b:a 320k "public/music/neon_enigma.mp3" -y &
ffmpeg -i "music/No Continue (Cover).wav" -b:a 320k "public/music/no_continue.mp3" -y &
ffmpeg -i "music/Patch Notes_ Me (Cover).wav" -b:a 320k "public/music/patch_notes_me.mp3" -y &
ffmpeg -i "music/Release the Frames (Dear Mr. Burns) (Cover) (Cover).wav" -b:a 320k "public/music/release_the_frames.mp3" -y &
ffmpeg -i "music/Runaway (Cover) (Cover) (Cover).wav" -b:a 320k "public/music/runaway.mp3" -y &
ffmpeg -i "music/Still Falling (Cover) (Cover) (Cover).wav" -b:a 320k "public/music/still_falling.mp3" -y &
ffmpeg -i "music/Tidal Weight (Remix) (Cover) (Cover).wav" -b:a 320k "public/music/tidal_weight.mp3" -y &
ffmpeg -i "music/Turn Me Louder (Cover) 1.wav" -b:a 320k "public/music/turn_me_louder.mp3" -y &
ffmpeg -i "music/Voices Are a Loaded Room.wav" -b:a 320k "public/music/voices_are_a_loaded_room.mp3" -y &
ffmpeg -i "music/Wenn Ich Friere (Cover) (Cover) (Cover) (Cover).wav" -b:a 320k "public/music/wenn_ich_friere.mp3" -y &
ffmpeg -i "music/tracing.wav" -b:a 320k "public/music/tracing.mp3" -y &

# Wait for all conversions to complete
wait

echo "Conversion complete! MP3 files are in public/music/"
