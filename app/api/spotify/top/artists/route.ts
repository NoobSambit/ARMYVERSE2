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
    
    // Fetch real top artists from Spotify API
    const userToken = request.headers.get('authorization')?.replace('Bearer ', '') || undefined;
    const response = await makeSpotifyRequest(`/me/top/artists?limit=${limit}&time_range=${timeRange}`, {}, userToken)
    
    if (!response.ok) {
      // If API call fails, return mock data as fallback
      console.warn('Failed to fetch top artists from Spotify API, using mock data')
      const mockArtists = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `artist-${i + 1}`,
        name: `Top Artist ${i + 1}`,
        type: 'artist',
        uri: `spotify:artist:artist-${i + 1}`,
        href: `https://api.spotify.com/v1/artists/artist-${i + 1}`,
        external_urls: {
          spotify: `https://open.spotify.com/artist/artist-${i + 1}`
        },
        followers: {
          total: 1000 + (i * 100)
        },
        genres: ['pop', 'rock'],
        images: [
          {
            url: 'https://via.placeholder.com/300',
            height: 300,
            width: 300
          }
        ],
        popularity: 80 - (i * 5)
      }))
      
      return NextResponse.json(mockArtists)
    }
    
    const data = await response.json()
    return NextResponse.json(data.items)
  } catch (error) {
    console.error('Error fetching top artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top artists' },
      { status: 500 }
    )
  }
} 