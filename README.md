# ARMYVERSE - BTS Fan Platform

> 📚 **[Complete Documentation Available](./docs/README.md)** - Comprehensive guides for all features, setup instructions, API references, and architecture details are organized in the `/docs` folder.

A comprehensive platform for BTS fans to discover music, create playlists, explore trending content, play games, and connect with the ARMY community.

## 🚀 Quick Start

1. **Environment Setup**: Copy `.env.local.example` to `.env.local` and fill in your credentials
2. **Installation**: `npm install`
3. **Development**: `npm run dev`
4. **Production Build**: `npm run build && npm run start`

**New to the project?** See the [Quick Start Guide](./docs/QUICK_START.md) for detailed setup instructions.

---

## ✨ Features

### 🎵 Music & Playlists

#### **AI Playlist Generation** (Groq Llama 3.3 70B)
- **15+ Input Parameters**: Prompt, type, length (5-50 tracks), moods, member bias, era selection
- **Seed Track Selection**: 1-5 reference tracks from 1000+ BTS track database
- **Audio Features Control**: Danceability, valence, energy (0-100 sliders)
- **6-Genre Mixing Engine**: Ballad, Hip-Hop, EDM, R&B, Rock, Dance-Pop with percentage distribution
- **Flow Pattern System**: 4 progression types
  - Slow-build (low → high energy)
  - Wave (alternating energy)
  - Consistent (steady energy)
  - Cool-down (high → low energy)
- **Context Optimization**: Workout, study, party, sleep, commute-specific generation
- **Sophisticated AI Prompting**: 400+ line prompt with artist attribution rules and BTS discography verification
- **Smart Matching**: Database lookup with fuzzy matching + Spotify API fallback
- **Template Gallery**: Pre-configured playlists for quick generation
- **Personality Quiz**: Generate playlists based on user preferences
- **Config Save/Load**: Reuse favorite settings
- **Playlist Evolution**: Refine and improve existing playlists
- **Comparison View**: Compare multiple generated playlists

#### **Manual Playlist Creation**
- Hand-pick tracks from database with search
- Drag-and-drop track ordering
- Live audio preview samples
- Visual track management interface

#### **Spotify Integration**
- **OAuth + BYO Credentials**: Dual authentication support
- **Token Encryption**: AES-256-GCM with user-specific keys
- **Playlist Export**: One-click export to Spotify
- **Track Matching**: Automatic Spotify ID resolution
- **User Library Sync**: Integration with user's Spotify account

### 📊 Analytics & Insights

#### **Music Stats Dashboard** (`/stats`)
**Design**: Glassmorphic bento grid with Tailwind container queries & Framer Motion animations

**Data Sources**:
- Last.fm API with rate limiting (token bucket algorithm: 5 req/sec)
- Stats.fm API (alternative provider)
- 15-minute cache system for performance

**Features**:
- **No Authentication Required**: Username-based access to public profiles
- **BTS Member Analysis**: Detailed breakdown by all 7 members (RM, Jin, Suga/Agust D, J-Hope, Jimin, V, Jungkook)
  - Play counts per member with percentage distribution
  - Visual radar charts and progress bars
  - Solo track vs group track detection
