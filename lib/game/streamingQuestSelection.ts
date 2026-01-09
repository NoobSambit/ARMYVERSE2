import { QuestDefinition } from '@/lib/models/QuestDefinition'
import { Track } from '@/lib/models/Track'
import { Album } from '@/lib/models/Album'
import { dailyKey, weeklyKey } from './quests'

type QuestGenOptions = {
  force?: boolean
  seedSuffix?: string
}

// Filter out low-quality variants from song quests (remixes, slowed, karaoke, etc.)
const TRACK_FILTER_KEYWORDS = [
  'remix', 'remixes', 'acoustic', 'instrumental',
  'sped up', 'slowed', 'nightcore', '8d',
  'karaoke', 'demo'
]

// Album filters: avoid singles/EPs and variant editions that aren't full albums
const ALBUM_FILTER_KEYWORDS = [
  'instrumental', 'demo', 'karaoke', 'remix', 'deluxe single',
  'single version', 'edit', 'sped up', 'slowed', '8d', 'nightcore'
]

const MIN_DAILY_ALBUM_TRACKS = 6
const MIN_WEEKLY_ALBUM_TRACKS = 6

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

function filterEligibleTracks<T extends { name?: string }>(tracks: T[]): T[] {
  return tracks.filter(t => {
    const name = (t.name || '').toLowerCase()
    if (!name) return false
    return !TRACK_FILTER_KEYWORDS.some(keyword => name.includes(keyword))
  })
}

function filterEligibleAlbums(albums: Array<{ name?: string; trackCount?: number; tracks?: any[] }>, minTracks: number) {
  return albums.filter(a => {
    const name = (a.name || '').toLowerCase()
    const tracks = Array.isArray(a.tracks) ? a.tracks : []
    if (!name) return false
    if ((a.trackCount || 0) < minTracks) return false
    if (tracks.length < minTracks) return false
    return !ALBUM_FILTER_KEYWORDS.some(keyword => name.includes(keyword))
  })
}

async function deactivateOldStreamingQuests(period: 'daily' | 'weekly', keepCodes: string[]) {
  await QuestDefinition.updateMany(
    { period, goalType: /^stream:/, code: { $nin: keepCodes }, active: true },
    { $set: { active: false } }
  )
}

/**
 * Select random BTS tracks from database for daily quest (5 songs, 5 streams each)
 */
