# Data Flow

How data flows through the ARMYVERSE system for key user journeys.

---

## 1. User Signup & Authentication

### Username/Password Signup

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ POST /api/auth/signup
     │ { username, password, email?, displayName? }
     ▼
┌──────────────────┐
│   Signup API     │
├──────────────────┤
│ 1. Validate input (Zod)
│ 2. Check username uniqueness
│ 3. Hash password (bcrypt)
│ 4. Create user in MongoDB
│ 5. Generate JWT token
│ 6. Return token + user
└────┬─────────────┘
     │ 201 Created
     │ { token, user }
     ▼
┌──────────┐
│  Client  │
├──────────┤
│ Store token in localStorage
│ Set auth context
│ Redirect to dashboard
└──────────┘
```

### Social Login (Firebase)

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ Firebase Auth SDK
     │ signInWithPopup(Google)
     ▼
┌──────────────┐
│   Firebase   │
└────┬─────────┘
     │ Firebase ID Token
     ▼
┌──────────┐
│  Client  │
└────┬─────┘
     │ Use token for API calls
     │ Authorization: Bearer <firebase-token>
     ▼
┌──────────────────┐
│    Any API       │
├──────────────────┤
│ 1. verifyAuth(request)
│ 2. Detect Firebase token
│ 3. Verify via Firebase Admin SDK
│ 4. Get/create user in MongoDB
│ 5. Proceed with request
└──────────────────┘
```

---

## 2. Quiz → Photocard Flow

### Complete User Journey

```
User clicks "Start Quiz"
     │
     ▼
┌─────────────────────────────┐
│  POST /api/game/quiz/start  │
├─────────────────────────────┤
│ 1. Authenticate user
│ 2. Check daily limit (50)
│ 3. Get 10 random questions from DB
│ 4. Create QuizSession (TTL 20min)
│ 5. Return questions (hide correctIndex)
└──────┬──────────────────────┘
       │ { sessionId, questions[], expiresAt }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ User answers 10 questions
│ Submit after completion
└──────┬───┘
       │ POST /api/game/quiz/complete
       │ { sessionId, answers: [1,0,2,...] }
       ▼
┌────────────────────────────────────┐
│  POST /api/game/quiz/complete API  │
├────────────────────────────────────┤
│ 1. Validate session exists & not expired
│ 2. Calculate score (compare answers)
│ 3. Delete session
│ 4. Get UserGameState
│ 5. Determine rarity based on score:
│    - 10/10: Higher legendary rate
│    - 7-9: Standard rates
│    - 5-6: Lower epic rate
│    - <5: Common only
│ 6. Check pity counters
│    - Guarantee epic+ at 15 pulls
│    - Guarantee legendary at 50
│ 7. Roll for photocard (weighted random)
│ 8. Check if duplicate exists
│    - If yes: award Stardust
│    - If no: add to inventory
│ 9. Award XP (5-20 per question)
│ 10. Update mastery progress
│     - Member XP if member question
│     - Era XP if era question
│ 11. Check mastery milestones
│ 12. Update quest progress
│     - Increment quiz quest count
│     - Check completion
│ 13. Update leaderboard
│     - If best score this week, update entry
│ 14. Save all to database (transaction)
└──────┬─────────────────────────────┘
       │ { score, newCard, xpAwarded,
       │   masteryUpdates, questProgress }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Show results animation
│ Display new photocard
│ Show XP/mastery gains
│ Show quest progress
│ Update user state
└──────────┘
```

---

## 3. Quest System Flow

### Daily Quest Generation (Cron)

