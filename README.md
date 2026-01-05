# ArmyVerse - BTS Fan Platform

> 📚 **[Complete Documentation Available](./docs/README.md)** - Comprehensive guides for all features, setup instructions, API references, and architecture details are now organized in the `/docs` folder.

A comprehensive platform for BTS fans to discover music, create playlists, explore trending content, and play games.

## Quick Links

- **[Features Documentation](./docs/features/)** - Detailed guides for each feature
- **[Setup Guide](./docs/setup/)** - Environment setup and deployment instructions
- **[API Reference](./docs/api/)** - Complete API documentation
- **[Architecture](./docs/architecture/)** - System design and database schema

---

## Features

- **AI-Powered Playlist Generation**: Create personalized BTS playlists using Groq Llama 3.3 70B with seed tracks, genre mixing, flow patterns, and smart templates
- **Manual Playlist Creation**: Hand-pick your favorite tracks
- **Spotify Integration**: Connect your account to save and sync playlists
- **Trending Content**: Discover the hottest BTS content across platforms
- **Dashboard Analytics**: View your listening habits and BTS-specific insights
- **BTS Blog Platform**: Write, share, and discover BTS-themed blog posts with rich text editing, reactions, and community features
 - **Spotify Analytics Snapshots**: Daily snapshot of songs/albums totals, global daily positions, all-time artist ranks, and monthly listeners with a dashboard at `/spotify`
- Or: `MONGODB_URI="<your-uri>" node scripts/import-questions.js --file /home/hairyfairy/Documents/ARMYVERSE/data/questions.json --db armyverse --collection questions --batch 1000`
- NDJSON supported: one JSON object per line; blanks ignored.
- Upserts by `hash` (auto-generated if missing) and creates unique index on `hash`.
- Flags: `--db`, `--collection`, `--batch`, `--dry-run`.

## Game (Phase 2)

New systems on top of Phase 1:
- Crafting: spend dust to craft a card or buy a ticket roll with a rarity floor.
- Mastery: member/era XP with milestone claims that grant themed pulls.
- Quests: daily/weekly tasks with dust or ticket rewards; claim via API.
- Seasonal Pools: active `DropPool` with weights and featured boosts.
- Share: generate a Cloudinary share URL with overlay text.
- Leaderboard: weekly best-run scores with pagination.

Endpoints:
- POST `/api/game/craft` { cardId? | targetRarity? }
- GET `/api/game/mastery` and POST `/api/game/mastery/claim` { kind, key }
- GET `/api/game/quests` and POST `/api/game/quests/claim` { code }
- GET `/api/game/leaderboard?limit=&cursor=`
- POST `/api/game/share` { inventoryItemId }
- Updates: quiz start enforces daily ranked limit; complete awards XP, dust on dupes, mastery, quests, leaderboard.

Dev seeding: minimal `DropPool` and `QuestDefinition` can be added in development (see server logs).

## Game (Phase 1)

Simple quiz-to-photocard game built on existing stack (Next.js App Router, Mongo via Mongoose, Firebase Admin auth, Cloudinary images). No new infra required.

- Endpoints:
  - POST `/api/game/quiz/start` → start a quiz session.
  - POST `/api/game/quiz/complete` → complete a session, score answers, grant a card.
  - GET `/api/game/inventory` → list user inventory with pagination.
  - GET `/api/game/pools` → active card pool overview.

- Auth: `Authorization: Bearer <Firebase ID token>` required on all.
- Start payload example: `{ "locale": "en", "count": 10 }`
- Complete payload example: `{ "sessionId": "664f...abc", "answers": [0,2,1,1,3,0,2,1,0,3] }`
- Inventory item example:
  `{ "id": "66a1...def", "card": { "member": "Jimin", "era": "BE", "set": "BE Era", "rarity": "rare", "publicId": "armyverse/cards/be_jimin_01", "imageUrl": "https://..." }, "acquiredAt": "2025-10-10T10:10:10.000Z" }`

Notes: Sessions expire after 20 minutes (TTL). Scoring is 1 point per correct. Drop rates: common 70, rare 22, epic 7, legendary 1 with pity (≥epic every 15, legendary at 50).

A comprehensive platform for BTS fans to discover music, create playlists, and explore trending content.

## Features

