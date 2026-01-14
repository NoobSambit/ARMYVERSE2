# YouTube Analytics

Comprehensive YouTube video statistics for BTS and all solo members, accessible at `/youtube`.

## Overview

The YouTube Analytics page provides detailed viewing statistics for all BTS and solo member music videos, scraped from [kworb.net](https://kworb.net/youtube/artist/bts.html) and updated daily.

**Page URL:** `/youtube`

**Features:**
- View counts and daily trends for all videos
- Filter by BTS or individual solo members
- Detailed video statistics in modal view
- Historical daily, monthly, and yearly view data
- Chart performance tracking
- Milestone tracking

## Members Tracked

| Member | Videos | Data Source |
|--------|--------|-------------|
| BTS (OT7) | ~151 | kworb.net/youtube/artist/bts.html |
| Jungkook | ~15 | Filtered from BTS page |
| V | ~2 | Filtered from BTS page |
| Suga | ~11 | Filtered from BTS page |
| RM | ~14 | Filtered from BTS page |
| Jimin | ~10 | Filtered from BTS page |
| Jin | ~9 | Filtered from BTS page |
| J-Hope | ~16 | Filtered from BTS page |

## Data Displayed

### Main List View

For each selected member, the page displays:

| Column | Description |
|--------|-------------|
| Rank | Position by daily views |
| Thumbnail | YouTube video thumbnail |
| Title | Video title |
| Published | Release date (YYYY/MM) |
| Total Views | Lifetime view count |
| Yesterday | Daily view gain with trend indicator |

### Stats Cards

At the top of each member view:

- **Total Views** - Combined views of all videos
- **Daily Average** - Average daily views across all videos
- **Total Videos** - Number of videos tracked
- **Member** - Current member with emoji indicator

### Video Detail Modal

Clicking any video opens a comprehensive modal with:

**Key Statistics:**
- Total views
- Likes count
- Best day (most views in 24 hours)
- Publish date
- Expected milestone (e.g., "Expected to hit 2.5B on 2028/11/30")

**Tabbed Views:**

1. **Overview Tab**
   - Top lists the video appears on
   - Milestone achievements
   - Best single day performance

2. **Daily Tab**
   - Recent daily view counts (last ~12 days)
   - Visual bar chart comparison

3. **Monthly Tab**
   - Monthly view estimates
   - Visual trend chart

4. **Yearly Tab**
   - Yearly view totals
   - Annual performance comparison

## API Endpoints

### GET /api/youtube/data

Fetch YouTube analytics data.

**Query Parameters:**
- `artist` (optional) - Filter by artist name (BTS, Jungkook, V, Suga, RM, Jimin, Jin, J-Hope)
- `videoId` (optional) - Fetch detailed statistics for specific video

**Examples:**

```bash
# Get all artists
curl /api/youtube/data

# Get specific artist
curl /api/youtube/data?artist=J-Hope

# Get video details
curl /api/youtube/data?videoId=gdZLi9oWNZg
```

**Response (all artists):**
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

**Response (video details):**
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

### POST /api/youtube/kworb/cron

Manual trigger for YouTube data refresh.

**Authentication:** Bearer token with CRON_SECRET (or disabled in dev with DISABLE_CRON_AUTH=1)

**Response:**
```json
{
  "ok": true,
  "dateKey": "2026-01-12"
}
```

## Data Storage

### YouTubeKworbSnapshot Collection

```typescript
{
  dateKey: "2026-01-12",           // Unique per day
  artistGroups: [
    {
      artist: "BTS",
      pageUrl: "https://kworb.net/youtube/artist/bts.html",
      songs: [
        {
          rank: 1,
          videoId: "gdZLi9oWNZg",
          title: "Dynamite Official MV",
          artist: "BTS",
          views: 2039979350,
          yesterday: 325104,
          published: "2020/08",
          thumbnail: "https://i.ytimg.com/vi/...",
          url: "https://www.youtube.com/watch?v=...",
          // Detailed statistics (fetched on demand)
          detail: {
            totalViews: 2039979350,
            likes: 38894711,
            mostViewsInADay: 82232664,
            mostViewsDate: "2020/08/22",
            dailyViews: [{ date: "2026/01/07", views: 325104 }],
            monthlyViews: [{ date: "2020/08", views: 267000000 }],
            yearlyViews: [{ year: "2020", views: 741000000 }],
            milestones: ["#2 fastest to 100 million"]
          },
          detailLastFetched: Date  // 24-hour cache
        }
      ],
      totalViews: 35901703331,
      totalSongs: 151,
      dailyAvg: 6770107
    }
  ],
  lastRefreshedAt: Date,
  sourceUrl: "https://kworb.net/youtube/artist/bts.html",
  createdAt: Date,
  updatedAt: Date
}
```

**Index:** `{ dateKey: 1 }` (unique)

## Caching Strategy

### List Data
- **Update frequency:** Once per day (1:35 AM UTC via cron)
- **Source:** YouTubeKworbSnapshot collection
- **Freshness:** Up to 24 hours old

### Video Detail Data
- **Cache duration:** 24 hours
- **Cache key:** `videoId` + `detailLastFetched` timestamp
- **Refresh:** Automatically refetched when cache expires
- **Storage:** Cached within `YouTubeKworbSnapshot.artistGroups[].songs[].detail`

## Member Filtering

Videos are categorized by member using keyword matching:

| Member | Keywords Matched |
|--------|-------------------|
| BTS | BTS, 방탄소년단, 防弾少年団 (excluding solo mentions) |
| Jungkook | Jung Kook, Jungkook, 정국 |
| V | V, Taehyung, 뷔, 태형 |
| Suga | Suga, Agust D, Agustd, 슈가, 민윤기 |
| RM | RM, Rap Monster, 남준, 알엠 |
| Jimin | Jimin, 지민, 박지민 |
| Jin | Jin, Seokjin, 진, 석진 |
| J-Hope | J-Hope, Jhope, j-hope, jhope, 제이홉, 호석, 정호석 |

## UI Components

### Page Structure

```
/youtube
├── Header (sticky)
│   ├── YouTube logo
│   └── Refresh button
├── Member Navigation (sticky)
│   └── 8 member tabs with emoji icons
├── Stats Cards
│   ├── Total Views
│   ├── Daily Average
│   ├── Total Videos
│   └── Current Member
└── Video List
    └── Clickable rows → opens modal
```

### Modal Structure

```
Video Detail Modal
├── Video Embed (YouTube iframe)
├── Key Stats (4 cards)
│   ├── Total Views
│   ├── Likes
│   ├── Best Day
│   └── Published
├── Milestone Countdown
├── Chart Performance
└── Tabbed Analytics
    ├── Overview
    ├── Daily (bar chart)
    ├── Monthly (bar chart)
    └── Yearly (bar chart)
```

## Mobile Responsiveness

### Navigation
- Horizontal scrollable member tabs
- Full-width stat cards on mobile

### Video List
- Stacked layout on mobile
- Thumbnail + title + stats visible
- "Yesterday" views prominent (green indicator)

### Modal
- Full-screen on mobile
- Tab navigation at top
- Scrollable content area
- Safe area insets for notched devices

## Performance

### Load Times
- **List data:** ~100ms (cached from MongoDB)
- **Video detail:** ~500-1500ms (first fetch), ~100ms (cached)

### Optimization
- Video detail cached for 24 hours
- Images optimized via Next.js Image component
- Lazy loading for video list
- Pagination support for large lists

## Troubleshooting

### No Videos Showing

**Check cron ran today:**
```bash
curl /api/youtube/data
# Look for dateKey matching today's date
```

**Manually trigger refresh:**
```bash
curl -X POST /api/youtube/kworb/cron
```

### Video Details Not Loading

**Check video ID is valid:**
- Video IDs should be 11 characters
- Test URL: `https://www.youtube.com/watch?v={videoId}`

**Clear cache (force refresh):**
```bash
curl /api/youtube/data?videoId={videoId}&refreshDetail=1
```

### Member Has No Videos

**Check filtering keywords:**
- Video title must contain member keywords
- Some collaborations may not be categorized
- Check [lib/youtube/kworb.ts](../../lib/youtube/kworb.ts) for keyword patterns

### Thumbnails Not Loading

**Verify Next.js config:**
```javascript
// next.config.js
images: {
  domains: ['i.ytimg.com'],
}
```

**Test thumbnail URL directly:**
```
https://i.ytimg.com/vi/{videoId}/maxresdefault.jpg
```

## Related Documentation

- [Cron Jobs Setup](../setup/cron-jobs.md) - Automated data refresh
- [API Reference](../api/overview.md) - All API endpoints
- [Spotify Analytics](./spotify-analytics.md) - Similar analytics for Spotify