```
Cron Trigger (00:00 UTC)
     │
     ▼
┌─────────────────────────────────┐
│  POST /api/cron/daily-quests    │
├─────────────────────────────────┤
│ 1. Authenticate with CRON_SECRET
│ 2. Expire previous day's quests
│    - Set active: false
│ 3. Generate 3 new daily quests:
│    a) Stream 5 songs quest
│       - SELECT 5 random BTS tracks
│       - Require 5 scrobbles each (25 total)
│       - Rewards: 50 dust, 20 XP
│    b) Stream 2 albums quest
│       - SELECT 2 random BTS albums
│       - Include all track lists
│       - Rewards: 75 dust, 30 XP
│    c) Complete 2 quizzes quest
│       - Counter-based
│       - Rewards: 30 dust, 15 XP
│ 4. Save QuestDefinitions to DB
│ 5. Set expiresAt: tomorrow 00:00 UTC
└──────┬────────────────────────────┘
       │ { questsGenerated: 3 }
       ▼
   (Quests now available)
```

### User Quest Completion

```
User streams music on Spotify
     │
     ▼
Last.fm scrobbles track
     │
     ▼
User clicks "Verify Streaming"
     │
     ▼
┌──────────────────────────────────────┐
│  POST /api/game/quests/verify-       │
│       streaming                      │
├──────────────────────────────────────┤
│ 1. Authenticate user
│ 2. Check Last.fm connection
│ 3. Fetch recent scrobbles (24h)
│ 4. Filter for BTS tracks (isBTSFamily)
│ 5. Get active streaming quests
│ 6. For each quest:
│    a) Song quest:
│       - Count scrobbles per target song
│       - Update progress
│    b) Album quest:
│       - Check if all album tracks scrobbled
│       - Update progress
│ 7. Save UserQuestProgress
│ 8. Check if any quests completed
│ 9. Return updated progress
└──────┬─────────────────────────────────┘
       │ { updated: [{ questCode, progress }] }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Show progress bars
│ Display completion status
└──────────┘

Quest Complete?
     │ YES
     ▼
User clicks "Claim Rewards"
     │
     ▼
┌─────────────────────────────────┐
│  POST /api/game/quests/claim    │
├─────────────────────────────────┤
│ 1. Authenticate user
│ 2. Validate quest completed
│ 3. Check not already claimed
│ 4. Award rewards:
│    - Add Stardust
│    - Add XP
│    - Roll photocard if applicable
│ 5. Check streak bonus
│    - Increment daily/weekly streak
│    - Award streak badge if milestone
│ 6. Mark quest as claimed
│ 7. Save to database
└──────┬────────────────────────────┘
       │ { rewards, badge?, newStreak }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Show rewards animation
│ Display new badge if earned
│ Update streak counter
└──────────┘
```

---

## 4. AI Playlist Generation

### Full Pipeline

```
User configures playlist
     │
     ▼
┌──────────┐
│  Client  │
└────┬─────┘
     │ POST /api/playlist/generate-enhanced
     │ {
     │   seedTracks: [id1, id2],
     │   genreMix: { "Hip-Hop": 40, "Dance-Pop": 60 },
     │   flowPattern: "slow-build",
     │   contextOptimization: "workout",
     │   playlistLength: 20,
     │   userPrompt: "High energy morning"
     │ }
     ▼
┌────────────────────────────────────┐
│  Playlist Generation API            │
├────────────────────────────────────┤
│ 1. Validate input
│ 2. Fetch seed tracks from DB
│ 3. Get audio features
│ 4. Build AI prompt:
│    - Seed track analysis
│    - Genre requirements
│    - Flow pattern instructions
│    - Context optimization
│    - User prompt
│ 5. Call Groq Llama 3.3 70B API
└──────┬───────────────────────────┘
       │ Prompt
       ▼
┌────────────────┐
│  Groq AI       │
├────────────────┤
│ - Analyze requirements
│ - Generate track suggestions
│ - Apply genre distribution
│ - Optimize flow pattern
│ - Return JSON with track IDs
└──────┬─────────┘
       │ AI Response
       │ { tracks: [ {id, reason}, ... ] }
       ▼
┌────────────────────────────────────┐
│  Post-Processing                    │
├────────────────────────────────────┤
│ 1. Validate track IDs exist in DB
│ 2. Fetch full track data
│ 3. Calculate playlist metrics:
│    - Average energy
│    - Total duration
│    - Genre distribution
│ 4. Create Playlist document
│ 5. Save to database (if authenticated)
│ 6. Add to user's history
└──────┬───────────────────────────┘
       │ { playlist, metadata }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Display playlist
│ Show track list with play buttons
│ Offer Spotify export
└──────────┘

User clicks "Export to Spotify"
     │
     ▼
┌─────────────────────────────────┐
│  POST /api/playlist/export      │
├─────────────────────────────────┤
│ 1. Authenticate user
│ 2. Check Spotify connection
│ 3. Get Spotify access token
│ 4. Create playlist via Spotify API
│ 5. Add tracks to playlist
│ 6. Update Playlist doc:
│    - spotifyPlaylistId
│    - exportedAt
│ 7. Return Spotify URL
└──────┬────────────────────────────┘
       │ { spotifyUrl }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Open Spotify app/web
└──────────┘
```