- **Timeline Visualization**: Listening journey over time with date-based grouping
- **Top Artists & Tracks**: Ranked lists with play counts, album art, and Spotify links
- **Recent Activity**: Real-time listening history with "now playing" indicators
- **User Profile Card**: Avatar, total scrobbles, account age, listening time estimates
- **Responsive Bento Grid**: Mobile (1 col) → Tablet (2 col) → Desktop (12 col grid)
- **Glassmorphic UI**: Backdrop blur, gradient accents (#330df2, #7b1fa2), transparent panels

#### **Spotify Global Analytics** (`/spotify`)
**Data Source**: Daily Kworb.net scraping with Cheerio web scraper

**Automated Data Collection** (Daily Cron at 1:30 AM UTC):
- Scrapes 9 BTS-related pages (group + 8 members)
- Fetches streaming data: songs, albums, global daily 200
- Enriches with Spotify metadata: album art, follower counts
- Stores historical snapshots in MongoDB

**Features**:
- **Songs by Artist**: All BTS members + group with total streams, daily gains
- **Albums by Artist**: Discography overview with stream counts
- **Global Daily Top 200**: BTS tracks in worldwide top 200
- **All-Time Artist Ranks**: BTS member rankings globally
- **Monthly Listeners**: Current listener counts with daily changes
- **Historical Comparison**: Compare snapshots across dates for trend analysis
- **35+ BTS Albums Tracked**: Full group + solo member discography

### 🎮 Boraverse Game System

#### **Quiz System**
**Core Mechanics**:
- **10 Random Questions** per session from database of 1000+ questions
- **Multiple Categories**: History, discography, members, lyrics, variety
- **Difficulty Levels**: Easy (1 XP), Medium (2 XP), Hard (3 XP)
- **20-Minute Timer**: Session expires with TTL index auto-cleanup
- **Performance-Based Rewards**: XP score gates photocard drops (random catalog)

**XP → Reward Gate**:
- 0-4 XP: No card reward
- 5+ XP: Random photocard from the catalog

**Daily Limits**: 2 free quizzes/day, resets at midnight UTC

**Quest Integration**: 2 quizzes/day + 10 quizzes/week count toward quests

#### **Photocard Collection System**
**Fandom Gallery Catalog**:
- Thousands of BTS gallery cards ingested from Fandom galleries
- Category + subcategory structure derived from page tabs and anchors
- Inventory filters by category, subcategory, source, and search

**Rewards & Sources**:
- Quiz drops are XP-gated (no card below 5 XP)
- Drops are random across the catalog (rarity is stored as `random` for auditing)
- Sources tracked: quiz, quests, crafting, events, streak milestones

**Collection View**:
- Dedicated collection tab with missing-card placeholders
- Per-subcategory progress and completion percentages

#### **Crafting System**
**Dust Economy**:
- **Earn Dust**: Quests, mastery milestones, duplicate conversions
- **Spend Dust**: Craft a specific card by ID or roll a random card

**Crafting Options**:
1. **Specific Card Crafting**: Pay dust to receive the exact card
2. **Random Roll**: Spend dust for a random catalog card

**Duplicate Management**: Convert duplicates to dust for crafting

#### **Mastery System**
**Progression Types**:
- **Member Mastery**: Individual tracking for all 7 members + OT7 (harder progression)
- **Era Mastery**: Progress for each BTS era (dynamic from question metadata)

**XP System**:
- **Level Formula**: `level = floor(xp / 100)` (OT7 uses 7× XP per level)
- **XP Sources**: Quiz completions (members/eras derived from correctly answered questions)
- **Milestone Rewards**: XP + Dust at levels 5/10/25/50/100

**Tracking**: MasteryProgress model (userId + kind + key), mastery rewards ledger for claims

#### **Quest & Badge System**

**Quest Types** (Generated by Daily/Weekly Cron Jobs):

**1. Song Streaming Quests**:
- **Daily**: Stream 5 specific BTS songs, 5 times each (25 total streams)
- **Weekly**: Stream 40 specific BTS songs, 5 times each (200 total streams)
- **Selection**: Deterministic random based on date seed (same for all users)
- **Verification**: Last.fm API with fuzzy track matching

**2. Album Streaming Quests**:
- **Daily**: Stream 2 complete BTS albums (all tracks required)
- **Weekly**: Stream 10 complete BTS albums
- **Smart Detection**: Requires streaming ALL tracks in album
- **35 BTS Albums**: Full group + solo member discography
- **Album Data**: Fetched from Spotify API with complete track lists

**3. Quiz Quests**:
- **Daily**: Complete 2 quizzes
- **Weekly**: Complete 10 quizzes
- **Auto-Tracking**: Progress updated on quiz completion

**Last.fm Integration** (Real-Time Streaming Verification):
- **Token Bucket Rate Limiting**: 5 requests/second, 5-minute window
- **15-Minute Caching**: StreamingCache model for performance
- **Fuzzy Track Matching**: Normalizes names, removes feat./remix markers
- **Baseline Tracking**: Progress calculated from quest start time (midnight UTC)
- **Album Completion**: Verifies ALL tracks streamed for album quests

**Badge System** (34 Collectible Badges):
- **Cycling Badges (10)**: Daily streak badges 1-10
- **Milestone Badges (5)**: 10/20/30/40/50 day streaks
- **Quest Completion Badges**: First daily/weekly completions
- **Achievement Badges**: Special milestones
- **Badge Criteria**: Defined in Badge model (streakDays, streakWeeks, questPeriod, threshold)

**Rewards**:
- **Dust**: 50-500 per quest (in-game currency)
- **XP**: 10-100 per quest (leveling system)
- **Photocards**: Rare+ tickets for weekly quests
- **Badges**: Streak and achievement unlocks

**UI Features**:
- Filter quests by Daily/Weekly/Completed status
- Real-time progress tracking with metadata
- Streaming connection modal for Last.fm setup
- Badge rewards modal with animations

#### **Leaderboard System**
**Multi-Period Competition:**
- **Daily**: Resets at 00:00 UTC (`daily-YYYY-MM-DD`)
- **Weekly**: ISO week, resets Monday at 00:00 UTC (`weekly-YYYY-WW`)
- **All-Time**: Never resets, cumulative lifetime XP (`alltime`)

**Scoring:**
- Score = Total XP earned during the period (accumulated, not max)
- XP sources: Quiz completions, quest completions
- Higher score = better rank

**Features:**
- XP-based scoring with progressive leveling curve
- Rank change indicators (↑/↓/—)
- Player level display
- Stats tracking: quizzes played, correct answers, total questions
- Cursor-based pagination
- Top 3 podium display
- Profile data sync (displayName, avatarUrl)

#### **Sharing System**
**Share Links**:
- Generate shareable photocard links to the original gallery page
- Preserve category + subcategory context

### 📝 Blog Platform

#### **Rich Text Editor** (Tiptap with 20+ Extensions)
**Core Extensions**:
- **Text Formatting**: Bold, italic, underline, strike, code, superscript, subscript
- **Headings**: H1-H6 with anchor links
- **Lists**: Bullet lists, ordered lists, task lists with checkboxes
- **Links**: Auto-linking, custom URLs with titles
- **Images**: Upload to Cloudinary with captions
- **Tables**: Full table support with cell merging
- **Code Blocks**: Syntax highlighting (lowlight) for 100+ languages
- **Mentions**: @user mentions with autocomplete
- **Emojis**: Emoji picker with search
- **YouTube**: Embed videos with iframe
- **Alignment**: Text align left/center/right/justify
- **Color**: Text color & highlight color pickers
- **Typography**: Smart quotes, em dashes, ellipses

**Editor Features**:
- **Bubble Menu**: Context-aware formatting toolbar
- **Floating Menu**: Block-level insertions (table, image, code)
- **Placeholder Text**: Helpful prompts for empty sections
- **Character/Word Count**: Real-time statistics
- **Auto-Save**: Draft mode with periodic saves
- **Preview Mode**: Live preview before publishing

#### **Content Management**
**Blog Fields**:
- Title, content (Tiptap JSON), tags[], mood
- Cover image (Cloudinary upload)
- Visibility: public/unlisted/private
- Read time: Auto-calculated (200 words/min formula)
- Author metadata: id, name, avatar

**Collections**:
- Group related posts with custom slug
- Cover image, description
- Visibility settings
- Post references (ObjectId array)

**Engagement System**:
- **Reactions**: Moved (💜), Loved (❤️), Surprised (😮) with counts
- **Comments**: Nested threading support
- **Saves**: Bookmark posts for later
- **Views**: Track engagement metrics

**Filtering & Search** (MongoDB Text Index):
- **Tag Filtering**: Multi-select tag filters
- **Mood Filtering**: Mood-based browsing
- **Author Filtering**: By author name
- **Text Search**: Full-text search on title/content
- **Date Range**: Filter by publication date
- **Sort Options**: Newest, popular, trending algorithms

**SEO Features**:
- Meta descriptions
- Open Graph tags for social sharing
- Twitter cards
- Auto-generated sitemap (next-sitemap)

**Soft Deletion**:
- isDeleted flag + deletedAt timestamp
- Restore capability via API
- Excludes from public listings

### 🔥 Trending Content

#### **Spotify Trending**
**Data Source**: Daily Kworb.net scraping (Cheerio-based)
- **Cron Schedule**: Daily at configured time
- **Pages Scraped**: BTS + 8 members (RM, Jin, Suga/Agust D, J-Hope, Jimin, V, Jungkook)
- **Metrics Tracked**: Total streams, daily gains, track count per artist
- **Enrichment**: Spotify metadata (album art, follower counts via oEmbed API)
- **Storage**: KworbSnapshot model with historical data

**Features**:
- Top BTS songs by daily streams
- All-time streaming rankings
- Monthly listener counts
- Member-specific filtering

#### **YouTube Trending**
**Data Source**: Daily Kworb.net scraping
- **Cron Schedule**: Daily automated scraping
- **Member Filtering**: Keyword matching for all 7 members + group
- **Metrics**: View counts, yesterday gains, published dates
- **Storage**: YouTubeKworbSnapshot model

**Features**:
- Top BTS videos by daily views
- Member spotlight with keyword detection
- Historical view tracking

#### **Automated Scraping**
**Technology**: Cheerio for HTML parsing
- **Error Handling**: Promise.allSettled for fault tolerance
- **Retry Logic**: Graceful degradation on failures
- **Caching**: 30-second cache headers for API responses

### 👤 User Management

#### **Unified Authentication System**
**Dual Architecture** (JWT + Firebase):

**1. Custom JWT Authentication**:
- **Username + Password**: Email optional (privacy-first approach)
- **Password Security**: Bcrypt hashing with 10 rounds
- **Token Generation**: jsonwebtoken library with JWT_SECRET
- **Token Payload**: userId, username, email, authType
- **Session Storage**: localStorage on client
- **Unified Verification**: `/lib/auth/verify.ts` - single function for all auth types

**2. Firebase Authentication**:
- **Google OAuth**: Firebase social login
- **Twitter OAuth**: Firebase social login
- **Server Validation**: Firebase Admin SDK for token verification
- **Client State**: Firebase Auth context provider

**Security Features**:
- **Rate Limiting**: LRU cache-based (10 attempts per 15 min per IP)
- **Password Requirements**: Min length, complexity validation
- **HTTPS-Only**: Production environment enforcement
- **CSRF Protection**: Built-in Next.js protections
- **XSS Sanitization**: Input validation with Zod schemas

**Session Management**:
- Automatic token refresh
- Logout clears both JWT and Firebase tokens
- Seamless auth state across all 70+ API routes

#### **Profile Management** (5-Tab Modal with Live Preview)

**Tab 1: Profile**
- **Basic Info**: Display name, unique handle, pronouns, bio (160 chars)
- **Media**: Avatar & banner (Cloudinary uploads)
- **ARMY-Specific Fields**:
  - Bias array (multiple members)
  - Bias wrecker
  - Favorite era
  - ARMY since year
  - Top song, top album
- **Location**: Location, timezone, language

**Tab 2: Personalization**
- **Accent Color**: Color picker for custom theming
- **Theme Intensity**: 0-100 slider for color strength
- **Background Style** (8 Options):
  - Purple nebula
  - Stage lights
  - ARMY constellation
  - Purple aurora
  - Mesh gradient
  - Glassmorphism
  - Geometric grid
  - Holographic
- **Badge Style**: Minimal vs collectible display

**Tab 3: Connections**
- **Spotify Integration**:
  - OAuth flow with PKCE
  - BYO (Bring Your Own) credentials support
  - Token encryption (AES-256-GCM with user-specific keys)
  - Connect/disconnect functionality
  - Playlist export permissions
- **Last.fm Integration**:
  - Username entry and verification
  - Quest integration toggle
  - Real-time streaming verification
- **Stats.fm**: Alternative analytics provider
- **Social Links**: Twitter, Instagram, YouTube, website
  - Individual visibility toggles per link

**Tab 4: Privacy**
- **Profile Visibility**: Public / Followers Only / Private
- **Field Visibility Toggles**:
  - Bias, favorite era
  - Social links
  - Stats and analytics
- **Content Filters**: Explicit content toggle
- **Interaction Settings**:
  - Allow mentions toggle
  - Allow DMs toggle
- **Blocked Users**: Manage blocked user list

**Tab 5: Notifications**
- **Channels**: In-app, email toggles
- **Quiet Hours**: Start/end time + timezone
- **Category Preferences**:
  - **Blog**: Comments, reactions, saves
  - **Playlists**: Exports, likes, shares
  - **Spotify**: Weekly recap, new recommendations

**Live Preview**: Real-time profile preview with all changes visible instantly

#### **Privacy & Data (GDPR Compliance)**
**Data Export** (`/api/user/export-data`):
- Complete user data in JSON format
- Includes: profile, playlists, blogs, game data, quest history
- Downloadable file with timestamp

**Account Deletion** (`/api/user/delete-account`):
- Permanent deletion with confirmation
- Cascade deletes: blogs, playlists, game data, quest progress
- Anonymizes leaderboard entries (preserves scores)

#### **Music Service Integrations**

**Spotify**:
- OAuth 2.0 with refresh token rotation
- AES-256-GCM token encryption
- Per-user encryption keys (SPOTIFY_USER_SECRET_KEY + userId)
- Refresh token management
- Client credentials flow for app-level access

**Last.fm**:
- API key-based authentication
- Streaming verification for quest system
- Token bucket rate limiting (5 req/sec)
- 15-minute caching for performance

**Stats.fm**:
- Alternative music analytics provider
- Username-based integration
- Public profile access

---

## 🏗️ Technical Architecture & Database

### **Database Models** (21 MongoDB Collections)

#### **User Management**
- **User**: Core user model (auth, profile, preferences, integrations)
  - Authentication: username, email (optional), password (bcrypt), googleId, firebaseUid
  - Profile: displayName, handle, pronouns, bio, avatar, banner
  - ARMY fields: bias[], biasWrecker, favoriteEra, armySinceYear
  - Personalization: accentColor, themeIntensity, backgroundStyle
  - Privacy: visibility, fieldVisibility, blockedUsers
  - Integrations: Spotify (OAuth + BYO), Last.fm, Stats.fm

#### **Blog Platform**
- **Blog**: Blog posts with Tiptap JSON content
  - Fields: title, content, tags[], mood, coverImage, visibility
  - Engagement: reactions, comments, saves, views
  - Soft deletion: isDeleted, deletedAt
- **Collection**: Blog collections with post references

#### **Game System - Quizzes**
- **Question**: Quiz questions database (1000+ questions)
  - Fields: question, choices[], answerIndex, category, difficulty
  - Metadata: member/era tags, locale
- **QuizSession**: Active quiz sessions with TTL index (20 min)
  - Tracking: userId, answers[], score, status, expiresAt

#### **Game System - Photocards**
- **Photocard**: Fandom gallery catalog entries
  - Identity: sourceKey, pageUrl, categoryPath, subcategoryPath
  - Media: imageUrl, thumbUrl, caption/imageName
- **InventoryItem**: User's photocard inventory
  - Ownership: userId, cardId, source (quiz/quest/craft/streaming/streak), timestamp
- **DropPool**: Legacy gacha drop pools (unused)
- **InventoryGrantAudit**: Photocard grant audit log

#### **Game System - Progression**
- **UserGameState**: User game state & balances
  - Pity: sinceEpic, sinceLegendary counters (legacy)
  - Streaks: dailyCount, weeklyCount, lastPlayAt
  - Resources: dust, xp, level
  - Limits: quizStartsToday, dateKey
- **MasteryProgress**: Member/era mastery tracking
  - Fields: userId, kind (member/era), key, xp, level
- **LeaderboardEntry**: Multi-period leaderboard rankings
  - Fields: periodKey (daily/weekly/alltime), userId, score (XP), level, stats, previousRank, rank

#### **Game System - Quests & Badges**
- **QuestDefinition**: Quest templates (daily/weekly)
  - Config: code, title, period, goalType, goalValue
  - Streaming: trackTargets[], albumTargets[]
  - Rewards: dust, xp, ticket (random card), badgeId
- **UserQuestProgress**: User quest progress
  - Tracking: userId, code, periodKey, progress, completed, claimed
  - Streaming: baseline, trackProgress (Map)
- **Badge**: Badge definitions (34 badges)
  - Identity: code, name, description, icon, rarity
  - Criteria: streakDays, streakWeeks, questPeriod, threshold
- **UserBadge**: User's earned badges with timestamp

#### **Playlist System**
- **Playlist**: Generated playlists
  - Content: name, description, prompt, tracks[]
  - Generation: playlistType, length, members, eras, audioFeatures
  - Spotify: playlistId, playlistUrl, exportedAt
- **Track**: BTS track database (1000+ tracks)
  - Identifiers: spotifyId (unique), youtubeId
  - Metadata: name, artist, album, duration, popularity
  - Audio features: danceability, energy, valence, tempo (8 features)
  - Media: thumbnails, previewUrl
- **Album**: Album metadata with track lists

#### **Analytics & Trending**
- **KworbSnapshot**: Daily Spotify snapshots
  - Data: songsByArtist, albumsByArtist, daily200, artistsAllTime, monthlyListeners
  - Artist metadata: images, follower counts
- **YouTubeKworbSnapshot**: Daily YouTube snapshots
- **StreamingCache**: Last.fm cache (15 min TTL)
  - Fields: userId, lastfmUsername, recentTracks[], topTracks[]

### **API Routes** (70+ Endpoints Across 18 Categories)

**Authentication** (2): Signup, signin
**Game System** (15): Quiz (start/complete/demo), inventory, crafting, mastery, quests, leaderboard, badges, pools, state, share, photocard preview
**Playlists** (10): Generate, AI inspiration, history, export, configs, seed tracks, evolve, streaming-focused
**Spotify** (12): Auth, callback, disconnect, status, playlists, cache, kworb (cron/latest/compare), validate
**Blogs** (7): CRUD operations, reactions, comments, save, restore
**Collections** (3): List, create, get with posts
**Users** (4): Profile (get/update), public profile, export data, delete account
**Trending** (1): Top songs
**YouTube** (2): Kworb cron, latest snapshot
**Music/Stats** (2): Dashboard, landing stats
**Cron** (4): Daily quests, weekly quests, Spotify kworb, YouTube kworb
**Other** (8): Upload, health, analytics, songs, integrations

### **Performance Optimizations**

**Database**:
- **Strategic Indexes**: All 21 models have compound indexes for common queries
- **TTL Indexes**: Auto-cleanup for quiz sessions (20 min expiry)
- **Text Indexes**: Full-text search on blogs, users, tracks
- **Lean Queries**: Mongoose .lean() for read-only operations

**Caching**:
- Last.fm responses: 15-minute cache (StreamingCache model)
- Spotify tokens: Until expiry (encrypted in User model)
- Active quest definitions: In-memory for request duration

**API**:
- 30-second timeout for all routes (Vercel config)
- Batch operations: Promise.all for parallel execution
- Pagination: Cursor-based (leaderboard) and offset-based (blogs)

**Rate Limiting**:
- Auth endpoints: LRU cache (10 attempts per 15 min per IP)
- Last.fm API: Token bucket (5 req/sec, 5-min window)

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router, React Server Components)
- **Language**: TypeScript 5.6 (Strict mode)
- **UI Libraries**:
  - React 18
  - Radix UI (40+ accessible components)
  - Tailwind CSS 3.4 (Container queries, forms, typography plugins)
  - Framer Motion (Animations & transitions)
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context API
- **Rich Text**: Tiptap with 20+ extensions (lowlight syntax highlighting)

