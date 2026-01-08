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
  "ok": true,
  "score": 8,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "newCard": {
    "id": "item_xyz789",
    "photocard": {
      "member": "Jungkook",
      "era": "Love Yourself",
      "set": "LY: Answer",
      "rarity": "epic",
      "imageUrl": "https://res.cloudinary.com/..."
    },
    "duplicate": false,
    "dustAwarded": 0
  },
  "xpAwarded": 160,
  "masteryUpdates": {
    "Jungkook": { "xpGained": 80, "newLevel": 12 },
    "Love Yourself": { "xpGained": 80, "newLevel": 8 }
  },
  "questProgress": [
    {
      "code": "daily_quiz_3",
      "progress": 1,
      "total": 3,
      "completed": false
    }
  ]
}
```

---

## Inventory

### GET /api/game/inventory

Get user's photocard collection.

**Authentication**: Required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `rarity` (string, optional): Filter by rarity
- `member` (string, optional): Filter by member
- `era` (string, optional): Filter by era

**Success Response (200):**
```json
{
  "ok": true,
  "items": [
    {
      "id": "item_xyz789",
      "photocard": {
        "member": "Jungkook",
        "era": "Love Yourself",
        "set": "LY: Answer",
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/..."
      },
      "acquiredAt": "2026-01-06T10:30:00.000Z",
      "source": "quiz"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "pages": 8
  },
  "stats": {
    "totalCards": 142,
    "uniqueCards": 87,
    "legendary": 3,
    "epic": 12,
    "rare": 28,
    "common": 99
  }
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
  "cardId": "photocard_jk_ly_answer_01"
}
```

**Request Body (Rarity Roll):**
```json
{
  "targetRarity": "epic"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "stardustSpent": 2000,
  "remainingStardust": 3500,
  "craftedCard": {
    "id": "item_new123",
    "photocard": {
      "member": "Jungkook",
      "era": "Love Yourself",
      "rarity": "epic",
      "imageUrl": "https://res.cloudinary.com/..."
    }
  }
}
```

**Crafting Costs:**
- **Specific Card**: Common 100, Rare 500, Epic 2000, Legendary 10000
- **Rarity Roll**: Rare+ 200, Epic+ 1000, Legendary 5000

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
  "ok": true,
  "quests": {
    "daily": [
      {
        "code": "daily_stream_songs",
        "title": "Stream 5 Songs",
        "description": "Stream 5 BTS songs (5 times each)",
        "category": "streaming",
        "progress": 12,
        "total": 25,
        "completed": false,
        "metadata": {
          "targetCount": 5,
          "playCount": 5,
          "targetSongs": [
            {
              "title": "Dynamite",
              "artist": "BTS",
              "spotifyId": "5WM3WZSEKjFQMNmYBjJ3bK"
            }
          ]
        },
        "rewards": {
          "stardust": 50,
          "xp": 20
        },
        "expiresAt": "2026-01-07T00:00:00.000Z"
      }
    ],
    "weekly": [
      {
        "code": "weekly_stream_albums",
        "title": "Stream 10 Albums",
        "description": "Stream 10 complete BTS albums",
        "category": "streaming",
        "progress": 3,
        "total": 10,
        "completed": false,
        "metadata": {
          "targetAlbums": [
            {
              "name": "Love Yourself: Answer",
              "artist": "BTS",
              "spotifyId": "2lATMC0r3rD7eZDgvJKHvq",
              "tracks": [
                { "title": "Euphoria", "duration": 223 }
              ],
              "totalTracks": 25
            }
          ]
        },
        "rewards": {
          "stardust": 400,
          "xp": 200,
          "photocard": { "rarity": "rare" }
        },
        "expiresAt": "2026-01-13T00:00:00.000Z"
      }
    ]
  },
  "userState": {
    "dailyStreak": 5,
    "weeklyStreak": 2,
    "lastCompletedDaily": "2026-01-06T00:00:00.000Z",
    "lastCompletedWeekly": "2026-01-01T00:00:00.000Z"
  }
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
  "ok": true,
  "rewards": {
    "stardust": 50,
    "xp": 20,
    "photocard": null
  },
  "badge": {
    "code": "daily_completion",
    "name": "Daily Dedication",
    "icon": "🎯",
    "tier": 1
  },
  "newStreak": 6
}
```

---

## Badges

### GET /api/game/badges

Get user's badge collection and available badges.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "userBadges": [
    {
      "code": "daily_completion",
      "name": "Daily Dedication",
      "description": "Complete all daily quests",
      "icon": "🎯",
      "tier": 5,
      "awardedAt": "2026-01-06T10:00:00.000Z"
    }
  ],
  "allBadges": [
    {
      "code": "daily_completion",
      "name": "Daily Dedication",
      "description": "Complete all daily quests",
      "icon": "🎯",
      "maxTier": 10,
      "rewards": {
        "1": { "stardust": 100 },
        "5": { "stardust": 500, "photocard": { "rarity": "rare" } },
        "10": { "stardust": 2000, "photocard": { "rarity": "epic" } }
      }
    }
  ]
}
```

---

## Leaderboard

### GET /api/game/leaderboard

Get weekly leaderboard rankings.

**Authentication**: Optional (shows user rank if authenticated)

**Query Parameters:**
- `limit` (number, default: 100, max: 100)
- `cursor` (string, optional): Pagination cursor

**Success Response (200):**
```json
{
  "ok": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user_123",
      "username": "ARMYFan123",
      "score": 100,
      "completedAt": "2026-01-06T10:30:00.000Z",
      "photoURL": "https://..."
    }
  ],
  "userRank": {
    "rank": 42,
    "score": 85,
    "percentile": 58
  },
  "pagination": {
    "hasMore": false,
    "nextCursor": null
  },
  "resetDate": "2026-01-13T00:00:00.000Z"
}
```

---

### POST /api/game/leaderboard/refresh

Manually refresh leaderboard (admin only).

**Authentication**: Required (admin)

**Success Response (200):**
```json
{
  "ok": true,
  "rewardsDistributed": 100,
  "newWeekStarted": true
}
```

---

## Game State

### GET /api/game/state

Get complete user game state.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "state": {
    "userId": "user_123",
    "stardust": 3500,
    "tickets": 12,
    "pityCounters": {
      "standard": 8,
      "legendary": 32
    },
    "dailyQuizCount": 5,
    "lastQuizDate": "2026-01-06",
    "quests": {
      "dailyStreak": 5,
      "weeklyStreak": 2
    },
    "stats": {
      "totalQuizzes": 142,
      "perfectScores": 23,
      "totalCards": 356,
      "uniqueCards": 187,
      "legendaryCards": 8
    }
  }
}
```

---

## Sharing

### POST /api/game/share

Generate shareable photocard image.

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
  "ok": true,
  "shareUrl": "https://res.cloudinary.com/.../share_jk_ly_answer.png"
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
  "ok": true,
  "photocards": [
    {
      "id": "photocard_jk_ly_answer_01",
      "member": "Jungkook",
      "era": "Love Yourself",
      "set": "LY: Answer",
      "rarity": "epic",
      "imageUrl": "https://res.cloudinary.com/..."
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
