# Profile Management

## What It Is

Comprehensive user profile system with a 5-tab modal interface:
1. **Profile Tab** - Basic info, avatar/banner, ARMY-specific fields
2. **Personalization Tab** - Themes, colors, UI preferences
3. **Connections Tab** - Spotify integration, social media links
4. **Privacy & Safety Tab** - Visibility controls, blocked users, data export
5. **Notifications Tab** - Communication preferences, quiet hours

## How It Works

### Profile Data Structure

**Stored in MongoDB User Model:**
- Basic profile information
- ARMY-specific fields (bias, era, ARMY since)
- Social media connections
- Personalization preferences
- Privacy settings
- Notification preferences
- User stats and activity

**Merged with Firebase Auth:**
- Email address
- Display name (if not set in MongoDB)
- Profile picture (if not custom uploaded)
- Last sign-in time

### Tab-Based Interface

**5 Organized Tabs:**
Each tab focuses on specific aspects of profile management:

**1. Profile Tab**
- Display name, username (handle), pronouns
- Bio with character limit
- Avatar and banner upload (drag & drop)
- Bias selection (multiple members)
- Bias wrecker
- Favorite era dropdown
- ARMY since year
- Top song/album with Spotify search
- Location, timezone, language
- Quick actions (copy profile link, view public)

**2. Personalization Tab**
- Accent color picker (with custom color support)
- Theme intensity slider
- Background style (gradient, noise, BTS motif, clean)
- Card density (comfortable, compact)
- Motion preferences (reduce animations)
- Badge style (minimal, collectible)

**3. Connections Tab**
- Spotify connection with OAuth
- Social media links (Twitter, Instagram, YouTube, Website)
- Per-link visibility controls
- Connection status monitoring
- Disconnect options

**4. Privacy & Safety Tab**
- Profile visibility (public, followers only, private)
- Field-level visibility toggles
- Explicit content filter
- Communication settings (mentions, DMs)
- Blocked users management
- Data export (GDPR compliance)
- Account deletion

**5. Notifications Tab**
- Delivery channels (in-app, email)
- Quiet hours configuration
- Category-specific settings:
  - Blog (comments, reactions, saves)
  - Playlists (exports, likes)
  - Spotify (weekly recap, recommendations)

### Live Preview

Real-time preview shows how profile appears to others:
- Respects privacy settings
- Updates as fields change
- Shows public vs private views
- Responsive design preview

## Workflow

### Profile Update Flow

```mermaid
graph TD
    A[User clicks Edit Profile] --> B[ProfileModal opens]
    B --> C[Load profile data]
    C --> D{Select tab}
    D -->|Profile| E[Edit basic info]
    D -->|Personalization| F[Customize appearance]
    D -->|Connections| G[Manage integrations]
    D -->|Privacy| H[Set privacy controls]
    D -->|Notifications| I[Configure notifications]
    E --> J[Changes auto-saved or manual save]
    F --> J
    G --> J
    H --> J
    I --> J
    J --> K[PUT /api/user/profile]
    K --> L[Update MongoDB]
    L --> M[Show success message]
    M --> N[Update UI across app]
```

### Avatar Upload Flow

```mermaid
graph TD
    A[User selects/drags image] --> B[Validate file type/size]
    B --> C{Valid?}
    C -->|No| D[Show error message]
    C -->|Yes| E[Compress image client-side]
    E --> F[POST /api/upload]
    F --> G[Upload to Cloudinary]
    G --> H[Return image URL]
    H --> I[Update profile with new URL]
    I --> J[Show preview]
```

### Spotify Connection Flow

```mermaid
graph TD
    A[User clicks Connect Spotify] --> B[GET /api/spotify/auth-url]
    B --> C[Redirect to Spotify OAuth]
    C --> D[User grants permissions]
    D --> E[Spotify redirects back]
    E --> F[Exchange code for tokens]
    F --> G[Store tokens in database]
    G --> H[Update Connections tab]
    H --> I[Show connected status]
```

## API Reference

### GET /api/user/profile

Get current user's profile data.

**Authentication**: Required

