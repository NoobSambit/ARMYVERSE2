import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Track } from '@/lib/models/Track'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Test MongoDB connection
    const connection = await connect()
    
    // Check if connection is established
    const isConnected = connection.readyState === 1
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'error',
        message: 'MongoDB not connected',
        readyState: connection.readyState,
        details: 'Connection state is not ready (1)'
      }, { status: 500 })
    }
    
    // Count total tracks
    const totalTracks = await Track.countDocuments()
    
    // Count BTS family tracks
    const btsTracks = await Track.countDocuments({ isBTSFamily: true })
    
    // Get a sample track to verify data structure
    const sampleTrack = await Track.findOne({ isBTSFamily: true })
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection healthy',
      database: {
        totalTracks,
        btsTracks,
        sampleTrack: sampleTrack ? {
          spotifyId: sampleTrack.spotifyId,
          name: sampleTrack.name,
          artist: sampleTrack.artist,
          album: sampleTrack.album,
          hasThumbnails: !!sampleTrack.thumbnails
        } : null
      },
      connection: {
        readyState: connection.readyState,
        host: connection.host,
        port: connection.port,
        name: connection.name
      }
    })
    
  } catch (error) {
    console.error('❌ Health check error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}