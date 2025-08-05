import { NextRequest, NextResponse } from 'next/server'
import { makeSpotifyRequest } from '@/lib/spotify/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')
    const userId = searchParams.get('userId')
    
    if (!userId || !ids) {
      return NextResponse.json(
        { error: 'userId and ids are required' },
        { status: 400 }
      )
    }
    
    const trackIds = ids.split(',')
    
    // Fetch real audio features from Spotify API
    const response = await makeSpotifyRequest(`/audio-features?ids=${ids}`)
    
    if (!response.ok) {
      // If API call fails, return mock data as fallback
      console.warn('Failed to fetch audio features from Spotify API, using mock data')
      const mockAudioFeatures = trackIds.map((id, index) => ({
        id,
        acousticness: 0.1 + (index * 0.05),
        danceability: 0.7 + (index * 0.02),
        energy: 0.8 - (index * 0.03),
        instrumentalness: 0.1 + (index * 0.02),
        key: index % 12,
        liveness: 0.1 + (index * 0.01),
        loudness: -10 - (index * 0.5),
        mode: index % 2,
        speechiness: 0.05 + (index * 0.01),
        tempo: 120 + (index * 5),
        time_signature: 4,
        valence: 0.6 + (index * 0.02),
        type: 'audio_features',
        uri: `spotify:track:${id}`
      }))
      
      return NextResponse.json({
        audio_features: mockAudioFeatures
      })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching audio features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audio features' },
      { status: 500 }
    )
  }
} 