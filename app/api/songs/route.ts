import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Track } from '@/lib/models/Track'

export const runtime = 'nodejs'

export async function GET() {
  try {
    await connect()
    
    // Fetch all BTS family tracks with thumbnails, sorted randomly
    const tracks = await Track.find({ 
      isBTSFamily: true 
    })
    .select('spotifyId name artist album thumbnails')
    .limit(1000) // Limit to prevent overwhelming the frontend
    
    // Shuffle the results for random order
    const shuffledTracks = tracks.sort(() => Math.random() - 0.5)
    
    // Transform to match SongDoc interface
    const songs = shuffledTracks.map(track => ({
      spotifyId: track.spotifyId,
      name: track.name,
      artist: track.artist,
      album: track.album,
      thumbnails: track.thumbnails
    }))
    
    console.debug(`✅ Fetched ${songs.length} BTS songs from database`)
    
    return NextResponse.json(songs)
    
  } catch (error) {
    console.error('❌ Error fetching songs:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch songs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 