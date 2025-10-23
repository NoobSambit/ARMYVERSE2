# Trending Section Revamp - Kworb Data Integration

## Overview

The trending section has been completely revamped to display top songs from both Spotify and YouTube based on daily streaming data from kworb.net. The new implementation includes:

- **OT7 vs Solo Toggle**: Switch between BTS group songs and individual member songs
- **Member Selector**: When Solo is selected, choose from any of the 7 members
- **Side-by-side Display**: Spotify on the left, YouTube on the right
- **3x2 Grid Layout**: Top 6 songs displayed in a grid where the #1 song takes 2x2 space
- **Real-time Data**: Cached data updated via cron jobs

## Architecture

### Backend Components

#### 1. YouTube Scraper (`/lib/youtube/kworb.ts`)
- Scrapes data from `https://kworb.net/youtube/artist/bts.html`
- Filters songs by artist using keyword matching
- Ranks songs by "Yesterday" streams column
- Extracts video thumbnails from YouTube IDs
- Handles all BTS members: BTS (OT7), Jungkook, V, Suga, RM, Jimin, Jin, J-Hope

**Key Features:**
- Smart keyword matching for accurate artist filtering
- Special handling for RM (avoids false positives with "rm" substring)
- Supports both "Suga" and "Agust D" artist pages
- Extracts YouTube video IDs and generates thumbnail URLs

#### 2. MongoDB Models

**KworbSnapshot** (`/lib/models/KworbSnapshot.ts`)
- Existing model for Spotify data
- Contains `songsByArtist` array with songs grouped by artist

**YouTubeKworbSnapshot** (`/lib/models/YouTubeKworbSnapshot.ts`)
- New model for YouTube data
- Contains `artistGroups` array with songs grouped by artist
- Schema:
  ```typescript
  {
    dateKey: string,        // "YYYY-MM-DD"
    artistGroups: [
      {
        artist: string,
        pageUrl: string,
        songs: [
          {
            rank: number,
            videoId: string,
            title: string,
            artist: string,
            views: number,
            yesterday: number,  // streams gained yesterday
            published: string,
            thumbnail: string,
            url: string
          }
        ]
      }
    ],
    createdAt: Date,
    updatedAt: Date
  }
  ```

#### 3. Cron Jobs

**Spotify Cron** (`/app/api/spotify/kworb/cron/route.ts`)
- Existing cron job (already implemented)
- Scrapes Spotify data daily
- POST endpoint with authentication

**YouTube Cron** (`/app/api/youtube/kworb/cron/route.ts`)
- New cron job for YouTube data
- Scrapes YouTube data daily
- POST endpoint with same authentication as Spotify cron

#### 4. API Routes

**Top Songs API** (`/app/api/trending/top-songs/route.ts`)
- Main API for fetching trending songs
- Query parameters:
  - `platform`: "spotify" or "youtube"
  - `category`: "ot7" or "solo"
  - `member`: Member name (e.g., "Jungkook", "V", "RM")
- Returns top 6 songs ranked by daily streams
- Response format:
  ```typescript
  {
    ok: boolean,
    platform: string,
    category: string,
    artist: string,
    songs: TopSong[]
  }
  ```

**Latest Snapshot APIs**
- Spotify: `/app/api/spotify/kworb/latest/route.ts` (existing)
- YouTube: `/app/api/youtube/kworb/latest/route.ts` (new)

### Frontend Components

#### 1. TopSongsGrid (`/components/trending/TopSongsGrid.tsx`)
- Displays 6 songs in a 3x2 grid layout
- #1 song takes 2x2 space (double width and height)
- Remaining 5 songs each take 1x1 space
- Features:
  - Hover effects with scale transitions
  - Rank badges
  - Daily streams/views display
  - External links to Spotify/YouTube
  - Responsive design (mobile-friendly)

#### 2. NewTrendingSection (`/components/trending/NewTrendingSection.tsx`)
- Main component for the trending section
- Features:
  - OT7/Solo category toggle
  - Member selector (shown when Solo is selected)
  - Side-by-side Spotify and YouTube grids
  - Loading states with spinners
  - Automatic data fetching on category/member change

## Setup Instructions

### 1. Install Dependencies
The existing dependencies should work. Make sure you have:
```bash
npm install cheerio
```

### 2. Set Up Cron Jobs

Add to your `vercel.json` or cron configuration:
```json
{
  "crons": [
    {
      "path": "/api/spotify/kworb/cron",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/youtube/kworb/cron",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Both cron jobs run daily at 6 AM UTC.

### 3. Environment Variables
Set the following in your `.env.local`:
```env
CRON_SECRET=your-secret-key-here
DISABLE_CRON_AUTH=1  # Only for local development
```

### 4. Initial Data Population

**For Local Development:**
```bash
# Trigger Spotify scraper
curl -X POST http://localhost:3000/api/spotify/kworb/cron