---

## 5. Blog Creation & Interaction

### Create Blog Post

```
User writes blog
     │
     ▼
┌──────────┐
│  Client  │
│ (Tiptap) │
├──────────┤
│ - Rich text editing
│ - Auto-save to localStorage
│ - Upload images to Cloudinary
│ - Set tags, moods, visibility
└────┬─────┘
     │ POST /api/blogs
     │ { title, content, coverImage,
     │   tags, moods, visibility }
     ▼
┌─────────────────────────────────┐
│  POST /api/blogs API            │
├─────────────────────────────────┤
│ 1. Authenticate user
│ 2. Validate input
│ 3. Sanitize HTML content
│ 4. Generate URL slug
│ 5. Calculate reading time
│ 6. Generate excerpt (first 160 chars)
│ 7. Create Blog document
│ 8. Save to MongoDB
└──────┬────────────────────────────┘
       │ { blog }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Redirect to blog view
│ Clear editor
└──────────┘
```

### View & Interact

```
User opens blog
     │
     ▼
┌─────────────────────┐
│  GET /api/blogs/[id]│
├─────────────────────┤
│ 1. Find blog by ID
│ 2. Increment view count
│ 3. Get author details
│ 4. Get comments
│ 5. Return blog data
└──────┬──────────────┘
       │ { blog }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Display blog content
│ Show reactions
│ Show comments
└──────────┘

User reacts (clicks ❤️)
     │
     ▼
┌──────────────────────────────────┐
│  POST /api/blogs/[id]/reactions  │
├──────────────────────────────────┤
│ 1. Authenticate user
│ 2. Update or create reaction
│ 3. Update reaction counts
│ 4. Save to blog.reactedBy map
└──────┬───────────────────────────┘
       │ { reaction, counts }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Update reaction button state
│ Animate reaction
└──────────┘

User comments
     │
     ▼
┌──────────────────────────────────┐
│  POST /api/blogs/[id]/comments   │
├──────────────────────────────────┤
│ 1. Authenticate user
│ 2. Validate comment content
│ 3. Add to blog.comments array
│ 4. Increment comment count
│ 5. Return new comment
└──────┬───────────────────────────┘
       │ { comment }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Add comment to list
│ Clear comment input
└──────────┘
```

---

## 6. Trending Data Pipeline

### Daily Analytics Update

