import { QuestDefinition } from '@/lib/models/QuestDefinition'
import { Track } from '@/lib/models/Track'
import { dailyKey, weeklyKey } from './quests'

/**
 * Seeded random number generator for deterministic selection
 */
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const x = Math.sin(hash++) * 10000
  return x - Math.floor(x)
}

/**
 * Shuffle array deterministically based on seed
 */
function shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const arr = [...array]
  let counter = 0
  const rng = () => seededRandom(seed + counter++)

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Select random BTS tracks from database for daily quest (5 songs, 5 streams each)
 */
export async function selectDailySongs(date = new Date()): Promise<Array<{ trackName: string; artistName: string; count: number }>> {
  const seed = dailyKey(date)

  // Fetch BTS tracks from database
  const tracks = await Track.find({ isBTSFamily: true }).lean()

  if (tracks.length === 0) {
    throw new Error('No BTS tracks found in database')
  }

  // Shuffle and pick 5 tracks
  const shuffled = shuffleWithSeed(tracks, seed)
  const selected = shuffled.slice(0, 5)

  return selected.map(t => ({
    trackName: t.name,
    artistName: t.artist,
    count: 5 // each song needs 5 streams
  }))
}

/**
 * Select random albums from database for daily quest (2 albums, 1 full stream each)
 */
export async function selectDailyAlbums(date = new Date()): Promise<Array<{ albumName: string; trackCount: number }>> {
  const seed = dailyKey(date) + '_albums'

  // Get unique albums from BTS tracks
  const tracks = await Track.find({ isBTSFamily: true }).lean()
  const albumMap = new Map<string, number>()

  for (const track of tracks) {
    const count = albumMap.get(track.album) || 0
    albumMap.set(track.album, count + 1)
  }

  const albums = Array.from(albumMap.entries()).map(([name, trackCount]) => ({ name, trackCount }))

  if (albums.length === 0) {
    throw new Error('No BTS albums found in database')
  }

  // Shuffle and pick 2 albums
  const shuffled = shuffleWithSeed(albums, seed)
  const selected = shuffled.slice(0, 2)

  return selected.map(a => ({
    albumName: a.name,
    trackCount: a.trackCount // full album
  }))
}

/**
 * Select random BTS tracks from database for weekly quest (40 songs, 5 streams each)
 */
export async function selectWeeklySongs(date = new Date()): Promise<Array<{ trackName: string; artistName: string; count: number }>> {
  const seed = weeklyKey(date)

  // Fetch BTS tracks from database
  const tracks = await Track.find({ isBTSFamily: true }).lean()

  if (tracks.length === 0) {
    throw new Error('No BTS tracks found in database')
  }

  // Shuffle and pick 40 tracks (or all if less than 40)
  const shuffled = shuffleWithSeed(tracks, seed)
  const selected = shuffled.slice(0, Math.min(40, tracks.length))

  return selected.map(t => ({
    trackName: t.name,
    artistName: t.artist,
    count: 5 // each song needs 5 streams
  }))
}

/**
 * Select random albums from database for weekly quest (10 albums, 1 full stream each)
 */
export async function selectWeeklyAlbums(date = new Date()): Promise<Array<{ albumName: string; trackCount: number }>> {
  const seed = weeklyKey(date) + '_albums'

  // Get unique albums from BTS tracks
  const tracks = await Track.find({ isBTSFamily: true }).lean()
  const albumMap = new Map<string, number>()

  for (const track of tracks) {
    const count = albumMap.get(track.album) || 0
    albumMap.set(track.album, count + 1)
  }

  const albums = Array.from(albumMap.entries()).map(([name, trackCount]) => ({ name, trackCount }))

  if (albums.length === 0) {
    throw new Error('No BTS albums found in database')
  }

  // Shuffle and pick 10 albums (or all if less than 10)
  const shuffled = shuffleWithSeed(albums, seed)
  const selected = shuffled.slice(0, Math.min(10, albums.length))

  return selected.map(a => ({
    albumName: a.name,
    trackCount: a.trackCount // full album
  }))
}

/**
 * Ensure daily streaming quests exist
 */
export async function ensureDailyStreamingQuests(): Promise<void> {
  const songsCode = `stream_daily_songs_${dailyKey()}`
  const albumsCode = `stream_daily_albums_${dailyKey()}`

  // Check if both quests already exist
  const existing = await QuestDefinition.find({ code: { $in: [songsCode, albumsCode] } })
  const existingCodes = new Set(existing.map(q => q.code))

  // Create song streaming quest if it doesn't exist
  if (!existingCodes.has(songsCode)) {
    const songs = await selectDailySongs()

    await QuestDefinition.create({
      code: songsCode,
      title: 'Daily Song Streaming Quest',
      period: 'daily',
      goalType: 'stream:songs',
      goalValue: 25, // 5 songs × 5 streams each
      streamingMeta: {
        trackTargets: songs
      },
      reward: {
        dust: 50,
        xp: 20
      },
      active: true
    })
  }

  // Create album streaming quest if it doesn't exist
  if (!existingCodes.has(albumsCode)) {
    const albums = await selectDailyAlbums()

    await QuestDefinition.create({
      code: albumsCode,
      title: 'Daily Album Streaming Quest',
      period: 'daily',
      goalType: 'stream:albums',
      goalValue: albums.reduce((sum, a) => sum + a.trackCount, 0), // total tracks across 2 albums
      streamingMeta: {
        albumTargets: albums
      },
      reward: {
        dust: 75,
        xp: 30
      },
      active: true
    })
  }
}

/**
 * Ensure weekly streaming quests exist
 */
export async function ensureWeeklyStreamingQuests(): Promise<void> {
  const songsCode = `stream_weekly_songs_${weeklyKey()}`
  const albumsCode = `stream_weekly_albums_${weeklyKey()}`

  // Check if both quests already exist
  const existing = await QuestDefinition.find({ code: { $in: [songsCode, albumsCode] } })
  const existingCodes = new Set(existing.map(q => q.code))

  // Create song streaming quest if it doesn't exist
  if (!existingCodes.has(songsCode)) {
    const songs = await selectWeeklySongs()

    await QuestDefinition.create({
      code: songsCode,
      title: 'Weekly Song Streaming Quest',
      period: 'weekly',
      goalType: 'stream:songs',
      goalValue: 200, // 40 songs × 5 streams each
      streamingMeta: {
        trackTargets: songs
      },
      reward: {
        dust: 300,
        xp: 150
      },
      active: true
    })
  }

  // Create album streaming quest if it doesn't exist
  if (!existingCodes.has(albumsCode)) {
    const albums = await selectWeeklyAlbums()

    await QuestDefinition.create({
      code: albumsCode,
      title: 'Weekly Album Streaming Quest',
      period: 'weekly',
      goalType: 'stream:albums',
      goalValue: albums.reduce((sum, a) => sum + a.trackCount, 0), // total tracks across 10 albums
      streamingMeta: {
        albumTargets: albums
      },
      reward: {
        dust: 400,
        xp: 200,
        ticket: { rarityMin: 'rare' }
      },
      active: true
    })
  }
}
