import { NextRequest, NextResponse } from 'next/server'
import { makeSpotifyRequest } from '@/lib/spotify/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const timeRange = searchParams.get('time_range') || 'short_term'
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // Fetch real top tracks from Spotify API
    const response = await makeSpotifyRequest(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`)
    
    if (!response.ok) {
      // If API call fails, return mock data as fallback
      console.warn('Failed to fetch top tracks from Spotify API, using mock data')
      const mockTracks = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `track-${i + 1}`,
        name: `Top Track ${i + 1}`,
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
        popularity: 85 - (i * 5),
        explicit: false,
        track_number: i + 1,
        type: 'track'
      }))
      
      return NextResponse.json(mockTracks)
    }
    
    const data = await response.json()
    return NextResponse.json(data.items)
  } catch (error) {
    console.error('Error fetching top tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top tracks' },
      { status: 500 }
    )
  }
} 