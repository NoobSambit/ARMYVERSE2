# Spotify Per-User Playlist Export (BYO) and Owner Fallback

This feature allows users to export playlists directly to their own Spotify account when connected, while preserving the existing fallback that publishes to the ArmyVerse owner account when the user is not connected.

- Owner fallback continues to work with `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_PLAYLIST_REFRESH_TOKEN` (and optional `SPOTIFY_PLAYLIST_OWNER_ID`).
- Per-user export supports two user auth modes:
  - Standard: centralized ArmyVerse app + user consent tokens stored in `integrations.spotify`.
  - BYO (Bring Your Own app): user supplies their own Spotify app credentials; tokens are stored encrypted in `integrations.spotifyByo`.

## How it works

- If a request to `POST /api/playlist/export` includes `Authorization: Bearer <spotify_access_token>`, the playlist is created in that Spotify user’s account.
- If no Authorization bearer is provided, the export uses the owner credentials and creates the playlist under the ArmyVerse account.
- If an Authorization header is present but invalid/expired, the API returns `401` and does not fall back, allowing the client to refresh tokens and retry.

### Modes

- user mode: requires a valid Spotify access token in the `Authorization` header.
- owner mode: no `Authorization` header; uses owner refresh token configured in env.

## Frontend UX

- Connection UI is under `Profile → Connections`.
  - Standard connection: user authorizes with the ArmyVerse Spotify app and we store tokens in `integrations.spotify`.
  - BYO connection: user enters their own Spotify app Client ID and optional Client Secret, we generate an authorization URL, and store tokens in `integrations.spotifyByo` encrypted.
- Export buttons/pages try to include a Spotify user access token if available; otherwise they rely on owner fallback.
- If the API response returns `mode: "owner"`, the UI should warn that the playlist was saved under the ArmyVerse account.

## Implementation

### API routes

- `app/api/playlist/export/route.ts`
  - `GET`: diagnostics. If a user token is provided, returns `{ tokenValid: true, mode: 'user', userData }`. Otherwise returns `{ tokenValid: true, mode: 'owner', ownerUserId }`. Invalid bearer returns `401`.
  - `POST`: creates a playlist under user or owner depending on presence/validity of `Authorization` bearer. Returns `{ success, playlistUrl, tracksAdded, totalSongs, mode }`.

- `app/api/spotify/status/route.ts`
  - Returns connection status and an accessToken for the client. Prefers BYO (`integrations.spotifyByo`) with on-demand refresh via `lib/spotify/userTokens.ts`. Falls back to standard `integrations.spotify`. Response includes `mode: 'byo' | 'standard'` when connected.

- `app/api/spotify/client-credentials/route.ts`
  - BYO entrypoint. Accepts `{ clientId, clientSecret? }`. Creates a pending BYO state with optional PKCE and returns the Spotify authorization URL. Requires Firebase ID token in Authorization.

- `app/api/spotify/callback/route.ts`
  - Handles two cases:
    - BYO: detects `pending.spotifyByo.state`, exchanges the code using client secret or PKCE, fetches `/me`, and persists encrypted refresh token and metadata to `integrations.spotifyByo`.
    - Standard: existing HMAC-signed state flow using the centralized ArmyVerse app.

- `app/api/spotify/disconnect-byo/route.ts`
  - Deletes BYO credentials and pending state for the current user.

### Libraries and helpers

- `lib/utils/secrets.ts`: AES-256-GCM helper to encrypt/decrypt BYO secrets with `SPOTIFY_USER_SECRET_KEY`.
- `lib/spotify/userTokens.ts`: refreshes BYO access tokens using user-provided client credentials (with or without secret) and persists expiry/scopes.

### Data model

File: `lib/models/User.ts`

- `integrations.spotify`: existing centralized user tokens.
- `integrations.spotifyByo`:
  - `clientIdEnc`, `clientSecretEnc`, `refreshTokenEnc`: encrypted values at rest.
  - `ownerId`, `displayName`, `avatarUrl`, `scopes`, `tokenType`, `expiresAt`, `updatedAt`.
- `pending.spotifyByo`:
  - Temporary state for OAuth exchange: `state`, encrypted `clientIdEnc`, optional `clientSecretEnc`, optional `codeVerifierEnc`, `scopes`, `createdAt`.