# Trigger YouTube scraper
curl -X POST http://localhost:3000/api/youtube/kworb/cron
```

**For Production:**
```bash
# Trigger Spotify scraper
curl -X POST https://your-domain.com/api/spotify/kworb/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Trigger YouTube scraper
curl -X POST https://your-domain.com/api/youtube/kworb/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 5. Verify Data

Check if data was successfully scraped:
- Spotify: `https://your-domain.com/api/spotify/kworb/latest`
- YouTube: `https://your-domain.com/api/youtube/kworb/latest`

## Usage

The new trending section is automatically integrated into the homepage (`/app/page.tsx`).

### Component Integration
```tsx
import NewTrendingSection from '@/components/trending/NewTrendingSection'

// In your page
<NewTrendingSection />
```

### Manual API Usage
```typescript
// Fetch BTS (OT7) Spotify songs
const response = await fetch('/api/trending/top-songs?platform=spotify&category=ot7')

// Fetch Jungkook solo Spotify songs
const response = await fetch('/api/trending/top-songs?platform=spotify&category=solo&member=Jungkook')

// Fetch V solo YouTube songs
const response = await fetch('/api/trending/top-songs?platform=youtube&category=solo&member=V')
```

## Member Keywords

The scraper uses smart keyword matching to filter songs by artist:

| Member | Keywords |
|--------|----------|
| BTS | BTS, 방탄소년단, 防弾少年団 |
| Jungkook | Jung Kook, Jungkook, 정국 |
| V | V (standalone), Taehyung, 뷔, 태형 |
| Suga | Suga, Agust D, 슈가, 민윤기 |
| RM | RM, Rap Monster, 남준, 알엠 |
| Jimin | Jimin, 지민, 박지민 |
| Jin | Jin, Seokjin, 진, 석진 |
| J-Hope | J-Hope, Jhope, 제이홉, 호석, 정호석 |

**Special Cases:**
- **RM**: Carefully avoids false positives with songs containing "rm" substring
- **BTS**: Excludes solo member songs to ensure only group songs are included
- **Suga**: Matches both "Suga" and "Agust D" personas

## Data Flow

```
Kworb.net
    ↓
Cron Jobs (Daily at 6 AM UTC)
    ↓
Scrapers (lib/youtube/kworb.ts, lib/spotify/kworb.ts)
    ↓
MongoDB (YouTubeKworbSnapshot, KworbSnapshot)
    ↓
API Routes (/api/trending/top-songs)
    ↓
Frontend Components (NewTrendingSection, TopSongsGrid)
    ↓
User Interface
```

## Caching Strategy

- **API Level**: 30 min cache, 1 hour stale-while-revalidate
- **Database**: Daily snapshots with `dateKey` indexing
- **Frontend**: React state management, refetch on category/member change

## Responsive Design

The grid layout adapts to different screen sizes:
- **Desktop**: Full 3x2 grid, #1 song in 2x2
- **Tablet**: Responsive grid with adjusted spacing
- **Mobile**: Stacked layout, optimized for touch

## Troubleshooting

### No Data Showing
1. Check if cron jobs have run: `/api/spotify/kworb/latest` and `/api/youtube/kworb/latest`
2. Manually trigger cron jobs (see "Initial Data Population")
3. Check MongoDB connection

### Wrong Songs Appearing
1. Review keyword matching in `/lib/youtube/kworb.ts`
2. Check artist filtering logic in `matchesArtist()` function
3. Verify the source data on kworb.net

### TypeScript Errors
- Ensure all type assertions (`as any`) are in place for MongoDB document access
- Check that all imports are correct

## Future Enhancements

Potential improvements:
- [ ] Real-time updates via WebSocket
- [ ] Song preview player integration
- [ ] Historical trending charts
- [ ] More detailed song statistics
- [ ] User favorites/bookmarks
- [ ] Share functionality
- [ ] Mobile app integration

## Files Changed/Added

### New Files
- `/lib/youtube/kworb.ts` - YouTube scraper
- `/lib/models/YouTubeKworbSnapshot.ts` - YouTube MongoDB model
- `/app/api/youtube/kworb/cron/route.ts` - YouTube cron job
- `/app/api/youtube/kworb/latest/route.ts` - YouTube latest API
- `/app/api/trending/top-songs/route.ts` - Top songs API
- `/components/trending/TopSongsGrid.tsx` - Grid component
- `/components/trending/NewTrendingSection.tsx` - Main section component

### Modified Files
- `/app/page.tsx` - Updated to use NewTrendingSection

### Existing Files (Referenced)
- `/lib/spotify/kworb.ts` - Spotify scraper (existing)
- `/lib/models/KworbSnapshot.ts` - Spotify MongoDB model (existing)
- `/app/api/spotify/kworb/cron/route.ts` - Spotify cron job (existing)
- `/app/api/spotify/kworb/latest/route.ts` - Spotify latest API (existing)

## Credits

Data sourced from [kworb.net](https://kworb.net) - A comprehensive music statistics website.
