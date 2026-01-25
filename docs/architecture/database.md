# Database Schema

Complete MongoDB database schema for ARMYVERSE.

---

## Collections Overview

| Collection | Purpose | Indexes | Relationships |
|------------|---------|---------|---------------|
| **users** | User accounts and profiles | username, email, firebaseUid | → many blogs, inventory, game state |
| **tracks** | BTS songs and audio features | spotifyId, isBTSFamily | → playlists |
| **albums** | BTS albums for quests | spotifyId, isBTSFamily | → quests |
| **playlists** | Generated playlists | userId | → tracks |
| **blogs** | Blog posts | slug, author, tags | → users, comments, reactions |
| **fandom_gallery_images** | Photocard catalog (Fandom scrape) | sourceKey, categoryPath, subcategoryPath | → inventory |
| **inventoryitems** | User photocard collection | userId, cardId | → users, fandom_gallery_images |
| **questions** | Quiz questions | hash, category | → quiz sessions |
| **quizsessions** | Active quiz sessions | userId, TTL | → users, questions |
| **usergamestate** | User game progress | userId | → users |
| **questdefinitions** | Available quests | code, active, type | → quest progress |
| **userquestprogress** | User quest progress | userId, questCode | → users, quests |
| **badges** | Badge definitions | code | → user badges |
| **userbadges** | Earned badges | userId, badgeCode | → users, badges |
| **masteryprogress** | Member/era XP | userId | → users |
| **masteryrewardledgers** | Mastery milestone claims | userId, kind, key, milestone | → users |
| **masterylevelrewardledgers** | Mastery level-up photocard awards | userId, kind, key, level | → users |
| **leaderboardentries** | Weekly rankings | userId, weekStart | → users |
| **droppools** | Legacy drop pools (unused) | active | → fandom_gallery_images |
| **kworbsnapshots** | Spotify analytics | date | (none) |
| **youtubekworbsnapshots** | YouTube analytics | date | (none) |
| **collections** | Playlist collections | userId | → playlists |
| **streamingcache** | Last.fm cache | userId | → users |
| **inventorygrantaudit** | Audit log | userId | → users |

---

## Core Models

### User

**Purpose**: User accounts with flexible authentication

**Schema:**
```typescript
{
  // Authentication
  username: string           // unique, lowercase, indexed
  email?: string             // optional, unique if provided, sparse index
  passwordHash?: string      // bcrypt hash for JWT auth
  firebaseUid?: string       // for Firebase auth, unique, sparse index

  // Profile
  displayName?: string
  photoURL?: string
  bannerURL?: string
  bio?: string

  // BTS Profile
  biasGroup?: string[]       // favorite members
  favoriteEra?: string
  armySince?: string

  // Connections
  spotifyId?: string
  spotifyTokens?: {
    accessToken: string      // encrypted
    refreshToken: string     // encrypted
    expiresAt: Date
  }
  lastfmUsername?: string
  lastfmApiKey?: string

  // Spotify BYO
  byoSpotify?: {
    clientId: string         // encrypted
    clientSecret: string     // encrypted
    refreshToken: string     // encrypted
  }

  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    showListeningHistory: boolean
  }

  // Metadata
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}
```

**Indexes:**
- `username` (unique)
- `email` (unique, sparse)
- `firebaseUid` (unique, sparse)
- `spotifyId` (sparse)

---

### Track

**Purpose**: BTS songs with audio features

