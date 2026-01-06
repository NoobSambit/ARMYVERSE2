# System Architecture

High-level architecture overview of the ARMYVERSE platform.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend Layer                      │
│                                                          │
│  Next.js 14 App Router + React 18 + TypeScript          │
│  ├── Pages (app/)                                       │
│  ├── Components (components/)                           │
│  ├── Contexts (Auth, Theme)                            │
│  └── Custom Hooks                                       │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS/REST
┌─────────────────┴───────────────────────────────────────┐
│                    API Layer (Next.js)                   │
│                                                          │
│  API Routes (app/api/)                                  │
│  ├── /auth      → JWT + Firebase Auth                   │
│  ├── /game      → Quiz, Inventory, Quests              │
│  ├── /playlist  → AI Generation (Groq)                  │
│  ├── /spotify   → OAuth, Analytics                      │
│  ├── /blogs     → CRUD, Reactions, Comments            │
│  ├── /user      → Profile, Settings                     │
│  ├── /trending  → Data Aggregation                      │
│  └── /cron      → Scheduled Tasks                       │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼──┐    ┌────▼────┐   ┌───▼────┐
│ Auth │    │Database │   │External│
│Layer │    │ Layer   │   │  APIs  │
└──────┘    └─────────┘   └────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **State Management**: React Context + React Query
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js (Edge Runtime for API routes)
- **API**: Next.js API Routes (REST)
- **Authentication**:
  - Firebase Auth (social login)
  - JWT (username/password)
- **Session Management**: JWT tokens (7-day expiry)

### Database
- **Primary Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Caching**: In-memory + MongoDB indexes
- **Data Models**: 15+ collections (Users, Blogs, Photocards, Quests, etc.)

### External Services
- **AI**: Groq (Llama 3.3 70B) for playlist generation
- **Music**: Spotify Web API
- **Video**: YouTube Data API v3
- **Music Tracking**: Last.fm API (quest verification)
- **Images**: Cloudinary (CDN + transformations)
- **Auth**: Firebase (Google, Twitter OAuth)

### Deployment
- **Hosting**: Vercel (Edge Network)
- **CDN**: Vercel Edge Network + Cloudinary
- **Cron Jobs**: cron-job.org (external service)
- **SSL**: Automatic (Vercel)
- **Domains**: Custom domain support

---

## System Components

### 1. Authentication System

**Dual Authentication Strategy:**

```
User Login
    │
    ├── Username/Password
    │   ├── Validate credentials
    │   ├── Generate JWT token
    │   └── Return token to client
    │
    └── Social (Firebase)
        ├── Google OAuth
        ├── Twitter OAuth
        ├── Get Firebase token
        └── Store user in MongoDB
```

**Unified Verification:**
- Single `verifyAuth()` function handles both JWT and Firebase
- Server-side validation on every protected route
- Database lookup via `getUserFromAuth()`

### 2. Game System Architecture

```
Quiz Flow:
  Start → Questions → Submit → Score → Rewards → Update State
                                           │
                                           ├→ Photocard (with pity)
                                           ├→ Stardust (duplicates)
                                           ├→ XP & Mastery
                                           ├→ Quest Progress
                                           └→ Leaderboard Update

Quest Flow:
  Cron Job → Generate Quests → User Streams → Last.fm Verify
                                                    │
                                              Update Progress
                                                    │
                                              Complete Quest
                                                    │
                                            Claim Rewards + Badges
```

### 3. Playlist Generation Pipeline

```
User Input
    │
    ├→ Seed Tracks
    ├→ Genre Mix
    ├→ Flow Pattern
    ├→ Context
    └→ Prompt
    │
    ▼
Groq Llama 3.3 70B
    │
    ├→ Analyze seed tracks
    ├→ Generate track suggestions
    ├→ Apply genre distribution
    ├→ Optimize flow pattern
    └→ Return playlist JSON
    │
    ▼
Post-Processing
    │
    ├→ Validate tracks exist
    ├→ Calculate audio features
    ├→ Store in database
    └→ Return to user
    │
    ▼
Export to Spotify (Optional)
```

### 4. Trending Data Pipeline

```
Cron Schedule (Daily)
    │
    ├→ Spotify Scraper (01:00 UTC)
    │   ├→ Fetch kworb.net data
    │   ├→ Parse HTML
    │   ├→ Extract streaming stats
    │   └→ Store snapshot
    │
    └→ YouTube Scraper (02:00 UTC)
        ├→ Fetch kworb.net data
        ├→ Parse HTML
        ├→ Extract view stats
        └→ Store snapshot
    │
    ▼
API Serves Cached Data
    │
    └→ Frontend displays with 24h cache
```

### 5. Blog Platform Architecture

