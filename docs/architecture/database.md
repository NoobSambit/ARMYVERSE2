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
| **photocards** | Photocard templates | rarity, member, era | → inventory |
| **inventoryitems** | User photocard collection | userId, photocardId | → users, photocards |
| **questions** | Quiz questions | hash, category | → quiz sessions |
| **quizsessions** | Active quiz sessions | userId, TTL | → users, questions |
| **usergamestate** | User game progress | userId | → users |
| **questdefinitions** | Available quests | code, active, type | → quest progress |
| **userquestprogress** | User quest progress | userId, questCode | → users, quests |
| **badges** | Badge definitions | code | → user badges |
| **userbadges** | Earned badges | userId, badgeCode | → users, badges |
| **masteryprogress** | Member/era XP | userId | → users |
| **leaderboardentries** | Weekly rankings | userId, weekStart | → users |
| **droppools** | Card drop pools | active | → photocards |
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

**Purpose**: Photocard templates

**Schema:**
```typescript
{
  member: string             // Jungkook, Jimin, V, etc.
  era: string                // Love Yourself, Map of the Soul, etc.
  set: string                // set name within era
  rarity: 'common' | 'rare' | 'epic' | 'legendary'

  // Cloudinary
  publicId: string           // unique
  imageUrl: string

  // Drop configuration
  dropWeight?: number        // for weighted random selection

  createdAt: Date
}
```

**Indexes:**
- `publicId` (unique)
- `rarity`
- `member`
- `era`

---

### InventoryItem

**Purpose**: User's photocard collection

**Schema:**
```typescript
{
  userId: ObjectId
  photocard: ObjectId        // references Photocard

  // Acquisition
  source: 'quiz' | 'craft' | 'mastery' | 'quest' | 'leaderboard'
  acquiredAt: Date

  // Metadata
  duplicate: boolean         // was this a duplicate when received
  stardustAwarded?: number   // if duplicate
}
```

**Indexes:**
- `userId`
- `photocard`
- Compound: `[userId, photocard]`
- `acquiredAt` (descending)

---

### UserGameState

**Purpose**: User's game progress and currency

**Schema:**
```typescript
{
  userId: ObjectId           // unique

  // Currency
  stardust: number           // crafting currency
  tickets: number            // premium pulls

  // Pity system
  pityCounters: {
    standard: number         // pulls since last epic+
    legendary: number        // pulls since last legendary
  }

  // Quiz limits
  dailyQuizCount: number
  weeklyRankedQuizCount: number
  lastQuizDate: Date
  lastRankedQuizReset: Date

  // Quest streaks
  dailyQuestStreak: number
  weeklyQuestStreak: number
  lastDailyQuestComplete: Date
  lastWeeklyQuestComplete: Date

  createdAt: Date
  updatedAt: Date
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
  code: string               // unique, e.g. daily_stream_songs_20260106
  title: string
  description: string

  // Type
  type: 'daily' | 'weekly'
  category: 'streaming' | 'quiz' | 'collection'

  // Requirements
  total: number              // target count

  // Streaming quests
  metadata?: {
    targetSongs?: [{
      title: string
      artist: string
      spotifyId: string
    }]
    targetAlbums?: [{
      name: string
      artist: string
      spotifyId: string
      tracks: [{ title, duration }]
      totalTracks: number
    }]
    playCount?: number       // required scrobbles per song
  }

  // Rewards
  rewards: {
    stardust?: number
    tickets?: number
    xp?: number
    photocard?: {
      rarity: string
    }
  }

  // Status
  active: boolean
  expiresAt: Date

  createdAt: Date
}
```

**Indexes:**
- `code` (unique)
- `active`
- `type`
- `expiresAt`

---

### UserQuestProgress

**Purpose**: User progress on quests

**Schema:**
```typescript
{
  userId: ObjectId
  questCode: string          // references QuestDefinition

  progress: number           // current count
  completed: boolean
  completedAt?: Date
  claimed: boolean
  claimedAt?: Date

  // Streaming verification
  lastVerified?: Date
  scrobbleIds?: string[]     // Last.fm scrobble IDs

  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- Compound: `[userId, questCode]` (unique)
- `userId`
- `completed`

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

  // Tiers
  maxTier: number           // e.g. 10 for cycling badges

  // Type
  category: 'quest' | 'mastery' | 'collection' | 'achievement'

  // Rewards per tier
  rewards: Map<number, {
    stardust?: number
    photocard?: { rarity: string }
  }>

  createdAt: Date
}
```

**Indexes:**
- `code` (unique)
- `category`

---

### UserBadge

**Purpose**: Earned badges

**Schema:**
```typescript
{
  userId: ObjectId
  badgeCode: string          // references Badge
  tier: number              // current tier

  awardedAt: Date
  updatedAt: Date            // when tier increased
}
```

**Indexes:**
- Compound: `[userId, badgeCode]` (unique)
- `userId`

---

### MasteryProgress

**Purpose**: Member/era XP progression

**Schema:**
```typescript
{
  userId: ObjectId           // unique

  // Member mastery
  members: Map<string, {
    xp: number
    level: number
    lastClaimed: number      // last claimed milestone
  }>

  // Era mastery
  eras: Map<string, {
    xp: number
    level: number
    lastClaimed: number
  }>

  updatedAt: Date
}
```

**Indexes:**
- `userId` (unique)

---

### LeaderboardEntry

**Purpose**: Weekly leaderboard rankings

**Schema:**
```typescript
{
  userId: ObjectId
  username: string           // denormalized for performance
  score: number

  // Week identification
  weekStart: Date            // Monday 00:00 UTC
  weekEnd: Date

  // Completion details
  completedAt: Date
  rank?: number              // computed during refresh

  // Rewards
  rewardsDistributed: boolean
  rewards?: {
    stardust?: number
    photocards?: ObjectId[]
    badge?: string
  }

  createdAt: Date
}
```

**Indexes:**
- Compound: `[weekStart, score desc]`
- Compound: `[userId, weekStart]` (unique)
- `weekStart`

---

### DropPool

**Purpose**: Active card drop configurations

**Schema:**
```typescript
{
  name: string
  active: boolean

  // Card weights
  cards: [{
    photocardId: ObjectId
    weight: number           // relative probability
    featured: boolean        // featured boost
  }]

  // Season
  startDate: Date
  endDate: Date

  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `active`
- `startDate`, `endDate`

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
  userId: ObjectId
  photocardId: ObjectId
  source: string
  duplicate: boolean
  stardustAwarded: number

  // Context
  sessionId?: ObjectId       // if from quiz
  questCode?: string         // if from quest
  craftDetails?: object

  timestamp: Date
}
```

**Indexes:**
- `userId`
- `timestamp` (descending)

---

## Database Optimization

### Indexes Summary

**Critical Indexes** (for fast queries):
- User lookups: `username`, `email`, `firebaseUid`
- Game queries: `userId` on all user-related collections
- Quest system: `[userId, questCode]`, `active`
- Leaderboard: `[weekStart, score desc]`
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
- Denormalize username in LeaderboardEntry (avoid join)
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
