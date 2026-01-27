import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { getUserQuests } from '@/lib/game/quests'
import { QuestDefinition } from '@/lib/models/QuestDefinition'
import { Track } from '@/lib/models/Track'
import { Album } from '@/lib/models/Album'

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\s*\[.*?\]\s*/g, '')
    .replace(/\s*-\s*feat\..*$/i, '')
    .replace(/\s*ft\..*$/i, '')
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
}

export const runtime = 'nodejs'

/** GET /api/game/quests */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()
    const quests = await getUserQuests(user.uid)

    // Fetch full quest definitions with streaming metadata
    const questCodes = quests.map(q => q.code)
    const defs = await QuestDefinition.find({ code: { $in: questCodes } }).lean()

    // Preload tracks/albums for enrichment (for thumbnails + spotify links)
    const trackMap = new Map<string, any>()
    let allTracks: Array<any> = []
    const albumMap = new Map<string, any>()
    try {
      const trackTargets: Array<{ trackName: string; artistName: string }> = []
      const albumTargets: string[] = []
      defs.forEach(def => {
        if (def.streamingMeta?.trackTargets) {
          trackTargets.push(...def.streamingMeta.trackTargets.map((t: any) => ({
            trackName: t.trackName,
            artistName: t.artistName
          })))
        }
        if (def.streamingMeta?.albumTargets) {
          albumTargets.push(...def.streamingMeta.albumTargets.map((a: any) => a.albumName))
        }
      })

      if (trackTargets.length) {
        allTracks = await Track.find({ isBTSFamily: true }).select({ name: 1, artist: 1, thumbnails: 1, spotifyId: 1, album: 1 }).lean()
        allTracks.forEach(t => {
          const key = `${normalizeName(t.name)}:${(t.artist || '').toLowerCase()}`
          if (!trackMap.has(key)) trackMap.set(key, t)
        })
      }

      if (albumTargets.length) {
        const allAlbums = await Album.find({ isBTSFamily: true }).select({ name: 1, coverImage: 1, spotifyId: 1 }).lean()
        allAlbums.forEach(a => {
          albumMap.set((a.name || '').toLowerCase(), a)
        })
      }
    } catch (err) {
      console.error('Quest enrichment error (media lookup):', err)
    }

    // Patch invalid daily song targets on the fly (e.g., covers) to avoid cron refresh
    if (defs.length && allTracks.length && trackMap.size) {
      const normalizeTargetKey = (name: string, artist: string) =>
        `${normalizeName(name)}:${(artist || '').toLowerCase()}`
      const hasCoverMarker = (value?: string) =>
        typeof value === 'string' && /cover/i.test(value)

      for (const def of defs) {
        if (def.period !== 'daily' || def.goalType !== 'stream:songs') continue
        if (!def.streamingMeta?.trackTargets?.length) continue

        const existingKeys = new Set(
          def.streamingMeta.trackTargets.map((t: { trackName: string; artistName: string }) =>
            normalizeTargetKey(t.trackName, t.artistName)
          )
        )
        let replaced = false
        const updatedTargets = def.streamingMeta.trackTargets.map((target: { trackName: string; artistName: string; count: number }) => {
          const targetKey = normalizeTargetKey(target.trackName, target.artistName)
          const hasMatch = trackMap.has(targetKey)
          const invalid =
            !hasMatch || hasCoverMarker(target.trackName) || hasCoverMarker(target.artistName)

          if (!invalid) return target

          const candidates = allTracks.filter(track => {
            const key = normalizeTargetKey(track.name, track.artist)
            return !existingKeys.has(key)
          })

          if (!candidates.length) return target

          const replacement = candidates[Math.floor(Math.random() * candidates.length)]
          const replacementKey = normalizeTargetKey(replacement.name, replacement.artist)
          existingKeys.add(replacementKey)
          replaced = true

          return {
            trackName: replacement.name,
            artistName: replacement.artist,
            count: target.count
          }
        })

        if (replaced) {
          def.streamingMeta.trackTargets = updatedTargets as any
          await QuestDefinition.updateOne(
            { code: def.code },
            { $set: { 'streamingMeta.trackTargets': updatedTargets } }
          )
          console.warn('Patched daily quest track targets for', def.code)
        }
      }
    }

    const enriched = quests.map(q => {
      const def = defs.find(d => d.code === q.code)
      const payload: any = {
        ...q,
        streamingMeta: def?.streamingMeta || null,
        reward: {
          ...q.reward,
          xp: def?.reward?.xp || 0,
          badgeId: def?.reward?.badgeId || null
        }
      }

      // Enrich streaming targets with thumbnails and spotify ids
      if (payload.streamingMeta?.trackTargets && trackMap.size) {
        payload.streamingMeta.trackTargets = payload.streamingMeta.trackTargets.map((t: any) => {
          const key = `${normalizeName(t.trackName)}:${(t.artistName || '').toLowerCase()}`
          const match = trackMap.get(key)
          return {
            ...t,
            thumbnail: match?.thumbnails?.medium || match?.thumbnails?.large || null,
            spotifyId: match?.spotifyId || null
          }
        })
      }

      if (payload.streamingMeta?.albumTargets && albumMap.size) {
        payload.streamingMeta.albumTargets = payload.streamingMeta.albumTargets.map((a: any) => {
          const match = albumMap.get((a.albumName || '').toLowerCase())
          return {
            ...a,
            coverImage: match?.coverImage || null,
            spotifyId: match?.spotifyId || null
          }
        })
      }

      return payload
    })

    return NextResponse.json({ quests: enriched })
  } catch (error) {
    console.error('Quests GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
