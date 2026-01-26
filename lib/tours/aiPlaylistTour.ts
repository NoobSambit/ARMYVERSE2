import { TourStep } from '@/components/ui/GuidedTour'

export const AI_PLAYLIST_TOUR_ID = 'ai-playlist-tour'

export const aiPlaylistTourSteps: TourStep[] = [
    {
        target: '[data-tour="ai-header"]',
        title: '🤖 Welcome to AI Playlist Architect!',
        content: 'This is where the magic happens! Tell our AI what kind of BTS playlist you want, and it\'ll create the perfect mix for you. No song-picking needed!',
        placement: 'bottom',
        spotlightPadding: 16,
    },
    {
        target: '[data-tour="personality-quiz-btn"]',
        title: '🧠 Take the Personality Quiz!',
        content: 'Not sure what you want? Take this fun quiz and we\'ll figure out your perfect playlist vibe based on your personality!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="core-vibe"]',
        title: '💜 Describe Your Vibe',
        content: 'This is the most important part! Type what you\'re feeling - "songs for late night studying" or "hype tracks for gym" - anything goes! You can also pick mood tags below.',
        placement: 'bottom',
        spotlightPadding: 16,
    },
    {
        target: '[data-tour="quick-starts"]',
        title: '⚡ Quick Start Presets',
        content: 'Too lazy to type? Click one of these for instant inspiration! Study Session, Gym Hype, or Healing - we\'ve got you!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mood-pills"]',
        title: '🎨 Pick Your Moods',
        content: 'Click to select moods that match what you want! Energetic? Sentimental? Dark? Mix and match - the AI will understand!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="members-eras"]',
        title: '👥 Choose Members & Eras',
        content: 'Want only Jungkook songs? Or just HYYH era? Click on members and select eras to filter! OT7 is always on by default 💜',
        placement: 'right',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="format-section"]',
        title: '📏 Set Length & Format',
        content: 'Use the slider to choose how many songs you want (10-50). You can also pick if you want standard versions, remixes, or instrumentals!',
        placement: 'left',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="genre-mix"]',
        title: '🎛️ Adjust Genre Mix',
        content: 'Click the colorful wheel to adjust genre balance! Want more ballads? Less hip-hop? You\'re the DJ here!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="seed-tracks"]',
        title: '🌱 Add Seed Tracks',
        content: 'Got specific songs in mind? Add them as "seeds" and the AI will find similar vibes. It\'s like saying "more songs like this, please!"',
        placement: 'bottom',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="smart-filters"]',
        title: '🎚️ Fine-Tune with Filters',
        content: 'Danceability and Valence sliders help you dial in the exact energy. Left = calm/sad, Right = hype/happy. Science meets music!',
        placement: 'left',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="flow-section"]',
        title: '🌊 Choose Playlist Flow',
        content: 'Pick how the energy flows through your playlist! Slow Build starts calm and gets intense. Wave Pattern alternates between chill and hype. Cool!',
        placement: 'left',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="generate-button"]',
        title: '🚀 Generate Your Playlist!',
        content: 'All set? Smash this purple button and watch the AI work its magic! Your personalized BTS playlist will appear in seconds!',
        placement: 'left',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="action-buttons"]',
        title: '🎲 Fun Extras!',
        content: '"Surprise Me" randomizes everything for a fun playlist! "Compare" lets you save and compare different playlists. Experiment!',
        placement: 'left',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="history-panel"]',
        title: '📜 Your Playlist History',
        content: 'All your created playlists are saved here! Click any to restore it. "Saved to Spotify" tab shows playlists you\'ve exported. Never lose a playlist again!',
        placement: 'left',
        spotlightPadding: 12,
    },
]
