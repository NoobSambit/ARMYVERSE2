# Game APIs

Complete reference for Boraverse game system endpoints.

---

## Quiz System

### POST /api/game/quiz/start

Start a new quiz session.

**Authentication**: Required

**Request Body:**
```json
{
  "locale": "en",
  "count": 10
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "sessionId": "session_abc123",
  "questions": [
    {
      "id": "q1",
      "question": "In which year did BTS debut?",
      "options": ["2012", "2013", "2014", "2015"],
      "category": "history",
      "difficulty": "easy"
    }
  ],
  "expiresAt": "2026-01-06T12:20:00.000Z"
}
```

**Notes:**
- Sessions expire after 20 minutes (TTL)
- Questions are randomized
- Same session cannot be reused

---

### POST /api/game/quiz/complete

Submit quiz answers and receive photocard reward.

**Authentication**: Required

**Request Body:**
```json
{
  "sessionId": "session_abc123",
  "answers": [1, 0, 2, 1, 3, 0, 2, 1, 0, 3]
}
```

**Success Response (200):**
```json
{
  "xp": 18,
  "correctCount": 7,
  "reward": {
    "cardId": "6960e7ce2d95902a438cace4",
    "title": "Melon Profile",
    "category": "D-DAY",
    "categoryPath": "D-DAY/Gallery",
    "subcategory": "Promo Pictures",
    "subcategoryPath": "Promo_Pictures",
    "imageUrl": "https://static.wikia.nocookie.net/...",
    "thumbUrl": "https://static.wikia.nocookie.net/...",
    "sourceUrl": "https://bts.fandom.com/wiki/D-DAY/Gallery#Promo_Pictures",
    "pageUrl": "https://bts.fandom.com/wiki/D-DAY/Gallery",
    "rarity": "random"
  },
  "duplicate": false,
  "dustAwarded": 0,
  "rarityWeightsUsed": null,
  "pityApplied": false,
  "inventoryCount": 1002,
  "review": {
    "items": [
      {
        "id": "q1",
        "question": "In which year did BTS debut?",
        "choices": ["2012", "2013", "2014", "2015"],
        "difficulty": "easy",
        "userAnswerIndex": 1,
        "correctIndex": 1,
        "xpAward": 1
      }
    ],
    "summary": { "xp": 18, "correctCount": 7 }
  }
}
```

---

## Inventory

### GET /api/game/inventory

Get user's photocard collection.

**Authentication**: Required

