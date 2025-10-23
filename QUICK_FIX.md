# 🔧 Quick Fix Guide

## ✅ All Issues Fixed!

Three major updates have been implemented:

1. **Spotify Album Art** - Now displays real album art from Spotify
2. **Automatic Scraping** - Runs every 24 hours via Vercel Cron Jobs
3. **Thumbnail Caching** - Fetched once per day, cached in MongoDB

---

## Quick Setup (First Time)

If YouTube section shows "No songs available", the database hasn't been populated yet.

## The Solution (3 steps)

### 1. Trigger the YouTube Scraper

Run this command in your terminal:

```bash
curl -X POST http://localhost:3001/api/youtube/kworb/cron
```

Or visit the test page and click the button:
```
http://localhost:3001/test-trending
```

### 2. Wait 10-30 seconds

The scraper needs time to fetch data from kworb.net and save to MongoDB.

### 3. Refresh your browser

Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to see the new data.

---

## Verify It Worked

Check if data was scraped:
```bash
curl http://localhost:3001/api/youtube/kworb/latest
```

You should see JSON with `artistGroups` containing BTS, Jungkook, V, etc.

---

## Still Not Working?

### Option A: Use the Debug Page

Visit: `http://localhost:3001/test-trending`

This page shows:
- ✅/❌ Database status
- 🔍 API responses
- 🔘 Quick action buttons

### Option B: Check Server Logs

Look at your terminal where `npm run dev` is running. You should see something like:
```
Kworb latest error: Not found
```

This means the cron hasn't run yet.

### Option C: Manual Debug

```bash
# 1. Check debug endpoint
curl http://localhost:3001/api/debug/trending

# 2. Check YouTube API
curl "http://localhost:3001/api/trending/top-songs?platform=youtube&category=ot7"

# 3. If either returns errors, trigger cron again
curl -X POST http://localhost:3001/api/youtube/kworb/cron
```

---

## What's Happening Behind the Scenes

1. **YouTube Scraper** (`/lib/youtube/kworb.ts`)
   - Fetches data from `https://kworb.net/youtube/artist/bts.html`
   - Filters songs by artist (BTS, Jungkook, V, etc.)
   - Ranks by "Yesterday" column (daily stream gains)
   - Extracts YouTube video IDs and thumbnails

2. **Cron Job** (`/api/youtube/kworb/cron/route.ts`)
   - Runs the scraper
   - Saves data to MongoDB (`YouTubeKworbSnapshot` collection)
   - Returns success/error status

3. **API** (`/api/trending/top-songs/route.ts`)
   - Fetches latest snapshot from MongoDB
   - Returns top 6 songs for requested artist
   - Caches response for 30 minutes

4. **Frontend** (`/components/trending/NewTrendingSection.tsx`)
   - Calls API when component mounts
   - Displays songs in TopSongsGrid component
   - Shows loading state while fetching

---

## Why Did This Happen?

You need to **manually trigger the cron job the first time** to populate the database. After that, it will run automatically daily (if you set up Vercel cron jobs).

---

## For Production (Vercel)

1. **Trigger cron manually** (one time):
   ```bash
   curl -X POST https://your-domain.vercel.app/api/youtube/kworb/cron \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

2. **Set up automatic crons** in Vercel dashboard or `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/youtube/kworb/cron",
         "schedule": "0 6 * * *"
       }
     ]
   }
   ```

---

## Expected Result

After the fix, you should see:

✅ **Spotify** (left): 6 songs with thumbnails  
✅ **YouTube** (right): 6 songs with thumbnails  
✅ #1 song in 2x2 featured box  
✅ OT7/Solo toggle works  
✅ Member selector shows all 7 members  
✅ Daily stream counts displayed  

---

## 🔄 Automatic Scraping (Production)

Once deployed to Vercel, scrapers run **automatically every 24 hours**:

- **Spotify:** Daily at 1:30 AM UTC
- **YouTube:** Daily at 1:35 AM UTC

**What happens automatically:**
1. ✅ Fresh data scraped from kworb.net
2. ✅ Spotify album art fetched (oEmbed API)
3. ✅ YouTube thumbnails generated
4. ✅ Everything cached in MongoDB
5. ✅ Site serves cached data all day (fast!)

**No manual work needed after initial setup!**

See `/CRON_SETUP.md` for full details on automatic scraping.

---

## 🎨 What's New

### Spotify Album Art
- ✅ Real album art from Spotify CDN
- ✅ 300x300px thumbnails
- ✅ Fetched via oEmbed API (no auth required)
- ✅ Cached in database

### YouTube Thumbnails  
- ✅ High-res thumbnails (1280x720px)
- ✅ Direct CDN links (no API calls)
- ✅ Cached in database

### Automatic Updates
- ✅ Runs daily at 1:30 AM UTC
- ✅ Configured in `vercel.json`
- ✅ Zero manual intervention
- ✅ Completely free

---

## Need More Help?

- 📄 Full documentation: `TRENDING_REVAMP.md`
- ⚙️ Cron setup guide: `CRON_SETUP.md`
- 📊 Update summary: `UPDATE_SUMMARY.md`
- 🐛 Detailed troubleshooting: `TROUBLESHOOTING_YOUTUBE.md`
- 🧪 Debug page: `http://localhost:3001/test-trending`
- 🔍 Debug API: `http://localhost:3001/api/debug/trending`
