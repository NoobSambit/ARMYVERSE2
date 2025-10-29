# Authentication System

## What It Is

ARMYVERSE uses a dual authentication system:
1. **Firebase Authentication** - For user account management and general app access
2. **Spotify OAuth** - For music-related features and Spotify API access

## How It Works

### Firebase Authentication

Firebase Auth handles user registration, login, and session management for the entire platform.

**Supported Methods:**
- Email/Password authentication
- Google Sign-In (OAuth)
- Session persistence with secure tokens

**Key Components:**
- `lib/firebase/auth.ts` - Firebase configuration and auth methods
- `lib/firebase/config.ts` - Firebase initialization
- `contexts/AuthContext.tsx` - Global authentication state
- `components/auth/SignInForm.tsx` - Login interface
- `components/auth/SignUpForm.tsx` - Registration interface

### Spotify OAuth

Spotify OAuth enables users to connect their Spotify accounts for playlist export, analytics, and recommendations.

**OAuth Flow:**
1. User clicks "Connect with Spotify"
2. Redirects to Spotify authorization page
3. User grants permissions
4. Spotify redirects back with authorization code
5. Backend exchanges code for access + refresh tokens
6. Tokens stored securely for API calls

**Required Scopes:**
```
user-read-private
user-read-email
user-top-read
user-read-recently-played
playlist-read-private
playlist-modify-public
playlist-modify-private
```

## Workflow

### User Registration Flow

```mermaid
graph TD
    A[User visits /auth/signup] --> B[Fill registration form]
    B --> C[Submit to Firebase Auth]
    C --> D{Success?}
    D -->|Yes| E[Create user record in MongoDB]
    E --> F[Redirect to dashboard]
    D -->|No| G[Show error message]
    G --> B
```

### User Login Flow

```mermaid
graph TD
    A[User visits /auth/signin] --> B[Enter credentials]
    B --> C[Submit to Firebase Auth]
    C --> D{Valid?}
    D -->|Yes| E[Get Firebase ID token]
    E --> F[Store token in session]
    F --> G[Redirect to protected page]
    D -->|No| H[Show error message]
    H --> B
```

### Spotify OAuth Flow

```mermaid
graph TD
    A[User clicks Connect Spotify] --> B[GET /api/spotify/auth-url]
    B --> C[Redirect to Spotify login]
    C --> D[User grants permissions]
    D --> E[Spotify redirects to /api/spotify/callback]
    E --> F[Exchange code for tokens]
    F --> G[Store tokens in database]
    G --> H[Redirect to dashboard with success]
```

## API Reference

### Firebase Authentication (Client-Side)

**Sign Up**
```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  return userCredential.user
}
```

**Sign In**
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}
```

**Sign Out**
```typescript
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

const logout = async () => {
  await signOut(auth)
}
```

### Spotify OAuth Endpoints

**GET /api/spotify/auth-url**

Generates Spotify OAuth authorization URL.

**Request:**
```bash
GET /api/spotify/auth-url
```

**Response:**
```json
{
  "url": "https://accounts.spotify.com/authorize?client_id=...&response_type=code&redirect_uri=..."
}
```

**GET /api/spotify/callback**

Handles OAuth callback and token exchange.

**Query Parameters:**
- `code` (string) - Authorization code from Spotify
- `state` (string, optional) - State parameter for CSRF protection

**Response:**
Redirects to `/stats?auth=success&token=...` on success

### Protected API Routes

All API routes requiring authentication expect a Firebase ID token in the Authorization header:

```bash
Authorization: Bearer <firebase-id-token>
```

**Example:**
```typescript
const idToken = await user.getIdToken()

const response = await fetch('/api/game/inventory', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
})
```

## Protected Routes

### Client-Side Protection

Use the `ProtectedRoute` component to wrap pages requiring authentication:

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
```

### Server-Side Protection

Verify Firebase tokens on API routes:

```typescript
import { verifyIdToken } from '@/lib/auth/verify'

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1]
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const decodedToken = await verifyIdToken(token)
    const userId = decodedToken.uid
    
    // Process request for authenticated user
    
  } catch (error) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

## Configuration

### Environment Variables

**Firebase (Client)**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Firebase Admin (Server)**
```env
FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

**Spotify OAuth**
```env
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://your-domain.com/api/spotify/callback
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-private user-read-email user-top-read...
```

**NextAuth**
```env
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=https://your-domain.com
```

### Spotify Developer Dashboard Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an application
3. Add redirect URIs:
   - Production: `https://your-domain.com/api/spotify/callback`
   - Development: `http://localhost:3000/api/spotify/callback`
4. Copy Client ID and Client Secret to environment variables

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Email/Password authentication
4. Enable Google Sign-In (optional)
5. Copy configuration to environment variables
6. For Admin SDK:
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Extract `client_email` and `private_key`

## Usage Examples

### Using Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  if (!user) return <div>Please sign in</div>
  
  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Making Authenticated API Calls

```typescript
import { useAuth } from '@/contexts/AuthContext'

async function fetchUserData() {
  const { user } = useAuth()
  const idToken = await user?.getIdToken()
  
  const response = await fetch('/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  })
  
  return response.json()
}
```

### Spotify Integration

```tsx
import SpotifyAuth from '@/components/auth/SpotifyAuth'

function StatsPage() {
  return (
    <SpotifyAuth>
      {(spotifyToken) => (
        <Dashboard token={spotifyToken} />
      )}
    </SpotifyAuth>
  )
}
```

## Security Best Practices

### Token Management
- ✅ Store Firebase tokens in secure HTTP-only cookies (handled by Firebase SDK)
- ✅ Never expose Firebase Admin SDK credentials client-side
- ✅ Rotate Spotify refresh tokens regularly
- ✅ Implement token expiration and refresh logic

### API Security
- ✅ Validate all Firebase ID tokens on server-side
- ✅ Implement rate limiting on authentication endpoints
- ✅ Use HTTPS for all authentication flows
- ✅ Implement CSRF protection with state parameter

### User Data
- ✅ Hash sensitive user data in database
- ✅ Implement proper access controls
- ✅ Follow GDPR compliance for EU users
- ✅ Provide data export and deletion options

## Troubleshooting

### Common Issues

**"Failed to get authentication URL"**
- **Cause**: Missing Spotify environment variables
- **Solution**: Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set

**"Invalid redirect URI"**
- **Cause**: Redirect URI mismatch with Spotify dashboard
- **Solution**: Add exact redirect URI to Spotify app settings

**"Token exchange failed"**
- **Cause**: Invalid client secret or mismatched redirect URI
- **Solution**: Double-check credentials and ensure redirect URIs match

**"Firebase Auth not working"**
- **Cause**: Missing or incorrect Firebase configuration
- **Solution**: Verify all Firebase environment variables are set correctly

**"Admin SDK errors"**
- **Cause**: Missing `FIREBASE_PRIVATE_KEY` or `FIREBASE_CLIENT_EMAIL`
- **Solution**: Generate new service account key from Firebase Console

### Debug Mode

Enable debug logging for authentication:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Auth Debug:', {
    user: user?.uid,
    token: idToken?.substring(0, 20) + '...',
    expires: decodedToken?.exp
  })
}
```

## Related Documentation

- [Profile Management](./profile-management.md) - User profile features after authentication
- [API Overview](../api/overview.md) - All protected API endpoints
- [Deployment Guide](../setup/deployment.md) - Production authentication setup
