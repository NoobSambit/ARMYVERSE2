import { NextRequest, NextResponse } from 'next/server'
import { makeSpotifyRequest } from '@/lib/spotify/utils'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    // Fetch real user profile from Spotify API
    const response = await makeSpotifyRequest(`/users/${userId}`)
    
    if (!response.ok) {
      // If user not found, return a default profile
      const defaultProfile = {
        id: userId,
        display_name: 'Spotify User',
        email: 'user@example.com',
        images: [
          {
            url: 'https://via.placeholder.com/150',
            height: 150,
            width: 150
          }
        ],
        followers: {
          total: 0
        },
        external_urls: {
          spotify: `https://open.spotify.com/user/${userId}`
        },
        href: `https://api.spotify.com/v1/users/${userId}`,
        type: 'user',
        uri: `spotify:user:${userId}`,
        created_at: new Date().toISOString()
      }
      
      return NextResponse.json(defaultProfile)
    }
    
    const userProfile = await response.json()
    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
} 