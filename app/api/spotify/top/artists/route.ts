import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('time_range') || 'short_term'
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // Mock top artists for testing
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
  } catch (error) {
    console.error('Error fetching top artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top artists' },
      { status: 500 }
    )
  }
} 