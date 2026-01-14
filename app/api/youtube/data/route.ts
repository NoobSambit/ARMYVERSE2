import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import YouTubeKworbSnapshot from '@/lib/models/YouTubeKworbSnapshot'
import { fetchVideoDetail } from '@/lib/youtube/kworb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/youtube/data?artist=&videoId=
 *
 * Fetches YouTube analytics data for artists or specific video details
 */
export async function GET(request: NextRequest) {
  try {
    await connect()

    const { searchParams } = new URL(request.url)
    const artist = searchParams.get('artist')
    const videoId = searchParams.get('videoId')
    const refreshDetail = searchParams.get('refreshDetail') === '1'

    // Get today's date key
    const d = new Date()
    const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`

    // If videoId is provided, fetch detailed video stats
    if (videoId) {
      // Check if we have cached detail data that's still fresh (24 hours)
      const snapshot = await YouTubeKworbSnapshot.findOne({ dateKey })
      let cachedDetail: any = null

      if (snapshot && snapshot.artistGroups) {
        for (const group of snapshot.artistGroups) {
          if (group && group.songs) {
            const song = group.songs.find((s: any) => s.videoId === videoId)
            if (song?.detail) {
              const lastFetched = song.detailLastFetched ? new Date(song.detailLastFetched) : new Date(0)
              const hoursSinceFetch = (Date.now() - lastFetched.getTime()) / (1000 * 60 * 60)
              if (hoursSinceFetch < 24 && !refreshDetail) {
                cachedDetail = { ...song.detail, title: song.title, artist: song.artist, published: song.published }
                break
              }
            }
          }
        }
      }

      if (cachedDetail) {
        return NextResponse.json({ videoId, ...cachedDetail, cached: true })
      }

      // Fetch fresh data from kworb
      const detail = await fetchVideoDetail(videoId, artist || '')

      // Update the cached data
      if (snapshot && detail && snapshot.artistGroups) {
        for (let groupIndex = 0; groupIndex < snapshot.artistGroups.length; groupIndex++) {
          const group = snapshot.artistGroups[groupIndex]
          if (group && group.songs) {
            const songIndex = group.songs.findIndex((s: any) => s.videoId === videoId)
            if (songIndex >= 0) {
              snapshot.artistGroups[groupIndex].songs[songIndex].detail = detail
              snapshot.artistGroups[groupIndex].songs[songIndex].detailLastFetched = new Date()
              await snapshot.save()
              break
            }
          }
        }
      }

      return NextResponse.json(detail)
    }

    // Get all artist groups data
    const snapshot = await YouTubeKworbSnapshot.findOne({ dateKey })

    if (!snapshot || !snapshot.artistGroups) {
      // No data yet, trigger a fetch
      return NextResponse.json(
        { error: 'No data available. Please run the refresh cron job.' },
        { status: 404 }
      )
    }

    // Filter by artist if specified
    let artistGroups = snapshot.artistGroups
    if (artist) {
      const group = artistGroups.find((g: any) => g.artist === artist)
      if (!group) {
        return NextResponse.json(
          { error: `Artist ${artist} not found` },
          { status: 404 }
        )
      }
      artistGroups = [group]
    }

    return NextResponse.json({
      dateKey: snapshot.dateKey,
      lastRefreshedAt: snapshot.lastRefreshedAt,
      artistGroups
    })
  } catch (error) {
    console.error('YouTube data GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