### **Backend**
- **Runtime**: Node.js on Vercel (Edge + Serverless Functions)
- **Database**: MongoDB with Mongoose ODM (21 models, 1,348 lines)
- **Authentication**: Dual system (Firebase Auth + JWT)
- **APIs**: Next.js API routes (70+ endpoints)
- **Validation**: Zod schemas for all API inputs

### **External Services & APIs**
- **AI**: Groq API (Llama 3.3 70B Versatile) for playlist generation
- **Music**:
  - Spotify Web API (OAuth 2.0, token encryption)
  - Last.fm API (streaming verification, rate limited)
  - Stats.fm API (alternative analytics)
- **Video**: YouTube Data API v3
- **Images**: Cloudinary (uploads, transformations, CDN)
- **Auth**: Firebase (Google + Twitter OAuth, Admin SDK)
- **Web Scraping**: Cheerio (Kworb.net + Fandom gallery scraping)

### **Hosting & Deployment**
- **Platform**: Vercel (Edge Runtime for API routes)
- **Cron Jobs**: 4 automated tasks (daily quests, weekly quests, Spotify scraping, YouTube scraping)
- **CDN**: Vercel Edge Network + Cloudinary CDN
- **Environment**: Environment variables managed via Vercel

### **Development Tools**
- **Linting**: ESLint + TypeScript ESLint (enforced in build)
- **Formatting**: Prettier
- **Type Checking**: TypeScript compiler (tsc --noEmit)
- **Package Manager**: npm
- **Scripts**: 19 custom Node.js scripts for seeding, migrations, imports, scrapers

