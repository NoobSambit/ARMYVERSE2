# Playlist APIs

AI and manual playlist generation endpoints.

---

## AI Playlist Generation

### POST /api/playlist/generate-enhanced

Generate AI-powered playlist using Groq Llama 3.3 70B.

**Authentication**: Optional (better results when authenticated)

**Request Body:**
```json
{
  "seedTracks": ["track_id_1", "track_id_2"],
  "genreMix": {
    "Ballad": 20,
    "Hip-Hop": 30,
    "EDM": 10,
    "R&B": 15,
    "Rock": 5,
    "Dance-Pop": 20
  },
  "flowPattern": "slow-build",
  "contextOptimization": "workout",
  "playlistLength": 20,
  "userPrompt": "High energy for morning workout"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "playlist": {
    "id": "playlist_abc123",
    "name": "Morning Workout Mix",
    "tracks": [
      {
        "id": "track_1",
        "title": "Dynamite",
        "artist": "BTS",
        "duration": 199,
        "energy": 0.9,
        "spotifyId": "5WM3WZSEKjFQMNmYBjJ3bK"
      }
    ],
    "metadata": {
      "avgEnergy": 0.85,
      "totalDuration": 3980,
      "genreDistribution": { "Hip-Hop": 30, "Dance-Pop": 70 }
    }
  }
}
```

---

### GET /api/playlist/seed-tracks

Get BTS tracks for seed selection.

**Authentication**: Optional

**Query Parameters:**
- `limit` (number, default: 50)
- `search` (string, optional)

**Success Response (200):**
```json
{
  "ok": true,
  "tracks": [
    {
      "id": "track_1",
      "title": "Dynamite",
      "artist": "BTS",
      "album": "BE",
      "spotifyId": "5WM3WZSEKjFQMNmYBjJ3bK",
      "audioFeatures": {
        "energy": 0.765,
        "valence": 0.737,
        "danceability": 0.746
      }
    }
  ]
}
```

---

### POST /api/playlist/ai-inspiration

Get AI-generated prompt suggestions.

**Authentication**: Optional

**Request Body:**
```json
{
  "mood": "energetic",
  "context": "workout"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "suggestions": [
    "Create a high-energy playlist perfect for morning cardio",
    "Mix upbeat tracks with powerful vocals for gym motivation",
    "Start slow and build to peak energy halfway through"
  ]
}
```

---

## Configuration Management

### GET /api/playlist/configs

Get saved playlist configurations.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "configs": [
    {
      "id": "config_1",
      "name": "Morning Workout",
      "genreMix": { "Hip-Hop": 40, "Dance-Pop": 60 },
      "flowPattern": "slow-build",
      "createdAt": "2026-01-06T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/playlist/configs

Save a playlist configuration.

**Authentication**: Required

**Request Body:**
```json
{
  "name": "Morning Workout",
  "config": {
    "genreMix": { "Hip-Hop": 40, "Dance-Pop": 60 },
    "flowPattern": "slow-build",
    "contextOptimization": "workout"
  }
}
```

**Success Response (201):**
```json
{
  "ok": true,
  "config": {
    "id": "config_1",
    "name": "Morning Workout",
    "config": { /* saved config */ },
    "createdAt": "2026-01-06T10:00:00.000Z"
  }
}
```

---

### DELETE /api/playlist/configs

Delete a saved configuration.

**Authentication**: Required

**Query Parameters:**
- `id` (string, required)

**Success Response (200):**
```json
{
  "ok": true,
  "deleted": true
}
```

---

## Playlist Evolution

### POST /api/playlist/evolve

Refine an existing playlist with natural language.

**Authentication**: Optional

**Request Body:**
```json
{
  "playlistId": "playlist_abc123",
  "instruction": "Make it more energetic and add more hip-hop"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "playlist": { /* evolved playlist */ }
}
```

---

## History

### GET /api/playlist/history

Get user's playlist generation history.

**Authentication**: Required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Success Response (200):**
```json
{
  "ok": true,
  "history": [
    {
      "id": "playlist_abc123",
      "name": "Morning Workout Mix",
      "createdAt": "2026-01-06T10:00:00.000Z",
      "trackCount": 20,
      "exported": true
    }
  ],
  "pagination": {
    "page": 1,
    "total": 50,
    "pages": 3
  }
}
```

---

## Export

### POST /api/playlist/export

Export playlist to Spotify.

**Authentication**: Required (Spotify connected)

**Request Body:**
```json
{
  "playlistId": "playlist_abc123",
  "name": "My BTS Workout Mix",
  "public": true
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "spotifyPlaylistId": "3cEYpjA9oz9GiPac4AsH4n",
  "url": "https://open.spotify.com/playlist/3cEYpjA9oz9GiPac4AsH4n"
}
```

---

## Manual Playlist

### POST /api/playlist/generate

Create manual playlist with specific tracks.

**Authentication**: Optional

**Request Body:**
```json
{
  "name": "My Favorites",
  "trackIds": ["track_1", "track_2", "track_3"]
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "playlist": { /* created playlist */ }
}
```

---

## Related Documentation

- [Playlist Generation Feature Guide](../features/playlist-generation.md)
- [Spotify APIs](./spotify.md)

---

**Last Updated**: January 2026
