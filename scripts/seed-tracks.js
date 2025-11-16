#!/usr/bin/env node
'use strict'

// Seed BTS + members tracks (including collabs) into MongoDB
// Usage:
//   node scripts/seed-tracks.js [--wipe-all] [--dry-run]
// Env required:
//   MONGODB_URI, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

// --- Config ---
const ARTISTS = [
  { id: '3Nrfpe0tUJi4K4DXYWgMUX', name: 'BTS' },
  { id: '5vV3bFXnN6D6N3Nj4xRvaV', name: 'JIN' },
  { id: '5RmQ8k4l3HZ8JoPb4mNsML', name: 'AGUST D' },
  { id: '0ebNdVaOfp6N0oZ1guIxM8', name: 'SUGA' },
  { id: '0b1sIQumIAsNbqAoIClSpy', name: 'j-hope' },
  { id: '2auC28zjQyVTsiZKNgPRGs', name: 'RM' },
  { id: '1oSPZhvZMIrWW5I41kPkkY', name: 'Jimin' },
  { id: '3JsHnjpbhX4SnySpvpa9DK', name: 'V' },
  { id: '6HaGTQPmzraVmaVxvz6EUc', name: 'Jung Kook' }
]

const SPOTIFY_BASE = 'https://api.spotify.com/v1'
const FETCH_DELAY_MS = 120 // small delay between Spotify calls to avoid 429s

