import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Track } from '@/lib/models/Track'

export const runtime = 'nodejs'

interface StreamingFocusRequest {
  primaryTrackId: string
  totalLength: number
  mode: 'auto' | 'manual'
  auto?: {
    minGap: number
    maxGap: number
    fillMode: 'random' | 'album' | 'era'
    albums?: string[]
    era?: string
  }
  manual?: {
    gapCount: number
    gapSongIds: string[]
  }
}

export async function POST(request: Request) {
  try {
    await connect()
    
    const body: StreamingFocusRequest = await request.json()
    const {
      primaryTrackId,
      totalLength = 20,
      mode = 'auto',
      auto = {} as StreamingFocusRequest['auto'],
      manual = {} as StreamingFocusRequest['manual']
    } = body

    if (!primaryTrackId) {
      return NextResponse.json({ error: 'Primary track is required' }, { status: 400 })
    }

    // Get the primary track
    const primaryTrack = await Track.findOne({ spotifyId: primaryTrackId })
    if (!primaryTrack) {
      return NextResponse.json({ error: 'Primary track not found' }, { status: 404 })
    }

    const randomPick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

    let fillerPool: any[] = []
    let minGap = 2, maxGap = 3
    let manualPool: any[] = []
    let gapCountManual = 1

    if (mode === 'auto') {
      minGap = Math.max(1, Number(auto.minGap) || 2)
      maxGap = Math.max(minGap, Number(auto.maxGap) || 3)
      const fillMode = auto.fillMode || 'random'

      const query: any = { isBTSFamily: true, spotifyId: { $ne: primaryTrackId } }

      if (fillMode === 'album' && Array.isArray(auto.albums) && auto.albums.length) {
        query.album = { $in: auto.albums }
      }

      if (fillMode === 'era' && typeof auto.era === 'string') {
        const [start, end] = auto.era.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          query.releaseDate = { $gte: new Date(`${start}-01-01`), $lte: new Date(`${end}-12-31`) }
        }
      }

      fillerPool = await Track.find(query)
      if (!fillerPool.length) {
        return NextResponse.json({ error: 'No candidate songs for gap found' }, { status: 400 })
      }
    } else if (mode === 'manual') {
      gapCountManual = Math.max(1, Number(manual.gapCount) || 1)
      const ids = Array.isArray(manual.gapSongIds) ? manual.gapSongIds : []
      if (!ids.length) {
        return NextResponse.json({ error: 'gapSongIds required for manual mode' }, { status: 400 })
      }
      manualPool = await Track.find({ spotifyId: { $in: ids } })
      if (!manualPool.length) {
        return NextResponse.json({ error: 'gapSongIds not found' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    const playlist: any[] = []

    // Build playlist until desired length
    while (playlist.length < totalLength) {
      if (mode === 'auto' && !fillerPool.length) {
        // out of candidates, stop to avoid endless primary repeats
        break
      }
      // add primary track
      playlist.push(primaryTrack)
      if (playlist.length >= totalLength) break

      let gapSize = mode === 'auto'
        ? Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap
        : gapCountManual

      for (let i = 0; i < gapSize && playlist.length < totalLength; i++) {
        let pick
        if (mode === 'auto') {
          if (!fillerPool.length) break // shouldn't happen
          pick = randomPick(fillerPool)
          if (fillerPool.length > 1) fillerPool = fillerPool.filter(s => s.spotifyId !== pick.spotifyId)
        } else {
          pick = randomPick(manualPool)
        }
        if (!pick) break
        playlist.push(pick)
      }
    }

    // Format response
    const result = playlist.slice(0, totalLength).map(track => ({
      spotifyId: track.spotifyId,
      name: track.name,
      artist: track.artist,
      album: track.album,
      thumbnails: track.thumbnails,
      duration: track.duration || 0,
      popularity: track.popularity || 0,
      isBTSFamily: track.isBTSFamily,
      releaseDate: track.releaseDate,
      genres: track.genres || [],
      audioFeatures: track.audioFeatures || {
        danceability: 0,
        energy: 0,
        valence: 0,
        tempo: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        speechiness: 0
      },
      previewUrl: track.previewUrl || '',
      isExplicit: track.isExplicit || false,
      createdAt: track.createdAt,
      updatedAt: track.updatedAt
    }))

    console.debug(`✅ Generated streaming-focused playlist with ${result.length} tracks`)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error generating streaming-focused playlist:', error)
    return NextResponse.json(
      { error: 'Failed to generate playlist' },
      { status: 500 }
    )
  }
} 