# Game System (Boraverse)

## What It Is

Boraverse is a comprehensive BTS quiz and photocard collection game featuring:
- **Quiz System** - 10-question quizzes testing BTS knowledge
- **Photocard Collection** - Earn photocards with 4 rarity tiers
- **Crafting System** - Convert duplicates to Stardust and craft specific cards
- **Mastery System** - Earn member/era XP with milestone rewards
- **Quest System** - Complete daily/weekly tasks for rewards
- **Leaderboard** - Weekly competition with global rankings
- **Sharing** - Generate shareable photocard images

## How It Works

### Quiz System

**Quiz Structure:**
- 10 multiple-choice questions per quiz
- Questions pulled from MongoDB database
- Randomized from different categories
- 20-minute time limit (TTL)
- Score based on correct answers

**Question Categories:**
- Discography (songs, albums, releases)
- Members (birthdays, facts, solo work)
- History (debut, milestones, achievements)
- Lyrics (song identification, meaning)
- MVs & Performances (visual identification)

**Performance-Based Rewards:**
- Perfect score (10/10): Higher legendary drop rate
- Good score (7-9/10): Standard drop rates
- Passing score (5-6/10): Lower epic drop rate
- Below 5/10: Common cards only

### Rarity System

Four rarity tiers with different drop rates:

| Rarity | Drop Rate | Icon | Color | Description |
|--------|-----------|------|-------|-------------|
| **Legendary** | 1% | 👑 | Amber/Gold | Rarest cards, most valuable |
| **Epic** | 7% | 💎 | Purple/Fuchsia | Very rare, high value |
| **Rare** | 22% | ⭐ | Blue/Cyan | Uncommon, good value |
| **Common** | 70% | 💜 | Slate | Base cards, frequent drops |

**Pity System:**
- Guaranteed Epic or higher every 15 pulls
- Guaranteed Legendary at 50 pulls
- Pity counter resets after guaranteed drop
- Counter stored per user in database

### Crafting System

**Stardust Economy:**
- Duplicate cards convert to Stardust
- Stardust amount based on rarity:
  - Common: 10 Stardust
  - Rare: 50 Stardust
  - Epic: 200 Stardust
  - Legendary: 1000 Stardust

**Crafting Options:**
1. **Craft Specific Card**: Spend Stardust to get exact card you want
   - Common: 100 Stardust
   - Rare: 500 Stardust
   - Epic: 2000 Stardust
   - Legendary: 10000 Stardust

2. **Rarity Roll**: Guaranteed minimum rarity
   - Rare+: 200 Stardust
   - Epic+: 1000 Stardust
   - Legendary: 5000 Stardust

### Mastery System

**XP Progression:**
- Earn XP for each quiz question (5-20 XP)
- Difficulty bonuses for harder questions
- Member-specific XP for member-related questions
- Era-specific XP for era-related questions

**Mastery Tracks:**
- **Member Mastery**: Individual progress for each BTS member
- **Era Mastery**: Progress for each album/era

**Milestone Rewards:**
- Level 10: 1 themed pull (member or era)
- Level 25: 3 themed pulls + 500 Stardust
- Level 50: 5 themed pulls + 2000 Stardust
- Level 100: Guaranteed legendary themed card

### Quest System

**Daily Quests:**
- Complete 3 quizzes
- Earn 5 photocards
- Score perfect on any quiz
- Rewards: 100-300 Stardust, 1-2 tickets

**Weekly Quests:**
- Complete 20 quizzes
- Collect 50 photocards
- Reach top 100 on leaderboard
- Rewards: 1000 Stardust, 5 tickets, rare+ guarantee

**Special Events:**
- Birthday quests (member birthdays)
- Comeback quests (new release periods)
- Holiday events (special themes)
- Exclusive photocard rewards

### Leaderboard System

**Weekly Competition:**
- Resets every Monday at 00:00 UTC
- Ranks based on best quiz run score
- Top 100 displayed publicly
- Rewards distributed at reset

**Reward Tiers:**
1. **1st Place**: 3 Legendary cards, 5000 Stardust, Special badge
2. **2-10th Place**: 2 Epic cards, 2000 Stardust, Elite badge
3. **11-50th Place**: 1 Epic card, 1000 Stardust, Competitor badge
4. **51-100th Place**: 2 Rare cards, 500 Stardust

### Sharing System

Generate beautiful shareable images of photocards using Cloudinary.

**Features:**
- Photocard with rarity badge
- User information overlay
- Acquisition date
- Rarity tier indicators
- Custom background effects

## Workflow

### Quiz Complete Flow

```mermaid
graph TD
    A[User starts quiz] --> B[POST /api/game/quiz/start]
    B --> C[Receive 10 questions + sessionId]
    C --> D[User answers questions]
    D --> E[Submit answers]
    E --> F[POST /api/game/quiz/complete]
    F --> G[Calculate score]
    G --> H[Determine rarity drop]
    H --> I[Check pity counter]
    I --> J[Roll for photocard]
    J --> K[Award XP and Stardust for dupes]
    K --> L[Update mastery progress]
    L --> M[Check quest progress]
    M --> N[Update leaderboard]
    N --> O[Return results with new card]
```

