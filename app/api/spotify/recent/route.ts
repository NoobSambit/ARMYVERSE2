import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // Mock recent tracks for testing
    const mockTracks = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      track: {
        id: `track-${i + 1}`,
        name: `Recent Track ${i + 1}`,
        artists: [
          {
            id: `artist-${i + 1}`,
            name: `Artist ${i + 1}`,
            type: 'artist',
            uri: `spotify:artist:artist-${i + 1}`
          }
        ],
        album: {
          id: `album-${i + 1}`,
          name: `Album ${i + 1}`,
          images: [
            {
              url: 'https://via.placeholder.com/300',
              height: 300,
              width: 300
            }
          ]
        },
        duration_ms: 180000 + (i * 1000),
        external_urls: {
          spotify: `https://open.spotify.com/track/track-${i + 1}`
        },
        uri: `spotify:track:track-${i + 1}`,
        played_at: new Date(Date.now() - i * 60000).toISOString()
      }
    }))
    
    return NextResponse.json({
      items: mockTracks,
      total: mockTracks.length,
      limit,
      offset: 0
    })
  } catch (error) {
    console.error('Error fetching recent tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent tracks' },
      { status: 500 }
    )
  }
} 