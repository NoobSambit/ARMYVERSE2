import { getLastFmClient } from '@/lib/lastfm/client'
import { isBTSTrack } from '@/lib/music/bts-detection'
import { StreamingCache } from '@/lib/models/StreamingCache'
import { UserQuestProgress } from '@/lib/models/UserQuestProgress'
import { QuestDefinition, IQuestDefinition } from '@/lib/models/QuestDefinition'
import { dailyKey, weeklyKey } from './quests'

type TrackMatch = {
  trackName: string
  artistName: string
  count: number
}

/**
 * Normalize track name for fuzzy matching
 * - Lowercase
 * - Remove feat., ft., (remix), etc.
 * - Remove special characters
 */
export function normalizeTrackName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '') // remove (feat. X), (remix), etc.
    .replace(/\s*\[.*?\]\s*/g, '')
    .replace(/\s*-\s*feat\..*$/i, '')
    .replace(/\s*ft\..*$/i, '')
    .replace(/[^\w\s]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, ' ') // normalize whitespace
}

/**
 * Match track against quest target
 */
function matchesTarget(track: any, target: { trackName: string; artistName: string }): boolean {
  const trackNorm = normalizeTrackName(track.trackName)
  const targetNorm = normalizeTrackName(target.trackName)

  const artistNorm = track.artistName.toLowerCase().trim()
  const targetArtistNorm = target.artistName.toLowerCase().trim()

  return trackNorm === targetNorm && artistNorm.includes(targetArtistNorm)
}

/**
 * Fetch recent BTS tracks from Last.fm with caching
 */
export async function getRecentBTSTracks(userId: string, lastfmUsername: string, since?: Date): Promise<TrackMatch[]> {
  // Check cache first
  const now = new Date()
  const cache = await StreamingCache.findOne({
    userId,
    expiresAt: { $gt: now }
  }).sort({ cachedAt: -1 })

  if (cache && cache.recentTracks.length > 0) {
    // Use cached data
    const tracks = cache.recentTracks
      .filter((t: any) => !since || t.timestamp >= since)
      .filter((t: any) => isBTSTrack({ name: t.trackName, artist: { name: t.artistName } }))

    return aggregateTracks(tracks)
  }

  // Cache miss: fetch from Last.fm
  const client = getLastFmClient()
  const sinceTs = since ? Math.floor(since.getTime() / 1000) : undefined

  const { tracks } = await client.getRecentTracks(lastfmUsername, {
    limit: 200, // max tracks to check
    from: sinceTs,
    extended: 0
  })

  // Filter BTS tracks only
  const btsTracks = tracks
    .filter(t => !t['@attr']?.nowplaying) // exclude currently playing
    .filter(t => isBTSTrack(t))
    .map(t => ({
      trackName: t.name,
      artistName: typeof t.artist === 'string' ? t.artist : t.artist.name,
      albumName: t.album && typeof t.album === 'object' ? t.album['#text'] : '',
      timestamp: t.date ? new Date(parseInt(t.date.uts) * 1000) : new Date()
    }))

  // Cache for 15 minutes
  await StreamingCache.create({
    userId,
    lastfmUsername,
    recentTracks: btsTracks,
    topTracks: [],
    cachedAt: now,
    expiresAt: new Date(now.getTime() + 15 * 60 * 1000)
  })

  return aggregateTracks(btsTracks)
}

/**
 * Aggregate track plays into counts
 */
function aggregateTracks(tracks: Array<{ trackName: string; artistName: string; [key: string]: any }>): TrackMatch[] {
  const map = new Map<string, TrackMatch>()

  for (const t of tracks) {
    const key = `${normalizeTrackName(t.trackName)}:${t.artistName.toLowerCase()}`
    if (map.has(key)) {
      map.get(key)!.count++
    } else {
      map.set(key, { trackName: t.trackName, artistName: t.artistName, count: 1 })
    }
  }

  return Array.from(map.values())
}

/**
 * Verify streaming quest progress
 * Returns updated progress count
 */
export async function verifyStreamingQuest(
  userId: string,
  lastfmUsername: string,
  questDef: IQuestDefinition,
  periodKey: string
): Promise<number> {
  if (!questDef.streamingMeta) return 0

  // Get or create progress record
  let progress = await UserQuestProgress.findOne({ userId, code: questDef.code, periodKey })

  if (!progress) {
    progress = await UserQuestProgress.create({
      userId,
      code: questDef.code,
      periodKey,
      progress: 0,
      completed: false,
      claimed: false,
      streamingBaseline: {
        tracks: [],
        timestamp: new Date()
      }
    })
  }

  // Determine baseline timestamp
  const baselineTime = progress.streamingBaseline?.timestamp || progress.updatedAt || new Date()

  // Fetch recent BTS tracks since baseline
  const recentTracks = await getRecentBTSTracks(userId, lastfmUsername, baselineTime)

  let totalProgress = 0

  // Case 1: Track-specific targets
  if (questDef.streamingMeta.trackTargets) {
    for (const target of questDef.streamingMeta.trackTargets) {
      const match = recentTracks.find(t => matchesTarget(t, target))
      totalProgress += Math.min(match?.count || 0, target.count)
    }
  }

  // Case 2: Album-based targets (count unique tracks from album)
  if (questDef.streamingMeta.albumTargets) {
    // For album quests, we count total BTS tracks streamed
    // This is simplified - production would need album track lookup
    totalProgress = Math.min(recentTracks.reduce((sum, t) => sum + t.count, 0), questDef.goalValue)
  }

  // Update progress
  progress.progress = totalProgress
  progress.completed = totalProgress >= questDef.goalValue
  progress.updatedAt = new Date()
  await progress.save()

  return totalProgress
}

/**
 * Verify all active streaming quests for a user
 */
export async function verifyAllStreamingQuests(userId: string, lastfmUsername: string): Promise<void> {
  const dKey = dailyKey()
  const wKey = weeklyKey()

  const streamingQuests = await QuestDefinition.find({
    active: true,
    goalType: /^stream:/
  }).lean()

  for (const quest of streamingQuests) {
    const key = quest.period === 'daily' ? dKey : wKey
    await verifyStreamingQuest(userId, lastfmUsername, quest as unknown as IQuestDefinition, key)
  }
}
