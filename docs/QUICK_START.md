# Quest System - Quick Start Guide

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

### Step 2: Check BTS Tracks (1 minute)

**Verify you have BTS tracks:**
```javascript
// In MongoDB shell or Compass
db.tracks.countDocuments({ isBTSFamily: true })
// Should return > 0
```

**If 0, update existing tracks:**
```javascript
db.tracks.updateMany(
  { artist: "BTS" },
  { $set: { isBTSFamily: true } }
)
```

---

### Step 3: Set CRON_SECRET (2 minutes)

**Generate secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to Vercel:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `CRON_SECRET` = [your generated secret]
3. Save

---

### Step 4: Deploy (5 minutes)

```bash
git add .
git commit -m "Add quest & badge system"
git push
```

Vercel will auto-deploy. Check cron jobs in Vercel dashboard.

---

## ✅ Verification

### Check Quest Generation

**Manual trigger:**
```bash
curl https://your-domain.vercel.app/api/cron/daily-quests \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Check database:**
```javascript
db.questdefinitions.find({ active: true }).count()
// Should be > 0 after running
```

---

### Test User Flow

1. **Login** as a user
2. **GET** `/api/game/quests` → See active quests
3. **Stream** BTS songs on Spotify (tracked via Last.fm)
4. **POST** `/api/game/quests/verify-streaming` → Updates progress
5. **Complete** all quests (streaming + quiz)
6. **POST** `/api/game/quests/claim` → Get rewards & badges!

---

## 📊 What You Get

### Daily Quests
- Stream 5 songs (5x each) = 25 streams
- Stream 2 albums (1x each) = 2 full albums
- Complete 2 quizzes

### Weekly Quests
- Stream 40 songs (5x each) = 200 streams
- Stream 10 albums (1x each) = 10 full albums
- Complete 10 quizzes

### Badges
- **34 total badges** across 4 sets
- Cycling badges (1-10) for streaks
- Milestone badges at 10, 20, 30, 40, 50
- Photocards with milestone badges!

---

## 📚 Full Documentation

- **Complete Guide:** [`docs/QUEST_BADGE_SYSTEM.md`](./QUEST_BADGE_SYSTEM.md)
- **Setup Checklist:** [`docs/QUEST_SETUP_CHECKLIST.md`](./QUEST_SETUP_CHECKLIST.md)
- **Audit Report:** [`docs/QUEST_AUDIT_REPORT.md`](./QUEST_AUDIT_REPORT.md)

---

## 🆘 Need Help?

**Common Issues:**

1. **Quests not generating?**
   - Check Vercel cron logs
   - Verify CRON_SECRET is set
   - Manually trigger endpoint

2. **Badges not awarded?**
   - Did you complete ALL quests (both streaming + quiz)?
   - Check if badges exist in database
   - Check UserGameState tracking

3. **Streaming not verified?**
   - User must have Last.fm connected
   - Tracks must have `isBTSFamily: true`
   - Check Last.fm API response

---

**That's it! You're ready to launch! 🎉**
