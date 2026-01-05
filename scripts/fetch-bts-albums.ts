/**
 * Fetch BTS albums from Spotify API and store in database
 *
 * Usage: npx tsx scripts/fetch-bts-albums.ts
 */

import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import type { IAlbum } from '../lib/models/Album'

// Define Album model directly in script to avoid Next.js context issues
const albumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  spotifyId: { type: String, required: true, unique: true, index: true },
  isBTSFamily: { type: Boolean, default: false, index: true },
  tracks: [{
    name: { type: String, required: true },
    artist: { type: String, required: true },
    spotifyId: { type: String, required: true }
  }],
  trackCount: { type: Number, required: true },
  releaseDate: { type: Date },
  coverImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

albumSchema.index({ name: 1, artist: 1 })
albumSchema.index({ isBTSFamily: 1, trackCount: 1 })

const Album = (mongoose.models.Album || mongoose.model<IAlbum>('Album', albumSchema)) as mongoose.Model<IAlbum>

// Load environment variables
dotenv.config({ path: '.env.local' })

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const MONGODB_URI = process.env.MONGODB_URI

// BTS Spotify Artist IDs (Group + All Solo Members)
const BTS_ARTIST_IDS = {
  'BTS': '3Nrfpe0tUJi4K4DXYWgMUX',           // BTS Group
  'RM': '2auC28zjQyVTsiZKNgPRGs',            // RM
  'Jin': '5vV3bFXnN6D6N3Nj4xRvaV',          // Jin
  'SUGA': '0ebNdVaOfp6N0oZ1guIxM8',         // SUGA
  'j-hope': '0b1sIQumIAsNbqAoIClSpy',       // j-hope
  'Jimin': '1oSPZhvZMIrWW5I41kPkkY',        // Jimin
  'V': '3JsHnjpbhX4SnySpvpa9DK',            // V (Taehyung)
  'Jung Kook': '6HaGTQPmzraVmaVxvz6EUc',    // Jung Kook
  'Agust D': '5RmQ8k4l3HZ8JoPb4mNsML'       // Agust D (SUGA's alias)
}

interface SpotifyAlbum {
  id: string
  name: string
  artists: Array<{ name: string }>
  release_date: string
  images: Array<{ url: string }>
  total_tracks: number
}

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
}

/**
 * Get Spotify access token
 */
async function getSpotifyToken(): Promise<string> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not found in environment variables')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()
  return data.access_token
}

/**
 * Check if an album should be filtered out (remixes, instrumentals, etc.)
 */
function shouldFilterAlbum(albumName: string): boolean {
  const filterKeywords = [
    'remix', 'remixes', 'acoustic', 'instrumental',
    'sped up', 'slowed', 'karaoke', 'demo',
    '(+1db)', '(+2db)', '(+3db)', // Audio level variations
    'feat.', 'ft.', // Featuring/collaboration singles
    'ost', 'original television soundtrack', // OST singles
  ]

  const lowerName = albumName.toLowerCase()

  // Filter out if it contains any of these keywords
  for (const keyword of filterKeywords) {
    if (lowerName.includes(keyword)) {
      return true
    }
  }

  return false
}

/**
 * Fetch albums for a specific artist from Spotify
 */
async function fetchArtistAlbums(artistId: string, artistName: string, token: string): Promise<SpotifyAlbum[]> {
  const albums: SpotifyAlbum[] = []
  let offset = 0
  const limit = 50

  console.log(`  Fetching albums for ${artistName}...`)

  // For solo artists, also include singles. For BTS group, only albums
  const includeGroups = artistName === 'BTS' ? 'album' : 'album,single'

  while (true) {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=${includeGroups}&market=US&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    if (!data.items || data.items.length === 0) break

    // Filter out remixes, instrumentals, and duplicates
    const filteredItems = data.items.filter((album: SpotifyAlbum) => {
      // Only keep albums with at least 4 tracks (filter out true singles)
      if (album.total_tracks < 4) return false
      return !shouldFilterAlbum(album.name)
    })

    albums.push(...filteredItems)

    if (data.items.length < limit) break
    offset += limit

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`  ✅ Found ${albums.length} albums for ${artistName}`)
  return albums
}