- **AI-Powered Playlist Generation**: Create personalized BTS playlists using Groq Llama 3.3 70B with seed tracks, genre mixing, flow patterns, and smart templates
- **Manual Playlist Creation**: Hand-pick your favorite tracks
- **Spotify Integration**: Connect your account to save and sync playlists
- **Trending Content**: Discover the hottest BTS content across platforms
- **Dashboard Analytics**: View your listening habits and BTS-specific insights
- **BTS Blog Platform**: Write, share, and discover BTS-themed blog posts with rich text editing, reactions, and community features
 - **Spotify Analytics Snapshots**: Daily snapshot of songs/albums totals, global daily positions, all-time artist ranks, and monthly listeners with a dashboard at `/spotify`

## Complete Project Structure

```
ARMYVERSE/
├── app/                                    # Next.js App Router directory
│   ├── ai-playlist/                        # AI playlist generation page
│   │   └── page.tsx                        # AI playlist interface with mood selection and generation
│   ├── api/                                # API routes directory
│   │   ├── blogs/                          # Blog-related API endpoints
│   │   │   ├── [id]/                       # Dynamic blog ID routes
│   │   │   │   ├── comments/               # Blog comments API
│   │   │   │   │   └── route.ts            # Comments CRUD operations (GET, POST)
│   │   │   │   ├── reactions/              # Blog reactions API
│   │   │   │   │   └── route.ts            # Like/dislike functionality (POST)
│   │   │   │   ├── save/                   # Blog save/unsave API
│   │   │   │   │   └── route.ts            # Bookmark functionality (POST)
│   │   │   │   └── route.ts                # Individual blog CRUD operations (GET, PUT, DELETE)
│   │   │   └── route.ts                    # Blog listing and creation (GET, POST)
│   │   ├── health/                         # Health check endpoints
│   │   │   └── route.ts                    # Application health monitoring (GET)
│   │   ├── playlist/                       # Playlist management APIs
│   │   │   ├── generate-enhanced/          # Enhanced AI playlist generation
│   │   │   │   └── route.ts                # Advanced AI playlist logic with Groq Llama 3.3 70B (POST)
│   │   │   ├── seed-tracks/                # BTS song selection for seeds
│   │   │   │   └── route.ts                # Fetch BTS songs from database (GET)
│   │   │   ├── ai-inspiration/             # AI prompt suggestions
│   │   │   │   └── route.ts                # Generate creative prompts (POST)
│   │   │   ├── configs/                    # Save/load configurations
│   │   │   │   └── route.ts                # Manage playlist configs (GET, POST, DELETE)
│   │   │   ├── evolve/                     # Refine existing playlists
│   │   │   │   └── route.ts                # Evolve playlists with instructions (POST)
│   │   │   ├── history/                    # Playlist generation history
│   │   │   │   └── route.ts                # User playlist history (GET)
│   │   │   ├── export/                     # Playlist export functionality
│   │   │   │   └── route.ts                # Export to Spotify (POST, GET for debugging)
│   │   │   ├── generate/                   # Basic playlist generation
│   │   │   │   └── route.ts                # Standard playlist creation (POST)
│   │   │   ├── streaming-focused/          # Streaming-optimized playlists
│   │   │   │   └── route.ts                # Streaming platform integration (POST)
│   │   │   └── test/                       # Playlist testing endpoints
│   │   │       └── route.ts                # Development testing (GET)
│   │   ├── songs/                          # Song management API
│   │   │   └── route.ts                    # Song CRUD operations (GET, POST)
│   │   ├── spotify/                        # Spotify integration APIs
│   │   │   ├── audio-features/             # Audio analysis features
│   │   │   │   └── route.ts                # Track audio characteristics (GET)
│   │   │   ├── auth-url/                   # Spotify OAuth initiation
│   │   │   │   └── route.ts                # Authorization URL generation (GET)
│   │   │   ├── cache/                      # Spotify data caching
│   │   │   │   ├── [userId]/               # User-specific cache
│   │   │   │   │   └── route.ts            # User cache management (GET, DELETE)
│   │   │   │   └── route.ts                # General cache operations (GET, DELETE)
│   │   │   ├── callback/                   # OAuth callback handler
│   │   │   │   └── route.ts                # Spotify OAuth callback (GET)
│   │   │   ├── dashboard/                  # User dashboard data
│   │   │   │   └── route.ts                # Dashboard analytics (POST)
│   │   │   ├── playlists/                  # Spotify playlist management
│   │   │   │   └── route.ts                # Playlist operations (GET, POST)
│   │   │   ├── recent/                     # Recently played tracks
│   │   │   │   └── route.ts                # Recent listening history (GET)
│   │   │   ├── recommendations/            # Music recommendations
│   │   │   │   └── route.ts                # Personalized recommendations (GET)
│   │   │   ├── top/                        # Top content APIs
│   │   │   │   ├── artists/                # Top artists
│   │   │   │   │   └── route.ts            # User's top artists (GET)
│   │   │   │   └── tracks/                 # Top tracks
│   │   │   │       └── route.ts            # User's top tracks (GET)
│   │   │   └── user/                       # User profile management
│   │   │       └── [userId]/               # User-specific data
│   │   │           └── route.ts            # User profile operations (GET)
│   │   ├── trending/                       # Trending content APIs
│   │   │   ├── spotify/                    # Spotify trending tracks
│   │   │   │   └── route.ts                # Trending Spotify content with caching (GET)
│   │   │   └── youtube/                    # YouTube trending videos
│   │   │       └── route.ts                # Trending YouTube content with caching (GET)
│   │   └── upload/                         # File upload handling
│   │       └── route.ts                    # Image upload to Cloudinary (POST)
│   ├── auth/                               # Authentication pages
│   │   ├── signin/                         # Sign in page
│   │   │   └── page.tsx                    # Login interface with Firebase Auth
│   │   └── signup/                         # Sign up page
│   │       └── page.tsx                    # Registration interface with Firebase Auth
│   ├── blog/                               # Blog listing page
│   │   └── page.tsx                        # Blog index page with filtering and pagination
│   ├── blogs/                              # Individual blog pages
│   │   ├── [id]/                           # Dynamic blog routes
│   │   │   └── page.tsx                    # Individual blog post view with reactions and comments
│   │   └── create/                         # Blog creation page
│   │       └── page.tsx                    # Blog editor interface with rich text editor
│   ├── create-playlist/                    # Playlist creation page
│   │   └── page.tsx                        # Manual playlist builder interface
│   ├── globals.css                         # Global styles and Tailwind CSS imports
│   ├── layout.tsx                          # Root layout component with metadata and providers
│   ├── loading.tsx                         # Loading UI component for route transitions
│   ├── not-found.tsx                       # 404 error page
│   ├── page.tsx                            # Home page with hero, trending, and value props
│   ├── playlist-hub/                       # Playlist management hub
│   │   └── page.tsx                        # Playlist dashboard with AI and manual options
│   ├── stats/                              # User statistics page
│   │   └── page.tsx                        # Analytics dashboard with Spotify data visualization
│   └── trending/                           # Trending content page
│       └── page.tsx                        # Trending content display with Spotify and YouTube
├── components/                             # Reusable React components
│   ├── auth/                               # Authentication components
│   │   ├── FloatingConnect.tsx             # Floating Spotify connect button for easy access
│   │   ├── ProtectedRoute.tsx              # Route protection wrapper for authenticated pages
│   │   ├── SignInForm.tsx                  # Sign in form component with Firebase integration
│   │   ├── SignUpForm.tsx                  # Sign up form component with Firebase integration
│   │   ├── SpotifyAuth.tsx                 # Spotify authentication logic and state management
│   │   └── SpotifyConnectCard.tsx          # Spotify connection card with OAuth flow
│   ├── blog/                               # Blog-related components
│   │   └── BlogEditor.tsx                  # Rich text blog editor with Tiptap, templates, and AI assist
│   ├── buttons/                            # Button components
│   │   └── ExportToSpotifyButton.tsx       # Spotify export button with debug functionality
│   ├── dashboard/                          # Dashboard components
│   │   ├── BTSAnalytics.tsx                # BTS-specific analytics and insights visualization
│   │   ├── RecentTracks.tsx                # Recent tracks display with play buttons
│   │   ├── TopArtists.tsx                  # Top artists visualization with charts
│   │   └── UserProfile.tsx                 # User profile display with Spotify data
│   ├── forms/                              # Form components
│   │   └── StreamingFocusForm.tsx          # Streaming preferences form for playlist generation
│   ├── layout/                             # Layout components
│   │   ├── Footer.tsx                      # Site footer with links and social media
│   │   ├── MobileQuickActions.tsx          # Mobile navigation and quick actions
│   │   ├── nav-data.ts                     # Navigation configuration and menu items
│   │   └── Navbar.tsx                      # Main navigation bar with responsive design
│   ├── playlist/                           # Playlist components
│   │   ├── CompactPlaylistGrid.tsx         # Compact playlist display for mobile
│   │   └── index.ts                        # Playlist component exports
│   ├── profile/                            # Profile components
│   │   └── ProfileCard.tsx                 # User profile card with avatar and stats
│   ├── sections/                           # Page section components
│   │   ├── Hero.tsx                        # Hero section with main CTA and branding
│   │   ├── StreamingCTA.tsx                # Streaming call-to-action banner
│   │   └── ValueProps.tsx                  # Value propositions section explaining features
│   ├── trending/                           # Trending content components
│   │   ├── MemberCarousel.tsx              # BTS member spotlight carousel with smooth animations
│   │   ├── SongCard.tsx                    # Individual song card with platform-specific styling
│   │   └── TrendingSection.tsx             # Trending content section with tabbed interface
│   └── ui/                                 # UI components
│       ├── InteractiveSlider.tsx           # Interactive slider component for mood selection
│       ├── MoodPills.tsx                   # Mood selection pills with emoji indicators
│       └── Toast.tsx                       # Toast notification component for user feedback
├── contexts/                               # React context providers
│   └── AuthContext.tsx                     # Authentication context for global auth state
├── hooks/                                  # Custom React hooks
│   ├── useAllSongs.ts                      # Hook for fetching all songs from database
│   ├── useSongSearch.ts                    # Hook for song search functionality with debouncing
│   ├── useSpotifyAuth.ts                   # Hook for Spotify authentication state management
│   └── useTrending.ts                      # Hook for trending content data fetching
├── lib/                                    # Utility libraries
│   ├── db/                                 # Database utilities
│   │   └── mongoose.ts                     # MongoDB connection setup and configuration
│   ├── firebase/                           # Firebase integration
│   │   ├── auth.ts                         # Firebase authentication configuration and methods
│   │   ├── config.ts                       # Firebase configuration and initialization
│   │   └── profile.ts                      # User profile management with Firebase
│   ├── models/                             # Database models
│   │   ├── Blog.ts                         # Blog post model with comments, reactions, and metadata
│   │   ├── Playlist.ts                     # Playlist model with tracks and metadata
│   │   ├── Track.ts                        # Track model with audio features and metadata
│   │   └── User.ts                         # User model with profile and preferences
│   ├── spotify/                            # Spotify utilities
│   │   ├── dashboard.tsx                   # Dashboard data processing and analytics
│   │   └── utils.ts                        # Spotify helper functions and API wrappers
│   └── trending/                           # Trending content utilities
│       └── fetch.ts                        # Trending data fetching from Spotify and YouTube APIs
├── public/                                 # Static assets
│   ├── favicon.svg                         # Site favicon
│   ├── logo-armyverse.svg                  # Main logo for branding
│   ├── robots.txt                          # Search engine directives
│   ├── site.webmanifest                    # Web app manifest for PWA features
│   ├── sitemap-0.xml                       # Generated sitemap for SEO
│   └── sitemap.xml                         # Main sitemap for search engines
├── scripts/                                # Development scripts
│   ├── test-db.js                          # Database testing script for connection validation
│   ├── test-spotify-api.js                 # Spotify API testing script for endpoint validation
│   └── test-thumbnails.js                  # Thumbnail testing script for image optimization
├── env.local.example                       # Environment variables template
├── jest.config.js                          # Jest testing configuration
├── next-env.d.ts                           # Next.js TypeScript definitions
├── next-sitemap.config.js                  # Sitemap generation configuration
├── next.config.js                          # Next.js configuration with image optimization
├── package-lock.json                       # NPM lock file for dependency management
├── package.json                            # Project dependencies and scripts
├── postcss.config.js                       # PostCSS configuration for Tailwind CSS
├── README.md                               # This comprehensive documentation file
├── tailwind.config.ts                      # Tailwind CSS configuration with custom theme
├── test-spotify-oauth.md                   # Spotify OAuth testing guide and documentation
└── tsconfig.json                           # TypeScript configuration
```

