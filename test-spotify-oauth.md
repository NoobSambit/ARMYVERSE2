# Spotify OAuth Flow Test Plan

## 1. Spotify Developer Dashboard Configuration

### Required Redirect URIs:
- ✅ `https://armyverse.vercel.app/api/spotify/callback` (Production)
- ❌ `http://localhost:3000/api/spotify/callback` (Development - NEEDS TO BE ADDED)

### Environment Variables Required:
```env
SPOTIFY_CLIENT_ID="b41dc354c04b4e1dad741ae54a61ea9c"
SPOTIFY_CLIENT_SECRET="your-client-secret-from-dashboard"
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI="https://armyverse.vercel.app/api/spotify/callback"
NEXT_PUBLIC_SPOTIFY_SCOPES="user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private"
NEXTAUTH_SECRET="your-random-secret-string"
NEXTAUTH_URL="https://armyverse.vercel.app"
```

## 2. Test Steps

### Step 1: Environment Setup
- [ ] Add localhost redirect URI to Spotify dashboard
- [ ] Set all environment variables in Vercel
- [ ] Deploy the updated code

### Step 2: Authentication Flow Test
1. Navigate to `https://armyverse.vercel.app/stats`
2. Click "Connect with Spotify"
3. Should redirect to Spotify authorization page
4. Authorize the app
5. Should redirect back to `/stats?auth=success&token=...`
6. Should display the dashboard with user data

### Step 3: Dashboard Display Test
- [ ] User profile loads correctly
- [ ] Top artists display
- [ ] Recent tracks display
- [ ] BTS analytics work
- [ ] Charts and visualizations render

## 3. Expected Behavior

### Before Authentication:
- Shows SpotifyAuth component with "Connect with Spotify" button
- No error messages

### During Authentication:
- Button shows "Connecting..." with spinner
- Redirects to Spotify authorization page

### After Authentication:
- Redirects back to stats page
- Shows loading state while fetching data
- Displays full dashboard with user's Spotify data

## 4. Common Issues & Solutions

### Issue: "Failed to get authentication URL"
**Cause:** Missing environment variables
**Solution:** Ensure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set

### Issue: "Invalid redirect URI"
**Cause:** Redirect URI mismatch
**Solution:** Add exact redirect URI to Spotify dashboard

### Issue: "Token exchange failed"
**Cause:** Invalid client secret or redirect URI
**Solution:** Double-check credentials and redirect URI

### Issue: Dashboard doesn't load data
**Cause:** Missing scopes or API permissions
**Solution:** Ensure all required scopes are included

## 5. Debugging Commands

### Check Environment Variables:
```bash
# In Vercel dashboard, verify these are set:
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
NEXT_PUBLIC_SPOTIFY_SCOPES
```

### Check API Responses:
- Monitor browser network tab during auth flow
- Check Vercel function logs for API errors
- Verify token exchange in callback route

## 6. Success Criteria

✅ User can authenticate with Spotify
✅ Dashboard displays user's music data
✅ BTS analytics work correctly
✅ Charts and visualizations render
✅ No console errors
✅ Responsive design works on all devices 