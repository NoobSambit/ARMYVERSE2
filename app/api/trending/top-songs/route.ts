import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import KworbSnapshot from '@/lib/models/KworbSnapshot'
import YouTubeKworbSnapshot from '@/lib/models/YouTubeKworbSnapshot'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Platform = 'spotify' | 'youtube'
type Category = 'ot7' | 'solo'

export async function GET(request: Request) {
  try {
    await connect()
    
    const { searchParams } = new URL(request.url)
    const platform = (searchParams.get('platform') || 'spotify') as Platform
    const category = (searchParams.get('category') || 'ot7') as Category
    const member = searchParams.get('member') || '' // For solo category
    
    if (platform === 'spotify') {
      const doc = await KworbSnapshot.findOne().sort({ dateKey: -1 }).lean() as any
      if (!doc || !doc.songsByArtist) {
        return NextResponse.json({ ok: false, error: 'No Spotify data' }, { status: 404 })
      }
      
      let targetArtist = 'BTS'
      if (category === 'solo' && member) {
        targetArtist = member
      }
      
      const artistGroup = doc.songsByArtist.find((g: any) => g.artist === targetArtist)
      if (!artistGroup) {
        return NextResponse.json({ ok: false, error: 'Artist not found' }, { status: 404 })
      }
      
      // Sort songs by dailyGain and take top 6
      const songs = [...(artistGroup.songs || [])]
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
      
      return NextResponse.json({ 
        ok: true, 
        platform: 'spotify',
        category,
        artist: targetArtist,
        songs 
      }, {
        headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' }
      })
      
    } else if (platform === 'youtube') {
      const doc = await YouTubeKworbSnapshot.findOne().sort({ dateKey: -1 }).lean() as any
      if (!doc || !doc.artistGroups) {
        return NextResponse.json({ ok: false, error: 'No YouTube data' }, { status: 404 })
      }
      
      let targetArtist = 'BTS'
      if (category === 'solo' && member) {
        targetArtist = member
      }
      
      const artistGroup = doc.artistGroups.find((g: any) => g.artist === targetArtist)
      if (!artistGroup) {
        return NextResponse.json({ ok: false, error: 'Artist not found' }, { status: 404 })
      }
      
      const songs = (artistGroup.songs || [])
        .slice(0, 6)
        .map((song: any) => ({
          rank: song.rank,
          title: song.title,
          artist: targetArtist,
          thumbnail: song.thumbnail,
          url: song.url,
          yesterday: song.yesterday,
          views: song.views
        }))
      
      return NextResponse.json({ 
        ok: true, 
        platform: 'youtube',
        category,
        artist: targetArtist,
        songs 
      }, {
        headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' }
      })
    }
    
    return NextResponse.json({ ok: false, error: 'Invalid platform' }, { status: 400 })
    
  } catch (err: any) {
    console.error('Top songs error:', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}

// Helper to extract Spotify thumbnail from track URL
function getSpotifyThumbnail(url?: string): string | undefined {
  if (!url) return undefined
  // Extract track ID from URL like: https://kworb.net/spotify/track/xxxx.html
  const match = url.match(/track\/([a-zA-Z0-9]+)/)
  if (!match) return undefined
  // Use Spotify embed image (placeholder - would need actual Spotify API for real thumbnails)
  return `https://i.scdn.co/image/${match[1]}`
}
