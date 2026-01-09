# Quest System - Quick Start Guide

**Last Updated:** January 2, 2026

## 🚀 Get Started in 4 Steps

### Step 1: Seed Badges (2 minutes)

```bash
npx tsx scripts/seed-quest-badges.ts
```

**Expected output:**
```
✓ Seeded badge: daily_completion
✓ Seeded badge: weekly_completion
...
✅ Successfully seeded 34 quest badges
```

---

### Step 2: Fetch BTS Albums (2 minutes)

```bash
npx tsx scripts/fetch-bts-albums.ts
```

**Expected output:**
```
🎵 Fetching BTS & Solo Member albums from Spotify...
✅ Connected to MongoDB
🗑️  Cleared X existing BTS albums
✅ Got Spotify access token

  Fetching albums for BTS...
  ✅ Found 18 albums for BTS
  ... (all solo members)

✅ 35 unique albums after deduplication
📊 Summary:
   Processed: 35
   Total in DB: 35

✅ Done!
```

---

### Step 3: Verify BTS Tracks (1 minute)

**Check you have BTS tracks:**
```javascript
// In MongoDB shell or Compass
db.tracks.countDocuments({ isBTSFamily: true })
// Should return > 40
```

**If 0, update existing tracks:**
```javascript
db.tracks.updateMany(
  { artist: "BTS" },
  { $set: { isBTSFamily: true } }
)
```

---

### Step 4: Set Up Cron Jobs (5 minutes)

Use [cron-job.org](https://cron-job.org) (free) since Vercel free tier only allows 2 cron jobs.

**Daily Quests:**
- URL: `https://yourdomain.com/api/cron/daily-quests`
- Schedule: `0 0 * * *` (midnight UTC)
- Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Weekly Quests:**
- URL: `https://yourdomain.com/api/cron/weekly-quests`
- Schedule: `0 0 * * 1` (Monday midnight UTC)
- Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Generate CRON_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local`:
```
CRON_SECRET=your_generated_secret
```

---

## ✅ Verification

### Verify System Setup

```bash
npx tsx scripts/verify-quest-system.ts
```

**Expected output:**
```
✅ Album collection: Ready
✅ Quest selection: Working
✅ Quest generation: Complete
✅ Metadata: Complete with track lists
✅ Verification logic: Updated to check full albums
✅ Quest System Verification Complete!
```

### Manual Quest Generation

```bash
curl https://your-domain.vercel.app/api/cron/daily-quests \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Check Database

```javascript
// Should have active quests
db.questdefinitions.find({ active: true }).count()
// Should return 6 (3 daily + 3 weekly)

// Should have albums
db.albums.countDocuments({ isBTSFamily: true })
// Should return 35

// Should have badges
db.badges.countDocuments()
// Should return 34
```

---

## 🧪 Test User Flow

1. **Login** as a user with Last.fm connected
2. **GET** `/api/game/state` → See streaks, balances, potential rewards
3. **GET** `/api/game/quests` → See active quests with album track lists
4. **Stream** BTS songs on Spotify (tracked via Last.fm)
5. **POST** `/api/game/quests/verify-streaming` → Updates progress
6. **Complete** all quests (stream full albums + quizzes)
7. **POST** `/api/game/quests/[code]/claim` → Get rewards & badges!
8. **GET** `/api/game/state` → See updated streak & new badges

---

## 📊 What You Get

### Daily Quests (Resets every midnight UTC)
- **Stream 5 songs** (5x each) = 25 total streams → 50 dust + 20 XP
- **Stream 2 albums** (all tracks) = ~20 tracks → 75 dust + 30 XP
- **Complete 2 quizzes** → 30 dust + 15 XP

### Weekly Quests (Resets every Monday)
- **Stream 40 songs** (5x each) = 200 total streams → 300 dust + 150 XP
- **Stream 10 albums** (all tracks) = ~150 tracks → 400 dust + 200 XP + photocard ticket (random)
- **Complete 10 quizzes** → 200 dust + 100 XP

### Badges & Rewards
- **34 total badges** across 4 sets
- **Cycling badges** (1-10) for regular streaks
- **Milestone badges** at 10, 20, 30, 40, 50 streaks
- **Photocards** awarded with milestone badges (random drop)

---

## 📚 Full Documentation

- **Complete Guide:** [docs/QUEST_SYSTEM.md](./QUEST_SYSTEM.md)
- **Badge Details:** [docs/QUEST_BADGE_SYSTEM.md](./QUEST_BADGE_SYSTEM.md)

---

## 🆘 Troubleshooting

### Album quests not showing tracks?

**Issue:** Old quest data without track lists
**Fix:** Re-run album fetch and regenerate quests
```bash
npx tsx scripts/fetch-bts-albums.ts
curl https://your-domain.com/api/cron/daily-quests -H "Authorization: Bearer $CRON_SECRET"
```

### Quest not completing despite streaming full album?

**Issue:** Verification logic checking track matches
**Fix:** Ensure all tracks from album were streamed (check Last.fm scrobbles)

### No albums in database?

**Issue:** Album collection empty
**Fix:** Run fetch script
```bash
npx tsx scripts/fetch-bts-albums.ts
```

### Quests not generating?

**Issue:** Cron jobs not configured
**Fix:**
1. Check cron-job.org dashboard
2. Verify CRON_SECRET in environment
3. Check API route logs

### Badges not awarded?

**Issue:** Badge seed script not run
**Fix:**
```bash
npx tsx scripts/seed-quest-badges.ts
```

### Streaming not verified?

**Issue:** Last.fm not configured
**Fix:**
1. User must connect Last.fm account
2. Set `LASTFM_API_KEY` and `LASTFM_API_SECRET` in `.env.local`
3. Tracks must have `isBTSFamily: true` flag

---

## 🔧 Utility Scripts

### Check Albums
```bash
npx tsx scripts/check-albums.ts
```
Shows all albums in database grouped by artist.

### Verify System
```bash
npx tsx scripts/verify-quest-system.ts
```
Comprehensive system check (albums, quests, metadata).

### Test API
```bash
npx tsx scripts/test-quest-api.ts
```
Simulates API responses to verify frontend data.

---

**That's it! You're ready to launch! 🎉**

**Next Steps:**
1. Build quest UI using data from `/api/game/quests` and `/api/game/state`
2. Show album track lists to users
3. Display streak progress and next milestones
4. Create badge gallery