**Query Parameters:**
- `skip` (number, default: 0)
- `limit` (number, default: 20, max: 50)
- `q` (string, optional): Search by caption/name/category paths
- `category` (string, optional): Filter by `categoryPath`
- `subcategory` (string, optional): Filter by `subcategoryPath`
- `source` (string, optional): Filter by `source.type`
- `newOnly` (string, optional): `1` to return items from the last 7 days

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "69612f423984715f3b4fde37",
      "acquiredAt": "2026-01-06T10:30:00.000Z",
      "source": { "type": "quiz" },
      "card": {
        "cardId": "6960e7ce2d95902a438cace4",
        "title": "Melon Profile",
        "category": "D-DAY",
        "categoryPath": "D-DAY/Gallery",
        "subcategory": "Promo Pictures",
        "subcategoryPath": "Promo_Pictures",
        "imageUrl": "https://static.wikia.nocookie.net/...",
        "thumbUrl": "https://static.wikia.nocookie.net/..."
      }
    }
  ],
  "total": 1002,
  "nextCursor": "20"
}
```

---

## Crafting

### POST /api/game/craft

Craft a photocard using Stardust.

**Authentication**: Required

**Request Body (Specific Card):**
```json
{
  "cardId": "6960e7ce2d95902a438cace4"
}
```

**Request Body (Random Roll):**
```json
{}
```

**Success Response (200):**
```json
{
  "reward": {
    "cardId": "6960e7ce2d95902a438cace4",
    "title": "Melon Profile",
    "category": "D-DAY",
    "categoryPath": "D-DAY/Gallery",
    "subcategory": "Promo Pictures",
    "subcategoryPath": "Promo_Pictures",
    "imageUrl": "https://static.wikia.nocookie.net/...",
    "thumbUrl": "https://static.wikia.nocookie.net/...",
    "sourceUrl": "https://bts.fandom.com/wiki/D-DAY/Gallery#Promo_Pictures",
    "pageUrl": "https://bts.fandom.com/wiki/D-DAY/Gallery",
    "rarity": "random"
  },
  "balances": { "dust": 3500, "dustSpent": 50 },
  "inventoryCount": 1002
}
```

**Cost:**
- Fixed 50 dust per craft (specific or random).

---

## Mastery

### GET /api/game/mastery

Get user's mastery progress for members and eras.

**Authentication**: Required

**Success Response (200):**
```json
{
  "members": [
    { "definition": { "key": "Jungkook" }, "track": { "level": 24, "xp": 2400, "nextMilestone": 25, "claimable": [25], "xpToNext": 100 } },
    { "definition": { "key": "OT7" }, "track": { "level": 3, "xp": 2100, "nextMilestone": 5, "claimable": [], "xpToNext": 500 } }
  ],
  "eras": [
    { "definition": { "key": "Love Yourself: Tear" }, "track": { "level": 21, "xp": 2100, "nextMilestone": 25, "claimable": [], "xpToNext": 400 } }
  ],
  "milestones": [
    { "level": 5, "rewards": { "xp": 50, "dust": 25 } },
    { "level": 10, "rewards": { "xp": 100, "dust": 75 } }
  ],
  "summary": {
    "totalTracks": 2,
    "claimableCount": 1,
    "dust": 1200,
    "totalXp": 5400
  }
}
```

---

### POST /api/game/mastery/claim

Claim mastery milestone rewards.

**Authentication**: Required

**Request Body:**
```json
{
  "kind": "member",
  "key": "Jungkook",
  "milestone": 10
}
```

**Success Response (200):**
```json
{
  "milestone": 10,
  "rewards": { "xp": 100, "dust": 75 },
  "balances": { "dust": 1275, "xp": 5500 },
  "track": { "kind": "member", "key": "Jungkook", "level": 24, "xp": 2400, "claimable": [25] }
}
```

**Milestone Rewards:**
- Level 5: +50 XP, +25 Dust
- Level 10: +100 XP, +75 Dust
- Level 25: +250 XP, +200 Dust
- Level 50: +500 XP, +400 Dust
- Level 100: +1500 XP, +1000 Dust
* OT7 uses 7× XP per level when computing milestones.

---

## Quests

### GET /api/game/quests

Get available quests and user progress.

**Authentication**: Required

**Success Response (200):**
```json
{
  "quests": [
    {
      "code": "daily_stream_songs_2026-01-06",
      "title": "Stream 5 Songs",
      "period": "daily",
      "goalType": "stream:songs",
      "goalValue": 25,
      "progress": 12,
      "completed": false,
      "claimed": false,
      "reward": { "dust": 50, "xp": 20, "ticket": { "enabled": true }, "badgeId": null },
      "streamingMeta": {
        "trackTargets": [
          { "trackName": "Dynamite", "artistName": "BTS", "count": 5 }
        ]
      },
      "trackProgress": {
        "dynamite:bts": 3
      }
    }
  ]
}
```

---

### POST /api/game/quests/verify-streaming

Verify streaming progress via Last.fm.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "updated": [
    {
      "questCode": "daily_stream_songs",
      "previousProgress": 12,
      "newProgress": 18,
      "completed": false
    }
  ]
}
```

**Requirements:**
- User must have connected Last.fm account
- Last.fm scrobbles are checked in last 24 hours
- Tracks must be marked as `isBTSFamily: true` in database

---

### POST /api/game/quests/claim

Claim quest rewards.

**Authentication**: Required

**Request Body:**
```json
{
  "code": "daily_stream_songs"
}
```

