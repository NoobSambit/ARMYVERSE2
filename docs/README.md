# ARMYVERSE Documentation

Complete documentation for the ARMYVERSE platform - a comprehensive BTS fan platform with music, games, blogs, and community features.

---

## 🚀 Quick Start

**New to ARMYVERSE?** Start here:

1. **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 10 minutes
2. **[Environment Setup](./setup/environment-variables.md)** - Configure your environment
3. **[Deployment Guide](./setup/deployment.md)** - Deploy to production

---

## 📚 Documentation Structure

### 🎮 Quest & Badge System (Featured)

Complete guides for the quest and badge system:

- **[Quick Start (4 Steps)](./QUEST_SYSTEM.md#quick-start)** - 10-minute setup
- **[Complete Quest System Guide](./QUEST_SYSTEM.md)** - Full system reference
- **[Badge System Integration](./QUEST_BADGE_SYSTEM.md)** - UI implementation guide
- **[Quick Setup Script](./QUICK_START.md)** - Automated setup

### 🎯 Features Documentation

Detailed guides for each feature of the platform:

- **[Authentication](./features/authentication.md)** - Firebase Auth & JWT-based auth
- **[Playlist Generation](./features/playlist-generation.md)** - AI & manual playlist creation
- **[Spotify Analytics](./features/spotify-analytics.md)** - Dashboard & insights
- **[Blog Platform](./features/blog-platform.md)** - Rich text blogging with community features
- **[Trending Content](./features/trending-content.md)** - Spotify & YouTube trending data
- **[Game System (Boraverse)](./features/game-system.md)** - Quiz, rewards, and progression
- **[Profile Management](./features/profile-management.md)** - User profiles and settings
- **[Landing Pages](./features/landing-pages.md)** - Homepage & Boraverse landing
- **[Spotify Per-User Export](./features/spotify-per-user-export.md)** - BYO Spotify app integration

### 🔧 Setup & Configuration

Step-by-step setup guides:

- **[Environment Variables](./setup/environment-variables.md)** - All required environment variables
- **[Deployment](./setup/deployment.md)** - Vercel deployment instructions
- **[Cron Jobs](./setup/cron-jobs.md)** - Automated task configuration
- **[Track Seeding](./setup/track-seeding.md)** - Database seeding for BTS tracks
- **[Spotify Owner Refresh Token](./setup/spotify-owner-refresh-token.md)** - OAuth setup

### 📡 API Reference

Complete API endpoint documentation:

- **[API Overview](./api/overview.md)** - API basics, authentication, response format
- **[Authentication APIs](./api/authentication.md)** - Sign up, sign in, JWT, Firebase
- **[Playlist APIs](./api/playlists.md)** - AI generation, manual creation, export
- **[Blog APIs](./api/blogs.md)** - CRUD operations, reactions, comments
- **[Game APIs](./api/game.md)** - Quiz, inventory, quests, mastery, leaderboard
- **[Spotify APIs](./api/spotify.md)** - OAuth, analytics, status, playlists
- **[User APIs](./api/user.md)** - Profile, settings, integrations, data export
- **[Trending APIs](./api/trending.md)** - Spotify & YouTube trending data
- **[Cron APIs](./api/cron.md)** - Scheduled tasks and automation

### 🏗️ Architecture

System design and technical architecture:

- **[System Architecture](./architecture/overview.md)** - High-level system design
- **[Database Schema](./architecture/database.md)** - MongoDB models and relationships
- **[Data Flow](./architecture/data-flow.md)** - How data flows through the system

### 🔐 Authentication Documentation

Comprehensive auth system guides:

- **[Auth Migration Guide](./AUTH_MIGRATION.md)** - Technical implementation details
- **[Auth Setup Guide](./AUTH_SETUP.md)** - Quick setup instructions
- **[Auth Quick Reference](./AUTH_QUICK_REFERENCE.md)** - Cheat sheet for developers

---

## 🎯 Feature Overview

### 1. **Authentication System**
- Firebase Authentication for social login (Google, Twitter)
- JWT-based username/password authentication
- Email is optional - privacy-first approach
- Protected routes and API endpoints
- Unified auth verification on server

### 2. **Playlist Generation**
- **AI Playlists**: Groq Llama 3.3 70B-powered creation
  - Seed track selection from BTS library
  - 6-genre mix control (Ballad, Hip-Hop, EDM, R&B, Rock, Dance-Pop)
  - Flow pattern selection (slow-build, wave, consistent, cool-down)
  - Context optimization (workout, study, party, commute, sleep)
  - Personality quiz and template gallery
  - Configuration save/load system
  - Playlist evolution and comparison
- **Manual Playlists**: Hand-pick tracks with search and filtering
- **Export to Spotify**: One-click export with error handling

### 3. **Spotify Analytics**
- Personal listening statistics and trends
- BTS-specific analytics and insights
- Top artists, tracks, and listening patterns
- Daily snapshots of global streaming data at `/spotify`
  - Songs/albums by artist with expandable track lists
  - Global daily top 200 positions
  - All-time artist ranks and monthly listeners

### 4. **Blog Platform**
- Rich text editor powered by Tiptap
- Markdown support, code blocks, tables, images
- Community features: reactions (loved, moved, surprised), comments, saves
- SEO optimization with preview and scoring
- Advanced filtering: tags, moods, authors, languages, post types
- Trending algorithm and featured posts

### 5. **Trending Content**
- **Spotify Trending**: Top BTS songs by daily streams
- **YouTube Trending**: Top BTS videos by daily views
- OT7 vs Solo member filtering
- Automated daily data scraping via cron jobs
- 24-hour caching for optimal performance

### 6. **Game System (Boraverse)**
- **Quiz System**: 10-question quizzes on BTS knowledge
  - Multiple categories (history, discography, members, lyrics)
  - Performance-based photocard rarity
  - Daily limits and leaderboard integration

- **Photocard Collection**: Earn cards with 4 rarity tiers
  - Common (70%), Rare (22%), Epic (7%), Legendary (1%)
  - Pity system guarantees
  - 150+ unique photocards

- **Crafting System**: Convert duplicates to Stardust, craft specific cards
  - Specific card crafting
  - Rarity roll system

- **Mastery System**: Member/Era XP with milestone rewards
  - Individual member progression
  - Era-based progression
  - Themed photocard pulls at milestones

- **Quest & Badge System**: Complete daily/weekly streaming quests
  - Last.fm integration for streaming verification
  - Album completion tracking with full track lists
  - 34 collectible badges with streak rewards
  - Daily and weekly quest rotation

- **Leaderboard**: Weekly competition with top 100 rankings
  - Automatic reward distribution
  - Tier-based prizes

- **Sharing**: Generate shareable photocard images via Cloudinary

### 7. **Profile Management**
- Comprehensive 5-tab profile modal:
  - Profile: Basic info and ARMY-specific fields
  - Personalization: Themes, colors, preferences
  - Connections: Spotify, Last.fm, social integrations
  - Privacy: Visibility and data sharing settings
  - Notifications: Email and in-app notification preferences
- Data export (GDPR compliance)
- Account deletion

### 8. **Landing Pages**
- Premium homepage with feature showcase
- Dedicated Boraverse game landing page
- Responsive design with Framer Motion animations
- Clear CTAs and conversion optimization

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Auth + JWT
- **External APIs**:
  - Spotify Web API
  - YouTube Data API v3
  - Groq Llama 3.3 70B
  - Last.fm API (quest verification)
- **Rich Text**: Tiptap editor
- **Image Management**: Cloudinary
- **Deployment**: Vercel with Edge Runtime
- **Cron Jobs**: cron-job.org (external service)

---

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

---

## 🔍 Finding What You Need

### I want to...

**Set up the project**
→ [Quick Start Guide](./QUICK_START.md)
→ [Environment Variables](./setup/environment-variables.md)

**Understand authentication**
→ [Authentication Feature](./features/authentication.md)
→ [Auth APIs](./api/authentication.md)
→ [Auth Quick Reference](./AUTH_QUICK_REFERENCE.md)

**Work with playlists**
→ [Playlist Feature](./features/playlist-generation.md)
→ [Playlist APIs](./api/playlists.md)

**Implement the game system**
→ [Game Feature](./features/game-system.md)
→ [Game APIs](./api/game.md)
→ [Quest System](./QUEST_SYSTEM.md)

**Deploy to production**
→ [Deployment Guide](./setup/deployment.md)
→ [Environment Setup](./setup/environment-variables.md)

**Understand the architecture**
→ [System Architecture](./architecture/overview.md)
→ [Database Schema](./architecture/database.md)

**Use the API**
→ [API Overview](./api/overview.md)
→ Specific API docs in `/api` folder

---

## 🤝 Contributing to Documentation

When adding new features:

1. Create documentation in the appropriate folder
2. Update this README with links
3. Include API documentation if applicable
4. Add workflow diagrams for complex features
5. Provide code examples
6. Update the "I want to..." section if needed

### Documentation Template

```markdown
# Feature Name

## What It Is
Brief description

## How It Works
Technical details

## Workflow
Step-by-step process

## API Reference
Related endpoints with examples

## Configuration
Required setup

## Usage Examples
Code snippets

## Related Documentation
Links to related docs
```

---

## 📝 Changelog

### Version 2.1 (January 2026)
- ✅ Comprehensive API documentation created
- ✅ Architecture documentation added
- ✅ Updated all feature guides
- ✅ Added Auth quick reference guides
- ✅ Documented quest and badge system
- ✅ Updated environment variables guide

### Version 2.0 (January 2026)
- ✅ Quest & Badge system fully documented
- ✅ Last.fm integration documented
- ✅ JWT authentication added
- ✅ Enhanced game system documentation

---

## 🆘 Need Help?

- **Issues**: Report bugs at GitHub Issues
- **Questions**: Check existing documentation first
- **Feature Requests**: Open a GitHub discussion
- **Deployment Issues**: See [Deployment Guide](./setup/deployment.md)

---

## 📊 Documentation Stats

- **Total Docs**: 30+ markdown files
- **API Endpoints Documented**: 50+
- **Features Covered**: 8 major features
- **Setup Guides**: 5
- **Architecture Docs**: 3
- **Last Updated**: January 2026

---

**Documentation Version**: 2.1
**Project Version**: 2.1
**Last Updated**: January 2026
**Status**: Production Ready 🚀

---

*This documentation is maintained alongside the codebase. If you find any discrepancies or outdated information, please open an issue.*