function parseArgs(argv) {
  const args = {
    wipeAll: argv.includes('--wipe-all'),
    dryRun: argv.includes('--dry-run'),
    noFeatures: argv.includes('--no-features'),
    noPopularity: argv.includes('--no-popularity'),
    verbose: argv.includes('--verbose'),
  }
  if (argv.includes('--fast')) {
    args.noFeatures = true
    args.noPopularity = true
  }
  return args
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fetchJson(url, opts = {}, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, opts)
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') || '1', 10)
      const wait = (retryAfter || (attempt + 1)) * 1000
      console.log(`⏳ Rate limited. Retrying in ${wait}ms ...`)
      await sleep(wait)
      continue
    }
    if (res.ok) return res.json()
    if (res.status >= 500 && attempt < retries) {
      const wait = (attempt + 1) * 500
      console.log(`⚠️ Spotify ${res.status}. Retrying in ${wait}ms ...`)
      await sleep(wait)
      continue
    }
    const text = await res.text()
    throw new Error(`Spotify error ${res.status}: ${text}\nURL: ${url}`)
  }
}

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Missing SPOTIFY_CLIENT_ID/SECRET')
  const body = new URLSearchParams({ grant_type: 'client_credentials' }).toString()
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    },
    body
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Token error: ${JSON.stringify(data)}`)
  return data.access_token
}

async function fetchAllAlbums(artistId, token) {
  const items = []
  let url = `${SPOTIFY_BASE}/artists/${artistId}/albums?limit=50&include_groups=album,single,appears_on`
  while (url) {
    await sleep(FETCH_DELAY_MS)
    const page = await fetchJson(url, { headers: { Authorization: `Bearer ${token}` } })
    const pageItems = (page.items || []).filter(a => {
      const type = (a.album_type || '').toLowerCase()
      if (type === 'compilation') return false
      const name = (a.name || '').toLowerCase()
      // Heuristic filters for label/anthology compilations
      const compHints = ['the best', 'best of', 'greatest', 'essentials', 'collection', 'anthology', 'complete', 'deluxe edition (remastered)']
      return !compHints.some(h => name.includes(h))
    })
    items.push(...pageItems)
    url = page.next
  }
  // de-duplicate by album id (Spotify sometimes returns duplicates across markets)
  const map = new Map()
  for (const a of items) map.set(a.id, a)
  return Array.from(map.values())
}

async function fetchAlbumTracks(album, token, filterArtistId) {
  const out = []
  let url = `${SPOTIFY_BASE}/albums/${album.id}/tracks?limit=50`
  while (url) {
    await sleep(FETCH_DELAY_MS)
    const page = await fetchJson(url, { headers: { Authorization: `Bearer ${token}` } })
    const tracks = (page.items || []).filter(t => Array.isArray(t.artists) && t.artists.some(a => a.id === filterArtistId))
    for (const t of tracks) {
      out.push({
        id: t.id,
        name: t.name,
        artists: t.artists,
        duration_ms: t.duration_ms,
        explicit: !!t.explicit,
        preview_url: t.preview_url,
        album
      })
    }
    url = page.next
  }
  return out
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function parseReleaseDate(dateStr, precision) {
  if (!dateStr) return null
  try {
    if (precision === 'year') return new Date(`${dateStr}-01-01T00:00:00Z`)
    if (precision === 'month') return new Date(`${dateStr}-01T00:00:00Z`)
    return new Date(`${dateStr}T00:00:00Z`)
  } catch { return null }
}

async function enrichPopularity(trackIds, token, { verbose } = { verbose: false }) {
  const pop = new Map()
  const groups = chunk(trackIds, 50)
  console.log(`🔎 Enriching popularity in ${groups.length} groups of up to 50`)
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi]
    try {
      await sleep(FETCH_DELAY_MS)
      const ids = group.join(',')
      const data = await fetchJson(`${SPOTIFY_BASE}/tracks?ids=${ids}`, { headers: { Authorization: `Bearer ${token}` } })
      for (const t of data.tracks || []) {
        if (t && t.id) pop.set(t.id, t.popularity || 0)
      }
    } catch (e) {
      const msg = e && e.message ? e.message : String(e)
      console.warn(`⚠️ Popularity group ${gi + 1}/${groups.length} failed: ${msg}`)
      // Fallback: binary split to isolate bad IDs (403 sometimes triggered by specific IDs)
      for (const id of group) {
        try {
          await sleep(FETCH_DELAY_MS)
          const data = await fetchJson(`${SPOTIFY_BASE}/tracks?ids=${id}`, { headers: { Authorization: `Bearer ${token}` } })
          const t = (data.tracks || [])[0]
          if (t && t.id) pop.set(t.id, t.popularity || 0)
        } catch (e2) {
          if (verbose) console.warn(`   ↪︎ Skipping track for popularity (id=${id}): ${e2 && e2.message ? e2.message : e2}`)
        }
      }
    }
  }
  return pop
}

async function enrichAudioFeatures(trackIds, token, { verbose } = { verbose: false }) {
  const feats = new Map()
  const groups = chunk(trackIds, 100)
  console.log(`🔎 Enriching audio features in ${groups.length} groups of up to 100`)
  let skipped = 0
  let filled = 0
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi]
    try {
      await sleep(FETCH_DELAY_MS)
      const ids = group.join(',')
      const data = await fetchJson(`${SPOTIFY_BASE}/audio-features?ids=${ids}`, { headers: { Authorization: `Bearer ${token}` } })
      for (const f of data.audio_features || []) {
        if (f && f.id) {
          feats.set(f.id, {
            danceability: f.danceability,
            energy: f.energy,
            valence: f.valence,
            tempo: f.tempo,
            acousticness: f.acousticness,
            instrumentalness: f.instrumentalness,
            liveness: f.liveness,
            speechiness: f.speechiness
          })
          filled++
        } else {
          skipped++
        }
      }
    } catch (e) {
      const msg = e && e.message ? e.message : String(e)
      console.warn(`⚠️ Audio-features group ${gi + 1}/${groups.length} failed: ${msg}`)
      // Fallback: per-id fetch to skip problematic ones
      for (const id of group) {
        try {
          await sleep(FETCH_DELAY_MS)
          const data = await fetchJson(`${SPOTIFY_BASE}/audio-features/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          const f = data
          if (f && f.id) {
            feats.set(f.id, {
              danceability: f.danceability,
              energy: f.energy,
              valence: f.valence,
              tempo: f.tempo,
              acousticness: f.acousticness,
              instrumentalness: f.instrumentalness,
              liveness: f.liveness,
              speechiness: f.speechiness
            })
            filled++
          } else {
            skipped++
          }
        } catch (e2) {
          if (verbose) console.warn(`   ↪︎ Skipping track for audio-features (id=${id}): ${e2 && e2.message ? e2.message : e2}`)
          skipped++
        }
      }
    }
  }
  console.log(`ℹ️ Audio-features summary: filled=${filled}, skipped=${skipped}`)
  return feats
}

