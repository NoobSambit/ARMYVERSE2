# AI Playlist Generation System

## Overview

ARMYVERSE features a sophisticated AI-powered playlist generation system that creates personalized BTS playlists using advanced AI (Groq Llama 3.3 70B) with comprehensive parameter control. The system offers an intuitive UI with multiple ways to customize your perfect playlist.

**Current Version**: 2.0 (Complete Refactor - January 2026)

## Core Features

### 🎵 **AI Playlist Architect**
The main interface for creating AI-curated playlists with extensive customization options:

1. **Natural Language Prompts** - Describe your ideal playlist in your own words
2. **Mood Selection** - Choose from 6 moods (Energetic, Sentimental, Dark, Chill, Retro, Acoustic)
3. **Member & Era Selection** - Focus on specific members or time periods
4. **Seed Track Selection** - Pick up to 5 songs to match the vibe
5. **Genre Mix Control** - Adjust distribution across 6 BTS-specific genres
6. **Flow Pattern Selection** - Control energy progression throughout the playlist
7. **Audio Features** - Fine-tune danceability and valence (happiness)
8. **Context Optimization** - Optimize for specific scenarios (Workout, Study, Party, Sleep, Commute)
9. **Lyrical Match** - Ensure thematic consistency in lyrics

### 🎯 **Quick Start Options**

- **Template Gallery** - 6 pre-configured templates (Gym Beast Mode, Healing Hour, Nostalgia, etc.)
- **Personality Quiz** - 6-question quiz that auto-configures settings based on preferences
- **Quick Start Presets** - Study Session, Gym Hype, Healing
- **Surprise Me** - Randomly generates all parameters for discovery

### 🔄 **Advanced Features**

- **Evolve Playlist** - Refine generated playlists with natural language instructions
- **Compare Playlists** - Side-by-side comparison with overlap analysis
- **Save/Load Configurations** - Save favorite parameter combinations as presets
- **AI Inspiration** - Get creative prompt suggestions based on current settings
- **Playlist History** - Access recently generated playlists

## User Interface Components

### Main Controls

#### 1. **Core Vibe & Atmosphere**
- **Playlist Name** - Custom name for your playlist
- **Prompt Input** - Natural language description (e.g., "Comforting songs for a rainy day")
- **AI Inspiration Button** - Get AI-generated prompt suggestions
- **Mood Pills** - Select multiple moods simultaneously
- **Quick Starts** - One-click preset prompts

#### 2. **Members & Eras**
- **Member Selection** - Choose from OT7 or individual members
- **Era Dropdown** - Filter by time period (2013-2014, HYYH, Love Yourself, MOTS, Chapter 2)

#### 3. **Format Controls**
- **Playlist Length Slider** - 10-50 songs
- **Duration Estimate** - Real-time calculation of playlist length
- **Format Selection** - Standard, Remix, or Instrumental versions

#### 4. **Seed Tracks** (NEW)
- Click to open searchable modal
- Select up to 5 BTS songs from your tracks collection
- AI matches energy, danceability, and overall vibe
- Shows audio feature data for each seed

#### 5. **Genre Mix Dial** (NEW)
- Interactive dial with 6 BTS-specific genres:
  - **Ballad** - Emotional vocals, slow tempo
  - **Hip-Hop** - Rap-focused, rhythmic
  - **EDM** - Electronic, high energy
  - **R&B** - Smooth, soulful
  - **Rock** - Guitar-driven, powerful
  - **Dance-Pop** - Upbeat, catchy

Click to open modal with:
- Individual sliders for each genre (auto-balancing)
- Real-time visual preview
- Quick presets (Balanced, Ballad Focus, Hip-Hop Focus, EDM Focus)

#### 6. **Smart Filters**
- **Danceability Slider** - Calm to Hype (0-100%)
- **Valence Slider** - Sad to Happy (0-100%)

#### 7. **Flow Pattern** (NEW)
Click to select from 5 patterns:
- **Slow Build → Peak** - Gradually increase energy
- **Consistent Energy** - Steady vibe throughout
- **Wave Pattern** - Alternate high and low energy
- **Peak → Cool Down** - Start strong, end calm
- **Random Mix** - Shuffled energy levels

#### 8. **Context & Features**
- **Lyrical Match Toggle** - Match lyrical themes
- **Context Selector** - Auto, Workout, Study, Party, Sleep, Commute

### Generation Panel

- **Generate Button** - Creates playlist with current settings
- **Surprise Me** - Randomizes all parameters
- **Compare** - Add to comparison view
- **Save/Load Config** - Manage presets

### Results Display

After generation:
- Track grid with album art
- BPM display for each track
- Export to Spotify button
- Share button
- **Evolve Button** (floating) - Refine the playlist

