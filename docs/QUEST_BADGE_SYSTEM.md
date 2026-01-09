# Quest & Badge System Documentation

**Last Updated:** January 2, 2026
**Version:** 1.1.0

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Quest Types](#quest-types)
3. [Badge System](#badge-system)
4. [UI Integration Guide](#ui-integration-guide)
5. [Implementation Details](#implementation-details)
6. [Manual Setup Required](#manual-setup-required)
7. [API Endpoints](#api-endpoints)
8. [Database Models](#database-models)
9. [Cron Jobs](#cron-jobs)
10. [Future Enhancements](#future-enhancements)

---

## System Overview

The Quest & Badge System is a gamification feature that rewards users for:
- **Streaming BTS music** (tracked via Last.fm integration)
- **Completing quizzes** about BTS
- **Maintaining daily and weekly streaks**

### Core Mechanics

1. Users complete **daily quests** (streaming + quiz)
2. Users complete **weekly quests** (streaming + quiz)
3. Completing ALL quests in a period awards **completion badges**
4. Consecutive completions build **streaks** (1-50 days/weeks)
5. Streak milestones (10, 20, 30, 40, 50) award **milestone badges + photocards**

---

## Quest Types

### Daily Quests

#### 1. Daily Song Streaming Quest
- **Requirement:** Stream 5 random BTS songs, 5 times each
- **Total Streams:** 25 streams
- **Rewards:** 50 dust, 20 XP
- **Songs:** Randomly selected from database (BTS tracks with `isBTSFamily: true`)
- **Selection:** Deterministic based on date (same songs for all users on same day)

#### 2. Daily Album Streaming Quest
- **Requirement:** Stream 2 random albums fully (all tracks), 1 time each
- **Rewards:** 75 dust, 30 XP
- **Albums:** Randomly selected from database
- **Selection:** Deterministic based on date

#### 3. Daily Quiz Quest
- **Requirement:** Complete 2 quizzes
- **Rewards:** 40 dust, 15 XP

### Weekly Quests

#### 1. Weekly Song Streaming Quest
- **Requirement:** Stream 40 random BTS songs, 5 times each
- **Total Streams:** 200 streams
- **Rewards:** 300 dust, 150 XP
- **Songs:** Randomly selected from database
- **Selection:** Deterministic based on week

#### 2. Weekly Album Streaming Quest
- **Requirement:** Stream 10 random albums fully, 1 time each
- **Rewards:** 400 dust, 200 XP, 1 photocard (random)
- **Albums:** Randomly selected from database
- **Selection:** Deterministic based on week

#### 3. Weekly Quiz Quest
- **Requirement:** Complete 10 quizzes
- **Rewards:** 250 dust, 100 XP

---

## Badge System

The badge system consists of **4 sets** of badges, totaling **34 badges**.

### Set 1: Daily Streak Badges (10 badges)

**Badges:** `daily_streak_1` through `daily_streak_10`

These badges cycle repeatedly as users progress through streaks:

| Streak Count | Badge Awarded | Rarity |
|--------------|---------------|---------|
| 1, 11, 21, 31, 41 | daily_streak_1 | Common |
| 2, 12, 22, 32, 42 | daily_streak_2 | Common |
| 3, 13, 23, 33, 43 | daily_streak_3 | Common |
| 4, 14, 24, 34, 44 | daily_streak_4 | Common |
| 5, 15, 25, 35, 45 | daily_streak_5 | Rare |
| 6, 16, 26, 36, 46 | daily_streak_6 | Rare |
| 7, 17, 27, 37, 47 | daily_streak_7 | Rare |
| 8, 18, 28, 38, 48 | daily_streak_8 | Epic |
| 9, 19, 29, 39, 49 | daily_streak_9 | Epic |
| 10, 20, 30, 40, 50 | daily_streak_10 | Legendary |

**Icon:** 🔥

### Set 2: Daily Milestone Badges (5 badges)

**Badges:** `daily_milestone_1` through `daily_milestone_5`

These are **separate, unique badges** awarded at specific milestones:

| Streak Count | Badge | Name | Rarity | Photocard |
|--------------|-------|------|---------|-----------|
| 10 | daily_milestone_1 | Dedicated Devotee | Epic | Random |
| 20 | daily_milestone_2 | Persistent Pioneer | Epic | Random |
| 30 | daily_milestone_3 | Consistent Champion | Legendary | Random |
| 40 | daily_milestone_4 | Legendary Loyalist | Legendary | Random |
| 50 | daily_milestone_5 | Ultimate ARMY | Legendary | Random |

**Icons:** 🏆 (1-4), 👑 (5)

### Set 3: Weekly Streak Badges (10 badges)

**Badges:** `weekly_streak_1` through `weekly_streak_10`

Same cycling logic as daily streaks, but for weekly quest completions.

**Icon:** 💎

### Set 4: Weekly Milestone Badges (5 badges)

**Badges:** `weekly_milestone_1` through `weekly_milestone_5`

| Streak Count | Badge | Name | Rarity | Photocard |
|--------------|-------|------|---------|-----------|
| 10 | weekly_milestone_1 | Weekly Warrior | Epic | Random |
| 20 | weekly_milestone_2 | Marathon Master | Epic | Random |
| 30 | weekly_milestone_3 | Endurance Elite | Legendary | Random |
| 40 | weekly_milestone_4 | Unstoppable Force | Legendary | Random |
| 50 | weekly_milestone_5 | Eternal Devotion | Legendary | Random |

**Icons:** 💫 (1-4), 👑 (5)

### Completion Badges (2 badges)

- **daily_completion:** Awarded when user completes all daily quests (streaming + quiz)
- **weekly_completion:** Awarded when user completes all weekly quests (streaming + quiz)

---

## Implementation Details

### How Streaks Work

1. **Streak Counter:** Tracks total consecutive completions (1-50 max)
2. **Cycle Position:** Determines which Set 1/3 badge to award (1-10)
3. **Milestone Detection:** Checks if streak count is divisible by 10

**Example Flow:**

```
Day 1:  Streak = 1  → Award daily_streak_1
Day 2:  Streak = 2  → Award daily_streak_2
...
Day 10: Streak = 10 → Award daily_streak_10 + daily_milestone_1 + Random Photocard
Day 11: Streak = 11 → Award daily_streak_1 (cycle restarts)
...
Day 20: Streak = 20 → Award daily_streak_10 + daily_milestone_2 + Random Photocard
...
Day 50: Streak = 50 → Award daily_streak_10 + daily_milestone_5 + Random Photocard
Day 51: Streak = 50 (max reached, stays at 50)
```

### Streak Breaking

- If user misses a day/week, streak resets to 1
- All milestone tracking resets
- User can start building streaks again from day/week 1

### Badge Awarding Logic

Badges are awarded in this order:

1. **Completion Badge** (if all quests completed)
2. **Set 1/3 Badge** (based on cycle position)
3. **Set 2/4 Badge** (if at milestone: 10, 20, 30, 40, or 50)
4. **Photocard** (with milestone badge)

---

## Manual Setup Required

### ✅ COMPLETED AUTOMATICALLY
- [x] Models created
- [x] API endpoints created
- [x] Cron jobs configured
- [x] Type checking passing

---

## UI Integration Guide

This section provides a comprehensive guide for building quest UI components.

### Essential API Calls

For a complete quest page, you need these API calls:

1. **`GET /api/game/state`** - User stats, streaks, next milestones, potential rewards, latest badges
2. **`GET /api/game/quests`** - All active quests with progress
3. **`POST /api/game/quests/verify-streaming`** - Update streaming progress from Last.fm
4. **`POST /api/game/quests/claim`** - Claim completed quest rewards

### Key Data Mappings

| UI Element | API Endpoint | Field Path | Example |
|------------|--------------|------------|---------|
| Current Daily Streak | `/api/game/state` | `streaks.daily.current` | `12` |
| Days to Next Milestone | `/api/game/state` | `streaks.daily.daysRemaining` | `8` |
| Next Milestone Badge | `/api/game/state` | `potentialRewards.dailyMilestoneBadge` | Badge object |
| Dust Balance | `/api/game/state` | `dust` | `2450` |
| Total XP | `/api/game/state` | `totalXp` | `12040` |
| Latest Badges | `/api/game/state` | `latestBadges[]` | Array of 4 badges |
| Quest Progress | `/api/game/quests` | `quests[].progress` | `15` |
| Quest Goal | `/api/game/quests` | `quests[].goalValue` | `25` |
| Quest Rewards | `/api/game/quests` | `quests[].reward` | `{dust: 50, xp: 20}` |

### Example: Streak Display Component

```typescript
// Fetch data
const { streaks, potentialRewards } = await fetch('/api/game/state').then(r => r.json())

// Render
<StreakCard>
  <Icon>🔥</Icon>
  <Current>{streaks.daily.current}</Current>
  <NextBonus>Next bonus: {streaks.daily.daysRemaining} Days</NextBonus>

  {/* Preview next reward */}
  {potentialRewards.dailyMilestoneBadge && (
    <Preview>
      <BadgeIcon>{potentialRewards.dailyMilestoneBadge.icon}</BadgeIcon>
      <span>At {potentialRewards.dailyMilestoneBadge.atStreak} days</span>
    </Preview>
  )}
</StreakCard>
```

### Example: Quest Card Component

```typescript
const { quests } = await fetch('/api/game/quests').then(r => r.json())

quests.map(quest => (
  <QuestCard key={quest.code}>
    <Title>{quest.title}</Title>

    {/* Progress bar */}
    <ProgressBar value={quest.progress} max={quest.goalValue} />
    <ProgressText>{quest.progress} / {quest.goalValue}</ProgressText>

    {/* Streaming targets (if streaming quest) */}
    {quest.streamingMeta?.trackTargets?.map(track => (
      <Target key={track.trackName}>
        {track.trackName} - {track.artistName} ({track.count}x)
      </Target>
    ))}

    {/* Rewards */}
    <Rewards>
      <span>+{quest.reward.dust} Dust</span>
      <span>+{quest.reward.xp} XP</span>
    </Rewards>

    {/* Claim button */}
    <ClaimButton
      disabled={!quest.completed || quest.claimed}
      onClick={() => claimQuest(quest.code)}
    >
      {quest.claimed ? 'Claimed ✓' : quest.completed ? 'Claim Reward' : 'Incomplete'}
    </ClaimButton>
  </QuestCard>
))
```

### Example: Claim Quest Function

```typescript
async function claimQuest(code: string) {
  const res = await fetch('/api/game/quests/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${firebaseToken}`
    },
    body: JSON.stringify({ code })
  })

  const data = await res.json()

  // Show notifications
  if (data.allQuestsCompleted) {
    toast.success('🎉 All quests completed! Streak updated!')
  }

  if (data.badgesAwarded?.length > 0) {
    data.badgesAwarded.forEach(badge => {
      toast.success(`🏆 Badge Earned: ${badge}`)
    })
  }

  if (data.photocardAwarded) {
    showPhotocardModal(data.photocardAwarded)
  }

  // Refresh data
  await Promise.all([
    refetchGameState(),
    refetchQuests()
  ])
}
```

### Recommended Refresh Strategy

- **On mount:** Fetch both `/api/game/state` and `/api/game/quests`
- **After claim:** Refresh both endpoints (streak and quests may have updated)
- **After verify streaming:** Refresh `/api/game/quests` only
- **Periodic:** Poll `/api/game/quests/verify-streaming` every 3-5 minutes while user is active

---

### 🔴 REQUIRED: Manual Actions

#### 1. Seed the Badge Database

Run this command **once** to create all 34 badges:

```bash
npx tsx scripts/seed-quest-badges.ts
```

**Expected Output:**
```
✓ Seeded badge: daily_completion
✓ Seeded badge: weekly_completion
✓ Seeded badge: daily_streak_1
...
✓ Seeded badge: weekly_milestone_5

✅ Successfully seeded 34 quest badges
```

#### 2. Populate Track Database

Your database must have BTS tracks with `isBTSFamily: true` flag set.

**Check if you have tracks:**
```javascript
// In MongoDB or your database client
db.tracks.countDocuments({ isBTSFamily: true })
```

**If count is 0, you need to:**
- Import BTS discography
- Set `isBTSFamily: true` for all BTS tracks
- Ensure tracks have proper `name`, `artist`, and `album` fields

#### 3. Set Environment Variable

Ensure your `.env` or Vercel environment has:

```env
CRON_SECRET=your-secret-key-here
```

This is used to authenticate cron job requests.

#### 4. Deploy to Vercel

The cron jobs are already configured in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/daily-quests", "schedule": "0 0 * * *" },
    { "path": "/api/cron/weekly-quests", "schedule": "0 0 * * 1" }
  ]
}
```

Deploy to Vercel to activate automatic quest generation.

#### 5. Upload Badge Images (Optional - Later)

When ready, replace placeholder icons with actual images:

1. Upload images to Cloudinary or your CDN
2. Update badge `icon` field in database with image URLs
3. Badge codes to update:
   - Set 1: `daily_streak_1` through `daily_streak_10`
   - Set 2: `daily_milestone_1` through `daily_milestone_5`
   - Set 3: `weekly_streak_1` through `weekly_streak_10`
   - Set 4: `weekly_milestone_1` through `weekly_milestone_5`

---

## API Endpoints

### GET `/api/game/quests`

Fetch all active quests for the current user.

**Authentication:** Required (Firebase token)

**Response:**
```json
{
  "quests": [
    {
      "code": "stream_daily_songs_2026-01-02",
      "title": "Daily Song Streaming Quest",
      "period": "daily",
      "goalType": "stream:songs",
      "goalValue": 25,
      "progress": 10,
      "completed": false,
      "claimed": false,
      "reward": {
        "dust": 50,
        "xp": 20
      },
      "streamingMeta": {
        "trackTargets": [
          { "trackName": "Dynamite", "artistName": "BTS", "count": 5 }
        ]
      }
    }
  ]
}
```

### POST `/api/game/quests/claim`

Claim rewards for a completed quest.

**Authentication:** Required

**Body:**
```json
{
  "code": "stream_daily_songs_2026-01-02"
}
```

**Response:**
```json
{
  "reward": {
    "cardId": "...",
    "rarity": "random",
    "member": "Jungkook",
    "imageUrl": "..."
  },
  "balances": {
    "dust": 150,
    "xp": 500
  },
  "streaks": {
    "daily": 10,
    "weekly": 3
  },
  "badgesAwarded": [
    "daily_streak_10",
    "daily_milestone_1"
  ],
  "photocardAwarded": {
    "cardId": "...",
    "rarity": "random",
    "member": "V"
  },
  "allQuestsCompleted": true
}
```

### POST `/api/game/quests/verify-streaming`

Verify streaming progress from Last.fm.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "quests": [...]
}
```

### GET `/api/game/state`

**✨ Enhanced endpoint** - Get comprehensive user game state including streaks, next milestones, potential rewards, and latest badges.

**Authentication:** Required (Firebase token)

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
      "name": "Weekly Warrior",
      "icon": "💫",
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

**Use Cases:**
- Display current streak counts
- Show "Next bonus in X days/weeks"
- Preview upcoming milestone badge
- Preview upcoming photocard reward
- Show recently earned badges
- Display user's dust, XP, and level

### GET `/api/game/badges`

Get all user's earned badges.

**Authentication:** Required

**Note:** The `/api/game/state` endpoint already includes the latest 4 badges. Use this endpoint if you need the full badge history.

---

## Database Models

### QuestDefinition

```typescript
{
  code: string                    // Unique identifier (e.g., "stream_daily_songs_2026-01-02")
  title: string                   // Display name
  period: 'daily' | 'weekly'      // Quest period
  goalType: string                // Type of goal (e.g., "stream:songs", "quiz:complete")
  goalValue: number               // Target value to complete
  streamingMeta?: {
    trackTargets?: Array<{
      trackName: string
      artistName: string
      count: number
    }>
    albumTargets?: Array<{
      albumName: string
      trackCount: number
    }>
  }
  reward: {
    dust: number
    xp?: number
    ticket?: {
      enabled?: boolean
    }
    badgeId?: ObjectId
  }
  active: boolean
}
```

### UserQuestProgress

```typescript
{
  userId: string
  code: string                    // References QuestDefinition.code
  periodKey: string               // Date key (e.g., "2026-01-02" or "weekly-2026-01")
  progress: number
  completed: boolean
  claimed: boolean
  streamingBaseline?: {
    tracks: Array<{
      trackName: string
      artistName: string
      initialCount: number
    }>
    timestamp: Date
  }
  updatedAt: Date
}
```

### Badge

```typescript
{
  code: string                    // Unique identifier (e.g., "daily_streak_1")
  name: string                    // Display name
  description: string             // Description text
  icon: string                    // Icon/image URL
  type: 'streak' | 'achievement' | 'event' | 'quest' | 'completion'
  criteria?: {
    streakDays?: number
    streakWeeks?: number
    questPeriod?: 'daily' | 'weekly'
    questType?: 'streaming' | 'quiz' | 'any'
    threshold?: number
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  active: boolean
  createdAt: Date
}
```

### UserBadge

```typescript
{
  userId: string
  badgeId: ObjectId               // References Badge._id
  earnedAt: Date
  metadata?: {
    streakCount?: number
    questCode?: string
    cyclePosition?: number
    milestoneNumber?: number
  }
}
```

### UserGameState

```typescript
{
  userId: string
  pity: {
    sinceEpic: number
    sinceLegendary: number
  }
  streak: {
    dailyCount: number            // Current daily streak (1-50)
    weeklyCount: number           // Current weekly streak (1-50)
    lastPlayAt: Date | null
    lastDailyQuestCompletionAt: Date | null
    lastWeeklyQuestCompletionAt: Date | null
  }
  dust: number
  xp: number
  level: number
  limits: {
    quizStartsToday: number
    dateKey: string
  }
  badges: {
    lastDailyStreakMilestone: number       // Last streak when badge was awarded
    lastWeeklyStreakMilestone: number      // Last streak when badge was awarded
    dailyStreakMilestoneCount: number      // Which milestone (1-5)
    weeklyStreakMilestoneCount: number     // Which milestone (1-5)
  }
}
```

---

## Cron Jobs

### Daily Quest Generation

**Endpoint:** `/api/cron/daily-quests`
**Schedule:** `0 0 * * *` (Daily at 00:00 UTC)
**Purpose:** Creates daily streaming and quiz quests

**What it does:**
1. Generates daily song streaming quest (5 songs × 5 streams)
2. Generates daily album streaming quest (2 albums)
3. Generates daily quiz quest (2 quizzes)

### Weekly Quest Generation

**Endpoint:** `/api/cron/weekly-quests`
**Schedule:** `0 0 * * 1` (Monday at 00:00 UTC)
**Purpose:** Creates weekly streaming and quiz quests

**What it does:**
1. Generates weekly song streaming quest (40 songs × 5 streams)
2. Generates weekly album streaming quest (10 albums)
3. Generates weekly quiz quest (10 quizzes)

---

## File Structure

```
lib/
├── game/
│   ├── quests.ts                      # Core quest utilities
│   ├── streamingQuestSelection.ts     # Streaming quest generation
│   ├── quizQuestGeneration.ts         # Quiz quest generation
│   ├── streamingVerification.ts       # Last.fm integration
│   ├── streakTracking.ts              # Streak & badge logic
│   └── completionBadges.ts            # Completion badge logic
├── models/
│   ├── QuestDefinition.ts
│   ├── UserQuestProgress.ts
│   ├── Badge.ts
│   ├── UserBadge.ts
│   ├── UserGameState.ts
│   └── Track.ts

app/api/
├── game/
│   └── quests/
│       ├── route.ts                   # GET quests
│       ├── claim/route.ts             # POST claim quest
│       └── verify-streaming/route.ts  # POST verify streams
└── cron/
    ├── daily-quests/route.ts          # Daily cron job
    └── weekly-quests/route.ts         # Weekly cron job

scripts/
└── seed-quest-badges.ts               # Badge seeding script
```

---

## Future Enhancements

### Possible Improvements

1. **Badge Images:** Replace emoji icons with custom artwork
2. **Leaderboards:** Show top streakers
3. **Social Sharing:** Share badge achievements
4. **Limited Edition Badges:** Special event badges
5. **Badge Collections:** Group badges by theme
6. **Badge Showcase:** Display on user profile
7. **Push Notifications:** Remind users to maintain streaks
8. **Streak Freeze:** Allow users to skip a day without breaking streak (purchasable)
9. **Team Quests:** Collaborative quests with friends
10. **Seasonal Quests:** Special quests for comebacks/anniversaries

---

## Troubleshooting

### Quests Not Generating

**Check:**
1. Cron job is running (Vercel logs)
2. `CRON_SECRET` environment variable is set
3. Database connection is working

**Debug:**
```bash
# Manually trigger daily quest generation
curl -X GET https://your-domain.com/api/cron/daily-quests \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Streaming Verification Not Working

**Check:**
1. User has Last.fm connected (`integrations.lastfm.username` exists)
2. Last.fm API is responding
3. Tracks in database have `isBTSFamily: true`

### Badges Not Awarded

**Check:**
1. Badges are seeded in database
2. User completed ALL quests (both streaming + quiz)
3. Check `UserGameState.badges.last*Milestone` fields

---

## Support

For issues or questions:
1. Check logs in Vercel dashboard
2. Review database state in MongoDB
3. Test API endpoints with Postman/curl
4. Verify environment variables are set correctly

---

**End of Documentation**
