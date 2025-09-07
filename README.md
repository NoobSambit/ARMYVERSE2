# ArmyVerse - BTS Fan Platform

A comprehensive platform for BTS fans to discover music, create playlists, and explore trending content.
https://armyverse.vercel.app/
## Features

- **AI-Powered Playlist Generation**: Create personalized BTS playlists using advanced AI
- **Manual Playlist Creation**: Hand-pick your favorite tracks
- **Spotify Integration**: Connect your account to save and sync playlists
- **Trending Content**: Discover the hottest BTS content across platforms
- **Dashboard Analytics**: View your listening habits and BTS-specific insights
- **BTS Blog Platform**: Write, share, and discover BTS-themed blog posts with rich text editing, reactions, and community features

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
│   │   │   ├── ai-playlist-enhanced/       # Enhanced AI playlist generation
│   │   │   │   └── route.ts                # Advanced AI playlist logic with Google Gemini (POST)
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
- **External APIs**: Spotify Web API, YouTube Data API v3, Google Gemini AI
- **Rich Text Editor**: Tiptap with extensive extensions
- **Image Upload**: Cloudinary for image management
- **Deployment**: Vercel with edge runtime support

## API Endpoints Overview

### Authentication & User Management
- `GET /api/spotify/auth-url` - Get Spotify OAuth URL
- `GET /api/spotify/callback` - Handle OAuth callback
- `GET /api/spotify/user/[userId]` - Get user profile data

### Playlist Management
- `POST /api/playlist/ai-playlist-enhanced` - Generate AI playlists with Google Gemini
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

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (MongoDB Atlas recommended)
- Spotify Developer Account
- YouTube Data API v3 key
- Google AI API key (for Gemini)
- Cloudinary account (for image uploads)

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

# Google AI (Gemini)
GOOGLE_AI_API_KEY="your-google-ai-api-key"

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
- Uses Google Gemini AI to analyze user preferences and mood
- Generates playlists based on BTS eras, members, and emotional themes
- Integrates with Spotify Web API for track recommendations

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