**Success Response (200):**
```json
{
  "reward": {
    "cardId": "6960e7ce2d95902a438cace4",
    "title": "Melon Profile",
    "category": "D-DAY",
    "subcategory": "Promo Pictures",
    "imageUrl": "https://static.wikia.nocookie.net/...",
    "sourceUrl": "https://bts.fandom.com/wiki/D-DAY/Gallery#Promo_Pictures",
    "rarity": "random"
  },
  "balances": { "dust": 1250, "xp": 320 },
  "streaks": { "daily": 6, "weekly": 2 },
  "badgesAwarded": ["daily_completion"],
  "photocardAwarded": null,
  "allQuestsCompleted": true
}
```

---

## Badges

### GET /api/game/badges

Get user's earned badges.

**Authentication**: Required

**Success Response (200):**
```json
{
  "badges": [
    {
      "code": "daily_completion",
      "name": "Daily Dedication",
      "description": "Complete all daily quests",
      "icon": "🎯",
      "rarity": "rare",
      "earnedAt": "2026-01-06T10:00:00.000Z",
      "metadata": { "questCode": "daily_stream_songs_2026-01-06" }
    }
  ]
}
```

---

## Leaderboard

### GET /api/game/leaderboard

Get leaderboard rankings for a specific time period.

**Authentication**: Required (shows user rank if authenticated)

**Query Parameters:**
- `period` (string, default: "weekly"): Time period - "daily", "weekly", or "alltime"
- `limit` (number, default: 20, max: 50): Number of entries to return
- `cursor` (string, optional): Pagination cursor for next page

**Success Response (200):**
```json
{
  "period": "weekly",
  "periodKey": "weekly-2026-02",
  "entries": [
    {
      "_id": "entry_id",
      "userId": "user_123",
      "displayName": "ARMYFan123",
      "avatarUrl": "https://...",
      "score": 250,
      "level": 5,
      "rank": 1,
      "previousRank": 3,
      "rankChange": 2,
      "stats": {
        "quizzesPlayed": 15,
        "questionsCorrect": 120,
        "totalQuestions": 150
      }
    }
  ],
  "nextCursor": "cursor_string_or_null",
  "me": {
    "score": 180,
    "level": 4,
    "rank": 42,
    "rankChange": -5,
    "displayName": "You",
    "avatarUrl": "https://...",
    "stats": {
      "quizzesPlayed": 10,
      "questionsCorrect": 80,
      "totalQuestions": 100
    },
    "totalXp": 450,
    "xpIntoLevel": 50,
    "xpForNextLevel": 100,
    "xpProgress": 50,
    "xpToNextLevel": 50
  }
}
```

**Periods:**
- `daily` - Resets at 00:00 UTC, format: `daily-YYYY-MM-DD`
- `weekly` - ISO week, resets Monday at 00:00 UTC, format: `weekly-YYYY-WW`
- `alltime` - Never resets, format: `alltime`

**Scoring:**
- Score = Total XP earned during the period
- Accumulated from quiz completions and quest completions
- Higher score = better rank

---

### POST /api/game/leaderboard/refresh

Force update current user's leaderboard entry with latest profile data.

**Authentication**: Required

**Query Parameters:**
- `period` (string, default: "weekly"): Time period - "daily", "weekly", or "alltime"

**Success Response (200):**
```json
{
  "success": true,
  "period": "weekly",
  "periodKey": "weekly-2026-02",
  "entry": {
    "displayName": "ARMYFan123",
    "avatarUrl": "https://...",
    "score": 250,
    "level": 5
  }
}
```

**Use Cases:**
- Sync profile display name/avatar after updating profile
- Initialize all-time leaderboard entry for new users
- Refresh leaderboard data after profile changes

---

## Game State

### GET /api/game/state

Get complete user game state.

**Authentication**: Required