### Crafting Flow

```mermaid
graph TD
    A[User opens craft menu] --> B[View Stardust balance]
    B --> C{Choose option}
    C -->|Specific Card| D[Select exact card wanted]
    C -->|Rarity Roll| E[Select minimum rarity]
    D --> F[POST /api/game/craft]
    E --> F
    F --> G[Deduct Stardust]
    G --> H[Generate card]
    H --> I[Add to inventory]
    I --> J[Show success message]
```

### Mastery Claim Flow

```mermaid
graph TD
    A[User reaches milestone] --> B[Notification appears]
    B --> C[Click Claim Reward]
    C --> D[POST /api/game/mastery/claim]
    D --> E[Validate milestone reached]
    E --> F[Grant themed pulls]
    F --> G[Roll for cards]
    G --> H[Add to inventory]
    H --> I[Update mastery status]
    I --> J[Show reward summary]
```

## API Reference

### Quiz Endpoints

**POST /api/game/quiz/start**

Start a new quiz session.

**Authentication**: Required

**Request Body:**
```json
{
  "locale": "en",
  "count": 10,
  "difficulty": "mixed"
}
```

**Response:**
```json
{
  "ok": true,
  "sessionId": "664f1234abc...",
  "questions": [
    {
      "id": "q123",
      "question": "In which year did BTS debut?",
      "options": ["2012", "2013", "2014", "2015"],
      "category": "history",
      "difficulty": "easy"
    }
  ],
  "expiresAt": "2025-01-29T08:20:00.000Z"
}
```

**POST /api/game/quiz/complete**

Submit quiz answers and receive rewards.

**Authentication**: Required

**Request Body:**
```json
{
  "sessionId": "664f1234abc...",
  "answers": [1, 0, 2, 1, 3, 0, 2, 1, 0, 3]
}
```

**Response:**
```json
{
  "ok": true,
  "score": 8,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "newCard": {
    "id": "66a1def...",
    "photocard": {
      "member": "Jungkook",
      "era": "Love Yourself",
      "set": "LY: Answer",
      "rarity": "epic",
      "imageUrl": "https://res.cloudinary.com/..."
    },
    "duplicate": false,
    "stardustAwarded": 0
  },
  "xpAwarded": 160,
  "masteryUpdates": {
    "Jungkook": { "xpGained": 80, "newLevel": 12 },
    "Love Yourself": { "xpGained": 80, "newLevel": 8 }
  },
  "questProgress": [
    { "code": "daily_quiz_3", "progress": 1, "total": 3, "completed": false }
  ]
}
```

### Inventory Endpoints

**GET /api/game/inventory**

Get user's photocard inventory with pagination.

**Authentication**: Required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `rarity` (string, optional): Filter by rarity
- `member` (string, optional): Filter by member
- `era` (string, optional): Filter by era