## API Endpoints

### POST `/api/playlist/generate-enhanced`

Main endpoint for AI playlist generation with Groq AI.

**Request Body:**
```json
{
  "prompt": "Comforting songs for a rainy day",
  "playlistName": "Rainy Day Vibes",
  "moods": ["sentimental", "acoustic"],
  "artistBias": ["Jin", "Jimin", "V"],
  "playlistLength": 25,
  "yearEra": ["2017-2018"],
  "playlistType": "feel-based",
  "format": "standard",
  "seedTracks": [
    {
      "name": "Spring Day",
      "artist": "BTS",
      "spotifyId": "...",
      "audioFeatures": {
        "energy": 0.45,
        "danceability": 0.35
      }
    }
  ],
  "genreMix": {
    "ballad": 50,
    "hiphop": 10,
    "edm": 5,
    "rnb": 25,
    "rock": 5,
    "dancePop": 5
  },
  "flowPattern": "slow-build",
  "context": "sleep",
  "lyricalMatch": true,
  "audioFeatures": {
    "danceability": 30,
    "valence": 40
  },
  "firebaseUid": "user123",
  "saveToDb": true
}
```

**Response:**
```json
{
  "playlist": [
    {
      "title": "Spring Day",
      "artist": "BTS",
      "album": "You Never Walk Alone",
      "spotifyId": "...",
      "albumArt": "https://...",
      "duration": 276000,
      "popularity": 95,
      "bpm": 86,
      "audioFeatures": {
        "energy": 0.45,
        "danceability": 0.35,
        "valence": 0.32
      }
    }
  ],
  "playlistId": "507f1f77bcf86cd799439011",
  "saved": true
}
```

### GET `/api/playlist/seed-tracks`

Fetch BTS songs for seed track selection.

**Query Parameters:**
- `search` - Search term (optional)
- `limit` - Max results (default: 50)

**Response:**
```json
{
  "tracks": [
    {
      "_id": "...",
      "spotifyId": "...",
      "name": "Dynamite",
      "artist": "BTS",
      "album": "BE",
      "thumbnails": {
        "medium": "https://...",
        "small": "https://..."
      },
      "audioFeatures": {
        "energy": 0.85,
        "danceability": 0.75
      }
    }
  ],
  "count": 50
}
```

### POST `/api/playlist/ai-inspiration`

Generate creative prompt suggestions.

**Request Body:**
```json
{
  "moods": ["sentimental", "acoustic"],
  "members": ["Jin", "V"],
  "era": "2017-2018",
  "context": "sleep"
}
```

**Response:**
```json
{
  "suggestion": "A moonlit journey through vocal line's most tender moments"
}
```

### GET/POST/DELETE `/api/playlist/configs`

Manage saved playlist configurations.

**POST Request:**
```json
{
  "firebaseUid": "user123",
  "config": {
    "name": "My Perfect Study Mix",
    "prompt": "Calm focused songs",
    "moods": ["chill"],
    "members": ["BTS"],
    "era": "all",
    "format": "standard",
    "length": 30,
    "audioFeatures": { "danceability": 30, "valence": 50 },
    "genreMix": { "ballad": 40, "rnb": 30, "hiphop": 30 },
    "flowPattern": "consistent",
    "context": "study",
    "lyricalMatch": false,
    "seedTracks": []
  }
}
```

**GET Response:**
```json
{
  "configs": [
    {
      "name": "My Perfect Study Mix",
      "prompt": "Calm focused songs",
      // ... full config
    }
  ]
}
```

### POST `/api/playlist/evolve`

Refine an existing playlist with natural language instructions.

**Request Body:**
```json
{
  "currentPlaylist": [
    { "title": "Dynamite", "artist": "BTS", "album": "BE" }
  ],
  "instruction": "Make it more energetic",
  "originalPrompt": "Happy upbeat songs"
}
```

**Response:**
```json
{
  "playlist": [
    // Evolved playlist with more energetic tracks
  ],
  "changes": "Replaced calmer tracks with higher energy alternatives while maintaining the happy vibe"
}
```

### GET `/api/playlist/history`

Fetch user's recently generated playlists.

**Query Parameters:**
- `firebaseUid` - User ID (required)
- `limit` - Max results (default: 10)

## AI Prompt Engineering

The system uses a sophisticated prompt structure sent to Groq Llama 3.3 70B:

### Prompt Structure