### **Security**
- **Password Hashing**: Bcrypt (10 rounds)
- **Token Encryption**: AES-256-GCM (Spotify tokens)
- **JWT**: jsonwebtoken with secret key rotation
- **Rate Limiting**: Custom LRU cache-based limiter
- **Input Validation**: Zod schemas on all API routes
- **HTTPS**: Enforced in production
- **CORS**: Configured for API security

### **Key Algorithms & Logic**
1. **Pity System**: Guaranteed epic (15 pulls) and legendary (50 pulls) with persistent counters
2. **XP → Rarity Calculation**: 5 XP bands with weighted random + pity override
3. **Fuzzy Track Matching**: Normalization (lowercase, remove feat./remix, special chars)
4. **Quest Progress**: Track-based counting + album completion verification (ALL tracks required)
5. **Progressive Leveling Curve**: Non-linear XP requirements based on level (`lib/game/leveling.ts`)
6. **Multi-Period Leaderboard**: Daily/Weekly/All-Time with XP accumulation (not max score)
7. **AI Playlist Prompting**: 400+ line structured prompt with BTS discography verification
8. **Token Bucket Rate Limiter**: 5 tokens max, 5 tokens/sec refill for Last.fm
9. **Leaderboard Scoring**: XP-based accumulation with rank change tracking
10. **Read Time Estimation**: `ceil(wordCount / 200)` (200 words/min)