**Response:**
```json
{
  "ok": true,
  "items": [
    {
      "id": "66a1def...",
      "photocard": {
        "member": "Jungkook",
        "era": "Love Yourself",
        "set": "LY: Answer",
        "rarity": "epic",
        "imageUrl": "https://res.cloudinary.com/..."
      },
      "acquiredAt": "2025-01-29T07:30:00.000Z"
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

### Crafting Endpoints

**POST /api/game/craft**

Craft a photocard using Stardust.

**Authentication**: Required

**Request Body (Specific Card):**
```json
{
  "cardId": "card_jk_ly_answer_01"
}
```

**Request Body (Rarity Roll):**
```json
{
  "targetRarity": "epic"
}
```

**Response:**
```json
{
  "ok": true,
  "stardustSpent": 2000,
  "remainingStardust": 3500,
  "craftedCard": {
    "id": "66a1xyz...",
    "photocard": {
      "member": "Jungkook",
      "era": "Love Yourself",
      "rarity": "epic",
      "imageUrl": "https://res.cloudinary.com/..."
    }
  }
}
```

### Mastery Endpoints

**GET /api/game/mastery**

Get user's mastery progress.

**Authentication**: Required

**Response:**
```json
{
  "ok": true,
  "mastery": {
    "members": {
      "Jungkook": { "xp": 2400, "level": 24, "nextMilestone": 25 },
      "Jimin": { "xp": 1800, "level": 18, "nextMilestone": 25 },
      "V": { "xp": 1500, "level": 15, "nextMilestone": 25 }
    },
    "eras": {
      "Love Yourself": { "xp": 3200, "level": 32, "nextMilestone": 50 },
      "Map of the Soul": { "xp": 2100, "level": 21, "nextMilestone": 25 }
    }
  },
  "claimableMilestones": [
    { "kind": "member", "key": "Jungkook", "level": 25 }
  ]
}
```

**POST /api/game/mastery/claim**

Claim mastery milestone rewards.

**Authentication**: Required

**Request Body:**
```json
{
  "kind": "member",
  "key": "Jungkook"
}
```

**Response:**
```json
{
  "ok": true,
  "rewards": {
    "themedPulls": 3,
    "stardust": 500,
    "cards": [
      { "member": "Jungkook", "rarity": "rare" },
      { "member": "Jungkook", "rarity": "epic" },
      { "member": "Jungkook", "rarity": "rare" }
    ]
  }
}
```

### Quest Endpoints

**GET /api/game/quests**

Get available quests and progress.

**Authentication**: Required

**Response:**
```json
{
  "ok": true,
  "quests": {
    "daily": [
      {
        "code": "daily_quiz_3",
        "title": "Quiz Master",
        "description": "Complete 3 quizzes",
        "progress": 1,
        "total": 3,
        "completed": false,
        "rewards": { "stardust": 200, "tickets": 1 }
      }
    ],
    "weekly": [
      {
        "code": "weekly_quiz_20",
        "title": "Quiz Veteran",
        "description": "Complete 20 quizzes this week",
        "progress": 8,
        "total": 20,
        "completed": false,
        "rewards": { "stardust": 1000, "tickets": 5 }
      }
    ]
  },
  "resetTimes": {
    "daily": "2025-01-30T00:00:00.000Z",
    "weekly": "2025-02-03T00:00:00.000Z"
  }
}
```

**POST /api/game/quests/claim**

Claim quest rewards.

**Authentication**: Required

**Request Body:**
```json
{
  "code": "daily_quiz_3"
}
```

**Response:**
```json
{
  "ok": true,
  "rewards": {
    "stardust": 200,
    "tickets": 1
  }
}
```

### Leaderboard Endpoint

**GET /api/game/leaderboard**

Get weekly leaderboard rankings.

**Query Parameters:**
- `limit` (number, default: 100, max: 100)
- `cursor` (string, optional): Pagination cursor

**Response:**
```json
{
  "ok": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user123",
      "username": "ARMYFan123",
      "score": 100,
      "completedAt": "2025-01-29T10:30:00.000Z"
    },
    {
      "rank": 2,
      "userId": "user456",
      "username": "BTSLover",
      "score": 98,
      "completedAt": "2025-01-29T09:15:00.000Z"
    }
  ],
  "pagination": {
    "hasMore": false,
    "nextCursor": null
  },
  "resetDate": "2025-02-03T00:00:00.000Z"
}
```

### Sharing Endpoint

**POST /api/game/share**

Generate shareable photocard image.

**Authentication**: Required

**Request Body:**
```json
{
  "inventoryItemId": "66a1def..."
}
```

**Response:**
```json
{
  "ok": true,
  "shareUrl": "https://res.cloudinary.com/.../share_overlay.png"
}
```

## Configuration

### Environment Variables

```env
# Database
MONGODB_URI=your-mongodb-connection-string

# Firebase (for authentication)
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Cloudinary (for photocard images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Database Models

### Question
```typescript
{
  question: String,
  options: [String],
  correctIndex: Number,
  category: String,
  difficulty: String,
  tags: [String],
  hash: String // unique identifier
}
```

### Photocard
```typescript
{
  member: String,
  era: String,
  set: String,
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  publicId: String, // Cloudinary ID
  imageUrl: String
}
```

### InventoryItem
```typescript
{
  userId: String,
  photocardId: ObjectId,
  acquiredAt: Date,
  source: String // 'quiz' | 'craft' | 'mastery' | 'quest'
}
```

### UserGameState
```typescript
{
  userId: String,
  stardust: Number,
  tickets: Number,
  pityCounters: {
    standard: Number,
    legendary: Number
  },
  mastery: {
    members: Map<String, { xp: Number, level: Number }>,
    eras: Map<String, { xp: Number, level: Number }>
  },
  questProgress: Map<String, { progress: Number, completed: Boolean }>,
  dailyQuizCount: Number,
  lastQuizDate: Date
}
```

## Best Practices

### For Players
- ✅ Complete daily quests for consistent Stardust income
- ✅ Focus on mastery for themed pulls
- ✅ Save Stardust for specific cards you want
- ✅ Participate weekly for leaderboard rewards
- ✅ Perfect scores give better drop rates

### For Developers
- ✅ Validate quiz sessions before completion
- ✅ Implement rate limiting on quiz starts
- ✅ Cache photocard images with CDN
- ✅ Use TTL indexes for expired sessions
- ✅ Batch database updates for performance

## Anti-Cheat Measures

- Daily ranked quiz limit (prevents grinding)
- Session expiration (20 minutes)
- Answer validation on server
- Duplicate submission prevention
- Rate limiting on all endpoints

## Related Documentation

- [Authentication](./authentication.md) - Required for all game features
- [API Reference](../api/game.md) - Complete game API documentation
- [Database Schema](../architecture/database.md) - Game data models
