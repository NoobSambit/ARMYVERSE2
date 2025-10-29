# Environment Variables

Complete reference for all environment variables required by ARMYVERSE.

## Required Variables

### Database

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/armyverse?retryWrites=true&w=majority
```

**Where to get:**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (M0 free tier available)
3. Get connection string from cluster dashboard
4. Replace username and password

---

### Firebase Authentication (Client)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Where to get:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Create web app or view existing config
6. Copy all config values

---

### Firebase Admin SDK (Server)

```env
FIREBASE_CLIENT_EMAIL=service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n
```

**Where to get:**
1. Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Download JSON file
5. Extract `client_email` → `FIREBASE_CLIENT_EMAIL`
6. Extract `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters!)

**Important:** In Vercel, paste the entire private key including the `\n` line breaks as-is.

---

### Spotify API

```env
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://your-domain.com/api/spotify/callback
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private
```

**Where to get:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create new application
3. Copy Client ID and Client Secret
4. Add redirect URI in app settings (must match exactly)
5. Use scopes as shown above

**Required Scopes:**
- `user-read-private` - Read user profile
- `user-read-email` - Read user email
- `user-top-read` - Read top artists/tracks
- `user-read-recently-played` - Read listening history
- `playlist-read-private` - Read private playlists
- `playlist-modify-public` - Modify public playlists
- `playlist-modify-private` - Modify private playlists

---

### YouTube Data API

```env
YOUTUBE_API_KEY=your-youtube-api-key
NEXT_PUBLIC_YT_THUMB_CDN=ytimg.com
```

**Where to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable YouTube Data API v3
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key
6. (Optional) Restrict key to YouTube Data API v3

---

### Google AI (Gemini)

```env
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

**Where to get:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Enable Gemini API
4. Copy the key

**Used for:** AI playlist generation

---

### Cloudinary

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Where to get:**
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

**Used for:** Blog cover images, user avatars/banners, photocard storage

---

### NextAuth

```env
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=https://your-domain.com
```

**How to generate secret:**
```bash
openssl rand -base64 32
```

Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

**Production:** Set `NEXTAUTH_URL` to your actual domain  
**Development:** Use `http://localhost:3000`

---

### Cron Jobs

```env
CRON_SECRET=your-long-random-secret
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

**Generate secret:**
```bash
openssl rand -hex 32
```

**Used for:** Authenticating manual cron triggers for trending data scraping

---

### Optional Development Variables

```env
# Disable cron authentication in development
DISABLE_CRON_AUTH=1

# Set to development for debug logging
NODE_ENV=development
```

## Environment Files

### Local Development

Create `.env.local` file in project root:

```env
# Copy all variables from above
MONGODB_URI=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... etc
```

**Never commit `.env.local` to Git!**

### Production (Vercel)

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable one by one
5. Select environment (Production, Preview, Development)

### Template File

Use `env.local.example` as a template:

```bash
cp env.local.example .env.local
# Then fill in your actual values
```

## Validation Checklist

Before deploying, verify:

- [ ] All required variables are set
- [ ] MongoDB connection string is valid
- [ ] Firebase config matches project
- [ ] Firebase private key includes `\n` line breaks
- [ ] Spotify redirect URI matches exactly
- [ ] YouTube API key is unrestricted or allows your domain
- [ ] Cloudinary credentials are correct
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] CRON_SECRET is long and random

## Security Best Practices

### Never Expose
❌ Do not commit `.env.local` to Git  
❌ Do not log sensitive values  
❌ Do not send in client-side code  
❌ Do not share in screenshots  

### Always Protect
✅ Use environment variables  
✅ Add `.env.local` to `.gitignore`  
✅ Use different keys for dev/prod  
✅ Rotate secrets regularly  
✅ Restrict API keys to specific domains  

### Vercel Deployment
- Environment variables are encrypted at rest
- Only accessible to your project
- Can be different per environment (Production/Preview/Development)
- Updated variables require redeployment

## Troubleshooting

### "Missing environment variable" error
- Check variable name spelling (case-sensitive)
- Ensure variable is set in correct environment
- Restart dev server after adding variables
- Redeploy on Vercel after updating

### Firebase Admin SDK errors
- Verify `FIREBASE_PRIVATE_KEY` includes `\n` line breaks
- Check `FIREBASE_CLIENT_EMAIL` format
- Ensure service account has correct permissions

### Spotify OAuth failing
- Verify redirect URI matches exactly (including http/https)
- Check client ID and secret are correct
- Ensure all required scopes are included

### MongoDB connection issues
- Check connection string format
- Verify IP whitelist (use 0.0.0.0/0 for all)
- Ensure database user has correct permissions

## Quick Copy Templates

### Development (.env.local)

```env
# Database
MONGODB_URI=

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private

# YouTube
YOUTUBE_API_KEY=
NEXT_PUBLIC_YT_THUMB_CDN=ytimg.com

# Google AI
GOOGLE_AI_API_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Cron
CRON_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Development
DISABLE_CRON_AUTH=1
NODE_ENV=development
```

### Production (Vercel)

Same as above, but:
- Change `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` to production domain
- Change `NEXTAUTH_URL` to production domain
- Change `NEXT_PUBLIC_BASE_URL` to production domain
- Remove `DISABLE_CRON_AUTH`
- Remove `NODE_ENV` (Vercel sets automatically)

## Related Documentation

- [Deployment Guide](./deployment.md) - Setting up Vercel
- [Cron Jobs Setup](./cron-jobs.md) - Configuring automated tasks
- [Authentication](../features/authentication.md) - Firebase & Spotify setup details