export async function selectDailySongs(date = new Date(), seedSuffix = ''): Promise<Array<{ trackName: string; artistName: string; count: number }>> {
  const seed = `${dailyKey(date)}${seedSuffix ? `:${seedSuffix}` : ''}`

  // Fetch BTS tracks from database
  const tracks = await Track.find({ isBTSFamily: true }).lean()
  const eligibleTracks = filterEligibleTracks(tracks)

  if (eligibleTracks.length === 0) {
    throw new Error('No BTS tracks found in database')
  }

  if (eligibleTracks.length < 5) {
    throw new Error('Not enough eligible BTS tracks after filtering remixes/variants')
  }

  // Shuffle and pick 5 tracks
  const shuffled = shuffleWithSeed(eligibleTracks, seed)
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
export async function selectDailyAlbums(date = new Date(), seedSuffix = ''): Promise<Array<{ albumName: string; trackCount: number; tracks: Array<{name: string; artist: string}> }>> {
  const seed = `${dailyKey(date)}${seedSuffix ? `:${seedSuffix}` : ''}_albums`

  // Fetch BTS albums from database
  const albums = await Album.find({ isBTSFamily: true }).lean() as Array<{ name?: string; trackCount?: number; tracks?: any[] }>
  const eligible = filterEligibleAlbums(albums, MIN_DAILY_ALBUM_TRACKS)

  if (eligible.length === 0) {
    throw new Error('No eligible BTS albums found in database. Run: npx tsx scripts/fetch-bts-albums.ts')
  }

  if (eligible.length < 2) {
    throw new Error('Not enough eligible BTS albums (min 2) after filtering singles/variants')
  }

  // Shuffle and pick 2 albums
  const shuffled = shuffleWithSeed(eligible, seed)
  const selected = shuffled.slice(0, 2)

  return selected.map(a => {
    const tracks = Array.isArray(a.tracks) ? a.tracks : []
    const trackCount = typeof a.trackCount === 'number' ? a.trackCount : tracks.length
    return {
      albumName: a.name || 'Unknown Album',
      trackCount,
      tracks: tracks.map((t: any) => ({ name: t.name, artist: t.artist }))
    }
  })
}

/**
 * Select random BTS tracks from database for weekly quest (40 songs, 5 streams each)
 */
export async function selectWeeklySongs(date = new Date(), seedSuffix = ''): Promise<Array<{ trackName: string; artistName: string; count: number }>> {
  const seed = `${weeklyKey(date)}${seedSuffix ? `:${seedSuffix}` : ''}`

  // Fetch BTS tracks from database
  const tracks = await Track.find({ isBTSFamily: true }).lean()
  const eligibleTracks = filterEligibleTracks(tracks)

  if (eligibleTracks.length === 0) {
    throw new Error('No BTS tracks found in database')
  }

  // Shuffle and pick 40 tracks (or all if less than 40)
  const shuffled = shuffleWithSeed(eligibleTracks, seed)
  const selected = shuffled.slice(0, Math.min(40, eligibleTracks.length))

  return selected.map(t => ({
    trackName: t.name,
    artistName: t.artist,
    count: 5 // each song needs 5 streams
  }))
}

/**
 * Select random albums from database for weekly quest (10 albums, 1 full stream each)
 */
export async function selectWeeklyAlbums(date = new Date(), seedSuffix = ''): Promise<Array<{ albumName: string; trackCount: number; tracks: Array<{name: string; artist: string}> }>> {
  const seed = `${weeklyKey(date)}${seedSuffix ? `:${seedSuffix}` : ''}_albums`

  // Fetch BTS albums from database
  const albums = await Album.find({ isBTSFamily: true }).lean() as Array<{ name?: string; trackCount?: number; tracks?: any[] }>
  const eligible = filterEligibleAlbums(albums, MIN_WEEKLY_ALBUM_TRACKS)

  if (eligible.length === 0) {
    throw new Error('No eligible BTS albums found in database. Run: npx tsx scripts/fetch-bts-albums.ts')
  }

  if (eligible.length < 10) {
    console.warn(`Only ${eligible.length} eligible BTS albums after filtering; weekly quest will include all.`)
  }

  // Shuffle and pick 10 albums (or all if less than 10)
  const shuffled = shuffleWithSeed(eligible, seed)
  const selected = shuffled.slice(0, Math.min(10, eligible.length))

  return selected.map(a => {
    const tracks = Array.isArray(a.tracks) ? a.tracks : []
    const trackCount = typeof a.trackCount === 'number' ? a.trackCount : tracks.length
    return {
      albumName: a.name || 'Unknown Album',
      trackCount,
      tracks: tracks.map((t: any) => ({ name: t.name, artist: t.artist }))
    }
  })
}

function needsAlbumRefresh(quest: any, expectedCount: number, minTracks: number) {
  if (!quest?.streamingMeta?.albumTargets) return true
  const albums = quest.streamingMeta.albumTargets
  if (!Array.isArray(albums) || albums.length < expectedCount) return true
  return albums.some((a: any) => !a?.albumName || (a.trackCount || 0) < minTracks || !Array.isArray(a.tracks) || a.tracks.length === 0)
}

/**
 * Ensure daily streaming quests exist
 */
export async function ensureDailyStreamingQuests(options: QuestGenOptions = {}): Promise<void> {
  const seedSuffix = options.seedSuffix || (options.force ? `manual-${Date.now()}` : '')
  const codeSuffix = options.force ? `-manual-${seedSuffix || Date.now()}` : ''

  const songsCode = `stream_daily_songs_${dailyKey()}${codeSuffix}`
  const albumsCode = `stream_daily_albums_${dailyKey()}${codeSuffix}`
  const keepCodes = [songsCode, albumsCode]

  // Check if both quests already exist
  const existing = await QuestDefinition.find({ code: { $in: [songsCode, albumsCode] } })
  const existingCodes = new Set(existing.map(q => q.code))
  const existingAlbumQuest = existing.find(q => q.code === albumsCode)

  // Create song streaming quest if it doesn't exist
  if (!existingCodes.has(songsCode)) {
    const songs = await selectDailySongs(new Date(), seedSuffix)

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

  // Create or refresh album streaming quest
  if (!existingCodes.has(albumsCode) || needsAlbumRefresh(existingAlbumQuest, 2, MIN_DAILY_ALBUM_TRACKS)) {
    const albums = await selectDailyAlbums(new Date(), seedSuffix)

    if (existingCodes.has(albumsCode)) {
      await QuestDefinition.updateOne(
        { code: albumsCode },
        {
          $set: {
            streamingMeta: { albumTargets: albums },
            goalValue: albums.reduce((sum, a) => sum + a.trackCount, 0),
            active: true
          }
        }
      )
    } else {
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

  await deactivateOldStreamingQuests('daily', keepCodes)
}

/**
 * Ensure weekly streaming quests exist
 */
export async function ensureWeeklyStreamingQuests(options: QuestGenOptions = {}): Promise<void> {
  const seedSuffix = options.seedSuffix || (options.force ? `manual-${Date.now()}` : '')
  const codeSuffix = options.force ? `-manual-${seedSuffix || Date.now()}` : ''

  const songsCode = `stream_weekly_songs_${weeklyKey()}${codeSuffix}`
  const albumsCode = `stream_weekly_albums_${weeklyKey()}${codeSuffix}`
  const keepCodes = [songsCode, albumsCode]

  // Check if both quests already exist
  const existing = await QuestDefinition.find({ code: { $in: [songsCode, albumsCode] } })
  const existingCodes = new Set(existing.map(q => q.code))
  const existingAlbumQuest = existing.find(q => q.code === albumsCode)

  // Create song streaming quest if it doesn't exist
  if (!existingCodes.has(songsCode)) {
    const songs = await selectWeeklySongs(new Date(), seedSuffix)

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

  // Create or refresh album streaming quest
  if (!existingCodes.has(albumsCode) || needsAlbumRefresh(existingAlbumQuest, 10, MIN_WEEKLY_ALBUM_TRACKS)) {
    const albums = await selectWeeklyAlbums(new Date(), seedSuffix)
    const goalValue = albums.reduce((sum, a) => sum + a.trackCount, 0)

    if (existingCodes.has(albumsCode)) {
      await QuestDefinition.updateOne(
        { code: albumsCode },
        {
          $set: {
            streamingMeta: { albumTargets: albums },
            goalValue,
            active: true
          }
        }
      )
    } else {
      await QuestDefinition.create({
        code: albumsCode,
        title: 'Weekly Album Streaming Quest',
        period: 'weekly',
        goalType: 'stream:albums',
        goalValue, // total tracks across 10 albums
        streamingMeta: {
          albumTargets: albums
        },
        reward: {
          dust: 400,
          xp: 200,
          ticket: { enabled: true }
        },
        active: true
      })
    }
  }

  await deactivateOldStreamingQuests('weekly', keepCodes)
}
