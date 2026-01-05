# Deployment Guide

Complete guide for deploying ARMYVERSE to Vercel.

## Prerequisites

- Node.js 18+ installed locally
- Git repository with your code
- Vercel account (free tier available)
- All required API keys and credentials

## Quick Deploy

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Select the repository
5. Configure project settings

### 3. Configure Build Settings

**Framework Preset:** Next.js  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`  
**Development Command:** `npm run dev`

Vercel auto-detects these for Next.js projects.

### 4. Add Environment Variables

Go to Settings → Environment Variables and add all required variables:

```env
MONGODB_URI=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
YOUTUBE_API_KEY=...
GROQ_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXTAUTH_SECRET=...
CRON_SECRET=...
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://your-domain.vercel.app/api/spotify/callback
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private
NEXT_PUBLIC_YT_THUMB_CDN=ytimg.com
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

**Important:** Select "Production" environment for all variables.

### 5. Deploy

Click "Deploy" button. Vercel will:
- Install dependencies
- Build the project
- Deploy to production
- Provide a production URL

## Post-Deployment Setup

### Update External Services

#### 1. Spotify Developer Dashboard
- Add production redirect URI: `https://your-domain.vercel.app/api/spotify/callback`
- Update in app settings

#### 2. Firebase Console
- Add authorized domain: `your-domain.vercel.app`
- Go to Authentication → Settings → Authorized domains

#### 3. Google Cloud Console (YouTube API)
- Add domain restriction if needed
- Update API key restrictions

### Test Deployment

1. Visit your production URL
2. Test authentication flow
3. Test Spotify connection
4. Verify cron jobs are scheduled
5. Check all features work

### Trigger Initial Cron Jobs

```bash
# Spotify trending data
curl -X POST https://your-domain.vercel.app/api/spotify/kworb/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# YouTube trending data
curl -X POST https://your-domain.vercel.app/api/youtube/kworb/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Vercel Configuration

### vercel.json

Already configured in the repository:

```json
{
  "crons": [
    {
      "path": "/api/spotify/kworb/cron",
      "schedule": "30 1 * * *"
    },
    {
      "path": "/api/youtube/kworb/cron",
      "schedule": "35 1 * * *"
    }
  ]
}
```

This enables automatic daily scraping at 1:30 AM and 1:35 AM UTC.

### Image Domains (next.config.js)

Already configured:

```javascript
{
  images: {
    domains: [
      'i.scdn.co',
      'image-cdn-ak.spotifycdn.com',
      'i.ytimg.com',
      'img.youtube.com',
      'res.cloudinary.com'
    ]
  }
}
```

## Custom Domain Setup

### Add Custom Domain

1. Vercel Dashboard → Your Project
2. Settings → Domains
3. Add domain (e.g., `armyverse.com`)
4. Follow DNS configuration instructions

### Update Environment Variables

After adding custom domain:

```env
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://armyverse.com/api/spotify/callback
NEXTAUTH_URL=https://armyverse.com
NEXT_PUBLIC_BASE_URL=https://armyverse.com
```

Redeploy after updating.

### Update External Services

- **Spotify**: Add `https://armyverse.com/api/spotify/callback`
- **Firebase**: Add `armyverse.com` to authorized domains

## Environment Management

### Multiple Environments

Vercel supports three environments:
- **Production** - Main branch deployments
- **Preview** - Pull request deployments
- **Development** - Local development

Set different variables per environment:

1. Settings → Environment Variables
2. Add variable
3. Select which environments to apply to

### Preview Deployments

Every pull request gets a unique preview URL:
- Automatic deployment
- Isolated environment
- Can use Preview-specific env vars

## Monitoring & Logs

### View Deployment Logs

1. Vercel Dashboard → Your Project
2. Deployments tab
3. Click on a deployment
4. View build and runtime logs

### Function Logs

1. Click on Functions tab
2. View logs for each API route
3. Filter by time, status, or search

### Analytics

Vercel provides:
- Page views
- Top pages
- Device types
- Geographic distribution
- Performance metrics