```
Rich Text Editor (Tiptap)
    │
    ├→ User writes content
    ├→ Auto-save drafts
    ├→ Upload images (Cloudinary)
    └→ Submit for publication
    │
    ▼
Content Processing
    │
    ├→ Sanitize HTML
    ├→ Calculate reading time
    ├→ Generate excerpt
    ├→ SEO optimization
    └→ Store in MongoDB
    │
    ▼
Display & Interactions
    │
    ├→ Reactions (loved, moved, surprised)
    ├→ Comments (nested threads)
    ├→ Bookmarks
    ├→ Views tracking
    └→ Trending calculation
```

---

## Data Flow

### Request Flow

```
1. Client Request
   └→ HTTPS to Vercel Edge

2. Next.js Edge Runtime
   └→ Route to API handler

3. Authentication Middleware
   ├→ Extract token
   ├→ Verify signature
   └→ Get user from DB

4. Business Logic
   ├→ Validate input
   ├→ Process request
   └→ Query database

5. Response
   ├→ Format JSON
   ├→ Set headers
   └→ Return to client

6. Client Updates
   └→ React re-renders
```

### Database Queries

```
API Route
    │
    ├→ User Authentication
    │   └→ User.findOne({ username/email/firebaseUid })
    │
    ├→ Game Data
    │   ├→ UserGameState.findOne({ userId })
    │   ├→ InventoryItem.find({ userId })
    │   └→ QuestDefinition.find({ active: true })
    │
    ├→ Blog Data
    │   ├→ Blog.find({ visibility: 'public' })
    │   └→ Blog.findById(id)
    │
    └→ Caching Strategy
        ├→ MongoDB indexes for fast lookups
        ├→ In-memory cache for trending data
        └→ Redis (future enhancement)
```

---

## Scalability Considerations

### Current Architecture
- **Concurrent Users**: 1,000-10,000
- **Database**: MongoDB Atlas (M0-M2 cluster)
- **API**: Serverless (auto-scales with Vercel)
- **CDN**: Global edge network

### Bottlenecks & Solutions

**1. Database Queries**
- ✅ Indexes on frequently queried fields
- ✅ Pagination for large lists
- 🔄 Future: Read replicas for heavy read operations

**2. External API Rate Limits**
- ✅ Caching (24h for trending data)
- ✅ Request pooling
- 🔄 Future: Queue system for batching

**3. Image Delivery**
- ✅ Cloudinary CDN
- ✅ Automatic format optimization (WebP)
- ✅ Responsive images

**4. Authentication**
- ✅ JWT tokens (no database lookup per request)
- ✅ Firebase Admin SDK (cached verification)
- 🔄 Future: Session management with Redis

---

## Security Architecture

### Authentication
- JWT with HS256 algorithm
- Secrets stored in environment variables
- Tokens expire after 7 days
- Password hashing with bcrypt (10 rounds)

### Authorization
- Role-based access control (user, admin)
- Resource ownership validation
- API rate limiting on auth endpoints

### Data Protection
- HTTPS enforced (Vercel)
- Input validation (Zod schemas)
- SQL injection prevention (Mongoose ODM)
- XSS protection (HTML sanitization)
- CORS configuration
- Environment variables for secrets

### Privacy
- GDPR compliance (data export)
- Account deletion
- Privacy settings per user
- Optional email collection

---

## Monitoring & Logging

### Current Setup
- Vercel deployment logs
- Client-side error boundaries
- API error responses

### Future Enhancements
- Application performance monitoring (APM)
- Error tracking (Sentry)
- Analytics (user behavior)
- Database query performance monitoring
- Uptime monitoring

---

## Deployment Architecture

```
Git Push (main branch)
    │
    ▼
GitHub Triggers Webhook
    │
    ▼
Vercel Build
    │
    ├→ Install dependencies
    ├→ Build Next.js app
    ├→ Run type checking
    └→ Generate static assets
    │
    ▼
Deploy to Edge Network
    │
    ├→ Deploy to 20+ regions
    ├→ Update environment variables
    ├→ Set up custom domains
    └→ Enable HTTPS
    │
    ▼
Live on Production
```

**Environments:**
- **Production**: main branch
- **Preview**: feature branches
- **Development**: local machine

---

## Future Architecture Enhancements

### Short Term (1-3 months)
- [ ] Redis caching layer
- [ ] WebSocket support for real-time features
- [ ] Enhanced error tracking
- [ ] Performance monitoring

### Medium Term (3-6 months)
- [ ] Microservices for heavy tasks (playlist AI)
- [ ] Message queue (RabbitMQ/SQS)
- [ ] Full-text search (Elasticsearch)
- [ ] GraphQL API option

### Long Term (6-12 months)
- [ ] Mobile app (React Native)
- [ ] Progressive Web App (PWA)
- [ ] Push notifications
- [ ] Internationalization (i18n)
- [ ] Multi-region database replication

---

## Related Documentation

- [Database Schema](./database.md)
- [Data Flow](./data-flow.md)
- [API Overview](../api/overview.md)
- [Deployment Guide](../setup/deployment.md)

---

**Last Updated**: January 2026
