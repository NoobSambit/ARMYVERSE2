# Spotify APIs

Spotify integration and analytics endpoints.

---

## OAuth Flow

### GET /api/spotify/auth-url

Get Spotify OAuth authorization URL.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "authUrl": "https://accounts.spotify.com/authorize?client_id=..."
}
```

**Usage:**
1. Frontend redirects user to `authUrl`
2. User authorizes app
3. Spotify redirects to callback URL
4. Callback exchanges code for tokens

---

### GET /api/spotify/callback

Handle Spotify OAuth callback.

**Authentication**: None (uses state parameter)

**Query Parameters:**
- `code` (string): Authorization code from Spotify
- `state` (string): State parameter for security

**Success:**
- Redirects to frontend with success message
- Stores Spotify tokens in database

---

## Connection Status

### GET /api/spotify/status

Get user's Spotify connection status.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "connected": true,
  "account": {
    "displayName": "John Doe",
    "email": "john@example.com",
    "spotifyId": "user_spotify_id",
    "product": "premium"
  },
  "lastSync": "2026-01-06T10:00:00.000Z"
}
```

---

### POST /api/spotify/disconnect

Disconnect user's Spotify account.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "disconnected": true
}
```

---

## Analytics

### GET /api/spotify/kworb/latest

Get latest Spotify analytics snapshot.

**Authentication**: Optional

**Success Response (200):**
```json
{
  "ok": true,
  "snapshot": {
    "date": "2026-01-06",
    "songs": [
      {
        "artist": "BTS",
        "title": "Dynamite",
        "totalStreams": 1500000000,
        "dailyStreams": 2500000,
        "globalRank": 15
      }
    ],
    "albums": [ /* album data */ ],
    "artists": [ /* artist data */ ]
  }
}
```

---

### POST /api/spotify/kworb/cron

Update Spotify analytics snapshot (cron job).

**Authentication**: CRON_SECRET required

**Success Response (200):**
```json
{
  "ok": true,
  "snapshot": { /* new snapshot */ }
}
```

---

### GET /api/spotify/kworb/compare

Compare snapshots between dates.

**Authentication**: Optional

**Query Parameters:**
- `from` (date): Start date
- `to` (date): End date

**Success Response (200):**
```json
{
  "ok": true,
  "comparison": {
    "streamGrowth": 15000000,
    "rankChanges": [ /* rank changes */ ]
  }
}
```

---

## Playlists

### GET /api/spotify/playlists

Get user's Spotify playlists.

**Authentication**: Required (Spotify connected)

**Success Response (200):**
```json
{
  "ok": true,
  "playlists": [
    {
      "id": "spotify_playlist_id",
      "name": "My BTS Mix",
      "trackCount": 50,
      "public": true,
      "collaborative": false,
      "url": "https://open.spotify.com/playlist/..."
    }
  ]
}
```

---

## Client Credentials

### POST /api/spotify/client-credentials

Get Spotify access token using client credentials flow.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "accessToken": "BQD...",
  "expiresIn": 3600
}
```

---

## Validation

### POST /api/spotify/validate

Validate user-provided Spotify credentials (BYO app).

**Authentication**: Required

**Request Body:**
```json
{
  "clientId": "user_client_id",
  "clientSecret": "user_client_secret"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "valid": true
}
```

---

## Related Documentation

- [Spotify Analytics Feature Guide](../features/spotify-analytics.md)
- [Playlist APIs](./playlists.md)
- [Environment Variables](../setup/environment-variables.md)

---

**Last Updated**: January 2026