---

## 📖 Documentation

### 📚 Main Documentation
- **[Documentation Hub](./docs/README.md)** - Central documentation index
- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started in 10 minutes
- **[Environment Variables](./docs/setup/environment-variables.md)** - All required env vars
- **[Deployment Guide](./docs/setup/deployment.md)** - Deploy to Vercel

### 🎯 Feature Guides
- [Authentication](./docs/features/authentication.md) - Firebase & JWT auth
- [Playlist Generation](./docs/features/playlist-generation.md) - AI & manual playlists
- [Spotify Analytics](./docs/features/spotify-analytics.md) - Dashboard & insights
- [Blog Platform](./docs/features/blog-platform.md) - Blogging features
- [Trending Content](./docs/features/trending-content.md) - Spotify & YouTube
- [Game System](./docs/features/game-system.md) - Boraverse quiz & collection
- [Profile Management](./docs/features/profile-management.md) - User profiles
- [Landing Pages](./docs/features/landing-pages.md) - Homepage design

### 🎮 Quest System (NEW!)
- **[Quest System Quick Start](./docs/QUICK_START.md)** - 4-step setup (10 minutes)
- **[Complete Quest Guide](./docs/QUEST_SYSTEM.md)** - Full system reference
- **[Badge System](./docs/QUEST_BADGE_SYSTEM.md)** - UI integration guide