```
Cron Schedule (01:00 UTC for Spotify)
     │
     ▼
┌──────────────────────────────────┐
│  POST /api/spotify/kworb/cron    │
├──────────────────────────────────┤
│ 1. Authenticate with CRON_SECRET
│ 2. Scrape kworb.net:
│    - Fetch HTML pages
│    - Parse tables
│    - Extract streaming data
│ 3. Process songs:
│    - Artist name
│    - Song title
│    - Total streams
│    - Daily streams
│    - Global rank
│ 4. Process albums (similar)
│ 5. Process artists (similar)
│ 6. Create KworbSnapshot:
│    - date: today
│    - songs: [...]
│    - albums: [...]
│    - artists: [...]
│ 7. Save to MongoDB
│ 8. Delete snapshots older than 30 days
└──────┬─────────────────────────────┘
       │ { snapshot }
       ▼
   (Data stored)

User visits /spotify page
     │
     ▼
┌──────────────────────────────────┐
│  GET /api/spotify/kworb/latest   │
├──────────────────────────────────┤
│ 1. Find latest snapshot by date
│ 2. Return with 24h cache header
└──────┬─────────────────────────────┘
       │ { snapshot }
       │ Cache-Control: max-age=86400
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Display analytics:
│ - Songs by artist (expandable)
│ - Albums by artist (expandable)
│ - Global rankings
│ - Monthly listeners
└──────────┘
```

---

## 7. Spotify Integration

### OAuth Connection Flow

```
User clicks "Connect Spotify"
     │
     ▼
┌──────────────────────────────┐
│  GET /api/spotify/auth-url   │
├──────────────────────────────┤
│ 1. Authenticate user
│ 2. Generate state parameter
│ 3. Build Spotify OAuth URL
│ 4. Store state in session
└──────┬───────────────────────┘
       │ { authUrl }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Redirect to Spotify
└──────┬───┘
       │
       ▼
┌────────────┐
│  Spotify   │
├────────────┤
│ User authorizes app
└──────┬─────┘
       │ Redirect to callback
       │ ?code=xxx&state=yyy
       ▼
┌──────────────────────────────────┐
│  GET /api/spotify/callback       │
├──────────────────────────────────┤
│ 1. Validate state parameter
│ 2. Exchange code for tokens
│ 3. Get user profile from Spotify
│ 4. Encrypt tokens
│ 5. Update User document:
│    - spotifyId
│    - spotifyTokens (encrypted)
│ 6. Redirect to frontend
└──────┬─────────────────────────────┘
       │ Redirect: /dashboard?spotify=connected
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Show success message
│ Update connection status
└──────────┘
```

---

## 8. Leaderboard Weekly Cycle

```
Monday 00:00 UTC (Cron)
     │
     ▼
┌─────────────────────────────────────┐
│  POST /api/cron/weekly-quests       │
│  (includes leaderboard refresh)     │
├─────────────────────────────────────┤
│ 1. Authenticate with CRON_SECRET
│ 2. Find last week's entries
│ 3. Calculate final ranks
│ 4. Distribute rewards:
│    - 1st: 3 legendary + 5000 dust + badge
│    - 2-10: 2 epic + 2000 dust + badge
│    - 11-50: 1 epic + 1000 dust + badge
│    - 51-100: 2 rare + 500 dust
│ 5. Award photocards to inventories
│ 6. Award Stardust
│ 7. Award badges
│ 8. Mark entries as rewards distributed
│ 9. Start new week (new weekStart)
└──────┬────────────────────────────────┘
       │ { rewardsDistributed: 100 }
       ▼
   (New week begins)

User completes quiz with high score
     │
     ▼
Quiz complete API (automatically):
│ 1. Check if score > current week entry
│ 2. If yes, update LeaderboardEntry
│ 3. If no entry, create new one
│
User views leaderboard
     │
     ▼
┌──────────────────────────────────┐
│  GET /api/game/leaderboard       │
├──────────────────────────────────┤
│ 1. Find current week entries
│ 2. Sort by score (desc)
│ 3. Limit to top 100
│ 4. Add ranks (1-100)
│ 5. If authenticated:
│    - Find user's rank
│    - Calculate percentile
│ 6. Return leaderboard + user rank
└──────┬─────────────────────────────┘
       │ { leaderboard, userRank }
       ▼
┌──────────┐
│  Client  │
├──────────┤
│ Display top 100
│ Highlight user's position
│ Show time until reset
└──────────┘
```

---

## Related Documentation

- [System Architecture](./overview.md)
- [Database Schema](./database.md)
- [API Overview](../api/overview.md)

---

**Last Updated**: January 2026