**Schema:**
```typescript
{
  title: string
  artist: string
  album?: string
  duration: number           // seconds
  spotifyId: string          // unique
  isBTSFamily: boolean       // for quest filtering

  // Audio Features
  audioFeatures?: {
    energy: number           // 0-1
    valence: number          // 0-1
    danceability: number     // 0-1
    tempo: number            // BPM
    acousticness: number     // 0-1
    instrumentalness: number // 0-1
  }

  // Metadata
  releaseDate?: Date
  imageUrl?: string
  previewUrl?: string

  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `spotifyId` (unique)
- `isBTSFamily` (for quest queries)
- `artist`

---

### Album

**Purpose**: BTS albums for quest system

**Schema:**
```typescript
{
  name: string
  artist: string             // "BTS" or member name
  spotifyId: string          // unique
  isBTSFamily: boolean

  // Tracks
  tracks: [{
    title: string
    duration: number         // seconds
    spotifyId: string
    trackNumber: number
  }]

  totalTracks: number
  releaseDate: Date
  imageUrl: string

  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `spotifyId` (unique)
- `isBTSFamily`
- `artist`

---

### Playlist

**Purpose**: Generated playlists

**Schema:**
```typescript
{
  userId?: ObjectId          // optional for anonymous
  name: string
  description?: string

  // Tracks
  tracks: ObjectId[]         // references Track collection

  // Generation metadata
  generationParams?: {
    seedTracks: ObjectId[]
    genreMix: Record<string, number>
    flowPattern: string
    contextOptimization: string
    userPrompt?: string
  }

  // Spotify export
  spotifyPlaylistId?: string
  exportedAt?: Date

  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `userId`
- `spotifyPlaylistId`

---

### Blog

**Purpose**: User-created blog posts

**Schema:**
```typescript
{
  title: string
  slug: string               // unique, URL-friendly
  content: string            // HTML content
  excerpt: string

  // Author
  author: ObjectId           // references User

  // Media
  coverImage?: string

  // Categorization
  tags: string[]
  moods: string[]            // nostalgic, happy, excited, etc.
  type: string               // review, analysis, story, etc.
  language: string           // en, ko, ja, etc.

  // SEO
  seoTitle?: string
  seoDescription?: string

  // Metrics
  readTime: number           // minutes
  views: number
  reactions: {
    loved: number
    moved: number
    surprised: number
  }

  // User interactions
  savedBy: ObjectId[]        // user IDs who bookmarked
  reactedBy: Map<ObjectId, 'loved'|'moved'|'surprised'>

  // Comments
  comments: [{
    id: ObjectId
    author: ObjectId
    content: string
    createdAt: Date
    updatedAt: Date
  }]

  // Status
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'private' | 'unlisted'
  deletedAt?: Date           // soft delete

  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `slug` (unique)
- `author`
- `tags`
- `moods`
- `status`
- `publishedAt` (descending)
- Text index on `title`, `content`, `tags`

---

## Game System Models

### Photocard

**Purpose**: Photocard catalog entries (from Fandom galleries)
**Collection**: `fandom_gallery_images`

**Schema:**
```typescript
{
  sourceKey: string          // unique, stable key for upserts
  pageUrl: string            // gallery page URL
  pageTitle?: string
  pageSlug?: string
  pageDisplay?: string
  pathSegments?: string[]

  categoryPath: string       // e.g., D-DAY/Gallery
  categoryDisplay: string    // e.g., D-DAY
  subcategoryPath?: string   // e.g., Promo_Pictures
  subcategoryLabels?: string[] // readable labels

  tabPath?: string[]
  tabLabels?: string[]
  headingPath?: string[]
  headingLabels?: string[]
  anchor?: string | null

  imageUrl: string           // full-size image URL
  thumbUrl?: string          // thumbnail URL
  sourceUrl?: string         // page URL with anchor
  filePageUrl?: string
  imageKey?: string
  imageName?: string
  caption?: string

  scrapedAt?: Date
  createdAt: Date
}
```

**Indexes:**
- `sourceKey` (unique)
- `categoryPath`
- `subcategoryPath`

---

### InventoryItem

**Purpose**: User's photocard collection

**Schema:**
```typescript
{
  userId: string
  cardId: ObjectId           // references Photocard (fandom_gallery_images)
  acquiredAt: Date

  source: {
    type: 'quiz' | 'quest_streaming' | 'quest_quiz' | 'craft' | 'event' | 'mastery_level' | 'daily_completion' | 'weekly_completion' | 'daily_milestone' | 'weekly_milestone' | 'borarush'
    sessionId?: ObjectId
    questCode?: string
    totalStreak?: number
    milestoneNumber?: number
    masteryKind?: 'member' | 'era'
    masteryKey?: string
    masteryLevel?: number
  }
}
```

**Indexes:**
- `userId`
- `cardId`
- Compound: `[userId, cardId]`
- `acquiredAt` (descending)

---

### UserGameState

**Purpose**: User's game progress and currency

**Schema:**
```typescript
{
  userId: string             // unique

  // Currency & XP
  dust: number
  xp: number
  level: number

  // Legacy pity counters (random drops now)
  pity: {
    sinceEpic: number
    sinceLegendary: number
  }

  // Quest streaks
  streak: {
    dailyCount: number
    weeklyCount: number
    lastPlayAt: Date | null
    lastDailyQuestCompletionAt: Date | null
    lastWeeklyQuestCompletionAt: Date | null
  }

  // Quiz limits
  limits: {
    quizStartsToday: number
    dateKey: string
  }

  // Badge milestones
  badges: {
    lastDailyStreakMilestone: number
    lastWeeklyStreakMilestone: number
    dailyStreakMilestoneCount: number
    weeklyStreakMilestoneCount: number
  }
}
```

**Indexes:**
- `userId` (unique)

---

### Question

**Purpose**: Quiz questions

**Schema:**
```typescript
{
  question: string
  options: string[]          // 4 options
  correctIndex: number       // 0-3

  // Categorization
  category: string           // history, discography, members, etc.
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]

  // Deduplication
  hash: string               // unique, for import

  createdAt: Date
}
```

**Indexes:**
- `hash` (unique)
- `category`
- `difficulty`

---

### QuizSession

**Purpose**: Active quiz sessions (TTL collection)

**Schema:**
```typescript
{
  userId: ObjectId

  questions: [{
    questionId: ObjectId
    correctIndex: number     // stored for validation
  }]

  // Expiration
  expiresAt: Date            // TTL index, auto-delete after 20 min

  createdAt: Date
}
```

**Indexes:**
- `userId`
- `expiresAt` (TTL index, expireAfterSeconds: 0)

---

### QuestDefinition

**Purpose**: Available quests

**Schema:**
```typescript
{
  code: string
  title: string
  period: 'daily' | 'weekly'
  goalType: string
  goalValue: number

  streamingMeta?: {
    trackTargets?: [{
      trackName: string
      artistName: string
      count: number
    }]
    albumTargets?: [{
      albumName: string
      trackCount: number
      tracks?: [{ name: string; artist: string }]
    }]
  }

  reward: {
    dust: number
    xp?: number
    ticket?: { enabled?: boolean }
    badgeId?: ObjectId
  }

  active: boolean
}
```

**Indexes:**
- `code` (unique)

---

### UserQuestProgress

**Purpose**: User progress on quests

**Schema:**
```typescript
{
  userId: string
  code: string               // QuestDefinition code
  periodKey: string          // daily YYYY-MM-DD or weekly key
  progress: number
  completed: boolean
  claimed: boolean

  streamingBaseline?: {
    tracks: [{ trackName: string; artistName: string; initialCount: number }]
    timestamp: Date
  }

  trackProgress: Map<string, number>
  updatedAt: Date
}
```

**Indexes:**
- Compound: `[userId, code, periodKey]` (unique)

---

### Badge

**Purpose**: Badge definitions

**Schema:**
```typescript
{
  code: string               // unique, e.g. daily_completion
  name: string
  description: string
  icon: string               // emoji or URL
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

**Indexes:**
- `code` (unique)
- `type`
- `active`

---

### UserBadge

**Purpose**: Earned badges

**Schema:**
```typescript
{
  userId: string
  badgeId: ObjectId          // references Badge
  earnedAt: Date
  metadata?: {
    streakCount?: number
    questCode?: string
  }
}
```

**Indexes:**
- Compound: `[userId, badgeId]` (unique)
- `userId`
- `earnedAt` (descending)

---

### MasteryProgress

**Purpose**: Member/era XP progression

**Schema:**
```typescript
{
  userId: string
  kind: 'member' | 'era'
  key: string              // member name or era name (includes OT7)
  xp: number
  level: number            // legacy claimed milestone marker
  claimedMilestones: number[]
  lastUpdatedAt: Date
}
```

**Indexes:**
- Compound: `[userId, kind, key]` (unique)

---

### MasteryRewardLedger

**Purpose**: Audit log for mastery milestone claims and badges

**Schema:**
```typescript
{
  userId: string
  kind: 'member' | 'era'
  key: string
  milestone: number
  rewards: { xp: number; dust: number }
  badgeCode: string
  badgeRarity: 'common' | 'rare' | 'epic' | 'legendary'
  extraBadges?: Array<{ code: string; rarity: 'common' | 'rare' | 'epic' | 'legendary' }>
  source: string
  createdAt: Date
}
```

**Indexes:**
- Compound: `[userId, kind, key, milestone]` (unique)
- `[userId, badgeCode]`

---

### MasteryLevelRewardLedger

**Purpose**: Audit log for mastery level-up photocard rewards

**Schema:**
```typescript
{
  userId: string
  kind: 'member' | 'era'
  key: string
  level: number
  cardId?: ObjectId
  awardedAt: Date
}
```

**Indexes:**
- Compound: `[userId, kind, key, level]` (unique)
- `[userId, awardedAt]`

---

### LeaderboardEntry

**Purpose**: Weekly leaderboard rankings

**Schema:**
```typescript
{
  periodKey: string
  userId: string
  score: number
  displayName: string
  avatarUrl: string
  updatedAt: Date
}
```

**Indexes:**
- Compound: `[periodKey, userId]` (unique)
- Compound: `[periodKey, score desc]`

---

### DropPool

**Purpose**: Legacy drop pool configuration (not used in random catalog drops)

**Schema:**
```typescript
{
  slug: string
  name: string
  window: {
    start: Date
    end: Date
  }
  weights: {
    common: number
    rare: number
    epic: number
    legendary: number
  }
  featured: {
    rarityBoost: {
      epic: number
      legendary: number
    }
    set?: string
    members?: string[]
  }
  active: boolean
}
```

**Indexes:**
- `slug` (unique)
- Compound: `[window.start, window.end, active]`

---

## Analytics Models

### KworbSnapshot

**Purpose**: Daily Spotify analytics

**Schema:**
```typescript
{
  date: Date                 // unique

  songs: [{
    artist: string
    title: string
    totalStreams: number
    dailyStreams: number
    globalRank: number
    change: number
  }]

  albums: [{
    artist: string
    name: string
    totalStreams: number
    dailyStreams: number
  }]

  artists: [{
    name: string
    monthlyListeners: number
    allTimeRank: number
  }]

  createdAt: Date
}
```

**Indexes:**
- `date` (unique)

---

### YouTubeKworbSnapshot

**Purpose**: Daily YouTube analytics

**Schema:**
```typescript
{
  date: Date                 // unique

  videos: [{
    title: string
    channelName: string
    totalViews: number
    dailyViews: number
    thumbnail: string
    youtubeUrl: string
  }]

  createdAt: Date
}
```

**Indexes:**
- `date` (unique)

---

### StreamingCache

**Purpose**: Last.fm scrobble cache

**Schema:**
```typescript
{
  userId: ObjectId

  recentTracks: [{
    title: string
    artist: string
    album: string
    timestamp: Date
    scrobbleId: string
  }]

  lastFetched: Date

  updatedAt: Date
}
```

**Indexes:**
- `userId` (unique)
- `lastFetched`

---

## Audit & Logging

### InventoryGrantAudit

**Purpose**: Audit log for photocard grants

**Schema:**
```typescript
{
  userId: string
  sessionId?: ObjectId
  cardId: ObjectId
  rarity: string            // currently "random"
  seed: string
  poolSlug: string
  reason: 'quiz' | 'craft' | 'quest' | 'admin'
  anomaly: boolean
  xp?: number
  createdAt: Date
}
```

**Indexes:**
- `userId`
- `createdAt` (descending)

---

## Database Optimization

### Indexes Summary

**Critical Indexes** (for fast queries):
- User lookups: `username`, `email`, `firebaseUid`
- Game queries: `userId` on all user-related collections
- Quest system: `[userId, code, periodKey]`, `code`
- Leaderboard: `[periodKey, score desc]`
- Blog discovery: `tags`, `publishedAt`, text search

**TTL Indexes** (auto-cleanup):
- QuizSession: `expiresAt` (expires after 20 minutes)

**Sparse Indexes** (for optional fields):
- `email` (many users may not have email)
- `firebaseUid` (only for social auth users)
- `spotifyId` (only for connected users)

### Query Patterns

**Most Common Queries:**
1. Get user by username/email (auth)
2. Get game state by userId
3. Get active quests
4. Get user inventory with pagination
5. Get latest snapshots (trending)
6. Get blog posts with filters

**Optimization Strategies:**
- Denormalize displayName in LeaderboardEntry (avoid join)
- Cache trending data (24h)
- Pagination for large lists
- Text search index for blogs
- Compound indexes for common filters

---

## Data Relationships

```
User ─┬─→ Many Blogs
      ├─→ Many InventoryItems
      ├─→ One UserGameState
      ├─→ Many UserQuestProgress
      ├─→ Many UserBadges
      ├─→ One MasteryProgress
      ├─→ Many LeaderboardEntries
      └─→ Many Playlists

Blog ─→ Many Comments (embedded)
     └─→ Author (User)

InventoryItem ─→ Photocard

QuestDefinition ←─ Many UserQuestProgress

Badge ←─ Many UserBadges

Playlist ─→ Many Tracks
```

---

## Related Documentation

- [System Architecture](./overview.md)
- [Data Flow](./data-flow.md)
- [API Overview](../api/overview.md)

---

**Last Updated**: January 2026
