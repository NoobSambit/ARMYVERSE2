# ARMYVERSE Documentation

Complete documentation for all features of the ARMYVERSE platform - a comprehensive BTS fan platform.

## 📚 Documentation Structure

### Quest & Badge System (NEW!)
Complete guides for the quest and badge system:
- **[QUICK_START.md](./QUICK_START.md)** - 4-step setup guide (10 minutes)
- **[QUEST_SYSTEM.md](./QUEST_SYSTEM.md)** - Complete system reference
- **[QUEST_BADGE_SYSTEM.md](./QUEST_BADGE_SYSTEM.md)** - UI integration guide

### Features Documentation
Detailed guides for each feature of the platform:
- [Authentication](./features/authentication.md) - Firebase Auth & Spotify OAuth
- [Playlist Generation](./features/playlist-generation.md) - AI & Manual playlist creation
- [Spotify Analytics](./features/spotify-analytics.md) - Dashboard & insights
- [Blog Platform](./features/blog-platform.md) - Rich text blogging with community features
- [Trending Content](./features/trending-content.md) - Spotify & YouTube trending data
- [Game System (Boraverse)](./features/game-system.md) - Quiz, rewards, and progression
- [Profile Management](./features/profile-management.md) - User profiles and settings
- [Landing Pages](./features/landing-pages.md) - Homepage & Boraverse landing

### Setup & Configuration
- [Environment Setup](./setup/environment-variables.md) - All required environment variables
- [Deployment Guide](./setup/deployment.md) - Vercel deployment instructions
- [Cron Jobs Setup](./setup/cron-jobs.md) - Automated scraping configuration

### API Reference
- [API Overview](./api/overview.md) - Complete API endpoint reference
- [Authentication APIs](./api/authentication.md) - Auth-related endpoints
- [Playlist APIs](./api/playlists.md) - Playlist management endpoints
- [Blog APIs](./api/blogs.md) - Blog CRUD and interactions
- [Game APIs](./api/game.md) - Game system endpoints
- [Trending APIs](./api/trending.md) - Trending data endpoints

### Architecture
- [System Architecture](./architecture/overview.md) - High-level system design
- [Database Schema](./architecture/database.md) - MongoDB models and relationships
- [Data Flow](./architecture/data-flow.md) - How data flows through the system

## 🚀 Quick Start

1. **Environment Setup**: See [Environment Variables](./setup/environment-variables.md)
2. **Installation**: Run `npm install`
3. **Development**: Run `npm run dev`
4. **Build**: Run `npm run build`

## 🎯 Feature Overview

### 1. **Authentication System**
- Firebase Authentication for user management
- Spotify OAuth for music integration
- Protected routes and API endpoints

### 2. **Playlist Generation**
- **AI Playlists**: Groq Llama 3.3 70B-powered playlist creation with advanced customization
  - Seed track selection from BTS library
  - 6-genre mix control (Ballad, Hip-Hop, EDM, R&B, Rock, Dance-Pop)
  - Flow pattern selection (slow-build, consistent, wave, cool-down)
  - Context optimization (workout, study, party, commute, sleep, auto)
  - Personality quiz and template gallery
  - Configuration save/load
  - Playlist evolution and comparison
- **Manual Playlists**: Hand-pick tracks with search and filtering
- **Export to Spotify**: One-click export with error handling

### 3. **Spotify Analytics**
- Personal listening statistics and trends
- BTS-specific analytics and insights
- Top artists, tracks, and listening patterns
- Daily snapshots of global streaming data

### 4. **Blog Platform**
- Rich text editor with Tiptap
- Markdown support, code blocks, tables, images
- Community features: reactions, comments, saves
- SEO optimization and preview
- Advanced filtering and search

### 5. **Trending Content**
- **Spotify Trending**: Top BTS songs by daily streams
- **YouTube Trending**: Top BTS videos by daily views
- OT7 vs Solo member toggle
- Automated daily data scraping via cron jobs
- Cached data for optimal performance

### 6. **Game System (Boraverse)**
- **Quiz System**: 10-question quizzes on BTS knowledge
- **Photocard Collection**: Earn cards with 4 rarity tiers
- **Crafting System**: Convert duplicates to Stardust, craft specific cards
- **Mastery System**: Member/Era XP with milestone rewards
- **Quest & Badge System**: Daily/weekly streaming quests with complete album requirements, 34 badges, streak tracking
- **Leaderboard**: Weekly competition with top player rankings
- **Sharing**: Generate shareable card images with Cloudinary

### 7. **Profile Management**
- Comprehensive 5-tab profile modal
- Basic profile info and ARMY-specific fields
- Personalization (themes, colors, preferences)
- Social connections and integrations
- Privacy and safety settings
- Notification preferences

### 8. **Landing Pages**
- Premium homepage with feature showcase
- Dedicated Boraverse game landing page
- Responsive design with animations
- Clear CTAs and conversion optimization

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Auth, NextAuth.js
- **External APIs**: Spotify Web API, YouTube Data API, Groq Llama 3.3 70B
- **Rich Text**: Tiptap editor
- **Image Management**: Cloudinary
- **Deployment**: Vercel with Edge Runtime

## 📖 Documentation Conventions

### Code Examples
All code examples are tested and production-ready. Copy-paste with confidence.

### API Endpoints
- **Method** and **Path** are clearly specified
- **Authentication** requirements are noted
- **Request/Response** examples are provided
- **Error cases** are documented

### Feature Documentation
Each feature doc includes:
- **What**: Description of the feature
- **How It Works**: Technical implementation details
- **Workflow**: Step-by-step user/system flow
- **API Reference**: Related endpoints
- **Usage Examples**: Code snippets and best practices

## 🤝 Contributing

When adding new features:
1. Create documentation in the appropriate folder
2. Update this README with links
3. Include API documentation if applicable
4. Add workflow diagrams for complex features

## 📝 License

MIT License - See LICENSE file for details

---

**Last Updated**: January 2025  
**Version**: 2.0  
**Status**: Production Ready