## Key Features by Directory

### `/app` - Next.js App Router
- **Pages**: All user-facing pages using Next.js 13+ App Router
- **API Routes**: RESTful API endpoints for data management
- **Dynamic Routes**: `[id]` folders for dynamic content rendering
- **Layout**: Root layout with metadata, providers, and global styling
 - **Spotify Analytics**: `/spotify` page renders daily snapshots (songs/albums by artist with expandable details, global ranks)

### `/components` - Reusable UI Components
- **Auth Components**: Complete authentication flow with Firebase and Spotify
- **Blog Components**: Rich text editor with Tiptap, templates, and AI assistance
- **Dashboard Components**: Analytics visualization with charts and insights
- **Trending Components**: Real-time trending content from Spotify and YouTube
- **UI Components**: Generic reusable components for consistent design

### `/lib` - Core Business Logic
- **Database Models**: Mongoose schemas for data persistence
- **Spotify Integration**: Complete Spotify Web API integration
- **Firebase Auth**: User authentication and profile management
- **Trending Logic**: Data fetching and processing for trending content

### `/hooks` - Custom React Hooks
- **Data Fetching**: Hooks for API calls with caching and error handling
- **Authentication**: Hooks for managing auth state across components
- **Search**: Debounced search functionality for better UX

### `/contexts` - Global State Management
- **Auth Context**: Global authentication state using React Context API

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components, Framer Motion
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js, Firebase Auth
- **External APIs**: Spotify Web API, YouTube Data API v3, Groq Llama 3.3 70B
- **Rich Text Editor**: Tiptap with extensive extensions
- **Image Upload**: Cloudinary for image management
- **Deployment**: Vercel with edge runtime support

