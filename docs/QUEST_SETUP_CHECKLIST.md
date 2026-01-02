# Quest & Badge System - Setup Checklist

## 🔴 CRITICAL: Must Do Before Launch

### 1. Seed Badge Database ⚠️

**Command:**
```bash
npx tsx scripts/seed-quest-badges.ts
```

**What it does:**
- Creates all 34 badges in your database
- Sets up completion badges
- Sets up daily streak badges (1-10)
- Sets up weekly streak badges (1-10)
- Sets up daily milestone badges (1-5)
- Sets up weekly milestone badges (1-5)

**Verify:**
```javascript
// Check in MongoDB
db.badges.countDocuments() // Should return 34
```

---

### 2. Populate BTS Tracks Database ⚠️

**Required:** Your Track collection must have BTS songs with `isBTSFamily: true`

**Check:**
```javascript
// In MongoDB
db.tracks.countDocuments({ isBTSFamily: true })
// Should return > 0 (ideally 40+ tracks for variety)
```

**If empty:**
- Import BTS discography from Spotify/database
- Ensure each track has:
  - `name` (track name)
  - `artist` (artist name)
  - `album` (album name)
  - `isBTSFamily: true` (CRITICAL flag)

---

### 3. Set Environment Variables ⚠️

**Required in `.env` or Vercel:**

```env
# For cron job authentication
CRON_SECRET=your-random-secure-secret-here

# MongoDB connection (should already exist)
MONGODB_URI=mongodb+srv://...

# Firebase (should already exist)
FIREBASE_PROJECT_ID=...
```

**Generate CRON_SECRET:**
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 4. Deploy to Vercel ⚠️

**Why:** Cron jobs only work on deployed environment

**Steps:**
1. Push code to GitHub
2. Deploy via Vercel dashboard
3. Verify deployment succeeds
4. Check Vercel Cron logs

**Verify Crons:**
- Go to Vercel Dashboard → Your Project → Cron Jobs
- You should see:
  - `/api/cron/daily-quests` - Daily at 00:00 UTC
  - `/api/cron/weekly-quests` - Monday at 00:00 UTC

---

## ✅ Optional: Future Enhancements

### 5. Upload Badge Images (Later)

**Current:** Using emoji placeholders (🔥, 💎, 🏆, 💫, 👑)

**When ready:**
1. Create 34 unique badge images
2. Upload to Cloudinary or CDN
3. Update badge `icon` field in database:

```javascript
// Example update
db.badges.updateOne(
  { code: 'daily_milestone_1' },
  { $set: { icon: 'https://your-cdn.com/badges/daily_milestone_1.png' } }
)
```

**Badge codes to update:**
- `daily_completion`, `weekly_completion`
- `daily_streak_1` through `daily_streak_10`
- `weekly_streak_1` through `weekly_streak_10`
- `daily_milestone_1` through `daily_milestone_5`
- `weekly_milestone_1` through `weekly_milestone_5`

---

## 🧪 Testing Checklist

### Test Quest Generation

**Daily Quests:**
```bash
# Trigger manually
curl -X GET https://your-domain.vercel.app/api/cron/daily-quests \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Weekly Quests:**
```bash
curl -X GET https://your-domain.vercel.app/api/cron/weekly-quests \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Verify in database:**
```javascript
// Should see quests with today's date
db.questdefinitions.find({ active: true }).sort({ _id: -1 }).limit(5)
```

---

### Test Quest Claiming

1. Login as a user
2. GET `/api/game/quests` - should return active quests
3. Complete quests (stream songs, do quizzes)
4. POST `/api/game/quests/verify-streaming` - updates progress
5. POST `/api/game/quests/claim` with quest code
6. Check response for badges awarded

---

### Test Streak System

**Scenario: First day completion**
1. Complete all daily quests (streaming + quiz)
2. Claim all quests
3. Should receive:
   - `daily_completion` badge
   - `daily_streak_1` badge
   - No milestone badge yet

**Scenario: 10th day completion**
1. Complete all daily quests for 10 consecutive days
2. On day 10, should receive:
   - `daily_completion` badge
   - `daily_streak_10` badge
   - `daily_milestone_1` badge
   - Epic photocard

---

## 📊 Monitoring

### Things to Monitor

**Daily:**
- Quest generation logs (Vercel cron logs)
- User quest completion rate
- Streak continuity

**Weekly:**
- Weekly quest generation
- Badge distribution
- Photocard rewards

**Database Health:**
```javascript
// Check active quests
db.questdefinitions.find({ active: true }).count()

// Check user progress
db.userquestprogresses.aggregate([
  { $group: { _id: "$userId", totalQuests: { $sum: 1 } } }
])

// Check badge awards
db.userbadges.aggregate([
  { $group: { _id: "$badgeId", count: { $sum: 1 } } }
])
```

---

## 🚨 Common Issues & Fixes

### Issue: Quests not generating

**Check:**
1. Cron job runs (Vercel logs)
2. `CRON_SECRET` matches
3. Database connection works

**Fix:**
- Manually trigger cron endpoint
- Check Vercel logs for errors

---

### Issue: Streaming verification fails

**Check:**
1. User has Last.fm connected
2. Last.fm API responds
3. Tracks have `isBTSFamily: true`

**Fix:**
```javascript
// Update existing tracks
db.tracks.updateMany(
  { artist: { $regex: /BTS/i } },
  { $set: { isBTSFamily: true } }
)
```

---

### Issue: Badges not awarded

**Check:**
1. All quests completed (not just one)
2. Badges exist in database
3. Check `UserGameState.badges` tracking fields

**Fix:**
- Re-run badge seed script
- Check completion badge logic

---

## 📝 Summary

### Must Complete Before Launch:
- [x] Code is complete ✅
- [ ] Run `npx tsx scripts/seed-quest-badges.ts`
- [ ] Populate Track database with BTS songs
- [ ] Set `CRON_SECRET` environment variable
- [ ] Deploy to Vercel
- [ ] Verify cron jobs are scheduled

### Optional (Can Do Later):
- [ ] Upload custom badge images
- [ ] Set up monitoring dashboard
- [ ] Create admin panel for quest management

---

**Total Implementation Status: 95% Complete**

**Remaining:** Just manual setup steps above!