### 🔧 Setup & Configuration
- [Environment Setup](./docs/setup/environment-variables.md) - Required variables
- [Deployment](./docs/setup/deployment.md) - Vercel deployment
- [Cron Jobs](./docs/setup/cron-jobs.md) - Automated tasks
- [Track Seeding](./docs/setup/track-seeding.md) - Database setup
- [Fandom Gallery Scraper](./docs/scripts/fandom-gallery-scraper.md) - Image gallery ingestion
- [Spotify Tokens](./docs/setup/spotify-owner-refresh-token.md) - OAuth setup

### 📡 API Reference
- [API Overview](./docs/api/overview.md) - Complete endpoint reference
- [Authentication APIs](./docs/api/authentication.md) - Auth endpoints
- [Playlist APIs](./docs/api/playlists.md) - Playlist management
- [Blog APIs](./docs/api/blogs.md) - Blog CRUD operations
- [Game APIs](./docs/api/game.md) - Game system endpoints
- [Trending APIs](./docs/api/trending.md) - Trending data

### 🏗️ Architecture
- [System Architecture](./docs/architecture/overview.md) - High-level design
- [Database Schema](./docs/architecture/database.md) - MongoDB models
- [Data Flow](./docs/architecture/data-flow.md) - Data flow diagrams

---