## API Endpoints Overview

### Authentication & User Management
- `GET /api/spotify/auth-url` - Get Spotify OAuth URL
- `GET /api/spotify/callback` - Handle OAuth callback
- `GET /api/spotify/user/[userId]` - Get user profile data

### Playlist Management
- `POST /api/playlist/generate-enhanced` - Generate AI playlists with Groq Llama 3.3 70B
- `GET /api/playlist/seed-tracks` - Fetch BTS songs for seed selection
- `POST /api/playlist/ai-inspiration` - Get AI-generated prompt suggestions
- `GET /api/playlist/configs` - Load saved configurations
- `POST /api/playlist/configs` - Save playlist configuration
- `DELETE /api/playlist/configs` - Delete saved configuration
- `POST /api/playlist/evolve` - Refine existing playlist
- `GET /api/playlist/history` - Get user's playlist history
- `POST /api/playlist/export` - Export playlists to Spotify
- `POST /api/playlist/generate` - Create manual playlists
- `POST /api/playlist/streaming-focused` - Generate streaming-optimized playlists

### Blog Platform
- `GET /api/blogs` - List blogs with pagination and filtering
- `POST /api/blogs` - Create new blog post
- `GET /api/blogs/[id]` - Get specific blog post
- `PUT /api/blogs/[id]` - Update blog post
- `DELETE /api/blogs/[id]` - Delete blog post
- `POST /api/blogs/[id]/reactions` - Add reactions (moved, loved, surprised)
- `POST /api/blogs/[id]/comments` - Add comments
- `POST /api/blogs/[id]/save` - Save/unsave blog

