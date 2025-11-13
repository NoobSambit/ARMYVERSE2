# Spotify Owner Playlist Credentials

This guide explains how to generate and maintain the Spotify credentials used for centralized playlist exports. Follow these steps whenever you need to onboard a new owner account or regenerate credentials.

## Prerequisites

- Spotify Developer app with `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` already configured.
- Redirect URI added to the app settings matching your deployment (for production: `https://armyverse.vercel.app/api/spotify/callback`).
- The owner Spotify account logged in on the browser you will use for authorization.

## 1. Authorize the Owner Account

1. Open an incognito window so you can capture the code cleanly.
2. Paste the authorization URL (replace the client ID and redirect URI if different):
   ```text
   https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=https%3A%2F%2Farmyverse.vercel.app%2Fapi%2Fspotify%2Fcallback&scope=playlist-modify-public%20playlist-modify-private
   ```
3. Approve Spotify access when prompted. Spotify redirects back to `https://armyverse.vercel.app/api/spotify/callback?code=...`.

### Capturing the Authorization Code

Because the app redirects from `/api/spotify/callback` to `/stats`, the `code` disappears from the address bar. Use one of the following:

- **Browser DevTools** → Network tab → enable *Preserve log* → find the request to `/api/spotify/callback` → copy the `code` parameter from the Request URL.
- **Cancel the redirect** by hitting `Esc` immediately after the callback loads and copy the URL.
- **Local redirect (optional)**: temporarily set the redirect URI to `http://localhost:3000/api/spotify/callback`, run the app locally, and repeat the flow so the code remains in the URL.

## 2. Exchange the Code for Tokens

Run the token exchange within a few minutes—the authorization code expires quickly and can only be used once.

```bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u YOUR_CLIENT_ID:YOUR_CLIENT_SECRET \
  -d "grant_type=authorization_code&code=THE_CODE&redirect_uri=https://armyverse.vercel.app/api/spotify/callback"
```

Copy the `refresh_token` from the JSON response. The `access_token` is short-lived (~1 hour) and only needed to verify the account.

## 3. (Optional) Capture the Owner User ID

Use the access token from the previous step to query the Spotify profile and copy the `id` field:

```bash
curl https://api.spotify.com/v1/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Store this value as `SPOTIFY_PLAYLIST_OWNER_ID`. If omitted, the API route will look it up automatically on each request.

## 4. Update Environment Variables

Set the following values in Vercel (and optionally in `.env.local` for local testing):

```env
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_PLAYLIST_REFRESH_TOKEN=...
SPOTIFY_PLAYLIST_OWNER_ID=... # optional
```

After saving, redeploy the application so `app/api/playlist/export/route.ts` can use the new credentials.

## 5. Verify the Credentials

1. Deploy the updated environment.
2. Hit `GET https://your-domain.com/api/playlist/export` to confirm the diagnostics:
   ```json
   { "tokenValid": true, "ownerUserId": "YOUR_OWNER_ID" }
   ```
3. Use `Create Playlist` or `AI Playlist` in the app and ensure the returned link opens under the owner Spotify account.

## Maintenance Notes

- Refresh tokens remain valid until you revoke the app or change critical settings. No routine rotation is required.
- If the owner disconnects the app, regenerates the client secret, or you update scopes/redirect URIs, repeat the entire process to obtain a new refresh token.
- Keep refresh tokens secret. Do not commit them to source control or expose them in client-side code.
