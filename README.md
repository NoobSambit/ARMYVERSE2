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
- **AI Playlist Generation**: Create personalized BTS playlists using Groq Llama 3.3 70B
  - Seed track selection from BTS library
  - 6-genre mixing (Ballad, Hip-Hop, EDM, R&B, Rock, Dance-Pop)
  - Flow patterns (slow-build, wave, consistent, cool-down)
  - Smart templates and personality quiz
  - Save/load configurations
- **Manual Playlist Creation**: Hand-pick your favorite tracks
- **Spotify Integration**: Export playlists to Spotify, view listening analytics

### 📊 Analytics & Insights
- **Personal Dashboard**: View your listening habits and BTS-specific insights
- **Spotify Analytics**: Daily snapshots of global streaming data at `/spotify`
  - Songs/albums by artist with streaming totals
  - Global daily top 200 positions
  - All-time artist ranks and monthly listeners

### 🎮 Boraverse Game System
- **Quiz System**: 10-question quizzes on BTS knowledge
- **Photocard Collection**: Earn cards with 4 rarity tiers (Common, Rare, Epic, Legendary)
- **Crafting System**: Convert duplicates to Stardust, craft specific cards
- **Mastery System**: Member/Era XP with milestone rewards
- **Quest & Badge System**: Complete daily/weekly streaming quests
  - Last.fm integration for streaming verification
  - Album completion tracking
  - 34 collectible badges with streak rewards
- **Leaderboard**: Weekly competition with global rankings
- **Sharing**: Generate shareable photocard images

### 📝 Blog Platform
- **Rich Text Editor**: Write BTS-themed blog posts with Tiptap
- **Community Features**: Reactions, comments, and saves
- **SEO Optimization**: Built-in preview and scoring
- **Advanced Filtering**: Search by tags, moods, authors, and more

### 🔥 Trending Content
- **Spotify Trending**: Top BTS songs by daily streams
- **YouTube Trending**: Top BTS videos by daily views
- **Member Spotlight**: Individual BTS member features
- **Automated Scraping**: Daily updates via cron jobs

### 👤 User Management
- **Flexible Authentication**:
  - Username + password (email optional)
  - Firebase social login (Google, Twitter)
  - JWT-based sessions
- **Profile Management**: 5-tab profile modal with personalization
- **Privacy Controls**: Granular privacy and notification settings
- **Integrations**: Connect Spotify, Last.fm, and other services

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components, Framer Motion
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Auth + JWT-based custom auth
- **External APIs**:
  - Spotify Web API
  - YouTube Data API v3
  - Groq Llama 3.3 70B
  - Last.fm API (quest verification)
- **Rich Text**: Tiptap editor with extensive extensions
- **Image Management**: Cloudinary
- **Deployment**: Vercel with Edge Runtime

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

**Last Updated**: January 2026
**Version**: 2.1
**Status**: Production Ready 🚀