Access: Project → Analytics tab

## Performance Optimization

### Edge Runtime

Some API routes use Edge Runtime for faster responses:

```typescript
export const runtime = 'edge'
```

Already configured for:
- `/api/trending/*`
- `/api/spotify/kworb/latest`
- `/api/youtube/kworb/latest`

### Caching

Vercel automatically caches:
- Static assets (images, CSS, JS)
- API responses with cache headers
- Build outputs

Cache control headers already set in API routes:

```typescript
return Response.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
  }
})
```

### Image Optimization

Next.js Image component automatically optimizes:
- Responsive images
- WebP conversion
- Lazy loading
- Blur placeholders

## Troubleshooting

### Build Failures

**Check build logs:**
- Look for TypeScript errors
- Check for missing dependencies
- Verify environment variables

**Common issues:**
- Missing `MONGODB_URI` causes build to fail
- TypeScript errors block builds
- Dependency conflicts

**Solutions:**
```bash
# Locally test build
npm run build

# Check for type errors
npm run type-check

# Update dependencies
npm update
```

### Runtime Errors

**Check function logs:**
- 500 errors usually mean missing env vars
- 401 errors mean authentication issues
- 404 errors mean routing problems

**Common issues:**
- Firebase Admin SDK private key format
- MongoDB connection string
- Expired Spotify tokens

### Cron Jobs Not Running

**Check cron job status:**
1. Settings → Cron Jobs
2. View execution history
3. Check for errors

**Common issues:**
- `vercel.json` not committed to repo
- Incorrect cron schedule syntax
- Function timeout (max 10s for Hobby plan)

**Solution:**
```bash
# Manually trigger to test
curl -X POST https://your-domain.vercel.app/api/spotify/kworb/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Environment Variables Not Working

- Redeploy after adding/updating variables
- Check variable names (case-sensitive)
- Ensure selected correct environment
- For `NEXT_PUBLIC_*` vars, must rebuild

## Database Setup

### MongoDB Atlas

1. Create cluster (M0 free tier)
2. Create database user
3. Whitelist all IPs: `0.0.0.0/0` (required for Vercel)
4. Get connection string
5. Add to Vercel environment variables

### Connection Pooling

MongoDB connection is pooled automatically:

```typescript
// lib/db/mongoose.ts
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}
```

This prevents exhausting database connections.

## Security Considerations

### API Route Protection

All protected routes require authentication:

```typescript
const token = request.headers.get('authorization')?.split('Bearer ')[1]
const decodedToken = await verifyIdToken(token)
```

### Rate Limiting

Implement on critical endpoints:

```typescript
// Example rate limiting
const rateLimit = {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
}
```

### CORS Configuration

Already configured for API routes:

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

### Environment Variable Security

- Never commit `.env.local`
- Use Vercel's encrypted storage
- Rotate secrets regularly
- Use different keys for dev/prod

## Rollback

### Quick Rollback

1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click three dots (...)
4. Select "Promote to Production"

Instant rollback, no downtime.

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

## Scaling

### Vercel Pro Plan

Upgrade for:
- Longer function execution time (60s vs 10s)
- More build minutes
- Priority support
- Advanced analytics

### Database Scaling

MongoDB Atlas:
- Start with M0 (free, 512MB)
- Upgrade to M10 ($57/month) for production
- Scale up as needed

### Performance Tips

- Use Edge Runtime where possible
- Implement aggressive caching
- Optimize images with Next.js Image
- Lazy-load components
- Use React Server Components

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- Every push to `main` → Production
- Every pull request → Preview
- Every branch → Preview

### Deploy Hooks

Create webhook for manual triggers:

1. Settings → Git → Deploy Hooks
2. Create hook
3. Copy webhook URL
4. Trigger with:

```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/...
```

## Related Documentation

- [Environment Variables](./environment-variables.md) - Complete variable reference
- [Cron Jobs Setup](./cron-jobs.md) - Configuring automated tasks
- [Authentication](../features/authentication.md) - Setting up auth services
