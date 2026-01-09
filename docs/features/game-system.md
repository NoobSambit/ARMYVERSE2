# Game System (Boraverse)

## What It Is

Boraverse is a comprehensive BTS quiz and photocard collection game featuring:
- **Quiz System** - 10-question quizzes testing BTS knowledge
- **Photocard Collection** - Fandom gallery catalog with random drops
- **Crafting System** - Convert duplicates to Dust and craft specific cards
- **Mastery System** - Earn member/era XP with milestone rewards
- **Quest System** - Complete daily/weekly tasks for rewards
- **Leaderboard** - Weekly competition with global rankings
- **Sharing** - Generate shareable photocard images

## How It Works

### Quiz System

**Quiz Structure:**
- 10 multiple-choice questions per quiz
- Questions pulled from MongoDB database
- Uniform random sample across the approved question pool for the locale (no difficulty buckets)
- 20-minute time limit (TTL)
- Score based on correct answers

**Question Categories:**
- Discography (songs, albums, releases)
- Members (birthdays, facts, solo work)
- History (debut, milestones, achievements)
- Lyrics (song identification, meaning)
- MVs & Performances (visual identification)

**XP-Gated Rewards:**
- XP is difficulty-weighted (+1 easy, +2 medium, +3 hard)
- Below 5 XP: No card drop (XP still awarded)
- 5+ XP: Random photocard from the Fandom catalog

### Rarity (Deprecated)

Rarity tiers and pity tracking were part of the legacy photocard pipeline. The current catalog uses random drops from `fandom_gallery_images`, and rewards are stored with `rarity: "random"` for audit consistency.

### Crafting System

**Dust Economy:**
- Duplicate cards convert to Dust

**Crafting Options:**
1. **Craft Specific Card**: Spend Stardust to get exact card you want
   - Common: 100 Stardust
   - Rare: 500 Stardust
   - Epic: 2000 Stardust
   - Legendary: 10000 Stardust

2. **Random Roll**: Spend dust for a random catalog card

### Mastery System

**XP Progression:**
- Earn XP for each correctly answered quiz question (difficulty-weighted)
- Member/Era XP sourced from question metadata (not from reward cards)

**Mastery Tracks:**
- **Member Mastery**: Individual progress for each BTS member, plus **OT7** (OT7 requires 7× XP per level)
- **Era Mastery**: Progress for each album/era, derived dynamically from questions

**Milestone Rewards (XP + Dust):**
- Level 5: +50 XP, +25 Dust
- Level 10: +100 XP, +75 Dust
- Level 25: +250 XP, +200 Dust
- Level 50: +500 XP, +400 Dust
- Level 100: +1500 XP, +1000 Dust

### Quest System

**Daily Quests:**
- Mix of streaming and quiz goals
- Rewards: dust + XP
- Some quests include a photocard ticket (random drop)

**Weekly Quests:**
- Higher-volume streaming and quiz goals
- Rewards: dust + XP + optional photocard ticket (random drop)

**Special Events:**
- Birthday quests (member birthdays)
- Comeback quests (new release periods)
- Holiday events (special themes)
- Bonus photocard drops

### Leaderboard System

**Weekly Competition:**
- Resets every Monday at 00:00 UTC
- Ranks based on best quiz run score
- Top 100 displayed publicly
- Rewards distributed at reset

**Reward Tiers:**
1. **1st Place**: 3 random cards, 5000 Stardust, Special badge
2. **2-10th Place**: 2 random cards, 2000 Stardust, Elite badge
3. **11-50th Place**: 1 random card, 1000 Stardust, Competitor badge
4. **51-100th Place**: 2 random cards, 500 Stardust

### Sharing System

Generate shareable photocard links from the Fandom catalog.

**Features:**
- Returns page or anchor URL for the card
- Works for any inventory item
- Category + subcategory context

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
    G --> H{XP >= 5?}
    H -->|Yes| I[Roll random photocard]
    H -->|No| J[Skip card drop]
    I --> K[Award XP and Stardust for dupes]
    J --> K
    K --> L[Update mastery progress]
    L --> M[Check quest progress]
    M --> N[Update leaderboard]
    N --> O[Return results]
```

### Crafting Flow

```mermaid
graph TD
    A[User opens craft menu] --> B[View Stardust balance]
    B --> C{Choose option}
    C -->|Specific Card| D[Select exact card wanted]
    C -->|Random Roll| E[Skip selection]
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
    E --> F[Grant XP + Dust rewards]
    F --> G[Update mastery status]
    G --> H[Show reward summary]
```

## API Reference

Authoritative API docs live in `docs/api/game.md`. Key endpoints:

- `POST /api/game/quiz/start`
- `POST /api/game/quiz/complete`
- `GET /api/game/inventory`
- `GET /api/game/photocards/catalog`
- `GET /api/game/photocards/collection`
- `GET /api/game/photocards/preview`
- `POST /api/game/craft`
- `GET /api/game/mastery`
- `POST /api/game/mastery/claim`
- `GET /api/game/quests`
- `POST /api/game/quests/claim`
- `GET /api/game/badges`
- `POST /api/game/share`

## Configuration

### Environment Variables

```env
# Database
MONGODB_URI=your-mongodb-connection-string

# Firebase (for authentication)
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Cloudinary (blog/profile images)
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
  sourceKey: String,
  pageUrl: String,
  categoryPath: String,
  categoryDisplay: String,
  subcategoryPath?: String,
  subcategoryLabels?: String[],
  imageUrl: String,
  thumbUrl?: String,
  sourceUrl?: String,
  scrapedAt?: Date
}
```

### InventoryItem
```typescript
{
  userId: String,
  cardId: ObjectId,
  acquiredAt: Date,
  source: {
    type: 'quiz' | 'quest_streaming' | 'quest_quiz' | 'craft' | 'event' | 'daily_milestone' | 'weekly_milestone',
    sessionId?: ObjectId,
    questCode?: String
  }
}
```

### UserGameState
```typescript
{
  userId: String,
  dust: Number,
  xp: Number,
  level: Number,
  pity: {
    sinceEpic: Number,
    sinceLegendary: Number
  },
  streak: {
    dailyCount: Number,
    weeklyCount: Number,
    lastPlayAt: Date,
    lastDailyQuestCompletionAt: Date,
    lastWeeklyQuestCompletionAt: Date
  },
  limits: {
    quizStartsToday: Number,
    dateKey: String
  },
  badges: {
    lastDailyStreakMilestone: Number,
    lastWeeklyStreakMilestone: Number,
    dailyStreakMilestoneCount: Number,
    weeklyStreakMilestoneCount: Number
  }
}
```

## Best Practices

### For Players
- ✅ Complete daily quests for consistent Stardust income
- ✅ Focus on mastery for dust/XP milestones
- ✅ Save Stardust for specific cards you want
- ✅ Participate weekly for leaderboard rewards
- ✅ Aim for 5+ XP per quiz run to earn a card drop

### For Developers
- ✅ Validate quiz sessions before completion
- ✅ Implement rate limiting on quiz starts
- ✅ Cache photocard images for faster catalog loads
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