```
You are an expert BTS music curator. Create a carefully curated BTS playlist based on the specifications below.

MAIN REQUEST: "{user's prompt}"

CORE CONSTRAINTS:
- Return exactly {N} songs
- CRITICAL: ONLY include songs that actually exist on Spotify
- Ensure variety - avoid repeating similar tracks

PARAMETERS:
- Target mood: {moods}
- Emphasize these BTS members: {members}
- Focus on these eras: {eras}
- Seed tracks to match: "{track1}" by {artist} (Energy: 85%, Dance: 75%)
- Danceability preference: {calm/moderate/hype}
- Mood/valence preference: {sad/neutral/happy}
- Genre distribution: Ballads (50%), R&B (25%), Hip-Hop (15%), EDM (10%)
- Flow pattern: Start calm and gradually increase energy towards the end
- Context: Optimize for {sleep/workout/study/etc.}
- Pay special attention to lyrical themes and storytelling consistency

SONG SELECTION STRATEGY:
1. Balance Requirements:
   - Match the main request and mood/vibe
   - Follow the genre distribution percentages
   - Respect the flow pattern (energy progression)
   - Consider context optimization
   - Include variety across eras unless specified

2. Quality Standards:
   - ONLY officially released songs available on Spotify
   - Include both popular hits and deep cuts
   - Avoid repetitive sounds
   - Match seed track energy/style
   - Balance group songs and solo work

3. Energy Flow:
   - Start with lower energy tracks, gradually build to high energy peaks

ARTIST ATTRIBUTION RULES (CRITICAL):
- BTS GROUP albums → "artist": "BTS"
  (Includes solo/unit tracks ON group albums)
- SOLO albums → "artist": [Member Name]

VERIFIED EXAMPLES:
[13 verified BTS songs with proper attribution]

FINAL CHECKLIST:
✓ Exact count: {N} songs
✓ All songs exist on Spotify
✓ Artist attribution follows rules
✓ Genre distribution matches
✓ Energy flow matches pattern
✓ Variety in selection
✓ Valid JSON format

Return ONLY the JSON object, no additional text.
```

### Key Improvements

1. **Role Definition** - Sets AI as "expert curator"
2. **Detailed Constraints** - Clear rules and boundaries
3. **Parameter Integration** - All UI settings included with context
4. **Seed Track Features** - Audio data for better matching
5. **Genre Percentages** - Exact distribution requirements
6. **Flow Instructions** - Dynamic based on selected pattern
7. **Verified Examples** - 13 real songs to guide AI
8. **Checklist** - Final validation before response

## Workflow Diagrams

### Complete Generation Flow

```mermaid
graph TD
    A[User Opens AI Playlist Page] --> B[Configure Parameters]
    B --> C{Use Quick Start?}
    C -->|Yes| D[Apply Template/Quiz/Preset]
    C -->|No| E[Manual Configuration]
    D --> E
    E --> F[Select Seed Tracks Optional]
    F --> G[Adjust Genre Mix Optional]
    G --> H[Choose Flow Pattern]
    H --> I[Click Generate]
    I --> J[POST /api/playlist/generate-enhanced]
    J --> K[Groq AI Processes Request]
    K --> L[AI Returns Song List]
    L --> M[Lookup Tracks in MongoDB]
    M --> N[Enrich with Spotify Data]
    N --> O[Return Complete Playlist]
    O --> P{Satisfied?}
    P -->|No| Q[Click Evolve]
    Q --> R[POST /api/playlist/evolve]
    R --> K
    P -->|Yes| S[Export to Spotify]
    S --> T[Open in Spotify App]
```

### Feature Interaction Map

```mermaid
graph LR
    A[Prompt Input] --> Z[AI Generation]
    B[Mood Selection] --> Z
    C[Member Selection] --> Z
    D[Era Selection] --> Z
    E[Seed Tracks] --> Z
    F[Genre Mix] --> Z
    G[Flow Pattern] --> Z
    H[Audio Features] --> Z
    I[Context] --> Z
    J[Lyrical Match] --> Z

    K[AI Inspiration] --> A
    L[Quick Starts] --> A
    M[Template Gallery] --> ALL[All Parameters]
    N[Personality Quiz] --> ALL
    O[Surprise Me] --> ALL

    Z --> P[Generated Playlist]
    P --> Q[Evolve]
    P --> R[Compare]
    P --> S[Export]

    Q --> Z
```

## Configuration Management

### Saving Configurations

Users can save their favorite parameter combinations:

```typescript
// Frontend
const saveConfiguration = async () => {
  const config = {
    name: "My Study Mix Settings",
    prompt: currentPrompt,
    moods: selectedMoods,
    members: selectedMembers,
    // ... all parameters
  }

  await fetch('/api/playlist/configs', {
    method: 'POST',
    body: JSON.stringify({
      firebaseUid: user.uid,
      config
    })
  })
}
```

### Loading Configurations

```typescript
// Frontend
const loadConfiguration = (config) => {
  setPrompt(config.prompt)
  setSelectedMoods(config.moods)
  setSelectedMembers(config.members)
  setGenreMix(config.genreMix)
  // ... restore all settings
}
```

