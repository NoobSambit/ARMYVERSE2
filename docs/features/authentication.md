# Authentication System

## What It Is

ARMYVERSE uses a flexible multi-method authentication system:
1. **Username/Password (JWT)** - Privacy-first authentication with optional email
2. **Firebase Authentication** - Social login (Google, Twitter)
3. **Spotify OAuth** - For music-related features and Spotify API access

## How It Works

### Username/Password Authentication (JWT)

JWT-based authentication allows users to create accounts with just a username and password - email is completely optional.

**Features:**
- Username-only signup (email optional for privacy)
- Secure password hashing with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- Login with username OR email
- Rate limiting (5 signups/hour, 10 logins/15min)

**Key Components:**
- `lib/auth/jwt.ts` - JWT generation, verification, password hashing
- `lib/auth/verify.ts` - Unified auth verification (JWT + Firebase)
- `lib/auth/token.ts` - Token utility functions
- `app/api/auth/signup/route.ts` - Signup endpoint
- `app/api/auth/signin/route.ts` - Signin endpoint
- `contexts/AuthContext.tsx` - Global authentication state
- `components/auth/SignInForm.tsx` - Login interface
- `components/auth/SignUpForm.tsx` - Registration interface

### Firebase Authentication

Firebase Auth handles social login for users who prefer OAuth providers.

**Supported Methods:**
- Google Sign-In (OAuth)
- Twitter Sign-In (OAuth)
- Session persistence with Firebase tokens

**Key Components:**
- `lib/firebase/auth.ts` - Firebase configuration and auth methods
- `lib/firebase/config.ts` - Firebase initialization
- Firebase Admin SDK for server-side token verification

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

### Username/Password Registration Flow

```mermaid
graph TD
    A[User visits /auth/signup] --> B[Fill registration form]
    B[username, password, optional email] --> C[POST /api/auth/signup]
    C --> D[Validate input with Zod]
    D --> E[Check username uniqueness]
    E --> F[Hash password with bcrypt]
    F --> G[Create user in MongoDB]
    G --> H[Generate JWT token]
    H --> I[Return token + user data]
    I --> J[Store token in localStorage]
    J --> K[Redirect to dashboard]
```

### Username/Password Login Flow

```mermaid
graph TD
    A[User visits /auth/signin] --> B[Enter username/email + password]
    B --> C[POST /api/auth/signin]
    C --> D[Find user by username or email]
    D --> E[Verify password with bcrypt]
    E --> F{Valid?}
    F -->|Yes| G[Generate JWT token]
    G --> H[Return token + user data]
    H --> I[Store token in localStorage]
    I --> J[Redirect to dashboard]
    F -->|No| K[Return 401 error]
```

### Social Login Flow (Firebase)

```mermaid
graph TD
    A[User clicks Google/Twitter] --> B[Firebase Auth popup]
    B --> C[User authorizes]
    C --> D[Get Firebase ID token]
    D --> E[Store token in session]
    E --> F[API calls use Firebase token]
    F --> G[Server verifies with Firebase Admin SDK]
    G --> H[Get/create user in MongoDB]
    H --> I[Proceed with request]
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

### Unified Server-Side Authentication

All API routes use a single `verifyAuth()` function that handles both JWT and Firebase tokens seamlessly.

```typescript
// In any API route
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'

export async function GET(request: Request) {
  // Verify authentication (works for both JWT and Firebase)
  const authUser = await verifyAuth(request)

  // Get full user from database
  const user = await getUserFromAuth(authUser)

  // Proceed with authenticated request
  return Response.json({ user })
}
```

**How it works:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Detects token type (JWT starts with `eyJ`, Firebase is longer)
3. Verifies JWT signature OR Firebase token via Admin SDK
4. Returns unified `AuthUser` object with `userId`, `username`, `email`
5. Database lookup via username, email, or firebaseUid

## API Reference

### Username/Password Authentication (API Routes)

**Sign Up**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "armyfan123",
  "password": "SecurePass123",
  "email": "fan@example.com",      # optional
  "displayName": "ARMY Fan"        # optional
}

# Response
{
  "ok": true,
  "token": "eyJhbGc...",
  "user": { "id": "...", "username": "armyfan123", ... }
}
```

**Sign In**
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "usernameOrEmail": "armyfan123",  # can be username OR email
  "password": "SecurePass123"
}

# Response
{
  "ok": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Firebase Authentication (Client-Side)

**Social Sign In**
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

const provider = new GoogleAuthProvider()
const result = await signInWithPopup(auth, provider)
const token = await result.user.getIdToken()

// Use token in API calls
fetch('/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

**Sign Up (Email/Password - Legacy)**
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