## 🔑 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/armyverse

# Firebase (Client & Admin)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# JWT Authentication
JWT_SECRET=your-generated-secret-here

# Spotify API
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private
SPOTIFY_USER_SECRET_KEY=your-encryption-key-for-user-tokens

# Last.fm (Quest Verification)
LASTFM_API_KEY=your-lastfm-api-key
LASTFM_API_SECRET=your-lastfm-secret

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key
NEXT_PUBLIC_YT_THUMB_CDN=ytimg.com

# Groq AI (Llama 3.3 70B)
GROQ_API_KEY=your-groq-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# NextAuth
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000

# Cron Jobs
CRON_SECRET=your-cron-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**See [Environment Variables Guide](./docs/setup/environment-variables.md) for detailed setup instructions.**

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run type checking
npm run type-check

# Run linting
npm run lint

# Format code
npm run format

# Import quiz questions
npm run import:questions

# Seed BTS tracks
npm run seed:tracks
```

---

## 🗂️ Project Structure

```
ARMYVERSE/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication (signup, signin)
│   │   ├── game/          # Game system (quiz, inventory, quests)
│   │   ├── playlist/      # Playlist generation & management
│   │   ├── spotify/       # Spotify integration
│   │   ├── blogs/         # Blog platform
│   │   ├── user/          # User profile & settings
│   │   ├── trending/      # Trending content
│   │   └── cron/          # Automated tasks
│   ├── (pages)/           # Route pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── blog/             # Blog editor & display
│   ├── dashboard/        # Analytics dashboard
│   ├── profile/          # Profile management
│   ├── playlist/         # Playlist components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth/             # Auth utilities (JWT, verify)
│   ├── db/               # Database connection
│   ├── firebase/         # Firebase config
│   ├── models/           # Mongoose models
│   ├── spotify/          # Spotify utilities
│   └── trending/         # Trending data fetch
├── hooks/                 # Custom React hooks
├── contexts/              # React Context providers
├── scripts/               # Utility scripts
├── docs/                  # Documentation
└── public/                # Static assets
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a pull request

