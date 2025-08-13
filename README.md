# ArmyVerse - BTS Fan Platform

A comprehensive platform for BTS fans to discover music, create playlists, and explore trending content.

## Features

- **AI-Powered Playlist Generation**: Create personalized BTS playlists using advanced AI
- **Manual Playlist Creation**: Hand-pick your favorite tracks
- **Spotify Integration**: Connect your account to save and sync playlists
- **Trending Content**: Discover the hottest BTS content across platforms
- **Dashboard Analytics**: View your listening habits and BTS-specific insights
- **BTS Blog Platform**: Write, share, and discover BTS-themed blog posts with rich text editing, reactions, and community features

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (MongoDB Atlas recommended)
- Spotify Developer Account
- YouTube Data API v3 key

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

# Spotify Scopes
NEXT_PUBLIC_SPOTIFY_SCOPES="user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private"

# App Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (for blog image uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### Installation

```bash
npm install
npm run dev
```

### Home page redesign notes

- The landing uses a deep purple → near-black gradient and glassmorphism cards.
- Central hero shows `public/logo-armyverse.svg` with an overlaid translucent card containing the headline and CTAs.
- Trending section displays side-by-side Top 5 for Spotify and YouTube, plus a Member Spotlight carousel.
- All play/open buttons are deep links; no cross-domain audio playback is attempted.
- Basic accessibility: semantic headings, `aria-label`s on buttons/links, focus-visible styles.

### Swapping to real APIs

- Trending pulls from `/api/trending/spotify` and `/api/trending/youtube`. Update those API handlers as needed. A fallback is used when quotas fail.
- Spotify OAuth: use the Connect button (floating on pages) or visit `/stats`. Ensure env vars and redirect URIs are set as documented above.

### Structured data (optional)

Add JSON-LD to `app/page.tsx` via a `<script type="application/ld+json">` block to describe featured playlists and blog posts if desired.

## API Endpoints

### Playlist Management
- `POST /api/playlist/ai-playlist-enhanced` - Generate AI playlists
- `POST /api/playlist/export` - Export playlists to Spotify
- `GET /api/playlist/export` - Debug Spotify token (for troubleshooting)

### Spotify Integration
- `GET /api/spotify/auth-url` - Get Spotify authorization URL
- `GET /api/spotify/callback` - Handle Spotify OAuth callback
- `GET /api/spotify/user/[userId]` - Get user profile
- `GET /api/spotify/top/artists` - Get top artists
- `GET /api/spotify/top/tracks` - Get top tracks
- `GET /api/spotify/recent` - Get recently played tracks
- `GET /api/spotify/recommendations` - Get personalized recommendations

## Troubleshooting

### Spotify Export Issues

If you're experiencing issues with exporting playlists to Spotify, here are some common solutions:

#### 1. Token Validation
- Click the debug button (🐛) next to the export button to test your Spotify token
- This will show you if your token is valid and what permissions you have

#### 2. Common Error Messages

**"Spotify token expired or invalid"**
- Solution: Reconnect your Spotify account by going to `/stats` and clicking "Connect with Spotify"

**"Insufficient permissions"**
- Solution: Ensure your Spotify account has playlist creation permissions
- The app requires these scopes: `playlist-modify-public`, `playlist-modify-private`

**"Failed to export playlist"**
- Check the browser console for detailed error messages
- Try the debug button to validate your token
- Ensure you have a stable internet connection

#### 3. Environment Configuration

For production deployment, ensure these environment variables are set in Vercel:

```bash
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI="https://armyverse.vercel.app/api/spotify/callback"
NEXT_PUBLIC_SPOTIFY_SCOPES="user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private"
NEXTAUTH_URL="https://armyverse.vercel.app"
```

#### 4. Spotify App Configuration

In your Spotify Developer Dashboard, ensure these redirect URIs are added:
- `https://armyverse.vercel.app/api/spotify/callback` (Production)
- `http://localhost:3000/api/spotify/callback` (Development)

#### 5. Debug Steps

1. **Test Token**: Use the debug button to check if your token is valid
2. **Check Console**: Open browser developer tools and check for error messages
3. **Reconnect**: If issues persist, disconnect and reconnect your Spotify account
4. **Check Permissions**: Ensure your Spotify account allows playlist creation

### Recent Improvements

The export functionality has been enhanced with:
- Better error handling and user feedback
- Automatic token refresh capability
- Detailed logging for debugging
- Token validation endpoint
- Improved permission checking

If you continue to experience issues, please check the browser console for detailed error messages and try the debug functionality.

### Trending Content
- `GET /api/trending/youtube` - Get trending YouTube videos
- `GET /api/trending/spotify` - Get trending Spotify tracks
- `GET /api/trending/member-spotlight` - Get member spotlight data

### Health Checks
- `GET /api/health` - Application health check
- `GET /api/db/health` - Database health check

### Blog Platform
- `GET /api/blogs` - Get all blogs with filtering and pagination
- `POST /api/blogs` - Create a new blog post
- `GET /api/blogs/[id]` - Get a specific blog post
- `PUT /api/blogs/[id]` - Update a blog post
- `DELETE /api/blogs/[id]` - Delete a blog post
- `POST /api/blogs/[id]/reactions` - Add reactions to a blog
- `POST /api/blogs/[id]/comments` - Add comments to a blog
- `POST /api/blogs/[id]/save` - Save/unsave a blog
- `POST /api/upload` - Upload images to Cloudinary

## Testing API Endpoints

### Trending Content
```bash
# YouTube trending
curl http://localhost:3000/api/trending/youtube

# Spotify trending
curl http://localhost:3000/api/trending/spotify

# Member spotlight
curl http://localhost:3000/api/trending/member-spotlight
```

### Spotify Integration
```bash
# Get auth URL
curl http://localhost:3000/api/spotify/auth-url

# Dashboard data (requires auth)
curl -X POST http://localhost:3000/api/spotify/dashboard \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

## Deployment

This project is configured for Vercel deployment. The following features are production-ready:

- Edge runtime support for API routes
- Optimized image handling for Spotify and YouTube content
- Environment variable management
- Database connection pooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details