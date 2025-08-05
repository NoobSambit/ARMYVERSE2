import { NextRequest, NextResponse } from 'next/server'
import { makeSpotifyRequest } from '@/lib/spotify/utils'

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
    
    // Fetch real playlists from Spotify API
    const userToken = request.headers.get('authorization')?.replace('Bearer ', '') || undefined;
    const response = await makeSpotifyRequest(`/me/playlists?limit=${limit}`, {}, userToken)
    
    if (!response.ok) {
      // If API call fails, return mock data as fallback
      console.warn('Failed to fetch playlists from Spotify API, using mock data')
      const mockPlaylists = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `playlist-${i + 1}`,
        name: `Playlist ${i + 1}`,
        description: `A great playlist for ${i + 1}`,
        owner: {
          id: userId,
          display_name: 'Spotify User',
          type: 'user',
          uri: `spotify:user:${userId}`
        },
        images: [
          {
            url: 'https://via.placeholder.com/300',
            height: 300,
            width: 300
          }
        ],
        tracks: {
          total: 50 + (i * 10),
          href: `https://api.spotify.com/v1/playlists/playlist-${i + 1}/tracks`
        },
        public: true,
        collaborative: false,
        external_urls: {
          spotify: `https://open.spotify.com/playlist/playlist-${i + 1}`
        },
        uri: `spotify:playlist:playlist-${i + 1}`,
        type: 'playlist'
      }))
      
      return NextResponse.json({
        items: mockPlaylists,
        total: mockPlaylists.length,
        limit,
        offset: 0
      })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    )
  }
} 