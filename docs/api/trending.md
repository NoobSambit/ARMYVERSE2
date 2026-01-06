# Trending APIs

Trending content from Spotify and YouTube.

---

## Spotify Trending

### GET /api/trending/top-songs

Get trending BTS songs on Spotify.

**Authentication**: Optional

**Query Parameters:**
- `limit` (number, default: 20)
- `memberFilter` (string): Filter by member or `"ot7"`

**Success Response (200):**
```json
{
  "ok": true,
  "songs": [
    {
      "title": "Dynamite",
      "artist": "BTS",
      "dailyStreams": 2500000,
      "totalStreams": 1500000000,
      "rank": 15,
      "coverArt": "https://...",
      "spotifyUrl": "https://open.spotify.com/track/..."
    }
  ],
  "lastUpdated": "2026-01-06T00:00:00.000Z"
}
```

---

## YouTube Trending

### GET /api/youtube/kworb/latest

Get latest YouTube trending data.

**Authentication**: Optional

**Success Response (200):**
```json
{
  "ok": true,
  "videos": [
    {
      "title": "BTS 'Dynamite' Official MV",
      "channelName": "HYBE LABELS",
      "dailyViews": 500000,
      "totalViews": 1800000000,
      "thumbnail": "https://...",
      "youtubeUrl": "https://youtube.com/watch?v=..."
    }
  ],
  "lastUpdated": "2026-01-06T00:00:00.000Z"
}
```

---

### POST /api/youtube/kworb/cron

Update YouTube trending data (cron job).

**Authentication**: CRON_SECRET required

**Success Response (200):**
```json
{
  "ok": true,
  "snapshot": { /* new snapshot */ }
}
```

---

## Related Documentation

- [Trending Content Feature Guide](../features/trending-content.md)
- [Cron Jobs Setup](../setup/cron-jobs.md)

---

**Last Updated**: January 2026