### Trending Content
- `GET /api/trending/spotify` - Get trending BTS tracks from Spotify
- `GET /api/trending/youtube` - Get trending BTS videos from YouTube

### File Management
- `POST /api/upload` - Upload images to Cloudinary

### Health & Monitoring
- `GET /api/health` - Application health check

### Spotify Analytics Snapshots
- `POST /api/spotify/kworb/cron` - Write the daily snapshot (requires `Authorization: Bearer <CRON_SECRET>`; scheduled daily in production)
- `GET /api/spotify/kworb/latest` - Read the latest snapshot (served from DB; cached)
- Page: `/spotify` - Overview cards and 4 sections:
  - Songs by artist (group + members): totals (streams/daily/tracks) and expandable track list
  - Albums by artist: totals (streams/daily/albums) and expandable album list
  - Global Daily Top 200 positions (group + members)
  - Global ranks: most-streamed artists (all-time) and monthly listeners

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (MongoDB Atlas recommended)
- Spotify Developer Account
- YouTube Data API v3 key
- Groq API key (for Llama 3.3 70B)
- Cloudinary account (for image uploads)
- Last.fm API key (for quest streaming verification)

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
# Database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/armyverse?retryWrites=true&w=majority"

# Spotify API
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI="http://localhost:3000/api/spotify/callback"

