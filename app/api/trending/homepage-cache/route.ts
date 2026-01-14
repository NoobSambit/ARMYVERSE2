import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import KworbSnapshot from '@/lib/models/KworbSnapshot'
import YouTubeKworbSnapshot from '@/lib/models/YouTubeKworbSnapshot'
import HomepageTrendingCache from '@/lib/models/HomepageTrendingCache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Normalize member names
function normalizeMemberName(member: string, platform: 'spotify' | 'youtube'): string {
  const spotifyMap: Record<string, string> = {
    'bts': 'BTS', 'jungkook': 'Jung Kook', 'jung kook': 'Jung Kook',
    'v': 'V', 'jimin': 'Jimin', 'jin': 'Jin', 'suga': 'Suga',
    'rm': 'RM', 'j-hope': 'J-Hope', 'jhope': 'J-Hope', 'agust d': 'Agust D',
  }
  const youtubeMap: Record<string, string> = {
    'bts': 'BTS', 'jungkook': 'Jungkook', 'jung kook': 'Jungkook',
    'v': 'V', 'jimin': 'Jimin', 'jin': 'Jin', 'suga': 'Suga',
    'rm': 'RM', 'j-hope': 'J-Hope', 'jhope': 'J-Hope', 'agust d': 'Suga',
  }
  const map = platform === 'youtube' ? youtubeMap : spotifyMap
  return map[member.trim().toLowerCase()] || member
}

function getSpotifyThumbnail(url?: string): string | undefined {
  if (!url) return undefined
  const match = url.match(/track\/([a-zA-Z0-9]+)/)
  return match ? `https://i.scdn.co/image/${match[1]}` : undefined
}

// Build the homepage cache from latest kworb snapshots
export async function POST() {
  try {
    await connect()

    console.log('Building homepage trending cache...')

    // Fetch latest snapshots
    const [spotifyDoc, youtubeDoc] = await Promise.all([
      KworbSnapshot.findOne().sort({ dateKey: -1 }).lean() as any,
      YouTubeKworbSnapshot.findOne().sort({ dateKey: -1 }).lean() as any
    ])

    if (!spotifyDoc || !youtubeDoc) {
      return NextResponse.json({ ok: false, error: 'Source data not available' }, { status: 404 })
    }

    // Build Spotify data
    const spotifyData: any = { ot7: [], solo: {} as any }

    // OT7 - top 6 BTS songs by daily gain
    const btsGroup = spotifyDoc.songsByArtist?.find((g: any) => g.artist === 'BTS')
    if (btsGroup?.songs) {
      spotifyData.ot7 = [...btsGroup.songs]
        .sort((a: any, b: any) => (b.dailyGain || 0) - (a.dailyGain || 0))
        .slice(0, 6)
        .map((song: any, idx: number) => ({
          rank: idx + 1,
          title: song.name,
          artist: 'BTS',
          thumbnail: song.albumArt || getSpotifyThumbnail(song.url),
          url: song.url,
          dailyStreams: song.dailyGain,
          totalStreams: song.totalStreams
        }))
    }

    // Solo members
    const soloMembers = ['RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jung Kook']
    for (const member of soloMembers) {
      const group = spotifyDoc.songsByArtist?.find((g: any) => g.artist === member)
      if (group?.songs) {
        spotifyData.solo[member] = [...group.songs]
          .sort((a: any, b: any) => (b.dailyGain || 0) - (a.dailyGain || 0))
          .slice(0, 6)
          .map((song: any, idx: number) => ({
            rank: idx + 1,
            title: song.name,
            artist: member,
            thumbnail: song.albumArt || getSpotifyThumbnail(song.url),
            url: song.url,
            dailyStreams: song.dailyGain,
            totalStreams: song.totalStreams
          }))
      }
    }

    // Build YouTube data
    const youtubeData: any = { ot7: [], solo: {} as any }

    // OT7
    const btsYtGroup = youtubeDoc.artistGroups?.find((g: any) => g.artist === 'BTS')
    if (btsYtGroup?.songs) {
      youtubeData.ot7 = btsYtGroup.songs.slice(0, 6).map((song: any) => ({
        rank: song.rank,
        title: song.title,
        artist: 'BTS',
        thumbnail: song.thumbnail,
        url: song.url,
        yesterday: song.yesterday,
        views: song.views
      }))
    }

    // Solo members
    for (const member of soloMembers) {
      const ytMember = member === 'Jung Kook' ? 'Jungkook' : member
      const group = youtubeDoc.artistGroups?.find((g: any) => g.artist === ytMember)
      if (group?.songs) {
        // Store under the normalized name (ytMember) to match API lookups
        youtubeData.solo[ytMember] = group.songs.slice(0, 6).map((song: any) => ({
          rank: song.rank,
          title: song.title,
          artist: member,
          thumbnail: song.thumbnail,
          url: song.url,
          yesterday: song.yesterday,
          views: song.views
        }))
      }
    }

    // Get current version and increment
    const currentCache = await HomepageTrendingCache.findOne().sort({ lastUpdated: -1 })
    const version = (currentCache?.version || 0) + 1

    // Create new cache entry
    await HomepageTrendingCache.create({
      spotify: spotifyData,
      youtube: youtubeData,
      lastUpdated: new Date(),
      version
    })

    // Clean up old cache entries (keep only latest 2)
    await HomepageTrendingCache.deleteMany({
      _id: { $ne: currentCache?._id || null }
    }).sort({ lastUpdated: -1 }).skip(2)

    console.log(`Homepage cache built successfully (version ${version})`)

    return NextResponse.json({
      ok: true,
      version,
      spotify: { ot7: spotifyData.ot7.length, solo: Object.keys(spotifyData.solo).length },
      youtube: { ot7: youtubeData.ot7.length, solo: Object.keys(youtubeData.solo).length }
    })

  } catch (err: any) {
    console.error('Homepage cache build error:', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