**Response:**
```json
{
  "ok": true,
  "profile": {
    "displayName": "ARMYFan",
    "handle": "armyfan123",
    "pronouns": "they/them",
    "bio": "BTS ARMY since 2017 💜",
    "avatarUrl": "https://res.cloudinary.com/...",
    "bannerUrl": "https://res.cloudinary.com/...",
    "bias": ["Jungkook", "V"],
    "biasWrecker": "Jimin",
    "favoriteEra": "Love Yourself",
    "armySinceYear": 2017,
    "topSong": {
      "id": "spotify:track:...",
      "name": "Spring Day",
      "artist": "BTS"
    },
    "socials": {
      "twitter": "https://twitter.com/...",
      "instagram": "",
      "youtube": "",
      "website": "",
      "visibility": {
        "twitter": true,
        "instagram": false
      }
    },
    "location": "Seoul, South Korea",
    "timezone": "Asia/Seoul",
    "language": "ko",
    "personalization": {
      "accentColor": "#A274FF",
      "themeIntensity": 75,
      "backgroundStyle": "gradient",
      "density": "comfortable",
      "reduceMotion": false,
      "badgeStyle": "collectible"
    },
    "privacy": {
      "visibility": "public",
      "fieldVisibility": {
        "location": false,
        "armySince": true,
        "socials": true
      },
      "explicitContentFilter": true,
      "allowMentions": true,
      "allowDMs": true
    },
    "notifications": {
      "channels": {
        "inApp": true,
        "email": false
      },
      "quietHours": {
        "start": "22:00",
        "end": "08:00",
        "timezone": "Asia/Seoul"
      },
      "blog": {
        "comments": true,
        "reactions": true,
        "saves": false
      },
      "playlists": {
        "exports": true,
        "likes": false
      },
      "spotify": {
        "weeklyRecap": true,
        "recommendations": false
      }
    },
    "stats": {
      "totalPlaylists": 12,
      "totalBlogs": 5,
      "totalCards": 87
    }
  }
}
```

### PUT /api/user/profile

Update user profile.

**Authentication**: Required

**Request Body:** (partial updates supported)
```json
{
  "displayName": "Updated Name",
  "bio": "New bio text",
  "bias": ["Jungkook"],
  "personalization": {
    "accentColor": "#FF69B4"
  },
  "privacy": {
    "visibility": "followers"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "profile": {
    "...": "updated profile data"
  }
}
```

**Error Response (Handle Taken):**
```json
{
  "ok": false,
  "error": "Handle already taken",
  "field": "handle"
}
```

### POST /api/upload

Upload image to Cloudinary.

**Authentication**: Required

**Request:** multipart/form-data
```
Content-Type: multipart/form-data
File field name: "image"
```

**Response:**
```json
{
  "ok": true,
  "url": "https://res.cloudinary.com/armyverse/image/upload/v123456/avatars/user123.jpg",
  "publicId": "avatars/user123"
}
```

## Configuration

### Environment Variables

```env
# Database
MONGODB_URI=your-mongodb-connection-string

# Firebase Auth
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Cloudinary (for avatars/banners)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Spotify OAuth (for connections)
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret

# Upload limits
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760  # 10MB
```

## Database Schema

### User Profile Model

