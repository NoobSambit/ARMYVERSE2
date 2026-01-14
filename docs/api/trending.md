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

## YouTube Analytics & Trending

### GET /api/youtube/data

Get YouTube analytics data for BTS and solo members.

**Authentication**: Optional

**Query Parameters:**
- `artist` (string, optional): Filter by artist name (BTS, Jungkook, V, Suga, RM, Jimin, Jin, J-Hope)
- `videoId` (string, optional): Fetch detailed statistics for a specific video
- `refreshDetail` (string, optional): Set to "1" to force refresh cached video details

**Success Response (200) - All Artists:**
```json
{
  "dateKey": "2026-01-12",
  "lastRefreshedAt": "2026-01-12T10:30:00.000Z",
  "artistGroups": [
    {
      "artist": "BTS",
      "pageUrl": "https://kworb.net/youtube/artist/bts.html",
      "songs": [
        {
          "rank": 1,
          "videoId": "gdZLi9oWNZg",
          "title": "BTS (방탄소년단) 'Dynamite' Official MV",
          "artist": "BTS",
          "views": 2039979350,
          "yesterday": 325104,
          "published": "2020/08",
          "thumbnail": "https://i.ytimg.com/vi/gdZLi9oWNZg/maxresdefault.jpg",
          "url": "https://www.youtube.com/watch?v=gdZLi9oWNZg"
        }
      ],
      "totalViews": 35901703331,
      "totalSongs": 151,
      "dailyAvg": 6770107
    }
  ]
}
```

**Success Response (200) - Single Artist:**
```bash
GET /api/youtube/data?artist=J-Hope
```

**Success Response (200) - Video Details:**
```json
{
  "videoId": "gdZLi9oWNZg",
  "title": "BTS (방탄소년단) 'Dynamite' Official MV",
  "artist": "BTS",
  "published": "2020/08/21",
  "totalViews": 2039979350,
  "likes": 38894711,
  "mostViewsInADay": 82232664,
  "mostViewsDate": "2020/08/22",
  "expectedMilestone": "2,500,000,000",
  "milestoneViews": 2500000000,
  "milestoneDate": "2028/11/30",
  "dailyViews": [
    { "date": "2026/01/07", "views": 325104 },
    { "date": "2026/01/08", "views": 325104 }
  ],
  "monthlyViews": [
    { "date": "2020/08", "views": 267000000 },
    { "date": "2020/09", "views": 157000000 }
  ],
  "yearlyViews": [
    { "year": "2020", "views": 741000000 },
    { "year": "2021", "views": 605000000 }
  ],
  "topLists": [],
  "milestones": [
    "#2 fastest to 100 million",
    "#2 fastest to 200 million"
  ],
  "peakPosition": 1,
  "chartedWeeks": 131
}
```

**Error Response (404):**
```json
{
  "error": "No data available. Please run the refresh cron job."
}
```

---

### GET /api/youtube/kworb/latest

Get latest YouTube trending data (legacy endpoint).

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

**Authentication**: CRON_SECRET required (or disabled with DISABLE_CRON_AUTH=1 in dev)

**Success Response (200):**
```json
{
  "ok": true,
  "dateKey": "2026-01-12"
}
```

**Development Mode:**
When `DISABLE_CRON_AUTH=1`, you can trigger via GET request:
```bash
curl http://localhost:3000/api/youtube/kworb/cron
```

---

## Caching

### Data Refresh Schedule
- **List data**: Refreshed daily at 1:35 AM UTC via cron
- **Video details**: Cached for 24 hours after first fetch
- **Force refresh**: Add `refreshDetail=1` to bypass cache

### Cache Behavior
- Video details are automatically cached in MongoDB after first fetch
- Subsequent requests return cached data if less than 24 hours old
- Cache includes all detail data: daily, monthly, yearly views, milestones, etc.

---

## Related Documentation

- [YouTube Analytics Feature](../features/youtube-analytics.md) - Complete feature guide
- [Trending Content Feature Guide](../features/trending-content.md)
- [Cron Jobs Setup](../setup/cron-jobs.md)

---

**Last Updated**: January 2026
