# Quest & Badge System - Complete Guide

**Last Updated:** January 2, 2026
**Status:** ✅ PRODUCTION READY

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Quest Types](#quest-types)
4. [Badge System](#badge-system)
5. [Setup & Deployment](#setup--deployment)
6. [API Reference](#api-reference)
7. [Verification & Testing](#verification--testing)
8. [Maintenance](#maintenance)

---

## Overview

The Quest & Badge System is a gamification feature that rewards users for:
- **Streaming BTS music** (tracked via Last.fm)
- **Taking BTS trivia quizzes**
- **Maintaining daily/weekly streaks**

### Key Features

✅ **Daily & Weekly Quests**
- 5 songs/day (5 streams each) + 2 albums/day
- 40 songs/week (5 streams each) + 10 albums/week
- 2 quizzes/day + 10 quizzes/week

✅ **Smart Album Streaming**
- Requires streaming **complete albums** (all tracks)
- Fetched from Spotify API with full track lists
- 35 BTS family albums (group + all solo members)

✅ **Badge System**
- Cycling badges (1-10) for regular streaks
- Milestone badges at 10/20/30/40/50 streaks
- Completion badges for quest achievements
- 34 total badges

✅ **Rewards**
- Dust (in-game currency)
- XP (experience points)
- Photocards (rare items)
- Badges (achievements)

---

## System Architecture

### Database Collections

#### Core Models
- **QuestDefinition** - Quest templates (daily/weekly)
- **UserQuestProgress** - Individual user progress per quest
- **Badge** - Badge definitions (icons, names, rarities)
- **UserBadge** - Badges earned by users
- **UserGameState** - User stats (dust, XP, level, streaks)

#### Supporting Models
- **Album** - BTS albums with complete track lists
- **Track** - BTS tracks for song quests
- **StreamingCache** - Last.fm data cache (15min TTL)

### Quest Generation Flow

```
Cron Job (Midnight UTC)
    ↓
Daily Quest Generation
    ├─ Select 5 songs (deterministic random)
    ├─ Select 2 albums (with full track lists)
    └─ Select 2 quizzes
    ↓
Store in QuestDefinition
    ↓
Users fetch via /api/game/quests
    ↓
Progress tracked in UserQuestProgress
    ↓
Completion triggers rewards + badges
```

---

## Quest Types

### 1. Daily Song Streaming Quest

**Goal:** Stream 5 specific BTS songs, 5 times each (25 total streams)

**Selection:** Deterministic random based on date seed
- Same songs for all users on the same day
- Fetched from Track collection

**Reward:**
- 50 dust
- 20 XP

### 2. Daily Album Streaming Quest

**Goal:** Stream 2 complete albums (all tracks, 1 time each)

**Selection:** Deterministic random from Album collection
- Includes full track list for verification
- Typically 15-20 total tracks

**Verification:**
- User must stream ALL tracks from each album
- Partial credit given for incomplete albums

**Reward:**
- 75 dust
- 30 XP

**Example:**
```json
{
  "albumName": "Love Yourself 轉 'Tear'",
  "trackCount": 11,
  "tracks": [
    { "name": "Intro : Singularity", "artist": "BTS" },
    { "name": "FAKE LOVE", "artist": "BTS" },
    // ... 9 more tracks
  ]
}
```

### 3. Weekly Song Streaming Quest

**Goal:** Stream 40 specific BTS songs, 5 times each (200 total streams)

**Reward:**
- 300 dust
- 150 XP

### 4. Weekly Album Streaming Quest

**Goal:** Stream 10 complete albums (all tracks, 1 time each)

**Selection:** Typically 100-150 total tracks

**Reward:**
- 400 dust
- 200 XP
- Photocard ticket (random)

### 5. Daily Quiz Quest

**Goal:** Complete 2 BTS trivia quizzes

**Reward:**
- 30 dust
- 15 XP

### 6. Weekly Quiz Quest

**Goal:** Complete 10 BTS trivia quizzes

**Reward:**
- 200 dust
- 100 XP

---

## Badge System

### Badge Categories

#### 1. Cycling Streak Badges (1-10)

Earned every day/week of streak, cycling through 10 designs.

**Daily Badges:**
- 🔥 Spark (1) - Common
- 🔥🔥 Burning Bright (2) - Common
- 🔥🔥🔥 Blazing Streak (3) - Uncommon
- ... up to 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 Eternal Flame (10) - Legendary

**Weekly Badges:**
- 🏅 First Step (1) - Common
- 🏅🏅 Steady Pace (2) - Common
- ... up to 🏅🏅🏅🏅🏅🏅🏅🏅🏅🏅 Unstoppable Force (10) - Legendary

**Cycling:** At 11 days, earns badge #1 again. At 12 days, badge #2, etc. After a streak break, badges resume only after surpassing the previous high.

#### 2. Milestone Badges (10/20/30/40/50)

Earned once at specific streak milestones.

**Daily Milestones:**
- 🏆 Committed Starter (10) - Rare
- 🏆🏆 Persistent Pioneer (20) - Epic
- 🏆🏆🏆 Dedicated Champion (30) - Epic
- 🏆🏆🏆🏆 Unwavering Legend (40) - Legendary
- 🏆🏆🏆🏆🏆 Eternal Devotion (50) - Legendary

**Weekly Milestones:**
- 💎 Solid Foundation (10) - Epic
- 💎💎 Veteran Warrior (20) - Epic
- 💎💎💎 Elite Master (30) - Legendary
- 💎💎💎💎 Supreme Leader (40) - Legendary
- 💎💎💎💎💎 Transcendent Being (50) - Legendary

#### 3. Completion Badges (currently disabled)

- **daily_completion** - Complete all daily quests
- **weekly_completion** - Complete all weekly quests

Completion badges are defined but not awarded by default in the claim flow.

### Photocard Rewards

Completing all daily or weekly quests awards a **random photocard** every time (including milestone days). Milestone badges are badge-only.

---

## Setup & Deployment

### Prerequisites

- MongoDB database
- Spotify API credentials (client ID + secret)
- Last.fm API key (for streaming verification)
- Node.js 18+

### Step 1: Seed Badge Database

```bash
npx tsx scripts/seed-quest-badges.ts
```

**Verifies:** Creates all 34 badges in database

### Step 2: Populate Album Collection

```bash
npx tsx scripts/fetch-bts-albums.ts
```

**What it does:**
- Fetches all BTS family albums from Spotify API
- Includes BTS group + all 7 solo members + Agust D
- Filters out remixes, singles, collaborations
- Stores 35 albums with complete track lists

**Albums fetched:**
- BTS: 18 studio albums
- RM: 3 albums
- Jin: 2 albums
- SUGA/Agust D: 3 albums
- j-hope: 3 albums
- Jimin: 2 albums
- V: 2 albums
- Jung Kook: 2 albums

### Step 3: Verify Track Collection

Ensure Track collection has BTS songs with `isBTSFamily: true` flag.

```javascript
// Check in MongoDB
db.tracks.countDocuments({ isBTSFamily: true })
// Should return > 40 for variety
```

### Step 4: Set Environment Variables

Required in `.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# Spotify API (for album fetching)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Last.fm API (for streaming verification)
LASTFM_API_KEY=your_api_key
LASTFM_API_SECRET=your_api_secret

# Firebase (for authentication)
FIREBASE_ADMIN_PRIVATE_KEY="..."
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PROJECT_ID=...
```

### Step 5: Set Up Cron Jobs

Use [cron-job.org](https://cron-job.org) (Vercel free tier limit: 2 jobs).

**Daily Quests** (runs at midnight UTC):
- URL: `https://yourdomain.com/api/cron/daily-quests`
- Schedule: `0 0 * * *`

**Weekly Quests** (runs Monday midnight UTC):
- URL: `https://yourdomain.com/api/cron/weekly-quests`
- Schedule: `0 0 * * 1`

**Webscraping Jobs** (if applicable):
- Configure separately as needed

### Step 6: Deploy

```bash
npm run build
# Deploy to Vercel/your hosting
```

---

## API Reference

### GET /api/game/quests

Fetch all active quests for the authenticated user.

**Response:**
```json
{
  "quests": [
    {
      "code": "stream_daily_albums_2026-01-02",
      "title": "Daily Album Streaming Quest",
      "period": "daily",
      "goalType": "stream:albums",
      "goalValue": 20,
      "progress": 5,
      "completed": false,
      "streamingMeta": {
        "albumTargets": [
          {
            "albumName": "Agust D",
            "trackCount": 10,
            "tracks": [
              { "name": "Intro : DT sugA (Feat. DJ Friz)", "artist": "Agust D" },
              { "name": "Agust D", "artist": "Agust D" },
              // ... all 10 tracks
            ]
          }
        ]
      },
      "reward": {
        "dust": 75,
        "xp": 30
      }
    }
  ]
}
```

### POST /api/game/quests/[code]/claim

Claim rewards for a completed quest.

**Request:** None (authenticated)

**Response:**
```json
{
  "success": true,
  "rewards": {
    "dust": 75,
    "xp": 30
  },
  "newBadges": [
    {
      "code": "daily_streak_5",
      "name": "Blazing Trail",
      "icon": "🔥🔥🔥🔥🔥",
      "rarity": "rare"
    }
  ]
}
```

### GET /api/game/state

Get user's complete game state including streaks, balance, and potential rewards.

**Response:**
```json
{
  "dust": 2450,
  "totalXp": 12040,
  "level": 1,
  "streaks": {
    "daily": {
      "current": 12,
      "nextMilestone": 20,
      "daysRemaining": 8
    },
    "weekly": {
      "current": 3,
      "nextMilestone": 10,
      "weeksRemaining": 7
    }
  },
  "potentialRewards": {
    "dailyMilestoneBadge": {
      "code": "daily_milestone_2",
      "name": "Persistent Pioneer",
      "icon": "🏆🏆",
      "rarity": "epic",
      "atStreak": 20
    },
    "weeklyMilestoneBadge": {
      "code": "weekly_milestone_1",
      "name": "Solid Foundation",
      "icon": "💎",
      "rarity": "epic",
      "atStreak": 10
    },
    "dailyPhotocard": { "type": "random" },
    "weeklyPhotocard": { "type": "random" }
  },
  "latestBadges": [
    {
      "code": "daily_streak_2",
      "name": "Burning Bright",
      "icon": "🔥🔥",
      "rarity": "common",
      "earnedAt": "2026-01-02T12:00:00.000Z"
    }
  ]
}
```

### GET /api/game/badges

Get all badges earned by user.

**Response:**
```json
{
  "badges": [
    {
      "badgeId": "...",
      "code": "daily_streak_5",
      "name": "Blazing Trail",
      "icon": "🔥🔥🔥🔥🔥",
      "rarity": "rare",
      "earnedAt": "2026-01-02T12:00:00.000Z"
    }
  ]
}
```

---

## Verification & Testing

### Test Scripts

#### 1. Check Album Collection
```bash
npx tsx scripts/check-albums.ts
```
Shows all BTS family albums in database grouped by artist.

#### 2. Verify Quest System
```bash
npx tsx scripts/verify-quest-system.ts
```
Comprehensive check:
- Album collection populated
- Quest selection working
- Quest generation complete
- Metadata includes track lists
- Goal values correct

#### 3. Test API Response
```bash
npx tsx scripts/test-quest-api.ts
```
Simulates `/api/game/quests` endpoint to verify frontend receives complete data.

### Manual Testing

#### Test User Flow

1. **Seed badges:** `npx tsx scripts/seed-quest-badges.ts`
2. **Populate albums:** `npx tsx scripts/fetch-bts-albums.ts`
3. **Generate quests:** Hit cron endpoints or wait for scheduled run
4. **Verify quests:** `GET /api/game/quests` - should return quests with full metadata
5. **Check album tracks:** Verify `albumTargets[].tracks[]` is populated
6. **Test completion:** Complete a quest and claim rewards
7. **Verify badges:** Check `/api/game/badges` for earned badges
8. **Check state:** `GET /api/game/state` - verify streaks and rewards

---

## Maintenance

### Updating Albums

When new BTS releases come out:

```bash
npx tsx scripts/fetch-bts-albums.ts
```

The script automatically:
- Clears old albums
- Fetches fresh data from Spotify
- Applies filtering (no remixes/singles)
- Stores new albums with track lists

### Adjusting Filter Rules

Edit `scripts/fetch-bts-albums.ts`:

**Filter keywords** (line 94):
```typescript
const filterKeywords = [
  'remix', 'remixes', 'acoustic', 'instrumental',
  'sped up', 'slowed', 'karaoke', 'demo',
  '(+1db)', '(+2db)', '(+3db)',
  'feat.', 'ft.',
  'ost', 'original television soundtrack',
]
```

**Minimum tracks** (line 144):
```typescript
if (album.total_tracks < 4) return false  // Change 4 to your preference
```

### Adding New Artist IDs

Edit `scripts/fetch-bts-albums.ts` (line 45):

```typescript
const BTS_ARTIST_IDS = {
  'BTS': '3Nrfpe0tUJi4K4DXYWgMUX',
  'RM': '2auC28zjQyVTsiZKNgPRGs',
  // Add new artist here:
  'New Artist': 'spotify_artist_id'
}
```

### Monitoring

Check quest generation health:

```javascript
// MongoDB
db.questdefinitions.find({ active: true }).count()
// Should have 6 active quests (2 daily songs, 2 daily albums, 2 daily quiz + weekly equivalents)

db.albums.countDocuments({ isBTSFamily: true })
// Should have ~35 albums

db.badges.countDocuments()
// Should have 34 badges
```

---

## Troubleshooting

### Album quests showing "X songs from album"

**Issue:** Old quest data without track lists
**Fix:** Re-generate quests after running `fetch-bts-albums.ts`

### No albums in quests

**Issue:** Album collection empty
**Fix:** Run `npx tsx scripts/fetch-bts-albums.ts`

### Verification not working

**Issue:** Last.fm API not configured
**Fix:** Set `LASTFM_API_KEY` and `LASTFM_API_SECRET` in `.env.local`

### Quest not completing despite streaming

**Issue:** Streaming verification logic
**Fix:** Check [lib/game/streamingVerification.ts](../lib/game/streamingVerification.ts:163-192) for album verification

### No badges earned

**Issue:** Badge collection empty
**Fix:** Run `npx tsx scripts/seed-quest-badges.ts`

---

## Architecture Decisions

### Why deterministic random selection?

All users get the same quests on the same day/week for:
- Fair competition (leaderboards)
- Community engagement (everyone discussing same songs)
- Consistent experience

### Why complete album streaming?

- Encourages full album listening (not just singles)
- Better for music discovery
- More challenging/rewarding quest

### Why separate Album collection?

- Track collection doesn't have complete album metadata
- Spotify API provides authoritative album data
- Enables proper verification of full album streaming

---

## File Reference

### Models
- [lib/models/Album.ts](../lib/models/Album.ts)
- [lib/models/QuestDefinition.ts](../lib/models/QuestDefinition.ts)
- [lib/models/UserQuestProgress.ts](../lib/models/UserQuestProgress.ts)
- [lib/models/Badge.ts](../lib/models/Badge.ts)
- [lib/models/UserBadge.ts](../lib/models/UserBadge.ts)
- [lib/models/UserGameState.ts](../lib/models/UserGameState.ts)

### Game Logic
- [lib/game/quests.ts](../lib/game/quests.ts) - Core quest utilities
- [lib/game/streamingQuestSelection.ts](../lib/game/streamingQuestSelection.ts) - Album/song selection
- [lib/game/streamingVerification.ts](../lib/game/streamingVerification.ts) - Last.fm verification
- [lib/game/streakTracking.ts](../lib/game/streakTracking.ts) - Streak calculation
- [lib/game/completionBadges.ts](../lib/game/completionBadges.ts) - Badge awarding

### Scripts
- [scripts/fetch-bts-albums.ts](../scripts/fetch-bts-albums.ts) - Fetch albums from Spotify
- [scripts/seed-quest-badges.ts](../scripts/seed-quest-badges.ts) - Populate badge DB
- [scripts/check-albums.ts](../scripts/check-albums.ts) - View albums
- [scripts/verify-quest-system.ts](../scripts/verify-quest-system.ts) - System verification

### API Routes
- [app/api/game/quests/route.ts](../app/api/game/quests/route.ts) - Quest list
- [app/api/game/state/route.ts](../app/api/game/state/route.ts) - User state
- [app/api/cron/daily-quests/route.ts](../app/api/cron/daily-quests/route.ts) - Daily generation
- [app/api/cron/weekly-quests/route.ts](../app/api/cron/weekly-quests/route.ts) - Weekly generation

---

**Last Updated:** January 2, 2026
**Version:** 2.0.0
**Status:** ✅ Production Ready
