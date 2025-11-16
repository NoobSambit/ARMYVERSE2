# BTS Track Seeding Script

The script at `scripts/seed-tracks.js` rebuilds the BTS + solo member discography in MongoDB (`tracks` collection). It fetches Spotify catalog data, removes stale entries, and inserts fresh documents that match `lib/models/Track.ts`.

---

## Prerequisites
- `MONGODB_URI`, `SPOTIFY_CLIENT_ID`, and `SPOTIFY_CLIENT_SECRET` must be defined in `.env.local`.
- Ensure the Spotify credentials have access to the artist catalog (client credentials flow).
- Install dependencies: `npm install`.

---

## Standard Run
```bash
npm run seed:tracks
```
- Deletes existing BTS-family tracks (`isBTSFamily: true`) and repopulates them.
- Fetches albums for BTS and each solo artist, including collaborations (`appears_on`).
- Automatically filters obvious compilation releases.
- Logs every inserted track and prints a final total.

---

## Flags
- `--wipe-all` – deletes the **entire** `tracks` collection before seeding.
- `--dry-run` – performs all Spotify fetches but skips Mongo deletions/inserts.
- `--no-features` – skips Spotify audio-feature enrichment (avoids 403 errors from restricted IDs).
- `--no-popularity` – skips popularity lookups.
- `--fast` – shortcut for `--no-features --no-popularity`.
- `--verbose` – logs each skipped ID when enrichment endpoints return errors.

Example (full wipe without audio features):
```bash
npm run seed:tracks -- --wipe-all --no-features
```

---

## Data Model
Inserted documents align with `lib/models/Track.ts`, including:
- `spotifyId`, `name`, `artist`, `album`, `duration`
- `popularity` (0–100, optional if enrichment skipped)
- `isBTSFamily: true`
- `releaseDate`, `genres` (empty array by default)
- `audioFeatures` object (only when enrichment enabled)
- `thumbnails.small|medium|large`
- `previewUrl`, `isExplicit`, `createdAt`, `updatedAt`

---

## Logging & Output
- Per-artist sections show album counts.
- Each inserted track is logged with `➕ Added: <artist> — <track> (<album>)`.
- Final summary: `✅ Seeding complete. Tracks added: X/Y`.
- On errors, the script prints Spotify URLs and reason codes to help identify restricted tracks.

---

## Troubleshooting
- **403 during audio features**: Certain tracks block `audio-features` with client-credential tokens. Re-run with `--no-features`, or use `--verbose` to list offending IDs.
- **Mongo connection errors**: Verify `MONGODB_URI` and whitelist the IP in Atlas.
- **Duplicate key errors**: Safe to ignore; the script skips duplicates and continues.
- **Slow runs / Spotify rate limits**: The script already backs off on 429s. If needed, increase `FETCH_DELAY_MS` inside the script.

---

## Updating Existing Records
Re-running the script always clears the target documents first (full wipe with `--wipe-all`, or BTS-family only by default). This ensures the collection reflects the latest catalog and collaborations across the defined artist list.
