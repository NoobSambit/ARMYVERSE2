# Game System (Boraverse)

## What It Is

Boraverse is a comprehensive BTS quiz and photocard collection game featuring:

- **Quiz System** - 10-question quizzes testing BTS knowledge
- **Photocard Collection** - Fandom gallery catalog with random drops
- **Crafting System** - Convert duplicates to Dust and craft specific cards
- **Mastery System** - Earn member/era XP with milestone rewards
- **Quest System** - Complete daily/weekly tasks for rewards
- **Leaderboard** - Multi-period competition with global rankings
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

### BoraRush (ARMY Ladder Rush)

**What it is:**

- External Snake & Ladder trivia game hosted separately (Netlify)
- Users earn Armyverse XP when they finish the board
- XP scales by how many turns the winning player takes to reach tile 100

**XP Tiers (Generous Curve):**

- 1–20 turns: 200 XP (speedrun)
- 21–30 turns: 170 XP (swift)
- 31–40 turns: 140 XP (steady)
- 41–50 turns: 115 XP (gritty)
- 51–60 turns: 95 XP (survivor)
- 61–80 turns: 80 XP (survivor)
- 81+ turns: 60 XP (finish)

**Security Model:**

- Armyverse issues a short-lived BoraRush handoff token
- BoraRush submits run results with that token to the XP award endpoint
- Armyverse verifies the handoff token and awards XP

**Photocard Reward:**

- Every completed Solo Run also grants a random photocard
- Duplicate cards convert into Dust (consistent with quiz rewards)

### Rarity (Deprecated)

Rarity tiers and pity tracking were part of the legacy photocard pipeline. The current catalog uses random drops from `fandom_gallery_images`, and rewards are stored with `rarity: "random"` for audit consistency.

### Crafting System

**Dust Economy:**

- Duplicate cards convert to Dust

**Crafting Options:**

1. **Craft Specific Card**: Spend Stardust to get exact card you want
   - Fixed 50 dust per craft

2. **Random Roll**: Spend dust for a random catalog card
   - Fixed 50 dust per roll

### Mastery System

**XP Progression:**

- Earn XP for each correctly answered quiz question (difficulty-weighted)
- Member/Era XP sourced from question metadata (not from reward cards)

**Mastery Tracks:**

- **Member Mastery**: Individual progress for each BTS member, plus **OT7** (OT7 requires 7× XP per level)
- **Era Mastery**: Progress for each album/era, derived dynamically from questions

**Milestone Rewards (XP + Dust + Badges):**

- Level 5: +50 XP, +25 Dust + Common badge
- Level 10: +100 XP, +75 Dust + Rare badge
- Level 25: +250 XP, +200 Dust + Rare badge
- Level 50: +500 XP, +400 Dust + Epic badge
- Level 100: +1500 XP, +1000 Dust + Legendary badge (member-specific for members, standard for eras)

**Badge System:**

- Unique badge codes: `mastery_{kind}_{key}_{milestone}`
- Standard milestone badges for all levels (display level number)
- Special member badges at level 100 (unique design per member + OT7)
- View all earned badges via `/api/game/mastery/badges`

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

**Overview:**
The leaderboard is a competitive ranking system that tracks player progress across multiple time periods. It features XP-based scoring, level tracking, and rank change indicators.

**Periods:**

- **Daily**: `daily-YYYY-MM-DD` - Resets at 00:00 UTC
- **Weekly**: `weekly-YYYY-WW` - ISO week format, resets Monday at 00:00 UTC
- **All-Time**: `alltime` - Never resets, cumulative lifetime XP

**Scoring:**

- Score is based on **total XP earned** during the period (not quiz completion count)
- XP is accumulated from quiz completions and quest completions
- Daily/Weekly scores start at 0 and accumulate during the period
- All-Time score represents total lifetime XP

**Leveling:**

- Player levels use a **progressive curve** (see `/lib/game/leveling.ts`)
- Level is calculated from total XP and displayed on the leaderboard
- Levels are updated in real-time as users earn XP