### Environment variables

- Owner flow (unchanged):
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - `SPOTIFY_PLAYLIST_REFRESH_TOKEN`
  - `SPOTIFY_PLAYLIST_OWNER_ID` (optional)

- BYO encryption key:
  - `SPOTIFY_USER_SECRET_KEY` (required for per-user encryption)

- Frontend config:
  - `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`
  - `NEXT_PUBLIC_SPOTIFY_SCOPES`

See `docs/setup/environment-variables.md` and `env.local.example`.

## Frontend updates

- `components/profile/ConnectionsForm.tsx`
  - New BYO panel to collect Client ID and optional Client Secret.
  - Starts BYO flow via `POST /api/spotify/client-credentials`, redirects to Spotify authorize URL.
  - Shows BYO connection status using `/api/spotify/status` `mode`.
  - Disconnects via `POST /api/spotify/disconnect-byo`.

- `components/buttons/ExportToSpotifyButton.tsx`
  - Sends `Authorization: Bearer <token>` when available and retries on `401`. If no token, exports in owner mode.

- Manual + streaming focused page: `app/create-playlist/page.tsx`
  - Updated `handleSaveToSpotify()` to include the Spotify user token when available (retrieved via `useSpotifyAuth`) and retry once on `401`. If no token, falls back to owner mode automatically.
  - Updated info banner copy to reflect user export vs owner fallback.

- AI playlist page: `app/ai-playlist/page.tsx`
  - Posts with `Authorization` from `useSpotifyAuth` when available and retries on `401`. If no token, exports in owner mode.

## Client integration example

When a page builds its own export call:

```ts
const token = status?.accessToken || (await refreshStatus())?.accessToken;
await fetch('/api/playlist/export', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify({ name, songs }),
});
```

If `token` is omitted, the backend uses owner mode.

## Security

- BYO credentials (client secret, refresh token) are encrypted at rest with AES-256-GCM using `SPOTIFY_USER_SECRET_KEY`.
- Pending states are stored server-side and matched during callback to prevent state tampering. Optionally, you can enforce an expiry check on `pending.spotifyByo.createdAt` for stricter CSRF.
- User bearer tokens are validated with `GET /v1/me` before performing playlist operations.

## Error handling

- `401 Unauthorized` when user bearer is present but invalid/expired. Client should refresh via `/api/spotify/status` and retry once.
- `403 Forbidden` when playlist creation or track addition is denied by Spotify (insufficient scopes or account restrictions).
- All other failures return a 5xx with a generic error and log details server-side.

## Limitations

- BYO requires users to add their Spotify account to the app’s "User Management" on the Spotify Dashboard if the app is in development mode.
- Scopes must include `playlist-modify-public`, `playlist-modify-private`, and `user-read-private` at minimum for BYO to export playlists.

## Testing / QA checklist

- Owner fallback:
  - With no Authorization header, export succeeds and playlist appears under owner account.
- Standard user flow:
  - Connect Spotify via standard flow, export from AI/manual/streaming pages → playlist appears under user account.
  - Expire token and ensure the client refreshes and retries successfully.
- BYO flow:
  - Enter Client ID (and optionally Client Secret), authorize, ensure `/api/spotify/status` returns `mode: 'byo'`.
  - Export from AI/manual/streaming pages → playlist appears under the user’s account.
  - Disconnect BYO; ensure status switches off BYO and fallback to owner works.

## File references

- Export: `app/api/playlist/export/route.ts`
- BYO endpoints:
  - `app/api/spotify/client-credentials/route.ts`
  - `app/api/spotify/callback/route.ts`
  - `app/api/spotify/disconnect-byo/route.ts`
  - `app/api/spotify/status/route.ts`
- Model: `lib/models/User.ts`
- Crypto: `lib/utils/secrets.ts`
- BYO token refresh: `lib/spotify/userTokens.ts`
- Frontend pages:
  - AI: `app/ai-playlist/page.tsx`
  - Manual + Streaming focused: `app/create-playlist/page.tsx`
  - Connections UI: `components/profile/ConnectionsForm.tsx`
