# Cron APIs

Automated task endpoints for scheduled jobs.

---

## Authentication

All cron endpoints require authentication via `CRON_SECRET`:

```
Authorization: Bearer <CRON_SECRET>
```

Set `CRON_SECRET` in environment variables.

---

## Quest Generation

### POST /api/cron/daily-quests

Generate daily quests for all users.

**Authentication**: CRON_SECRET required

**Schedule**: Daily at 00:00 UTC

**Success Response (200):**
```json
{
  "ok": true,
  "questsGenerated": 3,
  "timestamp": "2026-01-06T00:00:00.000Z",
  "quests": [
    {
      "code": "daily_stream_songs_20260106",
      "title": "Stream 5 Songs",
      "category": "streaming",
      "expiresAt": "2026-01-07T00:00:00.000Z"
    }
  ]
}
```

**What it does:**
- Expires previous day's daily quests
- Generates new set of 3 daily quests
- Randomly selects songs/albums for streaming quests
- Creates quest definitions in database

---

### POST /api/cron/weekly-quests

Generate weekly quests for all users.

**Authentication**: CRON_SECRET required

**Schedule**: Weekly on Monday at 00:00 UTC

**Success Response (200):**
```json
{
  "ok": true,
  "questsGenerated": 3,
  "timestamp": "2026-01-06T00:00:00.000Z",
  "weekStartDate": "2026-01-06",
  "weekEndDate": "2026-01-13"
}
```

**What it does:**
- Expires previous week's quests
- Distributes weekly leaderboard rewards
- Generates new set of 3 weekly quests
- Resets weekly leaderboard

---

## Analytics Updates

### POST /api/spotify/kworb/cron

Update Spotify analytics snapshot.

**Authentication**: CRON_SECRET required

**Schedule**: Daily at 01:00 UTC

**Success Response (200):**
```json
{
  "ok": true,
  "snapshot": {
    "date": "2026-01-06",
    "songsUpdated": 150,
    "albumsUpdated": 35,
    "artistsUpdated": 15
  }
}
```

**What it does:**
- Scrapes latest Spotify streaming data
- Updates song/album/artist stats
- Stores snapshot in database
- Caches for frontend display

---

### POST /api/youtube/kworb/cron

Update YouTube analytics snapshot.

**Authentication**: CRON_SECRET required

**Schedule**: Daily at 02:00 UTC

**Success Response (200):**
```json
{
  "ok": true,
  "snapshot": {
    "date": "2026-01-06",
    "videosUpdated": 200
  }
}
```

**What it does:**
- Scrapes latest YouTube view data
- Updates video statistics
- Stores snapshot in database

---

## Setup

### Using cron-job.org (Recommended)

Vercel free tier only allows 2 cron jobs. Use external service:

1. Go to [cron-job.org](https://cron-job.org)
2. Create free account
3. Add cron jobs with schedules:

**Daily Quests:**
```
URL: https://your-domain.com/api/cron/daily-quests
Schedule: 0 0 * * * (daily at midnight UTC)
Header: Authorization: Bearer YOUR_CRON_SECRET
```

**Weekly Quests:**
```
URL: https://your-domain.com/api/cron/weekly-quests
Schedule: 0 0 * * 1 (Monday at midnight UTC)
Header: Authorization: Bearer YOUR_CRON_SECRET
```

**Spotify Analytics:**
```
URL: https://your-domain.com/api/spotify/kworb/cron
Schedule: 0 1 * * * (daily at 1 AM UTC)
Header: Authorization: Bearer YOUR_CRON_SECRET
```

**YouTube Analytics:**
```
URL: https://your-domain.com/api/youtube/kworb/cron
Schedule: 0 2 * * * (daily at 2 AM UTC)
Header: Authorization: Bearer YOUR_CRON_SECRET
```

---

## Manual Triggering

For testing or manual execution:

```bash
# Daily quests
curl -X POST https://your-domain.com/api/cron/daily-quests \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Weekly quests
curl -X POST https://your-domain.com/api/cron/weekly-quests \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Monitoring

Check cron job execution:

1. View cron-job.org dashboard for execution history
2. Check application logs in Vercel
3. Monitor database for new quest definitions
4. Verify snapshots are updating daily

---

## Related Documentation

- [Cron Jobs Setup](../setup/cron-jobs.md)
- [Quest System](../QUEST_SYSTEM.md)
- [Spotify Analytics](../features/spotify-analytics.md)

---

**Last Updated**: January 2026