## Template System

### Pre-configured Templates

**Gym Beast Mode**
- Members: SUGA, RM, j-hope
- Moods: Energetic, Dark
- Genre: 50% Hip-Hop, 20% EDM
- Flow: Slow Build
- Context: Workout
- Audio: High danceability (85%), High valence (70%)

**Healing Hour**
- Members: Jin, Jimin, V, Jung Kook
- Moods: Sentimental, Acoustic, Chill
- Genre: 60% Ballad, 20% R&B
- Flow: Consistent
- Context: Sleep
- Audio: Low danceability (25%), Low valence (40%)

**2013-2015 Nostalgia**
- Members: BTS (OT7)
- Moods: Retro, Energetic
- Era: 2013-2014
- Genre: 40% Hip-Hop, 15% Ballad
- Flow: Wave

**Chapter 2 Solo Journey**
- Members: All solo (RM, Jin, SUGA, j-hope, Jimin, V, Jung Kook)
- Era: 2022-2023
- Genre: Diverse mix
- Flow: Random

## Performance & Optimization

### Caching Strategy
- **Spotify Access Token** - Cached for 59 minutes
- **Track Metadata** - Cached in MongoDB indefinitely
- **AI Responses** - Not cached (always fresh generation)
- **Playlist History** - Fetched on page load, cached in state

### Rate Limiting
- **AI Generation** - Limited by Groq API quota
- **Spotify Lookups** - Batched to reduce API calls
- **Database Queries** - Indexed for fast lookups

### Optimization Techniques
1. **Lazy Loading** - Heavy components (TemplateGallery, PersonalityQuiz, CompareView) loaded on demand
2. **Debounced Search** - Seed track search debounced to reduce requests
3. **Parallel Lookups** - Track enrichment done in parallel
4. **Progressive Enhancement** - Core features work without JavaScript

## Best Practices

### For Users

**Creating Great Playlists:**
1. ✅ Start with a clear prompt describing the vibe
2. ✅ Select 2-3 moods that match your intention
3. ✅ Use seed tracks if you have specific songs in mind
4. ✅ Adjust genre mix for better results (default is balanced)
5. ✅ Choose appropriate flow pattern for listening scenario
6. ✅ Use context selector for activity-specific optimization

**Using Advanced Features:**
1. ✅ Try Personality Quiz if unsure where to start
2. ✅ Use Template Gallery for quick, pre-configured setups
3. ✅ Save configurations you like for future use
4. ✅ Use Evolve to refine playlists instead of regenerating
5. ✅ Compare multiple variations before exporting

### For Developers

**Prompt Engineering:**
1. ✅ Be specific with AI instructions
2. ✅ Include verified examples
3. ✅ Add validation checkpoints
4. ✅ Use structured output format (JSON)
5. ✅ Handle edge cases (empty results, invalid tracks)

**Database Design:**
1. ✅ Index frequently queried fields (spotifyId, artist, isBTSFamily)
2. ✅ Store audio features for matching
3. ✅ Cache track metadata to reduce API calls
4. ✅ Use lean() for read-only queries

**Error Handling:**
1. ✅ Fallback playlists when AI fails
2. ✅ Validate all track lookups
3. ✅ Graceful degradation for missing data
4. ✅ User-friendly error messages

## Troubleshooting

### Common Issues

**"Failed to generate playlist"**
- **Cause**: Groq API error or timeout
- **Solution**: Check GROQ_API_KEY env variable, retry request

**"Seed tracks not loading"**
- **Cause**: MongoDB connection issue or empty tracks collection
- **Solution**: Verify MONGODB_URI, ensure tracks are populated

**"Genre mix doesn't apply"**
- **Cause**: AI may approximate due to limited genre variety in request
- **Solution**: Use broader era selection, reduce specific member constraints

**"Flow pattern not working"**
- **Cause**: AI interprets flow as guidance, not strict rule
- **Solution**: Use more explicit flow instructions in prompt

**"Configuration save failed"**
- **Cause**: User not authenticated or database error
- **Solution**: Check authentication, verify MongoDB connection

## Environment Variables

```env
# AI Configuration
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx

# Spotify Integration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/armyverse

# Firebase (for user authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=armyverse.firebaseapp.com
```

## Related Documentation

- [MongoDB Track Schema](../database/schemas.md#track-schema)
- [Spotify Integration](./spotify-integration.md)
- [Authentication Flow](./authentication.md)
- [API Reference](../api/playlists.md)

---

**Last Updated**: January 2026
**System Version**: 2.0 (Complete Refactor)
**AI Model**: Groq Llama 3.3 70B Versatile
