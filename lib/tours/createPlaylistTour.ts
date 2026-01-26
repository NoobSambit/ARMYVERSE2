import { TourStep } from '@/components/ui/GuidedTour'

export const CREATE_PLAYLIST_TOUR_ID = 'create-playlist-tour'

// Tour steps for the Streaming Focus Mode (DEFAULT and main feature)
export const streamingModeTourSteps: TourStep[] = [
    {
        target: '[data-tour="streaming-goals"]',
        title: '🎯 Set Your Streaming Goals',
        content: 'This is where the magic begins! Choose your platform (Spotify) and set how long you want your playlist to be. More songs = more streaming time! 💜',
        placement: 'right',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="focus-track"]',
        title: '⭐ Pick Your Focus Track',
        content: 'This is THE most important step! Search for the song you want to stream the most. This song will appear multiple times throughout the playlist to maximize its streams!',
        placement: 'right',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="mix-builder"]',
        title: '🎛️ Mix Builder Controls',
        content: 'This controls how your playlist is structured. "Auto" mode fills gaps automatically from albums you select. "Manual" mode lets you pick exact songs for gaps!',
        placement: 'right',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="gap-range"]',
        title: '📏 Gap Range Setting',
        content: 'How many filler songs between each focus track appearance? For Billboard charting, 3-4 songs between focus tracks is ideal. Adjust the min and max here!',
        placement: 'right',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="album-select"]',
        title: '💿 Select Filler Albums',
        content: 'Pick which albums the filler songs come from! Great for streaming an entire album while focusing on one song. You can select multiple albums!',
        placement: 'right',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="generate-streaming-btn"]',
        title: '⚡ Generate Your Playlist!',
        content: 'Once you\'ve set everything, press this button! Our algorithm will create the perfect streaming-optimized playlist for you. Fighting! 💪',
        placement: 'top',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="streaming-result"]',
        title: '📋 Your Generated Playlist',
        content: 'Voila! Your playlist appears here with optimization scores. You can drag to reorder, delete songs, and see the quality metrics at the top!',
        placement: 'left',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="streaming-export"]',
        title: '🚀 Export to Spotify!',
        content: 'Happy with your playlist? Click "Export to Spotify" to save it to your account! Then just press play and let it stream. Happy streaming, ARMY! 💜',
        placement: 'top',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mode-toggle"]',
        title: '🔄 Switch Modes Anytime',
        content: 'You can switch to "Manual" mode if you want to pick every song yourself. But Streaming mode is optimized for maximizing plays on your focus track!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
]

// Tour steps for the Manual Mode (optional, advanced users)
export const manualModeTourSteps: TourStep[] = [
    {
        target: '[data-tour="mode-toggle"]',
        title: '📌 You\'re in Manual Mode!',
        content: 'In Manual mode, you pick every song yourself. Great for custom playlists! Switch to "Streaming" mode for auto-optimization.',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="ai-generator-btn"]',
        title: '✨ Want AI to Do the Work?',
        content: 'Too lazy to pick songs? Click here and let our AI create the perfect playlist based on your mood! It\'s like magic! 🪄',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="search-box"]',
        title: '🔍 Search for Songs',
        content: 'Type any song name, album, or era here! For example, try "Butter", "Love Yourself", or "2020" to find songs.',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="track-list"]',
        title: '🎵 Your Selected Songs',
        content: 'Songs you pick appear here! Set how many times each song appears using the + and - buttons.',
        placement: 'right',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="generate-btn"]',
        title: '🔄 Generate Your Playlist',
        content: 'After adding songs, click this to shuffle and create your playlist!',
        placement: 'top',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="export-section"]',
        title: '🎉 Export to Spotify!',
        content: 'When ready, click "Export to Spotify" to save your playlist. Fighting! 💪',
        placement: 'top',
        spotlightPadding: 8,
    },
]
