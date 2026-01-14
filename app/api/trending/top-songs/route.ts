import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import KworbSnapshot from '@/lib/models/KworbSnapshot'
import YouTubeKworbSnapshot from '@/lib/models/YouTubeKworbSnapshot'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Platform = 'spotify' | 'youtube'
type Category = 'ot7' | 'solo'

// Normalize member names for database lookup (platform-aware)
function normalizeMemberName(member: string, platform: Platform = 'spotify'): string {
  const spotifyMap: Record<string, string> = {
    'bts': 'BTS',
    'jungkook': 'Jungkook',
    'jung kook': 'Jungkook',
    'v': 'V',
    'jimin': 'Jimin',
    'jin': 'Jin',
    'suga': 'Suga',
    'rm': 'RM',
    'j-hope': 'J-Hope',
    'jhope': 'J-Hope',
    'agust d': 'Agust D',
  }
  const youtubeMap: Record<string, string> = {
    'bts': 'BTS',
    'jungkook': 'Jungkook',
    'jung kook': 'Jungkook',
    'v': 'V',
    'jimin': 'Jimin',
    'jin': 'Jin',
    'suga': 'Suga',
    'rm': 'RM',
    'j-hope': 'J-Hope',
    'jhope': 'J-Hope',
    'agust d': 'Suga',
  }
  const map = platform === 'youtube' ? youtubeMap : spotifyMap
  const normalized = member.trim().toLowerCase()
  return map[normalized] || member
}

function getSpotifyThumbnail(url?: string): string | undefined {
  if (!url) return undefined
  const match = url.match(/track\/([a-zA-Z0-9]+)/)
  return match ? `https://i.scdn.co/image/${match[1]}` : undefined
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = (searchParams.get('platform') || 'spotify') as Platform
    const category = (searchParams.get('category') || 'ot7') as Category
    const member = searchParams.get('member') || ''

    await connect()

    let songs: any[] = []

    let lastRefreshedAt: Date | null = null

    if (platform === 'spotify') {
      const doc = await KworbSnapshot.findOne().sort({ dateKey: -1 }).select({ songsByArtist: 1, createdAt: 1 }).lean() as any
      if (!doc?.songsByArtist) {
        return NextResponse.json({ ok: false, error: 'No Spotify data available' }, { status: 404 })
      }

      lastRefreshedAt = doc.createdAt

      const targetArtist = category === 'solo' && member ? normalizeMemberName(member, platform) : 'BTS'
      const artistGroup = doc.songsByArtist.find((g: any) => g.artist === targetArtist)

      if (!artistGroup) {
        return NextResponse.json({ ok: false, error: `Artist '${targetArtist}' not found` }, { status: 404 })
      }

      songs = [...artistGroup.songs]
        .sort((a: any, b: any) => (b.dailyGain || 0) - (a.dailyGain || 0))
        .slice(0, 6)
        .map((song: any, idx: number) => ({
          rank: idx + 1,
          title: song.name,
          artist: targetArtist,
          thumbnail: song.albumArt || getSpotifyThumbnail(song.url),
          url: song.url,
          dailyStreams: song.dailyGain,
          totalStreams: song.totalStreams
        }))

    } else {
      const doc = await YouTubeKworbSnapshot.findOne().sort({ dateKey: -1 }).select({ artistGroups: 1, lastRefreshedAt: 1 }).lean() as any
      if (!doc?.artistGroups) {
        return NextResponse.json({ ok: false, error: 'No YouTube data available' }, { status: 404 })
      }

      lastRefreshedAt = doc.lastRefreshedAt

      const targetArtist = category === 'solo' && member ? normalizeMemberName(member, platform) : 'BTS'
      const artistGroup = doc.artistGroups.find((g: any) => g.artist === targetArtist)

      if (!artistGroup) {
        return NextResponse.json({ ok: false, error: `Artist '${targetArtist}' not found` }, { status: 404 })
      }

      songs = (artistGroup.songs || []).slice(0, 6).map((song: any) => ({
        rank: song.rank,
        title: song.title,
        artist: targetArtist,
        thumbnail: song.thumbnail,
        url: song.url,
        yesterday: song.yesterday,
        views: song.views
      }))
    }

    return NextResponse.json({
      ok: true,
      platform,
      category,
      artist: category === 'ot7' ? 'BTS' : member,
      lastRefreshedAt,
      songs
    }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (err: any) {
    console.error('Top songs error:', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