function buildTrackDoc(t) {
  const images = Array.isArray(t.album.images) ? t.album.images : []
  const large = images[0]?.url || null
  const medium = images[1]?.url || large
  const small = images[2]?.url || medium
  return {
    spotifyId: t.id,
    name: t.name,
    artist: (t.artists || []).map(a => a.name).join(', '),
    album: t.album.name,
    duration: t.duration_ms,
    isBTSFamily: true,
    releaseDate: parseReleaseDate(t.album.release_date, t.album.release_date_precision),
    genres: [],
    audioFeatures: undefined,
    thumbnails: { small, medium, large },
    previewUrl: t.preview_url || null,
    isExplicit: !!t.explicit,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

async function main() {
  const args = parseArgs(process.argv)

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) throw new Error('MONGODB_URI is required')

  console.log('🔗 Connecting to MongoDB...')
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 })

  // Define Track schema to match lib/models/Track.ts
  const trackSchema = new mongoose.Schema({
    spotifyId: { type: String, required: true, unique: true },
    youtubeId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    duration: { type: Number, required: true },
    popularity: { type: Number, min: 0, max: 100 },
    isBTSFamily: { type: Boolean, default: false, index: true },
    releaseDate: Date,
    genres: [String],
    audioFeatures: {
      danceability: Number,
      energy: Number,
      valence: Number,
      tempo: Number,
      acousticness: Number,
      instrumentalness: Number,
      liveness: Number,
      speechiness: Number
    },
    thumbnails: { small: String, medium: String, large: String },
    previewUrl: String,
    isExplicit: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  })
  trackSchema.pre('save', function(next) { this.updatedAt = new Date(); next() })
  const Track = mongoose.models.Track || mongoose.model('Track', trackSchema)

  const token = await getSpotifyToken()
  console.log('🔑 Got Spotify app token')

  // Clean existing BTS-family docs
  if (!args.dryRun) {
    const delFilter = args.wipeAll ? {} : { isBTSFamily: true }
    const delRes = await Track.deleteMany(delFilter)
    console.log(`🧹 Cleared existing tracks (${args.wipeAll ? 'ALL' : 'BTS family'}) -> deleted ${delRes.deletedCount}`)
  } else {
    console.log('🧪 Dry run enabled - not deleting existing data')
  }

  const trackMap = new Map() // id -> doc
  for (const artist of ARTISTS) {
    console.log(`\n🎤 Processing artist: ${artist.name}`)
    const albums = await fetchAllAlbums(artist.id, token)
    console.log(`   • Albums fetched (filtered): ${albums.length}`)

    for (const album of albums) {
      const tracks = await fetchAlbumTracks(album, token, artist.id)
      for (const t of tracks) {
        if (!trackMap.has(t.id)) {
          trackMap.set(t.id, buildTrackDoc(t))
        }
      }
    }
  }

  const allIds = Array.from(trackMap.keys())
  console.log(`\n📦 Total unique tracks collected: ${allIds.length}`)

  // Enrich with popularity (resilient)
  if (args.noPopularity) {
    console.log('⏭️  Skipping popularity enrichment (flag --no-popularity)')
  } else {
    try {
      const popMap = await enrichPopularity(allIds, token, { verbose: args.verbose })
      for (const id of allIds) {
        const d = trackMap.get(id)
        d.popularity = popMap.get(id) ?? d.popularity
      }
    } catch (e) {
      console.warn('⚠️ Popularity enrichment failed entirely; proceeding without popularity for some/all tracks')
    }
  }

  // Enrich with audio features (resilient)
  if (args.noFeatures) {
    console.log('⏭️  Skipping audio-features enrichment (flag --no-features)')
  } else {
    try {
      const featsMap = await enrichAudioFeatures(allIds, token, { verbose: args.verbose })
      for (const id of allIds) {
        const d = trackMap.get(id)
        const f = featsMap.get(id)
        if (f) d.audioFeatures = f
      }
    } catch (e) {
      console.warn('⚠️ Audio features enrichment failed entirely; proceeding without audio features for some/all tracks')
    }
  }

  const docs = Array.from(trackMap.values())
  let added = 0

  if (args.dryRun) {
    console.log('🧪 Dry run summary: would insert', docs.length, 'tracks')
  } else {
    for (const d of docs) {
      try {
        await Track.create(d)
        added++
        console.log(`➕ Added: ${d.artist} — ${d.name} (${d.album})`)
      } catch (e) {
        if (e && e.code === 11000) {
          console.log(`↩︎ Skipped duplicate: ${d.artist} — ${d.name}`)
        } else {
          console.log(`❌ Failed to add ${d.artist} — ${d.name}: ${e && e.message ? e.message : e}`)
        }
      }
    }
  }

  console.log(`\n✅ Seeding complete. Tracks added: ${added}/${docs.length}`)

  await mongoose.disconnect()
  console.log('🔌 MongoDB disconnected')
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Seed failed:', err && err.message ? err.message : err)
    process.exit(1)
  })
}
