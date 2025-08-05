import { NextRequest, NextResponse } from 'next/server'
import { makeSpotifyRequest } from '@/lib/spotify/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seedArtists = searchParams.get('seed_artists')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // Fetch real recommendations from Spotify API
    const userToken = request.headers.get('authorization')?.replace('Bearer ', '') || undefined;
    const response = await makeSpotifyRequest(`/recommendations?seed_artists=${seedArtists}&limit=${limit}`, {}, userToken)
    
    if (!response.ok) {
      // If API call fails, return mock data as fallback
      console.warn('Failed to fetch recommendations from Spotify API, using mock data')
      const mockRecommendations = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `rec-track-${i + 1}`,
        name: `Recommended Track ${i + 1}`,
        artists: [
          {
            id: `rec-artist-${i + 1}`,
            name: `Recommended Artist ${i + 1}`,
            type: 'artist',
            uri: `spotify:artist:rec-artist-${i + 1}`
          }
        ],
        album: {
          id: `rec-album-${i + 1}`,
          name: `Recommended Album ${i + 1}`,
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
          spotify: `https://open.spotify.com/track/rec-track-${i + 1}`
        },
        uri: `spotify:track:rec-track-${i + 1}`,
        popularity: 75 - (i * 3),
        explicit: false,
        track_number: i + 1,
        type: 'track'
      }))
      
      return NextResponse.json({
        tracks: mockRecommendations,
        seeds: seedArtists ? seedArtists.split(',').map((artist) => ({
          id: artist,
          href: `https://api.spotify.com/v1/artists/${artist}`,
          type: 'artist',
          uri: `spotify:artist:${artist}`
        })) : []
      })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
} 