**Success Response (200):**
```json
{
  "dust": 3500,
  "totalXp": 5400,
  "level": 54,
  "streaks": {
    "daily": { "current": 5, "nextMilestone": 10, "daysRemaining": 5 },
    "weekly": { "current": 2, "nextMilestone": 10, "weeksRemaining": 8 }
  },
  "potentialRewards": {
    "dailyMilestoneBadge": { "code": "daily_milestone_1", "name": "Dedicated Devotee", "icon": "🏆", "rarity": "epic", "atStreak": 10 },
    "weeklyMilestoneBadge": { "code": "weekly_milestone_1", "name": "Weekly Warrior", "icon": "💫", "rarity": "epic", "atStreak": 10 },
    "dailyPhotocard": { "type": "random" },
    "weeklyPhotocard": { "type": "random" }
  },
  "latestBadges": [
    {
      "code": "daily_completion",
      "name": "Daily Dedication",
      "icon": "🎯",
      "rarity": "rare",
      "earnedAt": "2026-01-06T10:00:00.000Z"
    }
  ]
}
```

---

## Sharing

### POST /api/game/share

Generate a shareable URL for a photocard.

**Authentication**: Required

**Request Body:**
```json
{
  "inventoryItemId": "item_xyz789"
}
```

**Success Response (200):**
```json
{
  "shareUrl": "https://bts.fandom.com/wiki/D-DAY/Gallery#Promo_Pictures"
}
```

---

## Photocards

### GET /api/game/photocards/preview

Preview available photocards (for UI display).

**Authentication**: Optional

**Success Response (200):**
```json
{
  "cards": [
    {
      "cardId": "6960e7ce2d95902a438cace4",
      "title": "Melon Profile",
      "category": "D-DAY",
      "categoryPath": "D-DAY/Gallery",
      "subcategory": "Promo Pictures",
      "subcategoryPath": "Promo_Pictures",
      "imageUrl": "https://static.wikia.nocookie.net/...",
      "thumbUrl": "https://static.wikia.nocookie.net/..."
    }
  ],
  "total": 12
}
```

---

### GET /api/game/photocards/catalog

Return the category/subcategory tree with total vs collected counts.

**Authentication**: Required

**Success Response (200):**
```json
{
  "totalCards": 9871,
  "collectedCards": 45,
  "categories": [
    {
      "key": "D-DAY/Gallery",
      "label": "D-DAY",
      "path": ["D-DAY/Gallery"],
      "total": 120,
      "collected": 5,
      "children": [
        {
          "key": "Promo_Pictures",
          "label": "Promo Pictures",
          "path": ["Promo_Pictures"],
          "total": 24,
          "collected": 2,
          "children": []
        }
      ]
    }
  ]
}
```

---

### GET /api/game/photocards/collection

Return grouped catalog cards with owned status for collection view.

**Authentication**: Required

**Query Parameters:**
- `q` (string, optional): Search by caption/name/category paths
- `category` (string, optional): Filter by `categoryPath`
- `subcategory` (string, optional): Filter by `subcategoryPath`

**Success Response (200):**
```json
{
  "totalCards": 120,
  "collectedCards": 5,
  "groups": [
    {
      "key": "Promo_Pictures",
      "label": "Promo Pictures",
      "total": 24,
      "collected": 2,
      "cards": [
        {
          "cardId": "6960e7ce2d95902a438cace4",
          "title": "Melon Profile",
          "category": "D-DAY",
          "subcategory": "Promo Pictures",
          "imageUrl": "https://static.wikia.nocookie.net/...",
          "thumbUrl": "https://static.wikia.nocookie.net/...",
          "sourceUrl": "https://bts.fandom.com/wiki/D-DAY/Gallery#Promo_Pictures",
          "pageUrl": "https://bts.fandom.com/wiki/D-DAY/Gallery",
          "owned": true
        }
      ]
    }
  ]
}
```

---

## Related Documentation

- [Game System Feature Guide](../features/game-system.md)
- [Quest System](../QUEST_SYSTEM.md)
- [Badge System](../QUEST_BADGE_SYSTEM.md)
- [Quick Start](../QUICK_START.md)

---

**Last Updated**: January 2026