**Before submitting:**
- Run `npm run type-check` to ensure no TypeScript errors
- Run `npm run lint` to check code style
- Update documentation if adding new features

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🆘 Support

- **Issues**: Report bugs at [GitHub Issues](https://github.com/yourusername/armyverse/issues)
- **Documentation**: Check the [docs folder](./docs/)
- **Questions**: Open a GitHub discussion

---

## 📊 Project Statistics

**Codebase Metrics**:
- **Total TypeScript Files**: 3,335 files
- **Database Models**: 21 models (1,348 total lines)
- **API Routes**: 70+ endpoints across 18 categories
- **Pages**: 24 user-facing routes
- **React Components**: 100+ components
- **Integration Services**: 6 (Spotify, Last.fm, Stats.fm, YouTube, Groq, Cloudinary, Firebase)
- **Utility Scripts**: 19 custom scripts
- **Cron Jobs**: 4 automated tasks
- **Total Lines of Code**: 50,000+ lines (TypeScript/TSX)

**Feature Coverage**:
- **Quiz Questions**: 1000+ questions
- **Photocards**: 150+ unique cards
- **BTS Albums**: 35+ albums tracked
- **Badges**: 34 collectible badges
- **Track Database**: 1000+ BTS tracks

**External Integrations**:
- 7 third-party APIs (Spotify, Last.fm, Stats.fm, YouTube, Groq, Cloudinary, Firebase)
- 3 web scrapers (Kworb.net for Spotify & YouTube, plus Fandom galleries)
- OAuth 2.0 implementation (Spotify + Firebase)
- JWT + Firebase dual auth system

---

**Last Updated**: January 2026
**Version**: 2.1
**Status**: Production Ready 🚀
**Tech Stack**: Next.js 14 + TypeScript + MongoDB + Vercel
**Database**: 21 models, 70+ API endpoints, 1000+ quiz questions
**Game Systems**: Quiz, Photocards (150+), Crafting, Mastery, Quests, Badges (34), Leaderboard (Daily/Weekly/All-Time)