/**
 * Fetch album tracks from Spotify
 */
async function fetchAlbumTracks(albumId: string, token: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  let offset = 0
  const limit = 50

  while (true) {
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    if (!data.items || data.items.length === 0) break

    tracks.push(...data.items)

    if (data.items.length < limit) break
    offset += limit

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return tracks
}

/**
 * Normalize album name for deduplication
 */
function normalizeAlbumName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content
    .replace(/\s*\[.*?\]\s*/g, '') // Remove brackets content
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

/**
 * Deduplicate albums by normalized name
 */
function deduplicateAlbums(albums: SpotifyAlbum[]): SpotifyAlbum[] {
  const seen = new Map<string, SpotifyAlbum>()

  for (const album of albums) {
    const normalizedName = normalizeAlbumName(album.name)

    if (!seen.has(normalizedName)) {
      seen.set(normalizedName, album)
    } else {
      // Keep the one with more tracks if there's a duplicate
      const existing = seen.get(normalizedName)!
      if (album.total_tracks > existing.total_tracks) {
        seen.set(normalizedName, album)
      }
    }
  }

  return Array.from(seen.values())
}

/**
 * Main function
 */
async function main() {
  console.log('🎵 Fetching BTS & Solo Member albums from Spotify...\n')

  try {
    // Connect to database
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables')
    }

    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Clean existing albums collection to start fresh
    const deleteResult = await Album.deleteMany({ isBTSFamily: true })
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing BTS albums\n`)

    // Get Spotify token
    const token = await getSpotifyToken()
    console.log('✅ Got Spotify access token\n')

    let totalProcessed = 0
    let totalSkipped = 0
    let allAlbums: SpotifyAlbum[] = []

    // Fetch albums for each artist (BTS + all solo members)
    for (const [artistName, artistId] of Object.entries(BTS_ARTIST_IDS)) {
      const albums = await fetchArtistAlbums(artistId, artistName, token)
      allAlbums.push(...albums)
      await new Promise(resolve => setTimeout(resolve, 500)) // Rate limiting between artists
    }

    console.log(`\n✅ Found ${allAlbums.length} albums before deduplication`)

    // Deduplicate albums
    allAlbums = deduplicateAlbums(allAlbums)

    console.log(`✅ ${allAlbums.length} unique albums after deduplication\n`)
    console.log('📥 Processing albums...\n')

    // Process each album
    for (const album of allAlbums) {
      try {
        // Check if album already exists
        const existing = await Album.findOne({ spotifyId: album.id })
        if (existing) {
          console.log(`⏭️  Skipped (exists): ${album.name} - ${album.artists[0].name}`)
          totalSkipped++
          continue
        }

        // Fetch full track list
        const tracks = await fetchAlbumTracks(album.id, token)

        // Create album document
        await Album.create({
          name: album.name,
          artist: album.artists[0].name,
          spotifyId: album.id,
          isBTSFamily: true,
          tracks: tracks.map(t => ({
            name: t.name,
            artist: t.artists[0].name,
            spotifyId: t.id
          })),
          trackCount: tracks.length,
          releaseDate: album.release_date ? new Date(album.release_date) : undefined,
          coverImage: album.images[0]?.url
        })

        console.log(`✅ Saved: ${album.name} - ${album.artists[0].name} (${tracks.length} tracks)`)
        totalProcessed++

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`❌ Error processing ${album.name}:`, error)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   Processed: ${totalProcessed}`)
    console.log(`   Skipped: ${totalSkipped}`)
    console.log(`   Total in DB: ${await Album.countDocuments({ isBTSFamily: true })}`)
    console.log(`\n✅ Done!`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

main()
