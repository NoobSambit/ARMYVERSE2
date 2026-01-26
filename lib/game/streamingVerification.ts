import { getLastFmClient } from '@/lib/lastfm/client'
import { isBTSTrack } from '@/lib/music/bts-detection'
import { StreamingCache } from '@/lib/models/StreamingCache'
import { UserQuestProgress } from '@/lib/models/UserQuestProgress'
import { IQuestDefinition } from '@/lib/models/QuestDefinition'
import { dailyKey, getActiveQuests, weeklyKey } from './quests'

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
 * Normalize artist name for fuzzy matching
 * - Lowercase
 * - Remove feat./ft./featuring/with tokens and bracketed text
 * - Strip punctuation while keeping unicode letters/numbers
 */
function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s*\[.*?\]\s*/g, ' ')
    .replace(/\s*(feat\.|ft\.|featuring|with)\s+/gi, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Match track against quest target
 */
function matchesTarget(track: any, target: { trackName: string; artistName: string }): boolean {
  if (!track || !track.trackName || !track.artistName) return false
  if (!target || !target.trackName || !target.artistName) return false

  const trackNorm = normalizeTrackName(track.trackName)
  const targetNorm = normalizeTrackName(target.trackName)

  const artistNorm = normalizeArtistName(track.artistName)
  const targetArtistNorm = normalizeArtistName(target.artistName)

  const artistMatches = !!artistNorm && !!targetArtistNorm &&
    (artistNorm.includes(targetArtistNorm) || targetArtistNorm.includes(artistNorm))

  const matches = trackNorm === targetNorm && artistMatches

  // Debug logging
  if (matches) {
    console.log(`✓ Matched: "${track.trackName}" by ${track.artistName}`)
  }

  return matches
}

/**
 * Fetch recent BTS tracks from Last.fm with caching
 */
export async function getRecentBTSTracks(userId: string, lastfmUsername: string, since?: Date): Promise<TrackMatch[]> {
  // Check cache first (but ignore cache, always fetch fresh for now to ensure we get latest data)
  // TODO: Re-enable caching after debugging
  const useCache = false

  const now = new Date()
  const cache = useCache ? await StreamingCache.findOne({
    userId,
    expiresAt: { $gt: now }
  }).sort({ cachedAt: -1 }) : null

  if (cache) {
    // Use cached data (even if empty - that means we checked and found nothing)
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
  const allTracks = tracks.filter(t => !t['@attr']?.nowplaying) // exclude currently playing

  const btsTracks = allTracks
    .filter(t => isBTSTrack(t))
    .map(t => {
      // Extract artist name safely
      let artistName = 'Unknown Artist'
      if (typeof t.artist === 'string') {
        artistName = t.artist
      } else if (t.artist && typeof t.artist === 'object') {
        artistName = t.artist.name || (t.artist as any)['#text'] || 'Unknown Artist'
      }

      return {
        trackName: t.name,
        artistName,
        albumName: t.album && typeof t.album === 'object' ? t.album['#text'] : '',
        timestamp: t.date ? new Date(parseInt(t.date.uts) * 1000) : new Date()
      }
    })

  console.log(`✓ Last.fm: ${tracks.length} tracks → ${btsTracks.length} BTS tracks since ${since?.toISOString() || 'beginning'}`)

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

  // Calculate the quest start time based on period
  // Daily quests: midnight UTC of current day
  // Weekly quests: midnight UTC of current Monday
  const now = new Date()
  let questStartTime: Date

  if (questDef.period === 'daily') {
    questStartTime = new Date(now)
    questStartTime.setUTCHours(0, 0, 0, 0)
  } else {
    // Weekly - get Monday of current week
    questStartTime = new Date(now)
    const day = questStartTime.getUTCDay()
    const diff = questStartTime.getUTCDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    questStartTime.setUTCDate(diff)
    questStartTime.setUTCHours(0, 0, 0, 0)
  }

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
        timestamp: questStartTime
      }
    })
  }

  // Use quest start time as baseline (not when user first viewed it)
  const baselineTime = questStartTime

  // Fetch recent BTS tracks since baseline
  const recentTracks = await getRecentBTSTracks(userId, lastfmUsername, baselineTime)

  let totalProgress = 0
  const trackProgressMap: Record<string, number> = {}

  // Case 1: Track-specific targets
  if (questDef.streamingMeta.trackTargets) {
    for (const target of questDef.streamingMeta.trackTargets) {
      // Replace dots with underscores to make it MongoDB Map compatible
      const trackKey = `track:${normalizeTrackName(target.trackName)}:${target.artistName.toLowerCase()}`.replace(/\./g, '_')
      const match = recentTracks.find(t => matchesTarget(t, target))
      const matchCount = match?.count || 0
      const progressAdded = Math.min(matchCount, target.count)

      trackProgressMap[trackKey] = matchCount
      totalProgress += progressAdded
    }
  }

  // Case 2: Album-based targets (verify ALL tracks from each album were streamed)
  if (questDef.streamingMeta.albumTargets) {
    for (const albumTarget of questDef.streamingMeta.albumTargets) {
      if (!albumTarget.tracks || albumTarget.tracks.length === 0) continue

      let tracksStreamedFromAlbum = 0

      // Check if each track from the album was streamed at least once
      for (const albumTrack of albumTarget.tracks) {
        // Replace dots with underscores to make it MongoDB Map compatible
        const trackKey = `album:${albumTarget.albumName}:${normalizeTrackName(albumTrack.name)}`.replace(/\./g, '_')
        const wasStreamed = recentTracks.some(recentTrack =>
          matchesTarget(recentTrack, {
            trackName: albumTrack.name,
            artistName: albumTrack.artist
          })
        )

        if (wasStreamed) {
          tracksStreamedFromAlbum++
          trackProgressMap[trackKey] = 1
        } else {
          trackProgressMap[trackKey] = 0
        }
      }

      // Only count the album if ALL tracks were streamed
      if (tracksStreamedFromAlbum === albumTarget.tracks.length) {
        totalProgress += albumTarget.trackCount
      } else {
        // Partial credit: count the tracks that were streamed
        totalProgress += tracksStreamedFromAlbum
      }
    }
  }

  // Update progress with individual track progress
  progress.progress = totalProgress
  progress.completed = totalProgress >= questDef.goalValue
  progress.trackProgress = trackProgressMap
  progress.updatedAt = new Date()
  await progress.save()

  console.log(`✓ Quest ${questDef.code}: ${totalProgress}/${questDef.goalValue} progress`)

  return totalProgress
}

/**
 * Verify all active streaming quests for a user
 */
export async function verifyAllStreamingQuests(userId: string, lastfmUsername: string): Promise<void> {
  const dKey = dailyKey()
  const wKey = weeklyKey()

  const streamingQuests = (await getActiveQuests()).filter(q => q.goalType?.startsWith('stream:'))

  for (const quest of streamingQuests) {
    const key = quest.period === 'daily' ? dKey : wKey
    await verifyStreamingQuest(userId, lastfmUsername, quest as unknown as IQuestDefinition, key)
  }
}