# YouTube API
YOUTUBE_API_KEY="your-youtube-api-key"
NEXT_PUBLIC_YT_THUMB_CDN="ytimg.com"

# Groq AI (Llama 3.3 70B)
GROQ_API_KEY="your-groq-api-key"

# Spotify Scopes
NEXT_PUBLIC_SPOTIFY_SCOPES="user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private"

# App Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (for blog image uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Firebase (for authentication)
FIREBASE_API_KEY="your-firebase-api-key"
FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
FIREBASE_APP_ID="your-app-id"

# Spotify analytics (snapshots)
CRON_SECRET="your-long-random"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Installation

```bash
npm install
npm run dev
```

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
```

## Key Features Explained

### AI Playlist Generation
- Uses Groq Llama 3.3 70B Versatile for intelligent playlist creation
- **Seed Tracks**: Select up to 5 BTS songs to match energy and vibe
- **Genre Mixing**: Fine-tune mix of Ballad, Hip-Hop, EDM, R&B, Rock, Dance-Pop
- **Flow Patterns**: Control energy progression (slow-build, wave, consistent, cool-down, random)
- **Context Optimization**: Optimize for workout, study, party, commute, sleep, or auto
- **Smart Templates**: 6 pre-configured templates (Gym Beast Mode, Study Focus, Late Night Vibes, etc.)
- **Personality Quiz**: 6-question quiz that auto-configures all settings
- **Save/Load Configs**: Persist favorite configurations to database
- **Playlist Evolution**: Refine existing playlists with natural language
- **Compare Playlists**: Side-by-side comparison with overlap analysis

### Blog Platform
- Rich text editor with Tiptap supporting tables, images, code blocks
- Real-time auto-save and version history
- SEO optimization with preview and scoring
- Community features: reactions, comments, and saving

### Trending Content
- Real-time trending BTS content from Spotify and YouTube
- Member spotlight featuring individual BTS members
- Caching system for optimal performance
- Responsive design with smooth animations

### Spotify Integration
- Complete OAuth flow with proper scopes
- Dashboard analytics with listening patterns
- Playlist export functionality with error handling
- Audio features analysis for mood detection

## Deployment

This project is configured for Vercel deployment with:
- Edge runtime support for API routes
- Optimized image handling for Spotify and YouTube content
- Environment variable management
- Database connection pooling
- Automatic sitemap generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Blog Listing: Filters URL Contract and Components

- URL parameters (shareable):
  - `q`: free-text search
  - `tags`: CSV of tags
  - `moods`: CSV of moods
  - `authors`: CSV of author names
  - `languages`: CSV of languages
  - `types`: CSV of post types
  - `savedBy`: user id (for saved posts facet)
  - `before` / `after`: ISO dates for createdAt range
  - `minRead` / `maxRead`: reading time bounds (minutes)
  - `sort`: `relevance` | `newest` | `trending7d` | `mostViewed` | `mostReacted` | `oldest`
  - `page`: 1-based pagination index
  - `view`: `grid` (default) | `list`

- API (`/api/blogs`) maps from page URL to backend params using `buildApiParams` in `hooks/useBlogFilters.ts`.

- Components:
  - `components/blog/FeaturedPosts.tsx` – 1 primary + 3 secondary trending posts.
  - `components/blog/FilterBar.tsx` – sticky search, sort, tags, view toggle; URL synced.
  - `components/blog/PostGrid.tsx` – grid/list rendering of posts.
  - `components/blog/PostCard.tsx` – standard card with author, readTime, stats.

- Hooks/Utils:
  - `useBlogFilters()` – URL ↔ state sync for filters; returns `{ state, set, clearAll }`.
  - `buildApiParams(state)` – converts state to `/api/blogs` params.
  - `readingTimeFromHtml`, `trendingScore` – utilities for content metrics.