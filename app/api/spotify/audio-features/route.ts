import { NextRequest, NextResponse } from 'next/server'

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
    
    // Mock audio features for testing
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
  } catch (error) {
    console.error('Error fetching audio features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audio features' },
      { status: 500 }
    )
  }
} 