**Stats Tracked:**

- `quizzesPlayed` - Number of quizzes completed in the period
- `questionsCorrect` - Total correct answers in the period
- `totalQuestions` - Total questions answered in the period

**Rank System:**

- Ranks are calculated based on score (higher score = better rank)
- Rank changes are tracked to show movement (↑/↓ indicators)
- Previous rank is stored to enable rank change calculation

**Data Model:**

```typescript
interface ILeaderboardEntry {
  periodKey: string // "daily-2026-01-10", "weekly-2026-02", "alltime"
  userId: string
  score: number // Total XP for period (accumulated, not max)
  level: number // Player level
  stats: {
    quizzesPlayed: number
    questionsCorrect: number
    totalQuestions: number
  }
  previousRank?: number // Previous rank for change calculation
  rank?: number // Current rank
  displayName: string
  avatarUrl: string
  lastPlayedAt?: Date
  periodStart: Date
  periodEnd: Date
  updatedAt: Date
}
```

**API Endpoints:**

- `GET /api/game/leaderboard?period=daily|weekly|alltime&limit=20&cursor=xxx`
  - Returns paginated leaderboard entries
  - Includes current user's rank and stats
  - Supports cursor-based pagination

- `POST /api/game/leaderboard/refresh?period=daily|weekly|alltime`
  - Forces profile data refresh for current user
  - Creates entries if they don't exist (useful for all-time initialization)

**UI Features:**

- Podium display for top 3 players (1st/2nd/3rd place styling)
- Rank change indicators (↑3 ↓2 —0)
- Player level badges
- XP progress bar
- Performance stats (accuracy, quizzes played)
- Period selector (Daily/Weekly/All-Time)

**How Scores Are Added:**
When a quiz is completed in ranked mode:

1. XP is awarded to UserGameState
2. Daily, Weekly, and All-Time leaderboard entries are updated in parallel
3. Score is incremented by the XP earned (`$inc` operation)
4. Stats (quizzes played, correct answers, total questions) are incremented
5. Level is updated based on total XP
6. Profile data (displayName, avatarUrl) is synced

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
    M --> N[Update all-time/weekly/daily leaderboards]
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
    F --> G[Deduct 50 Stardust]
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
- `GET /api/game/mastery/badges`
- `GET /api/game/quests`
- `POST /api/game/quests/claim`
- `GET /api/game/badges`
- `GET /api/game/leaderboard?period=daily|weekly|alltime`
- `POST /api/game/leaderboard/refresh?period=daily|weekly|alltime`
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

### LeaderboardEntry

```typescript
{
  periodKey: String,          // "daily-YYYY-MM-DD", "weekly-YYYY-WW", "alltime"
  userId: String,
  score: Number,              // Total XP (accumulated)
  level: Number,              // Player level
  stats: {
    quizzesPlayed: Number,
    questionsCorrect: Number,
    totalQuestions: Number
  },
  previousRank?: Number,
  rank?: Number,
  displayName: String,
  avatarUrl: String,
  lastPlayedAt?: Date,
  periodStart: Date,
  periodEnd: Date,
  updatedAt: Date
}
```

## Best Practices

### For Players

- ✅ Complete daily quests for consistent Stardust income
- ✅ Focus on mastery for dust/XP milestones
- ✅ Save Stardust for specific cards you want
- ✅ Participate in all leaderboard periods for maximum visibility
- ✅ Aim for 5+ XP per quiz run to earn a card drop

### For Developers

- ✅ Validate quiz sessions before completion
- ✅ Implement rate limiting on quiz starts
- ✅ Cache photocard images for faster catalog loads
- ✅ Use TTL indexes for expired sessions
- ✅ Batch database updates for performance
- ✅ Use compound indexes for leaderboard queries

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
- [Leveling System](../features/leveling.md) - Player progression details
- [Mastery Badge System](../MASTERY_BADGE_SYSTEM.md) - Mastery badge rewards
- [Quest Badge System](../QUEST_BADGE_SYSTEM.md) - Quest badge rewards