```typescript
{
  firebaseUid: string,              // Links to Firebase Auth
  handle: string,                   // Unique username
  profile: {
    displayName: string,
    pronouns: string,
    bio: string,
    avatarUrl: string,
    bannerUrl: string,
    bias: string[],
    biasWrecker: string,
    favoriteEra: string,
    armySinceYear: number,
    topSong: {
      id: string,
      name: string,
      artist: string
    },
    topAlbum: {
      id: string,
      name: string,
      artist: string
    },
    location: string,
    timezone: string,
    language: string
  },
  socials: {
    twitter: string,
    instagram: string,
    youtube: string,
    website: string,
    visibility: {
      twitter: boolean,
      instagram: boolean,
      youtube: boolean,
      website: boolean
    }
  },
  spotifyConnection: {
    connected: boolean,
    accessToken: string,            // Encrypted
    refreshToken: string,           // Encrypted
    expiresAt: Date,
    userId: string
  },
  personalization: {
    accentColor: string,
    themeIntensity: number,
    backgroundStyle: string,
    density: string,
    reduceMotion: boolean,
    badgeStyle: string
  },
  privacy: {
    visibility: string,
    fieldVisibility: {
      [key: string]: boolean
    },
    explicitContentFilter: boolean,
    allowMentions: boolean,
    allowDMs: boolean,
    blockedUserIds: string[]
  },
  notifications: {
    channels: {
      inApp: boolean,
      email: boolean
    },
    quietHours: {
      start: string,
      end: string,
      timezone: string
    },
    blog: {
      comments: boolean,
      reactions: boolean,
      saves: boolean
    },
    playlists: {
      exports: boolean,
      likes: boolean
    },
    spotify: {
      weeklyRecap: boolean,
      recommendations: boolean
    }
  },
  stats: {
    totalPlaylists: number,
    totalBlogs: number,
    totalCards: number,
    totalLikes: number,
    totalSaves: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Opening Profile Modal

```tsx
import ProfileModal from '@/components/profile/ProfileModal'

function Header() {
  return (
    <div>
      <ProfileModal
        trigger={
          <button>Edit Profile</button>
        }
        defaultTab="profile"
      />
    </div>
  )
}
```

### Fetching Profile Data

```typescript
import { useEffect, useState } from 'react'

function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchProfile() {
      const idToken = await user.getIdToken()
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      const data = await response.json()
      setProfile(data.profile)
      setLoading(false)
    }
    
    fetchProfile()
  }, [])
  
  return { profile, loading }
}
```

### Updating Profile

```typescript
async function updateProfile(updates: Partial<Profile>) {
  const idToken = await user.getIdToken()
  
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(updates)
  })
  
  return response.json()
}

// Usage
await updateProfile({
  displayName: 'New Name',
  bias: ['Jungkook', 'V']
})
```

### Uploading Avatar

```typescript
async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  
  const idToken = await user.getIdToken()
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`
    },
    body: formData
  })
  
  const data = await response.json()
  
  // Update profile with new avatar URL
  await updateProfile({ avatarUrl: data.url })
  
  return data.url
}
```

## Accessibility Features

### Keyboard Navigation
- Tab through all form fields
- Shift+Tab for reverse navigation
- Enter/Space for button activation
- Escape to close modal
- Ctrl/Cmd+S to save

### Screen Reader Support
- ARIA labels on all inputs
- Role attributes for custom components
- Live regions for dynamic updates
- Semantic HTML structure

### Visual Accessibility
- High contrast focus indicators
- 4.5:1+ color contrast ratios
- Scalable text (up to 200% zoom)
- No color-only information

## Security & Privacy

### Data Protection
- Profile data encrypted in transit (HTTPS)
- Sensitive tokens encrypted at rest
- Passwords never stored (Firebase Auth handles)
- Regular security audits

### Privacy Controls
- Granular field visibility
- Public/followers/private options
- Blocked users list
- Data export (GDPR compliance)
- Account deletion with data removal

### Best Practices
- ✅ Don't expose sensitive data client-side
- ✅ Validate all inputs server-side
- ✅ Rate limit profile updates
- ✅ Sanitize user-generated content
- ✅ Implement proper CORS policies

## Troubleshooting

### Profile Not Loading
- Check Firebase authentication status
- Verify API endpoint is accessible
- Check browser console for errors
- Ensure environment variables are set

### Updates Not Saving
- Verify authentication token is valid
- Check for validation errors in response
- Ensure network connectivity
- Review server logs for errors

### Upload Failures
- Check file size (max 10MB)
- Verify file type (jpg, png, gif, webp)
- Ensure Cloudinary credentials are correct
- Check network for interruptions

### Handle Already Taken
- Try a different username
- Check for typos
- Consider adding numbers or underscores
- Handles are unique across platform

## Related Documentation

- [Authentication](./authentication.md) - Required for profile access
- [Blog Platform](./blog-platform.md) - Author profile integration
- [Spotify Analytics](./spotify-analytics.md) - Spotify connection usage
- [API Reference](../api/overview.md) - Complete API documentation
